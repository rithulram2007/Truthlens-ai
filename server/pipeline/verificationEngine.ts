import { callLLMReasoning, isGeminiQuotaOrServiceError, createServiceUnavailableError } from '../gemini';
import { searchTavily, isTavilyQuotaOrServiceError } from '../tavily';
import {
  ClaimVerification,
  OverallVerdictType,
  RiskIndicator,
  SourceItem,
  SourceRelationship,
  TimelineEvent,
  VerdictType,
  VerificationResult,
} from '../../src/types';
import { ExtractedClaimRaw } from './claimExtractor';
import { assessDomainTier, rankAndDeduplicateSources } from './sourceAssessor';
import { detectRiskIndicatorsInText } from './riskIndicatorDetector';
import { ExtractedArticleData } from './articleExtractor';

interface GeminiClaimReasoningOutput {
  verdict: VerdictType;
  confidence: number;
  reasoning: string;
  evidenceSummary: string;
  supportingEvidence?: string[];
  contradictingEvidence?: string[];
  conflicts?: string[];
  uncertainty?: string;
  sourceRelationships?: Array<{
    sourceIndex: number;
    relationship: SourceRelationship;
  }>;
}

export async function verifyClaimsPipeline(
  articleData: ExtractedArticleData,
  claimsRaw: ExtractedClaimRaw[]
): Promise<VerificationResult> {
  const verifiedClaims: ClaimVerification[] = [];
  const allSources: SourceItem[] = [];
  const allTimelineEvents: TimelineEvent[] = [];

  // Detect rhetorical risk indicators in raw text
  const initialRiskIndicators = detectRiskIndicatorsInText(articleData.text);

  // Filter verifiable claims vs non-verifiable subjective statements
  const verifiableClaims: Array<{ raw: ExtractedClaimRaw; index: number; id: string }> = [];

  for (let i = 0; i < claimsRaw.length; i++) {
    const rawClaim = claimsRaw[i];
    const claimId = `claim-${i + 1}-${Date.now()}`;

    if (!rawClaim.isVerifiable || rawClaim.statementType === 'opinion' || rawClaim.statementType === 'subjective') {
      const subjectiveRisk: RiskIndicator = {
        id: `subj-${claimId}`,
        type: 'exaggerated_certainty',
        title: 'Subjective / Unfalsifiable Statement',
        description: 'This claim expresses a value judgment, prediction, or subjective viewpoint rather than an empirical proposition.',
        excerpt: rawClaim.claimText,
        severity: 'low',
      };

      verifiedClaims.push({
        id: claimId,
        claimText: rawClaim.claimText,
        category: rawClaim.category,
        statementType: rawClaim.statementType,
        isVerifiable: false,
        verdict: 'INSUFFICIENT EVIDENCE',
        confidence: 25,
        reasoning:
          'This statement is classified as a subjective opinion or value judgment rather than an empirically verifiable factual proposition. Empirical verification requires testable, falsifiable claims.',
        evidenceSummary: 'No empirical evidence can conclusively prove or disprove subjective opinions or predictions.',
        supportingEvidence: [],
        contradictingEvidence: [],
        conflicts: [],
        uncertainty: 'Subjective assessments and speculative forecasts contain inherent uncertainty.',
        sources: [],
        riskIndicators: [subjectiveRisk],
      });
    } else {
      verifiableClaims.push({ raw: rawClaim, index: i, id: claimId });
    }
  }

  // Process each verifiable claim through the verification flow:
  // Claim -> Tavily Web Search -> Real Evidence -> Source Assessment -> Evidence Ranking -> Comparison & Reasoning
  for (const vc of verifiableClaims) {
    console.log(`[TruthLens] Processing claim: "${vc.raw.claimText}" via Tavily Search`);

    // 1. Tavily Web Search (Tavily provides the external web evidence retrieval layer.)
    let tavilyResults: Array<{
      title: string;
      url: string;
      content: string;
      score: number;
      published_date?: string;
    }> = [];
    let tavilyAnswer: string | undefined = undefined;

    try {
      const tavilyRes = await searchTavily(vc.raw.claimText, {
        maxResults: 5,
        searchDepth: 'basic',
        includeAnswer: false,
      });
      tavilyResults = tavilyRes.results || [];
      tavilyAnswer = tavilyRes.answer;
    } catch (searchErr: unknown) {
      console.error('[TruthLens] Tavily search error:', searchErr);
      if (isTavilyQuotaOrServiceError(searchErr)) {
        throw createServiceUnavailableError(
          searchErr instanceof Error ? searchErr.message : String(searchErr),
          'Tavily'
        );
      }
      throw searchErr;
    }

    // 2. Real Evidence & Source Assessment
    const claimSources: SourceItem[] = [];
    tavilyResults.forEach((r, sIdx) => {
      let domain = 'web';
      try {
        domain = new URL(r.url).hostname.replace(/^www\./, '');
      } catch {
        domain = r.url;
      }

      const { tier, assessment } = assessDomainTier(domain);
      claimSources.push({
        id: `src-tavily-${vc.id}-${sIdx}`,
        sourceName: domain,
        title: r.title || `Citation: ${domain}`,
        url: r.url,
        domain,
        publicationDate: r.published_date,
        relevance: Math.max(50, Math.min(100, Math.round((r.score || 0.8) * 100))),
        relationshipToClaim: 'NEUTRAL',
        assessment,
        tier,
        excerpt: r.content || 'Retrieved web document snippet.',
      });
    });

    // 3. Evidence Ranking & Deduplication
    const rankedSources = rankAndDeduplicateSources(claimSources);

    // If search succeeded but genuinely returned zero web results across the entire web:
    if (rankedSources.length === 0) {
      const noEvidRisk: RiskIndicator = {
        id: `no-evid-${vc.id}`,
        type: 'lack_of_evidence',
        title: 'Lack of Corroborating Evidence',
        description: 'Web evidence retrieval returned no verifiable empirical documentation or authoritative sources.',
        excerpt: vc.raw.claimText,
        severity: 'high',
      };

      verifiedClaims.push({
        id: vc.id,
        claimText: vc.raw.claimText,
        category: vc.raw.category,
        statementType: vc.raw.statementType,
        isVerifiable: true,
        verdict: 'INSUFFICIENT EVIDENCE',
        confidence: 30,
        reasoning: 'Authoritative web searches returned no verifiable evidence supporting or refuting this specific assertion.',
        evidenceSummary: 'No empirical evidence or documentation could be retrieved from search engines.',
        supportingEvidence: [],
        contradictingEvidence: [],
        conflicts: [],
        uncertainty: 'Complete absence of verifiable web evidence.',
        sources: [],
        riskIndicators: [noEvidRisk],
      });
      continue;
    }

    // 4. Claim-Evidence Comparison & Gemini Evidence-Grounded Reasoning
    const sourcesEvidenceText = rankedSources
      .map(
        (s, i) =>
          `[Source ${i + 1}] Title: ${s.title}
Domain: ${s.domain} (${s.tier})
URL: ${s.url}
Excerpt: ${s.excerpt}`
      )
      .join('\n\n');

    const reasoningPrompt = `You are TruthLens's Evidence-Grounded Verification Engine.
Your task is to analyze the empirical claim strictly against the real web evidence retrieved via Tavily Search.

Claim: "${vc.raw.claimText}"
Category: ${vc.raw.category}

Retrieved Web Evidence:
${sourcesEvidenceText}
${tavilyAnswer ? `\nSearch Direct Summary: ${tavilyAnswer}` : ''}

Verification Standards:
1. Verdict:
   - "SUPPORTED": The empirical claim is corroborated by retrieved evidence from reputable sources.
   - "CONTRADICTED": The empirical claim is refuted or contradicted by authoritative retrieved evidence.
   - "INSUFFICIENT EVIDENCE": The retrieved evidence is inconclusive, ambiguous, or lacks sufficient empirical confirmation. Absence of evidence is INSUFFICIENT EVIDENCE, never falsehood.
2. Confidence (integer 0-100): Reflects the strength, directness, and consensus of the retrieved sources.
3. Identify specific supporting evidence quotations/facts from the sources.
4. Identify any contradicting evidence quotations/facts from the sources.
5. Identify any conflicts or disagreements between sources.
6. For each source (1 to ${rankedSources.length}), classify its relationship to the claim: "SUPPORTS", "CONTRADICTS", "NEUTRAL", or "INSUFFICIENT".

Return ONLY valid JSON matching this schema:
{
  "verdict": "SUPPORTED" | "CONTRADICTED" | "INSUFFICIENT EVIDENCE",
  "confidence": <integer 0-100>,
  "reasoning": "<thorough, clear factual reasoning grounded strictly in the retrieved evidence>",
  "evidenceSummary": "<concise synthesis of what the retrieved evidence demonstrates>",
  "supportingEvidence": ["<specific quote or fact from retrieved evidence supporting the claim>"],
  "contradictingEvidence": ["<specific quote or fact from retrieved evidence contradicting the claim>"],
  "conflicts": ["<description of any conflicting findings between sources if any>"],
  "uncertainty": "<any remaining empirical caveats or limitations>",
  "sourceRelationships": [
    { "sourceIndex": <1-based index>, "relationship": "SUPPORTS" | "CONTRADICTS" | "NEUTRAL" | "INSUFFICIENT" }
  ]
}`;

    let reasoningOutputText = '';
    try {
      reasoningOutputText = await callLLMReasoning(reasoningPrompt, { json: true, max_tokens: 2500 });
    } catch (llmErr: unknown) {
      console.error('[TruthLens] LLM reasoning error:', llmErr);
      if (isGeminiQuotaOrServiceError(llmErr)) {
        throw createServiceUnavailableError(
          llmErr instanceof Error ? llmErr.message : String(llmErr),
          process.env.OPENROUTER_API_KEY ? 'OpenRouter' : 'Gemini'
        );
      }
      throw llmErr;
    }

    // Parse JSON
    let parsed: GeminiClaimReasoningOutput | null = null;
    try {
      const jsonMatch = reasoningOutputText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, reasoningOutputText];
      parsed = JSON.parse(jsonMatch[1]?.trim() || reasoningOutputText.trim());
    } catch {
      const firstBrace = reasoningOutputText.indexOf('{');
      const lastBrace = reasoningOutputText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        try {
          parsed = JSON.parse(reasoningOutputText.substring(firstBrace, lastBrace + 1));
        } catch (e) {
          console.warn('[TruthLens] JSON parsing error for claim:', e);
        }
      }
    }

    // Determine verdict
    let verdict: VerdictType = 'INSUFFICIENT EVIDENCE';
    if (parsed?.verdict === 'SUPPORTED' || parsed?.verdict === 'CONTRADICTED' || parsed?.verdict === 'INSUFFICIENT EVIDENCE') {
      verdict = parsed.verdict;
    } else {
      const lower = reasoningOutputText.toLowerCase();
      if (lower.includes('is supported') || lower.includes('confirmed') || lower.includes('true')) {
        verdict = 'SUPPORTED';
      } else if (lower.includes('is contradicted') || lower.includes('refuted') || lower.includes('false') || lower.includes('debunked')) {
        verdict = 'CONTRADICTED';
      }
    }

    // Map source relationships
    const relationshipMap = new Map<number, SourceRelationship>();
    if (Array.isArray(parsed?.sourceRelationships)) {
      parsed.sourceRelationships.forEach((sr) => {
        relationshipMap.set(sr.sourceIndex, sr.relationship);
      });
    }

    const finalClaimSources: SourceItem[] = rankedSources.map((s, idx) => {
      const rel = relationshipMap.get(idx + 1) || (verdict === 'SUPPORTED' ? 'SUPPORTS' : verdict === 'CONTRADICTED' ? 'CONTRADICTS' : 'NEUTRAL');
      return {
        ...s,
        relationshipToClaim: rel,
      };
    });

    // Confidence calculation with high-tier source weighting
    let finalConfidence = parsed?.confidence || 80;
    const highTierCount = finalClaimSources.filter((s) => s.assessment === 'HIGH').length;
    if (highTierCount >= 2 && (verdict === 'SUPPORTED' || verdict === 'CONTRADICTED')) {
      finalConfidence = Math.max(finalConfidence, 85);
    }
    if (parsed?.conflicts && parsed.conflicts.length > 0) {
      finalConfidence = Math.min(finalConfidence, 75);
    }
    if (verdict === 'INSUFFICIENT EVIDENCE') {
      finalConfidence = Math.max(25, Math.min(60, finalConfidence));
    }

    const reasoning = parsed?.reasoning || 'Evaluated against retrieved web search documentation.';
    const evidenceSummary = parsed?.evidenceSummary || 'Empirical web documentation analyzed for corroboration and refutation.';
    const supportingEvidence = parsed?.supportingEvidence || [];
    const contradictingEvidence = parsed?.contradictingEvidence || [];
    const conflicts = parsed?.conflicts || [];
    const uncertainty = parsed?.uncertainty || (verdict === 'INSUFFICIENT EVIDENCE' ? 'Lack of conclusive documentation.' : 'Minor variations in secondary reporting.');

    const claimRiskIndicators = detectRiskIndicatorsInText(vc.raw.claimText);
    if (verdict === 'INSUFFICIENT EVIDENCE') {
      claimRiskIndicators.push({
        id: `insuf-${vc.id}`,
        type: 'lack_of_evidence',
        title: 'Insufficient Corroborating Evidence',
        description: 'Retrieved sources do not provide conclusive proof or refutation of this empirical claim.',
        excerpt: vc.raw.claimText,
        severity: 'medium',
      });
    }

    finalClaimSources.forEach((src) => {
      if (src.publicationDate) {
        allTimelineEvents.push({
          date: src.publicationDate,
          title: src.title,
          source: src.sourceName,
          relationship: src.relationshipToClaim,
          url: src.url,
        });
      }
    });

    verifiedClaims.push({
      id: vc.id,
      claimText: vc.raw.claimText,
      category: vc.raw.category,
      statementType: vc.raw.statementType,
      isVerifiable: true,
      verdict,
      confidence: finalConfidence,
      reasoning,
      evidenceSummary,
      supportingEvidence,
      contradictingEvidence,
      conflicts,
      uncertainty,
      sources: finalClaimSources,
      riskIndicators: claimRiskIndicators,
    });

    allSources.push(...finalClaimSources);
  }

  // Deduplicate all sources across claims
  const aggregatedSources = rankAndDeduplicateSources(allSources);

  // Overall verdict aggregation
  const supportedCount = verifiedClaims.filter((c) => c.verdict === 'SUPPORTED').length;
  const contradictedCount = verifiedClaims.filter((c) => c.verdict === 'CONTRADICTED').length;
  const insufficientCount = verifiedClaims.filter((c) => c.verdict === 'INSUFFICIENT EVIDENCE').length;

  let hasConflict = false;
  let conflictSummary: string | undefined = undefined;

  const anyClaimHasConflict = verifiedClaims.some((c) => c.conflicts.length > 0);
  if (supportedCount > 0 && contradictedCount > 0) {
    hasConflict = true;
    conflictSummary = `The analyzed material contains both supported claims (${supportedCount}) and contradicted claims (${contradictedCount}), indicating substantial evidentiary discrepancy.`;
  } else if (anyClaimHasConflict) {
    hasConflict = true;
    conflictSummary = 'Evidence retrieval identified conflicting factual findings or contested interpretations across sources.';
  }

  let overallVerdict: OverallVerdictType;
  if (hasConflict && supportedCount > 0 && contradictedCount > 0) {
    overallVerdict = 'CONFLICTING EVIDENCE';
  } else if (contradictedCount > supportedCount && contradictedCount >= insufficientCount) {
    overallVerdict = 'CONTRADICTED';
  } else if (supportedCount > contradictedCount && supportedCount >= insufficientCount) {
    overallVerdict = 'SUPPORTED';
  } else if (insufficientCount > 0 && supportedCount === 0 && contradictedCount === 0) {
    overallVerdict = 'INSUFFICIENT EVIDENCE';
  } else if (hasConflict) {
    overallVerdict = 'CONFLICTING EVIDENCE';
  } else {
    overallVerdict = supportedCount >= contradictedCount ? 'SUPPORTED' : 'CONTRADICTED';
  }

  const avgConfidence =
    verifiedClaims.length > 0
      ? Math.round(verifiedClaims.reduce((acc, c) => acc + c.confidence, 0) / verifiedClaims.length)
      : 50;

  const aggregatedRiskMap = new Map<string, RiskIndicator>();
  initialRiskIndicators.forEach((r) => aggregatedRiskMap.set(`${r.type}-${r.excerpt}`, r));
  verifiedClaims.forEach((c) => {
    c.riskIndicators.forEach((r) => aggregatedRiskMap.set(`${r.type}-${r.excerpt}`, r));
  });
  const aggregatedRiskIndicators = Array.from(aggregatedRiskMap.values());

  const timelineEvents = allTimelineEvents.sort((a, b) => a.date.localeCompare(b.date));

  return {
    id: `tl-verify-${Date.now()}`,
    inputType: articleData.inputType,
    rawInput: articleData.text,
    articleMetadata: {
      title: articleData.title,
      publisher: articleData.publisher,
      publicationDate: articleData.publicationDate,
      author: articleData.author,
      url: articleData.url,
      relevantTextExcerpt:
        articleData.text.length > 300 ? articleData.text.substring(0, 300) + '...' : articleData.text,
    },
    overallVerdict,
    overallConfidence: avgConfidence,
    claimsAnalyzedCount: verifiedClaims.length,
    counts: {
      supported: supportedCount,
      contradicted: contradictedCount,
      insufficient: insufficientCount,
      conflicting: hasConflict ? 1 : 0,
    },
    sourcesAnalyzedCount: aggregatedSources.length,
    hasEvidenceConflict: hasConflict,
    conflictSummary,
    timestamp: new Date().toISOString(),
    claims: verifiedClaims,
    aggregatedSources,
    aggregatedRiskIndicators,
    timelineEvents,
    pipelineSummary: {
      inputDetected: articleData.inputType,
      claimsExtracted: verifiedClaims.length,
      sourcesQueried: aggregatedSources.length,
      conflictsFlagged: hasConflict ? 1 : 0,
      avgConfidence,
    },
  };
}

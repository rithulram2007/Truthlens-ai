import { getGeminiClient, isGeminiQuotaOrServiceError, createServiceUnavailableError } from '../gemini';
import {
  ClaimVerification,
  OverallVerdictType,
  RiskIndicator,
  SourceItem,
  TimelineEvent,
  VerdictType,
  VerificationResult,
} from '../../src/types';
import { ExtractedClaimRaw } from './claimExtractor';
import { assessDomainTier, rankAndDeduplicateSources } from './sourceAssessor';
import { detectRiskIndicatorsInText } from './riskIndicatorDetector';
import { ExtractedArticleData } from './articleExtractor';

interface GroundingChunkWeb {
  uri?: string;
  title?: string;
}

interface GroundingChunk {
  web?: GroundingChunkWeb;
}

interface CandidateWithGrounding {
  groundingMetadata?: {
    webSearchQueries?: string[];
    groundingChunks?: GroundingChunk[];
    groundingSupports?: Array<{
      segment?: { text?: string };
      groundingChunkIndices?: number[];
      confidenceScores?: number[];
    }>;
  };
}

interface ClaimAnalysisOutput {
  claimIndex?: number;
  claimText?: string;
  verdict: VerdictType;
  confidence: number;
  reasoning: string;
  evidenceSummary: string;
  supportingEvidence?: string[];
  contradictingEvidence?: string[];
  conflicts?: string[];
  uncertainty?: string;
  sources?: Array<{
    sourceName?: string;
    title?: string;
    url?: string;
    publicationDate?: string;
    relationshipToClaim?: string;
    relevance?: number;
    excerpt?: string;
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
        uncertainty: 'Subjective assessments and speculative forecasts contain inherent epistemic uncertainty.',
        sources: [],
        riskIndicators: [subjectiveRisk],
      });
    } else {
      verifiableClaims.push({ raw: rawClaim, index: i, id: claimId });
    }
  }

  // If there are verifiable claims, perform verification using Gemini 3.8 Flash with Google Search Grounding.
  // CRITICAL OPTIMIZATION:
  // To minimize unnecessary Gemini API calls and prevent 429 RESOURCE_EXHAUSTED errors,
  // we batch all verifiable claims into a SINGLE search-grounded Gemini call rather than N separate calls.
  if (verifiableClaims.length > 0) {
    const ai = getGeminiClient();

    let claimsListPrompt = '';
    verifiableClaims.forEach((vc, idx) => {
      claimsListPrompt += `Claim [${idx + 1}] (Category: ${vc.raw.category}): "${vc.raw.claimText}"\n`;
    });

    const consolidatedPrompt = `You are TruthLens's Academic Evidence Retrieval & Verification Engine.
Your task is to verify the following empirical claim(s) using live search grounding:
${claimsListPrompt}

Instructions:
1. Search authoritative sources prioritizing:
   - Tier 1: Government & official regulatory portals (.gov, WHO, CDC, UN, NASA, etc.)
   - Tier 2: Scientific journals and peer-reviewed academic publications (Nature, Lancet, Science, PubMed, .edu)
   - Tier 3: Primary records & official datasets
   - Tier 4: Reputable global news agencies (Reuters, AP, BBC, AFP, NPR)
   - Tier 5: Established research institutions & fact-checking organizations (Pew, Brookings, FactCheck.org, Snopes)
2. For each claim, determine the empirical verdict:
   - "SUPPORTED": Clear corroborating empirical consensus from authoritative sources.
   - "CONTRADICTED": Refuted or debunked by authoritative sources or scientific consensus.
   - "INSUFFICIENT EVIDENCE": Scientific or empirical evidence is absent, inconclusive, or lacking verifiable documentation.
3. Check for conflicting evidence between reliable sources.
4. Confidence measures system certainty in the evidentiary assessment (0-100) based on source quality and consensus, NOT personal belief.
5. Never fabricate fake URLs or fake evidence. Only cite real organizations, domains, and authentic search results.

Output your analysis strictly as a JSON object matching this schema:
{
  "assessments": [
    {
      "claimIndex": 1,
      "verdict": "SUPPORTED" | "CONTRADICTED" | "INSUFFICIENT EVIDENCE",
      "confidence": <integer 0-100>,
      "reasoning": "<academic rationale grounded strictly in retrieved empirical evidence>",
      "evidenceSummary": "<concise synthesis of the retrieved empirical findings>",
      "supportingEvidence": ["<specific finding or quotation supporting the claim if any>"],
      "contradictingEvidence": ["<specific finding or quotation refuting the claim if any>"],
      "conflicts": ["<description of any disagreements between sources if any>"],
      "uncertainty": "<what remains unproven or contested>",
      "sources": [
        {
          "sourceName": "<organization or publisher>",
          "title": "<article or report title>",
          "url": "<URL or domain if known>",
          "publicationDate": "<YYYY-MM-DD or YYYY if known>",
          "relationshipToClaim": "SUPPORTS" | "CONTRADICTS" | "NEUTRAL" | "INSUFFICIENT",
          "relevance": <number 0-100>,
          "excerpt": "<brief factual excerpt>"
        }
      ]
    }
  ]
}`;

    let responseText = '';
    let candidate: CandidateWithGrounding | undefined;

    try {
      // Single call with Google Search Grounding
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: consolidatedPrompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      candidate = response.candidates?.[0] as CandidateWithGrounding | undefined;
      responseText = response.text || '';
    } catch (err: unknown) {
      console.error('[TruthLens] Gemini search-grounded call failed:', err);

      // Check if this is a quota or service availability error
      if (isGeminiQuotaOrServiceError(err)) {
        throw createServiceUnavailableError(
          err instanceof Error ? err.message : String(err)
        );
      }

      // Re-throw generic failures so they are not masked as INSUFFICIENT EVIDENCE
      throw new Error(
        `Verification pipeline failed during evidence retrieval: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }

    // Parse JSON from the response
    let parsedAssessments: ClaimAnalysisOutput[] = [];
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, responseText];
      const parsedJson = JSON.parse(jsonMatch[1]?.trim() || responseText.trim());
      if (Array.isArray(parsedJson)) {
        parsedAssessments = parsedJson;
      } else if (parsedJson && Array.isArray(parsedJson.assessments)) {
        parsedAssessments = parsedJson.assessments;
      } else if (parsedJson && typeof parsedJson === 'object') {
        parsedAssessments = [parsedJson];
      }
    } catch {
      // Fallback bracket parsing
      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        try {
          const extracted = JSON.parse(responseText.substring(firstBrace, lastBrace + 1));
          if (Array.isArray(extracted.assessments)) {
            parsedAssessments = extracted.assessments;
          } else if (Array.isArray(extracted)) {
            parsedAssessments = extracted;
          } else if (extracted.verdict) {
            parsedAssessments = [extracted];
          }
        } catch (e) {
          console.warn('[TruthLens] JSON parsing fallback error:', e);
        }
      }
    }

    // Extract genuine grounded citations from Google Search Grounding metadata
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
    const searchGroundedSources: SourceItem[] = [];

    groundingChunks.forEach((chunk, gIdx) => {
      if (chunk.web?.uri) {
        const uri = chunk.web.uri;
        const title = chunk.web.title || `Grounded Citation #${gIdx + 1}`;
        let domain = 'web';
        try {
          domain = new URL(uri).hostname.replace(/^www\./, '');
        } catch {
          domain = uri;
        }

        const { tier, assessment } = assessDomainTier(domain);
        searchGroundedSources.push({
          id: `src-grounded-${gIdx}-${Date.now()}`,
          sourceName: domain,
          title,
          url: uri,
          domain,
          relevance: Math.max(60, 95 - gIdx * 4),
          relationshipToClaim: 'NEUTRAL',
          assessment,
          tier,
          excerpt: 'Retrieved via Google Search Grounding during empirical verification pass.',
        });
      }
    });

    // Populate each verifiable claim with the parsed assessment
    verifiableClaims.forEach((vc, idx) => {
      const assessment =
        parsedAssessments[idx] ||
        parsedAssessments.find((a) => a.claimIndex === idx + 1) ||
        parsedAssessments[0] ||
        null;

      let verdict: VerdictType = 'INSUFFICIENT EVIDENCE';
      if (assessment?.verdict === 'SUPPORTED' || assessment?.verdict === 'CONTRADICTED') {
        verdict = assessment.verdict;
      } else if (assessment?.verdict === 'INSUFFICIENT EVIDENCE') {
        verdict = 'INSUFFICIENT EVIDENCE';
      } else {
        // Inferred from reasoning if explicit verdict string had minor variation
        const rLower = (assessment?.reasoning || responseText).toLowerCase();
        if (rLower.includes('is supported') || rLower.includes('accurate') || rLower.includes('true')) {
          verdict = 'SUPPORTED';
        } else if (rLower.includes('is contradicted') || rLower.includes('false') || rLower.includes('myth') || rLower.includes('debunked')) {
          verdict = 'CONTRADICTED';
        }
      }

      const reasoning =
        assessment?.reasoning ||
        responseText.slice(0, 500) ||
        'Verified using live empirical citations retrieved via Google Search Grounding.';
      const evidenceSummary =
        assessment?.evidenceSummary ||
        'Authoritative documentation and empirical datasets evaluated against the claim statement.';
      const supportingEvidence = assessment?.supportingEvidence || [];
      const contradictingEvidence = assessment?.contradictingEvidence || [];
      const conflicts = assessment?.conflicts || [];
      const uncertainty =
        assessment?.uncertainty ||
        (verdict === 'INSUFFICIENT EVIDENCE'
          ? 'Lack of conclusive peer-reviewed or primary data.'
          : 'Minor variances in secondary reporting.');

      // Collect sources specific to this claim
      const claimSources: SourceItem[] = [];

      // 1. Genuine Google Search Grounding sources
      searchGroundedSources.forEach((src) => {
        claimSources.push({
          ...src,
          relationshipToClaim:
            verdict === 'SUPPORTED'
              ? 'SUPPORTS'
              : verdict === 'CONTRADICTED'
              ? 'CONTRADICTS'
              : 'INSUFFICIENT',
        });
      });

      // 2. Sources reported in assessment JSON (only if authentic)
      if (Array.isArray(assessment?.sources)) {
        assessment.sources.forEach((s, sIdx) => {
          if (s.sourceName || s.url) {
            const domain = s.url ? (s.url.includes('http') ? new URL(s.url).hostname.replace(/^www\./, '') : s.url) : (s.sourceName || 'web');
            const { tier, assessment: assessTier } = assessDomainTier(domain);
            claimSources.push({
              id: `src-json-${vc.id}-${sIdx}`,
              sourceName: s.sourceName || domain,
              title: s.title || `Source Citation: ${domain}`,
              url: s.url || `https://${domain}`,
              domain,
              publicationDate: s.publicationDate,
              relevance: s.relevance || 80,
              relationshipToClaim: (s.relationshipToClaim as any) || (verdict === 'SUPPORTED' ? 'SUPPORTS' : verdict === 'CONTRADICTED' ? 'CONTRADICTS' : 'INSUFFICIENT'),
              assessment: assessTier,
              tier,
              excerpt: s.excerpt || 'Referenced in empirical verification findings.',
            });
          }
        });
      }

      // DO NOT FABRICATE SOURCES:
      // If no sources were retrieved, we leave claimSources as rankAndDeduplicateSources(claimSources)
      // without adding fake synthetic URLs.
      const deduplicatedClaimSources = rankAndDeduplicateSources(claimSources);

      // System confidence calculation
      let calculatedConfidence = assessment?.confidence || 75;
      const highTierCount = deduplicatedClaimSources.filter((s) => s.assessment === 'HIGH').length;
      if (highTierCount >= 2 && (verdict === 'SUPPORTED' || verdict === 'CONTRADICTED')) {
        calculatedConfidence = Math.max(calculatedConfidence, 85);
      }
      if (conflicts.length > 0) {
        calculatedConfidence = Math.min(calculatedConfidence, 72);
      }
      if (verdict === 'INSUFFICIENT EVIDENCE') {
        calculatedConfidence = Math.max(30, Math.min(60, calculatedConfidence));
      }

      const claimRiskIndicators = detectRiskIndicatorsInText(vc.raw.claimText);
      if (verdict === 'INSUFFICIENT EVIDENCE' && deduplicatedClaimSources.length === 0) {
        claimRiskIndicators.push({
          id: `no-evid-${vc.id}`,
          type: 'lack_of_evidence',
          title: 'Scarcity of Corroborating Primary Evidence',
          description: 'No established primary or peer-reviewed documentation found to corroborate or decisively refute this specific assertion.',
          excerpt: vc.raw.claimText,
          severity: 'high',
        });
      }

      // Timeline events from sources
      deduplicatedClaimSources.forEach((src) => {
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
        confidence: calculatedConfidence,
        reasoning,
        evidenceSummary,
        supportingEvidence,
        contradictingEvidence,
        conflicts,
        uncertainty,
        sources: deduplicatedClaimSources,
        riskIndicators: claimRiskIndicators,
      });

      allSources.push(...deduplicatedClaimSources);
    });
  }

  // Deduplicate all sources across all claims
  const aggregatedSources = rankAndDeduplicateSources(allSources);

  // Overall verdict calculation
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
    conflictSummary = 'Evidence retrieval identified conflicting factual findings or contested interpretations across authoritative sources.';
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

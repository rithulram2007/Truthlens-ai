import { callLLMReasoning, isGeminiQuotaOrServiceError, createServiceUnavailableError } from '../gemini';
import { ClaimCategory, ClaimStatementType } from '../../src/types';

export interface ExtractedClaimRaw {
  claimText: string;
  category: ClaimCategory;
  statementType: ClaimStatementType;
  isVerifiable: boolean;
  contextSnippet?: string;
}

export function detectHeuristicCategory(text: string): ClaimCategory {
  const lower = text.toLowerCase();
  if (
    lower.includes('space') ||
    lower.includes('moon') ||
    lower.includes('planet') ||
    lower.includes('physics') ||
    lower.includes('biology') ||
    lower.includes('chemistry') ||
    lower.includes('dna') ||
    lower.includes('species') ||
    lower.includes('orbit') ||
    lower.includes('penicillin') ||
    lower.includes('great wall')
  ) {
    return 'Science';
  }
  if (
    lower.includes('health') ||
    lower.includes('vaccine') ||
    lower.includes('disease') ||
    lower.includes('cancer') ||
    lower.includes('doctor') ||
    lower.includes('hospital') ||
    lower.includes('medicine') ||
    lower.includes('virus') ||
    lower.includes('diet')
  ) {
    return 'Health';
  }
  if (
    lower.includes('election') ||
    lower.includes('president') ||
    lower.includes('congress') ||
    lower.includes('senate') ||
    lower.includes('parliament') ||
    lower.includes('minister') ||
    lower.includes('voting') ||
    lower.includes('democrat') ||
    lower.includes('republican') ||
    lower.includes('government')
  ) {
    return 'Politics';
  }
  if (
    lower.includes('climate') ||
    lower.includes('carbon') ||
    lower.includes('emissions') ||
    lower.includes('warming') ||
    lower.includes('electric vehicle') ||
    lower.includes('battery') ||
    lower.includes('pollution')
  ) {
    return 'Environment';
  }
  if (
    lower.includes('gdp') ||
    lower.includes('inflation') ||
    lower.includes('economy') ||
    lower.includes('market') ||
    lower.includes('stock') ||
    lower.includes('tax') ||
    lower.includes('dollar')
  ) {
    return 'Economics';
  }
  if (
    lower.includes('century') ||
    lower.includes('ancient') ||
    lower.includes('roman') ||
    lower.includes('empire') ||
    lower.includes('dynasty') ||
    lower.includes('1928') ||
    lower.includes('1969') ||
    lower.includes('world war')
  ) {
    return 'History';
  }
  if (
    lower.includes('ai') ||
    lower.includes('software') ||
    lower.includes('computer') ||
    lower.includes('algorithm') ||
    lower.includes('internet')
  ) {
    return 'Technology';
  }
  return 'General';
}

export async function extractClaimsFromText(
  text: string,
  inputType: 'claim' | 'url' | 'article'
): Promise<ExtractedClaimRaw[]> {
  const trimmed = text.trim();

  // MINIMIZE UNNECESSARY GEMINI CALLS:
  // If the user provided a single factual claim, fast-track directly without an extraction API call!
  // This saves 1 whole Gemini API call per claim verification.
  const isSingleClaim =
    inputType === 'claim' ||
    (trimmed.length <= 300 &&
      !trimmed.includes('\n\n') &&
      (trimmed.match(/[.!?](\s+|$)/g) || []).length <= 1);

  if (isSingleClaim) {
    return [
      {
        claimText: trimmed,
        category: detectHeuristicCategory(trimmed),
        statementType: 'factual',
        isVerifiable: true,
        contextSnippet: trimmed,
      },
    ];
  }

  // For multi-paragraph articles or URLs, call reasoning model with a tight token budget to extract the top 1-2 central claims
  const prompt = `You are TruthLens's Claim Extraction Engine.
Analyze the following text and extract the top 1 to 2 key central empirical claims.
Do not extract trivial statements.
Input Type: ${inputType}
Text:
"""
${trimmed.substring(0, 3000)}
"""

Classify category into: "Politics", "Science", "Health", "Technology", "Economics", "Environment", "Crime", "History", "Statistics", or "General".
statementType MUST be one of: "factual", "opinion", "prediction", "subjective".
isVerifiable: true if testable against empirical evidence.

Return a JSON array of objects with the following structure:
[
  {
    "claimText": "string",
    "category": "Politics" | "Science" | "Health" | "Technology" | "Economics" | "Environment" | "Crime" | "History" | "Statistics" | "General",
    "statementType": "factual" | "opinion" | "prediction" | "subjective",
    "isVerifiable": boolean,
    "contextSnippet": "string"
  }
]
Return ONLY the JSON array.`;

  try {
    const rawResponseText = await callLLMReasoning(prompt, { json: true, max_tokens: 1000 });
    const jsonMatch = rawResponseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, rawResponseText];
    let parsed: Array<Record<string, unknown>> = [];
    try {
      parsed = JSON.parse(jsonMatch[1]?.trim() || rawResponseText.trim());
    } catch {
      const firstBracket = rawResponseText.indexOf('[');
      const lastBracket = rawResponseText.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1) {
        parsed = JSON.parse(rawResponseText.substring(firstBracket, lastBracket + 1));
      }
    }

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 2).map((item) => ({
        claimText: (item.claimText as string) || trimmed,
        category: (item.category as ClaimCategory) || 'General',
        statementType: (item.statementType as ClaimStatementType) || 'factual',
        isVerifiable: typeof item.isVerifiable === 'boolean' ? item.isVerifiable : true,
        contextSnippet: (item.contextSnippet as string) || '',
      }));
    }
  } catch (error) {
    console.error('Error in claim extraction:', error);
    // If quota or service unavailable, throw service unavailable error
    if (isGeminiQuotaOrServiceError(error)) {
      throw createServiceUnavailableError(
        error instanceof Error ? error.message : String(error),
        process.env.OPENROUTER_API_KEY ? 'OpenRouter' : 'Gemini'
      );
    }
  }

  // Fallback for non-quota parsing issues:
  return [
    {
      claimText: trimmed.length > 200 ? trimmed.substring(0, 200) + '...' : trimmed,
      category: detectHeuristicCategory(trimmed),
      statementType: 'factual',
      isVerifiable: true,
      contextSnippet: trimmed,
    },
  ];
}


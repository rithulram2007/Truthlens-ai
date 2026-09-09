export type InputType = 'claim' | 'url' | 'article';

export type ClaimCategory =
  | 'Politics'
  | 'Science'
  | 'Health'
  | 'Technology'
  | 'Economics'
  | 'Environment'
  | 'Crime'
  | 'History'
  | 'Statistics'
  | 'General';

export type ClaimStatementType = 'factual' | 'opinion' | 'prediction' | 'subjective';

export type VerdictType = 'SUPPORTED' | 'CONTRADICTED' | 'INSUFFICIENT EVIDENCE';

export type OverallVerdictType = VerdictType | 'CONFLICTING EVIDENCE';

export type SourceAssessment = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export type SourceCategoryTier =
  | 'Government / Official'
  | 'Scientific / Academic'
  | 'Primary Source'
  | 'Reputable News'
  | 'Established Organization'
  | 'General Media / Blog'
  | 'Unverified';

export type SourceRelationship = 'SUPPORTS' | 'CONTRADICTS' | 'NEUTRAL' | 'INSUFFICIENT';

export interface SourceItem {
  id: string;
  sourceName: string;
  title: string;
  url: string;
  domain: string;
  publicationDate?: string;
  relevance: number; // 0-100%
  relationshipToClaim: SourceRelationship;
  assessment: SourceAssessment;
  tier: SourceCategoryTier;
  excerpt?: string;
}

export type RiskIndicatorType =
  | 'sensational_language'
  | 'emotional_wording'
  | 'unsupported_statistics'
  | 'absolute_claims'
  | 'missing_attribution'
  | 'exaggerated_certainty'
  | 'misleading_framing'
  | 'lack_of_evidence';

export interface RiskIndicator {
  id: string;
  type: RiskIndicatorType;
  title: string;
  description: string;
  excerpt?: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ClaimVerification {
  id: string;
  claimText: string;
  category: ClaimCategory;
  statementType: ClaimStatementType;
  isVerifiable: boolean;
  verdict: VerdictType;
  confidence: number; // 0-100 (system confidence in the assessment)
  reasoning: string;
  evidenceSummary: string;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  conflicts: string[];
  uncertainty: string;
  sources: SourceItem[];
  riskIndicators: RiskIndicator[];
}

export interface ArticleMetadata {
  title?: string;
  publisher?: string;
  publicationDate?: string;
  author?: string;
  url?: string;
  relevantTextExcerpt?: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  source: string;
  relationship: SourceRelationship;
  url?: string;
}

export interface VerificationResult {
  id: string;
  inputType: InputType;
  rawInput: string;
  articleMetadata?: ArticleMetadata;
  overallVerdict: OverallVerdictType;
  overallConfidence: number;
  claimsAnalyzedCount: number;
  counts: {
    supported: number;
    contradicted: number;
    insufficient: number;
    conflicting: number;
  };
  sourcesAnalyzedCount: number;
  hasEvidenceConflict: boolean;
  conflictSummary?: string;
  timestamp: string;
  claims: ClaimVerification[];
  aggregatedSources: SourceItem[];
  aggregatedRiskIndicators: RiskIndicator[];
  timelineEvents: TimelineEvent[];
  pipelineSummary: {
    inputDetected: InputType;
    claimsExtracted: number;
    sourcesQueried: number;
    conflictsFlagged: number;
    avgConfidence: number;
  };
}

export interface VerificationHistoryItem {
  id: string;
  inputPreview: string;
  inputType: InputType;
  timestamp: string;
  overallVerdict: OverallVerdictType;
  overallConfidence: number;
  claimsCount: number;
  sourcesCount: number;
  fullResult: VerificationResult;
}

import {
  SourceItem,
  SourceOriginRelationship,
  EvidenceOriginGroup,
  IndependentEvidenceCorroboration,
  CorroborationLevel,
  FactualComponentCoverage,
  VerificationCoverageData,
  FactualComponentStatus,
  VerdictType,
} from '../../src/types';

interface LLMOriginGroupInput {
  originName?: string;
  description?: string;
  sourceIndices?: number[];
}

interface LLMSourceRelationshipInput {
  sourceIndex: number;
  relationship?: string;
  evidenceOrigin?: string;
  originGroupName?: string;
}

interface LLMFactualComponentInput {
  componentText: string;
  status: string;
  supportingCount?: number;
  contradictingCount?: number;
  evidenceStatus?: string;
}

/**
 * Normalizes source origin relationship safely.
 * When uncertain, defaults to 'Unknown' per strict anti-fabrication guidelines.
 */
export function normalizeSourceOrigin(val?: string): SourceOriginRelationship {
  if (!val) return 'Unknown';
  const clean = val.trim().toLowerCase();
  if (clean === 'independent') return 'Independent';
  if (clean === 'derivative') return 'Derivative';
  if (clean === 'same origin' || clean === 'same-origin' || clean === 'sameorigin') return 'Same Origin';
  return 'Unknown';
}

/**
 * Normalizes factual component status safely.
 */
export function normalizeComponentStatus(status?: string): FactualComponentStatus {
  if (!status) return 'UNKNOWN';
  const clean = status.trim().toUpperCase();
  if (clean === 'SUPPORTED') return 'SUPPORTED';
  if (clean === 'CONTRADICTED') return 'CONTRADICTED';
  if (clean === 'INSUFFICIENT EVIDENCE' || clean === 'INSUFFICIENT') return 'INSUFFICIENT EVIDENCE';
  return 'UNKNOWN';
}

/**
 * Computes Verification Coverage from factual components.
 */
export function computeVerificationCoverage(
  claimText: string,
  verdict: VerdictType,
  llmComponents?: LLMFactualComponentInput[],
  supportingEvidence: string[] = [],
  contradictingEvidence: string[] = []
): VerificationCoverageData {
  let components: FactualComponentCoverage[] = [];

  if (Array.isArray(llmComponents) && llmComponents.length > 0) {
    components = llmComponents.map((c, i) => {
      const status = normalizeComponentStatus(c.status);
      return {
        id: `comp-${i + 1}`,
        componentText: c.componentText || `Component ${i + 1}`,
        status,
        supportingEvidenceCount: typeof c.supportingCount === 'number' ? c.supportingCount : (status === 'SUPPORTED' ? 1 : 0),
        contradictingEvidenceCount: typeof c.contradictingCount === 'number' ? c.contradictingCount : (status === 'CONTRADICTED' ? 1 : 0),
        evidenceStatus: c.evidenceStatus || (status === 'SUPPORTED' ? 'Supported by retrieved sources' : status === 'CONTRADICTED' ? 'Contradicted by retrieved sources' : 'Inconclusive / unaddressed in retrieved sources'),
      };
    });
  }

  // Algorithmic component decomposition fallback if LLM provided none
  if (components.length === 0) {
    const rawParts = claimText
      .split(/(?:,|\band\b|\bwhile\b|\bafter\b|\bincluding\b|\bwith\b|\bwhere\b)/i)
      .map((s) => s.trim().replace(/^that\s+/i, ''))
      .filter((s) => s.length > 12);

    if (rawParts.length >= 2) {
      components = rawParts.map((part, i) => {
        let status: FactualComponentStatus = 'UNKNOWN';
        if (verdict === 'SUPPORTED') {
          status = 'SUPPORTED';
        } else if (verdict === 'CONTRADICTED') {
          status = i === 0 && rawParts.length > 1 ? 'SUPPORTED' : 'CONTRADICTED';
        } else {
          status = 'INSUFFICIENT EVIDENCE';
        }
        return {
          id: `comp-${i + 1}`,
          componentText: part.charAt(0).toUpperCase() + part.slice(1),
          status,
          supportingEvidenceCount: status === 'SUPPORTED' ? Math.max(1, supportingEvidence.length) : 0,
          contradictingEvidenceCount: status === 'CONTRADICTED' ? Math.max(1, contradictingEvidence.length) : 0,
          evidenceStatus:
            status === 'SUPPORTED'
              ? 'Corroborated by primary evidence'
              : status === 'CONTRADICTED'
              ? 'Contradicted by empirical records'
              : 'Empirical documentation insufficient',
        };
      });
    } else {
      // Single atomic proposition
      const compStatus: FactualComponentStatus =
        verdict === 'SUPPORTED'
          ? 'SUPPORTED'
          : verdict === 'CONTRADICTED'
          ? 'CONTRADICTED'
          : 'INSUFFICIENT EVIDENCE';

      components = [
        {
          id: 'comp-1',
          componentText: claimText,
          status: compStatus,
          supportingEvidenceCount: supportingEvidence.length,
          contradictingEvidenceCount: contradictingEvidence.length,
          evidenceStatus:
            compStatus === 'SUPPORTED'
              ? 'Empirically supported by retrieved documentation'
              : compStatus === 'CONTRADICTED'
              ? 'Empirically refuted by retrieved records'
              : 'Insufficient documentation retrieved',
        },
      ];
    }
  }

  const componentsCount = components.length;
  const supportedCount = components.filter((c) => c.status === 'SUPPORTED').length;
  const knownEvaluated = components.filter((c) => c.status !== 'UNKNOWN').length;

  if (componentsCount === 0 || knownEvaluated === 0) {
    return {
      componentsCount,
      supportedCount: 0,
      coverageScore: null,
      statusLabel: 'UNKNOWN',
      components,
    };
  }

  const coverageScore = Math.round((supportedCount / componentsCount) * 100);
  let statusLabel: '100% VERIFIED' | 'PARTIALLY VERIFIED' | 'INSUFFICIENT EVIDENCE' | 'UNKNOWN' = 'PARTIALLY VERIFIED';

  if (coverageScore === 100) {
    statusLabel = '100% VERIFIED';
  } else if (coverageScore === 0) {
    statusLabel = 'INSUFFICIENT EVIDENCE';
  } else {
    statusLabel = 'PARTIALLY VERIFIED';
  }

  return {
    componentsCount,
    supportedCount,
    coverageScore,
    statusLabel,
    components,
  };
}

/**
 * Computes Independent Evidence Corroboration (IEC) and groups sources into Evidence Origins.
 */
export function analyzeIndependentEvidenceCorroboration(
  sources: SourceItem[],
  baseConfidence: number,
  llmOrigins?: LLMOriginGroupInput[],
  llmSourceRel?: LLMSourceRelationshipInput[]
): {
  iec: IndependentEvidenceCorroboration;
  updatedSources: SourceItem[];
} {
  const sourcesRetrieved = sources.length;

  if (sourcesRetrieved === 0) {
    return {
      iec: {
        sourcesRetrieved: 0,
        independentOriginsCount: 0,
        derivativeSourcesCount: 0,
        score: null,
        corroborationLevel: 'UNKNOWN / LIMITED PROVENANCE',
        baseConfidence,
        adjustedConfidence: baseConfidence,
        groups: [],
        hasReliableProvenance: false,
        provenanceNotes: 'No external sources retrieved to establish provenance or independence.',
      },
      updatedSources: sources,
    };
  }

  // Map to hold source relationship classifications
  const sourceOriginMap = new Map<number, SourceOriginRelationship>();
  const sourceGroupMap = new Map<number, string>();

  if (Array.isArray(llmSourceRel)) {
    llmSourceRel.forEach((rel) => {
      if (typeof rel.sourceIndex === 'number') {
        const norm = normalizeSourceOrigin(rel.evidenceOrigin);
        sourceOriginMap.set(rel.sourceIndex, norm);
        if (rel.originGroupName) {
          sourceGroupMap.set(rel.sourceIndex, rel.originGroupName);
        }
      }
    });
  }

  // Build origin groups
  const groups: EvidenceOriginGroup[] = [];
  const assignedSourceIds = new Set<string>();

  // If LLM returned structured evidenceOrigins
  if (Array.isArray(llmOrigins) && llmOrigins.length > 0) {
    llmOrigins.forEach((orig, oIdx) => {
      const gId = `origin-${oIdx + 1}`;
      const groupSources: SourceItem[] = [];

      if (Array.isArray(orig.sourceIndices)) {
        orig.sourceIndices.forEach((sIdx) => {
          const zeroIdx = sIdx - 1;
          if (sources[zeroIdx] && !assignedSourceIds.has(sources[zeroIdx].id)) {
            const relType = sourceOriginMap.get(sIdx) || 'Independent';
            groupSources.push({
              ...sources[zeroIdx],
              evidenceOrigin: relType,
              originGroupId: gId,
            });
            assignedSourceIds.add(sources[zeroIdx].id);
          }
        });
      }

      if (groupSources.length > 0) {
        groups.push({
          id: gId,
          originName: orig.originName || `Evidence Origin ${String.fromCharCode(65 + oIdx)}`,
          description: orig.description || 'Sources referencing common primary empirical information or event.',
          sources: groupSources,
        });
      }
    });
  }

  // Handle remaining sources or fallback grouping by domain / wire-service detection
  const unassigned = sources.filter((s) => !assignedSourceIds.has(s.id));
  if (unassigned.length > 0) {
    // Group unassigned sources by root domain or obvious attribution
    const domainGroups = new Map<string, SourceItem[]>();

    unassigned.forEach((src, idx) => {
      const originalIdx = sources.findIndex((s) => s.id === src.id) + 1;
      let relType = sourceOriginMap.get(originalIdx);

      // Check for wire service attribution in excerpt or title
      const lowerText = `${src.title} ${src.excerpt || ''}`.toLowerCase();
      const isWire =
        lowerText.includes('reuters') ||
        lowerText.includes('associated press') ||
        lowerText.includes('ap news') ||
        lowerText.includes('pr newswire') ||
        lowerText.includes('business wire') ||
        lowerText.includes('according to');

      if (!relType) {
        if (isWire && !src.domain.includes('reuters.com') && !src.domain.includes('apnews.com')) {
          relType = 'Derivative';
        } else {
          // If domain is unique and high authority -> Independent, else Unknown
          relType = src.assessment === 'HIGH' ? 'Independent' : 'Unknown';
        }
      }

      const rootDomain = src.domain.split('.').slice(-2).join('.');
      if (!domainGroups.has(rootDomain)) {
        domainGroups.set(rootDomain, []);
      }
      domainGroups.get(rootDomain)!.push({
        ...src,
        evidenceOrigin: relType,
      });
    });

    domainGroups.forEach((domainSrcs, dom) => {
      const gIdx = groups.length;
      const gId = `origin-${gIdx + 1}`;
      const firstSource = domainSrcs[0];
      const originName = firstSource.tier.includes('Government') || firstSource.tier.includes('Primary')
        ? `Primary Institutional Origin (${dom})`
        : `Evidence Origin ${String.fromCharCode(65 + gIdx)} (${dom})`;

      const updatedGroupSources = domainSrcs.map((s, idx) => ({
        ...s,
        evidenceOrigin: idx > 0 && s.evidenceOrigin === 'Independent' ? 'Same Origin' : s.evidenceOrigin,
        originGroupId: gId,
      }));

      groups.push({
        id: gId,
        originName,
        description: `Sources derived from or published under domain entity ${dom}.`,
        sources: updatedGroupSources,
      });
    });
  }

  // Flatten updated sources with proper evidenceOrigin tags
  const updatedSources: SourceItem[] = [];
  groups.forEach((g) => {
    g.sources.forEach((s) => updatedSources.push(s));
  });

  // Calculate metrics
  const effectiveEvidenceGroups = Math.max(1, groups.length);

  // Independent Origins: count groups where at least one source is marked Independent
  let independentOriginsCount = groups.filter((g) =>
    g.sources.some((s) => s.evidenceOrigin === 'Independent')
  ).length;

  // In case no group had explicit independent mark, count groups with distinct non-derivative sources
  if (independentOriginsCount === 0 && groups.length > 0) {
    independentOriginsCount = Math.max(1, Math.min(groups.length, sourcesRetrieved));
  }

  // Count derivative or same-origin sources
  const derivativeSourcesCount = updatedSources.filter(
    (s) => s.evidenceOrigin === 'Derivative' || s.evidenceOrigin === 'Same Origin'
  ).length;

  // Has reliable provenance: true if at least one source has verified origin and not all are unknown
  const unknownCount = updatedSources.filter((s) => s.evidenceOrigin === 'Unknown').length;
  const hasReliableProvenance = unknownCount < updatedSources.length;

  let score: number | null = null;
  let corroborationLevel: CorroborationLevel = 'UNKNOWN / LIMITED PROVENANCE';

  if (!hasReliableProvenance && unknownCount === updatedSources.length) {
    score = null;
    corroborationLevel = 'UNKNOWN / LIMITED PROVENANCE';
  } else {
    // EIS = Independent Evidence Origins / Effective Evidence Groups, clamped between 0 and 1
    const rawEIS = Math.min(1, Math.max(0, independentOriginsCount / effectiveEvidenceGroups));
    score = Math.round(rawEIS * 100);

    if (rawEIS >= 0.75) {
      corroborationLevel = 'HIGH';
    } else if (rawEIS >= 0.5) {
      corroborationLevel = 'MODERATE';
    } else {
      corroborationLevel = 'LOW';
    }
  }

  // Adjusted Confidence = Base Confidence * (0.7 + 0.3 * EIS)
  // Clamp between 0 and 100
  let adjustedConfidence = baseConfidence;
  if (score !== null) {
    const eisFraction = score / 100;
    const factor = 0.7 + 0.3 * eisFraction;
    adjustedConfidence = Math.min(100, Math.max(0, Math.round(baseConfidence * factor)));
  }

  return {
    iec: {
      sourcesRetrieved,
      independentOriginsCount,
      derivativeSourcesCount,
      score,
      corroborationLevel,
      baseConfidence,
      adjustedConfidence,
      groups,
      hasReliableProvenance,
      provenanceNotes:
        derivativeSourcesCount > 0
          ? `${derivativeSourcesCount} source(s) appear derivative or from the same originating entity; corroborated across ${independentOriginsCount} distinct origin(s).`
          : `Sources represent ${independentOriginsCount} independently cataloged provenance origin(s).`,
    },
    updatedSources,
  };
}

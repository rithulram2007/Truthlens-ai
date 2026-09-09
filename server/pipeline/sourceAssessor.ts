import { SourceAssessment, SourceCategoryTier, SourceItem, SourceRelationship } from '../../src/types';

export function assessDomainTier(domainOrUrl: string): {
  tier: SourceCategoryTier;
  assessment: SourceAssessment;
  defaultWeight: number;
} {
  const clean = domainOrUrl.toLowerCase();

  // 1. Government / Official
  if (
    clean.includes('.gov') ||
    clean.includes('.mil') ||
    clean.includes('who.int') ||
    clean.includes('un.org') ||
    clean.includes('cdc.gov') ||
    clean.includes('fda.gov') ||
    clean.includes('nasa.gov') ||
    clean.includes('nih.gov') ||
    clean.includes('europa.eu')
  ) {
    return {
      tier: 'Government / Official',
      assessment: 'HIGH',
      defaultWeight: 0.95,
    };
  }

  // 2. Scientific / Academic
  if (
    clean.includes('.edu') ||
    clean.includes('.ac.uk') ||
    clean.includes('nature.com') ||
    clean.includes('science.org') ||
    clean.includes('ncbi.nlm.nih.gov') ||
    clean.includes('pubmed') ||
    clean.includes('thelancet.com') ||
    clean.includes('arxiv.org') ||
    clean.includes('cell.com') ||
    clean.includes('nejm.org') ||
    clean.includes('sciencedirect.com') ||
    clean.includes('pnas.org')
  ) {
    return {
      tier: 'Scientific / Academic',
      assessment: 'HIGH',
      defaultWeight: 0.92,
    };
  }

  // 3. Primary Sources
  if (
    clean.includes('sec.gov') ||
    clean.includes('courtlistener.com') ||
    clean.includes('justice.gov') ||
    clean.includes('congress.gov') ||
    clean.includes('data.gov')
  ) {
    return {
      tier: 'Primary Source',
      assessment: 'HIGH',
      defaultWeight: 0.9,
    };
  }

  // 4. Reputable News Organizations
  if (
    clean.includes('reuters.com') ||
    clean.includes('apnews.com') ||
    clean.includes('bbc.com') ||
    clean.includes('bbc.co.uk') ||
    clean.includes('afp.com') ||
    clean.includes('npr.org') ||
    clean.includes('theguardian.com') ||
    clean.includes('wsj.com') ||
    clean.includes('nytimes.com') ||
    clean.includes('washingtonpost.com') ||
    clean.includes('bloomberg.com') ||
    clean.includes('ft.com')
  ) {
    return {
      tier: 'Reputable News',
      assessment: 'HIGH',
      defaultWeight: 0.85,
    };
  }

  // 5. Established Organizations / Fact Checkers
  if (
    clean.includes('snopes.com') ||
    clean.includes('factcheck.org') ||
    clean.includes('politifact.com') ||
    clean.includes('pewresearch.org') ||
    clean.includes('brookings.edu') ||
    clean.includes('cfr.org') ||
    clean.includes('fullfact.org')
  ) {
    return {
      tier: 'Established Organization',
      assessment: 'HIGH',
      defaultWeight: 0.82,
    };
  }

  // General Media / Blogs
  if (
    clean.includes('medium.com') ||
    clean.includes('substack.com') ||
    clean.includes('wordpress.com') ||
    clean.includes('blogger.com')
  ) {
    return {
      tier: 'General Media / Blog',
      assessment: 'LOW',
      defaultWeight: 0.45,
    };
  }

  // Default web sources
  return {
    tier: 'General Media / Blog',
    assessment: 'MEDIUM',
    defaultWeight: 0.65,
  };
}

export function rankAndDeduplicateSources(sources: SourceItem[]): SourceItem[] {
  const seenUrls = new Set<string>();
  const uniqueSources: SourceItem[] = [];

  for (const s of sources) {
    const normUrl = s.url.toLowerCase().replace(/\/+$/, '');
    if (!seenUrls.has(normUrl)) {
      seenUrls.add(normUrl);
      uniqueSources.push(s);
    }
  }

  // Sort by assessment tier weight and relevance
  return uniqueSources.sort((a, b) => {
    const tierOrder: Record<SourceCategoryTier, number> = {
      'Government / Official': 7,
      'Scientific / Academic': 6,
      'Primary Source': 5,
      'Reputable News': 4,
      'Established Organization': 3,
      'General Media / Blog': 2,
      'Unverified': 1,
    };

    const diffTier = tierOrder[b.tier] - tierOrder[a.tier];
    if (diffTier !== 0) return diffTier;
    return b.relevance - a.relevance;
  });
}

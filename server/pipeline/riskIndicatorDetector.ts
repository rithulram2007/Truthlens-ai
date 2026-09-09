import { RiskIndicator, RiskIndicatorType } from '../../src/types';

export function detectRiskIndicatorsInText(text: string): RiskIndicator[] {
  const indicators: RiskIndicator[] = [];
  const lower = text.toLowerCase();

  // 1. Sensational language
  const sensationalTerms = [
    'shocking',
    'bombshell',
    'mind-blowing',
    'you won\'t believe',
    'explosive',
    'devastating secret',
    'unbelievable',
    'insane',
    'miracle cure',
  ];
  for (const term of sensationalTerms) {
    if (lower.includes(term)) {
      indicators.push({
        id: `sensational-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'sensational_language',
        title: 'Sensational Language Detected',
        description: `Uses sensational vocabulary ("${term}") aimed at triggering viral curiosity rather than objective reporting.`,
        excerpt: term,
        severity: 'medium',
      });
      break;
    }
  }

  // 2. Emotional wording
  const emotionalTerms = [
    'outrageous',
    'horrifying',
    'terrifying',
    'furious',
    'evil',
    'disgusting',
    'monstrous',
    'heroic',
    'traitorous',
  ];
  for (const term of emotionalTerms) {
    if (lower.includes(term)) {
      indicators.push({
        id: `emotional-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'emotional_wording',
        title: 'Emotionally Loaded Vocabulary',
        description: `Contains affectively charged phrasing ("${term}") which may skew impartial assessment.`,
        excerpt: term,
        severity: 'medium',
      });
      break;
    }
  }

  // 3. Absolute claims
  const absoluteTerms = [
    'always',
    'never',
    'everyone knows',
    'every single',
    '100% of',
    'zero chance',
    'undeniably true',
    'impossible to disprove',
    'proven beyond all doubt',
  ];
  for (const term of absoluteTerms) {
    if (new RegExp(`\\b${term}\\b`, 'i').test(text)) {
      indicators.push({
        id: `absolute-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'absolute_claims',
        title: 'Absolute Claim / Categorical Generalization',
        description: `Employs totalizing absolutes ("${term}"), disregarding nuances or probability distributions.`,
        excerpt: term,
        severity: 'low',
      });
      break;
    }
  }

  // 4. Missing attribution
  const missingAttributionTerms = [
    'experts say',
    'scientists claim',
    'studies show',
    'sources say',
    'it is reported',
    'insiders confirm',
    'doctors agree',
    'officials admit',
  ];
  for (const term of missingAttributionTerms) {
    if (lower.includes(term)) {
      // Check if there is a specific name or citation nearby
      indicators.push({
        id: `attribution-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'missing_attribution',
        title: 'Vague Anonymous Attribution',
        description: `References authority ambiguously ("${term}") without naming specific researchers, institutions, or publications.`,
        excerpt: term,
        severity: 'medium',
      });
      break;
    }
  }

  // 5. Exaggerated certainty
  const exaggeratedCertaintyTerms = [
    'definitive proof',
    'smoking gun',
    'completely settles',
    'cannot be questioned',
    'settled fact',
  ];
  for (const term of exaggeratedCertaintyTerms) {
    if (lower.includes(term)) {
      indicators.push({
        id: `certainty-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'exaggerated_certainty',
        title: 'Exaggerated Epistemic Certainty',
        description: `Claims indisputable finality ("${term}") on subjects that may still be subject to scientific or empirical scrutiny.`,
        excerpt: term,
        severity: 'medium',
      });
      break;
    }
  }

  // 6. Unsupported statistics
  const statRegex = /\b(\d+%\s*(increase|decrease|jump|surge|drop)|\b\d+ (million|billion|trillion)\b)/i;
  const statMatch = text.match(statRegex);
  if (statMatch && !lower.includes('according to') && !lower.includes('data from') && !lower.includes('published in')) {
    indicators.push({
      id: `stat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'unsupported_statistics',
      title: 'Statistical Assertion Without Source Citation',
      description: `Contains numeric metrics ("${statMatch[0]}") without immediate citation of the data source or methodology.`,
      excerpt: statMatch[0],
      severity: 'low',
    });
  }

  return indicators;
}

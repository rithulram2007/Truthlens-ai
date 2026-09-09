import { VerificationResult } from '../types';

export const SEED_VERIFICATION_RESULT: VerificationResult = {
  id: 'dossier-great-wall-benchmark',
  timestamp: '2025-05-14T10:30:00.000Z',
  inputType: 'claim',
  rawInput:
    'The Great Wall of China is the only man-made structure visible from the Moon with the naked human eye.',
  claimsAnalyzedCount: 1,
  sourcesAnalyzedCount: 3,
  overallVerdict: 'CONTRADICTED',
  overallConfidence: 96,
  counts: {
    supported: 0,
    contradicted: 1,
    insufficient: 0,
    conflicting: 0,
  },
  claims: [
    {
      id: 'claim-seed-1',
      claimText:
        'The Great Wall of China is the only man-made structure visible from the Moon with the naked human eye.',
      category: 'Science',
      statementType: 'factual',
      isVerifiable: true,
      verdict: 'CONTRADICTED',
      confidence: 96,
      reasoning:
        'Astronauts from Apollo lunar missions and scientific agencies (NASA, ESA) have confirmed that no human-made structures are visible to the unaided human eye from lunar orbit (~384,400 km away). Even from Low Earth Orbit (~400 km), the Great Wall is barely discernible without high-magnification optical instruments due to its optical width and blending with surrounding soil.',
      evidenceSummary:
        'Decisive refutation by Apollo astronauts, NASA Earth Observatory publications, and ESA orbital photography.',
      supportingEvidence: [],
      contradictingEvidence: [
        'NASA Earth Observatory: "The Great Wall is frequently cited as the only human-made object visible from space, but astronauts cannot see it from the Moon without binoculars or telescopic lenses."',
        'Apollo 12 astronaut Alan Bean: "The only thing you can see from the Moon is a beautiful sphere, mostly white, some blue and patches of yellow, and every once in a while some green vegetation. No man-made object is visible."',
        'European Space Agency (ESA): "From low orbit (Proba satellite), high-resolution sensors can detect segments under ideal sun angles, but lunar naked-eye visibility is an optical impossibility."',
      ],
      conflicts: [],
      sources: [
        {
          id: 'src-seed-1',
          sourceName: 'NASA Earth Observatory',
          domain: 'earthobservatory.nasa.gov',
          url: 'https://earthobservatory.nasa.gov',
          title: 'NASA Fact Sheet: Visible Human Structures from Space',
          tier: 'Government / Official',
          assessment: 'HIGH',
          relationshipToClaim: 'CONTRADICTS',
          relevance: 98,
          publicationDate: '2020-04-15',
          excerpt:
            'Astronauts confirm that human-made structures are invisible from lunar distance to the naked human eye.',
        },
        {
          id: 'src-seed-2',
          sourceName: 'European Space Agency',
          domain: 'esa.int',
          url: 'https://www.esa.int',
          title: 'ESA Space in Images: The Great Wall from Space Orbit',
          tier: 'Government / Official',
          assessment: 'HIGH',
          relationshipToClaim: 'CONTRADICTS',
          relevance: 95,
          publicationDate: '2021-08-11',
          excerpt:
            'Optical resolution limits prevent the human eye from resolving structures only a few meters wide at planetary distances.',
        },
        {
          id: 'src-seed-3',
          sourceName: 'Scientific American',
          domain: 'scientificamerican.com',
          url: 'https://www.scientificamerican.com',
          title: 'Is China’s Great Wall Really Visible from Space?',
          tier: 'Scientific / Academic',
          assessment: 'HIGH',
          relationshipToClaim: 'CONTRADICTS',
          relevance: 91,
          publicationDate: '2019-11-20',
          excerpt:
            'A myth predating the space age was popularized in 1932 by Robert Ripley, long before human spaceflight.',
        },
      ],
      riskIndicators: [
        {
          id: 'risk-claim-1',
          type: 'absolute_claims',
          title: 'Categorical Superlative',
          description: 'Phrase "the only man-made structure visible"',
          severity: 'medium',
          excerpt: 'the only man-made structure',
        },
      ],
      uncertainty:
        'Zero material epistemic uncertainty. The physical angular resolution of the human eye (1 arcminute) mathematically precludes detecting a 10-meter wide object from 384,000 km.',
    },
  ],
  aggregatedSources: [
    {
      id: 'src-seed-1',
      sourceName: 'NASA Earth Observatory',
      domain: 'earthobservatory.nasa.gov',
      url: 'https://earthobservatory.nasa.gov',
      title: 'NASA Fact Sheet: Visible Human Structures from Space',
      tier: 'Government / Official',
      assessment: 'HIGH',
      relationshipToClaim: 'CONTRADICTS',
      relevance: 98,
      publicationDate: '2020-04-15',
      excerpt:
        'Astronauts confirm that human-made structures are invisible from lunar distance to the naked human eye.',
    },
    {
      id: 'src-seed-2',
      sourceName: 'European Space Agency',
      domain: 'esa.int',
      url: 'https://www.esa.int',
      title: 'ESA Space in Images: The Great Wall from Space Orbit',
      tier: 'Government / Official',
      assessment: 'HIGH',
      relationshipToClaim: 'CONTRADICTS',
      relevance: 95,
      publicationDate: '2021-08-11',
      excerpt:
        'Optical resolution limits prevent the human eye from resolving structures only a few meters wide at planetary distances.',
    },
    {
      id: 'src-seed-3',
      sourceName: 'Scientific American',
      domain: 'scientificamerican.com',
      url: 'https://www.scientificamerican.com',
      title: 'Is China’s Great Wall Really Visible from Space?',
      tier: 'Scientific / Academic',
      assessment: 'HIGH',
      relationshipToClaim: 'CONTRADICTS',
      relevance: 91,
      publicationDate: '2019-11-20',
      excerpt:
        'A myth predating the space age was popularized in 1932 by Robert Ripley, long before human spaceflight.',
    },
  ],
  aggregatedRiskIndicators: [
    {
      id: 'risk-seed-1',
      type: 'absolute_claims',
      title: 'Absolute Categorical Superlative',
      description: 'Used categorical phrase "the only man-made structure visible".',
      severity: 'medium',
      excerpt: 'the only man-made structure',
    },
    {
      id: 'risk-seed-2',
      type: 'exaggerated_certainty',
      title: 'Common Legend Framing',
      description: 'Stated popular folklore without referencing optical physics or observational constraints.',
      severity: 'low',
    },
  ],
  hasEvidenceConflict: false,
  pipelineSummary: {
    inputDetected: 'claim',
    claimsExtracted: 1,
    sourcesQueried: 3,
    conflictsFlagged: 0,
    avgConfidence: 96,
  },
  timelineEvents: [
    {
      date: '1938',
      title: 'Richard Halliburton’s "Second Book of Marvels" popularizes the lunar visibility myth',
      source: 'Historical Literature',
      relationship: 'NEUTRAL',
    },
    {
      date: '1969-07-20',
      title: 'Apollo 11 Astronauts report zero visible individual human structures from lunar trajectory',
      source: 'NASA Apollo Records',
      relationship: 'CONTRADICTS',
    },
    {
      date: '2004-05-19',
      title: 'Chinese Astronaut Yang Liwei confirms the Great Wall was not visible from space orbit',
      source: 'Xinhua / Global News',
      relationship: 'CONTRADICTS',
    },
    {
      date: '2020-04-15',
      title: 'NASA Earth Observatory formal clarification published',
      source: 'NASA Earth Observatory',
      relationship: 'CONTRADICTS',
    },
  ],
};

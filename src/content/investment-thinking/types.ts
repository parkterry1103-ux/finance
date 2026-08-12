export type InvestmentFamiliarity = 'high' | 'medium' | 'low';

export type InvestmentThinkingLabel = 'fact' | 'interpretation' | 'hypothesis';

export type InvestmentRule = {
  id: `RULE-${string}`;
  version: string;
  title: string;
  principle: string;
  status: 'current';
  editable: true;
};

export type InvestmentHypothesis = {
  id: string;
  statement: string;
  scopeNote: string;
  status: 'testing';
};

export type InvestmentCaseSourceRef = {
  sourceId: string;
  claimScope: string;
};

export type InvestmentCaseSubject = {
  rank: number;
  name: string;
  ticker?: string;
  familiarity: InvestmentFamiliarity;
  currentView: string;
  reason: string;
  caution: string;
  sourceIds: string[];
};

export type InvestmentCase = {
  id: string;
  slug: string;
  title: string;
  eventDate: string;
  publishedAt: string;
  market: 'KR' | 'US' | 'GLOBAL';
  tags: string[];
  status: 'published';

  eventSummary: string;
  eventSourceStatus: 'editorial-input';
  whyICared: string;
  firstThought: string;
  familiarityNote: string;
  possibleBias: string;

  hypothesis: string;
  impactFlow: string[];
  counterFlow: string[];
  optionalLens?: string;

  subjects: InvestmentCaseSubject[];
  falsificationSignals: string[];
  ruleIds: InvestmentRule['id'][];
  hypothesisIds: string[];
  sources: InvestmentCaseSourceRef[];
};

export type InvestmentCaseSummary = Pick<InvestmentCase, 'id' | 'slug' | 'title' | 'eventDate' | 'market' | 'tags'> & {
  eyebrow: string;
  summary: string;
  path: string;
};

export type InvestmentCaseStep = 0 | 1 | 2;

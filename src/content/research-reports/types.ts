import type { SensitivityMatrix, ValuationModelInput, ValuationModelResult } from '../../domain/valuation/index.js';
export type { SensitivityMatrix } from '../../domain/valuation/index.js';

export type ResearchEvidenceType = 'fact' | 'calculation' | 'interpretation';

export type ResearchSource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  publishedAt?: string;
  periodEnd?: string;
  documentType?: string;
  accessionNumber?: string;
  xbrlConcepts?: string[];
  metricIds?: string[];
  contextIds?: string[];
  note?: string;
};

export type ResearchEvidence = {
  id: string;
  type: ResearchEvidenceType;
  statement: string;
  sourceIds: string[];
  dependsOnEvidenceIds?: string[];
  metricIds?: string[];
  asOf?: string;
  formula?: string;
};

export type ResearchClaim = {
  title: string;
  body: string;
  evidenceIds: string[];
};

export type ResearchGlossaryItem = {
  term: string;
  english: string;
  definition: string;
  easyExplanation: string;
  relevance: string;
};

export type ResearchChartPoint = {
  label: string;
  value: number;
  sourceIds: string[];
};

export type ResearchChart = {
  id: string;
  title: string;
  summary: string;
  unit: string;
  series: Array<{ label: string; points: ResearchChartPoint[] }>;
};

export type ResearchScenario = {
  name: 'conservative' | 'base' | 'optimistic';
  label: string;
  input: ValuationModelInput;
  result: ValuationModelResult;
  stableGrowthRate: number;
};

export type ResearchReportSnapshot = {
  reportId: string;
  version: string;
  publishedAt: string;
  updatedAt?: string;
  newsCutoffAt: string;
  marketDataAsOf: string;
  priceAsOf: string;
  financialDataAsOf: string;
  valuationAsOf: string;
  benchmarkAsOf: string;
};

export type MaterialNewsEvent = {
  id: string;
  companySlug: 'nvidia' | 'meta';
  title: string;
  publishedAt: string;
  sourceId: string;
  sourceType: 'company' | 'filing' | 'industry' | 'macro' | 'policy' | 'regulation';
  category: 'companySpecific' | 'industry' | 'marketWide' | 'macro' | 'geopolitical' | 'regulatory';
  materiality: 'medium' | 'high';
  confidence: 'confirmed' | 'developing';
  affectedAssumptionIds: string[];
  affectedMetricIds: string[];
  summary: string;
  whyItMatters: string;
  transmissionPath: string[];
  durability: 'temporary' | 'uncertain' | 'structural';
  thesisImpact: 'maintain' | 'partiallyRevise' | 'reassess';
  watchItems: string[];
};

export type ResearchJudgment = {
  label: string;
  status: string;
  reason: string;
  changeCondition: string;
  evidenceIds: string[];
};

export type ResearchMoatFactor = {
  source: string;
  evidence: string;
  earningsPath: string;
  weakeningCondition: string;
  nextMetric: string;
  evidenceIds: string[];
};

export type ResearchFinancialMetric = {
  label: string;
  value: number;
  unit: 'USD million' | 'million shares';
  meaning: string;
  sourceIds: string[];
  metricIds: string[];
};

export type ResearchCycleRole = {
  role: string;
  currentPosition: string;
  growthConnection: string;
  upcycleEffect: string;
  downcycleEffect: string;
  substitutionRisk: string;
  durableAdvantage: string;
  changeCondition: string;
  evidenceIds: string[];
};

export type ResearchValuationMethod = {
  name: string;
  whyThisModel: string;
  easyExplanation: string;
  unusedMethods: Array<{ name: string; reason: string }>;
};

export type ResearchMarketContext = {
  marketWide: string;
  companySpecific: string;
  attributionCaution: string;
  evidenceIds: string[];
};

export type ResearchNewsValuationImpact = {
  eventId: string;
  affectedAssumption: string;
  previousAssumption: string;
  reviewRange: string;
  valuePath: string[];
  modelChange: string;
};

export type ResearchBenchmarkComparison = {
  label: string;
  companyValue: number;
  benchmarkValue: number;
  unit: 'percent' | 'multiple';
  absoluteDifference: number;
  relativeDifference: number;
};

export type ResearchReportModel = {
  slug: 'nvidia' | 'meta';
  companyName: string;
  englishName: string;
  ticker: string;
  industry: string;
  reportTitle: string;
  snapshot: ResearchReportSnapshot;
  reportDate: string;
  financialsAsOf: string;
  priceAsOf: string;
  valuationDate: string;
  dilutedSharesAsOf: string;
  capitalStructureAsOf: string;
  riskFreeAsOf: string;
  erpAsOf: string;
  benchmarkAsOf: string;
  currentPrice: number;
  conclusion: string;
  watchStatement: string;
  judgments: ResearchJudgment[];
  materialNewsEvents: MaterialNewsEvent[];
  marketContext: ResearchMarketContext;
  moat: ResearchMoatFactor[];
  financialHealth: {
    status: string;
    explanation: string;
    downturnResponse: string;
    changeCondition: string;
    metrics: ResearchFinancialMetric[];
  };
  cycleRole: ResearchCycleRole;
  valuationMethod: ResearchValuationMethod;
  modelGapRate: number;
  modelGapLabel: string;
  benchmark: {
    name: string;
    sampleSize: number;
    isDirectPeerMedian: false;
    explanation: string;
    comparisons: ResearchBenchmarkComparison[];
  };
  newsValuationImpacts: ResearchNewsValuationImpact[];
  excludedNewsSummary: string;
  executiveSummary: {
    strengths: ResearchClaim[];
    risks: ResearchClaim[];
    nextChecks: ResearchClaim[];
  };
  sections: {
    business: ResearchClaim[];
    earnings: ResearchClaim[];
    financial: ResearchClaim[];
    industry: ResearchClaim[];
    outlook: ResearchClaim[];
  };
  charts: ResearchChart[];
  glossary: ResearchGlossaryItem[];
  evidence: ResearchEvidence[];
  sources: ResearchSource[];
  baseInput: ValuationModelInput;
  baseResult: ValuationModelResult;
  scenarios: ResearchScenario[];
  waccGrowthSensitivity: SensitivityMatrix;
  driverSensitivity: SensitivityMatrix;
  reverseDcf: {
    solvedRevenueCagr: number;
    targetPrice: number;
    relativeError: number;
    converged: boolean;
  };
  roicFade: {
    label: string;
    terminalRoic: number;
    estimatedValuePerShare: number;
    differenceFromBase: number;
  };
  warnings: string[];
  limitations: string[];
};

export type ResearchReportCompanyConfig = {
  slug: 'nvidia' | 'meta';
  companyName: string;
  englishName: string;
  ticker: string;
  industry: string;
  reportTitle: string;
  snapshotVersion: string;
  newsCutoffAt: string;
  conclusion: string;
  watchStatement: string;
  judgments: ResearchJudgment[];
  materialNewsEvents: MaterialNewsEvent[];
  marketContext: ResearchMarketContext;
  moat: ResearchMoatFactor[];
  financialHealth: Omit<ResearchReportModel['financialHealth'], 'metrics'>;
  cycleRole: ResearchCycleRole;
  valuationMethod: ResearchValuationMethod;
  newsValuationImpacts: ResearchNewsValuationImpact[];
  excludedNewsSummary: string;
  executiveSummary: ResearchReportModel['executiveSummary'];
  business: ResearchClaim[];
  earnings: ResearchClaim[];
  financial: ResearchClaim[];
  industryClaims: ResearchClaim[];
  outlook: ResearchClaim[];
  glossary: ResearchGlossaryItem[];
  officialSources: ResearchSource[];
  factEvidence: ResearchEvidence[];
};

export type ResearchReportArtifactSet = {
  assumptions: {
    valuationDate: string;
    price: { value: number; currency: string; asOf: string; source: string };
    companySpecific: {
      financialsAsOf: string;
      dilutedSharesAsOf: string;
      capitalStructureAsOf: string;
      riskFreeAsOf: string;
      benchmarkId: string;
    };
    baseInput: ValuationModelInput;
    scenarioInputs: Array<Pick<ResearchScenario, 'name'> & Pick<ValuationModelInput, 'forecastAssumptions' | 'discountRateAssumptions' | 'terminalAssumptions'>>;
    limitations: string[];
  };
  valuation: { currentPrice: number; result: ValuationModelResult };
  reverse: {
    currentPrice: number;
    priceAsOf: string;
    result: { solvedValue: number; relativeError: number; converged: boolean };
  };
  sources: Array<{
    sourceId: string;
    accessionOrReceiptNumber: string;
    filingType: string;
    filedAt: string;
    periodEnd: string;
    taxonomyConcept: string;
    url: string;
  }>;
};

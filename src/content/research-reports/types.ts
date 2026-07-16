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
  result: ValuationModelResult;
  stableGrowthRate: number;
};

export type ResearchReportModel = {
  slug: 'nvidia' | 'meta';
  companyName: string;
  englishName: string;
  ticker: string;
  industry: string;
  reportDate: string;
  financialsAsOf: string;
  priceAsOf: string;
  valuationDate: string;
  capitalStructureAsOf: string;
  currentPrice: number;
  conclusion: string;
  watchStatement: string;
  sections: {
    business: ResearchClaim[];
    earnings: ResearchClaim[];
    financial: ResearchClaim[];
    industry: ResearchClaim[];
    outlook: ResearchClaim[];
  };
  charts: ResearchChart[];
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
  conclusion: string;
  watchStatement: string;
  business: ResearchClaim[];
  earnings: ResearchClaim[];
  financial: ResearchClaim[];
  industryClaims: ResearchClaim[];
  outlook: ResearchClaim[];
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

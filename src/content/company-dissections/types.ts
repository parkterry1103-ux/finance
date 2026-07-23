import type { CompanyBrief } from '../company-briefs/types.js';
import type { CompanyResearchProfileViewModel, DashboardMetric } from '../company-profiles/types.js';

export type CompanyDissectionAxisKey = 'growth' | 'profitability' | 'moat' | 'financialHealth' | 'valuation';
export type CompanyDissectionCoreKey = Exclude<CompanyDissectionAxisKey, 'moat'>;
export type CompanyDissectionState = 'low' | 'belowAverage' | 'middle' | 'aboveAverage' | 'high' | 'insufficientData';
export type CompanyComparisonKind = 'ownHistory' | 'peerMedian' | 'segmentPeer' | 'industry' | 'officialEvidence';
export type CompanyResearchSurface = 'financials' | 'valuation' | 'report' | 'stockDissection';

export type IndustryClassificationSource = {
  provider: string;
  sector: string;
  industry: string;
  url: string;
  retrievedAt: string;
};
export type CompanyIndustryProfile = {
  primaryIndustry: string;
  classificationSources: IndustryClassificationSource[];
  businessSegments: Array<{
    id: string;
    label: string;
    revenueShareAvailable: boolean;
  }>;
  classificationNote?: string;
};

export type CompanyDissectionAxisConfig = {
  key: CompanyDissectionAxisKey;
  state: CompanyDissectionState;
  position: 1 | 2 | 3 | 4 | 5 | null;
  statusLabel: string;
  evidenceMetricId?: string;
  evidenceText?: string;
  comparison: {
    kind: CompanyComparisonKind;
    label: string;
  };
  interpretation: string;
  nextCheck: string;
  sourceIds: string[];
  detailSurface?: CompanyResearchSurface;
  moatEvidence?: string[];
  weakeningRisks?: string[];
};

export type CompanyDissectionConfig = {
  companySlug: string;
  industryProfile: CompanyIndustryProfile;
  axes: Record<CompanyDissectionAxisKey, CompanyDissectionAxisConfig>;
};

export type CompanyDissectionAxis = CompanyDissectionAxisConfig & {
  label: string;
  metric: DashboardMetric | null;
  evidenceValue: string;
  period: string;
};

export type CompanyDissectionCoreCard = {
  key: CompanyDissectionCoreKey;
  label: string;
  statusLabel: string;
  value: string;
  comparisonLabel: string;
  period: string;
  state: CompanyDissectionState;
};

export type CompanyDissectionModel = {
  companySlug: string;
  industryProfile: CompanyIndustryProfile;
  axes: Record<CompanyDissectionAxisKey, CompanyDissectionAxis>;
  coreCards: CompanyDissectionCoreCard[];
  watchItems: Array<{
    title: string;
    why: string;
    timing: string;
  }>;
};

export type CompanyDissectionBuildInput = {
  config: CompanyDissectionConfig;
  brief: CompanyBrief;
  viewModel: CompanyResearchProfileViewModel;
};

import type { CompanyResearchProfileViewModel } from '../company-profiles/types.js';

export type CompanyBriefQuestionKey = 'revenueEngine' | 'recentChange' | 'whyItMatters' | 'keyRisk' | 'watchNext';

export type BriefAnswer = {
  title?: string;
  summary: string;
  sourceIds: string[];
  asOf?: string;
};

export type CompanyBriefMetricComparison = {
  label: string;
  referenceValue?: number;
  formattedReferenceValue?: string;
  difference?: number;
  formattedDifference?: string;
  differenceUnit: 'percent' | 'percentagePoint' | 'absolute' | 'multiple';
  referencePeriod?: string;
};

export type CompanyBriefMetricSelection = {
  metricId: string;
  comparison?: CompanyBriefMetricComparison;
};

export type CompanyBriefConfig = {
  companySlug: string;
  asOf: string;
  oneLineBusiness: string;
  questions: Record<CompanyBriefQuestionKey, BriefAnswer>;
  keyMetricSelections: CompanyBriefMetricSelection[];
  relatedEditorialIds: string[];
  reportSlug?: 'nvidia' | 'meta';
};

export type CompanyBriefMetric = {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  unit: string;
  period: string;
  comparison?: CompanyBriefMetricComparison;
  interpretation: string;
  sourceId: string;
};

export type CompanyBrief = {
  companySlug: string;
  asOf: string;
  oneLineBusiness: string;
  questions: Record<CompanyBriefQuestionKey, BriefAnswer>;
  keyMetrics: CompanyBriefMetric[];
  relatedEditorialIds: string[];
  reportSlug?: 'nvidia' | 'meta';
};

export type CompanyBriefBuildInput = Pick<CompanyResearchProfileViewModel, 'profile' | 'dashboard'>;

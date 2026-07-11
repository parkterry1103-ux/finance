export type ReportCategory =
  | 'macro'
  | 'semiconductors-ai'
  | 'power-data-centers'
  | 'energy-commodities'
  | 'construction-infrastructure';

export type ReportAccess =
  | 'public-full'
  | 'public-summary'
  | 'registration-required'
  | 'restricted';

export type ReportSourceType =
  | 'public-institution'
  | 'central-bank'
  | 'industry-organization'
  | 'company-ir';

export type ReportMetricKind = 'actual' | 'forecast' | 'scope';

export interface ReportMetric {
  label: string;
  value: string;
  context: string;
  kind: ReportMetricKind;
  asOf?: string;
}

export interface IndustryReport {
  id: string;
  slug: string;
  title: string;
  titleKo: string;
  publisher: string;
  publishedAt: string;
  category: ReportCategory;
  sourceType: ReportSourceType;
  access: ReportAccess;
  summary: [string, string, string];
  keyMetrics: ReportMetric[];
  sourceRefs: string[];
  marketMapIds: string[];
  companyIds: string[];
  pickIds: string[];
  bottleneckIds?: string[];
  tags: string[];
  howToUse: string[];
  featured?: boolean;
}

export type ReportPeriodFilter = 'all' | 'week' | 'month';
export type ReportSourceFilter = 'all' | 'official' | 'company';

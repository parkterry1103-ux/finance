import type { MarketPrice, StockAutopsyPick } from '../../data.js';
import type { SupplyChainBottleneck } from '../bottlenecks/types.js';
import type { CompanyEvent } from '../company-events/types.js';
import type { CompanyProfileRelatedCompany } from '../company-profile-relations/types.js';
import type { DemandSupplyEntry } from '../demand-supply/types.js';
import type { IndustryFlowEntry, IndustryFlowStep } from '../industry-flows/types.js';
import type { IndustryReport, ReportMetric } from '../reports/types.js';
import type { ContentSource } from '../sources/types.js';

export type CompanyProfileEntry = {
  id: string;
  companyId: string;
  slug: string;
  order: number;
  englishName: string;
  stockCode?: string;
  exchange: string;
  industry: string;
  searchDescription: string;
  aliases: string[];
  beginnerSummary: string;
  businessDescription: string;
  primaryRole: string;
  keyQuestions: string[];
  caution: string;
  sourceRefs: string[];
  reviewedAt: string;
};

export type CanonicalCompanyProfileIdentity = {
  id: string;
  name: string;
  ticker: string;
  country: 'KR' | 'US';
  countryLabel: '한국' | '미국';
};

export type CompanySearchRecord = {
  company: CanonicalCompanyProfileIdentity;
  profile: CompanyProfileEntry;
  searchableTerms: string[];
};

export type CompanyIndustryFlowConnection = {
  flow: IndustryFlowEntry;
  currentStep: IndustryFlowStep;
};

export type CompanyRelationSummary = {
  relation: CompanyProfileRelatedCompany;
  company: CanonicalCompanyProfileIdentity;
  companyPath: string;
};

export type VerifiedCompanyMetric = ReportMetric & {
  reportId: string;
  reportTitle: string;
  sourceRef: string;
};

export type DashboardPeriodType = 'annual' | 'quarterly' | 'ttm' | 'pointInTime';

export type DashboardQualityStatus = 'ok' | 'stale' | 'missing' | 'restated' | 'inconsistent';

export type DashboardMetric = {
  id: string;
  label: string;
  shortLabel?: string;
  value: number | null;
  formattedValue: string | null;
  unit: string;
  currency?: 'KRW' | 'USD';
  period: string;
  periodType: DashboardPeriodType;
  comparison?: {
    label: string;
    value: number | null;
    formattedValue: string | null;
    direction: 'up' | 'down' | 'flat' | 'unknown';
  };
  description: string;
  sourceIds: string[];
  updatedAt: string;
  qualityStatus: DashboardQualityStatus;
};

export type CompanyAssessmentDimension =
  | 'growth'
  | 'profitability'
  | 'cashFlow'
  | 'financialHealth'
  | 'valuation';

export type CompanyAssessmentState =
  | 'improving'
  | 'healthy'
  | 'stable'
  | 'slowing'
  | 'stretched'
  | 'needsReview'
  | 'insufficientData';

export type CompanyAssessment = {
  dimension: CompanyAssessmentDimension;
  label: string;
  state: CompanyAssessmentState;
  rationale: string;
  evidenceMetricIds: string[];
  sourceIds: string[];
};

export type DashboardChart = {
  id: string;
  title: string;
  description: string;
  metricIds: string[];
  unit: string;
  currency?: 'KRW' | 'USD';
  period: string;
  accessibleSummary: string;
};

export type ImportantCompanyChange = {
  id: string;
  title: string;
  eventDate: string;
  stageLabel: string;
  whatHappened: string;
  whyItMatters: string;
  nextCheckpoints: string[];
  sourceIds: string[];
};

export type CompanyMacroVariable = {
  id: string;
  label: string;
  currentDirection: string;
  trendLabel: string;
  asOf: string;
  impactPath: string[];
  easyExplanation: string;
  nextCheck: string;
  sourceIds: string[];
};

export type CompanyDashboardDataQuality = {
  missingAreas: string[];
  staleMetricIds: string[];
  hasRestatedData: boolean;
  hasInconsistentData: boolean;
};

export type CompanyDashboardModel = {
  asOfDate: string | null;
  summary: string[];
  assessments: CompanyAssessment[];
  metrics: DashboardMetric[];
  charts: DashboardChart[];
  importantChanges: ImportantCompanyChange[];
  macroVariables: CompanyMacroVariable[];
  sources: ContentSource[];
  dataQuality: CompanyDashboardDataQuality;
};

export type CompanyDashboardConfig = {
  companySlug: string;
  metricIds: string[];
  chartIds: string[];
  macroVariableIds: string[];
};

export type CompanyResearchProfileViewModel = {
  company: CanonicalCompanyProfileIdentity;
  profile: CompanyProfileEntry;
  products: string[];
  price?: MarketPrice;
  industryFlows: CompanyIndustryFlowConnection[];
  companyRelations: CompanyRelationSummary[];
  companyEvents: CompanyEvent[];
  bottlenecks: SupplyChainBottleneck[];
  demandSupply: DemandSupplyEntry[];
  reports: IndustryReport[];
  picks: StockAutopsyPick[];
  verifiedMetrics: VerifiedCompanyMetric[];
  sources: ContentSource[];
  dashboard: CompanyDashboardModel;
};

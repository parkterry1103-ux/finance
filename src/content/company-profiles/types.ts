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
};

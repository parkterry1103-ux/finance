export type MarketMapConnectionLevel =
  | 'complete'
  | 'partial'
  | 'pick'
  | 'reference'
  | 'planned'
  | 'private';

export type MarketMapRegion = 'us-focused' | 'kr-focused' | 'global';

export type MarketMapCategory =
  | 'semiconductor-ai'
  | 'power-datacenter'
  | 'construction-infrastructure'
  | 'industrial-facilities';

export type MarketMapStatus = 'available' | 'planned';

export type MarketMapIndustryNodeKind =
  | 'demand'
  | 'requirement'
  | 'supplier'
  | 'use'
  | 'verification';

export type MarketMapNodeKind = MarketMapIndustryNodeKind | 'company';

export type MarketMapIndustryStage = {
  id: string;
  kind: MarketMapIndustryNodeKind;
  question: string;
  title: string;
  description: string;
  items: string[];
  representativeCompanyIds: string[];
};

export type MarketMapCompanyRelationKind = 'demand' | 'supply' | 'infrastructure' | 'reference';

export type MarketMapCompanyRelation = {
  id: string;
  sourceCompanyId: string;
  targetCompanyId: string;
  label: string;
  kind: MarketMapCompanyRelationKind;
  description: string;
  confidence: 'official' | 'industry';
};

export type MarketMapCompanyNetwork = {
  companyIds: string[];
  relationSource: 'existing' | 'definition';
  relations: MarketMapCompanyRelation[];
};

export type MarketMapDefinition = {
  id: string;
  route?: string;
  region: MarketMapRegion;
  category: MarketMapCategory;
  status: MarketMapStatus;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  supportingNote?: string;
  scopeLabel: string;
  industryStages?: MarketMapIndustryStage[];
  companyNetwork?: MarketMapCompanyNetwork;
};

export type MarketMapGraphRegion = 'all' | 'us' | 'kr' | 'other';
export type MarketMapGraphViewMode = 'selected' | 'fit';
export type MarketMapDetailViewMode = 'industry' | 'companies';

export type MarketMapDetailActionKind = 'analysis' | 'financials' | 'pick' | 'flow';

export type MarketMapDetailAction = {
  id: string;
  kind: MarketMapDetailActionKind;
  label: string;
};

export type MarketMapDetailCompany = {
  id: string;
  name: string;
  ticker?: string;
  countryLabel?: string;
  mark?: string;
  role: string;
  statusLabel: string;
  connectionLevel: MarketMapConnectionLevel;
  description: string;
  reason: string;
  note?: string;
  actions: MarketMapDetailAction[];
  hasPrice: boolean;
};

export type MarketMapFlowStep = {
  id: string;
  kind: MarketMapIndustryNodeKind;
  question: string;
  title: string;
  description: string;
  roleTag: string;
  items: string[];
  representativeCompanies: string[];
  isCurrent?: boolean;
};

export type MarketMapDetailViewModel = {
  id: string;
  region: MarketMapRegion;
  category: MarketMapCategory;
  eyebrow: string;
  title: string;
  summary: string;
  heroNote: string;
  selectedCompany: MarketMapDetailCompany;
  relatedCompanies: MarketMapDetailCompany[];
  flowTitle: string;
  flowSteps: MarketMapFlowStep[];
  advancedDescription: string;
  caution: string;
  policyCaution?: string;
};

export type MarketMapDetailViewModelInput = Omit<MarketMapDetailViewModel, 'selectedCompany' | 'relatedCompanies' | 'flowSteps'> & {
  selectedCompany: MarketMapDetailCompany;
  relatedCompanies: MarketMapDetailCompany[];
  flowSteps: MarketMapFlowStep[];
};

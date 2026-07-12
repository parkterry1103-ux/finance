export type CompanyEventGroup =
  | 'earnings-guidance'
  | 'orders-contracts'
  | 'capex-capacity'
  | 'financing-structure';

export type CompanyEventType =
  | 'earnings'
  | 'guidance'
  | 'order'
  | 'contract'
  | 'backlog'
  | 'capex'
  | 'facility'
  | 'capacity-expansion'
  | 'supply-agreement'
  | 'financing'
  | 'debt'
  | 'equity-financing';

export type CompanyEventStage =
  | 'reported'
  | 'planned'
  | 'in-progress'
  | 'completed'
  | 'revised'
  | 'delayed'
  | 'confirmation-needed';

export type CompanyEventCompany = {
  id: string;
  name: string;
  country: 'KR' | 'US';
  countryLabel: '한국' | '미국';
  ticker: string;
};

export type CompanyEvent = {
  id: string;
  companyId: string;
  eventDate: string;
  reviewedAt: string;
  group: CompanyEventGroup;
  eventType: CompanyEventType;
  stage: CompanyEventStage;
  title: string;
  factualSummary: string;
  whyItMatters: string;
  nextCheckpoints: string[];
  sourceRefs: string[];
  officialFiling?: {
    jurisdiction: 'kr' | 'us';
    form?: string;
    itemCodes?: string[];
    accessionNumber?: string;
    rceptNo?: string;
  };
  bottleneckIds: string[];
  demandSupplyIds: string[];
  marketMapIds: string[];
  reportIds: string[];
  pickIds: string[];
  caution: string;
};

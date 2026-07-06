export type DisclosureCategory =
  | 'supply-contract'
  | 'earnings'
  | 'periodic-report'
  | 'capital'
  | 'ownership'
  | 'major-management'
  | 'investment'
  | 'governance'
  | 'other';

export type DartTrackedCompanySource = 'current-pick' | 'market-map' | 'manual-watch';
export type SecTrackedCompanySource = 'current-pick' | 'historic-pick' | 'company-analysis' | 'manual-watch';

export type SecFilingCategory =
  | 'current-report'
  | 'quarterly-report'
  | 'annual-report'
  | 'insider-transaction'
  | 'ownership'
  | 'proxy'
  | 'capital-markets'
  | 'foreign-report'
  | 'other';

export type DartTrackedCompany = {
  id: string;
  companyName: string;
  ticker: string;
  corpCode: string;
  source: DartTrackedCompanySource;
  enabled: boolean;
};

export type SecTrackedCompany = {
  id: string;
  companyName: string;
  ticker: string;
  cik: string;
  source: SecTrackedCompanySource;
  enabled: boolean;
  forms: string[];
  foreignIssuer?: boolean;
  relatedPickIds?: string[];
  relatedCompanyIds?: string[];
};

export type MarketDisclosure = {
  receiptNumber: string;
  corpCode: string;
  companyName: string;
  ticker: string | null;
  reportName: string;
  filerName: string | null;
  category: DisclosureCategory;
  receivedAt: string;
  source: 'opendart';
  sourceUrl: string;
};

export type MarketSecFiling = {
  accessionNumber: string;
  cik: string;
  companyName: string;
  ticker: string;
  formType: string;
  category: SecFilingCategory;
  filedAt: string;
  reportDate: string | null;
  primaryDocument: string | null;
  source: 'sec-edgar';
  sourceUrl: string;
};

export type MarketDisclosureMeta = {
  count: number;
  lastSyncedAt: string | null;
  source: 'opendart';
  stale: boolean;
  trackedCompanyCount: number;
};

export type MarketSecFilingsMeta = {
  count: number;
  lastSyncedAt: string | null;
  source: 'sec-edgar';
  stale: boolean;
  trackedCompanyCount: number;
};

export type MarketDisclosureApiResponse = {
  ok: boolean;
  code?: string;
  message?: string;
  items: MarketDisclosure[];
  meta: MarketDisclosureMeta;
};

export type MarketSecFilingsApiResponse = {
  ok: boolean;
  code?: string;
  message?: string;
  items: MarketSecFiling[];
  meta: MarketSecFilingsMeta;
};

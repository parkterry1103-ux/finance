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

export type DartTrackedCompany = {
  id: string;
  companyName: string;
  ticker: string;
  corpCode: string;
  source: DartTrackedCompanySource;
  enabled: boolean;
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

export type MarketDisclosureMeta = {
  count: number;
  lastSyncedAt: string | null;
  source: 'opendart';
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

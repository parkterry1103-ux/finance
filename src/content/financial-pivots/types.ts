export type FinancialPivotPeriodType = 'annual' | 'quarterly';
export type FinancialComparisonMode = 'history' | 'peer' | 'industry';
export type FinancialMetricGroupId = 'growth' | 'profitability' | 'cashFlow' | 'capitalEfficiency' | 'balanceSheet' | 'perShare';

export type FinancialPivotMetricId =
  | 'revenue'
  | 'grossProfit'
  | 'operatingIncome'
  | 'netIncome'
  | 'dilutedEps'
  | 'operatingCashFlow'
  | 'capitalExpenditure'
  | 'freeCashFlow'
  | 'cashAndEquivalents'
  | 'totalDebt'
  | 'totalLiabilities'
  | 'totalAssets'
  | 'totalEquity'
  | 'currentAssets'
  | 'currentLiabilities'
  | 'dilutedShares'
  | 'grossMargin'
  | 'operatingMargin'
  | 'netMargin'
  | 'freeCashFlowMargin'
  | 'returnOnAssets'
  | 'returnOnEquity'
  | 'debtToCapital'
  | 'currentRatio';

export type FinancialSeriesPeriod = {
  label: string;
  periodEnd: string;
  fiscalYear: number | null;
  fiscalPeriod: string;
  currency: string;
  unit: 'million';
  metrics: Partial<Record<FinancialPivotMetricId, number>>;
  sourceIds: string[];
  filingType: string;
  filedAt: string | null;
  accessionOrReceiptNumber: string | null;
};

export type FinancialSeriesResponse = {
  ok: boolean;
  country: string;
  companyId: string;
  source: 'SEC' | 'OpenDART' | string;
  sourceStatus: 'direct' | 'partial' | 'missing-env' | 'not-found' | 'api-error' | string;
  asOf: string | null;
  currency: string | null;
  reportType: string | null;
  periodBasis: string | null;
  message?: string;
  series?: {
    periodType: FinancialPivotPeriodType;
    periods: FinancialSeriesPeriod[];
    requestedLimit: number;
    complete: boolean;
  };
};

export type FinancialPivotCompany = {
  companySlug: string;
  companyId: string;
  companyName: string;
  englishName: string;
  ticker: string;
  exchange: string;
  country: 'KR' | 'US';
  currency: 'KRW' | 'USD';
  corpCode?: string;
  cik?: string;
  industry: string;
  benchmarkIndustry: string;
  peerSlugs: string[];
};

export type FinancialMetricDefinition = {
  id: FinancialPivotMetricId;
  label: string;
  group: FinancialMetricGroupId;
  format: 'amount' | 'percent' | 'percentagePoint' | 'multiple' | 'perShare';
  change: 'percent' | 'percentagePoint' | 'absolute';
  description: string;
  calculation?: string;
};

export type FinancialChange = {
  status: 'ready' | 'missing' | 'zeroBase' | 'profitTurnaround' | 'lossTurnaround' | 'lossNarrowing' | 'lossWidening' | 'inappropriate';
  value: number | null;
  unit: 'percent' | 'percentagePoint' | 'absolute';
  label: string;
};

export type IndustryComparison = {
  id: string;
  industry: string;
  asOfDate: string;
  sourceName: string;
  sourceReference: string;
  sampleSize: number;
  debtToCapital: number;
  roic: number;
};

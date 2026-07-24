export type FinancialPivotPeriodType = 'annual' | 'quarterly';
export type FinancialComparisonMode = 'history' | 'peer' | 'industry';
export type FinancialValueOrigin = 'reported' | 'derived_from_reported' | 'market_implied_derived' | 'external_reference' | 'unavailable';
export type FinancialConsolidationBasis = 'consolidated' | 'separate' | 'unknown';
export type FinancialPeriodBasis = 'standalone' | 'cumulative' | 'annual' | 'instant';
export type FilingFreshness = 'current' | 'stale' | 'filing_pending';
export type ComparisonUnavailableReason =
  | 'prior_period_missing'
  | 'same_period_missing'
  | 'period_not_comparable'
  | 'definition_mismatch'
  | 'consolidation_basis_mismatch'
  | 'currency_mismatch_absolute'
  | 'unit_mismatch'
  | 'restatement_unresolved'
  | 'insufficient_peer_count'
  | 'negative_denominator'
  | 'metric_not_meaningful'
  | 'source_unavailable'
  | 'filing_not_yet_available'
  | 'calculation_inputs_missing';
export type FinancialMetricGroupId = 'growth' | 'profitability' | 'cashFlow' | 'capitalEfficiency' | 'balanceSheet' | 'perShare';

export type FinancialPivotMetricId =
  | 'revenue'
  | 'grossProfit'
  | 'operatingIncome'
  | 'netIncome'
  | 'basicEps'
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
  | 'inventory'
  | 'accountsPayable'
  | 'dilutedShares'
  | 'sharesOutstanding'
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
  periodStart?: string;
  periodEnd: string;
  fiscalYear: number | null;
  fiscalPeriod: string;
  periodBasis?: FinancialPeriodBasis;
  consolidation?: FinancialConsolidationBasis;
  currency: string;
  unit: 'million';
  metrics: Partial<Record<FinancialPivotMetricId, number>>;
  metricOrigins?: Partial<Record<FinancialPivotMetricId, FinancialValueOrigin>>;
  metricLineage?: Partial<Record<FinancialPivotMetricId, FinancialValueLineage>>;
  sourceIds: string[];
  filingType: string;
  filedAt: string | null;
  accessionOrReceiptNumber: string | null;
};

export type FinancialFilingIdentity = {
  system: 'sec' | 'opendart';
  formOrReportCode: string;
  accessionOrReceiptNumber: string;
  filedAt: string;
  reportPeriod: string;
  fiscalYear: number;
  fiscalQuarter: string;
  consolidated: boolean;
  amended: boolean;
  sourceUrl: string;
};

export type FinancialValueLineage = {
  companySlug: string;
  metricId: FinancialPivotMetricId;
  value: number | null;
  currency?: string;
  unit: string;
  period: { start?: string; end: string; fiscalYear?: number; fiscalQuarter?: string; periodType: 'quarter' | 'year' | 'ttm' | 'instant' };
  origin: FinancialValueOrigin;
  filing?: {
    system: 'sec' | 'opendart';
    formOrReportCode: string;
    accessionOrReceiptNumber: string;
    filedAt: string;
    reportPeriod: string;
    consolidated: boolean;
    conceptOrAccountId: string;
    conceptOrAccountName: string;
    frame?: string;
    filedValue?: number;
    filedUnit?: string;
    sourceUrl: string;
  };
  calculation?: { formulaId: string; inputIds: string[]; explanation: string };
  verifiedAt: string;
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
  consolidation?: FinancialConsolidationBasis;
  freshness?: FilingFreshness;
  latestFiling?: FinancialFilingIdentity | null;
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
  format: 'amount' | 'percent' | 'percentagePoint' | 'multiple' | 'perShare' | 'shares';
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

export type ExternalMultipleMatchStatus =
  | 'matched'
  | 'matched_with_rounding'
  | 'definition_difference'
  | 'timing_difference'
  | 'share_basis_difference'
  | 'adr_ratio_difference'
  | 'gaap_vs_adjusted'
  | 'trailing_vs_forward'
  | 'stale_external_value'
  | 'unresolved_difference';

export type ExternalMultipleCheck = {
  provider: string;
  value: number | null;
  definition?: string;
  asOf?: string;
  multipleBasis: 'trailing' | 'forward' | 'definition_not_disclosed';
  epsBasis: 'basic' | 'diluted' | 'definition_not_disclosed';
  accountingBasis: 'gaap' | 'adjusted' | 'definition_not_disclosed';
  priceAsOf: string | null;
  financialPeriod: string;
  retrievedAt: string;
  matchStatus: ExternalMultipleMatchStatus;
  sourceUrl: string;
};

export type VerifiedMarketMultiple = {
  companySlug: string;
  metric: 'per' | 'pbr' | 'psr' | 'evSales' | 'evEbitda';
  basis: 'ttm' | 'latestFiscalYear' | 'latestReportedInstant';
  value: number | null;
  status: 'verified' | 'review' | 'notMeaningful' | 'unavailable';
  unavailableReason?: ComparisonUnavailableReason;
  price: { value: number; currency: string; asOf: string; session: 'regularClose'; sourceId: string };
  denominator: { metricId: string; value: number | null; periodEnd: string; origin: 'reported' | 'derived_from_reported'; lineageId: string };
  formulaId: string;
  externalChecks: ExternalMultipleCheck[];
  verifiedAt: string;
};

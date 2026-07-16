export const normalizedMetricIds = [
  'revenue',
  'costOfRevenue',
  'grossProfit',
  'operatingIncome',
  'ebit',
  'interestExpense',
  'pretaxIncome',
  'incomeTaxExpense',
  'netIncome',
  'dilutedEps',
  'cashAndEquivalents',
  'shortTermInvestments',
  'accountsReceivable',
  'inventory',
  'accountsPayable',
  'currentAssets',
  'currentLiabilities',
  'shortTermDebt',
  'longTermDebt',
  'leaseLiabilities',
  'totalDebt',
  'totalAssets',
  'totalEquity',
  'minorityInterest',
  'operatingCashFlow',
  'depreciationAndAmortization',
  'capitalExpenditure',
  'purchasesOfPPE',
  'purchasesOfIntangibles',
  'stockBasedCompensation',
  'basicShares',
  'dilutedShares',
  'sharesOutstanding',
] as const;

export type NormalizedMetricId = (typeof normalizedMetricIds)[number];
export type FinancialPeriodType = 'annual' | 'quarterly' | 'ttm' | 'pointInTime';
export type Consolidation = 'consolidated' | 'separate' | 'unknown';
export type FinancialQualityStatus = 'ok' | 'derived' | 'restated' | 'missing' | 'inconsistent';

export type NormalizedFinancialFact = {
  companySlug: string;
  metricId: NormalizedMetricId;
  value: number;
  currency: string;
  unit: string;
  periodStart?: string;
  periodEnd: string;
  periodType: FinancialPeriodType;
  fiscalYear?: number;
  fiscalQuarter?: string;
  sourceSystem: 'opendart' | 'sec';
  sourceId: string;
  filingType: string;
  filedAt: string;
  accessionOrReceiptNumber: string;
  taxonomyConcept: string;
  statementType: string;
  consolidation: Consolidation;
  qualityStatus: FinancialQualityStatus;
  derivedFromMetricIds?: NormalizedMetricId[];
  frame?: string;
};

export type NormalizedFinancialPeriod = {
  periodEnd: string;
  periodType: FinancialPeriodType;
  fiscalYear?: number;
  fiscalQuarter?: string;
  currency: string;
  unit: 'million';
  metrics: Partial<Record<NormalizedMetricId, number>>;
  sourceIds: string[];
};

export type ForecastYearAssumption = {
  year: number;
  revenueGrowthRate: number;
  operatingMargin: number;
  normalizedTaxRate: number;
  depreciationAsPercentRevenue: number;
  capexAsPercentRevenue: number;
  changeInWorkingCapitalAsPercentRevenue: number;
};

export type ForecastAssumptions = {
  years: ForecastYearAssumption[];
};

export type DiscountRateAssumptions = {
  riskFreeRate: number;
  equityRiskPremium: number;
  leveredBeta: number;
  countryRiskPremium?: number;
  preTaxCostOfDebt: number;
  normalizedTaxRate: number;
  equityWeight: number;
  debtWeight: number;
};

export type ValuationModelInput = {
  companySlug: string;
  valuationDate: string;
  currency: string;
  historicals: NormalizedFinancialPeriod[];
  forecastAssumptions: ForecastAssumptions;
  capitalStructure: {
    cash: number;
    nonOperatingAssets?: number;
    debt: number;
    leaseLiabilities?: number;
    minorityInterest?: number;
    otherClaims?: number;
    dilutedShares: number;
  };
  discountRateAssumptions: DiscountRateAssumptions;
  terminalAssumptions: {
    stableGrowthRate: number;
    stableRoic?: number;
    exitMultiple?: number;
  };
  sources: string[];
};

export type ForecastPeriodResult = ForecastYearAssumption & {
  revenue: number;
  ebit: number;
  nopat: number;
  depreciationAndAmortization: number;
  capitalExpenditure: number;
  changeInWorkingCapital: number;
  fcff: number;
  discountFactor: number;
  presentValueOfFcff: number;
};

export type ValuationWarningCode =
  | 'terminal-value-share-high'
  | 'margin-outside-history'
  | 'growth-outside-history'
  | 'capex-below-depreciation'
  | 'working-capital-outside-history'
  | 'wacc-outside-benchmark'
  | 'terminal-reinvestment-inconsistent';

export type ValuationWarning = {
  code: ValuationWarningCode;
  message: string;
  value?: number;
  threshold?: number;
};

export type ValuationModelResult = {
  companySlug: string;
  valuationDate: string;
  currency: string;
  forecast: ForecastPeriodResult[];
  wacc: number;
  costOfEquity: number;
  afterTaxCostOfDebt: number;
  presentValueOfForecastFcff: number;
  terminalFcff: number;
  terminalValue: number;
  exitMultipleTerminalValue?: number;
  presentValueOfTerminalValue: number;
  enterpriseValue: number;
  equityBridge: {
    enterpriseValue: number;
    cash: number;
    nonOperatingAssets: number;
    debt: number;
    leaseLiabilities: number;
    minorityInterest: number;
    otherClaims: number;
    equityValue: number;
  };
  dilutedShares: number;
  estimatedValuePerShare: number;
  terminalValueShareOfEnterpriseValue: number;
  warnings: ValuationWarning[];
  sourceIds: string[];
};

export type ScenarioName = 'conservative' | 'base' | 'optimistic';

export type ValuationScenario = {
  name: ScenarioName;
  input: ValuationModelInput;
};

export type SensitivityCell = {
  rowValue: number;
  columnValue: number;
  estimatedValuePerShare: number | null;
  error?: string;
};

export type SensitivityMatrix = {
  rowVariable: string;
  columnVariable: string;
  rowValues: number[];
  columnValues: number[];
  cells: SensitivityCell[];
};

export type ReverseDcfVariable = 'revenueCagr' | 'operatingMargin' | 'terminalGrowth';

export type ReverseDcfResult = {
  variable: ReverseDcfVariable;
  solvedValue: number;
  targetEquityValue: number;
  solvedEquityValue: number;
  absoluteError: number;
  relativeError: number;
  iterations: number;
  converged: boolean;
};

export type ValuationBenchmark = {
  id: string;
  industry: string;
  region: string;
  asOfDate: string;
  sourceName: string;
  sourceReference: string;
  sampleSize?: number;
  unleveredBeta?: number;
  debtToCapital?: number;
  costOfEquity?: number;
  preTaxCostOfDebt?: number;
  effectiveTaxRate?: number;
  wacc?: number;
  roic?: number;
  evToSales?: number;
  evToEbitda?: number;
  pe?: number;
  priceToBook?: number;
};

export type BenchmarkSnapshot = {
  source: string;
  sourceDate: string;
  retrievedAt: string;
  region: string;
  originalUnit: string;
  transformation: string;
  benchmarks: ValuationBenchmark[];
};

declare const process: {
  env: Record<string, string | undefined>;
};

import {
  factsToAnnualPeriods,
  normalizeSecCompanyFacts,
  type SecCompanyFactsPayload,
} from '../src/domain/valuation/normalize.js';

type QueryValue = string | string[] | undefined;

type ApiRequest = {
  method?: string;
  query?: Record<string, QueryValue>;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader?: (name: string, value: string) => void;
};

type SecFact = {
  accn?: string;
  start?: string;
  end?: string;
  fy?: number;
  fp?: string;
  form?: string;
  filed?: string;
  frame?: string;
  val?: number;
  unit?: string;
};

type SecConceptFacts = {
  units?: Record<string, SecFact[] | undefined>;
};

type CompanyFactsPayload = {
  cik?: string | number;
  facts?: {
    'us-gaap'?: Record<string, SecConceptFacts | undefined>;
    'ifrs-full'?: Record<string, SecConceptFacts | undefined>;
  };
};

type SelectedMetric = {
  value: number;
  fact: SecFact;
  concept: string;
  unit: string | null;
};

type DartAccountRow = {
  rcept_no?: string;
  sj_div?: string;
  account_id?: string;
  account_nm?: string;
  thstrm_amount?: string;
  thstrm_add_amount?: string;
  currency?: string;
};

type DartApiPayload = {
  status?: string;
  message?: string;
  list?: DartAccountRow[];
};

type DartMetricSelection = {
  value: number;
  row: DartAccountRow;
  currency: string | null;
  amountField: 'thstrm_amount';
};

type ComparisonMetric = {
  yoy?: number | null;
  qoq?: number | null;
};

type FinancialComparison = {
  revenue?: ComparisonMetric;
  operatingIncome?: ComparisonMetric;
  operatingCashFlow?: ComparisonMetric;
};

type FinancialSeriesPeriod = {
  label: string;
  periodEnd: string;
  fiscalYear: number | null;
  fiscalPeriod: string;
  currency: string;
  unit: 'million';
  metrics: Record<string, number>;
  sourceIds: string[];
  filingType: string;
  filedAt: string | null;
  accessionOrReceiptNumber: string | null;
};

const SEC_TIMEOUT_MS = 8000;
const DART_TIMEOUT_MS = 8000;

const DART_REPORTS = [
  { code: '11014', label: 'OpenDART 3분기보고서', fiscalPeriod: 'Q3' },
  { code: '11012', label: 'OpenDART 반기보고서', fiscalPeriod: 'H1' },
  { code: '11013', label: 'OpenDART 1분기보고서', fiscalPeriod: 'Q1' },
  { code: '11011', label: 'OpenDART 사업보고서', fiscalPeriod: 'FY' },
];

const DART_FS_DIVS = ['CFS', 'OFS'];

const SEC_CONCEPTS = {
  revenue: ['RevenueFromContractWithCustomerExcludingAssessedTax', 'Revenues', 'SalesRevenueNet'],
  operatingIncome: ['OperatingIncomeLoss'],
  netIncome: ['NetIncomeLoss'],
  operatingCashFlow: ['NetCashProvidedByUsedInOperatingActivities'],
  totalLiabilities: ['Liabilities'],
  stockholdersEquity: ['StockholdersEquity', 'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'],
  assetsCurrent: ['AssetsCurrent'],
  liabilitiesCurrent: ['LiabilitiesCurrent'],
  interestExpense: ['InterestExpenseNonOperating', 'InterestExpense', 'InterestAndDebtExpense'],
  capitalExpenditures: ['PaymentsToAcquirePropertyPlantAndEquipment', 'CapitalExpendituresIncurredButNotYetPaid'],
  eps: ['EarningsPerShareDiluted', 'EarningsPerShareBasic'],
  depreciationAndAmortization: [
    'DepreciationDepletionAndAmortization',
    'DepreciationDepletionAndAmortizationExpense',
    'Depreciation',
  ],
};

type SecMetricKey = keyof typeof SEC_CONCEPTS;
type SecFacts = Record<string, SecConceptFacts | undefined>;
type SecSelectedMetrics = Record<SecMetricKey, SelectedMetric | null>;
type SecTaxonomy = 'us-gaap' | 'ifrs-full';

const SEC_20F_IFRS_CONCEPTS: Record<SecMetricKey, string[]> = {
  revenue: ['Revenue', 'RevenueFromContractsWithCustomers'],
  operatingIncome: ['ProfitLossFromOperatingActivities'],
  netIncome: ['ProfitLoss', 'ProfitLossAttributableToOwnersOfParent'],
  operatingCashFlow: ['CashFlowsFromUsedInOperatingActivities'],
  totalLiabilities: ['Liabilities'],
  stockholdersEquity: ['Equity', 'EquityAttributableToOwnersOfParent'],
  assetsCurrent: ['CurrentAssets'],
  liabilitiesCurrent: ['CurrentLiabilities'],
  interestExpense: ['FinanceCosts'],
  capitalExpenditures: ['PurchaseOfPropertyPlantAndEquipmentClassifiedAsInvestingActivities'],
  eps: ['DilutedEarningsLossPerShare', 'BasicEarningsLossPerShare'],
  depreciationAndAmortization: ['DepreciationExpense'],
};

const SEC_20F_COMPANIES: Record<string, {
  taxonomy: SecTaxonomy;
  concepts: Record<SecMetricKey, string[]>;
  preferredCurrency: string;
}> = {
  'ai-datacenter-tsmc': {
    taxonomy: 'ifrs-full',
    concepts: SEC_20F_IFRS_CONCEPTS,
    preferredCurrency: 'TWD',
  },
  'ai-datacenter-asml': {
    taxonomy: 'us-gaap',
    concepts: SEC_CONCEPTS,
    preferredCurrency: 'EUR',
  },
};

const DART_ACCOUNT_ALIASES = {
  revenue: ['매출액', '수익(매출액)', '영업수익', '매출'],
  operatingIncome: ['영업이익', '영업이익(손실)'],
  netIncome: ['당기순이익', '당기순이익(손실)', '분기순이익', '반기순이익'],
  operatingCashFlow: ['영업활동현금흐름', '영업활동으로 인한 현금흐름', '영업활동 현금흐름'],
  totalLiabilities: ['부채총계'],
  stockholdersEquity: ['자본총계'],
  assetsCurrent: ['유동자산'],
  liabilitiesCurrent: ['유동부채'],
  interestExpense: ['이자비용'],
  capitalExpenditures: ['유형자산의 취득', '유형자산 취득', '유무형자산의 취득'],
  depreciationAndAmortization: ['감가상각비', '감가상각비와무형자산상각비', '감가상각비 및 무형자산상각비'],
};

function firstQueryValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function requiredEnvKeys(country: string) {
  const normalizedCountry = country.trim().toUpperCase();
  if (normalizedCountry === 'US') return ['SEC_USER_AGENT'];
  if (normalizedCountry === 'KR') return ['OPENDART_API_KEY'];
  return ['SEC_USER_AGENT', 'OPENDART_API_KEY'];
}

function hasEnv(key: string) {
  return Boolean(process.env[key]);
}

function paddedCik(cik: string) {
  return cik.replace(/\D/g, '').padStart(10, '0');
}

function formRank(fact: SecFact) {
  if (fact.form === '10-Q') return 0;
  if (fact.form === '10-K') return 1;
  return 2;
}

function dateValue(value?: string) {
  return value ? Date.parse(value) || 0 : 0;
}

function validFact(fact: SecFact) {
  return typeof fact.val === 'number' && Number.isFinite(fact.val);
}

function compareFacts(a: SecFact, b: SecFact) {
  const byForm = formRank(a) - formRank(b);
  if (byForm !== 0) return byForm;
  const byFiled = dateValue(b.filed) - dateValue(a.filed);
  if (byFiled !== 0) return byFiled;
  return dateValue(b.end) - dateValue(a.end);
}

function rankedFacts(units?: Record<string, SecFact[] | undefined>) {
  const entries = Object.entries(units ?? {});
  const preferredUnit = units?.USD;
  const selectedEntries = preferredUnit?.length ? [['USD', preferredUnit] as const] : entries;
  const facts = selectedEntries.flatMap(([unit, items]) => (items ?? []).map((fact) => ({ ...fact, unit })));
  return facts
    .filter(validFact)
    .filter((fact) => fact.form === '10-Q' || fact.form === '10-K')
    .sort(compareFacts);
}

function normalizeSecUnit(value?: string | null) {
  return String(value ?? '').trim().toUpperCase();
}

function secUnitCurrency(value?: string | null) {
  const normalized = normalizeSecUnit(value);
  if (!normalized) return null;
  return normalized.split('/')[0] || normalized;
}

function secUnitMatchesCurrency(unit: string, currency: string) {
  return secUnitCurrency(unit) === normalizeSecUnit(currency);
}

function compareAnnual20FFacts(a: SecFact, b: SecFact) {
  const byFiled = dateValue(b.filed) - dateValue(a.filed);
  if (byFiled !== 0) return byFiled;
  return dateValue(b.end) - dateValue(a.end);
}

function rankedAnnual20FFacts(units?: Record<string, SecFact[] | undefined>, preferredCurrency?: string) {
  const entries = Object.entries(units ?? {}).filter(([unit]) =>
    preferredCurrency ? secUnitMatchesCurrency(unit, preferredCurrency) : true
  );
  return entries
    .flatMap(([unit, items]) => (items ?? []).map((fact) => ({ ...fact, unit })))
    .filter(validFact)
    .filter((fact) => fact.form === '20-F' && fact.fp === 'FY')
    .sort(compareAnnual20FFacts);
}

function selectMetric(
  facts: SecFacts | undefined,
  concepts: string[],
): SelectedMetric | null {
  const candidates = concepts.flatMap((concept, conceptIndex) =>
    rankedFacts(facts?.[concept]?.units).map((fact) => ({ concept, conceptIndex, fact })),
  );
  const selected = candidates.sort((a, b) => compareFacts(a.fact, b.fact) || a.conceptIndex - b.conceptIndex)[0];
  return selected?.fact.val !== undefined
    ? { value: selected.fact.val, fact: selected.fact, concept: selected.concept, unit: selected.fact.unit ?? null }
    : null;
}

function selectAnnual20FMetric(
  facts: SecFacts | undefined,
  concepts: string[],
  preferredCurrency: string,
): SelectedMetric | null {
  const candidates = concepts.flatMap((concept, conceptIndex) =>
    rankedAnnual20FFacts(facts?.[concept]?.units, preferredCurrency).map((fact) => ({ concept, conceptIndex, fact })),
  );
  const selected = candidates.sort((a, b) => compareAnnual20FFacts(a.fact, b.fact) || a.conceptIndex - b.conceptIndex)[0];
  return selected?.fact.val !== undefined
    ? { value: selected.fact.val, fact: selected.fact, concept: selected.concept, unit: selected.fact.unit ?? null }
    : null;
}

function positiveMetric(metric: SelectedMetric | null) {
  return metric && metric.value > 0 ? metric.value : null;
}

function safeRatio(numerator: SelectedMetric | null, denominator: SelectedMetric | null) {
  const numeratorValue = positiveMetric(numerator);
  const denominatorValue = positiveMetric(denominator);
  if (numeratorValue === null || denominatorValue === null) return null;
  return Number((numeratorValue / denominatorValue).toFixed(4));
}

function safeNumberRatio(numerator: number | null, denominator: number | null) {
  if (numerator === null || denominator === null || numerator <= 0 || denominator <= 0) return null;
  return Number((numerator / denominator).toFixed(4));
}

function percentageChange(current?: number | null, previous?: number | null) {
  if (
    typeof current !== 'number' ||
    typeof previous !== 'number' ||
    !Number.isFinite(current) ||
    !Number.isFinite(previous) ||
    previous <= 0
  ) {
    return null;
  }
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function comparisonMetric(yoy?: number | null, qoq?: number | null): ComparisonMetric | undefined {
  const safeYoy = typeof yoy === 'number' && Number.isFinite(yoy) ? yoy : null;
  const safeQoq = typeof qoq === 'number' && Number.isFinite(qoq) ? qoq : null;
  if (safeYoy === null && safeQoq === null) return undefined;
  return { yoy: safeYoy, qoq: safeQoq };
}

function factDurationDays(fact: SecFact) {
  const start = dateValue(fact.start);
  const end = dateValue(fact.end);
  if (!start || !end || end <= start) return null;
  return Math.round((end - start) / 86_400_000);
}

function hasComparableDuration(a: SecFact, b: SecFact) {
  const aDuration = factDurationDays(a);
  const bDuration = factDurationDays(b);
  return aDuration !== null && bDuration !== null && Math.abs(aDuration - bDuration) <= 10;
}

function previousQuarterFp(fp?: string) {
  if (fp === 'Q2') return 'Q1';
  if (fp === 'Q3') return 'Q2';
  return null;
}

function factsForSelectedMetric(
  facts: SecFacts | undefined,
  metric: SelectedMetric | null,
) {
  if (!metric) return [];
  return rankedFacts(facts?.[metric.concept]?.units).filter((fact) => fact !== metric.fact && hasComparableDuration(metric.fact, fact));
}

function secComparisonForMetric(
  facts: SecFacts | undefined,
  metric: SelectedMetric | null,
) {
  if (!metric || typeof metric.fact.fy !== 'number') return undefined;
  const candidates = factsForSelectedMetric(facts, metric);
  const yoyFact = candidates.find((fact) =>
    fact.form === metric.fact.form &&
    fact.fp === metric.fact.fp &&
    fact.fy === metric.fact.fy! - 1
  );
  const previousFp = previousQuarterFp(metric.fact.fp);
  const qoqFact = previousFp && metric.fact.form === '10-Q'
    ? candidates.find((fact) => fact.form === '10-Q' && fact.fy === metric.fact.fy && fact.fp === previousFp)
    : undefined;

  return comparisonMetric(
    percentageChange(metric.value, yoyFact?.val),
    percentageChange(metric.value, qoqFact?.val),
  );
}

function secComparison(
  facts: SecFacts | undefined,
  selected: SecSelectedMetrics,
): FinancialComparison {
  const comparison: FinancialComparison = {};
  const revenue = secComparisonForMetric(facts, selected.revenue);
  const operatingIncome = secComparisonForMetric(facts, selected.operatingIncome);
  const operatingCashFlow = secComparisonForMetric(facts, selected.operatingCashFlow);

  if (revenue) comparison.revenue = revenue;
  if (operatingIncome) comparison.operatingIncome = operatingIncome;
  if (operatingCashFlow) comparison.operatingCashFlow = operatingCashFlow;
  return comparison;
}

function rawAvailability(metrics: SecSelectedMetrics) {
  return {
    revenue: Boolean(metrics.revenue),
    operatingIncome: Boolean(metrics.operatingIncome),
    netIncome: Boolean(metrics.netIncome),
    operatingCashFlow: Boolean(metrics.operatingCashFlow),
    totalLiabilities: Boolean(metrics.totalLiabilities),
    stockholdersEquity: Boolean(metrics.stockholdersEquity),
    assetsCurrent: Boolean(metrics.assetsCurrent),
    liabilitiesCurrent: Boolean(metrics.liabilitiesCurrent),
    interestExpense: Boolean(metrics.interestExpense),
    capitalExpenditures: Boolean(metrics.capitalExpenditures),
    eps: Boolean(metrics.eps),
    depreciationAndAmortization: Boolean(metrics.depreciationAndAmortization),
  };
}

function sourceStatusFor(metrics: SecSelectedMetrics) {
  const primaryCount = [
    metrics.revenue,
    metrics.operatingIncome,
    metrics.netIncome,
    metrics.operatingCashFlow,
  ].filter(Boolean).length;
  const anyMetric = Object.values(metrics).some(Boolean);

  if (primaryCount === 4) return 'direct';
  if (anyMetric) return 'partial';
  return 'not-found';
}

function reportFactFor(metrics: SecSelectedMetrics) {
  return (
    metrics.revenue?.fact ??
    metrics.operatingIncome?.fact ??
    metrics.netIncome?.fact ??
    metrics.operatingCashFlow?.fact ??
    Object.values(metrics).find(Boolean)?.fact
  );
}

function secCurrencyFromSelected(metrics: SecSelectedMetrics) {
  const monetaryMetrics = [
    metrics.revenue,
    metrics.operatingIncome,
    metrics.netIncome,
    metrics.operatingCashFlow,
    metrics.totalLiabilities,
    metrics.stockholdersEquity,
    metrics.assetsCurrent,
    metrics.liabilitiesCurrent,
    metrics.interestExpense,
    metrics.capitalExpenditures,
    metrics.depreciationAndAmortization,
  ];
  const currencies = [
    ...new Set(
      monetaryMetrics
        .map((metric) => secUnitCurrency(metric?.unit))
        .filter((currency): currency is string => Boolean(currency)),
    ),
  ];
  return currencies.length === 1 ? currencies[0] : null;
}

function secFiledAtForAccession(payload: CompanyFactsPayload, accession: string | null) {
  if (!accession) return null;
  const taxonomies = [payload.facts?.['us-gaap'], payload.facts?.['ifrs-full']];
  for (const taxonomy of taxonomies) {
    for (const concept of Object.values(taxonomy ?? {})) {
      for (const facts of Object.values(concept?.units ?? {})) {
        const match = facts?.find((fact) => fact.accn === accession && fact.filed);
        if (match?.filed) return match.filed;
      }
    }
  }
  return null;
}

function selectSecMetrics(facts: SecFacts | undefined): SecSelectedMetrics {
  return {
    revenue: selectMetric(facts, SEC_CONCEPTS.revenue),
    operatingIncome: selectMetric(facts, SEC_CONCEPTS.operatingIncome),
    netIncome: selectMetric(facts, SEC_CONCEPTS.netIncome),
    operatingCashFlow: selectMetric(facts, SEC_CONCEPTS.operatingCashFlow),
    totalLiabilities: selectMetric(facts, SEC_CONCEPTS.totalLiabilities),
    stockholdersEquity: selectMetric(facts, SEC_CONCEPTS.stockholdersEquity),
    assetsCurrent: selectMetric(facts, SEC_CONCEPTS.assetsCurrent),
    liabilitiesCurrent: selectMetric(facts, SEC_CONCEPTS.liabilitiesCurrent),
    interestExpense: selectMetric(facts, SEC_CONCEPTS.interestExpense),
    capitalExpenditures: selectMetric(facts, SEC_CONCEPTS.capitalExpenditures),
    eps: selectMetric(facts, SEC_CONCEPTS.eps),
    depreciationAndAmortization: selectMetric(facts, SEC_CONCEPTS.depreciationAndAmortization),
  };
}

function selectAnnual20FMetrics(
  facts: SecFacts | undefined,
  concepts: Record<SecMetricKey, string[]>,
  preferredCurrency: string,
): SecSelectedMetrics {
  return {
    revenue: selectAnnual20FMetric(facts, concepts.revenue, preferredCurrency),
    operatingIncome: selectAnnual20FMetric(facts, concepts.operatingIncome, preferredCurrency),
    netIncome: selectAnnual20FMetric(facts, concepts.netIncome, preferredCurrency),
    operatingCashFlow: selectAnnual20FMetric(facts, concepts.operatingCashFlow, preferredCurrency),
    totalLiabilities: selectAnnual20FMetric(facts, concepts.totalLiabilities, preferredCurrency),
    stockholdersEquity: selectAnnual20FMetric(facts, concepts.stockholdersEquity, preferredCurrency),
    assetsCurrent: selectAnnual20FMetric(facts, concepts.assetsCurrent, preferredCurrency),
    liabilitiesCurrent: selectAnnual20FMetric(facts, concepts.liabilitiesCurrent, preferredCurrency),
    interestExpense: selectAnnual20FMetric(facts, concepts.interestExpense, preferredCurrency),
    capitalExpenditures: selectAnnual20FMetric(facts, concepts.capitalExpenditures, preferredCurrency),
    eps: selectAnnual20FMetric(facts, concepts.eps, preferredCurrency),
    depreciationAndAmortization: selectAnnual20FMetric(facts, concepts.depreciationAndAmortization, preferredCurrency),
  };
}

function emptyRawAvailable() {
  return {
    revenue: false,
    operatingIncome: false,
    netIncome: false,
    operatingCashFlow: false,
    totalLiabilities: false,
    stockholdersEquity: false,
    assetsCurrent: false,
    liabilitiesCurrent: false,
    interestExpense: false,
    capitalExpenditures: false,
    eps: false,
    depreciationAndAmortization: false,
  };
}

function emptyMetrics() {
  return {
    revenue: null,
    operatingIncome: null,
    netIncome: null,
    operatingCashFlow: null,
    cashFlow: null,
    totalLiabilities: null,
    stockholdersEquity: null,
    assetsCurrent: null,
    liabilitiesCurrent: null,
    interestExpense: null,
    capitalExpenditures: null,
    freeCashFlow: null,
    eps: null,
    depreciationAndAmortization: null,
    debtToEquity: null,
    currentRatio: null,
    interestCoverage: null,
    operatingMargin: null,
    debtRatio: null,
  };
}

async function fetchSecCompanyFacts(cik: string, userAgent: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEC_TIMEOUT_MS);
  try {
    const response = await fetch(`https://data.sec.gov/api/xbrl/companyfacts/CIK${paddedCik(cik)}.json`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': userAgent,
      },
    });

    if (!response.ok) {
      return { ok: false as const, message: `SEC CompanyFacts request failed with HTTP ${response.status}` };
    }

    return { ok: true as const, payload: (await response.json()) as CompanyFactsPayload };
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'SEC CompanyFacts request timed out'
      : 'SEC CompanyFacts request failed';
    return { ok: false as const, message };
  } finally {
    clearTimeout(timeout);
  }
}

function compactAccountName(value?: string) {
  return String(value ?? '').replace(/[\s()（）·ㆍ,]/g, '').trim();
}

function accountMatches(accountName: string, alias: string) {
  const normalizedAccount = compactAccountName(accountName);
  const normalizedAlias = compactAccountName(alias);
  if (!normalizedAccount || !normalizedAlias) return false;
  if (normalizedAccount === normalizedAlias) return true;
  if (alias === '매출') return false;
  return normalizedAccount.includes(normalizedAlias);
}

function statementMatches(row: DartAccountRow, statements?: string[]) {
  if (!statements?.length || !row.sj_div) return true;
  return statements.includes(row.sj_div);
}

function isPerShareAccount(accountName?: string, accountId?: string) {
  const normalizedName = compactAccountName(accountName);
  const normalizedId = String(accountId ?? '').toLowerCase();
  return (
    normalizedName.includes('주당') ||
    normalizedName.includes('기본주당') ||
    normalizedName.includes('희석주당') ||
    normalizedName.includes('주당이익') ||
    normalizedId.includes('pershare') ||
    normalizedId.includes('earningslossper')
  );
}

function isRatioAccount(accountName?: string, accountId?: string) {
  const normalizedName = compactAccountName(accountName);
  const normalizedId = String(accountId ?? '').toLowerCase();
  return (
    normalizedName.includes('비율') ||
    normalizedName.includes('이익률') ||
    normalizedName.includes('마진') ||
    normalizedId.includes('ratio') ||
    normalizedId.includes('rate')
  );
}

function normalizeDartCurrency(value?: string | null) {
  const normalized = String(value ?? '').trim().toUpperCase();
  if (!normalized) return null;
  if (normalized === 'KRW' || normalized === '원' || normalized === '￦' || normalized === '₩') return 'KRW';
  return normalized;
}

function parseDartAmount(value?: string | null) {
  const raw = String(value ?? '').trim();
  if (!raw || raw === '-' || raw.toLowerCase() === 'null') return null;
  const parenthesized = raw.startsWith('(') && raw.endsWith(')');
  const compact = raw
    .replace(/[,\s]/g, '')
    .replace(/[()]/g, '')
    .replace(/^△/, '-');
  if (!compact || compact === '-') return null;
  const numeric = Number(compact);
  if (!Number.isFinite(numeric)) return null;
  return parenthesized ? -Math.abs(numeric) : numeric;
}

function findDartMetric(
  rows: DartAccountRow[],
  aliases: string[],
  options: { statements?: string[]; excludePerShare?: boolean; excludeRatios?: boolean; minAbsAmount?: number } = {},
): DartMetricSelection | null {
  const candidates = rows.filter((item) => {
    if (!statementMatches(item, options.statements)) return false;
    if (options.excludePerShare && isPerShareAccount(item.account_nm, item.account_id)) return false;
    if (options.excludeRatios && isRatioAccount(item.account_nm, item.account_id)) return false;
    return true;
  });

  for (const alias of aliases) {
    const row = candidates.find((item) => accountMatches(item.account_nm ?? '', alias));
    if (!row) continue;
    const value = parseDartAmount(row?.thstrm_amount);
    if (value === null) continue;
    if (options.minAbsAmount && value !== 0 && Math.abs(value) < options.minAbsAmount) continue;
    return { value, row, currency: normalizeDartCurrency(row?.currency), amountField: 'thstrm_amount' };
  }
  return null;
}

function selectionValue(selection: DartMetricSelection | null) {
  return selection?.value ?? null;
}

function currencyFromSelections(selections: Array<DartMetricSelection | null>) {
  const currencies = [...new Set(selections.map((selection) => selection?.currency).filter((currency): currency is string => Boolean(currency)))];
  return currencies.length === 1 ? currencies[0] : null;
}

function rawAvailableFromValues(values: Record<keyof typeof DART_ACCOUNT_ALIASES, number | null>) {
  return {
    revenue: values.revenue !== null,
    operatingIncome: values.operatingIncome !== null,
    netIncome: values.netIncome !== null,
    operatingCashFlow: values.operatingCashFlow !== null,
    totalLiabilities: values.totalLiabilities !== null,
    stockholdersEquity: values.stockholdersEquity !== null,
    assetsCurrent: values.assetsCurrent !== null,
    liabilitiesCurrent: values.liabilitiesCurrent !== null,
    interestExpense: values.interestExpense !== null,
    capitalExpenditures: values.capitalExpenditures !== null,
    eps: false,
    depreciationAndAmortization: values.depreciationAndAmortization !== null,
  };
}

function dartSourceStatusFor(values: Record<keyof typeof DART_ACCOUNT_ALIASES, number | null>) {
  const primaryCount = [
    values.revenue,
    values.operatingIncome,
    values.netIncome,
    values.operatingCashFlow,
  ].filter((value) => value !== null).length;
  const anyMetric = Object.values(values).some((value) => value !== null);

  if (primaryCount === 4) return 'direct';
  if (anyMetric) return 'partial';
  return 'not-found';
}

function dartReceiptDate(rows: DartAccountRow[]) {
  const receiptNo = rows.find((row) => row.rcept_no)?.rcept_no;
  const match = String(receiptNo ?? '').match(/^(\d{4})(\d{2})(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

async function fetchOpenDartRows({
  apiKey,
  corpCode,
  year,
  reportCode,
  fsDiv,
}: {
  apiKey: string;
  corpCode: string;
  year: string;
  reportCode: string;
  fsDiv: string;
}) {
  const params = new URLSearchParams({
    crtfc_key: apiKey,
    corp_code: corpCode,
    bsns_year: year,
    reprt_code: reportCode,
    fs_div: fsDiv,
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DART_TIMEOUT_MS);

  try {
    const response = await fetch(`https://opendart.fss.or.kr/api/fnlttSinglAcntAll.json?${params.toString()}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return { status: 'api-error' as const, message: `OpenDART request failed with HTTP ${response.status}` };
    }

    const payload = (await response.json()) as DartApiPayload;
    if (payload.status === '000' && Array.isArray(payload.list) && payload.list.length > 0) {
      return { status: 'ok' as const, rows: payload.list };
    }
    if (payload.status === '013') return { status: 'not-found' as const };

    return { status: 'api-error' as const, message: payload.message || `OpenDART returned status ${payload.status ?? 'unknown'}` };
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'OpenDART request timed out'
      : 'OpenDART request failed';
    return { status: 'api-error' as const, message };
  } finally {
    clearTimeout(timeout);
  }
}

function recentDartYears() {
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear - 1, currentYear - 2].map(String);
}

function annualDartYears() {
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4, currentYear - 5].map(String);
}

function buildDartMetrics(rows: DartAccountRow[]) {
  const selections = {
    revenue: findDartMetric(rows, DART_ACCOUNT_ALIASES.revenue, { statements: ['IS', 'CIS'], excludePerShare: true, excludeRatios: true, minAbsAmount: 1_000_000 }),
    operatingIncome: findDartMetric(rows, DART_ACCOUNT_ALIASES.operatingIncome, { statements: ['IS', 'CIS'], excludePerShare: true, excludeRatios: true, minAbsAmount: 1_000_000 }),
    netIncome: findDartMetric(rows, DART_ACCOUNT_ALIASES.netIncome, { statements: ['IS', 'CIS'], excludePerShare: true, excludeRatios: true, minAbsAmount: 1_000_000 }),
    operatingCashFlow: findDartMetric(rows, DART_ACCOUNT_ALIASES.operatingCashFlow, { statements: ['CF'], excludePerShare: true, excludeRatios: true, minAbsAmount: 1_000_000 }),
    totalLiabilities: findDartMetric(rows, DART_ACCOUNT_ALIASES.totalLiabilities, { statements: ['BS'], excludePerShare: true, excludeRatios: true, minAbsAmount: 1_000_000 }),
    stockholdersEquity: findDartMetric(rows, DART_ACCOUNT_ALIASES.stockholdersEquity, { statements: ['BS'], excludePerShare: true, excludeRatios: true, minAbsAmount: 1_000_000 }),
    assetsCurrent: findDartMetric(rows, DART_ACCOUNT_ALIASES.assetsCurrent, { statements: ['BS'], excludePerShare: true, excludeRatios: true, minAbsAmount: 1_000_000 }),
    liabilitiesCurrent: findDartMetric(rows, DART_ACCOUNT_ALIASES.liabilitiesCurrent, { statements: ['BS'], excludePerShare: true, excludeRatios: true, minAbsAmount: 1_000_000 }),
    interestExpense: findDartMetric(rows, DART_ACCOUNT_ALIASES.interestExpense, { statements: ['IS', 'CIS'], excludePerShare: true, excludeRatios: true, minAbsAmount: 1_000_000 }),
    capitalExpenditures: findDartMetric(rows, DART_ACCOUNT_ALIASES.capitalExpenditures, { statements: ['CF'], excludePerShare: true, excludeRatios: true, minAbsAmount: 1_000_000 }),
    depreciationAndAmortization: findDartMetric(rows, DART_ACCOUNT_ALIASES.depreciationAndAmortization, { statements: ['CF'], excludePerShare: true, excludeRatios: true, minAbsAmount: 1_000_000 }),
  };
  const values = {
    revenue: selectionValue(selections.revenue),
    operatingIncome: selectionValue(selections.operatingIncome),
    netIncome: selectionValue(selections.netIncome),
    operatingCashFlow: selectionValue(selections.operatingCashFlow),
    totalLiabilities: selectionValue(selections.totalLiabilities),
    stockholdersEquity: selectionValue(selections.stockholdersEquity),
    assetsCurrent: selectionValue(selections.assetsCurrent),
    liabilitiesCurrent: selectionValue(selections.liabilitiesCurrent),
    interestExpense: selectionValue(selections.interestExpense),
    capitalExpenditures: selectionValue(selections.capitalExpenditures),
    depreciationAndAmortization: selectionValue(selections.depreciationAndAmortization),
  };
  const freeCashFlow =
    values.operatingCashFlow !== null && values.capitalExpenditures !== null
      ? values.operatingCashFlow - Math.abs(values.capitalExpenditures)
      : null;

  return {
    ...values,
    cashFlow: values.operatingCashFlow,
    freeCashFlow,
    eps: null,
    debtToEquity: safeNumberRatio(values.totalLiabilities, values.stockholdersEquity),
    currentRatio: safeNumberRatio(values.assetsCurrent, values.liabilitiesCurrent),
    interestCoverage: safeNumberRatio(values.operatingIncome, values.interestExpense),
    operatingMargin: null,
    debtRatio: null,
    currency: currencyFromSelections(Object.values(selections)),
    amountBasis: 'OpenDART thstrm_amount',
  };
}

type DartMetrics = ReturnType<typeof buildDartMetrics>;

function finiteMillion(value: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? value / 1_000_000 : undefined;
}

function buildDartSeriesPeriod(year: string, fsDiv: string, rows: DartAccountRow[], metrics: DartMetrics): FinancialSeriesPeriod {
  const values: Record<string, number | undefined> = {
    revenue: finiteMillion(metrics.revenue),
    operatingIncome: finiteMillion(metrics.operatingIncome),
    netIncome: finiteMillion(metrics.netIncome),
    operatingCashFlow: finiteMillion(metrics.operatingCashFlow),
    totalLiabilities: finiteMillion(metrics.totalLiabilities),
    totalEquity: finiteMillion(metrics.stockholdersEquity),
    currentAssets: finiteMillion(metrics.assetsCurrent),
    currentLiabilities: finiteMillion(metrics.liabilitiesCurrent),
    interestExpense: finiteMillion(metrics.interestExpense),
    capitalExpenditure: finiteMillion(metrics.capitalExpenditures),
    depreciationAndAmortization: finiteMillion(metrics.depreciationAndAmortization),
    freeCashFlow: finiteMillion(metrics.freeCashFlow),
  };
  const receiptNumber = rows.find((row) => row.rcept_no)?.rcept_no ?? null;
  return {
    label: `${year}년`,
    periodEnd: `${year}-12-31`,
    fiscalYear: Number(year),
    fiscalPeriod: 'FY',
    currency: metrics.currency ?? 'KRW',
    unit: 'million',
    metrics: Object.fromEntries(Object.entries(values).filter((entry): entry is [string, number] => typeof entry[1] === 'number')),
    sourceIds: receiptNumber ? [`opendart:${corpReceiptId(receiptNumber)}`] : [],
    filingType: `OpenDART 사업보고서 ${fsDiv}`,
    filedAt: dartReceiptDate(rows),
    accessionOrReceiptNumber: receiptNumber,
  };
}

function corpReceiptId(receiptNumber: string) {
  return receiptNumber.replace(/[^0-9]/g, '');
}

async function fetchKoreanAnnualSeries(apiKey: string, corpCode: string) {
  const report = DART_REPORTS.find((item) => item.fiscalPeriod === 'FY')!;
  const candidates = await Promise.all(annualDartYears().map(async (year) => {
    for (const fsDiv of DART_FS_DIVS) {
      const result = await fetchOpenDartRows({ apiKey, corpCode, year, reportCode: report.code, fsDiv });
      if (result.status !== 'ok') continue;
      const metrics = buildDartMetrics(result.rows);
      if (dartSourceStatusFor({
        revenue: metrics.revenue,
        operatingIncome: metrics.operatingIncome,
        netIncome: metrics.netIncome,
        operatingCashFlow: metrics.operatingCashFlow,
        totalLiabilities: metrics.totalLiabilities,
        stockholdersEquity: metrics.stockholdersEquity,
        assetsCurrent: metrics.assetsCurrent,
        liabilitiesCurrent: metrics.liabilitiesCurrent,
        interestExpense: metrics.interestExpense,
        capitalExpenditures: metrics.capitalExpenditures,
        depreciationAndAmortization: metrics.depreciationAndAmortization,
      }) === 'not-found') continue;
      return { period: buildDartSeriesPeriod(year, fsDiv, result.rows, metrics), metrics, rows: result.rows };
    }
    return null;
  }));
  return candidates.filter((item): item is NonNullable<typeof item> => Boolean(item)).sort((a, b) => a.period.periodEnd.localeCompare(b.period.periodEnd)).slice(-5);
}

async function fetchOpenDartMetrics({
  apiKey,
  corpCode,
  year,
  reportCode,
  fsDiv,
}: {
  apiKey: string;
  corpCode: string;
  year: string;
  reportCode: string;
  fsDiv: string;
}) {
  const result = await fetchOpenDartRows({ apiKey, corpCode, year, reportCode, fsDiv });
  if (result.status !== 'ok') return null;
  const metrics = buildDartMetrics(result.rows);
  const sourceStatus = dartSourceStatusFor({
    revenue: metrics.revenue,
    operatingIncome: metrics.operatingIncome,
    netIncome: metrics.netIncome,
    operatingCashFlow: metrics.operatingCashFlow,
    totalLiabilities: metrics.totalLiabilities,
    stockholdersEquity: metrics.stockholdersEquity,
    assetsCurrent: metrics.assetsCurrent,
    liabilitiesCurrent: metrics.liabilitiesCurrent,
    interestExpense: metrics.interestExpense,
    capitalExpenditures: metrics.capitalExpenditures,
    depreciationAndAmortization: metrics.depreciationAndAmortization,
  });
  return sourceStatus === 'not-found' ? null : metrics;
}

function dartComparison(current: DartMetrics, priorYear: DartMetrics | null): FinancialComparison {
  const comparison: FinancialComparison = {};
  const revenue = comparisonMetric(percentageChange(current.revenue, priorYear?.revenue), null);
  const operatingIncome = comparisonMetric(percentageChange(current.operatingIncome, priorYear?.operatingIncome), null);
  const operatingCashFlow = comparisonMetric(percentageChange(current.operatingCashFlow, priorYear?.operatingCashFlow), null);

  if (revenue) comparison.revenue = revenue;
  if (operatingIncome) comparison.operatingIncome = operatingIncome;
  if (operatingCashFlow) comparison.operatingCashFlow = operatingCashFlow;
  return comparison;
}

async function buildKoreanFinancialsResponse(country: string, companyId: string, corpCode: string, cik: string, period: string) {
  const openDartApiKey = process.env.OPENDART_API_KEY;
  if (!openDartApiKey) {
    return {
      ok: true,
      country,
      companyId,
      cik,
      corpCode,
      source: 'OpenDART',
      sourceStatus: 'missing-env',
      reportType: null,
      fiscalYear: null,
      fiscalPeriod: null,
      asOf: null,
      metrics: emptyMetrics(),
      rawAvailable: emptyRawAvailable(),
      message: 'OPENDART_API_KEY is required for OpenDART requests.',
      env: {
        secUserAgent: hasEnv('SEC_USER_AGENT') ? 'present' : 'missing',
        openDartApiKey: 'missing',
      },
    };
  }

  if (!corpCode) {
    return {
      ok: false,
      country,
      companyId,
      cik,
      corpCode,
      source: 'OpenDART',
      sourceStatus: 'not-found',
      reportType: null,
      fiscalYear: null,
      fiscalPeriod: null,
      asOf: null,
      metrics: emptyMetrics(),
      rawAvailable: emptyRawAvailable(),
      message: 'corpCode is required for Korean OpenDART requests.',
      env: {
        secUserAgent: hasEnv('SEC_USER_AGENT') ? 'present' : 'missing',
        openDartApiKey: 'present',
      },
    };
  }

  if (period === 'annual') {
    const annualSeries = await fetchKoreanAnnualSeries(openDartApiKey, corpCode);
    const latest = annualSeries.at(-1);
    if (latest) {
      const { currency, amountBasis, ...metrics } = latest.metrics;
      const values = {
        revenue: metrics.revenue,
        operatingIncome: metrics.operatingIncome,
        netIncome: metrics.netIncome,
        operatingCashFlow: metrics.operatingCashFlow,
        totalLiabilities: metrics.totalLiabilities,
        stockholdersEquity: metrics.stockholdersEquity,
        assetsCurrent: metrics.assetsCurrent,
        liabilitiesCurrent: metrics.liabilitiesCurrent,
        interestExpense: metrics.interestExpense,
        capitalExpenditures: metrics.capitalExpenditures,
        depreciationAndAmortization: metrics.depreciationAndAmortization,
      };
      const prior = annualSeries.length > 1 ? annualSeries.at(-2)?.metrics ?? null : null;
      return {
        ok: true,
        country,
        companyId,
        cik,
        corpCode,
        source: 'OpenDART',
        sourceStatus: dartSourceStatusFor(values),
        reportType: latest.period.filingType,
        fiscalYear: latest.period.fiscalYear,
        fiscalPeriod: 'FY',
        asOf: latest.period.filedAt,
        currency,
        amountBasis,
        periodBasis: 'OpenDART annual business reports; consolidated statements preferred',
        metrics,
        comparison: dartComparison(latest.metrics, prior),
        rawAvailable: rawAvailableFromValues(values),
        series: { periodType: 'annual', periods: annualSeries.map((item) => item.period), requestedLimit: 5, complete: annualSeries.length >= 2 },
        message: 'OpenDART annual series loaded. Amounts in series are normalized to currency millions; missing years and metrics remain missing.',
        env: { secUserAgent: hasEnv('SEC_USER_AGENT') ? 'present' : 'missing', openDartApiKey: 'present' },
      };
    }
  }

  let lastApiError = '';
  for (const year of recentDartYears()) {
    for (const report of DART_REPORTS) {
      for (const fsDiv of DART_FS_DIVS) {
        const result = await fetchOpenDartRows({
          apiKey: openDartApiKey,
          corpCode,
          year,
          reportCode: report.code,
          fsDiv,
        });

        if (result.status === 'api-error') {
          lastApiError = result.message;
          continue;
        }
        if (result.status !== 'ok') continue;

        const selectedMetrics = buildDartMetrics(result.rows);
        const { currency, amountBasis, ...metrics } = selectedMetrics;
        const dartValues = {
          revenue: metrics.revenue,
          operatingIncome: metrics.operatingIncome,
          netIncome: metrics.netIncome,
          operatingCashFlow: metrics.operatingCashFlow,
          totalLiabilities: metrics.totalLiabilities,
          stockholdersEquity: metrics.stockholdersEquity,
          assetsCurrent: metrics.assetsCurrent,
          liabilitiesCurrent: metrics.liabilitiesCurrent,
          interestExpense: metrics.interestExpense,
          capitalExpenditures: metrics.capitalExpenditures,
          depreciationAndAmortization: metrics.depreciationAndAmortization,
        };
        const sourceStatus = dartSourceStatusFor(dartValues);
        if (sourceStatus === 'not-found') continue;
        const priorYear = Number(year) > 0
          ? await fetchOpenDartMetrics({
              apiKey: openDartApiKey,
              corpCode,
              year: String(Number(year) - 1),
              reportCode: report.code,
              fsDiv,
            })
          : null;

        return {
          ok: true,
          country,
          companyId,
          cik,
          corpCode,
          source: 'OpenDART',
          sourceStatus,
          reportType: `${report.label} ${fsDiv}`,
          fiscalYear: year,
          fiscalPeriod: report.fiscalPeriod,
          asOf: dartReceiptDate(result.rows),
          currency,
          amountBasis,
          periodBasis: 'OpenDART regular filing disclosure basis',
          metrics,
          comparison: dartComparison(selectedMetrics, priorYear),
          rawAvailable: rawAvailableFromValues(dartValues),
          message: 'OpenDART data loaded. Amounts are parsed from raw OpenDART thstrm_amount strings and are not rescaled by this API. Currency follows the OpenDART currency field when available.',
          env: {
            secUserAgent: hasEnv('SEC_USER_AGENT') ? 'present' : 'missing',
            openDartApiKey: 'present',
          },
        };
      }
    }
  }

  return {
    ok: true,
    country,
    companyId,
    cik,
    corpCode,
    source: 'OpenDART',
    sourceStatus: lastApiError ? 'api-error' : 'not-found',
    reportType: null,
    fiscalYear: null,
    fiscalPeriod: null,
    asOf: null,
    metrics: emptyMetrics(),
    rawAvailable: emptyRawAvailable(),
    message: lastApiError || 'No usable OpenDART financial metrics found.',
    env: {
      secUserAgent: hasEnv('SEC_USER_AGENT') ? 'present' : 'missing',
      openDartApiKey: 'present',
    },
  };
}

async function buildUsFinancialsResponse(country: string, companyId: string, cik: string, corpCode: string, period: string) {
  const secUserAgent = process.env.SEC_USER_AGENT;
  if (!secUserAgent) {
    return {
      ok: true,
      country,
      companyId,
      cik,
      corpCode,
      source: 'SEC',
      sourceStatus: 'missing-env',
      reportType: null,
      fiscalYear: null,
      fiscalPeriod: null,
      asOf: null,
      metrics: {
        revenue: null,
        operatingIncome: null,
        netIncome: null,
        operatingCashFlow: null,
        cashFlow: null,
        totalLiabilities: null,
        stockholdersEquity: null,
        assetsCurrent: null,
        liabilitiesCurrent: null,
        interestExpense: null,
        capitalExpenditures: null,
        freeCashFlow: null,
        eps: null,
        depreciationAndAmortization: null,
        debtToEquity: null,
        currentRatio: null,
        interestCoverage: null,
        operatingMargin: null,
        debtRatio: null,
      },
      rawAvailable: {
        revenue: false,
        operatingIncome: false,
        netIncome: false,
        operatingCashFlow: false,
        totalLiabilities: false,
        stockholdersEquity: false,
        assetsCurrent: false,
        liabilitiesCurrent: false,
        interestExpense: false,
        capitalExpenditures: false,
        eps: false,
        depreciationAndAmortization: false,
      },
      message: 'SEC_USER_AGENT is required for SEC CompanyFacts requests.',
      env: {
        secUserAgent: 'missing',
        openDartApiKey: hasEnv('OPENDART_API_KEY') ? 'present' : 'missing',
      },
    };
  }

  const secResult = await fetchSecCompanyFacts(cik, secUserAgent);
  if (!secResult.ok) {
    return {
      ok: true,
      country,
      companyId,
      cik,
      corpCode,
      source: 'SEC',
      sourceStatus: 'not-found',
      reportType: null,
      fiscalYear: null,
      fiscalPeriod: null,
      asOf: null,
      metrics: {
        revenue: null,
        operatingIncome: null,
        netIncome: null,
        operatingCashFlow: null,
        cashFlow: null,
        totalLiabilities: null,
        stockholdersEquity: null,
        assetsCurrent: null,
        liabilitiesCurrent: null,
        interestExpense: null,
        capitalExpenditures: null,
        freeCashFlow: null,
        eps: null,
        depreciationAndAmortization: null,
        debtToEquity: null,
        currentRatio: null,
        interestCoverage: null,
        operatingMargin: null,
        debtRatio: null,
      },
      rawAvailable: {
        revenue: false,
        operatingIncome: false,
        netIncome: false,
        operatingCashFlow: false,
        totalLiabilities: false,
        stockholdersEquity: false,
        assetsCurrent: false,
        liabilitiesCurrent: false,
        interestExpense: false,
        capitalExpenditures: false,
        eps: false,
        depreciationAndAmortization: false,
      },
      message: secResult.message,
      env: {
        secUserAgent: 'present',
        openDartApiKey: hasEnv('OPENDART_API_KEY') ? 'present' : 'missing',
      },
    };
  }

  const foreign20FConfig = SEC_20F_COMPANIES[companyId];
  const facts = secResult.payload.facts?.[foreign20FConfig?.taxonomy ?? 'us-gaap'];
  const selected = foreign20FConfig
    ? selectAnnual20FMetrics(facts, foreign20FConfig.concepts, foreign20FConfig.preferredCurrency)
    : selectSecMetrics(facts);
  const sourceStatus = sourceStatusFor(selected);
  const reportFact = reportFactFor(selected);
  const currency = foreign20FConfig?.preferredCurrency ?? secCurrencyFromSelected(selected) ?? 'USD';
  const operatingCashFlow = selected.operatingCashFlow?.value ?? null;
  const capitalExpenditures = selected.capitalExpenditures?.value ?? null;
  const freeCashFlow =
    operatingCashFlow !== null && capitalExpenditures !== null
      ? operatingCashFlow - Math.abs(capitalExpenditures)
      : null;

  const annualPeriods = period === 'annual' && !foreign20FConfig
    ? factsToAnnualPeriods(
        normalizeSecCompanyFacts(secResult.payload as unknown as SecCompanyFactsPayload, companyId).facts,
        2,
      ).slice(-5).map<FinancialSeriesPeriod>((item) => {
        const sourceIds = item.sourceIds;
        const accession = sourceIds.map((sourceId) => sourceId.split(':')[2]).find(Boolean) ?? null;
        return {
          label: item.fiscalYear ? `FY ${item.fiscalYear}` : item.periodEnd,
          periodEnd: item.periodEnd,
          fiscalYear: item.fiscalYear ?? null,
          fiscalPeriod: 'FY',
          currency: item.currency,
          unit: 'million',
          metrics: Object.fromEntries(Object.entries(item.metrics).filter((entry): entry is [string, number] => typeof entry[1] === 'number')),
          sourceIds,
          filingType: 'SEC 10-K',
          filedAt: secFiledAtForAccession(secResult.payload, accession),
          accessionOrReceiptNumber: accession,
        };
      })
    : [];

  const currentSeries: FinancialSeriesPeriod[] = period === 'quarterly' && reportFact
    ? [{
        label: [reportFact.fy ? `FY ${reportFact.fy}` : '', reportFact.fp ?? '최근 분기'].filter(Boolean).join(' '),
        periodEnd: reportFact.end ?? reportFact.filed ?? '',
        fiscalYear: reportFact.fy ?? null,
        fiscalPeriod: reportFact.fp ?? '최근 분기',
        currency,
        unit: 'million',
        metrics: Object.fromEntries(Object.entries({
          revenue: selected.revenue?.value !== undefined ? selected.revenue.value / 1_000_000 : undefined,
          operatingIncome: selected.operatingIncome?.value !== undefined ? selected.operatingIncome.value / 1_000_000 : undefined,
          netIncome: selected.netIncome?.value !== undefined ? selected.netIncome.value / 1_000_000 : undefined,
          operatingCashFlow: operatingCashFlow !== null ? operatingCashFlow / 1_000_000 : undefined,
          capitalExpenditure: capitalExpenditures !== null ? capitalExpenditures / 1_000_000 : undefined,
          freeCashFlow: freeCashFlow !== null ? freeCashFlow / 1_000_000 : undefined,
          totalLiabilities: selected.totalLiabilities?.value !== undefined ? selected.totalLiabilities.value / 1_000_000 : undefined,
          totalEquity: selected.stockholdersEquity?.value !== undefined ? selected.stockholdersEquity.value / 1_000_000 : undefined,
          currentAssets: selected.assetsCurrent?.value !== undefined ? selected.assetsCurrent.value / 1_000_000 : undefined,
          currentLiabilities: selected.liabilitiesCurrent?.value !== undefined ? selected.liabilitiesCurrent.value / 1_000_000 : undefined,
          dilutedEps: selected.eps?.value,
        }).filter((entry): entry is [string, number] => typeof entry[1] === 'number')),
        sourceIds: [`sec:${paddedCik(cik)}:${reportFact.filed ?? reportFact.end ?? 'latest'}`],
        filingType: reportFact.form ?? 'SEC filing',
        filedAt: reportFact.filed ?? null,
        accessionOrReceiptNumber: null,
      }]
    : [];

  return {
    ok: true,
    country,
    companyId,
    cik,
    corpCode,
    source: 'SEC',
    sourceStatus,
    reportType: foreign20FConfig ? '20-F' : reportFact?.form ?? null,
    fiscalYear: reportFact?.fy ? String(reportFact.fy) : null,
    fiscalPeriod: reportFact?.fp ?? null,
    asOf: reportFact?.filed ?? null,
    currency,
    amountBasis: foreign20FConfig
      ? `SEC CompanyFacts ${foreign20FConfig.taxonomy} ${currency}`
      : `SEC CompanyFacts ${currency}`,
    periodBasis: foreign20FConfig ? 'SEC 20-F annual facts only' : 'SEC 10-K/10-Q CompanyFacts selector',
    metrics: {
      revenue: selected.revenue?.value ?? null,
      operatingIncome: selected.operatingIncome?.value ?? null,
      netIncome: selected.netIncome?.value ?? null,
      operatingCashFlow,
      cashFlow: operatingCashFlow,
      totalLiabilities: selected.totalLiabilities?.value ?? null,
      stockholdersEquity: selected.stockholdersEquity?.value ?? null,
      assetsCurrent: selected.assetsCurrent?.value ?? null,
      liabilitiesCurrent: selected.liabilitiesCurrent?.value ?? null,
      interestExpense: selected.interestExpense?.value ?? null,
      capitalExpenditures,
      freeCashFlow,
      eps: selected.eps?.value ?? null,
      depreciationAndAmortization: selected.depreciationAndAmortization?.value ?? null,
      debtToEquity: safeRatio(selected.totalLiabilities, selected.stockholdersEquity),
      currentRatio: safeRatio(selected.assetsCurrent, selected.liabilitiesCurrent),
      interestCoverage: safeRatio(selected.operatingIncome, selected.interestExpense),
      operatingMargin: null,
      debtRatio: null,
    },
    rawAvailable: rawAvailability(selected),
    comparison: foreign20FConfig ? undefined : secComparison(facts, selected),
    series: {
      periodType: period === 'quarterly' ? 'quarterly' : 'annual',
      periods: period === 'quarterly' ? currentSeries : annualPeriods,
      requestedLimit: period === 'quarterly' ? 8 : 5,
      complete: period === 'annual' ? annualPeriods.length >= 2 : false,
    },
    message: sourceStatus === 'not-found'
      ? 'No usable SEC CompanyFacts metrics found.'
      : foreign20FConfig
        ? 'SEC CompanyFacts 20-F annual data loaded. Only the configured foreign issuer and preferred currency facts are selected.'
        : 'SEC CompanyFacts data loaded.',
    env: {
      secUserAgent: 'present',
      openDartApiKey: hasEnv('OPENDART_API_KEY') ? 'present' : 'missing',
    },
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method && req.method !== 'GET') {
    res.setHeader?.('Allow', 'GET');
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  const country = firstQueryValue(req.query?.country);
  const companyId = firstQueryValue(req.query?.companyId);
  const cik = firstQueryValue(req.query?.cik);
  const corpCode = firstQueryValue(req.query?.corpCode);
  const requestedPeriod = firstQueryValue(req.query?.period);
  const period = requestedPeriod === 'quarterly' ? 'quarterly' : 'annual';
  const normalizedCountry = country.trim().toUpperCase();

  if (normalizedCountry === 'US' && cik) {
    res.status(200).json(await buildUsFinancialsResponse(normalizedCountry, companyId, cik, corpCode, period));
    return;
  }

  if (normalizedCountry === 'KR') {
    res.status(corpCode ? 200 : 400).json(await buildKoreanFinancialsResponse(normalizedCountry, companyId, corpCode, cik, period));
    return;
  }

  const neededEnvKeys = requiredEnvKeys(country);
  const hasRequiredEnv = neededEnvKeys.every(hasEnv);

  res.status(200).json({
    ok: true,
    country,
    companyId,
    cik,
    corpCode,
    source: normalizedCountry === 'KR' ? 'OpenDART' : 'placeholder',
    reportType: null,
    fiscalYear: null,
    fiscalPeriod: null,
    asOf: null,
    metrics: {
      revenue: null,
      operatingIncome: null,
      netIncome: null,
      operatingCashFlow: null,
      cashFlow: null,
      totalLiabilities: null,
      stockholdersEquity: null,
      assetsCurrent: null,
      liabilitiesCurrent: null,
      interestExpense: null,
      capitalExpenditures: null,
      freeCashFlow: null,
      eps: null,
      depreciationAndAmortization: null,
      debtToEquity: null,
      currentRatio: null,
      interestCoverage: null,
      operatingMargin: null,
      debtRatio: null,
    },
    rawAvailable: {
      revenue: false,
      operatingIncome: false,
      netIncome: false,
      operatingCashFlow: false,
      totalLiabilities: false,
      stockholdersEquity: false,
      assetsCurrent: false,
      liabilitiesCurrent: false,
      interestExpense: false,
      capitalExpenditures: false,
      eps: false,
      depreciationAndAmortization: false,
    },
    sourceStatus: hasRequiredEnv ? 'not-found' : 'missing-env',
    message: 'Financial metrics are not connected for this request yet.',
    env: {
      secUserAgent: hasEnv('SEC_USER_AGENT') ? 'present' : 'missing',
      openDartApiKey: hasEnv('OPENDART_API_KEY') ? 'present' : 'missing',
    },
  });
}

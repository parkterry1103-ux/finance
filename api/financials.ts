declare const process: {
  env: Record<string, string | undefined>;
};

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
  end?: string;
  fy?: number;
  fp?: string;
  form?: string;
  filed?: string;
  val?: number;
};

type SecConceptFacts = {
  units?: Record<string, SecFact[] | undefined>;
};

type CompanyFactsPayload = {
  cik?: string | number;
  facts?: {
    'us-gaap'?: Record<string, SecConceptFacts | undefined>;
  };
};

type SelectedMetric = {
  value: number;
  fact: SecFact;
  concept: string;
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
  const preferredUnit = units?.USD;
  const facts = preferredUnit?.length ? preferredUnit : Object.values(units ?? {}).flatMap((items) => items ?? []);
  return facts
    .filter(validFact)
    .filter((fact) => fact.form === '10-Q' || fact.form === '10-K')
    .sort(compareFacts);
}

function selectMetric(
  facts: Record<string, SecConceptFacts | undefined> | undefined,
  concepts: string[],
): SelectedMetric | null {
  const candidates = concepts.flatMap((concept, conceptIndex) =>
    rankedFacts(facts?.[concept]?.units).map((fact) => ({ concept, conceptIndex, fact })),
  );
  const selected = candidates.sort((a, b) => compareFacts(a.fact, b.fact) || a.conceptIndex - b.conceptIndex)[0];
  return selected?.fact.val !== undefined ? { value: selected.fact.val, fact: selected.fact, concept: selected.concept } : null;
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

function rawAvailability(metrics: Record<keyof typeof SEC_CONCEPTS, SelectedMetric | null>) {
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

function sourceStatusFor(metrics: Record<keyof typeof SEC_CONCEPTS, SelectedMetric | null>) {
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

function reportFactFor(metrics: Record<keyof typeof SEC_CONCEPTS, SelectedMetric | null>) {
  return (
    metrics.revenue?.fact ??
    metrics.operatingIncome?.fact ??
    metrics.netIncome?.fact ??
    metrics.operatingCashFlow?.fact ??
    Object.values(metrics).find(Boolean)?.fact
  );
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

async function buildKoreanFinancialsResponse(country: string, companyId: string, corpCode: string, cik: string) {
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

async function buildUsFinancialsResponse(country: string, companyId: string, cik: string, corpCode: string) {
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

  const facts = secResult.payload.facts?.['us-gaap'];
  const selected = {
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
  const sourceStatus = sourceStatusFor(selected);
  const reportFact = reportFactFor(selected);
  const operatingCashFlow = selected.operatingCashFlow?.value ?? null;
  const capitalExpenditures = selected.capitalExpenditures?.value ?? null;
  const freeCashFlow =
    operatingCashFlow !== null && capitalExpenditures !== null
      ? operatingCashFlow - Math.abs(capitalExpenditures)
      : null;

  return {
    ok: true,
    country,
    companyId,
    cik,
    corpCode,
    source: 'SEC',
    sourceStatus,
    reportType: reportFact?.form ?? null,
    fiscalYear: reportFact?.fy ? String(reportFact.fy) : null,
    fiscalPeriod: reportFact?.fp ?? null,
    asOf: reportFact?.filed ?? null,
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
    message: sourceStatus === 'not-found' ? 'No usable SEC CompanyFacts metrics found.' : 'SEC CompanyFacts data loaded.',
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
  const normalizedCountry = country.trim().toUpperCase();

  if (normalizedCountry === 'US' && cik) {
    res.status(200).json(await buildUsFinancialsResponse(normalizedCountry, companyId, cik, corpCode));
    return;
  }

  if (normalizedCountry === 'KR') {
    res.status(corpCode ? 200 : 400).json(await buildKoreanFinancialsResponse(normalizedCountry, companyId, corpCode, cik));
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

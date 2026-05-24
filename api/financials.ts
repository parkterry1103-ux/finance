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

const SEC_TIMEOUT_MS = 8000;

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
  };
  const sourceStatus = sourceStatusFor(selected);
  const reportFact = reportFactFor(selected);
  const operatingCashFlow = selected.operatingCashFlow?.value ?? null;

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
    },
    sourceStatus: hasRequiredEnv ? 'not-found' : 'missing-env',
    message: 'Financial metrics are not connected for this request yet.',
    env: {
      secUserAgent: hasEnv('SEC_USER_AGENT') ? 'present' : 'missing',
      openDartApiKey: hasEnv('OPENDART_API_KEY') ? 'present' : 'missing',
    },
  });
}

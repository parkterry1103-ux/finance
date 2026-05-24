import { financialMetricGuides } from '../data.js';
import type {
  Company,
  FilingSourceStatus,
  FinancialMetric,
  FinancialMetricKey,
  FinancialStatementSummary,
} from '../data.js';
import { resolveCompanyFilingLinks } from './filings.js';

type DartAccountRow = {
  account_nm?: string;
  thstrm_amount?: string;
  frmtrm_amount?: string;
};

type SecFactUnit = {
  end?: string;
  fy?: number;
  fp?: string;
  form?: string;
  filed?: string;
  val?: number;
};

type FinancialsApiSourceStatus = 'direct' | 'partial' | 'missing-env' | 'not-found' | 'api-error';

type FinancialsApiMetrics = {
  revenue?: number | null;
  operatingIncome?: number | null;
  netIncome?: number | null;
  operatingCashFlow?: number | null;
  debtToEquity?: number | null;
  currentRatio?: number | null;
  interestCoverage?: number | null;
  capitalExpenditures?: number | null;
  freeCashFlow?: number | null;
  eps?: number | null;
  depreciationAndAmortization?: number | null;
};

type FinancialsApiResponse = {
  ok?: boolean;
  country?: string;
  companyId?: string;
  source?: string;
  sourceStatus?: FinancialsApiSourceStatus | string;
  reportType?: string | null;
  fiscalYear?: string | number | null;
  fiscalPeriod?: string | null;
  asOf?: string | null;
  currency?: string | null;
  amountBasis?: string | null;
  periodBasis?: string | null;
  metrics?: FinancialsApiMetrics;
  message?: string;
};

const API_TIMEOUT_MS = 10000;
const KR_API_TIMEOUT_MS = 30000;
const OFFICIAL_DATA_REQUIRED = '공식 데이터 연결 필요';

function envValue(key: string) {
  const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } };
  return runtime.process?.env?.[key];
}

function compactAmount(value: string | number | undefined, unit = '') {
  if (value === undefined || value === '') return '확인 필요';
  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
  if (!Number.isFinite(numeric)) return String(value);
  if (unit === '원') {
    const abs = Math.abs(numeric);
    if (abs >= 1_000_000_000_000) return `${(numeric / 1_000_000_000_000).toFixed(1)}조원`;
    if (abs >= 100_000_000) return `${(numeric / 100_000_000).toFixed(1)}억원`;
    return `${numeric.toLocaleString('ko-KR')}원`;
  }
  if (unit === 'USD') {
    const abs = Math.abs(numeric);
    if (abs >= 1_000_000_000) return `$${(numeric / 1_000_000_000).toFixed(1)}B`;
    if (abs >= 1_000_000) return `$${(numeric / 1_000_000).toFixed(1)}M`;
    return `$${numeric.toLocaleString('en-US')}`;
  }
  return `${numeric.toLocaleString('ko-KR')}${unit ? ` ${unit}` : ''}`;
}

function compactRatio(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return OFFICIAL_DATA_REQUIRED;
  return `${value.toFixed(1)}x`;
}

function compactUsdMetric(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return OFFICIAL_DATA_REQUIRED;
  return compactAmount(value, 'USD');
}

function normalizeCurrencyLabel(currency?: string | null) {
  const normalized = String(currency ?? '').trim().toUpperCase();
  if (!normalized) return '';
  if (normalized === 'KRW' || normalized === '원' || normalized === '￦' || normalized === '₩') return 'KRW';
  return normalized;
}

function openDartUnitLabel(currency?: string | null) {
  const normalizedCurrency = normalizeCurrencyLabel(currency);
  return normalizedCurrency ? `OpenDART 원문 ${normalizedCurrency}` : 'OpenDART 원문 단위';
}

function formatOpenDartAmount(value: number | null | undefined, currency?: string | null) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return OFFICIAL_DATA_REQUIRED;
  if (normalizeCurrencyLabel(currency) === 'KRW') return compactAmount(value, '원');
  return value.toLocaleString('ko-KR');
}

function compactUsdPerShare(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return OFFICIAL_DATA_REQUIRED;
  return `$${value.toFixed(2)}`;
}

function metric(
  key: FinancialMetricKey,
  label: string,
  value: string,
  keyTakeaway: string,
  unit?: string,
): FinancialMetric {
  return {
    key,
    label,
    value,
    unit,
    beginnerExplanation: financialMetricGuides[key],
    keyTakeaway,
  };
}

function isConnectedApiStatus(status?: string): status is 'direct' | 'partial' {
  return status === 'direct' || status === 'partial';
}

function apiMetricValue(metrics: FinancialsApiMetrics | undefined, key: keyof FinancialsApiMetrics) {
  const value = metrics?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function financialsApiUrl(company: Company) {
  if (company.country === 'KR' && company.corpCode) {
    const params = new URLSearchParams({
      country: company.country,
      corpCode: company.corpCode,
      companyId: company.id,
    });
    return `/api/financials?${params.toString()}`;
  }

  const params = new URLSearchParams({
    country: company.country,
    companyId: company.id,
  });
  if (company.cik) params.set('cik', company.cik);
  return `/api/financials?${params.toString()}`;
}

async function fetchJsonWithTimeout(url: string, timeoutMs = API_TIMEOUT_MS): Promise<FinancialsApiResponse | null> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) return null;
    return (await response.json()) as FinancialsApiResponse;
  } catch {
    return null;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

function mapFinancialsApiResponse(
  company: Company,
  payload: FinancialsApiResponse,
  fallback: FinancialStatementSummary,
): FinancialStatementSummary | null {
  if (!isConnectedApiStatus(payload.sourceStatus)) return null;

  const metrics = payload.metrics ?? {};
  const revenue = apiMetricValue(metrics, 'revenue');
  const operatingIncome = apiMetricValue(metrics, 'operatingIncome');
  const netIncome = apiMetricValue(metrics, 'netIncome');
  const operatingCashFlow = apiMetricValue(metrics, 'operatingCashFlow');
  const debtToEquity = apiMetricValue(metrics, 'debtToEquity');
  const currentRatio = apiMetricValue(metrics, 'currentRatio');
  const interestCoverage = apiMetricValue(metrics, 'interestCoverage');
  const freeCashFlow = apiMetricValue(metrics, 'freeCashFlow');
  const eps = apiMetricValue(metrics, 'eps');
  const depreciationAndAmortization = apiMetricValue(metrics, 'depreciationAndAmortization');

  const metricItems: FinancialMetric[] = [
    metric('revenue', '매출', compactUsdMetric(revenue), 'SEC CompanyFacts 기준 매출입니다. 세부 사업부 매출은 MD&A에서 함께 확인합니다.', 'USD'),
    metric('operatingIncome', '영업이익', compactUsdMetric(operatingIncome), '본업 수익성이 실제 이익 금액으로 이어졌는지 봅니다.', 'USD'),
    metric('netIncome', '순이익', compactUsdMetric(netIncome), '세금과 금융비용까지 반영한 최종 이익입니다.', 'USD'),
    metric('cashFlow', '영업현금흐름', compactUsdMetric(operatingCashFlow), '장부상 이익이 실제 현금으로 바뀌는지 확인합니다.', 'USD'),
    metric('debtRatio', '부채비율', compactRatio(debtToEquity), '자기자본 대비 부채 부담을 보는 안정성 지표입니다.', 'x'),
    metric('currentRatio', '유동비율', compactRatio(currentRatio), '단기 부채를 감당할 유동자산 여력을 봅니다.', 'x'),
    metric('interestCoverage', '이자보상배율', compactRatio(interestCoverage), '영업이익으로 이자비용을 얼마나 감당하는지 봅니다.', 'x'),
    metric('freeCashFlow', 'FCF', compactUsdMetric(freeCashFlow), '영업현금흐름에서 CAPEX를 뺀 현금 여력입니다.', 'USD'),
    metric('eps', 'EPS', compactUsdPerShare(eps), '희석 EPS가 있으면 우선 사용하고, 없으면 기본 EPS를 사용합니다.', 'USD/share'),
    metric(
      'depreciationAndAmortization',
      '감가상각비',
      compactUsdMetric(depreciationAndAmortization),
      '설비와 무형자산 비용이 기간별로 반영되는 금액입니다.',
      'USD',
    ),
  ];

  const sourceLabel = payload.sourceStatus === 'partial' ? 'SEC 일부 원문 연결됨' : 'SEC 원문 연결됨';
  const reportType = payload.reportType ?? fallback.reportType;
  const fiscalYear = payload.fiscalYear ? String(payload.fiscalYear) : fallback.fiscalYear;
  const filingDate = payload.asOf ?? fallback.filingDate;

  return {
    ...fallback,
    companyId: company.id,
    status: 'api-live',
    fiscalYear,
    reportType,
    updatedAt: new Date().toISOString(),
    source: 'SEC CompanyFacts',
    sourceLabel,
    isApiData: true,
    isFallbackData: false,
    metrics: metricItems,
    beginnerExplanation: 'SEC CompanyFacts에서 가져온 공식 XBRL 숫자입니다. 세부 해석과 사업부 설명은 기존 MD&A/공시 해설과 함께 봅니다.',
    keyTakeaway:
      payload.sourceStatus === 'partial'
        ? '일부 공식 숫자가 연결되었습니다. 없는 항목은 가짜 숫자 대신 연결 필요 상태로 유지합니다.'
        : 'SEC 공식 숫자가 연결되었습니다. 먼저 볼 핵심 지표만 화면에 반영합니다.',
    fiscalPeriod: payload.fiscalPeriod ?? fallback.fiscalPeriod,
    filingDate,
    sourceStatus: payload.sourceStatus,
  };
}

function mapKoreanFinancialsApiResponse(
  company: Company,
  payload: FinancialsApiResponse,
  fallback: FinancialStatementSummary,
): FinancialStatementSummary | null {
  if (!isConnectedApiStatus(payload.sourceStatus)) return null;

  const metrics = payload.metrics ?? {};
  const revenue = apiMetricValue(metrics, 'revenue');
  const operatingIncome = apiMetricValue(metrics, 'operatingIncome');
  const netIncome = apiMetricValue(metrics, 'netIncome');
  const operatingCashFlow = apiMetricValue(metrics, 'operatingCashFlow');
  const debtToEquity = apiMetricValue(metrics, 'debtToEquity');
  const currentRatio = apiMetricValue(metrics, 'currentRatio');
  const interestCoverage = apiMetricValue(metrics, 'interestCoverage');
  const capitalExpenditures = apiMetricValue(metrics, 'capitalExpenditures');
  const freeCashFlow = apiMetricValue(metrics, 'freeCashFlow');
  const depreciationAndAmortization = apiMetricValue(metrics, 'depreciationAndAmortization');
  const openDartUnit = openDartUnitLabel(payload.currency);
  const openDartAmountNote = `${openDartUnit} ${payload.amountBasis ?? 'thstrm_amount'} 기준입니다. 정기보고서 공시 기준 수치로 원문 기간 해석과 함께 봅니다.`;

  const metricItems: FinancialMetric[] = [
    metric('revenue', '매출', formatOpenDartAmount(revenue, payload.currency), `매출은 ${openDartAmountNote}`, openDartUnit),
    metric('operatingIncome', '영업이익', formatOpenDartAmount(operatingIncome, payload.currency), `영업이익은 ${openDartAmountNote}`, openDartUnit),
    metric('netIncome', '순이익', formatOpenDartAmount(netIncome, payload.currency), `순이익은 ${openDartAmountNote}`, openDartUnit),
    metric('cashFlow', '영업현금흐름', formatOpenDartAmount(operatingCashFlow, payload.currency), `영업현금흐름은 ${openDartAmountNote}`, openDartUnit),
    metric('debtRatio', '부채비율', compactRatio(debtToEquity), 'OpenDART 부채총계와 자본총계로 보는 안정성 지표입니다.', 'x'),
    metric('currentRatio', '유동비율', compactRatio(currentRatio), '단기 부채를 감당할 유동자산 여력을 봅니다.', 'x'),
    metric('interestCoverage', '이자보상배율', compactRatio(interestCoverage), '영업이익으로 이자비용을 얼마나 감당하는지 봅니다.', 'x'),
    metric('capitalExpenditures', 'CAPEX', formatOpenDartAmount(capitalExpenditures, payload.currency), `CAPEX는 ${openDartAmountNote}`, openDartUnit),
    metric('freeCashFlow', 'FCF', formatOpenDartAmount(freeCashFlow, payload.currency), `FCF는 ${openDartAmountNote}`, openDartUnit),
    metric(
      'depreciationAndAmortization',
      '감가상각비',
      formatOpenDartAmount(depreciationAndAmortization, payload.currency),
      `감가상각비는 ${openDartAmountNote}`,
      openDartUnit,
    ),
  ];

  const sourceLabel = payload.sourceStatus === 'partial' ? 'OpenDART 일부 원문 연결됨' : 'OpenDART 원문 연결됨';
  const reportType = payload.reportType ?? fallback.reportType;
  const fiscalYear = payload.fiscalYear ? String(payload.fiscalYear) : fallback.fiscalYear;
  const filingDate = payload.asOf ?? fallback.filingDate;

  return {
    ...fallback,
    companyId: company.id,
    status: 'api-live',
    fiscalYear,
    reportType,
    updatedAt: new Date().toISOString(),
    source: 'OpenDART',
    sourceLabel,
    isApiData: true,
    isFallbackData: false,
    metrics: metricItems,
    beginnerExplanation: 'OpenDART에서 가져온 공식 재무제표 원문 숫자입니다. 금액은 API가 재스케일링하지 않은 공시 기준 수치로 표시합니다.',
    keyTakeaway:
      payload.sourceStatus === 'partial'
        ? '일부 OpenDART 숫자가 연결되었습니다. 없는 항목은 가짜 숫자 대신 연결 필요 상태로 유지합니다.'
        : 'OpenDART 공식 숫자가 연결되었습니다. 정기보고서는 항목별 기간 기준이 다를 수 있어 원문 공시와 함께 봅니다.',
    fiscalPeriod: payload.fiscalPeriod ?? fallback.fiscalPeriod,
    filingDate,
    sourceStatus: payload.sourceStatus,
  };
}

async function fetchUSFinancialsFromApi(company: Company): Promise<FinancialStatementSummary | null> {
  if (company.country !== 'US' || !company.cik) return null;

  const fallback = buildFallbackFinancials(company);
  const payload = await fetchJsonWithTimeout(financialsApiUrl(company));
  if (!payload) return null;
  return mapFinancialsApiResponse(company, payload, fallback);
}

async function fetchKoreanFinancialsFromApi(company: Company): Promise<FinancialStatementSummary | null> {
  if (company.country !== 'KR' || !company.corpCode) return null;

  const fallback = buildFallbackFinancials(company);
  const payload = await fetchJsonWithTimeout(financialsApiUrl(company), KR_API_TIMEOUT_MS);
  if (!payload) return null;
  return mapKoreanFinancialsApiResponse(company, payload, fallback);
}

function latestSecFact(units?: Record<string, SecFactUnit[]>) {
  const usd = units?.USD ?? units?.shares ?? [];
  return [...usd]
    .filter((item) => typeof item.val === 'number')
    .sort((a, b) => (b.filed ?? '').localeCompare(a.filed ?? ''))[0];
}

function findDartAmount(rows: DartAccountRow[], names: string[]) {
  const row = rows.find((item) => names.some((name) => item.account_nm?.includes(name)));
  return row?.thstrm_amount;
}

function fallbackCashFlowLabel(company: Company, sourceStatus: FilingSourceStatus) {
  if (sourceStatus === 'private-company') return '비상장 기업으로 공시 의무 없음';
  if (sourceStatus === 'no-public-filing') return '공식 공시 기준 확인 불가';
  if (sourceStatus === 'listing-unknown') return '상장 정보 확인 필요';
  if (sourceStatus === 'needs-link') return '아직 연결된 원문 보고서가 없습니다';
  return '원문 보고서 확인 필요';
}

export function buildFallbackFinancials(company: Company): FinancialStatementSummary {
  const filingResolution = resolveCompanyFilingLinks(company);
  const reportUrl =
    company.reportUrl ??
    company.filingSourceUrl ??
    company.sourceDirectUrl ??
    (company.dartRcpNo ? `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${company.dartRcpNo}` : undefined);
  const sourceSearchUrl =
    (filingResolution.status === 'search-only' ? filingResolution.primary.url : undefined) ??
    company.sourceSearchUrl ??
    (company.country === 'KR'
      ? `https://dart.fss.or.kr/dsab007/main.do?option=corp&keyword=${encodeURIComponent(company.legalName || company.name)}`
      : `https://www.sec.gov/search-filings?keys=${encodeURIComponent(company.legalName || company.name)}`);

  const sourceStatus = filingResolution.status;

  return {
    companyId: company.id,
    status: reportUrl ? 'fallback' : 'needs-source',
    fiscalYear: company.fiscalYear ?? 'fallback',
    reportType: company.reportType ?? (company.country === 'KR' ? 'DART 원문 확인 전' : 'SEC 원문 확인 전'),
    updatedAt: new Date().toISOString(),
    source: 'fallback-data',
    sourceLabel: '기존 데이터 기반 fallback',
    isApiData: false,
    isFallbackData: true,
    metrics: [
      metric('revenue', '매출', company.revenue, 'API 키가 연결되면 최신 공시 매출로 자동 교체됩니다.', company.revenueUnit),
      metric('operatingMargin', '영업이익률', company.opMargin, '본업 수익성이 유지되는지 보는 기본 지표입니다.'),
      metric('debtRatio', '부채비율', company.debtRatio, '빚 부담이 큰 기업은 이자비용과 현금흐름을 같이 확인해야 합니다.'),
      metric(
        'cashFlow',
        '현금흐름',
        fallbackCashFlowLabel(company, sourceStatus),
        '이익이 실제 현금으로 들어오는지 확인하는 단계입니다.',
      ),
    ],
    beginnerExplanation:
      '아직 API 키 또는 회사 식별자가 없으면 기존 스크리닝 데이터와 해설을 먼저 보여줍니다. 숫자는 투자 판단 전 원문 보고서로 확인해야 합니다.',
    keyTakeaway: reportUrl
      ? '원문 보고서 링크가 있어 다음 단계에서 API 숫자를 검증해 붙이기 쉽습니다.'
      : '직접 원문 URL 또는 회사 식별자를 추가하면 자동 업데이트 정확도가 올라갑니다.',
    reportUrl,
    sourceDirectUrl: company.sourceDirectUrl ?? reportUrl,
    sourceSearchUrl,
    dartRcpNo: company.dartRcpNo,
    secAccessionNumber: company.secAccessionNumber,
    fiscalPeriod: company.fiscalPeriod,
    filingDate: company.filingDate,
    sourceStatus,
  };
}

export async function fetchKoreanFinancialsFromOpenDart(
  corpCode?: string,
  year = String(new Date().getFullYear() - 1),
  reportCode = '11011',
): Promise<FinancialStatementSummary | null> {
  const apiKey = envValue('OPENDART_API_KEY');
  if (!apiKey || !corpCode) return null;

  // OpenDART: 한국 기업 재무제표 자동 업데이트용 공식 API입니다.
  // reportCode 예: 11011 사업보고서, 11012 반기보고서, 11013 1분기, 11014 3분기.
  const params = new URLSearchParams({
    crtfc_key: apiKey,
    corp_code: corpCode,
    bsns_year: year,
    reprt_code: reportCode,
    fs_div: 'CFS',
  });

  try {
    const response = await fetch(`https://opendart.fss.or.kr/api/fnlttSinglAcntAll.json?${params.toString()}`);
    if (!response.ok) return null;
    const payload = await response.json();
    const rows = Array.isArray(payload.list) ? (payload.list as DartAccountRow[]) : [];
    if (payload.status !== '000' || rows.length === 0) return null;

    const revenue = findDartAmount(rows, ['매출액', '영업수익']);
    const operatingIncome = findDartAmount(rows, ['영업이익']);
    const netIncome = findDartAmount(rows, ['당기순이익', '분기순이익', '반기순이익']);
    const cashFlow = findDartAmount(rows, ['영업활동 현금흐름', '영업활동으로 인한 현금흐름']);

    return {
      companyId: corpCode,
      status: 'api-live',
      fiscalYear: year,
      reportType: `OpenDART ${reportCode}`,
      updatedAt: new Date().toISOString(),
      source: 'OpenDART',
      sourceLabel: 'OpenDART API',
      isApiData: true,
      isFallbackData: false,
      metrics: [
        metric('revenue', '매출', compactAmount(revenue, '원'), '매출이 늘면 수요가 커졌는지 먼저 봅니다.'),
        metric('operatingIncome', '영업이익', compactAmount(operatingIncome, '원'), '본업으로 실제 돈을 벌고 있는지 확인합니다.'),
        metric('netIncome', '순이익', compactAmount(netIncome, '원'), '세금과 금융비용까지 반영한 최종 성과입니다.'),
        metric('cashFlow', '영업현금흐름', compactAmount(cashFlow, '원'), '이익이 현금으로 바뀌는지 확인합니다.'),
      ],
      beginnerExplanation: 'OpenDART에서 가져온 최신 공시 숫자입니다. 기존 해설을 대체하지 않고, 해설을 검증하는 보조 지표로 사용합니다.',
      keyTakeaway: '매출, 이익, 현금흐름이 같은 방향으로 좋아지는지 확인하는 것이 핵심입니다.',
    };
  } catch {
    return null;
  }
}

export async function fetchUSFinancialsFromSEC(cik?: string): Promise<FinancialStatementSummary | null> {
  if (!cik) return null;

  // SEC EDGAR CompanyFacts: 미국 기업 재무제표 공식 공개 endpoint입니다.
  // 브라우저 CORS 또는 SEC 정책으로 실패할 수 있으므로 실패 시 fallback을 유지합니다.
  const paddedCik = cik.padStart(10, '0');
  try {
    const response = await fetch(`https://data.sec.gov/api/xbrl/companyfacts/CIK${paddedCik}.json`, {
      headers: {
        'User-Agent': envValue('SEC_USER_AGENT') ?? 'finance-supply-chain-app contact@example.com',
      },
    });
    if (!response.ok) return null;
    const payload = await response.json();
    const facts = payload?.facts?.['us-gaap'];
    if (!facts) return null;

    const revenue = latestSecFact(facts.Revenues?.units ?? facts.SalesRevenueNet?.units);
    const operatingIncome = latestSecFact(facts.OperatingIncomeLoss?.units);
    const netIncome = latestSecFact(facts.NetIncomeLoss?.units);
    const cashFlow = latestSecFact(facts.NetCashProvidedByUsedInOperatingActivities?.units);
    const fiscalYear = String(revenue?.fy ?? operatingIncome?.fy ?? netIncome?.fy ?? 'latest');

    return {
      companyId: String(payload.cik ?? cik),
      status: 'api-live',
      fiscalYear,
      reportType: revenue?.form ?? 'SEC CompanyFacts',
      updatedAt: new Date().toISOString(),
      source: 'SEC CompanyFacts',
      sourceLabel: 'SEC EDGAR CompanyFacts',
      isApiData: true,
      isFallbackData: false,
      metrics: [
        metric('revenue', 'Revenue', compactAmount(revenue?.val, 'USD'), '제품과 서비스 수요가 실제 매출로 이어졌는지 봅니다.'),
        metric('operatingIncome', 'Operating income', compactAmount(operatingIncome?.val, 'USD'), '본업 수익성이 개선되는지 확인합니다.'),
        metric('netIncome', 'Net income', compactAmount(netIncome?.val, 'USD'), '최종 이익이 비용과 세금 후에도 남는지 봅니다.'),
        metric('cashFlow', 'Operating cash flow', compactAmount(cashFlow?.val, 'USD'), '이익이 현금으로 전환되는지 보는 핵심 지표입니다.'),
      ],
      beginnerExplanation: 'SEC CompanyFacts에서 가져온 XBRL 재무 숫자입니다. MD&A와 Risk Factors 해설은 그대로 두고 숫자 검증용으로 사용합니다.',
      keyTakeaway: '미국 기업은 숫자와 함께 MD&A에서 경영진이 설명한 수요, 비용, 투자 계획을 같이 읽어야 합니다.',
    };
  } catch {
    return null;
  }
}

export async function fetchFinancialsByCompany(company: Company): Promise<FinancialStatementSummary> {
  if (company.country === 'KR') {
    const apiSummary = await fetchKoreanFinancialsFromApi(company);
    return apiSummary ?? buildFallbackFinancials(company);
  }

  const apiSummary = await fetchUSFinancialsFromApi(company);
  if (apiSummary) return apiSummary;

  // 무료 공식 데이터만 사용합니다. API 실패 시 기존 해설과 fallback 숫자를 유지합니다.
  return buildFallbackFinancials(company);
}

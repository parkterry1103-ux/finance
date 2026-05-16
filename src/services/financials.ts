import { financialMetricGuides } from '../data.js';
import type {
  Company,
  FinancialMetric,
  FinancialMetricKey,
  FinancialStatementSummary,
} from '../data.js';

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

function envValue(key: string) {
  const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } };
  return runtime.process?.env?.[key];
}

function compactAmount(value: string | number | undefined, unit = '') {
  if (value === undefined || value === '') return '확인 필요';
  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
  if (!Number.isFinite(numeric)) return String(value);
  return `${numeric.toLocaleString('ko-KR')}${unit ? ` ${unit}` : ''}`;
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

export function buildFallbackFinancials(company: Company): FinancialStatementSummary {
  const reportUrl =
    company.reportUrl ??
    company.filingSourceUrl ??
    company.sourceDirectUrl ??
    (company.dartRcpNo ? `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${company.dartRcpNo}` : undefined);
  const sourceSearchUrl =
    company.sourceSearchUrl ??
    (company.country === 'KR'
      ? `https://dart.fss.or.kr/dsab007/main.do?option=corp&keyword=${encodeURIComponent(company.legalName || company.name)}`
      : `https://www.sec.gov/search-filings?keys=${encodeURIComponent(company.legalName || company.name)}`);

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
        '원문 연결 후 업데이트',
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
    sourceStatus: company.sourceStatus ?? (reportUrl ? 'direct' : company.sourceSearchUrl ? 'search-only' : 'needs-link'),
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
    const dartSummary = await fetchKoreanFinancialsFromOpenDart(company.corpCode);
    return dartSummary ?? buildFallbackFinancials(company);
  }

  const secSummary = await fetchUSFinancialsFromSEC(company.cik);
  if (secSummary) return secSummary;

  // 무료 공식 데이터만 사용합니다. SEC 실패 시 기존 해설과 fallback 숫자를 유지합니다.
  return buildFallbackFinancials(company);
}

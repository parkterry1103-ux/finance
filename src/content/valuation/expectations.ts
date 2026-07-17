import type { ResearchReportModel } from '../research-reports/types.js';
import { buildWaccGrowthSensitivity, solveReverseDcf } from '../../domain/valuation/index.js';
import type { SensitivityMatrix } from '../../domain/valuation/types.js';

export type ValuationPriceSession = 'regularClose' | 'premarket' | 'intraday' | 'afterHours';
export type ValuationPricePosition = 'belowRange' | 'insideRange' | 'aboveRange' | 'unavailable';
export type PremiumEvidenceStatus = 'confirmed' | 'partiallySupported' | 'editorialInference' | 'unresolved';

export type ValuationPriceSnapshot = {
  value: number;
  currency: string;
  asOf: string;
  session: ValuationPriceSession;
  sourceId: string;
  sourceLabel: string;
  delayed: boolean;
};

export type PremiumCandidate = {
  id: string;
  label: string;
  explanation: string;
  evidenceStatus: PremiumEvidenceStatus;
  evidenceIds: string[];
  watchItems: string[];
};

export type ValuationExpectationComparison = {
  label: string;
  value: number;
  unit: 'percent';
  period: string;
  note: string;
};

export type ValuationExpectationView = {
  companySlug: string;
  companyName: string;
  ticker: string;
  supportStatus: 'full';
  price: ValuationPriceSnapshot;
  model: {
    version: string;
    asOf: string;
    financialsAsOf: string;
    lastVerifiedAt: string;
    methodology: 'hybrid';
    currency: string;
  };
  scenarios: Array<{
    id: 'conservative' | 'base' | 'optimistic';
    label: string;
    modelValue: number;
    firstYearGrowth: number;
    longRunMargin: number;
    wacc: number;
    stableGrowthRate: number;
  }>;
  pricePosition: ValuationPricePosition;
  impliedExpectation: {
    variable: 'revenueCagr';
    value: number;
    unit: 'percent';
    validRange: { min: number; max: number };
    fixedAssumptions: string[];
    comparisonItems: ValuationExpectationComparison[];
    forecastYears: number;
  } | null;
  impliedExpectationError?: string;
  premiumCandidates: PremiumCandidate[];
  watchItems: string[];
  sensitivity: SensitivityMatrix;
  sourceIds: string[];
};

const premiumCandidatesByCompany: Record<'nvidia' | 'meta', PremiumCandidate[]> = {
  nvidia: [
    {
      id: 'nvidia-growth-duration',
      label: '성장 지속 기대',
      explanation: '데이터센터 수요와 차세대 플랫폼 전환이 기준 모형보다 오래 높은 성장으로 이어질 수 있다는 기대입니다.',
      evidenceStatus: 'confirmed',
      evidenceIds: ['nvidia-q1-results-fact'],
      watchItems: ['데이터센터 매출 성장률', 'Rubin 실제 출하와 매출 인식'],
    },
    {
      id: 'nvidia-moat-duration',
      label: '플랫폼 해자 지속',
      explanation: '가속기·네트워킹·시스템·소프트웨어의 결합이 높은 마진과 전환비용을 유지할 수 있다는 기대입니다.',
      evidenceStatus: 'partiallySupported',
      evidenceIds: ['nvidia-rubin-production-fact'],
      watchItems: ['네트워킹 매출과 제품 구성', '대체 가속기와 자체 칩 확산'],
    },
    {
      id: 'nvidia-sovereign-option',
      label: '국가·산업 AI 수요 옵션',
      explanation: '클라우드 사업자 밖 국가·산업 고객이 추가 수요원이 될 가능성입니다. 발표 물량을 확정 매출로 보지는 않습니다.',
      evidenceStatus: 'editorialInference',
      evidenceIds: ['nvidia-japan-ai-factory-fact'],
      watchItems: ['실제 발주와 설치 일정', '후속 국가·산업 고객'],
    },
  ],
  meta: [
    {
      id: 'meta-ad-growth-duration',
      label: '광고 성장 지속 기대',
      explanation: '사용자 참여와 광고 노출·단가 개선이 기준 모형보다 오래 이어질 수 있다는 기대입니다.',
      evidenceStatus: 'confirmed',
      evidenceIds: ['meta-q1-guidance-fact'],
      watchItems: ['광고 노출과 광고당 가격', '지역별 광고 매출 성장'],
    },
    {
      id: 'meta-infrastructure-payback',
      label: 'AI 인프라 회수 기대',
      explanation: '대규모 설비투자가 추천 품질과 광고 효율을 높여 마진과 현금흐름으로 회수될 수 있다는 기대입니다.',
      evidenceStatus: 'partiallySupported',
      evidenceIds: ['meta-q1-guidance-fact'],
      watchItems: ['Capex와 영업현금흐름', '추천 참여와 광고 전환 성과'],
    },
    {
      id: 'meta-cloud-option',
      label: '외부 AI 컴퓨팅 옵션',
      explanation: '내부 AI 자산이 광고 외 신규 매출로 확장될 가능성입니다. 공식 출시·가격·고객은 아직 확인되지 않았습니다.',
      evidenceStatus: 'editorialInference',
      evidenceIds: ['meta-cloud-option-fact'],
      watchItems: ['공식 서비스 발표', '가격·고객·반복 매출 확인'],
    },
  ],
};

export const valuationEvidenceStatusLabels: Record<PremiumEvidenceStatus, string> = {
  confirmed: '확인된 근거',
  partiallySupported: '부분적으로 뒷받침',
  editorialInference: '편집자 추론',
  unresolved: '아직 확인되지 않음',
};

export const valuationPricePositionLabels: Record<ValuationPricePosition, string> = {
  belowRange: '모형 범위 아래',
  insideRange: '모형 범위 안',
  aboveRange: '모형 범위 위',
  unavailable: '비교 불가',
};

export function locatePriceInRange(price: number, lower: number, upper: number): ValuationPricePosition {
  if (![price, lower, upper].every(Number.isFinite) || lower > upper) return 'unavailable';
  if (price < lower) return 'belowRange';
  if (price > upper) return 'aboveRange';
  return 'insideRange';
}

export function historicalRevenueCagr(report: ResearchReportModel) {
  const revenues = [...report.baseInput.historicals]
    .sort((a, b) => a.periodEnd.localeCompare(b.periodEnd))
    .flatMap((period) => period.metrics.revenue === undefined ? [] : [{ value: period.metrics.revenue, year: period.fiscalYear ?? Number(period.periodEnd.slice(0, 4)) }]);
  const first = revenues[0];
  const last = revenues[revenues.length - 1];
  const intervals = first && last ? last.year - first.year : 0;
  return first && last && first.value > 0 && intervals > 0 ? (last.value / first.value) ** (1 / intervals) - 1 : null;
}

export function forecastRevenueCagr(report: ResearchReportModel) {
  const historicals = [...report.baseInput.historicals].sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));
  const latest = historicals[historicals.length - 1]?.metrics.revenue;
  const finalRevenue = report.baseResult.forecast[report.baseResult.forecast.length - 1]?.revenue;
  const years = report.baseResult.forecast.length;
  return latest && finalRevenue && latest > 0 && years > 0 ? (finalRevenue / latest) ** (1 / years) - 1 : null;
}

export function buildValuationExpectationView(report: ResearchReportModel, price: ValuationPriceSnapshot): ValuationExpectationView {
  if (price.currency !== report.baseResult.currency) throw new Error('Price and valuation currency mismatch.');
  const scenarios = report.scenarios.map((scenario) => ({
    id: scenario.name,
    label: scenario.label,
    modelValue: scenario.result.estimatedValuePerShare,
    firstYearGrowth: scenario.input.forecastAssumptions.years[0].revenueGrowthRate,
    longRunMargin: scenario.input.forecastAssumptions.years[scenario.input.forecastAssumptions.years.length - 1]!.operatingMargin,
    wacc: scenario.result.wacc,
    stableGrowthRate: scenario.stableGrowthRate,
  }));
  const lower = scenarios.find((scenario) => scenario.id === 'conservative')!.modelValue;
  const base = scenarios.find((scenario) => scenario.id === 'base')!.modelValue;
  const upper = scenarios.find((scenario) => scenario.id === 'optimistic')!.modelValue;
  if (!(lower <= base && base <= upper)) throw new Error('Valuation scenario order is invalid.');

  const lowerBound = -0.2;
  const upperBound = 1;
  let solved: ReturnType<typeof solveReverseDcf> | null = null;
  let impliedExpectationError: string | undefined;
  try {
    solved = solveReverseDcf({ input: report.baseInput, variable: 'revenueCagr', lowerBound, upperBound, currentPrice: price.value, tolerance: 1e-7 });
    if (!solved.converged || solved.solvedValue < lowerBound || solved.solvedValue > upperBound) throw new Error('Reverse DCF solution is outside the valid range.');
  } catch {
    impliedExpectationError = '현재 설정 범위에서는 유효한 내재 성장률을 계산할 수 없습니다.';
  }

  const actualCagr = historicalRevenueCagr(report);
  const baseCagr = forecastRevenueCagr(report);
  const comparisonItems: ValuationExpectationComparison[] = [
    ...(actualCagr === null ? [] : [{ label: '최근 실제 매출 CAGR', value: actualCagr, unit: 'percent' as const, period: `${report.baseInput.historicals[0].fiscalYear}–${report.baseInput.historicals[report.baseInput.historicals.length - 1]!.fiscalYear}`, note: '공시 연간 매출 기준' }]),
    ...(baseCagr === null ? [] : [{ label: '기준 모형 매출 CAGR', value: baseCagr, unit: 'percent' as const, period: `${report.baseInput.forecastAssumptions.years.length}년`, note: '연도별 성장 경로의 등가 CAGR' }]),
  ];
  const lastForecast = report.baseInput.forecastAssumptions.years[report.baseInput.forecastAssumptions.years.length - 1]!;
  const availableSourceIds = new Set(report.sources.map((source) => source.id));
  const sourceIds = [...new Set([
    ...report.baseInput.sources,
    ...premiumCandidatesByCompany[report.slug]
      .flatMap((candidate) => candidate.evidenceIds)
      .flatMap((evidenceId) => report.evidence.find((item) => item.id === evidenceId)?.sourceIds ?? []),
  ])].filter((id) => availableSourceIds.has(id));
  const sensitivity = report.waccGrowthSensitivity;
  return {
    companySlug: report.slug,
    companyName: report.companyName,
    ticker: report.ticker,
    supportStatus: 'full',
    price,
    model: {
      version: `${report.slug}-phase-5d-${report.snapshot.version}`,
      asOf: report.snapshot.valuationAsOf,
      financialsAsOf: report.snapshot.financialDataAsOf,
      lastVerifiedAt: report.snapshot.updatedAt ?? report.snapshot.publishedAt,
      methodology: 'hybrid',
      currency: report.baseResult.currency,
    },
    scenarios,
    pricePosition: locatePriceInRange(price.value, lower, upper),
    impliedExpectation: solved ? {
      variable: 'revenueCagr',
      value: solved.solvedValue,
      unit: 'percent',
      validRange: { min: lowerBound, max: upperBound },
      fixedAssumptions: [
        `장기 영업이익률 ${(lastForecast.operatingMargin * 100).toFixed(1)}%`,
        `WACC ${(report.baseResult.wacc * 100).toFixed(1)}%`,
        `영구성장률 ${(report.baseInput.terminalAssumptions.stableGrowthRate * 100).toFixed(1)}%`,
        '세율·Capex·운전자본·순현금·희석주식 수는 기준 모형 유지',
      ],
      comparisonItems,
      forecastYears: report.baseInput.forecastAssumptions.years.length,
    } : null,
    impliedExpectationError,
    premiumCandidates: premiumCandidatesByCompany[report.slug],
    watchItems: [...new Set(premiumCandidatesByCompany[report.slug].flatMap((candidate) => candidate.watchItems))],
    sensitivity,
    sourceIds,
  };
}

export function adjustedWaccGrowthSensitivity(report: ResearchReportModel, wacc: number, stableGrowthRate: number) {
  return buildWaccGrowthSensitivity(report.baseInput, [wacc], [stableGrowthRate]).cells[0];
}

export function validateValuationExpectationView(view: ValuationExpectationView, report: ResearchReportModel) {
  const values = [view.price.value, ...view.scenarios.map((scenario) => scenario.modelValue)];
  if (values.some((value) => !Number.isFinite(value))) throw new Error('Valuation expectation contains NaN or Infinity.');
  if (view.price.value <= 0) throw new Error('Market price must be positive.');
  if (!view.price.asOf || !view.model.asOf || !view.model.lastVerifiedAt) throw new Error('Valuation expectation dates are required.');
  if (view.price.currency !== view.model.currency) throw new Error('Valuation expectation currency mismatch.');
  if (report.baseInput.capitalStructure.dilutedShares <= 0) throw new Error('Diluted shares must be positive.');
  const [conservative, base, optimistic] = view.scenarios;
  if (!conservative || !base || !optimistic || !(conservative.modelValue <= base.modelValue && base.modelValue <= optimistic.modelValue)) throw new Error('Valuation scenario order is invalid.');
  if (view.impliedExpectation && (view.impliedExpectation.value < view.impliedExpectation.validRange.min || view.impliedExpectation.value > view.impliedExpectation.validRange.max)) throw new Error('Implied expectation is outside its valid range.');
  const evidenceIds = new Set(report.evidence.map((item) => item.id));
  const sourceIds = new Set(report.sources.map((item) => item.id));
  view.sourceIds.forEach((id) => { if (!sourceIds.has(id)) throw new Error(`Broken valuation source ID: ${id}.`); });
  view.premiumCandidates.forEach((candidate) => {
    if (!candidate.evidenceIds.length || !candidate.watchItems.length) throw new Error(`Premium candidate metadata missing: ${candidate.id}.`);
    candidate.evidenceIds.forEach((id) => { if (!evidenceIds.has(id)) throw new Error(`Broken premium evidence ID: ${id}.`); });
    if ('amount' in candidate) throw new Error(`Premium candidate amount is prohibited: ${candidate.id}.`);
  });
  return view;
}

import type {
  ComparisonUnavailableReason,
  ExternalMultipleMatchStatus,
  FinancialPivotMetricId,
  FinancialSeriesPeriod,
} from './types.js';

export type DerivationBasis = {
  companySlug: string;
  metricId: FinancialPivotMetricId;
  value: number;
  periodStart: string;
  periodEnd: string;
  currency: string;
  unit: string;
  consolidation: 'consolidated' | 'separate' | 'unknown';
  conceptOrAccountId: string;
  restatementKey: string;
};

export type SafeCalculation<T> = { ok: true; value: T } | { ok: false; reason: ComparisonUnavailableReason };

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function daysBetween(left: string, right: string) {
  return Math.round((Date.parse(right) - Date.parse(left)) / 86_400_000);
}

export function deriveStandaloneFlow(current: DerivationBasis, previous: DerivationBasis): SafeCalculation<number> {
  if (current.companySlug !== previous.companySlug || current.metricId !== previous.metricId) return { ok: false, reason: 'definition_mismatch' };
  if (current.consolidation !== previous.consolidation) return { ok: false, reason: 'consolidation_basis_mismatch' };
  if (current.currency !== previous.currency) return { ok: false, reason: 'currency_mismatch_absolute' };
  if (current.unit !== previous.unit) return { ok: false, reason: 'unit_mismatch' };
  if (current.conceptOrAccountId !== previous.conceptOrAccountId) return { ok: false, reason: 'definition_mismatch' };
  if (current.restatementKey !== previous.restatementKey) return { ok: false, reason: 'restatement_unresolved' };
  if (current.periodStart !== previous.periodStart || Date.parse(current.periodEnd) <= Date.parse(previous.periodEnd)) return { ok: false, reason: 'period_not_comparable' };
  const gap = daysBetween(previous.periodEnd, current.periodEnd);
  if (gap < 70 || gap > 115) return { ok: false, reason: 'period_not_comparable' };
  const value = current.value - previous.value;
  return finite(value) ? { ok: true, value } : { ok: false, reason: 'calculation_inputs_missing' };
}

export function hasContinuousQuarterEnds(periods: FinancialSeriesPeriod[]) {
  if (periods.length !== 4 || new Set(periods.map((period) => period.periodEnd)).size !== 4) return false;
  const ordered = [...periods].sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));
  return ordered.slice(1).every((period, index) => {
    const gap = daysBetween(ordered[index].periodEnd, period.periodEnd);
    return gap >= 75 && gap <= 115;
  });
}

export function calculateTtmMetric(periods: FinancialSeriesPeriod[], metricId: FinancialPivotMetricId): SafeCalculation<number> {
  const candidates = periods
    .filter((period) => period.periodBasis === 'standalone' && finite(period.metrics[metricId]))
    .sort((a, b) => a.periodEnd.localeCompare(b.periodEnd))
    .slice(-4);
  if (candidates.length !== 4) return { ok: false, reason: 'calculation_inputs_missing' };
  if (!hasContinuousQuarterEnds(candidates)) return { ok: false, reason: 'period_not_comparable' };
  const basis = candidates[0];
  if (candidates.some((period) => period.currency !== basis.currency || period.unit !== basis.unit)) return { ok: false, reason: 'unit_mismatch' };
  if (candidates.some((period) => period.consolidation !== basis.consolidation)) return { ok: false, reason: 'consolidation_basis_mismatch' };
  const value = candidates.reduce((sum, period) => sum + (period.metrics[metricId] as number), 0);
  return finite(value) ? { ok: true, value } : { ok: false, reason: 'calculation_inputs_missing' };
}

export function calculateTrailingPer(price: number, dilutedEps: number | null): SafeCalculation<number> {
  if (!finite(price) || !finite(dilutedEps)) return { ok: false, reason: 'calculation_inputs_missing' };
  if (dilutedEps <= 0) return { ok: false, reason: 'negative_denominator' };
  return { ok: true, value: price / dilutedEps };
}

export function calculatePbr(price: number, equityMillion: number | null, sharesMillion: number | null): SafeCalculation<number> {
  if (!finite(price) || !finite(equityMillion) || !finite(sharesMillion) || sharesMillion <= 0) return { ok: false, reason: 'calculation_inputs_missing' };
  if (equityMillion <= 0) return { ok: false, reason: 'negative_denominator' };
  return { ok: true, value: price / (equityMillion / sharesMillion) };
}

export function calculatePsr(price: number, sharesMillion: number | null, revenueMillion: number | null): SafeCalculation<number> {
  if (!finite(price) || !finite(sharesMillion) || !finite(revenueMillion) || sharesMillion <= 0) return { ok: false, reason: 'calculation_inputs_missing' };
  if (revenueMillion <= 0) return { ok: false, reason: 'negative_denominator' };
  return { ok: true, value: (price * sharesMillion) / revenueMillion };
}

export function convertOrdinaryEpsToAdr(ordinaryEps: number, ordinarySharesPerAdr: number): SafeCalculation<number> {
  if (!finite(ordinaryEps) || !finite(ordinarySharesPerAdr) || ordinarySharesPerAdr <= 0) return { ok: false, reason: 'calculation_inputs_missing' };
  const value = ordinaryEps * ordinarySharesPerAdr;
  return finite(value) ? { ok: true, value } : { ok: false, reason: 'calculation_inputs_missing' };
}

export function isFilingAvailableAtPriceDate(filedAt: string, priceAsOf: string) {
  const filingDate = Date.parse(filedAt);
  const priceDate = Date.parse(priceAsOf);
  return Number.isFinite(filingDate) && Number.isFinite(priceDate) && filingDate <= priceDate;
}

export function reconcileMultiple(siteValue: number, externalValue: number | null): ExternalMultipleMatchStatus {
  if (!finite(siteValue) || !finite(externalValue)) return 'unresolved_difference';
  const absolute = Math.abs(siteValue - externalValue);
  const relative = Math.abs(absolute / siteValue) * 100;
  if (absolute < 0.005) return 'matched';
  if (absolute <= Math.max(0.15, Math.abs(siteValue) * 0.015) || relative <= 1.5) return 'matched_with_rounding';
  return 'unresolved_difference';
}

export function comparisonReasonLabel(reason: ComparisonUnavailableReason) {
  const labels: Record<ComparisonUnavailableReason, string> = {
    prior_period_missing: '직전 기간의 같은 공시값을 확인할 수 없습니다.',
    same_period_missing: '전년 동기의 동일 계정 공시값을 확인할 수 없습니다.',
    period_not_comparable: '기간 길이 또는 연속성이 달라 직접 비교하지 않습니다.',
    definition_mismatch: '동일한 계정 정의인지 확인되지 않아 비교에서 제외했습니다.',
    consolidation_basis_mismatch: '연결·별도 재무제표 기준이 달라 비교하지 않습니다.',
    currency_mismatch_absolute: '서로 다른 통화를 환산하지 않아 절대 금액 비교를 제외했습니다.',
    unit_mismatch: '공시 단위가 일치하지 않아 계산을 보류했습니다.',
    restatement_unresolved: '정정 전후 수치의 기준을 일치시키지 못해 계산을 보류했습니다.',
    insufficient_peer_count: '동일 기간·정의의 직접 비교기업 수가 충분하지 않습니다.',
    negative_denominator: '분모가 0 이하라 이 배수는 계산 의미가 없습니다.',
    metric_not_meaningful: '이 기업에 해당 지표를 적용하는 것은 의미가 제한적입니다.',
    source_unavailable: '공식 원자료를 현재 확인할 수 없습니다.',
    filing_not_yet_available: '최신 정기공시가 아직 접수되지 않았습니다.',
    calculation_inputs_missing: '표준 공식에 필요한 공시 원재료가 부족합니다.',
  };
  return labels[reason];
}

export function sameFiscalPeriodReference(periods: FinancialSeriesPeriod[], current: FinancialSeriesPeriod) {
  if (current.fiscalYear === null) return null;
  return periods.find((period) => period.fiscalYear === current.fiscalYear! - 1 && period.fiscalPeriod === current.fiscalPeriod) ?? null;
}

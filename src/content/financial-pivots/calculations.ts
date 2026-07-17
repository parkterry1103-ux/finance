import type {
  FinancialChange,
  FinancialMetricDefinition,
  FinancialPivotMetricId,
  FinancialSeriesPeriod,
} from './types.js';

function finite(value: number | undefined | null): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function safeDivide(numerator?: number, denominator?: number) {
  return finite(numerator) && finite(denominator) && denominator !== 0 ? numerator / denominator : null;
}

export function calculateChange(
  current: number | undefined,
  previous: number | undefined,
  unit: FinancialChange['unit'],
): FinancialChange {
  if (!finite(current) || !finite(previous)) return { status: 'missing', value: null, unit, label: '비교 자료 없음' };
  if (unit === 'percentagePoint') {
    const value = current - previous;
    return { status: 'ready', value, unit, label: `${value >= 0 ? '+' : ''}${value.toFixed(1)}%p` };
  }
  if (unit === 'absolute') {
    const value = current - previous;
    return { status: 'ready', value, unit, label: `${value >= 0 ? '+' : ''}${value.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}` };
  }
  if (Math.abs(previous) < 1e-9) return { status: 'zeroBase', value: null, unit, label: current > 0 ? '0에서 증가' : '비교 부적절' };
  if (previous < 0 && current > 0) return { status: 'profitTurnaround', value: null, unit, label: '흑자전환' };
  if (previous > 0 && current < 0) return { status: 'lossTurnaround', value: null, unit, label: '적자전환' };
  if (previous < 0 && current < 0) {
    if (Math.abs(current) < Math.abs(previous)) return { status: 'lossNarrowing', value: null, unit, label: '적자축소' };
    if (Math.abs(current) > Math.abs(previous)) return { status: 'lossWidening', value: null, unit, label: '적자확대' };
    return { status: 'inappropriate', value: null, unit, label: '적자 유지' };
  }
  if (current === 0) return { status: 'inappropriate', value: null, unit, label: '비교 부적절' };
  const value = ((current - previous) / Math.abs(previous)) * 100;
  return { status: 'ready', value, unit, label: `${value >= 0 ? '+' : ''}${value.toFixed(1)}%` };
}

export function calculateCagr(first: number | undefined, last: number | undefined, intervals: number) {
  if (!finite(first) || !finite(last) || first <= 0 || last <= 0 || intervals < 3) return null;
  return (Math.pow(last / first, 1 / intervals) - 1) * 100;
}

export function aggregateMargin(rows: Array<{ numerator: number | null | undefined; denominator: number | null | undefined }>) {
  const comparable = rows.filter((row): row is { numerator: number; denominator: number } => finite(row.numerator) && finite(row.denominator) && row.denominator > 0);
  if (!comparable.length) return null;
  const denominator = comparable.reduce((sum, row) => sum + row.denominator, 0);
  if (denominator <= 0) return null;
  return (comparable.reduce((sum, row) => sum + row.numerator, 0) / denominator) * 100;
}

export function canComparePeriods(current: { fiscalYear: number | null; fiscalPeriod: string }, reference: { fiscalYear: number | null; fiscalPeriod: string }) {
  return current.fiscalYear !== null && reference.fiscalYear !== null && current.fiscalYear === reference.fiscalYear && current.fiscalPeriod === reference.fiscalPeriod;
}

export function canCompareAbsoluteCurrency(currentCurrency: string, referenceCurrency: string, conversionBasis?: string) {
  return currentCurrency === referenceCurrency || Boolean(conversionBasis?.trim());
}

export function median(values: Array<number | null | undefined>) {
  const usable = values.filter(finite).sort((a, b) => a - b);
  if (!usable.length) return null;
  const middle = Math.floor(usable.length / 2);
  return usable.length % 2 ? usable[middle] : (usable[middle - 1] + usable[middle]) / 2;
}

export function withDerivedMetrics(period: FinancialSeriesPeriod): FinancialSeriesPeriod {
  const metrics = { ...period.metrics };
  const percent = (numerator: FinancialPivotMetricId, denominator: FinancialPivotMetricId) => {
    const value = safeDivide(metrics[numerator], metrics[denominator]);
    return value === null ? undefined : value * 100;
  };
  metrics.grossMargin = percent('grossProfit', 'revenue');
  metrics.operatingMargin = percent('operatingIncome', 'revenue');
  metrics.netMargin = percent('netIncome', 'revenue');
  metrics.freeCashFlowMargin = percent('freeCashFlow', 'revenue');
  metrics.returnOnAssets = percent('netIncome', 'totalAssets');
  metrics.returnOnEquity = percent('netIncome', 'totalEquity');
  const debtCapital = safeDivide(metrics.totalDebt, finite(metrics.totalDebt) && finite(metrics.totalEquity) ? metrics.totalDebt + metrics.totalEquity : undefined);
  metrics.debtToCapital = debtCapital === null ? undefined : debtCapital * 100;
  metrics.currentRatio = safeDivide(metrics.currentAssets, metrics.currentLiabilities) ?? undefined;
  return { ...period, metrics };
}

export function finiteMetric(period: FinancialSeriesPeriod, metricId: FinancialPivotMetricId) {
  const value = period.metrics[metricId];
  return finite(value) ? value : null;
}

export function formatMetricValue(value: number | null, metric: FinancialMetricDefinition, currency: string) {
  if (!finite(value)) return '자료 미수집';
  if (metric.format === 'percent' || metric.format === 'percentagePoint') return `${value.toFixed(1)}%`;
  if (metric.format === 'multiple') return `${value.toFixed(2)}배`;
  if (metric.format === 'perShare') return `${currency} ${value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}`;
  const abs = Math.abs(value);
  const compact = abs >= 1_000_000
    ? `${(value / 1_000_000).toFixed(1)}조`
    : abs >= 1_000
      ? `${(value / 1_000).toFixed(1)}십억`
      : `${value.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}백만`;
  return `${currency} ${compact}`;
}

import type { RelationPoint } from '../../content/relations/types.js';

function pathFor(values: number[], width = 600, height = 74) {
  if (!values.length) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  return values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = range === 0 ? height / 2 : height - ((value - min) / range) * height;
    return `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}

function directionLabel(values: number[]) {
  if (values.length < 2) return '방향 판단 제한';
  const change = values[values.length - 1]! - values[0];
  if (Math.abs(change) < 0.000001) return '최근 큰 변화 없음';
  return change > 0 ? '최근 위쪽 방향' : '최근 아래쪽 방향';
}

function TrendPanel({ label, values, tone, startDate, endDate }: {
  label: string;
  values: number[];
  tone: 'macro' | 'market';
  startDate: string | null;
  endDate: string | null;
}) {
  const path = pathFor(values);
  return (
    <div className={`relation-trend-panel is-${tone}`}>
      <div><strong>{label}</strong><span>{directionLabel(values)}</span></div>
      <svg viewBox="0 0 600 90" role="img" aria-label={`${label} 추세. ${startDate ?? '시작일 없음'}부터 ${endDate ?? '종료일 없음'}까지 ${values.length}개 관측`} preserveAspectRatio="none">
        <line x1="0" y1="45" x2="600" y2="45" aria-hidden="true" />
        {path ? <path d={path} vectorEffect="non-scaling-stroke" /> : null}
      </svg>
      <small>{startDate ?? '—'} <span aria-hidden="true">→</span> {endDate ?? '—'}</small>
    </div>
  );
}

export function RelationDualTrendChart({ points, macroLabel, marketLabel }: {
  points: RelationPoint[];
  macroLabel: string;
  marketLabel: string;
}) {
  const comparablePoints = points.filter((point) => Number.isFinite(point.macroChange) && Number.isFinite(point.marketChange));
  return (
    <figure className="relation-dual-chart">
      <TrendPanel label={`${macroLabel} 변화`} values={comparablePoints.map((point) => point.macroChange as number)} tone="macro" startDate={comparablePoints[0]?.date ?? null} endDate={comparablePoints[comparablePoints.length - 1]?.date ?? null} />
      <TrendPanel label={`${marketLabel} 변화율`} values={comparablePoints.map((point) => point.marketChange as number)} tone="market" startDate={comparablePoints[0]?.date ?? null} endDate={comparablePoints[comparablePoints.length - 1]?.date ?? null} />
      <figcaption>두 그래프는 단위와 범위가 다르므로 각각의 추세를 비교해 보세요. 선의 높이를 직접 비교하는 그래프가 아닙니다.</figcaption>
    </figure>
  );
}

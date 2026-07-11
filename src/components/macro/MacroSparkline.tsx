import type { MacroHistoryPoint } from '../../content/macro/types.js';

type MacroSparklineProps = {
  history: MacroHistoryPoint[];
  label: string;
};

export function MacroSparkline({ history, label }: MacroSparklineProps) {
  const points = history.filter((point) => Number.isFinite(point.value));
  if (points.length < 2) {
    return <div className="macro-sparkline-empty" role="img" aria-label={`${label} 추세 데이터가 충분하지 않습니다.`}>추세 준비 중</div>;
  }

  const width = 320;
  const height = 96;
  const padding = 5;
  const values = points.map((point) => point.value);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum || 1;
  const path = points.map((point, index) => {
    const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2);
    const y = padding + ((maximum - point.value) / range) * (height - padding * 2);
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
  const latestX = width - padding;
  const latestPoint = points[points.length - 1];
  const latestY = padding + ((maximum - latestPoint.value) / range) * (height - padding * 2);

  return (
    <svg
      className="macro-sparkline"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${label} ${points.length}개 관측 추세. ${points[0].date}부터 ${latestPoint.date}까지.`}
      preserveAspectRatio="none"
    >
      <path className="macro-sparkline-area" d={`${path} L${latestX},${height - padding} L${padding},${height - padding} Z`} />
      <path className="macro-sparkline-line" d={path} />
      <circle className="macro-sparkline-dot" cx={latestX} cy={latestY} r="3.5" />
    </svg>
  );
}

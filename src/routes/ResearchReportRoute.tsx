import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { loadMonteCarloResult } from '../content/monte-carlo/registry.js';
import type { MonteCarloValuationResult } from '../content/monte-carlo/types.js';
import { loadResearchReport } from '../content/research-reports/registry.js';
import { terminalReinvestmentRate } from '../content/research-reports/build-report.js';
import type {
  MaterialNewsEvent,
  ResearchChart,
  ResearchClaim,
  ResearchEvidence,
  ResearchReportModel,
  ResearchSource,
  SensitivityMatrix,
} from '../content/research-reports/types.js';

type Props = {
  slug: string;
  navigation: ReactNode;
  onNavigate: (path: string) => void;
};

function formatCurrency(value: number, digits = 2) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

function formatNumber(value: number, digits = 1) {
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: digits }).format(value);
}

function formatPercent(value: number, digits = 1) {
  return `${formatNumber(value * 100, digits)}%`;
}

function internalLink(path: string, onNavigate: (path: string) => void) {
  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate(path);
  };
}

function sourceNumbers(sourceIds: string[], sources: ResearchSource[]) {
  return [...new Set(sourceIds.map((id) => sources.findIndex((source) => source.id === id) + 1).filter((index) => index > 0))].sort((a, b) => a - b);
}

function evidenceSources(evidenceIds: string[], evidence: ResearchEvidence[]) {
  const evidenceMap = new Map(evidence.map((item) => [item.id, item]));
  const visited = new Set<string>();
  const sourceIds = new Set<string>();
  const visit = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);
    const item = evidenceMap.get(id);
    item?.sourceIds.forEach((sourceId) => sourceIds.add(sourceId));
    item?.dependsOnEvidenceIds?.forEach(visit);
  };
  evidenceIds.forEach(visit);
  return [...sourceIds];
}

function Citations({ sourceIds, report }: { sourceIds: string[]; report: ResearchReportModel }) {
  const numbers = sourceNumbers(sourceIds, report.sources);
  if (!numbers.length) return null;
  return <span className="research-citations" aria-label={`출처 ${numbers.join(', ')}`}>{numbers.map((number) => <a key={number} href={`#source-${number}`}>[{number}]</a>)}</span>;
}

function EvidenceCitations({ evidenceIds, report }: { evidenceIds: string[]; report: ResearchReportModel }) {
  return <Citations sourceIds={evidenceSources(evidenceIds, report.evidence)} report={report} />;
}

function ClaimList({ claims, report }: { claims: ResearchClaim[]; report: ResearchReportModel }) {
  return <div className="research-paragraph-list">{claims.map((claim) => <article key={claim.title} className="research-paragraph">
    <h3>{claim.title}</h3>
    <p>{claim.body}<EvidenceCitations evidenceIds={claim.evidenceIds} report={report} /></p>
  </article>)}</div>;
}

function SectionHeading({ number, eyebrow, title }: { number: string; eyebrow: string; title: string }) {
  return <div className="research-section-heading"><span>{number}</span><div><p>{eyebrow}</p><h2>{title}</h2></div></div>;
}

function Chart({ chart, sources }: { chart: ResearchChart; sources: ResearchSource[] }) {
  const points = chart.series.flatMap((series) => series.points.map((point) => point.value));
  const max = Math.max(...points.map(Math.abs), 1);
  const labels = chart.series[0]?.points.map((point) => point.label) ?? [];
  const width = 680;
  const height = 270;
  const plotWidth = 555;
  const plotHeight = 176;
  const groupWidth = plotWidth / Math.max(labels.length, 1);
  const barWidth = Math.min(34, (groupWidth - 12) / Math.max(chart.series.length, 1));
  return <figure className="research-chart-card" aria-labelledby={`${chart.id}-caption`}>
    <figcaption id={`${chart.id}-caption`}><strong>{chart.title}</strong><span>{chart.unit}</span><p>{chart.summary}</p></figcaption>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${chart.title}. ${chart.summary}`}>
      <line x1="70" x2="625" y1="218" y2="218" className="research-chart-axis" />
      {[0, 0.5, 1].map((ratio) => <g key={ratio}><line x1="70" x2="625" y1={218 - plotHeight * ratio} y2={218 - plotHeight * ratio} className="research-chart-gridline" /><text x="62" y={222 - plotHeight * ratio} textAnchor="end" className="research-chart-tick">{formatNumber(max * ratio, 0)}</text></g>)}
      {labels.map((label, pointIndex) => {
        const x = 70 + pointIndex * groupWidth + groupWidth / 2;
        return <g key={label}>{chart.series.map((series, seriesIndex) => {
          const value = series.points[pointIndex]?.value ?? 0;
          const barHeight = (Math.abs(value) / max) * plotHeight;
          const barX = x - (chart.series.length * barWidth) / 2 + seriesIndex * barWidth;
          return <rect key={series.label} x={barX} y={218 - barHeight} width={Math.max(barWidth - 3, 3)} height={barHeight} rx="4" className={`research-chart-bar series-${seriesIndex + 1}`} />;
        })}<text x={x} y="240" textAnchor="middle" className="research-chart-label">{label}</text></g>;
      })}
      {chart.series.map((series, index) => <g key={series.label} transform={`translate(${80 + index * 170}, 260)`}><rect width="12" height="12" rx="3" y="-10" className={`research-chart-bar series-${index + 1}`} /><text x="18" className="research-chart-legend">{series.label}</text></g>)}
    </svg>
    <details className="research-chart-data"><summary>차트 데이터와 출처</summary><table><caption>{chart.title} 원자료</caption><thead><tr><th scope="col">기간</th>{chart.series.map((series) => <th scope="col" key={series.label}>{series.label}</th>)}</tr></thead><tbody>{labels.map((label, index) => <tr key={label}><th scope="row">{label}</th>{chart.series.map((series) => {
      const point = series.points[index];
      const citations = sourceNumbers(point?.sourceIds ?? [], sources);
      return <td key={series.label}>{formatNumber(point?.value ?? 0, chart.unit === '%' ? 1 : 0)}{citations.map((citation) => <sup key={citation}> [{citation}]</sup>)}</td>;
    })}</tr>)}</tbody></table></details>
  </figure>;
}

function SensitivityTable({ matrix, title, rowLabel, columnLabel, baseRow, baseColumn }: { matrix: SensitivityMatrix; title: string; rowLabel: string; columnLabel: string; baseRow: number; baseColumn: number }) {
  const cell = (rowValue: number, columnValue: number) => matrix.cells.find((item) => item.rowValue === rowValue && item.columnValue === columnValue);
  return <figure className="research-sensitivity-card"><figcaption><strong>{title}</strong><span>셀 값: 주당 모형 결과(USD)</span></figcaption><div className="research-sensitivity-scroll" tabIndex={0} aria-label={`${title} 표 가로 스크롤 영역`}><table><caption>{rowLabel}과 {columnLabel} 변화에 따른 주당 모형 결과</caption><thead><tr><th scope="col">{rowLabel} \ {columnLabel}</th>{matrix.columnValues.map((value) => <th scope="col" key={value}>{formatPercent(value)}</th>)}</tr></thead><tbody>{matrix.rowValues.map((rowValue) => <tr key={rowValue}><th scope="row">{formatPercent(rowValue)}</th>{matrix.columnValues.map((columnValue) => {
    const result = cell(rowValue, columnValue);
    const isBase = Math.abs(rowValue - baseRow) < 1e-10 && Math.abs(columnValue - baseColumn) < 1e-10;
    const value = result?.estimatedValuePerShare === null || result?.estimatedValuePerShare === undefined ? '계산 제한' : formatCurrency(result.estimatedValuePerShare);
    return <td key={columnValue} className={isBase ? 'research-sensitivity-base' : undefined} aria-label={isBase ? `${value}, 기준 가정` : value}>{value}{isBase ? <span>기준 가정</span> : null}</td>;
  })}</tr>)}</tbody></table></div></figure>;
}

function eventImpactLabel(event: MaterialNewsEvent) {
  if (event.thesisImpact === 'partiallyRevise') return '일부 가정 수정';
  if (event.thesisImpact === 'reassess') return '핵심 가정 재검토';
  return event.confidence === 'developing' ? '추가 확인 필요' : '기존 판단 유지';
}

function distributionPosition(value: number, minimum: number, maximum: number) {
  if (maximum === minimum) return 50;
  return Math.max(0, Math.min(100, ((value - minimum) / (maximum - minimum)) * 100));
}

function MonteCarloSection({ result }: { result: MonteCarloValuationResult }) {
  const { percentiles } = result;
  const marketPrice = result.currentMarketPrice;
  const domainMinimum = Math.min(percentiles.p5, marketPrice?.value ?? percentiles.p5);
  const domainMaximum = Math.max(percentiles.p95, marketPrice?.value ?? percentiles.p95);
  const position = (value: number) => distributionPosition(value, domainMinimum, domainMaximum);
  const quantileMarkers = [
    { label: 'P10', value: percentiles.p10 },
    { label: 'P25', value: percentiles.p25 },
    { label: 'P50', value: percentiles.p50 },
    { label: 'P75', value: percentiles.p75 },
    { label: 'P90', value: percentiles.p90 },
  ];
  const comparison = result.deterministicComparison;
  const finalConvergence = result.convergence[result.convergence.length - 1];
  return <section id="report-uncertainty" className="research-report-section research-uncertainty-section">
    <SectionHeading number="10" eyebrow="Probabilistic valuation" title="가치평가의 불확실성" />
    <p className="research-section-intro">하나의 숫자를 정답처럼 제시하지 않고, 4A의 보수·기준·낙관 가정 사이에서 여섯 입력을 5만 번 다시 뽑아 같은 FCFF DCF 엔진을 실행했습니다. 아래 범위는 미래 주가 예측이 아니라 선택한 가정 안에서 나온 모형 결과의 분포입니다.</p>

    <div className="research-uncertainty-summary">
      <article><span>모형 결과의 중앙값</span><strong>{formatCurrency(percentiles.p50)}</strong><small>P50</small></article>
      <article><span>중앙 50% 범위</span><strong>{formatCurrency(percentiles.p25)}–{formatCurrency(percentiles.p75)}</strong><small>P25–P75</small></article>
      <article><span>넓은 80% 범위</span><strong>{formatCurrency(percentiles.p10)}–{formatCurrency(percentiles.p90)}</strong><small>P10–P90</small></article>
    </div>

    <figure className="research-distribution-card" aria-labelledby={`${result.companySlug}-distribution-title`}>
      <figcaption id={`${result.companySlug}-distribution-title`}><strong>주당 모형 결과 분포</strong><span>USD · {result.valuationDate} 기준</span></figcaption>
      <div className="research-distribution-plot" role="img" aria-label={`P10 ${formatCurrency(percentiles.p10)}, P25 ${formatCurrency(percentiles.p25)}, P50 ${formatCurrency(percentiles.p50)}, P75 ${formatCurrency(percentiles.p75)}, P90 ${formatCurrency(percentiles.p90)}${marketPrice ? `, 시장가격 ${formatCurrency(marketPrice.value)}` : ''}`}>
        <div className="research-distribution-axis" aria-hidden="true">
          <span className="research-distribution-range range-80" style={{ left: `${position(percentiles.p10)}%`, width: `${position(percentiles.p90) - position(percentiles.p10)}%` }} />
          <span className="research-distribution-range range-50" style={{ left: `${position(percentiles.p25)}%`, width: `${position(percentiles.p75) - position(percentiles.p25)}%` }} />
          {quantileMarkers.map((marker) => <span key={marker.label} className={`research-distribution-marker ${marker.label === 'P50' ? 'is-median' : ''}`} style={{ left: `${position(marker.value)}%` }} />)}
          {marketPrice ? <span className={`research-market-marker ${position(marketPrice.value) > 88 ? 'is-end' : position(marketPrice.value) < 12 ? 'is-start' : ''}`} style={{ left: `${position(marketPrice.value)}%` }}><strong>시장가격</strong><small>{formatCurrency(marketPrice.value)}</small></span> : null}
        </div>
        <dl className="research-distribution-labels">{quantileMarkers.map((marker) => <div key={marker.label}><dt>{marker.label}</dt><dd>{formatCurrency(marker.value)}</dd></div>)}</dl>
      </div>
      <p className="research-distribution-alternative">텍스트 대안: 중앙값은 {formatCurrency(percentiles.p50)}, 중앙 50%는 {formatCurrency(percentiles.p25)}에서 {formatCurrency(percentiles.p75)}, 넓은 80%는 {formatCurrency(percentiles.p10)}에서 {formatCurrency(percentiles.p90)}입니다.</p>
    </figure>

    {marketPrice ? <aside className="research-market-percentile"><strong>모형 분포상 위치 · 약 {formatNumber(marketPrice.modelDistributionPercentile, 1)}백분위</strong><p>현재 시장가격 {formatCurrency(marketPrice.value)}은 이번 가정 분포에서 약 {formatNumber(marketPrice.modelDistributionPercentile, 1)}백분위에 위치합니다. 이는 미래 주가가 해당 비율로 오르거나 내린다는 뜻이 아닙니다. 현재 시장가격이 이번 DCF 가정 범위와 비교해 어느 위치에 있는지를 보여줍니다.</p></aside> : null}

    <div className="research-uncertainty-diagnostics">
      <article><h3>가장 민감한 가정</h3><ol>{result.driverImportance.slice(0, 5).map((driver) => <li key={driver.assumptionId}><span>{driver.label}</span><strong>{driver.spearmanCorrelation >= 0 ? '+' : ''}{formatNumber(driver.spearmanCorrelation, 3)}</strong></li>)}</ol><p>절댓값이 클수록 이 모형 안에서 결과와 순위가 더 함께 움직였습니다. 순위상관은 영향도 진단이며 실제 사업이나 시장가격의 인과관계가 아닙니다.</p></article>
      <article><h3>장기 구간 의존도</h3><dl><div><dt>Terminal Value 비중 P50</dt><dd>{formatPercent(result.terminalValueDiagnostics.medianShare)}</dd></div><div><dt>Terminal Value 비중 P90</dt><dd>{formatPercent(result.terminalValueDiagnostics.p90Share)}</dd></div><div><dt>80% 초과 표본 비율</dt><dd>{formatPercent(result.terminalValueDiagnostics.overEightyPercentShare, 2)}</dd></div></dl><p>장기 구간 비중이 높을수록 단기 실적보다 WACC·영구성장률·장기 ROIC 가정에 더 민감합니다.</p></article>
    </div>

    {result.distributionAdjustments.length ? <div className="research-distribution-adjustments"><h3>작성 시점 이슈가 가정에 미친 영향</h3>{result.distributionAdjustments.map((adjustment) => <article key={`${adjustment.newsEventId}-${adjustment.assumptionId}`}><strong>{adjustment.adjustedDistribution.label}</strong><dl><div><dt>변경 전</dt><dd>{formatPercent(adjustment.previousDistribution.minimum)}–{formatPercent(adjustment.previousDistribution.maximum)}</dd></div><div><dt>변경 후</dt><dd>{formatPercent(adjustment.adjustedDistribution.minimum)}–{formatPercent(adjustment.adjustedDistribution.maximum)}</dd></div><div><dt>이유</dt><dd>{adjustment.reason}</dd></div></dl></article>)}</div> : null}

    <p className="research-uncertainty-limit">이 범위는 4A 시나리오 안의 불확실성만 표현합니다. 장기 ROIC와 감가상각률은 세 시나리오가 같아 임의로 흔들지 않았고, 입력 사이의 실제 상관구조가 충분히 관측되지 않은 한계가 있습니다.</p>

    <details className="research-monte-carlo-method"><summary>상세 가정·방법론</summary><div className="research-monte-carlo-method-body">
      <h3>실행과 제약조건</h3><dl className="research-monte-carlo-run"><div><dt>반복 횟수</dt><dd>{formatNumber(result.run.iterations, 0)}회</dd></div><div><dt>고정 seed</dt><dd>{result.run.seed}</dd></div><div><dt>유효 / 제외</dt><dd>{formatNumber(result.run.validIterations, 0)} / {formatNumber(result.run.rejectedIterations, 0)}</dd></div><div><dt>제외율</dt><dd>{formatPercent(result.run.rejectionRate, 3)}</dd></div><div><dt>엔진</dt><dd>{result.run.engineVersion}</dd></div><div><dt>생성 시각</dt><dd>{result.run.generatedAt}</dd></div></dl>
      <p>각 표본은 4A 입력 검증을 다시 통과하며 WACC &gt; 영구성장률, 양의 희석주식 수, 유효 통화·유한값, 경제적 성장·마진·Capex·운전자본 범위, 0~100%의 Terminal 재투자율을 확인합니다. 오류를 범위 안으로 강제로 잘라내지 않고 제외 사유로 기록합니다.</p>

      <h3>입력 분포</h3><div className="research-monte-carlo-table-scroll" tabIndex={0} aria-label="Monte Carlo 입력 분포 표 가로 스크롤 영역"><table><caption>회사별 Monte Carlo 삼각분포</caption><thead><tr><th scope="col">가정</th><th scope="col">하단</th><th scope="col">기준점</th><th scope="col">상단</th><th scope="col">근거</th></tr></thead><tbody>{result.distributions.map((distribution) => <tr key={distribution.assumptionId}><th scope="row">{distribution.label}</th><td>{formatPercent(distribution.minimum, 2)}</td><td>{formatPercent(distribution.mode, 2)}</td><td>{formatPercent(distribution.maximum, 2)}</td><td>{distribution.rationale}</td></tr>)}</tbody></table></div>

      <h3>수렴성</h3><div className="research-monte-carlo-table-scroll" tabIndex={0} aria-label="Monte Carlo 수렴성 표 가로 스크롤 영역"><table><caption>반복 횟수별 수렴성 비교</caption><thead><tr><th scope="col">실행</th><th scope="col">P10</th><th scope="col">P50</th><th scope="col">P90</th><th scope="col">평균</th><th scope="col">표준편차</th><th scope="col">상위 변수</th></tr></thead><tbody>{result.convergence.map((point) => <tr key={point.iterations}><th scope="row">{formatNumber(point.iterations, 0)}회</th><td>{formatCurrency(point.p10)}</td><td>{formatCurrency(point.p50)}</td><td>{formatCurrency(point.p90)}</td><td>{formatCurrency(point.mean)}</td><td>{formatCurrency(point.standardDeviation)}</td><td>{point.topDriverIds.map((id) => result.distributions.find((item) => item.assumptionId === id)?.label ?? id).join(' · ')}</td></tr>)}</tbody></table></div><p>25,000회와 50,000회 사이의 상대 차이는 P10 {formatPercent(result.convergenceRelativeDifferences.p10, 3)}, P50 {formatPercent(result.convergenceRelativeDifferences.p50, 3)}, P90 {formatPercent(result.convergenceRelativeDifferences.p90, 3)}로 모두 1% 이내입니다. 최종 유효 표본은 {formatNumber(finalConvergence.validIterations, 0)}개입니다.</p>

      <h3>결정론적 조건과 교차검증</h3><dl className="research-deterministic-comparison"><div><dt>4A 보수</dt><dd>{formatCurrency(comparison.conservative)}</dd></div><div><dt>Monte Carlo P10</dt><dd>{formatCurrency(percentiles.p10)}</dd></div><div><dt>4A 기준</dt><dd>{formatCurrency(comparison.base)}</dd></div><div><dt>Monte Carlo P50</dt><dd>{formatCurrency(percentiles.p50)}</dd></div><div><dt>4A 낙관</dt><dd>{formatCurrency(comparison.optimistic)}</dd></div><div><dt>Monte Carlo P90</dt><dd>{formatCurrency(percentiles.p90)}</dd></div></dl><p>4A의 보수·낙관 조건은 여러 불리하거나 유리한 가정을 동시에 적용합니다. Monte Carlo에서는 각 입력을 따로 추출하므로 P10·P90이 결정론적 양 끝 조건과 같을 필요가 없습니다.</p>

      <h3>전체 통계와 해석 한계</h3><dl className="research-monte-carlo-run"><div><dt>평균</dt><dd>{formatCurrency(result.mean)}</dd></div><div><dt>P5 / P95</dt><dd>{formatCurrency(percentiles.p5)} / {formatCurrency(percentiles.p95)}</dd></div><div><dt>표준편차</dt><dd>{formatCurrency(result.standardDeviation)}</dd></div><div><dt>최솟값 / 최댓값</dt><dd>{formatCurrency(result.min)} / {formatCurrency(result.max)}</dd></div><div><dt>가치평가 기준</dt><dd>{result.valuationDate}</dd></div><div><dt>리포트 버전</dt><dd>{result.run.reportVersion}</dd></div></dl><ul>{result.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>{result.warnings.length ? <ul>{result.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}
    </div></details>
  </section>;
}

function ResearchReport({ report, monteCarlo, navigation, onNavigate }: { report: ResearchReportModel; monteCarlo: MonteCarloValuationResult; navigation: ReactNode; onNavigate: (path: string) => void }) {
  const reinvestment = terminalReinvestmentRate(report);
  const baseForecastStart = report.baseInput.forecastAssumptions.years[0];
  const baseForecastEnd = report.baseInput.forecastAssumptions.years[report.baseInput.forecastAssumptions.years.length - 1];
  return <div className="pick-shell research-report-shell">
    <div className="research-screen-navigation">{navigation}</div>
    <main className="research-report-main">
      <div className="research-report-actions"><a href={`/ko/companies/${report.slug}`} onClick={internalLink(`/ko/companies/${report.slug}`, onNavigate)}><ArrowLeft size={16} aria-hidden="true" /> 기업 대시보드</a></div>

      <section className="research-report-cover" id="report-cover" aria-labelledby="research-report-title">
        <p className="research-report-brand">주가해부실 Research <span>작성 시점 기업 리서치</span></p>
        <div className="research-report-identity"><span>{report.ticker} · {report.industry}</span><h1 id="research-report-title">{report.companyName} 리서치 리포트</h1><p>{report.englishName}</p><strong className="research-report-title">{report.reportTitle}</strong></div>
        <div className="research-report-conclusion"><span>현재 판단</span><strong>{report.conclusion}</strong><p>{report.watchStatement}</p></div>
        <dl className="research-report-dates">
          <div><dt>리포트 작성일</dt><dd>{report.snapshot.publishedAt}</dd></div><div><dt>최근 업데이트일</dt><dd>{report.snapshot.updatedAt ?? '초판'}</dd></div>
          <div><dt>뉴스 반영 기준</dt><dd>{report.snapshot.newsCutoffAt.slice(0, 10)}</dd></div><div><dt>시장가격 기준</dt><dd>{report.snapshot.priceAsOf.slice(0, 10)}</dd></div>
          <div><dt>재무자료 기준</dt><dd>{report.snapshot.financialDataAsOf}</dd></div><div><dt>가치평가 기준</dt><dd>{report.snapshot.valuationAsOf}</dd></div>
          <div><dt>업종 기준</dt><dd>{report.snapshot.benchmarkAsOf}</dd></div><div><dt>리포트 버전</dt><dd>{report.snapshot.version}</dd></div>
        </dl>
      </section>

      <nav className="research-report-toc" aria-label="리포트 목차"><strong>읽는 순서</strong><ol>
        <li><a href="#report-judgment">핵심 판단</a></li><li><a href="#report-current-issues">핵심 이슈</a></li><li><a href="#report-moat">해자</a></li><li><a href="#report-health">재무건전성</a></li>
        <li><a href="#report-cycle">산업 역할</a></li><li><a href="#report-performance">실적·현금</a></li><li><a href="#report-method-choice">평가 방식</a></li><li><a href="#report-market-value">가격·모형</a></li>
        <li><a href="#report-uncertainty">불확실성</a></li><li><a href="#report-reverse">시장 기대</a></li><li><a href="#report-benchmark">산업 기준</a></li><li><a href="#report-variables">가치 변수</a></li><li><a href="#report-risks">다음 확인</a></li>
      </ol></nav>

      <section id="report-judgment" className="research-report-section"><SectionHeading number="02" eyebrow="Current research view" title="현재 핵심 판단" /><div className="research-judgment-grid">{report.judgments.map((item) => <article key={item.label}><span>{item.label}</span><h3>{item.status}</h3><p>{item.reason}<EvidenceCitations evidenceIds={item.evidenceIds} report={report} /></p><dl><dt>판단이 바뀌는 조건</dt><dd>{item.changeCondition}</dd></dl></article>)}</div><div className="research-context-grid"><article><span>시장 전체 요인</span><p>{report.marketContext.marketWide}</p></article><article><span>기업 고유 요인</span><p>{report.marketContext.companySpecific}<EvidenceCitations evidenceIds={report.marketContext.evidenceIds} report={report} /></p></article></div><p className="research-attribution-note">{report.marketContext.attributionCaution}</p></section>

      <section id="report-current-issues" className="research-report-section"><SectionHeading number="03" eyebrow="Current-context snapshot" title="작성 시점 핵심 이슈" /><p className="research-section-intro">뉴스는 {report.snapshot.newsCutoffAt.slice(0, 10)}까지 확인된 자료 가운데 사업·재무·가치평가 가정을 바꿀 가능성이 있는 사건만 골랐습니다.</p><div className="research-news-list">{report.materialNewsEvents.map((event) => <article key={event.id}><header><div><time dateTime={event.publishedAt}>{event.publishedAt}</time><h3>{event.title}</h3></div><span>{eventImpactLabel(event)}</span></header><div className="research-news-body"><dl><div><dt>무슨 일이 있었나</dt><dd>{event.summary}<Citations sourceIds={[event.sourceId]} report={report} /></dd></div><div><dt>왜 중요한가</dt><dd>{event.whyItMatters}</dd></div><div><dt>전달 경로</dt><dd className="research-path">{event.transmissionPath.map((step) => <span key={step}>{step}</span>)}</dd></div><div><dt>지속성</dt><dd>{event.durability === 'structural' ? '구조적 변화 가능성' : event.durability === 'temporary' ? '일시적 요인' : '지속성 추가 확인'}</dd></div><div><dt>현재 판단</dt><dd>{eventImpactLabel(event)}</dd></div><div><dt>다음 확인</dt><dd>{event.watchItems.join(' · ')}</dd></div></dl></div></article>)}</div><p className="research-exclusion-note">제외 기준: {report.excludedNewsSummary}</p></section>

      <section id="report-moat" className="research-report-section"><SectionHeading number="04" eyebrow="Competitive advantage" title="이 기업은 충분한 해자가 있는가?" /><div className="research-moat-list">{report.moat.map((item) => <article key={item.source}><h3>{item.source}</h3><dl><div><dt>현재 근거</dt><dd>{item.evidence}<EvidenceCitations evidenceIds={item.evidenceIds} report={report} /></dd></div><div><dt>실적으로 이어지는 경로</dt><dd>{item.earningsPath}</dd></div><div><dt>약해질 수 있는 조건</dt><dd>{item.weakeningCondition}</dd></div><div><dt>다음 확인 지표</dt><dd>{item.nextMetric}</dd></div></dl></article>)}</div></section>

      <section id="report-health" className="research-report-section"><SectionHeading number="05" eyebrow="Financial resilience" title="재무적으로 버틸 수 있는가?" /><div className="research-health-summary"><span>{report.financialHealth.status}</span><p>{report.financialHealth.explanation}</p><strong>불황 대응</strong><p>{report.financialHealth.downturnResponse}</p><small>판단 변경 조건 · {report.financialHealth.changeCondition}</small></div><div className="research-metric-grid">{report.financialHealth.metrics.map((metric) => <article key={metric.label}><span>{metric.label}</span><strong>{formatNumber(metric.value, 0)}<small>{metric.unit === 'USD million' ? '백만 USD' : '백만 주'}</small></strong><p>{metric.meaning}<Citations sourceIds={metric.sourceIds} report={report} /></p></article>)}</div></section>

      <section id="report-cycle" className="research-report-section"><SectionHeading number="06" eyebrow="Industry-cycle role" title="미래 산업 사이클에서도 중요한 역할을 할까?" /><div className="research-cycle-lead"><span>현재 역할</span><h3>{report.cycleRole.role}</h3><p>{report.cycleRole.currentPosition}<EvidenceCitations evidenceIds={report.cycleRole.evidenceIds} report={report} /></p></div><dl className="research-cycle-grid"><div><dt>산업 성장과 매출의 연결</dt><dd>{report.cycleRole.growthConnection}</dd></div><div><dt>상승기 효과</dt><dd>{report.cycleRole.upcycleEffect}</dd></div><div><dt>하락기 영향</dt><dd>{report.cycleRole.downcycleEffect}</dd></div><div><dt>대체 가능성</dt><dd>{report.cycleRole.substitutionRisk}</dd></div><div><dt>사이클 뒤에도 남는 경쟁력</dt><dd>{report.cycleRole.durableAdvantage}</dd></div><div><dt>판단 변경 조건</dt><dd>{report.cycleRole.changeCondition}</dd></div></dl></section>

      <section id="report-performance" className="research-report-section"><SectionHeading number="07" eyebrow="Performance & cash flow" title="실적과 현금흐름" /><ClaimList claims={[...report.sections.earnings, ...report.sections.financial]} report={report} /><div className="research-chart-grid">{report.charts.map((chart) => <Chart key={chart.id} chart={chart} sources={report.sources} />)}</div></section>

      <section id="report-method-choice" className="research-report-section"><SectionHeading number="08" eyebrow="Valuation method" title="왜 이 가치평가 방식을 사용했나요?" /><div className="research-method-choice"><span>주 방법</span><h3>{report.valuationMethod.name}</h3><p>{report.valuationMethod.whyThisModel}</p><strong>쉽게 설명하면</strong><p>{report.valuationMethod.easyExplanation}</p></div><h3 className="research-subheading">핵심 용어</h3><div className="research-glossary">{report.glossary.map((item) => <article key={item.term}><h4>{item.term}<small>{item.english}</small></h4><dl><div><dt>정확한 정의</dt><dd>{item.definition}</dd></div><div><dt>쉽게 설명하면</dt><dd>{item.easyExplanation}</dd></div><div><dt>이 기업에서 왜 중요한가</dt><dd>{item.relevance}</dd></div></dl></article>)}</div><h3 className="research-subheading">주 방법으로 사용하지 않은 모형</h3><div className="research-unused-methods">{report.valuationMethod.unusedMethods.map((item) => <article key={item.name}><strong>{item.name}</strong><p>{item.reason}</p></article>)}</div></section>

      <section id="report-market-value" className="research-report-section research-model-section"><SectionHeading number="09" eyebrow="Market price vs model" title="시장가격과 모형 가치의 차이" /><p className="research-section-intro">시장가격과 4A 가치평가 결과는 모두 {report.snapshot.valuationAsOf} 시점 snapshot으로 고정했습니다. 프리미엄이나 할인은 시장이 틀렸다는 뜻이 아니라 기준 시나리오와 다른 기대가 반영됐을 가능성을 보여줍니다.</p><div className="research-price-compare"><div><span>시장가격</span><strong>{formatCurrency(report.currentPrice)}</strong><small>{report.priceAsOf.slice(0, 10)}</small></div><div><span>기준 시나리오</span><strong>{formatCurrency(report.baseResult.estimatedValuePerShare)}</strong><small>{report.valuationDate}</small></div><div><span>모형 대비 차이</span><strong>{report.modelGapRate >= 0 ? '+' : ''}{formatPercent(report.modelGapRate)}</strong><small>{report.modelGapRate >= 0 ? '프리미엄' : '할인'}</small></div></div><p className="research-gap-explanation">{report.modelGapLabel} 시장은 기준 시나리오보다 높은 성장·마진, 낮은 위험 또는 더 오래 유지되는 경쟁우위를 반영할 수 있습니다.</p><div className="research-scenario-grid">{report.scenarios.map((scenario) => {
        const first = scenario.input.forecastAssumptions.years[0]; const last = scenario.input.forecastAssumptions.years[scenario.input.forecastAssumptions.years.length - 1];
        return <article key={scenario.name}><span>{scenario.label}</span><strong>{formatCurrency(scenario.result.estimatedValuePerShare)}</strong><dl><div><dt>첫해 성장</dt><dd>{formatPercent(first.revenueGrowthRate)}</dd></div><div><dt>정상 마진</dt><dd>{formatPercent(last.operatingMargin)}</dd></div><div><dt>WACC</dt><dd>{formatPercent(scenario.result.wacc)}</dd></div><div><dt>영구성장</dt><dd>{formatPercent(scenario.stableGrowthRate)}</dd></div><div><dt>Terminal ROIC</dt><dd>{formatPercent(scenario.input.terminalAssumptions.stableRoic ?? 0)}</dd></div><div><dt>계속가치 비중</dt><dd>{formatPercent(scenario.result.terminalValueShareOfEnterpriseValue)}</dd></div></dl></article>;
      })}</div></section>

      <MonteCarloSection result={monteCarlo} />

      <section id="report-reverse" className="research-report-section"><SectionHeading number="11" eyebrow="Reverse DCF" title="현재 가격에는 어떤 기대가 반영돼 있나요?" /><div className="research-reverse-summary"><strong>{formatPercent(report.reverseDcf.solvedRevenueCagr)}</strong><p>기준 시나리오의 영업이익률, WACC, 재투자율과 영구성장률을 고정하면 현재 가격에는 향후 {report.baseInput.forecastAssumptions.years.length}년 매출 CAGR 약 {formatPercent(report.reverseDcf.solvedRevenueCagr)}가 반영돼 있습니다. 이는 회사가 반드시 달성해야 한다는 예측이 아니라 시장가격을 설명하는 조건입니다.<EvidenceCitations evidenceIds={[`${report.slug}-reverse-calculation`]} report={report} /></p></div><dl className="research-reverse-assumptions"><div><dt>전망기간</dt><dd>{report.baseInput.forecastAssumptions.years.length}년</dd></div><div><dt>정상 영업이익률</dt><dd>{formatPercent(baseForecastEnd.operatingMargin)}</dd></div><div><dt>WACC</dt><dd>{formatPercent(report.baseResult.wacc)}</dd></div><div><dt>영구성장률</dt><dd>{formatPercent(report.baseInput.terminalAssumptions.stableGrowthRate)}</dd></div><div><dt>Terminal ROIC</dt><dd>{formatPercent(report.baseInput.terminalAssumptions.stableRoic ?? 0)}</dd></div><div><dt>Capex 가정</dt><dd>매출의 {formatPercent(baseForecastEnd.capexAsPercentRevenue)}</dd></div><div><dt>운전자본 가정</dt><dd>매출의 {formatPercent(baseForecastEnd.changeInWorkingCapitalAsPercentRevenue)}</dd></div><div><dt>가격 기준일</dt><dd>{report.priceAsOf.slice(0, 10)}</dd></div></dl></section>

      <section id="report-benchmark" className="research-report-section"><SectionHeading number="12" eyebrow="Industry benchmark" title="산업 기준과 비교" /><p className="research-section-intro">{report.benchmark.explanation}</p><div className="research-benchmark-meta"><span>{report.benchmark.name}</span><strong>표본 {report.benchmark.sampleSize}개 · 기준일 {report.benchmarkAsOf}</strong></div><table className="research-benchmark-table"><caption>회사 가치평가 가정과 업종 집계치 비교</caption><thead><tr><th scope="col">항목</th><th scope="col">회사 가정</th><th scope="col">업종 집계</th><th scope="col">절대 차이</th><th scope="col">상대 차이</th></tr></thead><tbody>{report.benchmark.comparisons.map((item) => <tr key={item.label}><th scope="row">{item.label}</th><td>{item.unit === 'percent' ? formatPercent(item.companyValue, 2) : `${formatNumber(item.companyValue, 2)}배`}</td><td>{item.unit === 'percent' ? formatPercent(item.benchmarkValue, 2) : `${formatNumber(item.benchmarkValue, 2)}배`}</td><td>{item.unit === 'percent' ? `${item.absoluteDifference >= 0 ? '+' : ''}${formatNumber(item.absoluteDifference * 100, 2)}%p` : `${formatNumber(item.absoluteDifference, 2)}배`}</td><td>{item.relativeDifference >= 0 ? '+' : ''}{formatPercent(item.relativeDifference, 1)}</td></tr>)}</tbody></table><p className="research-attribution-note">직접 비교기업 중앙값: 사용하지 않음 · 업종 집계치: 보조 기준으로 사용</p></section>

      <section id="report-variables" className="research-report-section"><SectionHeading number="13" eyebrow="Value drivers" title="가치에 영향을 주는 변수" /><div className="research-terminal-diagnostics"><h3>Terminal Value 진단</h3><dl><div><dt>명시적 FCFF 현재가치</dt><dd>{formatNumber(report.baseResult.presentValueOfForecastFcff, 0)}백만 USD</dd></div><div><dt>Terminal Value 현재가치</dt><dd>{formatNumber(report.baseResult.presentValueOfTerminalValue, 0)}백만 USD</dd></div><div><dt>Terminal Value / 기업가치</dt><dd>{formatPercent(report.baseResult.terminalValueShareOfEnterpriseValue)}</dd></div><div><dt>영구성장률</dt><dd>{formatPercent(report.baseInput.terminalAssumptions.stableGrowthRate)}</dd></div><div><dt>Terminal ROIC</dt><dd>{formatPercent(report.baseInput.terminalAssumptions.stableRoic ?? 0)}</dd></div><div><dt>Terminal 재투자율</dt><dd>{reinvestment === null ? '계산 제한' : formatPercent(reinvestment)}</dd></div><div><dt>WACC</dt><dd>{formatPercent(report.baseResult.wacc)}</dd></div></dl></div><div className="research-sensitivity-grid"><SensitivityTable matrix={report.waccGrowthSensitivity} title="WACC × 영구성장률 5×5" rowLabel="WACC" columnLabel="영구성장률" baseRow={report.baseResult.wacc} baseColumn={report.baseInput.terminalAssumptions.stableGrowthRate} /><SensitivityTable matrix={report.driverSensitivity} title="첫해 성장률 × 영업이익률 5×5" rowLabel="성장률" columnLabel="영업이익률" baseRow={baseForecastStart.revenueGrowthRate} baseColumn={baseForecastStart.operatingMargin} /></div><h3 className="research-subheading">작성 시점 사건과 가치평가 연결</h3><div className="research-impact-list">{report.newsValuationImpacts.map((impact) => { const event = report.materialNewsEvents.find((item) => item.id === impact.eventId)!; return <article key={impact.eventId}><h4>{event.title}</h4><dl><div><dt>영향받는 가정</dt><dd>{impact.affectedAssumption}</dd></div><div><dt>기존 가정</dt><dd>{impact.previousAssumption}</dd></div><div><dt>검토 범위</dt><dd>{impact.reviewRange}</dd></div><div><dt>가치 경로</dt><dd className="research-path">{impact.valuePath.map((step) => <span key={step}>{step}</span>)}</dd></div><div><dt>현재 모델 변경 여부</dt><dd>{impact.modelChange}</dd></div></dl></article>; })}</div></section>

      <section id="report-risks" className="research-report-section"><SectionHeading number="14" eyebrow="Risks & next checks" title="위험과 다음 확인 항목" /><ClaimList claims={report.sections.outlook} report={report} /><div className="research-watch-box"><strong>다음 판단 수정 시점</strong><p>{report.watchStatement}</p></div></section>

      <section id="report-sources" className="research-report-section research-method-section"><SectionHeading number="15" eyebrow="Sources, calculations & limits" title="출처·계산 방법·한계·면책" /><h3>계산 방법</h3><ul className="research-calculation-methods"><li>영업이익률 = EBIT ÷ 매출</li><li>FCFF = 세후 영업이익 + 감가상각 − 설비투자 − 운전자본 증가</li><li>시장가격의 모형 대비 괴리율 = 시장가격 ÷ 기준 시나리오 가치 − 1</li><li>Terminal 재투자율 = 영구성장률 ÷ Terminal ROIC</li></ul><h3>출처·원본 자료</h3><ol className="research-source-list">{report.sources.map((source, index) => <li key={source.id} id={`source-${index + 1}`}><span>[{index + 1}]</span><div><strong>{source.publisher} · {source.title}</strong><small>{[source.documentType ?? '원본 자료', source.publishedAt ? `공시·발표 ${source.publishedAt}` : '', source.periodEnd ? `대상 기간 ${source.periodEnd}` : ''].filter(Boolean).join(' · ')}</small><details><summary>기술 정보</summary><dl><div><dt>source ID</dt><dd>{source.id}</dd></div>{source.accessionNumber ? <div><dt>Accession number</dt><dd>{source.accessionNumber}</dd></div> : null}{source.xbrlConcepts?.length ? <div><dt>XBRL concept</dt><dd>{source.xbrlConcepts.join(', ')}</dd></div> : null}</dl></details></div><a href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`${source.title} 원문 열기`}>원문 <ExternalLink size={13} aria-hidden="true" /></a></li>)}</ol><h3>방법론과 한계</h3><ul className="research-limitations">{report.limitations.map((item) => <li key={item}>{item}</li>)}</ul>{report.warnings.length ? <aside className="research-warning-box"><strong>모형 확인 사항</strong><ul>{report.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></aside> : null}<aside className="research-disclaimer"><strong>주의</strong><p>이 자료는 공개 정보와 명시된 가정을 설명하기 위한 교육·리서치 자료이며 매수·매도 권유가 아닙니다. 시장가격과 모형 결과의 차이는 행동 지시나 가격 전망을 뜻하지 않습니다. 데이터와 가정은 이후 변경될 수 있고 최종 판단과 책임은 이용자에게 있습니다.</p></aside></section>
    </main>
  </div>;
}

export default function ResearchReportRoute({ slug, navigation, onNavigate }: Props) {
  const [report, setReport] = useState<ResearchReportModel | null | undefined>(undefined);
  const [monteCarlo, setMonteCarlo] = useState<MonteCarloValuationResult | null | undefined>(undefined);
  useEffect(() => {
    let active = true;
    setReport(undefined);
    setMonteCarlo(undefined);
    loadResearchReport(slug).then(async (value) => {
      if (!active) return;
      setReport(value);
      if (!value) {
        setMonteCarlo(null);
        return;
      }
      try {
        const result = await loadMonteCarloResult(value.slug);
        if (active) setMonteCarlo(result);
      } catch {
        if (active) setMonteCarlo(null);
      }
    });
    return () => { active = false; };
  }, [slug]);
  if (report === undefined || (report && monteCarlo === undefined)) return <div className="pick-shell research-report-shell">{navigation}<main className="research-report-status" aria-live="polite"><p>리서치 리포트와 가치평가 분포를 불러오는 중입니다.</p></main></div>;
  if (report === null) return <div className="pick-shell research-report-shell">{navigation}<main className="research-report-status"><h1>해당 리서치 리포트를 찾을 수 없습니다.</h1><p>현재 공개된 기업 리서치 리포트는 기업 대시보드에서 확인해 주세요.</p><a href="/ko/companies" onClick={internalLink('/ko/companies', onNavigate)}>기업 분석으로 이동</a></main></div>;
  if (monteCarlo === null) return <div className="pick-shell research-report-shell">{navigation}<main className="research-report-status"><h1>가치평가 분포를 불러오지 못했습니다.</h1><p>정적 분석 snapshot을 다시 확인해 주세요.</p></main></div>;
  return <ResearchReport report={report} monteCarlo={monteCarlo!} navigation={navigation} onNavigate={onNavigate} />;
}

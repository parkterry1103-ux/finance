import type { MonteCarloValuationResult } from '../../content/monte-carlo/types.js';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number, digits = 1) {
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: digits }).format(value);
}

function formatPercent(value: number, digits = 1) {
  return `${formatNumber(value * 100, digits)}%`;
}

function distributionPosition(value: number, minimum: number, maximum: number) {
  if (maximum === minimum) return 50;
  return Math.max(0, Math.min(100, ((value - minimum) / (maximum - minimum)) * 100));
}

export function MonteCarloValuationSection({ result }: { result: MonteCarloValuationResult }) {
  const { percentiles } = result;
  const marketPrice = result.currentMarketPrice;
  const domainMinimum = Math.min(percentiles.p5, marketPrice?.value ?? percentiles.p5);
  const domainMaximum = Math.max(percentiles.p95, marketPrice?.value ?? percentiles.p95);
  const position = (value: number) => distributionPosition(value, domainMinimum, domainMaximum);
  const markers = [
    { label: 'P10', value: percentiles.p10 },
    { label: 'P25', value: percentiles.p25 },
    { label: 'P50', value: percentiles.p50 },
    { label: 'P75', value: percentiles.p75 },
    { label: 'P90', value: percentiles.p90 },
  ];
  const finalConvergence = result.convergence[result.convergence.length - 1];

  return <section className="valuation-section research-uncertainty-section" id="valuation-uncertainty" aria-labelledby="valuation-uncertainty-title">
    <div className="valuation-section-heading"><span>05</span><div><p>Probabilistic valuation</p><h2 id="valuation-uncertainty-title">가치평가의 불확실성</h2></div></div>
    <p className="valuation-section-intro">하나의 숫자를 정답처럼 제시하지 않고, 검증된 보수·기준·낙관 가정 사이에서 입력을 5만 번 다시 뽑은 모형 결과의 분포를 보여줍니다. 미래 주가 예측이나 상승·하락 확률이 아닙니다.</p>

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
          {markers.map((marker) => <span key={marker.label} className={`research-distribution-marker ${marker.label === 'P50' ? 'is-median' : ''}`} style={{ left: `${position(marker.value)}%` }} />)}
          {marketPrice ? <span className={`research-market-marker ${position(marketPrice.value) > 88 ? 'is-end' : position(marketPrice.value) < 12 ? 'is-start' : ''}`} style={{ left: `${position(marketPrice.value)}%` }}><strong>시장가격</strong><small>{formatCurrency(marketPrice.value)}</small></span> : null}
        </div>
        <dl className="research-distribution-labels">{markers.map((marker) => <div key={marker.label}><dt>{marker.label}</dt><dd>{formatCurrency(marker.value)}</dd></div>)}</dl>
      </div>
      <p className="research-distribution-alternative">텍스트 대안: 중앙값은 {formatCurrency(percentiles.p50)}, 중앙 50%는 {formatCurrency(percentiles.p25)}에서 {formatCurrency(percentiles.p75)}, 넓은 80%는 {formatCurrency(percentiles.p10)}에서 {formatCurrency(percentiles.p90)}입니다.</p>
    </figure>

    {marketPrice ? <aside className="research-market-percentile"><strong>모형 분포상 위치 · 약 {formatNumber(marketPrice.modelDistributionPercentile, 1)}백분위</strong><p>현재 시장가격 {formatCurrency(marketPrice.value)}은 선택한 가정 분포에서 약 {formatNumber(marketPrice.modelDistributionPercentile, 1)}백분위에 있습니다. 이는 미래 가격의 방향이나 확률을 뜻하지 않습니다.</p></aside> : null}

    <div className="research-uncertainty-diagnostics">
      <article><h3>가장 민감한 가정</h3><ol>{result.driverImportance.slice(0, 5).map((driver) => <li key={driver.assumptionId}><span>{driver.label}</span><strong>{driver.spearmanCorrelation >= 0 ? '+' : ''}{formatNumber(driver.spearmanCorrelation, 3)}</strong></li>)}</ol><p>절댓값이 클수록 이 모형 안에서 결과와 순위가 더 함께 움직였습니다. 실제 사업의 인과관계를 뜻하지 않습니다.</p></article>
      <article><h3>장기 구간 의존도</h3><dl><div><dt>Terminal Value 비중 P50</dt><dd>{formatPercent(result.terminalValueDiagnostics.medianShare)}</dd></div><div><dt>Terminal Value 비중 P90</dt><dd>{formatPercent(result.terminalValueDiagnostics.p90Share)}</dd></div><div><dt>80% 초과 표본</dt><dd>{formatPercent(result.terminalValueDiagnostics.overEightyPercentShare, 2)}</dd></div></dl><p>장기 구간 비중이 높을수록 WACC·영구성장률·장기 ROIC 가정에 더 민감합니다.</p></article>
    </div>

    <details className="research-monte-carlo-method">
      <summary>상세 가정·방법론</summary>
      <div className="research-monte-carlo-method-body">
        <h3>실행과 제약조건</h3>
        <dl className="research-monte-carlo-run">
          <div><dt>반복 횟수</dt><dd>{formatNumber(result.run.iterations, 0)}회</dd></div>
          <div><dt>고정 seed</dt><dd>{result.run.seed}</dd></div>
          <div><dt>유효 / 제외</dt><dd>{formatNumber(result.run.validIterations, 0)} / {formatNumber(result.run.rejectedIterations, 0)}</dd></div>
          <div><dt>제외율</dt><dd>{formatPercent(result.run.rejectionRate, 3)}</dd></div>
          <div><dt>엔진</dt><dd>{result.run.engineVersion}</dd></div>
          <div><dt>리포트 버전</dt><dd>{result.run.reportVersion}</dd></div>
        </dl>
        <h3>입력 분포</h3>
        <div className="research-monte-carlo-table-scroll" tabIndex={0} aria-label="Monte Carlo 입력 분포 표 가로 스크롤 영역">
          <table><caption>회사별 Monte Carlo 삼각분포</caption><thead><tr><th scope="col">가정</th><th scope="col">하단</th><th scope="col">기준점</th><th scope="col">상단</th><th scope="col">근거</th></tr></thead><tbody>{result.distributions.map((distribution) => <tr key={distribution.assumptionId}><th scope="row">{distribution.label}</th><td>{formatPercent(distribution.minimum, 2)}</td><td>{formatPercent(distribution.mode, 2)}</td><td>{formatPercent(distribution.maximum, 2)}</td><td>{distribution.rationale}</td></tr>)}</tbody></table>
        </div>
        <h3>수렴성</h3>
        <p>최종 유효 표본은 {formatNumber(finalConvergence.validIterations, 0)}개입니다. 25,000회와 50,000회 사이 P10·P50·P90 상대 차이가 모두 1% 이내인지 저장 artifact에서 검증합니다.</p>
        <ul>{result.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
        {result.warnings.length ? <ul>{result.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}
      </div>
    </details>
  </section>;
}

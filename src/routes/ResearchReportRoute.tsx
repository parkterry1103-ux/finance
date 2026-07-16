import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, ExternalLink, Printer } from 'lucide-react';
import { loadResearchReport } from '../content/research-reports/registry.js';
import { terminalReinvestmentRate } from '../content/research-reports/build-report.js';
import type {
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

const evidenceLabels: Record<ResearchEvidence['type'], string> = {
  fact: '사실',
  calculation: '계산',
  interpretation: '해석',
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

function scenarioDescription(name: ResearchReportModel['scenarios'][number]['name']) {
  if (name === 'conservative') return '성장률과 마진이 기준 조건보다 낮고 장기 수익성이 더 빠르게 정상화되는 경우입니다.';
  if (name === 'optimistic') return '높은 성장과 자본수익률이 더 오래 유지되며 장기 구간 의존도가 커질 수 있는 경우입니다.';
  return '현재 확인 가능한 사업 흐름과 공식 재무자료를 중심으로 구성한 기준 가정입니다.';
}

function isSameNumber(left: number, right: number) {
  return Math.abs(left - right) < 1e-10;
}

function internalLink(path: string, onNavigate: (path: string) => void) {
  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate(path);
  };
}

function EvidenceLinks({ evidenceIds, evidence }: { evidenceIds: string[]; evidence: ResearchEvidence[] }) {
  return <span className="research-evidence-links" aria-label="문장 근거">{evidenceIds.map((id) => {
    const item = evidence.find((candidate) => candidate.id === id);
    return item ? <a key={id} href={`#evidence-${id}`} className={`evidence-${item.type}`}>{evidenceLabels[item.type]}</a> : null;
  })}</span>;
}

function ClaimList({ claims, evidence }: { claims: ResearchClaim[]; evidence: ResearchEvidence[] }) {
  return <div className="research-claim-grid">{claims.map((claim) => <article key={claim.title} className="research-claim-card">
    <h3>{claim.title}</h3>
    <p>{claim.body}</p>
    <EvidenceLinks evidenceIds={claim.evidenceIds} evidence={evidence} />
  </article>)}</div>;
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
      {[0, 0.5, 1].map((ratio) => <g key={ratio}>
        <line x1="70" x2="625" y1={218 - plotHeight * ratio} y2={218 - plotHeight * ratio} className="research-chart-gridline" />
        <text x="62" y={222 - plotHeight * ratio} textAnchor="end" className="research-chart-tick">{formatNumber(max * ratio, chart.unit === '%' ? 0 : 0)}</text>
      </g>)}
      {labels.map((label, pointIndex) => {
        const x = 70 + pointIndex * groupWidth + groupWidth / 2;
        return <g key={label}>
          {chart.series.map((series, seriesIndex) => {
            const value = series.points[pointIndex]?.value ?? 0;
            const barHeight = (Math.abs(value) / max) * plotHeight;
            const barX = x - (chart.series.length * barWidth) / 2 + seriesIndex * barWidth;
            return <rect key={series.label} x={barX} y={218 - barHeight} width={Math.max(barWidth - 3, 3)} height={barHeight} rx="4" className={`research-chart-bar series-${seriesIndex + 1}`} />;
          })}
          <text x={x} y="240" textAnchor="middle" className="research-chart-label">{label}</text>
        </g>;
      })}
      {chart.series.map((series, index) => <g key={series.label} transform={`translate(${80 + index * 170}, 260)`}>
        <rect width="12" height="12" rx="3" y="-10" className={`research-chart-bar series-${index + 1}`} />
        <text x="18" className="research-chart-legend">{series.label}</text>
      </g>)}
    </svg>
    <details className="research-chart-data"><summary>차트 데이터와 출처</summary>
      <table><caption>{chart.title} 원자료</caption><thead><tr><th scope="col">기간</th>{chart.series.map((series) => <th scope="col" key={series.label}>{series.label}</th>)}</tr></thead>
        <tbody>{labels.map((label, index) => <tr key={label}><th scope="row">{label}</th>{chart.series.map((series) => {
          const point = series.points[index];
          const citation = point?.sourceIds.map((id) => sources.findIndex((source) => source.id === id) + 1).filter(Boolean).join(', ');
          return <td key={series.label}>{formatNumber(point?.value ?? 0, chart.unit === '%' ? 1 : 0)}{citation ? <sup> [{citation}]</sup> : null}</td>;
        })}</tr>)}</tbody>
      </table>
    </details>
  </figure>;
}

function SensitivityTable({ matrix, title, rowLabel, columnLabel, baseRow, baseColumn }: { matrix: SensitivityMatrix; title: string; rowLabel: string; columnLabel: string; baseRow: number; baseColumn: number }) {
  const cell = (rowValue: number, columnValue: number) => matrix.cells.find((item) => item.rowValue === rowValue && item.columnValue === columnValue);
  return <figure className="research-sensitivity-card">
    <figcaption><strong>{title}</strong><span>셀 값: 주당 모형 결과(USD)</span></figcaption>
    <div className="research-sensitivity-scroll" tabIndex={0} aria-label={`${title} 표 가로 스크롤 영역`}>
      <table><caption>{rowLabel}과 {columnLabel} 변화에 따른 주당 모형 결과</caption><thead><tr><th scope="col">{rowLabel} \ {columnLabel}</th>{matrix.columnValues.map((value) => <th scope="col" key={value}>{formatPercent(value)}</th>)}</tr></thead>
        <tbody>{matrix.rowValues.map((rowValue) => <tr key={rowValue}><th scope="row">{formatPercent(rowValue)}</th>{matrix.columnValues.map((columnValue) => {
          const result = cell(rowValue, columnValue);
          const isBase = isSameNumber(rowValue, baseRow) && isSameNumber(columnValue, baseColumn);
          const value = result?.estimatedValuePerShare === null || result?.estimatedValuePerShare === undefined ? '계산 제한' : formatCurrency(result.estimatedValuePerShare);
          return <td key={columnValue} className={isBase ? 'research-sensitivity-base' : undefined} aria-label={isBase ? `${value}, 기준 가정` : value}>{value}{isBase ? <span>기준 가정</span> : null}</td>;
        })}</tr>)}</tbody>
      </table>
    </div>
  </figure>;
}

function EvidenceLedger({ report }: { report: ResearchReportModel }) {
  return <div className="research-evidence-ledger">{report.evidence.map((item) => <article key={item.id} id={`evidence-${item.id}`}>
    <span className={`evidence-${item.type}`}>{evidenceLabels[item.type]}</span>
    <div><strong>{item.statement}</strong>{item.formula ? <p>산식: {item.formula}</p> : null}{item.asOf ? <small>기준일 {item.asOf}</small> : null}</div>
    <div className="research-evidence-citations">{item.sourceIds.map((sourceId) => {
      const index = report.sources.findIndex((source) => source.id === sourceId);
      return index >= 0 ? <a key={sourceId} href={`#source-${index + 1}`}>[{index + 1}]</a> : null;
    })}{item.dependsOnEvidenceIds?.map((id) => <a key={id} href={`#evidence-${id}`}>근거 연결</a>)}</div>
  </article>)}</div>;
}

function ResearchReport({ report, navigation, onNavigate }: { report: ResearchReportModel; navigation: ReactNode; onNavigate: (path: string) => void }) {
  const baseDifference = report.baseResult.estimatedValuePerShare - report.currentPrice;
  const reinvestment = terminalReinvestmentRate(report);
  const baseForecastStart = report.baseInput.forecastAssumptions.years[0];
  const baseForecastEnd = report.baseInput.forecastAssumptions.years[report.baseInput.forecastAssumptions.years.length - 1];
  return <div className="pick-shell research-report-shell">
    <div className="research-screen-navigation">{navigation}</div>
    <main className="research-report-main">
      <div className="research-report-actions">
        <a href={`/ko/companies/${report.slug}`} onClick={internalLink(`/ko/companies/${report.slug}`, onNavigate)}><ArrowLeft size={16} aria-hidden="true" /> 기업 대시보드</a>
        <button type="button" onClick={() => window.print()}><Printer size={16} aria-hidden="true" /> 인쇄·PDF 저장</button>
      </div>

      <section className="research-report-cover" id="report-conclusion" aria-labelledby="research-report-title">
        <p className="research-report-brand">주가해부실 Research <span>기업 분석 리포트</span></p>
        <div className="research-report-identity"><span>{report.ticker} · {report.industry}</span><h1 id="research-report-title">{report.companyName} 리서치 리포트</h1><p>{report.englishName}</p><strong className="research-report-title">{report.reportTitle}</strong></div>
        <div className="research-report-conclusion"><span>한 문장 결론</span><strong>{report.conclusion}</strong><p>{report.watchStatement}</p></div>
        <dl className="research-report-dates">
          <div><dt>리포트 작성일</dt><dd>{report.reportDate}</dd></div>
          <div><dt>재무 기준일</dt><dd>{report.financialsAsOf}</dd></div>
          <div><dt>가격 기준일</dt><dd>{report.priceAsOf.slice(0, 10)}</dd></div>
          <div><dt>가치평가 기준일</dt><dd>{report.valuationDate}</dd></div>
        </dl>
        <div className="research-executive-grid" aria-label="핵심 요약">
          {([['강점', report.executiveSummary.strengths], ['위험', report.executiveSummary.risks], ['다음 확인', report.executiveSummary.nextChecks]] as const).map(([label, claims]) => <div key={label}><strong>{label}</strong><ul>{claims.map((claim) => <li key={claim.title}><span>{claim.title}</span><small>{claim.body}</small><EvidenceLinks evidenceIds={claim.evidenceIds} evidence={report.evidence} /></li>)}</ul></div>)}
        </div>
      </section>

      <nav className="research-report-toc" aria-label="리포트 목차"><strong>목차</strong><ol>
        <li><a href="#report-conclusion">결론</a></li><li><a href="#report-business">사업·경쟁</a></li><li><a href="#report-earnings">실적·동인</a></li>
        <li><a href="#report-financial">현금흐름·재무</a></li><li><a href="#report-model">모형 가치</a></li><li><a href="#report-industry">산업·거시</a></li>
        <li><a href="#report-outlook">계기·위험</a></li><li><a href="#report-method">근거·방법론</a></li>
      </ol></nav>

      <section id="report-business" className="research-report-section"><div className="research-section-heading"><span>02</span><div><p>Business & competition</p><h2>사업 구조와 경쟁</h2></div></div><ClaimList claims={report.sections.business} evidence={report.evidence} /></section>

      <section id="report-earnings" className="research-report-section"><div className="research-section-heading"><span>03</span><div><p>Earnings & drivers</p><h2>실적 흐름과 핵심 동인</h2></div></div><ClaimList claims={report.sections.earnings} evidence={report.evidence} /><div className="research-chart-grid">{report.charts.slice(0, 2).map((chart) => <Chart key={chart.id} chart={chart} sources={report.sources} />)}</div></section>

      <section id="report-financial" className="research-report-section"><div className="research-section-heading"><span>04</span><div><p>Cash flow, balance sheet & ROIC</p><h2>현금흐름·재무·자본수익성</h2></div></div><ClaimList claims={report.sections.financial} evidence={report.evidence} /><Chart chart={report.charts[2]} sources={report.sources} /><div className="research-diagnostic-row"><article><span>기준 장기 ROIC</span><strong>{formatPercent(report.baseInput.terminalAssumptions.stableRoic ?? 0)}</strong><small>계속가치 가정</small></article><article><span>장기 재투자율</span><strong>{reinvestment === null ? '계산 제한' : formatPercent(reinvestment)}</strong><small>영구성장률 ÷ 장기 ROIC</small></article><article><span>자본구조 기준일</span><strong>{report.capitalStructureAsOf}</strong><small>가격 기준일과 분리</small></article></div></section>

      <section id="report-model" className="research-report-section research-model-section"><div className="research-section-heading"><span>05</span><div><p>Model-based value</p><h2>모형 기반 가치 추정</h2></div></div>
        <p className="research-section-intro">현재 관측 가격은 비교 기준일 뿐입니다. 아래 값은 4A 가정과 FCFF 엔진이 만든 조건부 결과이며 행동 지시가 아닙니다. <EvidenceLinks evidenceIds={[`${report.slug}-model-interpretation`]} evidence={report.evidence} /></p>
        <dl className="research-assumption-dates" aria-label="모형 입력 기준일">
          <div><dt>희석주식 수</dt><dd>{report.dilutedSharesAsOf}</dd></div><div><dt>자본구조</dt><dd>{report.capitalStructureAsOf}</dd></div>
          <div><dt>무위험금리</dt><dd>{report.riskFreeAsOf}</dd></div><div><dt>ERP</dt><dd>{report.erpAsOf}</dd></div><div><dt>업종 benchmark</dt><dd>{report.benchmarkAsOf}</dd></div>
        </dl>
        <div className="research-price-compare"><div><span>관측 가격</span><strong>{formatCurrency(report.currentPrice)}</strong><small>{report.priceAsOf.slice(0, 10)}</small></div><div><span>기준 조건의 주당 결과</span><strong>{formatCurrency(report.baseResult.estimatedValuePerShare)}</strong><small>관측 가격과 차이 {baseDifference >= 0 ? '+' : ''}{formatCurrency(baseDifference)}</small></div><div><span>계속가치 비중</span><strong>{formatPercent(report.baseResult.terminalValueShareOfEnterpriseValue)}</strong><small>기업가치 기준</small></div></div>
        <div className="research-scenario-grid">{report.scenarios.map((scenario) => {
          const first = scenario.input.forecastAssumptions.years[0];
          const last = scenario.input.forecastAssumptions.years[scenario.input.forecastAssumptions.years.length - 1];
          return <article key={scenario.name}><span>{scenario.label}</span><strong>{formatCurrency(scenario.result.estimatedValuePerShare)}</strong><p>{scenarioDescription(scenario.name)}</p><dl>
            <div><dt>첫해 매출 성장</dt><dd>{formatPercent(first.revenueGrowthRate)}</dd></div><div><dt>정상 영업이익률</dt><dd>{formatPercent(last.operatingMargin)}</dd></div>
            <div><dt>Capex / 매출</dt><dd>{formatPercent(last.capexAsPercentRevenue)}</dd></div><div><dt>운전자본 증가 / 매출</dt><dd>{formatPercent(last.changeInWorkingCapitalAsPercentRevenue)}</dd></div>
            <div><dt>WACC</dt><dd>{formatPercent(scenario.result.wacc)}</dd></div><div><dt>영구성장률</dt><dd>{formatPercent(scenario.stableGrowthRate)}</dd></div>
            <div><dt>Terminal ROIC</dt><dd>{formatPercent(scenario.input.terminalAssumptions.stableRoic ?? 0)}</dd></div><div><dt>기업가치</dt><dd>{formatNumber(scenario.result.enterpriseValue, 0)}백만</dd></div>
            <div><dt>주주가치</dt><dd>{formatNumber(scenario.result.equityBridge.equityValue, 0)}백만</dd></div><div><dt>희석주식 수</dt><dd>{formatNumber(scenario.result.dilutedShares, 0)}백만</dd></div>
            <div><dt>계속가치 비중</dt><dd>{formatPercent(scenario.result.terminalValueShareOfEnterpriseValue)}</dd></div>
          </dl></article>;
        })}</div>
        <div className="research-terminal-diagnostics"><h3>Terminal Value 진단</h3><dl>
          <div><dt>명시적 FCFF 현재가치</dt><dd>{formatNumber(report.baseResult.presentValueOfForecastFcff, 0)}백만 USD</dd></div><div><dt>Terminal Value 현재가치</dt><dd>{formatNumber(report.baseResult.presentValueOfTerminalValue, 0)}백만 USD</dd></div>
          <div><dt>Terminal Value / 기업가치</dt><dd>{formatPercent(report.baseResult.terminalValueShareOfEnterpriseValue)}</dd></div><div><dt>영구성장률</dt><dd>{formatPercent(report.baseInput.terminalAssumptions.stableGrowthRate)}</dd></div>
          <div><dt>Terminal ROIC</dt><dd>{formatPercent(report.baseInput.terminalAssumptions.stableRoic ?? 0)}</dd></div><div><dt>Terminal 재투자율</dt><dd>{reinvestment === null ? '계산 제한' : formatPercent(reinvestment)}</dd></div><div><dt>WACC</dt><dd>{formatPercent(report.baseResult.wacc)}</dd></div>
        </dl></div>
        <div className="research-sensitivity-grid"><SensitivityTable matrix={report.waccGrowthSensitivity} title="WACC × 영구성장률 5×5" rowLabel="WACC" columnLabel="영구성장률" baseRow={report.baseResult.wacc} baseColumn={report.baseInput.terminalAssumptions.stableGrowthRate} /><SensitivityTable matrix={report.driverSensitivity} title="첫해 성장률 × 영업이익률 5×5" rowLabel="성장률" columnLabel="영업이익률" baseRow={baseForecastStart.revenueGrowthRate} baseColumn={baseForecastStart.operatingMargin} /></div>
        <div className="research-model-diagnostics"><article className="research-reverse-dcf"><span>역산 DCF</span><h3>현재 가격이 반영한 기대</h3><strong>{formatPercent(report.reverseDcf.solvedRevenueCagr)}</strong><p>기준 조건의 영업이익률, WACC, 재투자율과 영구성장률을 고정할 경우, 현재 가격에는 향후 {report.baseInput.forecastAssumptions.years.length}년 매출 CAGR 약 {formatPercent(report.reverseDcf.solvedRevenueCagr)}가 반영돼 있습니다. 실현 가능성은 향후 성장과 정상 마진을 함께 확인해야 합니다.</p><dl>
          <div><dt>고정 영업이익률</dt><dd>{formatPercent(baseForecastEnd.operatingMargin)}</dd></div><div><dt>고정 WACC</dt><dd>{formatPercent(report.baseResult.wacc)}</dd></div><div><dt>고정 영구성장률</dt><dd>{formatPercent(report.baseInput.terminalAssumptions.stableGrowthRate)}</dd></div><div><dt>고정 Terminal ROIC</dt><dd>{formatPercent(report.baseInput.terminalAssumptions.stableRoic ?? 0)}</dd></div>
          <div><dt>전망기간</dt><dd>{report.baseInput.forecastAssumptions.years.length}년</dd></div><div><dt>Capex 가정</dt><dd>매출의 {formatPercent(baseForecastEnd.capexAsPercentRevenue)}</dd></div><div><dt>운전자본 가정</dt><dd>매출의 {formatPercent(baseForecastEnd.changeInWorkingCapitalAsPercentRevenue)}</dd></div><div><dt>가격 기준일</dt><dd>{report.priceAsOf.slice(0, 10)}</dd></div>
        </dl><small>수렴 상태 {report.reverseDcf.converged ? '수렴' : '추가 확인'} · 상대 오차 {formatPercent(report.reverseDcf.relativeError, 4)}</small><EvidenceLinks evidenceIds={[`${report.slug}-reverse-calculation`]} evidence={report.evidence} /></article><article><span>ROIC fade 진단</span><h3>{report.roicFade.label}</h3><strong>{formatCurrency(report.roicFade.estimatedValuePerShare)}</strong><p>장기 ROIC {formatPercent(report.roicFade.terminalRoic)} 적용 시 기준 조건과 차이 {report.roicFade.differenceFromBase >= 0 ? '+' : ''}{formatCurrency(report.roicFade.differenceFromBase)}. 확률을 부여한 조건이 아니라 가정 의존도를 보는 진단입니다.</p><EvidenceLinks evidenceIds={[`${report.slug}-roic-fade-calculation`]} evidence={report.evidence} /></article></div>
        {report.warnings.length ? <aside className="research-warning-box"><strong>모형 경고</strong><ul>{report.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></aside> : null}
      </section>

      <section id="report-industry" className="research-report-section"><div className="research-section-heading"><span>06</span><div><p>Industry & macro</p><h2>산업과 거시 변수</h2></div></div><ClaimList claims={report.sections.industry} evidence={report.evidence} /></section>
      <section id="report-outlook" className="research-report-section"><div className="research-section-heading"><span>07</span><div><p>Catalysts, risks & next checks</p><h2>확인 계기·위험·다음 점검</h2></div></div><ClaimList claims={report.sections.outlook} evidence={report.evidence} /></section>

      <section id="report-method" className="research-report-section research-method-section"><div className="research-section-heading"><span>08</span><div><p>Sources, methodology & limitations</p><h2>근거·방법론·한계</h2></div></div>
        <h3>핵심 용어와 쉬운 해설</h3><div className="research-glossary">{report.glossary.map((item) => <article key={item.term}><h4>{item.term}<small>{item.english}</small></h4><dl><div><dt>정의</dt><dd>{item.definition}</dd></div><div><dt>쉽게 설명하면</dt><dd>{item.easyExplanation}</dd></div><div><dt>이 분석에서 중요한 이유</dt><dd>{item.relevance}</dd></div></dl></article>)}</div>
        <h3>사실·계산·해석 원장</h3><p>사실은 원문 출처, 계산은 산식과 입력 근거, 해석은 앞선 증거 연결을 표시합니다.</p><EvidenceLedger report={report} />
        <h3>출처 목록</h3><ol className="research-source-list">{report.sources.map((source, index) => <li key={source.id} id={`source-${index + 1}`}><span>[{index + 1}]</span><div><strong>{source.publisher} · {source.title}</strong><small>{[source.publishedAt, source.periodEnd ? `기간말 ${source.periodEnd}` : '', source.note].filter(Boolean).join(' · ')}</small></div><a href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`${source.title} 원문 열기`}>원문 <ExternalLink size={13} aria-hidden="true" /></a></li>)}</ol>
        <h3>방법론과 한계</h3><ul className="research-limitations">{report.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
        <aside className="research-disclaimer"><strong>주의</strong><p>이 자료는 공개 정보와 명시된 가정을 설명하기 위한 교육·리서치 자료이며 매수·매도 권유가 아닙니다. 데이터와 가정은 이후 변경될 수 있고, 최종 판단과 책임은 이용자에게 있습니다.</p></aside>
      </section>
    </main>
  </div>;
}

export default function ResearchReportRoute({ slug, navigation, onNavigate }: Props) {
  const [report, setReport] = useState<ResearchReportModel | null | undefined>(undefined);
  useEffect(() => {
    let active = true;
    setReport(undefined);
    loadResearchReport(slug).then((value) => { if (active) setReport(value); });
    return () => { active = false; };
  }, [slug]);
  if (report === undefined) return <div className="pick-shell research-report-shell">{navigation}<main className="research-report-status" aria-live="polite"><p>리서치 리포트를 불러오는 중입니다.</p></main></div>;
  if (report === null) return <div className="pick-shell research-report-shell">{navigation}<main className="research-report-status"><h1>해당 리서치 리포트를 찾을 수 없습니다.</h1><p>현재 공개된 기업 리서치 리포트는 기업 대시보드에서 확인해 주세요.</p><a href="/ko/companies" onClick={internalLink('/ko/companies', onNavigate)}>기업 분석으로 이동</a></main></div>;
  return <ResearchReport report={report} navigation={navigation} onNavigate={onNavigate} />;
}

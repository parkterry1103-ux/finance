import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, ExternalLink, RotateCcw } from 'lucide-react';
import type { MarketPrice } from '../data.js';
import { getPriceForTicker } from '../services/prices.js';
import { loadResearchReport } from '../content/research-reports/registry.js';
import type { ResearchReportModel } from '../content/research-reports/types.js';
import {
  adjustedWaccGrowthSensitivity,
  buildValuationExpectationView,
  valuationEvidenceStatusLabels,
  valuationPricePositionLabels,
  valuationReadinessCompany,
  validateValuationExpectationView,
  type ValuationExpectationView,
  type ValuationPriceSnapshot,
} from '../content/valuation/index.js';
import { loadEventImpacts, type EventImpactRecord } from '../content/event-impacts/index.js';
import { ValuationAssumptionReviewSection } from '../components/event-impacts/EventImpactUi.js';
import { trackAnalyticsEvent } from '../analytics/index.js';

type Props = {
  slug: string;
  marketPrices: MarketPrice[];
  navigation: ReactNode;
  onNavigate: (path: string) => void;
};

function internalLink(path: string, onNavigate: (path: string) => void) {
  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate(path);
  };
}

function parseAmount(value?: string | number) {
  const parsed = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'KRW' ? 0 : 2,
    maximumFractionDigits: currency === 'KRW' ? 0 : 2,
  }).format(value);
}

function formatPercent(value: number, digits = 1) {
  return `${new Intl.NumberFormat('ko-KR', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value * 100)}%`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York',
  }).format(date);
}

function marketDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'America/New_York',
  }).formatToParts(date);
  const byType = new Map(parts.map((part) => [part.type, part.value]));
  return `${byType.get('year')}-${byType.get('month')}-${byType.get('day')}`;
}

function currentPriceSnapshot(report: ResearchReportModel, prices: MarketPrice[]): ValuationPriceSnapshot {
  const stored = getPriceForTicker(report.ticker, undefined, prices);
  const storedValue = parseAmount(stored?.close ?? stored?.price);
  const currencyMatches = stored?.currency === report.baseResult.currency;
  if (storedValue !== null && storedValue > 0 && stored?.asOf && currencyMatches && !/fallback|example|mock/i.test(stored.source)) {
    return {
      value: storedValue,
      currency: stored.currency,
      asOf: stored.asOf,
      session: 'regularClose',
      sourceId: `${report.slug}-market-price`,
      sourceLabel: `${stored.source} · 저장된 미국 정규장 종가`,
      delayed: Boolean(stored.isDelayed || stored.priceLabel === 'delayed'),
    };
  }
  return {
    value: report.currentPrice,
    currency: report.baseResult.currency,
    asOf: report.priceAsOf,
    session: 'regularClose',
    sourceId: `${report.slug}-market-price`,
    sourceLabel: '가치평가 리포트 · 저장 가격 snapshot',
    delayed: true,
  };
}

function rangePosition(value: number, minimum: number, maximum: number) {
  return maximum === minimum ? 50 : ((value - minimum) / (maximum - minimum)) * 100;
}

function PriceRange({ view }: { view: ValuationExpectationView }) {
  const values = [...view.scenarios.map((scenario) => scenario.modelValue), view.price.value];
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padding = Math.max((rawMax - rawMin) * 0.12, rawMax * 0.04, 1);
  const domainMin = Math.max(0, rawMin - padding);
  const domainMax = rawMax + padding;
  const scenario = (id: 'conservative' | 'base' | 'optimistic') => view.scenarios.find((item) => item.id === id)!;
  const conservative = scenario('conservative');
  const base = scenario('base');
  const optimistic = scenario('optimistic');
  const position = (value: number) => Math.max(0, Math.min(100, rangePosition(value, domainMin, domainMax)));
  return <figure className="valuation-range-card" aria-labelledby="valuation-range-caption">
    <figcaption id="valuation-range-caption"><strong>모형 기반 가치 범위와 시장가격</strong><span>{view.model.currency} · 모형 {view.model.asOf} · 가격 {view.price.asOf.slice(0, 10)}</span></figcaption>
    <div className="valuation-range-plot" role="img" aria-label={`보수적 ${formatCurrency(conservative.modelValue, view.model.currency)}, 기준 ${formatCurrency(base.modelValue, view.model.currency)}, 낙관적 ${formatCurrency(optimistic.modelValue, view.model.currency)}, 현재 시장가격 ${formatCurrency(view.price.value, view.price.currency)}. 현재 가격은 ${valuationPricePositionLabels[view.pricePosition]}입니다.`}>
      <div className="valuation-range-axis" aria-hidden="true">
        <span className="valuation-range-band" style={{ left: `${position(conservative.modelValue)}%`, width: `${position(optimistic.modelValue) - position(conservative.modelValue)}%` }} />
        {view.scenarios.map((item) => <span key={item.id} className={`valuation-range-tick is-${item.id}`} style={{ left: `${position(item.modelValue)}%` }}><b>{item.label}</b><small>{formatCurrency(item.modelValue, view.model.currency)}</small></span>)}
        <span className={`valuation-price-marker ${position(view.price.value) < 12 ? 'is-start' : position(view.price.value) > 88 ? 'is-end' : ''}`} style={{ left: `${position(view.price.value)}%` }}><b>시장가격</b><small>{formatCurrency(view.price.value, view.price.currency)}</small></span>
      </div>
    </div>
    <p className="valuation-range-text">텍스트 대안: 모형 범위는 {formatCurrency(conservative.modelValue, view.model.currency)}에서 {formatCurrency(optimistic.modelValue, view.model.currency)}이며 기준 시나리오는 {formatCurrency(base.modelValue, view.model.currency)}입니다. 현재 시장가격 {formatCurrency(view.price.value, view.price.currency)}은 {valuationPricePositionLabels[view.pricePosition]}입니다.</p>
  </figure>;
}

function PositionExplanation({ view }: { view: ValuationExpectationView }) {
  const copy = view.pricePosition === 'aboveRange'
    ? '시장은 기준 모형보다 높은 성장률, 더 오래 유지되는 마진 또는 추가 사업가치를 반영하고 있을 가능성이 있습니다.'
    : view.pricePosition === 'belowRange'
      ? '시장은 모형보다 낮은 성장률, 더 높은 위험 또는 더 짧은 경쟁력 지속기간을 반영하고 있을 가능성이 있습니다.'
      : view.pricePosition === 'insideRange'
        ? '현재 가격은 세 시나리오가 만든 범위 안에 있습니다. 어느 시나리오에 가까운지는 성장과 마진의 실제 경로로 확인해야 합니다.'
        : '가격과 모형의 통화·기준이 달라 직접 비교하지 않았습니다.';
  return <aside className={`valuation-position position-${view.pricePosition}`}><span>시장가격의 위치</span><h2>{valuationPricePositionLabels[view.pricePosition]}</h2><p>{copy}</p><small>이 위치는 행동 지시가 아니라 가정 차이를 확인하기 위한 설명입니다.</small></aside>;
}

function SensitivityTable({ view }: { view: ValuationExpectationView }) {
  const matrix = view.sensitivity;
  const base = view.scenarios.find((scenario) => scenario.id === 'base')!;
  const cellFor = (row: number, column: number) => matrix.cells.find((cell) => cell.rowValue === row && cell.columnValue === column);
  const closestToPrice = matrix.cells
    .filter((cell) => cell.estimatedValuePerShare !== null && Number.isFinite(cell.estimatedValuePerShare))
    .reduce<typeof matrix.cells[number] | undefined>((closest, cell) => !closest || Math.abs(cell.estimatedValuePerShare! - view.price.value) < Math.abs(closest.estimatedValuePerShare! - view.price.value) ? cell : closest, undefined);
  return <div className="valuation-sensitivity-scroll" tabIndex={0} aria-label="WACC와 영구성장률 민감도 표 가로 스크롤 영역"><table><caption>WACC와 영구성장률 조합별 주당 모형 계산값</caption><thead><tr><th scope="col">WACC \ 영구성장률</th>{matrix.columnValues.map((column) => <th scope="col" key={column}>{formatPercent(column)}</th>)}</tr></thead><tbody>{matrix.rowValues.map((row) => <tr key={row}><th scope="row">{formatPercent(row)}</th>{matrix.columnValues.map((column) => {
    const cell = cellFor(row, column);
    const isBase = Math.abs(row - base.wacc) < 1e-9 && Math.abs(column - base.stableGrowthRate) < 1e-9;
    const isPriceNear = cell === closestToPrice;
    const label = cell?.estimatedValuePerShare === null || cell?.estimatedValuePerShare === undefined ? '계산 제한' : formatCurrency(cell.estimatedValuePerShare, view.model.currency);
    const notes = [isBase ? '기준 가정' : '', isPriceNear ? '현재 가격에 가장 가까운 조합' : ''].filter(Boolean);
    return <td key={column} className={[isBase ? 'is-base' : '', isPriceNear ? 'is-price-near' : ''].filter(Boolean).join(' ') || undefined} aria-label={notes.length ? `${label}, ${notes.join(', ')}` : label}>{label}{notes.map((note) => <small key={note}>{note}</small>)}</td>;
  })}</tr>)}</tbody></table></div>;
}

function FullValuation({ report, view, eventImpacts, onNavigate }: { report: ResearchReportModel; view: ValuationExpectationView; eventImpacts: EventImpactRecord[]; onNavigate: Props['onNavigate'] }) {
  const baseScenario = view.scenarios.find((scenario) => scenario.id === 'base')!;
  const [waccPercent, setWaccPercent] = useState(baseScenario.wacc * 100);
  const [growthPercent, setGrowthPercent] = useState(baseScenario.stableGrowthRate * 100);
  useEffect(() => {
    setWaccPercent(baseScenario.wacc * 100);
    setGrowthPercent(baseScenario.stableGrowthRate * 100);
  }, [baseScenario.wacc, baseScenario.stableGrowthRate, view.companySlug]);
  const adjusted = useMemo(() => adjustedWaccGrowthSensitivity(report, waccPercent / 100, growthPercent / 100), [growthPercent, report, waccPercent]);
  const priceDate = marketDate(view.price.asOf);
  const priceUpdatedOnly = priceDate !== view.model.asOf;
  const lastForecast = report.baseInput.forecastAssumptions.years[report.baseInput.forecastAssumptions.years.length - 1]!;
  const netCash = report.baseInput.capitalStructure.cash
    + (report.baseInput.capitalStructure.nonOperatingAssets ?? 0)
    - report.baseInput.capitalStructure.debt
    - (report.baseInput.capitalStructure.leaseLiabilities ?? 0)
    - (report.baseInput.capitalStructure.minorityInterest ?? 0)
    - (report.baseInput.capitalStructure.otherClaims ?? 0);
  const selectedSources = report.sources.filter((source) => view.sourceIds.includes(source.id)).slice(0, 8);
  return <>
    <header className="valuation-hero"><div><p>Valuation expectations · 설명형 가치평가</p><h1>{view.companyName} 시장가격에 반영된 기대</h1><span>{view.ticker} · 미국 시장 · {view.model.currency} · {report.industry}</span></div><p>이 화면은 특정 가격을 정답으로 제시하지 않습니다. 현재 시장가격이 어떤 성장과 수익성 가정을 요구하는지 설명합니다.</p></header>

    <section className="valuation-snapshot" aria-label="시장가격과 가치평가 기준">
      <article><span>현재 시장가격</span><strong>{formatCurrency(view.price.value, view.price.currency)}</strong><small>{formatDateTime(view.price.asOf)} 미국 동부 · {view.price.session === 'regularClose' ? '미국 정규장 종가' : view.price.session === 'premarket' ? '프리마켓' : view.price.session === 'intraday' ? '정규장 장중' : '시간외'}{view.price.delayed ? ' · 지연 저장값' : ''}</small><em>{view.price.sourceLabel}</em></article>
      <article><span>모형 버전</span><strong>{view.model.version}</strong><small>가치평가 기준 {view.model.asOf}</small><em>재무 {view.model.financialsAsOf} · 검증 {view.model.lastVerifiedAt}</em></article>
      <article><span>{priceUpdatedOnly ? '가격 업데이트' : '동일 기준 snapshot'}</span><strong>{priceUpdatedOnly ? '가격과 모형 기준일이 다릅니다' : '가격과 모형 기준일이 같습니다'}</strong><small>가격 {priceDate} · 모형 {view.model.asOf}</small><em>사업 가정은 자동 변경하지 않았습니다.</em></article>
    </section>

    <section className="valuation-section" aria-labelledby="valuation-range-title"><div className="valuation-section-heading"><span>01</span><div><p>Market price vs model</p><h2 id="valuation-range-title">현재 가격은 모형 범위의 어디에 있나요?</h2></div></div><PriceRange view={view} /><PositionExplanation view={view} /><div className="valuation-scenario-grid">{view.scenarios.map((scenario) => <article key={scenario.id}><span>{scenario.label}</span><strong>{formatCurrency(scenario.modelValue, view.model.currency)}</strong><dl><div><dt>첫해 성장</dt><dd>{formatPercent(scenario.firstYearGrowth)}</dd></div><div><dt>장기 영업이익률</dt><dd>{formatPercent(scenario.longRunMargin)}</dd></div><div><dt>WACC</dt><dd>{formatPercent(scenario.wacc)}</dd></div><div><dt>영구성장률</dt><dd>{formatPercent(scenario.stableGrowthRate)}</dd></div></dl></article>)}</div></section>

    <section className="valuation-section" aria-labelledby="valuation-implied-title"><div className="valuation-section-heading"><span>02</span><div><p>Reverse DCF</p><h2 id="valuation-implied-title">현재 가격을 설명하려면 어떤 성과가 필요한가요?</h2></div></div>{view.impliedExpectation ? <><div className="valuation-implied-lead"><span>시장 내재 매출 CAGR</span><strong>{formatPercent(view.impliedExpectation.value)}</strong><p>다른 기준 가정을 유지할 경우, 현재 시장가격은 향후 {view.impliedExpectation.forecastYears}년 동안 매출이 매년 같은 비율로 약 {formatPercent(view.impliedExpectation.value)} 성장하는 경로와 비슷합니다. 이는 확정 전망이 아니라 모형상 요구 조건입니다.</p></div><div className="valuation-comparison-grid">{view.impliedExpectation.comparisonItems.map((item) => <article key={item.label}><span>{item.label}</span><strong>{formatPercent(item.value)}</strong><small>{item.period} · {item.note}</small></article>)}</div><p className="valuation-comparison-note">과거 실제 기간과 미래 전망 기간이 다르므로 같은 정의의 CAGR만 나란히 보여주며 단순 우열로 확정하지 않습니다.</p><details className="valuation-details" onToggle={(event) => { if (event.currentTarget.open) trackAnalyticsEvent('valuation_assumptions_open', { companySlug: view.companySlug, placement: 'valuation' }, { oncePerPage: true, dedupeKey: 'reverse-assumptions' }); }}><summary>역산에서 고정한 가정 보기</summary><ul>{view.impliedExpectation.fixedAssumptions.map((item) => <li key={item}>{item}</li>)}</ul><dl><div><dt>역산 변수</dt><dd>{view.impliedExpectation.forecastYears}년 매출 CAGR</dd></div><div><dt>탐색 범위</dt><dd>{formatPercent(view.impliedExpectation.validRange.min)}–{formatPercent(view.impliedExpectation.validRange.max)}</dd></div><div><dt>기준 가격</dt><dd>{formatCurrency(view.price.value, view.price.currency)} · {priceDate}</dd></div><div><dt>희석주식 수</dt><dd>{new Intl.NumberFormat('ko-KR').format(report.baseInput.capitalStructure.dilutedShares)}백만 주</dd></div></dl></details></> : <div className="valuation-safe-state"><strong>내재 기대 계산 제한</strong><p>{view.impliedExpectationError}</p></div>}</section>

    <section className="valuation-section" aria-labelledby="valuation-premium-title"><div className="valuation-section-heading"><span>03</span><div><p>Expectation candidates</p><h2 id="valuation-premium-title">모형이 포착하지 못한 기대 후보</h2></div></div><p className="valuation-section-intro">모형과 시장가격의 차이는 아래 기대가 함께 반영됐을 가능성이 있습니다. 후보는 서로 중복될 수 있으며 금액의 합으로 해석할 수 없습니다.</p><div className="valuation-premium-grid">{view.premiumCandidates.map((candidate) => <article key={candidate.id}><header><span className={`evidence-${candidate.evidenceStatus}`}>{valuationEvidenceStatusLabels[candidate.evidenceStatus]}</span><small>근거 {candidate.evidenceIds.length}건</small></header><h3>{candidate.label}</h3><p>{candidate.explanation}</p><dl><dt>다음 확인</dt><dd>{candidate.watchItems.join(' · ')}</dd></dl></article>)}</div></section>

    <section className="valuation-section" aria-labelledby="valuation-assumptions-title">
      <div className="valuation-section-heading"><span>04</span><div><p>Assumptions & sensitivity</p><h2 id="valuation-assumptions-title">어떤 가정에 민감한가요?</h2></div></div>
      <div className="valuation-assumption-grid"><article><span>예측 매출 성장</span><strong>{formatPercent(report.baseInput.forecastAssumptions.years[0].revenueGrowthRate)} → {formatPercent(lastForecast.revenueGrowthRate)}</strong><small>{report.baseInput.forecastAssumptions.years.length}년 경로</small></article><article><span>장기 영업이익률</span><strong>{formatPercent(lastForecast.operatingMargin)}</strong><small>기준 시나리오</small></article><article><span>WACC</span><strong>{formatPercent(baseScenario.wacc)}</strong><small>할인율</small></article><article><span>영구성장률</span><strong>{formatPercent(baseScenario.stableGrowthRate)}</strong><small>WACC보다 낮아야 함</small></article></div>
      <div className="valuation-adjuster" onFocusCapture={() => trackAnalyticsEvent('valuation_sensitivity_open', { companySlug: view.companySlug, placement: 'valuation' }, { oncePerPage: true, dedupeKey: 'sensitivity' })}><div><h3>제한된 가정 변경</h3><p>브라우저 안에서만 계산하며 저장하지 않습니다.</p></div><label htmlFor="valuation-wacc">WACC (%)<input id="valuation-wacc" type="number" min="5" max="18" step="0.1" value={Number(waccPercent.toFixed(1))} onChange={(event) => setWaccPercent(Number(event.currentTarget.value))} /></label><label htmlFor="valuation-growth">영구성장률 (%)<input id="valuation-growth" type="number" min="0" max="6" step="0.1" value={Number(growthPercent.toFixed(1))} onChange={(event) => setGrowthPercent(Number(event.currentTarget.value))} /></label><button type="button" onClick={() => { setWaccPercent(baseScenario.wacc * 100); setGrowthPercent(baseScenario.stableGrowthRate * 100); }}><RotateCcw size={15} aria-hidden="true" /> 기준 가정으로 초기화</button><output aria-live="polite"><span>변경 조합의 모형 계산값</span><strong>{adjusted.estimatedValuePerShare === null ? '계산 제한' : formatCurrency(adjusted.estimatedValuePerShare, view.model.currency)}</strong><small>{adjusted.error ?? 'WACC와 영구성장률만 변경했습니다.'}</small></output></div>
      <SensitivityTable view={view} />
      <details className="valuation-details" onToggle={(event) => { if (event.currentTarget.open) trackAnalyticsEvent('valuation_assumptions_open', { companySlug: view.companySlug, placement: 'valuation' }, { oncePerPage: true, dedupeKey: 'model-assumptions' }); }}><summary>모형의 주요 가정 보기</summary><dl><div><dt>모형 계산일</dt><dd>{view.model.asOf}</dd></div><div><dt>세율</dt><dd>{formatPercent(lastForecast.normalizedTaxRate)}</dd></div><div><dt>감가상각</dt><dd>매출의 {formatPercent(lastForecast.depreciationAsPercentRevenue)}</dd></div><div><dt>설비투자</dt><dd>매출의 {formatPercent(lastForecast.capexAsPercentRevenue)}</dd></div><div><dt>운전자본 변화</dt><dd>매출의 {formatPercent(lastForecast.changeInWorkingCapitalAsPercentRevenue)}</dd></div><div><dt>순현금·순부채 반영</dt><dd>{new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 }).format(netCash)}백만 {view.model.currency} · 현금·비영업자산·부채·리스 등 Equity bridge</dd></div><div><dt>희석주식 수</dt><dd>{new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 }).format(report.baseInput.capitalStructure.dilutedShares)}백만 주</dd></div><div><dt>Terminal ROIC</dt><dd>{report.baseInput.terminalAssumptions.stableRoic === undefined ? '모형에 별도 가정 없음' : formatPercent(report.baseInput.terminalAssumptions.stableRoic)}</dd></div></dl></details>
    </section>

    <ValuationAssumptionReviewSection impacts={eventImpacts} />

    <section className="valuation-section" aria-labelledby="valuation-watch-title"><div className="valuation-section-heading"><span>06</span><div><p>What to verify next</p><h2 id="valuation-watch-title">앞으로 무엇을 확인해야 하나요?</h2></div></div><p className="valuation-section-intro">확인 시점은 다음 공식 분기 실적과 연간 가이던스 업데이트입니다.</p><div className="valuation-watch-grid"><article><h3>매출 성장률</h3><dl><div><dt>기준 가정</dt><dd>{view.impliedExpectation?.comparisonItems.find((item) => item.label.includes('기준 모형')) ? formatPercent(view.impliedExpectation.comparisonItems.find((item) => item.label.includes('기준 모형'))!.value) : '직접 비교 자료 없음'}</dd></div><div><dt>시장 내재 수준</dt><dd>{view.impliedExpectation ? formatPercent(view.impliedExpectation.value) : '계산 제한'}</dd></div><div><dt>다음 확인</dt><dd>{view.watchItems.slice(0, 2).join(' · ')}</dd></div><div><dt>차이가 줄어드는 조건</dt><dd>실제 성장 지속성이 시장 내재 경로에 가까워지는지 확인</dd></div></dl></article><article><h3>영업이익률</h3><dl><div><dt>기준 가정</dt><dd>{formatPercent(lastForecast.operatingMargin)}</dd></div><div><dt>시장 내재 수준</dt><dd>매출 성장 역산에서 고정 · 별도 역산하지 않음</dd></div><div><dt>다음 확인</dt><dd>{view.watchItems.slice(2, 4).join(' · ') || report.watchStatement}</dd></div><div><dt>차이가 줄어드는 조건</dt><dd>제품 구성과 비용 증가에도 기준 마진이 유지되는지 확인</dd></div></dl></article><article><h3>재투자와 현금흐름</h3><dl><div><dt>기준 가정</dt><dd>Capex 매출의 {formatPercent(lastForecast.capexAsPercentRevenue)}</dd></div><div><dt>시장 내재 수준</dt><dd>기준 모형의 재투자율 유지 · 별도 역산하지 않음</dd></div><div><dt>다음 확인</dt><dd>{view.watchItems.slice(4, 6).join(' · ') || report.watchStatement}</dd></div><div><dt>차이가 줄어드는 조건</dt><dd>성장 투자 이후 FCFF와 장기 ROIC가 함께 확인되는지 점검</dd></div></dl></article></div></section>

    <section className="valuation-section valuation-method" aria-labelledby="valuation-source-title"><div className="valuation-section-heading"><span>07</span><div><p>Method, sources & limits</p><h2 id="valuation-source-title">계산 방법·출처·면책</h2></div></div><div className="valuation-link-grid"><a href={`/ko/companies/${view.companySlug}/financials`} onClick={(event) => { trackAnalyticsEvent('company_financials_click', { companySlug: view.companySlug, placement: 'valuation', destinationType: 'financials' }); internalLink(`/ko/companies/${view.companySlug}/financials`, onNavigate)(event); }}>실제 재무 추세와 비교</a><a href={`/ko/companies/${view.companySlug}/report`} onClick={(event) => { trackAnalyticsEvent('company_report_click', { companySlug: view.companySlug, placement: 'valuation', destinationType: 'report' }); internalLink(`/ko/companies/${view.companySlug}/report`, onNavigate)(event); }}>심층 리포트 읽기</a></div><details className="valuation-details"><summary>사용한 자료와 계산 기준</summary><ul className="valuation-source-list"><li><div><strong>시장가격</strong><span>{view.price.sourceLabel} · {view.price.asOf}</span></div><a href="/api/market-prices" target="_blank" rel="noopener noreferrer">저장 데이터 <ExternalLink size={13} aria-hidden="true" /></a></li>{selectedSources.filter((source) => source.id !== `${report.slug}-market-price`).map((source) => <li key={source.id}><div><strong>{source.publisher} · {source.title}</strong><span>{source.publishedAt ?? source.periodEnd ?? '기준일 확인 제한'}</span></div><a href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`${source.title} 원문`}>원문 <ExternalLink size={13} aria-hidden="true" /></a></li>)}</ul><p>FCFF = 세후 영업이익 + 감가상각 − 설비투자 − 운전자본 증가. Enterprise Value에 현금·비영업자산을 더하고 부채·리스·기타 청구권을 뺀 뒤 희석주식 수로 나눕니다. Reverse DCF는 다른 가정을 고정하고 시장가격과 일치하는 매출 CAGR 하나만 풉니다.</p></details><aside className="valuation-disclaimer"><strong>주의</strong><p>본 가치평가는 공개 자료와 명시된 가정을 바탕으로 한 모형 계산 결과입니다. 미래의 실제 실적과 시장가격을 예측하거나 특정 가격을 제시하지 않습니다. 가정이 달라지면 결과도 달라질 수 있으며 투자 권유가 아닙니다.</p></aside></section>
  </>;
}

export default function ValuationExpectationsRoute({ slug, marketPrices, navigation, onNavigate }: Props) {
  const company = valuationReadinessCompany(slug);
  const [report, setReport] = useState<ResearchReportModel | null | undefined>(undefined);
  const [eventImpacts, setEventImpacts] = useState<EventImpactRecord[]>([]);
  useEffect(() => {
    if (!company) return;
    trackAnalyticsEvent('valuation_view', { companySlug: company.companySlug }, { oncePerPage: true, dedupeKey: company.companySlug });
  }, [company?.companySlug]);
  useEffect(() => {
    let active = true;
    if (!company || company.publicValuationStatus !== 'full') {
      setReport(null);
      return () => { active = false; };
    }
    setReport(undefined);
    loadResearchReport(company.companySlug).then((value) => { if (active) setReport(value); }).catch(() => { if (active) setReport(null); });
    return () => { active = false; };
  }, [company?.companySlug, company?.publicValuationStatus]);
  useEffect(() => {
    let active = true;
    if (!company || company.publicValuationStatus !== 'full') {
      setEventImpacts([]);
      return () => { active = false; };
    }
    setEventImpacts([]);
    loadEventImpacts(company.companySlug).then((value) => { if (active) setEventImpacts(value); }).catch(() => { if (active) setEventImpacts([]); });
    return () => { active = false; };
  }, [company?.companySlug, company?.publicValuationStatus]);
  const viewState = useMemo(() => {
    if (!report) return null;
    try {
      const view = buildValuationExpectationView(report, currentPriceSnapshot(report, marketPrices));
      return { view: validateValuationExpectationView(view, report), error: null };
    } catch (error) {
      return { view: null, error: error instanceof Error ? error.message : '가치평가 설명을 구성하지 못했습니다.' };
    }
  }, [marketPrices, report]);
  const backPath = company ? `/ko/companies/${company.companySlug}` : '/ko/companies';
  return <div className="pick-shell company-profiles-shell valuation-shell">{navigation}<main className="valuation-main"><nav className="company-profile-breadcrumb" aria-label="현재 위치"><a href={backPath} onClick={internalLink(backPath, onNavigate)}><ArrowLeft size={15} aria-hidden="true" /> {company?.companyName ?? '기업'} 상세</a><span aria-hidden="true">/</span><strong>시장가격에 반영된 기대</strong></nav>{!company ? <section className="valuation-safe-state"><h1>기업 가치평가 정보를 찾을 수 없습니다.</h1><p>지원 기업 목록에서 다시 선택해 주세요.</p><a href="/ko/companies" onClick={internalLink('/ko/companies', onNavigate)}>기업 목록으로 이동</a></section> : company.publicValuationStatus !== 'full' ? <section className="valuation-safe-state"><span>Valuation status · {company.publicValuationStatus}</span><h1>{company.companyName}의 검증된 가치평가 모형이 아직 없습니다.</h1><p>{company.primaryMethod}이 적합한 후보지만, 공개 가능한 가치 범위에 필요한 기업별 가정과 원문 검증이 완료되지 않았습니다. 0 또는 빈 그래프로 대신하지 않습니다.</p><div><a href={`/ko/companies/${company.companySlug}/financials`} onClick={internalLink(`/ko/companies/${company.companySlug}/financials`, onNavigate)}>검증된 재무 추세 보기</a><a href={backPath} onClick={internalLink(backPath, onNavigate)}>기업 상세로 돌아가기</a></div></section> : report === undefined ? <section className="valuation-safe-state" role="status"><h1>{company.companyName} 가치평가 설명을 불러오는 중입니다.</h1><p>현재 기업의 검증된 모형 데이터만 지연 로딩합니다.</p></section> : !report || viewState?.error || !viewState?.view ? <section className="valuation-safe-state" role="alert"><h1>가치평가 설명을 안전하게 표시할 수 없습니다.</h1><p>{viewState?.error ?? '검증된 모형 데이터를 불러오지 못했습니다.'}</p><a href={backPath} onClick={internalLink(backPath, onNavigate)}>기업 상세로 돌아가기</a></section> : <FullValuation report={report} view={viewState.view} eventImpacts={eventImpacts} onNavigate={onNavigate} />}</main></div>;
}

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, ChevronDown, ExternalLink } from 'lucide-react';
import {
  calculateCagr,
  calculateChange,
  financialMetricDefinitions,
  financialMetricGroupLabels,
  financialPivotCompany,
  financialPivotCompanies,
  finiteMetric,
  formatMetricValue,
  industryComparisonFor,
  median,
  withDerivedMetrics,
  type FinancialComparisonMode,
  type FinancialMetricDefinition,
  type FinancialMetricGroupId,
  type FinancialPivotCompany,
  type FinancialPivotPeriodType,
  type FinancialSeriesPeriod,
  type FinancialSeriesResponse,
} from '../content/financial-pivots/index.js';
import { fetchFinancialSeries } from '../services/financial-pivots.js';
import { valuationReadinessCompany } from '../content/valuation/companies.js';
import { loadEventImpacts, type EventImpactRecord } from '../content/event-impacts/index.js';
import { FinancialMetricImpactRecords } from '../components/event-impacts/EventImpactUi.js';

type Props = {
  slug: string;
  navigation: ReactNode;
  onNavigate: (path: string) => void;
};

type DataState = {
  status: 'loading' | 'ready' | 'error';
  payload: FinancialSeriesResponse | null;
};

const metricGroupOrder: FinancialMetricGroupId[] = ['growth', 'profitability', 'cashFlow', 'capitalEfficiency', 'balanceSheet', 'perShare'];

function internalLink(path: string, onNavigate: (path: string) => void) {
  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate(path);
  };
}

function sourceUrl(company: FinancialPivotCompany, period: FinancialSeriesPeriod) {
  if (company.country === 'KR' && period.accessionOrReceiptNumber) {
    return `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${encodeURIComponent(period.accessionOrReceiptNumber)}`;
  }
  if (!company.cik) return null;
  const accession = period.accessionOrReceiptNumber;
  return accession
    ? `https://www.sec.gov/Archives/edgar/data/${Number(company.cik)}/${accession.replace(/-/g, '')}/${accession}-index.html`
    : `https://data.sec.gov/api/xbrl/companyfacts/CIK${company.cik.padStart(10, '0')}.json`;
}

function comparisonModeLabel(mode: FinancialComparisonMode) {
  if (mode === 'peer') return '비교기업';
  if (mode === 'industry') return '산업 집계';
  return '기간 추세';
}

function SummaryCards({ periods, currency }: { periods: FinancialSeriesPeriod[]; currency: string }) {
  const latest = periods[periods.length - 1];
  const previous = periods[periods.length - 2];
  if (!latest) return null;
  const revenueChange = calculateChange(finiteMetric(latest, 'revenue') ?? undefined, finiteMetric(previous ?? latest, 'revenue') ?? undefined, 'percent');
  const operatingMarginChange = calculateChange(finiteMetric(latest, 'operatingMargin') ?? undefined, finiteMetric(previous ?? latest, 'operatingMargin') ?? undefined, 'percentagePoint');
  const fcf = finiteMetric(latest, 'freeCashFlow');
  const revenueCagr = periods.length >= 3
    ? calculateCagr(finiteMetric(periods[0], 'revenue') ?? undefined, finiteMetric(latest, 'revenue') ?? undefined, periods.length - 1)
    : null;
  return <section className="financial-pivot-summary" aria-label="핵심 재무 변화 요약">
    <article><span>최근 매출 변화</span><strong>{previous ? revenueChange.label : '비교 자료 없음'}</strong><small>{revenueCagr === null ? `${latest.label} 기준` : `${periods.length - 1}년 CAGR ${revenueCagr >= 0 ? '+' : ''}${revenueCagr.toFixed(1)}%`}</small></article>
    <article><span>영업이익률 변화</span><strong>{previous ? operatingMarginChange.label : '비교 자료 없음'}</strong><small>마진 변화는 %p로 표시</small></article>
    <article><span>최근 잉여현금흐름</span><strong>{formatMetricValue(fcf, financialMetricDefinitions.find((item) => item.id === 'freeCashFlow')!, currency)}</strong><small>{latest.label} · 실제 공시 기준</small></article>
  </section>;
}

function HistoricalTable({ periods, currency, group, expandedMetric, setExpandedMetric, eventImpacts }: {
  periods: FinancialSeriesPeriod[];
  currency: string;
  group: FinancialMetricGroupId;
  expandedMetric: string | null;
  setExpandedMetric: (metric: string | null) => void;
  eventImpacts: EventImpactRecord[];
}) {
  const rows = financialMetricDefinitions.filter((metric) => metric.group === group && periods.some((period) => finiteMetric(period, metric.id) !== null));
  const latest = periods[periods.length - 1];
  const previous = periods[periods.length - 2];
  if (!rows.length) return <div className="financial-pivot-empty"><strong>이 항목은 비교 가능한 공식 데이터가 아직 없습니다.</strong><p>없는 값을 0으로 바꾸지 않았습니다. 다른 지표 묶음이나 공시 원문을 확인해 주세요.</p></div>;
  return <div className="financial-pivot-table-scroll" tabIndex={0} aria-label={`${financialMetricGroupLabels[group]} 재무 표 가로 스크롤 영역`}>
    <table>
      <caption>{financialMetricGroupLabels[group]} · {periods.length}개 공시 기간 비교</caption>
      <thead><tr><th scope="col">지표</th>{periods.map((period) => <th scope="col" key={period.periodEnd}>{period.label}<small>{period.periodEnd}</small></th>)}<th scope="col">최근 변화</th></tr></thead>
      <tbody>{rows.map((metric) => {
        const currentValue = latest ? finiteMetric(latest, metric.id) : null;
        const previousValue = previous ? finiteMetric(previous, metric.id) : null;
        const change = calculateChange(currentValue ?? undefined, previousValue ?? undefined, metric.change);
        const expanded = expandedMetric === metric.id;
        return <tr key={metric.id} className={expanded ? 'is-expanded' : undefined}>
          <th scope="row"><button type="button" aria-expanded={expanded} onClick={() => setExpandedMetric(expanded ? null : metric.id)}><span>{metric.label}</span><ChevronDown size={15} aria-hidden="true" /></button>{expanded ? <span className="financial-pivot-row-detail"><b>{metric.description}</b>{metric.calculation ? ` 계산: ${metric.calculation}.` : ''} 공시 원문 단위를 통화 백만 단위로 정규화했습니다.</span> : null}<FinancialMetricImpactRecords impacts={eventImpacts} metricId={metric.id} /></th>
          {periods.map((period) => <td key={period.periodEnd}>{formatMetricValue(finiteMetric(period, metric.id), metric, currency)}</td>)}
          <td><strong>{previous ? change.label : '비교 자료 없음'}</strong></td>
        </tr>;
      })}</tbody>
    </table>
  </div>;
}

function PeerComparison({ company, peerPayloads }: { company: FinancialPivotCompany; peerPayloads: Map<string, FinancialSeriesResponse> | null }) {
  if (!company.peerSlugs.length) return <div className="financial-pivot-empty"><strong>직접 비교할 기업군을 확정하지 않았습니다.</strong><p>사업 구조와 통화가 다른 기업을 임의로 묶지 않았습니다.</p></div>;
  if (!peerPayloads) return <div className="financial-pivot-loading" role="status">비교기업의 연간 데이터만 추가로 불러오는 중입니다.</div>;
  const entries = [company.companySlug, ...company.peerSlugs].map((slug) => {
    const config = financialPivotCompany(slug)!;
    const payload = peerPayloads.get(slug);
    const payloadPeriods = payload?.series?.periods ?? [];
    const latest = payloadPeriods[payloadPeriods.length - 1];
    return { config, period: latest ? withDerivedMetrics(latest) : null };
  });
  const metrics = financialMetricDefinitions.filter((item) => ['operatingMargin', 'netMargin', 'freeCashFlowMargin'].includes(item.id));
  return <div className="financial-pivot-peer-grid">
    {metrics.map((metric) => {
      const values = entries.map((entry) => entry.period ? finiteMetric(entry.period, metric.id) : null);
      const peerMedian = median(entries.slice(1).map((entry) => entry.period ? finiteMetric(entry.period, metric.id) : null));
      return <article key={metric.id}><header><span>{metric.label}</span><strong>비교기업 중앙값 {peerMedian === null ? '자료 없음' : `${peerMedian.toFixed(1)}%`}</strong></header><dl>{entries.map((entry, index) => <div key={entry.config.companySlug}><dt>{entry.config.companyName}{index === 0 ? ' · 현재 기업' : ''}</dt><dd>{values[index] === null ? '자료 미수집' : `${values[index]!.toFixed(1)}%`}</dd></div>)}</dl><p>동일 통화가 필요 없는 비율만 비교합니다.</p></article>;
    })}
  </div>;
}

function IndustryPanel({ company, latest }: { company: FinancialPivotCompany; latest: FinancialSeriesPeriod | undefined }) {
  const benchmark = industryComparisonFor(company);
  if (!benchmark) return <div className="financial-pivot-empty"><strong>연결된 산업 집계가 없습니다.</strong><p>임의 업종값을 대신 표시하지 않았습니다.</p></div>;
  const companyDebt = latest ? finiteMetric(latest, 'debtToCapital') : null;
  return <section className="financial-pivot-industry-card">
    <header><div><span>산업 집계</span><h2>{benchmark.industry}</h2></div><a href={benchmark.sourceReference} target="_blank" rel="noopener noreferrer">NYU Stern 원문 <ExternalLink size={14} aria-hidden="true" /></a></header>
    <div><article><span>자본 대비 차입금</span><strong>{companyDebt === null ? '직접 비교 자료 없음' : `${companyDebt.toFixed(1)}%`}</strong><small>현재 기업</small></article><article><span>산업 집계</span><strong>{benchmark.debtToCapital.toFixed(1)}%</strong><small>{benchmark.sampleSize}개 기업 · {benchmark.asOfDate}</small></article></div>
    <p>같은 정의로 계산 가능한 차입금과 자기자본이 있을 때만 기업값을 붙입니다. 산업 ROIC {benchmark.roic.toFixed(1)}%는 계산 기준이 다른 기업값과 직접 비교하지 않습니다.</p>
  </section>;
}

export default function FinancialPivotRoute({ slug, navigation, onNavigate }: Props) {
  const company = financialPivotCompany(slug);
  const [periodType, setPeriodType] = useState<FinancialPivotPeriodType>('annual');
  const [comparisonMode, setComparisonMode] = useState<FinancialComparisonMode>('history');
  const [metricGroup, setMetricGroup] = useState<FinancialMetricGroupId>('growth');
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [dataState, setDataState] = useState<DataState>({ status: 'loading', payload: null });
  const [peerPayloads, setPeerPayloads] = useState<Map<string, FinancialSeriesResponse> | null>(null);
  const [eventImpacts, setEventImpacts] = useState<EventImpactRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!company) return () => { cancelled = true; };
    setDataState({ status: 'loading', payload: null });
    setPeerPayloads(null);
    fetchFinancialSeries(company, periodType).then((payload) => {
      if (!cancelled) setDataState({ status: 'ready', payload });
    }).catch(() => {
      if (!cancelled) setDataState({ status: 'error', payload: null });
    });
    return () => { cancelled = true; };
  }, [company?.companySlug, periodType]);

  useEffect(() => {
    let cancelled = false;
    if (!company) return () => { cancelled = true; };
    setEventImpacts([]);
    loadEventImpacts(company.companySlug).then((impacts) => {
      if (!cancelled) setEventImpacts(impacts);
    }).catch(() => {
      if (!cancelled) setEventImpacts([]);
    });
    return () => { cancelled = true; };
  }, [company?.companySlug]);

  useEffect(() => {
    let cancelled = false;
    if (!company || comparisonMode !== 'peer') return () => { cancelled = true; };
    const targets = [company.companySlug, ...company.peerSlugs]
      .map((item) => financialPivotCompany(item))
      .filter((item): item is FinancialPivotCompany => Boolean(item));
    Promise.all(targets.map(async (target) => [target.companySlug, await fetchFinancialSeries(target, 'annual')] as const)).then((entries) => {
      if (!cancelled) setPeerPayloads(new Map(entries));
    }).catch(() => {
      if (!cancelled) setPeerPayloads(new Map());
    });
    return () => { cancelled = true; };
  }, [company?.companySlug, comparisonMode]);

  const periods = useMemo(() => (dataState.payload?.series?.periods ?? []).map(withDerivedMetrics).sort((a, b) => a.periodEnd.localeCompare(b.periodEnd)), [dataState.payload]);
  const backPath = company ? `/ko/companies/${company.companySlug}` : '/ko/companies';
  const valuationStatus = company ? valuationReadinessCompany(company.companySlug)?.publicValuationStatus : 'unavailable';

  if (!company) return <div className="company-profiles-shell financial-pivot-shell">{navigation}<main className="financial-pivot-main"><section className="financial-pivot-empty"><h1>기업 재무 분석판을 찾을 수 없습니다.</h1><a href="/ko/companies" onClick={internalLink('/ko/companies', onNavigate)}>기업 목록으로 돌아가기</a></section></main></div>;

  return <div className="company-profiles-shell financial-pivot-shell">
    {navigation}
    <main className="financial-pivot-main">
      <nav className="company-profile-breadcrumb" aria-label="현재 위치"><a href={backPath} onClick={internalLink(backPath, onNavigate)}><ArrowLeft size={15} aria-hidden="true" /> {company.companyName} 기업 상세</a><span aria-hidden="true">/</span><strong>숫자와 비교</strong></nav>
      <header className="financial-pivot-header"><div><p>Financial pivot · 비교 중심 재무 분석</p><h1>{company.companyName} 숫자와 비교</h1><span>{company.exchange} · {company.ticker} · {company.industry}</span></div><p>같은 숫자를 나열하지 않고, 기간 변화와 비교 가능한 기준을 함께 봅니다. 없는 값은 0으로 바꾸지 않습니다.</p></header>

      <section className="financial-pivot-controls" aria-label="재무 분석 보기 설정">
        <fieldset><legend>기간</legend>{(['annual', 'quarterly'] as const).map((period) => <button type="button" key={period} aria-pressed={periodType === period} onClick={() => { setPeriodType(period); setComparisonMode('history'); }}>{period === 'annual' ? '연간' : '분기'}</button>)}</fieldset>
        <fieldset><legend>비교</legend>{(['history', 'peer', 'industry'] as const).map((mode) => <button type="button" key={mode} aria-pressed={comparisonMode === mode} onClick={() => setComparisonMode(mode)}>{comparisonModeLabel(mode)}</button>)}</fieldset>
      </section>

      {dataState.status === 'loading' ? <div className="financial-pivot-loading" role="status">공식 공시에서 {periodType === 'annual' ? '연간' : '분기'} 데이터를 불러오는 중입니다.</div> : null}
      {dataState.status === 'error' ? <div className="financial-pivot-empty" role="alert"><strong>재무 데이터를 불러오지 못했습니다.</strong><p>기업 상세의 기존 데이터는 그대로 사용할 수 있습니다. 잠시 후 다시 확인해 주세요.</p></div> : null}
      {dataState.status === 'ready' && !periods.length ? <div className="financial-pivot-empty"><strong>{periodType === 'quarterly' ? '비교 가능한 독립 분기 데이터가 없습니다.' : '비교 가능한 연간 데이터가 없습니다.'}</strong><p>누적 분기값을 독립 분기처럼 표시하거나 누락 기간을 추정하지 않았습니다.</p></div> : null}

      {periods.length ? <>
        <SummaryCards periods={periods} currency={company.currency} />
        {comparisonMode === 'history' ? <section className="financial-pivot-analysis" aria-labelledby="financial-pivot-analysis-title">
          <header><div><span>기간 추세</span><h2 id="financial-pivot-analysis-title">무엇이 얼마나 달라졌나요?</h2><p>{periods.length < 2 ? '현재 확인 가능한 한 기간만 표시합니다. 비교값은 만들지 않았습니다.' : `${periods[0].label}부터 ${periods[periods.length - 1].label}까지 같은 공시 기준으로 비교합니다.`}</p></div><small>{dataState.payload?.source} · {dataState.payload?.sourceStatus === 'direct' ? '직접 확인' : '일부 자료'}</small></header>
          <div className="financial-pivot-group-tabs" role="tablist" aria-label="재무 지표 묶음">{metricGroupOrder.map((group) => <button type="button" role="tab" aria-selected={metricGroup === group} key={group} onClick={() => { setMetricGroup(group); setExpandedMetric(null); }}>{financialMetricGroupLabels[group]}</button>)}</div>
          <HistoricalTable periods={periods} currency={company.currency} group={metricGroup} expandedMetric={expandedMetric} setExpandedMetric={setExpandedMetric} eventImpacts={eventImpacts} />
        </section> : null}
        {comparisonMode === 'peer' ? <section className="financial-pivot-analysis" aria-labelledby="peer-title"><header><div><span>비교기업</span><h2 id="peer-title">같은 사업 흐름의 기업과 비율 비교</h2><p>비교 버튼을 누른 뒤에만 필요한 기업 데이터를 추가 요청합니다.</p></div></header><PeerComparison company={company} peerPayloads={peerPayloads} /></section> : null}
        {comparisonMode === 'industry' ? <IndustryPanel company={company} latest={periods[periods.length - 1]} /> : null}

        <section className="financial-pivot-sources" aria-labelledby="financial-source-title"><div><span>자료와 계산</span><h2 id="financial-source-title">출처와 계산 기준</h2><p>기간별 실제 공시를 사용하며 수정 공시는 기존 정규화 규칙으로 우선 선택합니다.</p></div><details><summary>공시 원문과 기준 보기</summary><ul>{periods.map((period) => { const url = sourceUrl(company, period); return <li key={period.periodEnd}><div><strong>{period.label} · {period.filingType}</strong><span>기간 말 {period.periodEnd}{period.filedAt ? ` · 제출 ${period.filedAt}` : ''} · {period.currency} 백만 단위</span></div>{url ? <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${company.companyName} ${period.label} 공시 원문`}>원문 보기 <ExternalLink size={13} aria-hidden="true" /></a> : <span>원문 링크 확인 필요</span>}</li>; })}</ul><p>YoY는 직전 같은 연간 기간, 분기 비교는 동일한 기간 정의가 확인될 때만 계산합니다. 이전 값이 0이거나 부호가 바뀌면 백분율을 표시하지 않습니다. 마진 변화는 %p를 사용합니다.</p></details></section>
        {valuationStatus === 'full' ? <nav className="financial-pivot-next-actions" aria-label="재무 추세와 가치평가 연결"><a href={`/ko/companies/${company.companySlug}/valuation`} onClick={internalLink(`/ko/companies/${company.companySlug}/valuation`, onNavigate)}>이 재무 추세가 가치평가에 미치는 영향</a></nav> : null}
      </> : null}
    </main>
  </div>;
}

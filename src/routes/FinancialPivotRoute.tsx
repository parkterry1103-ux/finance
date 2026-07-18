import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, ChevronDown, ExternalLink } from 'lucide-react';
import {
  calculateCagr,
  calculateChange,
  calculatePbr,
  calculatePsr,
  calculateTrailingPer,
  calculateTtmMetric,
  comparisonReasonLabel,
  financialMetricDefinitions,
  financialMetricGroupLabels,
  financialPivotCompany,
  financialPivotCompanies,
  finiteMetric,
  formatMetricValue,
  industryComparisonFor,
  loadFinancialAuditCompany,
  median,
  reconcileMultiple,
  sameFiscalPeriodReference,
  withDerivedMetrics,
  type FinancialComparisonMode,
  type FinancialAuditCompany,
  type FinancialMetricDefinition,
  type FinancialMetricGroupId,
  type FinancialPivotCompany,
  type FinancialPivotPeriodType,
  type FinancialSeriesPeriod,
  type FinancialSeriesResponse,
  type FinancialValueOrigin,
} from '../content/financial-pivots/index.js';
import { fetchFinancialSeries } from '../services/financial-pivots.js';
import { valuationReadinessCompany } from '../content/valuation/companies.js';
import { loadEventImpacts, type EventImpactRecord } from '../content/event-impacts/index.js';
import { FinancialMetricImpactRecords } from '../components/event-impacts/EventImpactUi.js';
import { trackAnalyticsEvent } from '../analytics/index.js';

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

function filingBasisLabel(period: FinancialSeriesPeriod | undefined) {
  if (!period) return '공시 기준 확인 중';
  const periodBasis = period.periodBasis === 'standalone' ? '독립 분기' : period.periodBasis === 'annual' ? '연간' : '기간 기준 확인 필요';
  const consolidation = period.consolidation === 'consolidated' ? '연결' : period.consolidation === 'separate' ? '별도' : '연결 기준 확인 필요';
  return `${consolidation} · ${periodBasis} · ${period.currency}`;
}

function externalMatchLabel(status: string) {
  const labels: Record<string, string> = {
    matched: '일치',
    matched_with_rounding: '반올림 범위 일치',
    definition_difference: '정의 차이',
    timing_difference: '기준시점 차이',
    share_basis_difference: '주식수 기준 차이',
    adr_ratio_difference: 'ADR 비율 차이',
    gaap_vs_adjusted: 'GAAP·조정값 차이',
    trailing_vs_forward: '과거·선행 기준 차이',
    stale_external_value: '외부 값 갱신 지연',
    unresolved_difference: '차이 원인 확인 필요',
  };
  return labels[status] ?? '확인 필요';
}

function externalDefinitionLabel(check: FinancialAuditCompany['externalPerChecks'][number]) {
  const multiple = check.multipleBasis === 'trailing' ? 'Trailing' : check.multipleBasis === 'forward' ? 'Forward' : '기간 정의 미표시';
  const eps = check.epsBasis === 'diluted' ? '희석 EPS' : check.epsBasis === 'basic' ? '기본 EPS' : 'EPS 기준 미표시';
  const accounting = check.accountingBasis === 'gaap' ? 'GAAP' : check.accountingBasis === 'adjusted' ? '조정값' : '회계 기준 미표시';
  return `${multiple} · ${eps} · ${accounting} · ${check.financialPeriod}`;
}

function valueOriginLabel(origin: FinancialValueOrigin) {
  const labels: Record<FinancialValueOrigin, string> = {
    reported: '공시 직접 확인',
    derived_from_reported: '공시값으로 계산',
    market_implied_derived: '시장 표시값에서 역산',
    external_reference: '외부 교차검증 참고',
    unavailable: '자료 미수집',
  };
  return labels[origin];
}

function FilingBasisStrip({ audit, payload, latest, periodType }: { audit: FinancialAuditCompany | null; payload: FinancialSeriesResponse | null; latest: FinancialSeriesPeriod | undefined; periodType: FinancialPivotPeriodType }) {
  const filing = payload?.latestFiling ?? (periodType === 'annual' ? audit?.latestAnnual : audit?.latestQuarter);
  return <section className="financial-filing-basis" aria-label="최신 공시와 가격 기준">
    <div><span>최신 공시</span><strong>{filing ? `${filing.formOrReportCode} · ${filing.reportPeriod}` : '공시 식별자 확인 중'}</strong><small>{filing ? `제출 ${filing.filedAt} · ${filing.accessionOrReceiptNumber}` : '미확인 값을 추정하지 않습니다.'}</small></div>
    <div><span>표시 재무 기준</span><strong>{filingBasisLabel(latest)}</strong><small>{payload?.freshness === 'stale' ? '새 공시 반영 확인 필요' : '조회 시점에 사용 가능한 최신 정기공시'}</small></div>
    <div><span>배수 가격 기준</span><strong>{audit ? `${audit.auditedPrice.asOf} 정규장 종가` : '가격 기준 확인 중'}</strong><small>{audit ? `${audit.auditedPrice.currency} ${audit.auditedPrice.value.toLocaleString('ko-KR')}` : '자료 미수집'}</small></div>
  </section>;
}

function MarketMultiplePanel({ audit, company, periods }: { audit: FinancialAuditCompany | null; company: FinancialPivotCompany; periods: FinancialSeriesPeriod[] }) {
  if (!audit) return null;
  const latest = periods[periods.length - 1];
  const ttmEps = calculateTtmMetric(periods, 'dilutedEps');
  const ttmRevenue = calculateTtmMetric(periods, 'revenue');
  const equity = latest ? finiteMetric(latest, 'totalEquity') : null;
  const shares = latest ? finiteMetric(latest, 'sharesOutstanding') : null;
  const annualEps = audit.latestAnnualDilutedEps;
  const perUsesTtm = ttmEps.ok;
  const per = calculateTrailingPer(audit.auditedPrice.value, perUsesTtm ? ttmEps.value : annualEps?.value ?? null);
  const pbr = calculatePbr(audit.auditedPrice.value, equity, shares);
  const psr = calculatePsr(audit.auditedPrice.value, shares, ttmRevenue.ok ? ttmRevenue.value : null);
  const firstExternal = audit.externalPerChecks[0];
  const runtimeReconciliation = perUsesTtm && per.ok && firstExternal?.value !== null ? reconcileMultiple(per.value, firstExternal.value) : null;
  const cards = [
    { id: 'per', label: 'PER', result: per, formula: perUsesTtm ? '정규장 종가 ÷ 최근 4개 독립 분기 희석 EPS 합계' : annualEps ? `정규장 종가 ÷ FY${annualEps.fiscalYear} 공시 희석 EPS` : '공시 희석 EPS 원재료 미확보', basis: perUsesTtm ? 'GAAP TTM' : annualEps ? `최근 회계연도 FY${annualEps.fiscalYear}` : '계산 기준 없음' },
    { id: 'pbr', label: 'PBR', result: pbr, formula: '정규장 종가 ÷ (최신 연결 자본 ÷ 기말 발행주식수)', basis: '최근 공시 시점' },
    { id: 'psr', label: 'PSR', result: psr, formula: '시가총액 ÷ 최근 4개 독립 분기 매출 합계', basis: 'GAAP TTM' },
  ];
  return <section className="financial-multiple-panel" aria-labelledby="financial-multiple-title">
    <header><div><span>검산 가능한 시장 배수</span><h2 id="financial-multiple-title">가격과 공시 원재료를 같은 기준으로 연결</h2><p>선행 추정치나 조정 EPS를 섞지 않습니다. 분모를 만들 수 없으면 계산을 보류하고 이유를 표시합니다.</p></div><small>{audit.auditedPrice.asOf} 종가</small></header>
    <div className="financial-multiple-grid">{cards.map((card) => <article key={card.id}>
      <span>{card.label}</span><strong>{card.result.ok ? `${card.result.value.toFixed(2)}배` : '계산 보류'}</strong><small>{card.basis}</small>
      <p>{card.result.ok ? card.formula : comparisonReasonLabel(card.result.reason)}</p>
    </article>)}</div>
    <details><summary>외부 값 2곳과 차이 확인</summary><ul>{audit.externalPerChecks.map((check, index) => {
      const status = index === 0 && runtimeReconciliation ? runtimeReconciliation : check.matchStatus;
      return <li key={`${check.provider}-${check.asOf}`}><div><strong>{check.provider} · PER {check.value === null ? '미제공' : `${check.value.toFixed(2)}배`}</strong><span>{check.priceAsOf ?? '가격 기준일 미표시'} · {externalMatchLabel(status)} · {check.definition ?? '정의 미표시'}</span><span>{externalDefinitionLabel(check)}</span></div><a href={check.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`${company.companyName} ${check.provider} PER 원문`}>원문 보기 <ExternalLink size={13} aria-hidden="true" /></a></li>;
    })}</ul><p>외부 값은 정답을 복사하는 용도가 아니라, 가격 시점·TTM/선행·GAAP/조정·주식수 기준 차이를 찾는 검산 자료입니다.</p></details>
  </section>;
}

function SummaryCards({ periods, currency, periodType }: { periods: FinancialSeriesPeriod[]; currency: string; periodType: FinancialPivotPeriodType }) {
  const latest = periods[periods.length - 1];
  const previous = latest ? sameFiscalPeriodReference(periods, latest) ?? periods[periods.length - 2] : undefined;
  if (!latest) return null;
  const revenueChange = calculateChange(finiteMetric(latest, 'revenue') ?? undefined, finiteMetric(previous ?? latest, 'revenue') ?? undefined, 'percent');
  const operatingMarginChange = calculateChange(finiteMetric(latest, 'operatingMargin') ?? undefined, finiteMetric(previous ?? latest, 'operatingMargin') ?? undefined, 'percentagePoint');
  const fcf = finiteMetric(latest, 'freeCashFlow');
  const revenueCagr = periodType === 'annual' && periods.length >= 4
    ? calculateCagr(finiteMetric(periods[0], 'revenue') ?? undefined, finiteMetric(latest, 'revenue') ?? undefined, periods.length - 1)
    : null;
  return <section className="financial-pivot-summary" aria-label="핵심 재무 변화 요약">
    <article><span>최근 매출 변화</span><strong>{previous ? revenueChange.label : '전년 동기 공시값 없음'}</strong><small>{revenueCagr === null ? `${latest.label} · ${periodType === 'quarterly' ? '전년 동기 대비' : '기준'}` : `${periods.length - 1}년 CAGR ${revenueCagr >= 0 ? '+' : ''}${revenueCagr.toFixed(1)}%`}</small></article>
    <article><span>영업이익률 변화</span><strong>{previous ? operatingMarginChange.label : '전년 동기 공시값 없음'}</strong><small>마진 변화는 %p로 표시</small></article>
    <article><span>최근 잉여현금흐름</span><strong>{formatMetricValue(fcf, financialMetricDefinitions.find((item) => item.id === 'freeCashFlow')!, currency)}</strong><small>{latest.label} · 실제 공시 기준</small></article>
  </section>;
}

function HistoricalTable({ periods, currency, group, companySlug, expandedMetric, setExpandedMetric, eventImpacts }: {
  periods: FinancialSeriesPeriod[];
  currency: string;
  group: FinancialMetricGroupId;
  companySlug: string;
  expandedMetric: string | null;
  setExpandedMetric: (metric: string | null) => void;
  eventImpacts: EventImpactRecord[];
}) {
  const rows = financialMetricDefinitions.filter((metric) => metric.group === group && periods.some((period) => finiteMetric(period, metric.id) !== null));
  const latest = periods[periods.length - 1];
  const previous = latest ? sameFiscalPeriodReference(periods, latest) ?? periods[periods.length - 2] : undefined;
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
        const originLabels = [...new Set(periods.filter((period) => finiteMetric(period, metric.id) !== null).map((period) => valueOriginLabel(period.metricOrigins?.[metric.id] ?? 'reported')))];
        return <tr key={metric.id} className={expanded ? 'is-expanded' : undefined}>
          <th scope="row"><button type="button" aria-expanded={expanded} onClick={() => { if (!expanded) trackAnalyticsEvent('financial_metric_expand', { companySlug, groupId: group, metricId: metric.id, placement: 'financial_pivot' }); setExpandedMetric(expanded ? null : metric.id); }}><span>{metric.label}</span><ChevronDown size={15} aria-hidden="true" /></button>{expanded ? <span className="financial-pivot-row-detail"><b>{metric.description}</b>{metric.calculation ? ` 계산: ${metric.calculation}.` : ''} 공시 원문 단위를 통화 백만 단위로 정규화했습니다. 값 상태: {originLabels.join(' · ')}.</span> : null}<FinancialMetricImpactRecords impacts={eventImpacts} metricId={metric.id} /></th>
          {periods.map((period) => <td key={period.periodEnd}>{formatMetricValue(finiteMetric(period, metric.id), metric, currency)}</td>)}
          <td><strong>{previous ? change.label : '전년 동기 공시값 없음'}</strong></td>
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
      return <article key={metric.id}><header><span>{metric.label}</span><strong>비교기업 중앙값 {peerMedian === null ? '동일 정의 peer 부족' : `${peerMedian.toFixed(1)}%`}</strong></header><dl>{entries.map((entry, index) => <div key={entry.config.companySlug}><dt>{entry.config.companyName}{index === 0 ? ' · 현재 기업' : ''}</dt><dd>{values[index] === null ? '공식 원자료 미수집' : `${values[index]!.toFixed(1)}%`}</dd></div>)}</dl><p>동일 기간·정의이고 통화 환산이 필요 없는 비율만 비교합니다.</p></article>;
    })}
  </div>;
}

function IndustryPanel({ company, latest }: { company: FinancialPivotCompany; latest: FinancialSeriesPeriod | undefined }) {
  const benchmark = industryComparisonFor(company);
  if (!benchmark) return <div className="financial-pivot-empty"><strong>연결된 산업 집계가 없습니다.</strong><p>임의 업종값을 대신 표시하지 않았습니다.</p></div>;
  const companyDebt = latest ? finiteMetric(latest, 'debtToCapital') : null;
  return <section className="financial-pivot-industry-card">
    <header><div><span>산업 집계</span><h2>{benchmark.industry}</h2></div><a href={benchmark.sourceReference} target="_blank" rel="noopener noreferrer">NYU Stern 원문 <ExternalLink size={14} aria-hidden="true" /></a></header>
    <div><article><span>자본 대비 차입금</span><strong>{companyDebt === null ? '동일 정의 차입금 공시값 없음' : `${companyDebt.toFixed(1)}%`}</strong><small>현재 기업</small></article><article><span>산업 집계</span><strong>{benchmark.debtToCapital.toFixed(1)}%</strong><small>{benchmark.sampleSize}개 기업 · {benchmark.asOfDate}</small></article></div>
    <p>같은 정의로 계산 가능한 차입금과 자기자본이 있을 때만 기업값을 붙입니다. 산업 ROIC {benchmark.roic.toFixed(1)}%는 계산 기준이 다른 기업값과 직접 비교하지 않습니다.</p>
  </section>;
}

export default function FinancialPivotRoute({ slug, navigation, onNavigate }: Props) {
  const company = financialPivotCompany(slug);
  const [periodType, setPeriodType] = useState<FinancialPivotPeriodType>('quarterly');
  const [comparisonMode, setComparisonMode] = useState<FinancialComparisonMode>('history');
  const [metricGroup, setMetricGroup] = useState<FinancialMetricGroupId>('growth');
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [dataState, setDataState] = useState<DataState>({ status: 'loading', payload: null });
  const [peerPayloads, setPeerPayloads] = useState<Map<string, FinancialSeriesResponse> | null>(null);
  const [eventImpacts, setEventImpacts] = useState<EventImpactRecord[]>([]);
  const [auditCompany, setAuditCompany] = useState<FinancialAuditCompany | null>(null);

  useEffect(() => {
    if (!company) return;
    trackAnalyticsEvent('financials_view', { companySlug: company.companySlug }, { oncePerPage: true, dedupeKey: company.companySlug });
  }, [company?.companySlug]);

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
    setAuditCompany(null);
    loadFinancialAuditCompany(company.companySlug).then((audit) => {
      if (!cancelled) setAuditCompany(audit);
    }).catch(() => {
      if (!cancelled) setAuditCompany(null);
    });
    return () => { cancelled = true; };
  }, [company?.companySlug]);

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
        <fieldset><legend>비교</legend>{(['history', 'peer', 'industry'] as const).map((mode) => <button type="button" key={mode} aria-pressed={comparisonMode === mode} onClick={() => { if (comparisonMode !== mode) trackAnalyticsEvent('financial_compare_mode_select', { companySlug: company.companySlug, compareMode: mode, placement: 'financial_pivot' }); setComparisonMode(mode); }}>{comparisonModeLabel(mode)}</button>)}</fieldset>
      </section>

      {dataState.status === 'loading' ? <div className="financial-pivot-loading" role="status">공식 공시에서 {periodType === 'annual' ? '연간' : '분기'} 데이터를 불러오는 중입니다.</div> : null}
      {dataState.status === 'error' ? <div className="financial-pivot-empty" role="alert"><strong>재무 데이터를 불러오지 못했습니다.</strong><p>기업 상세의 기존 데이터는 그대로 사용할 수 있습니다. 잠시 후 다시 확인해 주세요.</p></div> : null}
      {dataState.status === 'ready' && !periods.length ? <div className="financial-pivot-empty"><strong>{periodType === 'quarterly' ? '비교 가능한 독립 분기 데이터가 없습니다.' : '비교 가능한 연간 데이터가 없습니다.'}</strong><p>누적 분기값을 독립 분기처럼 표시하거나 누락 기간을 추정하지 않았습니다.</p></div> : null}

      <FilingBasisStrip audit={auditCompany} payload={dataState.payload} latest={periods[periods.length - 1]} periodType={periodType} />

      {periods.length ? <>
        <SummaryCards periods={periods} currency={company.currency} periodType={periodType} />
        {periodType === 'quarterly' ? <MarketMultiplePanel audit={auditCompany} company={company} periods={periods} /> : null}
        {comparisonMode === 'history' ? <section className="financial-pivot-analysis" aria-labelledby="financial-pivot-analysis-title">
          <header><div><span>기간 추세</span><h2 id="financial-pivot-analysis-title">무엇이 얼마나 달라졌나요?</h2><p>{periods.length < 2 ? '현재 확인 가능한 한 기간만 표시합니다. 비교값은 만들지 않았습니다.' : `${periods[0].label}부터 ${periods[periods.length - 1].label}까지 같은 공시 기준으로 비교합니다.`}</p></div><small>{dataState.payload?.source} · {dataState.payload?.sourceStatus === 'direct' ? '직접 확인' : '일부 자료'}</small></header>
          <div className="financial-pivot-group-tabs" role="tablist" aria-label="재무 지표 묶음">{metricGroupOrder.map((group) => <button type="button" role="tab" aria-selected={metricGroup === group} key={group} onClick={() => { if (metricGroup !== group) trackAnalyticsEvent('financial_group_select', { companySlug: company.companySlug, groupId: group, placement: 'financial_pivot' }); setMetricGroup(group); setExpandedMetric(null); }}>{financialMetricGroupLabels[group]}</button>)}</div>
          <HistoricalTable periods={periods} currency={company.currency} group={metricGroup} companySlug={company.companySlug} expandedMetric={expandedMetric} setExpandedMetric={setExpandedMetric} eventImpacts={eventImpacts} />
        </section> : null}
        {comparisonMode === 'peer' ? <section className="financial-pivot-analysis" aria-labelledby="peer-title"><header><div><span>비교기업</span><h2 id="peer-title">같은 사업 흐름의 기업과 비율 비교</h2><p>비교 버튼을 누른 뒤에만 필요한 기업 데이터를 추가 요청합니다.</p></div></header><PeerComparison company={company} peerPayloads={peerPayloads} /></section> : null}
        {comparisonMode === 'industry' ? <IndustryPanel company={company} latest={periods[periods.length - 1]} /> : null}

        <section className="financial-pivot-sources" aria-labelledby="financial-source-title"><div><span>자료와 계산</span><h2 id="financial-source-title">출처와 계산 기준</h2><p>기간별 실제 공시를 사용하며 수정 공시는 기존 정규화 규칙으로 우선 선택합니다.</p></div><details><summary>공시 원문과 기준 보기</summary><ul>{periods.map((period) => { const url = sourceUrl(company, period); return <li key={period.periodEnd}><div><strong>{period.label} · {period.filingType}</strong><span>기간 말 {period.periodEnd}{period.filedAt ? ` · 제출 ${period.filedAt}` : ''} · {filingBasisLabel(period)} · 백만 단위</span></div>{url ? <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${company.companyName} ${period.label} 공시 원문`}>원문 보기 <ExternalLink size={13} aria-hidden="true" /></a> : <span>원문 링크 확인 필요</span>}</li>; })}</ul><p>YoY는 전년 동기의 같은 회계기간만 사용합니다. 누적값은 같은 시작일·계정·통화·연결 기준이 일치할 때만 차감해 독립 분기로 만들며, 이전 값이 0이거나 부호가 바뀌면 백분율을 표시하지 않습니다. 마진 변화는 %p를 사용합니다.</p></details></section>
        {valuationStatus === 'full' ? <nav className="financial-pivot-next-actions" aria-label="재무 추세와 가치평가 연결"><a href={`/ko/companies/${company.companySlug}/valuation`} onClick={(event) => { trackAnalyticsEvent('company_valuation_click', { companySlug: company.companySlug, placement: 'financial_pivot', destinationType: 'valuation' }); internalLink(`/ko/companies/${company.companySlug}/valuation`, onNavigate)(event); }}>이 재무 추세가 가치평가에 미치는 영향</a></nav> : null}
      </> : null}
    </main>
  </div>;
}

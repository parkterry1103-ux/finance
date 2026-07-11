import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ExternalLink, Info } from 'lucide-react';
import {
  macroBriefTrendLabels,
  macroDomainBriefs,
  macroDomainLabels,
  macroDomainOrder,
  macroFrequencyLabels,
  macroIndicatorDefinitions,
  macroIndicatorsByDomain,
  macroRelatedBottlenecks,
  macroRelatedReports,
  type MacroIndicatorDefinition,
  type MacroIndicatorsResponse,
  type MacroSeriesResult,
} from '../../content/macro/index.js';
import { sourceRegistry } from '../../content/sources/index.js';
import { fetchMacroIndicators } from '../../services/macro.js';
import { MacroSparkline } from './MacroSparkline.js';

function dateLabel(date: string, frequency?: MacroIndicatorDefinition['frequency']) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  return frequency === 'monthly' ? date.slice(0, 7).replace('-', '.') : date.split('-').join('.');
}

function signed(value: number, digits: number, suffix: string) {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(digits)}${suffix}`;
}

function latestValue(definition: MacroIndicatorDefinition, series: MacroSeriesResult) {
  const value = series.latest.value;
  if (definition.seriesId === 'NFCI') return value.toFixed(3);
  if (definition.seriesId === 'WALCL' || definition.seriesId === 'M2SL') return value.toFixed(3);
  if (definition.seriesId === 'PERMIT') return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(value);
  if (definition.seriesId === 'INDPRO') return value.toFixed(2);
  return value.toFixed(2);
}

type ChangeItem = { label: string; value?: number; digits: number; suffix: string };

function changeItems(definition: MacroIndicatorDefinition, series: MacroSeriesResult): ChangeItem[] {
  const changes = series.changes;
  if (['DGS2', 'DGS10', 'T10Y2Y'].includes(definition.seriesId)) {
    return [
      { label: '직전 관측 대비', value: changes.previous, digits: 0, suffix: 'bp' },
      { label: '20개 관측 대비', value: changes.shortTerm, digits: 0, suffix: 'bp' },
    ];
  }
  if (definition.seriesId === 'NFCI') {
    return [
      { label: '직전 주 대비', value: changes.previous, digits: 3, suffix: '' },
      { label: '4주 변화', value: changes.shortTerm, digits: 3, suffix: '' },
      { label: '13주 변화', value: changes.mediumTerm, digits: 3, suffix: '' },
    ];
  }
  if (definition.seriesId === 'WALCL') {
    return [
      { label: '직전 주 대비', value: changes.previous, digits: 1, suffix: '십억 달러' },
      { label: '4주 변화', value: changes.shortTerm, digits: 1, suffix: '십억 달러' },
      { label: '13주 변화', value: changes.mediumTerm, digits: 1, suffix: '십억 달러' },
    ];
  }
  const suffix = definition.seriesId === 'CUMFNS' ? 'pp' : '%';
  return [
    { label: '전월 대비', value: changes.previous, digits: 2, suffix },
    { label: '전년 동월 대비', value: changes.yearOverYear, digits: 2, suffix },
  ];
}

function changeTone(value?: number) {
  if (!Number.isFinite(value) || Math.abs(value!) < 0.000001) return 'flat';
  return value! > 0 ? 'up' : 'down';
}

function directionMeaning(definition: MacroIndicatorDefinition, value?: number) {
  if (!Number.isFinite(value) || Math.abs(value!) < 0.000001) return '큰 변화가 없는 방향';
  return value! > 0 ? definition.higherMeaning : definition.lowerMeaning;
}

function MacroIndicatorCard({ definition, series, loading }: {
  definition: MacroIndicatorDefinition;
  series?: MacroSeriesResult;
  loading: boolean;
}) {
  const source = sourceRegistry[definition.sourceRef];
  if (!series) {
    return (
      <article className="macro-indicator-card is-unavailable" id={`macro-indicator-${definition.id}`}>
        <div className="macro-indicator-topline"><span>{macroFrequencyLabels[definition.frequency]}</span><code>{definition.seriesId}</code></div>
        <h3>{definition.label}</h3>
        <div className="macro-indicator-unavailable" role="status">{loading ? '최신 관측을 불러오는 중입니다.' : '현재 이 지표를 표시할 수 없습니다.'}</div>
        <p>{definition.interpretation}</p>
        {source ? <a href={source.url} target="_blank" rel="noopener noreferrer">FRED에서 확인 <ExternalLink size={14} /></a> : null}
      </article>
    );
  }

  const items = changeItems(definition, series);
  const primaryChange = items[0]?.value;
  return (
    <article className="macro-indicator-card" id={`macro-indicator-${definition.id}`}>
      <div className="macro-indicator-topline">
        <span>{macroFrequencyLabels[definition.frequency]}</span>
        <code>{definition.seriesId}</code>
      </div>
      <h3>{definition.label}</h3>
      <div className="macro-indicator-value">
        <strong>{latestValue(definition, series)}</strong>
        <span>{definition.displayUnit}</span>
      </div>
      {definition.seriesId === 'T10Y2Y' && Number.isFinite(series.changes.currentBasisPoints) ? (
        <p className="macro-spread-bp">현재 금리차 {signed(series.changes.currentBasisPoints!, 0, 'bp')}</p>
      ) : null}
      <small>{macroFrequencyLabels[definition.frequency]} · 최근 관측 {dateLabel(series.latest.date, definition.frequency)}</small>
      <div className="macro-change-list">
        {items.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <strong className={`macro-change-${changeTone(item.value)}`}>
              {Number.isFinite(item.value) ? `${item.value! > 0 ? '↑' : item.value! < 0 ? '↓' : '—'} ${signed(item.value!, item.digits, item.suffix)}` : '확인 중'}
            </strong>
          </div>
        ))}
      </div>
      <p className="macro-change-meaning">{directionMeaning(definition, primaryChange)}</p>
      <MacroSparkline history={series.history} label={definition.label} />
      <div className="macro-indicator-copy">
        <p>{definition.interpretation}</p>
        <small>{definition.caution}</small>
      </div>
      {source ? (
        <a className="macro-source-link" href={source.url} target="_blank" rel="noopener noreferrer">
          FRED에서 확인 <ExternalLink size={14} />
        </a>
      ) : null}
    </article>
  );
}

export function MacroDomainSummaryCards({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`macro-summary-grid${compact ? ' is-compact' : ''}`}>
      {macroDomainBriefs.map((brief) => (
        <article key={brief.id}>
          <span>{macroDomainLabels[brief.domain]}</span>
          <h3>{brief.state}</h3>
          <em className={`trend-${brief.trend}`}>{macroBriefTrendLabels[brief.trend]}</em>
          <p>{brief.summary}</p>
          <small>해설 기준 {dateLabel(brief.asOf)} · 검토 {dateLabel(brief.reviewedAt)}</small>
        </article>
      ))}
    </div>
  );
}

export function HomeMacroDashboard() {
  return (
    <section className="home-macro-section" aria-labelledby="home-macro-title">
      <div className="home-dashboard-head">
        <div>
          <span>거시 온도판</span>
          <h2 id="home-macro-title">금리·유동성·산업 수요의 배경을 함께 봅니다</h2>
        </div>
        <a href="/ko/macro-dashboard">거시 지표 전체 보기 <ArrowRight size={15} /></a>
      </div>
      <MacroDomainSummaryCards compact />
    </section>
  );
}

export function MacroDashboard() {
  const [response, setResponse] = useState<MacroIndicatorsResponse | null>(null);
  useEffect(() => {
    let active = true;
    fetchMacroIndicators().then((result) => {
      if (active) setResponse(result);
    });
    return () => { active = false; };
  }, []);

  const byId = useMemo(() => new Map((response?.series ?? []).map((series) => [series.id, series])), [response]);
  const reports = macroRelatedReports(4);
  const bottlenecks = macroRelatedBottlenecks();
  const loading = response === null;
  const failed = response !== null && !response.ok;

  return (
    <main className="macro-dashboard-main">
      <section className="macro-dashboard-intro">
        <p className="home-kicker">공식 거시 데이터 · FRED</p>
        <h1>거시 온도판</h1>
        <p>금리·금융여건·유동성·산업 수요를 함께 봅니다.</p>
        <div><Info size={16} /><span>지표마다 발표 주기가 다르며 최신 값은 같은 날짜의 데이터가 아닐 수 있습니다.</span></div>
      </section>

      <section className="macro-dashboard-summary" aria-labelledby="macro-summary-title">
        <div className="macro-section-head"><span>편집 해설</span><h2 id="macro-summary-title">현재 거시 환경 요약</h2></div>
        <MacroDomainSummaryCards />
      </section>

      {loading ? <div className="macro-load-state" role="status">거시 지표를 불러오고 있습니다.</div> : null}
      {response?.partial ? <div className="macro-load-state is-partial" role="status">일부 지표의 최신 값을 불러오지 못했습니다. 확인 가능한 지표부터 표시합니다.</div> : null}
      {failed ? <div className="macro-load-state is-error" role="alert">거시 지표를 일시적으로 불러오지 못했습니다. 산업 보고서와 병목 레이더는 계속 확인할 수 있습니다.</div> : null}

      {macroDomainOrder.map((domain) => (
        <section className="macro-domain-section" key={domain} aria-labelledby={`macro-domain-${domain}`}>
          <div className="macro-section-head">
            <span>{macroDomainLabels[domain]}</span>
            <h2 id={`macro-domain-${domain}`}>{macroDomainLabels[domain]}</h2>
          </div>
          <div className={`macro-indicator-grid domain-${domain}`}>
            {macroIndicatorsByDomain(domain).map((definition) => (
              <MacroIndicatorCard key={definition.id} definition={definition} series={byId.get(definition.id)} loading={loading} />
            ))}
          </div>
        </section>
      ))}

      <p className="macro-revision-note">표시 값은 FRED의 최신 공개 관측값이며 이후 수정될 수 있습니다.</p>

      <section className="macro-related-section" aria-labelledby="macro-related-reports-title">
        <div className="macro-section-head"><span>더 깊게 보기</span><h2 id="macro-related-reports-title">거시 흐름과 연결된 보고서</h2></div>
        <div className="macro-related-grid">
          {reports.map((report) => report ? (
            <a key={report.id} href={`/ko/reports/${encodeURIComponent(report.slug)}`}>
              <span>{report.publisher}</span><strong>{report.titleKo}</strong><small>{report.publishedAt.split('-').join('.')}</small>
            </a>
          ) : null)}
        </div>
      </section>

      <section className="macro-related-section" aria-labelledby="macro-related-bottlenecks-title">
        <div className="macro-section-head"><span>구조적 배경</span><h2 id="macro-related-bottlenecks-title">함께 확인할 공급망 병목</h2></div>
        <div className="macro-related-grid bottlenecks">
          {bottlenecks.map((entry) => entry ? (
            <a key={entry.id} href={`/ko/bottlenecks/${encodeURIComponent(entry.slug)}`}>
              <span>공급망 병목</span><strong>{entry.shortTitle}</strong><small>거시 지표는 배경 정보이며 원인을 단정하지 않습니다.</small>
            </a>
          ) : null)}
        </div>
      </section>
    </main>
  );
}

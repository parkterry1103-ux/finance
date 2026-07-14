import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import {
  buildDemandSupplyResults,
  combinationLabels,
  demandStateLabels,
  demandSupplyEntries,
  safeDemandSupplyEntryId,
  type DemandBackgroundState,
  type DemandSupplyEntryId,
} from '../../content/demand-supply/index.js';
import {
  bottleneckCompanyRoleLabels,
  bottleneckConfidenceLabels,
  bottleneckStatusLabels,
  bottleneckTrendLabels,
} from '../../content/bottlenecks/index.js';
import type { BottleneckStatus } from '../../content/bottlenecks/types.js';
import { macroIndicatorById } from '../../content/macro/index.js';
import type { MacroIndicatorsResponse, MacroSeriesResult } from '../../content/macro/types.js';
import { reportById } from '../../content/reports/index.js';
import { companies, reconstructionInfrastructureMap, semiconductorClusterInfrastructureMap } from '../../data.js';
import { fetchMacroIndicators } from '../../services/macro.js';
import { companyEventCompany, companyEventsForDemandSupply, companyEventStageLabels } from '../../content/company-events/index.js';
import { companyProfilePathForCompanyId, companyProfilePathForTicker } from '../../content/company-profiles/index.js';
import { industryFlowForDemandSupply } from '../../content/industry-flows/index.js';
import { IndustryFlowCard } from '../industry-flows/IndustryFlowCard.js';

const matrixDemandOrder: DemandBackgroundState[] = ['improving', 'mixed', 'weakening', 'limited'];
function initialIndustry() {
  return safeDemandSupplyEntryId(new URLSearchParams(window.location.search).get('industry'));
}

function syncIndustry(id: DemandSupplyEntryId) {
  const url = new URL(window.location.href);
  url.searchParams.set('industry', id);
  window.history.replaceState({}, '', `${url.pathname}${url.search}`);
}

function supplyGroup(status?: BottleneckStatus) {
  return status === 'tight' || status === 'critical' ? 'tight' : 'watch';
}

function signed(value: number | undefined, suffix: string) {
  if (!Number.isFinite(value)) return '확인 제한';
  const direction = value! > 0 ? '▲' : value! < 0 ? '▼' : '—';
  const prefix = value! > 0 ? '+' : '';
  return `${direction} ${prefix}${value!.toFixed(2)}${suffix}`;
}

function demandCopy(state: DemandBackgroundState) {
  if (state === 'improving') return '단기와 중기 변화가 전반적으로 개선 방향입니다.';
  if (state === 'weakening') return '단기와 중기 변화가 전반적으로 약화 방향입니다.';
  if (state === 'mixed') return '단기와 중기 또는 지표별 방향이 서로 엇갈립니다.';
  return '비교 가능한 단기·중기 관측값이 충분하지 않습니다.';
}

function companyRecord(companyId: string) {
  const all = [...companies, ...reconstructionInfrastructureMap.companies, ...semiconductorClusterInfrastructureMap.companies];
  return all.find((company) => company.id === companyId);
}

function DemandIndicatorRow({ series, indicatorId, state }: { series?: MacroSeriesResult; indicatorId: string; state: DemandBackgroundState }) {
  const definition = macroIndicatorById(indicatorId);
  const suffix = definition?.seriesId === 'CUMFNS' ? 'pp' : '%';
  return (
    <article className={`demand-indicator-row demand-${state}`}>
      <div><span>{definition?.shortLabel ?? indicatorId}</span><strong>{demandStateLabels[state]}</strong></div>
      <p>{definition?.interpretation ?? '산업 수요를 이해하는 거시 배경입니다.'}</p>
      <dl>
        <div><dt>단기</dt><dd>{signed(series?.changes.previous, suffix)}</dd></div>
        <div><dt>중기</dt><dd>{signed(series?.changes.yearOverYear, suffix)}</dd></div>
        <div><dt>최근 관측</dt><dd>{series?.latest.date ?? '확인 제한'}</dd></div>
      </dl>
    </article>
  );
}

export function DemandSupplyMatrix() {
  const initial = useMemo(initialIndustry, []);
  const [selectedId, setSelectedId] = useState<DemandSupplyEntryId>(initial);
  const [macroResponse, setMacroResponse] = useState<MacroIndicatorsResponse | null>(null);

  useEffect(() => {
    let active = true;
    fetchMacroIndicators().then((response) => { if (active) setMacroResponse(response); });
    return () => { active = false; };
  }, []);

  const results = useMemo(() => buildDemandSupplyResults(macroResponse?.series ?? []), [macroResponse]);
  const selected = results.find((result) => result.entry.id === selectedId) ?? results[0];
  const entry = selected.entry;
  const bottleneck = selected.bottleneck;
  const reports = entry.reportIds.map(reportById).filter((report): report is NonNullable<typeof report> => Boolean(report)).slice(0, 2);
  const relatedCompanyEvents = companyEventsForDemandSupply(entry.id, 2);
  const companyLinks = (bottleneck?.companyLinks ?? []).slice(0, 3).map((link) => ({ ...link, company: companyRecord(link.companyId) })).filter((link) => Boolean(link.company));
  const industryFlow = industryFlowForDemandSupply(entry.id);
  const loading = macroResponse === null;
  const failed = macroResponse !== null && !macroResponse.ok;

  const selectIndustry = (id: DemandSupplyEntryId) => {
    setSelectedId(id);
    syncIndustry(id);
  };

  return (
    <main className="demand-supply-main">
      <section className="demand-supply-intro">
        <p className="home-kicker">거시 수요 배경 × 공급망 병목 매트릭스</p>
        <h1>수요와 공급을 함께 보기</h1>
        <p>산업 수요의 배경이 되는 거시지표와 실제 공급 부족 상태를 나란히 살펴봅니다.</p>
      </section>

      <section className="demand-supply-guide" aria-labelledby="demand-supply-guide-title">
        <h2 id="demand-supply-guide-title">두 종류의 정보를 나눠 읽으세요</h2>
        <div>
          <article><strong>수요 배경</strong><p>산업생산·가동률·건설 활동처럼 산업 수요를 이해할 때 함께 보는 거시지표입니다.</p></article>
          <article><strong>공급 상태</strong><p>공식 자료와 기업 발표를 바탕으로 검토한 기존 공급 부족 상태입니다.</p></article>
          <article><strong>주의</strong><p>거시지표가 개별 산업 주문량이나 특정 기업 실적을 직접 뜻하지는 않습니다.</p></article>
        </div>
      </section>

      {loading ? <div className="demand-supply-load" role="status">수요 배경과 공급 상태를 함께 확인하고 있습니다.</div> : null}
      {macroResponse?.partial ? <div className="demand-supply-load is-partial" role="status">일부 거시지표를 불러오지 못했습니다. 확인 가능한 지표와 공급 상태부터 보여드립니다.</div> : null}
      {failed ? <div className="demand-supply-load is-error" role="alert">수요 배경은 일시적으로 확인할 수 없습니다. 공급 병목 상태와 완화 신호는 계속 확인할 수 있습니다.</div> : null}

      <section className="demand-supply-matrix-section" aria-labelledby="demand-supply-matrix-title">
        <div className="demand-supply-section-head"><span>현재 조합</span><h2 id="demand-supply-matrix-title">산업 네 곳을 한눈에 비교합니다</h2></div>
        <div className="demand-supply-matrix" role="tablist" aria-label="산업 수요와 공급 조합">
          <span className="matrix-corner" aria-hidden="true">수요 배경 ↓ · 공급 상태 →</span>
          <span className="matrix-column matrix-column-watch">공급 정상·관찰</span>
          <span className="matrix-column matrix-column-tight">공급 타이트·심각</span>
          {matrixDemandOrder.map((state) => <span key={state} className={`matrix-row matrix-row-${state}`}>수요 {demandStateLabels[state]}</span>)}
          {matrixDemandOrder.flatMap((state, rowIndex) => (['watch', 'tight'] as const).map((supply, columnIndex) => (
            <div className="demand-supply-matrix-cell" key={`${state}-${supply}`} style={{ gridRow: rowIndex + 2, gridColumn: columnIndex + 2 }}>
              {results.filter((result) => result.demandState === state && supplyGroup(result.bottleneck?.status) === supply).map((result) => (
                <button
                  key={result.entry.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedId === result.entry.id}
                  className={`demand-supply-card demand-${result.demandState} supply-${supply}${selectedId === result.entry.id ? ' is-selected' : ''}`}
                  onClick={() => selectIndustry(result.entry.id)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    event.preventDefault();
                    selectIndustry(result.entry.id);
                  }}
                >
                  <h3>{result.entry.title}</h3>
                  <dl>
                    <div><dt>수요 배경</dt><dd>{demandStateLabels[result.demandState]}</dd></div>
                    <div><dt>공급 상태</dt><dd>{result.bottleneck ? `${bottleneckStatusLabels[result.bottleneck.status]} · ${bottleneckTrendLabels[result.bottleneck.trend]}` : '확인 제한'}</dd></div>
                  </dl>
                  <p>{combinationLabels[result.combination]}</p>
                  <small>거시 {result.latestObservationDate ?? '확인 제한'} · 병목 검토 {result.bottleneck?.reviewedAt ?? '확인 제한'}</small>
                </button>
              ))}
            </div>
          )))}
        </div>
      </section>

      <section className="demand-supply-detail" aria-labelledby="demand-supply-detail-title">
        <div className="demand-supply-section-head"><span>선택 산업</span><h2 id="demand-supply-detail-title">{entry.beginnerQuestion}</h2></div>
        <div className={`demand-supply-summary demand-${selected.demandState}`}>
          <div><span>한눈에 읽기</span><strong>{combinationLabels[selected.combination]}</strong><p>{demandCopy(selected.demandState)}</p></div>
          <dl>
            <div><dt>유효 거시지표</dt><dd>{selected.validIndicatorCount}/{entry.macroIndicatorIds.length}개</dd></div>
            <div><dt>최근 거시 관측</dt><dd>{selected.latestObservationDate ?? '확인 제한'}</dd></div>
            <div><dt>병목 검토일</dt><dd>{bottleneck?.reviewedAt ?? '확인 제한'}</dd></div>
          </dl>
        </div>

        <div className="demand-supply-columns">
          <section aria-labelledby="demand-background-title">
            <div className="demand-supply-subhead"><span>수요 배경</span><h3 id="demand-background-title">거시지표 방향</h3><p>{entry.demandContext}</p></div>
            <div className="demand-indicator-list">{selected.indicators.map((indicator) => <DemandIndicatorRow key={indicator.indicatorId} indicatorId={indicator.indicatorId} series={indicator.series} state={indicator.state} />)}</div>
            <small className="demand-supply-caution"><Info size={14} aria-hidden="true" />{entry.caution} 지표마다 발표일이 다를 수 있습니다.</small>
          </section>

          <section aria-labelledby="supply-background-title">
            <div className="demand-supply-subhead"><span>공급 상태</span><h3 id="supply-background-title">기존 병목 검토</h3><p>{entry.supplyContext}</p></div>
            {bottleneck ? (
              <div className={`demand-supply-bottleneck status-${bottleneck.status}`}>
                <div><strong>{bottleneckStatusLabels[bottleneck.status]}</strong><span>{bottleneckTrendLabels[bottleneck.trend]}</span></div>
                <div className="bottleneck-status-track" aria-label={`현재 공급 상태 ${bottleneckStatusLabels[bottleneck.status]}`}>
                  {(['normal', 'watch', 'tight', 'critical'] as BottleneckStatus[]).map((status) => <span key={status} className={status === bottleneck.status ? 'is-current' : ''}>{bottleneckStatusLabels[status]}</span>)}
                </div>
                <dl><div><dt>신뢰도</dt><dd>{bottleneckConfidenceLabels[bottleneck.confidence]}</dd></div><div><dt>근거 기준일</dt><dd>{bottleneck.asOf}</dd></div><div><dt>검토일</dt><dd>{bottleneck.reviewedAt}</dd></div></dl>
                <a href={`/ko/bottlenecks/${encodeURIComponent(bottleneck.slug)}`}>공급 부족 근거 자세히 보기 <ArrowRight size={14} /></a>
              </div>
            ) : <div className="demand-supply-unavailable">연결된 공급 병목을 확인할 수 없습니다.</div>}
          </section>
        </div>
      </section>

      {industryFlow ? <div className="industry-flow-detail-list"><IndustryFlowCard flow={industryFlow} variant="detail" /></div> : null}

      {bottleneck ? (
        <section className="demand-supply-signals" aria-labelledby="demand-supply-signals-title">
          <div className="demand-supply-section-head"><span>다음 확인</span><h2 id="demand-supply-signals-title">무엇이 바뀌는지 지켜보세요</h2></div>
          <div>
            <article><h3>완화되려면 확인할 신호</h3><ul>{bottleneck.reliefSignals.slice(0, 3).map((signal) => <li key={signal}>{signal}</li>)}</ul></article>
            <article><h3>아직 확인이 필요한 점</h3><ul>{bottleneck.uncertainties.slice(0, 2).map((uncertainty) => <li key={uncertainty}>{uncertainty}</li>)}</ul></article>
          </div>
        </section>
      ) : null}

      <section className="demand-supply-related" aria-labelledby="demand-supply-related-title">
        <div className="demand-supply-section-head"><span>관련 맥락</span><h2 id="demand-supply-related-title">자료와 산업 구조를 이어서 봅니다</h2></div>
        <div className="demand-supply-related-grid">
          {relatedCompanyEvents.map((event) => {
            const company = companyEventCompany(event.companyId);
            return <a key={event.id} href={`/ko/company-events?event=${encodeURIComponent(event.id)}`}><span>관련 기업이 밝힌 변화 · {companyEventStageLabels[event.stage]}</span><strong>{company?.name} · {event.title}</strong><small>공식 발표 해설 보기 <ArrowRight size={13} /></small></a>;
          })}
          {reports.map((report) => <a key={report.id} href={`/ko/reports/${encodeURIComponent(report.slug)}`}><span>{report.publisher}</span><strong>{report.titleKo}</strong><small>보고서 보기 <ArrowRight size={13} /></small></a>)}
          {companyLinks.map((link) => {
            const profilePath = companyProfilePathForCompanyId(link.companyId) ?? companyProfilePathForTicker(link.company?.ticker);
            return profilePath
              ? <a key={link.companyId} href={profilePath}><span>{bottleneckCompanyRoleLabels[link.role]}</span><strong>{link.company?.name}</strong><small>{link.reason} · 기업 자세히 보기 <ArrowRight size={13} aria-hidden="true" /></small></a>
              : <article key={link.companyId}><span>{bottleneckCompanyRoleLabels[link.role]}</span><strong>{link.company?.name}</strong><small>{link.reason}</small></article>;
          })}
          {entry.relationIds?.slice(0, 1).map((relationId) => <a key={relationId} href={`/ko/market-relations?relation=${relationId}&period=1y`}><span>기존 관계판</span><strong>산업생산과 구리가 함께 움직였는지 보기</strong><small>관계판 열기 <ArrowRight size={13} /></small></a>)}
        </div>
      </section>

      <details className="demand-supply-methodology">
        <summary>분류 방법과 주의사항 보기</summary>
        <div><h2>점수 없이 방향만 분류합니다</h2><ul><li>각 지표의 단기·중기 변화 부호가 모두 양수면 개선, 모두 음수면 약화, 그 외는 혼조입니다.</li><li>유효 지표가 두 개보다 적으면 판단 제한입니다.</li><li>개선과 약화 지표가 동시에 있으면 항상 혼조로 표시합니다.</li><li>공급 상태·추세·완화 신호·불확실성은 기존 병목 registry를 그대로 사용합니다.</li><li>거시지표 변화가 개별 병목의 직접 원인이라는 뜻은 아닙니다.</li></ul></div>
      </details>
    </main>
  );
}

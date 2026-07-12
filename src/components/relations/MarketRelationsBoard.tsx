import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ExternalLink, Info } from 'lucide-react';
import {
  relationDefinitionById,
  relationDefinitions,
  relationStateLabels,
  relationWindowLabels,
  safeRelationId,
  safeRelationWindow,
  type MarketRelationResult,
  type MarketRelationsResponse,
  type RelationId,
  type RelationState,
  type RelationWindow,
} from '../../content/relations/index.js';
import { reportById } from '../../content/reports/index.js';
import { sourceRegistry } from '../../content/sources/index.js';
import { fetchMarketRelations } from '../../services/relations.js';
import { RelationDualTrendChart } from './RelationDualTrendChart.js';

const mapLabels: Record<string, string> = {
  'us-semiconductors': '미국 반도체 시장지도',
  'datacenter-power-cooling': '데이터센터 전력·냉각 시장지도',
};

function initialSelection() {
  const params = new URLSearchParams(window.location.search);
  const relation = safeRelationId(params.get('relation'));
  return { relation, period: safeRelationWindow(relation, params.get('period')) };
}

function stateSummary(state: RelationState, windowLabel: string) {
  if (state === 'same-direction') return `최근 ${windowLabel}에는 두 변화가 비슷한 방향으로 움직인 관측이 비교적 많았습니다.`;
  if (state === 'opposite-direction') return `최근 ${windowLabel}에는 두 변화가 서로 엇갈린 방향으로 움직인 관측이 비교적 많았습니다.`;
  if (state === 'weak') return `최근 ${windowLabel}에는 두 변화가 한 방향으로 뚜렷하게 묶이지 않았습니다.`;
  return `최근 ${windowLabel}에는 관측 수가 부족하거나 변화가 일정해 관계를 제한적으로만 볼 수 있습니다.`;
}

function syncQuery(relation: RelationId, period: RelationWindow) {
  const url = new URL(window.location.href);
  url.searchParams.set('relation', relation);
  url.searchParams.set('period', period);
  window.history.replaceState({}, '', `${url.pathname}${url.search}`);
}

function RelationCard({ definitionId, result, selected, onSelect }: {
  definitionId: RelationId;
  result?: MarketRelationResult;
  selected: boolean;
  onSelect: () => void;
}) {
  const definition = relationDefinitionById(definitionId)!;
  const window = result?.windows[result.defaultWindow];
  const state = window?.relationState ?? 'limited';
  return (
    <button className={`relation-choice-card state-${state}${selected ? ' is-selected' : ''}`} type="button" role="tab" aria-selected={selected} onClick={onSelect} onKeyDown={(event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      onSelect();
    }}>
      <span>{definition.frequency === 'monthly' ? '월별 비교' : definition.frequency === 'weekly' ? '주별 비교' : '일별 비교'}</span>
      <h3>{definition.shortTitle}</h3>
      <strong>{window?.label ?? `최근 ${relationWindowLabels[definition.defaultWindow]}`} · {relationStateLabels[state]}</strong>
      <p>{definition.interpretation}</p>
    </button>
  );
}

export function MarketRelationsBoard() {
  const initial = useMemo(initialSelection, []);
  const [response, setResponse] = useState<MarketRelationsResponse | null>(null);
  const [selectedId, setSelectedId] = useState<RelationId>(initial.relation);
  const [selectedWindow, setSelectedWindow] = useState<RelationWindow>(initial.period);

  useEffect(() => {
    let active = true;
    fetchMarketRelations().then((result) => { if (active) setResponse(result); });
    return () => { active = false; };
  }, []);

  const selectRelation = (id: RelationId) => {
    const definition = relationDefinitionById(id)!;
    setSelectedId(id);
    setSelectedWindow(definition.defaultWindow);
    syncQuery(id, definition.defaultWindow);
  };
  const selectWindow = (window: RelationWindow) => {
    setSelectedWindow(window);
    syncQuery(selectedId, window);
  };

  const definition = relationDefinitionById(selectedId)!;
  const relation = response?.relations.find((item) => item.id === selectedId);
  const windowResult = relation?.windows[selectedWindow];
  const failedRelation = Boolean(response && (!response.ok || response.errors.some((error) => error.id === selectedId)));
  const reports = definition.reportIds.map(reportById).filter((report): report is NonNullable<typeof report> => Boolean(report)).slice(0, 2);

  return (
    <main className="market-relations-main">
      <section className="market-relations-intro">
        <p className="home-kicker">거시·시장 교차 관계판</p>
        <h1>함께 움직였나요?</h1>
        <p>금리·금융여건·산업 수요와 시장 가격이 최근 함께 움직였는지 비교합니다.</p>
        <div><Info size={16} aria-hidden="true" /><span>상관관계는 인과관계를 의미하지 않으며 선택한 기간에 따라 달라질 수 있습니다.</span></div>
      </section>

      <section className="relation-reading-guide" aria-labelledby="relation-reading-title">
        <span>간단한 읽는 법</span><h2 id="relation-reading-title">상태 문장을 먼저 확인하세요</h2>
        <p>상관계수보다 먼저 최근 변화가 비슷했는지, 엇갈렸는지, 뚜렷하지 않았는지 읽습니다.</p>
      </section>

      {response === null ? <div className="relation-load-state" role="status">거시와 시장의 움직임을 맞춰 보고 있습니다.</div> : null}
      {response?.partial ? <div className="relation-load-state is-partial" role="status">일부 관계를 계산하지 못했습니다. 확인 가능한 관계부터 보여드립니다.</div> : null}
      {response && !response.ok ? <div className="relation-load-state is-error" role="alert">관계 데이터를 일시적으로 불러오지 못했습니다. 거시 온도판과 오늘 시장 브리핑은 계속 확인할 수 있습니다.</div> : null}

      <section className="relation-choice-section" aria-labelledby="relation-choice-title">
        <div className="relation-section-head"><span>관계 선택</span><h2 id="relation-choice-title">세 관계 중 하나를 골라 보세요</h2></div>
        <div className="relation-choice-grid" role="tablist" aria-label="비교할 관계">
          {relationDefinitions.map((item) => <RelationCard key={item.id} definitionId={item.id} result={response?.relations.find((result) => result.id === item.id)} selected={selectedId === item.id} onSelect={() => selectRelation(item.id)} />)}
        </div>
      </section>

      <section className="relation-detail" aria-labelledby="relation-detail-title">
        <div className="relation-section-head"><span>선택한 관계</span><h2 id="relation-detail-title">{definition.beginnerQuestion}</h2></div>
        <div className="relation-periods" aria-label="비교 기간">
          {definition.availableWindows.map((window) => <button key={window} type="button" aria-pressed={selectedWindow === window} onClick={() => selectWindow(window)} onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            selectWindow(window);
          }}>{relationWindowLabels[window]}</button>)}
        </div>
        <dl className="relation-comparison-basis">
          <div><dt>원본</dt><dd>{definition.macroLabel}</dd></div>
          <div><dt>비교 방향</dt><dd>{definition.macroComparisonLabel}</dd></div>
          <div><dt>시장 비교값</dt><dd>{definition.marketLabel} 변화율</dd></div>
        </dl>

        {windowResult ? (
          <>
            <div className={`relation-result-summary state-${windowResult.relationState}`}>
              <span>최근 관계</span><strong>{relationStateLabels[windowResult.relationState]}</strong>
              <p>{stateSummary(windowResult.relationState, relationWindowLabels[selectedWindow])}</p>
              <dl>
                <div><dt>관측 수</dt><dd>{windowResult.sampleSize}개</dd></div>
                <div><dt>기간</dt><dd>{windowResult.startDate ?? '—'} ~ {windowResult.endDate ?? '—'}</dd></div>
                <div><dt>변화값 상관계수</dt><dd>{windowResult.correlation === null ? '판단 제한' : windowResult.correlation.toFixed(2)}</dd></div>
              </dl>
            </div>
            <RelationDualTrendChart points={windowResult.points} macroLabel={relation?.macro.comparisonLabel ?? definition.macroComparisonLabel} marketLabel={relation?.market.label ?? definition.marketLabel} />
            <div className="relation-explanation-grid">
              <article><span>최근에는 어떻게 움직였나요?</span><p>{stateSummary(windowResult.relationState, relationWindowLabels[selectedWindow])}</p></article>
              <article><span>무엇을 함께 비교했나요?</span><p>{definition.comparisonDescription}</p></article>
              <article><span>왜 항상 같게 움직이지 않나요?</span><p>{definition.whyDifferent}</p></article>
            </div>
          </>
        ) : (
          <div className="relation-unavailable" role={failedRelation ? 'alert' : 'status'}>{failedRelation ? '이 관계는 현재 비교할 관측값이 충분하지 않습니다.' : '선택한 관계의 계산 결과를 불러오고 있습니다.'}</div>
        )}
      </section>

      <section className="relation-related" aria-labelledby="relation-related-title">
        <div className="relation-section-head"><span>더 읽기</span><h2 id="relation-related-title">같이 읽어볼 자료</h2></div>
        <div className="relation-related-grid">
          {reports.map((report) => <a key={report.id} href={`/ko/reports/${encodeURIComponent(report.slug)}`}><span>{report.publisher}</span><strong>{report.titleKo}</strong><small>맥락 자료로 보기 <ArrowRight size={14} /></small></a>)}
          {definition.marketMapIds.slice(0, 1).map((mapId) => <a key={mapId} href={`/ko/category/${encodeURIComponent(mapId)}`}><span>관련 산업 구조</span><strong>{mapLabels[mapId] ?? mapId}</strong><small>시장지도 열기 <ArrowRight size={14} /></small></a>)}
        </div>
      </section>

      <details className="relation-methodology">
        <summary>방법론과 출처 보기</summary>
        <div>
          <h2>어떻게 비교했나요?</h2>
          <ul>
            <li>원본 level이 아니라 날짜와 빈도를 맞춘 변화값을 비교합니다.</li>
            <li>Pearson correlation을 사용하며 최소 관측 수는 8개입니다.</li>
            <li>금리와 NFCI는 완화 방향이 양수가 되도록 변화 방향만 변환합니다.</li>
            <li>관계 구간은 변화값 상관계수를 읽기 쉽게 분류한 참고 기준이며, 경계값에 따라 경제적 의미가 확정되는 것은 아닙니다.</li>
            <li>상관관계는 인과관계가 아니며 기간과 데이터 발표 주기에 따라 달라질 수 있습니다.</li>
          </ul>
          <div className="relation-source-links">
            {definition.sourceRefs.map((sourceId) => sourceRegistry[sourceId] ? <a key={sourceId} href={sourceRegistry[sourceId].url} target="_blank" rel="noopener noreferrer">{sourceRegistry[sourceId].publisher} 원문 <ExternalLink size={13} /></a> : null)}
          </div>
        </div>
      </details>
    </main>
  );
}

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { loadThreeReadsEdition } from '../content/editorial/registry.js';
import { dateIsNotFuture, isDetailVisible } from '../content/editorial/selectors.js';
import { publishedEditorialSummaryIndex } from '../content/editorial/summaries.js';
import type { EditorialArticleSource, EditorialSource, StockDissectionSummary, ThreeReadsEdition } from '../content/editorial/types.js';
import { editorialDate, editorialInternalLink, editorialPath, type EditorialNavigate } from '../components/editorial/EditorialUi.js';
import { loadEditorialEventImpacts, type EventImpactRecord } from '../content/event-impacts/index.js';
import { EditorialEventImpactSection } from '../components/event-impacts/EventImpactUi.js';
import { observeEditorialReading, trackAnalyticsEvent } from '../analytics/index.js';

function SourceRow({ source, label, contentId, sourceOrder, sourceType = 'article' }: { source: EditorialSource | EditorialArticleSource; label: string; contentId: string; sourceOrder: number; sourceType?: string }) {
  return <li><div><strong>{label}</strong><span>발행 {editorialDate(source.publishedAt.slice(0, 10))} · 접근 {editorialDate(source.accessedAt.slice(0, 10))}{'articleIdentifier' in source && source.articleIdentifier ? ` · 기사 식별자 ${source.articleIdentifier}` : ''}</span></div>{source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`${label} 새 창에서 열기`} onClick={() => trackAnalyticsEvent('editorial_source_open', { contentType: 'wall_street_edition', contentId, sourceType, sourceOrder, placement: 'editorial_body' })}>원문 <ExternalLink size={13} aria-hidden="true" /></a> : <span>기사 식별 정보 확인</span>}</li>;
}

export default function ThreeReadsRoute({ slug, navigation, onNavigate }: { slug: string; navigation: ReactNode; onNavigate: EditorialNavigate }) {
  const [item, setItem] = useState<ThreeReadsEdition | null | undefined>(undefined);
  const [eventImpacts, setEventImpacts] = useState<EventImpactRecord[]>([]);
  const articleRef = useRef<HTMLElement>(null);
  useEffect(() => {
    let active = true;
    setItem(undefined);
    loadThreeReadsEdition(slug).then((loaded) => { if (active) setItem(loaded ?? null); }).catch(() => { if (active) setItem(null); });
    return () => { active = false; };
  }, [slug]);
  useEffect(() => {
    let active = true;
    setEventImpacts([]);
    if (!item?.id) return () => { active = false; };
    loadEditorialEventImpacts(item.id).then((impacts) => { if (active) setEventImpacts(impacts); }).catch(() => { if (active) setEventImpacts([]); });
    return () => { active = false; };
  }, [item?.id]);

  const today = new Date().toISOString().slice(0, 10);
  const publicItem = item && isDetailVisible(item.status) && dateIsNotFuture(item.publishedAt, today) ? item : null;
  useEffect(() => {
    if (!publicItem || !articleRef.current) return;
    const properties = { contentType: 'wall_street_edition' as const, contentId: publicItem.id };
    trackAnalyticsEvent('editorial_view', properties, { oncePerPage: true, dedupeKey: publicItem.id });
    return observeEditorialReading(articleRef.current, properties);
  }, [publicItem?.id]);
  if (item === undefined) return <div className="pick-shell editorial-shell">{navigation}<main className="editorial-route-state" role="status" aria-live="polite"><h1>오늘의 월스트리트를 불러오는 중입니다.</h1></main></div>;
  if (!publicItem) return <div className="pick-shell editorial-shell">{navigation}<main className="editorial-route-state"><h1>공개된 오늘의 월스트리트를 찾을 수 없습니다.</h1><p>세 원문의 출처와 기준일 검증을 마친 독자적 콘텐츠만 표시합니다.</p><a href="/ko/insights?tab=wall-street" onClick={editorialInternalLink('/ko/insights?tab=wall-street', onNavigate)}>월스트리트 보관함으로 이동</a></main></div>;

  const relatedStocks = publishedEditorialSummaryIndex.filter((summary): summary is StockDissectionSummary => summary.kind === 'stock' && publicItem.relatedStockDissectionIds.includes(summary.id)).slice(0, 3);
  const relatedCompanySlugs = Array.from(new Set([...publicItem.relatedCompanySlugs, ...publicItem.reads.flatMap((read) => read.relatedCompanySlugs)])).slice(0, 3);
  return (
    <div className="pick-shell editorial-shell">
      {navigation}
      <main className="editorial-detail-main" ref={articleRef}>
        <nav className="editorial-breadcrumb" aria-label="현재 위치"><a href="/ko/insights?tab=wall-street" onClick={editorialInternalLink('/ko/insights?tab=wall-street', onNavigate)}>콘텐츠 보관함</a><span aria-hidden="true">/</span><strong>오늘의 월스트리트</strong></nav>
        <header className="editorial-detail-header editorial-three-detail-header">
          <p>오늘의 월스트리트 · <time dateTime={publicItem.contentAsOf}>{editorialDate(publicItem.contentAsOf)}</time></p>
          <h1>{publicItem.title}</h1>
          <span className="editorial-central-question"><strong>핵심 질문</strong>{publicItem.centralQuestion}</span>
          <div className="editorial-independent-badge"><strong>주가해부실의 독자적 해설</strong><span>주요 출처: The Wall Street Journal</span></div>
        </header>

        <section className="editorial-detail-section" aria-labelledby="three-common-title"><div className="editorial-detail-heading"><span>01</span><h2 id="three-common-title">세 뉴스가 연결되는 이유</h2></div><p className="editorial-lead-copy">{publicItem.commonThread}</p></section>

        <div className="editorial-read-list">{publicItem.reads.map((read) => <article key={read.id} className="editorial-read"><div className="editorial-read-order">0{read.order}</div><div><p>{['첫 번째', '두 번째', '세 번째'][read.order - 1]} 뉴스</p><h2>{read.headline}</h2><dl><div><dt>무슨 일이 있었나</dt><dd>{read.whatHappened}</dd></div><div><dt>왜 중요한가</dt><dd>{read.whyItMatters}</dd></div><div><dt>주가해부실의 구조적 해석</dt><dd>{read.structuralMeaning}</dd></div>{read.cashFlowTransmission ? <div><dt>현금흐름 전달 경로</dt><dd>{read.cashFlowTransmission}</dd></div> : null}{read.counterScenario ? <div><dt>반대 시나리오</dt><dd>{read.counterScenario}</dd></div> : null}</dl>
          <div className="editorial-fact-status-grid">
            {read.confirmedFacts?.length ? <section><h3>확정된 사실</h3><ul>{read.confirmedFacts.map((entry) => <li key={entry}>{entry}</li>)}</ul></section> : null}
            {read.companyOrInstitutionOutlook?.length ? <section><h3>회사 또는 기관의 전망</h3><ul>{read.companyOrInstitutionOutlook.map((entry) => <li key={entry}>{entry}</li>)}</ul></section> : null}
            {read.notYetFinal?.length ? <section><h3>Not Yet Final</h3><ul>{read.notYetFinal.map((entry) => <li key={entry}>{entry}</li>)}</ul></section> : null}
            {read.interpretation ? <section><h3>추가 확인이 필요한 해석</h3><p>{read.interpretation}</p></section> : null}
          </div>
          {read.keyNumbers?.length ? <div className="editorial-key-numbers"><strong>핵심 숫자</strong><ul>{read.keyNumbers.map((entry) => <li key={entry}>{entry}</li>)}</ul></div> : null}
          {read.watchItems?.length ? <div className="editorial-read-watch"><strong>다음 확인 변수</strong><ul>{read.watchItems.map((watch) => <li key={watch}>{watch}</li>)}</ul></div> : null}
          {read.source.url ? <a href={read.source.url} target="_blank" rel="noopener noreferrer" aria-label={`${read.source.name} 원문 새 창에서 열기`} onClick={() => trackAnalyticsEvent('editorial_source_open', { contentType: 'wall_street_edition', contentId: publicItem.id, sourceType: 'major_news', sourceOrder: read.order, placement: 'editorial_body' })}>{read.source.name} 원문 <ExternalLink size={13} aria-hidden="true" /></a> : <span className="editorial-article-identifier">{read.source.name} · 기사 식별자 {read.source.articleIdentifier}</span>}</div></article>)}</div>

        {publicItem.cashFlowTransmission?.length ? <section className="editorial-detail-section" aria-labelledby="three-cashflow-title"><div className="editorial-detail-heading"><span>05</span><h2 id="three-cashflow-title">가격과 현금흐름으로 전달되는 구조</h2></div><ol className="editorial-watch-list">{publicItem.cashFlowTransmission.map((entry) => <li key={entry}>{entry}</li>)}</ol></section> : null}
        <section className="editorial-detail-section" aria-labelledby="three-questions-title"><div className="editorial-detail-heading"><span>06</span><h2 id="three-questions-title">투자자가 확인할 변수</h2></div><ol className="editorial-watch-list">{publicItem.investorQuestions.map((question) => <li key={question}>{question}</li>)}</ol></section>
        <section className="editorial-takeaway editorial-detail-takeaway" aria-labelledby="three-takeaway-title"><span>오늘의 한 줄</span><h2 id="three-takeaway-title">{publicItem.oneLineTakeaway}</h2></section>

        <EditorialEventImpactSection impacts={eventImpacts} headingNumber="07" />

        {relatedStocks.length || relatedCompanySlugs.length ? <section className="editorial-detail-section" aria-labelledby="three-related-title"><div className="editorial-detail-heading"><span>{eventImpacts.length ? '08' : '07'}</span><h2 id="three-related-title">관련 해부와 기업</h2></div><div className="editorial-related-links">{relatedStocks.map((related) => { const path = editorialPath(related); return <a key={related.id} href={path} onClick={(event) => { trackAnalyticsEvent('related_research_click', { contentType: 'wall_street_edition', contentId: publicItem.id, placement: 'related_research', destinationType: 'editorial' }); editorialInternalLink(path, onNavigate)(event); }}>{related.headline}<ArrowRight size={14} aria-hidden="true" /></a>; })}{relatedCompanySlugs.map((companySlug) => <a key={companySlug} href={`/ko/companies/${encodeURIComponent(companySlug)}`} onClick={(event) => { trackAnalyticsEvent('editorial_company_click', { contentType: 'wall_street_edition', contentId: publicItem.id, companySlug, placement: 'editorial_footer', destinationType: 'company' }); editorialInternalLink(`/ko/companies/${encodeURIComponent(companySlug)}`, onNavigate)(event); }}>{companySlug} 기업 분석 보기<ArrowRight size={14} aria-hidden="true" /></a>)}</div></section> : null}

        <section className="editorial-detail-section" aria-labelledby="three-sources-title"><div className="editorial-detail-heading"><span>{eventImpacts.length ? '09' : '08'}</span><h2 id="three-sources-title">주요 출처</h2></div><ol className="editorial-source-list">{publicItem.reads.map((read) => <SourceRow key={read.id} source={read.source} label={`${read.source.name} · ${read.headline}`} contentId={publicItem.id} sourceOrder={read.order} />)}</ol></section>

        {publicItem.methodology ? <details className="editorial-methodology"><summary>선정·검증 방법 보기</summary><div><section><h2>뉴스 탐색 범위</h2><p>{publicItem.methodology.newsWindow}</p></section><section><h2>최근 14일 중복 검사</h2><p>{publicItem.methodology.duplicateCheck}</p></section><section><h2>후보 기사 선정 점수</h2><p>{publicItem.methodology.candidateSelection}</p></section><section><h2>기사별 팩트체크 요약</h2><ul>{publicItem.methodology.factCheckSummary.map((entry) => <li key={entry}>{entry}</li>)}</ul></section><section><h2>수정한 표현</h2><ul>{publicItem.methodology.correctedExpressions.map((entry) => <li key={entry}>{entry}</li>)}</ul></section><section><h2>Not Yet Final</h2><ul>{publicItem.methodology.notYetFinal.map((entry) => <li key={entry}>{entry}</li>)}</ul></section><section><h2>가격 기준일·시각</h2><ul>{publicItem.methodology.priceBasis.map((entry) => <li key={entry}>{entry}</li>)}</ul></section><section><h2>원문 및 공식 교차검증 자료</h2>{publicItem.reads.map((read) => <div key={read.id} className="editorial-method-sources"><h3>{read.headline}</h3><ol className="editorial-source-list"><SourceRow source={read.source} label={`${read.source.name} 원문`} contentId={publicItem.id} sourceOrder={read.order} />{read.officialSources?.map((source, index) => <SourceRow key={source.id} source={source} label={source.name} contentId={publicItem.id} sourceOrder={read.order * 10 + index + 1} sourceType="official" />)}</ol></div>)}</section></div></details> : null}

        <aside className="editorial-independent-disclosure"><strong>{publicItem.independentDisclosure ?? '주가해부실의 독자적 해설'}</strong><p>{publicItem.disclaimer}</p>{publicItem.verification ? <small>작성 {publicItem.authoringTime} · 팩트체크 완료 {publicItem.factCheckedAt} · 작성자 검증 완료</small> : null}</aside>
      </main>
    </div>
  );
}

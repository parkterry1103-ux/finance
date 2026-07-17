import { useEffect, useState, type ReactNode } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { loadThreeReadsEdition } from '../content/editorial/registry.js';
import { dateIsNotFuture, isDetailVisible } from '../content/editorial/selectors.js';
import { publishedEditorialSummaryIndex } from '../content/editorial/summaries.js';
import type { EditorialArticleSource, EditorialSource, StockDissectionSummary, ThreeReadsEdition } from '../content/editorial/types.js';
import { editorialDate, editorialInternalLink, editorialPath, type EditorialNavigate } from '../components/editorial/EditorialUi.js';

function SourceRow({ source, label }: { source: EditorialSource | EditorialArticleSource; label: string }) {
  return <li><div><strong>{label}</strong><span>발행 {editorialDate(source.publishedAt.slice(0, 10))} · 접근 {editorialDate(source.accessedAt.slice(0, 10))}{'articleIdentifier' in source && source.articleIdentifier ? ` · 기사 식별자 ${source.articleIdentifier}` : ''}</span></div>{source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`${label} 새 창에서 열기`}>원문 <ExternalLink size={13} aria-hidden="true" /></a> : <span>기사 식별 정보 확인</span>}</li>;
}

export default function ThreeReadsRoute({ slug, navigation, onNavigate }: { slug: string; navigation: ReactNode; onNavigate: EditorialNavigate }) {
  const [item, setItem] = useState<ThreeReadsEdition | null | undefined>(undefined);
  useEffect(() => {
    let active = true;
    setItem(undefined);
    loadThreeReadsEdition(slug).then((loaded) => { if (active) setItem(loaded ?? null); }).catch(() => { if (active) setItem(null); });
    return () => { active = false; };
  }, [slug]);

  const today = new Date().toISOString().slice(0, 10);
  const publicItem = item && isDetailVisible(item.status) && dateIsNotFuture(item.publishedAt, today) ? item : null;
  if (item === undefined) return <div className="pick-shell editorial-shell">{navigation}<main className="editorial-route-state" role="status" aria-live="polite"><h1>오늘의 월스트리트를 불러오는 중입니다.</h1></main></div>;
  if (!publicItem) return <div className="pick-shell editorial-shell">{navigation}<main className="editorial-route-state"><h1>공개된 오늘의 월스트리트를 찾을 수 없습니다.</h1><p>세 원문의 출처와 기준일 검증을 마친 독자적 콘텐츠만 표시합니다.</p><a href="/ko/insights" onClick={editorialInternalLink('/ko/insights', onNavigate)}>리서치 목록으로 이동</a></main></div>;

  const relatedStocks = publishedEditorialSummaryIndex.filter((summary): summary is StockDissectionSummary => summary.kind === 'stock' && publicItem.relatedStockDissectionIds.includes(summary.id)).slice(0, 3);
  const relatedCompanySlugs = Array.from(new Set([...publicItem.relatedCompanySlugs, ...publicItem.reads.flatMap((read) => read.relatedCompanySlugs)])).slice(0, 3);
  return (
    <div className="pick-shell editorial-shell">
      {navigation}
      <main className="editorial-detail-main">
        <nav className="editorial-breadcrumb" aria-label="현재 위치"><a href="/ko/insights" onClick={editorialInternalLink('/ko/insights', onNavigate)}>리서치</a><span aria-hidden="true">/</span><strong>오늘의 월스트리트</strong></nav>
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
          {read.source.url ? <a href={read.source.url} target="_blank" rel="noopener noreferrer" aria-label={`${read.source.name} 원문 새 창에서 열기`}>{read.source.name} 원문 <ExternalLink size={13} aria-hidden="true" /></a> : <span className="editorial-article-identifier">{read.source.name} · 기사 식별자 {read.source.articleIdentifier}</span>}</div></article>)}</div>

        {publicItem.cashFlowTransmission?.length ? <section className="editorial-detail-section" aria-labelledby="three-cashflow-title"><div className="editorial-detail-heading"><span>05</span><h2 id="three-cashflow-title">가격과 현금흐름으로 전달되는 구조</h2></div><ol className="editorial-watch-list">{publicItem.cashFlowTransmission.map((entry) => <li key={entry}>{entry}</li>)}</ol></section> : null}
        <section className="editorial-detail-section" aria-labelledby="three-questions-title"><div className="editorial-detail-heading"><span>06</span><h2 id="three-questions-title">투자자가 확인할 변수</h2></div><ol className="editorial-watch-list">{publicItem.investorQuestions.map((question) => <li key={question}>{question}</li>)}</ol></section>
        <section className="editorial-takeaway editorial-detail-takeaway" aria-labelledby="three-takeaway-title"><span>오늘의 한 줄</span><h2 id="three-takeaway-title">{publicItem.oneLineTakeaway}</h2></section>

        {relatedStocks.length || relatedCompanySlugs.length ? <section className="editorial-detail-section" aria-labelledby="three-related-title"><div className="editorial-detail-heading"><span>07</span><h2 id="three-related-title">관련 해부와 기업</h2></div><div className="editorial-related-links">{relatedStocks.map((related) => { const path = editorialPath(related); return <a key={related.id} href={path} onClick={editorialInternalLink(path, onNavigate)}>{related.headline}<ArrowRight size={14} aria-hidden="true" /></a>; })}{relatedCompanySlugs.map((companySlug) => <a key={companySlug} href={`/ko/companies/${encodeURIComponent(companySlug)}`} onClick={editorialInternalLink(`/ko/companies/${encodeURIComponent(companySlug)}`, onNavigate)}>{companySlug} 기업 분석 보기<ArrowRight size={14} aria-hidden="true" /></a>)}</div></section> : null}

        <section className="editorial-detail-section" aria-labelledby="three-sources-title"><div className="editorial-detail-heading"><span>08</span><h2 id="three-sources-title">주요 출처</h2></div><ol className="editorial-source-list">{publicItem.reads.map((read) => <SourceRow key={read.id} source={read.source} label={`${read.source.name} · ${read.headline}`} />)}</ol></section>

        {publicItem.methodology ? <details className="editorial-methodology"><summary>선정·검증 방법 보기</summary><div><section><h2>뉴스 탐색 범위</h2><p>{publicItem.methodology.newsWindow}</p></section><section><h2>최근 14일 중복 검사</h2><p>{publicItem.methodology.duplicateCheck}</p></section><section><h2>후보 기사 선정 점수</h2><p>{publicItem.methodology.candidateSelection}</p></section><section><h2>기사별 팩트체크 요약</h2><ul>{publicItem.methodology.factCheckSummary.map((entry) => <li key={entry}>{entry}</li>)}</ul></section><section><h2>수정한 표현</h2><ul>{publicItem.methodology.correctedExpressions.map((entry) => <li key={entry}>{entry}</li>)}</ul></section><section><h2>Not Yet Final</h2><ul>{publicItem.methodology.notYetFinal.map((entry) => <li key={entry}>{entry}</li>)}</ul></section><section><h2>가격 기준일·시각</h2><ul>{publicItem.methodology.priceBasis.map((entry) => <li key={entry}>{entry}</li>)}</ul></section><section><h2>원문 및 공식 교차검증 자료</h2>{publicItem.reads.map((read) => <div key={read.id} className="editorial-method-sources"><h3>{read.headline}</h3><ol className="editorial-source-list"><SourceRow source={read.source} label={`${read.source.name} 원문`} />{read.officialSources?.map((source) => <SourceRow key={source.id} source={source} label={source.name} />)}</ol></div>)}</section></div></details> : null}

        <aside className="editorial-independent-disclosure"><strong>{publicItem.independentDisclosure ?? '주가해부실의 독자적 해설'}</strong><p>{publicItem.disclaimer}</p>{publicItem.verification ? <small>작성 {publicItem.authoringTime} · 팩트체크 완료 {publicItem.factCheckedAt} · 작성자 검증 완료</small> : null}</aside>
      </main>
    </div>
  );
}

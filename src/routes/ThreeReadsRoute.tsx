import { useEffect, useState, type ReactNode } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { loadThreeReadsEdition } from '../content/editorial/registry.js';
import { dateIsNotFuture, isDetailVisible } from '../content/editorial/selectors.js';
import { publishedEditorialSummaryIndex } from '../content/editorial/summaries.js';
import type { StockDissectionSummary, ThreeReadsEdition } from '../content/editorial/types.js';
import { editorialDate, editorialInternalLink, editorialPath, type EditorialNavigate } from '../components/editorial/EditorialUi.js';

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
  if (item === undefined) return <div className="pick-shell editorial-shell">{navigation}<main className="editorial-route-state" role="status" aria-live="polite"><h1>3Reads를 불러오는 중입니다.</h1></main></div>;
  if (!publicItem) return <div className="pick-shell editorial-shell">{navigation}<main className="editorial-route-state"><h1>공개된 3Reads를 찾을 수 없습니다.</h1><p>세 원문의 출처와 기준일 검증을 마친 콘텐츠만 표시합니다.</p><a href="/ko/insights" onClick={editorialInternalLink('/ko/insights', onNavigate)}>리서치 목록으로 이동</a></main></div>;

  const relatedStocks = publishedEditorialSummaryIndex.filter((summary): summary is StockDissectionSummary => summary.kind === 'stock' && publicItem.relatedStockDissectionIds.includes(summary.id)).slice(0, 3);
  const relatedCompanySlugs = Array.from(new Set([...publicItem.relatedCompanySlugs, ...publicItem.reads.flatMap((read) => read.relatedCompanySlugs)])).slice(0, 3);
  return (
    <div className="pick-shell editorial-shell">
      {navigation}
      <main className="editorial-detail-main">
        <nav className="editorial-breadcrumb" aria-label="현재 위치"><a href="/ko/insights" onClick={editorialInternalLink('/ko/insights', onNavigate)}>리서치</a><span aria-hidden="true">/</span><strong>3Reads</strong></nav>
        <header className="editorial-detail-header editorial-three-detail-header"><p>오늘의 3Reads · <time dateTime={publicItem.contentAsOf}>{editorialDate(publicItem.contentAsOf)}</time></p><h1>{publicItem.centralQuestion}</h1>{publicItem.introduction ? <span>{publicItem.introduction}</span> : null}</header>
        <div className="editorial-read-list">{publicItem.reads.map((read) => <article key={read.id} className="editorial-read"><div className="editorial-read-order">{read.order < 10 ? `0${read.order}` : read.order}</div><div><p>{['첫 번째', '두 번째', '세 번째'][read.order - 1]} 뉴스</p><h2>{read.headline}</h2><dl><div><dt>무슨 일이 있었나</dt><dd>{read.whatHappened}</dd></div><div><dt>왜 중요한가</dt><dd>{read.whyItMatters}</dd></div><div><dt>구조적 의미</dt><dd>{read.structuralMeaning}</dd></div>{read.investorCaution ? <div><dt>주의해서 볼 점</dt><dd>{read.investorCaution}</dd></div> : null}</dl>{read.watchItems?.length ? <div className="editorial-read-watch"><strong>다음 확인</strong><ul>{read.watchItems.map((watch) => <li key={watch}>{watch}</li>)}</ul></div> : null}<a href={read.source.url} target="_blank" rel="noopener noreferrer" aria-label={`${read.source.name} 원문 새 창에서 열기`}>{read.source.name} 원문 <ExternalLink size={13} aria-hidden="true" /></a></div></article>)}</div>
        <section className="editorial-detail-section" aria-labelledby="three-common-title"><div className="editorial-detail-heading"><span>04</span><h2 id="three-common-title">세 뉴스의 공통점</h2></div><p className="editorial-lead-copy">{publicItem.commonThread}</p></section>
        <section className="editorial-detail-section" aria-labelledby="three-questions-title"><div className="editorial-detail-heading"><span>05</span><h2 id="three-questions-title">확인할 질문</h2></div><ol className="editorial-watch-list">{publicItem.investorQuestions.map((question) => <li key={question}>{question}</li>)}</ol></section>
        <section className="editorial-takeaway editorial-detail-takeaway" aria-labelledby="three-takeaway-title"><span>오늘의 한 줄</span><h2 id="three-takeaway-title">{publicItem.oneLineTakeaway}</h2></section>
        {relatedStocks.length || relatedCompanySlugs.length ? <section className="editorial-detail-section" aria-labelledby="three-related-title"><div className="editorial-detail-heading"><span>06</span><h2 id="three-related-title">관련 해부와 기업</h2></div><div className="editorial-related-links">{relatedStocks.map((related) => { const path = editorialPath(related); return <a key={related.id} href={path} onClick={editorialInternalLink(path, onNavigate)}>{related.headline}<ArrowRight size={14} aria-hidden="true" /></a>; })}{relatedCompanySlugs.map((companySlug) => <a key={companySlug} href={`/ko/companies/${encodeURIComponent(companySlug)}`} onClick={editorialInternalLink(`/ko/companies/${encodeURIComponent(companySlug)}`, onNavigate)}>{companySlug} 기업 분석 보기<ArrowRight size={14} aria-hidden="true" /></a>)}</div></section> : null}
        <section className="editorial-detail-section" aria-labelledby="three-sources-title"><div className="editorial-detail-heading"><span>07</span><h2 id="three-sources-title">출처</h2></div><ol className="editorial-source-list">{publicItem.reads.map((read) => <li key={read.id}><div><strong>{read.source.name} · {read.headline}</strong><span>발행 {editorialDate(read.source.publishedAt)} · 접근 {editorialDate(read.source.accessedAt)}</span></div><a href={read.source.url} target="_blank" rel="noopener noreferrer" aria-label={`${read.source.name} 원문 새 창에서 열기`}>원문 <ExternalLink size={13} aria-hidden="true" /></a></li>)}</ol></section>
        <aside className="editorial-disclaimer"><strong>면책</strong><p>{publicItem.disclaimer}</p></aside>
      </main>
    </div>
  );
}

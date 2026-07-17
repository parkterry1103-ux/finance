import { useEffect, useState, type ReactNode } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { editorialSources, loadStockDissection } from '../content/editorial/registry.js';
import { dateIsNotFuture, formatRelativeReturn, formatSignedPercent, isDetailVisible, moveCharacterLabels, relativeReturn, thesisImpactLabels } from '../content/editorial/selectors.js';
import { publishedEditorialSummaryIndex } from '../content/editorial/summaries.js';
import type { DailyStockDissection, ThreeReadsSummary } from '../content/editorial/types.js';
import { editorialDate, editorialInternalLink, editorialPath, type EditorialNavigate } from '../components/editorial/EditorialUi.js';

export default function StockDissectionRoute({ slug, navigation, onNavigate }: { slug: string; navigation: ReactNode; onNavigate: EditorialNavigate }) {
  const [item, setItem] = useState<DailyStockDissection | null | undefined>(undefined);
  useEffect(() => {
    let active = true;
    setItem(undefined);
    loadStockDissection(slug).then((loaded) => { if (active) setItem(loaded ?? null); }).catch(() => { if (active) setItem(null); });
    return () => { active = false; };
  }, [slug]);

  const today = new Date().toISOString().slice(0, 10);
  const publicItem = item && isDetailVisible(item.status) && dateIsNotFuture(item.publishedAt, today) ? item : null;
  if (item === undefined) return <div className="pick-shell editorial-shell">{navigation}<main className="editorial-route-state" role="status" aria-live="polite"><h1>주가 해부를 불러오는 중입니다.</h1></main></div>;
  if (!publicItem) return <div className="pick-shell editorial-shell">{navigation}<main className="editorial-route-state"><h1>공개된 주가 해부를 찾을 수 없습니다.</h1><p>출처와 기준일 검증을 마친 콘텐츠만 표시합니다.</p><a href="/ko/insights" onClick={editorialInternalLink('/ko/insights', onNavigate)}>리서치 목록으로 이동</a></main></div>;

  const comparisons = [publicItem.comparison?.market, publicItem.comparison?.sector].filter((value): value is NonNullable<typeof value> => Boolean(value));
  const relatedThreeReads = publishedEditorialSummaryIndex.filter((summary): summary is ThreeReadsSummary => summary.kind === 'threeReads' && publicItem.relatedThreeReadsIds.includes(summary.id)).slice(0, 3);
  const sourceIds = Array.from(new Set([publicItem.priceMove.sourceId, ...publicItem.sourceIds, ...comparisons.map((comparison) => comparison.sourceId)]));
  const sources = sourceIds.map((id) => editorialSources.find((source) => source.id === id)).filter((source): source is NonNullable<typeof source> => Boolean(source));

  return (
    <div className="pick-shell editorial-shell">
      {navigation}
      <main className="editorial-detail-main">
        <nav className="editorial-breadcrumb" aria-label="현재 위치"><a href="/ko/insights" onClick={editorialInternalLink('/ko/insights', onNavigate)}>리서치</a><span aria-hidden="true">/</span><strong>주가 해부</strong></nav>
        <header className="editorial-detail-header"><p>{publicItem.company.name}{publicItem.company.ticker ? ` · ${publicItem.company.ticker}` : ''}</p><h1>{publicItem.headline}</h1><div><time dateTime={publicItem.eventAsOf}>사건 기준 {editorialDate(publicItem.eventAsOf)}</time><time dateTime={publicItem.priceAsOf}>주가 기준 {editorialDate(publicItem.priceAsOf)}</time></div></header>

        <section className="editorial-detail-section editorial-price-section" aria-labelledby="stock-move-title"><div className="editorial-detail-heading"><span>01</span><h2 id="stock-move-title">주가 움직임과 비교</h2></div><div className="editorial-price-panel"><div><span>{publicItem.priceMove.periodLabel}</span><strong>{formatSignedPercent(publicItem.priceMove.value)}</strong></div>{comparisons.map((comparison) => <div key={comparison.name}><span>{comparison.name} 대비</span><strong>{formatRelativeReturn(relativeReturn(publicItem.priceMove.value, comparison.value))}</strong><small>같은 기준일의 퍼센트포인트 차이</small></div>)}</div></section>
        <section className="editorial-detail-section" aria-labelledby="stock-catalyst-title"><div className="editorial-detail-heading"><span>02</span><h2 id="stock-catalyst-title">직접적인 계기</h2></div><p className="editorial-lead-copy">{publicItem.directCatalyst}</p></section>
        <section className="editorial-detail-section" aria-labelledby="stock-reaction-title"><div className="editorial-detail-heading"><span>03</span><h2 id="stock-reaction-title">시장이 크게 반응한 이유</h2></div><p className="editorial-lead-copy">{publicItem.marketInterpretation}</p><div className="editorial-reason-grid">{publicItem.reasons.map((reason) => <article key={reason.title}><h3>{reason.title}</h3><p>{reason.explanation}</p></article>)}</div></section>
        <section className="editorial-detail-section" aria-labelledby="stock-certainty-title"><div className="editorial-detail-heading"><span>04</span><h2 id="stock-certainty-title">확인된 것과 아직 확인되지 않은 것</h2></div><div className="editorial-certainty-grid"><article><h3>확인된 것</h3><ul>{publicItem.confirmedItems.map((entry) => <li key={entry}>{entry}</li>)}</ul></article><article><h3>아직 확인되지 않은 것</h3><ul>{publicItem.unconfirmedItems.map((entry) => <li key={entry}>{entry}</li>)}</ul></article></div></section>
        <section className="editorial-detail-section" aria-labelledby="stock-character-title"><div className="editorial-detail-heading"><span>05</span><h2 id="stock-character-title">이번 움직임의 성격</h2></div><div className="editorial-character-panel"><strong>{moveCharacterLabels[publicItem.moveCharacter]}</strong><p>{thesisImpactLabels[publicItem.thesisImpact]}</p></div></section>
        <section className="editorial-detail-section" aria-labelledby="stock-factors-title"><div className="editorial-detail-heading"><span>06</span><h2 id="stock-factors-title">시장 전체 요인과 기업 고유 요인</h2></div><div className="editorial-factor-grid">{publicItem.marketWideFactors.length ? <article><h3>시장 전체 요인</h3><ul>{publicItem.marketWideFactors.map((entry) => <li key={entry}>{entry}</li>)}</ul></article> : null}{publicItem.companySpecificFactors.length ? <article><h3>기업 고유 요인</h3><ul>{publicItem.companySpecificFactors.map((entry) => <li key={entry}>{entry}</li>)}</ul></article> : null}</div></section>
        <section className="editorial-detail-section" aria-labelledby="stock-watch-title"><div className="editorial-detail-heading"><span>07</span><h2 id="stock-watch-title">앞으로 확인할 것</h2></div><ol className="editorial-watch-list">{publicItem.watchItems.map((entry) => <li key={entry}>{entry}</li>)}</ol></section>

        {relatedThreeReads.length || publicItem.company.companySlug ? <section className="editorial-detail-section" aria-labelledby="stock-related-title"><div className="editorial-detail-heading"><span>08</span><h2 id="stock-related-title">관련 콘텐츠와 기업</h2></div><div className="editorial-related-links">{relatedThreeReads.map((related) => { const path = editorialPath(related); return <a key={related.id} href={path} onClick={editorialInternalLink(path, onNavigate)}>{related.centralQuestion}<ArrowRight size={14} aria-hidden="true" /></a>; })}{publicItem.company.companySlug ? <a href={`/ko/companies/${encodeURIComponent(publicItem.company.companySlug)}`} onClick={editorialInternalLink(`/ko/companies/${encodeURIComponent(publicItem.company.companySlug)}`, onNavigate)}>{publicItem.company.name} 기업 분석 보기<ArrowRight size={14} aria-hidden="true" /></a> : null}</div></section> : null}
        {sources.length ? <section className="editorial-detail-section" aria-labelledby="stock-sources-title"><div className="editorial-detail-heading"><span>09</span><h2 id="stock-sources-title">출처</h2></div><ol className="editorial-source-list">{sources.map((source) => <li key={source.id}><div><strong>{source.name}</strong><span>발행 {editorialDate(source.publishedAt)} · 접근 {editorialDate(source.accessedAt)}</span></div><a href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`${source.name} 원문 새 창에서 열기`}>원문 <ExternalLink size={13} aria-hidden="true" /></a></li>)}</ol></section> : null}
        <aside className="editorial-disclaimer"><strong>면책</strong><p>{publicItem.disclaimer}</p></aside>
      </main>
    </div>
  );
}

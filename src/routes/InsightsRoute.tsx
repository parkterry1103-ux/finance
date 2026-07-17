import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { publishedEditorialSummaryIndex } from '../content/editorial/summaries.js';
import { StockSummaryCard, ThreeReadsSummaryCard, editorialInternalLink, type EditorialNavigate } from '../components/editorial/EditorialUi.js';

export default function InsightsRoute({ navigation, onNavigate }: { navigation: ReactNode; onNavigate: EditorialNavigate }) {
  const stockItems = publishedEditorialSummaryIndex.filter((item) => item.kind === 'stock');
  const threeReadsItems = publishedEditorialSummaryIndex.filter((item) => item.kind === 'threeReads');
  const companySlugs = Array.from(new Set(publishedEditorialSummaryIndex.flatMap((item) => item.kind === 'stock' ? item.company.companySlug ? [item.company.companySlug] : [] : item.relatedCompanySlugs))).slice(0, 8);
  return (
    <div className="pick-shell editorial-shell">
      {navigation}
      <main className="editorial-main">
        <header className="editorial-page-header"><p>Research Archive</p><h1>오늘의 해부와 3Reads</h1><span>확인된 출처와 기준일이 있는 콘텐츠만 게시합니다.</span></header>
        <section className="editorial-list-section" aria-labelledby="insights-stock-title"><div className="editorial-section-heading"><p>Stock Dissection</p><h2 id="insights-stock-title">최근 주가 해부</h2></div>{stockItems.length ? <div className="editorial-stock-grid">{stockItems.map((item) => <StockSummaryCard item={item} onNavigate={onNavigate} compact key={item.id} />)}</div> : <div className="editorial-empty-state"><h3>오늘의 해부를 준비하고 있습니다.</h3><p>새로운 시장 사건을 기업의 사업·재무·가치평가와 연결해 확인한 뒤 게시합니다.</p></div>}</section>
        <section className="editorial-list-section" aria-labelledby="insights-three-title"><div className="editorial-section-heading"><p>Three Reads</p><h2 id="insights-three-title">최근 3Reads</h2></div>{threeReadsItems.length ? <div className="editorial-three-grid">{threeReadsItems.map((item) => <ThreeReadsSummaryCard item={item} onNavigate={onNavigate} compact key={item.id} />)}</div> : <div className="editorial-empty-state"><h3>오늘의 3Reads를 준비하고 있습니다.</h3><p>서로 다른 세 뉴스를 하나의 투자 질문으로 연결합니다.</p></div>}</section>
        {companySlugs.length ? <section className="editorial-list-section" aria-labelledby="insights-companies-title"><div className="editorial-section-heading"><p>Related Companies</p><h2 id="insights-companies-title">관련 기업</h2></div><div className="editorial-company-links">{companySlugs.map((slug) => <a key={slug} href={`/ko/companies/${encodeURIComponent(slug)}`} onClick={editorialInternalLink(`/ko/companies/${encodeURIComponent(slug)}`, onNavigate)}>{slug} 기업 분석 <ArrowRight size={14} aria-hidden="true" /></a>)}</div></section> : null}
      </main>
    </div>
  );
}

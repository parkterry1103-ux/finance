import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { publishedEditorialSummaryIndex } from '../content/editorial/summaries.js';
import { publishedSummariesByKind } from '../content/editorial/selectors.js';
import { StockSummaryCard, ThreeReadsSummaryCard, editorialInternalLink, type EditorialNavigate } from '../components/editorial/EditorialUi.js';

type ArchiveTab = 'stock' | 'wall-street';

function tabFromSearch(search: string): ArchiveTab {
  return new URLSearchParams(search).get('tab') === 'wall-street' ? 'wall-street' : 'stock';
}

function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase('ko-KR');
}

export default function InsightsRoute({
  navigation,
  onNavigate,
  search = '',
}: {
  navigation: ReactNode;
  onNavigate: EditorialNavigate;
  search?: string;
}) {
  const [activeTab, setActiveTab] = useState<ArchiveTab>(() => tabFromSearch(search));
  const [query, setQuery] = useState('');
  const stockItems = useMemo(() => publishedSummariesByKind(publishedEditorialSummaryIndex, 'stock'), []);
  const threeReadsItems = useMemo(() => publishedSummariesByKind(publishedEditorialSummaryIndex, 'threeReads'), []);
  const normalizedQuery = normalizeSearch(query);
  const filteredStockItems = useMemo(() => stockItems.filter((item) => {
    if (!normalizedQuery) return true;
    return normalizeSearch(item.company.name).includes(normalizedQuery)
      || normalizeSearch(item.company.ticker ?? '').includes(normalizedQuery);
  }), [normalizedQuery, stockItems]);

  useEffect(() => {
    setActiveTab(tabFromSearch(search));
  }, [search]);

  const selectTab = (tab: ArchiveTab, path: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    setActiveTab(tab);
    editorialInternalLink(path, onNavigate)(event);
  };

  return (
    <div className="pick-shell editorial-shell">
      {navigation}
      <main className="editorial-main">
        <header className="editorial-page-header">
          <p>Research Archive</p>
          <h1>콘텐츠 보관함</h1>
          <span>발행일과 분석 기준을 분리해 기록한 주가해부와 월스트리트 리서치입니다.</span>
        </header>

        <nav className="editorial-archive-tabs" role="tablist" aria-label="콘텐츠 종류">
          <a
            id="archive-tab-stock"
            role="tab"
            aria-selected={activeTab === 'stock'}
            aria-controls="archive-panel-stock"
            tabIndex={0}
            href="/ko/insights?tab=stock"
            onClick={selectTab('stock', '/ko/insights?tab=stock')}
          >
            주가해부 <span>{stockItems.length}</span>
          </a>
          <a
            id="archive-tab-wall-street"
            role="tab"
            aria-selected={activeTab === 'wall-street'}
            aria-controls="archive-panel-wall-street"
            tabIndex={0}
            href="/ko/insights?tab=wall-street"
            onClick={selectTab('wall-street', '/ko/insights?tab=wall-street')}
          >
            월스트리트 <span>{threeReadsItems.length}</span>
          </a>
        </nav>

        <section
          id="archive-panel-stock"
          className="editorial-list-section editorial-archive-panel"
          role="tabpanel"
          aria-labelledby="archive-tab-stock"
          hidden={activeTab !== 'stock'}
        >
          <div className="editorial-archive-toolbar">
            <div>
              <p>Stock Dissection</p>
              <h2>주가해부 전체 보기</h2>
            </div>
            <label className="editorial-archive-search">
              <span>기업명 또는 종목코드 검색</span>
              <span className="editorial-archive-search-field">
                <Search size={18} aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  placeholder="예: Intel 또는 INTC"
                  onChange={(event) => setQuery(event.target.value)}
                  aria-describedby="archive-stock-result-count"
                />
                {query ? <button type="button" onClick={() => setQuery('')} aria-label="검색어 지우기"><X size={17} aria-hidden="true" /></button> : null}
              </span>
            </label>
          </div>
          <p id="archive-stock-result-count" className="editorial-archive-result-count" role="status" aria-live="polite">
            {normalizedQuery ? `검색 결과 ${filteredStockItems.length}건` : `전체 ${stockItems.length}건`}
          </p>
          {filteredStockItems.length
            ? <div className="editorial-stock-grid">{filteredStockItems.map((item) => <StockSummaryCard item={item} onNavigate={onNavigate} compact key={item.id} />)}</div>
            : <div className="editorial-empty-state"><h3>검색 결과가 없습니다.</h3><p>기업명이나 종목코드를 다시 확인해 주세요.</p><button type="button" onClick={() => setQuery('')}>검색어 지우기</button></div>}
        </section>

        <section
          id="archive-panel-wall-street"
          className="editorial-list-section editorial-archive-panel"
          role="tabpanel"
          aria-labelledby="archive-tab-wall-street"
          hidden={activeTab !== 'wall-street'}
        >
          <div className="editorial-section-heading">
            <p>One Question · Three Cases</p>
            <h2>월스트리트 전체 보기</h2>
          </div>
          {threeReadsItems.length
            ? <div className="editorial-three-grid">{threeReadsItems.map((item) => <ThreeReadsSummaryCard item={item} onNavigate={onNavigate} compact key={item.id} />)}</div>
            : <div className="editorial-empty-state"><h3>월스트리트를 준비하고 있습니다.</h3><p>세 개의 뉴스, 하나의 투자 질문으로 연결합니다.</p></div>}
        </section>
      </main>
    </div>
  );
}

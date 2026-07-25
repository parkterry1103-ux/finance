import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { companySearchIndex, companySearchRecordPath, searchCompanyProfiles } from '../../content/company-profiles/search.js';
import { publishedEditorialSummaryIndex } from '../../content/editorial/summaries.js';
import { latestPublishedSummary } from '../../content/editorial/selectors.js';
import type { CompanySearchRecord } from '../../content/company-profiles/types.js';
import { StockSummaryCard, ThreeReadsSummaryCard, editorialInternalLink, type EditorialNavigate } from './EditorialUi.js';
import { trackAnalyticsEvent } from '../../analytics/index.js';

export function NewsroomHome({ navigation, onNavigate }: { navigation: ReactNode; onNavigate: EditorialNavigate }) {
  const listboxId = useId();
  const listboxRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const results = useMemo(() => searchCompanyProfiles(query).slice(0, 5), [query]);
  const hasQuery = Boolean(query.trim());
  const stockItem = latestPublishedSummary(publishedEditorialSummaryIndex, 'stock');
  const threeReadsItem = latestPublishedSummary(publishedEditorialSummaryIndex, 'threeReads');

  useEffect(() => {
    if (activeIndex >= results.length) setActiveIndex(-1);
  }, [activeIndex, results.length]);

  useEffect(() => {
    if (activeIndex < 0) return;
    listboxRef.current?.querySelector<HTMLElement>(`[data-home-option="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const openCompany = (record: CompanySearchRecord, resultPosition: number) => {
    setOpen(false);
    trackAnalyticsEvent('company_search_select', { companySlug: record.profile.slug, resultPosition, placement: 'home', destinationType: 'company' });
    onNavigate(companySearchRecordPath(record));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && results.length) {
      event.preventDefault(); setOpen(true); setActiveIndex((current) => current < results.length - 1 ? current + 1 : 0);
    } else if (event.key === 'ArrowUp' && results.length) {
      event.preventDefault(); setOpen(true); setActiveIndex((current) => current > 0 ? current - 1 : results.length - 1);
    } else if (event.key === 'Enter' && results.length) {
      event.preventDefault();
      const selectedIndex = activeIndex >= 0 ? activeIndex : 0;
      openCompany(results[selectedIndex], selectedIndex + 1);
    } else if (event.key === 'Escape') {
      event.preventDefault(); setOpen(false); setActiveIndex(-1);
    }
  };

  return (
    <div className="home-shell editorial-home" id="top">
      {navigation}
      <main>
        <section className="editorial-home-hero" aria-labelledby="editorial-home-title">
          <div className="editorial-home-hero-copy">
            <p>Stock Autopsy · Daily Research</p>
            <h1 id="editorial-home-title"><span>오늘 주가가 움직인 이유와</span><span>다음에 확인할 것을 해부합니다.</span></h1>
          </div>
          <form className="editorial-home-search" role="search" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="editorial-home-search-input">기업 찾기</label>
            <div className="editorial-home-combobox">
              <Search size={21} aria-hidden="true" />
              <input
                id="editorial-home-search-input"
                type="search"
                value={query}
                placeholder="기업명 또는 종목코드를 검색해보세요"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={open && hasQuery && results.length > 0}
                aria-controls={listboxId}
                aria-activedescendant={open && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
                aria-describedby="editorial-home-search-help editorial-home-search-status"
                autoComplete="off"
                onChange={(event) => { setQuery(event.target.value); setOpen(Boolean(event.target.value.trim())); setActiveIndex(-1); }}
                onFocus={() => { if (hasQuery) setOpen(true); }}
                onBlur={() => setOpen(false)}
                onKeyDown={handleKeyDown}
              />
              <div className="editorial-home-search-results" id={listboxId} ref={listboxRef} role="listbox" aria-label="기업 검색 제안" hidden={!open || !hasQuery || results.length === 0}>
                {results.map((record, index) => {
                  const path = companySearchRecordPath(record);
                  const security = record.profile.stockCode ?? record.company.ticker;
                  return <a
                    id={`${listboxId}-${index}`}
                    data-home-option={index}
                    key={record.profile.slug}
                    href={path}
                    role="option"
                    tabIndex={-1}
                    aria-selected={activeIndex === index}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => { event.preventDefault(); openCompany(record, index + 1); }}
                  ><span><strong>{record.company.name}</strong><small>{security} · {record.profile.exchange} · {record.profile.industry}</small><em>{record.profile.searchDescription}</em></span><span>기업 해부 보기<ArrowRight size={14} aria-hidden="true" /></span></a>;
                })}
              </div>
              <p className="editorial-home-search-no-result" hidden={!open || !hasQuery || results.length > 0}>현재 분석 중인 기업에서는 찾지 못했습니다.</p>
            </div>
            <p id="editorial-home-search-help">현재 지원 기업 {companySearchIndex.length}개에서 기업명·티커·종목코드·별칭으로 찾습니다.</p>
            <p id="editorial-home-search-status" className="editorial-sr-status" role="status" aria-live="polite">{hasQuery ? results.length ? `검색 결과 ${results.length}개` : '현재 분석 중인 기업에서는 찾지 못했습니다.' : ''}</p>
          </form>
        </section>

        <section className="editorial-home-section" id="today-dissections" aria-labelledby="today-stock-title">
          <div className="editorial-section-heading"><p>Latest Stock Dissection</p><h2 id="today-stock-title">오늘의 주가해부</h2><a href="/ko/insights?tab=stock" onClick={editorialInternalLink('/ko/insights?tab=stock', onNavigate)}>지난 주가해부 보기 <ArrowRight size={15} aria-hidden="true" /></a></div>
          {stockItem ? <div className="editorial-stock-grid"><StockSummaryCard item={stockItem} onNavigate={onNavigate} /></div> : <div className="editorial-empty-state"><h3>오늘의 해부를 준비하고 있습니다.</h3><p>새로운 시장 사건을 기업의 사업·재무·가치평가와 연결해 확인한 뒤 게시합니다.</p></div>}
        </section>

        <section className="editorial-home-section editorial-home-three" aria-labelledby="today-three-title">
          <div className="editorial-section-heading"><p>Latest Wall Street Edition</p><h2 id="today-three-title">오늘의 월스트리트</h2><a href="/ko/insights?tab=wall-street" onClick={editorialInternalLink('/ko/insights?tab=wall-street', onNavigate)}>지난 월스트리트 보기 <ArrowRight size={15} aria-hidden="true" /></a></div>
          {threeReadsItem ? <ThreeReadsSummaryCard item={threeReadsItem} onNavigate={onNavigate} /> : <div className="editorial-empty-state"><h3>오늘의 월스트리트를 준비하고 있습니다.</h3><p>세 개의 뉴스, 하나의 투자 질문으로 연결합니다.</p></div>}
        </section>

      </main>
      <footer className="editorial-home-footer">
        <div><strong>주가해부실</strong><p>표시된 내용은 정보 제공을 위한 리서치이며 투자 권유가 아닙니다.</p></div>
        <nav aria-label="보조 탐색"><a href="/ko/reports" onClick={editorialInternalLink('/ko/reports', onNavigate)}>데이터 기준 및 방법론</a><a href="/ko/macro-dashboard" onClick={editorialInternalLink('/ko/macro-dashboard', onNavigate)}>시장 환경</a></nav>
      </footer>
    </div>
  );
}

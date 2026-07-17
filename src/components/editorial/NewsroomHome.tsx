import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { companySearchIndex, companySearchRecordPath, searchCompanyProfiles } from '../../content/company-profiles/search.js';
import { publishedEditorialSummaryIndex } from '../../content/editorial/summaries.js';
import type { CompanySearchRecord } from '../../content/company-profiles/types.js';
import { StockSummaryCard, ThreeReadsSummaryCard, editorialInternalLink, type EditorialNavigate } from './EditorialUi.js';

export function NewsroomHome({ navigation, onNavigate }: { navigation: ReactNode; onNavigate: EditorialNavigate }) {
  const listboxId = useId();
  const listboxRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const results = useMemo(() => searchCompanyProfiles(query).slice(0, 5), [query]);
  const hasQuery = Boolean(query.trim());
  const stockItems = publishedEditorialSummaryIndex.filter((item) => item.kind === 'stock').slice(0, 3);
  const threeReadsItems = publishedEditorialSummaryIndex.filter((item) => item.kind === 'threeReads').slice(0, 1);

  useEffect(() => {
    if (activeIndex >= results.length) setActiveIndex(-1);
  }, [activeIndex, results.length]);

  useEffect(() => {
    if (activeIndex < 0) return;
    listboxRef.current?.querySelector<HTMLElement>(`[data-home-option="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const openCompany = (record: CompanySearchRecord) => {
    setOpen(false);
    onNavigate(companySearchRecordPath(record));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && results.length) {
      event.preventDefault(); setOpen(true); setActiveIndex((current) => current < results.length - 1 ? current + 1 : 0);
    } else if (event.key === 'ArrowUp' && results.length) {
      event.preventDefault(); setOpen(true); setActiveIndex((current) => current > 0 ? current - 1 : results.length - 1);
    } else if (event.key === 'Enter' && results.length) {
      event.preventDefault(); openCompany(results[activeIndex >= 0 ? activeIndex : 0]);
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
            <p>뉴스를 기업의 사업·재무·가치평가로 연결합니다.</p>
          </div>
          <form className="editorial-home-search" role="search" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="editorial-home-search-input">기업 찾기</label>
            <div className="editorial-home-combobox">
              <Search size={21} aria-hidden="true" />
              <input
                id="editorial-home-search-input"
                type="search"
                value={query}
                placeholder="기업명이나 종목코드를 검색하세요"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={open && hasQuery && results.length > 0}
                aria-controls={listboxId}
                aria-activedescendant={open && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
                aria-describedby="editorial-home-search-help editorial-home-search-status"
                autoComplete="off"
                spellCheck={false}
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
                    onClick={(event) => { event.preventDefault(); openCompany(record); }}
                  ><span><strong>{record.company.name}</strong><small>{record.profile.englishName}</small></span><span>{security} · {record.profile.exchange}<ArrowRight size={14} aria-hidden="true" /></span></a>;
                })}
              </div>
              <p className="editorial-home-search-no-result" hidden={!open || !hasQuery || results.length > 0}>현재 분석 중인 기업에서는 찾지 못했습니다.</p>
            </div>
            <p id="editorial-home-search-help">현재 지원 기업 {companySearchIndex.length}개에서 기업명·티커·종목코드·별칭으로 찾습니다.</p>
            <p id="editorial-home-search-status" className="editorial-sr-status" role="status" aria-live="polite">{hasQuery ? results.length ? `검색 결과 ${results.length}개` : '현재 분석 중인 기업에서는 찾지 못했습니다.' : ''}</p>
          </form>
        </section>

        <section className="editorial-home-section" id="today-dissections" aria-labelledby="today-stock-title">
          <div className="editorial-section-heading"><p>Daily Stock Dissection</p><h2 id="today-stock-title">오늘의 주가 해부</h2><a href="/ko/insights" onClick={editorialInternalLink('/ko/insights', onNavigate)}>전체 리서치 <ArrowRight size={15} aria-hidden="true" /></a></div>
          {stockItems.length ? <div className="editorial-stock-grid">{stockItems.map((item) => <StockSummaryCard item={item} onNavigate={onNavigate} key={item.id} />)}</div> : <div className="editorial-empty-state"><h3>오늘의 해부를 준비하고 있습니다.</h3><p>새로운 시장 사건을 기업의 사업·재무·가치평가와 연결해 확인한 뒤 게시합니다.</p></div>}
        </section>

        <section className="editorial-home-section editorial-home-three" aria-labelledby="today-three-title">
          <div className="editorial-section-heading"><p>One Question · Three Cases</p><h2 id="today-three-title">오늘의 월스트리트</h2></div>
          {threeReadsItems.length ? threeReadsItems.map((item) => <ThreeReadsSummaryCard item={item} onNavigate={onNavigate} key={item.id} />) : <div className="editorial-empty-state"><h3>오늘의 월스트리트를 준비하고 있습니다.</h3><p>세 개의 뉴스, 하나의 투자 질문으로 연결합니다.</p></div>}
        </section>

        <section className="editorial-company-cta" aria-labelledby="editorial-company-cta-title">
          <div><p>Company Research</p><h2 id="editorial-company-cta-title">오늘의 사건을 기업의 긴 흐름으로 이어 보세요.</h2><span>지원 기업의 사업 구조, 재무, 가치평가와 다음 확인 항목을 살펴봅니다.</span></div>
          <a href="/ko/companies" onClick={editorialInternalLink('/ko/companies', onNavigate)}>기업 찾기 <ArrowRight size={16} aria-hidden="true" /></a>
        </section>
      </main>
      <footer className="editorial-home-footer">
        <div><strong>주가해부실</strong><p>표시된 내용은 정보 제공을 위한 리서치이며 투자 권유가 아닙니다.</p></div>
        <nav aria-label="보조 탐색"><a href="/ko/reports" onClick={editorialInternalLink('/ko/reports', onNavigate)}>데이터 기준 및 방법론</a><a href="/ko/macro-dashboard" onClick={editorialInternalLink('/ko/macro-dashboard', onNavigate)}>시장 환경</a></nav>
      </footer>
    </div>
  );
}

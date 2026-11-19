import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { companySearchIndex, companySearchRecordPath, searchCompanyProfiles } from '../../content/company-profiles/search.js';
import { publishedEditorialSummaryIndex } from '../../content/editorial/summaries.js';
import { latestPublishedSummary, publishedSummariesByKind } from '../../content/editorial/selectors.js';
import type { CompanySearchRecord } from '../../content/company-profiles/types.js';
import { StockSummaryCard, editorialDate, editorialInternalLink, editorialPath, type EditorialNavigate } from './EditorialUi.js';
import { trackAnalyticsEvent } from '../../analytics/index.js';
import { practiceCaseSummaries } from '../../content/investment-thinking/practice.js';

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
  const practice = practiceCaseSummaries.find((entry) => entry.id === stockItem?.id);
  const otherStocks = publishedSummariesByKind(publishedEditorialSummaryIndex, 'stock')
    .filter((entry) => entry.company.ticker !== stockItem?.company.ticker).slice(0, 2);

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
            <p>뉴스와 시장</p>
            <h1 id="editorial-home-title"><span>무슨 일이 있었고,</span><span>시장은 왜 움직였을까요?</span></h1>
            <p>기업의 발표부터 시장과 산업의 흐름까지, 근거를 따라 살펴봅니다.</p>
          </div>
          {stockItem ? <article className="thinking-lab-home-pilot" id="thinking-lab">
            <div><span>주가 움직임 분석</span><time dateTime={stockItem.priceAsOf}>분석 기준 {editorialDate(stockItem.priceAsOf)}</time></div>
            <h2>{stockItem.headline}</h2>
            <p>{stockItem.directCatalyst}</p>
            <a href={editorialPath(stockItem)} onClick={editorialInternalLink(editorialPath(stockItem), onNavigate)}>분석 읽기 <ArrowRight size={16} aria-hidden="true" /></a>
            {practice ? <a className="thinking-practice-records-link" href={practice.path} onClick={editorialInternalLink(practice.path, onNavigate)}>내 생각 기록하기 <ArrowRight size={15} aria-hidden="true" /></a> : null}
          </article> : null}
        </section>

        <section className="editorial-home-section editorial-home-company-search" aria-labelledby="home-company-search-title">
          <div className="editorial-section-heading"><p>기업 리서치</p><h2 id="home-company-search-title">기업의 사업과 숫자 확인</h2></div>
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
          <div className="editorial-section-heading"><p>분석 기록</p><h2 id="today-stock-title">다른 기업의 주가 움직임</h2><a href="/ko/insights?tab=stock" onClick={editorialInternalLink('/ko/insights?tab=stock', onNavigate)}>전체 분석 보기 <ArrowRight size={15} aria-hidden="true" /></a></div>
          <p className="editorial-archive-note">각 글은 표시된 기준일의 분석 기록입니다. 이후 시장 변화는 자동 반영하지 않습니다.</p>
          <div className="editorial-stock-grid">{otherStocks.map((entry) => <StockSummaryCard key={entry.id} item={entry} onNavigate={onNavigate} compact />)}</div>
        </section>

        <section className="editorial-home-section editorial-home-three" aria-labelledby="today-three-title">
          <div className="editorial-section-heading"><p>경제 뉴스 해설</p><h2 id="today-three-title">여러 뉴스를 하나의 질문으로</h2><a href="/ko/insights?tab=wall-street" onClick={editorialInternalLink('/ko/insights?tab=wall-street', onNavigate)}>해설 보관함 <ArrowRight size={15} aria-hidden="true" /></a></div>
          {threeReadsItem ? <article className="editorial-card editorial-three-card"><p className="editorial-card-basis"><time dateTime={threeReadsItem.contentAsOf}>{editorialDate(threeReadsItem.contentAsOf)} 분석</time></p><h3>{threeReadsItem.title}</h3><p className="editorial-three-question">{threeReadsItem.centralQuestion}</p><div className="editorial-card-actions"><a href={editorialPath(threeReadsItem)} onClick={editorialInternalLink(editorialPath(threeReadsItem), onNavigate)}>해설 읽기 <ArrowRight size={15} aria-hidden="true" /></a></div></article> : null}
        </section>

      </main>
      <footer className="editorial-home-footer">
        <div><strong>주가해부실</strong><p>표시된 내용은 정보 제공을 위한 리서치이며 투자 권유가 아닙니다.</p></div>
        <nav aria-label="보조 탐색"><a href="/ko/reports" onClick={editorialInternalLink('/ko/reports', onNavigate)}>공식 자료 모음</a><a href="/ko/demand-supply" onClick={editorialInternalLink('/ko/demand-supply', onNavigate)}>산업 연결 구조</a></nav>
      </footer>
    </div>
  );
}

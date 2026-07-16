import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowRight, ExternalLink, FileSearch, Network, Search, ShieldAlert } from 'lucide-react';
import {
  companyEventStageLabels,
  companyEventTypeLabels,
} from '../../content/company-events/index.js';
import { companyProfileRelationTypeLabels } from '../../content/company-profile-relations/index.js';
import { companySearchRecordPath, searchCompanyProfiles } from '../../content/company-profiles/search.js';
import type { CompanyResearchProfileViewModel, CompanySearchRecord } from '../../content/company-profiles/types.js';
import { sourceRegistry } from '../../content/sources/index.js';
import { bottleneckStatusLabels, bottleneckTrendLabels } from '../../content/bottlenecks/index.js';
import { priceDirection, priceDisplay } from '../../services/prices.js';
import { IndustryFlowCard } from '../industry-flows/IndustryFlowCard.js';

type Navigate = (path: string) => void;

type SharedProps = {
  navigation: ReactNode;
  onNavigate: Navigate;
};

function internalLink(path: string, onNavigate: Navigate) {
  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onNavigate(path);
  };
}

function formatDate(value: string) {
  return value ? value.replace(/-/g, '.') : '확인 제한';
}

function CompanyProfileMonogram({ profile }: { profile: CompanyResearchProfileViewModel }) {
  return <span className="company-profile-monogram" aria-hidden="true">{profile.company.name.replace(/[^A-Za-z0-9가-힣]/g, '').slice(0, 2).toUpperCase()}</span>;
}

export function CompanyProfilesListPage({
  companies,
  initialQuery,
  navigation,
  onNavigate,
}: SharedProps & { companies: CompanySearchRecord[]; initialQuery: string }) {
  const listboxId = useId();
  const listboxRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const results = useMemo(() => searchCompanyProfiles(query), [query]);
  const hasQuery = Boolean(query.trim());

  useEffect(() => {
    setQuery(initialQuery);
    setAutocompleteOpen(false);
    setActiveIndex(-1);
  }, [initialQuery]);

  useEffect(() => {
    if (activeIndex >= results.length) setActiveIndex(-1);
  }, [activeIndex, results.length]);

  useEffect(() => {
    if (activeIndex < 0) return;
    listboxRef.current
      ?.querySelector<HTMLElement>(`[data-option-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const updateQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    setActiveIndex(-1);
    setAutocompleteOpen(Boolean(nextQuery.trim()));
    const url = new URL(window.location.href);
    if (nextQuery.trim()) url.searchParams.set('q', nextQuery);
    else url.searchParams.delete('q');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  };

  const openCompany = (record: CompanySearchRecord) => {
    setAutocompleteOpen(false);
    onNavigate(companySearchRecordPath(record));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && results.length) {
      event.preventDefault();
      setAutocompleteOpen(true);
      setActiveIndex((current) => current < results.length - 1 ? current + 1 : 0);
    } else if (event.key === 'ArrowUp' && results.length) {
      event.preventDefault();
      setAutocompleteOpen(true);
      setActiveIndex((current) => current > 0 ? current - 1 : results.length - 1);
    } else if (event.key === 'Enter' && results.length) {
      event.preventDefault();
      openCompany(results[activeIndex >= 0 ? activeIndex : 0]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setAutocompleteOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="pick-shell company-profiles-shell">
      {navigation}
      <main className="company-profiles-main">
        <section className="company-profiles-hero" aria-labelledby="company-profiles-title">
          <h1 id="company-profiles-title">기업 분석</h1>
          <p>기업명이나 종목코드를 검색하세요.</p>
        </section>

        {companies.length ? (
          <>
            <form className="company-search-form" role="search" onSubmit={(event) => event.preventDefault()}>
              <label htmlFor="company-search-input">기업 검색</label>
              <div className="company-search-combobox">
                <Search size={20} aria-hidden="true" />
                <input
                  id="company-search-input"
                  type="search"
                  value={query}
                  placeholder="기업명, 티커 또는 종목코드 검색"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={autocompleteOpen && results.length > 0}
                  aria-controls={listboxId}
                  aria-activedescendant={autocompleteOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
                  aria-describedby="company-search-help"
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(event) => updateQuery(event.target.value)}
                  onFocus={() => { if (hasQuery && results.length) setAutocompleteOpen(true); }}
                  onBlur={() => setAutocompleteOpen(false)}
                  onKeyDown={handleKeyDown}
                />
                <div
                  className="company-search-autocomplete"
                  id={listboxId}
                  ref={listboxRef}
                  role="listbox"
                  aria-label="기업 검색 제안"
                  hidden={!autocompleteOpen || results.length === 0}
                >
                    {results.map((record, index) => {
                      const path = companySearchRecordPath(record);
                      const security = record.profile.stockCode ?? record.company.ticker;
                      return (
                        <a
                          id={`${listboxId}-option-${index}`}
                          key={record.profile.slug}
                          data-option-index={index}
                          href={path}
                          role="option"
                          tabIndex={-1}
                          aria-selected={activeIndex === index}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={(event) => { event.preventDefault(); openCompany(record); }}
                        >
                          <span><strong>{record.company.name}</strong><small>{record.profile.englishName}</small></span>
                          <span>{security} · {record.profile.exchange}<ArrowRight size={15} aria-hidden="true" /></span>
                        </a>
                      );
                    })}
                </div>
              </div>
              <p id="company-search-help">한국어·영문 기업명, 티커, 종목코드와 일반적인 별칭으로 찾을 수 있습니다.</p>
            </form>

            <div className="company-search-status-row">
              <strong>{hasQuery ? `검색 결과 ${results.length}개` : `현재 지원 기업 ${companies.length}개`}</strong>
              {hasQuery ? <span>입력한 검색어와 일치하는 지원 기업입니다.</span> : <span>현재 분석 페이지를 제공하는 기업입니다.</span>}
            </div>
            <p className="company-search-live" role="status" aria-live="polite" aria-atomic="true">
              {hasQuery
                ? results.length ? `검색 결과 ${results.length}개가 있습니다.` : '검색 결과가 없습니다.'
                : `현재 지원 기업 ${companies.length}개를 표시합니다.`}
            </p>

            {results.length ? (
              <section className="company-profile-list-grid" aria-label={hasQuery ? `검색 결과 ${results.length}개` : `지원 기업 ${companies.length}개`}>
                {results.map((record) => {
                  const path = companySearchRecordPath(record);
                  const security = record.profile.stockCode ?? record.company.ticker;
                  return (
                    <article className="company-profile-list-card" key={record.profile.id}>
                      <div className="company-profile-list-identity">
                        <div>
                          <h2>{record.company.name}</h2>
                          <p>{record.profile.englishName}</p>
                        </div>
                      </div>
                      <p className="company-profile-list-security">{security} <span aria-hidden="true">·</span> {record.profile.exchange}</p>
                      <p className="company-profile-list-industry">{record.profile.industry}</p>
                      <p className="company-profile-list-description">{record.profile.searchDescription}</p>
                      <a className="company-profile-list-cta" href={path} aria-label={`${record.company.name} 기업 분석 보기`} onClick={internalLink(path, onNavigate)}>
                        기업 분석 보기 <ArrowRight size={15} aria-hidden="true" />
                      </a>
                    </article>
                  );
                })}
              </section>
            ) : (
              <section className="company-search-empty" aria-labelledby="company-search-empty-title">
                <h2 id="company-search-empty-title">검색 결과가 없습니다.</h2>
                <p>현재 지원하는 기업명, 티커 또는 종목코드로 다시 검색해 주세요.</p>
                <button type="button" onClick={() => updateQuery('')}>전체 기업 보기</button>
              </section>
            )}
          </>
        ) : (
          <section className="company-search-empty" aria-labelledby="company-search-registry-empty-title">
            <h2 id="company-search-registry-empty-title">현재 표시할 수 있는 기업이 없습니다.</h2>
          </section>
        )}
      </main>
    </div>
  );
}

export function CompanyProfileNotFoundPage({ navigation, onNavigate }: SharedProps) {
  return (
    <div className="pick-shell company-profiles-shell">
      {navigation}
      <main className="company-profile-not-found">
        <h1>해당 기업을 찾을 수 없습니다.</h1>
        <p>기업 목록에서 다시 선택해 주세요.</p>
        <div>
          <a href="/ko/companies" onClick={internalLink('/ko/companies', onNavigate)}>기업 분석으로 이동</a>
          <a href="/ko/demand-supply" onClick={internalLink('/ko/demand-supply', onNavigate)}>수요와 공급 보기</a>
        </div>
      </main>
    </div>
  );
}

export function CompanyResearchProfilePage({
  viewModel,
  navigation,
  onNavigate,
}: SharedProps & { viewModel: CompanyResearchProfileViewModel }) {
  const { company, profile } = viewModel;
  const direction = priceDirection(viewModel.price);
  const price = direction === 'pending' ? undefined : priceDisplay(viewModel.price);
  const primaryFlow = viewModel.industryFlows[0];
  const primarySource = viewModel.sources[0];
  return (
    <div className="pick-shell company-profiles-shell company-profile-detail-shell">
      {navigation}
      <main className="company-profile-detail-main">
        <nav className="company-profile-breadcrumb" aria-label="현재 위치">
          <a href="/ko/companies" onClick={internalLink('/ko/companies', onNavigate)}>기업 분석</a><span aria-hidden="true">/</span><strong>{company.name}</strong>
        </nav>

        <section className="company-profile-identity-hero" aria-labelledby="company-profile-title">
          <CompanyProfileMonogram profile={viewModel} />
          <div className="company-profile-identity-copy">
            <span>{company.countryLabel} · {company.ticker}</span>
            <h1 id="company-profile-title">{company.name}</h1>
            <strong>{profile.primaryRole}</strong>
            <p>{profile.beginnerSummary}</p>
            <small>최근 검토 {formatDate(profile.reviewedAt)}</small>
            <div className="company-profile-hero-actions">
              {primaryFlow ? <a href={`/ko/demand-supply?industry=${encodeURIComponent(primaryFlow.flow.demandSupplyIds[0] ?? '')}`} onClick={internalLink(`/ko/demand-supply?industry=${encodeURIComponent(primaryFlow.flow.demandSupplyIds[0] ?? '')}`, onNavigate)}>수요와 공급 배경 보기 <ArrowRight size={14} aria-hidden="true" /></a> : null}
              {primarySource ? <a href={primarySource.url} target="_blank" rel="noopener noreferrer">공식 자료 보기 <ExternalLink size={14} aria-hidden="true" /></a> : null}
            </div>
          </div>
          {price ? (
            <aside className={`company-profile-price direction-${direction}`} aria-label={`${company.name} 가격 보조 정보`}>
              <span>{price.status}</span><strong>{price.amount}</strong>
              <em>{direction === 'up' ? '▲' : direction === 'down' ? '▼' : '—'} {price.percent || '0.00%'}</em>
              <small>{viewModel.price?.asOf ?? '기준 시각 확인 제한'}</small>
            </aside>
          ) : null}
        </section>

        <section className="company-profile-section company-profile-business" aria-labelledby="company-business-title">
          <div className="company-profile-section-heading"><span>사업과 역할</span><h2 id="company-business-title">이 회사는 무엇을 하나요?</h2></div>
          <p>{profile.businessDescription}</p>
          <div className="company-profile-business-details">
            <article><h3>산업 역할</h3><strong>{profile.primaryRole}</strong></article>
            {viewModel.products.length ? <article><h3>주요 제품·서비스</h3><ul>{viewModel.products.map((product) => <li key={product}>{product}</li>)}</ul></article> : null}
          </div>
        </section>

        <section className="company-profile-section" aria-labelledby="company-flow-title">
          <div className="company-profile-section-heading"><span>산업 연결</span><h2 id="company-flow-title">산업 흐름에서 어디에 있나요?</h2><p>정적 산업 흐름은 기업의 역할과 앞뒤 단계를 설명하며 특정 직접 계약을 뜻하지 않습니다.</p></div>
          {viewModel.industryFlows.length ? <div className="company-profile-flow-list">{viewModel.industryFlows.map(({ flow }) => (
            <div key={flow.id}>
              <IndustryFlowCard flow={flow} variant="summary" currentCompanyId={profile.companyId} />
              <div className="company-profile-flow-actions">
                <a href={`/ko/demand-supply?industry=${encodeURIComponent(flow.demandSupplyIds[0] ?? '')}`} onClick={internalLink(`/ko/demand-supply?industry=${encodeURIComponent(flow.demandSupplyIds[0] ?? '')}`, onNavigate)}>수요와 공급 배경 보기 <ArrowRight size={14} aria-hidden="true" /></a>
                {flow.reportIds[0] ? <a href={`/ko/reports/${encodeURIComponent(flow.reportIds[0])}`} onClick={internalLink(`/ko/reports/${encodeURIComponent(flow.reportIds[0])}`, onNavigate)}>관련 산업 리포트 보기 <ArrowRight size={14} aria-hidden="true" /></a> : null}
              </div>
            </div>
          ))}</div> : <p className="company-profile-empty-copy">현재 연결된 정적 산업 흐름이 없습니다. 공식 자료에 근거한 기업 역할 설명은 계속 제공합니다.</p>}
        </section>

        <section className="company-profile-section" aria-labelledby="company-events-title">
          <div className="company-profile-section-heading"><span>공식 사실</span><h2 id="company-events-title">최근 공식적으로 밝힌 변화</h2></div>
          {viewModel.companyEvents.length ? <div className="company-profile-event-grid">{viewModel.companyEvents.map((event) => {
            const source = sourceRegistry[event.sourceRefs[0]];
            return (
              <article key={event.id}>
                <div><time dateTime={event.eventDate}>{formatDate(event.eventDate)}</time><span>{companyEventTypeLabels[event.eventType]} · {companyEventStageLabels[event.stage]}</span></div>
                <h3>{event.title}</h3><p><strong>확인된 사실</strong>{event.factualSummary}</p><p><strong>왜 확인할 변화인가</strong>{event.whyItMatters}</p>
                <details><summary>앞으로 확인할 것</summary><ul>{event.nextCheckpoints.map((checkpoint) => <li key={checkpoint}>{checkpoint}</li>)}</ul></details>
                {source ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher} 공식 원문 <ExternalLink size={13} aria-hidden="true" /></a> : null}
              </article>
            );
          })}</div> : <p className="company-profile-empty-copy">현재 등록된 검토 이벤트가 없습니다. 공식 공시와 기업 발표를 추가 확인할 예정입니다.</p>}
        </section>

        <section className="company-profile-section" aria-labelledby="company-demand-title">
          <div className="company-profile-section-heading"><span>산업 배경</span><h2 id="company-demand-title">수요와 공급 배경</h2><p>이 기업과 함께 살펴볼 산업 배경입니다. 해당 기업의 실적이나 시장 가격을 직접 의미하지는 않습니다.</p></div>
          <div className="company-profile-demand-grid">
            {viewModel.demandSupply.map((entry) => {
              const bottleneck = viewModel.bottlenecks.find((item) => item.id === entry.bottleneckId);
              return <article key={entry.id}><span>수요·공급</span><h3>{entry.title}</h3><p><strong>수요 배경</strong>{entry.demandContext}</p><p><strong>공급 상태</strong>{bottleneck ? `${bottleneckStatusLabels[bottleneck.status]} · ${bottleneckTrendLabels[bottleneck.trend]}` : entry.supplyContext}</p>{bottleneck ? <p><strong>완화 신호</strong>{bottleneck.reliefSignals[0]}</p> : null}<small>검토일 {formatDate(bottleneck?.reviewedAt ?? '')}</small></article>;
            })}
            {viewModel.bottlenecks.filter((bottleneck) => !viewModel.demandSupply.some((entry) => entry.bottleneckId === bottleneck.id)).map((bottleneck) => (
              <article key={bottleneck.id}><span>공급망 병목</span><h3>{bottleneck.shortTitle}</h3><p>{bottleneck.summary}</p><p><strong>공급 추세</strong>{bottleneckTrendLabels[bottleneck.trend]}</p><small>검토일 {formatDate(bottleneck.reviewedAt)}</small></article>
            ))}
          </div>
        </section>

        <section className="company-profile-section" aria-labelledby="company-relations-title">
          <div className="company-profile-section-heading"><span>산업 맥락</span><h2 id="company-relations-title">같이 볼 기업</h2><p>같은 수요나 생산·인프라 단계를 이해하기 위한 참고입니다. 직접 계약이나 기업 순위를 뜻하지 않습니다.</p></div>
          {viewModel.companyRelations.length ? <div className="company-profile-relation-grid">{viewModel.companyRelations.map(({ relation, company: related, companyPath }) => {
            const evidence = sourceRegistry[relation.sourceRefs[0]];
            return (
            <article key={`${relation.companyId}-${relation.relatedCompanyId}`}>
              <div><Network size={18} aria-hidden="true" /><span>{related.countryLabel} · {related.ticker || 'ticker 확인 제한'}</span></div><h3>{related.name}</h3>
              <div className="company-profile-relation-badges"><span>{companyProfileRelationTypeLabels[relation.relationType]}</span></div>
              <p>{relation.explanation}</p><small>산업 맥락 참고이며 직접 계약을 의미하지 않습니다.</small>
              <div className="company-profile-relation-actions"><a href={companyPath} onClick={internalLink(companyPath, onNavigate)}>기업 보기</a>{evidence ? <a href={evidence.url} target="_blank" rel="noopener noreferrer">공식 근거 보기</a> : null}</div>
            </article>
          );})}</div> : <p className="company-profile-empty-copy">현재 함께 볼 기업 reference가 없습니다. 직접 관계를 임의로 만들지 않습니다.</p>}
        </section>

        {viewModel.picks.length ? <section className="company-profile-section" aria-labelledby="company-pick-title">
          <div className="company-profile-section-heading"><span>편집 관점</span><h2 id="company-pick-title">관련 Pick</h2></div>
          {viewModel.picks.map((pick) => <article className="company-profile-pick-card" key={pick.id}><FileSearch size={20} aria-hidden="true" /><span>{formatDate(pick.publishedAt ?? '')} 검토</span><h3>{pick.title}</h3><p>{pick.reasonSummary}</p><a href={`/ko/picks/${encodeURIComponent(pick.id)}`} onClick={internalLink(`/ko/picks/${encodeURIComponent(pick.id)}`, onNavigate)}>Pick 자세히 보기 <ArrowRight size={14} aria-hidden="true" /></a></article>)}
        </section> : null}

        {viewModel.verifiedMetrics.length ? <section className="company-profile-section" aria-labelledby="company-metrics-title">
          <div className="company-profile-section-heading"><span>공식 수치</span><h2 id="company-metrics-title">현재 확인 가능한 숫자</h2></div>
          <div className="company-profile-metric-grid">{viewModel.verifiedMetrics.map((metric) => <article key={`${metric.reportId}-${metric.label}`}><span>{metric.label}</span><strong>{metric.value}</strong><p>{metric.context}</p><small>{metric.asOf ? `${metric.asOf} · ` : ''}{metric.reportTitle}</small></article>)}</div>
        </section> : null}

        <section className="company-profile-section" aria-labelledby="company-sources-title">
          <div className="company-profile-section-heading"><span>판단 근거</span><h2 id="company-sources-title">관련 보고서·공식 자료</h2></div>
          <div className="company-profile-resource-grid">
            {viewModel.reports.map((report) => <a key={report.id} href={`/ko/reports/${encodeURIComponent(report.slug)}`} onClick={internalLink(`/ko/reports/${encodeURIComponent(report.slug)}`, onNavigate)}><span>{report.publisher}</span><strong>{report.titleKo}</strong><small>산업 보고서 보기 <ArrowRight size={13} aria-hidden="true" /></small></a>)}
            {viewModel.sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer"><span>{source.publisher} · 공식 자료</span><strong>{source.title}</strong><small>외부 원문 <ExternalLink size={13} aria-hidden="true" /></small></a>)}
          </div>
        </section>

        <section className="company-profile-caution" aria-labelledby="company-caution-title">
          <ShieldAlert size={21} aria-hidden="true" />
          <div><span>주의사항</span><h2 id="company-caution-title">사실과 산업 맥락을 나눠 봅니다</h2><p>이 페이지는 기업의 산업 역할과 공식 발표를 연결해 이해하기 위한 자료입니다.</p><p>관련 기업 reference는 같은 수요·생산·인프라 맥락을 설명하며 특정 직접 계약을 의미하지 않습니다.</p><p>기업의 공식 발표는 향후 실적이나 시장 가격을 보장하지 않습니다.</p><p>가격은 정보 제공용이며 투자 판단이나 추천이 아닙니다.</p><strong>{profile.caution}</strong></div>
        </section>
      </main>
    </div>
  );
}

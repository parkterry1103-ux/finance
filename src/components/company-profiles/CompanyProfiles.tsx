import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowRight, ExternalLink, FileSearch, Network, Search, ShieldAlert } from 'lucide-react';
import {
  companyEventStageLabels,
  companyEventTypeLabels,
} from '../../content/company-events/index.js';
import { companyProfileRelationTypeLabels } from '../../content/company-profile-relations/index.js';
import { companySearchRecordPath, searchCompanyProfiles } from '../../content/company-profiles/search.js';
import type {
  CompanyAssessmentState,
  CompanyResearchProfileViewModel,
  CompanySearchRecord,
  DashboardChart,
  DashboardMetric,
} from '../../content/company-profiles/types.js';
import type { CompanyBrief, CompanyBriefQuestionKey } from '../../content/company-briefs/types.js';
import { sourceRegistry } from '../../content/sources/index.js';
import { bottleneckStatusLabels, bottleneckTrendLabels } from '../../content/bottlenecks/index.js';
import { IndustryFlowCard } from '../industry-flows/IndustryFlowCard.js';
import { moveCharacterLabels } from '../../content/editorial/selectors.js';
import { publishedEditorialSummaryIndex } from '../../content/editorial/summaries.js';

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

const companyBriefQuestionKeys: CompanyBriefQuestionKey[] = ['revenueEngine', 'recentChange', 'whyItMatters', 'keyRisk', 'watchNext'];

const companyBriefQuestionLabels: Record<CompanyBriefQuestionKey, string> = {
  revenueEngine: '돈을 버는 구조',
  recentChange: '최근 변화',
  whyItMatters: '왜 중요한가',
  keyRisk: '가장 큰 위험',
  watchNext: '다음 확인',
};

const companyBriefQuestionNumbers: Record<CompanyBriefQuestionKey, string> = {
  revenueEngine: '01',
  recentChange: '02',
  whyItMatters: '03',
  keyRisk: '04',
  watchNext: '05',
};

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

export function CompanyBriefLoadingPage({
  viewModel,
  navigation,
  onNavigate,
  failed = false,
}: SharedProps & { viewModel: CompanyResearchProfileViewModel; failed?: boolean }) {
  const { company, profile } = viewModel;
  const security = profile.stockCode ?? company.ticker;
  return <div className="pick-shell company-profiles-shell company-profile-detail-shell">
    {navigation}
    <main className="company-profile-detail-main company-dashboard-main">
      <nav className="company-profile-breadcrumb" aria-label="현재 위치"><a href="/ko/companies" onClick={internalLink('/ko/companies', onNavigate)}>기업 분석</a><span aria-hidden="true">/</span><strong>{company.name}</strong></nav>
      <header className="company-dashboard-header" aria-labelledby="company-profile-loading-title">
        <CompanyProfileMonogram profile={viewModel} />
        <div><span className="company-dashboard-kicker">{company.countryLabel} 기업 분석</span><h1 id="company-profile-loading-title">{company.name}</h1><p className="company-dashboard-security">{security} <span aria-hidden="true">·</span> {profile.exchange}</p><p role="status">{failed ? '검증된 핵심 판단을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.' : '검증된 핵심 판단을 불러오는 중입니다.'}</p></div>
      </header>
    </main>
  </div>;
}

export function CompanyResearchProfilePage({
  viewModel,
  brief,
  navigation,
  onNavigate,
}: SharedProps & { viewModel: CompanyResearchProfileViewModel; brief: CompanyBrief }) {
  const { company, profile } = viewModel;
  const { dashboard } = viewModel;
  const security = profile.stockCode ?? company.ticker;
  const relatedEditorialIds = new Set(brief.relatedEditorialIds);
  const recentEditorial = publishedEditorialSummaryIndex.filter((item) => relatedEditorialIds.has(item.id)).slice(0, 2);
  return (
    <div className="pick-shell company-profiles-shell company-profile-detail-shell">
      {navigation}
      <main className="company-profile-detail-main company-dashboard-main">
        <nav className="company-profile-breadcrumb" aria-label="현재 위치">
          <a href="/ko/companies" onClick={internalLink('/ko/companies', onNavigate)}>기업 분석</a><span aria-hidden="true">/</span><strong>{company.name}</strong>
        </nav>

        <header className="company-dashboard-header" aria-labelledby="company-profile-title">
          <CompanyProfileMonogram profile={viewModel} />
          <div>
            <span className="company-dashboard-kicker">{company.countryLabel} 기업 분석</span>
            <h1 id="company-profile-title">{company.name}</h1>
            <p className="company-dashboard-english-name">{profile.englishName}</p>
            <p className="company-dashboard-security">{security} <span aria-hidden="true">·</span> {profile.exchange} <span aria-hidden="true">·</span> {profile.industry}</p>
            <p className="company-dashboard-description">{brief.oneLineBusiness}</p>
            <p className="company-dashboard-asof">분석 기준 <time dateTime={brief.asOf}>{formatDate(brief.asOf)}</time></p>
          </div>
        </header>

        <section className="company-brief-section" aria-labelledby="company-brief-title">
          <div className="company-dashboard-section-heading"><span>1분 핵심 판단</span><h2 id="company-brief-title">기업을 이해하는 다섯 질문</h2><p>공식 자료에 근거한 현재 판단이며, 다음 공시에서 달라질 수 있습니다.</p></div>
          <div className="company-brief-grid">
            {companyBriefQuestionKeys.map((key) => {
              const answer = brief.questions[key];
              const source = sourceRegistry[answer.sourceIds[0]];
              const headingId = `company-brief-${key}`;
              return <article className={key === 'revenueEngine' ? 'company-brief-card company-brief-card--lead' : 'company-brief-card'} key={key} aria-labelledby={headingId}>
                <span>{companyBriefQuestionNumbers[key]}</span>
                <h3 id={headingId}>{companyBriefQuestionLabels[key]}</h3>
                <p>{answer.summary}</p>
                <footer>
                  {answer.asOf ? <time dateTime={answer.asOf}>기준 {formatDate(answer.asOf)}</time> : <span>분석 기준 {formatDate(brief.asOf)}</span>}
                  {source ? <a href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`${companyBriefQuestionLabels[key]} 근거 · ${source.publisher} 원문`}>{source.publisher} 근거 <ExternalLink size={12} aria-hidden="true" /></a> : null}
                </footer>
              </article>;
            })}
          </div>
        </section>

        <section className="company-brief-metrics" aria-labelledby="company-brief-metrics-title">
          <div className="company-dashboard-section-heading"><span>핵심 숫자</span><h2 id="company-brief-metrics-title">비교와 함께 보는 숫자</h2><p>첫 화면에는 사업 구조에 중요한 공식 수치만 최대 3개 표시합니다.</p></div>
          <div className="company-brief-metric-grid">
            {brief.keyMetrics.map((item) => {
              const source = sourceRegistry[item.sourceId];
              return <article key={item.id}>
                <span>{item.label}</span>
                <strong>{item.formattedValue}</strong>
                <small>{item.period} <span aria-hidden="true">·</span> {item.unit}</small>
                {item.comparison ? <dl className="company-brief-comparison">
                  {item.comparison.formattedReferenceValue ? <div><dt>{item.comparison.label}</dt><dd>{item.comparison.formattedReferenceValue}</dd></div> : null}
                  {item.comparison.formattedDifference ? <div><dt>변화</dt><dd>{item.comparison.formattedDifference}</dd></div> : null}
                  {item.comparison.referencePeriod ? <div><dt>비교 기간</dt><dd>{item.comparison.referencePeriod}</dd></div> : null}
                </dl> : <p className="company-brief-no-comparison">직접 비교 자료 없음</p>}
                <p>{item.interpretation}</p>
                {source ? <a href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`${item.label} 자료 출처 · ${source.publisher} 원문`}>{source.publisher} 원문 <ExternalLink size={12} aria-hidden="true" /></a> : null}
              </article>;
            })}
          </div>
        </section>

        {recentEditorial.length ? <section className="company-dashboard-section company-dashboard-editorial" aria-labelledby="company-editorial-title">
          <div className="company-dashboard-section-heading"><span>최근 리서치</span><h2 id="company-editorial-title">최근 관련 해부</h2><p>이 기업과 직접 연결된 최신 편집 콘텐츠입니다.</p></div>
          <div className="company-dashboard-editorial-grid">{recentEditorial.map((item) => {
            const path = item.kind === 'stock' ? `/ko/insights/stock/${encodeURIComponent(item.slug)}` : `/ko/insights/3reads/${encodeURIComponent(item.slug)}`;
            return <article key={item.id}><time dateTime={item.kind === 'stock' ? item.eventAsOf : item.publishedAt}>{formatDate(item.kind === 'stock' ? item.eventAsOf : item.publishedAt)}</time><h3>{item.kind === 'stock' ? item.headline : item.centralQuestion}</h3><p>{item.kind === 'stock' ? item.cardCharacter ?? moveCharacterLabels[item.moveCharacter] : item.commonThread}</p>{item.kind === 'stock' && item.unconfirmedItems[0] ? <div className="company-dashboard-editorial-unconfirmed"><strong>현재까지 공식 확인되지 않은 것</strong><span>{item.unconfirmedItems.slice(0, 3).join(' · ')}</span></div> : null}<a href={path} onClick={internalLink(path, onNavigate)}>전체 해부 읽기 <ArrowRight size={14} aria-hidden="true" /></a></article>;
          })}</div>
        </section> : null}

        <nav className="company-brief-actions" aria-label={`${company.name} 상세 분석 이동`}>
          <a href={`/ko/companies/${profile.slug}/financials`} onClick={internalLink(`/ko/companies/${profile.slug}/financials`, onNavigate)}>숫자와 비교 보기 <ArrowRight size={15} aria-hidden="true" /></a>
          {brief.reportSlug ? <a href={`/ko/companies/${brief.reportSlug}/report`} onClick={internalLink(`/ko/companies/${brief.reportSlug}/report`, onNavigate)}>심층 리포트 읽기 <ArrowRight size={15} aria-hidden="true" /></a> : null}
        </nav>

        <section className="company-dashboard-section company-dashboard-secondary-start" id="company-detailed-data" aria-labelledby="company-assessments-title">
          <div className="company-dashboard-section-heading"><span>핵심 판단</span><h2 id="company-assessments-title">현재 상태를 먼저 봅니다</h2><p>점수 대신 확인된 근거와 데이터 한계를 함께 표시합니다.</p></div>
          <div className="company-dashboard-assessment-grid">
            {dashboard.assessments.map((item) => <article key={item.dimension}>
              <div><span>{item.label}</span><strong className={`state-${item.state}`}>{assessmentStateLabels[item.state]}</strong></div>
              <p>{item.rationale}</p>
            </article>)}
          </div>
        </section>

        <section className="company-dashboard-section" aria-labelledby="company-dashboard-metrics-title">
          <div className="company-dashboard-section-heading"><span>핵심 숫자</span><h2 id="company-dashboard-metrics-title">지금 확인 가능한 숫자</h2><p>기간·통화·단위가 확인된 공식 값만 표시합니다.</p></div>
          <div className="company-dashboard-metric-grid">
            {dashboard.metrics.map((item) => {
              const source = sourceRegistry[item.sourceIds[0]];
              return <article key={item.id}>
                <span>{item.label}</span>
                <strong>{item.formattedValue}</strong>
                <small>{item.period} <span aria-hidden="true">·</span> {item.unit}{item.currency ? ` · ${item.currency}` : ''}</small>
                <p>{item.description}</p>
                <div className="company-dashboard-metric-meta">
                  <span>{item.comparison ? `${item.comparison.label} ${item.comparison.formattedValue}` : '이전 기간 비교 없음'}</span>
                  {source ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher} 원문 <ExternalLink size={12} aria-hidden="true" /></a> : null}
                </div>
              </article>;
            })}
          </div>
        </section>

        {dashboard.charts.length ? <section className="company-dashboard-section" aria-labelledby="company-dashboard-charts-title">
          <div className="company-dashboard-section-heading"><span>핵심 차트</span><h2 id="company-dashboard-charts-title">같은 기준의 숫자만 비교합니다</h2><p>통화나 회계 기간이 다른 값은 한 차트에 섞지 않습니다.</p></div>
          <div className="company-dashboard-chart-grid">{dashboard.charts.map((chart) => <DashboardBarChart key={chart.id} chart={chart} metrics={dashboard.metrics} />)}</div>
        </section> : null}

        <section className="company-dashboard-section" aria-labelledby="company-dashboard-changes-title">
          <div className="company-dashboard-section-heading"><span>지금 중요한 변화</span><h2 id="company-dashboard-changes-title">무엇이 달라졌고, 다음에 무엇을 볼까요?</h2></div>
          <div className="company-dashboard-change-list">
            {dashboard.importantChanges.map((item, index) => {
              const source = sourceRegistry[item.sourceIds[0]];
              return <article key={item.id}>
                <div className="company-dashboard-change-index" aria-hidden="true">{index + 1}</div>
                <div>
                  <div className="company-dashboard-change-meta"><time dateTime={item.eventDate}>{formatDate(item.eventDate)}</time><span>{item.stageLabel}</span></div>
                  <h3>{item.title}</h3>
                  <p><strong>무슨 일이 있었나</strong>{item.whatHappened}</p>
                  <p><strong>왜 중요한가</strong>{item.whyItMatters}</p>
                  <p><strong>다음 확인</strong>{item.nextCheckpoints.join(' · ')}</p>
                  {source ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher} 공식 원문 <ExternalLink size={13} aria-hidden="true" /></a> : null}
                </div>
              </article>;
            })}
          </div>
        </section>

        <section className="company-dashboard-section" aria-labelledby="company-dashboard-macro-title">
          <div className="company-dashboard-section-heading"><span>주요 거시 변수</span><h2 id="company-dashboard-macro-title">기업 밖에서 함께 볼 변수</h2><p>확정적인 인과관계가 아니라 영향을 줄 수 있는 경로를 설명합니다.</p></div>
          <div className="company-dashboard-macro-grid">
            {dashboard.macroVariables.map((item) => {
              const source = sourceRegistry[item.sourceIds[0]];
              return <article key={item.id}>
                <div><span>{item.label}</span><strong>{item.currentDirection}</strong><small>{item.trendLabel} · {formatDate(item.asOf)}</small></div>
                <ol aria-label={`${item.label} 영향 경로`}>{item.impactPath.map((step) => <li key={step}>{step}</li>)}</ol>
                <p>{item.easyExplanation}</p>
                <small><strong>추가 확인</strong>{item.nextCheck}</small>
                {source ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher} 원자료 <ExternalLink size={12} aria-hidden="true" /></a> : null}
              </article>;
            })}
          </div>
        </section>

        <details className="company-dashboard-details">
          <summary><span>상세 데이터·출처</span><small>기존 사업·산업·관계·리포트 내용을 펼쳐 봅니다.</small></summary>
          <div className="company-dashboard-detail-content">
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
                return <article key={event.id}><div><time dateTime={event.eventDate}>{formatDate(event.eventDate)}</time><span>{companyEventTypeLabels[event.eventType]} · {companyEventStageLabels[event.stage]}</span></div><h3>{event.title}</h3><p><strong>확인된 사실</strong>{event.factualSummary}</p><p><strong>왜 확인할 변화인가</strong>{event.whyItMatters}</p><details><summary>앞으로 확인할 것</summary><ul>{event.nextCheckpoints.map((checkpoint) => <li key={checkpoint}>{checkpoint}</li>)}</ul></details>{source ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher} 공식 원문 <ExternalLink size={13} aria-hidden="true" /></a> : null}</article>;
              })}</div> : <p className="company-profile-empty-copy">현재 등록된 검토 이벤트가 없습니다. 공식 공시와 기업 발표를 추가 확인할 예정입니다.</p>}
            </section>

            <section className="company-profile-section" aria-labelledby="company-demand-title">
              <div className="company-profile-section-heading"><span>산업 배경</span><h2 id="company-demand-title">수요와 공급 배경</h2><p>이 기업과 함께 살펴볼 산업 배경이며 기업 실적을 직접 의미하지 않습니다.</p></div>
              <div className="company-profile-demand-grid">
                {viewModel.demandSupply.map((entry) => {
                  const bottleneck = viewModel.bottlenecks.find((item) => item.id === entry.bottleneckId);
                  return <article key={entry.id}><span>수요·공급</span><h3>{entry.title}</h3><p><strong>수요 배경</strong>{entry.demandContext}</p><p><strong>공급 상태</strong>{bottleneck ? `${bottleneckStatusLabels[bottleneck.status]} · ${bottleneckTrendLabels[bottleneck.trend]}` : entry.supplyContext}</p>{bottleneck ? <p><strong>완화 신호</strong>{bottleneck.reliefSignals[0]}</p> : null}<small>검토일 {formatDate(bottleneck?.reviewedAt ?? '')}</small></article>;
                })}
              </div>
            </section>

            <section className="company-profile-section" aria-labelledby="company-relations-title">
              <div className="company-profile-section-heading"><span>산업 맥락</span><h2 id="company-relations-title">같이 볼 기업</h2><p>같은 수요나 생산·인프라 단계를 이해하기 위한 참고이며 직접 계약을 뜻하지 않습니다.</p></div>
              {viewModel.companyRelations.length ? <div className="company-profile-relation-grid">{viewModel.companyRelations.map(({ relation, company: related, companyPath }) => {
                const evidence = sourceRegistry[relation.sourceRefs[0]];
                return <article key={`${relation.companyId}-${relation.relatedCompanyId}`}><div><Network size={18} aria-hidden="true" /><span>{related.countryLabel} · {related.ticker || 'ticker 확인 제한'}</span></div><h3>{related.name}</h3><div className="company-profile-relation-badges"><span>{companyProfileRelationTypeLabels[relation.relationType]}</span></div><p>{relation.explanation}</p><small>산업 맥락 참고이며 직접 계약을 의미하지 않습니다.</small><div className="company-profile-relation-actions"><a href={companyPath} onClick={internalLink(companyPath, onNavigate)}>기업 보기</a>{evidence ? <a href={evidence.url} target="_blank" rel="noopener noreferrer">공식 근거 보기</a> : null}</div></article>;
              })}</div> : <p className="company-profile-empty-copy">현재 함께 볼 기업 reference가 없습니다. 직접 관계를 임의로 만들지 않습니다.</p>}
            </section>

            {viewModel.picks.length ? <section className="company-profile-section" aria-labelledby="company-pick-title"><div className="company-profile-section-heading"><span>편집 관점</span><h2 id="company-pick-title">관련 Pick</h2></div>{viewModel.picks.map((pick) => <article className="company-profile-pick-card" key={pick.id}><FileSearch size={20} aria-hidden="true" /><span>{formatDate(pick.publishedAt ?? '')} 검토</span><h3>{pick.title}</h3><p>{pick.reasonSummary}</p><a href={`/ko/picks/${encodeURIComponent(pick.id)}`} onClick={internalLink(`/ko/picks/${encodeURIComponent(pick.id)}`, onNavigate)}>Pick 자세히 보기 <ArrowRight size={14} aria-hidden="true" /></a></article>)}</section> : null}

            {viewModel.verifiedMetrics.length ? <section className="company-profile-section" aria-labelledby="company-metrics-title"><div className="company-profile-section-heading"><span>기존 공식 수치</span><h2 id="company-metrics-title">리포트에서 확인한 숫자</h2></div><div className="company-profile-metric-grid">{viewModel.verifiedMetrics.map((item) => <article key={`${item.reportId}-${item.label}`}><span>{item.label}</span><strong>{item.value}</strong><p>{item.context}</p><small>{item.asOf ? `${item.asOf} · ` : ''}{item.reportTitle}</small></article>)}</div></section> : null}

            <section className="company-profile-section" aria-labelledby="company-sources-title"><div className="company-profile-section-heading"><span>판단 근거</span><h2 id="company-sources-title">관련 보고서·공식 자료</h2></div><div className="company-profile-resource-grid">{viewModel.reports.map((report) => <a key={report.id} href={`/ko/reports/${encodeURIComponent(report.slug)}`} onClick={internalLink(`/ko/reports/${encodeURIComponent(report.slug)}`, onNavigate)}><span>{report.publisher}</span><strong>{report.titleKo}</strong><small>산업 보고서 보기 <ArrowRight size={13} aria-hidden="true" /></small></a>)}{dashboard.sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer"><span>{source.publisher} · 공식 자료</span><strong>{source.title}</strong><small>외부 원문 <ExternalLink size={13} aria-hidden="true" /></small></a>)}</div></section>

            <section className="company-profile-caution" aria-labelledby="company-caution-title"><ShieldAlert size={21} aria-hidden="true" /><div><span>데이터 품질·주의사항</span><h2 id="company-caution-title">사실과 데이터 한계를 함께 봅니다</h2>{dashboard.dataQuality.missingAreas.length ? <p>현재 부족한 영역: {dashboard.dataQuality.missingAreas.join(' · ')}</p> : null}<p>기업 관계는 산업 맥락이며 특정 직접 계약을 의미하지 않습니다.</p><p>공식 발표는 향후 실적이나 시장 가격을 보장하지 않습니다.</p><strong>{profile.caution}</strong></div></section>
          </div>
        </details>
      </main>
    </div>
  );
}

const assessmentStateLabels: Record<CompanyAssessmentState, string> = {
  improving: '개선',
  healthy: '양호',
  stable: '안정',
  slowing: '둔화',
  stretched: '부담',
  needsReview: '추가 확인 필요',
  insufficientData: '데이터 부족',
};

function DashboardBarChart({ chart, metrics }: { chart: DashboardChart; metrics: DashboardMetric[] }) {
  const chartMetrics = chart.metricIds.flatMap((id) => {
    const item = metrics.find((candidate) => candidate.id === id);
    return item && item.value !== null ? [item] : [];
  });
  const maxValue = Math.max(...chartMetrics.map((item) => Math.abs(item.value ?? 0)), 1);
  const height = Math.max(142, chartMetrics.length * 64 + 28);
  return <figure className="company-dashboard-chart-card">
    <figcaption><strong>{chart.title}</strong><span>{chart.period} · {chart.unit}{chart.currency ? ` · ${chart.currency}` : ''}</span><p>{chart.description}</p></figcaption>
    <svg viewBox={`0 0 760 ${height}`} role="img" aria-label={`${chart.title}. ${chart.accessibleSummary}`}>
      {chartMetrics.map((item, index) => {
        const y = 20 + index * 64;
        const width = Math.max(3, (Math.abs(item.value ?? 0) / maxValue) * 470);
        return <g key={item.id}>
          <text x="0" y={y + 18} className="company-dashboard-chart-label">{item.shortLabel ?? item.label}</text>
          <rect x="205" y={y} width="470" height="24" rx="7" className="company-dashboard-chart-track" />
          <rect x="205" y={y} width={width} height="24" rx="7" className={`company-dashboard-chart-bar chart-bar-${index + 1}`} />
          <text x="690" y={y + 18} className="company-dashboard-chart-value">{item.formattedValue}</text>
        </g>;
      })}
    </svg>
    <div className="sr-only"><table><caption>{chart.title} 데이터</caption><thead><tr><th>지표</th><th>값</th><th>기간</th><th>단위</th></tr></thead><tbody>{chartMetrics.map((item) => <tr key={item.id}><th>{item.label}</th><td>{item.formattedValue}</td><td>{item.period}</td><td>{item.unit}</td></tr>)}</tbody></table></div>
    <p className="company-dashboard-chart-summary">{chart.accessibleSummary}</p>
  </figure>;
}

import { useEffect, useState, type ReactNode } from 'react';
import { CheckCircle, Network } from 'lucide-react';
import {
  companies,
  smartMoneyMoves,
  type Company,
  type SmartMoneyMove,
} from '../data.js';
import {
  CompanyBriefLoadingPage,
  CompanyProfileNotFoundPage,
  CompanyProfilesListPage,
  CompanyResearchProfilePage,
} from '../components/company-profiles/CompanyProfiles.js';
import {
  buildCompanyResearchProfile,
} from '../content/company-profiles/selectors.js';
import { loadCompanyBrief } from '../content/company-briefs/registry.js';
import type { CompanyBrief } from '../content/company-briefs/types.js';
import { loadEventImpacts, type EventImpactRecord } from '../content/event-impacts/index.js';
import { companySearchIndex } from '../content/company-profiles/search.js';
import { fetchOwnershipTrades } from '../services/trades.js';

type CompanyProfilesRouteProps = {
  view?: 'profiles';
  navigation: ReactNode;
  onNavigate: (path: string) => void;
  searchQuery?: string;
  slug?: string;
};

type OwnershipRouteProps = {
  view: 'ownership';
  onHome: () => void;
  onOpenAnalysis: (company: Company, anchor?: string) => void;
  onOpenCategory: (sectorId: string, selectedCompanyId?: string) => void;
};

type FinancialLearningRouteProps = {
  view: 'financial-learning';
  onHome: () => void;
};

type CompaniesRouteProps = CompanyProfilesRouteProps | OwnershipRouteProps | FinancialLearningRouteProps;

function CompanyProfileDetailRoute({ navigation, onNavigate, slug }: Omit<CompanyProfilesRouteProps, 'slug'> & { slug: string }) {
  const profile = buildCompanyResearchProfile(slug);
  const [briefState, setBriefState] = useState<{ slug: string; brief: CompanyBrief | null; impacts: EventImpactRecord[]; failed: boolean }>({ slug: '', brief: null, impacts: [], failed: false });

  useEffect(() => {
    let cancelled = false;
    if (!profile) return () => { cancelled = true; };
    setBriefState({ slug, brief: null, impacts: [], failed: false });
    Promise.all([loadCompanyBrief(slug, profile), loadEventImpacts(slug)]).then(([brief, impacts]) => {
      if (!cancelled) setBriefState({ slug, brief, impacts, failed: !brief });
    }).catch(() => {
      if (!cancelled) setBriefState({ slug, brief: null, impacts: [], failed: true });
    });
    return () => { cancelled = true; };
  }, [slug]);

  if (!profile) return <CompanyProfileNotFoundPage navigation={navigation} onNavigate={onNavigate} />;
  if (briefState.slug !== slug || !briefState.brief) return <CompanyBriefLoadingPage viewModel={profile} navigation={navigation} onNavigate={onNavigate} failed={briefState.slug === slug && briefState.failed} />;
  return <CompanyResearchProfilePage viewModel={profile} brief={briefState.brief} eventImpacts={briefState.impacts} navigation={navigation} onNavigate={onNavigate} />;
}

function CompanyProfilesRoute({ navigation, onNavigate, searchQuery = '', slug }: CompanyProfilesRouteProps) {
  if (slug) return <CompanyProfileDetailRoute slug={slug} navigation={navigation} onNavigate={onNavigate} searchQuery={searchQuery} />;

  return <CompanyProfilesListPage companies={companySearchIndex} initialQuery={searchQuery} navigation={navigation} onNavigate={onNavigate} />;
}

const prominentInstitutionFilters = [
  'Berkshire Hathaway',
  'ARK',
  'BlackRock',
  'Goldman Sachs',
  'Vanguard',
  'State Street',
  'JPMorgan',
  'Morgan Stanley',
  'Bridgewater',
  'Citadel',
  'Renaissance',
  'Baupost',
  'Soros',
];

function cleanIdentityValue(value?: string | null) {
  return String(value ?? '').trim();
}

function countryLabelFromMarket(value?: string | null) {
  const normalized = cleanIdentityValue(value).toUpperCase();
  if (!normalized) return '';
  if (['KR', 'KRX', 'KOSPI', 'KOSDAQ', 'KONEX', '한국'].includes(normalized)) return '한국';
  if (['US', 'NASDAQ', 'NYSE', 'AMEX', 'OTC', '미국'].includes(normalized)) return '미국';
  return '';
}

function CompanyIdentity({
  companyName,
  ticker,
  countryLabel,
  size = 'card',
}: {
  companyName?: string | null;
  ticker?: string | null;
  countryLabel?: string | null;
  size?: 'compact' | 'card' | 'hero';
}) {
  const name = cleanIdentityValue(companyName) || '회사명 확인 필요';
  const normalizedTicker = cleanIdentityValue(ticker).toUpperCase();
  const displayTicker = normalizedTicker && !['WATCH', '비상장', 'PRIVATE', 'N/A', '-'].includes(normalizedTicker) ? normalizedTicker : '';
  const meta = displayTicker ? [cleanIdentityValue(countryLabel), displayTicker].filter(Boolean).join(' · ') : '비상장';
  return <span className={`company-identity company-identity--${size}`}><strong className="company-identity__name">{name}</strong>{meta ? <small className="company-identity__meta">{meta}</small> : null}</span>;
}

function isQuarterlyHoldingReport(move: SmartMoneyMove) {
  return move.action === 'holding' || move.sourceLabel.includes('13F') || move.investorType === 'fund';
}

function isCongressTradeReport(move: SmartMoneyMove) {
  return move.investorType === 'us-politician' || move.sourceLabel.toLowerCase().includes('congress');
}

function publicReportActionLabel(move: SmartMoneyMove) {
  if (isQuarterlyHoldingReport(move)) return '13F 보유 변화';
  if (isCongressTradeReport(move)) return `공개 거래 보고${move.actionLabel ? ` · ${move.actionLabel}` : ''}`;
  return move.actionLabel;
}

function publicReportDateLabel(move: SmartMoneyMove) {
  if (isQuarterlyHoldingReport(move)) return '보고 기준일';
  if (isCongressTradeReport(move)) return '보고된 거래일';
  return '거래일';
}

function publicReportDateFallback(move: SmartMoneyMove) {
  if (isQuarterlyHoldingReport(move)) return '분기 기준일 확인 필요';
  return '공개 자료에서 확인 필요';
}

function publicReportDelayNote(move: SmartMoneyMove) {
  if (isQuarterlyHoldingReport(move)) return '13F는 분기 말 기관 보유 현황이며 실제 매수·매도 시점과 차이가 있습니다.';
  if (isCongressTradeReport(move)) return '국회의원 거래는 공개된 거래 보고 기준이며 실제 매매일과 공개일이 다를 수 있습니다.';
  if (move.isDelayedDisclosure) return '공개 자료 기준이며 실제 매매 시점과 차이가 있을 수 있습니다.';
  return move.note;
}

function publicReportTypeBadge(move: SmartMoneyMove) {
  if (isQuarterlyHoldingReport(move)) return '13F 보유 보고';
  if (isCongressTradeReport(move)) return '공개 거래 보고';
  if (move.investorType === 'insider') return 'Form 4 내부자 거래';
  return move.investorTypeLabel;
}

function SourceReportAction({ move }: { move: SmartMoneyMove }) {
  if (move.sourceUrl) return <a href={move.sourceUrl} target="_blank" rel="noreferrer">출처 보기</a>;
  return <span className="source-pending-action">출처 준비 중</span>;
}

type OwnershipReportsPageProps = {
  onHome: () => void;
  onOpenAnalysis: (company: Company, anchor?: string) => void;
  onOpenCategory: (sectorId: string, selectedCompanyId?: string) => void;
};

function OwnershipReportsPage({ onHome, onOpenAnalysis, onOpenCategory }: OwnershipReportsPageProps) {
  const [sourceFilter, setSourceFilter] = useState<'all' | 'sec-13f' | 'sec-form4'>('all');
  const [investorQuery, setInvestorQuery] = useState('');
  const [tickerQuery, setTickerQuery] = useState('');
  const [items, setItems] = useState<SmartMoneyMove[]>(smartMoneyMoves);
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    const hasNarrowFilter = Boolean(investorQuery.trim() || tickerQuery.trim() || sourceFilter !== 'all');
    fetchOwnershipTrades({
      source: sourceFilter,
      investor: investorQuery.trim() || undefined,
      ticker: tickerQuery.trim() || undefined,
      limit: 50,
    }).then((rows) => {
      if (cancelled) return;
      if (rows.length) {
        setItems(rows);
        setStatus('ready');
        return;
      }
      setItems(hasNarrowFilter ? [] : smartMoneyMoves);
      setStatus(hasNarrowFilter ? 'ready' : 'fallback');
    });
    return () => {
      cancelled = true;
    };
  }, [investorQuery, sourceFilter, tickerQuery]);

  return (
    <div className="ownership-shell">
      <header className="pick-nav">
        <div className="breadcrumb" aria-label="현재 위치">
          <button type="button" onClick={onHome}>홈</button>
          <strong>기관 보유·거래 보고</strong>
        </div>
        <button type="button" className="ghost-action" onClick={onHome}>
          <Network size={15} />
          홈
        </button>
      </header>

      <main className="ownership-main">
        <section className="ownership-hero">
          <p className="home-kicker">공개 자료 기준</p>
          <h1>최근 공개된 기관 보유·내부자 거래 보고</h1>
          <p>13F는 분기 포트폴리오, Form 4는 내부자 거래 보고입니다. 한 번에 최대 50개만 보여줍니다.</p>
        </section>

        <section className="ownership-filter-panel" aria-label="기관 보유 거래 보고 필터">
          <div className="trade-filter-row">
            {[
              { value: 'all', label: '전체' },
              { value: 'sec-13f', label: '13F 보유 보고' },
              { value: 'sec-form4', label: 'Form 4 내부자' },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={sourceFilter === filter.value ? 'active' : ''}
                onClick={() => setSourceFilter(filter.value as 'all' | 'sec-13f' | 'sec-form4')}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <label>
            <span>기관명</span>
            <input type="search" placeholder="Berkshire, ARK..." value={investorQuery} onChange={(event) => setInvestorQuery(event.target.value)} />
          </label>
          <label>
            <span>종목명/티커</span>
            <input type="search" placeholder="AAPL, NVDA..." value={tickerQuery} onChange={(event) => setTickerQuery(event.target.value)} />
          </label>
          <div className="ownership-chip-row" aria-label="주요 기관 빠른 검색">
            {prominentInstitutionFilters.map((name) => (
              <button key={name} type="button" onClick={() => setInvestorQuery(name)}>
                {name}
              </button>
            ))}
          </div>
        </section>

        <div className="ownership-status-row">
          <span>{status === 'loading' ? '불러오는 중' : status === 'ready' ? 'Supabase 최신 공개 기록' : '예시 공개 보고 데이터 표시 중'}</span>
          <small>기본 50개 제한 · 화면 과밀 방지</small>
        </div>

        <section className="home-card-grid smart-money-grid">
          {items.slice(0, 50).map((move) => {
            const company = companies.find((item) => item.id === (move.relatedCompanyId ?? move.companyId));
            const supplyChainId = move.relatedSupplyChainId ?? move.sectorId;
            return (
              <article className="smart-card" key={move.id}>
                <div className="smart-card-primary">
                  <div>
                    <h3>{move.investorName}</h3>
                  </div>
                  <strong className="trade-action-badge">{publicReportActionLabel(move)}</strong>
                </div>
                <div className="smart-company-focus">
                  <CompanyIdentity
                    companyName={move.companyName}
                    ticker={move.ticker}
                    countryLabel={countryLabelFromMarket(move.market)}
                    size="compact"
                  />
                </div>
                <span className="trade-type-badge">{publicReportTypeBadge(move)}</span>
                <p>{move.beginnerExplanation}</p>
                <dl className="smart-meta-list">
                  <div><dt>공개일</dt><dd>{move.disclosedDate || '확인 필요'}</dd></div>
                  <div><dt>{publicReportDateLabel(move)}</dt><dd>{move.tradeDateOptional ?? publicReportDateFallback(move)}</dd></div>
                  <div><dt>출처</dt><dd>{move.sourceLabel}</dd></div>
                </dl>
                <small className="trade-delay-note">{publicReportDelayNote(move)}</small>
                <div className="card-actions">
                  <button type="button" onClick={() => onOpenCategory(supplyChainId, company?.id ?? move.relatedCompanyId ?? move.companyId)}>기업 관계 보기</button>
                  {company ? <button type="button" onClick={() => onOpenAnalysis(company)}>기업 분석 보기</button> : <button type="button">관련 분석 준비 중</button>}
                  <SourceReportAction move={move} />
                </div>
              </article>
            );
          })}
          {items.length === 0 && <div className="trade-empty">현재 조건에 맞는 공개 보유·거래 보고가 없습니다.</div>}
        </section>

        <div className="home-note">
          <p>13F는 분기 말 기관 보유 보고이며 실제 매수·매도 시점과 차이가 있습니다.</p>
          <p>Form 4 내부자 거래 보고도 공개 시점이 늦을 수 있습니다.</p>
          <p>투자 권유가 아닌 참고용 데이터입니다.</p>
        </div>
      </main>
    </div>
  );
}

type FinancialLearningPageProps = {
  onHome: () => void;
};

function FinancialLearningPage({ onHome }: FinancialLearningPageProps) {
  const coreItems = [
    {
      title: '매출',
      body: '회사가 얼마나 팔았는지 보는 출발점입니다. 매출만 커도 비용이 같이 커지면 남는 돈은 작을 수 있습니다.',
    },
    {
      title: '영업이익률',
      body: '영업이익을 매출로 나눈 비율입니다. 회사 크기보다 본업 수익성이 어떤 흐름인지 볼 때 씁니다.',
    },
    {
      title: '영업현금흐름',
      body: '장부상 이익이 실제 현금 흐름으로 이어졌는지 봅니다. 이익과 현금흐름이 함께 움직이는지가 중요합니다.',
    },
  ];

  return (
    <div className="financial-learn-shell">
      <header className="pick-nav financial-learn-nav">
        <div className="breadcrumb" aria-label="현재 위치">
          <button type="button" onClick={onHome}>홈</button>
          <strong>숫자 읽기</strong>
        </div>
        <button type="button" className="ghost-action" onClick={onHome}>
          <Network size={15} />
          홈
        </button>
      </header>

      <main className="financial-learn-main">
        <section className="financial-learn-hero">
          <span className="home-kicker">재무 숫자 참고</span>
          <h1>숫자 3개 읽는 법</h1>
          <p>기업해설에서 보는 매출, 영업이익률, 현금흐름의 순서를 짧게 정리했습니다.</p>
        </section>

        <section className="financial-learn-guide" aria-label="재무 숫자 읽는 법">
          {coreItems.map((item) => (
            <article key={item.title}>
              <span>{item.title}</span>
              <p>{item.body}</p>
            </article>
          ))}
        </section>

        <section className="financial-learn-note">
          <CheckCircle size={18} />
          <div>
            <strong>비교는 그다음입니다</strong>
            <p>YoY/QoQ, 부채비율, FCF, EPS는 핵심 3개를 본 뒤에 확인합니다.</p>
          </div>
        </section>
      </main>
    </div>
  );
}


export default function CompaniesRoute(props: CompaniesRouteProps) {
  if (props.view === 'ownership') {
    return <OwnershipReportsPage onHome={props.onHome} onOpenAnalysis={props.onOpenAnalysis} onOpenCategory={props.onOpenCategory} />;
  }
  if (props.view === 'financial-learning') {
    return <FinancialLearningPage onHome={props.onHome} />;
  }
  return <CompanyProfilesRoute {...props} />;
}

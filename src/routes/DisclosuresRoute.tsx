import { useMemo, useState, type ReactNode } from 'react';
import { ArrowRight, CheckCircle, ExternalLink, Filter, RefreshCw } from 'lucide-react';
import {
  currentPickDisclosureTickers,
  currentPickSecTickers,
  disclosureCategoryLabels,
  disclosureCategoryOrder,
  disclosureCheckpoints,
  enabledDartTrackedCompanies,
  enabledSecTrackedCompanies,
  findDartTrackedCompanyByTicker,
  findSecTrackedCompanyByTicker,
  marketMapDisclosureTickers,
  matchesSecFormPattern,
  secFilingCategoryLabels,
  secFilingCategoryOrder,
  secFilingCheckpoints,
  secSupportedFormPatterns,
  type DisclosureCategory,
  type MarketDisclosure,
  type MarketDisclosureApiResponse,
  type MarketSecFiling,
  type MarketSecFilingsApiResponse,
  type SecFilingCategory,
} from '../content/disclosures/index.js';
import {
  eightKItemDefinitionByItem,
  secPrimaryTransactionCodes,
  secTransactionCodeDefinitionByCode,
  type SecDerivativeTransaction,
  type SecNonDerivativeTransaction,
  type SecReportingOwner,
} from '../lib/sec/index.js';

type DisclosuresRouteProps = {
  disclosures: MarketDisclosureApiResponse;
  secFilings: MarketSecFilingsApiResponse;
  navigation: ReactNode;
  onNavigate: (path: string) => void;
};

const placeholderTickerLabels = new Set(['WATCH', '비상장', 'PRIVATE', 'N/A', '-']);

function kstParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: byType.year ?? '',
    month: byType.month ?? '',
    day: byType.day ?? '',
    hour: byType.hour ?? '',
    minute: byType.minute ?? '',
  };
}

function formatKstDateTime(value?: string | null, fallback = '확인 중') {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  const parts = kstParts(date);
  return `${parts.month}.${parts.day} ${parts.hour}:${parts.minute}`;
}

function formatKstDate(value?: string | null, fallback = '접수일 확인 중') {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  const parts = kstParts(date);
  return `${parts.year}.${parts.month}.${parts.day}`;
}

function cleanIdentityValue(value?: string | null) {
  return String(value ?? '').trim();
}

function countryLabelFromTicker(ticker?: string | null) {
  const normalized = cleanIdentityValue(ticker).toUpperCase();
  if (normalized.endsWith('.KS') || normalized.endsWith('.KQ') || normalized.endsWith('.KONEX')) return '한국';
  return '';
}

function resolveCompanyIdentity(input: {
  companyName?: string | null;
  ticker?: string | null;
  countryLabel?: string | null;
  statusLabel?: string | null;
}) {
  return {
    companyName: cleanIdentityValue(input.companyName) || '회사명 확인 필요',
    ticker: cleanIdentityValue(input.ticker),
    countryLabel: cleanIdentityValue(input.countryLabel),
    statusLabel: cleanIdentityValue(input.statusLabel),
  };
}

function CompanyIdentity({
  companyName,
  ticker,
  countryLabel,
  statusLabel,
  size = 'card',
}: {
  companyName?: string | null;
  ticker?: string | null;
  countryLabel?: string | null;
  statusLabel?: string | null;
  size?: 'compact' | 'card' | 'hero';
}) {
  const name = cleanIdentityValue(companyName) || '회사명 확인 필요';
  const normalizedTicker = cleanIdentityValue(ticker).toUpperCase();
  const displayTicker = normalizedTicker && !placeholderTickerLabels.has(normalizedTicker) ? normalizedTicker : '';
  const status = cleanIdentityValue(statusLabel) || (displayTicker ? '' : '비상장');
  const meta = displayTicker ? [cleanIdentityValue(countryLabel), displayTicker].filter(Boolean).join(' · ') : status;
  return <span className={`company-identity company-identity--${size}`}><strong className="company-identity__name">{name}</strong>{meta ? <small className="company-identity__meta">{meta}</small> : null}</span>;
}

const secNumberFormatter = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 6 });
const secMoneyFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });

function formatSecNumber(value?: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? secNumberFormatter.format(value) : '';
}

function formatSecShares(value?: number | null) {
  const formatted = formatSecNumber(value);
  return formatted ? `${formatted}주` : '';
}

function formatSecPrice(value?: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? `주당 $${secMoneyFormatter.format(value)}` : '';
}

function isSecAmendedFiling(formType: string) {
  return formType.endsWith('/A');
}

function isEightKFiling(formType: string) {
  return formType === '8-K' || formType === '8-K/A';
}

function isForm4Filing(formType: string) {
  return formType === '4' || formType === '4/A';
}

function reportingOwnerRoleLabel(owner: SecReportingOwner) {
  const roles = [
    owner.isDirector ? 'Director' : '',
    owner.isOfficer ? owner.officerTitle || 'Officer' : '',
    owner.isTenPercentOwner ? '10% Owner' : '',
    owner.isOther ? owner.otherText || 'Other' : '',
  ].filter(Boolean);
  return roles.join(' · ') || '관계 정보 없음';
}

type SecTransactionSummary =
  | { kind: 'non-derivative'; transaction: SecNonDerivativeTransaction }
  | { kind: 'derivative'; transaction: SecDerivativeTransaction };

function secTransactionsForFiling(filing: MarketSecFiling): SecTransactionSummary[] {
  return [
    ...(filing.nonDerivativeTransactions ?? []).map((transaction) => ({ kind: 'non-derivative' as const, transaction })),
    ...(filing.derivativeTransactions ?? []).map((transaction) => ({ kind: 'derivative' as const, transaction })),
  ];
}

function secTransactionShares(transaction: SecTransactionSummary) {
  return transaction.kind === 'non-derivative' ? transaction.transaction.shares : transaction.transaction.transactionShares;
}

function secTransactionPrice(transaction: SecTransactionSummary) {
  return transaction.kind === 'non-derivative' ? transaction.transaction.pricePerShare : transaction.transaction.transactionPricePerShare;
}

function secTransactionCodeLabel(transaction: SecTransactionSummary) {
  const code = transaction.transaction.transactionCode;
  const label = transaction.transaction.transactionCodeLabelKo;
  if (!code && !label) return transaction.kind === 'derivative' ? '파생상품 거래' : '거래 코드 확인 필요';
  return [code, label].filter(Boolean).join(' · ');
}

function secTransactionMetaLine(transaction: SecTransactionSummary) {
  return [
    formatSecShares(secTransactionShares(transaction)),
    formatSecPrice(secTransactionPrice(transaction)),
    transaction.transaction.ownershipLabelKo,
    transaction.transaction.sharesOwnedFollowingTransaction !== null
      ? `거래 후 ${formatSecShares(transaction.transaction.sharesOwnedFollowingTransaction)}`
      : '',
  ].filter(Boolean).join(' · ');
}

function secFilingMatchesTransactionFilter(filing: MarketSecFiling, filter: string | 'all' | 'other') {
  if (filter === 'all') return true;
  const transactions = secTransactionsForFiling(filing);
  if (filter === 'other') {
    return transactions.some(({ transaction }) => {
      const code = transaction.transactionCode ?? '';
      return code && !secPrimaryTransactionCodes.includes(code as typeof secPrimaryTransactionCodes[number]);
    });
  }
  return transactions.some(({ transaction }) => transaction.transactionCode === filter);
}

function disclosureItemsWithin(items: MarketDisclosure[], hours: number) {
  const threshold = Date.now() - hours * 60 * 60 * 1000;
  return items.filter((item) => {
    const receivedAt = Date.parse(item.receivedAt);
    return !Number.isNaN(receivedAt) && receivedAt >= threshold;
  });
}

function secFilingItemsWithin(items: MarketSecFiling[], hours: number) {
  const threshold = Date.now() - hours * 60 * 60 * 1000;
  return items.filter((item) => {
    const filedAt = Date.parse(item.filedAt);
    return !Number.isNaN(filedAt) && filedAt >= threshold;
  });
}

function disclosureStateMessage(response: MarketDisclosureApiResponse) {
  if (response.ok) return '';
  if (response.code === 'DISCLOSURES_LOADING') return '공시 데이터를 불러오는 중입니다.';
  if (response.code === 'DISCLOSURES_NOT_CONFIGURED') return '공시 데이터를 준비하고 있습니다.';
  return '공시 정보를 일시적으로 불러오지 못했습니다. 이전 데이터를 표시합니다.';
}

function disclosureSyncLabel(response: MarketDisclosureApiResponse) {
  const lastSyncedAt = response.meta.lastSyncedAt;
  if (!response.ok && response.code === 'DISCLOSURES_NOT_CONFIGURED') return '공시 데이터를 준비하고 있습니다.';
  if (!lastSyncedAt) return 'OpenDART 확인 전';
  if (response.meta.stale) return `업데이트 지연 · 마지막 확인 ${formatKstDateTime(lastSyncedAt)}`;
  return `OpenDART · ${formatKstDateTime(lastSyncedAt)} 기준`;
}

function secFilingStateMessage(response: MarketSecFilingsApiResponse) {
  if (response.ok) return '';
  if (response.code === 'SEC_FILINGS_LOADING') return '미국 공시 데이터를 불러오는 중입니다.';
  if (response.code === 'SEC_FILINGS_NOT_CONFIGURED') return '미국 공시 데이터를 준비하고 있습니다.';
  return '미국 공시 정보를 일시적으로 불러오지 못했습니다. 이전 데이터를 표시합니다.';
}

function secFilingSyncLabel(response: MarketSecFilingsApiResponse) {
  const lastSyncedAt = response.meta.lastSyncedAt;
  if (!response.ok && response.code === 'SEC_FILINGS_NOT_CONFIGURED') return '미국 공시 데이터를 준비하고 있습니다.';
  if (!lastSyncedAt) return 'SEC EDGAR 확인 전';
  if (response.meta.stale) return `업데이트 지연 · 마지막 확인 ${formatKstDateTime(lastSyncedAt)}`;
  return `SEC EDGAR · ${formatKstDateTime(lastSyncedAt)} 기준`;
}

type OfficialDisclosureFeedItem =
  | { source: 'opendart'; id: string; sortAt: string; disclosure: MarketDisclosure }
  | { source: 'sec-edgar'; id: string; sortAt: string; filing: MarketSecFiling };

function officialDisclosureFeedItems(disclosures: MarketDisclosure[], secFilings: MarketSecFiling[]) {
  return [
    ...disclosures.map((disclosure) => ({ source: 'opendart' as const, id: disclosure.receiptNumber, sortAt: disclosure.receivedAt, disclosure })),
    ...secFilings.map((filing) => ({ source: 'sec-edgar' as const, id: filing.accessionNumber, sortAt: filing.filedAt, filing })),
  ].sort((a, b) => b.sortAt.localeCompare(a.sortAt));
}

type DisclosureSourceFilter = 'all' | 'opendart' | 'sec-edgar';

function DisclosureCard({ disclosure }: { disclosure: MarketDisclosure }) {
  const categoryLabel = disclosureCategoryLabels[disclosure.category];
  const checkpoint = disclosureCheckpoints[disclosure.category];
  const trackedCompany = findDartTrackedCompanyByTicker(disclosure.ticker);
  const identity = resolveCompanyIdentity({
    companyName: disclosure.companyName,
    ticker: disclosure.ticker,
    countryLabel: trackedCompany ? '한국' : countryLabelFromTicker(disclosure.ticker),
    statusLabel: disclosure.ticker ? undefined : '공시 기업',
  });

  return (
    <article className="disclosure-radar-card">
      <div className="disclosure-card-topline">
        <span>OpenDART</span>
        <span>{categoryLabel}</span>
        <time dateTime={disclosure.receivedAt}>{formatKstDate(disclosure.receivedAt)}</time>
      </div>
      <div className="disclosure-company-line">
        <CompanyIdentity {...identity} size="compact" />
      </div>
      <h3>{disclosure.reportName}</h3>
      <p>
        <b>확인할 것:</b>
        {checkpoint}
      </p>
      <a href={disclosure.sourceUrl} target="_blank" rel="noopener noreferrer">
        OpenDART 원문 보기
        <ExternalLink size={14} />
      </a>
    </article>
  );
}

function SecFilingDetailSummary({ filing, compact = false }: { filing: MarketSecFiling; compact?: boolean }) {
  if (isEightKFiling(filing.formType)) {
    const items = filing.eightKItems ?? [];
    return (
      <div className={`sec-detail-block ${compact ? 'compact' : ''}`}>
        <strong>공시 항목</strong>
        {items.length ? (
          <>
            <ul className="sec-detail-list">
              {items.slice(0, compact ? 2 : 3).map((item) => (
                <li key={item.item}>{item.item} · {item.labelKo}</li>
              ))}
            </ul>
            {items.length > (compact ? 2 : 3) ? <small>외 {items.length - (compact ? 2 : 3)}개</small> : null}
          </>
        ) : (
          <small>공시 항목 정보 없음</small>
        )}
      </div>
    );
  }

  if (isForm4Filing(filing.formType)) {
    const owners = filing.reportingOwners ?? [];
    const transactions = secTransactionsForFiling(filing);
    const detailUnavailable = filing.parsingStatus === 'source-unavailable' || filing.parsingStatus === 'parse-error';

    return (
      <div className={`sec-detail-block ${compact ? 'compact' : ''}`}>
        <strong>공시된 소유권 거래</strong>
        {owners.length ? (
          <div className="sec-owner-list">
            {owners.slice(0, compact ? 1 : 2).map((owner, index) => (
              <span key={`${owner.cik ?? owner.name ?? 'owner'}-${index}`}>
                {owner.name ?? '보고자 이름 확인 필요'} · {reportingOwnerRoleLabel(owner)}
              </span>
            ))}
            {owners.length > (compact ? 1 : 2) ? <small>보고자 외 {owners.length - (compact ? 1 : 2)}명</small> : null}
          </div>
        ) : null}
        {transactions.length ? (
          <>
            <ul className="sec-detail-list">
              {transactions.slice(0, compact ? 2 : 3).map((transaction, index) => (
                <li key={`${transaction.transaction.transactionCode ?? 'code'}-${index}`}>
                  <span>{secTransactionCodeLabel(transaction)}</span>
                  <small>{secTransactionMetaLine(transaction) || '수량·가격 정보 없음'}</small>
                  {transaction.transaction.footnoteIds.length ? <small>각주 {transaction.transaction.footnoteIds.length}개 있음 · 원문 조건 확인</small> : null}
                </li>
              ))}
            </ul>
            {transactions.length > (compact ? 2 : 3) ? <small>거래 외 {transactions.length - (compact ? 2 : 3)}건</small> : null}
            {filing.footnoteCount ? <small>전체 각주 {filing.footnoteCount}개 있음 · SEC 원문에서 확인</small> : null}
          </>
        ) : (
          <small>{detailUnavailable ? '거래 상세를 불러오지 못했습니다. SEC 원문에서 확인하세요.' : '거래 상세 준비 중'}</small>
        )}
      </div>
    );
  }

  return null;
}

function SecFilingCard({ filing }: { filing: MarketSecFiling }) {
  const categoryLabel = secFilingCategoryLabels[filing.category];
  const checkpoint = secFilingCheckpoints[filing.category];
  const trackedCompany = findSecTrackedCompanyByTicker(filing.ticker);
  const identity = resolveCompanyIdentity({
    companyName: filing.companyName,
    ticker: filing.ticker,
    countryLabel: '미국',
    statusLabel: trackedCompany?.source === 'current-pick' ? '현재 Pick' : '미국 Pick',
  });

  return (
    <article className="disclosure-radar-card sec-filing-card">
      <div className="disclosure-card-topline">
        <span>SEC EDGAR</span>
        <span>{filing.formType}</span>
        {isSecAmendedFiling(filing.formType) ? <span>수정 공시</span> : null}
        <time dateTime={filing.filedAt}>{formatKstDate(filing.filedAt)}</time>
      </div>
      <div className="disclosure-company-line">
        <CompanyIdentity {...identity} size="compact" />
      </div>
      <h3>{categoryLabel}</h3>
      <p>
        <b>확인할 것:</b>
        {checkpoint}
      </p>
      <SecFilingDetailSummary filing={filing} />
      {isSecAmendedFiling(filing.formType) ? <small className="disclosure-card-submeta">수정 공시입니다. 원본과 함께 확인하세요.</small> : null}
      {filing.reportDate ? <small className="disclosure-card-submeta">보고 기준일 · {formatKstDate(filing.reportDate)}</small> : null}
      <a href={filing.sourceUrl} target="_blank" rel="noopener noreferrer">
        SEC EDGAR 원문 보기
        <ExternalLink size={14} />
      </a>
    </article>
  );
}

export default function DisclosuresRoute({ disclosures, secFilings, navigation, onNavigate }: DisclosuresRouteProps) {
  const [sourceFilter, setSourceFilter] = useState<DisclosureSourceFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<DisclosureCategory | 'all'>('all');
  const [secCategoryFilter, setSecCategoryFilter] = useState<SecFilingCategory | 'all'>('all');
  const [secFormFilter, setSecFormFilter] = useState<string | 'all'>('all');
  const [secItemFilter, setSecItemFilter] = useState<string | 'all'>('all');
  const [secTransactionFilter, setSecTransactionFilter] = useState<string | 'all' | 'other'>('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const recent24 = disclosureItemsWithin(disclosures.items, 24);
  const recent7 = disclosureItemsWithin(disclosures.items, 24 * 7);
  const recentSec24 = secFilingItemsWithin(secFilings.items, 24);
  const recentSec30 = secFilingItemsWithin(secFilings.items, 24 * 30);
  const shouldShowDart = sourceFilter === 'all' || sourceFilter === 'opendart';
  const shouldShowSec = sourceFilter === 'all' || sourceFilter === 'sec-edgar';
  const showDartSpecificFilters = sourceFilter === 'opendart';
  const showSecSpecificFilters = sourceFilter === 'sec-edgar';

  const filteredDartItems = useMemo(() => {
    if (!shouldShowDart) return [];
    return disclosures.items
      .filter((item) => categoryFilter === 'all' || item.category === categoryFilter)
      .filter((item) => {
        if (companyFilter === 'all') return true;
        if (companyFilter === 'current-pick') return currentPickDisclosureTickers.has(item.ticker ?? '');
        if (companyFilter === 'market-map') return marketMapDisclosureTickers.has(item.ticker ?? '');
        if (companyFilter === 'us-pick') return false;
        return item.ticker === companyFilter;
      })
      .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  }, [categoryFilter, companyFilter, disclosures.items, shouldShowDart]);

  const filteredSecItems = useMemo(() => {
    if (!shouldShowSec) return [];
    return secFilings.items
      .filter((item) => secCategoryFilter === 'all' || item.category === secCategoryFilter)
      .filter((item) => secFormFilter === 'all' || matchesSecFormPattern(item.formType, secFormFilter))
      .filter((item) => secItemFilter === 'all' || item.eightKItems?.some((detail) => detail.item === secItemFilter))
      .filter((item) => secFilingMatchesTransactionFilter(item, secTransactionFilter))
      .filter((item) => {
        if (companyFilter === 'all') return true;
        if (companyFilter === 'current-pick') return currentPickSecTickers.has(item.ticker);
        if (companyFilter === 'market-map') return false;
        if (companyFilter === 'us-pick') return enabledSecTrackedCompanies.some((company) => company.ticker === item.ticker);
        return item.ticker === companyFilter;
      })
      .sort((a, b) => b.filedAt.localeCompare(a.filedAt));
  }, [companyFilter, secCategoryFilter, secFilings.items, secFormFilter, secItemFilter, secTransactionFilter, shouldShowSec]);

  const filteredItems = officialDisclosureFeedItems(filteredDartItems, filteredSecItems);

  const stateMessage = disclosureStateMessage(disclosures);
  const secStateMessage = secFilingStateMessage(secFilings);
  const sourceNotices = [
    shouldShowDart && stateMessage ? `OpenDART · ${stateMessage}` : '',
    shouldShowSec && secStateMessage ? `SEC EDGAR · ${secStateMessage}` : '',
  ].filter(Boolean);

  const updateSourceFilter = (next: DisclosureSourceFilter) => {
    setSourceFilter(next);
    setCategoryFilter('all');
    setSecCategoryFilter('all');
    setSecFormFilter('all');
    setSecItemFilter('all');
    setSecTransactionFilter('all');
    setCompanyFilter('all');
  };
  const secItemFilterOptions = ['2.02', '5.02', '7.01', '8.01', '9.01'];
  const secTransactionFilterOptions = ['P', 'S', 'A', 'F', 'G', 'M'];

  return (
    <div className="pick-shell story-dark-shell disclosure-radar-shell">
      {navigation}

      <main className="disclosure-radar-main">
        <section className="disclosure-radar-hero">
          <p className="home-kicker">공식 공시</p>
          <h1>기업이 직접 밝힌 변화</h1>
          <span className="beginner-professional-name">OpenDART·SEC EDGAR 공시 레이더</span>
          <p>
            현재 Pick과 추적 기업에서 새로 나온 OpenDART·SEC EDGAR 공식 공시를 모아봅니다.
            공시 제목은 신호일 뿐이며, 실제 내용은 원문에서 확인해야 합니다.
          </p>
          <a className="disclosure-company-events-cta" href="/ko/company-events" onClick={(event) => {
            event.preventDefault();
            onNavigate('/ko/company-events');
          }}>해석된 기업 변화만 보기 <ArrowRight size={14} aria-hidden="true" /></a>
        </section>

        <section className="disclosure-status-section" aria-labelledby="disclosure-status-title">
          <div className="beginner-page-subhead"><span>한눈에 보기</span><h2 id="disclosure-status-title">지금 확인 가능한 공식 문서</h2></div>
          <div className="disclosure-status-grid">
          <article>
            <span>출처</span>
            <strong>OpenDART · SEC EDGAR</strong>
          </article>
          <article>
            <span>OpenDART 동기화</span>
            <strong>{disclosureSyncLabel(disclosures)}</strong>
          </article>
          <article>
            <span>SEC EDGAR 동기화</span>
            <strong>{secFilingSyncLabel(secFilings)}</strong>
          </article>
          <article>
            <span>감시 기업 수</span>
            <strong>KR {disclosures.meta.trackedCompanyCount}개 · US {secFilings.meta.trackedCompanyCount}개</strong>
          </article>
          <article>
            <span>최근 24시간</span>
            <strong>{recent24.length + recentSec24.length}건</strong>
          </article>
          <article>
            <span>표시 범위</span>
            <strong>OpenDART 7일 {recent7.length}건 · SEC 30일 {recentSec30.length}건</strong>
          </article>
          </div>
        </section>

        <section className="disclosure-source-tabs" aria-label="공시 출처 선택">
          <button type="button" className={sourceFilter === 'all' ? 'active' : ''} aria-pressed={sourceFilter === 'all'} onClick={() => updateSourceFilter('all')}>
            전체
          </button>
          <button type="button" className={sourceFilter === 'opendart' ? 'active' : ''} aria-pressed={sourceFilter === 'opendart'} onClick={() => updateSourceFilter('opendart')}>
            한국 공시
          </button>
          <button type="button" className={sourceFilter === 'sec-edgar' ? 'active' : ''} aria-pressed={sourceFilter === 'sec-edgar'} onClick={() => updateSourceFilter('sec-edgar')}>
            미국 공시
          </button>
        </section>

        <details className="disclosure-filter-details">
          <summary>자세한 필터</summary>
        <section className="disclosure-filter-panel" aria-label="공시 필터">
          {showDartSpecificFilters ? (
            <div>
              <span><Filter size={14} /> 한국 공시 · OpenDART</span>
              <div className="disclosure-chip-row">
                <button type="button" className={categoryFilter === 'all' ? 'active' : ''} aria-pressed={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>
                  전체
                </button>
                {disclosureCategoryOrder.map((category) => (
                  <button
                    type="button"
                    key={category}
                    className={categoryFilter === category ? 'active' : ''}
                    aria-pressed={categoryFilter === category}
                    onClick={() => setCategoryFilter(category)}
                  >
                    {disclosureCategoryLabels[category]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {showSecSpecificFilters ? (
            <>
              <div>
                <span><Filter size={14} /> 미국 공시 · SEC EDGAR</span>
                <div className="disclosure-chip-row">
                  <button type="button" className={secCategoryFilter === 'all' ? 'active' : ''} aria-pressed={secCategoryFilter === 'all'} onClick={() => setSecCategoryFilter('all')}>
                    전체
                  </button>
                  {secFilingCategoryOrder.map((category) => (
                    <button
                      type="button"
                      key={category}
                      className={secCategoryFilter === category ? 'active' : ''}
                      aria-pressed={secCategoryFilter === category}
                      onClick={() => setSecCategoryFilter(category)}
                    >
                      {secFilingCategoryLabels[category]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span><Filter size={14} /> SEC Form</span>
                <div className="disclosure-chip-row">
                  <button type="button" className={secFormFilter === 'all' ? 'active' : ''} aria-pressed={secFormFilter === 'all'} onClick={() => setSecFormFilter('all')}>
                    전체
                  </button>
                  {secSupportedFormPatterns.map((formType) => (
                    <button
                      type="button"
                      key={formType}
                      className={secFormFilter === formType ? 'active' : ''}
                      aria-pressed={secFormFilter === formType}
                      onClick={() => setSecFormFilter(formType)}
                    >
                      {formType === '424B' ? '424B 계열' : formType}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span><Filter size={14} /> 8-K Item</span>
                <div className="disclosure-chip-row">
                  <button type="button" className={secItemFilter === 'all' ? 'active' : ''} aria-pressed={secItemFilter === 'all'} onClick={() => setSecItemFilter('all')}>
                    전체 Item
                  </button>
                  {secItemFilterOptions.map((item) => {
                    const definition = eightKItemDefinitionByItem.get(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        className={secItemFilter === item ? 'active' : ''}
                        aria-pressed={secItemFilter === item}
                        onClick={() => setSecItemFilter(item)}
                      >
                        {definition?.labelKo ?? '공식 설명 확인 필요'} · {item}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <span><Filter size={14} /> Form 4 거래</span>
                <div className="disclosure-chip-row">
                  <button type="button" className={secTransactionFilter === 'all' ? 'active' : ''} aria-pressed={secTransactionFilter === 'all'} onClick={() => setSecTransactionFilter('all')}>
                    전체 거래
                  </button>
                  {secTransactionFilterOptions.map((code) => {
                    const definition = secTransactionCodeDefinitionByCode.get(code);
                    return (
                      <button
                        type="button"
                        key={code}
                        className={secTransactionFilter === code ? 'active' : ''}
                        aria-pressed={secTransactionFilter === code}
                        onClick={() => setSecTransactionFilter(code)}
                      >
                        {code} · {definition?.labelKo ?? '공식 코드 설명 확인 필요'}
                      </button>
                    );
                  })}
                  <button type="button" className={secTransactionFilter === 'other' ? 'active' : ''} aria-pressed={secTransactionFilter === 'other'} onClick={() => setSecTransactionFilter('other')}>
                    기타
                  </button>
                </div>
              </div>
            </>
          ) : null}
          <div>
            <span><Filter size={14} /> 회사</span>
            <div className="disclosure-chip-row">
              <button type="button" className={companyFilter === 'all' ? 'active' : ''} aria-pressed={companyFilter === 'all'} onClick={() => setCompanyFilter('all')}>
                전체
              </button>
              <button type="button" className={companyFilter === 'current-pick' ? 'active' : ''} aria-pressed={companyFilter === 'current-pick'} onClick={() => setCompanyFilter('current-pick')}>
                현재 Pick
              </button>
              {sourceFilter !== 'sec-edgar' ? (
                <button type="button" className={companyFilter === 'market-map' ? 'active' : ''} aria-pressed={companyFilter === 'market-map'} onClick={() => setCompanyFilter('market-map')}>
                  추적 기업
                </button>
              ) : null}
              {sourceFilter !== 'opendart' ? (
                <button type="button" className={companyFilter === 'us-pick' ? 'active' : ''} aria-pressed={companyFilter === 'us-pick'} onClick={() => setCompanyFilter('us-pick')}>
                  미국 Pick
                </button>
              ) : null}
              {sourceFilter === 'opendart' ? enabledDartTrackedCompanies.map((company) => (
                  <button
                    type="button"
                    key={`dart-${company.id}`}
                    className={companyFilter === company.ticker ? 'active' : ''}
                    aria-pressed={companyFilter === company.ticker}
                    onClick={() => setCompanyFilter(company.ticker)}
                  >
                    {company.companyName}
                  </button>
                )) : null}
              {sourceFilter === 'sec-edgar' ? enabledSecTrackedCompanies.map((company) => (
                  <button
                    type="button"
                    key={`sec-${company.id}`}
                    className={companyFilter === company.ticker ? 'active' : ''}
                    aria-pressed={companyFilter === company.ticker}
                    onClick={() => setCompanyFilter(company.ticker)}
                  >
                    {company.companyName}
                  </button>
                )) : null}
            </div>
          </div>
        </section>
        </details>

        {sourceNotices.length ? (
          <section className="disclosure-source-notice" aria-label="공시 데이터 상태">
            <RefreshCw size={18} />
            <div>
              {sourceNotices.map((message) => <strong key={message}>{message}</strong>)}
            </div>
          </section>
        ) : null}

        {filteredItems.length ? (
          <section className="disclosure-card-grid" aria-labelledby="disclosure-list-title">
            <h2 className="disclosure-list-title" id="disclosure-list-title">공시 목록</h2>
            {filteredItems.map((item) => (
              item.source === 'opendart'
                ? <DisclosureCard key={`dart-${item.id}`} disclosure={item.disclosure} />
                : <SecFilingCard key={`sec-${item.id}`} filing={item.filing} />
            ))}
          </section>
        ) : (
          <section className="disclosure-empty-state">
            <CheckCircle size={18} />
            <strong>선택한 조건에 맞는 새 공식 공시가 없습니다.</strong>
          </section>
        )}
      </main>
    </div>
  );
}



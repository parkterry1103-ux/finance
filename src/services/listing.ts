import type { Company, FilingSourceStatus } from '../data.js';

export type ListingStatus = 'listed' | 'private' | 'unknown' | 'delisted' | 'no-public-filing';
export type FilingSourceKind = 'DART' | 'SEC' | 'manual' | 'none';

type CompanyWithListingFields = Company & {
  exchange?: string;
  market?: string;
  listed?: boolean;
  listingStatus?: ListingStatus;
  filingSource?: FilingSourceKind;
  filingStatus?: FilingSourceStatus;
  isInvestmentAnalyzable?: boolean;
};

export type CompanyListing = {
  listed: boolean;
  listingStatus: ListingStatus;
  market: string;
  ticker: string;
  priceTicker: string;
  filingSource: FilingSourceKind;
  filingStatus: FilingSourceStatus;
  isInvestmentAnalyzable: boolean;
  isPriceSyncTarget: boolean;
  isFilingSyncTarget: boolean;
  reasons: string[];
};

const listedMarkets = new Set(['KOSPI', 'KOSDAQ', 'KONEX', 'NASDAQ', 'NYSE', 'AMEX', 'OTC', 'NYSE/ADR', 'KRX']);
const privateTickerLabels = new Set(['WATCH', '비상장', 'PRIVATE', 'N/A', '-']);
const nyseTickers = new Set(['BRK.B', 'BRK-B', 'PGR', 'CB', 'JPM', 'V', 'BA', 'LMT', 'RTX', 'TSLA', 'GM', 'NFE', 'GEV', 'ETN', 'XYZ', 'TSM', 'DELL', 'VRT', 'ANET']);
const otcTickers = new Set(['SBGSY']);

function clean(value?: string) {
  return String(value ?? '').trim();
}

export function isTradableTicker(ticker?: string) {
  const normalized = clean(ticker).toUpperCase();
  if (!normalized || privateTickerLabels.has(normalized)) return false;
  return /\.KS$|\.KQ$|^[A-Z][A-Z0-9.-]{0,8}$/.test(normalized);
}

export function displayMarketForCompany(company: Company) {
  const withFields = company as CompanyWithListingFields;
  const ticker = clean(company.ticker).toUpperCase();
  const explicitMarket = clean(withFields.market || withFields.exchange).toUpperCase();

  if (ticker.endsWith('.KS')) return 'KOSPI';
  if (ticker.endsWith('.KQ')) return 'KOSDAQ';
  if (ticker.endsWith('.KONEX')) return 'KONEX';
  if (explicitMarket && listedMarkets.has(explicitMarket)) {
    if (explicitMarket === 'KRX') return company.country === 'KR' ? 'KRX' : explicitMarket;
    return explicitMarket;
  }
  if (otcTickers.has(ticker)) return 'OTC';
  if (nyseTickers.has(ticker)) return 'NYSE';
  if (ticker && company.country === 'US' && isTradableTicker(ticker)) return 'NASDAQ';
  if (company.country === 'KR' && isTradableTicker(ticker)) return 'KRX';
  return '';
}

function inferFilingSource(company: Company, market: string): FilingSourceKind {
  const withFields = company as CompanyWithListingFields;
  if (withFields.filingSource) return withFields.filingSource;
  if (company.country === 'KR' && (company.corpCode || market === 'KOSPI' || market === 'KOSDAQ' || market === 'KONEX' || market === 'KRX')) return 'DART';
  if (company.country === 'US' && (company.cik || isTradableTicker(company.ticker))) return 'SEC';
  if (company.sourceDirectUrl || company.sourceSearchUrl || company.reportUrl || company.filingSourceUrl) return 'manual';
  return 'none';
}

function inferFilingStatus(company: Company, listed: boolean): FilingSourceStatus {
  const withFields = company as CompanyWithListingFields;
  const status = withFields.filingStatus ?? company.sourceStatus;
  if (listed && (status === 'private-company' || status === 'no-public-filing')) return 'needs-link';
  if (status) return status;
  if (company.reportUrl || company.filingSourceUrl || company.sourceDirectUrl || company.dartRcpNo || company.secAccessionNumber) return 'direct';
  if (company.sourceSearchUrl) return 'search-only';
  return listed ? 'needs-link' : 'private-company';
}

export function inferCompanyListing(company: Company): CompanyListing {
  const withFields = company as CompanyWithListingFields;
  const ticker = clean(company.ticker);
  const market = displayMarketForCompany(company);
  const hasTicker = isTradableTicker(ticker);
  const hasListedMarket = Boolean(market && listedMarkets.has(market));
  const hasDisclosureId = Boolean(company.corpCode || company.cik);
  const explicitStatus = withFields.listingStatus;
  const explicitlyPrivate = explicitStatus === 'private' || explicitStatus === 'delisted' || explicitStatus === 'no-public-filing';
  const explicitListed = withFields.listed === true || explicitStatus === 'listed';
  const reasons: string[] = [];

  if (explicitListed) reasons.push('listed field');
  if (hasTicker) reasons.push('tradable ticker');
  if (hasListedMarket) reasons.push('listed market');
  if (hasDisclosureId) reasons.push('DART/SEC identifier');

  const listed = explicitListed || hasTicker || hasListedMarket || (hasDisclosureId && !explicitlyPrivate);
  const listingStatus: ListingStatus =
    explicitStatus ??
    (listed ? 'listed' : ticker || market ? 'unknown' : 'private');
  const filingStatus = inferFilingStatus(company, listed);
  const filingSource = inferFilingSource(company, market);
  const priceTicker = hasTicker ? ticker.toUpperCase() : '';
  const isInvestmentAnalyzable = withFields.isInvestmentAnalyzable ?? listed;

  return {
    listed,
    listingStatus,
    market: listed ? market || (company.country === 'KR' ? 'KRX' : '미국 상장') : listingStatus === 'unknown' ? '상장 여부 확인 필요' : filingStatus === 'no-public-filing' ? '공개 공시 확인 불가' : '비상장',
    ticker,
    priceTicker,
    filingSource,
    filingStatus,
    isInvestmentAnalyzable,
    isPriceSyncTarget: listed && hasTicker,
    isFilingSyncTarget: listed && (filingSource === 'DART' || filingSource === 'SEC' || filingStatus === 'direct' || filingStatus === 'search-only' || filingStatus === 'needs-link'),
    reasons,
  };
}

export function isListedCompany(company: Company) {
  return inferCompanyListing(company).listed;
}

export function isPriceSyncTarget(company: Company) {
  return inferCompanyListing(company).isPriceSyncTarget;
}

export function isFilingSyncTarget(company: Company) {
  return inferCompanyListing(company).isFilingSyncTarget;
}

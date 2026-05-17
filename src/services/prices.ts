import { mockMarketPrices } from '../data.js';
import type { Company, MarketPrice, PriceLabel, StockAutopsyPick } from '../data.js';

export type PriceDirection = 'up' | 'down' | 'flat' | 'pending';

function normalizeTicker(ticker?: string) {
  return ticker?.trim().toUpperCase();
}

function parseNumeric(value?: string) {
  if (!value) return Number.NaN;
  return Number(String(value).replace(/[^0-9.-]/g, ''));
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function inferPriceLabel(price: MarketPrice): PriceLabel {
  if (price.priceLabel) return price.priceLabel;
  if (/mock|fallback|example/i.test(price.source)) return 'fallback';
  if (price.marketStatus === 'closed') return 'close';
  if (price.isDelayed || price.marketStatus === 'delayed') return 'delayed';
  if (price.marketStatus === 'open') return 'latest';
  return 'fallback';
}

function normalizeMarketPrice(price: MarketPrice): MarketPrice {
  const current = parseNumeric(price.price);
  const basis = parseNumeric(price.open) || parseNumeric(price.previousClose);
  const computedPercent =
    Number.isFinite(current) && Number.isFinite(basis) && basis !== 0 ? formatPercent(((current - basis) / basis) * 100) : '';

  return {
    ...price,
    priceLabel: inferPriceLabel(price),
    close: price.close ?? (inferPriceLabel(price) === 'close' ? price.price : undefined),
    changePercent: price.changePercent || computedPercent || '0.00%',
  };
}

function mergeFallbackPrices(prices: MarketPrice[]) {
  const byKey = new Map<string, MarketPrice>();
  mockMarketPrices.forEach((price) => {
    byKey.set(`${normalizeTicker(price.ticker)}:${price.companyId ?? ''}`, normalizeMarketPrice(price));
    byKey.set(`${normalizeTicker(price.ticker)}:`, normalizeMarketPrice(price));
  });
  prices.forEach((price) => {
    const normalized = normalizeMarketPrice(price);
    byKey.set(`${normalizeTicker(normalized.ticker)}:${normalized.companyId ?? ''}`, normalized);
    byKey.set(`${normalizeTicker(normalized.ticker)}:`, normalized);
  });
  return Array.from(new Map(Array.from(byKey.values()).map((price) => [`${normalizeTicker(price.ticker)}:${price.companyId ?? ''}`, price])).values());
}

export async function fetchMarketPrices(limit = 200): Promise<MarketPrice[]> {
  try {
    const response = await fetch(`/api/market-prices?limit=${Math.min(Math.max(limit, 1), 200)}`);
    if (!response.ok) throw new Error(`market prices ${response.status}`);
    const payload = await response.json();
    const rows = Array.isArray(payload.prices) ? payload.prices : [];
    if (!rows.length) return mockMarketPrices.map(normalizeMarketPrice);
    return mergeFallbackPrices(rows);
  } catch {
    return mockMarketPrices.map(normalizeMarketPrice);
  }
}

export function priceDirection(price?: MarketPrice | null): PriceDirection {
  if (!price) return 'pending';
  if (inferPriceLabel(price) === 'fallback' || inferPriceLabel(price) === 'unavailable') return 'pending';
  const value = parseNumeric(price.changePercent);
  if (!Number.isFinite(value) || value === 0) return 'flat';
  return value > 0 ? 'up' : 'down';
}

export function priceStatusLabel(price?: MarketPrice | null) {
  if (!price) return '가격 준비 중';
  const label = inferPriceLabel(price);
  const baseLabels: Record<PriceLabel, string> = {
    latest: '최신가',
    close: '종가',
    delayed: '지연 가능',
    fallback: '참고가',
    unavailable: '가격 준비 중',
  };
  const base = baseLabels[label] ?? '가격 준비 중';
  if (price.isDelayed && label !== 'delayed') return `${base} · 지연 가능`;
  return base;
}

export function priceBasisLabel(price?: MarketPrice | null) {
  if (!price) return '';
  if (price.open) return '시작가 대비';
  if (price.previousClose) return '전일 종가 대비';
  return '기준가 대비';
}

export function priceDisplay(price?: MarketPrice | null) {
  if (!price) {
    return {
      amount: '가격 준비 중',
      percent: '',
      status: '가격 준비 중',
      basis: '',
    };
  }

  const normalized = normalizeMarketPrice(price);
  if (normalized.priceLabel === 'fallback') {
    return {
      amount: '예시 가격',
      percent: '',
      status: '실제 가격 연결 전',
      basis: '',
    };
  }
  if (normalized.priceLabel === 'unavailable') {
    return {
      amount: '가격 준비 중',
      percent: '',
      status: '데이터 없음',
      basis: '',
    };
  }
  return {
    amount: normalized.currency === 'KRW' ? `${formatPriceAmount(normalized.price)}원` : `$${formatPriceAmount(normalized.price)}`,
    percent: normalized.changePercent,
    status: priceStatusLabel(normalized),
    basis: priceBasisLabel(normalized),
  };
}

function formatPriceAmount(value: string) {
  const parsed = parseNumeric(value);
  if (!Number.isFinite(parsed)) return value;
  return new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: parsed >= 1000 ? 0 : 2,
  }).format(parsed);
}

export function findFallbackPrice(ticker?: string, companyId?: string, prices: MarketPrice[] = mockMarketPrices) {
  const normalized = normalizeTicker(ticker);
  return (
    prices.find((price) => companyId && price.companyId === companyId) ??
    prices.find((price) => normalizeTicker(price.ticker) === normalized) ??
    mockMarketPrices.find((price) => companyId && price.companyId === companyId) ??
    mockMarketPrices.find((price) => normalizeTicker(price.ticker) === normalized) ??
    null
  );
}

export async function fetchPriceByCompany(company: Company): Promise<MarketPrice | null> {
  // 무료 공식 시세 연동 전까지는 mock/fallback을 사용합니다.
  // 실제 운영에서는 서버 스크립트가 market_prices 테이블을 갱신하고, 프론트는 안전한 read endpoint를 붙이면 됩니다.
  return findFallbackPrice(company.ticker, company.id);
}

export async function fetchPriceByPick(pick: StockAutopsyPick): Promise<MarketPrice | null> {
  return findFallbackPrice(pick.ticker, pick.relatedCompanyId);
}

export function getPriceForCompany(company: Company, prices?: MarketPrice[]) {
  return findFallbackPrice(company.ticker, company.id, prices);
}

export function getPriceForPick(pick: StockAutopsyPick, prices?: MarketPrice[]) {
  return findFallbackPrice(pick.ticker, pick.relatedCompanyId, prices);
}

export function getPriceForTicker(ticker?: string, companyId?: string, prices?: MarketPrice[]) {
  return findFallbackPrice(ticker, companyId, prices);
}

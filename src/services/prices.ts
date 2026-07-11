import { mockMarketPrices } from '../data.js';
import type { Company, MarketPrice, PriceLabel, StockAutopsyPick } from '../data.js';

export type PriceDirection = 'up' | 'down' | 'flat' | 'pending';

function normalizeTicker(ticker?: string) {
  return ticker?.trim().toUpperCase();
}

function tickerAliases(ticker?: string) {
  const normalized = normalizeTicker(ticker);
  if (!normalized) return [];
  const aliases = new Set([normalized]);
  if (normalized === 'BRK.B') aliases.add('BRK-B');
  if (normalized === 'BRK-B') aliases.add('BRK.B');
  if (normalized === 'SQ') aliases.add('XYZ');
  return Array.from(aliases);
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

function isRealPrice(price?: MarketPrice | null) {
  if (!price) return false;
  const label = inferPriceLabel(price);
  return label !== 'fallback' && label !== 'unavailable' && Number.isFinite(parseNumeric(price.price));
}

function priceBasis(price: MarketPrice) {
  const open = parseNumeric(price.open);
  if (Number.isFinite(open) && open !== 0) {
    return { value: open, label: '시작가 대비' };
  }

  const previousClose = parseNumeric(price.previousClose);
  if (Number.isFinite(previousClose) && previousClose !== 0) {
    return { value: previousClose, label: '전일 종가 대비' };
  }

  return { value: Number.NaN, label: '기준가 없음' };
}

function normalizeMarketPrice(price: MarketPrice): MarketPrice {
  const current = parseNumeric(price.price);
  const basis = priceBasis(price);
  const computedPercent =
    Number.isFinite(current) && Number.isFinite(basis.value) && basis.value !== 0 ? formatPercent(((current - basis.value) / basis.value) * 100) : '';
  const label = inferPriceLabel(price);

  return {
    ...price,
    priceLabel: label,
    close: price.close ?? (label === 'close' ? price.price : undefined),
    changePercent: computedPercent,
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
    const response = await fetch(`/api/market-prices?limit=${Math.min(Math.max(limit, 1), 200)}&include=market-brief`);
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
  const value = parseNumeric(normalizeMarketPrice(price).changePercent);
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
    fallback: '가격 확인 필요',
    unavailable: '가격 준비 중',
  };
  const base = baseLabels[label] ?? '가격 준비 중';
  if (price.isDelayed && label !== 'delayed') return `${base} · 지연 가능`;
  return base;
}

export function priceBasisLabel(price?: MarketPrice | null) {
  if (!price) return '';
  return priceBasis(price).label;
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
      amount: '가격 준비 중',
      percent: '',
      status: '가격 확인 필요',
      basis: '공식 시세 저장 전',
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
    amount: normalized.currency === 'KRW'
      ? `${formatPriceAmount(normalized.price, { maximumFractionDigits: 0 })}원`
      : `$${formatPriceAmount(normalized.price, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    percent: normalized.changePercent,
    status: priceStatusLabel(normalized),
    basis: priceBasisLabel(normalized),
  };
}

function formatPriceAmount(
  value: string,
  options: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {},
) {
  const parsed = parseNumeric(value);
  if (!Number.isFinite(parsed)) return value;
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: options.minimumFractionDigits,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  }).format(parsed);
}

export function findFallbackPrice(ticker?: string, companyId?: string, prices: MarketPrice[] = mockMarketPrices) {
  const aliases = tickerAliases(ticker);
  const byCompany = (price: MarketPrice) => Boolean(companyId && price.companyId === companyId);
  const byTicker = (price: MarketPrice) => aliases.includes(normalizeTicker(price.ticker) ?? '');
  return (
    prices.find((price) => byCompany(price) && isRealPrice(price)) ??
    prices.find((price) => byTicker(price) && isRealPrice(price)) ??
    prices.find((price) => byCompany(price)) ??
    prices.find((price) => byTicker(price)) ??
    mockMarketPrices.find((price) => byCompany(price)) ??
    mockMarketPrices.find((price) => byTicker(price)) ??
    null
  );
}

export async function fetchPriceByCompany(company: Company): Promise<MarketPrice | null> {
  // 서버에서 market_prices를 읽은 뒤 실제 시세가 없을 때만 fallback 상태를 씁니다.
  return findFallbackPrice(company.ticker, company.id);
}

export async function fetchPriceByPick(pick: StockAutopsyPick): Promise<MarketPrice | null> {
  return findFallbackPrice(pick.ticker, pick.relatedCompanyId);
}

export function getPriceForCompany(company: Company, prices?: MarketPrice[]) {
  if (prices && prices.length === 0) return undefined;
  return findFallbackPrice(company.ticker, company.id, prices);
}

export function getPriceForPick(pick: StockAutopsyPick, prices?: MarketPrice[]) {
  if (prices && prices.length === 0) return undefined;
  return findFallbackPrice(pick.ticker, pick.relatedCompanyId, prices);
}

export function getPriceForTicker(ticker?: string, companyId?: string, prices?: MarketPrice[]) {
  if (prices && prices.length === 0) return undefined;
  return findFallbackPrice(ticker, companyId, prices);
}

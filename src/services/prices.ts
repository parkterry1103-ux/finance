import { mockMarketPrices } from '../data.js';
import type { Company, MarketPrice, StockAutopsyPick } from '../data.js';

export type PriceDirection = 'up' | 'down' | 'flat' | 'pending';

function normalizeTicker(ticker?: string) {
  return ticker?.trim().toUpperCase();
}

export function priceDirection(price?: MarketPrice | null): PriceDirection {
  if (!price) return 'pending';
  const value = Number(price.changePercent.replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(value) || value === 0) return 'flat';
  return value > 0 ? 'up' : 'down';
}

export function priceStatusLabel(price?: MarketPrice | null) {
  if (!price) return '가격 준비 중';
  if (price.isDelayed) return price.marketStatus === 'closed' ? '장마감 종가 · 지연 가능' : '지연 가능';

  const labels: Record<MarketPrice['marketStatus'], string> = {
    open: '장중',
    closed: '장마감 종가',
    premarket: '개장 전',
    afterhours: '시간외',
    delayed: '지연 가능',
    unknown: '상태 확인 필요',
  };
  return labels[price.marketStatus] ?? '상태 확인 필요';
}

export function findFallbackPrice(ticker?: string, companyId?: string) {
  const normalized = normalizeTicker(ticker);
  return (
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

export function getPriceForCompany(company: Company) {
  return findFallbackPrice(company.ticker, company.id);
}

export function getPriceForPick(pick: StockAutopsyPick) {
  return findFallbackPrice(pick.ticker, pick.relatedCompanyId);
}

export function getPriceForTicker(ticker?: string, companyId?: string) {
  return findFallbackPrice(ticker, companyId);
}

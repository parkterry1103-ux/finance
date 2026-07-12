import type { MarketRelationsResponse } from '../content/relations/types.js';

let marketRelationsRequest: Promise<MarketRelationsResponse> | null = null;

function unavailableResponse(): MarketRelationsResponse {
  return {
    ok: false,
    partial: false,
    fetchedAt: new Date().toISOString(),
    relations: [],
    errors: [],
    methodology: { correlation: 'pearson', usesChanges: true, minimumSampleSize: 8 },
    error: 'MARKET_RELATIONS_UNAVAILABLE',
  };
}

export function fetchMarketRelations(): Promise<MarketRelationsResponse> {
  if (marketRelationsRequest) return marketRelationsRequest;
  marketRelationsRequest = fetch('/api/market-relations')
    .then(async (response) => {
      const payload = await response.json().catch(() => null);
      if (!payload || typeof payload !== 'object' || !Array.isArray(payload.relations)) return unavailableResponse();
      return {
        ok: Boolean(payload.ok),
        partial: Boolean(payload.partial),
        fetchedAt: typeof payload.fetchedAt === 'string' ? payload.fetchedAt : new Date().toISOString(),
        relations: payload.relations,
        errors: Array.isArray(payload.errors) ? payload.errors : [],
        methodology: payload.methodology?.correlation === 'pearson'
          ? payload.methodology
          : { correlation: 'pearson', usesChanges: true, minimumSampleSize: 8 },
        error: typeof payload.error === 'string' ? payload.error : undefined,
      } as MarketRelationsResponse;
    })
    .catch(() => unavailableResponse());
  return marketRelationsRequest;
}

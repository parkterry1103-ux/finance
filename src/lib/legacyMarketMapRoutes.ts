const legacyCategoryDemandSupply: Record<string, string> = {
  'us-semiconductors': 'semiconductor-fab-infrastructure-demand-supply',
  'datacenter-power-cooling': 'data-center-power-cooling-demand-supply',
  'reconstruction-infrastructure': 'copper-grid-metals-demand-supply',
  'semiconductor-cluster-infrastructure': 'grid-equipment-demand-supply',
};

export const legacyMarketMapPaths = [
  '/ko/market-map',
  '/market-map',
  ...Object.keys(legacyCategoryDemandSupply).flatMap((id) => [`/ko/category/${id}`, `/category/${id}`]),
];

export function resolveLegacyMarketMapRoute(pathname: string) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (normalized === '/ko/market-map') return '/ko/demand-supply';
  if (normalized === '/market-map') return '/demand-supply';
  const categoryMatch = normalized.match(/^\/(ko\/)?category\/([^/]+)$/);
  if (!categoryMatch) return null;
  const demandSupplyId = legacyCategoryDemandSupply[decodeURIComponent(categoryMatch[2])];
  if (!demandSupplyId) return null;
  const localePrefix = categoryMatch[1] ? '/ko' : '';
  return `${localePrefix}/demand-supply?industry=${encodeURIComponent(demandSupplyId)}`;
}

export function replaceLegacyMarketMapLocation() {
  const replacement = resolveLegacyMarketMapRoute(window.location.pathname);
  if (!replacement) return null;
  window.history.replaceState({}, '', replacement);
  return replacement;
}

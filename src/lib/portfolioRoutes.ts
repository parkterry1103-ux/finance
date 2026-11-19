// Keep older bookmarks useful without exposing unfinished collection screens.
// Source records and API handlers remain unchanged.
export function resolvePortfolioRoute(route: string): string | null {
  const pathname = route.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/';
  if (/^\/(?:ko\/)?(?:macro-dashboard|market-relations)$/.test(pathname)) return '/ko/demand-supply';
  if (/^\/(?:ko\/)?disclosures$/.test(pathname)) return '/ko/company-events';
  if (/^\/(?:ko\/)?picks(?:\/.*)?$/.test(pathname) || /^\/stock-autopsy-picks(?:\/.*)?$/.test(pathname)) return '/ko/insights?tab=stock';
  if (/^\/(?:ko\/)?(?:ownership|ownership-trades|analysis)(?:\/.*)?$/.test(pathname) || pathname === '/ko/learn/financials') return '/ko/companies';
  if (pathname === '/ko/lab/cases/pilot-001') return '/ko/insights?tab=stock';
  return null;
}

export function replacePortfolioLocation() {
  const replacement = resolvePortfolioRoute(`${window.location.pathname}${window.location.search}${window.location.hash}`);
  if (replacement) window.history.replaceState({}, '', replacement);
  return replacement;
}

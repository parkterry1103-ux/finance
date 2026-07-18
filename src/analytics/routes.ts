import type { AnalyticsRoute } from './types.js';

function decodeSegment(value: string | undefined) {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return undefined;
  }
}

function cleanPath(pathname: string) {
  const path = String(pathname || '/').split('?')[0].split('#')[0];
  if (path === '/') return '/ko/';
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

export function resolveAnalyticsRoute(pathname: string): AnalyticsRoute {
  const normalizedPath = cleanPath(pathname);
  if (normalizedPath === '/ko' || normalizedPath === '/ko/') {
    return { pageType: 'home', routeTemplate: '/ko/', normalizedPath: '/ko/' };
  }
  if (normalizedPath === '/ko/insights') {
    return { pageType: 'insights_index', routeTemplate: '/ko/insights', normalizedPath };
  }

  const stock = normalizedPath.match(/^\/ko\/insights\/stock\/([^/]+)$/);
  if (stock) return {
    pageType: 'stock_dissection', routeTemplate: '/ko/insights/stock/:slug', normalizedPath,
    contentType: 'stock_dissection', contentSlug: decodeSegment(stock[1]),
  };

  const threeReads = normalizedPath.match(/^\/ko\/insights\/3reads\/([^/]+)$/);
  if (threeReads) return {
    pageType: 'wall_street_edition', routeTemplate: '/ko/insights/3reads/:slug', normalizedPath,
    contentType: 'wall_street_edition', contentSlug: decodeSegment(threeReads[1]),
  };

  if (normalizedPath === '/ko/companies') {
    return { pageType: 'other', routeTemplate: '/ko/companies', normalizedPath };
  }

  const researchReport = normalizedPath.match(/^\/ko\/companies\/([^/]+)\/report$/);
  if (researchReport) return {
    pageType: 'research_report', routeTemplate: '/ko/companies/:companySlug/report', normalizedPath,
    companySlug: decodeSegment(researchReport[1]), contentType: 'research_report',
  };

  const financials = normalizedPath.match(/^\/ko\/companies\/([^/]+)\/financials$/);
  if (financials) return {
    pageType: 'financials', routeTemplate: '/ko/companies/:companySlug/financials', normalizedPath,
    companySlug: decodeSegment(financials[1]), contentType: 'financial_pivot',
  };

  const valuation = normalizedPath.match(/^\/ko\/companies\/([^/]+)\/valuation$/);
  if (valuation) return {
    pageType: 'valuation', routeTemplate: '/ko/companies/:companySlug/valuation', normalizedPath,
    companySlug: decodeSegment(valuation[1]), contentType: 'valuation',
  };

  const company = normalizedPath.match(/^\/ko\/companies\/([^/]+)$/);
  if (company) return {
    pageType: 'company', routeTemplate: '/ko/companies/:companySlug', normalizedPath,
    companySlug: decodeSegment(company[1]), contentType: 'company_brief',
  };

  if (normalizedPath === '/ko/macro-dashboard') {
    return { pageType: 'macro', routeTemplate: '/ko/macro-dashboard', normalizedPath };
  }

  return { pageType: 'other', routeTemplate: normalizedPath || '/ko/', normalizedPath: normalizedPath || '/ko/' };
}

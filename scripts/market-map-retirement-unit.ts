import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { primaryNavigationItems } from '../src/content/home/index.js';
import { legacyMarketMapPaths, resolveLegacyMarketMapRoute } from '../src/lib/legacyMarketMapRoutes.js';
import { resolvePortfolioRoute } from '../src/lib/portfolioRoutes.js';

let checks = 0;
function check(condition: unknown, label: string) {
  checks += 1;
  if (!condition) throw new Error(`market-map retirement unit failed: ${label}`);
}

const expectedQueries = ['company=nvidia', 'view=companies', 'region=us', 'density=all', 'relationType=production-link', 'relation=legacy-id'];
legacyMarketMapPaths.forEach((path) => {
  check(Boolean(resolveLegacyMarketMapRoute(path)), `${path} resolves`);
  expectedQueries.forEach((query) => {
    const url = new URL(`${path}?${query}`, 'https://finance1-flax.vercel.app');
    check(Boolean(resolveLegacyMarketMapRoute(url.pathname)), `${path} query ${query}`);
  });
});
check(resolveLegacyMarketMapRoute('/ko/market-map') === '/ko/demand-supply', 'Korean hub replacement');
check(resolveLegacyMarketMapRoute('/market-map') === '/demand-supply', 'English hub replacement');
check(resolveLegacyMarketMapRoute('/ko/category/not-a-retired-map') === null, 'unknown category untouched');
check(primaryNavigationItems.length === 4, 'four primary navigation items including personal records');
check(primaryNavigationItems.filter((item) => item.href === '/ko/records').length === 1, 'one records archive entry');
check(primaryNavigationItems.every((item) => !item.href.includes('market-map')), 'no public market-map navigation');
for (const [route, target] of [
  ['/ko/macro-dashboard', '/ko/demand-supply'],
  ['/ko/market-relations?relation=industrial-copper&period=1y', '/ko/demand-supply'],
  ['/ko/disclosures', '/ko/company-events'],
  ['/ko/picks', '/ko/insights?tab=stock'],
  ['/ko/picks/archive', '/ko/insights?tab=stock'],
  ['/ko/picks/old-pick', '/ko/insights?tab=stock'],
  ['/ko/ownership', '/ko/companies'],
  ['/ko/analysis/us-semiconductors-nvidia', '/ko/companies'],
  ['/ko/lab/cases/pilot-001', '/ko/insights?tab=stock'],
] as const) check(resolvePortfolioRoute(route) === target, `portfolio replacement ${route}`);
for (const route of ['/ko/', '/ko/insights?tab=stock', '/ko/companies/nvidia', '/ko/companies/nvidia/valuation', '/ko/reports', '/ko/records', '/ko/lab/cases/practice-2026-11-06-intel-market-industry-risk']) check(resolvePortfolioRoute(route) === null, `completed route retained ${route}`);

const appSource = readFileSync(join(process.cwd(), 'src', 'App.tsx'), 'utf8');
const profileSource = readFileSync(join(process.cwd(), 'src', 'components', 'company-profiles', 'CompanyProfiles.tsx'), 'utf8');
const demandSource = readFileSync(join(process.cwd(), 'src', 'components', 'demand-supply', 'DemandSupplyMatrix.tsx'), 'utf8');
const eventsSource = readFileSync(join(process.cwd(), 'src', 'components', 'company-events', 'CompanyEventsRadar.tsx'), 'utf8');
const dailyEntrySource = readFileSync(join(process.cwd(), 'src', 'content', 'daily-market', 'entries.ts'), 'utf8');
const pickSelectorSource = readFileSync(join(process.cwd(), 'src', 'content', 'picks', 'selectors.ts'), 'utf8');
const packageSource = readFileSync(join(process.cwd(), 'package.json'), 'utf8');
const vercelConfig = JSON.parse(readFileSync(join(process.cwd(), 'vercel.json'), 'utf8')) as {
  rewrites?: Array<{ source?: string; destination?: string }>;
};
const hostedSpaRoutes = new Set(
  (vercelConfig.rewrites ?? [])
    .filter((rewrite) => rewrite.destination === '/')
    .map((rewrite) => rewrite.source),
);
check(!/@xyflow\/react|ReactFlow/.test(appSource), 'ReactFlow runtime removed');
check(!/content\/market-map-relations/.test(appSource), 'relation registry runtime consumer removed');
check((appSource.match(/replacePortfolioLocation\(\)/g) ?? []).length === 2, 'portfolio replacements applied on initial load and browser history');
const flowArchiveSource = readFileSync(join(process.cwd(), 'src/routes/DemandSupplyRoute.tsx'), 'utf8');
check(/IndustryFlowCard/.test(flowArchiveSource) && !/DemandSupplyMatrix|fetchMacroIndicators/.test(flowArchiveSource), 'industry archive retains complete flows without unavailable live matrix');
check(!/시장지도|href=[^\n>]*market-map/.test(`${profileSource}\n${demandSource}\n${eventsSource}\n${dailyEntrySource}`), 'public market-map copy and CTA removed');
check(!/marketMapItems|시장 지도 보기/.test(pickSelectorSource), 'available and planned map card registry removed');
check(!packageSource.includes('@xyflow/react'), 'ReactFlow dependency removed');
check(hostedSpaRoutes.has('/market-map'), 'English retired hub reaches the SPA in Production');
check(hostedSpaRoutes.has('/category/:path*'), 'English retired category aliases reach the SPA in Production');
check(hostedSpaRoutes.has('/demand-supply'), 'English replacement route is refresh-safe in Production');

console.log(`✓ 시장지도 폐기 unit ${checks}개 검증`);

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homeNavigationGroups } from '../src/content/home/index.js';
import { legacyMarketMapPaths, resolveLegacyMarketMapRoute } from '../src/lib/legacyMarketMapRoutes.js';

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
check(homeNavigationGroups.length === 4, 'four navigation groups');
check(homeNavigationGroups.flatMap((group) => group.items).every((item) => !item.href.includes('market-map')), 'no public market-map navigation');

const appSource = readFileSync(join(process.cwd(), 'src', 'App.tsx'), 'utf8');
const profileSource = readFileSync(join(process.cwd(), 'src', 'components', 'company-profiles', 'CompanyProfiles.tsx'), 'utf8');
const demandSource = readFileSync(join(process.cwd(), 'src', 'components', 'demand-supply', 'DemandSupplyMatrix.tsx'), 'utf8');
const eventsSource = readFileSync(join(process.cwd(), 'src', 'components', 'company-events', 'CompanyEventsRadar.tsx'), 'utf8');
const dailyEntrySource = readFileSync(join(process.cwd(), 'src', 'content', 'daily-market', 'entries.ts'), 'utf8');
const pickSelectorSource = readFileSync(join(process.cwd(), 'src', 'content', 'picks', 'selectors.ts'), 'utf8');
const packageSource = readFileSync(join(process.cwd(), 'package.json'), 'utf8');
check(!/@xyflow\/react|ReactFlow/.test(appSource), 'ReactFlow runtime removed');
check(!/content\/market-map-relations/.test(appSource), 'relation registry runtime consumer removed');
check(!/시장지도|href=[^\n>]*market-map/.test(`${profileSource}\n${demandSource}\n${eventsSource}\n${dailyEntrySource}`), 'public market-map copy and CTA removed');
check(!/marketMapItems|시장 지도 보기/.test(pickSelectorSource), 'available and planned map card registry removed');
check(!packageSource.includes('@xyflow/react'), 'ReactFlow dependency removed');

console.log(`✓ 시장지도 폐기 unit ${checks}개 검증`);

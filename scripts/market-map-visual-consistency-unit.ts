import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  filterMarketMapDefinitions,
  marketMapIndustryNodeOrder,
  marketMapIndustryQuestions,
  marketMapDefinitions,
  marketMapGraphRegionForCountryLabel,
  resolveMarketMapCategory,
  resolveMarketMapGraphRegion,
  resolveMarketMapGraphViewMode,
  resolveMarketMapRegion,
  selectConnectedMarketMapNodeIds,
  selectMarketMapGraphCompanyIds,
} from '../src/content/market-map-details/index.js';
import { companies } from '../src/data.js';

let checks = 0;
const check = (condition: unknown, message: string) => {
  if (!condition) throw new Error(`market map visual consistency unit failed: ${message}`);
  checks += 1;
};

const available = marketMapDefinitions.filter((definition) => definition.status === 'available');
const planned = marketMapDefinitions.filter((definition) => definition.status === 'planned');
check(available.length === 4, 'exactly four available maps');
check(planned.length === 2, 'planned maps separated');
check(available.every((definition) => definition.route?.startsWith('/ko/category/')), 'available routes');
check(planned.every((definition) => !definition.route), 'planned routes omitted');
check(new Set(marketMapDefinitions.map((definition) => definition.order)).size === marketMapDefinitions.length, 'unique order');
check(new Set(available.map((definition) => definition.category)).size === 4, 'four available categories');

check(resolveMarketMapRegion('us') === 'us-focused', 'US region query');
check(resolveMarketMapRegion('kr') === 'kr-focused', 'KR region query');
check(resolveMarketMapRegion('global') === 'global', 'global region query');
check(resolveMarketMapRegion('invalid') === 'all', 'invalid region fallback');
check(resolveMarketMapCategory('semiconductor-ai') === 'semiconductor-ai', 'category query');
check(resolveMarketMapCategory('invalid') === 'all', 'invalid category fallback');
check(filterMarketMapDefinitions(marketMapDefinitions, 'us-focused', 'all').every((definition) => definition.region === 'us-focused'), 'region filter');
check(filterMarketMapDefinitions(marketMapDefinitions, 'all', 'power-datacenter').every((definition) => definition.category === 'power-datacenter'), 'industry filter');
check(filterMarketMapDefinitions(marketMapDefinitions, 'all', 'all').map((definition) => definition.order).join('|') === '1|2|3|4|5|6', 'registry order');

check(marketMapGraphRegionForCountryLabel('미국') === 'us', 'US company region');
check(marketMapGraphRegionForCountryLabel('한국') === 'kr', 'KR company region');
check(marketMapGraphRegionForCountryLabel('대만') === 'other', 'TSMC remains other');
check(marketMapGraphRegionForCountryLabel('네덜란드') === 'other', 'ASML remains other');
check(marketMapGraphRegionForCountryLabel('프랑스') === 'other', 'Schneider remains other');
check(marketMapGraphRegionForCountryLabel(undefined) === 'other', 'unknown remains explicit other');
check(resolveMarketMapGraphRegion('invalid') === 'all', 'invalid graph region fallback');
check(resolveMarketMapGraphViewMode('invalid') === 'selected', 'invalid view mode fallback');
check(resolveMarketMapGraphViewMode('fit') === 'fit', 'fit view mode');

const fixtureCompanies = [
  { id: 'us-company', countryLabel: '미국' },
  { id: 'kr-company', countryLabel: '한국' },
  { id: 'global-company', countryLabel: '대만' },
];
check(selectMarketMapGraphCompanyIds(fixtureCompanies, 'all').length === 3, 'all company filter');
check(selectMarketMapGraphCompanyIds(fixtureCompanies, 'kr').join('|') === 'kr-company', 'KR company filter');
check(selectMarketMapGraphCompanyIds(fixtureCompanies, 'other').join('|') === 'global-company', 'other company filter');
check(selectMarketMapGraphCompanyIds([], 'us').length === 0, 'empty country filter');

const selectedIds = selectConnectedMarketMapNodeIds('selected', [
  { source: 'left', target: 'selected' },
  { source: 'selected', target: 'right' },
  { source: 'other', target: 'far' },
]);
check(selectedIds.includes('selected') && selectedIds.includes('left') && selectedIds.includes('right'), 'selected company neighborhood');
check(!selectedIds.includes('far'), 'unconnected node excluded from selected view');

available.forEach((definition) => {
  check(definition.industryStages?.length === 5, `${definition.id} five taxonomy stages`);
  check(definition.industryStages?.map((stage) => stage.kind).join('|') === marketMapIndustryNodeOrder.join('|'), `${definition.id} taxonomy order`);
  check(definition.industryStages?.every((stage) => stage.question === marketMapIndustryQuestions[stage.kind]), `${definition.id} shared questions`);
  check(Boolean(definition.companyNetwork?.companyIds.length), `${definition.id} company network`);
  check(definition.companyNetwork?.relations.every((relation) => definition.companyNetwork?.companyIds.includes(relation.sourceCompanyId) && definition.companyNetwork.companyIds.includes(relation.targetCompanyId)), `${definition.id} company-only relations`);
});
const datacenterCompanyIds = companies.filter((company) => company.sectorId === 'datacenter-power-cooling').map((company) => company.id);
check(datacenterCompanyIds.length === 4, 'datacenter registry excludes six industry concept nodes');

const templateSource = readFileSync(join(process.cwd(), 'src', 'components', 'market-map', 'MarketMapDetailTemplate.tsx'), 'utf8');
const appSource = readFileSync(join(process.cwd(), 'src', 'App.tsx'), 'utf8');
const styleSource = readFileSync(join(process.cwd(), 'src', 'styles.css'), 'utf8');
check(appSource.includes('상세 지도 보기'), 'shared hub CTA label');
check(templateSource.includes('산업 구조') && templateSource.includes('기업 연결'), 'explicit dual view labels');
check(templateSource.includes('기업 노드만 보는 관계망'), 'company-only view copy');
check(templateSource.includes('MarketMapGraphToolbar'), 'shared graph toolbar');
check(templateSource.includes('MarketMapGraphLegend'), 'shared graph legend');
check(appSource.includes('data-node-taxonomy="company-only"'), 'company-only graph marker');
check(styleSource.includes('.market-map-library-card .market-map-library-cta'), 'shared hub CTA CSS');
check(styleSource.includes('background: var(--home-blue, #2563eb) !important'), 'CTA fallback background');
check(!/market-map-template-flow[^}]*writing-mode\s*:/s.test(styleSource), 'no vertical flow writing mode');
check(styleSource.includes("[data-flow-count='5']"), 'five-step desktop layout');
check(styleSource.includes('height: 680px') && styleSource.includes('height: 560px'), 'shared canvas heights');

console.log(`✓ market map visual consistency unit ${checks}개 통과`);

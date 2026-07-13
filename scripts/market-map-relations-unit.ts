import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  companies,
  reconstructionInfrastructureMap,
  semiconductorClusterInfrastructureMap,
} from '../src/data.js';
import { marketMapDefinitions } from '../src/content/market-map-details/index.js';
import {
  filterMarketMapRelations,
  marketMapCompanyRelations,
  marketMapEvidenceLevelLabels,
  marketMapRelationTypeLabels,
  marketMapRelationTypeOrder,
  resolveMarketMapRelationDensity,
  resolveMarketMapRelationQuery,
  resolveMarketMapRelationTypeFilter,
  selectMarketMapRelationGraph,
  selectMarketMapRelationSourceRefs,
  sortAccessibleMarketMapRelations,
  validateMarketMapRelationRegistry,
  type MarketMapCompanyRelation,
} from '../src/content/market-map-relations/index.js';
import { sourceRegistry } from '../src/content/sources/index.js';

let checks = 0;
const check = (condition: unknown, message: string) => {
  if (!condition) throw new Error(`market map relations unit failed: ${message}`);
  checks += 1;
};

const fixtureContext = {
  validMapIds: new Set(['fixture-map']),
  validCompanyIds: new Set(['selected', 'us-peer', 'kr-peer', 'global-peer']),
  validSourceIds: new Set(['official', 'industry']),
  officialSourceIds: new Set(['official']),
  now: new Date('2026-07-14T00:00:00Z'),
};
const fixtureRelation = (overrides: Partial<MarketMapCompanyRelation> = {}): MarketMapCompanyRelation => ({
  id: 'fixture-demand',
  mapId: 'fixture-map',
  fromCompanyId: 'selected',
  toCompanyId: 'us-peer',
  direction: 'directed',
  relationType: 'demand-link',
  evidenceLevel: 'contextual',
  shortLabel: '수요 연결',
  explanation: '두 역할의 산업 수요를 함께 살펴봅니다.',
  caution: '특정 직접 계약을 의미하지 않습니다.',
  sourceRefs: ['industry'],
  reviewedAt: '2026-07-13',
  ...overrides,
});

check(marketMapRelationTypeOrder.length === 6, 'exactly six relation types');
check(Object.keys(marketMapRelationTypeLabels).length === 6, 'six relation type labels');
check(marketMapRelationTypeLabels['direct-contract'] === '직접 계약 확인', 'direct contract label');
check(marketMapRelationTypeLabels['official-supply'] === '공식 공급 관계', 'official supply label');
check(marketMapRelationTypeLabels['market-context'] === '시장 흐름 참고', 'market context label');
check(Object.keys(marketMapEvidenceLevelLabels).length === 3, 'exactly three evidence labels');
check(marketMapEvidenceLevelLabels.confirmed === '공식 확인', 'confirmed evidence label');
check(marketMapEvidenceLevelLabels.contextual === '산업 맥락', 'contextual evidence label');
check(marketMapEvidenceLevelLabels['review-needed'] === '추가 확인 필요', 'review-needed label');

const validDirect = fixtureRelation({
  id: 'direct', relationType: 'direct-contract', evidenceLevel: 'confirmed', sourceRefs: ['official'],
});
check(validateMarketMapRelationRegistry([validDirect], fixtureContext).length === 0, 'valid direct-contract fixture');
check(validateMarketMapRelationRegistry([fixtureRelation({ id: 'direct-invalid', relationType: 'direct-contract' })], fixtureContext)
  .some((issue) => issue.startsWith('confirmed-type-evidence:')), 'direct-contract validation');
const validOfficialSupply = fixtureRelation({
  id: 'supply', relationType: 'official-supply', evidenceLevel: 'confirmed', sourceRefs: ['official'],
});
check(validateMarketMapRelationRegistry([validOfficialSupply], fixtureContext).length === 0, 'valid official-supply fixture');
check(validateMarketMapRelationRegistry([fixtureRelation({ id: 'supply-invalid', relationType: 'official-supply', evidenceLevel: 'review-needed' })], fixtureContext)
  .some((issue) => issue.startsWith('confirmed-type-evidence:')), 'official-supply validation');
check(validateMarketMapRelationRegistry([fixtureRelation({ id: 'confirmed-no-official', evidenceLevel: 'confirmed' })], fixtureContext)
  .some((issue) => issue.startsWith('confirmed-source:')), 'confirmed official source requirement');
check(validateMarketMapRelationRegistry([fixtureRelation()], fixtureContext).length === 0, 'contextual relation fixture');
const reviewRelation = fixtureRelation({
  id: 'review', toCompanyId: 'kr-peer', direction: 'contextual', relationType: 'market-context', evidenceLevel: 'review-needed',
});
check(validateMarketMapRelationRegistry([reviewRelation], fixtureContext).length === 0, 'review-needed relation fixture');

const unrelatedRelation = fixtureRelation({ id: 'unrelated', fromCompanyId: 'kr-peer', toCompanyId: 'global-peer', relationType: 'production-link' });
const fixtureRelations = [fixtureRelation(), reviewRelation, unrelatedRelation];
const coreRelations = filterMarketMapRelations(fixtureRelations, { selectedCompanyId: 'selected', density: 'core', relationType: 'all' });
check(coreRelations.length === 1 && coreRelations[0].id === 'fixture-demand', 'core relation is selected company 1-hop');
check(!coreRelations.some((relation) => relation.evidenceLevel === 'review-needed'), 'review-needed excluded from core');
check(filterMarketMapRelations(fixtureRelations, { selectedCompanyId: 'selected', density: 'all', relationType: 'all' }).length === 3, 'all relations calculation');
check(filterMarketMapRelations([], { selectedCompanyId: 'selected', density: 'core', relationType: 'all' }).length === 0, 'selected company with zero relations');
check(filterMarketMapRelations(fixtureRelations, { selectedCompanyId: 'selected', density: 'all', relationType: 'production-link' }).length === 1, 'relation type filter');

const countryById = new Map([
  ['selected', 'us'], ['us-peer', 'us'], ['kr-peer', 'kr'], ['global-peer', 'other'],
]);
const graphSelection = selectMarketMapRelationGraph({
  relations: fixtureRelations,
  companyIds: ['selected', 'us-peer', 'kr-peer', 'global-peer'],
  companyCountryById: countryById,
  selectedCompanyId: 'selected',
  density: 'all',
  relationType: 'production-link',
  region: 'kr',
});
check(graphSelection.relations.length === 1 && graphSelection.relations[0].relationType === 'production-link', 'region and relation type combined');
check(graphSelection.companyIds.includes('selected'), 'selected company retained');
check(graphSelection.dimmedCompanyIds.includes('global-peer'), 'other region node dimmed');
check(!graphSelection.dimmedCompanyIds.includes('kr-peer'), 'selected region node not dimmed');
const fullGraph = selectMarketMapRelationGraph({
  relations: fixtureRelations,
  companyIds: ['selected', 'us-peer', 'kr-peer', 'global-peer'],
  companyCountryById: countryById,
  selectedCompanyId: 'selected',
  density: 'all',
  relationType: 'all',
  region: 'all',
});
check(fullGraph.companyIds.length === 4 && fullGraph.relations.length === 3, 'full graph includes all companies and relations');

check(resolveMarketMapRelationQuery('fixture-demand', fixtureRelations) === 'fixture-demand', 'valid relation query');
check(resolveMarketMapRelationQuery('missing', fixtureRelations) === null, 'invalid relation query fallback');
check(resolveMarketMapRelationDensity('all') === 'all' && resolveMarketMapRelationDensity('invalid') === 'core', 'density query fallback');
check(resolveMarketMapRelationTypeFilter('demand-link') === 'demand-link' && resolveMarketMapRelationTypeFilter('invalid') === 'all', 'relation type query fallback');
const historyStates = [
  new URLSearchParams('density=all&relationType=production-link'),
  new URLSearchParams('density=core&relationType=all'),
  new URLSearchParams('density=invalid&relationType=invalid'),
].map((params) => [resolveMarketMapRelationDensity(params.get('density')), resolveMarketMapRelationTypeFilter(params.get('relationType'))].join('|'));
check(historyStates.join(',') === 'all|production-link,core|all,core|all', 'back-forward query state selector restoration');
check(sortAccessibleMarketMapRelations([unrelatedRelation, fixtureRelation()])[0].relationType === 'demand-link', 'accessible relation list sorting');
check(selectMarketMapRelationSourceRefs(fixtureRelation({ sourceRefs: ['a', 'b', 'c', 'd'] })).join('|') === 'a|b|c', 'source display maximum three');
check(validateMarketMapRelationRegistry([fixtureRelation(), fixtureRelation({ id: 'duplicate' })], fixtureContext)
  .some((issue) => issue.startsWith('duplicate-relation:')), 'duplicate relation detection');
check(validateMarketMapRelationRegistry([fixtureRelation({ id: 'self', toCompanyId: 'selected' })], fixtureContext)
  .some((issue) => issue.startsWith('self-relation:')), 'self relation detection');

const canonicalCompanyIds = new Set([
  ...companies.map((company) => company.id),
  ...reconstructionInfrastructureMap.companies.map((company) => company.id),
  ...semiconductorClusterInfrastructureMap.companies.map((company) => company.id),
]);
const officialKinds = new Set(['company-release', 'company-ir', 'company-filing', 'sec-filing', 'dart-filing', 'kind-filing', 'government']);
const actualIssues = validateMarketMapRelationRegistry(marketMapCompanyRelations, {
  validMapIds: new Set(marketMapDefinitions.filter((definition) => definition.status === 'available').map((definition) => definition.id)),
  validCompanyIds: canonicalCompanyIds,
  validSourceIds: new Set(Object.keys(sourceRegistry)),
  officialSourceIds: new Set(Object.values(sourceRegistry).filter((source) => officialKinds.has(source.kind)).map((source) => source.id)),
  now: new Date('2026-07-14T00:00:00Z'),
});
check(actualIssues.length === 0, `actual registry validation: ${actualIssues.join(', ')}`);
check(marketMapCompanyRelations.every((relation) => relation.sourceRefs.length >= 1), 'all actual relations have source refs');
check(marketMapCompanyRelations.filter((relation) => relation.evidenceLevel === 'review-needed').length === 4, 'actual review-needed count');
check(marketMapCompanyRelations.filter((relation) => relation.relationType === 'official-supply').length === 1, 'actual official-supply count');
check(marketMapCompanyRelations.filter((relation) => relation.relationType === 'direct-contract').length === 0, 'no unsupported direct-contract relation');

const panelSource = readFileSync(join(process.cwd(), 'src', 'components', 'market-map', 'MarketMapRelationPanel.tsx'), 'utf8');
check(panelSource.includes('특정 직접 계약을 의미하지 않습니다.'), 'non-confirmed direct contract caution visible');
check(panelSource.includes('target="_blank"') && panelSource.includes('rel="noopener noreferrer"'), 'source CTA new-tab safety');

console.log(`✓ market map relations unit ${checks}개 통과`);

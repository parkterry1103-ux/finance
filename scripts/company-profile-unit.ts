import {
  buildCompanyResearchProfile,
  canonicalCompanyProfileId,
  companySearchIndex,
  companyProfileByIdOrSlug,
  companyProfilePathForCompanyId,
  companyProfileSectionVisibility,
  companyProfiles,
  companyResearchProfileList,
  normalizeCompanySearchTerm,
  searchCompanyProfiles,
  validateCompanyDashboardRegistry,
  validateCompanyProfileRegistry,
} from '../src/content/company-profiles/index.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { MarketPrice } from '../src/data.js';
import { loadReleaseGateConfig } from './release-gate-config.js';

let checks = 0;
const releaseConfig = loadReleaseGateConfig();
function check(condition: unknown, label: string) {
  checks += 1;
  if (!condition) throw new Error(`company profile unit failed: ${label}`);
}

check(companyProfiles.length === releaseConfig.content.companyProfiles, 'profile count');
check(companyProfileByIdOrSlug('nvidia')?.companyId === 'us-semiconductors-nvidia', 'profile slug resolve');
check(companyProfileByIdOrSlug('us-semiconductors-nvidia')?.slug === 'nvidia', 'canonical company resolve');
check(companyProfileByIdOrSlug('not-a-company') === undefined, 'invalid slug not found');
check(companyProfiles.map((profile) => profile.order).join('|') === '1|2|3|4|5|6|7|8|9', 'profile order');
check(canonicalCompanyProfileId('kr-semiconductors-sk-hynix') === 'ai-datacenter-sk-hynix', 'SK hynix canonical alias');
check(canonicalCompanyProfileId('datacenter-power-eaton') === 'ai-datacenter-eaton', 'Eaton canonical alias');
check(companyProfilePathForCompanyId('us-energy-grid-eaton') === '/ko/companies/eaton', 'canonical alias path');
check(companySearchIndex.length === companyProfiles.length, 'search index count matches profile registry');
check(new Set(companySearchIndex.map(({ profile }) => profile.slug)).size === companySearchIndex.length, 'search index slug deduplicated');
check(new Set(companySearchIndex.map(({ company }) => company.ticker)).size === companySearchIndex.length, 'search ticker deduplicated');
check(new Set(companySearchIndex.flatMap(({ profile }) => profile.stockCode ? [profile.stockCode] : [])).size === 2, 'search stock code deduplicated');
check(normalizeCompanySearchTerm('  SK  hynix ') === normalizeCompanySearchTerm('SK-Hynix'), 'space and hyphen normalization');
check(normalizeCompanySearchTerm('ＮＶＤＡ') === 'nvda', 'NFKC full-width normalization');
check(normalizeCompanySearchTerm('LG.전자') === 'lg전자', 'punctuation normalization');

const expectedSearches: Array<[string, string]> = [
  ['SK하이닉스', 'sk-hynix'], ['하이닉스', 'sk-hynix'], ['SK hynix', 'sk-hynix'], ['SK-Hynix', 'sk-hynix'], ['000660', 'sk-hynix'],
  ['LG전자', 'lg-electronics'], ['LG Electronics', 'lg-electronics'], ['066570', 'lg-electronics'],
  ['NVIDIA', 'nvidia'], ['nvidia', 'nvidia'], ['엔비디아', 'nvidia'], ['NVDA', 'nvidia'],
  ['Micron', 'micron'], ['마이크론', 'micron'], ['MU', 'micron'],
  ['Dell', 'dell'], ['델', 'dell'], ['DELL', 'dell'],
  ['Eaton', 'eaton'], ['이튼', 'eaton'], ['ETN', 'eaton'],
  ['Meta', 'meta'], ['메타', 'meta'], ['Facebook', 'meta'], ['META', 'meta'],
  ['Supermicro', 'supermicro'], ['Super Micro', 'supermicro'], ['슈퍼마이크로', 'supermicro'], ['SMCI', 'supermicro'],
  ['Netflix', 'netflix'], ['넷플릭스', 'netflix'], ['NFLX', 'netflix'],
];
expectedSearches.forEach(([query, slug]) => check(searchCompanyProfiles(query)[0]?.profile.slug === slug, `search ${query}`));
check(searchCompanyProfiles('NVIDIA').map(({ profile }) => profile.slug).join('|') === searchCompanyProfiles('nvidia').map(({ profile }) => profile.slug).join('|'), 'search case insensitive');
check(searchCompanyProfiles('  SK   hynix  ')[0]?.profile.slug === 'sk-hynix', 'search repeated spaces');
check(searchCompanyProfiles('not-supported-company').length === 0, 'unsupported search empty');
check(searchCompanyProfiles('---').length === 0, 'punctuation-only search empty');
check(searchCompanyProfiles('').length === companyProfiles.length, 'empty search returns all companies');
check(searchCompanyProfiles('a').every((record, index, results) => results.findIndex((candidate) => candidate.profile.slug === record.profile.slug) === index), 'search results deduplicated');
check(searchCompanyProfiles('NVDA')[0]?.company.ticker === 'NVDA', 'ticker exact ranked first');
check(searchCompanyProfiles('000660')[0]?.profile.stockCode === '000660', 'stock code exact ranked first');

const componentSource = readFileSync(join(process.cwd(), 'src', 'components', 'company-profiles', 'CompanyProfiles.tsx'), 'utf8');
const stylesSource = readFileSync(join(process.cwd(), 'src', 'styles.css'), 'utf8');
check(!componentSource.includes('현재 지원 기업 8개'), 'support count not hardcoded');
check(/role="combobox"/.test(componentSource) && /role="listbox"/.test(componentSource) && /role="option"/.test(componentSource), 'combobox aria structure');
check(/ArrowDown/.test(componentSource) && /ArrowUp/.test(componentSource) && /Enter/.test(componentSource) && /Escape/.test(componentSource), 'combobox keyboard controls');
check(!/dangerouslySetInnerHTML/.test(componentSource), 'search does not insert html');

const profiles = companyResearchProfileList();
check(profiles.length === releaseConfig.content.companyProfiles, 'profile list count');
const dell = buildCompanyResearchProfile('dell')!;
check(dell.companyEvents.length === 2 && dell.companyEvents[0].eventDate >= dell.companyEvents[1].eventDate, 'latest two company events');
check(profiles.every((profile) => profile.industryFlows.length <= 2), 'industry flow maximum');
check(profiles.every((profile) => profile.companyRelations.length <= 3), 'related company maximum');
check(profiles.every((profile) => profile.companyRelations.every(({ relation }) => relation.sourceRefs.length >= 1)), 'related company source present');
const nvidia = buildCompanyResearchProfile('nvidia')!;
check(nvidia.companyRelations.map(({ relation }) => relation.relationType).join('|') === 'production-stage|production-stage|same-demand', 'simple relation taxonomy');
check(profiles.every((profile) => profile.companyRelations.every(({ company }) => company.id !== profile.company.id)), 'self relation excluded');
check(profiles.every((profile) => new Set(profile.companyRelations.map(({ company }) => company.id)).size === profile.companyRelations.length), 'related companies deduplicated');
check(profiles.every((profile) => profile.bottlenecks.length <= 2), 'bottleneck maximum');
check(profiles.every((profile) => profile.demandSupply.length <= 2), 'demand supply maximum');
check(profiles.every((profile) => profile.picks.length <= 1), 'pick maximum');
check(profiles.every((profile) => profile.reports.length <= 2), 'report maximum');
check(profiles.every((profile) => profile.sources.length <= 3), 'source maximum');
check(profiles.every((profile) => profile.verifiedMetrics.length <= 3), 'verified metric maximum');
check(validateCompanyDashboardRegistry().length === 0, 'dashboard registry validation');
check(profiles.every((profile) => profile.dashboard.metrics.length <= 6), 'dashboard KPI maximum');
check(profiles.every((profile) => profile.dashboard.charts.length <= 3), 'dashboard chart maximum');
check(profiles.every((profile) => profile.dashboard.importantChanges.length <= 3), 'dashboard important change maximum');
check(profiles.every((profile) => profile.dashboard.macroVariables.length >= 3 && profile.dashboard.macroVariables.length <= 5), 'dashboard macro variable range');
check(profiles.every((profile) => new Set(profile.dashboard.metrics.map((item) => item.id)).size === profile.dashboard.metrics.length), 'dashboard KPI deduplicated');
check(profiles.every((profile) => new Set(profile.dashboard.charts.map((item) => item.id)).size === profile.dashboard.charts.length), 'dashboard charts deduplicated');
check(profiles.every((profile) => new Set(profile.dashboard.macroVariables.map((item) => item.id)).size === profile.dashboard.macroVariables.length), 'dashboard macro variables deduplicated');
check(profiles.every((profile) => profile.dashboard.metrics.every((item) => item.value === null || Number.isFinite(item.value))), 'dashboard numbers finite');
check(profiles.every((profile) => profile.dashboard.metrics.every((item) => item.unit && item.period && item.sourceIds.length)), 'dashboard KPI metadata complete');
check(profiles.every((profile) => profile.dashboard.assessments.length <= 5 && profile.dashboard.assessments.every((item) => item.rationale && (item.evidenceMetricIds.length || item.sourceIds.length))), 'dashboard assessments evidenced');
check(profiles.every((profile) => !JSON.stringify(profile.dashboard).includes('undefined')), 'dashboard does not expose undefined');
check(/<details className="company-dashboard-details">/.test(componentSource), 'dashboard details disclosure');
check(/role="img"/.test(componentSource) && /<div className="sr-only"><table>/.test(componentSource), 'dashboard chart accessible name and table alternative');
check(/\.company-dashboard-main \.company-profile-breadcrumb a,[\s\S]*?min-height: 44px;/.test(stylesSource) && /\.company-dashboard-detail-content \.industry-flow-step__companies a {[\s\S]*?min-width: 44px;[\s\S]*?min-height: 44px;/.test(stylesSource), 'dashboard touch targets at least 44px');
check(buildCompanyResearchProfile('meta')!.companyRelations.length === 0, 'Meta related company empty state');
check(buildCompanyResearchProfile('eaton')!.picks.length === 0, 'Eaton pick omitted');

const priceFixture: MarketPrice = {
  companyId: 'us-semiconductors-nvidia',
  ticker: 'NVDA',
  market: 'NASDAQ',
  price: '120.00',
  open: '118.00',
  change: '+2.00',
  changePercent: '+1.69%',
  currency: 'USD',
  priceLabel: 'latest',
  marketStatus: 'open',
  asOf: '2026-07-14T12:00:00Z',
  source: 'fixture',
  isDelayed: false,
};
const withPrice = buildCompanyResearchProfile('nvidia', [priceFixture])!;
check(companyProfileSectionVisibility(withPrice).showPrice, 'price present');
check(!companyProfileSectionVisibility(nvidia).showPrice, 'price absent section omitted');
check(companyProfileSectionVisibility({ ...nvidia, companyEvents: [] }).showEventEmpty, 'event empty state');
check(!companyProfileSectionVisibility({ ...nvidia, picks: [] }).showPick, 'pick absent section omitted');
check(!companyProfileSectionVisibility({ ...nvidia, verifiedMetrics: [] }).showMetrics, 'metric absent section omitted');
check(validateCompanyProfileRegistry(new Date('2026-07-18T12:00:00Z')).length === 0, 'registry validation');

console.log(`✓ 기업 프로필 unit ${checks}개 검증`);

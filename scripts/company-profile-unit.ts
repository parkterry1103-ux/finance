import {
  buildCompanyResearchProfile,
  canonicalCompanyProfileId,
  companyProfileByIdOrSlug,
  companyProfilePathForCompanyId,
  companyProfileSectionVisibility,
  companyProfiles,
  companyResearchProfileList,
  validateCompanyProfileRegistry,
} from '../src/content/company-profiles/index.js';
import type { MarketPrice } from '../src/data.js';

let checks = 0;
function check(condition: unknown, label: string) {
  checks += 1;
  if (!condition) throw new Error(`company profile unit failed: ${label}`);
}

check(companyProfiles.length === 8, 'profile count');
check(companyProfileByIdOrSlug('nvidia')?.companyId === 'us-semiconductors-nvidia', 'profile slug resolve');
check(companyProfileByIdOrSlug('us-semiconductors-nvidia')?.slug === 'nvidia', 'canonical company resolve');
check(companyProfileByIdOrSlug('not-a-company') === undefined, 'invalid slug not found');
check(companyProfiles.map((profile) => profile.order).join('|') === '1|2|3|4|5|6|7|8', 'profile order');
check(canonicalCompanyProfileId('kr-semiconductors-sk-hynix') === 'ai-datacenter-sk-hynix', 'SK hynix canonical alias');
check(canonicalCompanyProfileId('datacenter-power-eaton') === 'ai-datacenter-eaton', 'Eaton canonical alias');
check(companyProfilePathForCompanyId('us-energy-grid-eaton') === '/ko/companies/eaton', 'canonical alias path');

const profiles = companyResearchProfileList();
check(profiles.length === 8, 'profile list count');
const dell = buildCompanyResearchProfile('dell')!;
check(dell.companyEvents.length === 2 && dell.companyEvents[0].eventDate >= dell.companyEvents[1].eventDate, 'latest two company events');
check(profiles.every((profile) => profile.marketMaps.length <= 2), 'market map maximum');
check(profiles.every((profile) => profile.companyRelations.length <= 4), 'related company maximum');
check(profiles.every((profile) => profile.companyRelations.every(({ relation }) => relation.evidenceLevel !== 'review-needed')), 'review-needed excluded');
const nvidia = buildCompanyResearchProfile('nvidia')!;
check(nvidia.companyRelations[0].relation.evidenceLevel === 'confirmed', 'confirmed relation first');
check(nvidia.companyRelations.slice(1).every(({ relation }) => relation.evidenceLevel === 'contextual'), 'contextual relations follow');
check(profiles.every((profile) => profile.companyRelations.every(({ company }) => company.id !== profile.company.id)), 'self relation excluded');
check(profiles.every((profile) => new Set(profile.companyRelations.map(({ company }) => company.id)).size === profile.companyRelations.length), 'related companies deduplicated');
check(profiles.every((profile) => profile.bottlenecks.length <= 2), 'bottleneck maximum');
check(profiles.every((profile) => profile.demandSupply.length <= 2), 'demand supply maximum');
check(profiles.every((profile) => profile.picks.length <= 1), 'pick maximum');
check(profiles.every((profile) => profile.reports.length <= 2), 'report maximum');
check(profiles.every((profile) => profile.sources.length <= 3), 'source maximum');
check(profiles.every((profile) => profile.verifiedMetrics.length <= 3), 'verified metric maximum');

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
check(validateCompanyProfileRegistry(new Date('2026-07-14T12:00:00Z')).length === 0, 'registry validation');

console.log(`✓ 기업 프로필 unit ${checks}개 검증`);

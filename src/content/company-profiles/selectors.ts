import {
  companies,
  reconstructionInfrastructureMap,
  semiconductorClusterInfrastructureMap,
  stockAutopsyPicks,
  type Company,
  type MarketPrice,
} from '../../data.js';
import { getPriceForTicker } from '../../services/prices.js';
import { supplyChainBottlenecks } from '../bottlenecks/entries.js';
import { companyEventCompanies, companyEvents } from '../company-events/entries.js';
import { sortCompanyEvents } from '../company-events/selectors.js';
import { demandSupplyEntries } from '../demand-supply/entries.js';
import { marketMapDefinitions } from '../market-map-details/definitions.js';
import { marketMapCompanyRelations } from '../market-map-relations/entries.js';
import { marketMapRelationTypeOrder } from '../market-map-relations/selectors.js';
import { industryReports } from '../reports/entries.js';
import { sourceRegistry } from '../sources/registry.js';
import { companyProfileCanonicalAliases, companyProfiles } from './entries.js';
import type {
  CanonicalCompanyProfileIdentity,
  CompanyProfileEntry,
  CompanyRelationSummary,
  CompanyResearchProfileViewModel,
  VerifiedCompanyMetric,
} from './types.js';

const profileByCompanyId = new Map(companyProfiles.map((profile) => [profile.companyId, profile]));
const profileBySlug = new Map(companyProfiles.map((profile) => [profile.slug, profile]));
const eventCompanyById = new Map(companyEventCompanies.map((company) => [company.id, company]));
const relationTypePriority = new Map(marketMapRelationTypeOrder.map((type, index) => [type, index]));
const relationRegistryPriority = new Map(marketMapCompanyRelations.map((relation, index) => [relation.id, index]));

function uniqueById<T extends { id: string }>(items: T[]) {
  return items.filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index);
}

export function canonicalCompanyProfileId(companyId: string) {
  return companyProfileCanonicalAliases[companyId] ?? companyId;
}

export function companyProfileByIdOrSlug(value?: string | null) {
  if (!value) return undefined;
  const canonicalId = canonicalCompanyProfileId(value);
  return profileByCompanyId.get(canonicalId) ?? profileBySlug.get(value);
}

export function companyProfileForTicker(ticker?: string | null) {
  if (!ticker) return undefined;
  const normalized = ticker.trim().toUpperCase();
  const identity = companyEventCompanies.find((company) => company.ticker.toUpperCase() === normalized);
  return identity ? profileByCompanyId.get(identity.id) : undefined;
}

export function companyProfilePath(profile: CompanyProfileEntry | string) {
  const resolved = typeof profile === 'string' ? companyProfileByIdOrSlug(profile) : profile;
  return resolved ? `/ko/companies/${encodeURIComponent(resolved.slug)}` : '/ko/companies';
}

export function companyProfilePathForCompanyId(companyId: string) {
  const profile = companyProfileByIdOrSlug(companyId);
  return profile ? companyProfilePath(profile) : undefined;
}

export function companyProfilePathForTicker(ticker?: string | null) {
  const profile = companyProfileForTicker(ticker);
  return profile ? companyProfilePath(profile) : undefined;
}

export function canonicalCompanyProfileIdentity(companyId: string): CanonicalCompanyProfileIdentity | undefined {
  const canonicalId = canonicalCompanyProfileId(companyId);
  const identity = eventCompanyById.get(canonicalId);
  return identity ? { ...identity } : undefined;
}

function aliasesForCompany(companyId: string) {
  return new Set([
    companyId,
    ...Object.entries(companyProfileCanonicalAliases)
      .filter(([, canonicalId]) => canonicalId === companyId)
      .map(([alias]) => alias),
  ]);
}

function dataCompanyForProfile(profile: CompanyProfileEntry) {
  const aliases = aliasesForCompany(profile.companyId);
  return companies.find((company) => company.id === profile.companyId)
    ?? companies.find((company) => aliases.has(company.id));
}

type AnyCompanyRecord = Pick<Company, 'id' | 'name' | 'ticker' | 'country'> & { exchange?: string };

function anyCompanyRecord(companyId: string): AnyCompanyRecord | undefined {
  const canonicalIdentity = canonicalCompanyProfileIdentity(companyId);
  if (canonicalIdentity) return canonicalIdentity;
  const records: AnyCompanyRecord[] = [
    ...companies,
    ...reconstructionInfrastructureMap.companies.map((company) => ({ ...company, country: 'KR' as const })),
    ...semiconductorClusterInfrastructureMap.companies.map((company) => ({ ...company, country: 'KR' as const })),
  ];
  return records.find((company) => company.id === companyId);
}

function relationCompanyIdentity(companyId: string): CanonicalCompanyProfileIdentity | undefined {
  const canonicalId = canonicalCompanyProfileId(companyId);
  const canonical = canonicalCompanyProfileIdentity(canonicalId);
  if (canonical) return canonical;
  const company = anyCompanyRecord(companyId);
  if (!company) return undefined;
  const country = company.country === 'KR' ? 'KR' : 'US';
  return {
    id: company.id,
    name: company.name,
    ticker: company.ticker ?? '',
    country,
    countryLabel: country === 'KR' ? '한국' : '미국',
  };
}

function buildMarketMapConnections(profile: CompanyProfileEntry, events: ReturnType<typeof sortCompanyEvents>) {
  const aliases = aliasesForCompany(profile.companyId);
  const eventMapIds = new Set(events.flatMap((event) => event.marketMapIds));
  const dataCompany = dataCompanyForProfile(profile);
  return marketMapDefinitions
    .filter((definition) => definition.status === 'available')
    .filter((definition) => eventMapIds.has(definition.id) || definition.companyNetwork?.companyIds.some((companyId) => aliases.has(companyId)))
    .sort((left, right) => left.order - right.order)
    .slice(0, 2)
    .map((definition) => ({
      id: definition.id,
      title: definition.title,
      subtitle: definition.subtitle,
      route: `${definition.route ?? `/ko/category/${definition.id}`}?company=${encodeURIComponent([...aliases].find((id) => definition.companyNetwork?.companyIds.includes(id)) ?? profile.companyId)}&view=companies`,
      role: dataCompany?.valueChainStage ?? profile.primaryRole,
      connectionNote: definition.companyNetwork?.companyIds.some((companyId) => aliases.has(companyId))
        ? '시장지도 기업 노드에 직접 등록된 산업 역할입니다.'
        : '기업 공식 이벤트가 이 산업 배경과 연결돼 있습니다.',
    }));
}

function buildCompanyRelations(profile: CompanyProfileEntry): CompanyRelationSummary[] {
  const aliases = aliasesForCompany(profile.companyId);
  const evidencePriority = { confirmed: 0, contextual: 1, 'review-needed': 2 } as const;
  const relations = marketMapCompanyRelations
    .filter((relation) => aliases.has(relation.fromCompanyId) || aliases.has(relation.toCompanyId))
    .filter((relation) => relation.evidenceLevel !== 'review-needed')
    .sort((left, right) => (
      evidencePriority[left.evidenceLevel] - evidencePriority[right.evidenceLevel]
      || (relationTypePriority.get(left.relationType) ?? 99) - (relationTypePriority.get(right.relationType) ?? 99)
      || (relationRegistryPriority.get(left.id) ?? 999) - (relationRegistryPriority.get(right.id) ?? 999)
    ));
  const seenCompanyIds = new Set<string>();
  const summaries: CompanyRelationSummary[] = [];
  relations.forEach((relation) => {
    const ownEndpoint = aliases.has(relation.fromCompanyId) ? relation.fromCompanyId : relation.toCompanyId;
    const counterpartId = ownEndpoint === relation.fromCompanyId ? relation.toCompanyId : relation.fromCompanyId;
    const canonicalCounterpartId = canonicalCompanyProfileId(counterpartId);
    if (canonicalCounterpartId === profile.companyId || seenCompanyIds.has(canonicalCounterpartId)) return;
    const company = relationCompanyIdentity(counterpartId);
    if (!company) return;
    const counterpartProfile = companyProfileByIdOrSlug(canonicalCounterpartId);
    seenCompanyIds.add(canonicalCounterpartId);
    summaries.push({
      relation,
      company,
      profileSlug: counterpartProfile?.slug,
      companyPath: counterpartProfile
        ? companyProfilePath(counterpartProfile)
        : `/ko/category/${encodeURIComponent(relation.mapId)}?company=${encodeURIComponent(counterpartId)}&view=companies`,
      evidencePath: `/ko/category/${encodeURIComponent(relation.mapId)}?company=${encodeURIComponent(ownEndpoint)}&view=companies&density=all&relation=${encodeURIComponent(relation.id)}`,
    });
  });
  return summaries.slice(0, 4);
}

function buildVerifiedMetrics(events: ReturnType<typeof sortCompanyEvents>, reports: typeof industryReports): VerifiedCompanyMetric[] {
  const eventSourceIds = new Set(events.flatMap((event) => event.sourceRefs));
  const metrics = reports
    .filter((report) => report.sourceType === 'company-ir' && report.sourceRefs.some((sourceRef) => eventSourceIds.has(sourceRef)))
    .flatMap((report) => report.keyMetrics
      .filter((metric) => metric.kind === 'actual')
      .map((metric) => ({ ...metric, reportId: report.id, reportTitle: report.titleKo, sourceRef: report.sourceRefs[0] })));
  return metrics
    .filter((metric, index, list) => list.findIndex((candidate) => candidate.label === metric.label && candidate.value === metric.value) === index)
    .slice(0, 3);
}

export function buildCompanyResearchProfile(
  value: string,
  marketPrices: MarketPrice[] = [],
): CompanyResearchProfileViewModel | undefined {
  const profile = companyProfileByIdOrSlug(value);
  if (!profile) return undefined;
  const company = canonicalCompanyProfileIdentity(profile.companyId);
  if (!company) return undefined;
  const aliases = aliasesForCompany(profile.companyId);
  const allEvents = sortCompanyEvents(companyEvents.filter((event) => event.companyId === profile.companyId));
  const companyEventsForView = allEvents.slice(0, 2);
  const bottleneckIds = new Set([
    ...allEvents.flatMap((event) => event.bottleneckIds),
    ...supplyChainBottlenecks
      .filter((bottleneck) => bottleneck.companyLinks.some((link) => aliases.has(link.companyId)))
      .map((bottleneck) => bottleneck.id),
  ]);
  const bottlenecks = supplyChainBottlenecks.filter((bottleneck) => bottleneckIds.has(bottleneck.id)).slice(0, 2);
  const demandSupplyIds = new Set([
    ...allEvents.flatMap((event) => event.demandSupplyIds),
    ...demandSupplyEntries.filter((entry) => bottleneckIds.has(entry.bottleneckId)).map((entry) => entry.id),
  ]);
  const demandSupply = demandSupplyEntries.filter((entry) => demandSupplyIds.has(entry.id)).slice(0, 2);
  const pickIds = new Set([
    ...allEvents.flatMap((event) => event.pickIds),
    ...stockAutopsyPicks
      .filter((pick) => pick.companyId === profile.companyId || pick.relatedCompanyId === profile.companyId || pick.ticker === company.ticker)
      .map((pick) => pick.id),
  ]);
  const picks = stockAutopsyPicks
    .filter((pick) => pickIds.has(pick.id))
    .sort((left, right) => (right.publishedAt ?? '').localeCompare(left.publishedAt ?? ''))
    .slice(0, 1);
  const reportIds = new Set([
    ...allEvents.flatMap((event) => event.reportIds),
    ...industryReports.filter((report) => report.companyIds.some((companyId) => aliases.has(companyId))).map((report) => report.id),
  ]);
  const reports = industryReports
    .filter((report) => reportIds.has(report.id))
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .slice(0, 2);
  const sourceIds = [
    ...profile.sourceRefs,
    ...allEvents.flatMap((event) => event.sourceRefs),
    ...reports.flatMap((report) => report.sourceRefs),
  ];
  const sources = sourceIds
    .filter((sourceId, index) => sourceIds.indexOf(sourceId) === index)
    .map((sourceId) => sourceRegistry[sourceId])
    .filter((source): source is NonNullable<typeof source> => Boolean(source))
    .slice(0, 3);
  const dataCompany = dataCompanyForProfile(profile);
  const price = marketPrices.length ? getPriceForTicker(company.ticker, profile.companyId, marketPrices) ?? undefined : undefined;
  return {
    company,
    profile,
    products: dataCompany?.mainProducts?.slice(0, 3) ?? [],
    price,
    marketMaps: buildMarketMapConnections(profile, allEvents),
    companyRelations: buildCompanyRelations(profile),
    companyEvents: companyEventsForView,
    bottlenecks,
    demandSupply,
    reports,
    picks,
    verifiedMetrics: buildVerifiedMetrics(allEvents, industryReports.filter((report) => reportIds.has(report.id))),
    sources,
  };
}

export function companyResearchProfileList() {
  return companyProfiles
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((profile) => buildCompanyResearchProfile(profile.companyId))
    .filter((profile): profile is CompanyResearchProfileViewModel => Boolean(profile));
}

export function companyProfileSectionVisibility(viewModel: CompanyResearchProfileViewModel) {
  return {
    showPrice: Boolean(viewModel.price),
    showEventEmpty: viewModel.companyEvents.length === 0,
    showPick: viewModel.picks.length > 0,
    showMetrics: viewModel.verifiedMetrics.length > 0,
  };
}

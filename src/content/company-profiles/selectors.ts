import {
  companies,
  stockAutopsyPicks,
  type MarketPrice,
} from '../../data.js';
import { getPriceForTicker } from '../../services/prices.js';
import { supplyChainBottlenecks } from '../bottlenecks/entries.js';
import { companyEventCompanies, companyEvents } from '../company-events/entries.js';
import { sortCompanyEvents } from '../company-events/selectors.js';
import { demandSupplyEntries } from '../demand-supply/entries.js';
import { relatedCompaniesForProfile } from '../company-profile-relations/selectors.js';
import { industryFlowsForCompany } from '../industry-flows/selectors.js';
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

function buildIndustryFlowConnections(profile: CompanyProfileEntry) {
  return industryFlowsForCompany(profile.companyId)
    .map((flow) => ({
      flow,
      currentStep: flow.steps.find((step) => step.companyIds?.includes(profile.companyId)),
    }))
    .filter((connection): connection is { flow: typeof connection.flow; currentStep: NonNullable<typeof connection.currentStep> } => Boolean(connection.currentStep));
}

function buildCompanyRelations(profile: CompanyProfileEntry): CompanyRelationSummary[] {
  return relatedCompaniesForProfile(profile.companyId).flatMap((relation) => {
    const company = canonicalCompanyProfileIdentity(relation.relatedCompanyId);
    const counterpartProfile = companyProfileByIdOrSlug(relation.relatedCompanyId);
    return company && counterpartProfile
      ? [{ relation, company, companyPath: companyProfilePath(counterpartProfile) }]
      : [];
  });
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
    industryFlows: buildIndustryFlowConnections(profile),
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

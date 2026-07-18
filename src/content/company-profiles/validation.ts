import { companyEventCompanies, companyEvents } from '../company-events/entries.js';
import { companyProfileRelatedCompanies } from '../company-profile-relations/entries.js';
import { industryFlows } from '../industry-flows/entries.js';
import { sourceRegistry } from '../sources/registry.js';
import { companyProfiles } from './entries.js';
import { companySearchIndex, companySearchRecordPath, normalizeCompanySearchTerm } from './search.js';
import { buildCompanyResearchProfile, companyProfileByIdOrSlug } from './selectors.js';

function duplicates(values: Array<string | number>) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

export function validateCompanyProfileRegistry(now = new Date()) {
  const errors: string[] = [];
  const canonicalIds = new Set(companyEventCompanies.map((company) => company.id));
  const eventIds = new Set(companyEvents.map((event) => event.id));
  const flowIds = new Set(industryFlows.map((flow) => flow.id));
  const forbidden = /(수혜주|대장주|목표주가|매수|매도|상승 가능성|실적 개선 확정|가장 유망한 기업|기업 점수|경쟁력 점수|관계가 많으므로)/;
  if (companyProfiles.length !== 9) errors.push(`company profile count must be exactly 9: ${companyProfiles.length}`);
  duplicates(companyProfiles.map((profile) => profile.id)).forEach((id) => errors.push(`duplicate profile id: ${id}`));
  duplicates(companyProfiles.map((profile) => profile.slug)).forEach((slug) => errors.push(`duplicate profile slug: ${slug}`));
  duplicates(companyProfiles.map((profile) => profile.companyId)).forEach((companyId) => errors.push(`duplicate profile companyId: ${companyId}`));
  duplicates(companyProfiles.map((profile) => profile.order)).forEach((order) => errors.push(`duplicate profile order: ${order}`));
  duplicates(companySearchIndex.map(({ company }) => normalizeCompanySearchTerm(company.ticker))).forEach((ticker) => errors.push(`duplicate search ticker: ${ticker}`));
  duplicates(companyProfiles.flatMap((profile) => profile.stockCode ? [profile.stockCode] : [])).forEach((stockCode) => errors.push(`duplicate search stock code: ${stockCode}`));
  if (companySearchIndex.length !== companyProfiles.length) errors.push(`search index count mismatch: ${companySearchIndex.length} / ${companyProfiles.length}`);

  const aliasOwners = new Map<string, string>();

  companyProfiles.forEach((profile) => {
    if (!canonicalIds.has(profile.companyId)) errors.push(`invalid canonical companyId: ${profile.id} / ${profile.companyId}`);
    if (!profile.beginnerSummary.trim() || !profile.businessDescription.trim() || !profile.primaryRole.trim()) errors.push(`profile copy missing: ${profile.id}`);
    if (!profile.englishName.trim() || !profile.exchange.trim() || !profile.industry.trim() || !profile.searchDescription.trim()) errors.push(`profile search metadata missing: ${profile.id}`);
    if (profile.stockCode && !/^\d+$/.test(profile.stockCode)) errors.push(`profile stock code invalid: ${profile.id}`);
    if (profile.aliases.some((alias) => !alias.trim())) errors.push(`profile alias empty: ${profile.id}`);
    const normalizedAliases = profile.aliases.map(normalizeCompanySearchTerm);
    if (new Set(normalizedAliases).size !== normalizedAliases.length) errors.push(`profile alias duplicate: ${profile.id}`);
    normalizedAliases.forEach((alias) => {
      const owner = aliasOwners.get(alias);
      if (owner && owner !== profile.slug) errors.push(`profile alias collision: ${owner} / ${profile.slug} / ${alias}`);
      aliasOwners.set(alias, profile.slug);
    });
    if (!profile.keyQuestions.length || !profile.caution.trim()) errors.push(`profile questions or caution missing: ${profile.id}`);
    if (!profile.sourceRefs.length) errors.push(`profile source missing: ${profile.id}`);
    profile.sourceRefs.forEach((sourceRef) => { if (!sourceRegistry[sourceRef]) errors.push(`profile source invalid: ${profile.id} / ${sourceRef}`); });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(profile.reviewedAt) || Number.isNaN(Date.parse(`${profile.reviewedAt}T00:00:00Z`))) errors.push(`profile reviewedAt invalid: ${profile.id}`);
    if (Date.parse(`${profile.reviewedAt}T00:00:00Z`) > now.getTime() + 86_400_000) errors.push(`profile reviewedAt future: ${profile.id}`);
    if (/https?:\/\//.test(JSON.stringify(profile))) errors.push(`profile stores URL directly: ${profile.id}`);
    if (forbidden.test(JSON.stringify(profile))) errors.push(`profile forbidden recommendation copy: ${profile.id}`);
    const searchRecord = companySearchIndex.find((record) => record.profile.slug === profile.slug);
    if (!searchRecord) errors.push(`profile search record missing: ${profile.id}`);
    if (searchRecord && companySearchRecordPath(searchRecord) !== `/ko/companies/${encodeURIComponent(profile.slug)}`) errors.push(`profile search route invalid: ${profile.id}`);
    if (searchRecord && searchRecord.searchableTerms.some((term) => !normalizeCompanySearchTerm(term))) errors.push(`profile searchable term invalid: ${profile.id}`);
    const viewModel = buildCompanyResearchProfile(profile.companyId);
    if (!viewModel) {
      errors.push(`profile view model missing: ${profile.id}`);
      return;
    }
    if (!companyEvents.some((event) => event.companyId === profile.companyId)) errors.push(`profile event missing: ${profile.id}`);
    viewModel.companyEvents.forEach((event) => { if (!eventIds.has(event.id)) errors.push(`profile event ref invalid: ${profile.id} / ${event.id}`); });
    viewModel.industryFlows.forEach(({ flow }) => { if (!flowIds.has(flow.id)) errors.push(`profile industry flow ref invalid: ${profile.id} / ${flow.id}`); });
    viewModel.companyRelations.forEach(({ relation, company }) => {
      if (!companyProfileRelatedCompanies.includes(relation)) errors.push(`profile relation ref invalid: ${profile.id} / ${relation.relatedCompanyId}`);
      if (company.id === profile.companyId) errors.push(`profile self relation: ${profile.id} / ${relation.relatedCompanyId}`);
    });
    if (viewModel.companyRelations.length > 3) errors.push(`profile relation maximum exceeded: ${profile.id}`);
    if (viewModel.companyEvents.length > 2) errors.push(`profile event maximum exceeded: ${profile.id}`);
    if (viewModel.industryFlows.length > 2 || viewModel.bottlenecks.length > 2 || viewModel.demandSupply.length > 2 || viewModel.reports.length > 2) errors.push(`profile content maximum exceeded: ${profile.id}`);
    if (viewModel.picks.length > 1 || viewModel.sources.length > 3 || viewModel.verifiedMetrics.length > 3) errors.push(`profile optional content maximum exceeded: ${profile.id}`);
  });
  if (companyProfileByIdOrSlug('not-a-company')) errors.push('invalid slug must not fall back');
  return errors;
}

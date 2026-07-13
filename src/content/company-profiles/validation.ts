import { companyEventCompanies, companyEvents } from '../company-events/entries.js';
import { marketMapDefinitions } from '../market-map-details/definitions.js';
import { marketMapCompanyRelations } from '../market-map-relations/entries.js';
import { sourceRegistry } from '../sources/registry.js';
import { companyProfiles } from './entries.js';
import { buildCompanyResearchProfile, companyProfileByIdOrSlug } from './selectors.js';

function duplicates(values: Array<string | number>) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

export function validateCompanyProfileRegistry(now = new Date()) {
  const errors: string[] = [];
  const canonicalIds = new Set(companyEventCompanies.map((company) => company.id));
  const eventIds = new Set(companyEvents.map((event) => event.id));
  const mapIds = new Set(marketMapDefinitions.map((map) => map.id));
  const relationIds = new Set(marketMapCompanyRelations.map((relation) => relation.id));
  const forbidden = /(수혜주|대장주|목표주가|매수|매도|상승 가능성|실적 개선 확정|가장 유망한 기업|기업 점수|경쟁력 점수|관계가 많으므로)/;
  if (companyProfiles.length !== 8) errors.push(`company profile count must be exactly 8: ${companyProfiles.length}`);
  duplicates(companyProfiles.map((profile) => profile.id)).forEach((id) => errors.push(`duplicate profile id: ${id}`));
  duplicates(companyProfiles.map((profile) => profile.slug)).forEach((slug) => errors.push(`duplicate profile slug: ${slug}`));
  duplicates(companyProfiles.map((profile) => profile.companyId)).forEach((companyId) => errors.push(`duplicate profile companyId: ${companyId}`));
  duplicates(companyProfiles.map((profile) => profile.order)).forEach((order) => errors.push(`duplicate profile order: ${order}`));

  companyProfiles.forEach((profile) => {
    if (!canonicalIds.has(profile.companyId)) errors.push(`invalid canonical companyId: ${profile.id} / ${profile.companyId}`);
    if (!profile.beginnerSummary.trim() || !profile.businessDescription.trim() || !profile.primaryRole.trim()) errors.push(`profile copy missing: ${profile.id}`);
    if (!profile.keyQuestions.length || !profile.caution.trim()) errors.push(`profile questions or caution missing: ${profile.id}`);
    if (!profile.sourceRefs.length) errors.push(`profile source missing: ${profile.id}`);
    profile.sourceRefs.forEach((sourceRef) => { if (!sourceRegistry[sourceRef]) errors.push(`profile source invalid: ${profile.id} / ${sourceRef}`); });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(profile.reviewedAt) || Number.isNaN(Date.parse(`${profile.reviewedAt}T00:00:00Z`))) errors.push(`profile reviewedAt invalid: ${profile.id}`);
    if (Date.parse(`${profile.reviewedAt}T00:00:00Z`) > now.getTime() + 86_400_000) errors.push(`profile reviewedAt future: ${profile.id}`);
    if (/https?:\/\//.test(JSON.stringify(profile))) errors.push(`profile stores URL directly: ${profile.id}`);
    if (forbidden.test(JSON.stringify(profile))) errors.push(`profile forbidden recommendation copy: ${profile.id}`);
    const viewModel = buildCompanyResearchProfile(profile.companyId);
    if (!viewModel) {
      errors.push(`profile view model missing: ${profile.id}`);
      return;
    }
    if (!companyEvents.some((event) => event.companyId === profile.companyId)) errors.push(`profile event missing: ${profile.id}`);
    viewModel.companyEvents.forEach((event) => { if (!eventIds.has(event.id)) errors.push(`profile event ref invalid: ${profile.id} / ${event.id}`); });
    viewModel.marketMaps.forEach((map) => { if (!mapIds.has(map.id)) errors.push(`profile market map ref invalid: ${profile.id} / ${map.id}`); });
    viewModel.companyRelations.forEach(({ relation, company }) => {
      if (!relationIds.has(relation.id)) errors.push(`profile relation ref invalid: ${profile.id} / ${relation.id}`);
      if (company.id === profile.companyId) errors.push(`profile self relation: ${profile.id} / ${relation.id}`);
      if (relation.evidenceLevel === 'review-needed') errors.push(`review-needed relation exposed: ${profile.id} / ${relation.id}`);
    });
    if (viewModel.companyRelations.length > 4) errors.push(`profile relation maximum exceeded: ${profile.id}`);
    if (viewModel.companyEvents.length > 2) errors.push(`profile event maximum exceeded: ${profile.id}`);
    if (viewModel.marketMaps.length > 2 || viewModel.bottlenecks.length > 2 || viewModel.demandSupply.length > 2 || viewModel.reports.length > 2) errors.push(`profile content maximum exceeded: ${profile.id}`);
    if (viewModel.picks.length > 1 || viewModel.sources.length > 3 || viewModel.verifiedMetrics.length > 3) errors.push(`profile optional content maximum exceeded: ${profile.id}`);
  });
  if (companyProfileByIdOrSlug('not-a-company')) errors.push('invalid slug must not fall back');
  return errors;
}

import { companyBriefSlugs } from '../company-briefs/registry.js';
import { companyProfiles, companySearchIndex } from '../company-profiles/index.js';
import { sourceRegistry } from '../sources/index.js';
import { companyDissectionAxisKeys } from './build.js';
import { companyDissectionSlugs, loadAllCompanyDissectionConfigs } from './registry.js';

function isDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export async function validateCompanyDissectionRegistry() {
  const errors: string[] = [];
  const configs = await loadAllCompanyDissectionConfigs();
  const profilesBySlug = new Map(companyProfiles.map((profile) => [profile.slug, profile]));
  const searchSlugs = new Set(companySearchIndex.map(({ profile }) => profile.slug));
  const briefSlugs = new Set<string>(companyBriefSlugs);

  if (new Set(companyDissectionSlugs).size !== companyDissectionSlugs.length) {
    errors.push('company dissection slug is duplicated');
  }
  if (configs.length !== companyDissectionSlugs.length) {
    errors.push('company dissection loader count does not match registry');
  }

  for (const profile of companyProfiles) {
    const shouldBeSearchable = profile.searchStatus.searchVisible
      && briefSlugs.has(profile.slug)
      && profile.sourceRefs.length > 0;
    if (searchSlugs.has(profile.slug) !== shouldBeSearchable) {
      errors.push(`${profile.slug}: search index does not match Company Registry status`);
    }
  }

  for (const config of configs) {
    const profile = profilesBySlug.get(config.companySlug);
    if (!profile) {
      errors.push(`${config.companySlug}: unsupported company slug`);
      continue;
    }
    if (!briefSlugs.has(config.companySlug)) {
      errors.push(`${config.companySlug}: Company Brief is missing`);
    }
    if (config.industryProfile.classificationSources.length < 3) {
      errors.push(`${config.companySlug}: fewer than three industry classification sources`);
    }
    if (new Set(config.industryProfile.classificationSources.map(({ provider }) => provider)).size
      !== config.industryProfile.classificationSources.length) {
      errors.push(`${config.companySlug}: industry classification provider is duplicated`);
    }
    config.industryProfile.classificationSources.forEach((source) => {
      if (!source.provider || !source.sector || !source.industry || !/^https:\/\//.test(source.url) || !isDate(source.retrievedAt)) {
        errors.push(`${config.companySlug}: incomplete industry classification source`);
      }
    });
    if (!config.industryProfile.primaryIndustry.trim()) {
      errors.push(`${config.companySlug}: primary industry is empty`);
    }
    if (!config.industryProfile.businessSegments.length) {
      errors.push(`${config.companySlug}: official business segment is missing`);
    }
    if (new Set(config.industryProfile.businessSegments.map(({ id }) => id)).size
      !== config.industryProfile.businessSegments.length) {
      errors.push(`${config.companySlug}: business segment id is duplicated`);
    }

    const axisKeys = Object.keys(config.axes);
    if (axisKeys.length !== companyDissectionAxisKeys.length
      || companyDissectionAxisKeys.some((key) => !config.axes[key])) {
      errors.push(`${config.companySlug}: five-axis configuration is incomplete`);
      continue;
    }
    for (const key of companyDissectionAxisKeys) {
      const axis = config.axes[key];
      if (axis.key !== key) errors.push(`${config.companySlug}/${key}: axis key mismatch`);
      if (!axis.statusLabel.trim() || !axis.comparison.label.trim() || !axis.interpretation.trim() || !axis.nextCheck.trim()) {
        errors.push(`${config.companySlug}/${key}: axis explanation is incomplete`);
      }
      if (axis.state === 'insufficientData' && axis.position !== null) {
        errors.push(`${config.companySlug}/${key}: insufficient data was replaced with a position`);
      }
      if (axis.state !== 'insufficientData' && (axis.position === null || !Number.isFinite(axis.position))) {
        errors.push(`${config.companySlug}/${key}: finite position is missing`);
      }
      if (!axis.sourceIds.length || axis.sourceIds.some((sourceId) => !sourceRegistry[sourceId])) {
        errors.push(`${config.companySlug}/${key}: source is missing or broken`);
      }
      if (axis.detailSurface === 'valuation' && profile.searchStatus.valuationStatus === 'unavailable') {
        errors.push(`${config.companySlug}/${key}: unsupported Valuation CTA`);
      }
      if (axis.detailSurface === 'report' && profile.searchStatus.reportStatus === 'unavailable') {
        errors.push(`${config.companySlug}/${key}: unsupported Report CTA`);
      }
      if (key === 'moat' && (!axis.moatEvidence?.length || !axis.weakeningRisks?.length)) {
        errors.push(`${config.companySlug}/${key}: moat evidence or weakening risk is missing`);
      }
    }
  }

  return errors;
}

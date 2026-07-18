import { buildCompanyBrief } from './build.js';
import type { CompanyBrief, CompanyBriefBuildInput, CompanyBriefConfig } from './types.js';

export const companyBriefSlugs = ['sk-hynix', 'lg-electronics', 'nvidia', 'micron', 'dell', 'eaton', 'meta', 'supermicro', 'netflix'] as const;
export type CompanyBriefSlug = (typeof companyBriefSlugs)[number];

const loaders: Record<CompanyBriefSlug, () => Promise<{ default: CompanyBriefConfig }>> = {
  'sk-hynix': () => import('./entries/sk-hynix.js'),
  'lg-electronics': () => import('./entries/lg-electronics.js'),
  nvidia: () => import('./entries/nvidia.js'),
  micron: () => import('./entries/micron.js'),
  dell: () => import('./entries/dell.js'),
  eaton: () => import('./entries/eaton.js'),
  meta: () => import('./entries/meta.js'),
  supermicro: () => import('./entries/supermicro.js'),
  netflix: () => import('./entries/netflix.js'),
};

export function isCompanyBriefSlug(value: string): value is CompanyBriefSlug {
  return companyBriefSlugs.includes(value as CompanyBriefSlug);
}

export async function loadCompanyBriefConfig(slug: string): Promise<CompanyBriefConfig | null> {
  return isCompanyBriefSlug(slug) ? (await loaders[slug]()).default : null;
}

export async function loadCompanyBrief(slug: string, input: CompanyBriefBuildInput): Promise<CompanyBrief | null> {
  const config = await loadCompanyBriefConfig(slug);
  return config ? buildCompanyBrief(config, input) : null;
}

export async function loadAllCompanyBriefConfigs() {
  return Promise.all(companyBriefSlugs.map((slug) => loaders[slug]().then((module) => module.default)));
}

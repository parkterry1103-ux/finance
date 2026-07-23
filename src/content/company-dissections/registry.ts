import type { CompanyDissectionConfig } from './types.js';

export const companyDissectionSlugs = ['sk-hynix', 'lg-electronics', 'nvidia', 'micron', 'dell', 'eaton', 'meta', 'supermicro', 'netflix'] as const;
export type CompanyDissectionSlug = (typeof companyDissectionSlugs)[number];

const loaders: Record<CompanyDissectionSlug, () => Promise<{ default: CompanyDissectionConfig }>> = {
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

export function isCompanyDissectionSlug(value: string): value is CompanyDissectionSlug {
  return companyDissectionSlugs.includes(value as CompanyDissectionSlug);
}
export async function loadCompanyDissectionConfig(slug: string) {
  return isCompanyDissectionSlug(slug) ? (await loaders[slug]()).default : null;
}

export async function loadAllCompanyDissectionConfigs() {
  return Promise.all(companyDissectionSlugs.map((slug) => loaders[slug]().then((module) => module.default)));
}

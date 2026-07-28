import { buildCompanyJudgment } from './build.js';
import type { CompanyJudgmentConfig } from './types.js';

export const companyJudgmentSlugs = ['sk-hynix', 'alphabet', 'hana-financial'] as const;
export type CompanyJudgmentSlug = (typeof companyJudgmentSlugs)[number];

const loaders: Record<CompanyJudgmentSlug, () => Promise<{ default: CompanyJudgmentConfig }>> = {
  'sk-hynix': () => import('./entries/sk-hynix.js'),
  alphabet: () => import('./entries/alphabet.js'),
  'hana-financial': () => import('./entries/hana-financial.js'),
};

export function isCompanyJudgmentSlug(value: string): value is CompanyJudgmentSlug {
  return companyJudgmentSlugs.includes(value as CompanyJudgmentSlug);
}

export async function loadCompanyJudgmentConfig(slug: string) {
  return isCompanyJudgmentSlug(slug) ? (await loaders[slug]()).default : null;
}

export async function loadCompanyJudgment(slug: string) {
  const config = await loadCompanyJudgmentConfig(slug);
  return config ? buildCompanyJudgment(config) : null;
}

export async function loadAllCompanyJudgmentConfigs() {
  return Promise.all(companyJudgmentSlugs.map((slug) => loaders[slug]().then((module) => module.default)));
}

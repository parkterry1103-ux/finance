import type { FinancialAuditCompany } from './audit-types.js';

const loaders: Record<string, () => Promise<{ default: FinancialAuditCompany }>> = {
  'sk-hynix': () => import('./audit-entries/sk-hynix.js'),
  'lg-electronics': () => import('./audit-entries/lg-electronics.js'),
  nvidia: () => import('./audit-entries/nvidia.js'),
  micron: () => import('./audit-entries/micron.js'),
  dell: () => import('./audit-entries/dell.js'),
  eaton: () => import('./audit-entries/eaton.js'),
  meta: () => import('./audit-entries/meta.js'),
  supermicro: () => import('./audit-entries/supermicro.js'),
  netflix: () => import('./audit-entries/netflix.js'),
};

export const financialAuditCompanySlugs = Object.freeze(Object.keys(loaders));

export async function loadFinancialAuditCompany(slug: string) {
  const loader = loaders[slug];
  return loader ? (await loader()).default : null;
}

import { financialMetricDefinitions, financialPivotCompanies } from './registry.js';

export function validateFinancialPivotRegistry() {
  const errors: string[] = [];
  const slugs = new Set<string>();
  financialPivotCompanies.forEach((company) => {
    if (slugs.has(company.companySlug)) errors.push(`duplicate companySlug: ${company.companySlug}`);
    slugs.add(company.companySlug);
    if (company.country === 'US' && !company.cik) errors.push(`missing CIK: ${company.companySlug}`);
    if (company.country === 'KR' && !company.corpCode) errors.push(`missing corpCode: ${company.companySlug}`);
    company.peerSlugs.forEach((peer) => {
      if (peer === company.companySlug) errors.push(`self peer: ${company.companySlug}`);
    });
  });
  const metricIds = new Set<string>();
  financialMetricDefinitions.forEach((metric) => {
    if (metricIds.has(metric.id)) errors.push(`duplicate metric: ${metric.id}`);
    metricIds.add(metric.id);
    if (!metric.label.trim() || !metric.description.trim()) errors.push(`empty metric copy: ${metric.id}`);
  });
  return errors;
}

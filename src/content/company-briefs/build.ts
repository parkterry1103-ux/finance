import type { CompanyBrief, CompanyBriefBuildInput, CompanyBriefConfig } from './types.js';

export function buildCompanyBrief(config: CompanyBriefConfig, input: CompanyBriefBuildInput): CompanyBrief {
  const metricsById = new Map(input.dashboard.metrics.map((metric) => [metric.id, metric]));
  const keyMetrics = config.keyMetricSelections.flatMap((selection) => {
    const metric = metricsById.get(selection.metricId);
    if (!metric || metric.value === null || metric.formattedValue === null || !metric.sourceIds[0]) return [];
    return [{
      id: metric.id,
      label: metric.shortLabel ?? metric.label,
      value: metric.value,
      formattedValue: metric.formattedValue,
      unit: metric.unit,
      period: metric.period,
      comparison: selection.comparison,
      interpretation: metric.description,
      sourceId: metric.sourceIds[0],
    }];
  });
  return {
    companySlug: config.companySlug,
    asOf: config.asOf,
    oneLineBusiness: config.oneLineBusiness,
    questions: config.questions,
    keyMetrics,
    relatedEditorialIds: config.relatedEditorialIds,
    reportSlug: config.reportSlug,
  };
}

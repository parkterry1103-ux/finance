import { publishedEditorialSummaryIndex } from '../editorial/summaries.js';
import { companyProfiles } from '../company-profiles/entries.js';
import { buildCompanyResearchProfile } from '../company-profiles/selectors.js';
import { researchReportSlugs } from '../research-reports/registry.js';
import { sourceRegistry } from '../sources/registry.js';
import { buildCompanyBrief } from './build.js';
import { companyBriefSlugs, loadAllCompanyBriefConfigs } from './registry.js';
import type { CompanyBriefConfig, CompanyBriefMetricComparison, CompanyBriefQuestionKey } from './types.js';

export const companyBriefQuestionKeys: CompanyBriefQuestionKey[] = ['revenueEngine', 'recentChange', 'whyItMatters', 'keyRisk', 'watchNext'];

function duplicateValues(values: string[]) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

export function expectedBriefDifferenceUnit(label: string, comparisonLabel: string) {
  const copy = `${label} ${comparisonLabel}`;
  if (/(영업이익률|순이익률|매출총이익률|마진|수익률 차이)/.test(copy)) return 'percentagePoint' as const;
  if (/(성장률|증가율|수익률)/.test(copy)) return 'percent' as const;
  return null;
}

function validComparison(label: string, comparison: CompanyBriefMetricComparison) {
  if (!comparison.label.trim()) return false;
  if (comparison.referenceValue !== undefined && !Number.isFinite(comparison.referenceValue)) return false;
  if (comparison.difference !== undefined && !Number.isFinite(comparison.difference)) return false;
  const expected = expectedBriefDifferenceUnit(label, comparison.label);
  return !expected || expected === comparison.differenceUnit;
}

export function validateCompanyBriefConfig(config: CompanyBriefConfig) {
  const errors: string[] = [];
  const profile = companyProfiles.find((item) => item.slug === config.companySlug);
  const viewModel = profile ? buildCompanyResearchProfile(profile.slug) : undefined;
  const label = `Company Brief ${config.companySlug}`;
  if (!profile || !viewModel) return [`${label}: 지원 기업 또는 view model이 없습니다.`];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(config.asOf) || Number.isNaN(Date.parse(`${config.asOf}T00:00:00Z`))) errors.push(`${label}: 분석 기준일이 올바르지 않습니다.`);
  if (!config.oneLineBusiness.trim()) errors.push(`${label}: 한 문장 사업 정의가 없습니다.`);
  if (/(초보자|BUY|HOLD|SELL|매수|매도|목표주가|상승여력|하락여력|투자 점수|추천 종목|확실한 수혜주|무조건 저평가|무조건 고평가)/i.test(JSON.stringify(config))) errors.push(`${label}: 사용자-facing 금지 표현이 있습니다.`);
  if (Object.keys(config.questions).length !== companyBriefQuestionKeys.length) errors.push(`${label}: 질문은 정확히 5개여야 합니다.`);
  companyBriefQuestionKeys.forEach((key) => {
    const answer = config.questions[key];
    if (!answer?.summary.trim() || !answer.sourceIds.length) errors.push(`${label}: ${key} 답변 또는 source가 없습니다.`);
    answer?.sourceIds.forEach((sourceId) => { if (!sourceRegistry[sourceId]) errors.push(`${label}: ${key} source ${sourceId}가 없습니다.`); });
  });
  if (!config.keyMetricSelections.length || config.keyMetricSelections.length > 3) errors.push(`${label}: 핵심 지표는 1~3개여야 합니다.`);
  duplicateValues(config.keyMetricSelections.map((item) => item.metricId)).forEach((id) => errors.push(`${label}: 핵심 지표 ${id}가 중복됐습니다.`));
  const metricsById = new Map(viewModel.dashboard.metrics.map((item) => [item.id, item]));
  config.keyMetricSelections.forEach((selection) => {
    const metric = metricsById.get(selection.metricId);
    if (!metric) errors.push(`${label}: dashboard 지표 ${selection.metricId}가 없습니다.`);
    else {
      if (metric.value === null || !Number.isFinite(metric.value)) errors.push(`${label}: ${selection.metricId} 값이 finite number가 아닙니다.`);
      if (!metric.unit || !metric.period || !metric.sourceIds[0] || !sourceRegistry[metric.sourceIds[0]]) errors.push(`${label}: ${selection.metricId} 단위·기간·source가 불완전합니다.`);
      if (selection.comparison && !validComparison(metric.label, selection.comparison)) errors.push(`${label}: ${selection.metricId} 비교값 또는 %/%p 단위가 올바르지 않습니다.`);
    }
  });
  const publishedIds = new Set(publishedEditorialSummaryIndex.map((item) => item.id));
  duplicateValues(config.relatedEditorialIds).forEach((id) => errors.push(`${label}: related editorial ${id}가 중복됐습니다.`));
  config.relatedEditorialIds.forEach((id) => { if (!publishedIds.has(id)) errors.push(`${label}: Published editorial ${id}가 없습니다.`); });
  if (config.reportSlug && !researchReportSlugs.includes(config.reportSlug)) errors.push(`${label}: research report route가 없습니다.`);
  const brief = buildCompanyBrief(config, viewModel);
  if (brief.keyMetrics.length !== config.keyMetricSelections.length) errors.push(`${label}: build된 핵심 지표 수가 다릅니다.`);
  return errors;
}

export async function validateCompanyBriefRegistry() {
  const configs = await loadAllCompanyBriefConfigs();
  const errors: string[] = [];
  if (configs.length !== companyProfiles.length || configs.length !== companyBriefSlugs.length) errors.push(`Company Brief 수는 지원 기업 ${companyProfiles.length}개와 같아야 합니다.`);
  duplicateValues(configs.map((item) => item.companySlug)).forEach((slug) => errors.push(`Company Brief slug가 중복됐습니다: ${slug}`));
  configs.forEach((config) => errors.push(...validateCompanyBriefConfig(config)));
  return { configs, errors };
}

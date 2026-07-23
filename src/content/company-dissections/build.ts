import type {
  CompanyDissectionAxis,
  CompanyDissectionAxisKey,
  CompanyDissectionBuildInput,
  CompanyDissectionCoreKey,
  CompanyDissectionModel,
} from './types.js';

export const companyDissectionAxisKeys: CompanyDissectionAxisKey[] = ['growth', 'profitability', 'moat', 'financialHealth', 'valuation'];
export const companyDissectionCoreKeys: CompanyDissectionCoreKey[] = ['growth', 'profitability', 'financialHealth', 'valuation'];

export const companyDissectionAxisLabels: Record<CompanyDissectionAxisKey, string> = {
  growth: '성장성',
  profitability: '수익성',
  moat: '해자',
  financialHealth: '재무건전성',
  valuation: '밸류에이션',
};

export const companyDissectionStateLabels = {
  low: '낮은 편',
  belowAverage: '중간보다 낮음',
  middle: '중간',
  aboveAverage: '중간보다 높음',
  high: '높은 편',
  insufficientData: '확인 부족',
} as const;

export function buildCompanyDissection({ config, brief, viewModel }: CompanyDissectionBuildInput): CompanyDissectionModel {
  const axes = Object.fromEntries(companyDissectionAxisKeys.map((key) => {
    const axis = config.axes[key];
    const metric = axis.evidenceMetricId
      ? viewModel.dashboard.metrics.find((item) => item.id === axis.evidenceMetricId)
        ?? brief.keyMetrics.find((item) => item.id === axis.evidenceMetricId)
        ?? null
      : null;
    const normalizedMetric = metric && 'qualityStatus' in metric ? metric : null;
    const item: CompanyDissectionAxis = {
      ...axis,
      label: companyDissectionAxisLabels[key],
      metric: normalizedMetric,
      evidenceValue: normalizedMetric?.formattedValue ?? axis.evidenceText ?? (axis.state === 'insufficientData' ? '자료 미수집' : '공식 근거 확인'),
      period: normalizedMetric?.period ?? brief.asOf,
    };
    return [key, item];
  })) as Record<CompanyDissectionAxisKey, CompanyDissectionAxis>;

  return {
    companySlug: config.companySlug,
    industryProfile: config.industryProfile,
    axes,
    coreCards: companyDissectionCoreKeys.map((key) => ({
      key,
      label: companyDissectionAxisLabels[key],
      statusLabel: axes[key].statusLabel,
      value: axes[key].evidenceValue,
      comparisonLabel: axes[key].comparison.label,
      period: axes[key].period,
      state: axes[key].state,
    })),
    watchItems: viewModel.profile.keyQuestions.slice(0, 3).map((title) => ({
      title,
      why: brief.questions.watchNext.summary,
      timing: '다음 공식 실적·공시',
    })),
  };
}

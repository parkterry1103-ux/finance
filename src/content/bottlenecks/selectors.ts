import { supplyChainBottlenecks } from './entries.js';
import type {
  BottleneckCategory,
  BottleneckConfidence,
  BottleneckStatus,
  BottleneckTrend,
  SupplyChainBottleneck,
} from './types.js';

export const bottleneckStatusLabels: Record<BottleneckStatus, string> = {
  normal: '정상',
  watch: '관찰',
  tight: '타이트',
  critical: '심각',
};

export const bottleneckTrendLabels: Record<BottleneckTrend, string> = {
  easing: '완화 ↘',
  stable: '변화 적음 →',
  tightening: '더 타이트해짐 ↗',
};

export const bottleneckConfidenceLabels: Record<BottleneckConfidence, string> = {
  high: '높음',
  medium: '보통',
  low: '제한적',
};

export const bottleneckCategoryLabels: Record<BottleneckCategory, string> = {
  'power-grid': '전력망·전력기기',
  'data-centers': '데이터센터',
  generation: '발전설비',
  semiconductors: '반도체',
  'critical-minerals': '핵심광물',
  'industrial-infrastructure': '산업 인프라',
};

export const bottleneckCompanyRoleLabels = {
  'constrained-supplier': '공급자',
  'capacity-provider': '증설 중',
  'demand-driver': '수요 유발',
  'procurement-exposure': '조달 영향',
  'alternative-supplier': '대체 공급',
} as const;

const severity: Record<BottleneckStatus, number> = { normal: 0, watch: 1, tight: 2, critical: 3 };
const trendPriority: Record<BottleneckTrend, number> = { easing: 0, stable: 1, tightening: 2 };

export function sortedBottlenecks(entries: SupplyChainBottleneck[] = supplyChainBottlenecks) {
  return [...entries].sort((left, right) =>
    Number(Boolean(right.featured)) - Number(Boolean(left.featured))
    || severity[right.status] - severity[left.status]
    || trendPriority[right.trend] - trendPriority[left.trend]
    || right.reviewedAt.localeCompare(left.reviewedAt));
}

export function bottleneckById(id?: string | null) {
  return supplyChainBottlenecks.find((entry) => entry.id === id || entry.slug === id);
}

export function featuredBottleneck() {
  return supplyChainBottlenecks.find((entry) => entry.featured);
}

export function homeBottlenecks() {
  return sortedBottlenecks().slice(0, 3);
}

export function bottlenecksForReport(reportId: string) {
  return sortedBottlenecks(supplyChainBottlenecks.filter((entry) => entry.reportIds.includes(reportId)));
}

export function filterBottlenecks(
  category: BottleneckCategory | 'all',
  status: BottleneckStatus | 'all',
  trend: BottleneckTrend | 'all',
) {
  return sortedBottlenecks(supplyChainBottlenecks.filter((entry) =>
    (category === 'all' || entry.category === category)
    && (status === 'all' || entry.status === status)
    && (trend === 'all' || entry.trend === trend)));
}

export function bottleneckStatusCounts() {
  return Object.fromEntries(
    (['normal', 'watch', 'tight', 'critical'] as BottleneckStatus[])
      .map((status) => [status, supplyChainBottlenecks.filter((entry) => entry.status === status).length]),
  ) as Record<BottleneckStatus, number>;
}

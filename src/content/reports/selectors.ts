import { sourceRegistry } from '../sources/index.js';
import { industryReports } from './entries.js';
import type { IndustryReport, ReportCategory, ReportPeriodFilter, ReportSourceFilter } from './types.js';

export const reportCategoryLabels: Record<ReportCategory, string> = {
  macro: '거시경제',
  'semiconductors-ai': '반도체·AI',
  'power-data-centers': '전력·데이터센터',
  'energy-commodities': '에너지·원자재',
  'construction-infrastructure': '건설·인프라',
};

export const reportAccessLabels = {
  'public-full': '공개 원문',
  'public-summary': '공개 요약',
  'registration-required': '등록 필요',
  restricted: '접근 제한',
} as const;

export function reportSource(report: IndustryReport) {
  return sourceRegistry[report.sourceRefs[0]];
}

export function reportById(id?: string | null) {
  return industryReports.find((report) => report.id === id || report.slug === id);
}

export function reportsForMap(mapId: string) {
  return industryReports.filter((report) => report.marketMapIds.includes(mapId));
}

export function reportsForPick(pickId: string) {
  return industryReports.filter((report) => report.pickIds.includes(pickId));
}

export function sortedReports(reports: IndustryReport[] = industryReports) {
  return [...reports].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.publishedAt.localeCompare(a.publishedAt));
}

export function filterReports(
  category: ReportCategory | 'all',
  period: ReportPeriodFilter,
  source: ReportSourceFilter,
  now = new Date(),
) {
  const periodDays = period === 'week' ? 7 : period === 'month' ? 31 : null;
  const cutoff = periodDays ? new Date(now.getTime() - periodDays * 86_400_000) : null;
  return sortedReports(industryReports.filter((report) => {
    if (category !== 'all' && report.category !== category) return false;
    if (cutoff && new Date(`${report.publishedAt}T23:59:59Z`) < cutoff) return false;
    if (source === 'company' && report.sourceType !== 'company-ir') return false;
    if (source === 'official' && report.sourceType === 'company-ir') return false;
    return true;
  }));
}

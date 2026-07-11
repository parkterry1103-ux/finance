import { supplyChainBottlenecks } from '../bottlenecks/entries.js';
import { industryReports } from '../reports/entries.js';
import { macroDomainBriefs } from './briefs.js';
import { macroIndicatorDefinitions } from './indicators.js';
import type { MacroDomain } from './types.js';

export const macroDomainOrder: MacroDomain[] = [
  'rates',
  'financial-conditions',
  'liquidity',
  'industry-infrastructure',
];

export const macroDomainLabels: Record<MacroDomain, string> = {
  rates: '금리 구조',
  'financial-conditions': '금융여건',
  liquidity: '유동성',
  'industry-infrastructure': '산업·인프라 수요',
};

export const macroFrequencyLabels = {
  daily: '일별',
  weekly: '주별',
  monthly: '월별',
} as const;

export const macroBriefTrendLabels = {
  improving: '완화·개선 방향',
  stable: '혼재·변화 적음',
  worsening: '부담 확대 방향',
} as const;

export function macroIndicatorById(id?: string | null) {
  return macroIndicatorDefinitions.find((entry) => entry.id === id || entry.seriesId === id);
}

export function macroIndicatorsByDomain(domain: MacroDomain) {
  return macroIndicatorDefinitions.filter((entry) => entry.domain === domain);
}

export function macroBriefByDomain(domain: MacroDomain) {
  return macroDomainBriefs.find((entry) => entry.domain === domain);
}

export function macroRelatedReports(limit = 4) {
  const ids = [...new Set(macroDomainBriefs.flatMap((brief) => brief.reportIds))];
  return ids.map((id) => industryReports.find((report) => report.id === id)).filter(Boolean).slice(0, limit);
}

export function macroRelatedBottlenecks() {
  const ids = [...new Set(macroDomainBriefs.flatMap((brief) => brief.bottleneckIds))];
  return ids.map((id) => supplyChainBottlenecks.find((entry) => entry.id === id)).filter(Boolean);
}

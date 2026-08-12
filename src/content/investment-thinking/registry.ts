import type { InvestmentCase, InvestmentCaseSummary } from './types.js';

export const investmentCaseSummaries: InvestmentCaseSummary[] = [
  {
    id: 'CASE-001',
    slug: 'pilot-001',
    title: '반도체 지원 뉴스에서 내가 제주반도체를 먼저 떠올린 이유',
    eventDate: '2026-08-10',
    market: 'KR',
    tags: ['반도체', '정책 뉴스', '시장 서사'],
    eyebrow: 'Investment Thinking Lab · Pilot #001',
    summary: '사건을 보고 떠오른 첫 생각, 그 안의 편향, 검증할 가설과 틀렸다는 신호를 세 장에 기록했습니다.',
    path: '/ko/lab/cases/pilot-001',
  },
];

const investmentCaseLoaders: Record<string, () => Promise<InvestmentCase>> = {
  'pilot-001': () => import('./cases/pilot-001.js').then((module) => module.investmentCase),
};

export function hasInvestmentCaseSlug(slug: string) {
  return Boolean(investmentCaseLoaders[slug]);
}

export async function loadInvestmentCase(slug: string) {
  return investmentCaseLoaders[slug]?.();
}

export function investmentCasePath(slug: string) {
  return `/ko/lab/cases/${encodeURIComponent(slug)}`;
}

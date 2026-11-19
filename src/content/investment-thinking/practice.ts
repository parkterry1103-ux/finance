import { publishedEditorialSummaryIndex } from '../editorial/summaries.js';
import type { DailyStockDissection, EditorialEvidence, StockDissectionSummary } from '../editorial/types.js';

// Only existing published editorial cases are offered; their full body stays lazy.
export const practiceCaseSummaries = publishedEditorialSummaryIndex
  .filter((entry): entry is StockDissectionSummary => entry.kind === 'stock' && entry.status === 'published')
  .map((entry) => ({
    id: entry.id,
    slug: `practice-${entry.slug}`,
    title: entry.headline,
    summary: entry.directCatalyst,
    company: entry.company.name,
    ticker: entry.company.ticker,
    date: entry.priceAsOf,
    path: `/ko/lab/cases/practice-${entry.slug}`,
    sourceSlug: entry.slug,
  }));

export function hasPracticeCaseSlug(slug: string) {
  return practiceCaseSummaries.some((entry) => entry.slug === slug);
}

export async function loadPracticeCase(slug: string): Promise<DailyStockDissection | undefined> {
  const summary = practiceCaseSummaries.find((entry) => entry.slug === slug);
  if (!summary) return undefined;
  const { loadStockDissection } = await import('../editorial/registry.js');
  const entry = await loadStockDissection(summary.sourceSlug);
  return entry?.status === 'published' && ['ownerVerified', 'sourceVerified'].includes(entry.verification?.status ?? '') ? entry : undefined;
}

export const practiceQuestions = [
  { id: 'peers', title: '같은 업종도 비슷하게 움직였나요?', prompt: '시장·업종과 기업의 변동을 같은 거래일·세션 기준으로 비교해 보세요.' },
  { id: 'timing', title: '사건이 가격 변동보다 먼저였나요?', prompt: '기사 발행일과 사건 발생일을 구분하세요. 시각이 없으면 선후관계를 확정하지 않아도 됩니다.' },
  { id: 'expectations', title: '이미 알려진 기대는 무엇이었나요?', prompt: '좋은 실적도 시장 기대보다 낮을 수 있습니다. 기대를 확인할 자료가 없다면 미확인으로 남기세요.' },
  { id: 'alternative', title: '다른 설명은 무엇인가요?', prompt: '시장·산업·기업 중 처음 고르지 않은 관점에서도 가능한 설명을 하나 적어보세요.' },
  { id: 'falsification', title: '무엇을 확인하면 생각을 바꾸겠나요?', prompt: '가격 방향뿐 아니라 실적·계약·현금흐름 등 확인할 수 있는 근거를 떠올려 보세요.' },
] as const;

export function evidenceTiming(evidence: EditorialEvidence, cutoff: string) {
  if (!evidence.publishedAt) return 'unknown';
  return evidence.publishedAt.slice(0, 10) <= cutoff.slice(0, 10) ? 'by-cutoff' : 'later';
}

export function comparableReturns(entry: DailyStockDissection) {
  return [
    { kind: 'company', name: entry.company.name, value: entry.priceMove.value, precision: entry.priceMove.precision, asOf: entry.priceAsOf, sourceId: entry.priceMove.sourceId },
    ...Object.entries(entry.comparison ?? {}).flatMap(([kind, value]) => value && value.asOf === entry.priceAsOf ? [{ kind, ...value }] : []),
  ];
}

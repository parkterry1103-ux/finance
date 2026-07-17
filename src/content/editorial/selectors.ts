import type {
  DailyStockDissection,
  EditorialStatus,
  EditorialSummary,
  StockDissectionSummary,
  ThreeReadsEdition,
  ThreeReadsSummary,
} from './types.js';

export const moveCharacterLabels: Record<DailyStockDissection['moveCharacter'], string> = {
  earnings: '실적 변화',
  guidance: '전망 변화',
  controlPremium: '경영권 프리미엄 기대',
  growthExpectation: '성장 기대 변화',
  moatExpectation: '경쟁우위 지속 기대',
  optionality: '신규 사업 선택권 기대',
  regulation: '규제 변화',
  macro: '금리·환율·경기 영향',
  marketWide: '시장 전체 위험회피',
  liquidity: '수급·유동성 영향',
  mixed: '여러 요인이 함께 반영',
};

export const thesisImpactLabels: Record<DailyStockDissection['thesisImpact'], string> = {
  maintain: '기존 판단 유지',
  partiallyRevise: '일부 가정 재검토',
  reassess: '전체 판단 재검토',
  notApplicable: '장기 판단과 직접 연결하지 않음',
};

export function dateIsNotFuture(value: string, today: string) {
  return Boolean(value) && value <= today;
}

export function isHomepageVisible(status: EditorialStatus) {
  return status === 'published';
}

export function isDetailVisible(status: EditorialStatus) {
  return status === 'published' || status === 'archived';
}

export function relativeReturn(companyReturn: number, comparableReturn: number) {
  return companyReturn - comparableReturn;
}

export function formatSignedPercent(value: number, precision = 1) {
  return `${value > 0 ? '+' : ''}${value.toFixed(precision)}%`;
}

export function formatRelativeReturn(value: number, precision = 1) {
  return `${value > 0 ? '+' : ''}${value.toFixed(precision)}%p`;
}

export function summarizeStockDissection(item: DailyStockDissection): StockDissectionSummary {
  return {
    kind: 'stock',
    id: item.id,
    slug: item.slug,
    status: item.status,
    publishedAt: item.publishedAt,
    eventAsOf: item.eventAsOf,
    priceAsOf: item.priceAsOf,
    company: item.company,
    headline: item.headline,
    priceMove: item.priceMove,
    directCatalyst: item.directCatalyst,
    moveCharacter: item.moveCharacter,
    cardCharacter: item.cardCharacter,
    confirmedItems: item.confirmedItems,
    unconfirmedItems: item.unconfirmedItems,
    watchItems: item.watchItems,
    comparison: item.comparison,
  };
}

export function summarizeThreeReads(item: ThreeReadsEdition): ThreeReadsSummary {
  return {
    kind: 'threeReads',
    id: item.id,
    slug: item.slug,
    status: item.status,
    publishedAt: item.publishedAt,
    contentAsOf: item.contentAsOf,
    title: item.title,
    centralQuestion: item.centralQuestion,
    commonThread: item.commonThread,
    oneLineTakeaway: item.oneLineTakeaway,
    relatedCompanySlugs: item.relatedCompanySlugs,
    readHeadlines: item.reads.map((read) => read.headline) as [string, string, string],
    readSummaries: item.reads.map((read) => read.whyItMatters) as [string, string, string],
  };
}

export function publishedEditorialSummaries(
  stockDissections: DailyStockDissection[],
  threeReadsEditions: ThreeReadsEdition[],
  today: string,
) {
  return [
    ...stockDissections.filter((item) => isHomepageVisible(item.status) && dateIsNotFuture(item.publishedAt, today)).map(summarizeStockDissection),
    ...threeReadsEditions.filter((item) => isHomepageVisible(item.status) && dateIsNotFuture(item.publishedAt, today)).map(summarizeThreeReads),
  ].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt) || left.id.localeCompare(right.id));
}

export function summariesForCompany(items: EditorialSummary[], companySlug: string, limit = 2) {
  return items.filter((item) => item.kind === 'stock'
    ? item.company.companySlug === companySlug
    : item.relatedCompanySlugs.includes(companySlug)).slice(0, limit);
}

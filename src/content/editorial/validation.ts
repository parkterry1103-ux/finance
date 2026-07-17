import { dateIsNotFuture, publishedEditorialSummaries } from './selectors.js';
import type { DailyStockDissection, EditorialSource, ThreeReadsEdition } from './types.js';

export type EditorialValidationInput = {
  stockDissections: DailyStockDissection[];
  threeReadsEditions: ThreeReadsEdition[];
  sources: EditorialSource[];
  supportedCompanySlugs: string[];
  today: string;
};

export type EditorialValidationResult = { ok: boolean; errors: string[]; publishedCount: number };

const publicStatuses = new Set(['published', 'archived']);

function hasText(value: string | undefined) {
  return Boolean(value?.trim());
}

function validHttpUrl(value: string | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validateEditorialRegistry(input: EditorialValidationInput): EditorialValidationResult {
  const errors: string[] = [];
  const supportedSlugs = new Set(input.supportedCompanySlugs);
  const stockIds = new Set(input.stockDissections.map((item) => item.id));
  const threeReadsIds = new Set(input.threeReadsEditions.map((item) => item.id));
  const allIds = [...input.stockDissections, ...input.threeReadsEditions].map((item) => item.id);
  const allSlugs = [...input.stockDissections, ...input.threeReadsEditions].map((item) => item.slug);

  if (new Set(allIds).size !== allIds.length) errors.push('콘텐츠 ID가 중복됐습니다.');
  if (new Set(allSlugs).size !== allSlugs.length) errors.push('콘텐츠 slug가 중복됐습니다.');
  if (new Set(input.sources.map((source) => source.id)).size !== input.sources.length) errors.push('출처 ID가 중복됐습니다.');

  input.stockDissections.forEach((item) => {
    const label = `주가 해부 ${item.id}`;
    const isPublic = publicStatuses.has(item.status);
    if (!hasText(item.id) || !hasText(item.slug) || !hasText(item.headline)) errors.push(`${label}: 필수 문자열이 없습니다.`);
    if (item.priceMove.unit !== 'percent' || !Number.isFinite(item.priceMove.value)) errors.push(`${label}: 등락률은 유한한 percent 값이어야 합니다.`);
    if (item.company.companySlug && !supportedSlugs.has(item.company.companySlug)) errors.push(`${label}: 지원하지 않는 기업 slug ${item.company.companySlug}입니다.`);
    if (isPublic) {
      for (const [field, value] of [['publishedAt', item.publishedAt], ['eventAsOf', item.eventAsOf], ['priceAsOf', item.priceAsOf]] as const) {
        if (!dateIsNotFuture(value, input.today)) errors.push(`${label}: ${field}가 없거나 미래 날짜입니다.`);
      }
      if (item.verification?.status !== 'ownerVerified' || item.verification.authoredBy !== 'owner' || item.verification.verifiedBy !== 'owner' || !hasText(item.verification.verifiedAt)) errors.push(`${label}: owner verification이 없습니다.`);
      if (!hasText(item.company.name) || (!hasText(item.company.ticker) && !hasText(item.company.companySlug))) errors.push(`${label}: 회사명과 ticker 또는 company slug가 필요합니다.`);
      if (!hasText(item.directCatalyst) && !hasText(item.marketInterpretation)) errors.push(`${label}: 직접 촉매 또는 시장 해석이 필요합니다.`);
      if (!item.confirmedItems.length || !item.unconfirmedItems.length || !item.watchItems.length) errors.push(`${label}: 확인·미확인·다음 확인 항목이 필요합니다.`);
      if (!item.fullArticle?.length || !item.fullArticle.every(hasText)) errors.push(`${label}: 완성 원고가 없습니다.`);
      if (!item.evidence?.length) errors.push(`${label}: 분석 근거가 없습니다.`);
      const evidenceIds = new Set(item.evidence?.map((evidence) => evidence.id) ?? []);
      if (evidenceIds.size !== (item.evidence?.length ?? 0)) errors.push(`${label}: 근거 ID가 중복됐습니다.`);
      item.evidence?.forEach((evidence) => {
        if (!hasText(evidence.id) || (!hasText(evidence.asOf) && !hasText(evidence.publishedAt)) || !hasText(evidence.factStatus)) errors.push(`${label}: ${evidence.id || '이름 없는 근거'}의 기준일 또는 성격을 추적할 수 없습니다.`);
        if (evidence.url && !validHttpUrl(evidence.url)) errors.push(`${label}: ${evidence.id}의 URL이 올바르지 않습니다.`);
      });
      new Set([item.priceMove.sourceId, ...item.sourceIds, ...[item.comparison?.market, item.comparison?.sector].filter(Boolean).map((comparison) => comparison?.sourceId ?? '')]).forEach((evidenceId) => {
        if (!evidenceIds.has(evidenceId)) errors.push(`${label}: 근거 ${evidenceId}가 evidence에 없습니다.`);
      });
    }
    [item.comparison?.market, item.comparison?.sector].filter(Boolean).forEach((comparison) => {
      if (!comparison || !Number.isFinite(comparison.value)) errors.push(`${label}: 비교 수익률은 유한한 값이어야 합니다.`);
      else if (comparison.asOf !== item.priceAsOf) errors.push(`${label}: 비교 기준일이 주가 기준일과 다릅니다.`);
    });
    item.relatedThreeReadsIds.forEach((id) => {
      if (!threeReadsIds.has(id)) errors.push(`${label}: 관련 3Reads ID ${id}가 없습니다.`);
    });
  });

  input.threeReadsEditions.forEach((item) => {
    const label = `3Reads ${item.id}`;
    const isPublic = publicStatuses.has(item.status);
    if (!hasText(item.id) || !hasText(item.slug) || !hasText(item.centralQuestion) || !hasText(item.commonThread) || !hasText(item.oneLineTakeaway)) errors.push(`${label}: 필수 문자열이 없습니다.`);
    if (item.reads.length !== 3) errors.push(`${label}: read는 정확히 3개여야 합니다.`);
    if (item.reads.map((read) => read.order).join(',') !== '1,2,3') errors.push(`${label}: order는 1,2,3이어야 합니다.`);
    const sourceUrls = item.reads.map((read) => read.source.url).filter((url): url is string => Boolean(url));
    if (new Set(sourceUrls).size !== sourceUrls.length) errors.push(`${label}: source URL이 중복됐습니다.`);
    if (isPublic) {
      for (const [field, value] of [['publishedAt', item.publishedAt], ['contentAsOf', item.contentAsOf]] as const) {
        if (!dateIsNotFuture(value, input.today)) errors.push(`${label}: ${field}가 없거나 미래 날짜입니다.`);
      }
      if (item.verification?.status !== 'ownerVerified' || item.verification.authoredBy !== 'owner' || item.verification.verifiedBy !== 'owner' || !hasText(item.verification.verifiedAt)) errors.push(`${label}: owner verification이 없습니다.`);
      item.reads.forEach((read) => {
        if (!hasText(read.headline) || !hasText(read.source.name) || (!validHttpUrl(read.source.url) && !hasText(read.source.articleIdentifier)) || !hasText(read.source.publishedAt) || !hasText(read.source.accessedAt)) errors.push(`${label}: ${read.id}의 공개 가능한 원문 정보가 없습니다.`);
        if (!hasText(read.whatHappened) || !hasText(read.structuralMeaning) || !read.officialSources?.length) errors.push(`${label}: ${read.id}의 분석 또는 공식 교차검증 자료가 없습니다.`);
        read.officialSources?.forEach((source) => {
          if (!hasText(source.name) || !validHttpUrl(source.url) || !hasText(source.publishedAt) || !hasText(source.accessedAt)) errors.push(`${label}: ${read.id}의 공식 자료 ${source.id}가 불완전합니다.`);
        });
      });
    }
    [...item.relatedCompanySlugs, ...item.reads.flatMap((read) => read.relatedCompanySlugs)].forEach((slug) => {
      if (!supportedSlugs.has(slug)) errors.push(`${label}: 지원하지 않는 기업 slug ${slug}입니다.`);
    });
    item.relatedStockDissectionIds.forEach((id) => {
      if (!stockIds.has(id)) errors.push(`${label}: 관련 주가 해부 ID ${id}가 없습니다.`);
    });
  });

  return {
    ok: errors.length === 0,
    errors,
    publishedCount: publishedEditorialSummaries(input.stockDissections, input.threeReadsEditions, input.today).length,
  };
}

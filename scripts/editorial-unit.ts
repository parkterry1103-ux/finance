import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { companyProfiles } from '../src/content/company-profiles/index.js';
import { loadEditorialRegistry } from '../src/content/editorial/registry.js';
import {
  formatRelativeReturn,
  isDetailVisible,
  isHomepageVisible,
  publishedEditorialSummaries,
  relativeReturn,
} from '../src/content/editorial/selectors.js';
import type { DailyStockDissection, EditorialSource, ThreeReadsEdition } from '../src/content/editorial/types.js';
import { validateEditorialRegistry } from '../src/content/editorial/validation.js';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const today = '2026-07-17';
const supportedCompanySlugs = companyProfiles.map((profile) => profile.slug);

const sources: EditorialSource[] = [
  { id: 'price-source', name: '공식 시세', url: 'https://example.com/price', publishedAt: today, accessedAt: today },
  { id: 'market-source', name: '공식 지수', url: 'https://example.com/market', publishedAt: today, accessedAt: today },
];

const validStock: DailyStockDissection = {
  id: 'stock-valid', slug: 'stock-valid', status: 'published', publishedAt: today, eventAsOf: today, priceAsOf: today,
  company: { name: 'NVIDIA', ticker: 'NVDA', companySlug: 'nvidia' },
  headline: '공식 발표 뒤 시장 반응을 확인합니다.',
  priceMove: { value: 17, unit: 'percent', periodLabel: '당일', sourceId: 'price-source' },
  directCatalyst: '공식 발표가 있었습니다.', marketInterpretation: '기대 변화가 반영됐는지 확인합니다.', moveCharacter: 'earnings',
  confirmedItems: ['공식 발표'], unconfirmedItems: ['지속성'], reasons: [{ title: '실적 변화', explanation: '공식 수치 변화' }],
  comparison: { market: { name: '시장', value: 1.8, asOf: today, sourceId: 'market-source' } },
  marketWideFactors: ['시장 지수'], companySpecificFactors: ['공식 발표'], thesisImpact: 'partiallyRevise', watchItems: ['다음 분기'],
  relatedThreeReadsIds: ['three-valid'], sourceIds: ['price-source', 'market-source'], disclaimer: '정보 제공 목적입니다.',
};

const validThreeReads: ThreeReadsEdition = {
  id: 'three-valid', slug: 'three-valid', status: 'published', publishedAt: today, contentAsOf: today,
  title: '세 사례를 하나의 질문으로 봅니다.', centralQuestion: '협상력은 어디로 이동할까?', introduction: '확인된 출처만 사용합니다.',
  reads: [1, 2, 3].map((order) => ({
    id: `read-${order}`, order: order as 1 | 2 | 3, headline: `사례 ${order}`,
    source: { name: `매체 ${order}`, url: `https://example.com/read-${order}`, publishedAt: today, accessedAt: today },
    relatedCompanies: order === 1 ? ['NVIDIA'] : [], relatedCompanySlugs: order === 1 ? ['nvidia'] : [], relatedIndustries: ['반도체'],
    whatHappened: '확인된 사건입니다.', whyItMatters: '협상력 변화의 단서입니다.', structuralMeaning: '전환 비용을 확인합니다.',
  })) as ThreeReadsEdition['reads'],
  commonThread: '대안과 전환 비용을 함께 봅니다.', investorQuestions: ['대안이 있는가?'], oneLineTakeaway: '전환 비용이 협상력을 바꿉니다.',
  relatedCompanySlugs: ['nvidia'], relatedIndustries: ['반도체'], relatedStockDissectionIds: ['stock-valid'], disclaimer: '정보 제공 목적입니다.',
};

function validate(stockDissections: DailyStockDissection[], threeReadsEditions: ThreeReadsEdition[]) {
  return validateEditorialRegistry({ stockDissections, threeReadsEditions, sources, supportedCompanySlugs, today });
}

const validResult = validate([validStock], [validThreeReads]);
assert(validResult.ok, `정상 fixture 실패: ${validResult.errors.join(' | ')}`);
assert(validResult.publishedCount === 2, '정상 fixture 공개 요약 수가 다릅니다.');

assert(!isHomepageVisible('draft') && !isHomepageVisible('verified') && isHomepageVisible('published') && !isHomepageVisible('archived'), '홈 상태 selector가 다릅니다.');
assert(!isDetailVisible('draft') && !isDetailVisible('verified') && isDetailVisible('published') && isDetailVisible('archived'), '상세 상태 selector가 다릅니다.');
assert(publishedEditorialSummaries([{ ...validStock, status: 'verified' }], [{ ...validThreeReads, status: 'archived' }], today).length === 0, 'published 외 상태가 홈 index에 포함됐습니다.');

const future = validate([{ ...validStock, publishedAt: '2026-07-18' }], [validThreeReads]);
assert(!future.ok && future.errors.some((error) => error.includes('미래 날짜')), '미래 날짜 fixture가 실패하지 않았습니다.');

for (const count of [2, 4]) {
  const reads = Array.from({ length: count }, (_, index) => ({ ...validThreeReads.reads[Math.min(index, 2)], id: `count-${count}-${index}`, order: index + 1 }));
  const result = validate([validStock], [{ ...validThreeReads, reads: reads as unknown as ThreeReadsEdition['reads'] }]);
  assert(!result.ok && result.errors.some((error) => error.includes('정확히 3개')), `3Reads ${count}개 fixture가 실패하지 않았습니다.`);
}

assert(relativeReturn(17, 1.8) === 15.2, '상대수익률 계산이 다릅니다.');
assert(formatRelativeReturn(relativeReturn(17, 1.8)) === '+15.2%p', '상대수익률 표시가 %p가 아닙니다.');

const unsupportedCompany = validate([{ ...validStock, company: { ...validStock.company, companySlug: 'unsupported-company' } }], [validThreeReads]);
assert(!unsupportedCompany.ok && unsupportedCompany.errors.some((error) => error.includes('지원하지 않는 기업 slug')), '미지원 기업 fixture가 실패하지 않았습니다.');

const brokenRelation = validate([{ ...validStock, relatedThreeReadsIds: ['missing-three-reads'] }], [validThreeReads]);
assert(!brokenRelation.ok && brokenRelation.errors.some((error) => error.includes('관련 3Reads ID')), '깨진 관계 fixture가 실패하지 않았습니다.');

const missingSources = validate([{ ...validStock, sourceIds: ['missing-source'] }], [validThreeReads]);
assert(!missingSources.ok && missingSources.errors.some((error) => error.includes('공개 가능한 출처')), '출처 누락 fixture가 실패하지 않았습니다.');

const realRegistry = await loadEditorialRegistry();
const draftResult = validateEditorialRegistry({ ...realRegistry, supportedCompanySlugs, today });
assert(draftResult.ok, `실제 draft registry 검증 실패: ${draftResult.errors.join(' | ')}`);
assert(draftResult.publishedCount === 0, '검증되지 않은 fixture가 공개 index에 포함됐습니다.');

const publicSources = [
  join(process.cwd(), 'src', 'components', 'editorial', 'NewsroomHome.tsx'),
  join(process.cwd(), 'src', 'components', 'editorial', 'EditorialUi.tsx'),
  join(process.cwd(), 'src', 'routes', 'InsightsRoute.tsx'),
  join(process.cwd(), 'src', 'routes', 'StockDissectionRoute.tsx'),
  join(process.cwd(), 'src', 'routes', 'ThreeReadsRoute.tsx'),
].filter((file) => {
  try { readFileSync(file); return true; } catch { return false; }
});
const publicCopy = publicSources.map((file) => readFileSync(file, 'utf8')).join('\n');
const prohibited = ['BUY', 'HOLD', 'SELL', '목표주가', '상승여력', '하락여력', '무조건 저평가', '무조건 고평가', '투자 성공 확률', '주가 상승 확률', '추천 종목', '초보자용', '초보자를 위한'];
prohibited.forEach((phrase) => assert(!publicCopy.includes(phrase), `Phase 5A 공개 화면에 금지 표현이 있습니다: ${phrase}`));

console.log(`Editorial unit passed: status 8, validation fixtures 8, published ${draftResult.publishedCount}, supported companies ${supportedCompanySlugs.length}`);

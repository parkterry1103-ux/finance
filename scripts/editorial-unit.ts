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
  summariesForCompany,
} from '../src/content/editorial/selectors.js';
import { publishedEditorialSummaryIndex } from '../src/content/editorial/summaries.js';
import type { DailyStockDissection, ThreeReadsEdition } from '../src/content/editorial/types.js';
import { validateEditorialRegistry } from '../src/content/editorial/validation.js';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const today = '2026-07-17';
const supportedCompanySlugs = companyProfiles.map((profile) => profile.slug);
const verification = { authoredBy: 'owner', verifiedBy: 'owner', verifiedAt: '2026-07-17T16:55:00+09:00', status: 'ownerVerified' } as const;

const validStock: DailyStockDissection = {
  id: 'stock-valid', slug: 'stock-valid', status: 'published', publishedAt: today, eventAsOf: today, priceAsOf: today,
  company: { name: 'SK하이닉스', ticker: '000660.KS', companySlug: 'sk-hynix' },
  headline: '공식 움직임과 아직 확인되지 않은 항목을 구분합니다.',
  priceMove: { value: -15.37, unit: 'percent', periodLabel: '당일', sourceId: 'price-source', precision: 2 },
  directCatalyst: '시장과 업종 요인이 함께 작용했습니다.', marketInterpretation: '기대 변화와 수급이 먼저 반영됐는지 확인합니다.', moveCharacter: 'mixed',
  confirmedItems: ['동일 거래일 등락률'], unconfirmedItems: ['공식 주문 취소'], reasons: [{ title: '수급 변화', explanation: '시장 자료를 확인합니다.' }],
  verification,
  evidence: [
    { id: 'price-source', type: 'price', factStatus: 'marketData', asOf: today, note: '동일 거래일 시세' },
    { id: 'flow-source', type: 'flow', factStatus: 'editorialInterpretation', asOf: today, note: '수급 해석' },
  ],
  fullArticle: ['완성된 편집 원고입니다.'],
  comparison: { sector: { name: '삼성전자', value: -10.70, asOf: today, sourceId: 'price-source', precision: 2 } },
  marketWideFactors: ['시장 위험회피'], companySpecificFactors: ['업종 기대 재평가'], thesisImpact: 'maintain', watchItems: ['다음 실적'],
  relatedThreeReadsIds: ['three-valid'], sourceIds: ['flow-source'], disclaimer: '정보 제공 목적입니다.',
};

const validThreeReads: ThreeReadsEdition = {
  id: 'three-valid', slug: 'three-valid', status: 'published', publishedAt: today, contentAsOf: today,
  title: '세 사례를 하나의 질문으로 봅니다.', centralQuestion: '협상력은 어디로 이동할까?', introduction: '확인된 출처만 사용합니다.', verification,
  reads: [1, 2, 3].map((order) => ({
    id: `read-${order}`, order: order as 1 | 2 | 3, headline: `사례 ${order}`,
    source: { name: `매체 ${order}`, url: `https://example.com/read-${order}`, publishedAt: today, accessedAt: today },
    officialSources: [{ id: `official-${order}`, name: `공식 자료 ${order}`, url: `https://example.com/official-${order}`, publishedAt: today, accessedAt: today }],
    factCheckStatus: 'checked' as const,
    relatedCompanies: order === 1 ? ['SK하이닉스'] : [], relatedCompanySlugs: order === 1 ? ['sk-hynix'] : [], relatedIndustries: ['반도체'],
    whatHappened: '확인된 사건입니다.', whyItMatters: '협상력 변화의 단서입니다.', structuralMeaning: '전환 비용을 확인합니다.',
  })) as ThreeReadsEdition['reads'],
  commonThread: '대안과 전환 비용을 함께 봅니다.', investorQuestions: ['대안이 있는가?'], oneLineTakeaway: '전환 비용이 협상력을 바꿉니다.',
  relatedCompanySlugs: ['sk-hynix'], relatedIndustries: ['반도체'], relatedStockDissectionIds: ['stock-valid'], disclaimer: '정보 제공 목적입니다.',
};

function validate(stockDissections: DailyStockDissection[], threeReadsEditions: ThreeReadsEdition[]) {
  return validateEditorialRegistry({ stockDissections, threeReadsEditions, sources: [], supportedCompanySlugs, today });
}

const validResult = validate([validStock], [validThreeReads]);
assert(validResult.ok, `owner verified 정상 fixture 실패: ${validResult.errors.join(' | ')}`);
assert(validResult.publishedCount === 2, '정상 fixture 공개 요약 수가 다릅니다.');

assert(!isHomepageVisible('draft') && !isHomepageVisible('verified') && isHomepageVisible('published') && !isHomepageVisible('archived'), '홈 상태 selector가 다릅니다.');
assert(!isDetailVisible('draft') && !isDetailVisible('verified') && isDetailVisible('published') && isDetailVisible('archived'), '상세 상태 selector가 다릅니다.');
assert(publishedEditorialSummaries([{ ...validStock, status: 'verified' }], [{ ...validThreeReads, status: 'archived' }], today).length === 0, 'published 외 상태가 홈 index에 포함됐습니다.');

const future = validate([{ ...validStock, publishedAt: '2026-07-18' }], [validThreeReads]);
assert(!future.ok && future.errors.some((error) => error.includes('미래 날짜')), '미래 날짜 fixture가 실패하지 않았습니다.');

for (const count of [2, 4]) {
  const reads = Array.from({ length: count }, (_, index) => ({ ...validThreeReads.reads[Math.min(index, 2)], id: `count-${count}-${index}`, order: index + 1 }));
  const result = validate([validStock], [{ ...validThreeReads, reads: reads as unknown as ThreeReadsEdition['reads'] }]);
  assert(!result.ok && result.errors.some((error) => error.includes('정확히 3개')), `오늘의 월스트리트 ${count}개 fixture가 실패하지 않았습니다.`);
}

const identifierOnlyReads = [...validThreeReads.reads] as ThreeReadsEdition['reads'];
identifierOnlyReads[0] = { ...identifierOnlyReads[0], source: { ...identifierOnlyReads[0].source, url: undefined, articleIdentifier: 'article-001' } };
const identifierOnlyResult = validate([validStock], [{ ...validThreeReads, reads: identifierOnlyReads }]);
assert(identifierOnlyResult.ok, `기사 식별자만 있는 오늘의 월스트리트가 실패했습니다: ${identifierOnlyResult.errors.join(' | ')}`);

const missingEvidence = validate([{ ...validStock, evidence: [] }], [validThreeReads]);
assert(!missingEvidence.ok && missingEvidence.errors.some((error) => error.includes('분석 근거가 없습니다')), '근거 없는 Published 주가 해부가 실패하지 않았습니다.');

const missingOwnerVerification = validate([{ ...validStock, verification: undefined }], [validThreeReads]);
assert(!missingOwnerVerification.ok && missingOwnerVerification.errors.some((error) => error.includes('owner verification')), 'owner verification 없는 Published 주가 해부가 실패하지 않았습니다.');

assert(relativeReturn(-15.37, -10.70) === -4.67, 'SK하이닉스 상대수익률 계산이 다릅니다.');
assert(formatRelativeReturn(relativeReturn(-15.37, -10.70), 2) === '-4.67%p', 'SK하이닉스 상대수익률 표시가 %p가 아닙니다.');

const dateMismatch = validate([{ ...validStock, comparison: { sector: { ...validStock.comparison!.sector!, asOf: '2026-07-16' } } }], [validThreeReads]);
assert(!dateMismatch.ok && dateMismatch.errors.some((error) => error.includes('비교 기준일')), '가격 비교 날짜 불일치 fixture가 실패하지 않았습니다.');

const unsupportedCompany = validate([{ ...validStock, company: { ...validStock.company, companySlug: 'unsupported-company' } }], [validThreeReads]);
assert(!unsupportedCompany.ok && unsupportedCompany.errors.some((error) => error.includes('지원하지 않는 기업 slug')), '미지원 기업 fixture가 실패하지 않았습니다.');

const brokenRelation = validate([{ ...validStock, relatedThreeReadsIds: ['missing-three-reads'] }], [validThreeReads]);
assert(!brokenRelation.ok && brokenRelation.errors.some((error) => error.includes('관련 3Reads ID')), '깨진 관계 fixture가 실패하지 않았습니다.');

assert(supportedCompanySlugs.includes('sk-hynix'), 'SK하이닉스 기존 company slug를 찾지 못했습니다.');
assert(!supportedCompanySlugs.includes('burberry'), 'Burberry 가짜 기업 프로필이 추가됐습니다.');

const realRegistry = await loadEditorialRegistry();
const registryResult = validateEditorialRegistry({ ...realRegistry, supportedCompanySlugs, today });
assert(registryResult.ok, `실제 editorial registry 검증 실패: ${registryResult.errors.join(' | ')}`);
assert(registryResult.publishedCount === 2, '첫 Published 콘텐츠 수가 2개가 아닙니다.');
assert(realRegistry.stockDissections.find((item) => item.id === 'paypal-control-premium-draft')?.status === 'draft', 'PayPal draft 상태가 바뀌었습니다.');
assert(realRegistry.threeReadsEditions.find((item) => item.id === 'three-reads-switching-power-draft')?.status === 'draft', 'ASML 포함 draft 상태가 바뀌었습니다.');
assert(publishedEditorialSummaryIndex.length === 2 && publishedEditorialSummaryIndex.every((item) => item.status === 'published'), '홈 요약 index에 draft가 포함됐습니다.');
assert(summariesForCompany(publishedEditorialSummaryIndex, 'sk-hynix').some((item) => item.id === 'stock-2026-07-13-sk-hynix-selloff'), 'SK하이닉스 기업 페이지 연결이 없습니다.');
assert(summariesForCompany(publishedEditorialSummaryIndex, 'burberry').length === 0, 'Burberry 기업 CTA가 생성됐습니다.');

const publicSources = [
  join(process.cwd(), 'src', 'components', 'editorial', 'NewsroomHome.tsx'),
  join(process.cwd(), 'src', 'components', 'editorial', 'EditorialUi.tsx'),
  join(process.cwd(), 'src', 'routes', 'InsightsRoute.tsx'),
  join(process.cwd(), 'src', 'routes', 'StockDissectionRoute.tsx'),
  join(process.cwd(), 'src', 'routes', 'ThreeReadsRoute.tsx'),
];
const publicCopy = publicSources.map((file) => readFileSync(file, 'utf8')).join('\n');
const prohibited = ['BUY', 'HOLD', 'SELL', '목표주가', '상승여력', '하락여력', '무조건 저평가', '무조건 고평가', '투자 성공 확률', '주가 상승 확률', '추천 종목', '초보자용', '초보자를 위한', 'WSJ 공식', 'WSJ 제공', 'WSJ 파트너 콘텐츠'];
prohibited.forEach((phrase) => assert(!publicCopy.includes(phrase), `Phase 5A.1 공개 화면에 금지 표현이 있습니다: ${phrase}`));
assert(!publicCopy.includes('오늘의 3Reads'), '사용자 화면에 이전 명칭이 남아 있습니다.');

console.log(`Editorial unit passed: owner verification, evidence policy, three-source edition, -4.67%p comparison, published ${registryResult.publishedCount}, supported companies ${supportedCompanySlugs.length}`);

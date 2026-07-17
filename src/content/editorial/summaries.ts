import type { EditorialSummary } from './types.js';

// 긴 상세 원고가 홈 bundle에 포함되지 않도록 게시 승인 시 별도 생성·검증합니다.
export const publishedEditorialSummaryIndex: EditorialSummary[] = [
  {
    kind: 'threeReads',
    id: 'three-reads-2026-07-17-standards-set-price',
    slug: '2026-07-17-standards-set-price',
    status: 'published',
    publishedAt: '2026-07-17',
    contentAsOf: '2026-07-17',
    title: '먼저 고정한 표준이 가격을 정한다',
    centralQuestion: '누가 자본·브랜드·코드를 시장의 기준점으로 먼저 고정해 다음 가격과 협상력을 가져가는가?',
    commonThread: '자본·상품·코드를 반복 가능한 계약과 선택의 표준으로 먼저 고정하는 쪽이 협상력을 얻습니다.',
    oneLineTakeaway: '큰 숫자보다 먼저 봐야 할 것은 그 숫자를 시장의 반복 가능한 기준으로 고정하는 계약과 전환율입니다.',
    relatedCompanySlugs: [],
    readHeadlines: ['희토류 공급망', 'Burberry', 'Kimi K3'],
    readSummaries: [
      '정부금융과 장기 오프테이크가 미래 생산량을 먼저 묶습니다.',
      '브랜드 회복이 정상가 판매와 재구매로 이어지는지 확인해야 합니다.',
      '성능·가격·공개 범위가 AI 모델의 새로운 기준이 될 수 있습니다.',
    ],
  },
];

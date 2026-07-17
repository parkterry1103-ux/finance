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
  {
    kind: 'stock',
    id: 'stock-2026-07-13-sk-hynix-selloff',
    slug: '2026-07-13-sk-hynix-selloff',
    status: 'published',
    publishedAt: '2026-07-17',
    eventAsOf: '2026-07-13',
    priceAsOf: '2026-07-13',
    company: { name: 'SK하이닉스', ticker: '000660.KS', companySlug: 'sk-hynix' },
    headline: 'SK하이닉스, 왜 하루 만에 15.37%나 급락했을까?',
    priceMove: { value: -15.37, unit: 'percent', periodLabel: '2026년 7월 13일 기준', sourceId: 'skh-price-2026-07-13', precision: 2 },
    directCatalyst: '중동 긴장, AI·메모리 피크아웃 우려, ADR 프리미엄 부담과 대규모 매도가 겹쳤습니다.',
    moveCharacter: 'mixed',
    cardCharacter: '시장 공포와 수급·밸류에이션 재조정',
    confirmedItems: ['SK하이닉스 -15.37%, 삼성전자 -10.70%는 같은 거래일 기준입니다.'],
    unconfirmedItems: ['HBM 주문 취소 · 주요 고객 물량 축소 · 공식 실적 전망 하향'],
    watchItems: ['HBM 수요', '외국인 수급', '메모리 가격', '다음 실적'],
    comparison: { sector: { name: '삼성전자', value: -10.70, asOf: '2026-07-13', sourceId: 'skh-price-2026-07-13', precision: 2 } },
  },
];

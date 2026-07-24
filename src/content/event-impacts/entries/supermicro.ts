import type { EventImpactRecord } from '../types.js';

const supermicroEventImpacts: EventImpactRecord[] = [
  {
    id: 'supermicro-fy2026-q4-orders-margin-review',
    companySlug: 'supermicro',
    event: {
      title: '4분기 신규 주문과 예비 매출총이익률 업데이트',
      eventAsOf: '2026-07-21',
      publishedAt: '2026-07-24',
      sourceIds: ['smci-sec-2026-preliminary-8k', 'smci-ir-2026-q4-preliminary-update'],
      editorialId: 'stock-2026-07-22-smci-orders-margin',
    },
    summary: '600억달러를 넘는 신규 주문과 15~17% 예비 매출총이익률은 수요와 제품·고객 구성의 개선 신호입니다. 다만 매출은 기존 전망 하단 부근이고 수치는 미감사이며 주문의 확정성·출하·현금 전환이 확인되지 않아 시나리오 검토 단계로 분류했습니다.',
    materiality: 'high',
    reviewOrigin: 'manual_research_review',
    confirmedFacts: [
      {
        id: 'supermicro-q4-orders-fact',
        statement: '회사는 FY2026 4분기 중 신규 주문이 600억달러를 넘었고 회계연도 말 수주잔고가 사상 최대라고 밝혔습니다.',
        confidence: 'confirmed',
        sourceIds: ['smci-sec-2026-preliminary-8k', 'smci-ir-2026-q4-preliminary-update'],
      },
      {
        id: 'supermicro-q4-margin-fact',
        statement: '회사는 FY2026 4분기 GAAP·비GAAP 매출총이익률을 15~17%로 예비 추정했고 유리한 고객·제품 구성을 이유로 들었습니다.',
        confidence: 'confirmed',
        sourceIds: ['smci-sec-2026-preliminary-8k', 'smci-ir-2026-q4-preliminary-update'],
      },
      {
        id: 'supermicro-q4-revenue-fact',
        statement: '회사는 FY2026 4분기 매출이 기존 110억~125억달러 전망의 하단 부근일 것으로 예상했습니다.',
        confidence: 'confirmed',
        sourceIds: ['smci-sec-2026-preliminary-8k', 'smci-ir-2026-q4-preliminary-update'],
      },
    ],
    unresolvedItems: [
      {
        id: 'supermicro-orders-firmness-unresolved',
        statement: '600억달러 초과 신규 주문 가운데 확정 주문의 비중, 취소 조건, 고객별 구성과 분기별 출하 일정은 공개되지 않았습니다.',
        confidence: 'unresolved',
        sourceIds: ['smci-ir-2026-q4-preliminary-update'],
      },
      {
        id: 'supermicro-margin-durability-unresolved',
        statement: '15~17% 예비 매출총이익률이 최종 실적과 이후 분기에도 유지될지는 확인되지 않았습니다.',
        confidence: 'unresolved',
        sourceIds: ['smci-ir-2026-q4-preliminary-update'],
      },
      {
        id: 'supermicro-cash-conversion-unresolved',
        statement: '대규모 주문이 재고·매입채무와 영업현금흐름을 거쳐 현금으로 전환되는 속도는 확인되지 않았습니다.',
        confidence: 'unresolved',
        sourceIds: ['smci-sec-2026-q3-10q', 'smci-ir-2026-q4-preliminary-update'],
      },
    ],
    businessDriverImpacts: [
      {
        driverId: 'supermicro-ai-server-demand',
        direction: 'strengthening',
        strength: 'high',
        confidence: 'confirmed',
        explanation: '600억달러 초과 신규 주문과 사상 최대 수주잔고는 AI 서버 수요의 강도를 보여주지만 주문이 곧 매출이라는 뜻은 아닙니다.',
      },
      {
        driverId: 'supermicro-backlog-conversion',
        direction: 'unclear',
        strength: 'high',
        confidence: 'unresolved',
        explanation: '매출이 기존 전망 하단 부근인 가운데 주문의 확정성·출하 일정·고객 인수 조건이 공개되지 않았습니다.',
      },
      {
        driverId: 'supermicro-product-customer-mix',
        direction: 'strengthening',
        strength: 'high',
        confidence: 'partially_supported',
        explanation: '회사는 예비 매출총이익률 개선의 배경으로 유리한 제품·고객 구성을 제시했지만 최종 실적 확인이 필요합니다.',
      },
      {
        driverId: 'supermicro-working-capital-delivery',
        direction: 'unclear',
        strength: 'high',
        confidence: 'unresolved',
        explanation: 'FY2026 3분기 음의 잉여현금흐름 뒤 주문 확대가 재고·매입채무와 현금 전환에 미칠 영향은 아직 확인되지 않았습니다.',
      },
    ],
    financialMetricLinks: [
      { metricId: 'revenue', direction: 'increase', confidence: 'partially_supported', explanation: '수주잔고는 미래 매출 신호지만 4분기 매출은 기존 전망 하단 부근이고 주문별 인식 시점은 미확정입니다.' },
      { metricId: 'grossMargin', direction: 'increase', confidence: 'partially_supported', explanation: '15~17%는 회사의 미감사 예비 추정으로 최종 실적 전까지 확정 마진으로 취급하지 않습니다.' },
      { metricId: 'operatingMargin', direction: 'increase', confidence: 'editorial_inference', explanation: '매출총이익률 개선은 영업이익률에 긍정적일 수 있지만 영업비용과 최종 실적이 공개되지 않았습니다.' },
      { metricId: 'inventory', direction: 'unclear', confidence: 'unresolved', explanation: '신규 주문 대응에 필요한 재고와 향후 출하 속도를 함께 확인해야 합니다.' },
      { metricId: 'accountsPayable', direction: 'unclear', confidence: 'unresolved', explanation: '부품 조달 확대가 매입채무와 지급 조건에 미치는 영향은 아직 공개되지 않았습니다.' },
      { metricId: 'operatingCashFlow', direction: 'unclear', confidence: 'unresolved', explanation: '주문과 출하가 고객 대금 회수로 이어지는 시차가 확인되지 않았습니다.' },
      { metricId: 'freeCashFlow', direction: 'unclear', confidence: 'unresolved', explanation: '3분기 큰 폭의 음의 잉여현금흐름 뒤 4분기 회복 여부를 최종 현금흐름표에서 확인해야 합니다.' },
    ],
    valuationAssumptionLinks: [
      { assumptionId: 'revenue_growth', action: 'review_scenario', confidence: 'partially_supported', explanation: '주문 규모는 성장 시나리오를 넓히지만 확정성·출하 시점이 없어 base case를 자동 변경하지 않습니다.' },
      { assumptionId: 'gross_margin', action: 'review_scenario', confidence: 'partially_supported', explanation: '15~17% 예비 매출총이익률을 최종 실적과 이후 분기에서 검증합니다.' },
      { assumptionId: 'operating_margin', action: 'monitor', confidence: 'editorial_inference', explanation: '매출총이익률 개선이 영업비용을 반영한 영업이익률로 이어지는지 확인합니다.' },
      { assumptionId: 'reinvestment_rate', action: 'review_scenario', confidence: 'unresolved', explanation: '재고·매입채무·현금흐름을 확인하기 전에는 주문 대응 운전자본 부담을 확정할 수 없습니다.' },
    ],
    reviewStage: 'scenario_review',
    reviewStatus: 'pending',
    watchItems: [
      '2026-08-11 FY2026 4분기 최종 매출과 GAAP 매출총이익률',
      '신규 주문의 확정 비중·취소 조건·출하 일정과 고객 집중',
      '재고·매입채무·영업현금흐름·잉여현금흐름의 동시 변화',
    ],
  },
];

export default supermicroEventImpacts;

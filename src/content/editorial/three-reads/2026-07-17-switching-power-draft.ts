import type { ThreeReadsEdition } from '../types.js';

export const switchingPowerDraft: ThreeReadsEdition = {
  id: 'three-reads-switching-power-draft',
  slug: 'switching-power-draft',
  status: 'draft',
  publishedAt: '',
  contentAsOf: '',
  title: '선택지가 늘어날 때 협상력은 어디로 이동할까',
  centralQuestion: '고객과 정부가 다른 선택지를 가질 때 가치사슬의 협상력은 누구에게 이동할까?',
  introduction: '사용자가 제공한 형식 예시를 typed content로 옮긴 초안입니다. 출처와 날짜가 확인되기 전에는 공개하지 않습니다.',
  reads: [
    {
      id: 'paypal-switching-draft', order: 1, headline: 'PayPal과 대체 결제수단',
      source: { name: '출처 확인 전', url: '', publishedAt: '', accessedAt: '' },
      relatedCompanies: ['PayPal'], relatedCompanySlugs: [], relatedIndustries: ['디지털 결제'],
      whatHappened: '제공된 예시의 사실관계와 원문을 확인해야 합니다.',
      whyItMatters: '결제 선택지가 늘면 고객 전환 비용과 플랫폼 협상력이 달라질 수 있습니다.',
      structuralMeaning: '고객이 대안을 선택하는 데 드는 시간과 비용을 함께 봐야 합니다.',
      investorCaution: '인수 또는 거래 관련 표현은 공식 발표 전까지 확정적으로 쓰지 않습니다.',
      watchItems: ['공식 발표', '사업 지표', '고객 전환 비용'],
    },
    {
      id: 'asml-switching-draft', order: 2, headline: 'ASML과 높은 교체 비용',
      source: { name: '출처 확인 전', url: '', publishedAt: '', accessedAt: '' },
      relatedCompanies: ['ASML'], relatedCompanySlugs: [], relatedIndustries: ['반도체 장비'],
      whatHappened: '제공된 예시의 가이던스와 기준일을 확인해야 합니다.',
      whyItMatters: '교체 비용이 높으면 공급자가 협상력을 유지할 수 있습니다.',
      structuralMeaning: '기술 독점성뿐 아니라 인증·공정 전환 비용을 함께 봐야 합니다.',
      watchItems: ['공식 가이던스', '수주', '고객 투자 일정'],
    },
    {
      id: 'connected-car-switching-draft', order: 3, headline: '커넥티드카와 시장 진입 규칙',
      source: { name: '출처 확인 전', url: '', publishedAt: '', accessedAt: '' },
      relatedCompanies: [], relatedCompanySlugs: [], relatedIndustries: ['커넥티드카'],
      whatHappened: '제공된 예시의 규제 문서와 시행 시점을 확인해야 합니다.',
      whyItMatters: '정부 규제는 제품의 시장 진입 자격을 다시 정할 수 있습니다.',
      structuralMeaning: '시장 규모와 함께 인증·보안·데이터 규칙을 확인해야 합니다.',
      watchItems: ['규제 원문', '시행 시점', '적용 대상'],
    },
  ],
  commonThread: '성장률만으로 협상력을 설명하지 않고 고객의 대안과 전환 비용, 진입 규칙을 함께 확인합니다.',
  investorQuestions: ['고객에게 실제 대안이 있는가?', '전환에는 얼마나 많은 시간과 비용이 드는가?', '규칙 변화가 진입 자격을 바꾸는가?'],
  oneLineTakeaway: '성장률과 시장 규모뿐 아니라 고객이 다른 공급자로 바꿀 수 있는지와 그 비용을 먼저 봅니다.',
  relatedCompanySlugs: [],
  relatedIndustries: ['디지털 결제', '반도체 장비', '커넥티드카'],
  relatedStockDissectionIds: ['paypal-control-premium-draft'],
  disclaimer: '이 초안은 형식 검증용이며 출처 확인 전에는 공개하지 않습니다.',
};

export default switchingPowerDraft;

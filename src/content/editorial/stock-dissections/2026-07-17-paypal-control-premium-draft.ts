import type { DailyStockDissection } from '../types.js';

export const paypalControlPremiumDraft: DailyStockDissection = {
  id: 'paypal-control-premium-draft',
  slug: 'paypal-control-premium-draft',
  status: 'draft',
  publishedAt: '',
  eventAsOf: '',
  priceAsOf: '',
  company: { name: 'PayPal', ticker: 'PYPL' },
  headline: '잠재적 거래 기대가 가격에 반영됐는지 확인하는 초안',
  priceMove: { value: 17, unit: 'percent', periodLabel: '예시 수치 · 검증 전', sourceId: 'pending-paypal-price-source' },
  directCatalyst: '사용자가 제공한 잠재적 인수 검토 보도 예시의 원문과 사실관계를 확인해야 합니다.',
  marketInterpretation: '본업의 현금창출 변화와 잠재적 경영권 프리미엄 기대를 구분해야 합니다.',
  moveCharacter: 'controlPremium',
  confirmedItems: ['현재 확인된 공식 사실 없음'],
  unconfirmedItems: ['최종 계약', '거래 가격', '자금 조달', '규제 승인'],
  reasons: [{ title: '경영권 프리미엄 기대', explanation: '잠재적 거래자가 시장가격보다 높은 가격을 제시할 수 있다는 기대인지 확인합니다.' }],
  marketWideFactors: [],
  companySpecificFactors: ['거래 검토 보도의 사실관계'],
  thesisImpact: 'reassess',
  watchItems: ['공식 발표', '거래 구조', '본업 수익성'],
  relatedThreeReadsIds: ['three-reads-switching-power-draft'],
  sourceIds: [],
  disclaimer: '이 초안은 형식 검증용이며 출처와 기준일 확인 전에는 공개하지 않습니다.',
};

export default paypalControlPremiumDraft;

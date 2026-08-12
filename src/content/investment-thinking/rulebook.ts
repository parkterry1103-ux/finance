import type { InvestmentHypothesis, InvestmentRule } from './types.js';

export const investmentRules: InvestmentRule[] = [
  {
    id: 'RULE-001',
    version: '0.1',
    title: '사실과 해석',
    principle: '사실과 내 해석을 분리한다.',
    status: 'current',
    editable: true,
  },
  {
    id: 'RULE-002',
    version: '0.1',
    title: '돈을 버는 구조',
    principle: '기업이 실제로 어떻게 돈을 버는지 먼저 이해한다.',
    status: 'current',
    editable: true,
  },
  {
    id: 'RULE-003',
    version: '0.1',
    title: '현금과 성장 비용',
    principle: '이익뿐 아니라 현금과 성장에 필요한 비용을 본다.',
    status: 'current',
    editable: true,
  },
  {
    id: 'RULE-004',
    version: '0.1',
    title: '회사와 기대',
    principle: '좋은 회사와 이미 높은 기대가 반영된 주식을 구분한다.',
    status: 'current',
    editable: true,
  },
  {
    id: 'RULE-005',
    version: '0.1',
    title: '틀렸다는 신호',
    principle: '판단을 내릴 때 동시에 무엇이 나오면 틀렸다고 인정할지 적는다.',
    status: 'current',
    editable: true,
  },
];

export const investmentHypotheses: InvestmentHypothesis[] = [
  {
    id: 'KR-THEME-001',
    statement: '일부 국내 중소형 테마 구간에서는 실제 장기 수혜 규모보다 이해하기 쉬운 뉴스와 기존 투자자 관심이 단기 가격 반응에 더 중요하게 작용할 수 있다.',
    scopeNote: '한국 시장 전체의 법칙이 아니라 사례가 쌓이며 강화·수정·폐기될 수 있는 검증 중 가설입니다.',
    status: 'testing',
  },
];

export const investmentRuleById = Object.fromEntries(investmentRules.map((rule) => [rule.id, rule]));
export const investmentHypothesisById = Object.fromEntries(investmentHypotheses.map((hypothesis) => [hypothesis.id, hypothesis]));

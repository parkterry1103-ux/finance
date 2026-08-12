import type { InvestmentCase } from '../types.js';

export const investmentCase: InvestmentCase = {
  id: 'CASE-001',
  slug: 'pilot-001',
  title: '반도체 지원 뉴스에서 내가 제주반도체를 먼저 떠올린 이유',
  eventDate: '2026-08-10',
  publishedAt: '2026-08-12',
  market: 'KR',
  tags: ['반도체', '정책 뉴스', '시장 서사'],
  status: 'published',

  eventSummary: '국내 중소형 반도체·팹리스·소부장 지원을 다룬 정책 뉴스를 접했다. 정책 규모나 개별 기업 수혜를 단정하지 않고, 그 순간 어떤 기업을 먼저 떠올렸는지 기록했다.',
  eventSourceStatus: 'editorial-input',
  whyICared: '상대적으로 작은 반도체 기업을 지원한다는 이야기를 보자 제주반도체가 가장 먼저 떠올랐다. 정책 자체보다 내가 왜 그 이름부터 생각했는지가 더 궁금했다.',
  firstThought: '정책 뉴스가 실제 실적보다 먼저 이해하기 쉬운 종목 이야기로 번역될 수 있겠다고 생각했다.',
  familiarityNote: '평소 제주반도체를 지켜봤고, 관심과 가격 변동이 크게 느껴졌다는 개인 인식이 있었다.',
  possibleBias: '이미 알고 있던 기업을 먼저 떠올렸기 때문에 정책과 더 직접 연결되는 다른 기업을 과소평가했을 수 있다.',

  hypothesis: '이번 사례에서는 실제 장기 수혜 규모뿐 아니라 투자자가 얼마나 쉽게 수혜 기업이라고 이해할 수 있는지가 단기 가격 형성에 중요할 수 있다고 가정했다.',
  impactFlow: [
    '국내 중소형 반도체 지원 뉴스',
    '이해하기 쉬운 정책 수혜 이야기 생성',
    '이미 관심이 형성된 종목으로 시선 집중',
    '검색·거래·가격이 실적보다 먼저 반응할 가능성',
    '이후 실제 실적·수주가 이야기를 검증',
  ],
  counterFlow: [
    '정책 범위와 기업의 실제 사업이 맞지 않을 수 있다.',
    '관심이 다른 기업으로 분산되거나 빠르게 사라질 수 있다.',
    '가까운 실적이 정책 서사를 받쳐주지 못할 수 있다.',
  ],
  optionalLens: '시장 서사',

  subjects: [
    {
      rank: 1,
      name: '제주반도체',
      ticker: '080220',
      familiarity: 'high',
      currentView: '가장 먼저 확인할 기업',
      reason: '이미 알고 있던 기업이고 반도체·수출·저전력 메모리 이야기를 정책 뉴스와 연결해 이해하기 쉬웠다. 가까운 실적 확인 시점도 생각의 검증 계기로 본다.',
      caution: '가격이 이미 크게 움직였다면 기대가 앞서 반영됐을 가능성을 따로 확인한다.',
      sourceIds: ['kind-krx-20260323001354'],
    },
    {
      rank: 2,
      name: '어보브반도체',
      ticker: '102120',
      familiarity: 'medium',
      currentView: '사업 연결을 먼저 확인할 기업',
      reason: '가전·산업용 MCU와 고객 개발 생태계가 정책 논리와 어디까지 연결되는지 확인하려 한다.',
      caution: '실제 매출 연결까지 고객 개발과 인증 시간이 필요할 수 있어, 단기 반응은 제주반도체보다 약할 수 있다는 개인 가설을 함께 둔다.',
      sourceIds: ['kind-krx-20260515001553'],
    },
    {
      rank: 3,
      name: '넥스트칩',
      ticker: '396270',
      familiarity: 'low',
      currentView: '숫자 검증 부담을 먼저 볼 기업',
      reason: '차량용 카메라·ADAS 반도체 이야기는 이해하기 쉽지만 실제 사업 성과와의 거리를 먼저 확인하려 한다.',
      caution: '손실이 이어지는 상황이라면 숫자 검증 부담이 크고, 기대가 깨질 때 변동도 커질 수 있다는 가능성을 본다.',
      sourceIds: ['kind-krx-20260310002441'],
    },
  ],
  falsificationSignals: [
    '정책 뉴스 이후 시장 관심이 빠르게 사라진다.',
    '내가 예상한 기업이 아니라 다른 기업에 관심이 집중된다.',
    '정책 관련성이 실제 사업이나 수주로 연결되지 않는다.',
    '가까운 실적이 시장 기대를 전혀 받쳐주지 못한다.',
    '내가 중요하게 본 시장 서사보다 다른 변수가 가격을 더 잘 설명한다.',
  ],
  ruleIds: ['RULE-001', 'RULE-002', 'RULE-004', 'RULE-005'],
  hypothesisIds: ['KR-THEME-001'],
  sources: [
    { sourceId: 'kind-krx-20260323001354', claimScope: '제주반도체 종목 식별, 팹리스 사업과 저전력 메모리·외부 위탁생산 구조' },
    { sourceId: 'kind-krx-20260515001553', claimScope: '어보브반도체 MCU 사업, 고객 개발 생태계와 제품 구성' },
    { sourceId: 'kind-krx-20260310002441', claimScope: '넥스트칩 차량용 ISP·AHD·ADAS SoC 사업 구조' },
  ],
};

export default investmentCase;

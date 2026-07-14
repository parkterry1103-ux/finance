import type { DailyMarketBrief, MarketDriver, MarketFlow } from './types.js';

export const marketDrivers: MarketDriver[] = [
  {
    id: 'kr-market-high-volatility-rebound-2026-07-10',
    label: '한국 증시의 고변동성 반등',
    confirmedFact: '7월 10일 코스피는 7,475.94로 2.52%, 코스닥은 837.43으로 5.47% 올랐습니다.',
    marketInterpretation: '직전 급락 구간 뒤 반발성 수요와 기관 자금 유입이 겹친 반등으로 해석됐지만, 장중 변동성은 여전히 컸습니다.',
    affectedAssets: ['kospi', 'kosdaq', 'usd-krw'],
    sourceRefs: ['korea-market-close-20260710', 'yonhap-korea-market-20260710', 'yahoo-finance-chart-ks11', 'yahoo-finance-chart-kq11'],
  },
  {
    id: 'us-ai-leadership-2026-07-10',
    label: 'AI 대형주의 미국 지수 기여',
    confirmedFact: 'S&P 500은 0.4%, 나스닥 종합은 0.3% 올랐고 NVIDIA는 4.0%, SK하이닉스 미국 예탁주식은 데뷔일에 13.1% 상승했습니다.',
    marketInterpretation: 'AI 관련 기업에 대한 투자자의 선호가 미국 대형 지수를 지지한 주요 배경으로 보도됐습니다.',
    affectedAssets: ['sp500', 'nasdaq-composite'],
    sourceRefs: ['ap-us-market-20260710', 'yahoo-finance-chart-gspc', 'yahoo-finance-chart-ixic'],
  },
  {
    id: 'rates-and-oil-crosscurrents-2026-07-10',
    label: '금리 상승과 유가 조정의 교차 흐름',
    confirmedFact: '미국 10년물 국채금리는 4.57%로 높아졌고 WTI 선물은 71.51달러로 전일보다 낮아졌습니다.',
    marketInterpretation: '금리 부담과 중동발 원유 공급 불확실성이 함께 남아 있어, 주가 움직임을 한 가지 요인으로만 설명하기 어려운 날이었습니다.',
    affectedAssets: ['us-10y', 'wti', 'gold'],
    sourceRefs: ['ap-us-market-20260710', 'yahoo-finance-chart-tnx', 'yahoo-finance-chart-cl-f'],
  },
];

export const marketFlows: MarketFlow[] = [
  {
    id: 'ai-leaders-to-semiconductor-map-2026-07-10',
    title: 'AI 대형주 반응이 반도체 흐름으로 이어진 경로',
    steps: [
      {
        label: 'AI 대표 기업 강세',
        detail: 'NVIDIA와 SK하이닉스 미국 예탁주식의 상승이 확인됐습니다.',
        type: 'fact',
      },
      {
        label: 'AI 선도 기업 선호 유지',
        detail: '시장 전체보다 AI 대표 기업에 관심이 집중된 당일 해석입니다.',
        type: 'interpretation',
      },
      {
        label: 'S&P 500·나스닥 상승',
        detail: '두 지수 모두 상승 마감했지만 종목별 흐름은 달랐습니다.',
        type: 'fact',
      },
      {
        label: 'AI 반도체 산업 흐름',
        detail: 'GPU, HBM, 메모리 기업의 실적과 설비투자를 함께 확인합니다.',
        type: 'relationship',
        marketMapId: 'us-semiconductors',
        companyIds: ['us-semiconductors-nvidia', 'ai-datacenter-sk-hynix', 'ai-datacenter-micron'],
      },
    ],
    sourceRefs: ['ap-us-market-20260710', 'yahoo-finance-chart-gspc', 'yahoo-finance-chart-ixic'],
    reportIds: ['nvidia-fy2027-q1', 'micron-fy2026-q3', 'semi-300mm-memory-2026'],
    bottleneckIds: ['hbm-advanced-packaging', 'data-center-power-cooling'],
  },
  {
    id: 'copper-to-power-infrastructure-2026-07-10',
    title: '구리에서 전력 인프라로 이어지는 일반적 관계',
    steps: [
      {
        label: '구리 선물 1.13% 상승',
        detail: 'COMEX 구리 선물은 6.285달러로 전일보다 높아졌습니다.',
        type: 'fact',
      },
      {
        label: '전력망의 핵심 산업 금속',
        detail: '전력망 확대는 구리 수요와 구조적으로 연결됩니다.',
        type: 'relationship',
      },
      {
        label: '데이터센터 전력 수요 확대',
        detail: '데이터센터는 전력망·배전·냉각 투자를 함께 요구할 수 있습니다.',
        type: 'relationship',
      },
      {
        label: '전력·냉각 기업 확인',
        detail: '당일 수혜를 뜻하지 않으며 수주와 실적은 별도로 검증합니다.',
        type: 'interpretation',
        marketMapId: 'datacenter-power-cooling',
        companyIds: ['datacenter-power-eaton', 'datacenter-power-vertiv', 'datacenter-power-schneider'],
      },
    ],
    sourceRefs: ['yahoo-finance-chart-hg-f', 'iea-critical-minerals-grid-copper', 'iea-electricity-2026'],
    reportIds: ['iea-critical-minerals-outlook-2025', 'iea-energy-and-ai-2025', 'iea-electricity-2026'],
    bottleneckIds: ['copper-grid-metals', 'grid-transformers-high-voltage'],
  },
];

export const dailyMarketBriefEntries: DailyMarketBrief[] = [
  {
    date: '2026-07-10',
    title: '한국은 큰 폭의 반등, 미국은 AI 대형주 중심의 상승',
    summary: '코스피와 코스닥은 최근 급락 뒤 강하게 반등했고, 미국 지수는 AI 대표 기업의 강세 속 소폭 올랐습니다. 미국 장기금리는 상승했고 구리는 강세, 금과 WTI는 약세였습니다.',
    indexAssetIds: ['kospi', 'kosdaq', 'sp500', 'nasdaq-composite'],
    macroAssetIds: ['usd-krw', 'us-10y', 'gold', 'copper', 'wti'],
    assetNotes: {
      kospi: '최근 급락 뒤 반발성 수요와 기관 자금 유입이 겹친 고변동성 반등으로 보도됐습니다.',
      kosdaq: '성장주 전반이 반등하며 프로그램 호가 효력이 일시 정지될 만큼 장중 변동성이 컸습니다.',
      sp500: 'AI 대표 기업 강세가 지수 상승을 지지한 주요 배경으로 보도됐습니다.',
      'nasdaq-composite': 'AI·반도체 기업에 대한 선호가 이어졌지만 지수 상승 폭은 제한적이었습니다.',
      'usd-krw': '환율 하락은 원화 강세 방향이며 수입 비용과 외국인 자금 흐름에 영향을 줄 수 있습니다.',
      'us-10y': '장기 금리는 약 3bp 올라 금리에 민감한 자산의 부담 요인으로 남았습니다.',
      gold: '금 선물은 소폭 하락했습니다. 달러·실질금리·안전자산 수요를 함께 봐야 합니다.',
      copper: '구리 강세는 전력망·건설·제조업 흐름을 확인하는 단서이지 기업 실적을 보장하지 않습니다.',
      wti: '주중 급등분을 일부 되돌렸지만 중동과 원유 수송 경로 불확실성은 남았습니다.',
    },
    marketDriverIds: marketDrivers.map((driver) => driver.id),
    flowIds: marketFlows.map((flow) => flow.id),
    sourceRefs: [
      'korea-market-close-20260710',
      'yonhap-korea-market-20260710',
      'ap-us-market-20260710',
      'yahoo-finance-chart-ks11',
      'yahoo-finance-chart-kq11',
      'yahoo-finance-chart-gspc',
      'yahoo-finance-chart-ixic',
      'yahoo-finance-chart-krw-x',
      'yahoo-finance-chart-tnx',
      'yahoo-finance-chart-gc-f',
      'yahoo-finance-chart-hg-f',
      'yahoo-finance-chart-cl-f',
      'iea-critical-minerals-grid-copper',
      'iea-electricity-2026',
      'cme-gold-contract-specs',
      'cme-copper-contract-specs',
      'cme-wti-contract-specs',
    ],
    asOf: '2026-07-11T06:30:00+09:00',
  },
];

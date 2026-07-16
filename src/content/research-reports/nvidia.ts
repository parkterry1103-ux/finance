import assumptionsJson from '../../../artifacts/phase-4a-valuation/nvidia/assumptions.json' with { type: 'json' };
import reverseJson from '../../../artifacts/phase-4a-valuation/nvidia/reverse-dcf.json' with { type: 'json' };
import sourcesJson from '../../../artifacts/phase-4a-valuation/nvidia/sources.json' with { type: 'json' };
import valuationJson from '../../../artifacts/phase-4a-valuation/nvidia/valuation-result.json' with { type: 'json' };
import { buildResearchReport } from './build-report.js';
import type { ResearchReportArtifactSet, ResearchReportCompanyConfig } from './types.js';

const config: ResearchReportCompanyConfig = {
  slug: 'nvidia',
  companyName: '엔비디아',
  englishName: 'NVIDIA Corporation',
  ticker: 'NVDA',
  industry: 'AI 가속 컴퓨팅·반도체',
  reportTitle: 'AI 인프라 성장과 장기 초과수익 가정의 지속성',
  snapshotVersion: '2026.07.17-final',
  newsCutoffAt: '2026-07-16T23:59:59Z',
  conclusion: '데이터센터 중심의 높은 성장과 현금창출력이 핵심이지만, 현재 가격이 요구하는 성장 경로와 장기 수익성 유지 여부를 함께 확인해야 합니다.',
  watchStatement: '다음 분기에는 데이터센터 성장률, 공급 제약 완화, 영업이익률과 운전자본의 동행 여부를 우선 확인합니다.',
  judgments: [
    {
      label: '현재 사업 판단', status: '기존 판단 유지',
      reason: 'FY2027 1분기 데이터센터 매출 성장과 차세대 플랫폼 생산 전환이 확인됐지만, 중국 데이터센터 매출을 제외한 가이던스와 높은 비교 기준을 함께 봐야 합니다.',
      changeCondition: '대형 고객 투자 축소가 주문·매출에 나타나거나 신제품 전환이 총마진과 현금흐름을 동시에 훼손하면 일부 가정을 수정합니다.',
      evidenceIds: ['nvidia-q1-results-fact', 'nvidia-rubin-production-fact'],
    },
    {
      label: '해자', status: '유지',
      reason: '가속기, 네트워킹, 시스템과 소프트웨어를 함께 묶고 다수의 서버·클라우드 파트너가 같은 플랫폼을 생산하는 구조가 전환비용을 만듭니다.',
      changeCondition: '대체 가속기가 주요 학습·추론 워크로드에서 소프트웨어 전환비용 없이 확산되면 해자 판단을 재검토합니다.',
      evidenceIds: ['nvidia-q1-platform-fact', 'nvidia-rubin-production-fact'],
    },
    {
      label: '재무건전성', status: '양호',
      reason: '최근 연간 영업현금흐름이 설비투자를 크게 웃돌고 순현금성 완충이 있어 연구개발과 제품 전환을 내부 현금으로 감당할 여지가 있습니다.',
      changeCondition: '운전자본 증가와 공급 선급금이 영업현금흐름보다 빠르게 늘거나 순현금 구조가 훼손되면 판단을 낮춥니다.',
      evidenceIds: ['nvidia-historical-calculation'],
    },
    {
      label: '산업 사이클 역할', status: '구조적 핵심',
      reason: 'AI 인프라의 연산·네트워크·시스템 설계를 함께 제공해 현재 사이클의 병목과 성능 기준에 직접 관여합니다.',
      changeCondition: '고객 자체 칩과 개방형 네트워크가 동급 성능·개발 편의성을 낮은 전환비용으로 제공하면 역할이 바뀔 수 있습니다.',
      evidenceIds: ['nvidia-rubin-production-fact', 'nvidia-japan-ai-factory-fact'],
    },
  ],
  materialNewsEvents: [
    {
      id: 'nvidia-fy2027-q1-context', companySlug: 'nvidia', title: '데이터센터 성장과 중국 제외 가이던스가 동시에 확인됨',
      publishedAt: '2026-05-20', sourceId: 'nvidia-fy2027-q1-results', sourceType: 'company', category: 'companySpecific', materiality: 'high', confidence: 'confirmed',
      affectedAssumptionIds: ['revenueGrowth', 'operatingMargin', 'geographicMix'], affectedMetricIds: ['dataCenterRevenue', 'grossMargin', 'revenueGuidance'],
      summary: 'FY2027 1분기 매출은 816억 달러, 데이터센터 매출은 752억 달러였고 회사는 다음 분기 전망에 중국 데이터센터 컴퓨팅 매출을 포함하지 않았습니다.',
      whyItMatters: '수요 강도와 수출 규제의 지역별 제약이 한 번에 드러난 사건으로, 성장률뿐 아니라 제품 구성과 마진의 지속성을 함께 점검하게 합니다.',
      transmissionPath: ['데이터센터 수요', '제품·지역 구성', '매출 성장률', '총마진·영업현금흐름', '장기 ROIC'],
      durability: 'uncertain', thesisImpact: 'maintain',
      watchItems: ['다음 분기 데이터센터 매출', '중국 제외 매출 구성', '총마진과 운전자본'],
    },
    {
      id: 'nvidia-rubin-production-context', companySlug: 'nvidia', title: 'Vera Rubin 생태계가 생산 단계로 이동',
      publishedAt: '2026-05-31', sourceId: 'nvidia-vera-rubin-production', sourceType: 'company', category: 'companySpecific', materiality: 'high', confidence: 'confirmed',
      affectedAssumptionIds: ['revenueGrowth', 'operatingMargin', 'terminalRoic'], affectedMetricIds: ['newPlatformShipments', 'networkingMix', 'grossMargin'],
      summary: '회사는 Vera Rubin 플랫폼과 Spectrum-X Ethernet Photonics가 생산 단계에 들어갔고, 생산 출하는 가을부터 시작할 예정이라고 발표했습니다.',
      whyItMatters: '차세대 제품 전환이 발표 단계에서 생산·출하 준비 단계로 이동해 성장 지속성과 생태계 전환비용을 검증할 수 있게 됐습니다.',
      transmissionPath: ['신제품 생산', '파트너 시스템 출하', '데이터센터 매출', '제품 믹스·마진', '장기 경쟁우위'],
      durability: 'structural', thesisImpact: 'maintain',
      watchItems: ['가을 생산 출하', '파트너 재고와 리드타임', 'Rubin 매출 기여와 마진'],
    },
    {
      id: 'nvidia-japan-ai-factory-context', companySlug: 'nvidia', title: '일본 국가 물리 AI 인프라 프로젝트 발표',
      publishedAt: '2026-07-16', sourceId: 'nvidia-japan-national-ai-infrastructure', sourceType: 'company', category: 'industry', materiality: 'medium', confidence: 'confirmed',
      affectedAssumptionIds: ['revenueGrowth', 'customerMix'], affectedMetricIds: ['systemDemand', 'sovereignAiPipeline'],
      summary: 'NVIDIA와 Noetra는 2만7,500개 Rubin GPU와 140MW 규모를 제시한 일본 물리 AI 인프라 프로젝트를 발표했습니다.',
      whyItMatters: '클라우드 사업자 밖 국가·산업 고객으로 수요 기반이 넓어질 가능성을 보여주지만, 발표 수량이 곧바로 인식 매출을 뜻하지는 않습니다.',
      transmissionPath: ['국가 AI 프로젝트', '시스템 주문·구축', '출하·매출 인식', '고객 다변화', '장기 성장률'],
      durability: 'uncertain', thesisImpact: 'maintain',
      watchItems: ['실제 발주와 설치 일정', '매출 인식 시점', '후속 국가·산업 고객'],
    },
  ],
  marketContext: {
    marketWide: '장기금리와 위험선호 변화는 NVIDIA만의 사건이 아니며 WACC를 통해 성장주의 먼 미래 현금흐름 가치에 영향을 줍니다.',
    companySpecific: '데이터센터 성장, 중국 제외 가이던스, Rubin 생산 전환은 NVIDIA의 매출 구성과 경쟁우위를 직접 바꾸는 기업 고유 요인입니다.',
    attributionCaution: '시장과 회사 주가가 함께 움직였다는 사실만으로 특정 뉴스의 인과를 확정하지 않으며, 공식 실적·가이던스와 실제 주문 지표를 우선합니다.',
    evidenceIds: ['nvidia-rate-fact', 'nvidia-q1-results-fact'],
  },
  moat: [
    {
      source: '개발자·파트너 생태계와 소프트웨어 전환비용',
      evidence: '가속 컴퓨팅 소프트웨어와 다수 클라우드·서버 파트너가 같은 플랫폼을 지원합니다.',
      earningsPath: '개발·배포 비용 절감 → 플랫폼 채택 유지 → 제품 믹스와 반복 수요 → 마진 방어',
      weakeningCondition: '대체 소프트웨어가 주요 워크로드를 낮은 전환비용으로 지원할 때',
      nextMetric: '주요 클라우드 인스턴스 채택, 개발자 지원 범위, 추론 워크로드 점유',
      evidenceIds: ['nvidia-q1-platform-fact', 'nvidia-rubin-production-fact'],
    },
    {
      source: '칩·네트워킹·시스템 통합',
      evidence: 'Rubin 플랫폼은 CPU·GPU·NVLink·Spectrum-X·BlueField를 랙 단위로 결합합니다.',
      earningsPath: '통합 최적화 → 구축 시간·전력당 처리량 개선 → 고객 총소유비용 절감 → 시스템 범위 확대',
      weakeningCondition: '개방형 부품 조합이 비슷한 성능과 안정성을 더 낮은 비용으로 제공할 때',
      nextMetric: '네트워킹 매출, 시스템 출하, 전력당 처리량과 고객 구축 기간',
      evidenceIds: ['nvidia-rubin-production-fact'],
    },
    {
      source: '규모의 경제와 공급망 파트너십',
      evidence: '회사는 전 세계 서버·부품 파트너와 차세대 시스템 생산을 동시에 확대하고 있습니다.',
      earningsPath: '생산 규모와 파트너 범위 → 공급 속도·제품 완성도 → 고객 채택 → 연구개발 재투자',
      weakeningCondition: '공급 집중, 품질 문제 또는 고객 자체 설계로 규모 우위가 비용 우위로 이어지지 않을 때',
      nextMetric: '리드타임, 재고, 공급 선급금, 신제품 수율과 고객 집중도',
      evidenceIds: ['nvidia-rubin-production-fact'],
    },
  ],
  financialHealth: {
    status: '양호',
    explanation: '현금성 자원과 영업현금흐름이 부채·리스와 연간 설비투자를 감당할 수 있는 수준입니다. 이는 수요 둔화가 와도 핵심 연구개발과 제품 전환을 즉시 줄이지 않아도 될 여지가 있다는 뜻입니다.',
    downturnResponse: '불황에는 고객 주문과 운전자본이 먼저 흔들릴 수 있지만, 현재 구조는 외부 자금조달보다 내부 현금으로 핵심 투자를 유지할 가능성이 높습니다.',
    changeCondition: '영업현금흐름 감소가 재고·매출채권 증가와 겹치거나 대규모 선급금이 반복되면 불황 대응 판단을 다시 봅니다.',
  },
  cycleRole: {
    role: '구조적 성장 산업의 핵심 공급자이자 설비투자 사이클의 선행 공급자',
    currentPosition: 'AI 모델 학습·추론에 필요한 가속기와 랙 단위 네트워크·시스템 설계를 공급합니다.',
    growthConnection: '클라우드·국가·산업 고객의 AI 설비투자가 시스템 출하와 데이터센터 매출로 연결됩니다.',
    upcycleEffect: '고객 투자 확대와 제품 전환이 동시에 진행되면 매출 성장과 고정비 흡수가 강화될 수 있습니다.',
    downcycleEffect: '고객 Capex 축소, 재고 조정과 수출 제한이 주문 성장률과 마진을 빠르게 낮출 수 있습니다.',
    substitutionRisk: '고객 자체 칩과 다른 가속기가 특정 워크로드를 대체할 수 있으나 소프트웨어·네트워크 전환비용이 속도를 좌우합니다.',
    durableAdvantage: '칩 한 개가 아니라 개발도구·네트워크·시스템·파트너 공급망을 묶는 능력입니다.',
    changeCondition: '주요 고객의 자체 가속기 비중 확대가 외부 GPU 주문 감소와 소프트웨어 이탈로 동시에 확인될 때입니다.',
    evidenceIds: ['nvidia-q1-platform-fact', 'nvidia-rubin-production-fact', 'nvidia-japan-ai-factory-fact'],
  },
  valuationMethod: {
    name: 'Driver-based FCFF DCF',
    whyThisModel: 'NVIDIA는 영업이익, 재투자와 운전자본을 통해 사업 전체 현금흐름을 추정할 수 있는 일반 영업기업입니다. 현재 가치는 AI 인프라 수요, 마진, 설비투자와 장기 자본수익률에 크게 좌우되므로 이 변수를 함께 반영하는 FCFF DCF를 사용했습니다.',
    easyExplanation: '앞으로 사업 전체가 벌어들일 현금에서 성장에 필요한 투자를 뺀 뒤, 그 현금을 오늘 가치로 바꾸어 합산하는 방식입니다.',
    unusedMethods: [
      { name: '배당할인모형', reason: '배당만으로 사업 전체 현금창출력과 재투자를 설명하기 어렵습니다.' },
      { name: '잔여이익모형', reason: '장부가치와 규제자본이 핵심인 금융회사보다 일반 영업기업에 덜 적합합니다.' },
      { name: 'FCFE', reason: '부채 조달·상환보다 사업 전체 현금흐름을 먼저 평가하는 FCFF가 현재 구조에 더 적합합니다.' },
    ],
  },
  newsValuationImpacts: [
    {
      eventId: 'nvidia-fy2027-q1-context', affectedAssumption: '명시적 매출 성장률·정상 영업이익률', previousAssumption: '4A 기준 첫해 성장률 30.0%, 정상 영업이익률 60.4%',
      reviewRange: '중국 제외 가이던스와 데이터센터 성장의 순효과가 다음 분기 실적에 나타나는지 확인',
      valuePath: ['지역·제품 구성', '매출 성장률', '영업이익률', 'FCFF', '기업가치'], modelChange: '기준 시나리오는 유지하고 보수 조건의 중요도를 높여 관찰합니다.',
    },
    {
      eventId: 'nvidia-rubin-production-context', affectedAssumption: '성장 지속기간·Terminal ROIC', previousAssumption: '7년 명시적 전망과 장기 ROIC 40.0%',
      reviewRange: '생산 발표가 실제 출하·매출·마진으로 전환되는 범위',
      valuePath: ['신제품 출하', '매출과 제품 믹스', '마진', '재투자 효율', 'Terminal Value'], modelChange: '출하 실적 확인 전까지 장기 가정을 올리지 않았습니다.',
    },
    {
      eventId: 'nvidia-japan-ai-factory-context', affectedAssumption: '고객 다변화·매출 성장률', previousAssumption: '기준 시나리오의 기존 고객·산업 수요 경로',
      reviewRange: '발표 물량의 실제 발주와 매출 인식 시점',
      valuePath: ['국가 프로젝트', '발주·설치', '매출 인식', '고객 집중도', '장기 성장'], modelChange: '프로젝트 발표만으로 수치 가정을 변경하지 않았습니다.',
    },
  ],
  excludedNewsSummary: '주가 움직임만 설명한 기사, 같은 발표를 반복한 기사, 제품 홍보성 업데이트와 수주·매출 시점이 확인되지 않은 루머는 제외했습니다.',
  executiveSummary: {
    strengths: [
      { title: '플랫폼 범위', body: '가속기·네트워킹·시스템·소프트웨어를 함께 공급합니다.', evidenceIds: ['nvidia-q1-platform-fact'] },
      { title: '현금창출 기반', body: '최근 연간 영업이익과 영업현금흐름이 함께 확대됐습니다.', evidenceIds: ['nvidia-historical-calculation'] },
    ],
    risks: [
      { title: '높은 장기 가정', body: '계속가치는 장기 자본수익률 유지 여부에 민감합니다.', evidenceIds: ['nvidia-dcf-calculation', 'nvidia-roic-fade-calculation'] },
      { title: '인프라·규제 제약', body: '전력·냉각·공급과 수출 규제가 실제 인도 경로에 영향을 줄 수 있습니다.', evidenceIds: ['nvidia-macro-fact'] },
    ],
    nextChecks: [
      { title: '핵심 사업 성장', body: '데이터센터 매출 성장률과 신제품 전환을 확인합니다.', evidenceIds: ['nvidia-q1-results-fact'] },
      { title: '마진과 현금', body: '영업이익률·운전자본·설비투자의 동행을 확인합니다.', evidenceIds: ['nvidia-historical-calculation'] },
    ],
  },
  business: [
    {
      title: '가속기와 네트워킹을 묶은 데이터센터 플랫폼',
      body: 'GPU만이 아니라 네트워킹·시스템·소프트웨어를 함께 공급하는 구조가 고객의 AI 인프라 투자에서 차지하는 범위를 넓힙니다.',
      evidenceIds: ['nvidia-q1-platform-fact', 'nvidia-business-interpretation'],
    },
    {
      title: '경쟁의 초점은 칩 한 개보다 전체 시스템 효율',
      body: '대체 가속기, 고객 자체 칩, 전력·냉각 제약은 성능뿐 아니라 총소유비용과 공급 속도를 함께 비교하게 만듭니다.',
      evidenceIds: ['nvidia-q1-platform-fact', 'nvidia-macro-fact'],
    },
  ],
  earnings: [
    {
      title: 'FY2027 1분기 데이터센터가 성장의 중심',
      body: '공식 발표 기준 분기 매출은 816억 달러, 데이터센터 매출은 752억 달러였고 데이터센터 매출은 전년 동기 대비 92% 증가했습니다.',
      evidenceIds: ['nvidia-q1-results-fact'],
    },
    {
      title: '과거 이익률 급상승의 지속 가능성이 핵심 변수',
      body: '연간 매출과 영업이익의 확대는 분명하지만, 모델은 높은 정상 영업이익률을 사용하므로 제품 전환 비용과 공급 구성이 중요합니다.',
      evidenceIds: ['nvidia-historical-calculation', 'nvidia-model-interpretation'],
    },
  ],
  financial: [
    {
      title: '현금창출과 재투자 요구를 함께 점검',
      body: '영업현금흐름이 확대됐지만 고성장 과정의 운전자본과 설비·공급 투자 가정이 FCFF에 직접 영향을 줍니다.',
      evidenceIds: ['nvidia-historical-calculation', 'nvidia-dcf-calculation'],
    },
    {
      title: '장기 ROIC 가정은 계속가치의 핵심',
      body: '기준 조건은 장기 ROIC 40%를 사용합니다. 경쟁 심화로 이 수치가 자본비용에 가까워질 때의 진단을 별도로 제시합니다.',
      evidenceIds: ['nvidia-dcf-calculation', 'nvidia-roic-fade-calculation'],
    },
  ],
  industryClaims: [
    {
      title: 'AI 인프라 투자와 전력 제약을 같이 봐야 함',
      body: '컴퓨팅 수요가 커져도 데이터센터 전력·냉각·네트워크 조달이 지연되면 실제 시스템 인도와 사용 시점이 달라질 수 있습니다.',
      evidenceIds: ['nvidia-macro-fact', 'nvidia-business-interpretation'],
    },
    {
      title: '장기금리는 현금흐름의 할인율 경로',
      body: '장기금리 변화는 WACC를 통해 먼 미래 현금흐름의 현재가치에 영향을 주므로 성장률만 분리해 보지 않습니다.',
      evidenceIds: ['nvidia-rate-fact', 'nvidia-scenario-calculation'],
    },
  ],
  outlook: [
    {
      title: '확인 계기',
      body: '신제품 램프업, 네트워킹 결합 판매, 공급 확대가 매출 성장과 현금흐름으로 이어지는지 확인합니다.',
      evidenceIds: ['nvidia-q1-platform-fact', 'nvidia-business-interpretation'],
    },
    {
      title: '주요 위험',
      body: '고객 투자 속도 둔화, 자체 가속기 확대, 수출 규제, 전력 인프라 지연, 높은 장기 수익성 가정의 훼손이 핵심 점검 항목입니다.',
      evidenceIds: ['nvidia-macro-fact', 'nvidia-model-interpretation'],
    },
  ],
  glossary: [
    {
      term: 'FCFF', english: 'Free Cash Flow to Firm',
      definition: '채권자와 주주에게 귀속되기 전 사업 전체가 창출한 잉여현금흐름입니다.',
      easyExplanation: '영업으로 번 현금에서 사업 유지와 성장에 필요한 투자를 뺀 금액입니다.',
      relevance: 'NVIDIA의 성장 과정에서 운전자본과 공급·설비 투자가 현금으로 얼마나 전환되는지 보여줍니다.',
    },
    {
      term: 'WACC', english: 'Weighted Average Cost of Capital',
      definition: '자기자본비용과 세후부채비용을 자본구조 비중으로 가중한 할인율입니다.',
      easyExplanation: '미래 현금을 오늘의 가치로 바꿀 때 적용하는 사업 전체의 요구수익률입니다.',
      relevance: 'AI 인프라 성장의 먼 미래 현금흐름을 현재가치로 환산하는 기준입니다.',
    },
    {
      term: 'ROIC', english: 'Return on Invested Capital',
      definition: '영업에 투입된 자본이 세후 영업이익을 만들어 내는 효율을 나타냅니다.',
      easyExplanation: '사업에 넣은 돈 1원이 얼마나 효율적으로 이익을 만드는지 보는 지표입니다.',
      relevance: '높은 장기 ROIC가 유지되는지가 NVIDIA 계속가치의 핵심 가정입니다.',
    },
    {
      term: 'Terminal Value', english: 'Terminal Value',
      definition: '명시적 전망기간 이후의 현금흐름을 하나의 현재가치로 환산한 계속가치입니다.',
      easyExplanation: '상세 예측이 끝난 뒤에도 사업이 이어진다고 보고 계산한 장기 가치입니다.',
      relevance: '장기 성장률과 자본수익률 가정에 결과가 얼마나 의존하는지 확인하게 합니다.',
    },
    {
      term: '역산 DCF', english: 'Reverse Discounted Cash Flow',
      definition: '관측 가격에 맞도록 하나의 핵심 사업 가정을 역으로 푸는 진단입니다.',
      easyExplanation: '현재 가격이 성립하려면 모형 안에서 어떤 성장 경로가 필요한지 거꾸로 계산합니다.',
      relevance: 'NVIDIA의 관측 가격과 기준 조건 사이의 매출 성장 가정 차이를 비교합니다.',
    },
  ],
  officialSources: [
    {
      id: 'nvidia-fy2027-q1-results', title: 'NVIDIA Announces Financial Results for First Quarter Fiscal 2027',
      publisher: 'NVIDIA', url: 'https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-first-quarter-fiscal-2027', publishedAt: '2026-05-20',
    },
    {
      id: 'fred-series-dgs10', title: 'DGS10 · 미국 국채 10년물 시장수익률',
      publisher: 'FRED', url: 'https://fred.stlouisfed.org/series/DGS10', publishedAt: '2026-07-14',
    },
    {
      id: 'iea-energy-and-ai-2025', title: 'Energy and AI', publisher: 'IEA',
      url: 'https://www.iea.org/reports/energy-and-ai', publishedAt: '2025-04-10',
    },
    {
      id: 'nvidia-vera-rubin-production', title: 'NVIDIA Vera Rubin Ramps Into Full Production to Power Agentic AI Factories Worldwide',
      publisher: 'NVIDIA', url: 'https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Vera-Rubin-Ramps-Into-Full-Production-to-Power-Agentic-AI-Factories-Worldwide/default.aspx',
      publishedAt: '2026-05-31', documentType: 'Company press release',
    },
    {
      id: 'nvidia-japan-national-ai-infrastructure', title: 'Japan Government, Industrial Leaders and NVIDIA Launch the World’s First National AI Infrastructure',
      publisher: 'NVIDIA', url: 'https://investor.nvidia.com/news/press-release-details/2026/Japan-Government-Industrial-Leaders-and-NVIDIA-Launch-the-Worlds-First-National-AI-Infrastructure/default.aspx',
      publishedAt: '2026-07-16', documentType: 'Company press release',
    },
  ],
  factEvidence: [
    {
      id: 'nvidia-q1-results-fact', type: 'fact',
      statement: 'FY2027 1분기 매출 816억 달러, 데이터센터 매출 752억 달러, 데이터센터 전년 동기 대비 성장률 92%.',
      sourceIds: ['nvidia-fy2027-q1-results'], metricIds: ['quarterlyRevenue', 'dataCenterRevenue', 'dataCenterYoY'], asOf: '2026-04-26',
    },
    {
      id: 'nvidia-q1-platform-fact', type: 'fact',
      statement: 'NVIDIA는 FY2027 1분기 실적에서 가속 컴퓨팅과 네트워킹을 포함한 데이터센터 실적을 공식 발표했습니다.',
      sourceIds: ['nvidia-fy2027-q1-results'], metricIds: ['dataCenterRevenue'], asOf: '2026-04-26',
    },
    {
      id: 'nvidia-rate-fact', type: 'fact', statement: '모형의 무위험수익률 기준일은 2026년 7월 14일입니다.',
      sourceIds: ['fred-series-dgs10'], metricIds: ['riskFreeRate'], asOf: '2026-07-14',
    },
    {
      id: 'nvidia-macro-fact', type: 'fact', statement: 'IEA는 AI와 데이터센터 전력 수요의 연결을 별도 보고서에서 다룹니다.',
      sourceIds: ['iea-energy-and-ai-2025'], metricIds: ['dataCenterElectricityDemand'], asOf: '2025-04-10',
    },
    {
      id: 'nvidia-rubin-production-fact', type: 'fact', statement: 'NVIDIA는 Vera Rubin 플랫폼의 생산 확대와 가을 생산 출하 계획을 발표했습니다.',
      sourceIds: ['nvidia-vera-rubin-production'], metricIds: ['newPlatformShipments', 'partnerProduction'], asOf: '2026-05-31',
    },
    {
      id: 'nvidia-japan-ai-factory-fact', type: 'fact', statement: 'NVIDIA와 Noetra는 2만7,500개 Rubin GPU와 140MW 규모의 일본 물리 AI 인프라 계획을 발표했습니다.',
      sourceIds: ['nvidia-japan-national-ai-infrastructure'], metricIds: ['systemDemand', 'sovereignAiPipeline'], asOf: '2026-07-16',
    },
  ],
};

const artifacts = {
  assumptions: assumptionsJson,
  valuation: valuationJson,
  reverse: reverseJson,
  sources: sourcesJson,
} as unknown as ResearchReportArtifactSet;

export default buildResearchReport(config, artifacts);

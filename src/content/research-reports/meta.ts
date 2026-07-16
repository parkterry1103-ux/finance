import assumptionsJson from '../../../artifacts/phase-4a-valuation/meta/assumptions.json' with { type: 'json' };
import reverseJson from '../../../artifacts/phase-4a-valuation/meta/reverse-dcf.json' with { type: 'json' };
import sourcesJson from '../../../artifacts/phase-4a-valuation/meta/sources.json' with { type: 'json' };
import valuationJson from '../../../artifacts/phase-4a-valuation/meta/valuation-result.json' with { type: 'json' };
import { buildResearchReport } from './build-report.js';
import type { ResearchReportArtifactSet, ResearchReportCompanyConfig } from './types.js';

const config: ResearchReportCompanyConfig = {
  slug: 'meta',
  companyName: '메타 플랫폼스',
  englishName: 'Meta Platforms, Inc.',
  ticker: 'META',
  industry: '디지털 광고·플랫폼·AI 인프라',
  reportTitle: '광고 현금창출력과 AI 인프라 재투자의 균형',
  snapshotVersion: '2026.07.17-final',
  newsCutoffAt: '2026-07-16T23:59:59Z',
  conclusion: '광고 플랫폼의 현금창출력이 대규모 AI 인프라 투자를 뒷받침하는 구조이며, 투자 증가가 사용자 경험과 광고 효율로 전환되는 속도가 핵심입니다.',
  watchStatement: '다음 분기에는 광고 수요, 추천 시스템 효율, 2026년 설비투자 집행 속도와 영업현금흐름의 균형을 우선 확인합니다.',
  judgments: [
    {
      label: '현재 사업 판단', status: '일부 가정 수정',
      reason: '광고 노출과 단가가 함께 증가했지만 2026년 설비투자 전망 상향과 외부 AI 컴퓨팅 판매 검토 보도가 현금흐름의 사용처를 새롭게 점검하게 합니다.',
      changeCondition: '광고 성장 둔화와 인프라 비용 증가가 동시에 나타나거나 외부 컴퓨팅 판매가 공식 사업으로 확인되면 성장·재투자 가정을 다시 조정합니다.',
      evidenceIds: ['meta-q1-guidance-fact', 'meta-cloud-option-fact'],
    },
    {
      label: '해자', status: '유지',
      reason: '대규모 사용자 네트워크, 광고 수요·공급 연결, 추천·측정 기술이 함께 작동해 광고주의 성과 개선과 플랫폼 참여를 연결합니다.',
      changeCondition: '사용자 참여와 광고 단가가 구조적으로 약해지거나 규제로 측정·개인화 능력이 크게 제한되면 해자 판단을 낮춥니다.',
      evidenceIds: ['meta-q1-guidance-fact', 'meta-business-interpretation'],
    },
    {
      label: '재무건전성', status: '안정',
      reason: '광고 사업의 영업현금흐름과 현금성 자산이 큰 설비투자를 뒷받침하지만, 신규 채권과 투자 확대가 총부채·감가상각 부담을 높이고 있습니다.',
      changeCondition: '설비투자와 이자 부담 증가가 영업현금흐름 증가를 지속적으로 앞서면 부담 확대 판단으로 바꿉니다.',
      evidenceIds: ['meta-historical-calculation', 'meta-2026-debt-fact'],
    },
    {
      label: '산업 사이클 역할', status: '플랫폼 인프라 핵심',
      reason: '광고 수요와 사용자 시간을 연결하는 플랫폼이면서 AI 추천·모델·컴퓨팅에 대규모로 투자하는 인프라 수요자입니다.',
      changeCondition: '사용자 시간이 경쟁 플랫폼으로 이동하고 AI 투자가 광고 효율이나 새로운 매출로 전환되지 않으면 역할의 경제성이 약해집니다.',
      evidenceIds: ['meta-q1-guidance-fact', 'meta-cloud-option-fact'],
    },
  ],
  materialNewsEvents: [
    {
      id: 'meta-q1-capex-context', companySlug: 'meta', title: '광고 성장과 2026년 설비투자 상향이 동시에 확인됨',
      publishedAt: '2026-04-29', sourceId: 'meta-q1-2026-results', sourceType: 'company', category: 'companySpecific', materiality: 'high', confidence: 'confirmed',
      affectedAssumptionIds: ['revenueGrowth', 'operatingMargin', 'capexRatio'], affectedMetricIds: ['adImpressions', 'pricePerAd', 'capexGuidance', 'operatingCashFlow'],
      summary: '1분기 광고 노출은 19%, 광고당 평균 가격은 12% 증가했고 회사는 2026년 설비투자 전망을 1,250억~1,450억 달러로 높였습니다.',
      whyItMatters: '광고 성장과 AI 인프라 비용이 같은 시기에 커져, 매출 증가가 FCFF로 얼마나 남는지를 직접 시험합니다.',
      transmissionPath: ['광고 참여·단가', '매출 성장', 'AI 설비투자·감가상각', '영업이익·FCFF', '장기 ROIC'],
      durability: 'structural', thesisImpact: 'partiallyRevise',
      watchItems: ['광고 노출과 단가', '분기별 Capex', '영업현금흐름과 감가상각'],
    },
    {
      id: 'meta-cloud-option-context', companySlug: 'meta', title: 'AI 컴퓨팅과 모델 접근권의 외부 판매 가능성 보도',
      publishedAt: '2026-07-01', sourceId: 'wsj-meta-cloud-ai-compute-20260701', sourceType: 'industry', category: 'companySpecific', materiality: 'medium', confidence: 'developing',
      affectedAssumptionIds: ['revenueGrowth', 'capexRatio', 'operatingMargin'], affectedMetricIds: ['nonAdvertisingRevenue', 'dataCenterUtilization', 'capexPayback'],
      summary: '기존 프로젝트의 검증된 뉴스 데이터는 Meta가 AI 컴퓨팅 자원과 모델 접근권의 외부 판매를 검토한다는 보도를 담고 있습니다. 공식 출시·가격·고객은 확인되지 않았습니다.',
      whyItMatters: 'AI 투자가 광고 비용 기반에 머무는지 별도 매출원으로 확장되는지에 따라 Capex 회수 경로와 경쟁 구도가 달라질 수 있습니다.',
      transmissionPath: ['외부 컴퓨팅 판매', '데이터센터 가동률·신규 매출', '마진', 'Capex 회수', '장기 ROIC'],
      durability: 'uncertain', thesisImpact: 'partiallyRevise',
      watchItems: ['공식 서비스 발표', '가격과 고객 계약', '반복 매출과 증분 마진'],
    },
    {
      id: 'meta-2026-notes-context', companySlug: 'meta', title: '250억 달러 선순위 채권 발행 완료',
      publishedAt: '2026-05-04', sourceId: 'meta-2026-senior-notes-8k', sourceType: 'filing', category: 'companySpecific', materiality: 'high', confidence: 'confirmed',
      affectedAssumptionIds: ['capitalStructure', 'costOfDebt'], affectedMetricIds: ['grossDebt', 'interestExpense', 'cash'],
      summary: 'Meta는 2031년부터 2066년까지 만기가 분산된 선순위 채권 여섯 종류를 합계 250억 달러 규모로 발행 완료했습니다.',
      whyItMatters: 'AI 인프라 투자를 감당할 유동성을 늘리는 동시에 총부채와 장기 이자비용을 높이므로 재무 완충과 WACC를 함께 점검해야 합니다.',
      transmissionPath: ['채권 발행', '현금·총부채 증가', '이자비용', 'FCFF·자본구조', '주주가치'],
      durability: 'structural', thesisImpact: 'partiallyRevise',
      watchItems: ['조달자금 사용처', '분기 이자비용', '순현금·총부채 변화'],
    },
  ],
  marketContext: {
    marketWide: '금리와 금융여건 변화는 광고주 예산과 WACC를 서로 다른 경로로 움직이는 시장 전체 요인입니다.',
    companySpecific: '광고 노출·단가, Capex 상향, 외부 컴퓨팅 판매 검토와 채권 발행은 Meta의 매출·비용·자본구조를 직접 바꾸는 기업 고유 요인입니다.',
    attributionCaution: '시장보다 주가 움직임이 컸더라도 특정 보도의 직접 효과로 확정하지 않으며, 공식 출시·고객·매출이 확인되기 전에는 가정 범위만 점검합니다.',
    evidenceIds: ['meta-financial-conditions-fact', 'meta-q1-guidance-fact'],
  },
  moat: [
    {
      source: '사용자 네트워크와 광고 수요·공급 연결',
      evidence: '3월 평균 일간활성이용자는 35억6천만 명이었고 광고 노출과 광고당 가격이 함께 증가했습니다.',
      earningsPath: '사용자 참여 → 광고 재고와 데이터 → 광고 성과 → 광고주 수요·단가 → 영업현금흐름',
      weakeningCondition: '사용자 시간이 다른 플랫폼으로 이동하거나 광고 단가가 참여 증가와 분리될 때',
      nextMetric: 'DAP, 광고 노출, 광고당 평균 가격, 지역별 광고 성장',
      evidenceIds: ['meta-q1-guidance-fact'],
    },
    {
      source: '추천·광고 측정 기술과 데이터 규모',
      evidence: '회사는 AI 인프라를 추천 품질과 광고 효율을 높이는 핵심 투자로 설명하고 있습니다.',
      earningsPath: '추천 정확도 → 참여 시간·전환율 → 광고주 ROI → 광고 수요와 마진',
      weakeningCondition: '규제로 개인화·측정이 제한되거나 투자 증가가 광고 효율 개선으로 이어지지 않을 때',
      nextMetric: '광고 전환 성과, 추천 참여, 인프라 비용 대비 매출 증가',
      evidenceIds: ['meta-q1-guidance-fact', 'meta-business-interpretation'],
    },
    {
      source: '플랫폼 규모와 내부 현금조달 능력',
      evidence: '광고 사업의 큰 영업현금흐름이 데이터센터와 모델 투자를 자체적으로 지원합니다.',
      earningsPath: '현금창출 → AI 연구·인프라 재투자 → 제품 개선·신규 옵션 → 사용자와 광고주 유지',
      weakeningCondition: 'Capex·감가상각·이자비용이 광고 현금흐름보다 빠르게 증가할 때',
      nextMetric: '영업현금흐름, Capex, 감가상각, 신규 비광고 매출',
      evidenceIds: ['meta-historical-calculation', 'meta-2026-debt-fact'],
    },
  ],
  financialHealth: {
    status: '안정',
    explanation: '광고 사업의 현금창출력과 현금성 자산이 대규모 AI 투자를 지탱합니다. 다만 현금 잔고만으로 충분하다고 보지 않고, 2026년 Capex 상향과 신규 채권 이후 FCFF·이자비용을 함께 봅니다.',
    downturnResponse: '광고 경기가 둔화해도 단기 유동성과 내부 현금으로 핵심 투자를 유지할 여지는 있지만, 투자 속도를 고정하면 FCFF 압박이 빠르게 커질 수 있습니다.',
    changeCondition: '광고 매출 성장 둔화, Capex·감가상각 증가와 이자비용 확대가 동시에 두 분기 이상 이어지면 부담 확대 판단으로 바꿉니다.',
  },
  cycleRole: {
    role: '소비·광고 경기 민감 플랫폼이자 AI 인프라의 대형 수요자',
    currentPosition: '사용자 관심과 광고주 예산을 연결하고, 추천·모델·데이터센터에 대규모로 재투자합니다.',
    growthConnection: '사용자 참여와 광고 성과가 매출을 만들고 그 현금이 AI 인프라와 신규 제품에 다시 투입됩니다.',
    upcycleEffect: '광고 예산과 단가가 오르면 큰 플랫폼 규모가 영업 레버리지와 투자 여력을 높일 수 있습니다.',
    downcycleEffect: '광고주 예산은 경기 둔화에 민감하지만 데이터센터 감가상각과 장기 계약 비용은 빠르게 줄이기 어렵습니다.',
    substitutionRisk: '짧은 영상·검색·메시징 경쟁과 규제 변화가 사용자 시간과 광고 측정력을 분산시킬 수 있습니다.',
    durableAdvantage: '대규모 사용자·광고주 네트워크와 광고 현금으로 추천 기술을 반복 개선하는 순환 구조입니다.',
    changeCondition: '사용자 참여와 광고 단가가 동시에 약해지고 AI 투자 효율도 확인되지 않을 때입니다.',
    evidenceIds: ['meta-q1-guidance-fact', 'meta-cloud-option-fact', 'meta-historical-calculation'],
  },
  valuationMethod: {
    name: 'Driver-based FCFF DCF',
    whyThisModel: 'Meta는 광고 사업에서 많은 현금을 창출하지만 AI 인프라 Capex와 감가상각도 가치에 큰 영향을 줍니다. 광고 매출 성장과 영업이익률뿐 아니라 재투자 이후 남는 사업 전체 현금을 반영하기 위해 FCFF DCF를 사용했습니다.',
    easyExplanation: '광고와 신규 사업이 벌어들일 현금에서 데이터센터 등 성장 투자를 뺀 뒤, 미래 현금을 오늘 가치로 바꾸어 합산하는 방식입니다.',
    unusedMethods: [
      { name: '배당할인모형', reason: '현재 배당만으로 광고 사업과 AI 재투자의 전체 가치를 설명하기 어렵습니다.' },
      { name: '잔여이익모형', reason: '장부가치와 규제자본이 중심인 금융회사보다 플랫폼 영업기업에 덜 적합합니다.' },
      { name: 'FCFE', reason: '대규모 채권 조달·상환을 매년 직접 예측하기보다 사업 전체 현금흐름을 먼저 보는 FCFF를 택했습니다.' },
    ],
  },
  newsValuationImpacts: [
    {
      eventId: 'meta-q1-capex-context', affectedAssumption: 'Capex/매출·정상 영업이익률', previousAssumption: '4A 기준 장기 Capex/매출 22.6%, 정상 영업이익률 41.4%',
      reviewRange: '연간 1,250억~1,450억 달러 지출이 광고 성장과 영업현금흐름으로 흡수되는 범위',
      valuePath: ['AI 설비투자', '감가상각·현금유출', 'FCFF', '장기 ROIC', 'Terminal Value'], modelChange: '4A 기준 시나리오 수치는 유지하고 투자 부담을 보수 조건의 핵심 변수로 올렸습니다.',
    },
    {
      eventId: 'meta-cloud-option-context', affectedAssumption: '신규 매출 성장·데이터센터 가동률', previousAssumption: '공식 광고 중심 매출 경로',
      reviewRange: '공식 출시, 가격, 고객과 증분 마진이 확인되는 범위',
      valuePath: ['외부 컴퓨팅 판매', '신규 매출', '가동률·마진', 'Capex 회수', '장기 성장'], modelChange: '보도 단계이므로 수치 가정에는 반영하지 않고 추가 확인 항목으로만 분류했습니다.',
    },
    {
      eventId: 'meta-2026-notes-context', affectedAssumption: '자본구조·부채비용', previousAssumption: '4A 자본구조 기준일 2026-03-31',
      reviewRange: '250억 달러 조달자금 사용과 다음 공식 재무상태표의 순현금 변화',
      valuePath: ['현금·총부채', '이자비용', '순현금', 'WACC·주주가치'], modelChange: '발행 시점의 현금 유입과 부채 증가가 함께 발생하므로 임의의 순부채 변화를 넣지 않았고, 다음 공시에서 전체 모델을 재실행합니다.',
    },
  ],
  excludedNewsSummary: '주가 상승만 설명한 기사, 클라우드 검토 보도의 반복 기사, 공식 출시·고객·가격이 없는 루머와 단순 인사 기사는 제외했습니다.',
  executiveSummary: {
    strengths: [
      { title: '광고 현금창출력', body: '광고 플랫폼의 현금흐름이 AI 인프라 재투자의 기반입니다.', evidenceIds: ['meta-historical-calculation', 'meta-business-interpretation'] },
      { title: '추천·광고 결합', body: 'AI 투자는 사용자 경험과 광고 효율을 함께 바꾸는 경로를 가집니다.', evidenceIds: ['meta-q1-guidance-fact', 'meta-business-interpretation'] },
    ],
    risks: [
      { title: '설비투자 부담', body: '투자 증가가 감가상각과 FCFF 전환율에 부담이 될 수 있습니다.', evidenceIds: ['meta-q1-guidance-fact', 'meta-historical-calculation'] },
      { title: '장기 가치 의존', body: '높은 장기 자본수익률과 계속가치 가정에 결과가 민감합니다.', evidenceIds: ['meta-dcf-calculation', 'meta-roic-fade-calculation'] },
    ],
    nextChecks: [
      { title: '광고 효율', body: '광고 수요와 추천 시스템 효율의 동행을 확인합니다.', evidenceIds: ['meta-q1-guidance-fact'] },
      { title: '투자와 현금', body: '설비투자 집행·감가상각·영업현금흐름의 균형을 확인합니다.', evidenceIds: ['meta-q1-guidance-fact', 'meta-historical-calculation'] },
    ],
  },
  business: [
    {
      title: '광고 현금흐름이 AI 인프라를 지원',
      body: '패밀리 오브 앱스의 광고 수익이 핵심 재원이고, 추천·광고 모델을 위한 컴퓨팅 투자가 비용 구조와 제품 경쟁력을 동시에 바꿉니다.',
      evidenceIds: ['meta-q1-guidance-fact', 'meta-business-interpretation'],
    },
    {
      title: '경쟁은 사용자 시간과 광고 성과에서 발생',
      body: '짧은 영상, 메시징, 검색형 발견 경험에서 사용자 참여를 지키고 광고 전환 효율을 높이는지가 플랫폼 경쟁의 중심입니다.',
      evidenceIds: ['meta-q1-guidance-fact', 'meta-business-interpretation'],
    },
  ],
  earnings: [
    {
      title: '2026년 설비투자 범위가 핵심 실적 변수',
      body: '회사는 2026년 설비투자 전망을 1,250억~1,450억 달러로 제시했습니다. 매출 성장뿐 아니라 감가상각과 현금흐름 경로를 함께 봐야 합니다.',
      evidenceIds: ['meta-q1-guidance-fact'],
    },
    {
      title: '높은 영업이익률과 투자 확대의 균형',
      body: '과거 영업이익 회복은 현금창출 기반을 보여주지만, 모델 결과는 장기 마진과 설비투자 비율에 민감합니다.',
      evidenceIds: ['meta-historical-calculation', 'meta-model-interpretation'],
    },
  ],
  financial: [
    {
      title: '영업현금흐름 대비 설비투자 비중이 확대',
      body: 'AI 인프라 구축으로 설비투자 요구가 커져 영업현금흐름이 FCFF로 전환되는 비율이 중요한 확인 항목입니다.',
      evidenceIds: ['meta-historical-calculation', 'meta-q1-guidance-fact'],
    },
    {
      title: '채권 발행과 자본구조 기준일을 분리',
      body: '2026년 5월 250억 달러 선순위 채권 발행은 3월 31일 자본구조 이후 사건입니다. 발행대금의 실제 사용을 알기 전에는 총부채만 임의로 더하지 않고 다음 재무상태표에서 다시 실행합니다.',
      evidenceIds: ['meta-2026-debt-fact', 'meta-dcf-calculation'],
    },
  ],
  industryClaims: [
    {
      title: '광고 경기와 금융 여건이 수요에 연결',
      body: '광고주의 지출 여력과 자금조달 여건은 광고 수요와 장기 할인율의 서로 다른 경로로 영향을 줄 수 있습니다.',
      evidenceIds: ['meta-financial-conditions-fact', 'meta-scenario-calculation'],
    },
    {
      title: 'AI 컴퓨팅 조달은 제품과 비용에 동시 영향',
      body: '컴퓨팅 공급과 전력 확보는 추천 품질 개선의 기반이면서 감가상각·설비투자 부담을 키우는 요인입니다.',
      evidenceIds: ['meta-q1-guidance-fact', 'meta-business-interpretation'],
    },
  ],
  outlook: [
    {
      title: '확인 계기',
      body: '추천 품질 개선, 광고 효율 상승, 메시징 수익화가 인프라 투자 증가를 흡수하는지 확인합니다.',
      evidenceIds: ['meta-q1-guidance-fact', 'meta-business-interpretation'],
    },
    {
      title: '주요 위험',
      body: '설비투자 집행 지연 또는 과잉, 감가상각 증가, 광고 경기 둔화, 규제 비용, 신규 제품의 낮은 수익화가 핵심 점검 항목입니다.',
      evidenceIds: ['meta-q1-guidance-fact', 'meta-financial-conditions-fact', 'meta-model-interpretation'],
    },
  ],
  glossary: [
    {
      term: 'FCFF', english: 'Free Cash Flow to Firm',
      definition: '채권자와 주주에게 귀속되기 전 사업 전체가 창출한 잉여현금흐름입니다.',
      easyExplanation: '영업으로 번 현금에서 사업 유지와 성장에 필요한 투자를 뺀 금액입니다.',
      relevance: 'Meta의 광고 현금흐름이 대규모 AI 설비투자 뒤에도 얼마나 남는지 보여줍니다.',
    },
    {
      term: 'WACC', english: 'Weighted Average Cost of Capital',
      definition: '자기자본비용과 세후부채비용을 자본구조 비중으로 가중한 할인율입니다.',
      easyExplanation: '미래 현금을 오늘의 가치로 바꿀 때 적용하는 사업 전체의 요구수익률입니다.',
      relevance: '광고와 AI 투자가 만드는 장기 현금흐름의 현재가치를 결정하는 기준입니다.',
    },
    {
      term: 'ROIC', english: 'Return on Invested Capital',
      definition: '영업에 투입된 자본이 세후 영업이익을 만들어 내는 효율을 나타냅니다.',
      easyExplanation: '사업에 넣은 돈 1원이 얼마나 효율적으로 이익을 만드는지 보는 지표입니다.',
      relevance: 'AI 인프라 투자 확대 뒤에도 Meta가 장기 초과수익을 유지할 수 있는지 점검합니다.',
    },
    {
      term: '재투자율', english: 'Reinvestment Rate',
      definition: '세후 영업이익 가운데 미래 성장을 위해 다시 사업에 투입되는 비율입니다.',
      easyExplanation: '번 돈 중 얼마를 서버·데이터센터와 운전자본에 다시 넣는지 나타냅니다.',
      relevance: '큰 설비투자가 성장으로 연결되는 데 필요한 현금 부담을 설명합니다.',
    },
    {
      term: 'Terminal Value', english: 'Terminal Value',
      definition: '명시적 전망기간 이후의 현금흐름을 하나의 현재가치로 환산한 계속가치입니다.',
      easyExplanation: '상세 예측이 끝난 뒤에도 사업이 이어진다고 보고 계산한 장기 가치입니다.',
      relevance: 'Meta 모형에서 장기 성장률과 자본수익률 가정의 영향이 큰 이유를 보여줍니다.',
    },
    {
      term: '역산 DCF', english: 'Reverse Discounted Cash Flow',
      definition: '관측 가격에 맞도록 하나의 핵심 사업 가정을 역으로 푸는 진단입니다.',
      easyExplanation: '현재 가격이 성립하려면 모형 안에서 어떤 성장 경로가 필요한지 거꾸로 계산합니다.',
      relevance: '광고와 신규 수익원의 매출 성장 기대를 기준 조건과 비교합니다.',
    },
  ],
  officialSources: [
    {
      id: 'meta-q1-2026-results', title: 'Meta Reports First Quarter 2026 Results', publisher: 'Meta Platforms',
      url: 'https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-First-Quarter-2026-Results/default.aspx', publishedAt: '2026-04-29',
    },
    {
      id: 'meta-2025-senior-notes-8k', title: 'Meta Platforms 8-K: Senior Notes Offering Completed', publisher: 'SEC',
      url: 'https://www.sec.gov/Archives/edgar/data/1326801/000119312525262593/d75422d8k.htm', publishedAt: '2025-11-03',
    },
    {
      id: 'fred-series-nfci', title: 'NFCI · Chicago Fed National Financial Conditions Index', publisher: 'FRED',
      url: 'https://fred.stlouisfed.org/series/NFCI', publishedAt: '2026-07-03',
    },
    {
      id: 'wsj-meta-cloud-ai-compute-20260701', title: 'Meta AI 컴퓨팅·모델 접근권 외부 판매 검토 보도', publisher: 'The Wall Street Journal',
      url: 'https://www.wsj.com/livecoverage/stock-market-today-dow-sp-500-nasdaq-07-01-2026/card/lusNzm2pjxU216rg4mIA', publishedAt: '2026-07-01', documentType: 'News report',
      note: '기존 프로젝트의 검증된 제한 접근 뉴스 snapshot. 공식 출시가 아닌 보도 단계입니다.',
    },
    {
      id: 'meta-2026-senior-notes-8k', title: 'Meta Platforms 8-K: 2026 Senior Notes Offering Completed', publisher: 'SEC EDGAR',
      url: 'https://www.sec.gov/Archives/edgar/data/1326801/000119312526204128/d134616d8k.htm', publishedAt: '2026-05-04', documentType: 'Form 8-K',
      accessionNumber: '0001193125-26-204128', periodEnd: '2026-04-30',
    },
  ],
  factEvidence: [
    {
      id: 'meta-q1-guidance-fact', type: 'fact', statement: 'Meta는 2026년 설비투자 전망을 1,250억~1,450억 달러로 제시했습니다.',
      sourceIds: ['meta-q1-2026-results'], metricIds: ['capexGuidanceLow', 'capexGuidanceHigh'], asOf: '2026-04-29',
    },
    {
      id: 'meta-debt-fact', type: 'fact', statement: 'Meta는 2025년 11월 선순위 채권 발행 완료를 8-K로 공시했으며 등록 원금 합계는 300억 달러입니다.',
      sourceIds: ['meta-2025-senior-notes-8k'], metricIds: ['seniorNotesPrincipal'], asOf: '2025-11-03',
    },
    {
      id: 'meta-financial-conditions-fact', type: 'fact', statement: 'Chicago Fed NFCI는 주간 금융 여건을 추적하는 공개 지표입니다.',
      sourceIds: ['fred-series-nfci'], metricIds: ['financialConditions'], asOf: '2026-07-03',
    },
    {
      id: 'meta-cloud-option-fact', type: 'fact', statement: '기존 검증 뉴스 snapshot은 Meta가 AI 컴퓨팅 자원과 모델 접근권의 외부 판매를 검토한다는 보도를 담고 있으며 공식 출시는 확인되지 않았습니다.',
      sourceIds: ['wsj-meta-cloud-ai-compute-20260701'], metricIds: ['nonAdvertisingRevenue', 'dataCenterUtilization'], asOf: '2026-07-01',
    },
    {
      id: 'meta-2026-debt-fact', type: 'fact', statement: 'Meta는 2026년 5월 만기가 분산된 선순위 채권 여섯 종류를 합계 250억 달러 규모로 발행 완료했습니다.',
      sourceIds: ['meta-2026-senior-notes-8k'], metricIds: ['grossDebt', 'cash', 'interestExpense'], asOf: '2026-05-04',
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

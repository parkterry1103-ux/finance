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
  conclusion: '광고 플랫폼의 현금창출력이 대규모 AI 인프라 투자를 뒷받침하는 구조이며, 투자 증가가 사용자 경험과 광고 효율로 전환되는 속도가 핵심입니다.',
  watchStatement: '다음 분기에는 광고 수요, 추천 시스템 효율, 2026년 설비투자 집행 속도와 영업현금흐름의 균형을 우선 확인합니다.',
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
      body: '300억 달러 규모의 선순위 채권 발행 사실과 2026년 3월 31일 자본구조 스냅샷을 모델에 반영하고 가격 기준일과 구분했습니다.',
      evidenceIds: ['meta-debt-fact', 'meta-dcf-calculation'],
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
  ],
};

const artifacts = {
  assumptions: assumptionsJson,
  valuation: valuationJson,
  reverse: reverseJson,
  sources: sourcesJson,
} as unknown as ResearchReportArtifactSet;

export default buildResearchReport(config, artifacts);

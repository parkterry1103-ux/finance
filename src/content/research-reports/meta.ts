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
  conclusion: '광고 플랫폼의 현금창출력이 대규모 AI 인프라 투자를 뒷받침하는 구조이며, 투자 증가가 사용자 경험과 광고 효율로 전환되는 속도가 핵심입니다.',
  watchStatement: '다음 분기에는 광고 수요, 추천 시스템 효율, 2026년 설비투자 집행 속도와 영업현금흐름의 균형을 우선 확인합니다.',
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

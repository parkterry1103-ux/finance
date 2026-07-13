import {
  createMarketMapDetailViewModel,
  normalizeMarketMapStatusLabel,
  marketMapDefinitionById,
  marketMapIndustryNodeOrder,
  resolveMarketMapCompanyQuery,
  resolveMarketMapDetailViewMode,
  selectMarketMapActions,
  type MarketMapDetailCompany,
} from '../src/content/market-map-details/index.js';
import { reconstructionInfrastructureMap, semiconductorClusterInfrastructureMap } from '../src/data.js';

let checks = 0;
const check = (condition: unknown, message: string) => {
  if (!condition) throw new Error(`market map detail unit failed: ${message}`);
  checks += 1;
};

const baseCompany: MarketMapDetailCompany = {
  id: 'company-a',
  name: '회사 A',
  ticker: 'AAA',
  countryLabel: '한국',
  mark: 'A',
  role: '대장주',
  statusLabel: 'Pick only',
  connectionLevel: 'pick',
  description: '무엇을 하는지 설명합니다.',
  reason: '왜 함께 보는지 설명합니다.',
  actions: [
    { id: 'flow', kind: 'flow', label: '시장 흐름에서 보기' },
    { id: 'pick', kind: 'pick', label: '관련 Pick 보기' },
    { id: 'financials', kind: 'financials', label: '숫자 3개 보기' },
    { id: 'analysis', kind: 'analysis', label: '기업 해설 보기' },
  ],
  hasPrice: false,
};

const viewModel = createMarketMapDetailViewModel({
  id: 'fixture-map',
  region: 'global',
  category: 'semiconductor-ai',
  eyebrow: '시장지도',
  title: '공통 지도',
  summary: '공통 설명',
  heroNote: '공식 발표를 확인합니다.',
  selectedCompany: baseCompany,
  relatedCompanies: [{ ...baseCompany, id: 'company-b', name: '회사 B' }],
  flowTitle: '단계형 흐름',
  flowSteps: Array.from({ length: 5 }, (_, index) => ({
    id: `step-${index + 1}`,
    kind: marketMapIndustryNodeOrder[index]!,
    question: `${index + 1}번째 질문`,
    title: `${index + 1}단계`,
    description: '쉬운 설명',
    roleTag: '역할',
    items: ['핵심 항목'],
    representativeCompanies: ['회사 A', '회사 B', '회사 C'],
  })),
  advancedDescription: '전체 관계 설명',
  caution: '계약은 별도 확인합니다.',
});

check(viewModel.id === 'fixture-map', 'common view model creation');
check(viewModel.selectedCompany.statusLabel === '관련 Pick 있음', 'Pick only normalized');
check(viewModel.selectedCompany.role === '핵심 기업', 'leader wording normalized');
check(viewModel.selectedCompany.actions.map((action) => action.kind).join('|') === 'analysis|financials', 'selected CTA priority');
check(viewModel.selectedCompany.actions.length <= 2, 'selected CTA maximum');
check(viewModel.relatedCompanies[0]?.actions.length === 1, 'related CTA maximum');
check(viewModel.flowSteps.every((step) => step.representativeCompanies.length <= 2), 'flow representative maximum');
check(viewModel.flowSteps.length >= 4 && viewModel.flowSteps.length <= 6, 'flow step range');
check(normalizeMarketMapStatusLabel('시장 흐름 참고') === '시장 흐름 참고', 'reference label preserved');
check(normalizeMarketMapStatusLabel('해설 준비 중') === '기업 해설 준비 중', 'planned label normalized');
check(selectMarketMapActions(baseCompany.actions, 1)[0]?.kind === 'analysis', 'CTA single priority');

const reconstructionIds = reconstructionInfrastructureMap.companies.map((company) => company.id);
const reconstructionDefault = resolveMarketMapCompanyQuery(
  reconstructionIds,
  reconstructionInfrastructureMap.companyAliases,
  null,
  reconstructionInfrastructureMap.companyId,
);
check(reconstructionDefault.companyId === reconstructionInfrastructureMap.companyId && !reconstructionDefault.didFallback, 'default company');
check(resolveMarketMapCompanyQuery(reconstructionIds, reconstructionInfrastructureMap.companyAliases, 'reconstruction-caterpillar', reconstructionInfrastructureMap.companyId).companyId === 'reconstruction-caterpillar', 'valid query');
check(resolveMarketMapCompanyQuery(reconstructionIds, reconstructionInfrastructureMap.companyAliases, 'hyundai-engineering-construction', reconstructionInfrastructureMap.companyId).companyId === reconstructionInfrastructureMap.companyId, 'legacy alias');
check(resolveMarketMapCompanyQuery(reconstructionIds, reconstructionInfrastructureMap.companyAliases, 'invalid', reconstructionInfrastructureMap.companyId).didFallback, 'invalid query fallback');
check(marketMapDefinitionById.get(reconstructionInfrastructureMap.sectorId)?.industryStages?.length === 5, 'reconstruction five taxonomy stages');
check(marketMapDefinitionById.get(semiconductorClusterInfrastructureMap.sectorId)?.industryStages?.length === 5, 'cluster five taxonomy stages');
check(resolveMarketMapDetailViewMode(null, false) === 'industry', 'industry default view');
check(resolveMarketMapDetailViewMode(null, true) === 'companies', 'company query opens company view');
check(resolveMarketMapDetailViewMode('industry', true) === 'industry', 'explicit industry view preserves selected company query');
check(reconstructionInfrastructureMap.companies.every((company) => company.role && company.description && company.reason), 'reconstruction company copy');
check(semiconductorClusterInfrastructureMap.companies.every((company) => company.role && company.description && company.reason), 'cluster company copy');
check(viewModel.selectedCompany.hasPrice === false, 'missing price remains omitted');

console.log(`✓ market map detail unit ${checks}개 통과`);

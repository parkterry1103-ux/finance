import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildCompanyResearchProfile, companyProfiles } from '../src/content/company-profiles/index.js';
import {
  companyBriefQuestionKeys,
  companyBriefSlugs,
  expectedBriefDifferenceUnit,
  loadAllCompanyBriefConfigs,
  loadCompanyBrief,
  validateCompanyBriefConfig,
  validateCompanyBriefRegistry,
  type CompanyBriefConfig,
} from '../src/content/company-briefs/index.js';
import { sourceRegistry } from '../src/content/sources/registry.js';

let checks = 0;
function check(condition: unknown, label: string) {
  checks += 1;
  if (!condition) throw new Error(`company brief unit failed: ${label}`);
}

const validation = await validateCompanyBriefRegistry();
check(validation.errors.length === 0, `registry validation: ${validation.errors.join(' | ')}`);
check(validation.configs.length === 9 && companyBriefSlugs.length === 9 && companyProfiles.length === 9, 'nine supported company briefs');
check(new Set(validation.configs.map((config) => config.companySlug)).size === 9, 'company slug deduplicated');

const briefs = await Promise.all(validation.configs.map(async (config) => {
  const profile = buildCompanyResearchProfile(config.companySlug);
  check(profile, `${config.companySlug} existing profile preserved`);
  return loadCompanyBrief(config.companySlug, profile!);
}));
check(briefs.every(Boolean), 'all briefs build through lazy loader');
check(briefs.every((brief) => brief && companyBriefQuestionKeys.every((key) => brief.questions[key].summary.trim() && brief.questions[key].sourceIds.length)), 'five sourced questions per brief');
check(briefs.reduce((total, brief) => total + (brief ? Object.keys(brief.questions).length : 0), 0) === 45, 'forty-five question answers');
check(briefs.every((brief) => brief && brief.keyMetrics.length > 0 && brief.keyMetrics.length <= 3), 'one to three key metrics');
check(briefs.reduce((total, brief) => total + (brief?.keyMetrics.length ?? 0), 0) === 23, 'twenty-three key metrics');
check(briefs.every((brief) => brief?.keyMetrics.every((metric) => Number.isFinite(metric.value) && metric.unit && metric.period && sourceRegistry[metric.sourceId])), 'metric finite number, unit, period and source');
check(briefs.reduce((total, brief) => total + (brief?.keyMetrics.filter((metric) => metric.comparison).length ?? 0), 0) === 8, 'eight evidence-backed comparisons');
check(briefs.filter((brief) => brief?.reportSlug).length === 2, 'only NVIDIA and Meta report CTAs');
check(briefs.find((brief) => brief?.companySlug === 'netflix')?.relatedEditorialIds.join('|') === 'stock-2026-07-18-netflix-guidance-disclosure-reset', 'Netflix related editorial connected');
check(briefs.find((brief) => brief?.companySlug === 'supermicro')?.relatedEditorialIds.join('|') === 'stock-2026-07-22-smci-orders-margin', 'SMCI related editorial connected');
check(briefs.filter((brief) => !['netflix', 'supermicro'].includes(brief?.companySlug ?? '')).every((brief) => brief?.relatedEditorialIds.length === 0), 'unrelated editorial sections remain omitted');
check(expectedBriefDifferenceUnit('영업이익률', '전년 동기 대비') === 'percentagePoint', 'margin comparison uses percentage points');
check(expectedBriefDifferenceUnit('매출 성장률', '전년 대비') === 'percent', 'growth comparison uses percent');

function clone(config: CompanyBriefConfig) {
  return structuredClone(config);
}

const base = validation.configs.find((config) => config.companySlug === 'nvidia')!;
const tooMany = clone(base);
tooMany.keyMetricSelections.push(clone(base).keyMetricSelections[0]);
check(validateCompanyBriefConfig(tooMany).some((error) => error.includes('1~3개')), 'more than three metrics rejected');

const missingSource = clone(base);
missingSource.questions.revenueEngine.sourceIds = ['missing-source'];
check(validateCompanyBriefConfig(missingSource).some((error) => error.includes('missing-source')), 'missing question source rejected');

const brokenEditorial = clone(base);
brokenEditorial.relatedEditorialIds = ['missing-editorial'];
check(validateCompanyBriefConfig(brokenEditorial).some((error) => error.includes('Published editorial')), 'broken related editorial rejected');

const wrongComparison = clone(base);
wrongComparison.keyMetricSelections[2].comparison!.differenceUnit = 'percentagePoint';
check(validateCompanyBriefConfig(wrongComparison).some((error) => error.includes('%/%p')), 'percent and percentage-point mismatch rejected');

const registrySource = readFileSync(join(process.cwd(), 'src', 'content', 'company-briefs', 'registry.ts'), 'utf8');
companyBriefSlugs.forEach((slug) => check(registrySource.includes(`import('./entries/${slug}.js')`), `${slug} lazy config import`));
const companiesRoute = readFileSync(join(process.cwd(), 'src', 'routes', 'CompaniesRoute.tsx'), 'utf8');
check(companiesRoute.includes('loadCompanyBrief') && companiesRoute.includes('CompanyBriefLoadingPage'), 'company brief loads only after company route');
const componentSource = readFileSync(join(process.cwd(), 'src', 'components', 'company-profiles', 'CompanyProfiles.tsx'), 'utf8');
check(componentSource.includes('brief.questions.recentChange.summary'), 'Company Brief feeds official recent-change fallback');
check(componentSource.includes('dissection.coreCards.map'), 'first screen renders four dissection core cards');
check(componentSource.includes("profile.searchStatus.reportStatus === 'supported' && brief.reportSlug") && componentSource.includes('장기 기업 판단'), 'report CTA condition');
check(componentSource.includes('recentEditorial.length ?') && componentSource.includes('최근 관련 해부'), 'related editorial section condition');
check(!componentSource.includes('최근 관련 해부가 없습니다'), 'no empty editorial message');

console.log(`✓ Company Brief unit ${checks}개 검증 · 기업 9 · 질문 45 · 지표 23 · 비교 8 · 리포트 CTA 2`);

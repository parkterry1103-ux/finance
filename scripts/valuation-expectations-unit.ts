import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadResearchReport } from '../src/content/research-reports/registry.js';
import {
  adjustedWaccGrowthSensitivity,
  buildValuationExpectationView,
  locatePriceInRange,
  validateValuationExpectationView,
  valuationReadinessCompanies,
  type ValuationPriceSnapshot,
} from '../src/content/valuation/index.js';

let checks = 0;
function check(condition: unknown, label: string) {
  checks += 1;
  if (!condition) throw new Error(`valuation expectations unit failed: ${label}`);
}

function expectError(action: () => unknown, pattern: RegExp, label: string) {
  try {
    action();
  } catch (error) {
    check(pattern.test(error instanceof Error ? error.message : String(error)), label);
    return;
  }
  check(false, label);
}

check(valuationReadinessCompanies.length === 9, 'nine supported companies');
check(new Set(valuationReadinessCompanies.map((company) => company.companySlug)).size === 9, 'company slugs unique');
check(valuationReadinessCompanies.filter((company) => company.publicValuationStatus === 'full').length === 2, 'two full public valuation companies');
check(valuationReadinessCompanies.filter((company) => company.publicValuationStatus === 'partial').length === 0, 'no partial company is overstated');
check(valuationReadinessCompanies.filter((company) => company.publicValuationStatus === 'unavailable').length === 7, 'seven companies use explicit unavailable state');

check(locatePriceInRange(70, 80, 120) === 'belowRange', 'below-range classification');
check(locatePriceInRange(100, 80, 120) === 'insideRange', 'inside-range classification');
check(locatePriceInRange(140, 80, 120) === 'aboveRange', 'above-range classification');
check(locatePriceInRange(Number.NaN, 100, 200) === 'unavailable', 'non-finite price rejected');

const publicVersions = new Set<string>();
const premiumIds = new Set<string>();
for (const slug of ['nvidia', 'meta'] as const) {
  const report = await loadResearchReport(slug);
  check(Boolean(report), `${slug} research report loads`);
  if (!report) continue;
  const price: ValuationPriceSnapshot = {
    value: report.currentPrice,
    currency: report.baseResult.currency,
    asOf: report.priceAsOf,
    session: 'regularClose',
    sourceId: `${slug}-market-price`,
    sourceLabel: 'unit fixture regular close',
    delayed: true,
  };
  const view = validateValuationExpectationView(buildValuationExpectationView(report, price), report);
  check(!publicVersions.has(view.model.version), `${slug} public model version unique`);
  publicVersions.add(view.model.version);
  check(view.scenarios.length === 3, `${slug} three scenarios`);
  check(view.scenarios[0].modelValue <= view.scenarios[1].modelValue && view.scenarios[1].modelValue <= view.scenarios[2].modelValue, `${slug} scenario order`);
  check(view.impliedExpectation === null || Number.isFinite(view.impliedExpectation.value), `${slug} implied expectation finite or safely unavailable`);
  check(view.impliedExpectation === null || view.impliedExpectation.value >= view.impliedExpectation.validRange.min, `${slug} implied expectation lower bound`);
  check(view.impliedExpectation === null || view.impliedExpectation.value <= view.impliedExpectation.validRange.max, `${slug} implied expectation upper bound`);
  check(view.premiumCandidates.length === 3, `${slug} three non-additive expectation candidates`);
  view.premiumCandidates.forEach((candidate) => {
    check(!premiumIds.has(candidate.id), `${candidate.id} expectation candidate ID unique`);
    premiumIds.add(candidate.id);
  });
  check(view.premiumCandidates.every((candidate) => candidate.evidenceIds.length > 0 && candidate.watchItems.length > 0), `${slug} expectation evidence and watch items`);
  check(view.sourceIds.length > 0 && view.sourceIds.every((id) => report.sources.some((source) => source.id === id)), `${slug} source provenance`);
  check(!JSON.stringify(view.premiumCandidates).includes('"amount"'), `${slug} expectation candidates have no amount allocation`);
  const base = view.scenarios.find((scenario) => scenario.id === 'base')!;
  check(adjustedWaccGrowthSensitivity(report, base.wacc, base.stableGrowthRate).estimatedValuePerShare !== null, `${slug} valid WACC-growth sensitivity`);
  check(adjustedWaccGrowthSensitivity(report, base.stableGrowthRate, base.stableGrowthRate).estimatedValuePerShare === null, `${slug} WACC less than or equal to growth is safely limited`);
  const unreachable = buildValuationExpectationView(report, { ...price, value: Number.MAX_SAFE_INTEGER });
  check(unreachable.impliedExpectation === null && Boolean(unreachable.impliedExpectationError), `${slug} no-solution reverse DCF is explicit`);
  const reversed = structuredClone(report);
  reversed.scenarios[0].result.estimatedValuePerShare = reversed.scenarios[1].result.estimatedValuePerShare + 10;
  expectError(() => buildValuationExpectationView(reversed, price), /scenario order/i, `${slug} reversed scenario order fails instead of sorting`);
}

const appSource = readFileSync(join(process.cwd(), 'src', 'App.tsx'), 'utf8');
const routeSource = readFileSync(join(process.cwd(), 'src', 'routes', 'ValuationExpectationsRoute.tsx'), 'utf8');
const profileSource = readFileSync(join(process.cwd(), 'src', 'components', 'company-profiles', 'CompanyProfiles.tsx'), 'utf8');
const financialSource = readFileSync(join(process.cwd(), 'src', 'routes', 'FinancialPivotRoute.tsx'), 'utf8');
const reportSource = readFileSync(join(process.cwd(), 'src', 'routes', 'ResearchReportRoute.tsx'), 'utf8');
check(appSource.includes("lazy(() => import('./routes/ValuationExpectationsRoute'))"), 'valuation expectations route lazy loaded');
check(appSource.includes('routeValuationExpectationsMatch'), 'valuation route matched before company profile');
check(routeSource.includes('현재 가격은 모형 범위의 어디에 있나요?') && routeSource.includes('현재 가격을 설명하려면 어떤 성과가 필요한가요?'), 'core price and implied-expectation questions rendered');
check(routeSource.includes('<table>') && routeSource.includes('scope="row"') && routeSource.includes('scope="col"'), 'semantic sensitivity table');
check(routeSource.includes('0 또는 빈 그래프로 대신하지 않습니다'), 'unavailable state does not fabricate zero');
check(profileSource.includes('/valuation') && financialSource.includes('/valuation') && reportSource.includes('/valuation'), 'company, financial, and report paths connect valuation route');
check(!/(BUY|HOLD|SELL|매수|매도|목표주가|상승여력|하락여력)/.test(routeSource), 'forbidden investment recommendation terms absent');

console.log(`✓ Valuation expectations unit ${checks}개 검증 · 지원 9개 · full 2 · unavailable 7 · reverse DCF · 범위 판정 · 민감도 · 출처`);

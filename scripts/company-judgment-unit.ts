import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildCompanyJudgment,
  companyJudgmentSlugs,
  isCompanyJudgmentCardCurrent,
  loadAllCompanyJudgmentConfigs,
} from '../src/content/company-judgments/index.js';
import { validateCompanyJudgmentRegistry } from '../src/content/company-judgments/validation.js';

let checks = 0;
function check(condition: unknown, label: string) {
  checks += 1;
  if (!condition) throw new Error(`company judgment unit failed: ${label}`);
}

const errors = await validateCompanyJudgmentRegistry();
check(errors.length === 0, `registry validation: ${errors.join(' | ')}`);
const configs = await loadAllCompanyJudgmentConfigs();
check(configs.length === 3 && companyJudgmentSlugs.length === 3, 'three initial companies');
check(configs.map(({ companySlug }) => companySlug).join('|') === 'sk-hynix|alphabet|hana-financial', 'initial company order');
check(configs.every(({ cards }) => cards.length === 4), 'four cards per company');
check(configs.every(({ cards }) => cards.map(({ key }) => key).join('|') === 'businessGrowth|earningsQuality|cashQuality|investmentBurden'), 'fixed card order');
check(configs.every(({ cards }) => cards.every(({ metrics }) => metrics.length >= 2 && metrics.length <= 3)), 'two or three metrics');
check(configs.every(({ companyDirection }) => companyDirection.horizon === '향후 6~12개월'), 'company direction horizon');
check(configs.every(({ marketExpectation }) => marketExpectation.horizon === '다음 1~2개 분기'), 'market expectation horizon');
check(configs.every((config) => buildCompanyJudgment(config)?.cards.length === 4), 'current cards build');

const staleFixture = structuredClone(configs[0]);
staleFixture.latestOfficialUpdate.latestQuarterlyResultsAt = '2026-08-01';
check(!isCompanyJudgmentCardCurrent(staleFixture.cards[0], staleFixture.latestOfficialUpdate), 'new results make operating card stale');
check(buildCompanyJudgment(staleFixture) === null, 'stale top judgment is not current');

const missingFixture = structuredClone(configs[0]);
missingFixture.cards = missingFixture.cards.slice(0, 3);
check(buildCompanyJudgment(missingFixture)?.cards.length === 3, 'missing card is hidden, not synthesized');

const uiSource = readFileSync(join(process.cwd(), 'src', 'components', 'company-profiles', 'CompanyJudgmentPanel.tsx'), 'utf8');
const profileUiSource = readFileSync(join(process.cwd(), 'src', 'components', 'company-profiles', 'CompanyProfiles.tsx'), 'utf8');
const stylesSource = readFileSync(join(process.cwd(), 'src', 'toss-theme.css'), 'utf8');
check(/useState<CompanyJudgmentCardKey \| null>\(null\)/.test(uiSource), 'all cards initially closed');
check(/setOpenCard\(isOpen \? null : card\.key\)/.test(uiSource), 'one-open accordion state');
check(/aria-expanded=\{isOpen\}/.test(uiSource) && /aria-controls=\{panelId\}/.test(uiSource), 'accordion accessibility');
check(/<details className="company-judgment-sources">/.test(uiSource) && /근거 자료 보기/.test(uiSource), 'sources nested disclosure');
check(!/(종합 시각|전체 등급|최종 점수)/.test(uiSource), 'no combined verdict');
check(/hidden=\{!isOpen\}/.test(uiSource), 'metrics and trend only after expansion');
check(/completedRadar/.test(profileUiSource) && /axis\.state !== 'insufficientData'/.test(profileUiSource), 'incomplete pentagon hidden');
check(/min-height: 88px/.test(stylesSource) && /overflow-wrap: anywhere/.test(stylesSource), 'touch target and long URL wrapping');

console.log(`✓ 기업 판단 unit ${checks}개 검증 · 초기 기업 3 · 판단 카드 12 · freshness gate`);

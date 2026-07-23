import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { companySearchIndex, companyProfiles } from '../src/content/company-profiles/index.js';
import {
  companyDissectionAxisKeys,
  companyDissectionSlugs,
  loadAllCompanyDissectionConfigs,
  validateCompanyDissectionRegistry,
} from '../src/content/company-dissections/index.js';

let checks = 0;
function check(condition: unknown, label: string) {
  checks += 1;
  if (!condition) throw new Error(`company dissection unit failed: ${label}`);
}

const errors = await validateCompanyDissectionRegistry();
check(errors.length === 0, errors.join(' | ') || 'registry validation');

const configs = await loadAllCompanyDissectionConfigs();
check(configs.length === companyProfiles.length, 'one dissection per supported company');
check(companySearchIndex.length === companyProfiles.filter((profile) => profile.searchStatus.searchVisible).length, 'search index derived from visible registry entries');
check(new Set(companySearchIndex.map(({ profile }) => profile.slug)).size === companySearchIndex.length, 'search slug deduplicated');
check(new Set(companySearchIndex.map(({ company }) => company.ticker)).size === companySearchIndex.length, 'search ticker deduplicated');
check(configs.every(({ axes }) => companyDissectionAxisKeys.every((key) => Boolean(axes[key]))), 'five axes present');
check(configs.every(({ axes }) => companyDissectionAxisKeys.every((key) => axes[key].comparison.label.length > 0)), 'axis comparison displayed');
check(configs.every(({ axes }) => companyDissectionAxisKeys.every((key) => axes[key].state !== 'insufficientData' || axes[key].position === null)), 'insufficient data never mapped to midpoint');
check(configs.every(({ axes }) => companyDissectionAxisKeys.every((key) => axes[key].state === 'insufficientData' || Number.isFinite(axes[key].position))), 'all available positions finite');
check(configs.every(({ industryProfile }) => industryProfile.classificationSources.length >= 3), 'three classification sources per company');
check(configs.every(({ industryProfile }) => industryProfile.businessSegments.length >= 1), 'official segment present');
check(companyDissectionSlugs.every((slug) => companySearchIndex.some(({ profile }) => profile.slug === slug)), 'all supported dissections searchable');

const radarSource = readFileSync(join(process.cwd(), 'src', 'components', 'company-profiles', 'CompanyDissectionRadar.tsx'), 'utf8');
const companySource = readFileSync(join(process.cwd(), 'src', 'components', 'company-profiles', 'CompanyProfiles.tsx'), 'utf8');
const reportSource = readFileSync(join(process.cwd(), 'src', 'routes', 'ResearchReportRoute.tsx'), 'utf8');
check(/aria-pressed/.test(radarSource) && /onKeyDown/.test(radarSource), 'radar keyboard selection');
check(/role=\{mobile \? 'dialog'/.test(radarSource) && /aria-modal/.test(radarSource), 'mobile sheet dialog semantics');
check(/focus\(\)/.test(radarSource), 'focus restoration implemented');
check(/coreCards/.test(companySource) && /slice\(0, 3\)/.test(companySource), 'four core cards and maximum three next checks');
check(!/(종합 투자 점수|별점|BUY|HOLD|SELL)/.test(`${radarSource}\n${companySource}`), 'prohibited aggregate rating absent');
check(!/(Reverse DCF|Monte Carlo|민감도 매트릭스|DCF 시나리오)/.test(reportSource), 'research report has no duplicated valuation tables');

console.log(`✓ 모바일 기업 해부 unit ${checks}개 검증`);

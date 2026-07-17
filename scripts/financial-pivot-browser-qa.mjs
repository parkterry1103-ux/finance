import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const modules = process.env.CODEX_NODE_MODULES;
if (!modules) throw new Error('CODEX_NODE_MODULES is required');
const { chromium, webkit } = require(join(modules, 'playwright'));

const baseUrl = process.env.PHASE5C_BASE_URL ?? 'http://127.0.0.1:8788';
const root = process.cwd();
const artifactDir = join(root, 'artifacts', 'phase-5c-financial-pivot');
mkdirSync(artifactDir, { recursive: true });

const companies = ['sk-hynix', 'lg-electronics', 'nvidia', 'micron', 'dell', 'eaton', 'meta', 'supermicro'];
const viewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
  { width: 320, height: 700 },
];

function fixture(slug, periodType) {
  const isKr = slug === 'sk-hynix' || slug === 'lg-electronics';
  const periods = periodType === 'quarterly'
    ? [{ label: 'FY 2026 Q1', periodEnd: '2026-04-30', fiscalYear: 2026, fiscalPeriod: 'Q1' }]
    : [2022, 2023, 2024, 2025, 2026].map((year) => ({ label: `FY ${year}`, periodEnd: `${year}-12-31`, fiscalYear: year, fiscalPeriod: 'FY' }));
  return {
    ok: true,
    country: isKr ? 'KR' : 'US',
    companyId: slug,
    source: isKr ? 'OpenDART' : 'SEC',
    sourceStatus: 'direct',
    asOf: '2026-07-17',
    currency: isKr ? 'KRW' : 'USD',
    reportType: isKr ? 'OpenDART 사업보고서 CFS' : '10-K',
    periodBasis: 'browser QA fixture',
    metrics: {},
    series: {
      periodType,
      requestedLimit: periodType === 'annual' ? 5 : 8,
      complete: periodType === 'annual',
      periods: periods.map((period, index) => ({
        ...period,
        currency: isKr ? 'KRW' : 'USD',
        unit: 'million',
        metrics: {
          revenue: 100_000 + index * 14_000,
          grossProfit: 43_000 + index * 6_000,
          operatingIncome: index === 0 ? -2_000 : 13_000 + index * 2_100,
          netIncome: index === 0 ? -3_000 : 9_000 + index * 1_500,
          operatingCashFlow: 18_000 + index * 2_900,
          capitalExpenditure: 8_000 + index * 1_100,
          freeCashFlow: 10_000 + index * 1_800,
          cashAndEquivalents: 22_000 + index * 1_300,
          totalDebt: 12_000 + index * 600,
          totalAssets: 180_000 + index * 12_000,
          totalEquity: 100_000 + index * 8_000,
          currentAssets: 70_000 + index * 4_000,
          currentLiabilities: 35_000 + index * 2_000,
          dilutedEps: 2.1 + index * .6,
        },
        sourceIds: [`${isKr ? 'opendart' : 'sec'}:${slug}:${period.periodEnd}`],
        filingType: isKr ? 'OpenDART 사업보고서 CFS' : 'SEC 10-K',
        filedAt: '2026-02-01',
        accessionOrReceiptNumber: isKr ? '20260201000001' : '0000000000-26-000001',
      })),
    },
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const results = [];
const routeResults = [];
for (const [engineName, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch({ headless: true });
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => consoleErrors.push(error.message));
    await page.route('**/api/financials?**', async (route) => {
      const url = new URL(route.request().url());
      const companyId = url.searchParams.get('companyId') ?? 'nvidia';
      const slug = companies.find((item) => companyId.includes(item)) ?? (companyId.includes('platforms') ? 'meta' : 'nvidia');
      const period = url.searchParams.get('period') === 'quarterly' ? 'quarterly' : 'annual';
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixture(slug, period)) });
    });
    const url = `${baseUrl}/ko/companies/nvidia/financials`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: /NVIDIA 숫자와 비교/ }).waitFor();
    const audit = await page.evaluate(() => ({
      h1: document.querySelectorAll('h1').length,
      pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      tableOverflow: Boolean(document.querySelector('.financial-pivot-table-scroll') && document.querySelector('.financial-pivot-table-scroll').scrollWidth > document.querySelector('.financial-pivot-table-scroll').clientWidth),
      touchTargets: [...document.querySelectorAll('.financial-pivot-controls button')].every((element) => element.getBoundingClientRect().height >= 44),
    }));
    assert(audit.h1 === 1, `${engineName} ${viewport.width}: expected one h1`);
    assert(!audit.pageOverflow, `${engineName} ${viewport.width}: page overflow`);
    assert(audit.touchTargets, `${engineName} ${viewport.width}: control below 44px`);
    if (viewport.width <= 390) assert(audit.tableOverflow, `${engineName} ${viewport.width}: table should scroll internally`);
    await page.getByRole('tab', { name: '수익성' }).click();
    await page.getByRole('button', { name: /영업이익률/ }).click();
    assert(await page.getByText(/계산: 영업이익 ÷ 매출/).isVisible(), `${engineName} ${viewport.width}: row detail missing`);
    await page.getByRole('button', { name: '비교기업' }).click();
    await page.getByText(/비교기업 중앙값/).first().waitFor();
    await page.getByRole('button', { name: '산업 집계' }).click();
    await page.getByRole('heading', { name: 'Semiconductor' }).waitFor();
    await page.getByRole('button', { name: '분기' }).click();
    await page.getByText('비교 자료 없음').first().waitFor();
    assert(consoleErrors.length === 0, `${engineName} ${viewport.width}: ${consoleErrors.join(' | ')}`);
    if ((viewport.width === 1440 || viewport.width === 390 || viewport.width === 320) && engineName === 'chromium') {
      await page.screenshot({ path: join(artifactDir, `${engineName}-${viewport.width}.png`), fullPage: true });
    }
    results.push({ engine: engineName, ...viewport, ...audit, consoleErrors: consoleErrors.length, status: 'passed' });
    await context.close();
  }
  if (engineName === 'chromium') {
    for (const slug of companies) {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await context.newPage();
      await page.route('**/api/financials?**', async (route) => {
        const url = new URL(route.request().url());
        const period = url.searchParams.get('period') === 'quarterly' ? 'quarterly' : 'annual';
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixture(slug, period)) });
      });
      await page.goto(`${baseUrl}/ko/companies/${slug}/financials`, { waitUntil: 'networkidle' });
      const routeAudit = await page.evaluate(() => ({
        h1: document.querySelectorAll('h1').length,
        title: document.querySelector('h1')?.textContent?.trim() ?? '',
        pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        hasTable: Boolean(document.querySelector('.financial-pivot-table-scroll table')),
      }));
      assert(routeAudit.h1 === 1 && routeAudit.title.includes('숫자와 비교'), `${slug}: h1 missing`);
      assert(!routeAudit.pageOverflow && routeAudit.hasTable, `${slug}: route layout failed`);
      routeResults.push({ slug, ...routeAudit, status: 'passed' });
      await context.close();
    }
  }
  await browser.close();
}

writeFileSync(join(artifactDir, 'browser-qa.json'), `${JSON.stringify({ baseUrl, results, routeResults }, null, 2)}\n`);
console.log(`✓ Financial Pivot browser QA ${results.length}개 viewport · 기업 route ${routeResults.length}개 · Chromium/WebKit · overflow 0 · console error 0`);

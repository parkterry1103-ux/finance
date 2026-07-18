import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const modules = process.env.CODEX_NODE_MODULES;
if (!modules) throw new Error('CODEX_NODE_MODULES is required');
const { chromium, webkit } = require(join(modules, 'playwright'));

const baseUrl = process.env.PHASE5F_BASE_URL ?? 'http://127.0.0.1:4173';
const artifactDir = join(process.cwd(), 'artifacts', 'phase-5f-analytics');
mkdirSync(artifactDir, { recursive: true });

const viewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
  { width: 320, height: 700 },
];

const pricePayload = {
  ok: true,
  prices: [
    { companyId: 'us-semiconductors-nvidia', ticker: 'NVDA', market: 'NASDAQ', price: '207.40', close: '207.40', currency: 'USD', priceLabel: 'delayed', marketStatus: 'delayed', asOf: '2026-07-16T20:00:00.000Z', source: 'yahoo-finance-chart', isDelayed: true },
  ],
};

function financialFixture() {
  const periods = [2022, 2023, 2024, 2025, 2026].map((year, index) => ({
    label: `FY ${year}`, periodEnd: `${year}-01-31`, fiscalYear: year, fiscalPeriod: 'FY', currency: 'USD', unit: 'million',
    metrics: {
      revenue: 30_000 + index * 18_000, grossProfit: 18_000 + index * 11_000, operatingIncome: 9_000 + index * 7_000,
      netIncome: 8_000 + index * 6_000, operatingCashFlow: 12_000 + index * 9_000, capitalExpenditure: 2_000 + index * 800,
      freeCashFlow: 10_000 + index * 8_200, cashAndEquivalents: 14_000 + index * 2_000, totalDebt: 10_000 + index * 500,
      totalAssets: 50_000 + index * 15_000, totalEquity: 25_000 + index * 9_000, currentAssets: 28_000 + index * 8_000,
      currentLiabilities: 10_000 + index * 3_000, dilutedEps: 2 + index * 1.5,
    },
    sourceIds: [`sec:nvidia:${year}`], filingType: 'SEC 10-K', filedAt: `${year}-03-01`, accessionOrReceiptNumber: '0001045810-26-000001',
  }));
  return { ok: true, country: 'US', companyId: 'us-semiconductors-nvidia', source: 'SEC', sourceStatus: 'direct', asOf: '2026-07-18', currency: 'USD', reportType: '10-K', periodBasis: 'analytics QA fixture', series: { periodType: 'annual', requestedLimit: 5, complete: true, periods } };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function installFixtures(page) {
  await page.route('**/api/market-prices**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(pricePayload) }));
  await page.route('**/api/financials**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(financialFixture()) }));
}

async function debugRecords(page) {
  return page.evaluate(() => window.__RESEARCH_ANALYTICS_DEBUG__ ?? []);
}

function eventNames(records) {
  return records.filter((record) => record.kind === 'event').map((record) => record.name);
}

function assertPrivateFieldsAbsent(records, label) {
  const forbidden = new Set(['query', 'searchTerm', 'email', 'userId', 'accountId', 'url', 'referrer', 'wacc', 'growth', 'price', 'amount', 'value', 'ticker']);
  const visit = (value) => {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      assert(!forbidden.has(key), `${label}: forbidden analytics key ${key}`);
      visit(child);
    }
  };
  records.forEach(visit);
  const serialized = JSON.stringify(records);
  assert(!serialized.includes('private-search-text'), `${label}: raw search text leaked`);
  assert(!serialized.includes('google.com/search'), `${label}: raw referrer leaked`);
}

const results = [];
for (const [engineName, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch({ headless: true });
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await installFixtures(page);
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${baseUrl}/ko/?utm_source=instagram&utm_medium=social&utm_campaign=phase-5f&utm_content=story&ignored=private-search-text`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { level: 1 }).waitFor();
    const audit = await page.evaluate(() => ({
      h1: document.querySelectorAll('h1').length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      pageviews: (window.__RESEARCH_ANALYTICS_DEBUG__ ?? []).filter((record) => record.kind === 'pageview').length,
      landingViews: (window.__RESEARCH_ANALYTICS_DEBUG__ ?? []).filter((record) => record.kind === 'event' && record.name === 'research_landing_view').length,
    }));
    assert(audit.h1 === 1 && !audit.overflow, `${engineName} ${viewport.width}: home layout failed`);
    assert(audit.pageviews === 1 && audit.landingViews === 1, `${engineName} ${viewport.width}: initial pageview dedupe failed`);
    assert(errors.length === 0, `${engineName} ${viewport.width}: ${errors.join(' | ')}`);
    results.push({ engine: engineName, route: 'home', ...viewport, ...audit, consoleErrors: errors.length, status: 'passed' });
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await installFixtures(page);
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${baseUrl}/ko/?utm_source=instagram&utm_medium=social&utm_campaign=phase-5f&utm_content=story`, { waitUntil: 'networkidle' });
    await page.getByLabel('기업 찾기').fill('nvidia');
    await page.getByRole('option', { name: /NVIDIA/ }).click();
    await page.getByRole('heading', { level: 1, name: 'NVIDIA' }).waitFor();
    await page.getByRole('link', { name: /숫자와 비교 보기/ }).click();
    await page.getByRole('heading', { level: 1, name: /NVIDIA 숫자와 비교/ }).waitFor();
    await page.getByRole('tab', { name: '수익성' }).click();
    await page.getByRole('button', { name: /영업이익률/ }).click();
    await page.getByRole('button', { name: '비교기업' }).click();
    await page.getByText(/비교기업 중앙값/).first().waitFor();
    const records = await debugRecords(page);
    const names = eventNames(records);
    for (const name of ['company_search_select', 'company_view', 'company_financials_click', 'financials_view', 'financial_group_select', 'financial_metric_expand', 'financial_compare_mode_select']) {
      assert(names.includes(name), `${engineName}: ${name} missing from company-financial flow`);
    }
    const searchSelection = records.find((record) => record.kind === 'event' && record.name === 'company_search_select');
    assert(searchSelection?.payload?.resultPosition === 1 && searchSelection?.payload?.placement === 'home', `${engineName}: search result position or placement missing`);
    const pageviews = records.filter((record) => record.kind === 'pageview');
    assert(pageviews.length === 3, `${engineName}: expected three route pageviews, received ${pageviews.length}`);
    assert(records.filter((record) => record.kind === 'event' && record.name === 'research_landing_view').length === 1, `${engineName}: landing event repeated after SPA navigation`);
    const financialView = records.find((record) => record.kind === 'event' && record.name === 'financials_view');
    assert(financialView?.payload?.attribution?.source === 'instagram', `${engineName}: attribution did not persist after UTM removal`);
    assertPrivateFieldsAbsent(records, `${engineName} company-financial flow`);
    assert(errors.length === 0, `${engineName} company-financial flow: ${errors.join(' | ')}`);
    results.push({ engine: engineName, route: 'company-financial-flow', events: names, pageviews: pageviews.length, consoleErrors: errors.length, status: 'passed' });
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await installFixtures(page);
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${baseUrl}/ko/insights/3reads/2026-07-17-standards-set-price`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { level: 1 }).waitFor();
    const beforeHash = (await debugRecords(page)).filter((record) => record.kind === 'pageview').length;
    await page.evaluate(() => { window.location.hash = 'three-sources-title'; window.dispatchEvent(new PopStateEvent('popstate')); });
    await page.waitForTimeout(200);
    const afterHash = (await debugRecords(page)).filter((record) => record.kind === 'pageview').length;
    assert(beforeHash === afterHash, `${engineName}: hash navigation created another pageview`);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(10_300);
    const records = await debugRecords(page);
    const names = eventNames(records);
    const depths = records.filter((record) => record.kind === 'event' && record.name === 'editorial_read_depth').map((record) => record.payload.depthPercent);
    assert(names.includes('editorial_view') && names.includes('editorial_complete'), `${engineName}: editorial view or completion missing`);
    assert([25, 50, 75, 90].every((depth) => depths.includes(depth)), `${engineName}: read depth milestones incomplete (${depths.join(', ')})`);
    assert(records.every((record) => record.kind !== 'event' || !Object.hasOwn(record.payload, 'elapsedMilliseconds')), `${engineName}: exact dwell time leaked`);
    assertPrivateFieldsAbsent(records, `${engineName} editorial flow`);
    assert(errors.length === 0, `${engineName} editorial flow: ${errors.join(' | ')}`);
    results.push({ engine: engineName, route: 'editorial-read-flow', depths, complete: true, hashPageviewStable: true, consoleErrors: errors.length, status: 'passed' });
    await context.close();
  }
  await browser.close();
}

const planUrl = pathToFileURL(join(process.cwd(), 'docs', 'plans', 'phase-5f-research-funnel-analytics-plan.html')).href;
for (const [engineName, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch({ headless: true });
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 700 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto(planUrl);
    const audit = await page.evaluate(() => ({ h1: document.querySelectorAll('h1').length, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }));
    assert(audit.h1 === 1 && !audit.overflow, `${engineName} Plan ${viewport.width}: layout failed`);
    results.push({ engine: engineName, route: 'plan-html', ...viewport, ...audit, status: 'passed' });
    await context.close();
  }
  await browser.close();
}

writeFileSync(join(artifactDir, 'browser-qa.json'), `${JSON.stringify({ baseUrl, results }, null, 2)}\n`);
console.log(`✓ Phase 5F browser QA ${results.length}개 · Chromium/WebKit · 제품 7 viewport · Plan 3 viewport · SPA/UTM/read-depth/privacy 통과`);

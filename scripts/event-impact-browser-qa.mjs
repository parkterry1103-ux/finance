import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const modules = process.env.CODEX_NODE_MODULES;
if (!modules) throw new Error('CODEX_NODE_MODULES is required');
const { chromium, webkit } = require(join(modules, 'playwright'));

const baseUrl = process.env.PHASE5E_BASE_URL ?? 'http://127.0.0.1:4173';
const root = process.cwd();
const artifactDir = join(root, 'artifacts', 'phase-5e-event-impacts');
mkdirSync(artifactDir, { recursive: true });
const manifest = JSON.parse(readFileSync(join(root, 'dist', '.vite', 'manifest.json'), 'utf8'));
const nvidiaImpactAsset = `/${manifest['src/content/event-impacts/entries/nvidia.ts'].file}`;
const metaImpactAsset = `/${manifest['src/content/event-impacts/entries/meta.ts'].file}`;

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
    { companyId: 'meta-platforms', ticker: 'META', market: 'NASDAQ', price: '664.54', close: '664.54', currency: 'USD', priceLabel: 'delayed', marketStatus: 'delayed', asOf: '2026-07-16T20:00:01.000Z', source: 'yahoo-finance-chart', isDelayed: true },
  ],
};

function financialFixture() {
  const periods = [2022, 2023, 2024, 2025, 2026].map((year, index) => ({
    label: `FY ${year}`,
    periodEnd: `${year}-01-31`,
    fiscalYear: year,
    fiscalPeriod: 'FY',
    currency: 'USD',
    unit: 'million',
    metrics: {
      revenue: 30_000 + index * 18_000,
      grossProfit: 18_000 + index * 11_000,
      operatingIncome: 9_000 + index * 7_000,
      netIncome: 8_000 + index * 6_000,
      operatingCashFlow: 12_000 + index * 9_000,
      capitalExpenditure: 2_000 + index * 800,
      freeCashFlow: 10_000 + index * 8_200,
      cashAndEquivalents: 14_000 + index * 2_000,
      totalDebt: 10_000 + index * 500,
      totalAssets: 50_000 + index * 15_000,
      totalEquity: 25_000 + index * 9_000,
      currentAssets: 28_000 + index * 8_000,
      currentLiabilities: 10_000 + index * 3_000,
      dilutedEps: 2 + index * 1.5,
    },
    sourceIds: [`sec:nvidia:${year}`],
    filingType: 'SEC 10-K',
    filedAt: `${year}-03-01`,
    accessionOrReceiptNumber: '0001045810-26-000001',
  }));
  return { ok: true, country: 'US', companyId: 'us-semiconductors-nvidia', source: 'SEC', sourceStatus: 'direct', asOf: '2026-07-18', currency: 'USD', reportType: '10-K', periodBasis: 'browser QA fixture', series: { periodType: 'annual', requestedLimit: 5, complete: true, periods } };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function installFixtures(page) {
  await page.route('**/api/market-prices**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(pricePayload) }));
  await page.route('**/api/financials**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(financialFixture()) }));
}

async function baseAudit(page) {
  return page.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    badText: /\b(?:undefined|NaN|Infinity)\b/.test(document.body.innerText),
    minLinkTarget: Math.min(...[...document.querySelectorAll('main a')].map((element) => element.getBoundingClientRect().height).filter((height) => height > 0)),
  }));
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
    await page.goto(`${baseUrl}/ko/companies/nvidia`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: '최근 사건이 무엇을 다시 보게 했나요?' }).waitFor();
    const audit = await baseAudit(page);
    const sectionAudit = await page.evaluate(() => ({
      impactSections: document.querySelectorAll('.company-event-impact-section').length,
      impactCards: document.querySelectorAll('.company-event-impact-grid > article').length,
      confirmed: document.body.innerText.includes('확인된 사실'),
      unresolved: document.body.innerText.includes('아직 확인할 것'),
      noChange: document.body.innerText.includes('기준 가정 유지'),
    }));
    assert(audit.h1 === 1 && !audit.pageOverflow && !audit.badText, `${engineName} ${viewport.width}: company layout failed`);
    assert(sectionAudit.impactSections === 1 && sectionAudit.impactCards === 1 && sectionAudit.confirmed && sectionAudit.unresolved && sectionAudit.noChange, `${engineName} ${viewport.width}: company impact semantics missing`);
    assert(errors.length === 0, `${engineName} ${viewport.width}: ${errors.join(' | ')}`);
    if (engineName === 'chromium' && [1440, 390, 320].includes(viewport.width)) await page.screenshot({ path: join(artifactDir, `company-${engineName}-${viewport.width}.png`), fullPage: true });
    results.push({ engine: engineName, route: 'nvidia-company', ...viewport, ...audit, ...sectionAudit, consoleErrors: errors.length, status: 'passed' });
    await context.close();
  }

  for (const route of [
    { id: 'nvidia-financials', path: '/ko/companies/nvidia/financials', heading: 'NVIDIA 숫자와 비교', selector: '.financial-impact-inline', expected: 1 },
    { id: 'nvidia-valuation', path: '/ko/companies/nvidia/valuation', heading: /엔비디아 시장가격에 반영된 기대/, selector: '.valuation-review-records', expected: 1 },
    { id: 'meta-valuation', path: '/ko/companies/meta/valuation', heading: /메타 플랫폼스 시장가격에 반영된 기대/, selector: '.valuation-review-records', expected: 1 },
    { id: 'sk-hynix-company', path: '/ko/companies/sk-hynix', heading: 'SK하이닉스', selector: '.company-event-impact-section', expected: 0 },
    { id: 'published-editorial', path: '/ko/insights/3reads/2026-07-17-standards-set-price', heading: /먼저 고정한 표준이 가격을 정한다/, selector: '.editorial-event-impact', expected: 0 },
  ]) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await installFixtures(page);
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { level: 1, name: route.heading }).waitFor();
    const audit = await baseAudit(page);
    const count = await page.locator(route.selector).count();
    assert(audit.h1 === 1 && !audit.pageOverflow && !audit.badText, `${engineName} ${route.id}: base layout failed`);
    assert(count === route.expected, `${engineName} ${route.id}: expected ${route.expected} impact sections, received ${count}`);
    if (route.id.includes('valuation')) {
      assert(await page.getByRole('heading', { name: '가정 검토 기록' }).isVisible(), `${engineName} ${route.id}: review heading missing`);
      assert(await page.getByText('변경 없음', { exact: false }).first().isVisible(), `${engineName} ${route.id}: unchanged model version missing`);
    }
    if (route.id === 'nvidia-financials') assert(await page.getByText('사건 연결 1건').first().isVisible(), `${engineName}: metric impact record missing`);
    assert(errors.length === 0, `${engineName} ${route.id}: ${errors.join(' | ')}`);
    results.push({ engine: engineName, route: route.id, width: 1280, height: 800, ...audit, impactSections: count, consoleErrors: errors.length, status: 'passed' });
    await context.close();
  }
  await browser.close();
}

const chunkBrowser = await chromium.launch({ headless: true });
for (const [slug, expectedAsset, excludedAsset] of [['nvidia', nvidiaImpactAsset, metaImpactAsset], ['meta', metaImpactAsset, nvidiaImpactAsset]]) {
  const context = await chunkBrowser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await installFixtures(page);
  const scripts = [];
  page.on('request', (request) => { if (request.resourceType() === 'script') scripts.push(new URL(request.url()).pathname); });
  await page.goto(`${baseUrl}/ko/companies/${slug}`, { waitUntil: 'networkidle' });
  assert(scripts.includes(expectedAsset), `${slug}: current-company impact chunk missing`);
  assert(!scripts.includes(excludedAsset), `${slug}: other-company impact chunk was preloaded`);
  results.push({ engine: 'chromium', route: `${slug}-chunk-boundary`, expectedAsset, excludedAsset, scripts: [...new Set(scripts)], status: 'passed' });
  await context.close();
}
{
  const context = await chunkBrowser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await installFixtures(page);
  const scripts = [];
  page.on('request', (request) => { if (request.resourceType() === 'script') scripts.push(new URL(request.url()).pathname); });
  await page.goto(`${baseUrl}/ko/`, { waitUntil: 'networkidle' });
  assert(!scripts.includes(nvidiaImpactAsset) && !scripts.includes(metaImpactAsset), 'home preloaded event impacts');
  results.push({ engine: 'chromium', route: 'home-chunk-boundary', scripts: [...new Set(scripts)], status: 'passed' });
  await context.close();
}
await chunkBrowser.close();

const planUrl = pathToFileURL(join(root, 'docs', 'plans', 'phase-5e-event-assumption-linkage-plan.html')).href;
for (const [engineName, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch({ headless: true });
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 700 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto(planUrl);
    const audit = await baseAudit(page);
    assert(audit.h1 === 1 && !audit.pageOverflow, `${engineName} Plan ${viewport.width}: layout failed`);
    results.push({ engine: engineName, route: 'plan-html', ...viewport, ...audit, status: 'passed' });
    await context.close();
  }
  await browser.close();
}

writeFileSync(join(artifactDir, 'browser-qa.json'), `${JSON.stringify({ baseUrl, nvidiaImpactAsset, metaImpactAsset, results }, null, 2)}\n`);
console.log(`✓ Phase 5E browser QA ${results.length}개 · Chromium/WebKit · 제품 7 viewport · Plan 3 viewport · overflow 0 · console error 0 · dynamic boundary 통과`);

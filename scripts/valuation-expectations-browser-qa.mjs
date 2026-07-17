import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const modules = process.env.CODEX_NODE_MODULES;
if (!modules) throw new Error('CODEX_NODE_MODULES is required');
const { chromium, webkit } = require(join(modules, 'playwright'));

const baseUrl = process.env.PHASE5D_BASE_URL ?? 'http://127.0.0.1:8789';
const artifactDir = join(process.cwd(), 'artifacts', 'phase-5d-valuation-expectations');
mkdirSync(artifactDir, { recursive: true });

const companies = ['sk-hynix', 'lg-electronics', 'nvidia', 'micron', 'dell', 'eaton', 'meta', 'supermicro'];
const fullCompanies = new Set(['nvidia', 'meta']);
const viewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
  { width: 320, height: 700 },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const pricePayload = {
  ok: true,
  prices: [
    { companyId: 'us-semiconductors-nvidia', ticker: 'NVDA', market: 'NASDAQ', price: '207.40', close: '207.40', open: '210.00', change: '-2.60', changePercent: '-1.24%', currency: 'USD', priceLabel: 'delayed', marketStatus: 'delayed', asOf: '2026-07-16T20:00:00.000Z', source: 'yahoo-finance-chart', isDelayed: true },
    { companyId: 'us-internet-meta', ticker: 'META', market: 'NASDAQ', price: '664.54', close: '664.54', open: '670.00', change: '-5.46', changePercent: '-0.81%', currency: 'USD', priceLabel: 'delayed', marketStatus: 'delayed', asOf: '2026-07-16T20:00:01.000Z', source: 'yahoo-finance-chart', isDelayed: true },
  ],
};

async function installPriceFixture(page) {
  await page.route('**/api/market-prices?**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(pricePayload) }));
}

const results = [];
const routeResults = [];
for (const [engineName, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch({ headless: true });
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await installPriceFixture(page);
    const consoleErrors = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => consoleErrors.push(error.message));
    await page.goto(`${baseUrl}/ko/companies/nvidia/valuation`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { level: 1, name: /엔비디아 시장가격에 반영된 기대/ }).waitFor();
    const audit = await page.evaluate(() => {
      const marker = document.querySelector('.valuation-price-marker')?.getBoundingClientRect();
      const range = document.querySelector('.valuation-range-card')?.getBoundingClientRect();
      const tableRegion = document.querySelector('.valuation-sensitivity-scroll');
      const controls = [...document.querySelectorAll('.valuation-adjuster input, .valuation-adjuster button')];
      return {
        h1: document.querySelectorAll('h1').length,
        pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        markerInside: Boolean(marker && range && marker.left >= range.left && marker.right <= range.right),
        tableInternalOverflow: Boolean(tableRegion && tableRegion.scrollWidth > tableRegion.clientWidth),
        touchTargets: controls.every((element) => element.getBoundingClientRect().height >= 44),
        rangeText: document.querySelector('.valuation-range-text')?.textContent?.trim() ?? '',
        headings: document.querySelectorAll('h2').length,
        sourcesOverflow: [...document.querySelectorAll('.valuation-source-list a')].some((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth),
      };
    });
    assert(audit.h1 === 1, `${engineName} ${viewport.width}: expected one h1`);
    assert(audit.headings >= 6, `${engineName} ${viewport.width}: heading hierarchy incomplete`);
    assert(!audit.pageOverflow, `${engineName} ${viewport.width}: page overflow`);
    assert(audit.markerInside, `${engineName} ${viewport.width}: market marker clipped`);
    assert(audit.rangeText.includes('텍스트 대안'), `${engineName} ${viewport.width}: range text alternative missing`);
    assert(audit.touchTargets, `${engineName} ${viewport.width}: control below 44px`);
    assert(!audit.sourcesOverflow, `${engineName} ${viewport.width}: source URL overflow`);
    if (viewport.width <= 390) assert(audit.tableInternalOverflow, `${engineName} ${viewport.width}: sensitivity table should scroll internally`);
    const wacc = page.getByLabel('WACC (%)');
    const growth = page.getByLabel('영구성장률 (%)');
    await wacc.fill('3');
    await growth.fill('3');
    await page.getByText('계산 제한', { exact: true }).first().waitFor();
    await page.getByRole('button', { name: /기준 가정으로 초기화/ }).click();
    await page.locator('.valuation-sensitivity-scroll').focus();
    assert(await page.locator('.valuation-sensitivity-scroll').evaluate((element) => element === document.activeElement), `${engineName} ${viewport.width}: sensitivity region not keyboard focusable`);
    assert(consoleErrors.length === 0, `${engineName} ${viewport.width}: ${consoleErrors.join(' | ')}`);
    if (engineName === 'chromium' && [1440, 390, 320].includes(viewport.width)) await page.screenshot({ path: join(artifactDir, `${engineName}-${viewport.width}.png`), fullPage: true });
    results.push({ engine: engineName, ...viewport, ...audit, consoleErrors: consoleErrors.length, status: 'passed' });
    await context.close();
  }

  if (engineName === 'chromium') {
    for (const slug of companies) {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await context.newPage();
      await installPriceFixture(page);
      const requests = [];
      page.on('request', (request) => { if (request.resourceType() === 'script') requests.push(new URL(request.url()).pathname); });
      await page.goto(`${baseUrl}/ko/companies/${slug}/valuation`, { waitUntil: 'networkidle' });
      const audit = await page.evaluate(() => ({
        h1: document.querySelectorAll('h1').length,
        title: document.querySelector('h1')?.textContent?.trim() ?? '',
        pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        hasRange: Boolean(document.querySelector('.valuation-range-card')),
        hasZeroPrice: /(?:\$|₩)0(?:\.00)?\b/.test(document.body.innerText),
      }));
      assert(audit.h1 === 1 && !audit.pageOverflow, `${slug}: direct route layout failed`);
      if (fullCompanies.has(slug)) {
        assert(audit.hasRange && audit.title.includes('시장가격에 반영된 기대'), `${slug}: full valuation missing`);
      } else {
        assert(!audit.hasRange && audit.title.includes('검증된 가치평가 모형이 아직 없습니다'), `${slug}: unavailable state missing`);
        assert(!audit.hasZeroPrice, `${slug}: unavailable state fabricated zero`);
      }
      routeResults.push({ slug, support: fullCompanies.has(slug) ? 'full' : 'unavailable', ...audit, scriptRequestCount: new Set(requests).size, scripts: [...new Set(requests)], status: 'passed' });
      await context.close();
    }
  }
  await browser.close();
}

writeFileSync(join(artifactDir, 'browser-qa.json'), `${JSON.stringify({ baseUrl, results, routeResults }, null, 2)}\n`);
console.log(`✓ Valuation expectations browser QA ${results.length}개 viewport · 기업 route ${routeResults.length}개 · Chromium/WebKit · overflow 0 · console error 0`);

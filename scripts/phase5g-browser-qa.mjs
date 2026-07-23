import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const modules = process.env.CODEX_NODE_MODULES;
if (!modules) throw new Error('CODEX_NODE_MODULES is required');
const { chromium, webkit } = require(join(modules, 'playwright'));

const baseUrl = process.env.PHASE5G_BASE_URL ?? 'http://127.0.0.1:4173';
const root = process.cwd();
const artifactDir = join(root, 'artifacts', 'phase-5g-mobile-company-dissection');
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
    { companyId: 'us-semiconductors-nvidia', ticker: 'NVDA', market: 'NASDAQ', price: '207.40', close: '207.40', currency: 'USD', priceLabel: 'delayed', marketStatus: 'delayed', asOf: '2026-07-23T20:00:00.000Z', source: 'fixture', isDelayed: true },
  ],
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function installFixtures(page) {
  await page.route('**/api/market-prices**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(pricePayload) }));
}

async function audit(page) {
  return page.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    badText: /\b(?:undefined|NaN|Infinity)\b/.test(document.body.innerText),
    coreCards: document.querySelectorAll('.company-dissection-core-grid > article').length,
    axes: document.querySelectorAll('.company-radar-controls button').length,
    selectedAxes: document.querySelectorAll('.company-radar-controls button[aria-pressed="true"]').length,
    momentum: document.querySelectorAll('.company-market-momentum').length,
    watchItems: document.querySelectorAll('.company-next-watch li').length,
    touchTargets: [...document.querySelectorAll('.company-radar-controls button')].map((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }),
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
    await page.getByRole('heading', { level: 1, name: 'NVIDIA' }).waitFor();
    const metrics = await audit(page);
    assert(metrics.h1 === 1 && !metrics.overflow && !metrics.badText, `${engineName} ${viewport.width}: company base layout failed`);
    assert(metrics.coreCards === 4, `${engineName} ${viewport.width}: expected four core cards`);
    assert(metrics.axes === 5 && metrics.selectedAxes === 1, `${engineName} ${viewport.width}: five selectable axes missing`);
    assert(metrics.momentum === 1 && metrics.watchItems > 0 && metrics.watchItems <= 3, `${engineName} ${viewport.width}: momentum or watch list invalid`);
    assert(metrics.touchTargets.every(({ width, height }) => width >= 44 && height >= 44), `${engineName} ${viewport.width}: radar touch target below 44px`);

    const growthButton = page.getByRole('button', { name: /^성장성,/ });
    await growthButton.click();
    if (viewport.width <= 760) {
      const dialog = page.getByRole('dialog', { name: '성장성' });
      await dialog.waitFor();
      assert(await dialog.isVisible(), `${engineName} ${viewport.width}: bottom sheet did not open`);
      await dialog.getByRole('button', { name: /상세 닫기/ }).focus();
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'detached' });
      await page.waitForFunction(
        (label) => document.activeElement?.getAttribute('aria-label') === label,
        await growthButton.getAttribute('aria-label'),
      );
      assert(await growthButton.evaluate((element) => element === document.activeElement), `${engineName} ${viewport.width}: focus did not return to selected axis`);
    } else {
      assert(await page.getByRole('region', { name: '성장성' }).isVisible(), `${engineName} ${viewport.width}: desktop detail panel missing`);
    }
    assert(errors.length === 0, `${engineName} ${viewport.width}: ${errors.join(' | ')}`);
    if (engineName === 'chromium' && [1440, 390, 320].includes(viewport.width)) {
      await page.screenshot({ path: join(artifactDir, `nvidia-${engineName}-${viewport.width}x${viewport.height}.png`), fullPage: false });
    }
    results.push({ engine: engineName, route: 'nvidia-company', ...viewport, ...metrics, consoleErrors: errors.length, status: 'passed' });
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await installFixtures(page);
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${baseUrl}/ko/`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { level: 1 }).waitFor();
    await page.getByLabel('기업 찾기').fill('NVDA');
    const option = page.getByRole('option', { name: /NVIDIA/ });
    await option.waitFor();
    assert((await option.innerText()).includes('기업 해부 보기'), `${engineName}: search CTA missing`);
    await option.click();
    await page.getByRole('heading', { level: 1, name: 'NVIDIA' }).waitFor();
    assert(errors.length === 0, `${engineName} home search: ${errors.join(' | ')}`);
    results.push({ engine: engineName, route: 'home-search', width: 390, height: 844, overflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), consoleErrors: errors.length, status: 'passed' });
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${baseUrl}/ko/companies/nvidia/report`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { level: 1, name: /엔비디아 리서치 리포트/ }).waitFor();
    const reportAudit = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      brief: document.querySelectorAll('.research-report-brief').length,
      advanced: document.querySelectorAll('.research-report-advanced').length,
      duplicatedValuationTables: document.querySelectorAll('.research-scenario-grid,.research-sensitivity-grid,.research-distribution-card,.research-reverse-summary').length,
    }));
    assert(!reportAudit.overflow && reportAudit.brief === 1 && reportAudit.advanced === 1, `${engineName}: concise report structure failed`);
    assert(reportAudit.duplicatedValuationTables === 0, `${engineName}: valuation UI remains in report`);
    assert(errors.length === 0, `${engineName} report: ${errors.join(' | ')}`);
    results.push({ engine: engineName, route: 'nvidia-report', width: 1280, height: 800, ...reportAudit, consoleErrors: errors.length, status: 'passed' });
    await context.close();
  }
  await browser.close();
}

const manifest = JSON.parse(readFileSync(join(root, 'dist', '.vite', 'manifest.json'), 'utf8'));
const expectedDissectionAsset = `/${manifest['src/content/company-dissections/entries/nvidia.ts'].file}`;
const excludedDissectionAsset = `/${manifest['src/content/company-dissections/entries/meta.ts'].file}`;
const chunkBrowser = await chromium.launch({ headless: true });
const chunkContext = await chunkBrowser.newContext({ viewport: { width: 1280, height: 800 } });
const chunkPage = await chunkContext.newPage();
await installFixtures(chunkPage);
const scripts = [];
chunkPage.on('request', (request) => { if (request.resourceType() === 'script') scripts.push(new URL(request.url()).pathname); });
await chunkPage.goto(`${baseUrl}/ko/companies/nvidia`, { waitUntil: 'networkidle' });
assert(scripts.includes(expectedDissectionAsset), 'current company dissection chunk missing');
assert(!scripts.includes(excludedDissectionAsset), 'other company dissection chunk was preloaded');
results.push({ engine: 'chromium', route: 'company-dissection-chunk-boundary', expectedDissectionAsset, excludedDissectionAsset, scripts: [...new Set(scripts)], status: 'passed' });
await chunkContext.close();
await chunkBrowser.close();

const planUrl = pathToFileURL(join(root, 'docs', 'plans', 'phase-5g-mobile-company-dissection-plan.html')).href;
for (const [engineName, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch({ headless: true });
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 700 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto(planUrl);
    const planAudit = await page.evaluate(() => ({
      h1: document.querySelectorAll('h1').length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }));
    assert(planAudit.h1 === 1 && !planAudit.overflow, `${engineName} Plan ${viewport.width}: layout failed`);
    results.push({ engine: engineName, route: 'plan-html', ...viewport, ...planAudit, status: 'passed' });
    await context.close();
  }
  await browser.close();
}

writeFileSync(join(artifactDir, 'browser-qa.json'), `${JSON.stringify({ baseUrl, results }, null, 2)}\n`);
console.log(`✓ Phase 5G browser QA ${results.length}개 · Chromium/WebKit · 7 viewport · bottom sheet focus · Report boundary · overflow 0`);

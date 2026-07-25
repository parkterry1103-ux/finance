import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const modules = process.env.CODEX_NODE_MODULES;
if (!modules) throw new Error('CODEX_NODE_MODULES is required');
const { chromium, webkit } = require(join(modules, 'playwright'));

const baseUrl = process.env.PHASE5H_BASE_URL ?? 'http://127.0.0.1:4173';
const root = process.cwd();
const artifactDir = join(root, 'artifacts', 'phase-5h-content-publishing-archive');
mkdirSync(artifactDir, { recursive: true });

const viewports = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 375, height: 812 },
  { width: 320, height: 700 },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function watchErrors(page) {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function layoutAudit(page) {
  return page.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    badText: /\b(?:undefined|NaN|Infinity)\b/.test(document.body.innerText),
    hydrationWarnings: [...document.querySelectorAll('body *')].filter((element) => /hydration (?:failed|mismatch)/i.test(element.textContent ?? '')).length,
  }));
}

const results = [];
for (const [engineName, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch({ headless: true });

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = watchErrors(page);
    await page.goto(`${baseUrl}/ko/insights?tab=stock`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { level: 1, name: '콘텐츠 보관함' }).waitFor();
    const audit = await layoutAudit(page);
    const stockTab = page.getByRole('tab', { name: /주가해부/ });
    const wallStreetTab = page.getByRole('tab', { name: /월스트리트/ });
    assert(audit.h1 === 1 && !audit.overflow && !audit.badText, `${engineName} ${viewport.width}: archive layout failed`);
    assert(await stockTab.getAttribute('aria-selected') === 'true', `${engineName} ${viewport.width}: stock tab not selected`);
    assert(await wallStreetTab.getAttribute('aria-selected') === 'false', `${engineName} ${viewport.width}: wall tab incorrectly selected`);
    assert(await page.locator('#archive-panel-stock .editorial-stock-card').count() === 3, `${engineName} ${viewport.width}: Published stock count mismatch`);
    assert(await page.getByText('2026.07.25 발행').first().isVisible(), `${engineName} ${viewport.width}: published date missing`);
    assert(errors.length === 0, `${engineName} ${viewport.width}: ${errors.join(' | ')}`);
    results.push({ engine: engineName, route: 'archive-stock', ...viewport, ...audit, consoleErrors: errors.length, status: 'passed' });
    if (engineName === 'chromium' && [1440, 375, 320].includes(viewport.width)) {
      await page.screenshot({ path: join(artifactDir, `archive-stock-${viewport.width}x${viewport.height}.png`), fullPage: true });
    }
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = watchErrors(page);
    await page.goto(`${baseUrl}/ko/`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { level: 1 }).waitFor();
    assert(await page.locator('#today-dissections .editorial-stock-card').count() === 1, `${engineName}: home must show one stock item`);
    assert(await page.locator('.editorial-home-three .editorial-three-card').count() === 1, `${engineName}: home must show one Wall Street item`);
    assert(await page.getByRole('heading', { level: 3, name: '인텔, 왜 -7.892% 움직였을까?' }).isVisible(), `${engineName}: Intel not selected on home`);
    assert(await page.getByRole('heading', { level: 3, name: '비용을 낮추는 힘은 대체 가능성에서 나온다' }).isVisible(), `${engineName}: July 25 Wall Street not selected on home`);
    assert(await page.getByRole('link', { name: /지난 주가해부 보기/ }).getAttribute('href') === '/ko/insights?tab=stock', `${engineName}: stock archive deep link mismatch`);
    assert(await page.getByRole('link', { name: /지난 월스트리트 보기/ }).getAttribute('href') === '/ko/insights?tab=wall-street', `${engineName}: Wall Street archive deep link mismatch`);
    const audit = await layoutAudit(page);
    assert(!audit.overflow && errors.length === 0, `${engineName}: home layout or console failed`);
    results.push({ engine: engineName, route: 'home-latest', width: 375, height: 812, ...audit, consoleErrors: errors.length, status: 'passed' });
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1024, height: 768 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = watchErrors(page);
    await page.goto(`${baseUrl}/ko/insights?tab=stock`, { waitUntil: 'networkidle' });
    const search = page.getByRole('searchbox', { name: '기업명 또는 종목코드 검색' });
    for (const [query, expected] of [['Intel', 1], ['INTC', 1], ['  intc  ', 1], ['SMCI', 1], ['smci', 1]]) {
      await search.fill(query);
      assert(await page.locator('#archive-panel-stock .editorial-stock-card').count() === expected, `${engineName}: search failed for "${query}"`);
    }
    await search.fill('존재하지않는기업');
    assert(await page.getByRole('heading', { level: 3, name: '검색 결과가 없습니다.' }).isVisible(), `${engineName}: no-result state missing`);
    await page.getByRole('button', { name: '검색어 지우기' }).first().click();
    assert(await page.locator('#archive-panel-stock .editorial-stock-card').count() === 3, `${engineName}: clear search did not restore list`);

    await page.getByRole('tab', { name: /월스트리트/ }).click();
    await page.waitForURL('**/ko/insights?tab=wall-street');
    assert(await page.getByRole('tab', { name: /월스트리트/ }).getAttribute('aria-selected') === 'true', `${engineName}: Wall Street tab selection failed`);
    assert(await page.locator('#archive-panel-wall-street .editorial-three-card').count() === 4, `${engineName}: Published Wall Street count mismatch`);
    await page.reload({ waitUntil: 'networkidle' });
    assert(await page.getByRole('tab', { name: /월스트리트/ }).getAttribute('aria-selected') === 'true', `${engineName}: Wall Street tab did not survive reload`);
    await page.getByRole('tab', { name: /주가해부/ }).click();
    await page.waitForURL('**/ko/insights?tab=stock');
    await page.goBack({ waitUntil: 'networkidle' });
    assert(await page.getByRole('tab', { name: /월스트리트/ }).getAttribute('aria-selected') === 'true', `${engineName}: browser back did not restore Wall Street tab`);
    await page.goForward({ waitUntil: 'networkidle' });
    assert(await page.getByRole('tab', { name: /주가해부/ }).getAttribute('aria-selected') === 'true', `${engineName}: browser forward did not restore stock tab`);
    await page.goto(`${baseUrl}/ko/insights?tab=unknown`, { waitUntil: 'networkidle' });
    assert(await page.getByRole('tab', { name: /주가해부/ }).getAttribute('aria-selected') === 'true', `${engineName}: invalid tab did not fall back to stock`);
    assert(errors.length === 0, `${engineName} interactions: ${errors.join(' | ')}`);
    results.push({ engine: engineName, route: 'archive-interactions', width: 1024, height: 768, searches: 6, history: 'passed', invalidFallback: 'stock', consoleErrors: errors.length, status: 'passed' });
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = watchErrors(page);
    await page.goto(`${baseUrl}/ko/insights/stock/2026-07-25-intel-earnings-capex-reversal`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { level: 1, name: '인텔, 왜 -7.892% 움직였을까?' }).waitFor();
    assert(await page.getByRole('link', { name: '콘텐츠 보관함' }).getAttribute('href') === '/ko/insights?tab=stock', `${engineName}: Intel archive return link mismatch`);
    assert(await page.locator('a[href*="/ko/companies/intel"]').count() === 0, `${engineName}: unsupported Intel company CTA exists`);
    assert(!(await layoutAudit(page)).overflow, `${engineName}: Intel detail overflow`);
    await page.goto(`${baseUrl}/ko/insights/3reads/2026-07-25-switching-costs`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { level: 1, name: '비용을 낮추는 힘은 대체 가능성에서 나온다' }).waitFor();
    assert(await page.getByRole('link', { name: '콘텐츠 보관함' }).getAttribute('href') === '/ko/insights?tab=wall-street', `${engineName}: Wall Street archive return link mismatch`);
    assert(await page.locator('.editorial-read').count() === 3, `${engineName}: Wall Street detail must contain three reads`);
    assert(!(await layoutAudit(page)).overflow && errors.length === 0, `${engineName}: detail layout or console failed`);
    results.push({ engine: engineName, route: 'new-content-details', width: 375, height: 812, intelCompanyCta: 0, wallStreetReads: 3, consoleErrors: errors.length, status: 'passed' });
    await context.close();
  }

  await browser.close();
}

const planUrl = pathToFileURL(join(root, 'docs', 'plans', 'phase-5h-content-publishing-archive-plan.html')).href;
for (const [engineName, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch({ headless: true });
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto(planUrl);
    const audit = await layoutAudit(page);
    assert(audit.h1 === 1 && !audit.overflow, `${engineName} Plan ${viewport.width}: layout failed`);
    results.push({ engine: engineName, route: 'plan-html', ...viewport, ...audit, status: 'passed' });
    await context.close();
  }
  await browser.close();
}

const builtAssets = readdirSync(join(root, 'dist', 'assets'));
const intelChunk = builtAssets.find((file) => file.startsWith('2026-07-25-intel-earnings-capex-reversal-'));
const wallStreetChunk = builtAssets.find((file) => file.startsWith('2026-07-25-switching-costs-'));
assert(intelChunk && wallStreetChunk, 'new editorial lazy chunks missing from manifest');
writeFileSync(join(artifactDir, 'browser-qa.json'), `${JSON.stringify({ baseUrl, intelChunk, wallStreetChunk, results }, null, 2)}\n`);
console.log(`✓ Phase 5H browser QA ${results.length}개 · Chromium/WebKit · 5 viewport · search/history/deep link · overflow 0`);

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const playwrightEntry = process.env.PHASE5A_PLAYWRIGHT_ENTRY;
if (!playwrightEntry) throw new Error('PHASE5A_PLAYWRIGHT_ENTRY is required.');
const { chromium, webkit } = await import(playwrightEntry);
const browserEngine = process.env.PHASE5A_BROWSER_ENGINE ?? 'chromium';
const browserType = browserEngine === 'webkit' ? webkit : chromium;
const baseUrl = (process.env.PHASE5A_BASE_URL ?? 'http://127.0.0.1:4173').replace(/\/$/, '');
const outputRoot = join(process.cwd(), 'artifacts', 'phase-5a-editorial', browserEngine);

const viewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 768, height: 900 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
  { width: 320, height: 700 },
];

const routes = [
  '/ko/',
  '/ko/insights',
  '/ko/insights/stock/paypal-control-premium-draft',
  '/ko/insights/3reads/switching-power-draft',
  '/ko/companies',
  '/ko/companies/nvidia',
  '/ko/companies/nvidia/report',
  '/ko/companies/meta/report',
  '/ko/macro-dashboard',
];

const browser = await browserType.launch({ headless: true });
const results = [];
await mkdir(outputRoot, { recursive: true });

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  for (const route of routes) {
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.locator('h1').waitFor({ state: 'visible', timeout: 15_000 });
    await page.waitForTimeout(180);
    const metrics = await page.evaluate(() => ({
      title: document.title,
      h1Count: document.querySelectorAll('h1').length,
      bodyTextLength: document.body.innerText.trim().length,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      brokenImages: Array.from(document.images).filter((image) => image.complete && image.naturalWidth === 0).length,
      badText: /\b(?:undefined|NaN|Infinity)\b/.test(document.body.innerText),
      draftLeak: /PayPal|ASML|커넥티드카/.test(document.body.innerText),
    }));
    const routeResult = {
      engine: browserEngine,
      viewport,
      route,
      status: response?.status() ?? 0,
      ...metrics,
      consoleErrors,
      pageErrors,
    };
    results.push(routeResult);
    if (route === '/ko/' || route === '/ko/insights') {
      const safeRoute = route === '/ko/' ? 'home' : 'insights';
      await page.screenshot({ path: join(outputRoot, `${safeRoute}-${viewport.width}x${viewport.height}.png`), fullPage: true });
    }
    await page.close();
  }

  const searchPage = await context.newPage();
  await searchPage.goto(`${baseUrl}/ko/`, { waitUntil: 'domcontentloaded' });
  const search = searchPage.getByRole('combobox', { name: '기업 찾기' });
  await search.fill('NVDA');
  await search.press('ArrowDown');
  await search.press('Enter');
  await searchPage.waitForURL('**/ko/companies/nvidia', { timeout: 10_000 });
  await searchPage.locator('h1').waitFor({ state: 'visible', timeout: 15_000 });
  results.push({ engine: browserEngine, viewport, route: 'home-search', status: 200, title: await searchPage.title(), h1Count: await searchPage.locator('h1').count(), bodyTextLength: (await searchPage.locator('body').innerText()).length, scrollWidth: await searchPage.evaluate(() => document.documentElement.scrollWidth), clientWidth: await searchPage.evaluate(() => document.documentElement.clientWidth), brokenImages: 0, badText: false, draftLeak: false, consoleErrors: [], pageErrors: [] });
  await searchPage.close();
  await context.close();
}

await browser.close();

const failures = results.flatMap((result) => {
  const prefix = `${result.engine} ${result.viewport.width}x${result.viewport.height} ${result.route}`;
  const messages = [];
  if (result.status < 200 || result.status >= 400) messages.push(`${prefix}: HTTP ${result.status}`);
  if (result.h1Count !== 1) messages.push(`${prefix}: h1 ${result.h1Count}`);
  if (result.bodyTextLength < 40) messages.push(`${prefix}: body text ${result.bodyTextLength}`);
  if (result.scrollWidth > result.clientWidth + 1) messages.push(`${prefix}: overflow ${result.scrollWidth}/${result.clientWidth}`);
  if (result.brokenImages) messages.push(`${prefix}: broken images ${result.brokenImages}`);
  if (result.badText) messages.push(`${prefix}: undefined/NaN/Infinity visible`);
  if (result.draftLeak) messages.push(`${prefix}: draft example leaked`);
  if (result.consoleErrors.length) messages.push(`${prefix}: console ${result.consoleErrors.join(' | ')}`);
  if (result.pageErrors.length) messages.push(`${prefix}: page ${result.pageErrors.join(' | ')}`);
  return messages;
});

const summary = {
  generatedAt: new Date().toISOString(),
  engine: browserEngine,
  baseUrl,
  viewportCount: viewports.length,
  routeCount: routes.length,
  searchFlowCount: viewports.length,
  checkCount: results.length,
  failures,
  results,
};
await writeFile(join(outputRoot, 'browser-qa.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
if (failures.length) throw new Error(`Phase 5A ${browserEngine} QA failed:\n${failures.join('\n')}`);
console.log(`Phase 5A ${browserEngine} QA passed: ${results.length} checks, ${viewports.length} viewports, ${routes.length} routes, search ${viewports.length}`);

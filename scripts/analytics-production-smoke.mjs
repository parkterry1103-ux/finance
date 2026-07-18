import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const modules = process.env.CODEX_NODE_MODULES;
if (!modules) throw new Error('CODEX_NODE_MODULES is required');
const { chromium } = require(join(modules, 'playwright'));

const baseUrl = process.env.PHASE5F_PRODUCTION_URL ?? 'https://finance1-flax.vercel.app';
const companySlugs = ['nvidia', 'meta', 'sk-hynix', 'micron', 'dell', 'supermicro', 'eaton', 'lg-electronics', 'netflix'];
const routes = [
  '/ko/',
  '/ko/insights',
  '/ko/insights/3reads/2026-07-17-standards-set-price',
  '/ko/insights/3reads/2026-07-18-capital-gate-premium',
  '/ko/insights/stock/2026-07-18-netflix-guidance-disclosure-reset',
  '/ko/companies',
  ...companySlugs.map((slug) => `/ko/companies/${slug}`),
  '/ko/companies/nvidia/financials',
  '/ko/companies/meta/financials',
  '/ko/companies/netflix/financials',
  '/ko/companies/nvidia/valuation',
  '/ko/companies/meta/valuation',
  '/ko/companies/nvidia/report',
  '/ko/companies/meta/report',
  '/ko/macro-dashboard',
];

function assert(condition, message) {
  if (!condition) throw new Error(`Production analytics smoke failed: ${message}`);
}

const browser = await chromium.launch({ headless: true });
try {
  const analyticsContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const analyticsPage = await analyticsContext.newPage();
  const analyticsRequests = [];
  const analyticsResponses = [];
  const transportRequests = [];
  const browserErrors = [];
  analyticsPage.on('console', (message) => { if (message.type() === 'error' || message.type() === 'warning') browserErrors.push(`${message.type()}: ${message.text()}`); });
  analyticsPage.on('pageerror', (error) => browserErrors.push(`pageerror: ${error.message}`));
  analyticsPage.on('request', (request) => {
    if (['fetch', 'xhr', 'script'].includes(request.resourceType())) transportRequests.push({ url: request.url(), method: request.method(), type: request.resourceType(), body: request.postData() });
  });
  analyticsPage.on('request', (request) => {
    if (request.url().includes('/_vercel/insights/')) analyticsRequests.push({ url: request.url(), method: request.method(), body: request.postData() });
  });
  analyticsPage.on('response', (response) => {
    if (response.url().includes('/_vercel/insights/')) analyticsResponses.push({ url: response.url(), status: response.status() });
  });

  const landingUrl = `${baseUrl}/ko/?utm_source=instagram&utm_medium=social&utm_campaign=phase-5f-production-smoke&utm_content=profile-link`;
  const landingResponse = await analyticsPage.goto(landingUrl, { waitUntil: 'networkidle' });
  await analyticsPage.waitForTimeout(1_500);
  assert(landingResponse?.status() === 200, `landing returned ${landingResponse?.status()}`);
  const scriptResponse = analyticsResponses.find((entry) => entry.url.endsWith('/_vercel/insights/script.js'));
  const viewRequests = analyticsRequests.filter((entry) => /\/_vercel\/insights\/view(?:\?|$)/.test(entry.url));
  const runtimeState = await analyticsPage.evaluate(() => ({
    navigatorDnt: navigator.doNotTrack,
    webdriver: navigator.webdriver,
    headlessUserAgent: navigator.userAgent.includes('Headless'),
    windowDnt: window.doNotTrack,
    vaType: typeof window.va,
    vaq: window.vaq,
    script: document.querySelector('script[data-stock-autopsy-analytics]')?.dataset,
  }));
  assert(scriptResponse?.status === 200, 'Vercel analytics script was not 200');
  assert(runtimeState.webdriver || runtimeState.headlessUserAgent, 'smoke browser must not impersonate a real visitor');
  assert(viewRequests.length === 0, `Vercel bot policy should suppress automated pageviews, received ${viewRequests.length}`);
  assert(runtimeState.vaq?.filter((entry) => entry[0] === 'pageview').length === 1, `expected one queued manual pageview; runtime=${JSON.stringify(runtimeState)} errors=${JSON.stringify(browserErrors)} transport=${JSON.stringify(transportRequests)}`);
  assert(!JSON.stringify(runtimeState.vaq).includes('utm_') && !JSON.stringify(runtimeState.vaq).includes('phase-5f-production-smoke'), 'UTM or campaign leaked into queued provider pageview');
  await analyticsContext.close();

  const smokeContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await smokeContext.addInitScript(() => {
    Object.defineProperty(navigator, 'doNotTrack', { configurable: true, get: () => '1' });
    Object.defineProperty(window, 'doNotTrack', { configurable: true, get: () => '1' });
  });
  const smokePage = await smokeContext.newPage();
  const providerRequestsWithDnt = [];
  smokePage.on('request', (request) => {
    if (request.url().includes('/_vercel/insights/')) providerRequestsWithDnt.push(request.url());
  });
  for (const route of routes) {
    const response = await smokePage.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
    await smokePage.locator('h1').first().waitFor({ state: 'visible', timeout: 15_000 });
    const audit = await smokePage.evaluate(() => ({
      h1: document.querySelectorAll('h1').length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }));
    assert(response?.status() === 200, `${route} returned ${response?.status()}`);
    assert(audit.h1 === 1, `${route} has ${audit.h1} h1 elements`);
    assert(!audit.overflow, `${route} has horizontal overflow at 1280px`);
  }
  assert(providerRequestsWithDnt.length === 0, `Do Not Track produced ${providerRequestsWithDnt.length} provider requests`);
  await smokeContext.close();

  console.log(`✓ Production analytics smoke: ${routes.length} routes 200 · script 200 · manual pageview queue 1 · automated provider request 0 · UTM leak 0 · DNT provider request 0`);
} finally {
  await browser.close();
}

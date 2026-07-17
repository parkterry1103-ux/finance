import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const playwrightEntry = process.env.PHASE4C_PLAYWRIGHT_ENTRY;
if (!playwrightEntry) throw new Error('PHASE4C_PLAYWRIGHT_ENTRY is required.');
const { chromium, webkit } = await import(playwrightEntry);
const browserEngine = process.env.PHASE4C_BROWSER_ENGINE ?? 'chromium';
const browserType = browserEngine === 'webkit' ? webkit : chromium;
const baseUrl = process.env.PHASE4C_BASE_URL ?? 'http://127.0.0.1:4173';
const outputRoot = join(process.cwd(), 'artifacts', 'phase-4c-monte-carlo', 'browser-qa');
const viewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
  { width: 320, height: 700 },
];
const companies = ['nvidia', 'meta'];
const forbiddenTerms = ['주가 상승 확률', '수익 확률', '손실 확률', '목표주가', '적정주가 확정', '상승여력', '하락여력', 'BUY', 'HOLD', 'SELL'];

await mkdir(outputRoot, { recursive: true });
const browser = await browserType.launch({ headless: true });
const results = [];

for (const company of companies) {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const externalRequests = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.origin !== new URL(baseUrl).origin) externalRequests.push(request.url());
    });
    await page.goto(`${baseUrl}/ko/companies/${company}/report`, { waitUntil: 'networkidle' });
    await page.locator('#report-uncertainty').waitFor({ state: 'visible' });

    const beforeOpen = await page.evaluate((blocked) => {
      const marker = document.querySelector('.research-market-marker')?.getBoundingClientRect();
      const card = document.querySelector('.research-distribution-card')?.getBoundingClientRect();
      const summary = document.querySelector('.research-monte-carlo-method > summary')?.getBoundingClientRect();
      const loadedJsResources = (window.performance?.getEntriesByType('resource') ?? [])
        .map((entry) => entry.name)
        .filter((url) => /\.js(?:\?|$)/.test(url))
        .map((url) => url.split('/').pop());
      return {
        h1Count: document.querySelectorAll('h1').length,
        sectionCount: document.querySelectorAll('main > section').length,
        uncertaintyCount: document.querySelectorAll('#report-uncertainty').length,
        summaryCardCount: document.querySelectorAll('.research-uncertainty-summary article').length,
        quantileLabelCount: document.querySelectorAll('.research-distribution-labels > div').length,
        marketMarkerCount: document.querySelectorAll('.research-market-marker').length,
        marketPercentileCount: document.querySelectorAll('.research-market-percentile').length,
        distributionAlternativeCount: document.querySelectorAll('.research-distribution-alternative').length,
        driverCount: document.querySelectorAll('.research-uncertainty-diagnostics ol li').length,
        adjustmentCount: document.querySelectorAll('.research-distribution-adjustments article').length,
        methodologyOpenByDefault: document.querySelector('.research-monte-carlo-method')?.hasAttribute('open') ?? false,
        summaryTouchHeight: Math.round(summary?.height ?? 0),
        markerWithinCard: Boolean(marker && card && marker.left >= card.left - 1 && marker.right <= card.right + 1),
        documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        forbiddenTerms: blocked.filter((term) => document.body.innerText.includes(term)),
        loadedJsResources,
      };
    }, forbiddenTerms);

    await page.locator('.research-monte-carlo-method > summary').click();
    const afterOpen = await page.evaluate(() => ({
      methodologyOpen: document.querySelector('.research-monte-carlo-method')?.hasAttribute('open') ?? false,
      methodologyTableCount: document.querySelectorAll('.research-monte-carlo-method table').length,
      methodologyTablesValid: [...document.querySelectorAll('.research-monte-carlo-method table')].every((table) => table.querySelector('caption') && table.querySelectorAll('th').length > 0),
      tableRegions: [...document.querySelectorAll('.research-monte-carlo-table-scroll')].map((element) => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        keyboardFocusable: element.getAttribute('tabindex') === '0',
      })),
      documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      visibleText: document.querySelector('#report-uncertainty')?.textContent ?? '',
    }));
    await page.locator('#report-uncertainty').screenshot({ path: join(outputRoot, `${company}-${browserEngine}-${viewport.width}x${viewport.height}.png`) });
    results.push({ company, viewport, ...beforeOpen, ...afterOpen, consoleErrors, pageErrors, externalRequests: [...new Set(externalRequests)] });
    await context.close();
  }
}

await browser.close();

const failures = results.flatMap((result) => {
  const prefix = `${result.company} ${result.viewport.width}x${result.viewport.height}`;
  const otherCompany = result.company === 'nvidia' ? 'meta' : 'nvidia';
  const selectedChunks = result.loadedJsResources.filter((asset) => asset?.includes(result.company));
  return [
    result.h1Count === 1 ? null : `${prefix}: H1 ${result.h1Count}`,
    result.sectionCount === 15 ? null : `${prefix}: sections ${result.sectionCount}`,
    result.uncertaintyCount === 1 ? null : `${prefix}: uncertainty section ${result.uncertaintyCount}`,
    result.summaryCardCount === 3 ? null : `${prefix}: summary cards ${result.summaryCardCount}`,
    result.quantileLabelCount === 5 ? null : `${prefix}: quantile labels ${result.quantileLabelCount}`,
    result.marketMarkerCount === 1 && result.marketPercentileCount === 1 ? null : `${prefix}: market marker/percentile missing`,
    result.distributionAlternativeCount === 1 ? null : `${prefix}: text alternative missing`,
    result.driverCount === 5 ? null : `${prefix}: public driver count ${result.driverCount}`,
    result.adjustmentCount === 0 ? null : `${prefix}: empty/unsubstantiated adjustment cards`,
    !result.methodologyOpenByDefault && result.methodologyOpen ? null : `${prefix}: methodology disclosure state`,
    result.summaryTouchHeight >= 44 ? null : `${prefix}: methodology summary touch height ${result.summaryTouchHeight}`,
    result.methodologyTableCount === 2 && result.methodologyTablesValid ? null : `${prefix}: methodology table semantics`,
    result.tableRegions.every((region) => region.keyboardFocusable && region.scrollWidth >= region.clientWidth) ? null : `${prefix}: table scroll region`,
    result.markerWithinCard ? null : `${prefix}: current-price marker clipped`,
    result.documentOverflow === 0 ? null : `${prefix}: body overflow ${result.documentOverflow}`,
    result.forbiddenTerms.length === 0 ? null : `${prefix}: forbidden ${result.forbiddenTerms.join(', ')}`,
    /50,000|50\.000|5만/.test(result.visibleText) ? null : `${prefix}: iteration explanation missing`,
    selectedChunks.length >= 2 ? null : `${prefix}: report and Monte Carlo company chunks missing`,
    result.loadedJsResources.some((asset) => asset?.includes(otherCompany)) ? `${prefix}: other company chunk preloaded` : null,
    result.consoleErrors.length === 0 ? null : `${prefix}: console errors ${result.consoleErrors.join(' | ')}`,
    result.pageErrors.length === 0 ? null : `${prefix}: page errors ${result.pageErrors.join(' | ')}`,
    result.externalRequests.length === 0 ? null : `${prefix}: external runtime requests`,
  ].filter(Boolean);
});

const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  browser: `Playwright ${browserEngine}`,
  viewportCount: viewports.length,
  reportCount: companies.length,
  checks: results.length,
  failures,
  results,
};
await writeFile(join(outputRoot, `browser-qa-${browserEngine}.json`), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
console.log(`Phase 4C ${browserEngine} QA: ${results.length} checks, ${failures.length} failures`);
if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
}

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const playwrightEntry = process.env.PHASE4B_PLAYWRIGHT_ENTRY;
if (!playwrightEntry) throw new Error('PHASE4B_PLAYWRIGHT_ENTRY is required.');
const { chromium, webkit } = await import(playwrightEntry);
const browserEngine = process.env.PHASE4B_BROWSER_ENGINE ?? 'chromium';
const browserType = browserEngine === 'webkit' ? webkit : chromium;

const baseUrl = process.env.PHASE4B_BASE_URL ?? 'http://127.0.0.1:5173';
const outputRoot = join(process.cwd(), 'artifacts', 'phase-4b-research-report');
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
const forbiddenTerms = ['BUY', 'HOLD', 'SELL', '목표주가', '적정주가', '상승여력', '하락여력', '적극 매수', '추천 종목', '유망주', '급등주', '수익 보장', '확실한 상승', '저평가 확정', '고평가 확정', '인쇄·PDF 저장', 'PDF 다운로드'];

for (const directory of ['desktop', 'mobile']) {
  await mkdir(join(outputRoot, directory), { recursive: true });
}

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
    const metrics = await page.evaluate((blocked) => {
      const headings = [...document.querySelectorAll('h1,h2,h3')].map((element) => ({
        level: Number(element.tagName[1]),
        text: element.textContent?.trim() ?? '',
      }));
      const visibleTargets = [...document.querySelectorAll('.research-report-main a,.research-report-main button,.research-report-main summary,[tabindex="0"]')]
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return { text: element.textContent?.trim().slice(0, 40) ?? '', width: Math.round(rect.width), height: Math.round(rect.height), visible: rect.width > 0 && rect.height > 0 };
        })
        .filter((target) => target.visible);
      return {
        title: document.title,
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        h1Count: document.querySelectorAll('h1').length,
        sectionCount: document.querySelectorAll('main > section').length,
        headingJumps: headings.slice(1).filter((heading, index) => heading.level - headings[index].level > 1),
        chartCount: document.querySelectorAll('svg[role="img"][aria-label]').length,
        tablesValid: [...document.querySelectorAll('table')].every((table) => table.querySelector('caption') && table.querySelectorAll('th').length > 0),
        documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        sensitivityRegions: [...document.querySelectorAll('.research-sensitivity-scroll')].map((element) => ({
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
          keyboardFocusable: element.getAttribute('tabindex') === '0',
        })),
        smallTouchTargets: visibleTargets.filter((target) => target.width < 44 || target.height < 44),
        forbiddenTerms: blocked.filter((term) => document.body.innerText.includes(term)),
        sourceCount: document.querySelectorAll('.research-source-list li').length,
        evidenceBadgeCount: document.querySelectorAll('.evidence-fact,.evidence-calculation,.evidence-interpretation,.research-evidence-ledger').length,
        printActionCount: [...document.querySelectorAll('button,a')].filter((element) => /인쇄|PDF 저장|PDF 다운로드/.test(element.textContent ?? '')).length,
        judgmentCount: document.querySelectorAll('.research-judgment-grid article').length,
        newsCount: document.querySelectorAll('.research-news-list > article').length,
        moatCount: document.querySelectorAll('.research-moat-list article').length,
        financialMetricCount: document.querySelectorAll('.research-metric-grid article').length,
        scenarioCount: document.querySelectorAll('.research-scenario-grid article').length,
        baseCellCount: document.querySelectorAll('.research-sensitivity-base').length,
        narrowParagraphs: [...document.querySelectorAll('.research-paragraph,.research-news-body dd,.research-moat-list dd')].filter((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return rect.width < 120 || style.writingMode !== 'horizontal-tb';
        }).length,
        loadedScripts: [...document.scripts].map((script) => script.src).filter(Boolean).map((url) => url.split('/').pop()),
        loadedJsResources: (window.performance?.getEntriesByType('resource') ?? [])
          .map((entry) => entry.name)
          .filter((url) => /(?:\.js|\.tsx?|\/client)(?:\?|$)/.test(url))
          .map((url) => url.split('/').pop()),
      };
    }, forbiddenTerms);
    const directory = viewport.width >= 1024 ? 'desktop' : 'mobile';
    await page.screenshot({ path: join(outputRoot, directory, `${company}-${browserEngine}-${viewport.width}x${viewport.height}.png`), fullPage: false });
    results.push({ company, viewport, ...metrics, consoleErrors, pageErrors, externalRequests: [...new Set(externalRequests)] });
    await context.close();
  }

}

await browser.close();

const failures = results.flatMap((result) => {
  const prefix = `${result.company} ${result.viewport.width}x${result.viewport.height}`;
  return [
    result.h1Count === 1 ? null : `${prefix}: H1 ${result.h1Count}`,
    result.sectionCount === 14 ? null : `${prefix}: sections ${result.sectionCount}`,
    result.headingJumps.length === 0 ? null : `${prefix}: heading jump`,
    result.chartCount === 3 ? null : `${prefix}: charts ${result.chartCount}`,
    result.tablesValid ? null : `${prefix}: invalid table semantics`,
    result.documentOverflow === 0 ? null : `${prefix}: body overflow ${result.documentOverflow}`,
    result.sensitivityRegions.every((region) => region.keyboardFocusable) ? null : `${prefix}: sensitivity keyboard access`,
    result.smallTouchTargets.length === 0 ? null : `${prefix}: ${result.smallTouchTargets.length} small touch targets`,
    result.forbiddenTerms.length === 0 ? null : `${prefix}: forbidden ${result.forbiddenTerms.join(', ')}`,
    result.evidenceBadgeCount === 0 ? null : `${prefix}: evidence badges ${result.evidenceBadgeCount}`,
    result.printActionCount === 0 ? null : `${prefix}: print actions ${result.printActionCount}`,
    result.judgmentCount === 4 ? null : `${prefix}: judgments ${result.judgmentCount}`,
    result.newsCount > 0 && result.newsCount <= 3 ? null : `${prefix}: news ${result.newsCount}`,
    result.moatCount >= 3 ? null : `${prefix}: moat ${result.moatCount}`,
    result.financialMetricCount >= 6 ? null : `${prefix}: financial metrics ${result.financialMetricCount}`,
    result.scenarioCount === 3 ? null : `${prefix}: scenarios ${result.scenarioCount}`,
    result.baseCellCount === 2 ? null : `${prefix}: base cells ${result.baseCellCount}`,
    result.narrowParagraphs === 0 ? null : `${prefix}: narrow paragraphs ${result.narrowParagraphs}`,
    result.consoleErrors.length === 0 ? null : `${prefix}: console errors`,
    result.pageErrors.length === 0 ? null : `${prefix}: page errors`,
    result.externalRequests.length === 0 ? null : `${prefix}: external runtime requests`,
    result.loadedJsResources.some((asset) => asset?.includes(result.company)) ? null : `${prefix}: selected company chunk missing`,
    result.loadedJsResources.some((asset) => asset?.includes(result.company === 'nvidia' ? 'meta' : 'nvidia')) ? `${prefix}: other company chunk preloaded` : null,
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
await writeFile(join(outputRoot, browserEngine === 'chromium' ? 'browser-qa.json' : `browser-qa-${browserEngine}.json`), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
console.log(`Phase 4B ${browserEngine} QA: ${results.length} checks, ${failures.length} failures`);
if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
}

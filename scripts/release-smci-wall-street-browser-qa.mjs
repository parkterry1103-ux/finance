import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const modules = process.env.CODEX_NODE_MODULES;
if (!modules) throw new Error('CODEX_NODE_MODULES is required');
const { chromium, webkit } = require(join(modules, 'playwright'));

const baseUrl = process.env.RELEASE_BASE_URL ?? 'http://127.0.0.1:4173';
const root = process.cwd();
const artifactDir = join(root, 'artifacts', 'release-2026-07-23-smci-wall-street');
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

const routes = [
  {
    id: 'smci-stock-dissection',
    path: '/ko/insights/stock/2026-07-22-smci-orders-margin',
    h1: 'SMCI +19.843%, 600억달러 주문보다 중요했던 마진 회복',
    requiredText: ['Owner Verified', '20.409%p', '분석에 사용한 자료', 'Super Micro Computer, Inc.'],
  },
  {
    id: 'wall-street-july-23',
    path: '/ko/insights/3reads/2026-07-23-option-cost',
    h1: '선택권은 공짜가 아니다',
    requiredText: ['장기금리가 청구하는 선택 비용', '매각을 미룬 대가가 LP에 쌓인다', '농축 선택권과 검증 비용', '제휴·후원 관계가 없습니다'],
  },
  {
    id: 'supermicro-company',
    path: '/ko/companies/supermicro',
    h1: 'Supermicro',
    requiredText: ['네 가지 핵심 카드', '오각형 기업 해부', '최근 사건이 무엇을 다시 보게 했나요?', '숫자와 비교'],
  },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const results = [];
for (const [engineName, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch({ headless: true });
  for (const viewport of viewports) {
    for (const route of routes) {
      const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [];
      page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('pageerror', (error) => errors.push(error.message));

      const response = await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' });
      await page.getByRole('heading', { level: 1, name: route.h1 }).waitFor();
      const audit = await page.evaluate((requiredText) => {
        const text = document.body.innerText;
        return {
          h1: document.querySelectorAll('h1').length,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          badText: /\b(?:undefined|NaN|Infinity)\b/.test(text),
          missingText: requiredText.filter((entry) => !text.includes(entry)),
        };
      }, route.requiredText);

      assert(response?.ok(), `${engineName} ${viewport.width} ${route.id}: HTTP ${response?.status()}`);
      assert(audit.h1 === 1, `${engineName} ${viewport.width} ${route.id}: expected one h1`);
      assert(!audit.overflow, `${engineName} ${viewport.width} ${route.id}: horizontal overflow`);
      assert(!audit.badText, `${engineName} ${viewport.width} ${route.id}: invalid numeric text`);
      assert(audit.missingText.length === 0, `${engineName} ${viewport.width} ${route.id}: missing ${audit.missingText.join(', ')}`);
      assert(errors.length === 0, `${engineName} ${viewport.width} ${route.id}: ${errors.join(' | ')}`);

      if (engineName === 'chromium' && [1440, 390, 320].includes(viewport.width)) {
        await page.screenshot({
          path: join(artifactDir, `${route.id}-${viewport.width}x${viewport.height}.png`),
          fullPage: false,
        });
      }
      results.push({ engine: engineName, route: route.id, ...viewport, ...audit, consoleErrors: errors.length, status: 'passed' });
      await context.close();
    }
  }
  await browser.close();
}

const planUrl = pathToFileURL(join(root, 'docs', 'plans', 'release-2026-07-23-smci-wall-street-plan.html')).href;
for (const [engineName, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch({ headless: true });
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 700 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto(planUrl);
    const audit = await page.evaluate(() => ({
      h1: document.querySelectorAll('h1').length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }));
    assert(audit.h1 === 1 && !audit.overflow, `${engineName} Plan ${viewport.width}: layout failed`);
    results.push({ engine: engineName, route: 'plan-html', ...viewport, ...audit, status: 'passed' });
    await context.close();
  }
  await browser.close();
}

writeFileSync(join(artifactDir, 'browser-qa.json'), `${JSON.stringify({ baseUrl, results }, null, 2)}\n`);
console.log(`✓ SMCI·월스트리트 릴리스 브라우저 QA ${results.length}개 · Chromium/WebKit · 7 viewport · overflow 0 · console error 0`);

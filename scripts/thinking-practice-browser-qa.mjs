import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
if (!process.env.CODEX_NODE_MODULES) throw new Error('CODEX_NODE_MODULES is required');
const { chromium, webkit } = require(join(process.env.CODEX_NODE_MODULES, 'playwright'));
const baseUrl = process.env.THINKING_PRACTICE_BASE_URL ?? 'http://127.0.0.1:4173';
const artifactDir = join(process.cwd(), 'artifacts', 'thinking-practice');
mkdirSync(artifactDir, { recursive: true });
const path = '/ko/lab/cases/practice-2026-07-25-intel-earnings-capex-reversal';
const latestPath = '/ko/lab/cases/practice-2026-11-06-intel-market-industry-risk';
const smciPath = '/ko/lab/cases/practice-2026-07-22-smci-orders-margin';
const key = 'stock-autopsy:thinking-journal:v1:stock-2026-07-25-intel-earnings-capex-reversal';
const initialText = '처음에는 기업 요인으로 보았다. 개인 메모 TEST-PRIVATE-001';
const results = [];
const requestedEngines = (process.env.THINKING_PRACTICE_ENGINES ?? 'chromium,webkit').split(',');
function assert(condition, message) { if (!condition) throw new Error(message); }
async function audit(page) {
  return page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    h1: document.querySelectorAll('h1').length,
    outside: [...document.querySelectorAll('.thinking-practice-story button,.thinking-practice-story textarea,.thinking-practice-returns article,.thinking-practice-factors label')].filter((element) => { const r = element.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > document.documentElement.clientWidth + 1); }).length,
  }));
}
async function initial(page) {
  await page.locator('input[name="initial-factor"][value="company"]').check();
  await page.getByLabel('왜 그렇게 생각했나요?').fill(initialText);
  await page.getByRole('button', { name: '최초 판단 저장하고 근거 점검' }).click();
  await page.getByRole('heading', { level: 1, name: '내 설명에서 빠진 것은 무엇일까요?' }).waitFor();
}
async function fillReview(page, rationale = '업종 약세도 있어 복합 요인으로 수정했다.') {
  await page.locator('input[name="review-factor"][value="mixed"]').check();
  await page.getByLabel('확인한 근거와 그 시점').fill('2026-07-24 S&P 500과 SOXX, 회사 발표를 대조했다.');
  await page.getByLabel('판단을 유지하거나 바꾼 이유').fill(rationale);
  await page.getByLabel('다른 가능한 설명 · 선택').fill('기대가 이미 반영되었을 수 있다.');
  await page.getByLabel('무엇을 확인하면 생각을 바꾸겠나요? · 선택').fill('후속 실적과 현금흐름을 확인한다.');
  await page.getByLabel('다른 기업에 미칠 영향 가설 · 선택').fill('경쟁사의 수요 이동 여부는 아직 확인하지 못했다.');
}

for (const [engineName, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  if (!requestedEngines.includes(engineName)) continue;
  console.log(`Starting ${engineName} practice QA`);
  const executablePath = engineName === 'chromium' ? process.env.CHROMIUM_EXECUTABLE_PATH : process.env.WEBKIT_EXECUTABLE_PATH;
  const browser = await engine.launch({ headless: true, timeout: 20000, ...(executablePath ? { executablePath } : {}) });
  for (const viewport of [{ width: 1280, height: 844 }, { width: 390, height: 844 }, { width: 360, height: 800 }, { width: 320, height: 700 }, { width: 640, height: 800 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = []; const apiRequests = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', (request) => { if (request.url().includes('/api/')) apiRequests.push(request.url()); });
    const oldResponse = await page.goto(`${baseUrl}/ko/insights/stock/2026-07-25-intel-earnings-capex-reversal`, { waitUntil: 'networkidle' });
    assert(oldResponse.status() === 200, 'old Intel route must remain available');
    await page.getByRole('heading', { name: '인텔, 왜 -7.892% 움직였을까?', level: 1 }).waitFor();
    const latestLink = page.getByRole('link', { name: /기준 최신 INTC 분석 보기/ });
    await latestLink.focus();
    await latestLink.press('Enter');
    await page.waitForURL('**/ko/insights/stock/2026-11-06-intel-market-industry-risk');
    await page.getByRole('heading', { name: '인텔 -10.33%, 기업 문제만으로 볼 수 있을까?', level: 1 }).waitFor();
    assert(await page.getByRole('heading', { name: '시장 전체 요인', exact: true }).isVisible(), 'market heading missing');
    assert(await page.getByRole('heading', { name: '산업 요인', exact: true }).count() === 1 && await page.getByRole('heading', { name: '기업 개별 요인', exact: true }).count() === 1, 'industry/company factors must be separate');
    const articleText = await page.locator('main').innerText();
    assert(articleText.includes('+1.82%p') && articleText.includes('-5.92%p') && articleText.includes('3대 1 분할'), 'relative returns or split basis missing');
    assert(articleText.includes('출처 대조 · AI 보조') && !articleText.includes('Owner Verified'), 'new article must not claim owner review');
    const articleAudit = await page.evaluate(() => ({
      overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      clipped: [...document.querySelectorAll('.editorial-price-panel strong,.editorial-factor-grid article,.editorial-update-notice a')].filter((element) => element.scrollWidth > element.clientWidth + 1).length,
      brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
      h1: document.querySelectorAll('h1').length,
    }));
    assert(articleAudit.overflow === 0 && articleAudit.clipped === 0 && articleAudit.brokenImages === 0 && articleAudit.h1 === 1, `latest article layout failed: ${JSON.stringify(articleAudit)}`);
    assert(await page.locator('.editorial-detail-header time').first().evaluate((element) => getComputedStyle(element).color !== 'rgb(198, 209, 204)'), 'price basis date must not retain the pale text from the old dark hero');
    await page.screenshot({ path: join(artifactDir, `${engineName}-${viewport.width}-intel-latest.png`), fullPage: true });
    const articleApiRequests = [...apiRequests];
    assert(articleApiRequests.length <= 1 && articleApiRequests.every((url) => new URL(url).pathname === '/api/market-prices'), 'article must only retain the existing single market preload');
    apiRequests.length = 0;
    await page.goto(`${baseUrl}${latestPath}`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: '인텔 -10.33%, 기업 문제만으로 볼 수 있을까?', level: 1 }).waitFor();
    assert(await page.locator('.thinking-practice-returns article').count() === 3, 'latest case must have three comparable returns');
    assert((await page.locator('.thinking-practice-returns').innerText()).includes('-12.15%'), 'latest case must not use July prices');
    await initial(page);
    await page.getByText('관련 해설 살펴보기', { exact: true }).click();
    for (const name of ['시장 전체 요인', '산업 요인', '기업 개별 요인']) assert(await page.getByRole('heading', { name, exact: true }).count() === 1, `latest case missing ${name}`);
    assert((await audit(page)).overflow === 0 && (await audit(page)).outside === 0, 'latest case mobile layout failed');
    assert(await page.evaluate((oldKey) => localStorage.getItem(oldKey), key) === null, 'new case must not write to old Intel journal');
    assert(errors.length === 0 && apiRequests.length === 0, `latest Intel errors/requests: ${JSON.stringify({ errors, apiRequests })}`);
    results.push({ engine: engineName, route: 'intel-latest-and-old-preserved', ...viewport, ...articleAudit, caseOverflow: 0, consoleErrors: 0, articleExistingMarketRequests: articleApiRequests.length, caseApiRequests: 0, keyboardLatestLink: 'passed', threeFactors: 'passed', journalIsolation: 'passed' });
    await context.close();
  }
  for (const viewport of [{ width: 1280, height: 844 }, { width: 390, height: 844 }, { width: 360, height: 800 }, { width: 320, height: 700 }, { width: 640, height: 800 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = []; const apiRequests = []; const leakedNotes = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', (request) => {
      if (request.url().includes('/api/')) apiRequests.push(request.url());
      if (`${request.url()} ${request.postData() ?? ''}`.includes('TEST-PRIVATE-001')) leakedNotes.push(request.url());
    });
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: '인텔, 왜 -7.892% 움직였을까?', level: 1 }).waitFor();
    assert(await page.getByRole('button', { name: '2 근거 점검' }).isDisabled(), `${engineName}: first response can be bypassed`);
    assert(await page.locator('.thinking-practice-returns article').count() === 3, 'comparison must contain company, market, sector');
    assert(await page.locator('.thinking-practice-editorial').count() === 0, 'editorial explanation must not precede initial response');
    assert((await audit(page)).overflow === 0, `${engineName} ${viewport.width}: initial overflow`);
    await page.getByLabel('왜 그렇게 생각했나요?').fill('키보드 편집 확인');
    await page.getByLabel('왜 그렇게 생각했나요?').press('Home');
    assert(await page.locator('button[aria-current="step"]').textContent() === '1내 판단', 'textarea navigation must not change stage');
    await page.screenshot({ path: join(artifactDir, `${engineName}-${viewport.width}-initial.png`), fullPage: true });
    await initial(page);
    assert(await page.locator('h1').evaluate((element) => element === document.activeElement), 'stage change must focus heading');
    await page.getByText('같은 업종도 비슷하게 움직였나요?', { exact: true }).click();
    await page.locator('#practice-question-peers').fill('업종 비교가 필요하다.');
    await page.getByText('관련 해설 살펴보기', { exact: true }).click();
    await fillReview(page);
    assert((await audit(page)).overflow === 0 && (await audit(page)).outside === 0, `${engineName} ${viewport.width}: review form overflow`);
    await page.getByRole('button', { name: '재검토 저장하고 돌아보기' }).click();
    await page.getByRole('heading', { name: '무슨 근거로 생각을 고쳤나요?', level: 1 }).waitFor();
    assert(await page.locator('.thinking-practice-history li').count() === 2, 'initial and review must coexist');
    assert((await page.locator('.thinking-practice-history').textContent()).includes(initialText), 'initial response was lost');
    const saved = await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)), key);
    assert(saved.initial.factor === 'company' && saved.reviews[0].factor === 'mixed', 'factor revision not persisted');
    assert(saved.reviews[0].checks.peers === '업종 비교가 필요하다.', 'question notes must be saved with review');
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: '무슨 근거로 생각을 고쳤나요?', level: 1 }).waitFor();
    assert(await page.locator('.thinking-practice-history li').count() === 2, 'history must survive reload');
    for (const [button, extension] of [['텍스트 내려받기', 'txt'], ['JSON 내려받기', 'json']]) {
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: button, exact: true }).click();
      const download = await downloadPromise;
      const local = join(artifactDir, `${engineName}-${viewport.width}.${extension}`);
      await download.saveAs(local);
      const text = readFileSync(local, 'utf8');
      assert(text.includes(initialText) && text.includes('업종 약세'), 'export must contain first and revised reasoning');
    }
    const layout = await audit(page);
    assert(layout.overflow === 0 && layout.outside === 0 && layout.h1 === 1, `${engineName} ${viewport.width}: history layout failed`);
    await page.screenshot({ path: join(artifactDir, `${engineName}-${viewport.width}-history.png`), fullPage: true });
    await page.getByRole('link', { name: '내 기록 모아보기', exact: true }).click();
    await page.waitForURL('**/ko/records');
    await page.getByRole('heading', { name: '내 기록', exact: true, level: 1 }).waitFor();
    await page.locator('.journal-archive-list article').first().waitFor();
    assert(await page.locator('.journal-archive-list article').count() === 1, 'saved case must appear in archive');
    assert(await page.locator('.primary-navigation a[href="/ko/records"]').getAttribute('aria-current') === 'page', 'archive navigation must be current');
    await page.getByRole('button', { name: '재검토 전', exact: true }).click();
    await page.getByRole('heading', { name: '조건에 맞는 기록이 없습니다.' }).waitFor();
    await page.getByRole('button', { name: '검색·필터 초기화' }).click();
    await page.getByRole('searchbox', { name: '기업명·사건명 검색' }).fill('  intc  ');
    assert(await page.locator('.journal-archive-list article').count() === 1, 'archive ticker search must be case insensitive');
    await page.getByRole('searchbox', { name: '기업명·사건명 검색' }).fill('no-such-company');
    await page.getByRole('heading', { name: '조건에 맞는 기록이 없습니다.' }).waitFor();
    await page.getByRole('button', { name: '검색·필터 초기화' }).click();
    const archiveLayout = await audit(page);
    assert(archiveLayout.overflow === 0 && archiveLayout.h1 === 1, `${engineName} ${viewport.width}: archive overflow`);
    await page.screenshot({ path: join(artifactDir, `${engineName}-${viewport.width}-archive.png`), fullPage: true });
    const backupDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: '전체 백업', exact: true }).click();
    await (await backupDownload).saveAs(join(artifactDir, `${engineName}-${viewport.width}-backup.json`));
    await page.getByRole('link', { name: '기록 이어서 보기', exact: true }).click();
    await page.getByRole('heading', { name: '무슨 근거로 생각을 고쳤나요?', level: 1 }).waitFor();
    await page.goto(`${baseUrl}${smciPath}`, { waitUntil: 'networkidle' });
    await page.getByLabel('왜 그렇게 생각했나요?').waitFor();
    assert(await page.locator('.thinking-practice-history').count() === 0, 'case history leaked into another case');
    await page.goBack({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: '이 사례 기록 초기화' }).click();
    await page.getByRole('button', { name: '취소', exact: true }).click();
    assert(await page.locator('.thinking-practice-history li').count() === 2, 'cancel must preserve history');
    await page.getByRole('button', { name: '이 사례 기록 초기화' }).click();
    await page.getByRole('button', { name: '이 사례 기록 지우기', exact: true }).click();
    await page.getByLabel('왜 그렇게 생각했나요?').waitFor();
    assert(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key) === null, 'confirmed reset must delete only the case record');
    assert(errors.length === 0 && apiRequests.length === 0 && leakedNotes.length === 0, `${engineName}: errors/requests/privacy ${JSON.stringify({ errors, apiRequests, leakedNotes })}`);
    results.push({ engine: engineName, ...viewport, ...layout, errors: errors.length, apiRequests: apiRequests.length, leakedNotes: leakedNotes.length, flow: 'passed' });
    console.log(`✓ ${engineName} ${viewport.width}px: save/reload/export/reset, overflow 0`);
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  await page.evaluate((storageKey) => localStorage.setItem(storageKey, '{broken'), key);
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('alert').waitFor();
  assert(await page.getByRole('button', { name: '최초 판단 저장하고 근거 점검' }).isDisabled(), 'corrupt record must not be overwritten');
  assert(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key) === '{broken', 'corrupt raw record must remain untouched');
  await page.getByRole('button', { name: '이 사례 기록 초기화' }).click();
  await page.getByRole('button', { name: '이 사례 기록 지우기', exact: true }).click();
  await initial(page);
  await fillReview(page);
  await page.evaluate((storageKey) => { const record = JSON.parse(localStorage.getItem(storageKey)); record.initial.rationale = '다른 탭에서 변경한 기록'; localStorage.setItem(storageKey, JSON.stringify(record)); }, key);
  await page.getByRole('button', { name: '재검토 저장하고 돌아보기' }).click();
  assert((await page.getByRole('status').textContent()).includes('다른 탭'), 'stale save conflict must be shown');
  assert(await page.getByLabel('판단을 유지하거나 바꾼 이유').inputValue() === '업종 약세도 있어 복합 요인으로 수정했다.', 'conflict must keep draft');
  const tab2 = await context.newPage();
  await tab2.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '재검토 저장하고 돌아보기' }).click();
  await page.getByRole('heading', { name: '무슨 근거로 생각을 고쳤나요?', level: 1 }).waitFor();
  await tab2.getByText('다른 탭의 저장 변경을 불러왔습니다.', { exact: false }).waitFor();
  assert(await tab2.locator('.thinking-practice-history li').count() === 2, 'other tab must reflect appended review');
  await page.goto(`${baseUrl}/ko/lab/cases/practice-does-not-exist`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: '공개된 사건을 찾을 수 없습니다.' }).waitFor();
  await page.goto(`${baseUrl}/ko/lab/cases/pilot-001`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { level: 1, name: '콘텐츠 보관함' }).waitFor();
  await page.waitForURL('**/ko/insights?tab=stock');
  await page.goto(`${baseUrl}/ko/`, { waitUntil: 'networkidle' });
  assert(!/Rulebook|RULE-\d|Investment Thinking Lab|연습 도구|현재 원칙/.test(await page.locator('body').innerText()), 'internal framing must not be visible on home');
  await page.getByRole('link', { name: '내 생각 기록하기' }).click();
  await page.waitForURL(`**${latestPath}`);
  await page.getByRole('heading', { name: '인텔 -10.33%, 기업 문제만으로 볼 수 있을까?', level: 1 }).waitFor();
  results.push({ engine: engineName, corruptStorage: 'passed', conflict: 'passed', crossTab: 'passed', invalidRoute: 'passed', pilotRetired: 'passed', homeEntry: 'passed' });
  await context.close();

  const restoredContext = await browser.newContext({ viewport: { width: 320, height: 700 } });
  const restoredPage = await restoredContext.newPage();
  const archiveErrors = []; const archiveRequests = [];
  restoredPage.on('pageerror', (error) => archiveErrors.push(error.message));
  restoredPage.on('console', (message) => { if (message.type() === 'error') archiveErrors.push(message.text()); });
  restoredPage.on('request', (request) => { if (request.url().includes('/api/')) archiveRequests.push(request.url()); });
  await restoredPage.goto(`${baseUrl}/ko/records`, { waitUntil: 'networkidle' });
  await restoredPage.getByRole('heading', { name: '아직 남긴 기록이 없습니다.' }).waitFor();
  const upload = restoredPage.locator('input[type="file"]');
  await upload.setInputFiles(join(artifactDir, `${engineName}-1280-backup.json`));
  await restoredPage.getByRole('heading', { name: '불러올 기록 확인' }).waitFor();
  assert(await restoredPage.evaluate((storageKey) => localStorage.getItem(storageKey), key) === null, 'import preview must not write before confirmation');
  await restoredPage.getByRole('button', { name: '취소', exact: true }).click();
  await restoredPage.waitForFunction(() => document.activeElement?.tagName === 'BUTTON' && document.activeElement.textContent?.includes('백업 불러오기'), undefined, { timeout: 3000 });
  assert(await restoredPage.getByRole('button', { name: '백업 불러오기', exact: true }).evaluate((element) => element === document.activeElement), 'cancelled import must return focus to upload trigger');
  assert(await restoredPage.evaluate((storageKey) => localStorage.getItem(storageKey), key) === null, 'cancelled import must not write');
  await upload.setInputFiles(join(artifactDir, `${engineName}-1280-backup.json`));
  await restoredPage.getByRole('button', { name: '확인하고 복원', exact: true }).click();
  assert((await restoredPage.locator('.journal-archive-status').textContent()).includes('1건 복원'), 'fresh browser restore must succeed');
  await restoredPage.waitForFunction(() => document.activeElement?.tagName === 'BUTTON' && document.activeElement.textContent?.includes('백업 불러오기'), undefined, { timeout: 3000 });
  assert(await restoredPage.getByRole('button', { name: '백업 불러오기', exact: true }).evaluate((element) => element === document.activeElement), 'completed import must return focus to upload trigger');
  const originalImported = await restoredPage.evaluate((storageKey) => localStorage.getItem(storageKey), key);
  await upload.setInputFiles(join(artifactDir, `${engineName}-1280.json`));
  await restoredPage.getByRole('button', { name: '확인하고 복원', exact: true }).click();
  assert((await restoredPage.locator('.journal-archive-status').textContent()).includes('기존 기록 1건 유지'), 'per-case JSON must be accepted without overwriting existing notes');
  assert(await restoredPage.evaluate((storageKey) => localStorage.getItem(storageKey), key) === originalImported, 'duplicate import changed original');
  await upload.setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{broken') });
  await restoredPage.getByRole('alert').waitFor();
  assert(await restoredPage.locator('.journal-archive-import').count() === 0, 'invalid backup must not offer confirmation');
  assert(await restoredPage.locator('.journal-archive-list article').count() === 1, 'invalid import must preserve existing archive');
  await upload.setInputFiles({ name: 'oversized.json', mimeType: 'application/json', buffer: Buffer.alloc(16 * 1024 * 1024 + 1) });
  assert((await restoredPage.getByRole('alert').textContent()).includes('16MB'), 'oversized import must fail before parsing');
  assert((await audit(restoredPage)).overflow === 0, 'import feedback must fit 320px viewport');
  await restoredPage.getByRole('link', { name: '기록 이어서 보기', exact: true }).click();
  await restoredPage.getByRole('heading', { name: '무슨 근거로 생각을 고쳤나요?', level: 1 }).waitFor();
  assert(await restoredPage.locator('.thinking-practice-history li').count() === 2, 'restored first response and review must remain readable');
  assert(archiveErrors.length === 0 && archiveRequests.length === 0, `archive errors/requests: ${JSON.stringify({ archiveErrors, archiveRequests })}`);
  results.push({ engine: engineName, archiveRestore: 'passed', legacyJson: 'passed', importPreviewCancel: 'passed', duplicatePreservation: 'passed', invalidBackup: 'passed', oversizedBackup: 'passed', errors: 0, apiRequests: 0 });
  await restoredContext.close();

  const blocked = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await blocked.addInitScript(() => { Storage.prototype.setItem = function () { throw new DOMException('Quota exceeded', 'QuotaExceededError'); }; });
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  await blockedPage.locator('input[name="initial-factor"][value="uncertain"]').check();
  await blockedPage.getByLabel('왜 그렇게 생각했나요?').fill('저장 실패에도 남아야 할 생각');
  await blockedPage.getByRole('button', { name: '최초 판단 저장하고 근거 점검' }).click();
  assert((await blockedPage.getByRole('status').textContent()).includes('저장하지 못했습니다'), 'quota failure must not report success');
  assert(await blockedPage.getByLabel('왜 그렇게 생각했나요?').inputValue() === '저장 실패에도 남아야 할 생각', 'failed save must preserve input');
  results.push({ engine: engineName, quotaFailure: 'passed', draftPreserved: 'passed' });
  await blocked.close();
  await browser.close();
}
writeFileSync(join(artifactDir, 'browser-qa.json'), `${JSON.stringify({ baseUrl, results }, null, 2)}\n`);
console.log(`Thinking practice browser QA passed (${results.length} groups, ${requestedEngines.join('/')}, 1280/390/360/320/640px).`);

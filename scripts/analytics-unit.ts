import {
  analyticsAttributionStorageKey,
  analyticsEventNames,
  calculateEditorialReadDepth,
  captureAttribution,
  categorizeReferrer,
  createBrowserAnalyticsProvider,
  createTestAnalyticsProvider,
  editorialReadIsComplete,
  normalizeAttributionValue,
  resetAnalyticsRuntimeForTests,
  resolveAnalyticsRoute,
  setAnalyticsProviderForTests,
  trackAnalyticsEvent,
  trackRoutePageView,
  toVercelEventData,
  validateAnalyticsEvent,
  type AnalyticsDebugRecord,
  type AnalyticsEventPayload,
} from '../src/analytics/index.js';

let checks = 0;
function check(condition: unknown, message: string) {
  checks += 1;
  if (!condition) throw new Error(`analytics validation failed: ${message}`);
}

function equal(actual: unknown, expected: unknown, message = `${String(actual)} !== ${String(expected)}`) {
  check(Object.is(actual, expected), message);
}

function deepEqual(actual: unknown, expected: unknown, message = 'values differ') {
  check(JSON.stringify(actual) === JSON.stringify(expected), message);
}

function throws(callback: () => void, expected: RegExp) {
  let message = '';
  try { callback(); } catch (error) { message = error instanceof Error ? error.message : String(error); }
  check(expected.test(message), `expected error ${expected}, received ${message || 'no error'}`);
}

function doesNotThrow(callback: () => void) {
  try { callback(); } catch (error) { throw new Error(`unexpected error: ${error instanceof Error ? error.message : String(error)}`); }
  checks += 1;
}

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem(key: string) { return values.get(key) ?? null; },
    setItem(key: string, value: string) { values.set(key, value); },
    values,
  };
}

const companyRoute = resolveAnalyticsRoute('/ko/companies/nvidia');
equal(companyRoute.routeTemplate, '/ko/companies/:companySlug');
equal(companyRoute.companySlug, 'nvidia');
equal(resolveAnalyticsRoute('/ko/companies/nvidia/financials?ignored=yes').routeTemplate, '/ko/companies/:companySlug/financials');
equal(resolveAnalyticsRoute('/ko/insights/3reads/example#source').contentType, 'wall_street_edition');
equal(resolveAnalyticsRoute('/ko/insights/stock/example').pageType, 'stock_dissection');
equal(resolveAnalyticsRoute('/ko/insights/3reads/example').pageType, 'wall_street_edition');
check(!resolveAnalyticsRoute('/ko/companies/nvidia').routeTemplate.includes('?'), 'route templates must omit query strings');

equal(categorizeReferrer('', 'https://finance1-flax.vercel.app'), 'direct');
equal(categorizeReferrer('https://l.instagram.com/', 'https://finance1-flax.vercel.app'), 'instagram');
equal(categorizeReferrer('https://www.google.com/search?q=private', 'https://finance1-flax.vercel.app'), 'search');
equal(categorizeReferrer('https://finance1-flax.vercel.app/ko/', 'https://finance1-flax.vercel.app'), 'internal');
equal(categorizeReferrer('https://example.org/article', 'https://finance1-flax.vercel.app'), 'other');
equal(normalizeAttributionValue('IG Summer / 2026'), 'ig-summer-2026');
equal(normalizeAttributionValue('person@example.com'), undefined);
equal(normalizeAttributionValue('https://example.com/private'), undefined);

const storage = memoryStorage();
const firstAttribution = captureAttribution({
  search: '?utm_source=Instagram&utm_medium=social&utm_campaign=summer-2026&utm_content=slide-5&raw_private=never',
  referrer: 'https://l.instagram.com/',
  origin: 'https://finance1-flax.vercel.app',
  landingRoute: '/ko/insights/3reads/:slug',
  storage,
});
deepEqual(firstAttribution, {
  source: 'instagram', medium: 'social', campaign: 'summer-2026', content: 'slide-5',
  referrerCategory: 'instagram', landingRoute: '/ko/insights/3reads/:slug',
});
check(storage.values.has(analyticsAttributionStorageKey), 'attribution must use the versioned session key');
const persistedAttribution = captureAttribution({
  search: '', referrer: '', origin: 'https://finance1-flax.vercel.app', landingRoute: '/ko/companies/:companySlug', storage,
});
deepEqual(persistedAttribution, firstAttribution);
check(!JSON.stringify(firstAttribution).includes('raw_private'), 'unrecognized query parameters must never be retained');
const providerData = toVercelEventData({
  schemaVersion: 1, locale: 'ko', pageType: 'wall_street_edition', routeTemplate: '/ko/insights/3reads/:slug',
  contentType: 'wall_street_edition', contentId: 'example-content', attribution: firstAttribution,
});
check(!('attribution' in providerData), 'provider adapter must flatten nested attribution');
equal(providerData.attributionCampaign, 'summer-2026');

const records: AnalyticsDebugRecord[] = [];
resetAnalyticsRuntimeForTests();
setAnalyticsProviderForTests(createTestAnalyticsProvider(records));
const homeLocation = { pathname: '/ko/', search: '?utm_source=instagram', origin: 'https://finance1-flax.vercel.app' };
trackRoutePageView(homeLocation, 'https://l.instagram.com/');
trackRoutePageView(homeLocation, 'https://l.instagram.com/');
trackRoutePageView({ pathname: '/ko/companies/nvidia', search: '', origin: homeLocation.origin }, '');
trackRoutePageView(homeLocation, '');
equal(records.filter((record) => record.kind === 'pageview').length, 3, 'Strict Mode duplicate is ignored but a real back navigation is counted');
equal(records.filter((record) => record.kind === 'event' && record.name === 'research_landing_view').length, 1);
trackAnalyticsEvent('company_search_select', { companySlug: 'nvidia', resultPosition: 1, placement: 'home', destinationType: 'company' }, { oncePerPage: true, dedupeKey: 'nvidia' });
trackAnalyticsEvent('company_search_select', { companySlug: 'nvidia', resultPosition: 1, placement: 'home', destinationType: 'company' }, { oncePerPage: true, dedupeKey: 'nvidia' });
equal(records.filter((record) => record.kind === 'event' && record.name === 'company_search_select').length, 1);

const depth = calculateEditorialReadDepth({ scrollY: 800, viewportHeight: 700, elementTop: 100, elementHeight: 1_500 });
equal(Math.round(depth), 93);
equal(editorialReadIsComplete(90, 9_999), false);
equal(editorialReadIsComplete(89.9, 10_001), false);
equal(editorialReadIsComplete(90, 10_000), true);

const basePayload: AnalyticsEventPayload = {
  schemaVersion: 1,
  locale: 'ko',
  pageType: 'company',
  routeTemplate: '/ko/companies/:companySlug',
  companySlug: 'nvidia',
};
validateAnalyticsEvent('company_view', basePayload); checks += 1;
throws(() => validateAnalyticsEvent('company_search_select', { ...basePayload, query: 'secret' } as unknown as AnalyticsEventPayload), /not allowed/);
throws(() => validateAnalyticsEvent('valuation_view', { ...basePayload, wacc: 0.08 } as unknown as AnalyticsEventPayload), /not allowed/);
throws(() => validateAnalyticsEvent('valuation_sensitivity_open', { ...basePayload, value: 123 } as unknown as AnalyticsEventPayload), /not allowed/);
throws(() => validateAnalyticsEvent('editorial_source_open', {
  schemaVersion: 1, locale: 'ko', pageType: 'wall_street_edition', routeTemplate: '/ko/insights/3reads/:slug', contentType: 'wall_street_edition', contentId: 'read-1', sourceType: 'major_news', sourceOrder: 0,
}), /sourceOrder/);
throws(() => validateAnalyticsEvent('company_search_select', { ...basePayload, placement: 'search', destinationType: 'company' }), /resultPosition/);
doesNotThrow(() => validateAnalyticsEvent('company_search_select', { ...basePayload, placement: 'search', destinationType: 'company', resultPosition: 2 }));
check(analyticsEventNames.length === 21 && new Set(analyticsEventNames).size === 21, 'the event taxonomy must contain exactly 21 unique events');

const failingProviderRecords: AnalyticsDebugRecord[] = [];
resetAnalyticsRuntimeForTests();
setAnalyticsProviderForTests({
  name: 'throwing-test', supportsCustomEvents: true,
  pageview() { throw new Error('transport down'); },
  event() { failingProviderRecords.push({ kind: 'pageview', view: { routeTemplate: '/not-used', normalizedPath: '/not-used', pageType: 'other' } }); throw new Error('transport down'); },
});
doesNotThrow(() => trackRoutePageView({ pathname: '/ko/macro-dashboard', search: '', origin: homeLocation.origin }, ''));
doesNotThrow(() => trackAnalyticsEvent('macro_dashboard_view'));

const globalRecord = globalThis as unknown as Record<string, unknown>;
const originalWindow = globalRecord.window;
const originalDocument = globalRecord.document;
const appendedScripts: Array<{ src: string; dataset: Record<string, string> }> = [];
const fakeWindow = {
  location: { hostname: 'finance1-flax.vercel.app', protocol: 'https:' },
  va: undefined,
  vaq: undefined,
};
const fakeDocument = {
  querySelector() { return null; },
  createElement() { return { dataset: {}, remove() {} }; },
  head: { append(script: { src: string; dataset: Record<string, string> }) { appendedScripts.push(script); } },
};
globalRecord.window = fakeWindow;
globalRecord.document = fakeDocument;
const productionProvider = createBrowserAnalyticsProvider();
productionProvider.pageview({ routeTemplate: '/ko/companies/:companySlug', normalizedPath: '/ko/companies/nvidia', pageType: 'company' });
const queuedCommands = fakeWindow.vaq as unknown as unknown[][];
equal(productionProvider.name, 'vercel-web-analytics');
equal(appendedScripts.length, 1);
equal(appendedScripts[0].dataset.disableAutoTrack, '1');
deepEqual(queuedCommands.map((entry) => entry[0]), ['beforeSend', 'pageview'], 'Vercel vaq must receive beforeSend and manual pageview');
if (originalWindow === undefined) delete globalRecord.window; else globalRecord.window = originalWindow;
if (originalDocument === undefined) delete globalRecord.document; else globalRecord.document = originalDocument;

console.log(`Analytics validation passed (${checks} checks, ${analyticsEventNames.length} event contracts).`);

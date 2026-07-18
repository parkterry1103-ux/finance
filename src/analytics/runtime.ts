import { captureAttribution } from './attribution.js';
import { analyticsEnvironment, createBrowserAnalyticsProvider } from './provider.js';
import { resolveAnalyticsRoute } from './routes.js';
import type { AnalyticsAttribution, AnalyticsDebugRecord, AnalyticsEventName, AnalyticsEventProperties, AnalyticsProvider, AnalyticsRoute } from './types.js';
import { validateAnalyticsEvent } from './validation.js';

let provider: AnalyticsProvider | undefined;
let attribution: AnalyticsAttribution | undefined;
let currentRoute: AnalyticsRoute | undefined;
let currentPageKey = '';
const onceEvents = new Set<string>();

function doNotTrackEnabled() {
  if (typeof navigator === 'undefined') return false;
  const windowDoNotTrack = typeof window === 'undefined' ? undefined : (window as unknown as { doNotTrack?: string }).doNotTrack;
  return navigator.doNotTrack === '1' || windowDoNotTrack === '1';
}

function debugRecord(record: AnalyticsDebugRecord) {
  if (typeof window === 'undefined' || analyticsEnvironment(window.location) === 'production') return;
  const records = window.__RESEARCH_ANALYTICS_DEBUG__ ?? [];
  records.push(record);
  if (records.length > 200) records.splice(0, records.length - 200);
  window.__RESEARCH_ANALYTICS_DEBUG__ = records;
}

function analyticsProvider() {
  provider ??= createBrowserAnalyticsProvider();
  return provider;
}

export function setAnalyticsProviderForTests(next?: AnalyticsProvider) {
  provider = next;
}

export function resetAnalyticsRuntimeForTests() {
  provider = undefined;
  attribution = undefined;
  currentRoute = undefined;
  currentPageKey = '';
  onceEvents.clear();
}

export function trackRoutePageView(location: Pick<Location, 'pathname' | 'search' | 'origin'>, referrer = typeof document === 'undefined' ? '' : document.referrer) {
  if (doNotTrackEnabled()) return;
  const route = resolveAnalyticsRoute(location.pathname);
  const pageKey = `${route.routeTemplate}|${route.normalizedPath}`;
  const isInitialPageview = currentPageKey === '';
  const isDuplicateLifecycle = currentPageKey === pageKey;
  currentRoute = route;
  attribution ??= captureAttribution({
    search: location.search,
    referrer,
    origin: location.origin,
    landingRoute: route.routeTemplate,
    storage: typeof sessionStorage === 'undefined' ? undefined : sessionStorage,
  });
  if (isDuplicateLifecycle) return;
  currentPageKey = pageKey;
  onceEvents.clear();
  const view = { routeTemplate: route.routeTemplate, normalizedPath: route.normalizedPath, pageType: route.pageType } as const;
  debugRecord({ kind: 'pageview', view });
  try {
    analyticsProvider().pageview(view);
  } catch {
    // A provider failure must never block route rendering or navigation.
  }

  const isResearchLanding = isInitialPageview && attribution.referrerCategory !== 'internal'
    && ['home', 'insights_index', 'stock_dissection', 'wall_street_edition', 'company', 'research_report'].includes(route.pageType);
  if (isResearchLanding) {
    trackAnalyticsEvent('research_landing_view', {}, { oncePerPage: true, dedupeKey: 'landing' });
  }
}

export function trackAnalyticsEvent(
  name: AnalyticsEventName,
  properties: AnalyticsEventProperties = {},
  options: { oncePerPage?: boolean; dedupeKey?: string } = {},
) {
  if (doNotTrackEnabled()) return;
  const route = currentRoute ?? (typeof window === 'undefined' ? resolveAnalyticsRoute('/ko/') : resolveAnalyticsRoute(window.location.pathname));
  const eventKey = `${currentPageKey}|${name}|${options.dedupeKey ?? JSON.stringify(properties)}`;
  if (options.oncePerPage && onceEvents.has(eventKey)) return;
  if (options.oncePerPage) onceEvents.add(eventKey);
  const payload = validateAnalyticsEvent(name, {
    schemaVersion: 1,
    locale: 'ko',
    pageType: route.pageType,
    routeTemplate: route.routeTemplate,
    ...(attribution ? { attribution } : {}),
    ...(route.contentType ? { contentType: route.contentType } : {}),
    ...(route.companySlug ? { companySlug: route.companySlug } : {}),
    ...properties,
  });
  debugRecord({ kind: 'event', name, payload });
  try {
    analyticsProvider().event(name, payload);
  } catch {
    // A provider failure must never block the user action that produced it.
  }
}

export function calculateEditorialReadDepth({ scrollY, viewportHeight, elementTop, elementHeight }: { scrollY: number; viewportHeight: number; elementTop: number; elementHeight: number }) {
  const height = Math.max(elementHeight, 1);
  return Math.min(100, Math.max(0, ((scrollY + viewportHeight - elementTop) / height) * 100));
}

export function editorialReadIsComplete(depthPercent: number, elapsedMilliseconds: number) {
  return depthPercent >= 90 && elapsedMilliseconds >= 10_000;
}

export function observeEditorialReading(element: HTMLElement, properties: Pick<AnalyticsEventProperties, 'contentType' | 'contentId'>) {
  const startedAt = performance.now();
  const milestones = [25, 50, 75, 90] as const;
  let maximumDepth = 0;
  let completed = false;
  let completionTimer: number | undefined;

  const check = () => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    maximumDepth = Math.max(maximumDepth, calculateEditorialReadDepth({ scrollY: window.scrollY, viewportHeight: window.innerHeight, elementTop: top, elementHeight: element.scrollHeight }));
    for (const milestone of milestones) {
      if (maximumDepth < milestone) continue;
      trackAnalyticsEvent('editorial_read_depth', { ...properties, depthPercent: milestone }, { oncePerPage: true, dedupeKey: `${properties.contentId}:${milestone}` });
    }
    if (completed || maximumDepth < 90) return;
    const remaining = 10_000 - (performance.now() - startedAt);
    if (editorialReadIsComplete(maximumDepth, performance.now() - startedAt)) {
      completed = true;
      trackAnalyticsEvent('editorial_complete', properties, { oncePerPage: true, dedupeKey: properties.contentId });
    } else if (completionTimer === undefined) {
      completionTimer = window.setTimeout(() => {
        completionTimer = undefined;
        check();
      }, remaining + 20);
    }
  };

  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check, { passive: true });
  check();
  return () => {
    window.removeEventListener('scroll', check);
    window.removeEventListener('resize', check);
    if (completionTimer !== undefined) window.clearTimeout(completionTimer);
  };
}

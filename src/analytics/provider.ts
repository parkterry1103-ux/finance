import type { AnalyticsDebugRecord, AnalyticsEventName, AnalyticsEventPayload, AnalyticsPageView, AnalyticsProvider } from './types.js';

declare global {
  interface Window {
    va?: ((command: 'beforeSend', callback: (event: Record<string, unknown>) => Record<string, unknown> | null) => void)
      & ((command: 'pageview', payload: { route: string; path: string }) => void)
      & ((command: 'event', payload: { name: string; data: Record<string, unknown> }) => void);
    vaq?: unknown[][];
    __RESEARCH_ANALYTICS_DEBUG__?: AnalyticsDebugRecord[];
  }
}

function environmentValue(name: string) {
  const meta = import.meta as unknown as { env?: Record<string, string | undefined> };
  return meta.env?.[name];
}

export function analyticsEnvironment(location?: Pick<Location, 'hostname' | 'protocol'>) {
  const configured = environmentValue('VITE_VERCEL_ENV');
  if (configured === 'production') return 'production' as const;
  if (configured === 'preview') return 'preview' as const;
  if (location?.protocol === 'https:' && location.hostname === 'finance1-flax.vercel.app') return 'production' as const;
  return 'development' as const;
}

export function customEventTransportEnabled() {
  return environmentValue('VITE_ANALYTICS_CUSTOM_EVENTS') === 'true';
}

function queueVercelAnalytics() {
  if (window.va) return;
  type VercelAnalyticsQueue = NonNullable<Window['va']>;
  const analyticsQueue = function (...args: unknown[]) {
    (window.vaq = window.vaq || []).push(args);
  } as VercelAnalyticsQueue;
  window.va = analyticsQueue;
}

function injectVercelScript() {
  queueVercelAnalytics();
  if (document.querySelector('script[data-stock-autopsy-analytics]')) return;
  window.va?.('beforeSend', (event) => {
    if (event.type !== 'pageview') return event;
    const path = typeof event.path === 'string' ? event.path.split('?')[0].split('#')[0] : '/ko/';
    return { ...event, url: `${window.location.origin}${path}` };
  });
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  script.dataset.sdkn = '@vercel/analytics/manual';
  script.dataset.sdkv = '2.0.1';
  script.dataset.disableAutoTrack = '1';
  script.dataset.stockAutopsyAnalytics = 'true';
  script.onerror = () => { script.remove(); };
  document.head.append(script);
}

function safeCall(callback: () => void) {
  try {
    callback();
  } catch {
    // Analytics transport is observability-only and must not block the product.
  }
}

export function toVercelEventData(payload: AnalyticsEventPayload) {
  const { attribution, ...eventData } = payload;
  return {
    ...eventData,
    ...(attribution?.source ? { attributionSource: attribution.source } : {}),
    ...(attribution?.medium ? { attributionMedium: attribution.medium } : {}),
    ...(attribution?.campaign ? { attributionCampaign: attribution.campaign } : {}),
    ...(attribution?.content ? { attributionContent: attribution.content } : {}),
    ...(attribution ? {
      attributionReferrerCategory: attribution.referrerCategory,
      attributionLandingRoute: attribution.landingRoute,
    } : {}),
  };
}

export function createBrowserAnalyticsProvider(): AnalyticsProvider {
  const environment = typeof window === 'undefined' ? 'development' : analyticsEnvironment(window.location);
  const supportsCustomEvents = environment === 'production' && customEventTransportEnabled();
  if (environment === 'production' && typeof document !== 'undefined') safeCall(injectVercelScript);
  return {
    name: environment === 'production' ? 'vercel-web-analytics' : `disabled-${environment}`,
    supportsCustomEvents,
    pageview(view) {
      if (environment !== 'production') return;
      safeCall(() => window.va?.('pageview', { route: view.routeTemplate, path: view.normalizedPath }));
    },
    event(name, payload) {
      if (!supportsCustomEvents) return;
      safeCall(() => window.va?.('event', { name, data: toVercelEventData(payload) }));
    },
  };
}

export function createTestAnalyticsProvider(records: AnalyticsDebugRecord[]): AnalyticsProvider {
  return {
    name: 'test',
    supportsCustomEvents: true,
    pageview(view: AnalyticsPageView) { records.push({ kind: 'pageview', view }); },
    event(name: AnalyticsEventName, payload: AnalyticsEventPayload) { records.push({ kind: 'event', name, payload }); },
  };
}

import type { AnalyticsAttribution, AnalyticsReferrerCategory } from './types.js';

export const analyticsAttributionStorageKey = 'stock-autopsy.analytics.attribution.v1';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function safeHost(value: string) {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return '';
  }
}

export function categorizeReferrer(referrer: string, origin: string): AnalyticsReferrerCategory {
  if (!referrer) return 'direct';
  const host = safeHost(referrer);
  const ownHost = safeHost(origin);
  if (!host) return 'other';
  if (host === ownHost) return 'internal';
  if (host === 'instagram.com' || host.endsWith('.instagram.com') || host === 'l.instagram.com') return 'instagram';
  if (/(^|\.)(google|bing|naver|daum|yahoo|duckduckgo)\./.test(host)) return 'search';
  if (/(^|\.)(facebook|threads|twitter|x|linkedin|tiktok|youtube)\./.test(host) || host === 'youtu.be') return 'social';
  return 'other';
}

export function normalizeAttributionValue(value: string | null, maximumLength = 80) {
  if (!value) return undefined;
  if (/@|:\/\/|[?#=&]/.test(value)) return undefined;
  const normalized = value
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maximumLength);
  return normalized || undefined;
}

function validStoredAttribution(value: unknown): value is AnalyticsAttribution {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  const categories: AnalyticsReferrerCategory[] = ['instagram', 'search', 'social', 'direct', 'internal', 'other'];
  return categories.includes(record.referrerCategory as AnalyticsReferrerCategory)
    && typeof record.landingRoute === 'string'
    && record.landingRoute.startsWith('/');
}

export function readStoredAttribution(storage?: StorageLike | null) {
  if (!storage) return undefined;
  try {
    const value = JSON.parse(storage.getItem(analyticsAttributionStorageKey) ?? 'null');
    return validStoredAttribution(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

export function captureAttribution({
  search,
  referrer,
  origin,
  landingRoute,
  storage,
}: {
  search: string;
  referrer: string;
  origin: string;
  landingRoute: string;
  storage?: StorageLike | null;
}): AnalyticsAttribution {
  const existing = readStoredAttribution(storage);
  if (existing) return existing;

  const parameters = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const referrerCategory = categorizeReferrer(referrer, origin);
  const attribution: AnalyticsAttribution = {
    source: normalizeAttributionValue(parameters.get('utm_source')) ?? (referrerCategory === 'direct' || referrerCategory === 'internal' ? undefined : referrerCategory),
    medium: normalizeAttributionValue(parameters.get('utm_medium')),
    campaign: normalizeAttributionValue(parameters.get('utm_campaign')),
    content: normalizeAttributionValue(parameters.get('utm_content')),
    referrerCategory,
    landingRoute,
  };
  try {
    storage?.setItem(analyticsAttributionStorageKey, JSON.stringify(attribution));
  } catch {
    // Storage denial must never block navigation or rendering.
  }
  return attribution;
}

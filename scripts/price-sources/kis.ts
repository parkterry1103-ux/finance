import { envValue, nowIso } from '../sync-utils.js';

const DEFAULT_KIS_PROD_BASE_URL = 'https://openapi.koreainvestment.com:9443';
const DEFAULT_KIS_PAPER_BASE_URL = 'https://openapivts.koreainvestment.com:29443';
const KIS_TOKEN_PATH = '/oauth2/tokenP';
const KIS_DOMESTIC_QUOTE_PATH = '/uapi/domestic-stock/v1/quotations/inquire-price';

export const KIS_PRICE_SOURCE = 'kis-openapi';

function normalizeTicker(ticker?: string) {
  return String(ticker ?? '').trim().toUpperCase();
}

export function isKisDomesticTicker(ticker?: string) {
  return /^\d{6}\.(KS|KQ)$/.test(normalizeTicker(ticker));
}

export function kisDomesticSymbol(ticker?: string) {
  const match = normalizeTicker(ticker).match(/^(\d{6})\.(KS|KQ)$/);
  return match?.[1] ?? null;
}

function kisBaseUrl() {
  const explicit = envValue('KIS_BASE_URL').trim();
  if (explicit) return explicit.replace(/\/+$/, '');

  const env = envValue('KIS_ENV', 'paper').trim().toLowerCase();
  if (env === 'production' || env === 'prod' || env === 'real') {
    return (envValue('KIS_PROD_BASE_URL') || DEFAULT_KIS_PROD_BASE_URL).replace(/\/+$/, '');
  }
  return (envValue('KIS_PAPER_BASE_URL') || DEFAULT_KIS_PAPER_BASE_URL).replace(/\/+$/, '');
}

export function kisConfigStatus() {
  const appKey = envValue('KIS_APP_KEY');
  const appSecret = envValue('KIS_APP_SECRET');
  if (!appKey || !appSecret) {
    return {
      enabled: false,
      baseUrl: '',
      reason: 'KIS_APP_KEY/KIS_APP_SECRET env missing',
    };
  }
  return {
    enabled: true,
    baseUrl: kisBaseUrl(),
    reason: '',
  };
}

function redactKisText(text: string, secrets: string[] = []) {
  let safe = text;
  secrets.filter(Boolean).forEach((secret) => {
    safe = safe.split(secret).join('[redacted]');
  });
  safe = safe.replace(/"access_token"\s*:\s*"[^"]+"/gi, '"access_token":"[redacted]"');
  safe = safe.replace(/"authorization"\s*:\s*"[^"]+"/gi, '"authorization":"[redacted]"');
  safe = safe.replace(/"appkey"\s*:\s*"[^"]+"/gi, '"appkey":"[redacted]"');
  safe = safe.replace(/"appsecret"\s*:\s*"[^"]+"/gi, '"appsecret":"[redacted]"');
  safe = safe.replace(/(access_token|authorization|appkey|appsecret)=([^&\s]+)/gi, '$1=[redacted]');
  safe = safe.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]');
  return safe.slice(0, 240);
}

async function safeResponseSummary(response, secrets: string[] = []) {
  try {
    const text = await response.text();
    if (!text) return '';
    return ` ${redactKisText(text, secrets)}`;
  } catch {
    return '';
  }
}

async function issueKisAccessToken(baseUrl: string) {
  const appKey = envValue('KIS_APP_KEY');
  const appSecret = envValue('KIS_APP_SECRET');
  const response = await fetch(`${baseUrl}${KIS_TOKEN_PATH}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      appkey: appKey,
      appsecret: appSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(`KIS token request failed: ${response.status}${await safeResponseSummary(response, [appKey, appSecret])}`);
  }

  const payload = await response.json();
  const token = payload?.access_token;
  if (!token) throw new Error('KIS token response missing access_token');
  return token;
}

export function parseKisNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  const text = String(value).replace(/,/g, '').replace(/%/g, '').trim();
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function firstKisNumber(...values) {
  for (const value of values) {
    const parsed = parseKisNumber(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

export function applyKisSign(value, sign) {
  const parsed = parseKisNumber(value);
  if (parsed === null) return null;
  const normalizedSign = String(sign ?? '').trim();
  if (normalizedSign === '4' || normalizedSign === '5' || normalizedSign === '-') return -Math.abs(parsed);
  if (normalizedSign === '1' || normalizedSign === '2' || normalizedSign === '+') return Math.abs(parsed);
  if (normalizedSign === '3') return 0;
  return parsed;
}

function signedNumber(value) {
  if (!Number.isFinite(value)) return null;
  return `${value > 0 ? '+' : ''}${Number(value).toFixed(2)}`;
}

function signedPercent(value) {
  if (!Number.isFinite(value)) return null;
  return `${value > 0 ? '+' : ''}${Number(value).toFixed(2)}%`;
}

function kisTimestamp(output, fetchedAt: string) {
  const date = String(output?.stck_bsop_date ?? output?.bsop_date ?? output?.trd_dd ?? '').replace(/\D/g, '');
  const time = String(output?.stck_cntg_hour ?? output?.cntg_hour ?? output?.trd_tmd ?? '').replace(/\D/g, '');
  if (/^\d{8}$/.test(date) && /^\d{6}$/.test(time)) {
    const iso = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}+09:00`;
    const parsed = new Date(iso);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return fetchedAt;
}

function normalizeKisDomesticQuote(target, output, fetchedAt: string) {
  const price = firstKisNumber(output?.stck_prpr, output?.price, output?.last);
  if (price === null || price <= 0) throw new Error('KIS domestic quote price missing');

  const open = firstKisNumber(output?.stck_oprc, output?.oprc, output?.open);
  const previousClose = firstKisNumber(output?.stck_prdy_clpr, output?.prdy_clpr, output?.stck_sdpr, output?.base);
  const change = applyKisSign(output?.prdy_vrss ?? output?.change, output?.prdy_vrss_sign);
  const changePercent = applyKisSign(output?.prdy_ctrt ?? output?.change_percent, output?.prdy_vrss_sign);

  return {
    companyId: target.companyId,
    ticker: target.ticker,
    market: target.market ?? (String(target.ticker).endsWith('.KQ') ? 'KOSDAQ' : 'KOSPI'),
    price,
    open,
    previousClose,
    close: price,
    change: change === null ? null : signedNumber(change),
    changePercent: changePercent === null ? null : signedPercent(changePercent),
    currency: 'KRW',
    priceLabel: 'delayed',
    marketStatus: 'delayed',
    asOf: kisTimestamp(output, fetchedAt),
    source: KIS_PRICE_SOURCE,
    isDelayed: true,
  };
}

async function fetchKisDomesticQuote(target, token: string, baseUrl: string) {
  const appKey = envValue('KIS_APP_KEY');
  const appSecret = envValue('KIS_APP_SECRET');
  const symbol = kisDomesticSymbol(target.ticker);
  if (!symbol) throw new Error('KIS domestic symbol unsupported');

  const url = new URL(KIS_DOMESTIC_QUOTE_PATH, baseUrl);
  url.searchParams.set('FID_COND_MRKT_DIV_CODE', 'J');
  url.searchParams.set('FID_INPUT_ISCD', symbol);

  const fetchedAt = nowIso();
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
      appkey: appKey,
      appsecret: appSecret,
      tr_id: 'FHKST01010100',
      custtype: 'P',
    },
  });

  if (!response.ok) {
    throw new Error(`KIS domestic quote failed: ${response.status}${await safeResponseSummary(response, [appKey, appSecret, token])}`);
  }

  const payload = await response.json();
  if (payload?.rt_cd && payload.rt_cd !== '0') {
    const code = payload?.msg_cd ? ` ${payload.msg_cd}` : '';
    const message = payload?.msg1 ? ` ${redactKisText(String(payload.msg1), [appKey, appSecret, token])}` : '';
    throw new Error(`KIS domestic quote failed:${code}${message}`.trim());
  }

  return normalizeKisDomesticQuote(target, payload?.output ?? payload, fetchedAt);
}

export async function fetchKisDomesticQuoteRows(targets) {
  const domesticTargets = targets.filter((target) => isKisDomesticTicker(target.ticker));
  const config = kisConfigStatus();
  const results = [];
  const rows = [];

  if (!domesticTargets.length) {
    return {
      rows,
      results,
      sourceLabel: '',
      attemptedCount: 0,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      skipReason: '',
    };
  }

  if (!config.enabled) {
    return {
      rows,
      results,
      sourceLabel: '',
      attemptedCount: 0,
      successCount: 0,
      failedCount: 0,
      skippedCount: domesticTargets.length,
      skipReason: config.reason,
    };
  }

  try {
    const token = await issueKisAccessToken(config.baseUrl);
    for (const target of domesticTargets) {
      const lookupTicker = kisDomesticSymbol(target.ticker);
      try {
        const row = await fetchKisDomesticQuote(target, token, config.baseUrl);
        rows.push(row);
        results.push({
          provider: KIS_PRICE_SOURCE,
          ticker: target.ticker,
          lookupTicker,
          status: 'success',
          price: row.price,
          priceLabel: row.priceLabel,
          source: row.source,
          asOf: row.asOf,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        results.push({
          provider: KIS_PRICE_SOURCE,
          ticker: target.ticker,
          lookupTicker,
          status: 'failed',
          error: message,
        });
        console.warn(`[sync-prices] KIS domestic quote skipped ${target.ticker}: ${message}`);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    domesticTargets.forEach((target) => {
      results.push({
        provider: KIS_PRICE_SOURCE,
        ticker: target.ticker,
        lookupTicker: kisDomesticSymbol(target.ticker),
        status: 'failed',
        error: message,
      });
    });
    console.warn(`[sync-prices] KIS domestic quote skipped all domestic tickers: ${message}`);
  }

  return {
    rows,
    results,
    sourceLabel: rows.length ? KIS_PRICE_SOURCE : '',
    attemptedCount: domesticTargets.length,
    successCount: rows.length,
    failedCount: results.filter((item) => item.status === 'failed').length,
    skippedCount: 0,
    skipReason: '',
  };
}

const runtime = globalThis;

export function envValue(key, fallback = '') {
  return runtime.process?.env?.[key] ?? fallback;
}

export function nowIso() {
  return new Date().toISOString();
}

export function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

export function secHeaders() {
  return {
    'User-Agent': envValue('SEC_USER_AGENT', 'finance-supply-chain-app contact@example.com'),
    Accept: 'application/json, text/xml, application/xml;q=0.9, */*;q=0.8',
  };
}

export function hasSupabaseConfig() {
  return Boolean(envValue('SUPABASE_URL') && envValue('SUPABASE_SERVICE_ROLE_KEY'));
}

export async function upsertRows(table, rows, conflictColumns = []) {
  const payload = Array.isArray(rows) ? rows.filter(Boolean) : [rows].filter(Boolean);
  if (!payload.length) return { inserted: 0, updated: 0, skipped: 0 };
  if (!hasSupabaseConfig()) {
    console.log(`[sync] Supabase env missing. ${table}: ${payload.length} rows prepared, DB write skipped.`);
    return { inserted: 0, updated: 0, skipped: payload.length };
  }

  const url = new URL(`/rest/v1/${table}`, envValue('SUPABASE_URL'));
  if (conflictColumns.length) {
    url.searchParams.set('on_conflict', conflictColumns.join(','));
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: envValue('SUPABASE_SERVICE_ROLE_KEY'),
      Authorization: `Bearer ${envValue('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Supabase upsert ${table} failed: ${response.status} ${await response.text()}`);
  }

  return { inserted: payload.length, updated: 0, skipped: 0 };
}

export async function recordSyncRun({ source, status, startedAt, insertedCount = 0, updatedCount = 0, errorMessage: message = '' }) {
  const row = {
    source,
    status,
    started_at: startedAt,
    ended_at: nowIso(),
    inserted_count: insertedCount,
    updated_count: updatedCount,
    error_message: message || null,
  };

  if (!hasSupabaseConfig()) {
    console.log(`[sync] ${source} ${status}: inserted=${insertedCount}, updated=${updatedCount}${message ? `, error=${message}` : ''}`);
    return row;
  }

  await upsertRows('sync_runs', row);
  return row;
}

export function isDirectRun(importMetaUrl) {
  return runtime.process?.argv?.[1] && importMetaUrl === new URL(`file://${runtime.process.argv[1]}`).href;
}

export function normalizeDate(value) {
  if (!value) return null;
  const text = String(value);
  if (/^\d{8}$/.test(text)) return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
  return text;
}

import { envValue, errorMessage, isDirectRun, normalizeDate, nowIso, recordSyncRun, upsertRows } from './sync-utils.js';

function projectFile(path) {
  const runtime = globalThis as typeof globalThis & { process?: { cwd?: () => string } };
  return `${runtime.process?.cwd?.() ?? '.'}/${path}`;
}

function parseCsv(text) {
  const rows = [];
  const lines = String(text).trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return rows;
  const splitLine = (line) => {
    const cells = [];
    let current = '';
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];
      if (char === '"' && next === '"') {
        current += '"';
        index += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === ',' && !quoted) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    return cells;
  };
  const headers = splitLine(lines[0]).map((header) => header.trim());
  for (const line of lines.slice(1)) {
    const cells = splitLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? '';
    });
    rows.push(row);
  }
  return rows;
}

function parseImportText(text, sourceLabel) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.rows)) return parsed.rows;
    if (Array.isArray(parsed.data)) return parsed.data;
    throw new Error(`${sourceLabel} JSON must be an array or contain rows/data array`);
  }
  return parseCsv(trimmed);
}

async function loadImportRows() {
  const importUrl = envValue('CONGRESS_TRADES_IMPORT_URL');
  if (importUrl) {
    const response = await fetch(importUrl);
    if (!response.ok) throw new Error(`Congress import ${response.status}`);
    const text = await response.text();
    return { rows: parseImportText(text, importUrl), sourceLabel: importUrl };
  }

  // House/Senate 공개자료 파서 구조:
  // 운영자가 공개 CSV/JSON을 data/congress-trades.json으로 넣으면 반자동 import합니다.
  // unique key: reportId + transactionDate + assetName + amountRange
  try {
    const fs = await import('node:fs/promises');
    const raw = await fs.readFile(projectFile('data/congress-trades.json'), 'utf-8');
    return { rows: parseImportText(raw, 'data/congress-trades.json'), sourceLabel: 'data/congress-trades.json' };
  } catch {
    return { rows: [], sourceLabel: '' };
  }
}

function normalizeCongressRow(row) {
  const reportId = row.reportId ?? row.report_id ?? row.id;
  const transactionDate = row.transactionDate ?? row.transaction_date ?? row.tradeDate ?? row.trade_date;
  const assetName = row.assetName ?? row.asset_name ?? row.companyName ?? row.ticker;
  const amountRange = row.amountRange ?? row.amount_range ?? row.amount;
  const politicianName = row.politicianName ?? row.politician_name ?? row.investorName ?? row.representative ?? row.senator;
  const chamber = row.chamber ? ` · ${row.chamber}` : '';
  const companyName = row.companyName ?? row.company_name ?? row.assetName ?? row.asset_name ?? row.ticker;
  return {
    company_id: row.companyId ?? null,
    ticker: row.ticker ?? null,
    investor_name: politicianName ? `${politicianName}${chamber}` : `US Congress disclosure${chamber}`,
    investor_type: 'us-politician',
    action: row.action ?? 'unknown',
    trade_date: normalizeDate(transactionDate) ?? null,
    disclosed_date: normalizeDate(row.disclosedDate ?? row.disclosed_date) ?? null,
    shares: row.shares ?? null,
    price: row.price ?? null,
    amount: amountRange ? `${companyName ?? assetName ?? 'asset'} · ${amountRange}` : companyName ?? null,
    source: 'congress-trades',
    source_url: row.sourceUrl ?? row.source_url ?? null,
    raw_id: `${reportId ?? 'manual'}:${transactionDate ?? 'date'}:${assetName ?? 'asset'}:${amountRange ?? 'amount'}`,
    created_at: nowIso(),
  };
}

export async function syncCongressTrades() {
  const startedAt = nowIso();
  let insertedCount = 0;
  const errors = [];

  try {
    const { rows, sourceLabel } = await loadImportRows();
    if (!sourceLabel) {
      const message = 'No congress import source. Add data/congress-trades.json or CONGRESS_TRADES_IMPORT_URL.';
      await recordSyncRun({ source: 'congress-trades', status: 'skipped', startedAt, errorMessage: message });
      return { source: 'congress-trades', status: 'skipped', insertedCount, updatedCount: 0, errors: [message] };
    }

    const normalizedRows = Array.isArray(rows) ? rows.map(normalizeCongressRow) : [];
    if (!normalizedRows.length) {
      const message = `No congress import rows in ${sourceLabel}.`;
      await recordSyncRun({ source: 'congress-trades', status: 'skipped', startedAt, errorMessage: message });
      return { source: 'congress-trades', status: 'skipped', insertedCount, updatedCount: 0, errors: [message] };
    } else {
      await upsertRows('ownership_trades', normalizedRows, ['source', 'raw_id']);
      insertedCount = normalizedRows.length;
    }
  } catch (error) {
    errors.push(errorMessage(error));
  }

  const status = errors.length ? 'partial' : 'success';
  await recordSyncRun({ source: 'congress-trades', status, startedAt, insertedCount, updatedCount: 0, errorMessage: errors.join('\n') });
  return { source: 'congress-trades', status, insertedCount, updatedCount: 0, errors };
}

if (isDirectRun(import.meta.url)) {
  syncCongressTrades()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch(async (error) => {
      await recordSyncRun({ source: 'congress-trades', status: 'failed', startedAt: nowIso(), errorMessage: errorMessage(error) });
      console.error(error);
      globalThis.process?.exit?.(1);
    });
}

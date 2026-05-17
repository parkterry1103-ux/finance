import { companies, mockMarketPrices } from '../src/data.js';
import { envValue, errorMessage, hasSupabaseConfig, isDirectRun, nowIso, recordSyncRun, upsertRows } from './sync-utils.js';

function projectFile(path) {
  const runtime = globalThis as typeof globalThis & { process?: { cwd?: () => string } };
  return `${runtime.process?.cwd?.() ?? '.'}/${path}`;
}

function parseCsv(text) {
  const lines = String(text).trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const split = (line) => {
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
  const headers = split(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = split(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? '';
    });
    return row;
  });
}

function parseRows(text, label) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.rows)) return parsed.rows;
    if (Array.isArray(parsed.data)) return parsed.data;
    throw new Error(`${label} JSON must be an array or contain rows/data array`);
  }
  return parseCsv(trimmed);
}

async function loadPriceRows() {
  const importUrl = envValue('MARKET_PRICES_IMPORT_URL');
  if (importUrl) {
    const response = await fetch(importUrl);
    if (!response.ok) throw new Error(`price import ${response.status}`);
    return { rows: parseRows(await response.text(), importUrl), sourceLabel: importUrl };
  }

  try {
    const fs = await import('node:fs/promises');
    const raw = await fs.readFile(projectFile('data/prices.json'), 'utf-8');
    return { rows: parseRows(raw, 'data/prices.json'), sourceLabel: 'data/prices.json' };
  } catch {
    return { rows: [], sourceLabel: '' };
  }
}

function normalizePriceRow(row) {
  return {
    company_id: row.company_id ?? row.companyId ?? null,
    ticker: row.ticker,
    market: row.market ?? 'unknown',
    price: row.price === undefined ? null : String(row.price),
    change: row.change === undefined ? null : String(row.change),
    change_percent: row.changePercent ?? row.change_percent ?? null,
    currency: row.currency ?? null,
    market_status: row.marketStatus ?? row.market_status ?? 'unknown',
    as_of: row.asOf ?? row.as_of ?? nowIso(),
    source: row.source ?? 'manual-price-import',
    is_delayed: Boolean(row.isDelayed ?? row.is_delayed ?? true),
    created_at: nowIso(),
  };
}

function mockRowsForReport() {
  return mockMarketPrices.map(normalizePriceRow);
}

export async function syncPrices() {
  const startedAt = nowIso();
  try {
    const { rows, sourceLabel } = await loadPriceRows();
    if (!sourceLabel) {
      const message = 'No price import source. Frontend keeps mock delayed/close price fallback.';
      await recordSyncRun({ source: 'market-prices', status: 'skipped', startedAt, errorMessage: message });
      return {
        source: 'market-prices',
        status: 'skipped',
        insertedCount: 0,
        updatedCount: 0,
        mockFallbackCount: mockRowsForReport().length,
        errors: [message],
      };
    }

    const normalizedRows = rows.map(normalizePriceRow).filter((row) => row.ticker);
    if (!normalizedRows.length) {
      const message = `No price rows in ${sourceLabel}. Frontend keeps mock fallback.`;
      await recordSyncRun({ source: 'market-prices', status: 'skipped', startedAt, errorMessage: message });
      return { source: 'market-prices', status: 'skipped', insertedCount: 0, updatedCount: 0, errors: [message] };
    }

    if (hasSupabaseConfig()) {
      const companyRows = normalizedRows
        .map((row) => companies.find((company) => company.id === row.company_id))
        .filter(Boolean)
        .map((company) => ({
          id: company.id,
          name: company.name,
          ticker: company.ticker ?? null,
          market: company.country,
          sector: company.sector,
          dart_corp_code: company.corpCode ?? null,
          sec_cik: company.cik ?? null,
          updated_at: nowIso(),
        }));
      if (companyRows.length) {
        await upsertRows('companies', companyRows, ['id']);
      }
    }

    const result = await upsertRows('market_prices', normalizedRows, ['ticker', 'source', 'as_of']);
    await recordSyncRun({
      source: 'market-prices',
      status: 'success',
      startedAt,
      insertedCount: result.inserted ?? normalizedRows.length,
      updatedCount: result.updated ?? 0,
    });
    return {
      source: 'market-prices',
      status: 'success',
      insertedCount: result.inserted ?? normalizedRows.length,
      updatedCount: result.updated ?? 0,
      errors: [],
    };
  } catch (error) {
    await recordSyncRun({ source: 'market-prices', status: 'failed', startedAt, errorMessage: errorMessage(error) });
    return { source: 'market-prices', status: 'failed', insertedCount: 0, updatedCount: 0, errors: [errorMessage(error)] };
  }
}

if (isDirectRun(import.meta.url)) {
  syncPrices()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch(async (error) => {
      await recordSyncRun({ source: 'market-prices', status: 'failed', startedAt: nowIso(), errorMessage: errorMessage(error) });
      console.error(error);
      globalThis.process?.exit?.(1);
    });
}

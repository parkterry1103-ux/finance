import { smartMoneyMoves } from '../src/data.ts';
import { envValue, errorMessage, isDirectRun, nowIso, recordSyncRun, upsertRows } from './sync-utils.ts';

async function loadImportRows() {
  const importUrl = envValue('CONGRESS_TRADES_IMPORT_URL');
  if (importUrl) {
    const response = await fetch(importUrl);
    if (!response.ok) throw new Error(`Congress import ${response.status}`);
    return response.json();
  }

  // House/Senate 공개자료 파서 구조:
  // 운영자가 공개 CSV/JSON을 data/congress-trades.json으로 넣으면 반자동 import합니다.
  // unique key: reportId + transactionDate + assetName + amountRange
  try {
    const fs = await import('node:fs/promises');
    const raw = await fs.readFile(new URL('../data/congress-trades.json', import.meta.url), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function normalizeCongressRow(row) {
  const reportId = row.reportId ?? row.report_id ?? row.id;
  const transactionDate = row.transactionDate ?? row.transaction_date ?? row.tradeDate;
  const assetName = row.assetName ?? row.asset_name ?? row.companyName ?? row.ticker;
  const amountRange = row.amountRange ?? row.amount_range ?? row.amount;
  return {
    company_id: row.companyId ?? null,
    ticker: row.ticker ?? null,
    investor_name: row.investorName ?? row.representative ?? row.senator ?? 'US Congress disclosure',
    investor_type: 'us-politician',
    action: row.action ?? 'unknown',
    trade_date: transactionDate ?? null,
    disclosed_date: row.disclosedDate ?? row.disclosed_date ?? null,
    shares: row.shares ?? null,
    price: row.price ?? null,
    amount: amountRange ?? null,
    source: row.source ?? 'House/Senate public disclosure',
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
    const rows = await loadImportRows();
    const normalizedRows = Array.isArray(rows) ? rows.map(normalizeCongressRow) : [];
    if (!normalizedRows.length) {
      const mockRows = smartMoneyMoves
        .filter((move) => move.investorType === 'us-politician' || move.investorType === 'kr-politician')
        .map((move) => ({
          company_id: move.companyId,
          ticker: move.ticker,
          investor_name: move.investorName,
          investor_type: move.investorType,
          action: move.action,
          trade_date: move.tradeDateOptional ?? null,
          disclosed_date: move.disclosedDate,
          shares: null,
          price: null,
          amount: null,
          source: move.sourceLabel,
          source_url: move.sourceUrl ?? null,
          raw_id: move.id,
          created_at: nowIso(),
        }));

      if (!mockRows.length) {
        const message = 'No congress import rows. Add CONGRESS_TRADES_IMPORT_URL or data/congress-trades.json.';
        await recordSyncRun({ source: 'congress-trades', status: 'skipped', startedAt, errorMessage: message });
        return { source: 'congress-trades', status: 'skipped', insertedCount, updatedCount: 0, errors: [message] };
      }

      await upsertRows('ownership_trades', mockRows, ['raw_id']);
      insertedCount = mockRows.length;
    } else {
      await upsertRows('ownership_trades', normalizedRows, ['raw_id']);
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

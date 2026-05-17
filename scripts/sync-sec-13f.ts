import { errorMessage, envValue, isDirectRun, nowIso, recordSyncRun, secHeaders, upsertRows } from './sync-utils.js';

const CHUNK_SIZE = 500;
const MANAGER_NAME_BY_CIK = {
  '0001067983': 'Berkshire Hathaway',
  '0001697748': 'ARK Investment Management',
  '0001364742': 'BlackRock',
  '0000886982': 'Goldman Sachs',
  '0000102909': 'Vanguard',
  '0000093751': 'State Street',
  '0000019617': 'JPMorgan',
  '0000895421': 'Morgan Stanley',
  '0001350694': 'Bridgewater Associates',
  '0001423053': 'Citadel Advisors',
  '0001037389': 'Renaissance Technologies',
  '0001061768': 'Baupost Group',
  '0001029160': 'Soros Fund Management',
};

function managerCiks() {
  return Array.from(new Set(envValue('SEC_13F_MANAGER_CIKS')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)));
}

function normalizeCik(value) {
  const text = String(value ?? '').trim();
  if (!/^\d+$/.test(text)) throw new Error(`Invalid manager CIK: ${value}`);
  return text;
}

function archiveCikPath(cik) {
  return String(Number(cik));
}

function accessionPath(accessionNumber) {
  return String(accessionNumber).replace(/-/g, '');
}

function decodeXml(value = '') {
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim();
}

function tagValue(block, tagName) {
  const pattern = new RegExp(`<(?:[A-Za-z0-9_]+:)?${tagName}[^>]*>([\\s\\S]*?)<\\/(?:[A-Za-z0-9_]+:)?${tagName}>`, 'i');
  return decodeXml(block.match(pattern)?.[1] ?? '');
}

function numericValue(value) {
  const parsed = Number(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function compactText(value) {
  return decodeXml(value).replace(/\s+/g, ' ').trim();
}

function parseInfoTable(xml) {
  const blocks = xml.match(/<(?:[A-Za-z0-9_]+:)?infoTable[\s\S]*?<\/(?:[A-Za-z0-9_]+:)?infoTable>/gi) ?? [];
  return blocks
    .map((block, index) => {
      const issuer = tagValue(block, 'nameOfIssuer');
      const cusip = tagValue(block, 'cusip').toUpperCase();
      const shares = numericValue(tagValue(block, 'sshPrnamt'));
      const value = numericValue(tagValue(block, 'value'));
      const title = tagValue(block, 'titleOfClass');
      const ticker = tagValue(block, 'ticker').toUpperCase();
      if (!cusip && !issuer) return null;
      return { issuer, cusip, shares, value, title, ticker, index };
    })
    .filter(Boolean);
}

function extractManagerName(text) {
  const filingManagerBlock = text.match(/<(?:[A-Za-z0-9_]+:)?filingManager[\s\S]*?<\/(?:[A-Za-z0-9_]+:)?filingManager>/i)?.[0];
  if (filingManagerBlock) {
    const name = compactText(tagValue(filingManagerBlock, 'name'));
    if (name) return name;
  }
  const filerBlock = text.match(/<(?:[A-Za-z0-9_]+:)?filerInfo[\s\S]*?<\/(?:[A-Za-z0-9_]+:)?filerInfo>/i)?.[0];
  if (filerBlock) {
    const name = compactText(tagValue(filerBlock, 'name'));
    if (name) return name;
  }
  return '';
}

function paddedCik(value) {
  return String(value).padStart(10, '0');
}

function resolveManagerName(cik, secName = '', filingName = '') {
  const padded = paddedCik(cik);
  return compactText(filingName) || compactText(secName) || MANAGER_NAME_BY_CIK[padded] || MANAGER_NAME_BY_CIK[String(cik)] || `Manager ${cik}`;
}

function candidateScore(name) {
  const lower = String(name).toLowerCase();
  if (!lower) return -1;
  if (/info.*table.*\.xml$/.test(lower) || /information.*table.*\.xml$/.test(lower)) return 100;
  if (/infotable.*\.xml$/.test(lower)) return 95;
  if (/13f.*info.*\.xml$/.test(lower) || /info.*13f.*\.xml$/.test(lower)) return 90;
  if (/form13f.*\.xml$/.test(lower)) return 80;
  if (/13f.*\.xml$/.test(lower)) return 70;
  if (/primary.*\.xml$/.test(lower) || /\.xml$/.test(lower)) return 50;
  if (/primary.*\.(txt|htm|html)$/.test(lower) || /\.(txt|htm|html)$/.test(lower)) return 20;
  return 0;
}

function informationTableCandidates(items, primaryDocument, accessionNumber) {
  const seen = new Map();
  for (const item of items) {
    const name = String(item?.name ?? '').trim();
    const score = candidateScore(name);
    if (name && score > 0) seen.set(name, Math.max(seen.get(name) ?? 0, score));
  }
  if (primaryDocument) {
    const name = String(primaryDocument).trim();
    seen.set(name, Math.max(seen.get(name) ?? 0, 60));
  }
  if (accessionNumber) {
    const txtName = `${accessionNumber}.txt`;
    seen.set(txtName, Math.max(seen.get(txtName) ?? 0, 10));
  }
  return Array.from(seen.entries())
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);
}

function rawIdForHolding(accessionNumber, holding, managerCik) {
  const identifier =
    holding.cusip ||
    holding.ticker ||
    [holding.issuer, holding.title, holding.shares ?? 'shares-na', holding.value ?? 'value-na', holding.index ?? 'row-na']
      .map((value) => String(value ?? '').trim())
      .filter(Boolean)
      .join('|');
  return `${accessionNumber}:${identifier || 'unknown-holding'}:${managerCik}`;
}

function dedupeRowsByRawId(rows) {
  const unique = new Map();
  for (const row of rows) {
    if (!row?.raw_id) continue;
    unique.set(row.raw_id, row);
  }
  return {
    rows: Array.from(unique.values()),
    skippedDuplicateCount: rows.length - unique.size,
  };
}

function chunkRows(rows, size = CHUNK_SIZE) {
  const chunks = [];
  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }
  return chunks;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: secHeaders() });
  if (!response.ok) throw new Error(`${url} ${response.status}`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, { headers: secHeaders() });
  if (!response.ok) throw new Error(`${url} ${response.status}`);
  return response.text();
}

async function fetchInformationTableRows(managerCik, accessionNumber, primaryDocument) {
  const archiveCik = archiveCikPath(managerCik);
  const accession = accessionPath(accessionNumber);
  const baseUrl = `https://www.sec.gov/Archives/edgar/data/${archiveCik}/${accession}`;
  const warnings = [];
  let items = [];
  try {
    const index = await fetchJson(`${baseUrl}/index.json`);
    items = index?.directory?.item ?? [];
  } catch (error) {
    warnings.push(`index.json unavailable: ${errorMessage(error)}`);
  }

  const candidates = informationTableCandidates(items, primaryDocument, accessionNumber);
  for (const candidate of candidates) {
    const sourceUrl = `${baseUrl}/${candidate.name}`;
    try {
      const text = await fetchText(sourceUrl);
      const rows = parseInfoTable(text);
      const managerName = extractManagerName(text);
      if (rows.length) return { rows, sourceUrl, warning: warnings.join('; '), managerName };
      if (managerName && candidate.name === primaryDocument) {
        warnings.push(`${candidate.name}: manager name found but information table rows not found`);
      }
    } catch (error) {
      warnings.push(`${candidate.name}: ${errorMessage(error)}`);
    }
  }

  return {
    rows: [],
    sourceUrl: `${baseUrl}/`,
    warning: `information table XML not found${warnings.length ? ` (${warnings.slice(0, 3).join('; ')})` : ''}`,
    managerName: '',
  };
}

async function upsertRowsWithJwtRetry(table, rows, conflictColumns) {
  try {
    return await upsertRows(table, rows, conflictColumns);
  } catch (error) {
    if (!/jwt issued at future/i.test(errorMessage(error))) throw error;
    await wait(1500);
    return upsertRows(table, rows, conflictColumns);
  }
}

async function record13fSyncRun(payload) {
  try {
    return await recordSyncRun(payload);
  } catch (error) {
    if (!/jwt issued at future/i.test(errorMessage(error))) throw error;
    await wait(1500);
    try {
      return await recordSyncRun(payload);
    } catch (retryError) {
      console.warn(`[sync] sec-13f sync_runs write skipped after retry: ${errorMessage(retryError)}`);
      return null;
    }
  }
}

async function upsert13fRowsInChunks(rows) {
  let insertedCount = 0;
  let updatedCount = 0;
  let failedChunkCount = 0;
  const errors = [];
  const chunks = chunkRows(rows);

  for (let index = 0; index < chunks.length; index += 1) {
    const chunk = chunks[index];
    try {
      const result = await upsertRowsWithJwtRetry('ownership_trades', chunk, ['source', 'raw_id']);
      insertedCount += result.inserted ?? chunk.length;
      updatedCount += result.updated ?? 0;
    } catch (error) {
      failedChunkCount += 1;
      errors.push(`chunk ${index + 1}/${chunks.length}: ${errorMessage(error)}`);
    }
  }

  return { insertedCount, updatedCount, failedChunkCount, errors };
}

function sec13fSummary(status, successCount, partialCount, failedCount) {
  if (status === 'success') return '';
  if (status === 'skipped') return 'SEC_13F_MANAGER_CIKS missing. 13F sync skipped.';
  return `13F ${status}: ${successCount} managers success, ${partialCount} partial, ${failedCount} failed. See endpoint result for details.`;
}

export async function syncSec13F() {
  const startedAt = nowIso();
  let insertedCount = 0;
  let updatedCount = 0;
  let skippedDuplicateCount = 0;
  let totalRowsParsed = 0;
  let totalRowsDeduped = 0;
  const managers = managerCiks();
  const managerResults = [];

  // SEC 13F 파싱 구조:
  // 1. SEC_13F_MANAGER_CIKS에 운용사 CIK 목록 등록
  // 2. submissions에서 13F-HR accessionNumber 수집
  // 3. information table XML에서 cusip, issuer, shares, value 파싱
  // 4. unique key: accessionNumber + cusip + managerCik
  if (!managers.length) {
    const message = 'SEC_13F_MANAGER_CIKS missing. 13F sync skipped; mock smart-money data remains active.';
    await record13fSyncRun({ source: 'sec-13f', status: 'skipped', startedAt, errorMessage: message });
    return {
      source: 'sec-13f',
      status: 'skipped',
      insertedCount,
      updatedCount: 0,
      managerSuccessCount: 0,
      managerPartialCount: 0,
      managerFailedCount: 0,
      skippedDuplicateCount: 0,
      totalRowsParsed: 0,
      totalRowsDeduped: 0,
      errors: [message],
      managers: [],
    };
  }

  for (const managerCik of managers) {
    const managerStarted = nowIso();
    let normalizedCik = managerCik;
    let managerName = '';
    let managerRowsParsed = 0;
    let managerRowsDeduped = 0;
    let managerSkippedDuplicateCount = 0;
    let managerInserted = 0;
    let managerUpdated = 0;
    let managerFailedChunkCount = 0;
    let filingsChecked = 0;
    let filingSuccessCount = 0;
    const managerWarnings = [];
    const managerErrors = [];
    try {
      normalizedCik = normalizeCik(managerCik);
      const padded = paddedCik(normalizedCik);
      const payload = await fetchJson(`https://data.sec.gov/submissions/CIK${padded}.json`);
      managerName = resolveManagerName(normalizedCik, payload?.name);
      const recent = payload?.filings?.recent ?? {};
      const forms = recent.form ?? [];
      const accessionNumbers = recent.accessionNumber ?? [];
      const filingDates = recent.filingDate ?? [];
      const primaryDocuments = recent.primaryDocument ?? [];
      const filings = forms
        .map((form, index) => ({ form, index }))
        .filter(({ form }) => String(form).startsWith('13F'))
        .slice(0, 2);

      const allRows = [];
      for (const { index } of filings) {
        filingsChecked += 1;
        const accessionNumber = accessionNumbers[index];
        if (!accessionNumber) continue;
        const table = await fetchInformationTableRows(normalizedCik, accessionNumber, primaryDocuments[index]);
        if (table.warning) managerWarnings.push(`${accessionNumber}: ${table.warning}`);
        if (!table.rows.length) {
          managerWarnings.push(`${accessionNumber}: 13F information table rows not parsed; filing skipped.`);
          continue;
        }
        filingSuccessCount += 1;
        const filingManagerName = resolveManagerName(normalizedCik, payload?.name, table.managerName || managerName);
        if (!managerName || managerName.startsWith('Manager ')) managerName = filingManagerName;
        table.rows.forEach((holding) => {
          allRows.push({
            company_id: null,
            ticker: holding.ticker || holding.issuer || holding.cusip || null,
            investor_name: filingManagerName,
            investor_type: 'fund',
            action: 'holding',
            trade_date: null,
            disclosed_date: filingDates[index] ?? null,
            shares: holding.shares,
            price: null,
            amount: holding.value === null ? null : `${holding.value}000 USD`,
            source: 'sec-13f',
            source_url: table.sourceUrl,
            raw_id: rawIdForHolding(accessionNumber, holding, normalizedCik),
            created_at: nowIso(),
          });
        });
      }

      const deduped = dedupeRowsByRawId(allRows);
      managerRowsParsed = allRows.length;
      managerRowsDeduped = deduped.rows.length;
      managerSkippedDuplicateCount = deduped.skippedDuplicateCount;
      totalRowsParsed += managerRowsParsed;
      totalRowsDeduped += managerRowsDeduped;
      skippedDuplicateCount += managerSkippedDuplicateCount;

      const upsertResult = await upsert13fRowsInChunks(deduped.rows);
      managerInserted += upsertResult.insertedCount;
      managerUpdated += upsertResult.updatedCount;
      managerFailedChunkCount += upsertResult.failedChunkCount;
      managerErrors.push(...upsertResult.errors);

      insertedCount += managerInserted;
      updatedCount += managerUpdated;
      if (!filings.length) managerWarnings.push('No recent 13F filings found.');
      const status =
        managerErrors.length || managerWarnings.length || managerFailedChunkCount
          ? managerInserted || managerRowsDeduped || filingSuccessCount
            ? 'partial'
            : 'failed'
          : 'success';
      managerResults.push({
        managerCik: normalizedCik,
        managerName: resolveManagerName(normalizedCik, payload?.name, managerName),
        status,
        filingsChecked,
        rowsParsed: managerRowsParsed,
        rowsDeduped: managerRowsDeduped,
        insertedCount: managerInserted,
        updatedCount: managerUpdated,
        skippedDuplicateCount: managerSkippedDuplicateCount,
        failedChunkCount: managerFailedChunkCount,
        warnings: managerWarnings,
        errors: managerErrors,
        startedAt: managerStarted,
        endedAt: nowIso(),
      });
    } catch (error) {
      const message = `${managerCik}: ${errorMessage(error)}`;
      managerResults.push({
        managerCik: normalizedCik,
        managerName: resolveManagerName(normalizedCik),
        status: 'failed',
        filingsChecked,
        rowsParsed: managerRowsParsed,
        rowsDeduped: managerRowsDeduped,
        insertedCount: 0,
        updatedCount: 0,
        skippedDuplicateCount: managerSkippedDuplicateCount,
        failedChunkCount: managerFailedChunkCount,
        warnings: managerWarnings,
        errors: [message],
        startedAt: managerStarted,
        endedAt: nowIso(),
      });
    }
  }

  const managerSuccessCount = managerResults.filter((manager) => manager.status === 'success').length;
  const managerPartialCount = managerResults.filter((manager) => manager.status === 'partial').length;
  const managerFailedCount = managerResults.filter((manager) => manager.status === 'failed').length;
  const status = managerFailedCount === managers.length ? 'failed' : managerPartialCount || managerFailedCount ? 'partial' : 'success';
  const errors = managerResults.flatMap((manager) => manager.errors ?? []);
  const summary = sec13fSummary(status, managerSuccessCount, managerPartialCount, managerFailedCount);
  await record13fSyncRun({ source: 'sec-13f', status, startedAt, insertedCount, updatedCount, errorMessage: summary });
  return {
    source: 'sec-13f',
    status,
    insertedCount,
    updatedCount,
    managerSuccessCount,
    managerPartialCount,
    managerFailedCount,
    skippedDuplicateCount,
    totalRowsParsed,
    totalRowsDeduped,
    errors,
    managers: managerResults,
  };
}

if (isDirectRun(import.meta.url)) {
  syncSec13F()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch(async (error) => {
      await record13fSyncRun({ source: 'sec-13f', status: 'failed', startedAt: nowIso(), errorMessage: errorMessage(error) });
      console.error(error);
      globalThis.process?.exit?.(1);
    });
}

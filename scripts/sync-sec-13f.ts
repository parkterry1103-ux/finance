import { errorMessage, envValue, isDirectRun, nowIso, recordSyncRun, secHeaders, upsertRows } from './sync-utils.js';

function managerCiks() {
  return envValue('SEC_13F_MANAGER_CIKS')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
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

function parseInfoTable(xml) {
  const blocks = xml.match(/<(?:[A-Za-z0-9_]+:)?infoTable[\s\S]*?<\/(?:[A-Za-z0-9_]+:)?infoTable>/gi) ?? [];
  return blocks
    .map((block) => {
      const issuer = tagValue(block, 'nameOfIssuer');
      const cusip = tagValue(block, 'cusip').toUpperCase();
      const shares = numericValue(tagValue(block, 'sshPrnamt'));
      const value = numericValue(tagValue(block, 'value'));
      const title = tagValue(block, 'titleOfClass');
      if (!cusip && !issuer) return null;
      return { issuer, cusip, shares, value, title };
    })
    .filter(Boolean);
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

async function fetchInformationTableRows(managerCik, accessionNumber) {
  const archiveCik = archiveCikPath(managerCik);
  const accession = accessionPath(accessionNumber);
  const baseUrl = `https://www.sec.gov/Archives/edgar/data/${archiveCik}/${accession}`;
  const index = await fetchJson(`${baseUrl}/index.json`);
  const items = index?.directory?.item ?? [];
  const infoFile =
    items.find((item) => /info.*table.*\.xml$/i.test(String(item.name))) ??
    items.find((item) => /form13f.*\.xml$/i.test(String(item.name))) ??
    items.find((item) => /13f.*\.xml$/i.test(String(item.name)));
  if (!infoFile?.name) return { rows: [], sourceUrl: `${baseUrl}/`, warning: 'information table XML not found' };

  const xml = await fetchText(`${baseUrl}/${infoFile.name}`);
  return { rows: parseInfoTable(xml), sourceUrl: `${baseUrl}/${infoFile.name}`, warning: '' };
}

export async function syncSec13F() {
  const startedAt = nowIso();
  let insertedCount = 0;
  let updatedCount = 0;
  const errors = [];
  const managers = managerCiks();
  const managerResults = [];

  // SEC 13F 파싱 구조:
  // 1. SEC_13F_MANAGER_CIKS에 운용사 CIK 목록 등록
  // 2. submissions에서 13F-HR accessionNumber 수집
  // 3. information table XML에서 cusip, issuer, shares, value 파싱
  // 4. unique key: accessionNumber + cusip + managerCik
  if (!managers.length) {
    const message = 'SEC_13F_MANAGER_CIKS missing. 13F sync skipped; mock smart-money data remains active.';
    await recordSyncRun({ source: 'sec-13f', status: 'skipped', startedAt, errorMessage: message });
    return { source: 'sec-13f', status: 'skipped', insertedCount, updatedCount: 0, errors: [message] };
  }

  for (const managerCik of managers) {
    const managerStarted = nowIso();
    try {
      const normalizedCik = normalizeCik(managerCik);
      const paddedCik = normalizedCik.padStart(10, '0');
      const payload = await fetchJson(`https://data.sec.gov/submissions/CIK${paddedCik}.json`);
      const recent = payload?.filings?.recent ?? {};
      const forms = recent.form ?? [];
      const accessionNumbers = recent.accessionNumber ?? [];
      const filingDates = recent.filingDate ?? [];
      const filings = forms
        .map((form, index) => ({ form, index }))
        .filter(({ form }) => String(form).startsWith('13F'))
        .slice(0, 2);

      let managerInserted = 0;
      const managerWarnings = [];
      for (const { form, index } of filings) {
        const accessionNumber = accessionNumbers[index];
        if (!accessionNumber) continue;
        const table = await fetchInformationTableRows(normalizedCik, accessionNumber);
        if (table.warning) managerWarnings.push(`${accessionNumber}: ${table.warning}`);
        const rows = table.rows.map((holding) => ({
          company_id: null,
          ticker: null,
          investor_name: payload.name ?? `Manager ${normalizedCik}`,
          investor_type: 'fund',
          action: 'holding',
          trade_date: null,
          disclosed_date: filingDates[index] ?? null,
          shares: holding.shares,
          price: null,
          amount: holding.value === null ? null : `${holding.value}000 USD`,
          source: 'sec-13f',
          source_url: table.sourceUrl,
          raw_id: `${accessionNumber}:${holding.cusip || holding.issuer}:${normalizedCik}`,
          created_at: nowIso(),
        }));

        if (!rows.length) continue;
        const result = await upsertRows('ownership_trades', rows, ['source', 'raw_id']);
        managerInserted += result.inserted ?? rows.length;
        updatedCount += result.updated ?? 0;
      }

      insertedCount += managerInserted;
      managerResults.push({
        managerCik: normalizedCik,
        managerName: payload.name ?? `Manager ${normalizedCik}`,
        status: managerWarnings.length ? 'partial' : 'success',
        filingsChecked: filings.length,
        insertedCount: managerInserted,
        warnings: managerWarnings,
        startedAt: managerStarted,
        endedAt: nowIso(),
      });
    } catch (error) {
      const message = `${managerCik}: ${errorMessage(error)}`;
      errors.push(message);
      managerResults.push({
        managerCik,
        status: 'failed',
        insertedCount: 0,
        errors: [message],
        startedAt: managerStarted,
        endedAt: nowIso(),
      });
    }
  }

  const status = errors.length === managers.length ? 'failed' : errors.length ? 'partial' : 'success';
  await recordSyncRun({ source: 'sec-13f', status, startedAt, insertedCount, updatedCount, errorMessage: errors.join('\n') });
  return { source: 'sec-13f', status, insertedCount, updatedCount, errors, managers: managerResults };
}

if (isDirectRun(import.meta.url)) {
  syncSec13F()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch(async (error) => {
      await recordSyncRun({ source: 'sec-13f', status: 'failed', startedAt: nowIso(), errorMessage: errorMessage(error) });
      console.error(error);
      globalThis.process?.exit?.(1);
    });
}

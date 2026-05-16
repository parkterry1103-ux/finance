import { errorMessage, envValue, isDirectRun, nowIso, recordSyncRun, secHeaders, upsertRows } from './sync-utils.ts';

function managerCiks() {
  return envValue('SEC_13F_MANAGER_CIKS')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function syncSec13F() {
  const startedAt = nowIso();
  let insertedCount = 0;
  const errors = [];
  const managers = managerCiks();

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
    try {
      const paddedCik = managerCik.padStart(10, '0');
      const response = await fetch(`https://data.sec.gov/submissions/CIK${paddedCik}.json`, { headers: secHeaders() });
      if (!response.ok) throw new Error(`SEC submissions ${response.status}`);
      const payload = await response.json();
      const recent = payload?.filings?.recent ?? {};
      const forms = recent.form ?? [];
      const accessionNumbers = recent.accessionNumber ?? [];
      const filingDates = recent.filingDate ?? [];
      const rows = forms
        .map((form, index) => ({ form, index }))
        .filter(({ form }) => String(form).startsWith('13F'))
        .slice(0, 4)
        .map(({ form, index }) => ({
          company_id: null,
          ticker: null,
          investor_name: payload.name ?? `Manager ${managerCik}`,
          investor_type: 'fund',
          action: 'holding',
          trade_date: null,
          disclosed_date: filingDates[index] ?? null,
          shares: null,
          price: null,
          amount: null,
          source: form,
          source_url: `https://www.sec.gov/Archives/edgar/data/${Number(managerCik)}/${String(accessionNumbers[index]).replace(/-/g, '')}/`,
          raw_id: `${accessionNumbers[index]}:${managerCik}`,
          created_at: nowIso(),
        }));

      if (!rows.length) continue;
      await upsertRows('ownership_trades', rows, ['raw_id']);
      insertedCount += rows.length;
    } catch (error) {
      errors.push(`${managerCik}: ${errorMessage(error)}`);
    }
  }

  const status = errors.length ? 'partial' : 'success';
  await recordSyncRun({ source: 'sec-13f', status, startedAt, insertedCount, updatedCount: 0, errorMessage: errors.join('\n') });
  return { source: 'sec-13f', status, insertedCount, updatedCount: 0, errors };
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

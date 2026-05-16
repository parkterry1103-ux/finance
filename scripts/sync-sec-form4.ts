import { companies } from '../src/data.js';
import { errorMessage, isDirectRun, nowIso, recordSyncRun, secHeaders, upsertRows } from './sync-utils.js';

const FORM4_FORMS = new Set(['3', '4', '5']);

function recentOwnerFilingRows(company, recent) {
  const forms = recent?.form ?? [];
  const accessionNumbers = recent?.accessionNumber ?? [];
  const filingDates = recent?.filingDate ?? [];
  const primaryDocuments = recent?.primaryDocument ?? [];

  return forms
    .map((form, index) => ({ form, index }))
    .filter(({ form }) => FORM4_FORMS.has(String(form)))
    .slice(0, 12)
    .map(({ form, index }) => {
      const accessionNumber = accessionNumbers[index];
      const compactAccession = String(accessionNumber).replace(/-/g, '');
      const rawUrl = company.cik && accessionNumber && primaryDocuments[index]
        ? `https://www.sec.gov/Archives/edgar/data/${Number(company.cik)}/${compactAccession}/${primaryDocuments[index]}`
        : null;

      return {
        company_id: company.id,
        ticker: company.ticker ?? null,
        investor_name: 'SEC insider filing',
        investor_type: 'insider',
        action: 'unknown',
        trade_date: null,
        disclosed_date: filingDates[index] ?? null,
        shares: null,
        price: null,
        amount: null,
        source: `SEC Form ${form}`,
        source_url: rawUrl,
        raw_id: accessionNumber,
        created_at: nowIso(),
      };
    });
}

export async function syncSecForm4() {
  const startedAt = nowIso();
  let insertedCount = 0;
  const errors = [];

  // SEC Form 3/4/5 XML 파싱 구조:
  // 1. submissions/CIK##########.json에서 최근 insider filing accessionNumber 수집
  // 2. Archives XML primary document를 내려받아 ownerCik, securityTitle, shares, transactionDate 파싱
  // 3. unique key: accessionNumber + ownerCik + transactionDate + securityTitle + shares
  // 현재 단계는 무료 SEC 공식 데이터 수집 구조와 filing-level fallback 저장을 준비합니다.
  for (const company of companies.filter((item) => item.country === 'US' && item.cik)) {
    try {
      const paddedCik = company.cik.padStart(10, '0');
      const response = await fetch(`https://data.sec.gov/submissions/CIK${paddedCik}.json`, { headers: secHeaders() });
      if (!response.ok) throw new Error(`SEC submissions ${response.status}`);
      const payload = await response.json();
      const rows = recentOwnerFilingRows(company, payload?.filings?.recent);
      if (!rows.length) continue;
      await upsertRows('ownership_trades', rows, ['source', 'raw_id']);
      insertedCount += rows.length;
    } catch (error) {
      errors.push(`${company.name}: ${errorMessage(error)}`);
    }
  }

  const status = errors.length ? 'partial' : 'success';
  await recordSyncRun({ source: 'sec-form4', status, startedAt, insertedCount, updatedCount: 0, errorMessage: errors.join('\n') });
  return { source: 'sec-form4', status, insertedCount, updatedCount: 0, errors };
}

if (isDirectRun(import.meta.url)) {
  syncSecForm4()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch(async (error) => {
      await recordSyncRun({ source: 'sec-form4', status: 'failed', startedAt: nowIso(), errorMessage: errorMessage(error) });
      console.error(error);
      globalThis.process?.exit?.(1);
    });
}

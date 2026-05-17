import { companies } from '../src/data.js';
import { resolveCompanyFilingLinks } from '../src/services/filings.js';
import { isDirectRun } from './sync-utils.js';

function auditFilingLinks() {
  const rows = companies.map((company) => {
    const resolved = resolveCompanyFilingLinks(company);
    return {
      companyId: company.id,
      companyName: company.name,
      market: company.country,
      ticker: company.ticker ?? '',
      sourceStatus: resolved.status,
      reportType: company.reportType ?? '',
      fiscalYear: company.fiscalYear ?? '',
      fiscalPeriod: company.fiscalPeriod ?? '',
      filingDate: company.filingDate ?? '',
      dartCorpCode: company.corpCode ?? '',
      secCik: company.cik ?? '',
      hasSourceSearchUrl: Boolean(company.sourceSearchUrl),
      sourceSearchUrl: company.sourceSearchUrl ?? '',
    };
  });

  const summary = {
    totalCompanies: rows.length,
    direct: rows.filter((row) => row.sourceStatus === 'direct').length,
    searchOnly: rows.filter((row) => row.sourceStatus === 'search-only').length,
    needsLink: rows.filter((row) => row.sourceStatus === 'needs-link').length,
  };

  const needsLinkCompanies = rows.filter((row) => row.sourceStatus === 'needs-link');
  const searchOnlyCompanies = rows.filter((row) => row.sourceStatus === 'search-only');

  return {
    summary,
    needsLinkCompanies,
    searchOnlyCompanies,
  };
}

export { auditFilingLinks };

if (isDirectRun(import.meta.url)) {
  console.log(JSON.stringify(auditFilingLinks(), null, 2));
}

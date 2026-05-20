import { companies } from '../src/data.js';
import { resolveCompanyFilingLinks } from '../src/services/filings.js';
import { inferCompanyListing } from '../src/services/listing.js';
import { isDirectRun } from './sync-utils.js';

function auditFilingLinks() {
  const rows = companies.map((company) => {
    const resolved = resolveCompanyFilingLinks(company);
    const listing = inferCompanyListing(company);
    const hasOfficialNumber =
      company.sourceType === 'official' &&
      !['원문확인', '원문 확인', 'DART 원문 확인', 'SEC 원문 확인'].includes(String(company.revenue ?? '')) &&
      !String(company.revenue ?? '').includes('확인');
    return {
      companyId: company.id,
      companyName: company.name,
      market: listing.market,
      ticker: company.ticker ?? '',
      listed: listing.listed,
      listingStatus: listing.listingStatus,
      sourceStatus: resolved.status,
      reportType: company.reportType ?? '',
      fiscalYear: company.fiscalYear ?? '',
      fiscalPeriod: company.fiscalPeriod ?? '',
      filingDate: company.filingDate ?? '',
      dartCorpCode: company.corpCode ?? '',
      secCik: company.cik ?? '',
      hasSourceSearchUrl: Boolean(company.sourceSearchUrl),
      sourceSearchUrl: company.sourceSearchUrl ?? '',
      hasOfficialNumber,
    };
  });

  const summary = {
    totalCompanies: rows.length,
    listedCompanies: rows.filter((row) => row.listed).length,
    privateReferenceCompanies: rows.filter((row) => row.sourceStatus === 'private-company').length,
    listingUnknown: rows.filter((row) => row.sourceStatus === 'listing-unknown').length,
    direct: rows.filter((row) => row.sourceStatus === 'direct').length,
    searchOnly: rows.filter((row) => row.sourceStatus === 'search-only').length,
    needsLink: rows.filter((row) => row.sourceStatus === 'needs-link').length,
    privateCompany: rows.filter((row) => row.sourceStatus === 'private-company').length,
    noPublicFiling: rows.filter((row) => row.sourceStatus === 'no-public-filing').length,
  };

  const needsLinkCompanies = rows.filter((row) => row.sourceStatus === 'needs-link');
  const searchOnlyCompanies = rows.filter((row) => row.sourceStatus === 'search-only');
  const listingUnknownCompanies = rows.filter((row) => row.sourceStatus === 'listing-unknown');
  const officialNumbersWithoutFiling = rows.filter(
    (row) => row.hasOfficialNumber && row.sourceStatus !== 'direct' && row.sourceStatus !== 'search-only',
  );
  const privateOrNoPublicCompanies = rows.filter(
    (row) => row.sourceStatus === 'private-company' || row.sourceStatus === 'no-public-filing',
  );

  return {
    summary,
    needsLinkCompanies,
    searchOnlyCompanies,
    listingUnknownCompanies,
    officialNumbersWithoutFiling,
    privateOrNoPublicCompanies,
  };
}

export { auditFilingLinks };

if (isDirectRun(import.meta.url)) {
  console.log(JSON.stringify(auditFilingLinks(), null, 2));
}

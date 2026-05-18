import { companies } from '../src/data.js';
import {
  displayMarketForCompany,
  inferCompanyListing,
  isFilingSyncTarget,
  isPriceSyncTarget,
  isTradableTicker,
} from '../src/services/listing.js';
import { isDirectRun } from './sync-utils.js';

const listedMarketPattern = /^(KOSPI|KOSDAQ|KONEX|NASDAQ|NYSE|AMEX|OTC|KRX|NYSE\/ADR)$/i;

function briefCompany(company) {
  const listing = inferCompanyListing(company);
  return {
    companyId: company.id,
    companyName: company.name,
    tier: company.tier,
    market: listing.market,
    ticker: company.ticker ?? '',
    dartCorpCode: company.corpCode ?? '',
    secCik: company.cik ?? '',
    listingStatus: listing.listingStatus,
    filingStatus: listing.filingStatus,
    reasons: listing.reasons,
  };
}

function auditCompanyListingStatus() {
  const rows = companies.map((company) => ({ company, listing: inferCompanyListing(company) }));
  const tickerButPrivate = rows
    .filter(({ company, listing }) => isTradableTicker(company.ticker) && !listing.listed)
    .map(({ company }) => briefCompany(company));
  const dartCorpCodeButPrivate = rows
    .filter(({ company, listing }) => Boolean(company.corpCode) && !listing.listed)
    .map(({ company }) => briefCompany(company));
  const secCikButPrivate = rows
    .filter(({ company, listing }) => Boolean(company.cik) && !listing.listed)
    .map(({ company }) => briefCompany(company));
  const listedMarketButNotListed = rows
    .filter(({ company, listing }) => {
      const market = displayMarketForCompany(company);
      return listedMarketPattern.test(market) && !listing.listed;
    })
    .map(({ company }) => briefCompany(company));
  const listedMissingPriceSyncTarget = rows
    .filter(({ listing, company }) => listing.listed && isTradableTicker(company.ticker) && !isPriceSyncTarget(company))
    .map(({ company }) => briefCompany(company));
  const listedMissingFilingTarget = rows
    .filter(({ listing, company }) => listing.listed && !isFilingSyncTarget(company))
    .map(({ company }) => briefCompany(company));

  return {
    summary: {
      totalCompanies: rows.length,
      listedCompanies: rows.filter(({ listing }) => listing.listed).length,
      privateCompanies: rows.filter(({ listing }) => listing.listingStatus === 'private').length,
      unknownCompanies: rows.filter(({ listing }) => listing.listingStatus === 'unknown').length,
      noPublicFilingCompanies: rows.filter(({ listing }) => listing.listingStatus === 'no-public-filing').length,
      priceSyncTargets: rows.filter(({ company }) => isPriceSyncTarget(company)).length,
      filingSyncTargets: rows.filter(({ company }) => isFilingSyncTarget(company)).length,
    },
    suspicious: {
      tickerButPrivate,
      dartCorpCodeButPrivate,
      secCikButPrivate,
      listedMarketButNotListed,
      listedMissingPriceSyncTarget,
      listedMissingFilingTarget,
    },
    sampleListedSuppliers: rows
      .filter(({ company }) => ['주성엔지니어링', '한미반도체', '리노공업', 'ISC', '원익IPS', '솔브레인'].includes(company.name))
      .map(({ company }) => briefCompany(company)),
  };
}

export { auditCompanyListingStatus };

if (isDirectRun(import.meta.url)) {
  console.log(JSON.stringify(auditCompanyListingStatus(), null, 2));
}

import { companyProfiles } from './entries.js';
import { canonicalCompanyProfileIdentity, companyProfilePath } from './paths.js';
import type { CompanySearchRecord } from './types.js';

export function normalizeCompanySearchTerm(value: string) {
  return value
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('en-US')
    .replace(/[\p{P}\p{S}\s]+/gu, '');
}

export const companySearchIndex: CompanySearchRecord[] = companyProfiles
  .slice()
  .sort((left, right) => left.order - right.order)
  .flatMap((profile) => {
    if (!profile.searchStatus.searchVisible || !profile.sourceRefs.length) return [];
    const company = canonicalCompanyProfileIdentity(profile.companyId);
    if (!company) return [];
    return [{
      company,
      profile,
      searchableTerms: [
        company.name,
        profile.englishName,
        company.ticker,
        profile.stockCode,
        ...profile.aliases,
      ].filter((term): term is string => Boolean(term?.trim())),
    }];
  });

function searchRank(record: CompanySearchRecord, normalizedQuery: string) {
  const ticker = normalizeCompanySearchTerm(record.company.ticker);
  const stockCode = normalizeCompanySearchTerm(record.profile.stockCode ?? '');
  const officialName = normalizeCompanySearchTerm(record.company.name);
  const englishName = normalizeCompanySearchTerm(record.profile.englishName);
  const aliases = record.profile.aliases.map(normalizeCompanySearchTerm);
  const terms = record.searchableTerms.map(normalizeCompanySearchTerm);

  if (ticker === normalizedQuery || stockCode === normalizedQuery) return 1;
  if (officialName === normalizedQuery || englishName === normalizedQuery) return 2;
  if (aliases.includes(normalizedQuery)) return 3;
  if (officialName.startsWith(normalizedQuery)) return 4;
  if (englishName.startsWith(normalizedQuery)) return 5;
  if (aliases.some((alias) => alias.startsWith(normalizedQuery))) return 6;
  if (terms.some((term) => term.includes(normalizedQuery))) return 7;
  return Number.POSITIVE_INFINITY;
}

export function searchCompanyProfiles(query: string) {
  if (!query.trim()) return companySearchIndex.slice();
  const normalizedQuery = normalizeCompanySearchTerm(query);
  if (!normalizedQuery) return [];

  return companySearchIndex
    .map((record, index) => ({ record, index, rank: searchRank(record, normalizedQuery) }))
    .filter(({ rank }) => Number.isFinite(rank))
    .sort((left, right) => left.rank - right.rank || left.index - right.index)
    .filter(({ record }, index, results) => results.findIndex(({ record: candidate }) => candidate.profile.slug === record.profile.slug) === index)
    .map(({ record }) => record);
}

export function companySearchRecordPath(record: CompanySearchRecord) {
  return companyProfilePath(record.profile);
}

import type { DartTrackedCompany } from './types.js';

export const dartTrackedCompanies: DartTrackedCompany[] = [
  {
    id: 'dongyang-pile',
    companyName: '동양파일',
    ticker: '228340.KQ',
    corpCode: '00993931',
    source: 'current-pick',
    enabled: true,
  },
  {
    id: 'kcc',
    companyName: 'KCC',
    ticker: '002380.KS',
    corpCode: '00105271',
    source: 'current-pick',
    enabled: true,
  },
  {
    id: 'jeju-semiconductor',
    companyName: '제주반도체',
    ticker: '080220.KQ',
    corpCode: '00447487',
    source: 'current-pick',
    enabled: true,
  },
  {
    id: 'hyundai-engineering-construction',
    companyName: '현대건설',
    ticker: '000720.KS',
    corpCode: '00164478',
    source: 'market-map',
    enabled: true,
  },
  {
    id: 'samsung-ct',
    companyName: '삼성물산',
    ticker: '028260.KS',
    corpCode: '00149655',
    source: 'market-map',
    enabled: true,
  },
  {
    id: 'daewoo-engineering-construction',
    companyName: '대우건설',
    ticker: '047040.KS',
    corpCode: '00124540',
    source: 'market-map',
    enabled: true,
  },
  {
    id: 'hd-hyundai-infracore',
    companyName: 'HD현대인프라코어',
    ticker: '042670.KS',
    corpCode: '00344287',
    source: 'market-map',
    enabled: true,
  },
  {
    id: 'posco-holdings',
    companyName: 'POSCO홀딩스',
    ticker: '005490.KS',
    corpCode: '00155319',
    source: 'market-map',
    enabled: true,
  },
  {
    id: 'ls-electric',
    companyName: 'LS ELECTRIC',
    ticker: '010120.KS',
    corpCode: '00105855',
    source: 'market-map',
    enabled: true,
  },
  {
    id: 'hyosung-heavy-industries',
    companyName: '효성중공업',
    ticker: '298040.KS',
    corpCode: '01316245',
    source: 'market-map',
    enabled: true,
  },
];

export const enabledDartTrackedCompanies = dartTrackedCompanies.filter((company) => company.enabled);

export const currentPickDisclosureTickers = new Set(
  dartTrackedCompanies.filter((company) => company.source === 'current-pick').map((company) => company.ticker),
);

export const marketMapDisclosureTickers = new Set([
  '000720.KS',
  '028260.KS',
  '047040.KS',
  '042670.KS',
  '005490.KS',
  '228340.KQ',
  '010120.KS',
  '298040.KS',
  '002380.KS',
]);

export function findDartTrackedCompanyByTicker(ticker?: string | null) {
  if (!ticker) return undefined;
  const normalized = ticker.trim().toUpperCase();
  return enabledDartTrackedCompanies.find((company) => company.ticker.toUpperCase() === normalized);
}

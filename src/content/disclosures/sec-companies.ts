import { secDefaultForms } from './sec-categories.js';
import type { SecTrackedCompany } from './types.js';

export const secTrackedCompanies: SecTrackedCompany[] = [
  {
    id: 'meta-platforms',
    companyName: 'Meta',
    ticker: 'META',
    cik: '0001326801',
    source: 'current-pick',
    enabled: true,
    forms: [...secDefaultForms, 'SC 13D', 'SC 13G', 'DEF 14A'],
    relatedPickIds: ['pick-meta-ai-compute-cloud-option'],
  },
  {
    id: 'hertz-global',
    companyName: 'Hertz',
    ticker: 'HTZ',
    cik: '0001657853',
    source: 'historic-pick',
    enabled: true,
    forms: [...secDefaultForms, 'S-3', '424B'],
    relatedPickIds: ['pick-hertz-used-car-depreciation-financing'],
  },
  {
    id: 'huntsman',
    companyName: 'Huntsman',
    ticker: 'HUN',
    cik: '0001307954',
    source: 'historic-pick',
    enabled: true,
    forms: [...secDefaultForms, 'S-4', 'DEF 14A', 'SC 13D', 'SC 13G'],
    relatedPickIds: ['pick-huntsman-olin-merger-exchange-ratio'],
  },
  {
    id: 'uniqure',
    companyName: 'uniQure',
    ticker: 'QURE',
    cik: '0001590560',
    source: 'historic-pick',
    enabled: true,
    foreignIssuer: true,
    forms: ['6-K', '20-F', '8-K', '10-Q', '10-K', '4'],
    relatedPickIds: ['pick-uniqure-amt130-fda-regulatory-path'],
  },
  {
    id: 'marvell-technology',
    companyName: 'Marvell',
    ticker: 'MRVL',
    cik: '0001835632',
    source: 'historic-pick',
    enabled: true,
    forms: [...secDefaultForms, 'SC 13D', 'SC 13G'],
    relatedPickIds: ['pick-marvell-nvlink-fusion-ai-interconnect'],
    relatedCompanyIds: ['ai-datacenter-marvell'],
  },
  {
    id: 'taylor-morrison-home',
    companyName: 'Taylor Morrison',
    ticker: 'TMHC',
    cik: '0001562476',
    source: 'historic-pick',
    enabled: true,
    forms: [...secDefaultForms, 'DEF 14A', 'SC 13D', 'SC 13G'],
    relatedPickIds: ['pick-taylor-morrison-berkshire-acquisition'],
  },
  {
    id: 'super-micro-computer',
    companyName: 'Super Micro Computer',
    ticker: 'SMCI',
    cik: '0001375365',
    source: 'historic-pick',
    enabled: true,
    forms: [...secDefaultForms, 'S-3', '424B', 'SC 13D', 'SC 13G'],
    relatedPickIds: ['pick-smci-ai-server-funding-dilution'],
    relatedCompanyIds: ['ai-datacenter-supermicro'],
  },
  {
    id: 'draftkings',
    companyName: 'DraftKings',
    ticker: 'DKNG',
    cik: '0001883685',
    source: 'historic-pick',
    enabled: true,
    forms: [...secDefaultForms, 'SC 13D', 'SC 13G'],
    relatedPickIds: ['pick-draftkings-sports-prediction-platform'],
  },
  {
    id: 'micron-technology',
    companyName: 'Micron',
    ticker: 'MU',
    cik: '0000723125',
    source: 'historic-pick',
    enabled: true,
    forms: [...secDefaultForms, 'SC 13D', 'SC 13G'],
    relatedPickIds: ['pick-micron-ai-memory-hbm-demand'],
    relatedCompanyIds: ['ai-datacenter-micron'],
  },
  {
    id: 'dell-technologies',
    companyName: 'Dell',
    ticker: 'DELL',
    cik: '0001571996',
    source: 'historic-pick',
    enabled: true,
    forms: [...secDefaultForms, 'SC 13D', 'SC 13G'],
    relatedPickIds: ['pick-dell-ai-server-earnings-check', 'pick-dell-ai-server-demand'],
    relatedCompanyIds: ['ai-datacenter-dell'],
  },
  {
    id: 'snowflake',
    companyName: 'Snowflake',
    ticker: 'SNOW',
    cik: '0001640147',
    source: 'historic-pick',
    enabled: true,
    forms: [...secDefaultForms, 'SC 13D', 'SC 13G'],
    relatedPickIds: ['pick-snowflake-ai-data-platform'],
  },
  {
    id: 'nvidia',
    companyName: 'NVIDIA',
    ticker: 'NVDA',
    cik: '0001045810',
    source: 'historic-pick',
    enabled: true,
    forms: [...secDefaultForms, 'SC 13D', 'SC 13G'],
    relatedPickIds: ['pick-nvidia-ai-demand'],
    relatedCompanyIds: ['us-semiconductors-nvidia'],
  },
];

export const enabledSecTrackedCompanies = secTrackedCompanies.filter((company) => company.enabled);

export const currentPickSecTickers = new Set(
  enabledSecTrackedCompanies.filter((company) => company.source === 'current-pick').map((company) => company.ticker),
);

export function findSecTrackedCompanyByTicker(ticker?: string | null) {
  if (!ticker) return undefined;
  const normalized = ticker.trim().toUpperCase();
  return enabledSecTrackedCompanies.find((company) => company.ticker.toUpperCase() === normalized);
}

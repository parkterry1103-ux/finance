import type { IndustryClassificationSource } from './types.js';

export function classificationSources(input: {
  gicsSector: string;
  gicsIndustry: string;
  icbSector: string;
  icbIndustry: string;
  marketProvider: string;
  marketSector: string;
  marketIndustry: string;
  marketUrl: string;
}): IndustryClassificationSource[] {
  return [
    {
      provider: 'S&P Global · GICS',
      sector: input.gicsSector,
      industry: input.gicsIndustry,
      url: 'https://www.spglobal.com/spdji/en/landing/topic/gics/',
      retrievedAt: '2026-07-24',
    },
    {
      provider: 'FTSE Russell · ICB',
      sector: input.icbSector,
      industry: input.icbIndustry,
      url: 'https://www.lseg.com/en/ftse-russell/industry-classification-benchmark-icb',
      retrievedAt: '2026-07-24',
    },
    {
      provider: input.marketProvider,
      sector: input.marketSector,
      industry: input.marketIndustry,
      url: input.marketUrl,
      retrievedAt: '2026-07-24',
    },
  ];
}

import type { DailyStockDissection, EditorialSource, ThreeReadsEdition } from './types.js';

export const editorialSources: EditorialSource[] = [];

export const stockDissectionRegistry = [
  {
    id: 'paypal-control-premium-draft',
    slug: 'paypal-control-premium-draft',
    load: () => import('./stock-dissections/2026-07-17-paypal-control-premium-draft.js').then((module) => module.paypalControlPremiumDraft),
  },
] as const;

export const threeReadsRegistry = [
  {
    id: 'three-reads-2026-07-17-standards-set-price',
    slug: '2026-07-17-standards-set-price',
    load: () => import('./three-reads/2026-07-17-standards-set-price.js').then((module) => module.standardsSetPriceEdition),
  },
  {
    id: 'three-reads-switching-power-draft',
    slug: 'switching-power-draft',
    load: () => import('./three-reads/2026-07-17-switching-power-draft.js').then((module) => module.switchingPowerDraft),
  },
] as const;

export async function loadStockDissection(slug: string): Promise<DailyStockDissection | undefined> {
  return stockDissectionRegistry.find((entry) => entry.slug === slug)?.load();
}

export async function loadThreeReadsEdition(slug: string): Promise<ThreeReadsEdition | undefined> {
  return threeReadsRegistry.find((entry) => entry.slug === slug)?.load();
}

export async function loadEditorialRegistry() {
  const [stockDissections, threeReadsEditions] = await Promise.all([
    Promise.all(stockDissectionRegistry.map((entry) => entry.load())),
    Promise.all(threeReadsRegistry.map((entry) => entry.load())),
  ]);
  return { stockDissections, threeReadsEditions, sources: editorialSources };
}

import type { EventImpactCompanySlug, EventImpactRecord, ValuationAssumptionChange } from './types.js';

export const eventImpactCompanySlugs = ['nvidia', 'meta', 'netflix'] as const;

const loaders: Record<EventImpactCompanySlug, () => Promise<{ default: EventImpactRecord[] }>> = {
  nvidia: () => import('./entries/nvidia.js'),
  meta: () => import('./entries/meta.js'),
  netflix: () => import('./entries/netflix.js'),
};

const editorialImpactCompanyIndex: Record<string, EventImpactCompanySlug> = {
  'stock-2026-07-18-netflix-guidance-disclosure-reset': 'netflix',
};

export const valuationAssumptionChanges: ValuationAssumptionChange[] = [];

export function isEventImpactCompanySlug(value: string): value is EventImpactCompanySlug {
  return eventImpactCompanySlugs.includes(value as EventImpactCompanySlug);
}

export async function loadEventImpacts(companySlug: string): Promise<EventImpactRecord[]> {
  if (!isEventImpactCompanySlug(companySlug)) return [];
  return (await loaders[companySlug]()).default;
}

export async function loadEditorialEventImpacts(editorialId: string): Promise<EventImpactRecord[]> {
  const companySlug = editorialImpactCompanyIndex[editorialId];
  if (!companySlug) return [];
  return (await loadEventImpacts(companySlug)).filter((impact) => impact.event.editorialId === editorialId);
}

export async function loadAllEventImpacts(): Promise<EventImpactRecord[]> {
  return (await Promise.all(eventImpactCompanySlugs.map((slug) => loadEventImpacts(slug)))).flat();
}

export function editorialImpactIndexEntries() {
  return Object.entries(editorialImpactCompanyIndex);
}

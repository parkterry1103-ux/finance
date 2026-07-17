import type { ResearchReportSlug } from '../research-reports/registry.js';
import type { MonteCarloValuationResult } from './types.js';

const loaders: Record<ResearchReportSlug, () => Promise<{ default: MonteCarloValuationResult }>> = {
  nvidia: () => import('./nvidia.js'),
  meta: () => import('./meta.js'),
};

export async function loadMonteCarloResult(slug: ResearchReportSlug) {
  return (await loaders[slug]()).default;
}

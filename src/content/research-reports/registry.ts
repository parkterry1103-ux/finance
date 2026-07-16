import type { ResearchReportModel } from './types.js';

export const researchReportSlugs = ['nvidia', 'meta'] as const;
export type ResearchReportSlug = (typeof researchReportSlugs)[number];

const loaders: Record<ResearchReportSlug, () => Promise<{ default: ResearchReportModel }>> = {
  nvidia: () => import('./nvidia.js'),
  meta: () => import('./meta.js'),
};

export function isResearchReportSlug(slug: string): slug is ResearchReportSlug {
  return researchReportSlugs.includes(slug as ResearchReportSlug);
}

export async function loadResearchReport(slug: string) {
  return isResearchReportSlug(slug) ? (await loaders[slug]()).default : null;
}

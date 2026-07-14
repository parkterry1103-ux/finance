import { companyProfileRelatedCompanies } from './entries.js';

export const companyProfileRelationTypeLabels = {
  'same-demand': '같은 수요 흐름',
  'production-stage': '생산 단계 연관',
  infrastructure: '인프라 연관',
} as const;

export function relatedCompaniesForProfile(companyId: string) {
  return companyProfileRelatedCompanies.filter((relation) => relation.companyId === companyId).slice(0, 3);
}

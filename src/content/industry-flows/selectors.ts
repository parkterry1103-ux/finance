import { industryFlows } from './entries.js';

export const industryFlowById = new Map(industryFlows.map((flow) => [flow.id, flow]));

export function industryFlowForDemandSupply(demandSupplyId: string) {
  return industryFlows.find((flow) => flow.demandSupplyIds.includes(demandSupplyId));
}

export function industryFlowsForCompany(companyId: string) {
  return industryFlows.filter((flow) => flow.steps.some((step) => step.companyIds?.includes(companyId)));
}

export function industryFlowStepForCompany(flowId: string, companyId: string) {
  return industryFlowById.get(flowId)?.steps.find((step) => step.companyIds?.includes(companyId));
}

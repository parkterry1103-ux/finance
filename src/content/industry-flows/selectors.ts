import { industryFlows } from './entries.js';
import type { IndustryFlowCardVariant, IndustryFlowEntry, IndustryFlowStepType, IndustryFlowViewModel } from './types.js';

const industryFlowStepTypeLabels: Record<IndustryFlowStepType, string> = {
  demand: '수요',
  requirements: '필요 요소',
  suppliers: '공급 기업',
  'use-cases': '사용처',
  evidence: '확인 항목',
};

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

export function industryFlowViewModel(flow: IndustryFlowEntry, variant: IndustryFlowCardVariant): IndustryFlowViewModel {
  return {
    ...flow,
    variant,
    steps: flow.steps.map((step, index) => ({
      ...step,
      number: String(index + 1).padStart(2, '0'),
      typeLabel: industryFlowStepTypeLabels[step.type],
      description: variant === 'detail' ? step.description : null,
    })),
  };
}

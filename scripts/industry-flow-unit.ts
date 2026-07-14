import { companyEventCompanies } from '../src/content/company-events/index.js';
import { demandSupplyEntries } from '../src/content/demand-supply/index.js';
import { supplyChainBottlenecks } from '../src/content/bottlenecks/index.js';
import { industryReports } from '../src/content/reports/index.js';
import { sourceRegistry } from '../src/content/sources/index.js';
import { industryFlowForDemandSupply, industryFlows, industryFlowsForCompany } from '../src/content/industry-flows/index.js';

let checks = 0;
function check(condition: unknown, label: string) {
  checks += 1;
  if (!condition) throw new Error(`industry flow unit failed: ${label}`);
}

const companyIds = new Set(companyEventCompanies.map((company) => company.id));
const demandSupplyIds = new Set<string>(demandSupplyEntries.map((entry) => entry.id));
const bottleneckIds = new Set(supplyChainBottlenecks.map((entry) => entry.id));
const reportIds = new Set(industryReports.map((entry) => entry.id));
const expectedOrder = 'demand|requirements|suppliers|use-cases|evidence';

check(industryFlows.length === 4, 'exactly four flows');
check(new Set(industryFlows.map((flow) => flow.id)).size === 4, 'unique flow ids');
industryFlows.forEach((flow) => {
  check(flow.steps.length === 5, `${flow.id} five steps`);
  check(flow.steps.map((step) => step.type).join('|') === expectedOrder, `${flow.id} step order`);
  check(flow.steps.every((step) => step.title.trim() && step.description.trim()), `${flow.id} step copy`);
  check(flow.steps.every((step) => (step.companyIds?.length ?? 0) <= 2), `${flow.id} company maximum`);
  check(flow.steps.flatMap((step) => step.companyIds ?? []).every((id) => companyIds.has(id)), `${flow.id} company refs`);
  check(flow.demandSupplyIds.every((id) => demandSupplyIds.has(id)), `${flow.id} demand-supply refs`);
  check(flow.bottleneckIds.every((id) => bottleneckIds.has(id)), `${flow.id} bottleneck refs`);
  check(flow.reportIds.every((id) => reportIds.has(id)), `${flow.id} report refs`);
  check(flow.sourceRefs.length > 0 && flow.sourceRefs.every((id) => Boolean(sourceRegistry[id])), `${flow.id} source refs`);
});
check(demandSupplyEntries.every((entry) => Boolean(industryFlowForDemandSupply(entry.id))), 'every demand-supply entry resolves a flow');
const expectedDemandSupplyFlows: Record<string, string> = {
  'semiconductor-fab-infrastructure-demand-supply': 'us-semiconductors',
  'data-center-power-cooling-demand-supply': 'datacenter-power-cooling',
  'copper-grid-metals-demand-supply': 'reconstruction-infrastructure',
  'grid-equipment-demand-supply': 'semiconductor-cluster-infrastructure',
};
Object.entries(expectedDemandSupplyFlows).forEach(([entryId, flowId]) => {
  check(industryFlowForDemandSupply(entryId)?.id === flowId, `${entryId} maps to ${flowId}`);
});
check(industryFlowsForCompany('us-semiconductors-nvidia').some((flow) => flow.id === 'us-semiconductors'), 'NVIDIA current flow resolve');
check(industryFlowsForCompany('ai-datacenter-eaton').some((flow) => flow.id === 'datacenter-power-cooling'), 'Eaton current flow resolve');

console.log(`✓ 산업 흐름 unit ${checks}개 검증`);

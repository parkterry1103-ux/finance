import {
  companyEventCompanies,
  companyEventGroupOrder,
  companyEvents,
  companyEventsForBottleneck,
  companyEventsForCompany,
  companyEventsForDemandSupply,
  latestCompanyEvents,
  resolveCompanyEventSelection,
  sortCompanyEvents,
} from '../src/content/company-events/index.js';
import { sourceRegistry } from '../src/content/sources/index.js';
import type { CompanyEvent } from '../src/content/company-events/index.js';

let checks = 0;
const check = (condition: unknown, message: string) => {
  if (!condition) throw new Error(`company events unit failed: ${message}`);
  checks += 1;
};

const sorted = sortCompanyEvents();
check(sorted[0]?.id === 'micron-fy2026-q3-results', 'latest event sort');

const tieFixture = [
  { ...companyEvents[0], id: 'z-event', eventDate: '2026-01-01', reviewedAt: '2026-01-02' },
  { ...companyEvents[0], id: 'a-event', eventDate: '2026-01-01', reviewedAt: '2026-01-02' },
] as CompanyEvent[];
check(sortCompanyEvents(tieFixture).map((event) => event.id).join('|') === 'a-event|z-event', 'stable id tie-break');

const earnings = resolveCompanyEventSelection('earnings-guidance', null);
check(earnings.filteredEvents.length === 4 && earnings.filteredEvents.every((event) => event.group === 'earnings-guidance'), 'group filter');
check(resolveCompanyEventSelection('invalid', null).group === 'all', 'invalid group fallback');
check(resolveCompanyEventSelection(null, 'meta-senior-notes-2025').selectedEvent?.id === 'meta-senior-notes-2025', 'valid event query');
check(resolveCompanyEventSelection(null, 'invalid').selectedEvent?.id === sorted[0]?.id, 'invalid event fallback');
check(resolveCompanyEventSelection('earnings-guidance', 'meta-senior-notes-2025').group === 'financing-structure', 'filter and event conflict');
check(latestCompanyEvents(3).length === 3 && latestCompanyEvents(3)[0]?.id === sorted[0]?.id, 'latest three');
check(companyEventsForCompany('ai-datacenter-sk-hynix', 2).length === 2, 'company latest two');
check(companyEventsForBottleneck('data-center-power-cooling', 2).length === 2, 'bottleneck latest two');
check(companyEventsForDemandSupply('data-center-power-cooling-demand-supply', 2).length === 2, 'demand-supply latest two');

const missingSources = companyEvents.filter((event) => event.sourceRefs.some((sourceId) => !sourceRegistry[sourceId]));
check(missingSources.length === 0, 'source refs present');
const officialKinds = new Set(['company-release', 'company-ir', 'company-filing', 'sec-filing', 'dart-filing', 'kind-filing', 'government']);
check(companyEvents.every((event) => event.sourceRefs.every((sourceId) => officialKinds.has(sourceRegistry[sourceId]?.kind))), 'official sources only');

const filingKeys = companyEvents.flatMap((event) => [event.officialFiling?.accessionNumber, event.officialFiling?.rceptNo].filter(Boolean) as string[]);
check(new Set(filingKeys).size === filingKeys.length, 'duplicate filing absent');
check(companyEvents.every((event) => event.eventDate <= '2026-07-12'), 'future event absent');
check(companyEventCompanies.every((company) => companyEvents.filter((event) => event.companyId === company.id).length <= 3), 'company event maximum');
check(companyEventGroupOrder.every((group) => companyEvents.filter((event) => event.group === group).length >= 2), 'group minimum');
check(companyEvents.every((event) => event.nextCheckpoints.length >= 1 && event.nextCheckpoints.length <= 3), 'checkpoint count');
check(!/(매수|매도|수혜주|대장주|폭등|급등\s*예상|확정\s*수혜|목표주가|투자\s*기회)/i.test(JSON.stringify(companyEvents)), 'forbidden wording absent');

console.log(`✓ company events unit ${checks}개 통과`);

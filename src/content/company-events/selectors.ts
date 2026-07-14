import { companyEventCompanies, companyEvents } from './entries.js';
import type { CompanyEvent, CompanyEventGroup } from './types.js';

export const companyEventGroupOrder: CompanyEventGroup[] = [
  'earnings-guidance',
  'orders-contracts',
  'capex-capacity',
  'financing-structure',
];

export const companyEventGroupLabels: Record<CompanyEventGroup, string> = {
  'earnings-guidance': '실적·가이던스',
  'orders-contracts': '수주·계약',
  'capex-capacity': '설비투자·생산능력',
  'financing-structure': '자금조달·재무구조',
};

export const companyEventTypeLabels = {
  earnings: '실적 발표',
  guidance: '전망 변경',
  order: '신규 주문',
  contract: '신규 계약',
  backlog: '수주잔고',
  capex: '설비투자',
  facility: '공장·시설',
  'capacity-expansion': '생산능력 확대',
  'supply-agreement': '공급계약',
  financing: '자금조달',
  debt: '채권 발행',
  'equity-financing': '주식 관련 자금조달',
} as const;

export const companyEventStageLabels = {
  reported: '발표됨',
  planned: '계획 단계',
  'in-progress': '진행 중',
  completed: '완료 확인',
  revised: '계획 변경',
  delayed: '지연 확인',
  'confirmation-needed': '추가 확인 필요',
} as const;

export function sortCompanyEvents(events: CompanyEvent[] = companyEvents) {
  return [...events].sort((a, b) =>
    b.eventDate.localeCompare(a.eventDate)
    || b.reviewedAt.localeCompare(a.reviewedAt)
    || a.id.localeCompare(b.id));
}

export function companyEventCompany(companyId: string) {
  return companyEventCompanies.find((company) => company.id === companyId);
}

export function companyEventById(eventId?: string | null) {
  return companyEvents.find((event) => event.id === eventId);
}

export function normalizeCompanyEventGroup(group?: string | null): CompanyEventGroup | 'all' {
  return companyEventGroupOrder.includes(group as CompanyEventGroup) ? group as CompanyEventGroup : 'all';
}

export function resolveCompanyEventSelection(groupQuery?: string | null, eventQuery?: string | null) {
  const requestedEvent = companyEventById(eventQuery);
  const normalizedGroup = normalizeCompanyEventGroup(groupQuery);
  const group = requestedEvent && normalizedGroup !== 'all' && requestedEvent.group !== normalizedGroup
    ? requestedEvent.group
    : normalizedGroup;
  const filteredEvents = sortCompanyEvents(group === 'all' ? companyEvents : companyEvents.filter((event) => event.group === group));
  const selectedEvent = requestedEvent && filteredEvents.some((event) => event.id === requestedEvent.id)
    ? requestedEvent
    : filteredEvents[0];
  return { group, filteredEvents, selectedEvent };
}

export function latestCompanyEvents(limit = 3) {
  return sortCompanyEvents().slice(0, limit);
}

export function companyEventsForCompany(companyId: string, limit = 2) {
  return sortCompanyEvents(companyEvents.filter((event) => event.companyId === companyId)).slice(0, limit);
}

export function companyEventsForPick(pickId: string, limit = 2) {
  return sortCompanyEvents(companyEvents.filter((event) => event.pickIds.includes(pickId))).slice(0, limit);
}

export function companyEventsForBottleneck(bottleneckId: string, limit = 2) {
  return sortCompanyEvents(companyEvents.filter((event) => event.bottleneckIds.includes(bottleneckId))).slice(0, limit);
}

export function companyEventsForDemandSupply(entryId: string, limit = 2) {
  return sortCompanyEvents(companyEvents.filter((event) => event.demandSupplyIds.includes(entryId))).slice(0, limit);
}

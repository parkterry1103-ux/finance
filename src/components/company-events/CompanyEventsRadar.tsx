import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BarChart3, ExternalLink, Factory, Handshake, Landmark, ListChecks } from 'lucide-react';
import {
  companyEventCompany,
  companyEventGroupLabels,
  companyEventGroupOrder,
  companyEventStageLabels,
  companyEventTypeLabels,
  latestCompanyEvents,
  resolveCompanyEventSelection,
} from '../../content/company-events/index.js';
import type { CompanyEvent, CompanyEventGroup, CompanyEventType } from '../../content/company-events/index.js';
import { sourceRegistry } from '../../content/sources/index.js';
import { companyProfilePathForCompanyId } from '../../content/company-profiles/index.js';

type GroupFilter = CompanyEventGroup | 'all';

function eventIcon(type: CompanyEventType) {
  const props = { size: 18, 'aria-hidden': true as const };
  if (type === 'earnings' || type === 'guidance') return <BarChart3 {...props} />;
  if (type === 'order' || type === 'contract' || type === 'backlog' || type === 'supply-agreement') return <Handshake {...props} />;
  if (type === 'capex' || type === 'facility' || type === 'capacity-expansion') return <Factory {...props} />;
  return <Landmark {...props} />;
}

function formatEventDate(date: string) {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(`${date}T00:00:00+09:00`));
}

function sourceLabel(sourceId: string) {
  const source = sourceRegistry[sourceId];
  if (!source) return '공식 원문';
  if (source.kind === 'sec-filing') return 'SEC 원문';
  if (source.kind === 'dart-filing' || source.kind === 'kind-filing') return 'OpenDART·KIND 공시';
  if (source.kind === 'company-ir') return '기업 공식 IR';
  return '기업 공식 발표';
}

function updateCompanyEventUrl(group: GroupFilter, eventId?: string) {
  const url = new URL(window.location.href);
  if (group === 'all') url.searchParams.delete('group');
  else url.searchParams.set('group', group);
  if (eventId) url.searchParams.set('event', eventId);
  else url.searchParams.delete('event');
  window.history.replaceState({}, '', `${url.pathname}${url.search}`);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function EventIdentity({ event }: { event: CompanyEvent }) {
  const company = companyEventCompany(event.companyId);
  return (
    <div className="company-event-identity">
      <span className={`company-event-icon type-${event.eventType}`}>{eventIcon(event.eventType)}</span>
      <div>
        <strong>{company?.name ?? event.companyId}</strong>
        <small>{company ? `${company.countryLabel} · ${company.ticker}` : '기업 정보 확인 필요'}</small>
      </div>
    </div>
  );
}

function EventCard({ event, selected, onSelect }: { event: CompanyEvent; selected: boolean; onSelect: () => void }) {
  return (
    <button className={`company-event-card${selected ? ' is-selected' : ''}`} type="button" role="option" aria-selected={selected} onClick={onSelect}>
      <EventIdentity event={event} />
      <div className="company-event-card-meta">
        <span>{companyEventGroupLabels[event.group]} · {companyEventTypeLabels[event.eventType]}</span>
        <time dateTime={event.eventDate}>{formatEventDate(event.eventDate)}</time>
      </div>
      <span className={`company-event-stage stage-${event.stage}`}>{companyEventStageLabels[event.stage]}</span>
      <h3>{event.title}</h3>
      <p>{event.factualSummary}</p>
      <small>{event.whyItMatters}</small>
      <span className="company-event-card-source">공식 source 확인 <ExternalLink size={13} aria-hidden="true" /></span>
    </button>
  );
}

export function CompanyEventsRadar() {
  const initial = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return resolveCompanyEventSelection(params.get('group'), params.get('event'));
  }, []);
  const [group, setGroup] = useState<GroupFilter>(initial.group);
  const [selectedEventId, setSelectedEventId] = useState(initial.selectedEvent?.id ?? '');
  const resolved = resolveCompanyEventSelection(group, selectedEventId);
  const selectedEvent = resolved.selectedEvent;
  const featuredEvents = latestCompanyEvents(3);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedGroup = params.get('group');
    const requestedEvent = params.get('event');
    if ((requestedGroup && resolved.group !== requestedGroup) || (requestedEvent && resolved.selectedEvent?.id !== requestedEvent)) {
      updateCompanyEventUrl(resolved.group, resolved.selectedEvent?.id);
    }
  }, []);

  const selectEvent = (event: CompanyEvent) => {
    const nextGroup = group !== 'all' && event.group !== group ? event.group : group;
    setGroup(nextGroup);
    setSelectedEventId(event.id);
    updateCompanyEventUrl(nextGroup, event.id);
    window.requestAnimationFrame(() => document.getElementById('company-event-detail')?.focus());
  };

  const selectGroup = (nextGroup: GroupFilter) => {
    const next = resolveCompanyEventSelection(nextGroup, null);
    setGroup(nextGroup);
    setSelectedEventId(next.selectedEvent?.id ?? '');
    updateCompanyEventUrl(nextGroup, next.selectedEvent?.id);
  };

  const company = selectedEvent ? companyEventCompany(selectedEvent.companyId) : undefined;
  const sources = selectedEvent?.sourceRefs.map((sourceId) => sourceRegistry[sourceId]).filter(Boolean).slice(0, 3) ?? [];

  return (
    <main className="company-events-main">
      <section className="company-events-intro">
        <p className="company-events-eyebrow">실적·수주·설비투자 변화 레이더</p>
        <h1>기업이 실제로 밝힌 변화</h1>
        <p>기업의 공식 공시와 발표에서 실적, 계약, 설비투자, 생산능력, 자금조달 변화를 골라 쉽게 설명합니다.</p>
      </section>

      <section className="company-events-reading" aria-labelledby="company-events-reading-title">
        <div className="company-events-section-head"><span>읽는 법</span><h2 id="company-events-reading-title">사실과 해설을 나눠 봅니다</h2></div>
        <div>
          <article><strong>확인된 사실</strong><p>기업이 공식 공시나 발표에서 직접 밝힌 내용입니다.</p></article>
          <article><strong>현재 단계</strong><p>발표된 계획인지, 진행 중인지, 완료가 확인됐는지를 구분합니다.</p></article>
          <article><strong>연결해서 보기</strong><p>해당 발표와 함께 살펴볼 산업 수요와 공급망 배경입니다.</p></article>
          <article><strong>주의</strong><p>기업의 공식 발표가 향후 실적이나 시장 가격을 보장하지는 않습니다.</p></article>
        </div>
      </section>

      <section className="company-events-featured" aria-labelledby="company-events-featured-title">
        <div className="company-events-section-head"><span>최근 3개</span><h2 id="company-events-featured-title">최근 확인된 변화</h2></div>
        <div className="company-events-featured-grid">
          {featuredEvents.map((event) => {
            const eventCompany = companyEventCompany(event.companyId);
            return (
              <article key={event.id}>
                <EventIdentity event={event} />
                <div><span>{companyEventTypeLabels[event.eventType]}</span><time dateTime={event.eventDate}>{formatEventDate(event.eventDate)}</time></div>
                <span className={`company-event-stage stage-${event.stage}`}>{companyEventStageLabels[event.stage]}</span>
                <h3>{event.title}</h3>
                <p>{event.factualSummary}</p>
                <button type="button" onClick={() => selectEvent(event)} aria-label={`${eventCompany?.name ?? ''} ${event.title} 변화 자세히 보기`}>변화 자세히 보기 <ArrowRight size={14} aria-hidden="true" /></button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="company-events-browser" aria-labelledby="company-events-list-title">
        <div className="company-events-section-head"><span>12개 reviewed event</span><h2 id="company-events-list-title">유형별 기업 변화</h2></div>
        <div className="company-event-filters" aria-label="기업 변화 유형 필터">
          <button type="button" aria-pressed={group === 'all'} onClick={() => selectGroup('all')}>전체</button>
          {companyEventGroupOrder.map((item) => <button key={item} type="button" aria-pressed={group === item} onClick={() => selectGroup(item)}>{companyEventGroupLabels[item]}</button>)}
        </div>
        <div className="company-events-layout">
          <div className="company-events-list" role="listbox" aria-label="검토된 기업 변화">
            {resolved.filteredEvents.map((event) => <EventCard key={event.id} event={event} selected={event.id === selectedEvent?.id} onSelect={() => selectEvent(event)} />)}
          </div>

          {selectedEvent ? (
            <article className="company-event-detail" id="company-event-detail" tabIndex={-1} aria-labelledby="company-event-detail-title">
              <EventIdentity event={selectedEvent} />
              <div className="company-event-detail-heading"><span>{companyEventGroupLabels[selectedEvent.group]} · {companyEventTypeLabels[selectedEvent.eventType]}</span><time dateTime={selectedEvent.eventDate}>{formatEventDate(selectedEvent.eventDate)}</time></div>
              <h2 id="company-event-detail-title">{selectedEvent.title}</h2>
              <section><h3>1. 확인된 사실</h3><p>{selectedEvent.factualSummary}</p></section>
              <section><h3>2. 현재 단계</h3><p><span className={`company-event-stage stage-${selectedEvent.stage}`}>{companyEventStageLabels[selectedEvent.stage]}</span> 단계는 좋고 나쁨이 아니라 발표의 진행 상태를 뜻합니다.</p></section>
              <section><h3>3. 왜 확인할 변화인가</h3><p>{selectedEvent.whyItMatters}</p></section>
              <section><h3>4. 앞으로 확인할 것</h3><ul>{selectedEvent.nextCheckpoints.map((checkpoint) => <li key={checkpoint}>{checkpoint}</li>)}</ul></section>
              <section>
                <h3>5. 관련 산업 배경</h3>
                <div className="company-event-related-links">
                  {companyProfilePathForCompanyId(selectedEvent.companyId) ? <a href={companyProfilePathForCompanyId(selectedEvent.companyId)}>기업 자세히 보기 <ArrowRight size={13} aria-hidden="true" /></a> : null}
                  {selectedEvent.bottleneckIds.map((id) => <a key={`b-${id}`} href={`/ko/bottlenecks/${encodeURIComponent(id)}`}>관련 공급 병목 <ArrowRight size={13} aria-hidden="true" /></a>)}
                  {selectedEvent.demandSupplyIds.map((id) => <a key={`d-${id}`} href={`/ko/demand-supply?industry=${encodeURIComponent(id)}`}>수요·공급 배경 <ArrowRight size={13} aria-hidden="true" /></a>)}
                  {selectedEvent.marketMapIds.map((id) => <a key={`m-${id}`} href="/ko/market-map">같이 확인할 시장 구조 <ArrowRight size={13} aria-hidden="true" /></a>)}
                  {selectedEvent.reportIds.map((id) => <a key={`r-${id}`} href={`/ko/reports/${encodeURIComponent(id)}`}>관련 공식 자료 <ArrowRight size={13} aria-hidden="true" /></a>)}
                  {selectedEvent.pickIds.slice(0, 2).map((id) => <a key={`p-${id}`} href={`/ko/picks/${encodeURIComponent(id)}`}>기업 해설 함께 보기 <ArrowRight size={13} aria-hidden="true" /></a>)}
                </div>
              </section>
              <section><h3>6. 공식 원문</h3><div className="company-event-source-links">{sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer">{sourceLabel(source.id)} · {source.publisher} <ExternalLink size={13} aria-hidden="true" /></a>)}</div></section>
              <section><h3>7. 검토일</h3><p><time dateTime={selectedEvent.reviewedAt}>{formatEventDate(selectedEvent.reviewedAt)}</time> · {company?.name} 발표를 사실·해설·확인 항목으로 나눠 검토했습니다.</p></section>
              <p className="company-event-caution"><ListChecks size={17} aria-hidden="true" />{selectedEvent.caution}</p>
            </article>
          ) : null}
        </div>
      </section>

      <details className="company-events-methodology">
        <summary>방법론과 주의사항</summary>
        <h2>검토된 정적 registry를 사용하는 이유</h2>
        <ul>
          <li>공시 제목만으로 의미를 자동 추론하지 않고 공식 원문을 사람이 확인합니다.</li>
          <li>확인된 사실, 편집 해설, 앞으로 확인할 내용을 서로 분리합니다.</li>
          <li>기업 발표 한 건이 병목 상태나 산업 전체 수요를 자동으로 바꾸지 않습니다.</li>
          <li>가격 기반 신호, 자동 중요도 점수, AI 자동 요약을 사용하지 않습니다.</li>
        </ul>
      </details>
    </main>
  );
}

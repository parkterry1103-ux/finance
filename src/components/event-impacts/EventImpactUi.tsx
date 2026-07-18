import { ArrowRight, ExternalLink } from 'lucide-react';
import { financialMetricDefinitions } from '../../content/financial-pivots/index.js';
import {
  businessDriverById,
  businessDriverDirectionLabels,
  eventImpactConfidenceLabels,
  eventImpactReviewStageLabels,
  eventImpactReviewStatusLabels,
  financialMetricDirectionLabels,
  valuationAssumptionLabels,
  type EventImpactRecord,
} from '../../content/event-impacts/index.js';
import type { FinancialPivotMetricId } from '../../content/financial-pivots/types.js';
import { sourceRegistry } from '../../content/sources/index.js';

type Navigate = (path: string) => void;

function internalLink(path: string, onNavigate: Navigate) {
  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate(path);
  };
}

function formatDate(value: string) {
  return value.slice(0, 10).replace(/-/g, '.');
}

function sortedImpacts(impacts: EventImpactRecord[]) {
  return [...impacts].sort((a, b) => b.event.eventAsOf.localeCompare(a.event.eventAsOf));
}

function SourceLink({ impact }: { impact: EventImpactRecord }) {
  const source = sourceRegistry[impact.event.sourceIds[0]];
  return source ? <a href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`${impact.event.title} 근거 · ${source.publisher} 원문`}>{source.publisher} 원문 <ExternalLink size={13} aria-hidden="true" /></a> : null;
}

export function CompanyEventImpactSection({ companyName, companySlug, impacts, onNavigate, showValuationReview }: {
  companyName: string;
  companySlug: string;
  impacts: EventImpactRecord[];
  onNavigate: Navigate;
  showValuationReview: boolean;
}) {
  const visible = sortedImpacts(impacts).slice(0, 3);
  if (!visible.length) return null;
  return <section className="company-event-impact-section" aria-labelledby="company-event-impact-title">
    <div className="company-dashboard-section-heading"><span>사건과 판단 연결</span><h2 id="company-event-impact-title">최근 사건이 무엇을 다시 보게 했나요?</h2><p>확인된 사실과 미확인 항목을 나눈 뒤, 사업 동인과 가정의 검토 기록만 표시합니다.</p></div>
    <div className="company-event-impact-grid">{visible.map((impact) => <article key={impact.id}>
      <header><time dateTime={impact.event.eventAsOf}>{formatDate(impact.event.eventAsOf)}</time><span>{eventImpactReviewStageLabels[impact.reviewStage]}</span></header>
      <h3>{impact.event.title}</h3>
      <p>{impact.summary}</p>
      <dl>
        <div><dt>확인된 사실</dt><dd>{impact.confirmedFacts[0]?.statement}</dd></div>
        <div><dt>아직 확인할 것</dt><dd>{impact.unresolvedItems[0]?.statement}</dd></div>
        <div><dt>사업 동인</dt><dd>{impact.businessDriverImpacts.map((driver) => businessDriverById.get(driver.driverId)?.label).filter(Boolean).join(' · ')}</dd></div>
        <div><dt>검토 결과</dt><dd>{eventImpactReviewStatusLabels[impact.reviewStatus]}</dd></div>
      </dl>
      <footer><SourceLink impact={impact} />{showValuationReview ? <a href={`/ko/companies/${companySlug}/valuation#valuation-review-records-title`} onClick={internalLink(`/ko/companies/${companySlug}/valuation#valuation-review-records-title`, onNavigate)}>{companyName} 가정 검토 보기 <ArrowRight size={13} aria-hidden="true" /></a> : null}</footer>
    </article>)}</div>
  </section>;
}

function metricLinks(impacts: EventImpactRecord[], metricId: FinancialPivotMetricId) {
  return sortedImpacts(impacts).flatMap((impact) => impact.financialMetricLinks
    .filter((link) => link.metricId === metricId)
    .map((link) => ({ impact, link }))).slice(0, 2);
}

export function FinancialMetricImpactRecords({ impacts, metricId }: { impacts: EventImpactRecord[]; metricId: FinancialPivotMetricId }) {
  const records = metricLinks(impacts, metricId);
  if (!records.length) return null;
  return <span className="financial-impact-inline" role="note" aria-label={`${financialMetricDefinitions.find((metric) => metric.id === metricId)?.label ?? metricId} 사건 영향 기록`}>
    <b>사건 연결 {records.length}건</b>
    {records.map(({ impact, link }) => <span key={`${impact.id}-${link.metricId}`}><strong>{financialMetricDirectionLabels[link.direction]}</strong>{impact.event.title} · {eventImpactConfidenceLabels[link.confidence]}</span>)}
  </span>;
}

function ValuationLinkList({ impact }: { impact: EventImpactRecord }) {
  return <ul className="valuation-review-assumptions">{impact.valuationAssumptionLinks.map((link) => <li key={link.assumptionId}><strong>{valuationAssumptionLabels[link.assumptionId]}</strong><span>{link.explanation}</span><small>{eventImpactConfidenceLabels[link.confidence]}</small></li>)}</ul>;
}

export function ValuationAssumptionReviewSection({ impacts }: { impacts: EventImpactRecord[] }) {
  const visible = sortedImpacts(impacts);
  if (!visible.length) return null;
  return <section className="valuation-section valuation-review-records" aria-labelledby="valuation-review-records-title">
    <div className="valuation-section-heading"><span>05</span><div><p>Point-in-time review records</p><h2 id="valuation-review-records-title">가정 검토 기록</h2></div></div>
    <p className="valuation-section-intro">사건이 모형을 자동 변경한 내역이 아닙니다. 공식 사실을 확인한 시점, 검토 범위와 사람이 내린 실제 결정을 구분합니다.</p>
    <div className="valuation-review-list">{visible.map((impact) => <article key={impact.id}>
      <header><div><time dateTime={impact.event.eventAsOf}>사건 {formatDate(impact.event.eventAsOf)}</time><span>{eventImpactReviewStageLabels[impact.reviewStage]}</span></div><strong>{eventImpactReviewStatusLabels[impact.reviewStatus]}</strong></header>
      <h3>{impact.event.title}</h3>
      <p>{impact.summary}</p>
      <div className="valuation-review-facts"><section><h4>확인된 사실</h4><ul>{impact.confirmedFacts.map((fact) => <li key={fact.id}>{fact.statement}</li>)}</ul></section><section><h4>아직 확인되지 않음</h4><ul>{impact.unresolvedItems.map((item) => <li key={item.id}>{item.statement}</li>)}</ul></section></div>
      <div className="valuation-review-drivers" aria-label="사업 동인 영향">{impact.businessDriverImpacts.map((driverImpact) => { const driver = businessDriverById.get(driverImpact.driverId); return <span key={driverImpact.driverId}><strong>{driver?.label ?? driverImpact.driverId}</strong>{businessDriverDirectionLabels[driverImpact.direction]} · {eventImpactConfidenceLabels[driverImpact.confidence]}</span>; })}</div>
      <ValuationLinkList impact={impact} />
      {impact.decision ? <dl className="valuation-review-decision"><div><dt>검토일</dt><dd><time dateTime={impact.decision.reviewedAt}>{formatDate(impact.decision.reviewedAt)}</time> · Owner review</dd></div><div><dt>실제 결정</dt><dd>{impact.decision.summary}</dd></div><div><dt>모형 버전</dt><dd>{impact.decision.beforeModelVersion === impact.decision.afterModelVersion ? `${impact.decision.afterModelVersion} · 변경 없음` : `${impact.decision.beforeModelVersion} → ${impact.decision.afterModelVersion}`}</dd></div></dl> : null}
      <footer><SourceLink impact={impact} /><span>다음 확인 · {impact.watchItems.join(' · ')}</span></footer>
    </article>)}</div>
  </section>;
}

export function EditorialEventImpactSection({ impacts, headingNumber }: { impacts: EventImpactRecord[]; headingNumber: string }) {
  const visible = sortedImpacts(impacts).slice(0, 3);
  if (!visible.length) return null;
  return <section className="editorial-detail-section editorial-event-impact" aria-labelledby="editorial-event-impact-title"><div className="editorial-detail-heading"><span>{headingNumber}</span><h2 id="editorial-event-impact-title">기업 판단과 가정 검토</h2></div><p className="editorial-lead-copy">콘텐츠 게시와 모형 변경은 분리합니다. 아래는 같은 사건을 사람이 검토한 시점형 기록입니다.</p><div className="editorial-event-impact-grid">{visible.map((impact) => <article key={impact.id}><header><time dateTime={impact.event.eventAsOf}>{formatDate(impact.event.eventAsOf)}</time><strong>{eventImpactReviewStatusLabels[impact.reviewStatus]}</strong></header><h3>{impact.event.title}</h3><p>{impact.summary}</p><dl><div><dt>검토 범위</dt><dd>{eventImpactReviewStageLabels[impact.reviewStage]}</dd></div><div><dt>가정</dt><dd>{impact.valuationAssumptionLinks.map((link) => valuationAssumptionLabels[link.assumptionId]).join(' · ')}</dd></div></dl><SourceLink impact={impact} /></article>)}</div></section>;
}

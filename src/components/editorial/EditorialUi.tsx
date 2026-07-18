import { ArrowRight } from 'lucide-react';
import {
  formatRelativeReturn,
  formatSignedPercent,
  moveCharacterLabels,
  relativeReturn,
} from '../../content/editorial/selectors.js';
import type { EditorialSummary, StockDissectionSummary, ThreeReadsSummary } from '../../content/editorial/types.js';
import { trackAnalyticsEvent } from '../../analytics/index.js';

export type EditorialNavigate = (path: string) => void;

export function editorialInternalLink(path: string, onNavigate: EditorialNavigate) {
  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onNavigate(path);
  };
}

export function editorialDate(value: string) {
  return value ? value.replace(/-/g, '.') : '기준일 확인 전';
}

export function editorialPath(item: EditorialSummary) {
  return item.kind === 'stock'
    ? `/ko/insights/stock/${encodeURIComponent(item.slug)}`
    : `/ko/insights/3reads/${encodeURIComponent(item.slug)}`;
}

export function StockSummaryCard({ item, onNavigate, compact = false }: { item: StockDissectionSummary; onNavigate: EditorialNavigate; compact?: boolean }) {
  const path = editorialPath(item);
  const comparisons = [
    item.comparison?.market ? { label: `${item.comparison.market.name} 대비`, value: relativeReturn(item.priceMove.value, item.comparison.market.value), precision: item.comparison.market.precision } : null,
    item.comparison?.sector ? { label: `${item.comparison.sector.name} 대비`, value: relativeReturn(item.priceMove.value, item.comparison.sector.value), precision: item.comparison.sector.precision } : null,
  ].filter((comparison): comparison is { label: string; value: number; precision: number | undefined } => Boolean(comparison));
  return (
    <article className={`editorial-card editorial-stock-card${compact ? ' is-compact' : ''}`}>
      <div className="editorial-card-meta">
        <span>{item.company.name}{item.company.ticker ? ` · ${item.company.ticker}` : ''}</span>
        <time dateTime={item.priceAsOf}>{editorialDate(item.priceAsOf)}</time>
      </div>
      <div className="editorial-move-row">
        <strong aria-label={`등락률 ${formatSignedPercent(item.priceMove.value, item.priceMove.precision)}`}>{formatSignedPercent(item.priceMove.value, item.priceMove.precision)}</strong>
        {comparisons.map((comparison) => <span key={comparison.label}>{comparison.label} {formatRelativeReturn(comparison.value, comparison.precision)}</span>)}
      </div>
      <h3>{item.headline}</h3>
      <dl className="editorial-card-facts">
        <div><dt>무슨 일이 있었나</dt><dd>{item.directCatalyst}</dd></div>
        <div><dt>이번 움직임의 성격</dt><dd>{item.cardCharacter ?? moveCharacterLabels[item.moveCharacter]}</dd></div>
        {!compact && item.confirmedItems[0] ? <div><dt>확인된 것</dt><dd>{item.confirmedItems[0]}</dd></div> : null}
        {!compact && item.unconfirmedItems[0] ? <div><dt>아직 확인되지 않은 것</dt><dd>{item.unconfirmedItems[0]}</dd></div> : null}
        {item.watchItems[0] ? <div><dt>다음 확인</dt><dd>{item.watchItems.slice(0, compact ? 1 : 3).join(' · ')}</dd></div> : null}
      </dl>
      <div className="editorial-card-actions">
        <a href={path} onClick={(event) => { trackAnalyticsEvent('related_research_click', { contentType: 'stock_dissection', contentId: item.id, placement: compact ? 'insights_index' : 'home', destinationType: 'editorial' }); editorialInternalLink(path, onNavigate)(event); }}>전체 해부 읽기 <ArrowRight size={15} aria-hidden="true" /></a>
        {item.company.companySlug ? <a href={`/ko/companies/${encodeURIComponent(item.company.companySlug)}`} onClick={(event) => { trackAnalyticsEvent('editorial_company_click', { contentType: 'stock_dissection', contentId: item.id, companySlug: item.company.companySlug, placement: compact ? 'insights_index' : 'home', destinationType: 'company' }); editorialInternalLink(`/ko/companies/${encodeURIComponent(item.company.companySlug!)}`, onNavigate)(event); }}>{item.company.name} 분석 보기</a> : null}
      </div>
    </article>
  );
}

export function ThreeReadsSummaryCard({ item, onNavigate, compact = false }: { item: ThreeReadsSummary; onNavigate: EditorialNavigate; compact?: boolean }) {
  const path = editorialPath(item);
  return (
    <article className={`editorial-card editorial-three-card${compact ? ' is-compact' : ''}`}>
      <div className="editorial-card-meta"><span>오늘의 월스트리트</span><time dateTime={item.contentAsOf}>{editorialDate(item.contentAsOf)}</time></div>
      <h3>{item.title}</h3>
      <p className="editorial-three-question">{item.centralQuestion}</p>
      {!compact ? <p className="editorial-three-thread">세 개의 뉴스, 하나의 투자 질문</p> : null}
      <ol>{item.readHeadlines.map((headline, index) => <li key={headline}><strong>{headline}</strong><span>{item.readSummaries[index]}</span></li>)}</ol>
      <div className="editorial-takeaway"><span>오늘의 한 줄</span><p>{item.oneLineTakeaway}</p></div>
      <div className="editorial-card-actions"><a href={path} onClick={(event) => { trackAnalyticsEvent('related_research_click', { contentType: 'wall_street_edition', contentId: item.id, placement: compact ? 'insights_index' : 'home', destinationType: 'editorial' }); editorialInternalLink(path, onNavigate)(event); }}>오늘의 월스트리트 전체 읽기 <ArrowRight size={15} aria-hidden="true" /></a></div>
    </article>
  );
}

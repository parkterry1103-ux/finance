import { ExternalLink, X } from 'lucide-react';
import {
  isConfirmedRelationType,
  marketMapEvidenceLevelLabels,
  marketMapRelationTypeLabels,
  selectMarketMapRelationSourceRefs,
  type MarketMapCompanyRelation,
} from '../../content/market-map-relations';
import { sourceRegistry } from '../../content/sources';

type MarketMapRelationPanelProps = {
  relation: MarketMapCompanyRelation;
  fromCompanyName: string;
  toCompanyName: string;
  onClose: () => void;
};

export function MarketMapRelationPanel({
  relation,
  fromCompanyName,
  toCompanyName,
  onClose,
}: MarketMapRelationPanelProps) {
  const sources = selectMarketMapRelationSourceRefs(relation).map((sourceId) => sourceRegistry[sourceId]).filter(Boolean);
  const directRelationshipConfirmed = isConfirmedRelationType(relation.relationType) && relation.evidenceLevel === 'confirmed';
  const headingId = `${relation.id}-panel-title`;

  return (
    <section className="market-map-relation-panel" aria-labelledby={headingId} data-selected-relation-id={relation.id}>
      <button type="button" className="market-map-relation-panel-close" onClick={onClose} aria-label="관계 상세 닫기">
        <X size={16} aria-hidden="true" />
      </button>
      <div className="market-map-relation-panel-heading">
        <span>선택 관계</span>
        <h3 id={headingId}>{fromCompanyName} {relation.direction === 'directed' ? '→' : '↔'} {toCompanyName}</h3>
      </div>
      <dl className="market-map-relation-panel-facts">
        <div>
          <dt>관계 유형</dt>
          <dd>{marketMapRelationTypeLabels[relation.relationType]}</dd>
        </div>
        <div>
          <dt>근거 수준</dt>
          <dd>{marketMapEvidenceLevelLabels[relation.evidenceLevel]}</dd>
        </div>
      </dl>
      <div className="market-map-relation-panel-copy">
        <h4>무슨 의미인가요?</h4>
        <p>{relation.explanation}</p>
      </div>
      <div className="market-map-relation-panel-copy">
        <h4>직접 계약이 확인됐나요?</h4>
        <p>{directRelationshipConfirmed
          ? '공식 자료에서 직접 관계가 확인됐습니다.'
          : '이 관계는 산업 구조를 이해하기 위한 참고 연결입니다. 특정 직접 계약을 의미하지 않습니다.'}</p>
      </div>
      <div className="market-map-relation-panel-caution">
        <strong>주의사항</strong>
        <p>{relation.caution}</p>
      </div>
      <div className="market-map-relation-panel-sources">
        <h4>공식 근거</h4>
        {sources.length ? (
          <ul>
            {sources.map((source) => (
              <li key={source.id}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  <span><strong>{source.publisher}</strong><small>{source.title}</small></span>
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        ) : <p>현재 연결된 원문을 불러올 수 없습니다. 근거 수준은 자동으로 상향하지 않습니다.</p>}
      </div>
      <p className="market-map-relation-panel-reviewed"><strong>검토일</strong><time dateTime={relation.reviewedAt}>{relation.reviewedAt}</time></p>
    </section>
  );
}

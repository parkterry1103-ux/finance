import type { ReactNode, RefObject } from 'react';
import { ArrowRight, Network, ShieldAlert } from 'lucide-react';
import type {
  MarketMapDetailAction,
  MarketMapDetailCompany,
  MarketMapDetailViewModel,
} from '../../content/market-map-details';

type MarketMapDetailTemplateProps = {
  viewModel: MarketMapDetailViewModel;
  advancedExpanded: boolean;
  onToggleAdvanced: () => void;
  onCompanyAction: (companyId: string, action: MarketMapDetailAction) => void;
  onSelectFlowStep?: (stepId: string) => void;
  renderIdentity: (company: MarketMapDetailCompany, size: 'compact' | 'hero') => ReactNode;
  renderLogo: (company: MarketMapDetailCompany, size: 'small' | 'large') => ReactNode;
  renderPrice?: (companyId: string) => ReactNode;
  advancedContent?: ReactNode;
  resources?: ReactNode;
  advancedTriggerRef?: RefObject<HTMLButtonElement>;
};

function CompanyStatusBadges({ company }: { company: MarketMapDetailCompany }) {
  return (
    <div className="market-map-template-badges" aria-label={`${company.name} 연결 상태`}>
      <span>{company.role}</span>
      <em className={`status-${company.connectionLevel}`}>{company.statusLabel}</em>
    </div>
  );
}

export function MarketMapDetailTemplate({
  viewModel,
  advancedExpanded,
  onToggleAdvanced,
  onCompanyAction,
  onSelectFlowStep,
  renderIdentity,
  renderLogo,
  renderPrice,
  advancedContent,
  resources,
  advancedTriggerRef,
}: MarketMapDetailTemplateProps) {
  const selectedCompany = viewModel.selectedCompany;

  return (
    <div className="market-map-detail-template" data-market-map-detail-id={viewModel.id} data-ui-template="market-map-detail-v1">
      <section className="market-map-template-hero" aria-labelledby={`${viewModel.id}-title`}>
        <span>{viewModel.eyebrow}</span>
        <h1 id={`${viewModel.id}-title`}>{viewModel.title}</h1>
        <p>{viewModel.summary}</p>
        <strong>{viewModel.heroNote}</strong>
      </section>

      <section className="market-map-template-focus" aria-label="선택 기업과 같이 볼 기업">
        <article className="market-map-template-selected" aria-labelledby={`${viewModel.id}-selected-company`}>
          <div className="market-map-template-company-head">
            {renderLogo(selectedCompany, 'large')}
            <div>
              <span>선택한 기업</span>
              <div id={`${viewModel.id}-selected-company`}>{renderIdentity(selectedCompany, 'hero')}</div>
            </div>
          </div>
          <CompanyStatusBadges company={selectedCompany} />
          <div className="market-map-template-company-copy">
            <div>
              <h2>이 회사는 무엇을 하나요?</h2>
              <p>{selectedCompany.description}</p>
            </div>
            <div>
              <h2>왜 이 흐름에 있나요?</h2>
              <p>{selectedCompany.reason}</p>
            </div>
          </div>
          {selectedCompany.note ? <p className="market-map-template-company-note">{selectedCompany.note}</p> : null}
          <div className="market-map-template-company-actions">
            {selectedCompany.hasPrice && renderPrice ? renderPrice(selectedCompany.id) : null}
            {selectedCompany.actions.map((action) => (
              <button key={action.id} type="button" onClick={() => onCompanyAction(selectedCompany.id, action)}>
                {action.label}
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            ))}
          </div>
        </article>

        <section className="market-map-template-related" aria-labelledby={`${viewModel.id}-related-title`}>
          <div className="market-map-template-section-head">
            <span>같이 볼 기업</span>
            <h2 id={`${viewModel.id}-related-title`}>{selectedCompany.name}과 함께 살펴볼 기업</h2>
            <p>산업 흐름을 이해하기 위한 연결입니다. 직접 거래나 계약 여부는 공식 공시·IR로 별도 확인합니다.</p>
          </div>
          <div className="market-map-template-related-grid">
            {viewModel.relatedCompanies.map((company) => (
              <article key={company.id}>
                <div className="market-map-template-related-head">
                  {renderLogo(company, 'small')}
                  {renderIdentity(company, 'compact')}
                </div>
                <CompanyStatusBadges company={company} />
                <p>{company.reason}</p>
                {company.note ? <small>{company.note}</small> : null}
                <div className="market-map-template-related-actions">
                  {company.hasPrice && renderPrice ? renderPrice(company.id) : null}
                  {company.actions.map((action) => (
                    <button key={action.id} type="button" onClick={() => onCompanyAction(company.id, action)}>
                      {action.label}
                      <ArrowRight size={13} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="market-map-template-flow" aria-labelledby={`${viewModel.id}-flow-title`}>
        <div className="market-map-template-section-head">
          <span>주가해부실 · 시장 흐름 지도</span>
          <h2 id={`${viewModel.id}-flow-title`}>Compact {viewModel.flowSteps.length}단계 흐름</h2>
          <p>{viewModel.flowTitle}</p>
        </div>
        <div className="market-map-template-flow-steps">
          {viewModel.flowSteps.map((step, index) => (
            <article key={step.id} className={step.isCurrent ? 'current' : ''} aria-current={step.isCurrent ? 'step' : undefined}>
              {onSelectFlowStep ? (
                <button type="button" onClick={() => onSelectFlowStep(step.id)} aria-label={`${step.title} 단계 보기`}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                  <em>{step.roleTag}</em>
                </button>
              ) : (
                <div className="market-map-template-flow-copy">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                  <em>{step.roleTag}</em>
                </div>
              )}
              <div aria-label={`${step.title} 대표 기업`}>
                <b>대표 기업</b>
                {step.representativeCompanies.map((companyName) => <small key={companyName}>{companyName}</small>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="market-map-template-advanced" aria-labelledby={`${viewModel.id}-advanced-title`}>
        <div>
          <span>전체 관계를 보고 싶다면</span>
          <h2 id={`${viewModel.id}-advanced-title`}>핵심 단계와 관련 기업의 연결을 한 번에 펼쳐봅니다.</h2>
          <p>{viewModel.advancedDescription}</p>
        </div>
        <button
          ref={advancedTriggerRef}
          type="button"
          aria-expanded={advancedExpanded}
          aria-controls={`${viewModel.id}-advanced-graph`}
          onClick={onToggleAdvanced}
        >
          <Network size={15} aria-hidden="true" />
          {advancedExpanded ? '전체 연결 접기' : '전체 연결 보기'}
        </button>
        {advancedExpanded ? <div id={`${viewModel.id}-advanced-graph`} className="market-map-template-advanced-content">{advancedContent}</div> : null}
      </section>

      <section className="market-map-template-caution" aria-labelledby={`${viewModel.id}-caution-title`}>
        <ShieldAlert size={18} aria-hidden="true" />
        <div>
          <span>확인할 점·주의사항</span>
          <h2 id={`${viewModel.id}-caution-title`}>시장 관심과 실제 계약을 나눠 봅니다</h2>
          <p>{viewModel.caution}</p>
          {viewModel.policyCaution ? <strong>{viewModel.policyCaution}</strong> : null}
        </div>
      </section>

      {resources ? <section className="market-map-template-resources" aria-label="출처와 관련 자료">{resources}</section> : null}
    </div>
  );
}

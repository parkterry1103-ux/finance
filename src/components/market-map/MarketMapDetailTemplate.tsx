import type { ReactNode, RefObject } from 'react';
import { ArrowRight, Factory, Focus, Maximize2, Network, ShieldAlert } from 'lucide-react';
import {
  marketMapCategoryLabels,
  marketMapRegionLabels,
} from '../../content/market-map-details';
import type {
  MarketMapDetailAction,
  MarketMapDetailCompany,
  MarketMapDetailViewMode,
  MarketMapDetailViewModel,
  MarketMapGraphRegion,
  MarketMapGraphViewMode,
} from '../../content/market-map-details';

type MarketMapDetailTemplateProps = {
  viewModel: MarketMapDetailViewModel;
  activeView: MarketMapDetailViewMode;
  onViewChange: (view: MarketMapDetailViewMode) => void;
  onCompanyAction: (companyId: string, action: MarketMapDetailAction) => void;
  renderIdentity: (company: MarketMapDetailCompany, size: 'compact' | 'hero') => ReactNode;
  renderLogo: (company: MarketMapDetailCompany, size: 'small' | 'large') => ReactNode;
  renderPrice?: (companyId: string) => ReactNode;
  advancedContent?: ReactNode;
  graphControls?: ReactNode;
  resources?: ReactNode;
};

type MarketMapGraphToolbarProps = {
  availableRegions: MarketMapGraphRegion[];
  activeRegion: MarketMapGraphRegion;
  onRegionChange: (region: MarketMapGraphRegion) => void;
  activeViewMode: MarketMapGraphViewMode;
  onFocusSelected: () => void;
  onFitAll: () => void;
};

type MarketMapGraphShellProps = {
  id: string;
  expanded: boolean;
  description: string;
  onToggle?: () => void;
  controls?: ReactNode;
  children?: ReactNode;
  triggerRef?: RefObject<HTMLButtonElement>;
  collapsible?: boolean;
};

const graphRegionLabels: Record<MarketMapGraphRegion, string> = {
  all: '전체',
  us: '미국',
  kr: '한국',
  other: '기타·글로벌',
};

export function MarketMapGraphToolbar({
  availableRegions,
  activeRegion,
  onRegionChange,
  activeViewMode,
  onFocusSelected,
  onFitAll,
}: MarketMapGraphToolbarProps) {
  return (
    <div className="market-map-graph-toolbar">
      <div role="group" aria-label="기업 국가 필터">
        <span>지역</span>
        <div>
          {availableRegions.map((region) => (
            <button
              key={region}
              type="button"
              aria-pressed={activeRegion === region}
              onClick={() => onRegionChange(region)}
            >
              {graphRegionLabels[region]}
            </button>
          ))}
        </div>
      </div>
      <div role="group" aria-label="관계도 보기 방식">
        <span>보기 방식</span>
        <div>
          <button type="button" aria-pressed={activeViewMode === 'selected'} onClick={onFocusSelected}>
            <Focus size={14} aria-hidden="true" />
            선택 기업 중심
          </button>
          <button type="button" aria-pressed={activeViewMode === 'fit'} onClick={onFitAll}>
            <Maximize2 size={14} aria-hidden="true" />
            전체 맞춤
          </button>
        </div>
      </div>
    </div>
  );
}

export function MarketMapGraphLegend() {
  return (
    <div className="market-map-graph-legend" aria-label="관계선 범례">
      <span><i className="demand" aria-hidden="true" />수요</span>
      <span><i className="supply" aria-hidden="true" />공급</span>
      <span><i className="infrastructure" aria-hidden="true" />생산·설비</span>
      <span><i className="reference" aria-hidden="true" />시장 흐름 참고</span>
    </div>
  );
}

export function MarketMapGraphShell({
  id,
  expanded,
  description,
  onToggle,
  controls,
  children,
  triggerRef,
  collapsible = true,
}: MarketMapGraphShellProps) {
  return (
    <section className="market-map-template-advanced market-map-graph-shell" aria-labelledby={`${id}-advanced-title`}>
      <div className="market-map-graph-heading">
        <span>기업 전용 관계망</span>
        <h2 id={`${id}-advanced-title`}>같은 산업 흐름에 속한 기업만 연결해 봅니다.</h2>
        <p>{description}</p>
      </div>
      {collapsible ? (
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={expanded}
          aria-controls={`${id}-advanced-graph`}
          onClick={onToggle}
        >
          <Network size={15} aria-hidden="true" />
          {expanded ? '기업 연결 접기' : '기업 연결 보기'}
        </button>
      ) : null}
      {expanded && controls ? <div className="market-map-graph-controls">{controls}</div> : null}
      {expanded ? (
        <div id={`${id}-advanced-graph`} className="market-map-template-advanced-content" aria-label="기업 전용 연결 관계도">
          {children}
        </div>
      ) : null}
      {expanded ? <MarketMapGraphLegend /> : null}
    </section>
  );
}

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
  activeView,
  onViewChange,
  onCompanyAction,
  renderIdentity,
  renderLogo,
  renderPrice,
  advancedContent,
  graphControls,
  resources,
}: MarketMapDetailTemplateProps) {
  const selectedCompany = viewModel.selectedCompany;
  const relatedCompanyGroups = [
    { id: 'us', label: '미국 기업', companies: viewModel.relatedCompanies.filter((company) => company.countryLabel === '미국') },
    { id: 'kr', label: '한국 기업', companies: viewModel.relatedCompanies.filter((company) => company.countryLabel === '한국') },
    { id: 'global', label: '글로벌 공급망 기업', companies: viewModel.relatedCompanies.filter((company) => company.countryLabel !== '미국' && company.countryLabel !== '한국') },
  ].filter((group) => group.companies.length > 0);

  return (
    <div
      className={`market-map-detail-template category-${viewModel.category}`}
      data-market-map-detail-id={viewModel.id}
      data-ui-template="market-map-detail-v2"
    >
      <section className="market-map-template-hero" aria-labelledby={`${viewModel.id}-title`}>
        <span>{viewModel.eyebrow}</span>
        <div className="market-map-template-classification" aria-label="시장지도 분류">
          <strong>{marketMapRegionLabels[viewModel.region]}</strong>
          <strong>{marketMapCategoryLabels[viewModel.category]}</strong>
        </div>
        <h1 id={`${viewModel.id}-title`}>{viewModel.title}</h1>
        <p>{viewModel.summary}</p>
        <strong>{viewModel.heroNote}</strong>
      </section>

      <nav className="market-map-template-view-switch" aria-label="시장지도 보기 선택">
        <button type="button" aria-pressed={activeView === 'industry'} onClick={() => onViewChange('industry')}>
          <Factory size={17} aria-hidden="true" />
          <span><strong>산업 구조</strong><small>수요 → 필요 요소 → 공급 기업 → 사용처 → 확인</small></span>
        </button>
        <button type="button" aria-pressed={activeView === 'companies'} onClick={() => onViewChange('companies')}>
          <Network size={17} aria-hidden="true" />
          <span><strong>기업 연결</strong><small>기업 노드만 보는 관계망</small></span>
        </button>
      </nav>

      {activeView === 'companies' ? <section className="market-map-template-focus" aria-label="선택 기업과 같이 볼 기업">
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
          {relatedCompanyGroups.map((group) => (
            <section className="market-map-template-related-group" key={group.id} aria-labelledby={`${viewModel.id}-${group.id}-companies`}>
              <h3 id={`${viewModel.id}-${group.id}-companies`}>{group.label}</h3>
              <div className="market-map-template-related-grid">
                {group.companies.map((company) => (
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
          ))}
        </section>
      </section> : null}

      {activeView === 'industry' ? <section className="market-map-template-flow" aria-labelledby={`${viewModel.id}-flow-title`}>
        <div className="market-map-template-section-head">
          <span>공통 산업 구조 taxonomy</span>
          <h2 id={`${viewModel.id}-flow-title`}>다섯 질문으로 읽는 산업 구조</h2>
          <p>{viewModel.flowTitle}</p>
        </div>
        <div className="market-map-template-flow-steps" data-flow-count={viewModel.flowSteps.length}>
          {viewModel.flowSteps.map((step, index) => (
            <article key={step.id} className={step.isCurrent ? 'current' : ''} aria-current={step.isCurrent ? 'step' : undefined}>
              <div className="market-map-template-flow-copy">
                <span className="market-map-template-flow-meta">
                  <b aria-label={`${index + 1}단계`}>{String(index + 1).padStart(2, '0')}</b>
                  <em>{step.roleTag}</em>
                </span>
                <small className="market-map-template-flow-question">{step.question}</small>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </div>
              <ul className="market-map-template-flow-items" aria-label={`${step.title} 핵심 항목`}>
                {step.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
              {step.representativeCompanies.length ? <div aria-label={`${step.title} 대표 기업`}>
                <b>대표 기업</b>
                {step.representativeCompanies.map((companyName) => <small key={companyName}>{companyName}</small>)}
              </div> : null}
            </article>
          ))}
        </div>
      </section> : null}

      {activeView === 'companies' ? <MarketMapGraphShell
        id={viewModel.id}
        expanded
        description={viewModel.advancedDescription}
        controls={graphControls}
        collapsible={false}
      >
        {advancedContent}
      </MarketMapGraphShell> : null}

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

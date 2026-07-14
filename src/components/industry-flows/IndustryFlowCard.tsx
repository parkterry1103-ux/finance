import { industryFlowViewModel, type IndustryFlowCardVariant, type IndustryFlowEntry } from '../../content/industry-flows/index.js';
import { companyEventCompany } from '../../content/company-events/index.js';
import { companyProfilePathForCompanyId } from '../../content/company-profiles/paths.js';

type IndustryFlowCardProps = {
  flow: IndustryFlowEntry;
  variant: IndustryFlowCardVariant;
  currentCompanyId?: string;
};

export function IndustryFlowCard({ flow, variant, currentCompanyId }: IndustryFlowCardProps) {
  const viewModel = industryFlowViewModel(flow, variant);
  return (
    <section className={`industry-flow-card industry-flow-card--${variant}`} aria-labelledby={`${flow.id}-flow-title`}>
      <div className="industry-flow-card__heading">
        <span>5단계 산업 흐름</span>
        <h3 id={`${flow.id}-flow-title`}>{viewModel.title}</h3>
        <p>{viewModel.summary}</p>
      </div>
      <ol className="industry-flow-steps">
        {viewModel.steps.map((step) => {
          const isCurrent = Boolean(currentCompanyId && step.companyIds?.includes(currentCompanyId));
          return (
            <li className={`industry-flow-step${isCurrent ? ' is-current' : ''}`} key={step.id} aria-current={isCurrent ? 'step' : undefined}>
              <div className="industry-flow-step__meta">
                <span className="industry-flow-step__number" aria-label={`${Number(step.number)}단계`}>{step.number}</span>
                <span className="industry-flow-step__type">{step.typeLabel}</span>
              </div>
              <h4 className="industry-flow-step__title">{step.title}</h4>
              {step.description ? <p className="industry-flow-step__description">{step.description}</p> : null}
              {step.companyIds?.length ? (
                <div className="industry-flow-step__companies" aria-label="대표 기업">
                  {step.companyIds.slice(0, 2).map((companyId) => {
                    const company = companyEventCompany(companyId);
                    const profilePath = companyProfilePathForCompanyId(companyId);
                    return profilePath
                      ? <a key={companyId} href={profilePath}>{company?.name ?? companyId}</a>
                      : <span key={companyId}>{company?.name ?? companyId}</span>;
                  })}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

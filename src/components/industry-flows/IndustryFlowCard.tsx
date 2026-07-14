import type { IndustryFlowEntry, IndustryFlowStepType } from '../../content/industry-flows/index.js';
import { companyEventCompany } from '../../content/company-events/index.js';
import { companyProfilePathForCompanyId } from '../../content/company-profiles/index.js';

const stepTypeLabels: Record<IndustryFlowStepType, string> = {
  demand: '수요',
  requirements: '필요 요소',
  suppliers: '공급 기업',
  'use-cases': '사용처',
  evidence: '확인 항목',
};

type IndustryFlowCardProps = {
  flow: IndustryFlowEntry;
  compact?: boolean;
  currentCompanyId?: string;
};

export function IndustryFlowCard({ flow, compact = false, currentCompanyId }: IndustryFlowCardProps) {
  return (
    <section className={`industry-flow-card${compact ? ' is-compact' : ''}`} aria-labelledby={`${flow.id}-flow-title`}>
      <div className="industry-flow-card__heading">
        <span>5단계 산업 흐름</span>
        <h3 id={`${flow.id}-flow-title`}>{flow.title}</h3>
        <p>{flow.summary}</p>
      </div>
      <ol className="industry-flow-steps">
        {flow.steps.map((step, index) => {
          const isCurrent = Boolean(currentCompanyId && step.companyIds?.includes(currentCompanyId));
          return (
            <li className={isCurrent ? 'is-current' : ''} key={step.id} aria-current={isCurrent ? 'step' : undefined}>
              <span className="industry-flow-step__number" aria-label={`${index + 1}단계`}>{index + 1}</span>
              <div className="industry-flow-step__body">
                <span className="industry-flow-step__type">{stepTypeLabels[step.type]}</span>
                <h4>{step.title}</h4>
                <p>{step.description}</p>
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
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

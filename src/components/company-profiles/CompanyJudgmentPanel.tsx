import { useId, useState } from 'react';
import type {
  CompanyDirectionState,
  CompanyJudgmentCardKey,
  CompanyJudgmentModel,
} from '../../content/company-judgments/index.js';

const directionLabels: Record<CompanyDirectionState, string> = {
  opportunity: '기회 우세',
  balanced: '균형',
  burden: '부담 우세',
};

const cardLabels: Record<CompanyJudgmentCardKey, string> = {
  businessGrowth: '본업 성장',
  earningsQuality: '이익의 질',
  cashQuality: '현금의 질',
  investmentBurden: '투자·재무 부담',
};

const stateLabels = { good: '좋음', caution: '주의', bad: '나쁨' } as const;
const trendLabels = { improving: '개선 중', steady: '유지', worsening: '악화 중' } as const;
const sourceTypeLabels = {
  'official-filing': '공식 공시',
  'company-ir': '기업 IR',
  'exchange-public-data': '거래소·공공통계',
  'industry-data': '산업자료',
  'external-analysis': '외부 분석자료',
} as const;
const scopeLabels = { consolidated: '연결', separate: '별도', segment: '세그먼트' } as const;

export function CompanyJudgmentPanel({
  companyName,
  model,
}: {
  companyName: string;
  model: CompanyJudgmentModel;
}) {
  const sectionId = useId();
  const [openCard, setOpenCard] = useState<CompanyJudgmentCardKey | null>(null);

  return (
    <>
      <section className="company-judgment-summary" aria-labelledby={`${sectionId}-summary-title`}>
        <div className="company-dashboard-section-heading">
          <span>주가해부실의 현재 판단</span>
          <h2 id={`${sectionId}-summary-title`}>{companyName}의 두 가지 방향</h2>
        </div>
        <div className="company-judgment-summary-grid">
          {[
            { label: '기업 방향', judgment: model.companyDirection },
            { label: '시장 기대', judgment: model.marketExpectation },
          ].map(({ label, judgment }) => (
            <article key={label} className={`direction-${judgment.state}`}>
              <div><span>{label}</span><strong>{directionLabels[judgment.state]}</strong></div>
              <small>{judgment.horizon}</small>
              <p>{judgment.reason}</p>
            </article>
          ))}
        </div>
        <p className="company-judgment-summary-note">기업 방향은 사업·실적·현금흐름, 시장 기대는 가까운 분기의 기대 수준과 투자 부담을 판단합니다. 기업 방향이 기회 우세여도 주가 상승을 뜻하지 않습니다.</p>
      </section>

      <section className="company-judgment-cards" aria-labelledby={`${sectionId}-cards-title`}>
        <div className="company-dashboard-section-heading">
          <span>현재 정보에서 더 중요한 요인</span>
          <h2 id={`${sectionId}-cards-title`}>네 가지 판단</h2>
          <p>카드를 열면 원인과 숫자를 확인할 수 있습니다. 한 번에 하나만 열립니다.</p>
        </div>
        <div className="company-judgment-accordion">
          {model.cards.map((card) => {
            const isOpen = openCard === card.key;
            const panelId = `${sectionId}-${card.key}-panel`;
            const buttonId = `${sectionId}-${card.key}-button`;
            const sources = model.sources.filter((source) => card.sourceIds.includes(source.sourceId));
            return (
              <article key={card.key} className={`company-judgment-card state-${card.state}${isOpen ? ' is-open' : ''}`}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenCard(isOpen ? null : card.key)}
                  >
                    <span className="company-judgment-card-title">{cardLabels[card.key]} <em>{stateLabels[card.state]}</em></span>
                    <span className="company-judgment-card-reason">{card.reason}</span>
                    <span className="company-judgment-card-toggle" aria-hidden="true">{isOpen ? '접기' : '보기'}</span>
                  </button>
                </h3>
                <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen} className="company-judgment-card-panel">
                  <dl className="company-judgment-trend">
                    <div><dt>추세</dt><dd>{trendLabels[card.trend]}</dd></div>
                    <div><dt>분석 기준</dt><dd><time dateTime={card.asOf}>{card.asOf.replace(/-/g, '.')}</time></dd></div>
                  </dl>
                  <div className="company-judgment-cause">
                    <h4>왜 이렇게 판단했나요?</h4>
                    <ol>{card.causeFlow.map((cause) => <li key={cause}>{cause}</li>)}</ol>
                  </div>
                  <div className="company-judgment-metrics">
                    <h4>핵심 숫자</h4>
                    <dl>{card.metrics.map((metric) => (
                      <div key={`${metric.label}-${metric.period}`}>
                        <dt>{metric.label}<small>{metric.period}</small></dt>
                        <dd><strong>{metric.value}</strong><span>{metric.comparison}</span></dd>
                      </div>
                    ))}</dl>
                  </div>
                  <div className="company-judgment-reversal">
                    <h4>판단이 달라지는 조건</h4>
                    <p>{card.reversalCondition}</p>
                  </div>
                  <details className="company-judgment-sources">
                    <summary>근거 자료 보기</summary>
                    <div>{sources.map((source) => (
                      <article key={source.sourceId}>
                        <span>{sourceTypeLabels[source.sourceType]} · {scopeLabels[source.scope]}</span>
                        <h4>{source.sourceTitle}</h4>
                        <dl>
                          <div><dt>기준 시점</dt><dd>{source.asOf.replace(/-/g, '.')}</dd></div>
                          <div><dt>해당 기간</dt><dd>{source.period}</dd></div>
                          <div><dt>발행일</dt><dd>{source.publishedAt.replace(/-/g, '.')}</dd></div>
                          <div><dt>지표 정의</dt><dd>{source.metricDefinition}</dd></div>
                          {source.limitation ? <div><dt>한계</dt><dd>{source.limitation}</dd></div> : null}
                        </dl>
                        <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`${source.sourceTitle} 원문 열기`}>공식 원문 보기</a>
                      </article>
                    ))}</div>
                  </details>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}

import { IndustryFlowCard } from '../components/industry-flows/IndustryFlowCard.js';
import { industryFlows } from '../content/industry-flows/index.js';
import { reportById } from '../content/reports/index.js';

export default function DemandSupplyRoute() {
  return <main className="demand-supply-main portfolio-industry-archive">
    <header className="demand-supply-intro"><p className="home-kicker">산업 리서치</p><h1>산업이 연결되는 구조</h1><p>수요가 장비·부품·기업의 역할로 이어지는 과정을 공식 자료와 함께 정리했습니다.</p></header>
    <section aria-labelledby="industry-archive-title"><h2 id="industry-archive-title">산업별 연결 흐름</h2><p className="editorial-archive-note">각 흐름은 표시된 검토일의 자료를 기준으로 합니다. 실시간 수요 지표나 기업 간 계약 지도가 아닙니다.</p>
      {industryFlows.map((flow) => <article className="portfolio-industry-entry" key={flow.id} id={flow.demandSupplyIds[0]}>
        <p className="editorial-card-basis">자료 검토 <time dateTime={flow.reviewedAt}>{flow.reviewedAt.replace(/-/g, '.')}</time></p>
        <IndustryFlowCard flow={flow} variant="detail" />
        <div className="editorial-related-links">{flow.reportIds.map(reportById).filter((report) => Boolean(report)).slice(0, 2).map((report) => <a key={report!.id} href={`/ko/reports/${encodeURIComponent(report!.slug)}`}>{report!.publisher} · {report!.titleKo}</a>)}</div>
      </article>)}
    </section>
  </main>;
}

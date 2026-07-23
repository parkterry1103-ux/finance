import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { trackAnalyticsEvent } from '../analytics/index.js';
import { loadResearchReport } from '../content/research-reports/registry.js';
import type {
  ResearchClaim,
  ResearchEvidence,
  ResearchReportModel,
  ResearchSource,
} from '../content/research-reports/types.js';

type Props = {
  slug: string;
  navigation: ReactNode;
  onNavigate: (path: string) => void;
};

function internalLink(path: string, onNavigate: (path: string) => void) {
  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate(path);
  };
}

function sourceNumbers(sourceIds: string[], sources: ResearchSource[]) {
  return [...new Set(sourceIds
    .map((id) => sources.findIndex((source) => source.id === id) + 1)
    .filter((index) => index > 0))]
    .sort((a, b) => a - b);
}

function evidenceSources(evidenceIds: string[], evidence: ResearchEvidence[]) {
  const evidenceMap = new Map(evidence.map((item) => [item.id, item]));
  const sourceIds = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);
    const item = evidenceMap.get(id);
    item?.sourceIds.forEach((sourceId) => sourceIds.add(sourceId));
    item?.dependsOnEvidenceIds?.forEach(visit);
  };
  evidenceIds.forEach(visit);
  return [...sourceIds];
}

function Citations({ sourceIds, report }: { sourceIds: string[]; report: ResearchReportModel }) {
  const numbers = sourceNumbers(sourceIds, report.sources);
  if (!numbers.length) return null;
  return <span className="research-citations" aria-label={`출처 ${numbers.join(', ')}`}>
    {numbers.map((number) => <a key={number} href={`#source-${number}`}>[{number}]</a>)}
  </span>;
}

function EvidenceCitations({ evidenceIds, report }: { evidenceIds: string[]; report: ResearchReportModel }) {
  return <Citations sourceIds={evidenceSources(evidenceIds, report.evidence)} report={report} />;
}

function ClaimList({ claims, report }: { claims: ResearchClaim[]; report: ResearchReportModel }) {
  return <div className="research-paragraph-list">{claims.map((claim) => <article key={claim.title} className="research-paragraph">
    <h3>{claim.title}</h3>
    <p>{claim.body}<EvidenceCitations evidenceIds={claim.evidenceIds} report={report} /></p>
  </article>)}</div>;
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="research-section-heading"><div><p>{eyebrow}</p><h2>{title}</h2></div></div>;
}

function ResearchReport({
  report,
  navigation,
  onNavigate,
}: {
  report: ResearchReportModel;
  navigation: ReactNode;
  onNavigate: (path: string) => void;
}) {
  const latestEvent = report.materialNewsEvents[0];
  const valuationPath = `/ko/companies/${report.slug}/valuation`;
  const financialPath = `/ko/companies/${report.slug}/financials`;
  return <div className="pick-shell research-report-shell">
    <div className="research-screen-navigation">{navigation}</div>
    <main className="research-report-main">
      <div className="research-report-actions">
        <a href={`/ko/companies/${report.slug}`} onClick={internalLink(`/ko/companies/${report.slug}`, onNavigate)}>
          <ArrowLeft size={16} aria-hidden="true" /> 기업 해부
        </a>
        <a href={valuationPath} onClick={(event) => {
          trackAnalyticsEvent('company_valuation_click', {
            companySlug: report.slug,
            placement: 'report',
            destinationType: 'valuation',
          });
          internalLink(valuationPath, onNavigate)(event);
        }}>시장가격에 반영된 기대 보기 <ArrowRight size={15} aria-hidden="true" /></a>
      </div>

      <section className="research-report-cover" id="report-cover" aria-labelledby="research-report-title">
        <p className="research-report-brand">주가해부실 Research <span>장기 기업 판단</span></p>
        <div className="research-report-identity">
          <span>{report.ticker} · {report.industry}</span>
          <h1 id="research-report-title">{report.companyName} 리서치 리포트</h1>
          <p>{report.englishName}</p>
          <strong className="research-report-title">{report.reportTitle}</strong>
        </div>
        <div className="research-report-conclusion">
          <span>한 줄 판단</span>
          <strong>{report.conclusion}</strong>
        </div>
        <dl className="research-report-dates">
          <div><dt>리포트 작성일</dt><dd>{report.snapshot.publishedAt}</dd></div>
          <div><dt>최근 업데이트일</dt><dd>{report.snapshot.updatedAt ?? '초판'}</dd></div>
          <div><dt>뉴스 반영 기준</dt><dd>{report.snapshot.newsCutoffAt.slice(0, 10)}</dd></div>
          <div><dt>재무자료 기준</dt><dd>{report.snapshot.financialDataAsOf}</dd></div>
          <div><dt>리포트 버전</dt><dd>{report.snapshot.version}</dd></div>
        </dl>
      </section>

      <nav className="research-report-toc" aria-label="리포트 목차">
        <strong>읽는 순서</strong>
        <ol>
          <li><a href="#report-brief">핵심 브리프</a></li>
          <li><a href="#report-refutation">반증 조건</a></li>
          <li><a href="#report-advanced">고급 근거</a></li>
          <li><a href="#report-sources">출처</a></li>
        </ol>
      </nav>

      <section id="report-brief" className="research-report-section research-report-brief">
        <SectionHeading eyebrow="Research brief" title="핵심 브리프" />
        <div className="research-brief-grid">
          <article>
            <span>좋은 점 3개</span>
            <ClaimList claims={report.executiveSummary.strengths.slice(0, 3)} report={report} />
          </article>
          <article>
            <span>위험 3개</span>
            <ClaimList claims={report.executiveSummary.risks.slice(0, 3)} report={report} />
          </article>
          <article>
            <span>최근 바뀐 것</span>
            {latestEvent ? <>
              <h3>{latestEvent.title}</h3>
              <p>{latestEvent.summary}<Citations sourceIds={[latestEvent.sourceId]} report={report} /></p>
              <small>{latestEvent.publishedAt} · {latestEvent.confidence === 'confirmed' ? '확인됨' : '추가 확인 필요'}</small>
            </> : <p>최근 공식 업데이트 없음</p>}
          </article>
          <article>
            <span>현재 가격에 반영된 기대</span>
            <h3>모형 수치와 가정은 가치평가 화면에서 확인합니다.</h3>
            <p>리서치 리포트는 사업 구조·해자·성장동력·위험의 장기 판단에 집중합니다. 가격과 모형 범위는 같은 기준일의 별도 화면에서 확인할 수 있습니다.</p>
            <a href={valuationPath} onClick={internalLink(valuationPath, onNavigate)}>시장가격에 반영된 기대 보기 <ArrowRight size={15} aria-hidden="true" /></a>
          </article>
        </div>
      </section>

      <section id="report-refutation" className="research-report-section">
        <SectionHeading eyebrow="Falsification & watch" title="반증 조건과 다음 확인" />
        <div className="research-refutation-grid">
          <article>
            <h3>판단이 바뀌는 조건</h3>
            <ul>{report.judgments.map((item) => <li key={item.label}>
              <strong>{item.label}</strong>
              <span>{item.changeCondition}</span>
              <EvidenceCitations evidenceIds={item.evidenceIds} report={report} />
            </li>)}</ul>
          </article>
          <article>
            <h3>다음 확인</h3>
            <ClaimList claims={report.executiveSummary.nextChecks.slice(0, 3)} report={report} />
            <p className="research-watch-box">{report.watchStatement}</p>
          </article>
        </div>
      </section>

      <details id="report-advanced" className="research-report-section research-report-advanced">
        <summary>고급 보기 · 사업부·해자·공시 근거</summary>
        <div className="research-report-advanced-body">
          <section>
            <h2>사업 구조</h2>
            <ClaimList claims={report.sections.business} report={report} />
          </section>
          <section>
            <h2>확인된 해자와 약화 조건</h2>
            <div className="research-moat-list">{report.moat.map((item) => <article key={item.source}>
              <h3>{item.source}</h3>
              <dl>
                <div><dt>현재 근거</dt><dd>{item.evidence}<EvidenceCitations evidenceIds={item.evidenceIds} report={report} /></dd></div>
                <div><dt>실적으로 이어지는 경로</dt><dd>{item.earningsPath}</dd></div>
                <div><dt>약해질 수 있는 조건</dt><dd>{item.weakeningCondition}</dd></div>
                <div><dt>다음 확인 지표</dt><dd>{item.nextMetric}</dd></div>
              </dl>
            </article>)}</div>
          </section>
          <section>
            <h2>재무건전성과 산업 역할</h2>
            <div className="research-context-grid">
              <article><span>{report.financialHealth.status}</span><p>{report.financialHealth.explanation}</p><small>변경 조건 · {report.financialHealth.changeCondition}</small></article>
              <article><span>{report.cycleRole.role}</span><p>{report.cycleRole.currentPosition}<EvidenceCitations evidenceIds={report.cycleRole.evidenceIds} report={report} /></p><small>변경 조건 · {report.cycleRole.changeCondition}</small></article>
            </div>
          </section>
          <section>
            <h2>작성 시점 사건 영향 기록</h2>
            <div className="research-news-list">{report.materialNewsEvents.map((event) => <article key={event.id}>
              <header><div><time dateTime={event.publishedAt}>{event.publishedAt}</time><h3>{event.title}</h3></div></header>
              <dl>
                <div><dt>무슨 일이 있었나</dt><dd>{event.summary}<Citations sourceIds={[event.sourceId]} report={report} /></dd></div>
                <div><dt>왜 중요한가</dt><dd>{event.whyItMatters}</dd></div>
                <div><dt>다음 확인</dt><dd>{event.watchItems.join(' · ')}</dd></div>
              </dl>
            </article>)}</div>
          </section>
          <div className="research-report-surface-links">
            <a href={financialPath} onClick={internalLink(financialPath, onNavigate)}>재무 원자료와 기간 비교 <ArrowRight size={15} aria-hidden="true" /></a>
            <a href={valuationPath} onClick={internalLink(valuationPath, onNavigate)}>시장가격과 모형 가정 <ArrowRight size={15} aria-hidden="true" /></a>
          </div>
        </div>
      </details>

      <section id="report-sources" className="research-report-section research-method-section">
        <SectionHeading eyebrow="Sources & limits" title="출처·한계·면책" />
        <ol className="research-source-list">{report.sources.map((source, index) => <li key={source.id} id={`source-${index + 1}`}>
          <span>[{index + 1}]</span>
          <div>
            <strong>{source.publisher} · {source.title}</strong>
            <small>{[
              source.documentType ?? '원본 자료',
              source.publishedAt ? `공시·발표 ${source.publishedAt}` : '',
              source.periodEnd ? `대상 기간 ${source.periodEnd}` : '',
            ].filter(Boolean).join(' · ')}</small>
            <details><summary>기술 정보</summary><dl>
              <div><dt>source ID</dt><dd>{source.id}</dd></div>
              {source.accessionNumber ? <div><dt>Accession number</dt><dd>{source.accessionNumber}</dd></div> : null}
              {source.xbrlConcepts?.length ? <div><dt>XBRL concept</dt><dd>{source.xbrlConcepts.join(', ')}</dd></div> : null}
            </dl></details>
          </div>
          <a href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`${source.title} 원문 열기`}>원문 <ExternalLink size={13} aria-hidden="true" /></a>
        </li>)}</ol>
        <h3>방법론과 한계</h3>
        <ul className="research-limitations">{report.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
        <aside className="research-disclaimer"><strong>주의</strong><p>이 자료는 공개 정보에 기반한 교육·리서치 자료이며 투자 권유가 아닙니다. 데이터와 판단은 이후 변경될 수 있고 최종 판단과 책임은 이용자에게 있습니다.</p></aside>
      </section>
    </main>
  </div>;
}

export default function ResearchReportRoute({ slug, navigation, onNavigate }: Props) {
  const [report, setReport] = useState<ResearchReportModel | null | undefined>(undefined);
  useEffect(() => {
    let active = true;
    setReport(undefined);
    loadResearchReport(slug).then((value) => {
      if (active) setReport(value);
    });
    return () => { active = false; };
  }, [slug]);
  useEffect(() => {
    if (!report) return;
    trackAnalyticsEvent('research_report_view', { companySlug: report.slug }, {
      oncePerPage: true,
      dedupeKey: report.slug,
    });
  }, [report?.slug]);

  if (report === undefined) return <div className="pick-shell research-report-shell">{navigation}<main className="research-report-status" aria-live="polite"><p>리서치 리포트를 불러오는 중입니다.</p></main></div>;
  if (report === null) return <div className="pick-shell research-report-shell">{navigation}<main className="research-report-status"><h1>해당 리서치 리포트를 찾을 수 없습니다.</h1><p>현재 공개된 기업 리서치 리포트는 기업 해부에서 확인해 주세요.</p><a href="/ko/companies" onClick={internalLink('/ko/companies', onNavigate)}>기업 분석으로 이동</a></main></div>;
  return <ResearchReport report={report} navigation={navigation} onNavigate={onNavigate} />;
}

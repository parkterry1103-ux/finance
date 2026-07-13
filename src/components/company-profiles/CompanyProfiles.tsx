import { useState, type ReactNode } from 'react';
import { ArrowRight, ExternalLink, Factory, FileSearch, Network, ShieldAlert } from 'lucide-react';
import {
  companyEventStageLabels,
  companyEventTypeLabels,
} from '../../content/company-events/index.js';
import {
  marketMapEvidenceLevelLabels,
  marketMapRelationTypeLabels,
} from '../../content/market-map-relations/index.js';
import type { CompanyResearchProfileViewModel } from '../../content/company-profiles/index.js';
import { sourceRegistry } from '../../content/sources/index.js';
import { bottleneckStatusLabels, bottleneckTrendLabels } from '../../content/bottlenecks/index.js';
import { priceDirection, priceDisplay } from '../../services/prices.js';

type Navigate = (path: string) => void;

type SharedProps = {
  navigation: ReactNode;
  onNavigate: Navigate;
};

function internalLink(path: string, onNavigate: Navigate) {
  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onNavigate(path);
  };
}

function formatDate(value: string) {
  return value ? value.replace(/-/g, '.') : '확인 제한';
}

function CompanyProfileMonogram({ profile }: { profile: CompanyResearchProfileViewModel }) {
  return <span className="company-profile-monogram" aria-hidden="true">{profile.company.name.replace(/[^A-Za-z0-9가-힣]/g, '').slice(0, 2).toUpperCase()}</span>;
}

export function CompanyProfilesListPage({
  profiles,
  navigation,
  onNavigate,
}: SharedProps & { profiles: CompanyResearchProfileViewModel[] }) {
  const [country, setCountry] = useState<'all' | 'KR' | 'US'>('all');
  const visible = profiles.filter((profile) => country === 'all' || profile.company.country === country);
  return (
    <div className="pick-shell company-profiles-shell">
      {navigation}
      <main className="company-profiles-main">
        <section className="company-profiles-hero" aria-labelledby="company-profiles-title">
          <p>산업·공식 발표·공급망 연결 기업</p>
          <h1 id="company-profiles-title">기업 한눈에 보기</h1>
          <span>기업이 무엇을 하는지, 어떤 산업 흐름에 속하는지, 최근 어떤 변화를 공식 발표했는지 함께 살펴봅니다.</span>
        </section>

        <div className="company-profile-country-filter" aria-label="기업 국가 필터">
          {([
            ['all', '전체'],
            ['KR', '한국'],
            ['US', '미국'],
          ] as const).map(([value, label]) => (
            <button key={value} type="button" aria-pressed={country === value} onClick={() => setCountry(value)}>{label}</button>
          ))}
        </div>

        <section className="company-profile-list-grid" aria-label={`기업 프로필 ${visible.length}개`}>
          {visible.map((profile) => {
            const recentEvent = profile.companyEvents[0];
            const firstMap = profile.marketMaps[0];
            const path = `/ko/companies/${encodeURIComponent(profile.profile.slug)}`;
            return (
              <a className="company-profile-list-card" key={profile.profile.id} href={path} onClick={internalLink(path, onNavigate)}>
                <div className="company-profile-list-identity">
                  <CompanyProfileMonogram profile={profile} />
                  <div><h2>{profile.company.name}</h2><span>{profile.company.countryLabel} · {profile.company.ticker}</span></div>
                </div>
                <p>{profile.profile.beginnerSummary}</p>
                <dl>
                  <div><dt>주요 산업 역할</dt><dd>{profile.profile.primaryRole}</dd></div>
                  <div><dt>관련 시장지도</dt><dd>{firstMap?.title ?? '산업 역할 설명으로 확인'}</dd></div>
                </dl>
                {recentEvent ? <div className="company-profile-list-event"><span>최근 공식 변화</span><strong>{recentEvent.title}</strong><small>{formatDate(recentEvent.eventDate)}</small></div> : null}
                <strong className="company-profile-list-cta">기업 자세히 보기 <ArrowRight size={15} aria-hidden="true" /></strong>
              </a>
            );
          })}
        </section>
      </main>
    </div>
  );
}

export function CompanyProfileNotFoundPage({ navigation, onNavigate }: SharedProps) {
  return (
    <div className="pick-shell company-profiles-shell">
      {navigation}
      <main className="company-profile-not-found">
        <h1>해당 기업을 찾을 수 없습니다.</h1>
        <p>기업 목록에서 다시 선택해 주세요.</p>
        <div>
          <a href="/ko/companies" onClick={internalLink('/ko/companies', onNavigate)}>기업 목록으로 이동</a>
          <a href="/ko/market-map" onClick={internalLink('/ko/market-map', onNavigate)}>시장지도에서 찾기</a>
        </div>
      </main>
    </div>
  );
}

export function CompanyResearchProfilePage({
  viewModel,
  navigation,
  onNavigate,
}: SharedProps & { viewModel: CompanyResearchProfileViewModel }) {
  const { company, profile } = viewModel;
  const direction = priceDirection(viewModel.price);
  const price = direction === 'pending' ? undefined : priceDisplay(viewModel.price);
  const primaryMap = viewModel.marketMaps[0];
  const primarySource = viewModel.sources[0];
  return (
    <div className="pick-shell company-profiles-shell company-profile-detail-shell">
      {navigation}
      <main className="company-profile-detail-main">
        <nav className="company-profile-breadcrumb" aria-label="현재 위치">
          <a href="/ko/companies" onClick={internalLink('/ko/companies', onNavigate)}>기업 한눈에 보기</a><span aria-hidden="true">/</span><strong>{company.name}</strong>
        </nav>

        <section className="company-profile-identity-hero" aria-labelledby="company-profile-title">
          <CompanyProfileMonogram profile={viewModel} />
          <div className="company-profile-identity-copy">
            <span>{company.countryLabel} · {company.ticker}</span>
            <h1 id="company-profile-title">{company.name}</h1>
            <strong>{profile.primaryRole}</strong>
            <p>{profile.beginnerSummary}</p>
            <small>최근 검토 {formatDate(profile.reviewedAt)}</small>
            <div className="company-profile-hero-actions">
              {primaryMap ? <a href={primaryMap.route} onClick={internalLink(primaryMap.route, onNavigate)}>시장지도에서 보기 <ArrowRight size={14} aria-hidden="true" /></a> : null}
              {primarySource ? <a href={primarySource.url} target="_blank" rel="noopener noreferrer">공식 자료 보기 <ExternalLink size={14} aria-hidden="true" /></a> : null}
            </div>
          </div>
          {price ? (
            <aside className={`company-profile-price direction-${direction}`} aria-label={`${company.name} 가격 보조 정보`}>
              <span>{price.status}</span><strong>{price.amount}</strong>
              <em>{direction === 'up' ? '▲' : direction === 'down' ? '▼' : '—'} {price.percent || '0.00%'}</em>
              <small>{viewModel.price?.asOf ?? '기준 시각 확인 제한'}</small>
            </aside>
          ) : null}
        </section>

        <section className="company-profile-section company-profile-business" aria-labelledby="company-business-title">
          <div className="company-profile-section-heading"><span>사업과 역할</span><h2 id="company-business-title">이 회사는 무엇을 하나요?</h2></div>
          <p>{profile.businessDescription}</p>
          <div className="company-profile-business-details">
            <article><h3>산업 역할</h3><strong>{profile.primaryRole}</strong></article>
            {viewModel.products.length ? <article><h3>주요 제품·서비스</h3><ul>{viewModel.products.map((product) => <li key={product}>{product}</li>)}</ul></article> : null}
          </div>
        </section>

        <section className="company-profile-section" aria-labelledby="company-map-title">
          <div className="company-profile-section-heading"><span>산업 연결</span><h2 id="company-map-title">산업 흐름에서 어디에 있나요?</h2><p>시장지도 연결은 산업 역할을 설명하며 특정 직접 계약을 뜻하지 않을 수 있습니다.</p></div>
          {viewModel.marketMaps.length ? <div className="company-profile-map-grid">{viewModel.marketMaps.map((map) => (
            <article key={map.id}>
              <Factory size={20} aria-hidden="true" /><span>{map.subtitle}</span><h3>{map.title}</h3><strong>{map.role}</strong><p>{map.connectionNote}</p>
              <a href={map.route} onClick={internalLink(map.route, onNavigate)}>시장지도에서 전체 흐름 보기 <ArrowRight size={14} aria-hidden="true" /></a>
            </article>
          ))}</div> : <p className="company-profile-empty-copy">등록된 시장지도 노드는 없으며 현재는 공식 자료에 근거한 산업 역할 설명만 표시합니다.</p>}
        </section>

        <section className="company-profile-section" aria-labelledby="company-events-title">
          <div className="company-profile-section-heading"><span>공식 사실</span><h2 id="company-events-title">최근 공식적으로 밝힌 변화</h2></div>
          {viewModel.companyEvents.length ? <div className="company-profile-event-grid">{viewModel.companyEvents.map((event) => {
            const source = sourceRegistry[event.sourceRefs[0]];
            return (
              <article key={event.id}>
                <div><time dateTime={event.eventDate}>{formatDate(event.eventDate)}</time><span>{companyEventTypeLabels[event.eventType]} · {companyEventStageLabels[event.stage]}</span></div>
                <h3>{event.title}</h3><p><strong>확인된 사실</strong>{event.factualSummary}</p><p><strong>왜 확인할 변화인가</strong>{event.whyItMatters}</p>
                <details><summary>앞으로 확인할 것</summary><ul>{event.nextCheckpoints.map((checkpoint) => <li key={checkpoint}>{checkpoint}</li>)}</ul></details>
                {source ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher} 공식 원문 <ExternalLink size={13} aria-hidden="true" /></a> : null}
              </article>
            );
          })}</div> : <p className="company-profile-empty-copy">현재 등록된 검토 이벤트가 없습니다. 공식 공시와 기업 발표를 추가 확인할 예정입니다.</p>}
        </section>

        <section className="company-profile-section" aria-labelledby="company-demand-title">
          <div className="company-profile-section-heading"><span>산업 배경</span><h2 id="company-demand-title">수요와 공급 배경</h2><p>이 기업과 함께 살펴볼 산업 배경입니다. 해당 기업의 실적이나 시장 가격을 직접 의미하지는 않습니다.</p></div>
          <div className="company-profile-demand-grid">
            {viewModel.demandSupply.map((entry) => {
              const bottleneck = viewModel.bottlenecks.find((item) => item.id === entry.bottleneckId);
              return <article key={entry.id}><span>수요·공급</span><h3>{entry.title}</h3><p><strong>수요 배경</strong>{entry.demandContext}</p><p><strong>공급 상태</strong>{bottleneck ? `${bottleneckStatusLabels[bottleneck.status]} · ${bottleneckTrendLabels[bottleneck.trend]}` : entry.supplyContext}</p>{bottleneck ? <p><strong>완화 신호</strong>{bottleneck.reliefSignals[0]}</p> : null}<small>검토일 {formatDate(bottleneck?.reviewedAt ?? '')}</small></article>;
            })}
            {viewModel.bottlenecks.filter((bottleneck) => !viewModel.demandSupply.some((entry) => entry.bottleneckId === bottleneck.id)).map((bottleneck) => (
              <article key={bottleneck.id}><span>공급망 병목</span><h3>{bottleneck.shortTitle}</h3><p>{bottleneck.summary}</p><p><strong>공급 추세</strong>{bottleneckTrendLabels[bottleneck.trend]}</p><small>검토일 {formatDate(bottleneck.reviewedAt)}</small></article>
            ))}
          </div>
        </section>

        <section className="company-profile-section" aria-labelledby="company-relations-title">
          <div className="company-profile-section-heading"><span>산업 관계</span><h2 id="company-relations-title">같이 볼 기업</h2><p>관계 수는 기업 점수나 경쟁력 순위가 아닙니다. 관계 유형과 근거 수준을 먼저 확인하세요.</p></div>
          {viewModel.companyRelations.length ? <div className="company-profile-relation-grid">{viewModel.companyRelations.map(({ relation, company: related, profileSlug, companyPath, evidencePath }) => (
            <article key={relation.id}>
              <div><Network size={18} aria-hidden="true" /><span>{related.countryLabel} · {related.ticker || 'ticker 확인 제한'}</span></div><h3>{related.name}</h3>
              <div className="company-profile-relation-badges"><span>{marketMapRelationTypeLabels[relation.relationType]}</span><em>{marketMapEvidenceLevelLabels[relation.evidenceLevel]}</em></div>
              <p>{relation.explanation}</p><small>{relation.caution}</small>
              <div className="company-profile-relation-actions"><a href={companyPath} onClick={internalLink(companyPath, onNavigate)}>{profileSlug ? '기업 보기' : '시장지도에서 보기'}</a><a href={evidencePath} onClick={internalLink(evidencePath, onNavigate)}>관계 근거 보기</a></div>
            </article>
          ))}</div> : <p className="company-profile-empty-copy">현재 기본 화면에 표시할 검토 완료 기업 관계가 없습니다. 직접 관계를 임의로 만들지 않습니다.</p>}
        </section>

        {viewModel.picks.length ? <section className="company-profile-section" aria-labelledby="company-pick-title">
          <div className="company-profile-section-heading"><span>편집 관점</span><h2 id="company-pick-title">관련 Pick</h2></div>
          {viewModel.picks.map((pick) => <article className="company-profile-pick-card" key={pick.id}><FileSearch size={20} aria-hidden="true" /><span>{formatDate(pick.publishedAt ?? '')} 검토</span><h3>{pick.title}</h3><p>{pick.reasonSummary}</p><a href={`/ko/picks/${encodeURIComponent(pick.id)}`} onClick={internalLink(`/ko/picks/${encodeURIComponent(pick.id)}`, onNavigate)}>Pick 자세히 보기 <ArrowRight size={14} aria-hidden="true" /></a></article>)}
        </section> : null}

        {viewModel.verifiedMetrics.length ? <section className="company-profile-section" aria-labelledby="company-metrics-title">
          <div className="company-profile-section-heading"><span>공식 수치</span><h2 id="company-metrics-title">현재 확인 가능한 숫자</h2></div>
          <div className="company-profile-metric-grid">{viewModel.verifiedMetrics.map((metric) => <article key={`${metric.reportId}-${metric.label}`}><span>{metric.label}</span><strong>{metric.value}</strong><p>{metric.context}</p><small>{metric.asOf ? `${metric.asOf} · ` : ''}{metric.reportTitle}</small></article>)}</div>
        </section> : null}

        <section className="company-profile-section" aria-labelledby="company-sources-title">
          <div className="company-profile-section-heading"><span>판단 근거</span><h2 id="company-sources-title">관련 보고서·공식 자료</h2></div>
          <div className="company-profile-resource-grid">
            {viewModel.reports.map((report) => <a key={report.id} href={`/ko/reports/${encodeURIComponent(report.slug)}`} onClick={internalLink(`/ko/reports/${encodeURIComponent(report.slug)}`, onNavigate)}><span>{report.publisher}</span><strong>{report.titleKo}</strong><small>산업 보고서 보기 <ArrowRight size={13} aria-hidden="true" /></small></a>)}
            {viewModel.sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer"><span>{source.publisher} · 공식 자료</span><strong>{source.title}</strong><small>외부 원문 <ExternalLink size={13} aria-hidden="true" /></small></a>)}
          </div>
        </section>

        <section className="company-profile-caution" aria-labelledby="company-caution-title">
          <ShieldAlert size={21} aria-hidden="true" />
          <div><span>주의사항</span><h2 id="company-caution-title">사실과 산업 맥락을 나눠 봅니다</h2><p>이 페이지는 기업의 산업 역할과 공식 발표를 연결해 이해하기 위한 자료입니다.</p><p>시장지도 관계는 산업 맥락을 포함하며 특정 직접 계약을 의미하지 않을 수 있습니다.</p><p>기업의 공식 발표는 향후 실적이나 시장 가격을 보장하지 않습니다.</p><p>가격은 정보 제공용이며 투자 판단이나 추천이 아닙니다.</p><strong>{profile.caution}</strong></div>
        </section>
      </main>
    </div>
  );
}

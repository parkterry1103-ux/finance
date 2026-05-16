import { useEffect, useMemo, useState } from 'react';
import {
  Background,
  Controls,
  Edge,
  Handle,
  MiniMap,
  Node,
  NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Database,
  ExternalLink,
  Factory,
  FileSearch,
  Filter,
  Globe2,
  LineChart,
  Network,
  Newspaper,
  PanelRightOpen,
  Radio,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  analystOpinions,
  anchors,
  companies,
  Company,
  CompanyTier,
  countries,
  CountryId,
  links,
  RiskLevel,
  sectors,
  sourcePolicies,
} from './data';

type NodeData = {
  company: Company;
  isSelected: boolean;
  isDimmed: boolean;
};

type NewsItem = {
  title: string;
  url: string;
  domain: string;
  source: string;
  seendate: string;
  language?: string;
};

type NewsState = {
  status: 'idle' | 'loading' | 'success' | 'empty' | 'error';
  items: NewsItem[];
  updatedAt?: string;
  error?: string;
};

const tierLabels: Record<CompanyTier, string> = {
  anchor: '앵커 기업',
  tier1: '1차 협력 기업',
  tier2: '하청·중소형 기업',
};

const riskLabels: Record<RiskLevel, string> = {
  low: '낮음',
  medium: '중간',
  high: '높음',
};

const riskClass: Record<RiskLevel, string> = {
  low: 'risk-low',
  medium: 'risk-medium',
  high: 'risk-high',
};

function SupplyNode({ data }: NodeProps<Node<NodeData>>) {
  const { company, isSelected, isDimmed } = data;
  const isAnchor = company.tier === 'anchor';
  const StatusIcon = company.status === 'opportunity' ? Sparkles : company.status === 'watch' ? ShieldAlert : CheckCircle2;

  return (
    <button
      className={[
        'supply-node',
        `tier-${company.tier}`,
        isSelected ? 'selected' : '',
        isDimmed ? 'dimmed' : '',
      ].join(' ')}
      type="button"
    >
      <Handle type="target" position={Position.Left} className="node-handle" />
      <div className="node-topline">
        <span className="node-tier">{tierLabels[company.tier]}</span>
        <span className={`risk-dot ${riskClass[company.riskLevel]}`} title={`리스크 ${riskLabels[company.riskLevel]}`} />
      </div>
      <div className="node-main">
        <span className="node-icon">{isAnchor ? <Building2 size={18} /> : <Factory size={18} />}</span>
        <span className="node-name">{company.name}</span>
      </div>
      <div className="node-meta">
        <span>{company.sector}</span>
        <StatusIcon size={14} />
      </div>
      <Handle type="source" position={Position.Right} className="node-handle" />
    </button>
  );
}

const nodeTypes = {
  supplyNode: SupplyNode,
};

function getNodePosition(company: Company) {
  const xByColumn = [34, 382, 742];
  if (company.layout.column === 0) {
    return { x: xByColumn[0], y: 380 };
  }
  if (company.layout.column === 1) {
    return { x: xByColumn[1], y: company.layout.row * 210 + 70 };
  }
  return { x: xByColumn[2], y: company.layout.row * 92 + 24 };
}

function getVisibleCompanies(anchorId: string, query: string, riskFilter: RiskLevel | 'all') {
  const lowerQuery = query.trim().toLowerCase();
  return companies
    .filter((company) => company.anchorId === anchorId)
    .filter((company) => {
      const matchesQuery =
        !lowerQuery ||
        [
          company.name,
          company.legalName,
          company.sector,
          company.region,
          company.products.join(' '),
          company.tags.join(' '),
          company.sourceNote,
        ]
          .join(' ')
          .toLowerCase()
          .includes(lowerQuery);
      const matchesRisk = riskFilter === 'all' || company.riskLevel === riskFilter;
      return matchesQuery && matchesRisk;
    });
}

function getConnectedIds(companyId: string, currentLinks: typeof links) {
  const connected = new Set([companyId]);
  currentLinks.forEach((link) => {
    if (link.source === companyId) connected.add(link.target);
    if (link.target === companyId) connected.add(link.source);
  });
  return connected;
}

function formatNewsDate(value: string) {
  if (!value) return '시간 미확인';
  const compact = value.replace(/[^0-9]/g, '');
  if (compact.length >= 14) {
    return `${compact.slice(0, 4)}.${compact.slice(4, 6)}.${compact.slice(6, 8)} ${compact.slice(8, 10)}:${compact.slice(10, 12)} UTC`;
  }
  return value;
}

function App() {
  const [selectedCountry, setSelectedCountry] = useState<CountryId>('KR');
  const [selectedSectorId, setSelectedSectorId] = useState('kr-semiconductors');
  const [selectedAnchorId, setSelectedAnchorId] = useState('kr-semiconductors-samsung');
  const [selectedCompanyId, setSelectedCompanyId] = useState('kr-semiconductors-samsung-한미반도체');
  const [query, setQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [newsState, setNewsState] = useState<NewsState>({ status: 'idle', items: [] });
  const [newsRefreshKey, setNewsRefreshKey] = useState(0);

  const country = countries.find((item) => item.id === selectedCountry) ?? countries[0];
  const countrySectors = sectors.filter((sector) => sector.country === selectedCountry);
  const selectedSector = sectors.find((sector) => sector.id === selectedSectorId) ?? countrySectors[0];
  const topAnchors = anchors.filter((anchor) => anchor.sectorId === selectedSector.id).sort((a, b) => a.rank - b.rank);
  const selectedAnchor = anchors.find((anchor) => anchor.id === selectedAnchorId) ?? topAnchors[0];
  const groupCompanies = companies.filter((company) => company.anchorId === selectedAnchor.id);
  const groupLinks = links.filter((link) => link.anchorId === selectedAnchor.id);
  const visibleCompanies = getVisibleCompanies(selectedAnchor.id, query, riskFilter);
  const visibleIds = new Set(visibleCompanies.map((company) => company.id));
  const visibleLinks = groupLinks.filter((link) => visibleIds.has(link.source) && visibleIds.has(link.target));
  const selectedCompany =
    groupCompanies.find((company) => company.id === selectedCompanyId) ??
    visibleCompanies.find((company) => company.tier !== 'anchor') ??
    groupCompanies.find((company) => company.tier !== 'anchor') ??
    groupCompanies[0];
  const selectedOpinions = analystOpinions.filter((opinion) => opinion.companyId === selectedCompany?.id);
  const connectedIds = selectedCompany ? getConnectedIds(selectedCompany.id, groupLinks) : new Set<string>();
  const filteredOutCount = groupCompanies.length - visibleCompanies.length;
  const opportunityCount = groupCompanies.filter((company) => company.status === 'opportunity').length;
  const highRiskCount = groupCompanies.filter((company) => company.riskLevel === 'high').length;

  const flowNodes: Node<NodeData>[] = useMemo(
    () =>
      groupCompanies.map((company) => {
        const isVisible = visibleIds.has(company.id);
        return {
          id: company.id,
          type: 'supplyNode',
          position: getNodePosition(company),
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          data: {
            company,
            isSelected: selectedCompany?.id === company.id,
            isDimmed: !isVisible || (selectedCompany ? !connectedIds.has(company.id) : false),
          },
        };
      }),
    [connectedIds, groupCompanies, selectedCompany, visibleIds],
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      groupLinks.map((link) => {
        const isVisible = visibleLinks.some((visibleLink) => visibleLink.id === link.id);
        const isConnected = selectedCompany ? link.source === selectedCompany.id || link.target === selectedCompany.id : false;
        return {
          id: link.id,
          source: link.source,
          target: link.target,
          label: `${link.label} · ${link.dependency}%`,
          animated: isConnected,
          type: 'smoothstep',
          className: [isVisible ? '' : 'edge-hidden', isConnected ? 'edge-active' : ''].join(' '),
          style: {
            strokeWidth: isConnected ? 3 : 2,
            stroke: isConnected ? '#2563eb' : '#9ca3af',
          },
          labelStyle: {
            fill: isConnected ? '#1d4ed8' : '#64748b',
            fontWeight: isConnected ? 700 : 600,
            fontSize: 12,
          },
          labelBgStyle: {
            fill: '#ffffff',
            fillOpacity: 0.88,
          },
        };
      }),
    [groupLinks, selectedCompany, visibleLinks],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      setNewsState((current) => ({ ...current, status: 'loading', error: undefined }));
      const params = new URLSearchParams({
        country: selectedCountry,
        sector: selectedSector.id,
        anchor: selectedAnchor.id,
      });

      try {
        const response = await fetch(`/api/news?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`news api ${response.status}`);
        }
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('news api returned non-JSON. Run `npm run dev:vercel` or deploy to Vercel.');
        }
        const payload = await response.json();
        if (cancelled) return;
        const items = Array.isArray(payload.articles) ? payload.articles : [];
        setNewsState({
          status: items.length ? 'success' : 'empty',
          items,
          updatedAt: payload.updatedAt,
        });
      } catch (error) {
        if (cancelled) return;
        setNewsState({
          status: 'error',
          items: [],
          updatedAt: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'news api error',
        });
      }
    }

    loadNews();
    const timer = window.setInterval(loadNews, 30 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [newsRefreshKey, selectedAnchor.id, selectedCountry, selectedSector.id]);

  function changeCountry(countryId: CountryId) {
    const nextSector = sectors.find((sector) => sector.country === countryId) ?? sectors[0];
    const nextAnchor = anchors.find((anchor) => anchor.sectorId === nextSector.id) ?? anchors[0];
    const nextCompany = companies.find((company) => company.anchorId === nextAnchor.id && company.tier !== 'anchor') ?? companies[0];
    setSelectedCountry(countryId);
    setSelectedSectorId(nextSector.id);
    setSelectedAnchorId(nextAnchor.id);
    setSelectedCompanyId(nextCompany.id);
    setQuery('');
    setRiskFilter('all');
  }

  function changeSector(sectorId: string) {
    const nextAnchor = anchors.find((anchor) => anchor.sectorId === sectorId) ?? anchors[0];
    const nextCompany = companies.find((company) => company.anchorId === nextAnchor.id && company.tier !== 'anchor') ?? companies[0];
    setSelectedSectorId(sectorId);
    setSelectedAnchorId(nextAnchor.id);
    setSelectedCompanyId(nextCompany.id);
    setQuery('');
    setRiskFilter('all');
  }

  function changeAnchor(anchorId: string) {
    const nextCompany = companies.find((company) => company.anchorId === anchorId && company.tier !== 'anchor') ?? companies[0];
    setSelectedAnchorId(anchorId);
    setSelectedCompanyId(nextCompany.id);
    setQuery('');
    setRiskFilter('all');
  }

  return (
    <ReactFlowProvider>
      <div className="app-shell">
        <aside className="left-panel">
          <div className="brand-block">
            <div className="brand-mark">
              <Network size={22} />
            </div>
            <div>
              <p className="eyebrow">한국·미국 공급망 인텔리전스</p>
              <h1>섹터별 협력 후보 맵</h1>
            </div>
          </div>

          <div className="country-toggle" aria-label="국가 선택">
            {countries.map((item) => (
              <button
                key={item.id}
                className={selectedCountry === item.id ? 'active' : ''}
                type="button"
                onClick={() => changeCountry(item.id)}
              >
                <Globe2 size={15} />
                {item.label}
              </button>
            ))}
          </div>

          <label className="field-label" htmlFor="sector-select">
            산업 섹터
          </label>
          <div className="select-wrap">
            <select id="sector-select" value={selectedSector.id} onChange={(event) => changeSector(event.target.value)}>
              {countrySectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
          <p className="context-copy">{selectedSector.description}</p>

          <div className="anchor-list">
            <div className="section-title">
              <Target size={16} />
              <span>섹터 기준 기업 3개</span>
            </div>
            {topAnchors.map((anchor) => (
              <button
                key={anchor.id}
                className={`anchor-row ${selectedAnchor.id === anchor.id ? 'selected' : ''}`}
                type="button"
                onClick={() => changeAnchor(anchor.id)}
              >
                <span className="rank-badge">#{anchor.rank}</span>
                <span>
                  <strong>{anchor.name}</strong>
                  <small>
                    {anchor.exchange} · {anchor.ticker}
                  </small>
                </span>
              </button>
            ))}
          </div>

          <label className="field-label" htmlFor="company-search">
            공급망 검색
          </label>
          <div className="search-box">
            <Search size={17} />
            <input
              id="company-search"
              type="search"
              placeholder="기업, 제품, 리스크, 소스"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="filter-row" aria-label="리스크 필터">
            <button className={riskFilter === 'all' ? 'active' : ''} onClick={() => setRiskFilter('all')} type="button">
              전체
            </button>
            <button className={riskFilter === 'high' ? 'active danger' : ''} onClick={() => setRiskFilter('high')} type="button">
              고위험
            </button>
            <button className={riskFilter === 'medium' ? 'active warn' : ''} onClick={() => setRiskFilter('medium')} type="button">
              중간
            </button>
            <button className={riskFilter === 'low' ? 'active stable' : ''} onClick={() => setRiskFilter('low')} type="button">
              낮음
            </button>
          </div>

          <div className="metric-grid">
            <div className="metric">
              <span>앵커</span>
              <strong>3</strong>
            </div>
            <div className="metric">
              <span>하청 기업</span>
              <strong>{groupCompanies.filter((company) => company.tier === 'tier2').length}</strong>
            </div>
            <div className="metric">
              <span>고위험</span>
              <strong>{highRiskCount}</strong>
            </div>
            <div className="metric">
              <span>필터 제외</span>
              <strong>{filteredOutCount}</strong>
            </div>
          </div>

          <div className="company-list">
            <div className="section-title">
              <Filter size={16} />
              <span>선택 앵커 공급망</span>
            </div>
            {visibleCompanies.map((company) => (
              <button
                className={`company-row ${selectedCompany?.id === company.id ? 'selected' : ''}`}
                key={company.id}
                onClick={() => setSelectedCompanyId(company.id)}
                type="button"
              >
                <span className={`tier-pill ${company.tier}`}>{tierLabels[company.tier]}</span>
                <span className="company-row-main">
                  <strong>{company.name}</strong>
                  <small>{company.sector}</small>
                </span>
                <span className={`risk-dot ${riskClass[company.riskLevel]}`} />
              </button>
            ))}
          </div>
        </aside>

        <main className="map-panel">
          <header className="topbar">
            <div>
              <p className="eyebrow">
                {country.label} · {selectedSector.label}
              </p>
              <h2>{selectedAnchor.name} 공급망</h2>
            </div>
            <div className="topbar-actions">
              <button type="button" className="icon-action" aria-label="공급망 맵">
                <Network size={18} />
              </button>
              <button type="button" className="icon-action" aria-label="데이터 소스">
                <Database size={18} />
              </button>
              <button type="button" className="primary-action">
                <Target size={17} />
                관심 기업 저장
              </button>
            </div>
          </header>

          <section className="graph-wrap" aria-label="공급망 관계도">
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={nodeTypes}
              onNodeClick={(_, node) => setSelectedCompanyId(node.id)}
              fitView
              minZoom={0.32}
              maxZoom={1.45}
              nodesDraggable={false}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#d1d5db" gap={22} />
              <Controls position="bottom-left" />
              <MiniMap
                position="bottom-right"
                nodeColor={(node) => {
                  const company = (node.data as NodeData).company;
                  if (company.tier === 'anchor') return '#1d4ed8';
                  if (company.riskLevel === 'high') return '#dc2626';
                  if (company.riskLevel === 'medium') return '#d97706';
                  return '#059669';
                }}
                maskColor="rgba(248, 250, 252, 0.74)"
              />
            </ReactFlow>
          </section>

          <section className="bottom-panel intelligence-panel">
            <div className="signal-strip">
              <div>
                <span className="signal-label">고객집중 경고</span>
                <strong>{groupCompanies.filter((company) => parseInt(company.customerConcentration, 10) >= 60).length}개</strong>
              </div>
              <div>
                <span className="signal-label">기회 기업</span>
                <strong>{opportunityCount}개</strong>
              </div>
              <div>
                <span className="signal-label">부채 부담</span>
                <strong>{groupCompanies.filter((company) => parseInt(company.debtRatio, 10) >= 100).length}개</strong>
              </div>
            </div>

            <div className="live-news-panel">
              <div className="news-header">
                <div className="section-title">
                  <Radio size={16} />
                  <span>최근 24시간 뉴스 API</span>
                </div>
                <button
                  type="button"
                  className="refresh-action"
                  onClick={() => setNewsRefreshKey((current) => current + 1)}
                  disabled={newsState.status === 'loading'}
                >
                  <RefreshCw size={14} />
                  새로고침
                </button>
              </div>
              <div className="news-meta">
                <span>GDELT DOC 2.0</span>
                <span>{newsState.updatedAt ? new Date(newsState.updatedAt).toLocaleTimeString() : '대기 중'}</span>
              </div>
              <div className="news-list">
                {newsState.status === 'loading' && <div className="news-empty">뉴스 수집 중</div>}
                {newsState.status === 'error' && (
                  <div className="news-empty">
                    Vercel 배포 또는 `npm run dev:vercel`에서 `/api/news`가 활성화됩니다.
                    {newsState.error && <small>{newsState.error}</small>}
                  </div>
                )}
                {newsState.status === 'empty' && <div className="news-empty">신뢰 도메인 기준 최근 24시간 새 뉴스 없음</div>}
                {newsState.status === 'success' &&
                  newsState.items.slice(0, 4).map((item) => (
                    <a className="news-item" href={item.url} key={item.url} target="_blank" rel="noreferrer">
                      <span>
                        <Newspaper size={14} />
                        {item.domain || item.source}
                      </span>
                      <strong>{item.title}</strong>
                      <small>
                        {formatNewsDate(item.seendate)}
                        <ExternalLink size={12} />
                      </small>
                    </a>
                  ))}
              </div>
            </div>
          </section>
        </main>

        <aside className="right-panel">
          {selectedCompany && (
            <>
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">선택한 기업</p>
                  <h2>{selectedCompany.name}</h2>
                  <span>{selectedCompany.legalName}</span>
                </div>
                <span className={`risk-badge ${riskClass[selectedCompany.riskLevel]}`}>
                  리스크 {riskLabels[selectedCompany.riskLevel]}
                </span>
              </div>

              <div className="detail-card summary">
                <div className="summary-main">
                  <span className={`tier-pill ${selectedCompany.tier}`}>{tierLabels[selectedCompany.tier]}</span>
                  <strong>{selectedCompany.investmentView}</strong>
                  <p>{selectedCompany.notes}</p>
                </div>
              </div>

              <div className="finance-grid">
                <div className="finance-item">
                  <CircleDollarSign size={17} />
                  <span>매출</span>
                  <strong>{selectedCompany.revenue}</strong>
                </div>
                <div className="finance-item">
                  <LineChart size={17} />
                  <span>성장률</span>
                  <strong>
                    {selectedCompany.revenueTrend > 0 ? '+' : ''}
                    {selectedCompany.revenueTrend.toFixed(1)}%
                  </strong>
                </div>
                <div className="finance-item">
                  <BarChart3 size={17} />
                  <span>영업이익률</span>
                  <strong>{selectedCompany.opMargin}</strong>
                </div>
                <div className="finance-item">
                  <AlertTriangle size={17} />
                  <span>부채비율</span>
                  <strong>{selectedCompany.debtRatio}</strong>
                </div>
              </div>

              <div className="detail-card">
                <div className="section-title">
                  <FileSearch size={16} />
                  <span>애널리스트/리스크 의견</span>
                </div>
                <div className="opinion-list">
                  {selectedOpinions.map((opinion) => (
                    <article className="opinion-item" key={opinion.id}>
                      <div>
                        <strong>{opinion.stance}</strong>
                        <span>{opinion.firm}</span>
                      </div>
                      <p>{opinion.summary}</p>
                      <small>
                        {opinion.horizon} · {opinion.date}
                      </small>
                    </article>
                  ))}
                </div>
              </div>

              <div className="detail-card">
                <div className="section-title">
                  <PanelRightOpen size={16} />
                  <span>관계 요약</span>
                </div>
                <dl className="relationship-list">
                  <div>
                    <dt>주요 고객</dt>
                    <dd>{selectedCompany.anchorCustomer}</dd>
                  </div>
                  <div>
                    <dt>고객집중도</dt>
                    <dd>{selectedCompany.customerConcentration}</dd>
                  </div>
                  <div>
                    <dt>소스 상태</dt>
                    <dd>{selectedCompany.sourceNote}</dd>
                  </div>
                  <div>
                    <dt>지역</dt>
                    <dd>{selectedCompany.region}</dd>
                  </div>
                </dl>
              </div>

              <div className="detail-card">
                <div className="section-title">
                  <Factory size={16} />
                  <span>제품/태그</span>
                </div>
                <div className="tag-cloud">
                  {selectedCompany.products.concat(selectedCompany.tags).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>

              <div className="detail-card">
                <div className="section-title">
                  <ArrowRight size={16} />
                  <span>직접 연결</span>
                </div>
                <div className="link-list">
                  {groupLinks
                    .filter((link) => link.source === selectedCompany.id || link.target === selectedCompany.id)
                    .map((link) => {
                      const counterpartId = link.source === selectedCompany.id ? link.target : link.source;
                      const counterpart = companies.find((company) => company.id === counterpartId);
                      return (
                        <button key={link.id} type="button" onClick={() => setSelectedCompanyId(counterpartId)}>
                          <span>{counterpart?.name}</span>
                          <small>
                            {link.label} · {link.value}
                          </small>
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="detail-card source-card">
                <div className="section-title">
                  <Database size={16} />
                  <span>검증 소스 정책</span>
                </div>
                {sourcePolicies.map((policy) => (
                  <div className="source-policy" key={policy.label}>
                    <strong>{policy.label}</strong>
                    <p>{policy.note}</p>
                    <span>{policy.domains.slice(0, 5).join(' · ')}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>
      </div>
    </ReactFlowProvider>
  );
}

export default App;

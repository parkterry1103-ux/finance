import { ArrowRight, ExternalLink, Info, Network, TrendingUp } from 'lucide-react';
import { companies, type MarketPrice } from '../../data.js';
import {
  dailyMarketAssetRegistry,
  driversForDailyMarketBrief,
  flowsForDailyMarketBrief,
  latestDailyMarketBrief,
  type DailyMarketAsset,
  type MarketFlow,
  type MarketFlowEvidenceType,
  type MarketFlowStep as MarketFlowStepType,
} from '../../content/daily-market/index.js';
import { sourceRegistry } from '../../content/sources/index.js';
import { reportById } from '../../content/reports/index.js';
import { bottleneckById } from '../../content/bottlenecks/index.js';
import { homeIndustryFlows, homeMarketAssetIds } from '../../content/home/index.js';
import { IndustryFlowCard } from '../industry-flows/IndustryFlowCard.js';

type DailyMarketBriefProps = {
  marketPrices: MarketPrice[];
  onOpenCategory: (sectorId: string, selectedCompanyId?: string) => void;
  onOpenReports: (reportId?: string) => void;
};

type MarketQuoteSnapshot = {
  value: number;
  previousClose: number;
  change: number;
  changePercent: number;
  direction: 'up' | 'down' | 'flat';
};

const evidenceLabels: Record<MarketFlowEvidenceType, string> = {
  fact: '확인된 시장 데이터',
  relationship: '일반적 경제 관계',
  interpretation: '오늘의 시장 해석',
};

const industryFlowLabels: Record<string, string> = {
  'us-semiconductors': 'AI 반도체·서버 수요 배경',
  'datacenter-power-cooling': '데이터센터 전력·냉각 수요 배경',
  'semiconductor-cluster-infrastructure': '반도체 클러스터 수요 배경',
  'reconstruction-infrastructure': '재건·인프라 수요 배경',
};

function numericValue(value?: string) {
  if (!value) return Number.NaN;
  return Number(String(value).replace(/[^0-9.-]/g, ''));
}

function quoteSnapshot(price?: MarketPrice | null): MarketQuoteSnapshot | null {
  if (!price || /fallback|mock|example|unavailable/i.test(price.source)) return null;
  const value = numericValue(price.price);
  const previousClose = numericValue(price.previousClose);
  if (!Number.isFinite(value) || !Number.isFinite(previousClose) || previousClose === 0) return null;
  const change = value - previousClose;
  const changePercent = (change / previousClose) * 100;
  const direction = Math.abs(change) < Number.EPSILON ? 'flat' : change > 0 ? 'up' : 'down';
  return { value, previousClose, change, changePercent, direction };
}

function directionMark(direction: MarketQuoteSnapshot['direction']) {
  if (direction === 'up') return '▲';
  if (direction === 'down') return '▼';
  return '—';
}

function signedNumber(value: number, digits: number) {
  if (!Number.isFinite(value)) return '';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(digits)}`;
}

function formattedValue(asset: DailyMarketAsset, value: number) {
  const formatted = new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: asset.valueDecimals,
    maximumFractionDigits: asset.valueDecimals,
  }).format(value);
  if (asset.format === 'fx') return `${formatted}원`;
  if (asset.format === 'yield') return `${formatted}%`;
  if (asset.format === 'commodity') return `$${formatted}`;
  return formatted;
}

function marketDateLabel(asset: DailyMarketAsset, value?: string) {
  if (!value) return '기준일 확인 중';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '기준일 확인 중';
  const timeZone = asset.id === 'kospi' || asset.id === 'kosdaq' ? 'Asia/Seoul' : 'America/New_York';
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone,
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.month}.${byType.day} 마감`;
}

function formatBriefAsOf(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '기준 시각 확인 중';
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}.${byType.month}.${byType.day} ${byType.hour}:${byType.minute}`;
}

function quoteForAsset(asset: DailyMarketAsset, marketPrices: MarketPrice[]) {
  return marketPrices.find((price) => price.ticker.trim().toUpperCase() === asset.symbol.toUpperCase());
}

function MarketBriefEmptyState({ asset }: { asset: DailyMarketAsset }) {
  return (
    <div className="market-quote-empty" role="status">
      <strong>데이터 준비 중</strong>
      <span>{asset.shortLabel} 가격을 확인하고 있습니다.</span>
    </div>
  );
}

function MarketQuoteCard({
  asset,
  price,
  note,
  headingLevel = 'h4',
}: {
  asset: DailyMarketAsset;
  price?: MarketPrice;
  note?: string;
  headingLevel?: 'h3' | 'h4';
}) {
  const snapshot = quoteSnapshot(price);
  const source = sourceRegistry[asset.sourceRef];
  const Heading = headingLevel;

  return (
    <article className={`market-quote-card market-quote-card--${asset.group}`}>
      <div className="market-quote-card__head">
        <div>
          <Heading>{asset.label}</Heading>
          <span>{asset.symbol}</span>
        </div>
        <span className="market-quote-card__status">{marketDateLabel(asset, price?.asOf)} · 지연 가능</span>
      </div>

      {snapshot ? (
        <div className="market-quote-card__numbers">
          <strong>{formattedValue(asset, snapshot.value)}</strong>
          <span className={`market-direction market-direction--${snapshot.direction}`}>
            {directionMark(snapshot.direction)}{' '}
            {asset.format === 'yield'
              ? `${signedNumber(snapshot.change * 100, Number.isInteger(snapshot.change * 100) ? 0 : 1)}bp`
              : `${signedNumber(snapshot.changePercent, 2)}%`}
          </span>
          <small>
            {asset.format === 'yield'
              ? `전일 ${snapshot.previousClose.toFixed(asset.valueDecimals)}%`
              : `${signedNumber(snapshot.change, asset.valueDecimals)}${asset.format === 'index' ? 'pt' : ''}`}
          </small>
        </div>
      ) : (
        <MarketBriefEmptyState asset={asset} />
      )}

      <p>{note ?? asset.relationshipNote}</p>
      <div className="market-quote-card__meta">
        <span>{asset.unitLabel}</span>
        {source ? (
          <a href={source.url} target="_blank" rel="noreferrer">
            {asset.provider}
            <ExternalLink size={12} />
          </a>
        ) : (
          <span>{asset.provider}</span>
        )}
      </div>
    </article>
  );
}

function MarketIndexStrip({
  assetIds,
  marketPrices,
  notes,
}: {
  assetIds: DailyMarketAsset['id'][];
  marketPrices: MarketPrice[];
  notes: Partial<Record<DailyMarketAsset['id'], string>>;
}) {
  return (
    <div className="market-index-strip">
      {assetIds.map((assetId) => {
        const asset = dailyMarketAssetRegistry[assetId];
        return <MarketQuoteCard key={asset.id} asset={asset} price={quoteForAsset(asset, marketPrices)} note={notes[assetId]} />;
      })}
    </div>
  );
}

function MarketAssetGrid({
  assetIds,
  marketPrices,
  notes,
}: {
  assetIds: DailyMarketAsset['id'][];
  marketPrices: MarketPrice[];
  notes: Partial<Record<DailyMarketAsset['id'], string>>;
}) {
  return (
    <div className="market-asset-grid">
      {assetIds.map((assetId) => {
        const asset = dailyMarketAssetRegistry[assetId];
        return <MarketQuoteCard key={asset.id} asset={asset} price={quoteForAsset(asset, marketPrices)} note={notes[assetId]} />;
      })}
    </div>
  );
}

function SourceLinks({ sourceRefs, limit = 2 }: { sourceRefs: string[]; limit?: number }) {
  const sources = sourceRefs.map((sourceId) => sourceRegistry[sourceId]).filter(Boolean).slice(0, limit);
  if (!sources.length) return null;
  return (
    <div className="market-source-links" aria-label="근거 자료">
      {sources.map((source) => (
        <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
          {source.publisher}
          <ExternalLink size={11} />
        </a>
      ))}
    </div>
  );
}

function MarketDriverList() {
  const drivers = driversForDailyMarketBrief();
  return (
    <ol className="market-driver-list">
      {drivers.map((driver, index) => (
        <li key={driver.id}>
          <span className="market-driver-list__number">{index + 1}</span>
          <div>
            <h4>{driver.label}</h4>
            <strong>{driver.confirmedFact}</strong>
            <p>{driver.marketInterpretation}</p>
            <div className="market-driver-list__assets">
              {driver.affectedAssets.map((assetId) => (
                <span key={assetId}>{dailyMarketAssetRegistry[assetId].shortLabel}</span>
              ))}
            </div>
            <SourceLinks sourceRefs={driver.sourceRefs} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function BeginnerMarketOverview({ marketPrices, onOpenDetail }: Pick<DailyMarketBriefProps, 'marketPrices'> & { onOpenDetail?: () => void }) {
  const brief = latestDailyMarketBrief();
  if (!brief) return null;
  const assetIds: DailyMarketAsset['id'][] = [...homeMarketAssetIds];

  return (
    <section className="beginner-home-section beginner-market-overview" aria-labelledby="beginner-market-title">
      <div className="beginner-section-head">
        <div>
          <p>1 · 오늘</p>
          <h1 id="beginner-market-title">오늘 시장 한눈에</h1>
          <span>{brief.title}</span>
        </div>
        <a href="#daily-market-detail" onClick={(event) => {
          if (!onOpenDetail) return;
          event.preventDefault();
          onOpenDetail();
        }}>오늘 시장 자세히 보기 <ArrowRight size={15} /></a>
      </div>
      <p className="beginner-section-lead">대표 시장 네 곳만 먼저 확인합니다. 서로 거래 시간이 다르므로 각 카드의 기준일도 함께 보세요.</p>
      <div className="beginner-market-grid">
        {assetIds.map((assetId) => {
          const asset = dailyMarketAssetRegistry[assetId];
          return <MarketQuoteCard key={assetId} asset={asset} price={quoteForAsset(asset, marketPrices)} note={brief.assetNotes[assetId]} headingLevel="h3" />;
        })}
      </div>
    </section>
  );
}

export function BeginnerMarketDrivers() {
  const flows = flowsForDailyMarketBrief().slice(0, 2);
  return (
    <section className="beginner-home-section beginner-driver-section" aria-labelledby="beginner-driver-title">
      <div className="beginner-section-head">
        <div><p>2 · 배경</p><h2 id="beginner-driver-title">왜 움직였나요?</h2></div>
      </div>
      <p className="beginner-section-lead">시장이 주목한 주요 배경을 간단히 연결한 설명입니다. 항상 같은 방향으로 움직이는 것은 아닙니다.</p>
      <div className="beginner-driver-grid">
        {flows.map((flow, index) => (
          <article key={flow.id}>
            <span>{index + 1}</span>
            <h3>{flow.title}</h3>
            <ol className="beginner-market-flow-list">
              {flow.steps.map((step, stepIndex) => (
                <li key={`${flow.id}-${step.label}`}>
                  <span>{stepIndex + 1}</span>
                  <div><em>{evidenceLabels[step.type]}</em><strong>{step.label}</strong><p>{step.detail}</p></div>
                </li>
              ))}
            </ol>
            <SourceLinks sourceRefs={flow.sourceRefs} />
          </article>
        ))}
      </div>
    </section>
  );
}

export function BeginnerIndustryFlows({ onOpenCategory }: Pick<DailyMarketBriefProps, 'onOpenCategory'>) {
  const flows = homeIndustryFlows();
  void onOpenCategory;
  return (
    <section className="beginner-home-section beginner-industry-flow-section" aria-labelledby="beginner-industry-flow-title">
      <div className="beginner-section-head">
        <div><p>4 · 연결</p><h2 id="beginner-industry-flow-title">산업이 연결되는 과정</h2></div>
        <a href="/ko/demand-supply">수요와 공급 전체 보기 <ArrowRight size={15} /></a>
      </div>
      <p className="beginner-section-lead">시장 변화가 산업과 기업으로 이어질 수 있는 대표 경로입니다. 당일 성과를 보장하는 관계는 아닙니다.</p>
      <div className="beginner-industry-flow-grid">
        {flows.map((flow) => <IndustryFlowCard key={flow.id} flow={flow} compact />)}
      </div>
    </section>
  );
}

function MarketFlowConnector() {
  return <span className="market-flow-connector" aria-hidden="true">↓</span>;
}

function MarketImpactLinks({
  step,
  onOpenCategory,
}: {
  step: MarketFlowStepType;
  onOpenCategory: DailyMarketBriefProps['onOpenCategory'];
}) {
  if (!step.marketMapId) return null;
  const linkedCompanies = (step.companyIds ?? [])
    .map((companyId) => companies.find((company) => company.id === companyId))
    .filter((company): company is (typeof companies)[number] => Boolean(company));

  return (
    <div className="market-impact-links">
      <button type="button" onClick={() => onOpenCategory(step.marketMapId!)}>
        <Network size={14} />
        {industryFlowLabels[step.marketMapId] ?? '산업 수요·공급 보기'}
        <ArrowRight size={14} />
      </button>
      <div aria-label="연결 기업">
        {linkedCompanies.map((company) => (
          <button key={company.id} type="button" onClick={() => onOpenCategory(step.marketMapId!, company.id)}>
            {company.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function MarketFlowStep({
  step,
  index,
  onOpenCategory,
}: {
  step: MarketFlowStepType;
  index: number;
  onOpenCategory: DailyMarketBriefProps['onOpenCategory'];
}) {
  return (
    <div className={`market-flow-step market-flow-step--${step.type}`}>
      <div className="market-flow-step__head">
        <span>{index + 1}</span>
        <em>{evidenceLabels[step.type]}</em>
      </div>
      <strong>{step.label}</strong>
      <p>{step.detail}</p>
      <MarketImpactLinks step={step} onOpenCategory={onOpenCategory} />
    </div>
  );
}

function MarketFlowChain({
  flow,
  onOpenCategory,
  onOpenReports,
}: {
  flow: MarketFlow;
  onOpenCategory: DailyMarketBriefProps['onOpenCategory'];
  onOpenReports: DailyMarketBriefProps['onOpenReports'];
}) {
  const reports = (flow.reportIds ?? []).map((id) => reportById(id)).filter(Boolean);
  const bottlenecks = (flow.bottleneckIds ?? []).map((id) => bottleneckById(id)).filter(Boolean);
  return (
    <article className="market-flow-chain">
      <div className="market-flow-chain__head">
        <TrendingUp size={18} />
        <h4>{flow.title}</h4>
      </div>
      <div className="market-flow-chain__steps">
        {flow.steps.map((step, index) => (
          <div key={`${flow.id}-${index}`}>
            <MarketFlowStep step={step} index={index} onOpenCategory={onOpenCategory} />
            {index < flow.steps.length - 1 ? <MarketFlowConnector /> : null}
          </div>
        ))}
      </div>
      <SourceLinks sourceRefs={flow.sourceRefs} limit={3} />
      {reports.length ? (
        <div className="market-flow-reports">
          <span>이 흐름을 이해하는 보고서</span>
          <div>
            {reports.map((report) => report ? (
              <button type="button" key={report.id} onClick={() => onOpenReports(report.id)}>{report.titleKo}</button>
            ) : null)}
          </div>
        </div>
      ) : null}
      {bottlenecks.length ? (
        <div className="market-flow-bottlenecks">
          <span>이 흐름과 연결된 공급망 병목</span>
          <div>
            {bottlenecks.map((bottleneck) => bottleneck ? (
              <a key={bottleneck.id} href={`/ko/bottlenecks/${encodeURIComponent(bottleneck.slug)}`}>{bottleneck.shortTitle}</a>
            ) : null)}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function DailyMarketBrief({ marketPrices, onOpenCategory, onOpenReports }: DailyMarketBriefProps) {
  const brief = latestDailyMarketBrief();
  if (!brief) {
    return (
      <section className="daily-market-brief" id="daily-market-brief">
        <div className="daily-market-brief__empty">
          <Info size={18} />
          <div>
            <strong>오늘의 시장 해설을 준비하고 있습니다.</strong>
            <span>시장 데이터는 확인 가능한 항목부터 표시합니다.</span>
          </div>
        </div>
      </section>
    );
  }

  const assets = [...brief.indexAssetIds, ...brief.macroAssetIds].map((assetId) => dailyMarketAssetRegistry[assetId]);
  const availableCount = assets.filter((asset) => quoteSnapshot(quoteForAsset(asset, marketPrices))).length;
  const flows = flowsForDailyMarketBrief(brief);

  return (
    <section className="daily-market-brief" id="daily-market-brief" aria-labelledby="daily-market-brief-title">
      <header className="daily-market-brief__header">
        <div>
          <p className="daily-market-brief__kicker">{brief.date.replace(/-/g, '.')} 최신 거래일</p>
          <h2 id="daily-market-brief-title">오늘 시장 브리핑</h2>
          <strong>{brief.title}</strong>
          <p>{brief.summary}</p>
        </div>
        <div className="daily-market-brief__asof">
          <span>기준 시각</span>
          <time dateTime={brief.asOf}>{formatBriefAsOf(brief.asOf)} KST</time>
          <small>시장별 마감 시각이 다르며 지연될 수 있습니다.</small>
        </div>
      </header>

      {availableCount < assets.length ? (
        <div className="daily-market-brief__notice" role="status">
          <Info size={16} />
          <span>일부 시장 데이터를 준비하고 있습니다. 확인 가능한 자산부터 표시합니다.</span>
        </div>
      ) : null}

      <div className="daily-market-brief__block">
        <div className="daily-market-brief__block-head">
          <span>A</span>
          <div>
            <h3>주요 지수</h3>
            <p>각 시장의 직전 거래일 종가와 전일 종가 대비 변화를 봅니다.</p>
          </div>
        </div>
        <MarketIndexStrip assetIds={brief.indexAssetIds} marketPrices={marketPrices} notes={brief.assetNotes} />
      </div>

      <div className="daily-market-brief__block">
        <div className="daily-market-brief__block-head">
          <span>B</span>
          <div>
            <h3>환율·금리·원자재</h3>
            <p>단위와 거래 시각이 다른 자산을 각각의 기준으로 표시합니다.</p>
          </div>
        </div>
        <MarketAssetGrid assetIds={brief.macroAssetIds} marketPrices={marketPrices} notes={brief.assetNotes} />
      </div>

      <div className="daily-market-brief__block">
        <div className="daily-market-brief__block-head">
          <span>C</span>
          <div>
            <h3>오늘 시장을 움직인 3가지</h3>
            <p>확인된 변화와 당일 시장 해석을 구분했습니다.</p>
          </div>
        </div>
        <MarketDriverList />
      </div>

      <div className="daily-market-brief__block">
        <div className="daily-market-brief__block-head">
          <span>D</span>
          <div>
            <h3>자산에서 산업·기업으로 이어지는 흐름</h3>
            <p>대표 흐름 2개만 보여주며, 마지막 단계에서 수요·공급 배경과 기업 정보로 연결합니다.</p>
          </div>
        </div>
        <div className="market-flow-grid">
          {flows.map((flow) => <MarketFlowChain key={flow.id} flow={flow} onOpenCategory={onOpenCategory} onOpenReports={onOpenReports} />)}
        </div>
      </div>

      <footer className="daily-market-brief__footer">
        <Info size={16} />
        <p>자산 간 연결은 일반적인 경제 관계와 당일 시장 해석을 함께 보여줍니다. 항상 같은 방향으로 움직이는 것은 아니며 자동 투자 신호가 아닙니다.</p>
        <a className="daily-market-macro-link" href="/ko/macro-dashboard">거시 배경 더 보기</a>
        <a className="daily-market-macro-link" href="/ko/market-relations">거시 흐름과 시장 비교</a>
        <SourceLinks sourceRefs={brief.sourceRefs.filter((sourceId) => sourceRegistry[sourceId]?.kind !== 'market-data')} limit={5} />
      </footer>
    </section>
  );
}

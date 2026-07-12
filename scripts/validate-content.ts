import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import {
  anchors,
  companies,
  currentWeeklyDigest,
  currentWeeklyPickOrder,
  currentWeeklyPicks,
  marketMapEvidencePickIds,
  marketMovers,
  mockMarketPrices,
  pickRegistry,
  reconstructionInfrastructureMap,
  representativePick,
  semiconductorClusterInfrastructureMap,
  stockAutopsyPicks,
  weeklyPickCollections,
  type Company,
  type MarketPrice,
} from '../src/data.js';
import { stockAutopsyPickEntries } from '../src/content/picks/entries.js';
import {
  classifyDisclosure,
  classifySecFilingForm,
  dartTrackedCompanies,
  enabledDartTrackedCompanies,
  enabledSecTrackedCompanies,
  isSupportedSecFormPattern,
  secTrackedCompanies,
} from '../src/content/disclosures/index.js';
import { contentSources, sourceRegistry } from '../src/content/sources/index.js';
import {
  dailyMarketAssetRegistry,
  dailyMarketAssets,
  dailyMarketBriefEntries,
  dailyMarketSyncTargets,
  latestDailyMarketBrief,
  marketDrivers,
  marketFlows,
} from '../src/content/daily-market/index.js';
import { industryReports } from '../src/content/reports/index.js';
import { supplyChainBottlenecks } from '../src/content/bottlenecks/index.js';
import { inferCompanyListing, isPriceSyncTarget } from '../src/services/listing.js';
import { priceDirection, priceDisplay } from '../src/services/prices.js';
import {
  normalizeSecCik,
  normalizeSecFilingRows,
  secArchiveIndexUrl,
  secPrimaryDocumentUrl,
  secSubmissionsUrl,
} from './sync-sec-filings.js';
import {
  SEC_FILING_DETAIL_PARSER_VERSION,
  eightKItemDefinitions,
  isEightKItemCode,
  isSupportedTransactionCode,
  normalizeEightKItems,
  parseForm4OwnershipXml,
  secTransactionCodeDefinitions,
  transactionCategoryForCode,
} from '../src/lib/sec/index.js';
import {
  allowedCompanyLogoExtensions,
  companyLogoMonogramSamples,
  getCompanyLogoRegistryEntries,
  isAllowedLocalCompanyLogoPath,
  isPlaceholderCompanyTicker,
  resolveCompanyLogo,
  resolveCompanyLogoMonogramText,
  type CompanyLogoInput,
} from '../src/lib/companyLogo.js';
import { runMacroIndicatorUnitChecks } from './macro-indicators-unit.js';
import {
  macroDomainBriefs,
  macroIndicatorDefinitions,
} from '../src/content/macro/index.js';
import {
  beginnerTermDefinitions,
  disclosureEventDefinitions,
  homeContentLimits,
  homeDeeperFeatureIds,
  homeFeatureLabels,
  homeIndustryFlowReferences,
  homeInsightReferences,
  homeMacroReferences,
  homeMarketAssetIds,
  homeNavigationGroups,
  homeOfficialReportReferences,
} from '../src/content/home/index.js';

const REQUIRED_PRICE_TICKERS = [
  '005930.KS',
  '000660.KS',
  '373220.KS',
  '005380.KS',
  '035420.KS',
  '035720.KS',
  'NVDA',
  'AMD',
  'INTC',
  'AAPL',
  'TSLA',
  'BRK-B',
  'XYZ',
];

const YAHOO_TICKER_ALIASES: Record<string, string> = {
  'BRK.B': 'BRK-B',
  SQ: 'XYZ',
};

const errors: string[] = [];
const warnings: string[] = [];
const runtime = globalThis as typeof globalThis & { process?: { exit?: (code?: number) => never } };
const sourceValidation = {
  duplicateIdCount: 0,
  duplicateUrlCount: 0,
  invalidRefCount: 0,
  sourceLessPublishedPickCount: 0,
  restrictedRefCount: 0,
};
const tickerValidation = {
  sharedListedTickerGroups: 0,
  placeholderTickerGroups: 0,
};
const disclosureValidation = {
  enabledCount: 0,
  disabledCount: 0,
  duplicateCorpCodeCount: 0,
};
const secDisclosureValidation = {
  enabledCount: 0,
  disabledCount: 0,
  duplicateCikCount: 0,
  duplicateTickerCount: 0,
};
const secDetailValidation = {
  eightKItemCount: 0,
  transactionCodeCount: 0,
  fixtureReportingOwners: 0,
  fixtureNonDerivativeTransactions: 0,
  fixtureDerivativeTransactions: 0,
  fixtureFootnotes: 0,
};
const identityValidation = {
  pickIdentityCount: 0,
  companyRegistryIdentityCount: 0,
  anchorIdentityCount: 0,
  mapIdentityCount: 0,
  disclosureIdentityCount: 0,
  marketMoverIdentityCount: 0,
  tickerOnlyNameCount: 0,
  conflictingTickerNameCount: 0,
  aliasTickerNameCount: 0,
};
const companyLogoValidation = {
  logoRecordCount: 0,
  registryCount: 0,
  localAssetCount: 0,
  localAssetBytes: 0,
  largestAssetPath: '',
  largestAssetBytes: 0,
  svgAssetCount: 0,
  pngAssetCount: 0,
  webpAssetCount: 0,
  jpgAssetCount: 0,
  missingLocalAssetCount: 0,
  invalidRegistryPathCount: 0,
  duplicateMappingCount: 0,
  duplicateTickerCollisionCount: 0,
  monogramFallbackCount: 0,
  placeholderFallbackCount: 0,
  sampleCount: 0,
  runtimeClearbitUrlCount: 0,
  legacyHelperCount: 0,
};
const dailyMarketValidation = {
  briefCount: 0,
  driverCount: 0,
  flowCount: 0,
  stepCount: 0,
  assetCount: 0,
  invalidRefCount: 0,
};
const reportValidation = {
  reportCount: 0,
  metricCount: 0,
  categoryCount: 0,
  featuredCount: 0,
  invalidRefCount: 0,
};
const bottleneckValidation = {
  bottleneckCount: 0,
  evidenceCount: 0,
  officialEvidenceCount: 0,
  companyEvidenceCount: 0,
  invalidRefCount: 0,
};
const macroValidation = {
  indicatorCount: 0,
  briefCount: 0,
  invalidRefCount: 0,
  unitCheckCount: 12,
};
const homeValidation = {
  featureCount: 0,
  navigationGroupCount: 0,
  insightCount: 0,
  macroCardCount: 0,
  bottleneckCardCount: 0,
  flowCount: 0,
  disclosureEventTypeCount: 0,
  reportCount: 0,
  termCount: 0,
  invalidRefCount: 0,
};

const REQUIRED_REPORT_CATEGORIES = [
  'macro',
  'semiconductors-ai',
  'power-data-centers',
  'energy-commodities',
  'construction-infrastructure',
] as const;

const VALID_SOURCE_KINDS = new Set([
  'company-release',
  'company-ir',
  'company-filing',
  'sec-filing',
  'dart-filing',
  'kind-filing',
  'government',
  'industry-data',
  'news',
  'market-data',
]);
const VALID_SOURCE_ACCESS_TYPES = new Set(['public', 'restricted']);
const PLACEHOLDER_TICKER_LABELS = new Set(['WATCH', 'PRIVATE', '비상장', 'N/A', '-']);

function addError(message: string) {
  errors.push(`✗ ${message}`);
}

function addWarning(message: string) {
  warnings.push(`! ${message}`);
}

function duplicateValues(values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  });
  return Array.from(duplicates);
}

function isHttpUrl(value?: string) {
  return Boolean(value && /^https?:\/\//.test(value));
}

function normalizeTicker(ticker?: string) {
  return String(ticker ?? '').trim().toUpperCase();
}

function normalizeIdentityName(value?: string) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').toUpperCase();
}

function isPlaceholderTicker(ticker?: string) {
  return PLACEHOLDER_TICKER_LABELS.has(normalizeTicker(ticker));
}

function priceLookupTicker(ticker: string) {
  return YAHOO_TICKER_ALIASES[ticker] ?? ticker;
}

function addPriceTarget(
  targets: Map<string, { ticker: string; lookupTicker: string; companyId?: string; market?: string }>,
  ticker?: string,
  companyId?: string,
  market?: string,
) {
  const normalizedTicker = normalizeTicker(ticker);
  if (!normalizedTicker) return;
  const lookupTicker = priceLookupTicker(normalizedTicker);
  if (!targets.has(lookupTicker)) {
    targets.set(lookupTicker, { ticker: normalizedTicker, lookupTicker, companyId, market });
    return;
  }

  const previous = targets.get(lookupTicker);
  if (previous && !previous.companyId && companyId) {
    targets.set(lookupTicker, { ...previous, companyId, market: market ?? previous.market });
  }
}

function uniquePriceTargets() {
  const targets = new Map<string, { ticker: string; lookupTicker: string; companyId?: string; market?: string }>();
  REQUIRED_PRICE_TICKERS.forEach((ticker) => addPriceTarget(targets, ticker));
  dailyMarketSyncTargets.forEach((target) => addPriceTarget(targets, target.ticker, undefined, target.market));
  mockMarketPrices.forEach((price) => addPriceTarget(targets, price.ticker, price.companyId, price.market));
  marketMovers.forEach((mover) => addPriceTarget(targets, mover.ticker, mover.companyId, mover.market));
  stockAutopsyPicks.forEach((pick) => {
    if (pick.tickerStatus !== 'placeholder') addPriceTarget(targets, pick.ticker, pick.relatedCompanyId, pick.market);
  });
  anchors.forEach((anchor) => addPriceTarget(targets, anchor.ticker, anchor.id, anchor.country));
  companies.forEach((company) => {
    const listing = inferCompanyListing(company);
    if (isPriceSyncTarget(company)) addPriceTarget(targets, company.ticker, company.id, listing.market);
  });
  return Array.from(targets.values());
}

function validateSourceRegistry() {
  const sourceIds = contentSources.map((source) => source.id);
  const duplicateSourceIds = duplicateValues(sourceIds);
  sourceValidation.duplicateIdCount = duplicateSourceIds.length;
  duplicateSourceIds.forEach((id) => addError(`duplicate source id: ${id}`));

  const sourceUrls = contentSources.map((source) => source.url);
  const duplicateSourceUrls = duplicateValues(sourceUrls);
  sourceValidation.duplicateUrlCount = duplicateSourceUrls.length;
  duplicateSourceUrls.forEach((url) => addError(`duplicate source URL: ${url}`));

  contentSources.forEach((source) => {
    if (!source.id) addError(`missing source id: ${source.title || '(unknown)'}`);
    if (!source.title) addError(`missing source title: ${source.id}`);
    if (!source.publisher) addError(`missing source publisher: ${source.id}`);
    if (!source.url) addError(`missing source URL: ${source.id}`);
    if (source.url && !isHttpUrl(source.url)) addError(`invalid source URL: ${source.id} / ${source.url}`);
    if (!VALID_SOURCE_KINDS.has(source.kind)) addError(`invalid source kind: ${source.id} / ${source.kind}`);
    if (source.accessType && !VALID_SOURCE_ACCESS_TYPES.has(source.accessType)) {
      addError(`invalid source accessType: ${source.id} / ${source.accessType}`);
    }
  });
}

function validatePickSources() {
  stockAutopsyPickEntries.forEach((pick) => {
    if (pick.sourceLinks?.length) addError(`legacy sourceLinks should be sourceRefs: ${pick.id}`);

    const sourceRefs = pick.sourceRefs ?? [];
    if (pick.status === 'published' && !sourceRefs.length && pick.sourceStatus !== 'legacy-unverified') {
      sourceValidation.sourceLessPublishedPickCount += 1;
      addError(`published pick has no sourceRefs: ${pick.id}`);
    }

    duplicateValues(sourceRefs.map((ref) => ref.sourceId)).forEach((sourceId) => {
      addError(`duplicate source ref in pick: ${pick.id} / ${sourceId}`);
    });

    sourceRefs.forEach((ref) => {
      const source = sourceRegistry[ref.sourceId];
      if (!source) {
        sourceValidation.invalidRefCount += 1;
        addError(`missing source ref: ${pick.id} / ${ref.sourceId}`);
        return;
      }
      if (source.accessType === 'restricted') sourceValidation.restrictedRefCount += 1;
    });
  });
}

function validatePicks() {
  const pickIds = stockAutopsyPicks.map((pick) => pick.id);
  duplicateValues(pickIds).forEach((id) => addError(`duplicate pick id: ${id}`));

  const slugs = stockAutopsyPicks.map((pick) => pick.pickId ?? pick.id);
  duplicateValues(slugs).forEach((slug) => addError(`duplicate pick slug: ${slug}`));

  const weeklyPickIds = new Set(weeklyPickCollections.flatMap((week) => week.pickIds));

  stockAutopsyPicks.forEach((pick) => {
    const slug = pick.pickId ?? pick.id;
    if (!pick.id) addError(`missing pick id: ${pick.companyName || '(unknown)'}`);
    if (!slug) addError(`missing pick slug: ${pick.id || pick.companyName || '(unknown)'}`);
    if (!pick.companyName) addError(`missing companyName: ${pick.id}`);
    if (!pick.ticker) addError(`missing ticker: ${pick.id}`);
    if (!pick.title) addError(`missing title: ${pick.id}`);
    if (!pick.watchMetrics?.length) addError(`missing watchMetrics: ${pick.id}`);

    pick.sourceLinks?.forEach((source) => {
      if (source.url === '') addError(`empty source URL: ${pick.id} / ${source.label}`);
      if (source.url && !isHttpUrl(source.url)) addError(`invalid source URL: ${pick.id} / ${source.url}`);
    });

    const isPlaceholderTicker = pick.tickerStatus === 'placeholder';
    if (isPlaceholderTicker && pick.ticker !== 'WATCH') {
      addError(`placeholder pick must use WATCH ticker label: ${pick.id} / ${pick.ticker}`);
    }

    if (isPlaceholderTicker) {
      return;
    }

    if (pick.ticker.endsWith('.KS') || pick.ticker.endsWith('.KQ')) {
      if (!/^\d{6}\.(KS|KQ)$/.test(pick.ticker)) addError(`invalid domestic ticker: ${pick.id} / ${pick.ticker}`);
    } else if (pick.market === 'KR' && weeklyPickIds.has(pick.id)) {
      addError(`current weekly KR pick must use .KS/.KQ ticker: ${pick.id} / ${pick.ticker}`);
    } else if (pick.market === 'KR') {
      addError(`KR pick must use .KS/.KQ ticker unless placeholder: ${pick.id} / ${pick.ticker}`);
    }
  });

  const picksByTicker = new Map<string, typeof stockAutopsyPicks>();
  stockAutopsyPicks.forEach((pick) => {
    const ticker = normalizeTicker(pick.ticker);
    if (!ticker) return;
    picksByTicker.set(ticker, [...(picksByTicker.get(ticker) ?? []), pick]);
  });

  picksByTicker.forEach((picks, ticker) => {
    if (picks.length <= 1) return;
    if (picks.every((pick) => pick.tickerStatus === 'placeholder')) {
      tickerValidation.placeholderTickerGroups += 1;
      return;
    }

    const listedPicks = picks.filter((pick) => pick.tickerStatus !== 'placeholder');
    const identityKeys = new Set(listedPicks.map((pick) => pick.relatedCompanyId ?? pick.companyId ?? pick.companyName));
    if (identityKeys.size <= 1) {
      tickerValidation.sharedListedTickerGroups += 1;
      return;
    }

    addError(`conflicting duplicate ticker across picks: ${ticker} / ${picks.map((pick) => pick.id).join(', ')}`);
  });
}

function validateWeeks() {
  const weekOfValues = weeklyPickCollections.map((week) => week.weekOf);
  duplicateValues(weekOfValues).forEach((weekOf) => addError(`duplicate weekOf: ${weekOf}`));

  weeklyPickCollections.forEach((week) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(week.weekOf)) addError(`invalid weekOf format: ${week.weekOf}`);
    if (Number.isNaN(Date.parse(week.weekOf))) addError(`invalid weekOf date: ${week.weekOf}`);
    if (week.status && week.status !== 'published') addError(`non-published weekly collection exposed: ${week.weekOf}`);
    if (!week.pickIds.length) addError(`weekly collection has no picks: ${week.weekOf}`);
    if (!week.representativePickId) addError(`missing representativePickId: ${week.weekOf}`);
    duplicateValues(week.pickIds).forEach((pickId) => addError(`duplicate pick in week ${week.weekOf}: ${pickId}`));

    week.pickIds.forEach((pickId) => {
      if (!pickRegistry[pickId]) addError(`missing weekly pick id: ${week.weekOf} / ${pickId}`);
    });

    if (week.representativePickId && !week.pickIds.includes(week.representativePickId)) {
      addError(`representativePickId not included in week: ${week.weekOf} / ${week.representativePickId}`);
    }
  });

  if (representativePick.id !== weeklyPickCollections
    .slice()
    .sort((a, b) => Date.parse(b.weekOf) - Date.parse(a.weekOf))[0]?.representativePickId) {
    addError(`representativePick mismatch: ${representativePick.id}`);
  }

  const digestPickIds = currentWeeklyDigest.recentItems
    .map((item) => item.pickId)
    .filter((pickId): pickId is string => Boolean(pickId));
  if (digestPickIds.join('|') !== currentWeeklyPickOrder.join('|')) {
    addError(`currentWeeklyDigest recentItems mismatch: ${digestPickIds.join(', ')}`);
  }
}

function validateReferences() {
  const pickIds = new Set(stockAutopsyPicks.map((pick) => pick.id));
  const companyIds = new Set([
    ...companies.map((company) => company.id),
    ...reconstructionInfrastructureMap.companies.map((company) => company.id),
    ...semiconductorClusterInfrastructureMap.companies.map((company) => company.id),
  ]);
  const sectorIds = new Set([
    ...companies.map((company) => company.sectorId),
    reconstructionInfrastructureMap.sectorId,
    semiconductorClusterInfrastructureMap.sectorId,
    'datacenter-power-cooling',
  ]);

  reportValidation.reportCount = industryReports.length;
  reportValidation.metricCount = industryReports.reduce((sum, report) => sum + report.keyMetrics.length, 0);
  reportValidation.categoryCount = new Set(industryReports.map((report) => report.category)).size;
  reportValidation.featuredCount = industryReports.filter((report) => report.featured).length;

  if (industryReports.length < 12 || industryReports.length > 18) {
    addError(`report registry count must be 12-18: ${industryReports.length}`);
  }
  if (reportValidation.featuredCount !== 1) addError(`report featured count must be 1: ${reportValidation.featuredCount}`);
  duplicateValues(industryReports.map((report) => report.id)).forEach((id) => addError(`duplicate report id: ${id}`));
  duplicateValues(industryReports.map((report) => report.slug)).forEach((slug) => addError(`duplicate report slug: ${slug}`));
  REQUIRED_REPORT_CATEGORIES.forEach((category) => {
    const count = industryReports.filter((report) => report.category === category).length;
    if (!count) addError(`missing required report category: ${category}`);
  });
  const reportEntriesSource = readFileSync(join(process.cwd(), 'src/content/reports/entries.ts'), 'utf8');
  if (/https?:\/\//.test(reportEntriesSource)) addError('report entries must not hardcode source URLs');
  if (/(fetch\s*\(|\bsupabase\b|\bfinnhub\b|\btwelve\s*data\b|\bfred\b|\bcron\b|sync endpoint)/i.test(reportEntriesSource)) {
    addError('report registry has forbidden runtime provider, DB, cron, or sync dependency');
  }

  industryReports.forEach((report) => {
    if (!report.id.trim() || !report.slug.trim() || !report.title.trim() || !report.titleKo.trim()) {
      addError(`report missing identity/title: ${report.id || report.slug}`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(report.publishedAt) || Number.isNaN(Date.parse(report.publishedAt))) {
      addError(`invalid report publishedAt: ${report.id} / ${report.publishedAt}`);
    }
    if (report.summary.length !== 3 || report.summary.some((line) => !line.trim())) {
      addError(`report summary must have 3 lines: ${report.id}`);
    }
    if (!report.keyMetrics.length) addError(`report has no verified metric: ${report.id}`);
    if (report.keyMetrics.length > 3) addError(`report keyMetrics must be <= 3: ${report.id}`);
    if (!REQUIRED_REPORT_CATEGORIES.includes(report.category)) addError(`invalid report category: ${report.id} / ${report.category}`);
    if (!['public-institution', 'central-bank', 'industry-organization', 'company-ir'].includes(report.sourceType)) {
      addError(`invalid report sourceType: ${report.id} / ${report.sourceType}`);
    }
    if (!['public-full', 'public-summary', 'registration-required', 'restricted'].includes(report.access)) {
      addError(`invalid report access: ${report.id} / ${report.access}`);
    }
    if (report.companyIds.length > 5) addError(`report companyIds must be <= 5: ${report.id}`);
    if (report.pickIds.length > 3) addError(`report pickIds must be <= 3: ${report.id}`);
    duplicateValues(report.marketMapIds).forEach((mapId) => addError(`duplicate report marketMapId: ${report.id} / ${mapId}`));
    duplicateValues(report.companyIds).forEach((companyId) => addError(`duplicate report companyId: ${report.id} / ${companyId}`));
    duplicateValues(report.pickIds).forEach((pickId) => addError(`duplicate report pickId: ${report.id} / ${pickId}`));
    const reportCopy = [report.title, report.titleKo, ...report.summary, ...report.howToUse].join(' ');
    if (/(확실한 수혜주|매수 기회|주가 상승 예상|대장주|폭등 가능|실적 급증 확정)/.test(reportCopy)) {
      addError(`investment recommendation wording in report: ${report.id}`);
    }
    if ((report.access === 'registration-required' || report.access === 'restricted') && report.summary.some((line) => line.trim())) {
      addError(`restricted report must not contain direct summary: ${report.id}`);
    }
    report.keyMetrics.forEach((metric) => {
      if (!metric.label.trim() || !metric.value.trim() || !metric.context.trim()) addError(`empty report metric: ${report.id}`);
      if (!['actual', 'forecast', 'scope'].includes(metric.kind)) addError(`invalid report metric kind: ${report.id} / ${metric.kind}`);
    });
    if (!report.sourceRefs.length) addError(`report has no sourceRefs: ${report.id}`);
    duplicateValues(report.sourceRefs).forEach((sourceId) => addError(`duplicate report sourceRef: ${report.id} / ${sourceId}`));
    report.sourceRefs.forEach((sourceId) => {
      const source = sourceRegistry[sourceId];
      if (!source) {
        reportValidation.invalidRefCount += 1;
        addError(`missing report sourceRef: ${report.id} / ${sourceId}`);
      } else if (!isHttpUrl(source.url)) {
        addError(`invalid report source URL: ${report.id} / ${source.url}`);
      } else if (report.access === 'public-full' && source.accessType === 'restricted') {
        addError(`public-full report points to restricted source: ${report.id} / ${sourceId}`);
      }
    });
    report.pickIds.forEach((pickId) => {
      if (!pickIds.has(pickId)) addError(`missing report pickId: ${report.id} / ${pickId}`);
    });
    report.marketMapIds.forEach((mapId) => {
      if (!sectorIds.has(mapId)) addError(`missing report marketMapId: ${report.id} / ${mapId}`);
    });
    report.companyIds.forEach((companyId) => {
      if (!companyIds.has(companyId)) addError(`missing report companyId: ${report.id} / ${companyId}`);
    });
  });

  stockAutopsyPicks.forEach((pick) => {
    if (pick.companyId && !companyIds.has(pick.companyId)) addError(`missing pick companyId: ${pick.id} / ${pick.companyId}`);
    if (pick.relatedCompanyId && !companyIds.has(pick.relatedCompanyId)) {
      addError(`missing pick relatedCompanyId: ${pick.id} / ${pick.relatedCompanyId}`);
    }
    pick.relatedCompanyIds?.forEach((companyId) => {
      if (!companyIds.has(companyId)) addError(`missing pick relatedCompanyIds: ${pick.id} / ${companyId}`);
    });
    if (pick.relatedSupplyChainId && !sectorIds.has(pick.relatedSupplyChainId)) {
      addError(`missing pick relatedSupplyChainId: ${pick.id} / ${pick.relatedSupplyChainId}`);
    }
  });

  Object.entries(marketMapEvidencePickIds).forEach(([mapId, relatedPickIds]) => {
    if (!sectorIds.has(mapId)) addError(`missing market map evidence id: ${mapId}`);
    relatedPickIds.forEach((pickId) => {
      if (!pickIds.has(pickId)) addError(`missing market map evidence pick: ${mapId} / ${pickId}`);
    });
  });

  currentWeeklyDigest.marketMapItems.forEach((item) => {
    if (item.sectorId && !sectorIds.has(item.sectorId)) addError(`missing weekly digest market map: ${item.sectorId}`);
    if (item.href && !/^\/ko\/category\/[^/?#]+$/.test(item.href)) {
      addError(`invalid weekly digest market map href: ${item.href}`);
    }
  });
}

function validateBottlenecks() {
  const statuses = new Set(['normal', 'watch', 'tight', 'critical']);
  const trends = new Set(['easing', 'stable', 'tightening']);
  const confidences = new Set(['high', 'medium', 'low']);
  const evidenceKinds = new Set(['official-data', 'company-disclosure', 'industry-report', 'editorial-assessment']);
  const companyRoles = new Set(['constrained-supplier', 'capacity-provider', 'demand-driver', 'procurement-exposure', 'alternative-supplier']);
  const reportIds = new Set(industryReports.map((report) => report.id));
  const bottleneckIds = new Set(supplyChainBottlenecks.map((entry) => entry.id));
  const pickIds = new Set(stockAutopsyPicks.map((pick) => pick.id));
  const companyIds = new Set([
    ...companies.map((company) => company.id),
    ...reconstructionInfrastructureMap.companies.map((company) => company.id),
    ...semiconductorClusterInfrastructureMap.companies.map((company) => company.id),
  ]);
  const marketMapIds = new Set([
    ...companies.map((company) => company.sectorId),
    reconstructionInfrastructureMap.sectorId,
    semiconductorClusterInfrastructureMap.sectorId,
    'datacenter-power-cooling',
  ]);
  const todayKst = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const forbiddenCopy = /(매수|매도|수혜주|폭등|대장주|주가\s*(상승|하락)\s*(예상|확실)|무조건\s*공급\s*부족)/;

  bottleneckValidation.bottleneckCount = supplyChainBottlenecks.length;
  bottleneckValidation.evidenceCount = supplyChainBottlenecks.reduce((sum, entry) => sum + entry.evidence.length, 0);
  bottleneckValidation.officialEvidenceCount = supplyChainBottlenecks.reduce(
    (sum, entry) => sum + entry.evidence.filter((evidence) => evidence.kind === 'official-data').length,
    0,
  );
  bottleneckValidation.companyEvidenceCount = supplyChainBottlenecks.reduce(
    (sum, entry) => sum + entry.evidence.filter((evidence) => evidence.kind === 'company-disclosure').length,
    0,
  );

  if (supplyChainBottlenecks.length !== 6) addError(`bottleneck registry count must be 6: ${supplyChainBottlenecks.length}`);
  duplicateValues(supplyChainBottlenecks.map((entry) => entry.id)).forEach((id) => addError(`duplicate bottleneck id: ${id}`));
  duplicateValues(supplyChainBottlenecks.map((entry) => entry.slug)).forEach((slug) => addError(`duplicate bottleneck slug: ${slug}`));
  const featuredCount = supplyChainBottlenecks.filter((entry) => entry.featured).length;
  if (featuredCount > 1) addError(`bottleneck featured count must be <= 1: ${featuredCount}`);

  const bottleneckEntriesSource = readFileSync(join(process.cwd(), 'src/content/bottlenecks/entries.ts'), 'utf8');
  if (/https?:\/\//.test(bottleneckEntriesSource)) addError('bottleneck entries must not hardcode source URLs');
  if (/(fetch\s*\(|\bsupabase\b|\bfinnhub\b|\btwelve\s*data\b|\bfred\b|\bcron\b|sync endpoint)/i.test(bottleneckEntriesSource)) {
    addError('bottleneck registry has forbidden runtime provider, DB, cron, or sync dependency');
  }

  const evidenceIds: string[] = [];
  supplyChainBottlenecks.forEach((entry) => {
    if (!entry.id.trim() || !entry.slug.trim() || !entry.title.trim() || !entry.summary.trim() || !entry.assessment.trim()) {
      addError(`bottleneck missing identity or copy: ${entry.id || entry.slug}`);
    }
    if (!statuses.has(entry.status)) addError(`invalid bottleneck status: ${entry.id} / ${entry.status}`);
    if (!trends.has(entry.trend)) addError(`invalid bottleneck trend: ${entry.id} / ${entry.trend}`);
    if (!confidences.has(entry.confidence)) addError(`invalid bottleneck confidence: ${entry.id} / ${entry.confidence}`);
    if (entry.summary.trim() === entry.assessment.trim()) addError(`bottleneck fact and assessment not separated: ${entry.id}`);
    if (forbiddenCopy.test([entry.title, entry.summary, entry.assessment, ...entry.pressureSignals, ...entry.reliefSignals].join(' '))) {
      addError(`investment recommendation wording in bottleneck: ${entry.id}`);
    }

    ([['asOf', entry.asOf], ['reviewedAt', entry.reviewedAt]] as Array<[string, string]>).forEach(([label, value]) => {
      const parsed = new Date(`${value}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(parsed.getTime())) {
        addError(`invalid bottleneck ${label}: ${entry.id} / ${value}`);
      } else if (value > todayKst) {
        addError(`future bottleneck ${label}: ${entry.id} / ${value}`);
      }
    });

    if (entry.evidence.length < 2 || entry.evidence.length > 5) {
      addError(`bottleneck evidence count must be 2-5: ${entry.id} / ${entry.evidence.length}`);
    }
    if (!entry.pressureSignals.length) addError(`bottleneck missing pressureSignals: ${entry.id}`);
    if (!entry.reliefSignals.length) addError(`bottleneck missing reliefSignals: ${entry.id}`);
    if (!entry.uncertainties.length) addError(`bottleneck missing uncertainties: ${entry.id}`);
    if (!entry.sourceRefs.length) addError(`bottleneck missing sourceRefs: ${entry.id}`);
    if (!entry.reportIds.length) addError(`bottleneck missing reportIds: ${entry.id}`);
    if (!entry.marketMapIds.length) addError(`bottleneck missing marketMapIds: ${entry.id}`);
    duplicateValues(entry.sourceRefs).forEach((id) => addError(`duplicate bottleneck sourceRef: ${entry.id} / ${id}`));
    duplicateValues(entry.reportIds).forEach((id) => addError(`duplicate bottleneck reportId: ${entry.id} / ${id}`));
    duplicateValues(entry.marketMapIds).forEach((id) => addError(`duplicate bottleneck marketMapId: ${entry.id} / ${id}`));
    duplicateValues(entry.companyLinks.map((link) => link.companyId)).forEach((id) => addError(`duplicate bottleneck companyId: ${entry.id} / ${id}`));
    duplicateValues(entry.pickIds).forEach((id) => addError(`duplicate bottleneck pickId: ${entry.id} / ${id}`));

    entry.sourceRefs.forEach((sourceId) => {
      if (!sourceRegistry[sourceId]) {
        bottleneckValidation.invalidRefCount += 1;
        addError(`missing bottleneck sourceRef: ${entry.id} / ${sourceId}`);
      }
    });
    entry.reportIds.forEach((reportId) => {
      if (!reportIds.has(reportId)) {
        bottleneckValidation.invalidRefCount += 1;
        addError(`missing bottleneck reportId: ${entry.id} / ${reportId}`);
      }
    });
    entry.marketMapIds.forEach((mapId) => {
      if (!marketMapIds.has(mapId)) {
        bottleneckValidation.invalidRefCount += 1;
        addError(`missing bottleneck marketMapId: ${entry.id} / ${mapId}`);
      }
    });
    entry.companyLinks.forEach((link) => {
      if (!companyIds.has(link.companyId)) {
        bottleneckValidation.invalidRefCount += 1;
        addError(`missing bottleneck companyId: ${entry.id} / ${link.companyId}`);
      }
      if (!companyRoles.has(link.role)) addError(`invalid bottleneck company role: ${entry.id} / ${link.role}`);
      if (!link.reason.trim()) addError(`empty bottleneck company reason: ${entry.id} / ${link.companyId}`);
    });
    entry.pickIds.forEach((pickId) => {
      if (!pickIds.has(pickId)) {
        bottleneckValidation.invalidRefCount += 1;
        addError(`missing bottleneck pickId: ${entry.id} / ${pickId}`);
      }
    });

    entry.evidence.forEach((evidence) => {
      evidenceIds.push(evidence.id);
      if (!evidence.id.trim() || !evidence.label.trim() || !evidence.context.trim()) addError(`empty bottleneck evidence: ${entry.id}`);
      if (!evidenceKinds.has(evidence.kind)) addError(`invalid bottleneck evidence kind: ${entry.id} / ${evidence.kind}`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(evidence.asOf) || Number.isNaN(Date.parse(evidence.asOf))) {
        addError(`invalid bottleneck evidence asOf: ${entry.id} / ${evidence.id}`);
      }
      if (!sourceRegistry[evidence.sourceRef]) {
        bottleneckValidation.invalidRefCount += 1;
        addError(`missing bottleneck evidence sourceRef: ${entry.id} / ${evidence.sourceRef}`);
      }
      if (!entry.sourceRefs.includes(evidence.sourceRef)) {
        addError(`bottleneck evidence sourceRef not declared: ${entry.id} / ${evidence.sourceRef}`);
      }
    });
  });
  duplicateValues(evidenceIds).forEach((id) => addError(`duplicate bottleneck evidence id: ${id}`));

  marketFlows.forEach((flow) => {
    duplicateValues(flow.bottleneckIds ?? []).forEach((id) => addError(`duplicate daily market bottleneckId: ${flow.id} / ${id}`));
    flow.bottleneckIds?.forEach((id) => {
      if (!bottleneckIds.has(id)) addError(`missing daily market bottleneckId: ${flow.id} / ${id}`);
    });
  });
  industryReports.forEach((report) => {
    duplicateValues(report.bottleneckIds ?? []).forEach((id) => addError(`duplicate report bottleneckId: ${report.id} / ${id}`));
    report.bottleneckIds?.forEach((id) => {
      if (!bottleneckIds.has(id)) addError(`missing report bottleneckId: ${report.id} / ${id}`);
    });
  });
}

function validateMacroContent() {
  const expectedSeries = ['DGS2', 'DGS10', 'T10Y2Y', 'NFCI', 'WALCL', 'M2SL', 'INDPRO', 'CUMFNS', 'PERMIT'];
  const domains = new Set(['rates', 'financial-conditions', 'liquidity', 'industry-infrastructure']);
  const frequencies = new Set(['daily', 'weekly', 'monthly']);
  const unitKinds = new Set(['percent', 'index', 'millions-usd', 'billions-usd', 'thousands-saar']);
  const changeModes = new Set(['basis-points', 'absolute', 'percentage', 'percentage-points']);
  const trends = new Set(['improving', 'stable', 'worsening']);
  const reportIds = new Set(industryReports.map((entry) => entry.id));
  const bottleneckIds = new Set(supplyChainBottlenecks.map((entry) => entry.id));
  const indicatorIds = new Set(macroIndicatorDefinitions.map((entry) => entry.id));
  const todayKst = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const forbiddenCopy = /(거시\s*점수|유동성\s*지수\s*\d+\s*점|경기침체\s*(확률|가능성)\s*\d+\s*%|매수\s*환경|자동\s*(매수|매도)|수혜주)/;

  macroValidation.indicatorCount = macroIndicatorDefinitions.length;
  macroValidation.briefCount = macroDomainBriefs.length;
  if (macroIndicatorDefinitions.length !== 9) addError(`macro indicator registry count must be 9: ${macroIndicatorDefinitions.length}`);
  duplicateValues(macroIndicatorDefinitions.map((entry) => entry.id)).forEach((id) => addError(`duplicate macro indicator id: ${id}`));
  duplicateValues(macroIndicatorDefinitions.map((entry) => entry.seriesId)).forEach((id) => addError(`duplicate FRED seriesId: ${id}`));
  if ([...macroIndicatorDefinitions.map((entry) => entry.seriesId)].sort().join(',') !== [...expectedSeries].sort().join(',')) {
    addError(`macro supported series must be exactly 9 approved IDs: ${macroIndicatorDefinitions.map((entry) => entry.seriesId).join(', ')}`);
  }

  macroIndicatorDefinitions.forEach((entry) => {
    if (!domains.has(entry.domain)) addError(`invalid macro domain: ${entry.id} / ${entry.domain}`);
    if (!frequencies.has(entry.frequency)) addError(`invalid macro frequency: ${entry.id} / ${entry.frequency}`);
    if (!unitKinds.has(entry.unitKind)) addError(`invalid macro unitKind: ${entry.id} / ${entry.unitKind}`);
    if (!changeModes.has(entry.changeMode)) addError(`invalid macro changeMode: ${entry.id} / ${entry.changeMode}`);
    if (!sourceRegistry[entry.sourceRef]) {
      macroValidation.invalidRefCount += 1;
      addError(`missing macro sourceRef: ${entry.id} / ${entry.sourceRef}`);
    }
    const expectedLimit = entry.frequency === 'daily' ? 60 : entry.frequency === 'weekly' ? 52 : 24;
    if (entry.historyLimit !== expectedLimit) addError(`invalid macro history limit: ${entry.id} / ${entry.historyLimit}`);
    if (forbiddenCopy.test([entry.label, entry.interpretation, entry.higherMeaning, entry.lowerMeaning, entry.caution].join(' '))) {
      addError(`forbidden score, probability, or investment wording in macro indicator: ${entry.id}`);
    }
  });

  if (macroDomainBriefs.length !== 4) addError(`macro domain brief count must be 4: ${macroDomainBriefs.length}`);
  duplicateValues(macroDomainBriefs.map((entry) => entry.id)).forEach((id) => addError(`duplicate macro brief id: ${id}`));
  duplicateValues(macroDomainBriefs.map((entry) => entry.domain)).forEach((domain) => addError(`duplicate macro brief domain: ${domain}`));
  macroDomainBriefs.forEach((brief) => {
    if (!domains.has(brief.domain)) addError(`invalid macro brief domain: ${brief.id} / ${brief.domain}`);
    if (!trends.has(brief.trend)) addError(`invalid macro brief trend: ${brief.id} / ${brief.trend}`);
    if (forbiddenCopy.test([brief.state, brief.summary].join(' '))) addError(`forbidden score, probability, or investment wording in macro brief: ${brief.id}`);
    duplicateValues(brief.evidenceIndicatorIds).forEach((id) => addError(`duplicate macro brief indicator: ${brief.id} / ${id}`));
    duplicateValues(brief.sourceRefs).forEach((id) => addError(`duplicate macro brief sourceRef: ${brief.id} / ${id}`));
    duplicateValues(brief.reportIds).forEach((id) => addError(`duplicate macro brief reportId: ${brief.id} / ${id}`));
    duplicateValues(brief.bottleneckIds).forEach((id) => addError(`duplicate macro brief bottleneckId: ${brief.id} / ${id}`));
    brief.evidenceIndicatorIds.forEach((id) => {
      if (!indicatorIds.has(id)) addError(`missing macro brief indicator: ${brief.id} / ${id}`);
    });
    brief.sourceRefs.forEach((id) => {
      if (!sourceRegistry[id]) {
        macroValidation.invalidRefCount += 1;
        addError(`missing macro brief sourceRef: ${brief.id} / ${id}`);
      }
    });
    brief.reportIds.forEach((id) => {
      if (!reportIds.has(id)) {
        macroValidation.invalidRefCount += 1;
        addError(`missing macro brief reportId: ${brief.id} / ${id}`);
      }
    });
    brief.bottleneckIds.forEach((id) => {
      if (!bottleneckIds.has(id)) {
        macroValidation.invalidRefCount += 1;
        addError(`missing macro brief bottleneckId: ${brief.id} / ${id}`);
      }
    });
    ([['asOf', brief.asOf], ['reviewedAt', brief.reviewedAt]] as Array<[string, string]>).forEach(([label, value]) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
        addError(`invalid macro brief ${label}: ${brief.id} / ${value}`);
      } else if (value > todayKst) {
        addError(`future macro brief ${label}: ${brief.id} / ${value}`);
      }
    });
  });

  supplyChainBottlenecks.forEach((entry) => {
    duplicateValues(entry.macroIndicatorIds ?? []).forEach((id) => addError(`duplicate bottleneck macroIndicatorId: ${entry.id} / ${id}`));
    entry.macroIndicatorIds?.forEach((id) => {
      if (!indicatorIds.has(id)) addError(`missing bottleneck macroIndicatorId: ${entry.id} / ${id}`);
    });
  });

  runtimeSourceFiles(join(process.cwd(), 'src')).forEach((filePath) => {
    const content = readFileSync(filePath, 'utf8');
    if (/FRED_API_KEY|VITE_[A-Z0-9_]*FRED|import\.meta\.env[^\n]*FRED/.test(content)) {
      addError(`client FRED environment reference: ${filePath.replace(`${process.cwd()}/`, '')}`);
    }
  });

  const macroRuntimeSource = [
    readFileSync(join(process.cwd(), 'src/content/macro/indicators.ts'), 'utf8'),
    readFileSync(join(process.cwd(), 'src/content/macro/briefs.ts'), 'utf8'),
  ].join('\n');
  if (/\bfinnhub\b|twelve\s*data|\bsupabase\b|\bcron\b|sync endpoint/i.test(macroRuntimeSource)) {
    addError('macro content has forbidden provider, DB, cron, or sync dependency');
  }

  try {
    runMacroIndicatorUnitChecks();
  } catch (error) {
    addError(error instanceof Error ? error.message : String(error));
  }
}

function validateHomeExperience() {
  const companyIds = new Set([
    ...companies.map((company) => company.id),
    ...reconstructionInfrastructureMap.companies.map((company) => company.id),
    ...semiconductorClusterInfrastructureMap.companies.map((company) => company.id),
  ]);
  const marketMapIds = new Set([
    ...companies.map((company) => company.sectorId),
    reconstructionInfrastructureMap.sectorId,
    semiconductorClusterInfrastructureMap.sectorId,
    'datacenter-power-cooling',
  ]);
  const driverIds = new Set(marketDrivers.map((driver) => driver.id));
  const macroBriefIds = new Set(macroDomainBriefs.map((brief) => brief.id));
  const macroIndicatorIds = new Set(macroIndicatorDefinitions.map((indicator) => indicator.id));
  const bottleneckIds = new Set(supplyChainBottlenecks.map((entry) => entry.id));
  const reportIds = new Set(industryReports.map((report) => report.id));
  const allowedRoutes = new Set([
    '/ko/',
    '/ko/macro-dashboard',
    '/ko/bottlenecks',
    '/ko/market-map',
    '/ko/picks',
    '/analysis',
    '/ko/reports',
    '/ko/disclosures',
  ]);
  const expectedEasyNames = [
    '돈의 흐름과 경기',
    '공급이 부족한 곳',
    '산업을 이해하는 자료',
    '기업이 직접 밝힌 변화',
    '산업이 연결되는 구조',
    '이번 주에 살펴볼 기업',
  ];
  const expectedEventTypes = ['contract', 'earnings', 'financing', 'insider', 'investment', 'merger', 'other'];
  const forbiddenCopy = /(매수|매도|수혜주|대장주|폭등|확실한\s*상승|무조건|투자\s*기회)/;
  const fakeScoreCopy = /(거시|경기|유동성|위험).{0,8}\d+\s*점/;

  homeValidation.featureCount = homeFeatureLabels.length;
  homeValidation.navigationGroupCount = homeNavigationGroups.length;
  homeValidation.insightCount = homeInsightReferences.length;
  homeValidation.macroCardCount = homeMacroReferences.length;
  homeValidation.bottleneckCardCount = homeContentLimits.bottlenecks;
  homeValidation.flowCount = homeIndustryFlowReferences.length;
  homeValidation.disclosureEventTypeCount = disclosureEventDefinitions.length;
  homeValidation.reportCount = homeOfficialReportReferences.length;
  homeValidation.termCount = beginnerTermDefinitions.length;

  if (homeFeatureLabels.length !== 6) addError(`home easy feature count must be 6: ${homeFeatureLabels.length}`);
  duplicateValues(homeFeatureLabels.map((feature) => feature.easyName)).forEach((title) => addError(`duplicate home easy feature title: ${title}`));
  if ([...homeFeatureLabels.map((feature) => feature.easyName)].sort().join('|') !== [...expectedEasyNames].sort().join('|')) {
    addError(`home easy feature titles mismatch: ${homeFeatureLabels.map((feature) => feature.easyName).join(', ')}`);
  }
  homeFeatureLabels.forEach((feature) => {
    if (!allowedRoutes.has(feature.href)) addError(`invalid home feature route: ${feature.id} / ${feature.href}`);
  });

  if (homeNavigationGroups.length !== 4) addError(`home navigation group count must be 4: ${homeNavigationGroups.length}`);
  if (homeNavigationGroups.map((group) => group.label).join('|') !== '오늘|산업|기업|자료') {
    addError(`home navigation labels must be 오늘|산업|기업|자료: ${homeNavigationGroups.map((group) => group.label).join('|')}`);
  }
  duplicateValues(homeNavigationGroups.map((group) => group.id)).forEach((id) => addError(`duplicate home navigation group id: ${id}`));
  const navigationItems = homeNavigationGroups.flatMap((group) => group.items);
  duplicateValues(navigationItems.map((item) => item.id)).forEach((id) => addError(`duplicate home navigation item id: ${id}`));
  navigationItems.forEach((item) => {
    if (!allowedRoutes.has(item.href)) addError(`invalid home navigation route: ${item.id} / ${item.href}`);
  });

  if (homeMarketAssetIds.length !== homeContentLimits.marketAssets || homeMarketAssetIds.length > 4) {
    addError(`home market asset count must be ${homeContentLimits.marketAssets}: ${homeMarketAssetIds.length}`);
  }
  duplicateValues([...homeMarketAssetIds]).forEach((id) => addError(`duplicate home market asset: ${id}`));
  homeMarketAssetIds.forEach((id) => {
    if (!dailyMarketAssetRegistry[id]) addError(`missing home market asset: ${id}`);
  });

  if (homeInsightReferences.length !== 3 || homeInsightReferences.length > homeContentLimits.insights) {
    addError(`home insight count must be exactly 3: ${homeInsightReferences.length}`);
  }
  duplicateValues(homeInsightReferences.map((reference) => reference.id)).forEach((id) => addError(`duplicate home insight id: ${id}`));
  duplicateValues(homeInsightReferences.map((reference) => reference.kind)).forEach((kind) => addError(`duplicate home insight topic kind: ${kind}`));
  homeInsightReferences.forEach((reference) => {
    if (reference.kind === 'market-driver') {
      if (!driverIds.has(reference.referenceId)) {
        homeValidation.invalidRefCount += 1;
        addError(`missing home market driver reference: ${reference.referenceId}`);
      }
      if (!latestDailyMarketBrief()?.marketDriverIds.includes(reference.referenceId)) {
        addError(`home market driver not in latest brief: ${reference.referenceId}`);
      }
    } else if (reference.kind === 'macro-brief') {
      if (!macroBriefIds.has(reference.referenceId)) {
        homeValidation.invalidRefCount += 1;
        addError(`missing home macro brief reference: ${reference.referenceId}`);
      }
    } else if (!bottleneckIds.has(reference.referenceId)) {
      homeValidation.invalidRefCount += 1;
      addError(`missing home bottleneck reference: ${reference.referenceId}`);
    }
    if (!(allowedRoutes.has(reference.href) || reference.href === '#daily-market-detail' || /^\/ko\/bottlenecks\/[a-z0-9-]+$/.test(reference.href))) {
      addError(`invalid home insight route: ${reference.id} / ${reference.href}`);
    }
  });

  if (homeMacroReferences.length < 2 || homeMacroReferences.length > homeContentLimits.macroCards) {
    addError(`home macro card count must be 2-${homeContentLimits.macroCards}: ${homeMacroReferences.length}`);
  }
  duplicateValues(homeMacroReferences.map((reference) => reference.id)).forEach((id) => addError(`duplicate home macro reference: ${id}`));
  homeMacroReferences.forEach((reference) => {
    const brief = macroDomainBriefs.find((entry) => entry.id === reference.briefId);
    const indicator = macroIndicatorDefinitions.find((entry) => entry.id === reference.indicatorId);
    if (!macroBriefIds.has(reference.briefId) || !brief) {
      homeValidation.invalidRefCount += 1;
      addError(`missing home macro brief: ${reference.id} / ${reference.briefId}`);
    }
    if (!macroIndicatorIds.has(reference.indicatorId) || !indicator) {
      homeValidation.invalidRefCount += 1;
      addError(`missing home macro indicator: ${reference.id} / ${reference.indicatorId}`);
    }
    if (brief && indicator && (!brief.evidenceIndicatorIds.includes(indicator.id) || brief.domain !== indicator.domain)) {
      addError(`home macro brief/indicator mismatch: ${reference.id}`);
    }
  });

  if (homeIndustryFlowReferences.length < 1 || homeIndustryFlowReferences.length > homeContentLimits.industryFlows) {
    addError(`home industry flow count must be 1-${homeContentLimits.industryFlows}: ${homeIndustryFlowReferences.length}`);
  }
  duplicateValues(homeIndustryFlowReferences.map((flow) => flow.id)).forEach((id) => addError(`duplicate home industry flow: ${id}`));
  homeIndustryFlowReferences.forEach((flow) => {
    if (flow.steps.length < 3 || flow.steps.length > 5) addError(`home industry flow step count must be 3-5: ${flow.id} / ${flow.steps.length}`);
    if (!marketMapIds.has(flow.marketMapId)) {
      homeValidation.invalidRefCount += 1;
      addError(`missing home industry market map: ${flow.id} / ${flow.marketMapId}`);
    }
    flow.steps.forEach((step, index) => {
      if (!step.label.trim() || !step.detail.trim()) addError(`empty home industry flow step: ${flow.id} / ${index + 1}`);
      if (step.marketMapId && (!marketMapIds.has(step.marketMapId) || step.marketMapId !== flow.marketMapId)) {
        addError(`invalid home industry step market map: ${flow.id} / ${step.marketMapId}`);
      }
      step.companyIds?.forEach((companyId) => {
        if (!companyIds.has(companyId)) {
          homeValidation.invalidRefCount += 1;
          addError(`missing home industry company: ${flow.id} / ${companyId}`);
        }
      });
    });
  });

  if ([...disclosureEventDefinitions.map((entry) => entry.id)].sort().join('|') !== expectedEventTypes.join('|')) {
    addError(`home disclosure event types must be exactly 7 approved types: ${disclosureEventDefinitions.map((entry) => entry.id).join(', ')}`);
  }
  duplicateValues(disclosureEventDefinitions.map((entry) => entry.label)).forEach((label) => addError(`duplicate home disclosure event label: ${label}`));

  if (homeOfficialReportReferences.length < 2 || homeOfficialReportReferences.length > homeContentLimits.reports) {
    addError(`home report count must be 2-${homeContentLimits.reports}: ${homeOfficialReportReferences.length}`);
  }
  duplicateValues(homeOfficialReportReferences.map((reference) => reference.reportId)).forEach((id) => addError(`duplicate home report reference: ${id}`));
  homeOfficialReportReferences.forEach((reference) => {
    const report = industryReports.find((entry) => entry.id === reference.reportId);
    if (!reportIds.has(reference.reportId) || !report) {
      homeValidation.invalidRefCount += 1;
      addError(`missing home report reference: ${reference.reportId}`);
    } else if (!report.keyMetrics.some((metric) => metric.label === reference.metricLabel)) {
      addError(`missing home report metric: ${reference.reportId} / ${reference.metricLabel}`);
    }
  });

  if (homeDeeperFeatureIds.length !== homeContentLimits.deeperCards || homeDeeperFeatureIds.length > 4) {
    addError(`home deeper feature count must be exactly 4: ${homeDeeperFeatureIds.length}`);
  }
  duplicateValues([...homeDeeperFeatureIds]).forEach((id) => addError(`duplicate home deeper feature: ${id}`));
  homeDeeperFeatureIds.forEach((id) => {
    if (!homeFeatureLabels.some((feature) => feature.id === id)) addError(`missing home deeper feature: ${id}`);
  });

  if (beginnerTermDefinitions.length !== 9) addError(`beginner term definition count must be 9: ${beginnerTermDefinitions.length}`);
  duplicateValues(beginnerTermDefinitions.map((entry) => entry.id)).forEach((id) => addError(`duplicate beginner term id: ${id}`));
  duplicateValues(beginnerTermDefinitions.map((entry) => entry.term)).forEach((term) => addError(`duplicate beginner term: ${term}`));

  if (homeContentLimits.marketDrivers > 2 || homeContentLimits.disclosures > 3 || homeContentLimits.picks > 3 || homeContentLimits.bottlenecks > 3) {
    addError(`home display limit exceeds approved cap: ${JSON.stringify(homeContentLimits)}`);
  }
  const homeCopy = JSON.stringify({
    homeFeatureLabels,
    homeNavigationGroups,
    homeInsightReferences,
    homeIndustryFlowReferences,
    disclosureEventDefinitions,
    beginnerTermDefinitions,
  });
  if (forbiddenCopy.test(homeCopy)) addError('investment recommendation wording in home content');
  if (fakeScoreCopy.test(homeCopy)) addError('fake score wording in home content');

  const homeSource = [
    readFileSync(join(process.cwd(), 'src/content/home/entries.ts'), 'utf8'),
    readFileSync(join(process.cwd(), 'src/content/home/types.ts'), 'utf8'),
    readFileSync(join(process.cwd(), 'src/content/home/selectors.ts'), 'utf8'),
  ].join('\n');
  if (/https?:\/\/|<img\b|url\s*\(/i.test(homeSource)) addError('external image or URL dependency in home content');
  if (/VITE_[A-Z0-9_]*(KEY|SECRET|TOKEN)|import\.meta\.env|process\.env/i.test(homeSource)) addError('client secret or environment reference in home content');

  const appSource = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
  const macroComponentSource = readFileSync(join(process.cwd(), 'src/components/macro/MacroDashboard.tsx'), 'utf8');
  const termHelpSource = readFileSync(join(process.cwd(), 'src/components/common/TermHelp.tsx'), 'utf8');
  const stylesSource = readFileSync(join(process.cwd(), 'src/styles.css'), 'utf8');
  if (!/open=\{marketDetailOpen\}/.test(appSource) || !/onOpenDetail=\{openMarketDetail\}/.test(appSource)) {
    addError('home market detail CTA must open the existing details content directly');
  }
  if (!/IntersectionObserver/.test(macroComponentSource) || !/if \(!shouldLoad\) return;/.test(macroComponentSource)) {
    addError('home macro request must be deferred until its section approaches the viewport');
  }
  if (!/navigateWithinApp\(href\)/.test(appSource)) addError('grouped navigation must preserve SPA transitions for internal detail routes');
  (['normal', 'watch', 'tight', 'critical'] as const).forEach((status) => {
    if (!stylesSource.includes(`article.status-${status}`)) addError(`missing home bottleneck status color rule: ${status}`);
  });
  if (!/closeFromOutside[\s\S]*buttonRef\.current\?\.focus\(\)/.test(termHelpSource)) {
    addError('TermHelp outside close must restore focus');
  }
}

function validateCtaPolicy() {
  const mapCompanies = [
    ...reconstructionInfrastructureMap.companies,
    ...semiconductorClusterInfrastructureMap.companies,
  ];

  mapCompanies.forEach((company) => {
    if (company.status === 'Pick only' && company.pickId) {
      const pick = pickRegistry[company.pickId];
      if (!pick) addError(`Pick only map company points to missing pick: ${company.id} / ${company.pickId}`);
      if (pick?.companyId || pick?.relatedCompanyId) {
        addError(`Pick only map company has complete CTA-capable pick linkage: ${company.id} / ${company.pickId}`);
      }
    }

    if (company.status !== 'Pick only' && company.pickId) {
      addError(`reference map company should not point to a Pick CTA: ${company.id} / ${company.pickId}`);
    }
  });
}

function validatePriceUniverse() {
  const targets = uniquePriceTargets();
  const targetTickers = new Set(targets.map((target) => target.ticker));
  currentWeeklyPicks.forEach((pick) => {
    if (!targetTickers.has(normalizeTicker(pick.ticker))) {
      addError(`current weekly ticker missing from price universe: ${pick.id} / ${pick.ticker}`);
    }
  });
  stockAutopsyPicks
    .filter((pick) => pick.tickerStatus === 'placeholder')
    .forEach((pick) => {
      if (targetTickers.has(normalizeTicker(pick.ticker))) {
        addError(`placeholder ticker included in price universe: ${pick.id} / ${pick.ticker}`);
      }
    });
  dailyMarketSyncTargets.forEach((target) => {
    if (!targetTickers.has(normalizeTicker(target.ticker))) {
      addError(`daily market symbol missing from price universe: ${target.ticker}`);
    }
  });
  return targets.length;
}

function validateDailyMarketContent() {
  dailyMarketValidation.briefCount = dailyMarketBriefEntries.length;
  dailyMarketValidation.driverCount = marketDrivers.length;
  dailyMarketValidation.flowCount = marketFlows.length;
  dailyMarketValidation.assetCount = dailyMarketAssets.length;

  duplicateValues(dailyMarketBriefEntries.map((brief) => brief.date)).forEach((date) => {
    addError(`duplicate daily market brief date: ${date}`);
  });
  duplicateValues(marketDrivers.map((driver) => driver.id)).forEach((id) => {
    addError(`duplicate daily market driver id: ${id}`);
  });
  duplicateValues(marketFlows.map((flow) => flow.id)).forEach((id) => {
    addError(`duplicate daily market flow id: ${id}`);
  });
  duplicateValues(dailyMarketAssets.map((asset) => asset.id)).forEach((id) => {
    addError(`duplicate daily market asset id: ${id}`);
  });
  duplicateValues(dailyMarketAssets.map((asset) => asset.symbol)).forEach((symbol) => {
    addError(`duplicate daily market asset symbol: ${symbol}`);
  });

  const latestDate = [...dailyMarketBriefEntries].sort((left, right) => right.date.localeCompare(left.date))[0]?.date;
  if (latestDailyMarketBrief()?.date !== latestDate) {
    addError(`latest daily market selector mismatch: expected ${latestDate ?? 'none'} got ${latestDailyMarketBrief()?.date ?? 'none'}`);
  }

  const companyIds = new Set(companies.map((company) => company.id));
  const marketMapIds = new Set([
    ...companies.map((company) => company.sectorId),
    reconstructionInfrastructureMap.sectorId,
    semiconductorClusterInfrastructureMap.sectorId,
    'datacenter-power-cooling',
  ]);
  const driverIds = new Set(marketDrivers.map((driver) => driver.id));
  const flowIds = new Set(marketFlows.map((flow) => flow.id));
  const reportIds = new Set(industryReports.map((report) => report.id));
  const assetIds = new Set(dailyMarketAssets.map((asset) => asset.id));
  const evidenceTypes = new Set(['fact', 'relationship', 'interpretation']);
  const forbiddenSignalPattern = /(호재|악재|매수|매도\s*추천)/;
  const forbiddenProviderPattern = /(finnhub|twelve\s*data|fred)/i;

  const validateRefs = (owner: string, sourceRefs: string[]) => {
    if (!sourceRefs.length) addError(`daily market content has no sourceRefs: ${owner}`);
    duplicateValues(sourceRefs).forEach((sourceId) => addError(`duplicate daily market sourceRef: ${owner} / ${sourceId}`));
    sourceRefs.forEach((sourceId) => {
      if (sourceRegistry[sourceId]) return;
      dailyMarketValidation.invalidRefCount += 1;
      addError(`missing daily market sourceRef: ${owner} / ${sourceId}`);
    });
  };

  dailyMarketAssets.forEach((asset) => {
    if (!asset.symbol) addError(`daily market asset missing symbol: ${asset.id}`);
    if (!asset.unitLabel) addError(`daily market asset missing unit: ${asset.id}`);
    if (asset.provider !== 'Yahoo Finance chart') addError(`unapproved daily market provider: ${asset.id} / ${asset.provider}`);
    if (forbiddenProviderPattern.test(`${asset.provider} ${asset.sourceRef}`)) {
      addError(`forbidden new provider in daily market asset: ${asset.id}`);
    }
    validateRefs(`asset ${asset.id}`, [asset.sourceRef, ...(asset.unitSourceRef ? [asset.unitSourceRef] : [])]);
  });

  marketDrivers.forEach((driver) => {
    if (!driver.confirmedFact.trim()) addError(`daily market driver missing confirmedFact: ${driver.id}`);
    if (!driver.marketInterpretation.trim()) addError(`daily market driver missing interpretation: ${driver.id}`);
    if (driver.confirmedFact.trim() === driver.marketInterpretation.trim()) {
      addError(`daily market driver fact/interpretation not separated: ${driver.id}`);
    }
    if (forbiddenSignalPattern.test(`${driver.label} ${driver.confirmedFact} ${driver.marketInterpretation}`)) {
      addError(`investment signal wording in daily market driver: ${driver.id}`);
    }
    driver.affectedAssets.forEach((assetId) => {
      if (!assetIds.has(assetId)) addError(`missing daily market driver asset: ${driver.id} / ${assetId}`);
    });
    validateRefs(`driver ${driver.id}`, driver.sourceRefs);
  });

  marketFlows.forEach((flow) => {
    if (flow.steps.length < 2 || flow.steps.length > 4) {
      addError(`daily market flow step count must be 2-4: ${flow.id} / ${flow.steps.length}`);
    }
    dailyMarketValidation.stepCount += flow.steps.length;
    if (forbiddenSignalPattern.test(`${flow.title} ${flow.steps.map((step) => `${step.label} ${step.detail}`).join(' ')}`)) {
      addError(`investment signal wording in daily market flow: ${flow.id}`);
    }
    flow.steps.forEach((step, index) => {
      if (!step.label.trim() || !step.detail.trim()) addError(`empty daily market flow step: ${flow.id} / ${index + 1}`);
      if (!evidenceTypes.has(step.type)) addError(`invalid daily market flow evidence type: ${flow.id} / ${step.type}`);
      if (step.marketMapId && !marketMapIds.has(step.marketMapId)) {
        addError(`missing daily market flow marketMapId: ${flow.id} / ${step.marketMapId}`);
      }
      step.companyIds?.forEach((companyId) => {
        if (!companyIds.has(companyId)) addError(`missing daily market flow companyId: ${flow.id} / ${companyId}`);
      });
    });
    duplicateValues(flow.reportIds ?? []).forEach((reportId) => addError(`duplicate daily market reportId: ${flow.id} / ${reportId}`));
    flow.reportIds?.forEach((reportId) => {
      if (!reportIds.has(reportId)) addError(`missing daily market reportId: ${flow.id} / ${reportId}`);
    });
    validateRefs(`flow ${flow.id}`, flow.sourceRefs);
  });

  dailyMarketBriefEntries.forEach((brief) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(brief.date) || Number.isNaN(Date.parse(brief.date))) {
      addError(`invalid daily market brief date: ${brief.date}`);
    }
    if (forbiddenSignalPattern.test(`${brief.title} ${brief.summary} ${Object.values(brief.assetNotes).join(' ')}`)) {
      addError(`investment signal wording in daily market brief: ${brief.date}`);
    }
    duplicateValues(brief.marketDriverIds).forEach((id) => addError(`duplicate driver in daily market brief: ${brief.date} / ${id}`));
    duplicateValues(brief.flowIds).forEach((id) => addError(`duplicate flow in daily market brief: ${brief.date} / ${id}`));
    brief.marketDriverIds.forEach((id) => {
      if (!driverIds.has(id)) addError(`missing daily market brief driver: ${brief.date} / ${id}`);
    });
    brief.flowIds.forEach((id) => {
      if (!flowIds.has(id)) addError(`missing daily market brief flow: ${brief.date} / ${id}`);
    });
    [...brief.indexAssetIds, ...brief.macroAssetIds].forEach((assetId) => {
      if (!dailyMarketAssetRegistry[assetId]) addError(`missing daily market brief asset: ${brief.date} / ${assetId}`);
    });
    validateRefs(`brief ${brief.date}`, brief.sourceRefs);
  });

  const productionContent = JSON.stringify({ dailyMarketBriefEntries, marketDrivers, marketFlows });
  if (/(mock|fallback|example|샘플|예시)/i.test(productionContent)) {
    addError('mock/example text found in production daily market content');
  }
  if (forbiddenProviderPattern.test(productionContent)) {
    addError('forbidden new provider found in production daily market content');
  }
}

function validateMarketDirectionDisplay() {
  const samplePrice = (price: string, open: string, currency: string): MarketPrice => ({
    ticker: currency === 'KRW' ? '005930.KS' : 'NVDA',
    market: currency === 'KRW' ? 'KOSPI' : 'NASDAQ',
    price,
    open,
    previousClose: open,
    change: '',
    changePercent: '',
    currency,
    priceLabel: 'latest',
    marketStatus: 'open',
    asOf: '2026-07-10T20:00:00.000Z',
    source: 'yahoo-finance-chart',
    isDelayed: true,
  });
  const up = samplePrice('101', '100', 'USD');
  const down = samplePrice('99', '100', 'USD');
  const flat = samplePrice('100', '100', 'USD');
  if (priceDirection(up) !== 'up') addError('positive market direction should be up');
  if (priceDirection(down) !== 'down') addError('negative market direction should be down');
  if (priceDirection(flat) !== 'flat') addError('zero market direction should be flat');

  const largeKrw = priceDisplay(samplePrice('2180000', '2296000', 'KRW'));
  const largeUsd = priceDisplay(samplePrice('12345.67', '12000', 'USD'));
  if (largeKrw.amount !== '2,180,000원') addError(`large KRW price format mismatch: ${largeKrw.amount}`);
  if (largeUsd.amount !== '$12,345.67') addError(`large USD price format mismatch: ${largeUsd.amount}`);
}

function validateDisclosureRegistry() {
  disclosureValidation.enabledCount = enabledDartTrackedCompanies.length;
  disclosureValidation.disabledCount = dartTrackedCompanies.length - enabledDartTrackedCompanies.length;

  const ids = dartTrackedCompanies.map((company) => company.id);
  duplicateValues(ids).forEach((id) => addError(`duplicate DART tracked company id: ${id}`));

  const corpCodes = enabledDartTrackedCompanies.map((company) => company.corpCode);
  const duplicateCorpCodes = duplicateValues(corpCodes);
  disclosureValidation.duplicateCorpCodeCount = duplicateCorpCodes.length;
  duplicateCorpCodes.forEach((corpCode) => addError(`duplicate DART corpCode: ${corpCode}`));

  const tickerGroups = new Map<string, typeof dartTrackedCompanies>();
  dartTrackedCompanies.forEach((company) => {
    const ticker = normalizeTicker(company.ticker);
    if (!ticker) return;
    tickerGroups.set(ticker, [...(tickerGroups.get(ticker) ?? []), company]);
  });

  tickerGroups.forEach((companiesForTicker, ticker) => {
    const identityKeys = new Set(companiesForTicker.map((company) => company.companyName));
    if (identityKeys.size > 1) {
      addError(`conflicting DART ticker identity: ${ticker} / ${companiesForTicker.map((company) => company.companyName).join(', ')}`);
    }
  });

  const currentDomesticTickers = new Set(
    currentWeeklyPicks
      .filter((pick) => pick.tickerStatus !== 'placeholder' && (pick.ticker.endsWith('.KS') || pick.ticker.endsWith('.KQ')))
      .map((pick) => normalizeTicker(pick.ticker)),
  );

  const marketMapDomesticTickers = new Set(
    [
      ...reconstructionInfrastructureMap.companies,
      ...semiconductorClusterInfrastructureMap.companies,
    ]
      .map((company) => normalizeTicker(company.ticker))
      .filter((ticker) => /^\d{6}\.(KS|KQ)$/.test(ticker)),
  );

  const enabledTickers = new Set(enabledDartTrackedCompanies.map((company) => normalizeTicker(company.ticker)));
  currentDomesticTickers.forEach((ticker) => {
    if (!enabledTickers.has(ticker)) addError(`current domestic Pick missing from DART registry: ${ticker}`);
  });
  marketMapDomesticTickers.forEach((ticker) => {
    if (!enabledTickers.has(ticker)) addError(`market-map domestic ticker missing from DART registry: ${ticker}`);
  });

  dartTrackedCompanies.forEach((company) => {
    const ticker = normalizeTicker(company.ticker);
    const isDomesticTicker = /^\d{6}\.(KS|KQ)$/.test(ticker);
    const isPlaceholderTicker = ticker === 'WATCH';
    const isRequiredTicker = currentDomesticTickers.has(ticker) || marketMapDomesticTickers.has(ticker);

    if (!company.id) addError(`DART tracked company missing id: ${company.companyName || company.ticker}`);
    if (!company.companyName) addError(`DART tracked company missing companyName: ${company.id}`);
    if (!company.ticker) addError(`DART tracked company missing ticker: ${company.id}`);
    if (company.enabled && !company.corpCode) addError(`enabled DART tracked company missing corpCode: ${company.id}`);
    if (company.corpCode && !/^\d{8}$/.test(company.corpCode)) addError(`invalid DART corpCode format: ${company.id} / ${company.corpCode}`);
    if (company.enabled && !isDomesticTicker) addError(`enabled DART tracked company must be .KS/.KQ ticker: ${company.id} / ${company.ticker}`);
    if (company.enabled && isPlaceholderTicker) addError(`placeholder ticker included in DART registry: ${company.id}`);
    if (!company.enabled && isRequiredTicker) addError(`required DART ticker is disabled: ${company.id} / ${company.ticker}`);

    if (company.source === 'current-pick' && !currentDomesticTickers.has(ticker)) {
      addError(`DART current-pick source is not a current domestic Pick: ${company.id} / ${company.ticker}`);
    }
    if (company.source === 'market-map' && !marketMapDomesticTickers.has(ticker)) {
      addError(`DART market-map source is not in active market maps: ${company.id} / ${company.ticker}`);
    }
  });
}

function validateDisclosureClassification() {
  const examples: Array<[string, ReturnType<typeof classifyDisclosure>]> = [
    ['단일판매ㆍ공급계약체결', 'supply-contract'],
    ['분기보고서', 'periodic-report'],
    ['매출액또는손익구조30%(대규모법인은15%)이상변경', 'earnings'],
    ['주요사항보고서(전환사채권발행결정)', 'capital'],
    ['임원ㆍ주요주주특정증권등소유상황보고서', 'ownership'],
    ['투자판단관련주요경영사항', 'major-management'],
    ['타법인주식및출자증권취득결정', 'investment'],
    ['주주총회소집공고', 'governance'],
    ['기타시장안내', 'other'],
  ];

  examples.forEach(([reportName, expected]) => {
    const actual = classifyDisclosure(reportName);
    if (actual !== expected) addError(`DART disclosure category mismatch: ${reportName} expected ${expected} got ${actual}`);
  });
}

function validateSecDisclosureRegistry() {
  secDisclosureValidation.enabledCount = enabledSecTrackedCompanies.length;
  secDisclosureValidation.disabledCount = secTrackedCompanies.length - enabledSecTrackedCompanies.length;
  if (secDisclosureValidation.enabledCount !== 12) {
    addError(`SEC enabled tracked company count changed: ${secDisclosureValidation.enabledCount}`);
  }

  const pickIds = new Set(stockAutopsyPicks.map((pick) => pick.id));
  const companyIds = new Set(companies.map((company) => company.id));
  const currentUsTickers = new Set(
    currentWeeklyPicks
      .filter((pick) => pick.market === 'US' && pick.tickerStatus !== 'placeholder')
      .map((pick) => normalizeTicker(pick.ticker)),
  );
  const enabledTickers = new Set(enabledSecTrackedCompanies.map((company) => normalizeTicker(company.ticker)));

  const ids = secTrackedCompanies.map((company) => company.id);
  duplicateValues(ids).forEach((id) => addError(`duplicate SEC tracked company id: ${id}`));

  const ciks = enabledSecTrackedCompanies.map((company) => company.cik);
  const duplicateCiks = duplicateValues(ciks);
  secDisclosureValidation.duplicateCikCount = duplicateCiks.length;
  duplicateCiks.forEach((cik) => addError(`duplicate SEC CIK: ${cik}`));

  const tickers = enabledSecTrackedCompanies.map((company) => normalizeTicker(company.ticker));
  const duplicateTickers = duplicateValues(tickers);
  secDisclosureValidation.duplicateTickerCount = duplicateTickers.length;
  duplicateTickers.forEach((ticker) => addError(`duplicate SEC ticker: ${ticker}`));

  currentUsTickers.forEach((ticker) => {
    if (!enabledTickers.has(ticker)) addError(`current US Pick missing from SEC registry: ${ticker}`);
  });

  secTrackedCompanies.forEach((company) => {
    const ticker = normalizeTicker(company.ticker);
    const isRequiredTicker = currentUsTickers.has(ticker);

    if (!company.id) addError(`SEC tracked company missing id: ${company.companyName || company.ticker}`);
    if (!company.companyName) addError(`SEC tracked company missing companyName: ${company.id}`);
    if (!company.ticker) addError(`SEC tracked company missing ticker: ${company.id}`);
    if (company.enabled && !company.cik) addError(`enabled SEC tracked company missing CIK: ${company.id}`);
    if (company.cik && !/^\d{10}$/.test(company.cik)) addError(`invalid SEC CIK format: ${company.id} / ${company.cik}`);
    if (company.enabled && !/^[A-Z][A-Z0-9.-]{0,9}$/.test(ticker)) addError(`invalid SEC ticker format: ${company.id} / ${company.ticker}`);
    if (company.enabled && isPlaceholderTicker(ticker)) addError(`placeholder ticker included in SEC registry: ${company.id}`);
    if (!company.enabled && isRequiredTicker) addError(`required SEC ticker is disabled: ${company.id} / ${company.ticker}`);
    if (company.enabled && !company.forms.length) addError(`enabled SEC tracked company missing forms: ${company.id}`);

    company.forms.forEach((formType) => {
      if (!isSupportedSecFormPattern(formType)) addError(`unsupported SEC form pattern: ${company.id} / ${formType}`);
    });

    if (company.foreignIssuer && (!company.forms.includes('6-K') || !company.forms.includes('20-F'))) {
      addWarning(`foreign issuer should track 6-K and 20-F: ${company.id}`);
    }

    if (company.source === 'current-pick' && !currentUsTickers.has(ticker)) {
      addError(`SEC current-pick source is not a current US Pick: ${company.id} / ${company.ticker}`);
    }

    company.relatedPickIds?.forEach((pickId) => {
      if (!pickIds.has(pickId)) addError(`missing SEC relatedPickIds: ${company.id} / ${pickId}`);
    });
    company.relatedCompanyIds?.forEach((companyId) => {
      if (!companyIds.has(companyId)) addError(`missing SEC relatedCompanyIds: ${company.id} / ${companyId}`);
    });
  });
}

function validateSecFilingHelpers() {
  const normalizedCik = normalizeSecCik('723125');
  if (normalizedCik !== '0000723125') addError(`SEC CIK normalization mismatch: ${normalizedCik}`);
  const submissionsUrl = secSubmissionsUrl('723125');
  if (submissionsUrl !== 'https://data.sec.gov/submissions/CIK0000723125.json') {
    addError(`SEC submissions URL mismatch: ${submissionsUrl}`);
  }
  const archiveUrl = secArchiveIndexUrl('0000723125', '0000723125-26-000006');
  if (archiveUrl !== 'https://www.sec.gov/Archives/edgar/data/723125/000072312526000006/0000723125-26-000006-index.html') {
    addError(`SEC archive URL mismatch: ${archiveUrl}`);
  }
  const primaryDocumentUrl = secPrimaryDocumentUrl('0000723125', '0001632063-26-000003', 'xslF345X06/primarydocument.xml');
  if (primaryDocumentUrl !== 'https://www.sec.gov/Archives/edgar/data/723125/000163206326000003/primarydocument.xml') {
    addError(`SEC primary document URL mismatch: ${primaryDocumentUrl}`);
  }

  const classificationExamples: Array<[string, ReturnType<typeof classifySecFilingForm>]> = [
    ['8-K', 'current-report'],
    ['8-K/A', 'current-report'],
    ['10-Q', 'quarterly-report'],
    ['10-K', 'annual-report'],
    ['4', 'insider-transaction'],
    ['SC 13G/A', 'ownership'],
    ['DEF 14A', 'proxy'],
    ['424B5', 'capital-markets'],
    ['6-K', 'foreign-report'],
  ];
  classificationExamples.forEach(([formType, expected]) => {
    const actual = classifySecFilingForm(formType);
    if (actual !== expected) addError(`SEC filing category mismatch: ${formType} expected ${expected} got ${actual}`);
  });

  const sampleCompany = enabledSecTrackedCompanies.find((company) => company.ticker === 'MU');
  if (!sampleCompany) {
    addError('SEC helper sample company missing: MU');
    return;
  }
  const rows = normalizeSecFilingRows(
    {
      filings: {
        recent: {
          accessionNumber: ['0000723125-26-000006'],
          filingDate: ['2026-06-30'],
          reportDate: ['2026-06-29'],
          acceptanceDateTime: ['2026-06-30T16:31:00.000Z'],
          form: ['8-K'],
          primaryDocument: ['mu-20260630.htm'],
        },
      },
    },
    sampleCompany,
  );
  if (rows.length !== 1) addError(`SEC normalized filing sample row count mismatch: ${rows.length}`);
  if (rows[0]?.sourceUrl !== archiveUrl) addError(`SEC normalized filing URL mismatch: ${rows[0]?.sourceUrl}`);

  const unevenRows = normalizeSecFilingRows(
    {
      filings: {
        recent: {
          accessionNumber: ['0000723125-26-000007'],
          filingDate: [],
          form: [],
        },
      },
    },
    sampleCompany,
  );
  if (unevenRows.length !== 0) addError(`SEC uneven recent arrays should be ignored safely: ${unevenRows.length}`);
}

function validateSecFilingDetailParsers() {
  if (SEC_FILING_DETAIL_PARSER_VERSION !== 'sec-structured-v1') {
    addError(`SEC detail parser version mismatch: ${SEC_FILING_DETAIL_PARSER_VERSION}`);
  }

  secDetailValidation.eightKItemCount = eightKItemDefinitions.length;
  duplicateValues(eightKItemDefinitions.map((definition) => definition.item))
    .forEach((item) => addError(`duplicate 8-K item mapping: ${item}`));
  eightKItemDefinitions.forEach((definition) => {
    if (!isEightKItemCode(definition.item)) addError(`invalid 8-K item format: ${definition.item}`);
    if (!definition.labelEn || !definition.labelKo || !definition.category) {
      addError(`incomplete 8-K item definition: ${definition.item}`);
    }
  });

  const requiredEightKItems = [
    '1.01', '1.02', '1.03', '1.04', '1.05',
    '2.01', '2.02', '2.03', '2.04', '2.05', '2.06',
    '3.01', '3.02', '3.03',
    '4.01', '4.02',
    '5.01', '5.02', '5.03', '5.04', '5.05', '5.06', '5.07', '5.08',
    '6.01', '6.02', '6.03', '6.04', '6.05',
    '7.01', '8.01', '9.01',
  ];
  requiredEightKItems.forEach((item) => {
    if (!eightKItemDefinitions.some((definition) => definition.item === item)) addError(`missing required 8-K item mapping: ${item}`);
  });

  const normalizedItems = normalizeEightKItems('2.02,9.01');
  if (normalizedItems.map((item) => item.item).join('|') !== '2.02|9.01') {
    addError(`8-K item normalization mismatch: ${normalizedItems.map((item) => item.item).join(',')}`);
  }
  const spacedItems = normalizeEightKItems(' 5.02, 8.01, 9.01 ');
  if (spacedItems.map((item) => item.item).join('|') !== '5.02|8.01|9.01') {
    addError(`8-K item whitespace normalization mismatch: ${spacedItems.map((item) => item.item).join(',')}`);
  }
  if (normalizeEightKItems('').length !== 0) addError('empty 8-K items should normalize to empty array');

  secDetailValidation.transactionCodeCount = secTransactionCodeDefinitions.length;
  duplicateValues(secTransactionCodeDefinitions.map((definition) => definition.code))
    .forEach((code) => addError(`duplicate SEC transaction code mapping: ${code}`));
  const requiredTransactionCodes = ['P', 'S', 'A', 'D', 'F', 'G', 'M', 'C', 'E', 'H', 'I', 'J', 'K', 'L', 'O', 'U', 'W', 'X', 'Z'];
  requiredTransactionCodes.forEach((code) => {
    if (!isSupportedTransactionCode(code)) addError(`missing SEC transaction code mapping: ${code}`);
    if (!transactionCategoryForCode(code)) addError(`missing SEC transaction category: ${code}`);
  });
  if (transactionCategoryForCode('P') !== 'open-market-purchase') addError('SEC transaction code P category mismatch');
  if (transactionCategoryForCode('S') !== 'open-market-sale') addError('SEC transaction code S category mismatch');
  if (transactionCategoryForCode('M') !== 'option-exercise') addError('SEC transaction code M category mismatch');
  if (transactionCategoryForCode('F') !== 'tax-withholding') addError('SEC transaction code F category mismatch');
  if (transactionCategoryForCode('G') !== 'gift') addError('SEC transaction code G category mismatch');

  const fixtureXml = `<?xml version="1.0"?>
<ownershipDocument>
  <reportingOwner>
    <reportingOwnerId>
      <rptOwnerCik>0000000001</rptOwnerCik>
      <rptOwnerName>Example Person</rptOwnerName>
    </reportingOwnerId>
    <reportingOwnerRelationship>
      <isDirector>1</isDirector>
      <isOfficer>0</isOfficer>
      <isTenPercentOwner>0</isTenPercentOwner>
      <isOther>0</isOther>
    </reportingOwnerRelationship>
  </reportingOwner>
  <reportingOwner>
    <reportingOwnerId>
      <rptOwnerCik>0000000002</rptOwnerCik>
      <rptOwnerName>Example Officer</rptOwnerName>
    </reportingOwnerId>
    <reportingOwnerRelationship>
      <isDirector>0</isDirector>
      <isOfficer>true</isOfficer>
      <isTenPercentOwner>0</isTenPercentOwner>
      <isOther>0</isOther>
      <officerTitle>Chief Example Officer</officerTitle>
    </reportingOwnerRelationship>
  </reportingOwner>
  <nonDerivativeTable>
    <nonDerivativeTransaction>
      <securityTitle><value>Common Stock</value></securityTitle>
      <transactionDate><value>2026-07-01</value></transactionDate>
      <transactionCoding>
        <transactionFormType>4</transactionFormType>
        <transactionCode>P</transactionCode>
        <equitySwapInvolved>0</equitySwapInvolved>
      </transactionCoding>
      <transactionAmounts>
        <transactionShares><value>1,000</value></transactionShares>
        <transactionPricePerShare><value>12.50</value></transactionPricePerShare>
        <transactionAcquiredDisposedCode><value>A</value></transactionAcquiredDisposedCode>
      </transactionAmounts>
      <postTransactionAmounts><sharesOwnedFollowingTransaction><value>5,000</value></sharesOwnedFollowingTransaction></postTransactionAmounts>
      <ownershipNature><directOrIndirectOwnership><value>D</value></directOrIndirectOwnership></ownershipNature>
    </nonDerivativeTransaction>
    <nonDerivativeTransaction>
      <securityTitle><value>Common Stock</value></securityTitle>
      <transactionDate><value>2026-07-02</value></transactionDate>
      <transactionCoding><transactionFormType>4</transactionFormType><transactionCode>S</transactionCode><equitySwapInvolved>false</equitySwapInvolved></transactionCoding>
      <transactionAmounts><transactionShares><value>250</value></transactionShares><transactionPricePerShare><value>13</value></transactionPricePerShare><transactionAcquiredDisposedCode><value>D</value></transactionAcquiredDisposedCode></transactionAmounts>
      <postTransactionAmounts><sharesOwnedFollowingTransaction><value>4,750</value></sharesOwnedFollowingTransaction></postTransactionAmounts>
      <ownershipNature><directOrIndirectOwnership><value>I</value></directOrIndirectOwnership><natureOfOwnership><value>By trust</value></natureOfOwnership></ownershipNature>
    </nonDerivativeTransaction>
    <nonDerivativeTransaction>
      <securityTitle><value>Common Stock</value></securityTitle>
      <transactionDate><value>2026-07-03</value></transactionDate>
      <transactionCoding><transactionFormType>4</transactionFormType><transactionCode>F</transactionCode><equitySwapInvolved>0</equitySwapInvolved></transactionCoding>
      <transactionAmounts><transactionShares><value>40</value></transactionShares><transactionPricePerShare><value>11.25</value></transactionPricePerShare><transactionAcquiredDisposedCode><value>D</value></transactionAcquiredDisposedCode></transactionAmounts>
      <ownershipNature><directOrIndirectOwnership><value>D</value></directOrIndirectOwnership></ownershipNature>
    </nonDerivativeTransaction>
    <nonDerivativeTransaction>
      <securityTitle><value>Common Stock</value><footnoteId id="F1"/></securityTitle>
      <transactionDate><value>2026-07-04</value></transactionDate>
      <transactionCoding><transactionFormType>4</transactionFormType><transactionCode>G</transactionCode><equitySwapInvolved>0</equitySwapInvolved></transactionCoding>
      <transactionAmounts><transactionShares><value>10</value></transactionShares><transactionAcquiredDisposedCode><value>D</value></transactionAcquiredDisposedCode></transactionAmounts>
      <ownershipNature><directOrIndirectOwnership><value>D</value></directOrIndirectOwnership></ownershipNature>
    </nonDerivativeTransaction>
  </nonDerivativeTable>
  <derivativeTable>
    <derivativeTransaction>
      <securityTitle><value>Stock Option</value></securityTitle>
      <conversionOrExercisePrice><value>10</value></conversionOrExercisePrice>
      <transactionDate><value>2026-07-05</value></transactionDate>
      <transactionCoding><transactionFormType>4</transactionFormType><transactionCode>M</transactionCode></transactionCoding>
      <transactionAmounts><transactionShares><value>100</value></transactionShares><transactionPricePerShare><value>0</value></transactionPricePerShare><transactionAcquiredDisposedCode><value>A</value></transactionAcquiredDisposedCode></transactionAmounts>
      <exerciseDate><value>2026-07-05</value></exerciseDate>
      <expirationDate><value>2030-07-05</value></expirationDate>
      <underlyingSecurity><underlyingSecurityTitle><value>Common Stock</value></underlyingSecurityTitle><underlyingSecurityShares><value>100</value></underlyingSecurityShares></underlyingSecurity>
      <postTransactionAmounts><sharesOwnedFollowingTransaction><value>100</value></sharesOwnedFollowingTransaction></postTransactionAmounts>
      <ownershipNature><directOrIndirectOwnership><value>D</value></directOrIndirectOwnership></ownershipNature>
    </derivativeTransaction>
  </derivativeTable>
  <footnotes><footnote id="F1">Short fixture footnote.</footnote></footnotes>
</ownershipDocument>`;
  const parsed = parseForm4OwnershipXml(fixtureXml);
  secDetailValidation.fixtureReportingOwners = parsed.reportingOwners.length;
  secDetailValidation.fixtureNonDerivativeTransactions = parsed.nonDerivativeTransactions.length;
  secDetailValidation.fixtureDerivativeTransactions = parsed.derivativeTransactions.length;
  secDetailValidation.fixtureFootnotes = parsed.footnoteCount;

  if (parsed.reportingOwners.length !== 2) addError(`Form 4 fixture reporting owner count mismatch: ${parsed.reportingOwners.length}`);
  if (parsed.reportingOwners[0]?.isDirector !== true) addError('Form 4 fixture director relationship mismatch');
  if (parsed.reportingOwners[1]?.officerTitle !== 'Chief Example Officer') addError('Form 4 fixture officer title mismatch');
  if (parsed.nonDerivativeTransactions.map((transaction) => transaction.transactionCode).join('|') !== 'P|S|F|G') {
    addError(`Form 4 fixture non-derivative order mismatch: ${parsed.nonDerivativeTransactions.map((transaction) => transaction.transactionCode).join(',')}`);
  }
  if (parsed.nonDerivativeTransactions[0]?.estimatedTransactionValue !== 12500) addError('Form 4 fixture P estimated value mismatch');
  if (parsed.nonDerivativeTransactions[1]?.ownershipLabelKo !== '간접 보유') addError('Form 4 fixture indirect ownership mismatch');
  if (parsed.nonDerivativeTransactions[2]?.transactionCategory !== 'tax-withholding') addError('Form 4 fixture F category mismatch');
  if (parsed.nonDerivativeTransactions[3]?.pricePerShare !== null || parsed.nonDerivativeTransactions[3]?.estimatedTransactionValue !== null) {
    addError('Form 4 fixture missing price should not calculate transaction value');
  }
  if (!parsed.nonDerivativeTransactions[3]?.footnoteIds.includes('F1')) addError('Form 4 fixture footnote id missing');
  if (parsed.derivativeTransactions.length !== 1) addError(`Form 4 fixture derivative transaction count mismatch: ${parsed.derivativeTransactions.length}`);
  if (parsed.derivativeTransactions[0]?.transactionCategory !== 'option-exercise') addError('Form 4 fixture derivative M category mismatch');
  if (parsed.derivativeTransactions[0]?.underlyingSecurityShares !== 100) addError('Form 4 fixture underlying security shares mismatch');
  if (parsed.footnoteCount !== 1) addError(`Form 4 fixture footnote count mismatch: ${parsed.footnoteCount}`);

  [
    ...parsed.nonDerivativeTransactions.map((transaction) => transaction.transactionCode),
    ...parsed.derivativeTransactions.map((transaction) => transaction.transactionCode),
  ].forEach((code) => {
    if (code && !isSupportedTransactionCode(code)) addError(`Form 4 fixture unsupported transaction code: ${code}`);
  });
}

type IdentityRecord = {
  source: string;
  id: string;
  companyId?: string;
  companyName?: string;
  legalName?: string;
  ticker?: string;
};

function validateCompanyIdentities() {
  const legalNameByCompanyId = new Map(companies.map((company) => [company.id, company.legalName || company.name]));
  const legalNameByTicker = new Map<string, string>();
  companies.forEach((company) => {
    const ticker = normalizeTicker(company.ticker);
    if (ticker && !legalNameByTicker.has(ticker)) legalNameByTicker.set(ticker, company.legalName || company.name);
  });

  const records: IdentityRecord[] = [];
  const addRecord = (record: IdentityRecord) => records.push(record);

  stockAutopsyPicks.forEach((pick) => {
    identityValidation.pickIdentityCount += 1;
    const companyId = pick.relatedCompanyId ?? pick.companyId;
    const ticker = normalizeTicker(pick.ticker);
    addRecord({
      source: 'Pick',
      id: pick.id,
      companyId,
      companyName: pick.companyName,
      legalName: companyId ? legalNameByCompanyId.get(companyId) : legalNameByTicker.get(ticker),
      ticker: pick.ticker,
    });
  });

  companies.forEach((company) => {
    identityValidation.companyRegistryIdentityCount += 1;
    addRecord({
      source: 'company registry',
      id: company.id,
      companyId: company.id,
      companyName: company.name,
      legalName: company.legalName,
      ticker: company.ticker,
    });
  });

  anchors.forEach((anchor) => {
    identityValidation.anchorIdentityCount += 1;
    addRecord({
      source: 'anchor',
      id: anchor.id,
      companyId: anchor.id,
      companyName: anchor.name,
      legalName: anchor.legalName,
      ticker: anchor.ticker,
    });
  });

  [
    ...reconstructionInfrastructureMap.companies,
    ...semiconductorClusterInfrastructureMap.companies,
  ].forEach((company) => {
    identityValidation.mapIdentityCount += 1;
    const ticker = normalizeTicker(company.ticker);
    addRecord({
      source: 'market map',
      id: company.id,
      companyId: company.id,
      companyName: company.name,
      legalName: legalNameByCompanyId.get(company.id) ?? legalNameByTicker.get(ticker) ?? company.name,
      ticker: company.ticker,
    });
  });

  dartTrackedCompanies.forEach((company) => {
    identityValidation.disclosureIdentityCount += 1;
    const ticker = normalizeTicker(company.ticker);
    addRecord({
      source: 'DART registry',
      id: company.id,
      companyName: company.companyName,
      legalName: legalNameByTicker.get(ticker),
      ticker: company.ticker,
    });
  });

  secTrackedCompanies.forEach((company) => {
    identityValidation.disclosureIdentityCount += 1;
    const ticker = normalizeTicker(company.ticker);
    addRecord({
      source: 'SEC registry',
      id: company.id,
      companyName: company.companyName,
      legalName: legalNameByTicker.get(ticker) ?? company.companyName,
      ticker: company.ticker,
    });
  });

  marketMovers.forEach((mover) => {
    identityValidation.marketMoverIdentityCount += 1;
    const ticker = normalizeTicker(mover.ticker);
    addRecord({
      source: 'market mover',
      id: mover.id,
      companyId: mover.companyId,
      companyName: mover.companyName,
      legalName: mover.companyId ? legalNameByCompanyId.get(mover.companyId) : legalNameByTicker.get(ticker),
      ticker: mover.ticker,
    });
  });

  const recordsByTicker = new Map<string, IdentityRecord[]>();

  records.forEach((record) => {
    const rawCompanyName = String(record.companyName ?? '').trim();
    const rawTicker = String(record.ticker ?? '').trim();
    const companyName = normalizeIdentityName(record.companyName);
    const ticker = normalizeTicker(record.ticker);
    const legalName = normalizeIdentityName(record.legalName);

    if (!companyName) addError(`missing company identity name: ${record.source} / ${record.id}`);

    if (ticker && !isPlaceholderTicker(ticker)) {
      recordsByTicker.set(ticker, [...(recordsByTicker.get(ticker) ?? []), record]);
      if (rawCompanyName === rawTicker && companyName === ticker && (!legalName || legalName === ticker)) {
        identityValidation.tickerOnlyNameCount += 1;
        addError(`ticker-only company identity: ${record.source} / ${record.id} / ${ticker}`);
      }
    }
  });

  recordsByTicker.forEach((tickerRecords, ticker) => {
    const names = new Set(tickerRecords.map((record) => normalizeIdentityName(record.companyName)).filter(Boolean));
    if (names.size <= 1) return;

    const legalNames = new Set(tickerRecords.map((record) => normalizeIdentityName(record.legalName)).filter(Boolean));
    if (legalNames.size <= 1) {
      identityValidation.aliasTickerNameCount += 1;
      return;
    }

    const companyIds = new Set(tickerRecords.map((record) => record.companyId).filter(Boolean));
    if (companyIds.size > 1) {
      identityValidation.conflictingTickerNameCount += 1;
      addError(`conflicting company identity for ticker: ${ticker} / ${Array.from(names).join(', ')}`);
      return;
    }

    identityValidation.aliasTickerNameCount += 1;
    addWarning(`same ticker has multiple display names, confirm intentional alias: ${ticker} / ${Array.from(names).join(', ')}`);
  });
}

type CompanyLogoRecord = CompanyLogoInput & {
  source: string;
  id: string;
};

function runtimeSourceFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return runtimeSourceFiles(path);
    return /\.(ts|tsx|css|html)$/.test(entry.name) ? [path] : [];
  });
}

function validateRuntimeCompanyLogoPolicy() {
  runtimeSourceFiles(join(process.cwd(), 'src')).forEach((filePath) => {
    const content = readFileSync(filePath, 'utf8');
    const clearbitMatches = content.match(/\b(?:https?:)?\/\/logo\.clearbit\.com|logo\.clearbit\.com/gi) ?? [];
    if (clearbitMatches.length) {
      companyLogoValidation.runtimeClearbitUrlCount += clearbitMatches.length;
      addError(`runtime Clearbit company logo URL remains: ${filePath.replace(`${process.cwd()}/`, '')}`);
    }

    const legacyHelperMatches = content.match(/\b(companyLogoSources|getCompanyLogoUrl)\b/g) ?? [];
    if (legacyHelperMatches.length) {
      companyLogoValidation.legacyHelperCount += legacyHelperMatches.length;
      addError(`legacy external company logo helper remains: ${filePath.replace(`${process.cwd()}/`, '')}`);
    }
  });
}

function publicCompanyLogoAssetPath(src: string) {
  return join(process.cwd(), 'public', src.replace(/^\/+/, ''));
}

function validateLocalCompanyLogoRegistry() {
  const entries = getCompanyLogoRegistryEntries();
  companyLogoValidation.registryCount = entries.length;

  duplicateValues(entries.map((entry) => entry.src)).forEach((src) => {
    companyLogoValidation.duplicateMappingCount += 1;
    addError(`duplicate local company logo mapping: ${src}`);
  });

  entries.forEach((entry) => {
    if (!isAllowedLocalCompanyLogoPath(entry.src)) {
      companyLogoValidation.invalidRegistryPathCount += 1;
      addError(`invalid local company logo path: ${entry.companyId} / ${entry.src} (allowed: ${Array.from(allowedCompanyLogoExtensions).join(', ')})`);
      return;
    }

    const assetPath = publicCompanyLogoAssetPath(entry.src);
    if (!existsSync(assetPath)) {
      companyLogoValidation.missingLocalAssetCount += 1;
      addError(`missing local company logo asset: ${entry.companyId} / ${entry.src}`);
      return;
    }

    const stat = statSync(assetPath);
    const extension = extname(assetPath).toLowerCase();
    companyLogoValidation.localAssetCount += 1;
    companyLogoValidation.localAssetBytes += stat.size;
    if (stat.size > companyLogoValidation.largestAssetBytes) {
      companyLogoValidation.largestAssetBytes = stat.size;
      companyLogoValidation.largestAssetPath = entry.src;
    }
    if (extension === '.svg') companyLogoValidation.svgAssetCount += 1;
    if (extension === '.png') companyLogoValidation.pngAssetCount += 1;
    if (extension === '.webp') companyLogoValidation.webpAssetCount += 1;
    if (extension === '.jpg' || extension === '.jpeg') companyLogoValidation.jpgAssetCount += 1;
  });
}

function canonicalLogoInput(input: CompanyLogoInput, companyById: Map<string, Company>, companyByTicker: Map<string, Company>) {
  const companyId = String(input.companyId ?? '').trim();
  const ticker = normalizeTicker(input.ticker);
  const canonicalCompany = (companyId && companyById.get(companyId)) || (ticker && companyByTicker.get(ticker));
  if (!canonicalCompany) return input;
  return {
    companyId: canonicalCompany.id,
    companyName: canonicalCompany.name || canonicalCompany.legalName,
    ticker: canonicalCompany.ticker,
  };
}

function companyLogoRecords() {
  const companyById = new Map(companies.map((company) => [company.id, company]));
  const companyByTicker = new Map<string, Company>();
  companies.forEach((company) => {
    const ticker = normalizeTicker(company.ticker);
    if (ticker && !isPlaceholderCompanyTicker(ticker) && !companyByTicker.has(ticker)) {
      companyByTicker.set(ticker, company);
    }
  });

  const records: CompanyLogoRecord[] = [];
  const seen = new Set<string>();
  const addRecord = (source: string, id: string, input: CompanyLogoInput) => {
    const canonical = canonicalLogoInput(input, companyById, companyByTicker);
    const key = canonical.companyId
      ? `id:${canonical.companyId}`
      : `name:${String(canonical.companyName ?? '').trim()}|ticker:${normalizeTicker(canonical.ticker)}`;
    if (seen.has(key)) return;
    seen.add(key);
    records.push({ source, id, ...canonical });
  };

  companies.forEach((company) => addRecord('company registry', company.id, {
    companyId: company.id,
    companyName: company.name || company.legalName,
    ticker: company.ticker,
  }));

  anchors.forEach((anchor) => addRecord('anchor', anchor.id, {
    companyId: anchor.id,
    companyName: anchor.name || anchor.legalName,
    ticker: anchor.ticker,
  }));

  [
    ...reconstructionInfrastructureMap.companies,
    ...semiconductorClusterInfrastructureMap.companies,
  ].forEach((company) => addRecord('market map', company.id, {
    companyId: company.id,
    companyName: company.name,
    ticker: company.ticker,
  }));

  stockAutopsyPicks.forEach((pick) => {
    const companyId = pick.relatedCompanyId ?? pick.companyId;
    addRecord('Pick', pick.id, {
      companyId,
      companyName: pick.companyName,
      ticker: pick.ticker,
    });
  });

  dartTrackedCompanies.forEach((company) => addRecord('DART registry', company.id, {
    companyName: company.companyName,
    ticker: company.ticker,
  }));

  secTrackedCompanies.forEach((company) => addRecord('SEC registry', company.id, {
    companyName: company.companyName,
    ticker: company.ticker,
  }));

  marketMovers.forEach((mover) => addRecord('market mover', mover.id, {
    companyId: mover.companyId,
    companyName: mover.companyName,
    ticker: mover.ticker,
  }));

  return records;
}

function validateCompanyLogoFallbacks() {
  validateRuntimeCompanyLogoPolicy();
  validateLocalCompanyLogoRegistry();

  companyLogoMonogramSamples.forEach((sample) => {
    companyLogoValidation.sampleCount += 1;
    const actual = resolveCompanyLogo(sample);
    if (actual.kind !== 'monogram' || actual.text !== sample.expected) {
      addError(`company logo monogram sample mismatch: ${sample.companyName ?? sample.ticker ?? '(empty)'} expected ${sample.expected} got ${actual.kind === 'monogram' ? actual.text : actual.src}`);
    }
  });

  const monogramsByTicker = new Map<string, { text: string; records: string[] }>();
  const records = companyLogoRecords();
  companyLogoValidation.logoRecordCount = records.length;

  records.forEach((record) => {
    const resolved = resolveCompanyLogo(record);
    if (resolved.kind === 'monogram') {
      companyLogoValidation.monogramFallbackCount += 1;
      if (!resolved.text.trim()) addError(`empty company logo monogram: ${record.source} / ${record.id}`);
      if (!record.companyName && isPlaceholderCompanyTicker(record.ticker)) {
        companyLogoValidation.placeholderFallbackCount += 1;
        if (resolved.text !== '?') {
          addError(`placeholder ticker should resolve to ?: ${record.source} / ${record.id} / ${record.ticker}`);
        }
      }
    }

    const expectedMonogram = resolveCompanyLogoMonogramText(record);
    if (resolved.kind === 'monogram' && resolved.text !== expectedMonogram) {
      addError(`company logo fallback drift: ${record.source} / ${record.id} expected ${expectedMonogram} got ${resolved.text}`);
    }

    const ticker = normalizeTicker(record.ticker);
    if (!ticker || isPlaceholderCompanyTicker(ticker) || resolved.kind !== 'monogram') return;
    const previous = monogramsByTicker.get(ticker);
    if (!previous) {
      monogramsByTicker.set(ticker, { text: resolved.text, records: [`${record.source}:${record.id}`] });
      return;
    }
    previous.records.push(`${record.source}:${record.id}`);
    if (previous.text !== resolved.text) {
      companyLogoValidation.duplicateTickerCollisionCount += 1;
      addError(`company logo ticker monogram collision: ${ticker} / ${previous.text} vs ${resolved.text} / ${previous.records.join(', ')}`);
    }
  });
}

validateCompanyLogoFallbacks();
validateSourceRegistry();
validatePickSources();
validatePicks();
validateWeeks();
validateReferences();
validateBottlenecks();
validateMacroContent();
validateHomeExperience();
validateCtaPolicy();
validateCompanyIdentities();
validateDailyMarketContent();
validateMarketDirectionDisplay();
const priceUniverseCount = validatePriceUniverse();
validateDisclosureRegistry();
validateDisclosureClassification();
validateSecDisclosureRegistry();
validateSecFilingHelpers();
validateSecFilingDetailParsers();

warnings.forEach((warning) => console.warn(warning));

if (errors.length) {
  errors.forEach((error) => console.error(error));
  runtime.process?.exit?.(1);
  throw new Error('content validation failed');
}

console.log(`✓ Pick ${stockAutopsyPicks.length}개 검증`);
console.log(`✓ Source ${contentSources.length}개 검증`);
console.log(`✓ 주간 컬렉션 ${weeklyPickCollections.length}개 검증`);
console.log(`✓ 대표 Pick 확인: ${representativePick.companyName}`);
console.log('✓ 중복 id/slug 없음');
console.log('✓ 중복 source id 없음');
console.log('✓ 중복 source URL 없음');
console.log('✓ 잘못된 source 참조 없음');
console.log('✓ published Pick source 연결 정상');
console.log(`✓ ticker 공유 관계 정상 (상장 ticker ${tickerValidation.sharedListedTickerGroups}개, placeholder ${tickerValidation.placeholderTickerGroups}개)`);
console.log('✓ placeholder ticker 가격 universe 제외');
console.log(`✓ restricted source 명시 처리 (${sourceValidation.restrictedRefCount}개)`);
console.log('✓ 관련 보고서 참조 정상');
console.log('✓ 시장지도 참조 정상');
console.log('✓ source URL 정상');
console.log(`✓ 산업 리포트 허브 검증 (report ${reportValidation.reportCount}개, category ${reportValidation.categoryCount}개, metric ${reportValidation.metricCount}개, featured ${reportValidation.featuredCount}개)`);
console.log(`✓ 산업 리포트 source/map/company/Pick 참조 정상 (잘못된 ref ${reportValidation.invalidRefCount}개)`);
console.log(`✓ 공급망 병목 레이더 검증 (bottleneck ${bottleneckValidation.bottleneckCount}개, evidence ${bottleneckValidation.evidenceCount}개, 공식 데이터 ${bottleneckValidation.officialEvidenceCount}개, 기업 자료 ${bottleneckValidation.companyEvidenceCount}개)`);
console.log(`✓ 병목 source/report/map/company/Pick/daily-market 참조 정상 (잘못된 ref ${bottleneckValidation.invalidRefCount}개)`);
console.log(`✓ 거시 온도판 검증 (indicator ${macroValidation.indicatorCount}개, domain brief ${macroValidation.briefCount}개, 잘못된 ref ${macroValidation.invalidRefCount}개)`);
console.log(`✓ FRED 결측·history·bp·pp·단위 변환·부분 실패·보안 단위 검증 (${macroValidation.unitCheckCount}개)`);
console.log(`✓ 초보자용 홈 검증 (쉬운 기능명 ${homeValidation.featureCount}개, navigation ${homeValidation.navigationGroupCount}그룹, insight ${homeValidation.insightCount}개, 거시 ${homeValidation.macroCardCount}개, 병목 ${homeValidation.bottleneckCardCount}개)`);
console.log(`✓ 홈 연결 검증 (산업 flow ${homeValidation.flowCount}개, 공시 유형 ${homeValidation.disclosureEventTypeCount}개, 보고서 ${homeValidation.reportCount}개, 용어 ${homeValidation.termCount}개, 잘못된 ref ${homeValidation.invalidRefCount}개)`);
console.log('✓ 홈 route/표시 상한/투자 추천·가짜 점수·외부 이미지·client secret 검증 정상');
console.log(`✓ 회사명 중심 identity 검증 (Pick ${identityValidation.pickIdentityCount}개, 회사 ${identityValidation.companyRegistryIdentityCount}개, 앵커 ${identityValidation.anchorIdentityCount}개, 지도 ${identityValidation.mapIdentityCount}개, 공시 ${identityValidation.disclosureIdentityCount}개, 시장 카드 ${identityValidation.marketMoverIdentityCount}개)`);
console.log('✓ ticker-only companyName 없음');
console.log(`✓ CompanyLogo runtime 외부 의존 제거 확인 (Clearbit URL ${companyLogoValidation.runtimeClearbitUrlCount}개, legacy helper ${companyLogoValidation.legacyHelperCount}개)`);
console.log(`✓ CompanyLogo registry 검증 (mapping ${companyLogoValidation.registryCount}개, local asset ${companyLogoValidation.localAssetCount}개, missing ${companyLogoValidation.missingLocalAssetCount}개, 중복 mapping ${companyLogoValidation.duplicateMappingCount}개)`);
console.log(`✓ CompanyLogo asset 용량 ${companyLogoValidation.localAssetBytes} bytes (SVG ${companyLogoValidation.svgAssetCount}개, PNG ${companyLogoValidation.pngAssetCount}개, WebP ${companyLogoValidation.webpAssetCount}개, JPG ${companyLogoValidation.jpgAssetCount}개, 최대 ${companyLogoValidation.largestAssetPath || '없음'} ${companyLogoValidation.largestAssetBytes} bytes)`);
console.log(`✓ CompanyLogo monogram fallback 검증 (기업 record ${companyLogoValidation.logoRecordCount}개, monogram ${companyLogoValidation.monogramFallbackCount}개, 표본 ${companyLogoValidation.sampleCount}개, ticker collision ${companyLogoValidation.duplicateTickerCollisionCount}개)`);
console.log(`✓ 현재 주차 ticker 가격 universe 포함 (${priceUniverseCount}개 target)`);
console.log(`✓ 오늘 시장 브리핑 검증 (brief ${dailyMarketValidation.briefCount}개, asset ${dailyMarketValidation.assetCount}개, driver ${dailyMarketValidation.driverCount}개, flow ${dailyMarketValidation.flowCount}개, step ${dailyMarketValidation.stepCount}개)`);
console.log(`✓ 오늘 시장 브리핑 source/route/company 참조 정상 (잘못된 source ${dailyMarketValidation.invalidRefCount}개)`);
console.log('✓ 오늘 시장 브리핑 fact/relationship/interpretation 구분 정상');
console.log('✓ 오늘 시장 브리핑 mock/자동 투자 신호/신규 provider 없음');
console.log('✓ 시장 방향 표기 helper 검증 (양수=상승, 음수=하락, 0=보합, 큰 원화·달러 가격 format)');
console.log(`✓ OpenDART 감시 기업 ${disclosureValidation.enabledCount}개 검증`);
console.log('✓ 중복 corpCode 없음');
console.log('✓ ticker/corpCode 연결 정상');
console.log('✓ 미국·placeholder ticker 제외');
console.log('✓ 공시 category 분류 정상');
console.log(`✓ SEC EDGAR 감시 기업 ${secDisclosureValidation.enabledCount}개 검증`);
console.log('✓ 중복 SEC ticker/CIK 없음');
console.log('✓ SEC form/CIK/URL helper 정상');
console.log(`✓ SEC 8-K/Form 4 구조화 parser 검증 (8-K Item ${secDetailValidation.eightKItemCount}개, 거래 코드 ${secDetailValidation.transactionCodeCount}개, fixture owner ${secDetailValidation.fixtureReportingOwners}명, 비파생 ${secDetailValidation.fixtureNonDerivativeTransactions}건, 파생 ${secDetailValidation.fixtureDerivativeTransactions}건, 각주 ${secDetailValidation.fixtureFootnotes}개)`);

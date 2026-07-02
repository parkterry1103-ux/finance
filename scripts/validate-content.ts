import {
  anchors,
  companies,
  currentWeeklyDigest,
  currentWeeklyPickOrder,
  currentWeeklyPicks,
  industryReports,
  marketMapEvidencePickIds,
  marketMovers,
  mockMarketPrices,
  pickRegistry,
  reconstructionInfrastructureMap,
  representativePick,
  semiconductorClusterInfrastructureMap,
  stockAutopsyPicks,
  weeklyPickCollections,
} from '../src/data.js';
import { stockAutopsyPickEntries } from '../src/content/picks/entries.js';
import {
  classifyDisclosure,
  dartTrackedCompanies,
  enabledDartTrackedCompanies,
} from '../src/content/disclosures/index.js';
import { contentSources, sourceRegistry } from '../src/content/sources/index.js';
import { inferCompanyListing, isPriceSyncTarget } from '../src/services/listing.js';

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

  const industryReportUrls = new Set(industryReports.map((report) => report.url));

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
    if (industryReportUrls.has(source.url)) addError(`industry report URL duplicated in source registry: ${source.id}`);
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
  const companyIds = new Set(companies.map((company) => company.id));
  const sectorIds = new Set([
    ...companies.map((company) => company.sectorId),
    reconstructionInfrastructureMap.sectorId,
    semiconductorClusterInfrastructureMap.sectorId,
    'datacenter-power-cooling',
  ]);

  industryReports.forEach((report) => {
    report.relatedPicks.forEach((pickId) => {
      if (!pickIds.has(pickId)) addError(`missing report related pick: ${report.id} / ${pickId}`);
    });
    report.relatedMaps.forEach((mapId) => {
      if (!sectorIds.has(mapId)) addError(`missing report related map: ${report.id} / ${mapId}`);
    });
    if (!isHttpUrl(report.url)) addError(`invalid report URL: ${report.id} / ${report.url}`);
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
  return targets.length;
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

validateSourceRegistry();
validatePickSources();
validatePicks();
validateWeeks();
validateReferences();
validateCtaPolicy();
const priceUniverseCount = validatePriceUniverse();
validateDisclosureRegistry();
validateDisclosureClassification();

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
console.log(`✓ 현재 주차 ticker 가격 universe 포함 (${priceUniverseCount}개 target)`);
console.log(`✓ OpenDART 감시 기업 ${disclosureValidation.enabledCount}개 검증`);
console.log('✓ 중복 corpCode 없음');
console.log('✓ ticker/corpCode 연결 정상');
console.log('✓ 미국·placeholder ticker 제외');
console.log('✓ 공시 category 분류 정상');

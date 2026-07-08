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
  classifySecFilingForm,
  dartTrackedCompanies,
  enabledDartTrackedCompanies,
  enabledSecTrackedCompanies,
  isSupportedSecFormPattern,
  secTrackedCompanies,
} from '../src/content/disclosures/index.js';
import { contentSources, sourceRegistry } from '../src/content/sources/index.js';
import { inferCompanyListing, isPriceSyncTarget } from '../src/services/listing.js';
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

validateSourceRegistry();
validatePickSources();
validatePicks();
validateWeeks();
validateReferences();
validateCtaPolicy();
validateCompanyIdentities();
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
console.log(`✓ 회사명 중심 identity 검증 (Pick ${identityValidation.pickIdentityCount}개, 회사 ${identityValidation.companyRegistryIdentityCount}개, 앵커 ${identityValidation.anchorIdentityCount}개, 지도 ${identityValidation.mapIdentityCount}개, 공시 ${identityValidation.disclosureIdentityCount}개, 시장 카드 ${identityValidation.marketMoverIdentityCount}개)`);
console.log('✓ ticker-only companyName 없음');
console.log(`✓ 현재 주차 ticker 가격 universe 포함 (${priceUniverseCount}개 target)`);
console.log(`✓ OpenDART 감시 기업 ${disclosureValidation.enabledCount}개 검증`);
console.log('✓ 중복 corpCode 없음');
console.log('✓ ticker/corpCode 연결 정상');
console.log('✓ 미국·placeholder ticker 제외');
console.log('✓ 공시 category 분류 정상');
console.log(`✓ SEC EDGAR 감시 기업 ${secDisclosureValidation.enabledCount}개 검증`);
console.log('✓ 중복 SEC ticker/CIK 없음');
console.log('✓ SEC form/CIK/URL helper 정상');
console.log(`✓ SEC 8-K/Form 4 구조화 parser 검증 (8-K Item ${secDetailValidation.eightKItemCount}개, 거래 코드 ${secDetailValidation.transactionCodeCount}개, fixture owner ${secDetailValidation.fixtureReportingOwners}명, 비파생 ${secDetailValidation.fixtureNonDerivativeTransactions}건, 파생 ${secDetailValidation.fixtureDerivativeTransactions}건, 각주 ${secDetailValidation.fixtureFootnotes}개)`);

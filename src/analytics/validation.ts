import { analyticsEventNames, type AnalyticsAttribution, type AnalyticsEventName, type AnalyticsEventPayload } from './types.js';

const payloadKeys = new Set([
  'schemaVersion', 'locale', 'pageType', 'routeTemplate', 'attribution', 'contentType', 'contentId', 'companySlug',
  'placement', 'destinationType', 'depthPercent', 'sourceType', 'sourceOrder', 'groupId', 'compareMode', 'metricId', 'resultPosition',
]);
const attributionKeys = new Set(['source', 'medium', 'campaign', 'content', 'referrerCategory', 'landingRoute']);
const forbiddenKeyPattern = /(query|search_term|email|user|account|url|referrer$|wacc|growth|price|amount|value|ticker)/i;
const eventPropertyKeys: Record<AnalyticsEventName, string[]> = {
  research_landing_view: ['contentType', 'companySlug'],
  editorial_view: ['contentType', 'contentId'],
  editorial_read_depth: ['contentType', 'contentId', 'depthPercent'],
  editorial_complete: ['contentType', 'contentId'],
  editorial_source_open: ['contentType', 'contentId', 'sourceType', 'sourceOrder', 'placement'],
  editorial_company_click: ['contentType', 'contentId', 'companySlug', 'placement', 'destinationType'],
  related_research_click: ['contentType', 'contentId', 'companySlug', 'placement', 'destinationType'],
  company_view: ['companySlug'],
  company_financials_click: ['companySlug', 'placement', 'destinationType'],
  financials_view: ['companySlug'],
  financial_group_select: ['companySlug', 'groupId', 'placement'],
  financial_compare_mode_select: ['companySlug', 'compareMode', 'placement'],
  financial_metric_expand: ['companySlug', 'groupId', 'metricId', 'placement'],
  company_valuation_click: ['companySlug', 'placement', 'destinationType'],
  valuation_view: ['companySlug'],
  valuation_assumptions_open: ['companySlug', 'placement'],
  valuation_sensitivity_open: ['companySlug', 'placement'],
  company_report_click: ['companySlug', 'placement', 'destinationType'],
  research_report_view: ['companySlug'],
  company_search_select: ['companySlug', 'placement', 'destinationType', 'resultPosition'],
  macro_dashboard_view: [],
};
const commonPayloadKeys = new Set(['schemaVersion', 'locale', 'pageType', 'routeTemplate', 'attribution', 'contentType']);
const pageTypes = new Set(['home', 'insights_index', 'stock_dissection', 'wall_street_edition', 'company', 'financials', 'valuation', 'research_report', 'macro', 'other']);
const contentTypes = new Set(['stock_dissection', 'wall_street_edition', 'company_brief', 'financial_pivot', 'valuation', 'research_report']);
const placements = new Set(['home', 'insights_index', 'editorial_header', 'editorial_body', 'editorial_footer', 'company_brief', 'financial_pivot', 'valuation', 'report', 'search', 'related_research']);
const destinationTypes = new Set(['editorial', 'company', 'financials', 'valuation', 'report', 'source', 'macro']);
const companyEvents = new Set<AnalyticsEventName>([
  'company_view', 'company_financials_click', 'financials_view', 'financial_group_select',
  'financial_compare_mode_select', 'financial_metric_expand', 'company_valuation_click',
  'valuation_view', 'valuation_assumptions_open', 'valuation_sensitivity_open',
  'company_report_click', 'research_report_view', 'company_search_select',
]);
const contentEvents = new Set<AnalyticsEventName>([
  'editorial_view', 'editorial_read_depth', 'editorial_complete', 'editorial_source_open', 'related_research_click',
]);

function flatPrimitive(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === undefined;
}

function validateAttribution(attribution: AnalyticsAttribution) {
  for (const [key, value] of Object.entries(attribution)) {
    if (!attributionKeys.has(key)) throw new Error(`analytics attribution key not allowed: ${key}`);
    if (!flatPrimitive(value)) throw new Error(`analytics attribution value must be primitive: ${key}`);
    if (typeof value === 'string' && value.length > 120) throw new Error(`analytics attribution value too long: ${key}`);
  }
  if (attribution.landingRoute.includes('?') || attribution.landingRoute.includes('#')) throw new Error('analytics landingRoute must not include query or hash');
}

export function validateAnalyticsEvent(name: AnalyticsEventName, payload: AnalyticsEventPayload) {
  if (!analyticsEventNames.includes(name)) throw new Error(`unknown analytics event: ${name}`);
  if (payload.schemaVersion !== 1 || payload.locale !== 'ko') throw new Error('analytics schema version or locale is invalid');
  if (!pageTypes.has(payload.pageType)) throw new Error('analytics pageType is invalid');
  if (payload.contentType && !contentTypes.has(payload.contentType)) throw new Error('analytics contentType is invalid');
  if (payload.placement && !placements.has(payload.placement)) throw new Error('analytics placement is invalid');
  if (payload.destinationType && !destinationTypes.has(payload.destinationType)) throw new Error('analytics destinationType is invalid');
  if (!payload.routeTemplate.startsWith('/') || payload.routeTemplate.includes('?') || payload.routeTemplate.includes('#')) {
    throw new Error('analytics routeTemplate must be a query-free route');
  }
  const eventKeys = new Set(eventPropertyKeys[name]);
  for (const [key, value] of Object.entries(payload)) {
    if (!payloadKeys.has(key) || forbiddenKeyPattern.test(key)) throw new Error(`analytics payload key not allowed: ${key}`);
    if (!commonPayloadKeys.has(key) && !eventKeys.has(key)) throw new Error(`analytics payload key not allowed for ${name}: ${key}`);
    if (key === 'attribution' && value) validateAttribution(value as AnalyticsAttribution);
    else if (!flatPrimitive(value)) throw new Error(`analytics payload value must be primitive: ${key}`);
    if (typeof value === 'number' && !Number.isFinite(value)) throw new Error(`analytics payload number must be finite: ${key}`);
    if (typeof value === 'string' && value.length > 160) throw new Error(`analytics payload value too long: ${key}`);
  }
  if (name === 'editorial_read_depth' && ![25, 50, 75, 90].includes(payload.depthPercent ?? 0)) {
    throw new Error('editorial_read_depth requires a supported depthPercent');
  }
  if (name === 'editorial_source_open' && (!payload.sourceType || !payload.sourceOrder)) {
    throw new Error('editorial_source_open requires sourceType and sourceOrder');
  }
  if (companyEvents.has(name) && !payload.companySlug) throw new Error(`${name} requires companySlug`);
  if (contentEvents.has(name) && (!payload.contentId || !payload.contentType)) throw new Error(`${name} requires contentId and contentType`);
  if (payload.sourceOrder !== undefined && (!Number.isInteger(payload.sourceOrder) || payload.sourceOrder < 1 || payload.sourceOrder > 100)) throw new Error('analytics sourceOrder must be an integer from 1 to 100');
  if (payload.companySlug && !/^[a-z0-9-]+$/.test(payload.companySlug)) throw new Error('analytics companySlug is invalid');
  if (payload.sourceType && !/^[a-z][a-zA-Z0-9_-]*$/.test(payload.sourceType)) throw new Error('analytics sourceType is invalid');
  if (payload.groupId && !['growth', 'profitability', 'cashFlow', 'capitalEfficiency', 'balanceSheet', 'perShare'].includes(payload.groupId)) throw new Error('analytics groupId is invalid');
  if (payload.compareMode && !['history', 'peer', 'industry'].includes(payload.compareMode)) throw new Error('analytics compareMode is invalid');
  if (payload.metricId && !/^[a-z][a-zA-Z0-9_-]*$/.test(payload.metricId)) throw new Error('analytics metricId is invalid');
  if (payload.resultPosition !== undefined && (!Number.isInteger(payload.resultPosition) || payload.resultPosition < 1 || payload.resultPosition > 100)) throw new Error('analytics resultPosition must be an integer from 1 to 100');
  if (name === 'company_search_select' && !payload.resultPosition) throw new Error('company_search_select requires resultPosition');
  if (name === 'financial_metric_expand' && !payload.metricId) throw new Error('financial_metric_expand requires metricId');
  return payload;
}

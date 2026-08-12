export const analyticsEventNames = [
  'research_landing_view',
  'editorial_view',
  'editorial_read_depth',
  'editorial_complete',
  'editorial_source_open',
  'editorial_company_click',
  'related_research_click',
  'company_view',
  'company_financials_click',
  'financials_view',
  'financial_group_select',
  'financial_compare_mode_select',
  'financial_metric_expand',
  'company_valuation_click',
  'valuation_view',
  'valuation_assumptions_open',
  'valuation_sensitivity_open',
  'company_report_click',
  'research_report_view',
  'company_search_select',
  'macro_dashboard_view',
] as const;

export type AnalyticsEventName = typeof analyticsEventNames[number];

export type AnalyticsPageType =
  | 'home'
  | 'insights_index'
  | 'stock_dissection'
  | 'wall_street_edition'
  | 'investment_case'
  | 'company'
  | 'financials'
  | 'valuation'
  | 'research_report'
  | 'macro'
  | 'other';

export type AnalyticsContentType =
  | 'stock_dissection'
  | 'wall_street_edition'
  | 'investment_case'
  | 'company_brief'
  | 'financial_pivot'
  | 'valuation'
  | 'research_report';
export type AnalyticsPlacement =
  | 'home'
  | 'insights_index'
  | 'editorial_header'
  | 'editorial_body'
  | 'editorial_footer'
  | 'company_brief'
  | 'financial_pivot'
  | 'valuation'
  | 'report'
  | 'search'
  | 'related_research';
export type AnalyticsDestinationType = 'editorial' | 'company' | 'financials' | 'valuation' | 'report' | 'source' | 'macro';
export type AnalyticsReferrerCategory = 'instagram' | 'search' | 'social' | 'direct' | 'internal' | 'other';

export type AnalyticsAttribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  referrerCategory: AnalyticsReferrerCategory;
  landingRoute: string;
};

export type AnalyticsRoute = {
  pageType: AnalyticsPageType;
  routeTemplate: string;
  normalizedPath: string;
  companySlug?: string;
  contentType?: AnalyticsContentType;
  contentSlug?: string;
};

export type AnalyticsEventProperties = {
  contentType?: AnalyticsContentType;
  contentId?: string;
  companySlug?: string;
  placement?: AnalyticsPlacement;
  destinationType?: AnalyticsDestinationType;
  depthPercent?: 25 | 50 | 75 | 90;
  sourceType?: string;
  sourceOrder?: number;
  groupId?: string;
  compareMode?: string;
  metricId?: string;
  resultPosition?: number;
};

export type AnalyticsEventPayload = AnalyticsEventProperties & {
  schemaVersion: 1;
  locale: 'ko';
  pageType: AnalyticsPageType;
  routeTemplate: string;
  attribution?: AnalyticsAttribution;
};

export type AnalyticsPageView = {
  routeTemplate: string;
  normalizedPath: string;
  pageType: AnalyticsPageType;
};

export type AnalyticsProvider = {
  name: string;
  supportsCustomEvents: boolean;
  pageview: (view: AnalyticsPageView) => void;
  event: (name: AnalyticsEventName, payload: AnalyticsEventPayload) => void;
};

export type AnalyticsDebugRecord =
  | { kind: 'pageview'; view: AnalyticsPageView }
  | { kind: 'event'; name: AnalyticsEventName; payload: AnalyticsEventPayload };

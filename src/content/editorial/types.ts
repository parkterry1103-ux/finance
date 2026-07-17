export type EditorialStatus = 'draft' | 'verified' | 'published' | 'archived';

export type EditorialSource = {
  id: string;
  name: string;
  url: string;
  publishedAt: string;
  accessedAt: string;
};

export type ThreeReadsItem = {
  id: string;
  order: 1 | 2 | 3;
  headline: string;
  source: Omit<EditorialSource, 'id'>;
  relatedCompanies: string[];
  relatedCompanySlugs: string[];
  relatedIndustries: string[];
  whatHappened: string;
  whyItMatters: string;
  structuralMeaning: string;
  investorCaution?: string;
  watchItems?: string[];
};

export type ThreeReadsEdition = {
  id: string;
  slug: string;
  status: EditorialStatus;
  publishedAt: string;
  updatedAt?: string;
  contentAsOf: string;
  title: string;
  centralQuestion: string;
  introduction?: string;
  reads: [ThreeReadsItem, ThreeReadsItem, ThreeReadsItem];
  commonThread: string;
  investorQuestions: string[];
  oneLineTakeaway: string;
  relatedCompanySlugs: string[];
  relatedIndustries: string[];
  relatedStockDissectionIds: string[];
  disclaimer: string;
};

export type ComparableReturn = {
  name: string;
  value: number;
  asOf: string;
  sourceId: string;
};

export type DailyStockDissection = {
  id: string;
  slug: string;
  status: EditorialStatus;
  publishedAt: string;
  updatedAt?: string;
  eventAsOf: string;
  priceAsOf: string;
  company: {
    name: string;
    ticker?: string;
    companySlug?: string;
  };
  headline: string;
  priceMove: {
    value: number;
    unit: 'percent';
    periodLabel: string;
    sourceId: string;
  };
  directCatalyst: string;
  marketInterpretation: string;
  moveCharacter:
    | 'earnings'
    | 'guidance'
    | 'controlPremium'
    | 'growthExpectation'
    | 'moatExpectation'
    | 'optionality'
    | 'regulation'
    | 'macro'
    | 'marketWide'
    | 'liquidity'
    | 'mixed';
  confirmedItems: string[];
  unconfirmedItems: string[];
  reasons: Array<{ title: string; explanation: string }>;
  comparison?: {
    market?: ComparableReturn;
    sector?: ComparableReturn;
  };
  marketWideFactors: string[];
  companySpecificFactors: string[];
  thesisImpact: 'maintain' | 'partiallyRevise' | 'reassess' | 'notApplicable';
  watchItems: string[];
  relatedThreeReadsIds: string[];
  sourceIds: string[];
  disclaimer: string;
};

export type StockDissectionSummary = Pick<
  DailyStockDissection,
  'id' | 'slug' | 'status' | 'publishedAt' | 'eventAsOf' | 'priceAsOf' | 'company' | 'headline' | 'priceMove' | 'directCatalyst' | 'moveCharacter' | 'confirmedItems' | 'unconfirmedItems' | 'watchItems' | 'comparison'
> & { kind: 'stock' };

export type ThreeReadsSummary = Pick<
  ThreeReadsEdition,
  'id' | 'slug' | 'status' | 'publishedAt' | 'contentAsOf' | 'title' | 'centralQuestion' | 'commonThread' | 'oneLineTakeaway' | 'relatedCompanySlugs'
> & {
  kind: 'threeReads';
  readHeadlines: [string, string, string];
};

export type EditorialSummary = StockDissectionSummary | ThreeReadsSummary;

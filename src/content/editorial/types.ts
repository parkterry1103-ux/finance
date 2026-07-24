export type EditorialStatus = 'draft' | 'verified' | 'published' | 'archived';

export type EditorialVerification = {
  authoredBy: 'owner';
  verifiedBy: 'owner';
  verifiedAt: string;
  status: 'ownerVerified';
  note?: string;
};

export type EditorialEvidence = {
  id: string;
  type: 'price' | 'news' | 'company' | 'filing' | 'regulatory' | 'market' | 'sector' | 'flow';
  factStatus: 'official' | 'mediaReported' | 'marketData' | 'editorialInterpretation';
  publisher?: string;
  title?: string;
  publishedAt?: string;
  asOf?: string;
  url?: string;
  note?: string;
};

export type EditorialSource = {
  id: string;
  name: string;
  url: string;
  publishedAt: string;
  accessedAt: string;
};

export type EditorialArticleSource = {
  name: string;
  url?: string;
  articleIdentifier?: string;
  publishedAt: string;
  updatedAt?: string;
  accessedAt: string;
};

export type EditorialAnalyticsMetadata = {
  content_id: string;
  campaign_id: string;
  recommended_utm: {
    source: string;
    medium: string;
    campaign: string;
    content: string;
  };
};

export type ThreeReadsItem = {
  id: string;
  order: 1 | 2 | 3;
  headline: string;
  source: EditorialArticleSource;
  relatedCompanies: string[];
  relatedCompanySlugs: string[];
  relatedIndustries: string[];
  whatHappened: string;
  whyItMatters: string;
  structuralMeaning: string;
  confirmedFacts?: string[];
  companyOrInstitutionOutlook?: string[];
  keyNumbers?: string[];
  marketReaction?: string;
  priceBasis?: string;
  currentStage?: string;
  correctedWording?: string[];
  interpretation?: string;
  notYetFinal?: string[];
  cashFlowTransmission?: string;
  counterScenario?: string;
  officialSources?: EditorialSource[];
  factCheckStatus?: 'checked' | 'partiallyChecked';
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
  verification?: EditorialVerification;
  authoringTime?: string;
  factCheckedAt?: string;
  independentDisclosure?: string;
  methodology?: {
    newsWindow: string;
    duplicateCheck: string;
    candidateSelection: string;
    factCheckSummary: string[];
    correctedExpressions: string[];
    notYetFinal: string[];
    priceBasis: string[];
  };
  reads: [ThreeReadsItem, ThreeReadsItem, ThreeReadsItem];
  commonThread: string;
  cashFlowTransmission?: string[];
  investorQuestions: string[];
  oneLineTakeaway: string;
  relatedCompanySlugs: string[];
  relatedIndustries: string[];
  relatedStockDissectionIds: string[];
  disclaimer: string;
  analytics?: EditorialAnalyticsMetadata;
};

export type ComparableReturn = {
  name: string;
  value: number;
  asOf: string;
  sourceId: string;
  precision?: number;
};

export type StockDissectionIntake = {
  contentType: 'stock_dissection';
  status: 'owner_verified';
  session: 'regular' | 'preMarket' | 'afterHours';
  researchSourceFile: string;
  detailSourceFile: string;
  handoffSourceFile: string;
  keyFiguresConsistent: true;
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
    precision?: number;
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
  cardCharacter?: string;
  confirmedItems: string[];
  unconfirmedItems: string[];
  reasons: Array<{ title: string; explanation: string }>;
  verification?: EditorialVerification;
  evidence?: EditorialEvidence[];
  intake?: StockDissectionIntake;
  fullArticle?: string[];
  editorialConclusion?: string;
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
  analytics?: EditorialAnalyticsMetadata;
};

export type StockDissectionSummary = Pick<
  DailyStockDissection,
  'id' | 'slug' | 'status' | 'publishedAt' | 'eventAsOf' | 'priceAsOf' | 'company' | 'headline' | 'priceMove' | 'directCatalyst' | 'moveCharacter' | 'cardCharacter' | 'confirmedItems' | 'unconfirmedItems' | 'watchItems' | 'comparison'
> & { kind: 'stock' };

export type ThreeReadsSummary = Pick<
  ThreeReadsEdition,
  'id' | 'slug' | 'status' | 'publishedAt' | 'contentAsOf' | 'title' | 'centralQuestion' | 'commonThread' | 'oneLineTakeaway' | 'relatedCompanySlugs'
> & {
  kind: 'threeReads';
  readHeadlines: [string, string, string];
  readSummaries: [string, string, string];
};

export type EditorialSummary = StockDissectionSummary | ThreeReadsSummary;

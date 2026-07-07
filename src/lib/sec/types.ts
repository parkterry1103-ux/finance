export const SEC_FILING_DETAIL_PARSER_VERSION = 'sec-structured-v1';

export type SecFilingParsingStatus =
  | 'pending'
  | 'parsed'
  | 'not-applicable'
  | 'source-unavailable'
  | 'parse-error';

export type EightKItemDetail = {
  item: string;
  labelEn: string;
  labelKo: string;
  category: string;
  source: 'sec-submissions';
};

export type SecReportingOwner = {
  name: string | null;
  cik: string | null;
  isDirector: boolean;
  isOfficer: boolean;
  isTenPercentOwner: boolean;
  isOther: boolean;
  officerTitle: string | null;
  otherText: string | null;
};

export type SecFootnote = {
  id: string;
  text: string;
};

export type SecFilingTransactionCategory =
  | 'open-market-purchase'
  | 'open-market-sale'
  | 'award'
  | 'tax-withholding'
  | 'gift'
  | 'option-exercise'
  | 'derivative'
  | 'other';

export type SecTransactionCodeDefinition = {
  code: string;
  labelEn: string;
  labelKo: string;
  category: SecFilingTransactionCategory;
};

export type SecDerivativeTransaction = {
  securityTitle: string | null;
  conversionOrExercisePrice: number | null;
  transactionDate: string | null;
  transactionCode: string | null;
  transactionCodeLabelKo: string | null;
  transactionCategory: SecFilingTransactionCategory | null;
  transactionShares: number | null;
  transactionPricePerShare: number | null;
  acquiredDisposedCode: string | null;
  exerciseDate: string | null;
  expirationDate: string | null;
  underlyingSecurityTitle: string | null;
  underlyingSecurityShares: number | null;
  sharesOwnedFollowingTransaction: number | null;
  directOrIndirectOwnership: string | null;
  ownershipLabelKo: string | null;
  natureOfOwnership: string | null;
  footnoteIds: string[];
};

export type SecNonDerivativeTransaction = {
  securityTitle: string | null;
  transactionDate: string | null;
  deemedExecutionDate: string | null;
  transactionFormType: string | null;
  transactionCode: string | null;
  transactionCodeLabelKo: string | null;
  transactionCategory: SecFilingTransactionCategory | null;
  equitySwapInvolved: boolean;
  shares: number | null;
  pricePerShare: number | null;
  acquiredDisposedCode: string | null;
  acquiredDisposedLabelKo: string | null;
  sharesOwnedFollowingTransaction: number | null;
  directOrIndirectOwnership: string | null;
  ownershipLabelKo: string | null;
  natureOfOwnership: string | null;
  footnoteIds: string[];
  estimatedTransactionValue: number | null;
};

export type SecFilingDetail = {
  accessionNumber: string;
  formType: string;
  parserVersion: string;
  parsingStatus: SecFilingParsingStatus;
  eightKItems: EightKItemDetail[];
  reportingOwners: SecReportingOwner[];
  nonDerivativeTransactions: SecNonDerivativeTransaction[];
  derivativeTransactions: SecDerivativeTransaction[];
  footnotes: SecFootnote[];
  footnoteCount: number;
  sourceDocumentUrl: string | null;
  parsedAt: string | null;
  parseError: string | null;
};

import {
  acquiredDisposedLabelKo,
  normalizeTransactionCode,
  ownershipLabelKo,
  transactionCategoryForCode,
  transactionLabelKo,
} from './transactionCodes.js';
import type {
  SecDerivativeTransaction,
  SecFootnote,
  SecNonDerivativeTransaction,
  SecReportingOwner,
} from './types.js';
import { childrenByName, collectFootnoteIds, firstChild, parseXml, textAt, valueAt } from './xml.js';

function normalizeText(value: string | null | undefined) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text || null;
}

function parseBoolean(value: string | null | undefined) {
  const normalized = String(value ?? '').trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

export function parseSecNumber(value: string | number | null | undefined) {
  const text = String(value ?? '').replace(/,/g, '').trim();
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDate(value: string | null | undefined) {
  const text = normalizeText(value);
  return text && /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : text;
}

function fieldValue(node: ReturnType<typeof firstChild>, path: string[]) {
  return valueAt(node, path) ?? textAt(node, path);
}

function codeFields(code: string | null) {
  const normalized = normalizeTransactionCode(code);
  return {
    transactionCode: normalized || null,
    transactionCodeLabelKo: transactionLabelKo(normalized),
    transactionCategory: transactionCategoryForCode(normalized),
  };
}

function parseReportingOwner(ownerNode: ReturnType<typeof firstChild>): SecReportingOwner {
  const relationship = firstChild(ownerNode, 'reportingOwnerRelationship');
  return {
    name: normalizeText(fieldValue(ownerNode, ['reportingOwnerId', 'rptOwnerName'])),
    cik: normalizeText(fieldValue(ownerNode, ['reportingOwnerId', 'rptOwnerCik'])),
    isDirector: parseBoolean(fieldValue(relationship, ['isDirector'])),
    isOfficer: parseBoolean(fieldValue(relationship, ['isOfficer'])),
    isTenPercentOwner: parseBoolean(fieldValue(relationship, ['isTenPercentOwner'])),
    isOther: parseBoolean(fieldValue(relationship, ['isOther'])),
    officerTitle: normalizeText(fieldValue(relationship, ['officerTitle'])),
    otherText: normalizeText(fieldValue(relationship, ['otherText'])),
  };
}

function parseNonDerivativeTransaction(transactionNode: ReturnType<typeof firstChild>): SecNonDerivativeTransaction {
  const transactionCode = normalizeText(fieldValue(transactionNode, ['transactionCoding', 'transactionCode']));
  const shares = parseSecNumber(fieldValue(transactionNode, ['transactionAmounts', 'transactionShares']));
  const pricePerShare = parseSecNumber(fieldValue(transactionNode, ['transactionAmounts', 'transactionPricePerShare']));
  const directOrIndirectOwnership = normalizeText(fieldValue(transactionNode, ['ownershipNature', 'directOrIndirectOwnership']));
  const acquiredDisposedCode = normalizeText(fieldValue(transactionNode, ['transactionAmounts', 'transactionAcquiredDisposedCode']));

  return {
    securityTitle: normalizeText(fieldValue(transactionNode, ['securityTitle'])),
    transactionDate: normalizeDate(fieldValue(transactionNode, ['transactionDate'])),
    deemedExecutionDate: normalizeDate(fieldValue(transactionNode, ['deemedExecutionDate'])),
    transactionFormType: normalizeText(fieldValue(transactionNode, ['transactionCoding', 'transactionFormType'])),
    ...codeFields(transactionCode),
    equitySwapInvolved: parseBoolean(fieldValue(transactionNode, ['transactionCoding', 'equitySwapInvolved'])),
    shares,
    pricePerShare,
    acquiredDisposedCode,
    acquiredDisposedLabelKo: acquiredDisposedLabelKo(acquiredDisposedCode),
    sharesOwnedFollowingTransaction: parseSecNumber(fieldValue(transactionNode, ['postTransactionAmounts', 'sharesOwnedFollowingTransaction'])),
    directOrIndirectOwnership,
    ownershipLabelKo: ownershipLabelKo(directOrIndirectOwnership),
    natureOfOwnership: normalizeText(fieldValue(transactionNode, ['ownershipNature', 'natureOfOwnership'])),
    footnoteIds: collectFootnoteIds(transactionNode),
    estimatedTransactionValue: shares !== null && pricePerShare !== null ? shares * pricePerShare : null,
  };
}

function parseDerivativeTransaction(transactionNode: ReturnType<typeof firstChild>): SecDerivativeTransaction {
  const transactionCode = normalizeText(fieldValue(transactionNode, ['transactionCoding', 'transactionCode']));
  const directOrIndirectOwnership = normalizeText(fieldValue(transactionNode, ['ownershipNature', 'directOrIndirectOwnership']));
  return {
    securityTitle: normalizeText(fieldValue(transactionNode, ['securityTitle'])),
    conversionOrExercisePrice: parseSecNumber(fieldValue(transactionNode, ['conversionOrExercisePrice'])),
    transactionDate: normalizeDate(fieldValue(transactionNode, ['transactionDate'])),
    ...codeFields(transactionCode),
    transactionShares: parseSecNumber(fieldValue(transactionNode, ['transactionAmounts', 'transactionShares'])),
    transactionPricePerShare: parseSecNumber(fieldValue(transactionNode, ['transactionAmounts', 'transactionPricePerShare'])),
    acquiredDisposedCode: normalizeText(fieldValue(transactionNode, ['transactionAmounts', 'transactionAcquiredDisposedCode'])),
    exerciseDate: normalizeDate(fieldValue(transactionNode, ['exerciseDate'])),
    expirationDate: normalizeDate(fieldValue(transactionNode, ['expirationDate'])),
    underlyingSecurityTitle: normalizeText(fieldValue(transactionNode, ['underlyingSecurity', 'underlyingSecurityTitle'])),
    underlyingSecurityShares: parseSecNumber(fieldValue(transactionNode, ['underlyingSecurity', 'underlyingSecurityShares'])),
    sharesOwnedFollowingTransaction: parseSecNumber(fieldValue(transactionNode, ['postTransactionAmounts', 'sharesOwnedFollowingTransaction'])),
    directOrIndirectOwnership,
    ownershipLabelKo: ownershipLabelKo(directOrIndirectOwnership),
    natureOfOwnership: normalizeText(fieldValue(transactionNode, ['ownershipNature', 'natureOfOwnership'])),
    footnoteIds: collectFootnoteIds(transactionNode),
  };
}

function parseFootnotes(documentNode: ReturnType<typeof firstChild>): SecFootnote[] {
  return childrenByName(firstChild(documentNode, 'footnotes'), 'footnote')
    .map((footnoteNode) => ({
      id: footnoteNode.attributes.id ?? '',
      text: normalizeText(textAt(footnoteNode, [])) ?? '',
    }))
    .filter((footnote) => footnote.id)
    .map((footnote) => ({
      ...footnote,
      text: footnote.text.length > 1000 ? `${footnote.text.slice(0, 1000)}...` : footnote.text,
    }));
}

export function parseForm4OwnershipXml(xml: string) {
  const root = parseXml(xml);
  const documentNode = firstChild(root, 'ownershipDocument') ?? firstChild(firstChild(root, 'edgarSubmission'), 'ownershipDocument');
  if (!documentNode) throw new Error('OWNERSHIP_DOCUMENT_MISSING');

  const reportingOwners = childrenByName(documentNode, 'reportingOwner').map(parseReportingOwner);
  const nonDerivativeTransactions = childrenByName(firstChild(documentNode, 'nonDerivativeTable'), 'nonDerivativeTransaction')
    .map(parseNonDerivativeTransaction);
  const derivativeTransactions = childrenByName(firstChild(documentNode, 'derivativeTable'), 'derivativeTransaction')
    .map(parseDerivativeTransaction);
  const footnotes = parseFootnotes(documentNode);

  return {
    reportingOwners,
    nonDerivativeTransactions,
    derivativeTransactions,
    footnotes,
    footnoteCount: footnotes.length,
  };
}

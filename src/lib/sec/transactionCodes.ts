import type { SecFilingTransactionCategory, SecTransactionCodeDefinition } from './types.js';

export const secTransactionCodeDefinitions: SecTransactionCodeDefinition[] = [
  { code: 'P', labelEn: 'Open market or private purchase of non-derivative or derivative security', labelKo: '공개시장 또는 사적 매수', category: 'open-market-purchase' },
  { code: 'S', labelEn: 'Open market or private sale of non-derivative or derivative security', labelKo: '공개시장 또는 사적 매도', category: 'open-market-sale' },
  { code: 'V', labelEn: 'Transaction voluntarily reported earlier than required', labelKo: '기한 전 자발적 보고 거래', category: 'other' },
  { code: 'A', labelEn: 'Grant, award or other acquisition pursuant to Rule 16b-3(d)', labelKo: '보상·계획에 따른 취득', category: 'award' },
  { code: 'D', labelEn: 'Disposition to the issuer of issuer equity securities pursuant to Rule 16b-3(e)', labelKo: '발행사에 대한 처분', category: 'other' },
  { code: 'F', labelEn: 'Payment of exercise price or tax liability by delivering or withholding securities', labelKo: '세금·행사가격 납부 목적 처분', category: 'tax-withholding' },
  { code: 'I', labelEn: 'Discretionary transaction in accordance with Rule 16b-3(f)', labelKo: '재량 거래', category: 'other' },
  { code: 'M', labelEn: 'Exercise or conversion of derivative security exempted pursuant to Rule 16b-3', labelKo: '파생상품 행사 또는 전환', category: 'option-exercise' },
  { code: 'C', labelEn: 'Conversion of derivative security', labelKo: '파생상품 전환', category: 'derivative' },
  { code: 'E', labelEn: 'Expiration of short derivative position', labelKo: '숏 파생상품 포지션 만료', category: 'derivative' },
  { code: 'H', labelEn: 'Expiration or cancellation of long derivative position with value received', labelKo: '롱 파생상품 포지션 만료 또는 취소', category: 'derivative' },
  { code: 'O', labelEn: 'Exercise of out-of-the-money derivative security', labelKo: '외가격 파생상품 행사', category: 'derivative' },
  { code: 'X', labelEn: 'Exercise of in-the-money or at-the-money derivative security', labelKo: '내가격 또는 등가격 파생상품 행사', category: 'derivative' },
  { code: 'G', labelEn: 'Bona fide gift', labelKo: '증여', category: 'gift' },
  { code: 'L', labelEn: 'Small acquisition under Rule 16a-6', labelKo: '소규모 취득', category: 'other' },
  { code: 'W', labelEn: 'Acquisition or disposition by will or the laws of descent and distribution', labelKo: '상속·유언에 따른 취득 또는 처분', category: 'other' },
  { code: 'Z', labelEn: 'Deposit into or withdrawal from voting trust', labelKo: '의결권 신탁 예치 또는 인출', category: 'other' },
  { code: 'J', labelEn: 'Other acquisition or disposition', labelKo: '기타 취득 또는 처분', category: 'other' },
  { code: 'K', labelEn: 'Transaction in equity swap or instrument with similar characteristics', labelKo: '주식스왑 또는 유사 상품 거래', category: 'derivative' },
  { code: 'U', labelEn: 'Disposition pursuant to a tender of shares in a change of control transaction', labelKo: '지배권 변경 공개매수에 따른 처분', category: 'other' },
];

export const secTransactionCodeDefinitionByCode = new Map(secTransactionCodeDefinitions.map((definition) => [definition.code, definition]));

export const secPrimaryTransactionCodes = ['P', 'S', 'A', 'F', 'G', 'M'] as const;

export function normalizeTransactionCode(value?: string | null) {
  return String(value ?? '').trim().toUpperCase();
}

export function isSupportedTransactionCode(value: string) {
  return secTransactionCodeDefinitionByCode.has(normalizeTransactionCode(value));
}

export function transactionCategoryForCode(value?: string | null): SecFilingTransactionCategory | null {
  return secTransactionCodeDefinitionByCode.get(normalizeTransactionCode(value))?.category ?? null;
}

export function transactionLabelKo(value?: string | null) {
  return secTransactionCodeDefinitionByCode.get(normalizeTransactionCode(value))?.labelKo ?? null;
}

export function ownershipLabelKo(value?: string | null) {
  const normalized = String(value ?? '').trim().toUpperCase();
  if (normalized === 'D') return '직접 보유';
  if (normalized === 'I') return '간접 보유';
  return null;
}

export function acquiredDisposedLabelKo(value?: string | null) {
  const normalized = String(value ?? '').trim().toUpperCase();
  if (normalized === 'A') return '취득';
  if (normalized === 'D') return '처분';
  return null;
}

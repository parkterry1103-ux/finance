import type { SecFilingCategory } from './types.js';

export const secFilingCategoryLabels: Record<SecFilingCategory, string> = {
  'current-report': '주요 이벤트',
  'quarterly-report': '분기보고서',
  'annual-report': '연차보고서',
  'insider-transaction': '내부자 거래',
  ownership: '지분 변동',
  proxy: '주주총회·위임장',
  'capital-markets': '자본시장',
  'foreign-report': '해외 발행사 보고',
  other: '기타',
};

export const secFilingCategoryOrder: SecFilingCategory[] = [
  'current-report',
  'quarterly-report',
  'annual-report',
  'insider-transaction',
  'ownership',
  'proxy',
  'capital-markets',
  'foreign-report',
  'other',
];

export const secFilingCheckpoints: Record<SecFilingCategory, string> = {
  'current-report': 'Item 번호, 발표 내용, 실제 계약·재무 영향과 시행 시점을 원문에서 확인하세요.',
  'quarterly-report': '매출, 마진, 현금흐름, 재고와 다음 분기 가이던스 변화를 확인하세요.',
  'annual-report': '사업 설명, 리스크 요인, 감사 의견과 장기 재무 구조 변화를 확인하세요.',
  'insider-transaction': '거래 주체, 거래 성격, 수량과 사전 계획 거래 여부를 확인하세요.',
  ownership: '보고 주체, 보유 목적, 보유 비율과 직전 보고 대비 변화를 확인하세요.',
  proxy: '주총 안건, 보상 구조, 이사회 구성과 주주 승인 조건을 확인하세요.',
  'capital-markets': '발행 규모, 증권 종류, 희석 가능성, 자금 사용 목적을 확인하세요.',
  'foreign-report': '해외 발행사가 SEC에 제출한 업데이트인지, 본국 공시·회사 발표와 함께 확인하세요.',
  other: '공시 원문에서 form 유형과 핵심 변경 사항을 먼저 확인하세요.',
};

export const secDefaultForms = ['8-K', '10-Q', '10-K', '4'];

export const secSupportedFormPatterns = [
  '8-K',
  '10-Q',
  '10-K',
  '4',
  '3',
  '5',
  'SC 13D',
  'SC 13D/A',
  'SC 13G',
  'SC 13G/A',
  'DEF 14A',
  'S-1',
  'S-3',
  'S-3ASR',
  'S-4',
  '424B',
  '6-K',
  '20-F',
];

const normalizedSupportedForms = new Set(secSupportedFormPatterns.map(normalizeSecFormType));

export function normalizeSecFormType(formType?: string | null) {
  return String(formType ?? '').trim().replace(/\s+/g, ' ').toUpperCase();
}

export function isSupportedSecFormPattern(formType: string) {
  const normalized = normalizeSecFormType(formType);
  return normalizedSupportedForms.has(normalized);
}

export function matchesSecFormPattern(formType: string, pattern: string) {
  const normalizedForm = normalizeSecFormType(formType);
  const normalizedPattern = normalizeSecFormType(pattern);
  if (!normalizedForm || !normalizedPattern) return false;
  if (normalizedPattern === '424B') return normalizedForm.startsWith('424B');
  if (normalizedPattern === 'SC 13D') return normalizedForm === 'SC 13D' || normalizedForm === 'SC 13D/A';
  if (normalizedPattern === 'SC 13G') return normalizedForm === 'SC 13G' || normalizedForm === 'SC 13G/A';
  return normalizedForm === normalizedPattern || normalizedForm === `${normalizedPattern}/A`;
}

export function classifySecFilingForm(formType: string): SecFilingCategory {
  const normalized = normalizeSecFormType(formType);
  const base = normalized.endsWith('/A') ? normalized.slice(0, -2) : normalized;
  if (base === '8-K') return 'current-report';
  if (base === '10-Q') return 'quarterly-report';
  if (base === '10-K') return 'annual-report';
  if (base === '3' || base === '4' || base === '5') return 'insider-transaction';
  if (normalized === 'SC 13D' || normalized === 'SC 13D/A' || normalized === 'SC 13G' || normalized === 'SC 13G/A') {
    return 'ownership';
  }
  if (base === 'DEF 14A') return 'proxy';
  if (base === 'S-1' || base === 'S-3' || base === 'S-3ASR' || base === 'S-4' || normalized.startsWith('424B')) {
    return 'capital-markets';
  }
  if (base === '6-K' || base === '20-F') return 'foreign-report';
  return 'other';
}

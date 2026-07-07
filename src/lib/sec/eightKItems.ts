import type { EightKItemDetail } from './types.js';

export type EightKItemDefinition = {
  item: string;
  labelEn: string;
  labelKo: string;
  category: string;
};

export const eightKItemDefinitions: EightKItemDefinition[] = [
  { item: '1.01', labelEn: 'Entry into a Material Definitive Agreement', labelKo: '중요 계약 체결', category: 'business-and-operations' },
  { item: '1.02', labelEn: 'Termination of a Material Definitive Agreement', labelKo: '중요 계약 종료', category: 'business-and-operations' },
  { item: '1.03', labelEn: 'Bankruptcy or Receivership', labelKo: '파산 또는 관리절차', category: 'business-and-operations' },
  { item: '1.04', labelEn: 'Mine Safety - Reporting of Shutdowns and Patterns of Violations', labelKo: '광산 안전 관련 조치', category: 'business-and-operations' },
  { item: '1.05', labelEn: 'Material Cybersecurity Incidents', labelKo: '중요 사이버보안 사고', category: 'business-and-operations' },
  { item: '2.01', labelEn: 'Completion of Acquisition or Disposition of Assets', labelKo: '자산 인수 또는 처분 완료', category: 'financial-information' },
  { item: '2.02', labelEn: 'Results of Operations and Financial Condition', labelKo: '실적 및 재무상태', category: 'financial-information' },
  { item: '2.03', labelEn: 'Creation of a Direct Financial Obligation or an Obligation under an Off-Balance Sheet Arrangement of a Registrant', labelKo: '직접 금융의무 또는 부외약정 발생', category: 'financial-information' },
  { item: '2.04', labelEn: 'Triggering Events That Accelerate or Increase a Direct Financial Obligation or an Obligation under an Off-Balance Sheet Arrangement', labelKo: '금융의무 가속 또는 증가 사유 발생', category: 'financial-information' },
  { item: '2.05', labelEn: 'Costs Associated with Exit or Disposal Activities', labelKo: '철수 또는 처분 활동 관련 비용', category: 'financial-information' },
  { item: '2.06', labelEn: 'Material Impairments', labelKo: '중요 손상차손', category: 'financial-information' },
  { item: '3.01', labelEn: 'Notice of Delisting or Failure to Satisfy a Continued Listing Rule or Standard; Transfer of Listing', labelKo: '상장폐지 통지 또는 상장 기준 미충족', category: 'securities-and-trading' },
  { item: '3.02', labelEn: 'Unregistered Sales of Equity Securities', labelKo: '미등록 지분증권 판매', category: 'securities-and-trading' },
  { item: '3.03', labelEn: 'Material Modification to Rights of Security Holders', labelKo: '증권 보유자 권리의 중요 변경', category: 'securities-and-trading' },
  { item: '4.01', labelEn: "Changes in Registrant's Certifying Accountant", labelKo: '감사인 변경', category: 'accountants-and-financial-statements' },
  { item: '4.02', labelEn: 'Non-Reliance on Previously Issued Financial Statements or a Related Audit Report or Completed Interim Review', labelKo: '기존 재무제표 또는 감사보고서 신뢰 불가', category: 'accountants-and-financial-statements' },
  { item: '5.01', labelEn: 'Changes in Control of Registrant', labelKo: '지배권 변경', category: 'corporate-governance' },
  { item: '5.02', labelEn: 'Departure of Directors or Certain Officers; Election of Directors; Appointment of Certain Officers; Compensatory Arrangements of Certain Officers', labelKo: '이사·임원 변경 또는 보상 약정', category: 'corporate-governance' },
  { item: '5.03', labelEn: 'Amendments to Articles of Incorporation or Bylaws; Change in Fiscal Year', labelKo: '정관 또는 내규 변경·회계연도 변경', category: 'corporate-governance' },
  { item: '5.04', labelEn: "Temporary Suspension of Trading Under Registrant's Employee Benefit Plans", labelKo: '임직원 복리후생 계획 거래 일시 중단', category: 'corporate-governance' },
  { item: '5.05', labelEn: "Amendments to the Registrant's Code of Ethics, or Waiver of a Provision of the Code of Ethics", labelKo: '윤리강령 변경 또는 면제', category: 'corporate-governance' },
  { item: '5.06', labelEn: 'Change in Shell Company Status', labelKo: '쉘컴퍼니 상태 변경', category: 'corporate-governance' },
  { item: '5.07', labelEn: 'Submission of Matters to a Vote of Security Holders', labelKo: '주주 표결 결과', category: 'corporate-governance' },
  { item: '5.08', labelEn: 'Shareholder Director Nominations', labelKo: '주주 이사 후보 추천 일정', category: 'corporate-governance' },
  { item: '6.01', labelEn: 'ABS Informational and Computational Material', labelKo: '자산유동화증권 정보·계산 자료', category: 'asset-backed-securities' },
  { item: '6.02', labelEn: 'Change of Servicer or Trustee', labelKo: '서비스 제공자 또는 수탁자 변경', category: 'asset-backed-securities' },
  { item: '6.03', labelEn: 'Change in Credit Enhancement or Other External Support', labelKo: '신용보강 또는 외부지원 변경', category: 'asset-backed-securities' },
  { item: '6.04', labelEn: 'Failure to Make a Required Distribution', labelKo: '필수 배분 미이행', category: 'asset-backed-securities' },
  { item: '6.05', labelEn: 'Securities Act Updating Disclosure', labelKo: '증권법상 업데이트 공시', category: 'asset-backed-securities' },
  { item: '6.06', labelEn: 'Static Pool', labelKo: '정적 풀 정보', category: 'asset-backed-securities' },
  { item: '7.01', labelEn: 'Regulation FD Disclosure', labelKo: 'Regulation FD 공시', category: 'regulation-fd' },
  { item: '8.01', labelEn: 'Other Events', labelKo: '기타 중요 사건', category: 'other-events' },
  { item: '9.01', labelEn: 'Financial Statements and Exhibits', labelKo: '재무제표 및 첨부자료', category: 'financial-statements-and-exhibits' },
];

export const eightKItemDefinitionByItem = new Map(eightKItemDefinitions.map((definition) => [definition.item, definition]));

export function isEightKItemCode(value: string) {
  return /^\d\.\d{2}$/.test(value.trim());
}

export function normalizeEightKItems(rawItems: unknown): EightKItemDetail[] {
  const text = Array.isArray(rawItems) ? rawItems.join(',') : String(rawItems ?? '');
  const seen = new Set<string>();
  return text
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .filter(isEightKItemCode)
    .filter((item) => {
      if (seen.has(item)) return false;
      seen.add(item);
      return true;
    })
    .map((item) => {
      const definition = eightKItemDefinitionByItem.get(item);
      return {
        item,
        labelEn: definition?.labelEn ?? 'Official description needs review',
        labelKo: definition?.labelKo ?? '공식 설명 확인 필요',
        category: definition?.category ?? 'unknown',
        source: 'sec-submissions' as const,
      };
    });
}

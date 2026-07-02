import type { DisclosureCategory } from './types.js';

export const disclosureCategoryLabels: Record<DisclosureCategory, string> = {
  'supply-contract': '공급계약',
  earnings: '실적',
  'periodic-report': '정기보고서',
  capital: '자금조달',
  ownership: '지분',
  'major-management': '주요경영사항',
  investment: '투자',
  governance: '지배구조',
  other: '기타',
};

export const disclosureCategoryOrder: DisclosureCategory[] = [
  'supply-contract',
  'earnings',
  'periodic-report',
  'capital',
  'ownership',
  'major-management',
  'investment',
  'governance',
  'other',
];

export const disclosureCheckpoints: Record<DisclosureCategory, string> = {
  'supply-contract': '계약 상대방, 계약 금액, 매출 대비 비중, 계약 기간을 확인하세요.',
  earnings: '매출·영업이익 변화가 일회성인지 기존 사업 흐름인지 확인하세요.',
  'periodic-report': '매출, 영업이익, 현금흐름과 주요 사업 설명의 변화를 확인하세요.',
  capital: '조달 목적, 발행 조건, 기존 주주 희석 가능성을 확인하세요.',
  ownership: '변경 주체, 보유 목적과 실제 지분 변화를 확인하세요.',
  'major-management': '이사회 결정 내용, 조건과 실제 시행 일정을 확인하세요.',
  investment: '투자 금액, 투자 목적, 자금 부담과 예상 완료 시점을 확인하세요.',
  governance: '이사·감사 선임과 주주총회 안건의 의미를 확인하세요.',
  other: '공시 원문에서 핵심 변경 사항과 시행 시점을 확인하세요.',
};

const categoryRules: Array<{ category: DisclosureCategory; keywords: string[] }> = [
  {
    category: 'supply-contract',
    keywords: ['단일판매', '공급계약', '판매ㆍ공급계약', '판매·공급계약', '수주'],
  },
  {
    category: 'periodic-report',
    keywords: ['사업보고서', '분기보고서', '반기보고서', '정기보고서'],
  },
  {
    category: 'earnings',
    keywords: ['매출액또는손익구조', '매출액 또는 손익구조', '영업(잠정)실적', '잠정실적', '실적', '손익구조'],
  },
  {
    category: 'capital',
    keywords: ['유상증자', '무상증자', '전환사채', '신주인수권부사채', '교환사채', '회사채', '감자', '증권신고서'],
  },
  {
    category: 'ownership',
    keywords: ['최대주주', '대량보유', '임원ㆍ주요주주', '임원·주요주주', '소유주식', '특정증권등'],
  },
  {
    category: 'major-management',
    keywords: ['주요경영사항', '투자판단관련', '소송', '풍문또는보도', '조회공시'],
  },
  {
    category: 'investment',
    keywords: ['타법인주식', '시설투자', '신규시설', '유형자산', '영업양수', '영업양도', '합병', '분할'],
  },
  {
    category: 'governance',
    keywords: ['주주총회', '이사', '감사', '대표이사', '사외이사', '정관'],
  },
];

export function classifyDisclosure(reportName: string): DisclosureCategory {
  const normalized = reportName.replace(/\s+/g, '').toLowerCase();
  const rule = categoryRules.find((item) =>
    item.keywords.some((keyword) => normalized.includes(keyword.replace(/\s+/g, '').toLowerCase())),
  );
  return rule?.category ?? 'other';
}

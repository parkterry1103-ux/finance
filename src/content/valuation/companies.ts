export type ValuationReadinessCompany = {
  companySlug: string;
  companyName: string;
  ticker: string;
  country: 'KR' | 'US';
  currency: 'KRW' | 'USD';
  corpCode?: string;
  cik?: string;
  industry: string;
  benchmarkIndustry: string;
  primaryMethod: string;
  secondaryMethods: string[];
  unsuitableMethods: string[];
  methodRationale: string;
  keyDrivers: string[];
  publicValuationStatus: 'full' | 'partial' | 'unavailable';
};

export const valuationReadinessCompanies: ValuationReadinessCompany[] = [
  {
    companySlug: 'sk-hynix',
    companyName: 'SK하이닉스',
    ticker: '000660.KS',
    country: 'KR',
    currency: 'KRW',
    corpCode: '00164779',
    industry: '메모리 반도체',
    benchmarkIndustry: 'Semiconductor',
    primaryMethod: '사이클 정상화 FCFF DCF',
    secondaryMethods: ['역산 DCF', 'EV/EBITDA', 'PBR·ROE'],
    unsuitableMethods: ['단일 연도 PER'],
    methodRationale: '메모리 가격과 재고 사이클이 크므로 최근 최고 마진보다 중간 사이클 FCFF와 정상 마진이 중요합니다.',
    keyDrivers: ['HBM 비중', '메모리 ASP', '출하량', '재고', 'Capex', '감가상각'],
    publicValuationStatus: 'unavailable',
  },
  {
    companySlug: 'lg-electronics',
    companyName: 'LG전자',
    ticker: '066570.KS',
    country: 'KR',
    currency: 'KRW',
    corpCode: '00401731',
    industry: '가전·HVAC',
    benchmarkIndustry: 'Electronics (Consumer & Office)',
    primaryMethod: '사업부 SOTP',
    secondaryMethods: ['FCFF DCF', 'EV/EBITDA'],
    unsuitableMethods: ['데이터센터 냉각 단일 사업 DCF'],
    methodRationale: '가전·전장·HVAC 등 사업부 경제성이 달라 전사 단일 배수보다 SOTP가 적합하며 공개된 냉각 매출만으로 별도 DCF를 만들 수 없습니다.',
    keyDrivers: ['가전 수요', 'HVAC 수주', '전장 성장', '원재료', '운전자본', 'Capex'],
    publicValuationStatus: 'unavailable',
  },
  {
    companySlug: 'nvidia',
    companyName: 'NVIDIA',
    ticker: 'NVDA',
    country: 'US',
    currency: 'USD',
    cik: '1045810',
    industry: 'AI 반도체',
    benchmarkIndustry: 'Semiconductor',
    primaryMethod: 'Driver-based FCFF DCF',
    secondaryMethods: ['역산 DCF', 'EV/Sales', 'EV/EBITDA'],
    unsuitableMethods: ['PBR 단독 평가'],
    methodRationale: '높은 성장과 자산 경량 설계 모델을 매출 성장·정상 마진·재투자로 분해한 DCF와 가격 내재 기대의 교차검증이 적합합니다.',
    keyDrivers: ['데이터센터 매출', 'GPU 출하', 'ASP', '제품 구성', '영업이익률', '공급 제약'],
    publicValuationStatus: 'full',
  },
  {
    companySlug: 'micron',
    companyName: 'Micron Technology',
    ticker: 'MU',
    country: 'US',
    currency: 'USD',
    cik: '723125',
    industry: '메모리 반도체',
    benchmarkIndustry: 'Semiconductor',
    primaryMethod: '사이클 정상화 FCFF DCF',
    secondaryMethods: ['역산 DCF', 'EV/EBITDA', 'PBR·ROE'],
    unsuitableMethods: ['단일 연도 PER'],
    methodRationale: '메모리 ASP·재고·Capex 사이클이 이익을 크게 흔들어 정상화 FCFF와 중간 사이클 배수가 필요합니다.',
    keyDrivers: ['HBM 비중', 'DRAM·NAND ASP', '출하량', '재고', 'Capex', '감가상각'],
    publicValuationStatus: 'unavailable',
  },
  {
    companySlug: 'dell',
    companyName: 'Dell Technologies',
    ticker: 'DELL',
    country: 'US',
    currency: 'USD',
    cik: '1571996',
    industry: '서버·IT 하드웨어',
    benchmarkIndustry: 'Computers/Peripherals',
    primaryMethod: 'FCFF DCF',
    secondaryMethods: ['EV/EBITDA', '운전자본 시나리오', 'SOTP'],
    unsuitableMethods: ['매출 성장만 반영한 EV/Sales'],
    methodRationale: 'AI 서버 매출의 낮은 마진과 큰 운전자본 변동을 함께 반영해야 하므로 FCFF와 사업부 보조 평가가 적합합니다.',
    keyDrivers: ['AI 서버 주문', '출하량', '매출총이익률', '재고', '매출채권', '매입채무'],
    publicValuationStatus: 'unavailable',
  },
  {
    companySlug: 'eaton',
    companyName: 'Eaton',
    ticker: 'ETN',
    country: 'US',
    currency: 'USD',
    cik: '1551182',
    industry: '전력기기·산업재',
    benchmarkIndustry: 'Electrical Equipment',
    primaryMethod: 'FCFF DCF',
    secondaryMethods: ['EV/EBITDA', 'ROIC·WACC', '수주잔고 전망'],
    unsuitableMethods: ['PBR 단독 평가'],
    methodRationale: '수주잔고의 매출 전환과 가격·물량·운전자본을 FCFF로 연결하고 산업재 정상 배수로 교차검증하는 방식이 적합합니다.',
    keyDrivers: ['수주잔고', 'book-to-bill', '가격', '물량', '원재료', '운전자본'],
    publicValuationStatus: 'unavailable',
  },
  {
    companySlug: 'meta',
    companyName: 'Meta Platforms',
    ticker: 'META',
    country: 'US',
    currency: 'USD',
    cik: '1326801',
    industry: '디지털 광고·플랫폼',
    benchmarkIndustry: 'Advertising',
    primaryMethod: 'Driver-based FCFF DCF',
    secondaryMethods: ['역산 DCF', 'EV/EBITDA', 'FCF Yield'],
    unsuitableMethods: ['장부가치 중심 PBR'],
    methodRationale: '광고 사용자·ARPU 성장과 AI 인프라 Capex를 명시적으로 분리할 수 있어 driver-based FCFF와 역산 DCF가 적합합니다.',
    keyDrivers: ['사용자 수', 'ARPU', '광고 단가', '노출량', '영업이익률', 'AI Capex'],
    publicValuationStatus: 'full',
  },
  {
    companySlug: 'supermicro',
    companyName: 'Super Micro Computer',
    ticker: 'SMCI',
    country: 'US',
    currency: 'USD',
    cik: '1375365',
    industry: 'AI 서버',
    benchmarkIndustry: 'Computers/Peripherals',
    primaryMethod: 'FCFF DCF',
    secondaryMethods: ['EV/Sales', 'EV/EBITDA', '운전자본 시나리오'],
    unsuitableMethods: ['매출 성장만 반영한 단일 배수'],
    methodRationale: '빠른 매출 성장과 조달·재고·매출채권 부담을 함께 평가해야 하므로 운전자본 중심 FCFF가 필요합니다.',
    keyDrivers: ['AI 서버 출하', 'ASP', '매출총이익률', '재고일수', '매출채권', '자금조달'],
    publicValuationStatus: 'unavailable',
  },
  {
    companySlug: 'netflix',
    companyName: 'Netflix',
    ticker: 'NFLX',
    country: 'US',
    currency: 'USD',
    cik: '1065280',
    industry: '글로벌 스트리밍·광고',
    benchmarkIndustry: 'Entertainment',
    primaryMethod: 'Driver-based FCFF DCF',
    secondaryMethods: ['역산 DCF', 'PER', 'EV/EBITDA'],
    unsuitableMethods: ['단일 분기 PER', '가입자 수 단독 배수'],
    methodRationale: '가격·회원·광고 성장과 콘텐츠 현금지출을 함께 연결해야 하므로 driver-based FCFF가 적합하지만 검증된 자체 모형은 아직 공개하지 않습니다.',
    keyDrivers: ['회원·가격', '광고 매출', '시청 참여', '콘텐츠 현금지출', '영업이익률', '잉여현금흐름'],
    publicValuationStatus: 'unavailable',
  },
];

export function valuationReadinessCompany(slug: string) {
  return valuationReadinessCompanies.find((company) => company.companySlug === slug);
}

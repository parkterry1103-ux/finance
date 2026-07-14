import type { CompanyProfileRelatedCompany } from './types.js';

export const companyProfileRelatedCompanies: CompanyProfileRelatedCompany[] = [
  { companyId: 'ai-datacenter-sk-hynix', relatedCompanyId: 'ai-datacenter-micron', relationType: 'same-demand', explanation: '두 기업 모두 AI 서버의 고속 메모리 수요를 확인할 때 함께 봅니다.', sourceRefs: ['semi-memory-fab-outlook-q2-2026'] },
  { companyId: 'ai-datacenter-sk-hynix', relatedCompanyId: 'us-semiconductors-nvidia', relationType: 'production-stage', explanation: 'AI 가속기 수요와 HBM 공급 단계가 같은 서버 생산 흐름에서 이어집니다.', sourceRefs: ['nvidia-fy2027-q1-results'] },
  { companyId: 'datacenter-power-lg-electronics', relatedCompanyId: 'ai-datacenter-eaton', relationType: 'infrastructure', explanation: '냉각과 전력관리는 고밀도 데이터센터 운영에 함께 필요한 인프라입니다.', sourceRefs: ['iea-energy-and-ai-2025'] },
  { companyId: 'datacenter-power-lg-electronics', relatedCompanyId: 'ai-datacenter-supermicro', relationType: 'same-demand', explanation: '고밀도 AI 서버 증설은 서버 시스템과 냉각 설비 수요를 함께 만들 수 있습니다.', sourceRefs: ['iea-energy-and-ai-2025'] },
  { companyId: 'us-semiconductors-nvidia', relatedCompanyId: 'ai-datacenter-sk-hynix', relationType: 'production-stage', explanation: 'AI 가속기와 HBM은 같은 서버 생산 흐름에서 함께 확인하는 구성 요소입니다.', sourceRefs: ['nvidia-fy2027-q1-results'] },
  { companyId: 'us-semiconductors-nvidia', relatedCompanyId: 'ai-datacenter-micron', relationType: 'production-stage', explanation: 'AI 컴퓨팅 수요가 가속기와 고속 메모리 공급에 어떻게 반영되는지 함께 봅니다.', sourceRefs: ['micron-fy2026-q3-results'] },
  { companyId: 'us-semiconductors-nvidia', relatedCompanyId: 'ai-datacenter-dell', relationType: 'same-demand', explanation: '가속기 수요와 AI 서버 주문은 같은 데이터센터 투자 배경에서 함께 확인합니다.', sourceRefs: ['dell-fy2027-q1-results'] },
  { companyId: 'ai-datacenter-micron', relatedCompanyId: 'ai-datacenter-sk-hynix', relationType: 'same-demand', explanation: '두 기업 모두 HBM과 DRAM의 수요·공급 변화를 확인할 때 함께 봅니다.', sourceRefs: ['semi-memory-fab-outlook-q2-2026'] },
  { companyId: 'ai-datacenter-micron', relatedCompanyId: 'us-semiconductors-nvidia', relationType: 'production-stage', explanation: '고속 메모리 공급은 AI 가속기와 서버 생산 단계의 배경으로 이어집니다.', sourceRefs: ['nvidia-fy2027-q1-results'] },
  { companyId: 'ai-datacenter-dell', relatedCompanyId: 'ai-datacenter-supermicro', relationType: 'same-demand', explanation: '두 기업 모두 AI 서버 주문과 실제 출하 전환을 확인할 때 함께 봅니다.', sourceRefs: ['dell-fy2027-q1-results'] },
  { companyId: 'ai-datacenter-dell', relatedCompanyId: 'us-semiconductors-nvidia', relationType: 'production-stage', explanation: '가속기 공급과 서버 조립·출하는 같은 생산 흐름의 앞뒤 단계입니다.', sourceRefs: ['dell-fy2027-q1-results'] },
  { companyId: 'ai-datacenter-eaton', relatedCompanyId: 'datacenter-power-lg-electronics', relationType: 'infrastructure', explanation: '배전·전력관리와 냉각은 데이터센터를 운영할 때 함께 필요한 기반 설비입니다.', sourceRefs: ['iea-energy-and-ai-2025'] },
  { companyId: 'ai-datacenter-eaton', relatedCompanyId: 'ai-datacenter-dell', relationType: 'infrastructure', explanation: 'AI 서버 증설과 데이터센터 전력 인프라 수요를 같은 투자 배경에서 확인합니다.', sourceRefs: ['iea-energy-and-ai-2025'] },
  { companyId: 'ai-datacenter-supermicro', relatedCompanyId: 'ai-datacenter-dell', relationType: 'same-demand', explanation: '두 기업 모두 AI 서버 주문이 출하와 매출로 전환되는 과정을 확인합니다.', sourceRefs: ['dell-fy2027-q1-results'] },
  { companyId: 'ai-datacenter-supermicro', relatedCompanyId: 'us-semiconductors-nvidia', relationType: 'production-stage', explanation: '가속기 공급과 랙 단위 서버 시스템 생산은 같은 흐름의 앞뒤 단계입니다.', sourceRefs: ['nvidia-fy2027-q1-results'] },
  { companyId: 'ai-datacenter-supermicro', relatedCompanyId: 'datacenter-power-lg-electronics', relationType: 'infrastructure', explanation: '고밀도 서버 시스템과 이를 식히는 냉각 설비 수요를 함께 확인합니다.', sourceRefs: ['iea-energy-and-ai-2025'] },
];

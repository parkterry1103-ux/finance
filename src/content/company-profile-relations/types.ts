export type CompanyProfileRelationType = 'same-demand' | 'production-stage' | 'infrastructure';

export type CompanyProfileRelatedCompany = {
  companyId: string;
  relatedCompanyId: string;
  relationType: CompanyProfileRelationType;
  explanation: string;
  sourceRefs: string[];
};

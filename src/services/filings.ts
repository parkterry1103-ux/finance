import type { Company, FilingSourceLink } from '../data.js';
import { inferCompanyListing } from './listing.js';

export type FilingLinkStatus = 'direct' | 'search-only' | 'needs-link' | 'private-company' | 'no-public-filing';

export type ResolvedFilingAction = FilingSourceLink & {
  isDirect: boolean;
  isNavigable: boolean;
  status: FilingLinkStatus;
};

export type FilingLinkResolution = {
  status: FilingLinkStatus;
  primary: ResolvedFilingAction;
  secondary: FilingSourceLink[];
  regulator: 'DART' | 'SEC';
  statusLabel: string;
  statusDetail: string;
  reportMeta: {
    reportType?: string;
    fiscalYear?: string;
    fiscalPeriod?: string;
    filingDate?: string;
    dartRcpNo?: string;
    secAccessionNumber?: string;
  };
};

export function buildDartReportUrl(dartRcpNo?: string) {
  return dartRcpNo ? `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${dartRcpNo}` : undefined;
}

export function newsSearchUrl(company: Company) {
  const query = encodeURIComponent(`${company.legalName || company.name} ${company.sector} 실적 투자 공시`);
  return `https://news.google.com/search?q=${query}`;
}

export function getCompanyDirectReportUrl(company: Company, preferredUrl?: string) {
  if (preferredUrl) return preferredUrl;
  if (company.reportUrl) return company.reportUrl;
  if (company.filingSourceUrl) return company.filingSourceUrl;
  if (company.sourceDirectUrl) return company.sourceDirectUrl;
  return buildDartReportUrl(company.dartRcpNo);
}

function hasDirectReport(company: Company, preferredDirectUrl?: string) {
  return Boolean(preferredDirectUrl || company.reportUrl || company.filingSourceUrl || company.sourceDirectUrl || company.dartRcpNo);
}

function explicitSearchUrl(company: Company) {
  return company.sourceSearchUrl;
}

export function isLikelyPublicCompany(company: Company) {
  return inferCompanyListing(company).listed;
}

function nonPublicStatus(company: Company): Extract<FilingLinkStatus, 'private-company' | 'no-public-filing'> {
  const listing = inferCompanyListing(company);
  if (listing.listingStatus === 'no-public-filing') return 'no-public-filing';
  if (listing.listingStatus === 'private') return 'private-company';
  if (company.sourceStatus === 'private-company') return 'private-company';
  if (company.sourceStatus === 'no-public-filing') return 'no-public-filing';
  return company.tier === 'tier2' ? 'private-company' : 'no-public-filing';
}

function nonPublicStatusLabels(company: Company) {
  const status = nonPublicStatus(company);
  if (status === 'private-company') {
    return {
      status,
      label: '비상장/공시 의무 없음',
      detail: '상장 공시 원문이 확인되지 않는 협력사입니다. 공시 검색 대상과 원문 연결 필요 기업을 구분해 표시합니다.',
    };
  }

  return {
    status,
    label: '공개 원문 보고서 없음',
    detail: '현재 공개 사업·분기보고서가 확인되지 않습니다. 상장 여부나 보고 의무가 확인되면 원문 링크를 보강합니다.',
  };
}

function generatedSearchLink(company: Company): FilingSourceLink {
  const keyword = encodeURIComponent(company.legalName || company.name);
  if (company.country === 'KR') {
    return {
      label: 'DART 검색으로 확인',
      url: `https://dart.fss.or.kr/dsab007/main.do?option=corp&keyword=${keyword}`,
      sourceType: 'search',
      note: '직접 원문 URL이 아직 없어서 DART 검색 화면에서 최신 사업·분기보고서를 확인합니다.',
    };
  }

  return {
    label: 'SEC 검색으로 확인',
    url: `https://www.sec.gov/search-filings?keys=${keyword}`,
    sourceType: 'search',
    note: '직접 filing URL이 아직 없어서 SEC 검색 화면에서 10-K 또는 10-Q를 확인합니다.',
  };
}

export function externalDisclosureLinks(company: Company): FilingSourceLink[] {
  const keyword = encodeURIComponent(company.legalName || company.name);
  if (company.country === 'KR') {
    return [
      {
        label: 'DART 공시 통합검색',
        url: company.sourceSearchUrl ?? `https://dart.fss.or.kr/dsab007/main.do?option=corp&keyword=${keyword}`,
        sourceType: 'search',
        note: '직접 원문 URL이 없을 때 사업보고서, 감사보고서, 수주·증설 공시를 검색합니다.',
      },
      {
        label: '공식 공시 기준',
        url: 'https://opendart.fss.or.kr/guide/main.do?apiGrpCd=DE003',
        sourceType: 'api-docs',
        note: '자동 수집은 서버 환경변수로 처리하고, 사용자 화면에는 공식 공시 기준으로만 표시합니다.',
      },
    ];
  }

  return [
    {
      label: 'SEC Search Filings',
      url: company.sourceSearchUrl ?? `https://www.sec.gov/search-filings?keys=${keyword}`,
      sourceType: 'search',
      note: '직접 filing URL이 없을 때 10-K, 10-Q, 8-K와 감사 재무제표 원문을 검색합니다.',
    },
    {
      label: 'SEC EDGAR 본문 검색',
      url: `https://www.sec.gov/edgar/search/#/q=${keyword}`,
      sourceType: 'search',
      note: 'MD&A, Risk Factors, 재무제표 주석을 원문에서 확인합니다.',
    },
  ];
}

export function resolveCompanyFilingLinks(company: Company, preferredDirectUrl?: string): FilingLinkResolution {
  const regulator = company.country === 'KR' ? 'DART' : 'SEC';
  const listing = inferCompanyListing(company);
  const directUrl = getCompanyDirectReportUrl(company, preferredDirectUrl);
  const secondary = externalDisclosureLinks(company);
  const reportMeta = {
    reportType: company.reportType,
    fiscalYear: company.fiscalYear,
    fiscalPeriod: company.fiscalPeriod,
    filingDate: company.filingDate,
    dartRcpNo: company.dartRcpNo,
    secAccessionNumber: company.secAccessionNumber,
  };

  if (
    !hasDirectReport(company, preferredDirectUrl) &&
    !listing.listed &&
    (company.sourceStatus === 'private-company' ||
      company.sourceStatus === 'no-public-filing' ||
      (!explicitSearchUrl(company) && !isLikelyPublicCompany(company)))
  ) {
    const statusCopy = nonPublicStatusLabels(company);
    return {
      status: statusCopy.status,
      regulator,
      primary: {
        ...generatedSearchLink(company),
        label: statusCopy.label,
        note: statusCopy.detail,
        isPrimary: true,
        isDirect: false,
        isNavigable: false,
        status: statusCopy.status,
      },
      secondary,
      statusLabel: statusCopy.label,
      statusDetail: statusCopy.detail,
      reportMeta,
    };
  }

  if (directUrl && hasDirectReport(company, preferredDirectUrl)) {
    return {
      status: 'direct',
      regulator,
      primary: {
        label: `${regulator} 원문 보고서 보기`,
        url: directUrl,
        sourceType: 'direct-report',
        note:
          company.country === 'KR'
            ? 'DART 통합검색이 아니라 해당 분기·사업보고서 원문으로 바로 이동합니다.'
            : 'SEC 검색 화면이 아니라 해당 10-K 또는 10-Q 원문으로 바로 이동합니다.',
        isPrimary: true,
        isDirect: true,
        isNavigable: true,
        status: 'direct',
      },
      secondary,
      statusLabel: `${regulator} 원문 보고서 직접 연결`,
      statusDetail: `${company.reportType ?? '보고서'}${company.fiscalYear ? ` · ${company.fiscalYear}` : ''}${company.fiscalPeriod ? ` ${company.fiscalPeriod}` : ''}${company.filingDate ? ` · 제출일 ${company.filingDate}` : ''}`,
      reportMeta,
    };
  }

  const explicitSearch = explicitSearchUrl(company);
  if (company.sourceStatus === 'search-only' || explicitSearch) {
    const searchLink =
      secondary.find((link) => link.url === explicitSearch) ??
      secondary[0] ??
      generatedSearchLink(company);

    return {
      status: 'search-only',
      regulator,
      primary: {
        ...searchLink,
        label: company.country === 'KR' ? 'DART 검색으로 확인' : 'SEC 검색으로 확인',
        note: '직접 원문 보고서 URL은 아직 없고, 검색 링크만 연결된 상태입니다. 원문을 확인하면 reportUrl 또는 rcpNo/accessionNumber로 보강할 수 있습니다.',
        isPrimary: true,
        isDirect: false,
        isNavigable: true,
        status: 'search-only',
      },
      secondary,
      statusLabel: `${regulator} 검색 링크만 연결됨`,
      statusDetail: '직접 원문 URL은 아직 없고 검색 화면에서 최신 원문을 찾아야 합니다.',
      reportMeta,
    };
  }

  const searchLink = secondary[0] ?? generatedSearchLink(company);

  return {
    status: 'needs-link',
    regulator,
    primary: {
      ...searchLink,
      label: `${regulator} 원문 연결 필요`,
      note: '아직 회사별 직접 보고서 URL이 확정되지 않았습니다. 검색 링크를 남기고 다음 단계에서 원문 URL을 연결합니다.',
      isPrimary: true,
      isDirect: false,
      isNavigable: false,
      status: 'needs-link',
    },
    secondary,
    statusLabel: `${regulator} 원문 연결 필요`,
    statusDetail: '기업 데이터에 reportUrl, filingSourceUrl, dartRcpNo, secAccessionNumber, sourceDirectUrl을 추가하면 바로 직접 연결됩니다.',
    reportMeta,
  };
}

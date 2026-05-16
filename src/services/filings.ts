import type { Company, FilingSourceLink } from '../data.ts';

export type FilingLinkStatus = 'direct' | 'needs-source';

export type FilingLinkResolution = {
  status: FilingLinkStatus;
  primary: FilingSourceLink & { isDirect: boolean };
  secondary: FilingSourceLink[];
  regulator: 'DART' | 'SEC';
  statusLabel: string;
  statusDetail: string;
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
        label: 'OpenDART 재무정보 API',
        url: 'https://opendart.fss.or.kr/guide/main.do?apiGrpCd=DE003',
        sourceType: 'api-docs',
        note: '서버 스크립트에서 OPENDART_API_KEY를 연결하면 손익계산서·재무상태표·현금흐름표를 자동 수집할 수 있습니다.',
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
  const directUrl = getCompanyDirectReportUrl(company, preferredDirectUrl);
  const secondary = externalDisclosureLinks(company);

  if (directUrl) {
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
      },
      secondary,
      statusLabel: `${regulator} 원문 보고서 직접 연결`,
      statusDetail: '직접 원문 URL을 우선 사용하고, 검색 링크는 보조 확인용으로 유지합니다.',
    };
  }

  const fallback = secondary[0] ?? {
    label: `${regulator} 검색으로 확인`,
    url: newsSearchUrl(company),
    sourceType: 'search' as const,
    note: '직접 원문 링크가 없어 검색 링크로 임시 연결합니다.',
  };

  return {
    status: 'needs-source',
    regulator,
    primary: {
      ...fallback,
      label: `${regulator} 원문 연결 필요`,
      note: '아직 회사별 직접 보고서 URL이 확정되지 않았습니다. 검색 링크를 남기고 다음 단계에서 원문 URL을 연결합니다.',
      isPrimary: true,
      isDirect: false,
    },
    secondary,
    statusLabel: `${regulator} 원문 연결 필요`,
    statusDetail: '기업 데이터에 reportUrl, filingSourceUrl, dartRcpNo, secAccessionNumber, sourceDirectUrl을 추가하면 바로 직접 연결됩니다.',
  };
}

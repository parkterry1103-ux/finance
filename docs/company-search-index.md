# Company Registry 기반 검색 index

## 단일 데이터 원천

검색 기업은 `src/content/company-profiles/entries.ts`의 Company Registry에서만 파생한다. 별도 수동 기업 배열이나 편집 콘텐츠 목록에서 기업을 생성하지 않는다.

검색 포함 조건:

- 유효한 slug와 canonical 기업 identity
- 회사명, ticker, 거래소
- Company Brief config 존재
- 기업 상세 route 규칙 존재
- 공식 `sourceRefs` 1개 이상
- `searchStatus.searchVisible === true`

`analysisStatus`, `financialsStatus`, `valuationStatus`, `reportStatus`는 검색 카드가 아니라 기업 상세의 지원 CTA를 제어한다. NVIDIA와 Meta만 full Valuation·Report를 지원하고 나머지는 지원되지 않는 CTA를 숨긴다.

## 경량 metadata

홈은 회사명, 법인·영문명, ticker·종목코드, 거래소, 대표 업종, 검색 설명, 승인 alias만 사용한다. Brief 본문, 재무 시계열, 가치평가 모형, 리포트 본문, 공시 lineage는 검색을 위해 로드하지 않는다.

## Stock Dissection과의 관계

Published Stock Dissection은 `companySlug`가 있어도 Company Registry를 생성하지 않는다. `companySlug: null` 콘텐츠는 기업 CTA와 검색 편입 없이 게시할 수 있다. 기업 온보딩은 Registry → Brief → 공식 source → route → validation → `searchVisible` 순서다.

## 검증

`scripts/company-dissection-unit.ts`와 기존 company profile unit이 index/Registry 수, slug·ticker·종목코드 중복, Brief 누락, route와 source 조건을 검사한다. 검색 query 원문은 analytics payload로 보내지 않는다.

## SMCI 2026-07-24 감사

SMCI는 이미 `supermicro` Company Registry, Company Brief, 기업 route, 공식 source와 `searchVisible: true`를 갖춘 아홉 번째 지원 기업이다. 이번 주가해부 게시로 새 검색 record를 만들거나 지원 기업 수를 10개로 늘리지 않는다. 검색 alias와 route는 기존 Registry에서 계속 자동 파생한다.

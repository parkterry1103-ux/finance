# 사이트 재개편 2단계 — 기업 검색 중심 진입 화면

## 2단계 목표

`/ko/companies`의 역할을 “기업명이나 종목코드를 검색하고, 현재 지원하는 기업의 기존 분석 페이지로 이동하는 화면”으로 제한합니다. 1단계의 홈과 `기업 분석 | 거시경제` 공통 내비게이션은 유지하며 기업 상세 대시보드는 3단계까지 보존합니다.

## 작업 기준과 기존 구조 감사

- 시작 HEAD: `34f9008ed612f48fc71255f3a2d484a01149dcdb`
- 시작 Production: `dpl_5i34Kns18wbXdbyMPbQBpm4CrXcN`, `Ready`, main `34f9008`
- 기업 목록의 단일 원천: `src/content/company-profiles/entries.ts`의 `companyProfiles`
- 회사 표시명·ticker identity: `src/content/company-events/entries.ts`의 `companyEventCompanies`
- 목록·상세 route boundary: lazy-loaded `src/routes/CompaniesRoute.tsx`
- canonical 목록: `/ko/companies`
- canonical 상세: `/ko/companies/:slug`
- 영문 alias: `/companies`, `/companies/:slug`
- 기존 legacy 분석 route와 not-found 동작: 유지
- 시작 profile 수와 search 대상 수: 8개
- 시작 Function 12개, Public API 9개, Sync endpoint 6개

기존 목록은 국가 필터와 산업 흐름·공식 변화 정보를 한 카드에 함께 표시했습니다. 2단계에서는 검색 시점에 필요하지 않은 가격, 재무, 뉴스, 공시, 산업 흐름과 추천성 정보는 제외하고 식별과 이동에 필요한 정보만 남깁니다.

## 검색 대상과 registry 구조

별도의 8개 기업 object 목록을 만들지 않습니다. 기존 `CompanyProfileEntry`에 검색과 목록 표시에 필요한 `englishName`, `stockCode`, `exchange`, `industry`, `searchDescription`, `aliases`를 추가하고, 기존 canonical identity의 `name`, `ticker`와 결합해 `companySearchIndex`를 생성합니다.

화면의 `현재 지원 기업 {count}개`는 `companySearchIndex.length`에서 계산합니다. validator는 profile 수와 index 수가 같은지, slug·ticker·종목코드가 중복되지 않는지, 모든 search record가 기존 canonical route로 연결되는지 확인합니다.

| 기업 | slug | ticker·종목코드 | 거래소 | 영문명 | aliases |
|---|---|---|---|---|---|
| SK하이닉스 | `sk-hynix` | `000660.KS` · `000660` | KRX | SK hynix | 하이닉스 |
| LG전자 | `lg-electronics` | `066570.KS` · `066570` | KRX | LG Electronics | LG |
| NVIDIA | `nvidia` | `NVDA` | NASDAQ | NVIDIA Corporation | 엔비디아 |
| Micron | `micron` | `MU` | NASDAQ | Micron Technology | 마이크론 |
| Dell | `dell` | `DELL` | NYSE | Dell Technologies | 델 |
| Eaton | `eaton` | `ETN` | NYSE | Eaton Corporation | 이튼 |
| Meta | `meta` | `META` | NASDAQ | Meta Platforms | 메타, Facebook, 페이스북 |
| Supermicro | `supermicro` | `SMCI` | NASDAQ | Super Micro Computer | Super Micro, 슈퍼마이크로 |

`LG`는 현재 지원 registry에서 LG전자 한 곳에만 명확히 대응하므로 exact alias로 허용합니다. alias 충돌은 validator에서 차단합니다.

## 검색 normalization

검색 비교 문자열은 다음 순서로 정규화합니다.

1. Unicode NFKC로 영문 전각·반각 차이를 통일합니다.
2. 앞뒤 공백을 제거하고 영문을 소문자로 변환합니다.
3. 연속 공백, 하이픈, 마침표와 일반적인 구두점·기호를 제거합니다.
4. 종목코드는 문자열로 유지해 `000660`, `066570`의 앞자리 0을 보존합니다.

사용자 입력은 React text node와 input value로만 처리하며 `dangerouslySetInnerHTML`을 사용하지 않습니다. 정규화 뒤 빈 문자열이 되는 특수문자 전용 검색은 결과 0개로 처리합니다.

## 검색 ranking

동일 query의 결과는 아래 순위와 기존 registry 순서로 안정 정렬합니다.

1. ticker 또는 종목코드 정확히 일치
2. canonical 표시명 또는 영문명 정확히 일치
3. alias 정확히 일치
4. canonical 표시명 prefix 일치
5. 영문명 prefix 일치
6. alias prefix 일치
7. 나머지 substring 일치

slug를 기준으로 결과를 한 번 더 중복 제거합니다. 검색량, 가격, 임의 추천, fuzzy search와 AI 순위는 사용하지 않습니다.

## 접근성 설계

- 한 개의 `h1`과 visible `기업 검색` label
- `combobox` → `listbox` → `option` ARIA 연결
- `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-selected`
- ArrowDown·ArrowUp 순환 선택, Enter 이동, Escape 닫기, 자연스러운 Tab 이동
- 검색 결과 수와 결과 없음 상태를 `aria-live="polite"`로 전달
- mouse hover와 keyboard active에 서로 다른 border·위치 표시
- 검색 input, CTA, 전체 기업 보기 버튼의 focus ring과 최소 44px touch target
- 카드는 일반 `article`, 상세 이동은 CTA 한 개만 제공해 링크를 중복하지 않음

## 목록 카드와 검색에서 제외한 정보

카드는 기업명, 영문명, ticker 또는 종목코드, 거래소, 업종, 사업 한 줄 설명과 `기업 분석 보기`만 표시합니다. 한 줄 설명은 기존 business description을 요약해 “무엇을 판매하는가”만 답합니다.

현재 주가, 등락률, 시가총액, PER, 재무지표, 뉴스, 공시 목록, 추천 점수, 매수·매도 의견과 별점은 검색 결과에서 제외합니다. 검색은 local registry만 사용하므로 loading spinner와 검색 API 요청도 없습니다. 목록 route에서는 기존 market price request도 건너뜁니다.

## URL과 기존 route 보존

검색 중에는 `history.replaceState`로 `/ko/companies?q=...`를 갱신해 글자마다 history entry를 만들지 않습니다. 직접 URL 접근과 새로고침에서 query를 복원하고, 결과에서 상세로 이동한 뒤 뒤로 가면 같은 query 목록으로 돌아옵니다. 검색 결과는 기존 `/ko/companies/:slug`로만 이동하며 잘못된 slug의 기존 not-found 동작은 유지합니다.

## 테스트와 성능 기준

- 검색 unit: normalization, exact·prefix·substring ranking, 29개 한국어·영문·ticker·종목코드·alias query, unsupported·empty·특수문자, 중복 제거
- 무결성: profile/index 수, slug, ticker, stock code, alias, 빈 필드와 canonical route
- UI: 검색 입력, 결과 갱신, autocomplete keyboard·mouse, 결과 없음, 전체 기업 복귀, query 복원
- 시각 QA: 1440×900부터 320×700까지 7개 viewport와 저장소 내부 artifact
- 성능: 검색 API 0, 목록 market price request 0, 기존 lazy route와 bundle budget 유지
- 회귀: 8개 상세 route, 영문 alias·legacy route, 12개 Function, 9개 Public API, 6개 Sync endpoint와 기존 콘텐츠 수 유지

로컬 최종 결과:

- company profile/search unit 78개 통과
- Release Gate 18개 통과, 17.663초
- Node `v22.23.1`, npm `10.9.8`, npm audit 취약점 0
- entry bundle raw `749.47 kB → 751.28 kB`, gzip `203,708 B → 204,265 B`
- Companies route chunk raw `30.68 kB → 34.67 kB`, gzip `8.45 kB → 9.94 kB`
- 7개 지정 viewport와 모바일 키보드 축소 viewport에서 overflow·text clipping·autocomplete 이탈·CTA 이탈 0
- 로컬 검색 전후 관찰 asset 변화 0, `/api/` asset 0

## 후속 3단계 범위

3단계에서는 기존 기업 상세 화면을 간결한 기업 대시보드로 재구성합니다. 핵심 판단, 핵심 숫자 6개 내외, 핵심 차트 3개, 중요한 변화, 기업별 주요 거시 변수와 리서치 리포트 진입점을 다룹니다. 이번 2단계에서는 상세 페이지의 재무 카드, 차트, 콘텐츠와 데이터 구조를 변경하지 않습니다.

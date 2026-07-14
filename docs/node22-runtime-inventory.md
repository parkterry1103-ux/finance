# Node.js 22 런타임 전환 인벤토리

- 감사일: 2026-07-14 KST
- 시작 HEAD: `b4a2f293710ccb52cba5f68b87984c2483ce21b3`
- 대상 Vercel 프로젝트: `finance1` (`prj_juAYBFIeD8Wydfjhp60QrU20xll0`)
- 기준 Production deployment: `dpl_6yJvhXnZLgSQop85Lc26zXGNRtuA`
- 변경 범위: Vercel과 GitHub Actions Node.js 런타임 20.x → 22.x. UI, 콘텐츠, API 계약, dependency, Function 수, DB, cron, 동기화 로직은 변경하지 않는다.

## 전환 전 기준선

| 항목 | 확인값 |
| --- | --- |
| Git | `main`과 `origin/main`이 시작 HEAD에서 일치, 작업 트리 clean |
| `package.json` | `engines.node = 20.x` |
| `package-lock.json` | root package `engines.node = 20.x` |
| Vercel Project Setting | Node.js `24.x` |
| 실제 Production Functions | 12개, 전부 `nodejs20.x`, 2,048 MB, 최대 300초 |
| GitHub Actions | CI와 sync workflow 모두 Node 20 |
| Production 주요 API | 가격·시장 브리핑·거시·관계·DART·SEC 6종 HTTP 200, JSON 파싱 성공 |

[Vercel 공식 Node.js runtime 문서](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)에 따라 `package.json`의 `engines.node`가 Project Setting보다 우선하므로, 기존에는 프로젝트 설정이 24.x여도 실제 Function은 20.x로 빌드됐다. 목표 상태는 두 설정을 모두 22.x로 맞추고 배포 metadata의 12개 Function도 모두 `nodejs22.x`로 확인하는 것이다.

## Function 인벤토리

| # | 진입점 | 공개 역할 / 실행 경로 | 런타임 의존 | 환경 변수·외부 연결 | Node 22 판단 |
| ---: | --- | --- | --- | --- | --- |
| 1 | `api/financials.ts` | 기업 재무 GET | 내장 `fetch`, `AbortController`, `URL`, timer | `SEC_USER_AGENT`, `OPENDART_API_KEY`; SEC CompanyFacts, OpenDART | 표준 Web API와 ESM 사용, 수정 불필요 |
| 2 | `api/market-disclosures.ts` | DART 공시 조회 | 내장 `fetch`, `URL` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | ESM·표준 API, 수정 불필요 |
| 3 | `api/market-prices.js` | 가격 조회; rewrite를 통해 거시 지표·시장 관계도 처리 | 내장 `fetch`, `AbortController`, `URL` | Supabase, Yahoo; 거시·관계 경로는 `FRED_API_KEY` | ESM·표준 API, 수정 불필요 |
| 4 | `api/market-sec-filings.ts` | SEC 공시 조회 | 내장 `fetch`, `URL` | Supabase | ESM·표준 API, 수정 불필요 |
| 5 | `api/news.js` | 신뢰 도메인 뉴스 조회 | 내장 `fetch`, `AbortController`, `URL` | 공개 뉴스 검색 upstream | ESM·표준 API, 수정 불필요 |
| 6 | `api/ownership-trades.js` | SEC 13F/Form 4 소유권 거래 조회 | 내장 `fetch`, `URL` | Supabase | ESM·표준 API, 수정 불필요 |
| 7 | `api/sync/disclosures.ts` | 인증된 DART 공시 cron | 내장 `fetch`; TypeScript ESM | `CRON_SECRET`, OpenDART·Supabase 계열 sync 환경 | 인증 이전 실행 없음, 코드 수정 불필요 |
| 8 | `api/sync/financials.ts` | 인증된 OpenDART·SEC 재무 cron | 내장 `fetch`; TypeScript ESM | `CRON_SECRET`, SEC/OpenDART/Supabase 계열 환경 | 인증 이전 실행 없음, 코드 수정 불필요 |
| 9 | `api/sync/prices.ts` | 인증된 가격 cron | 내장 `fetch`; TypeScript ESM | `CRON_SECRET`, 가격 provider·Supabase 계열 환경 | 인증 이전 실행 없음, 코드 수정 불필요 |
| 10 | `api/sync/sec-filing-details.ts` | 인증된 SEC 상세 파싱 cron | 내장 `fetch`, `AbortController`; TypeScript ESM | `CRON_SECRET`, `SEC_USER_AGENT`, Supabase | 인증 이전 실행 없음, 코드 수정 불필요 |
| 11 | `api/sync/sec-filings.ts` | 인증된 SEC 공시 cron | 내장 `fetch`, `AbortController`; TypeScript ESM | `CRON_SECRET`, `SEC_USER_AGENT`, Supabase | 인증 이전 실행 없음, 코드 수정 불필요 |
| 12 | `api/sync/trades.ts` | 인증된 Form 4·13F·의회 거래 cron | 내장 `fetch`; TypeScript ESM | `CRON_SECRET`, SEC·Supabase 계열 환경 | 인증 이전 실행 없음, 코드 수정 불필요 |

`/api/macro-indicators`와 `/api/market-relations`는 각각 별도 Function이 아니라 `vercel.json` rewrite를 통해 `api/market-prices.js`로 들어간다. 따라서 공개 API route가 12개보다 많아도 배포 Function 수는 정확히 12개다.

## Node 22 호환성 감사

- package 전체가 `type: module`이며 `.js`와 `.ts` Function 진입점은 모두 ESM import/export를 사용한다. `module.exports`/`require` 혼용 충돌은 없다.
- `fetch`, `AbortController`, `URL`, `URLSearchParams`, timer는 Node 22 내장 API 범위다. 별도 polyfill 또는 dependency 변경이 필요하지 않다.
- `new Buffer`, `process.binding`, `domain`, `sys`, `util._extend`, `fs.exists`, `punycode` 같은 제거·중단 예정 API 사용을 찾지 못했다.
- `--openssl-legacy-provider`와 구형 crypto API 의존을 찾지 못했다. Node 22의 OpenSSL 3 계열에서 코드 변경이 필요하지 않다.
- Function별 명시 runtime은 `vercel.json`에 없고 `package.json`의 `engines.node`가 단일 런타임 기준이다.
- CI와 sync workflow의 `actions/setup-node`도 22.x로 정렬한다. sync schedule, secret, 실행 명령은 변경하지 않는다.
- 런타임 확인용 공개 API는 추가하지 않는다. 실제 런타임은 Vercel deployment metadata와 build log로만 확인한다.

## 검증·배포 원칙

1. Node 22에서 `npm ci`, runtime unit, 기존 unit/type/content 검증, Production build를 실행한다.
2. Preview 배포 metadata에서 12개 Function 전부 `nodejs22.x`인지 확인하고 공개 read API와 SPA route를 회귀 검사한다.
3. `/api/sync/*`는 secret 없이 401 보호만 확인하며 동기화를 실행하지 않는다.
4. Preview 검증 후 Vercel Project Setting을 22.x로 맞추고 `main`에 push한다.
5. Production에서 Function 수·runtime, API schema·건수·중복·날짜, 주요 화면과 모바일 overflow를 다시 확인한다.
6. 주요 회귀가 있을 때만 직전 runtime·deployment로 롤백한다.

## Preview 검증 결과

- deployment: `dpl_7cKWRPQyC79NJ4ba9Z4hYkUDJxr5`
- URL: `https://finance1-do0q955as-terrypark-s-projects.vercel.app`
- 상태: READY
- build config: Node.js `22.x`
- Functions: 12개 전부 `nodejs22.x`; 기존과 동일하게 2,048 MB·300초
- build log: Node 20 deprecation 경고 13건 → 0건. 기존 Function TypeScript 진단은 Node 20과 Node 22에서 각각 220건으로 동일하며 배포 산출물 생성에는 영향을 주지 않았다.
- API: 가격, 시장 브리핑, 거시 지표, 시장 관계, DART, SEC의 HTTP 200·root schema·payload 크기·배열 건수 일치. 고유키 중복 0, 날짜 파싱 오류 0, null 수 회귀 0.
- 추가 읽기 Function: 재무, 뉴스, 소유권 거래 HTTP 200.
- sync 보호: 6개 `/api/sync/*` 모두 secret 없는 요청에 HTTP 401. 실제 동기화 실행 0회.
- warm 응답: 가격 5.97초, 나머지 주요 API 0.08~0.10초. 가격 기준선 5.19초 대비 약 15% 증가했지만 외부·DB 왕복 특성과 허용 범위 안이며 나머지는 개선됐다.
- SPA: 홈·수요/공급·기업·거시 화면 렌더링, legacy 시장지도 hub/detail 대체 route, 콘솔 warning/error 0, 800px viewport 가로 overflow 0. 브라우저의 최소 viewport가 800px로 유지되어 390px 실브라우저 확인은 수행하지 못했고, 모바일 회귀는 기존 `industry-flow-layout-unit` 13개와 반응형 CSS 검증으로 보완했다.
- Project Setting: Preview 검증 뒤 `finance1`의 Node.js Version을 24.x에서 22.x로 변경하고 API·CLI 양쪽에서 22.x를 재확인했다.

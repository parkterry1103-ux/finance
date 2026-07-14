# 초기 JavaScript bundle 감사

감사 기준일은 2026-07-14이며 Node.js 22.23.1, npm 10.9.8, Vite 7.3.6에서 측정했다. 시작 commit은 `6fa54ad710e8f795c42f6d0d6c18b8284b1bcb18`, 시작 Production은 `dpl_7Hu6VUGtDVFvTgWYmUosdx2Ed4MD`였다. 변경 전과 변경 후 모두 깨끗한 `vite build`와 별도 `vite build --manifest`를 사용했다. gzip은 Node zlib level 9, Brotli는 Node 표준 zlib 기본 설정으로 계산했다.

## 변경 전 기준

| asset | 역할 | raw | gzip | Brotli | 홈 초기 요청 |
| --- | --- | ---: | ---: | ---: | --- |
| `index-BZosVaFs.js` | entry | 887,568B | 237,134B | 185,239B | 예 |

변경 전 JS는 entry 한 개뿐이었고 dynamic import는 0개였다. 따라서 기업 목록·상세, 기업 이벤트, 수요·공급, 거시 전체 화면, 공시·SEC 화면, 시장 관계 화면의 component와 route 전용 selector가 모두 홈 entry에 포함됐다. 500KB 초과 JS chunk는 1개였다.

esbuild metafile의 minified output 기여 추정에서 `App.tsx` 274,533B, `data.ts` 257,504B, `react-dom` 129,998B, Pick registry 115,855B가 가장 컸다. route 후보 중 기업 profile selector/component 약 28KB, 공시 화면 약 26KB, 시장 관계 약 15KB, 수요·공급 약 14KB, 거시 전체 화면 약 9KB, 기업 이벤트 약 11KB가 홈에서 직접 사용되지 않았다.

## 후보 판단

| 후보 | 결정 | 이유 |
| --- | --- | --- |
| 기업 목록·상세·보유 보고·숫자 읽기 | 분할 | 동일한 기업 탐색 영역이고 profile selector, ownership fallback registry, 화면 markup이 홈에 불필요하다. slug별 chunk는 만들지 않았다. |
| 기업 이벤트 | 분할 | route 전용 radar component가 홈의 정적 event 요약과 분리 가능하다. |
| 수요·공급 | 분할 | matrix 화면은 홈의 산업 흐름 요약과 별도다. profile path용 최소 metadata만 공통으로 둔다. |
| 공시·SEC 화면 | 분할 | 상세 filter·SEC parser 표시 registry와 화면 markup이 크고 홈의 짧은 공시 요약에는 불필요하다. |
| 거시 대시보드 | 분할 | 홈의 네 개 요약 카드만 eager로 남기고 전체 지표 카드·관계 CTA를 분리할 수 있다. |
| 시장 관계 | 분할 | 관계 board 전체가 홈에 필요하지 않다. |
| 리포트·병목·Pick | 유지 | 홈과 서로 공유하는 registry·evidence helper 비율이 높고 `App.tsx` 안의 화면을 추가로 옮길 때 얻는 이익보다 변경 범위가 커진다. |
| React·ReactDOM vendor | 유지 | route 분할 뒤에도 공통 runtime이며 별도 vendor 요청을 강제할 근거가 부족하다. |

선택 범위는 고유 route module 6개다. `manualChunks`는 0개, `chunkSizeWarningLimit` 변경은 0개다. 초기 mount preload와 intent preload도 0개다. 정상 네트워크에서 route chunk가 작고, hover만으로 불필요한 다운로드를 만들 필요가 없다고 판단했다.

## 구현 구조

`App.tsx`와 `PrimaryNavigation`, 홈 `LandingPage`는 eager다. `DeferredRoute` 한 종류가 route content를 공통 `Suspense`와 최소 error boundary로 감싼다. fallback은 `role="status"`, `aria-live="polite"`, `페이지를 불러오는 중입니다.` 문구와 180px 최소 높이를 사용한다. import 실패는 홈으로 숨기지 않고 `페이지 파일을 불러오지 못했습니다.`와 새로고침 안내를 표시한다.

기업 path에 필요한 slug·canonical identity 최소 metadata는 `company-profiles/paths.ts`에 남겼고, 무거운 `buildCompanyResearchProfile`, 목록 selector, profile component는 `CompaniesRoute`에서 import한다. 거시 route의 전체 지표 UI는 `MacroDashboardFull.tsx`로 옮기고 홈용 `HomeMacroDashboard`는 eager로 유지한다. 공시 route의 filter와 SEC 표시 registry는 `DisclosuresRoute` 안으로 이동했다. 보유 보고 fallback과 trade service는 회사 route 진입 또는 기존 기업 분석 진입 전에는 로드되지 않는다. module top-level fetch는 추가하지 않았다.

## 변경 후 build

| asset | 역할 | raw | gzip | Brotli | 홈 초기 요청 |
| --- | --- | ---: | ---: | ---: | --- |
| `index-A2RI220G.js` | entry | 785,360B | 213,726B | 167,537B | 예 |
| `CompaniesRoute-BiUEvt6d.js` | 기업 route group | 30,677B | 8,440B | 7,331B | 아니오 |
| `DisclosuresRoute-Bg5k_TTH.js` | 공시·SEC | 25,536B | 7,745B | 6,558B | 아니오 |
| `MarketRelationsRoute-BAYB94p4.js` | 시장 관계 | 15,486B | 5,618B | 4,781B | 아니오 |
| `DemandSupplyRoute-Bx4M2O3d.js` | 수요·공급 | 14,494B | 4,684B | 4,014B | 아니오 |
| `CompanyEventsRoute-BWLwYOtQ.js` | 기업 이벤트 | 10,972B | 3,750B | 3,195B | 아니오 |
| `MacroDashboardRoute-Cvd97CYM.js` | 거시 전체 | 8,969B | 3,130B | 2,620B | 아니오 |
| `trades-TLzHPCBN.js` | 기업 route용 trade service | 4,418B | 1,785B | 1,523B | 아니오 |
| `entries-BxavIov6.js` | profile path shared data | 3,332B | 1,272B | 1,031B | 아니오 |

manifest의 dynamic entry는 route 6개와 기존 기업 분석에서 필요할 때만 불러오는 trade service 1개다. 기업과 수요·공급 route는 각각 필요한 shared dependency를 한 번만 요청한다. 홈 초기 JS는 entry 한 개뿐이다. route별 최초 추가 raw JS는 기업 38,427B, 수요·공급 17,826B, 공시 25,536B, 기업 이벤트 10,972B, 거시 8,969B, 시장 관계 15,486B다.

## 개선량

| 지표 | 변경 전 | 변경 후 | 감소 | 감소율 |
| --- | ---: | ---: | ---: | ---: |
| entry/홈 초기 raw JS | 887,568B | 785,360B | 102,208B | 11.52% |
| entry/홈 초기 gzip JS | 237,134B | 213,726B | 23,408B | 9.87% |
| entry/홈 초기 Brotli JS | 185,239B | 167,537B | 17,702B | 9.56% |

초기 raw JavaScript 100KB 감소 조건을 충족한다. entry는 아직 500KB를 넘으므로 Vite warning은 1개 남지만, 이를 숨기기 위한 설정 변경이나 의미 없는 추가 분할은 하지 않았다. CSS는 기존 단일 asset 구조를 유지한다.

`scripts/javascript-bundle-unit.ts`는 eager 홈·navigation, 정확히 6개 lazy route module, loader 중복 0, 회사 slug별 import 0, 공통 fallback, error UI, preload 0, `manualChunks` 0, warning limit 변경 0, ReactFlow 0, Node 22와 Function 12개를 검사한다. build가 존재하면 entry 787,568B 이하도 검사한다. `scripts/javascript-bundle-report.ts`는 Node 표준 library만으로 entry·초기 JS·dynamic chunk와 raw/gzip/Brotli를 출력한다.

## Network·배포 검증

로컬 build artifact와 manifest는 `/tmp/finance-bundle-audit/before`, `/tmp/finance-bundle-audit/before-manifest`, `/tmp/finance-bundle-audit/after`, `/tmp/finance-bundle-audit/after-manifest.json`에 기록했다. 브라우저 Resource Timing API가 앱 자동화 격리 context에서 resource entry를 반환하지 않아, 초기 asset 판정은 새 탭 하드 진입에서 확인한 HTML script와 immutable asset 응답, manifest dependency를 함께 사용한다. Preview와 Production은 동일 브라우저·동일 viewport에서 3회 새 query 진입, direct route, back/forward, console, asset 404와 API timing을 별도로 확인한다.

Preview `dpl_BejE4dqP9da9jD9bLQC7W2vKy9Rm`은 48초에 Ready가 됐고 immutable URL은 `https://finance1-pvzupp51z-terrypark-s-projects.vercel.app`이다. deployment output은 Function 12개가 모두 `nodejs22.x`임을 확인했다. 인증된 `vercel curl --compressed` 3회에서 변경 전 Production entry 전송량은 매회 238,589B, Preview entry는 매회 215,042B로 23,547B(9.87%) 감소했다. Preview entry 응답 중앙값은 0.125초였고 변경 전 Production은 0.117초였다. raw 감소 완료 기준이므로 단순 CDN 왕복 시간 차이는 성공 판단에 사용하지 않았다.

Preview lazy asset 8개는 모두 HTTP 200이었고 압축 전송량은 기업 8,436B, 공시 7,687B, 시장 관계 5,558B, 수요·공급 4,661B, 기업 이벤트 3,721B, 거시 3,094B, trade service 1,772B, profile path shared 1,257B였다. 브라우저 최초 표시 wall time은 기업 267ms, 공시 221ms, 시장 관계 243ms, 수요·공급 209ms, 기업 이벤트 224ms, 거시 247ms였고 fallback 고착과 중복 화면은 없었다. HTML의 초기 application script는 entry 한 개였고 manifest상 lazy asset은 모두 dynamic dependency다. Vercel Preview가 추가하는 feedback script는 application bundle 합계에서 제외했다.

로컬 Preview는 7개 viewport와 11개 화면, 총 77개 조합을 검사했고 실패 0개였다. 배포 Preview는 390×844에서 canonical·alias·legacy 13개 직접 URL, 기업 목록 → NVIDIA → 뒤로 → 앞으로를 다시 검사했다. 단일 H1, 빈 화면, loading 고착, FOUC 징후, horizontal overflow, broken image, `undefined`·`NaN`, dynamic import 404, console error/warning은 모두 0개였다. 브라우저 격리 evaluate가 Resource Timing, DOMContentLoaded와 load timing을 노출하지 않아 해당 값은 허위로 보완하지 않고 wall time·immutable asset 응답·manifest로 기록했다.

Preview 공개 API 9개는 모두 HTTP 200이었다. 가격 103개, 거시 9개, 시장 관계 3개, OpenDART 13개, SEC 20개, ownership 20개와 financials·news 기존 schema를 확인했다. sync Function 6개는 인증 없는 POST가 모두 401이었고 실제 sync 실행은 0회다. Preview error log도 0개였다.

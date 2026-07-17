# 사이트 재개편 5A — 편집 콘텐츠 레지스트리와 뉴스룸형 홈페이지

## 목표

인스타그램 등에서 작성한 자연어 리서치 원고를 한 번만 구조화한 뒤 홈 요약, 상세 리서치, 관련 기업에 재사용한다. 사용자는 홈에서 오늘 읽을 사건을 찾고, 확인된 사실과 미확인 항목을 구분한 다음 기업의 사업·재무·가치평가로 이동한다.

## 시작 기준점

- 시작 main SHA: `0e50e348e9ba6a3f13e69507fdb03a3e838a8c64`
- 시작 Production: `HEBzzLnJhHXfWyabWJL6X5qHCBJs` · Ready · Current
- Feature branch: `feat/editorial-newsroom-phase-5a`
- 기존 Function: 12개
- 기존 지원 기업: 8개

## 구현 범위

- `ThreeReadsEdition`과 `DailyStockDissection`의 별도 typed model
- `draft | verified | published | archived` 게시 상태와 공개 selector
- 홈 bundle용 짧은 published summary index와 상세 dynamic import 분리
- 뉴스룸형 홈, `/ko/insights`, 두 상세 route
- 기존 검색 index를 재사용한 접근 가능한 기업 검색
- 공개 콘텐츠가 있을 때만 기업 페이지에 표시되는 `최근 관련 해부`
- 출처·날짜·관계·비교 기준·유한 숫자를 검사하는 validation

## 의도적으로 구현하지 않은 범위

DB, CMS, API, Function, 외부 뉴스 호출, 런타임 AI, 자동 분류, crawler, 기업 profile 추가, 재무·가치평가 엔진 개편은 포함하지 않는다. 기존 거시 route는 유지하되 최상위 내비게이션에서 Footer의 `시장 환경`으로 이동했다.

## 공개 데이터 결정

제공된 PayPal·ASML·커넥티드카 예시는 원문 URL과 기준일이 없어 `draft` fixture로만 등록했다. `publishedEditorialSummaryIndex`는 0건이며 홈과 목록은 검증 가능한 빈 상태를 표시한다. draft slug로 직접 접근해도 상세 본문을 공개하지 않는다.

## 사용자 흐름

1. 홈에서 오늘의 해부 또는 3Reads를 확인한다.
2. 기업명·티커·종목코드·별칭을 검색한다.
3. published 요약에서 상세 route로 이동한다.
4. 상세에서 기준일, 비교, 사실 상태, 다음 확인과 출처를 확인한다.
5. 지원 기업과 최대 3개의 관련 콘텐츠로 이동한다.

## 화면 구조

홈은 Header → Hero·기업 검색 → 오늘의 주가 해부 → 오늘의 3Reads → 기업 찾기 CTA → Footer 순서다. 목록은 최근 주가 해부와 최근 3Reads를 분리한다. 상세 화면은 요청문에 정의된 읽기 순서를 유지하고 값이 없는 비교·관계 섹션은 숨긴다.

## 번들 구조

홈은 `src/content/editorial/summaries.ts`만 정적으로 import한다. `InsightsRoute`, `StockDissectionRoute`, `ThreeReadsRoute`는 각각 lazy route이고 상세 원고 module은 `registry.ts`의 dynamic import로 한 번 더 분리된다. 긴 원고가 홈 초기 bundle에 포함되지 않는다.

## 안전 원칙

- 상대수익률은 `기업 수익률 - 비교 수익률`이며 `%p`로 표시한다.
- 비교 수치가 없으면 0을 만들지 않는다.
- 지원하지 않는 기업 slug는 validation 실패다.
- 출처와 기준일이 없는 published·archived 콘텐츠는 validation 실패다.
- 관련 콘텐츠가 없으면 빈 섹션을 렌더링하지 않는다.
- 콘텐츠는 정보 제공 목적이며 행동 지시나 가격 전망을 제공하지 않는다.

## 검증과 배포

정적 모델 검증은 `npm run validate:editorial`, 전체 배포 전 검증은 `npm run release:gate`, 배포 후 read-only smoke는 `npm run release:smoke -- --base-url=https://finance1-flax.vercel.app`로 실행한다.

완료 결과:

- 구현 commit: `0b16fb02d9c232aab383ee78fd41d7204b2ef98c`
- PR: [#10 Add editorial registry and newsroom homepage](https://github.com/parkterry1103-ux/finance/pull/10) · Merged
- 구현 main SHA: `b26347ff2e72559cf79ec28aa1ef3b2903a09b11`
- Production: `3sEN7ofhMWsZCYA42AvMqDzkmu2o` · Ready
- Release Gate: 22개 검사 통과, Serverless Function 12개 유지
- 운영 브라우저: Chromium 70개 + WebKit 70개 검사 통과, 7개 viewport·9개 route·검색 흐름, 실패 0
- 실제 Safari: canonical 홈과 insights 확인 통과
- Production smoke: routes 30, assets 14, APIs 9, sync 인증 6, 실패 0
- 공개 콘텐츠: 0건. 두 예시 fixture는 draft로만 유지하고 직접 route에서도 본문을 노출하지 않음
- 계획 대비 완료율: 100%. 코드·검증·배포 미완료 항목 없음

초기 Safari 확인에서 Hero 제목이 배경과 충분히 대비되지 않는 문제를 발견해 글자색을 명시적으로 고정했다. 그 외 계획 범위 변경은 실제 예시 원고를 게시하지 않고 검증 가능한 빈 상태로 남긴 결정뿐이다.

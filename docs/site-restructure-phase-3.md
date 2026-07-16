# 사이트 재개편 3단계 — 간결한 기업 대시보드

## 3단계 목표

8개 기업 상세 화면을 1~2분 안에 현재 상태와 중요한 변화를 파악할 수 있는 공통 대시보드로 정리합니다. 첫 화면은 기업 헤더, 핵심 판단, 핵심 숫자, 핵심 차트, 중요한 변화, 거시 변수만 보여주고 기존 콘텐츠는 접근 가능한 접이식 영역에 보존합니다.

## 기존 화면의 문제

기존 상세 화면은 사업 설명, 산업 흐름, 이벤트, 수요·공급, 관련 기업, Pick, 리포트와 출처가 같은 깊이로 이어졌습니다. 공식 재무 숫자가 있는 기업과 없는 기업의 차이도 view model에서 표현되지 않았고, 상세 route에서 사용하지 않는 가격 요청이 발생했습니다. 구현 전 실제 커버리지는 [기업 대시보드 데이터 감사](company-dashboard-phase-3-inventory.md)에 기록했습니다.

## 8개 기업 데이터 커버리지

| 기업 | 핵심 KPI | 차트 | 중요 변화 | 거시 변수 | 주요 누락 |
| --- | ---: | ---: | ---: | ---: | --- |
| SK하이닉스 | 2 | 1 | 2 | 4 | 현금흐름·밸류에이션 |
| LG전자 | 1 | 0 | 1 | 4 | 일반 재무·현금흐름·밸류에이션 |
| NVIDIA | 3 | 1 | 1 | 4 | 마진·현금흐름·밸류에이션 |
| Micron | 2 | 1 | 2 | 4 | 마진·CAPEX·밸류에이션 |
| Dell | 5 | 1 | 2 | 4 | 마진·현금흐름·밸류에이션 |
| Eaton | 4 | 1 | 1 | 5 | 마진·현금흐름·밸류에이션 |
| Meta | 3 | 1 | 2 | 4 | 광고 재무·현금흐름·밸류에이션 |
| Supermicro | 2 | 0 | 1 | 4 | 일반 재무·현금흐름·밸류에이션 |

LG전자와 Supermicro는 같은 기간·단위로 비교할 수 있는 두 개 이상의 값이 없어 빈 차트를 만들지 않았습니다.

## 최종 정보 구조

1. 기업명, 영문명, 종목코드 또는 ticker, 거래소, 업종, 사업 한 문장과 실제 데이터 기준일
2. 근거 metric 또는 source가 연결된 핵심 판단 최대 5개
3. 기간·통화·단위·출처가 있는 기업별 KPI 최대 6개
4. 같은 기간·통화·단위만 비교하는 SVG 차트 최대 3개
5. 공식 이벤트에서 고른 중요한 변화 최대 3개
6. 검토된 거시 registry에서 고른 변수 3~5개
7. 기본 접힘 상태의 기존 상세 데이터·출처

## Dashboard View Model

`src/content/company-profiles/dashboard.ts`가 원본 profile, 이벤트, 리포트, 거시 brief와 source registry를 화면용 `CompanyDashboardModel`로 바꿉니다. 모델은 `asOfDate`, `assessments`, `metrics`, `charts`, `importantChanges`, `macroVariables`, `sources`, `dataQuality`를 가집니다. 기업별 `CompanyDashboardConfig`는 metric, chart, macro ID만 선택하며 존재하지 않는 ID와 중복은 validator가 차단합니다.

## KPI 선택 기준

- 공식 실적·IR·공시 또는 이미 검토된 기업 이벤트에 숫자가 명시된 경우만 사용합니다.
- 업종 공통 숫자를 강제하지 않고 기업의 현재 분석 질문과 직접 연결되는 숫자를 우선합니다.
- 주문·수주잔고·계획·전망은 실제 매출과 구분한 설명을 붙입니다.
- 모든 카드에 값, 단위, 기간, 비교 정보의 존재 여부, 설명, 원문 접근 경로를 둡니다.
- 한국 기업 금액은 KRW, 미국 기업 금액은 USD를 유지하고 환산하지 않습니다.

## 핵심 판단 생성 기준

판단은 정적 규칙과 근거 ID로만 만듭니다. 전년 성장률처럼 방향을 판단할 근거가 있을 때만 `개선`을 사용하며, 단일 금액만 있거나 다음 단계 확인이 필요하면 `추가 확인 필요`, 필요한 지표가 없으면 `데이터 부족`으로 표시합니다. 런타임 AI, 점수, 별점, BUY/HOLD/SELL, 목표주가는 사용하지 않습니다.

## 차트 선택 기준

차트는 같은 통화, 단위, 회계 기간인 두 값 이상이 있을 때만 구성합니다. 분기와 연간, 실제와 전망을 한 시계열로 연결하지 않습니다. SVG에는 accessible name을 제공하고 같은 데이터의 텍스트 요약과 보조기술용 표를 함께 둡니다.

## 거시 변수 매핑 기준

기존 FRED indicator 정의와 검토된 macro brief만 사용합니다. 기업별로 금리, 금융여건, 유동성, 산업생산·가동률 중 3~5개를 고릅니다. 카드는 최신 숫자를 복제하지 않고 검토된 방향, 기준일, 조건부 영향 경로, 쉬운 설명, 다음 확인 항목과 원자료 링크를 제공합니다.

## 누락·오래된 데이터 처리

- `null`과 없는 값은 `0`으로 바꾸지 않습니다.
- `NaN`, `Infinity`, `undefined` 문자열은 모델 검사에서 차단합니다.
- 데이터 기준일은 profile 검토일, metric 기준일, event 검토일, macro 기준일 중 실제 registry 날짜로 계산합니다.
- 오래됨·재작성·출처 충돌 상태를 타입으로 유지하며 해당 상태가 생기면 핵심 카드에서 표시하거나 제외할 수 있습니다.
- 현재 registry에는 stale·restated·inconsistent로 표시할 dashboard metric이 없습니다.

## 기존 콘텐츠 보존 방식

사업 설명·제품, 산업 흐름, 공식 이벤트, 수요·공급 배경, 관련 기업, 기존 Pick, 기존 공식 수치, 보고서·원문과 주의 문구를 native `<details>`의 `상세 데이터·출처` 안에 보존했습니다. DOM과 보조기술에서 접근 가능하며 기본 상태만 접힘입니다. 기존 8개 route와 영문 alias는 유지합니다.

## 접근성

- heading과 section의 accessible name을 유지합니다.
- 상태는 색상 외에 텍스트로 표시합니다.
- SVG 차트에 `role="img"`와 설명을 제공하고 표·문장 대안을 둡니다.
- 원문 링크는 publisher를 포함한 이름을 사용합니다.
- native `details/summary`와 명확한 focus outline을 사용합니다.
- 320px에서도 가로 overflow가 없도록 보조기술용 표를 별도 clipping container에 넣었습니다.

## 성능

- 기업 route lazy chunk 구조를 유지합니다.
- 상세 route의 사용하지 않는 가격 API 요청을 1회에서 0회로 줄였습니다.
- 홈 entry에는 dashboard registry를 추가하지 않았습니다.
- 신규 API, Serverless Function, dependency는 없습니다.

Production build 기준 비교:

| 자산 | 변경 전 | 변경 후 | 변화 |
| --- | ---: | ---: | ---: |
| 초기 entry raw | 751,281 B | 751,259 B | -22 B |
| 초기 entry gzip | 204.62 kB | 204.58 kB | -0.04 kB |
| 기업 lazy chunk raw | 34.66 kB | 64.19 kB | +29.53 kB |
| 기업 lazy chunk gzip | 9.93 kB | 16.45 kB | +6.52 kB |

기업별 정적 대시보드 구성과 근거가 기업 lazy chunk에만 추가됐습니다. 초기 entry와 첫 화면 요청에는 증가가 없으며, 릴리스 게이트의 entry 예산 raw 825,000 B·gzip 225,000 B를 통과합니다.

## 테스트와 시각 QA

- 데이터 model unit: 8개 모델, KPI·차트·변화·거시 상한, 중복, source, finite number, metadata, 판단 근거를 검사합니다.
- content validator: dashboard registry, 상세 disclosure, 차트 접근성을 검사합니다.
- 지정 7개 viewport와 8개 기업에서 가로 overflow, 경계 이탈, 잘림, `NaN/Infinity/undefined`를 검사했습니다.
- 검색 query 복원, 상세 이동, 브라우저 뒤로 가기와 상세 펼침을 실제 브라우저에서 확인했습니다.
- QA 이미지는 [`artifacts/phase-3-company-dashboard/`](../artifacts/phase-3-company-dashboard/)에 저장했습니다.

## 후속 단계

- 4단계: 기업 리서치 리포트와 인쇄용 PDF
- 5단계: 거시경제 화면 재구성
- 6단계: 기업과 거시경제의 연결 강화
- 7단계: 시장 변곡점 연동

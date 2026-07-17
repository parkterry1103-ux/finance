# Phase 5D · 시장가격과 내재 기대 설명 UX

## 결과와 범위

기존 가치평가는 NVIDIA와 Meta 심층 리포트 아래에 결정론적 FCFF DCF, Reverse DCF, 3개 시나리오와 두 민감도 표로 존재했지만 가치 숫자가 긴 리포트 안에 묻혀 있었다. Phase 5D는 이를 `/ko/companies/{slug}/valuation`의 독립 lazy route에서 `시장가격 → 모형 범위 → 가격 위치 → 내재 매출 성장 → 기대 후보 → 다음 확인` 순서로 설명한다. 행동 지시나 단일 가격 정답을 만들지 않는다.

공개 지원 상태는 8개 기업을 감사한 결과와 같다.

| 상태 | 기업 | 공개 내용 |
| --- | --- | --- |
| full | NVIDIA, Meta | 3개 시나리오, Reverse DCF, WACC×g 민감도, 기대 후보 |
| partial | 없음 | 검증되지 않은 중간 상태를 만들지 않음 |
| unavailable | SK하이닉스, LG전자, Micron, Dell, Eaton, Supermicro | 검증 모형 부재 안내와 재무 추세 연결 |

모형은 2026-07-15 기준의 기존 기업별 artifact를 재사용한다. 가격은 기존 `/api/market-prices` shared state의 같은 통화·실제 저장값을 우선 사용하며, 유효하지 않으면 리포트의 가격 snapshot으로 안전하게 돌아간다. 정규장 종가·기준시각·출처·지연 가능성을 표시하고 가격 기준일과 모형 기준일을 별도로 유지한다.

## 구현

- `src/content/valuation/expectations.ts`: 공개 상태, 가격 위치, 내재 매출 CAGR, 근거 상태와 source validation.
- `src/routes/ValuationExpectationsRoute.tsx`: 범위 시각화, 텍스트 대안, 제한된 WACC·영구성장률 변경, semantic table, 안전한 미지원 상태.
- 기업 상세·재무 피벗·NVIDIA/Meta 리포트는 실제 full 지원일 때만 valuation route를 연결한다.
- 기업 리포트와 모형 데이터는 route 진입 후 현재 slug 하나만 dynamic import한다. 홈과 기업 상세 첫 진입은 계산 엔진이나 리포트 데이터를 선로딩하지 않는다.
- Published 뉴스·편집 콘텐츠는 모형 입력을 자동 수정하지 않는다. 사건과 가정의 연결은 Phase 5E 범위다.

신규 API, Serverless Function, DB, dependency는 없다. Function은 12개다.

## 검증 기준

`scripts/valuation-expectations-unit.ts`는 8개 상태, 3개 시나리오 순서, 범위 아래·안·위, WACC와 g 제약, 내재 기대 유효 범위·해 없음, source/evidence/watch item, 프리미엄 금액 필드 부재, 사용자 문구와 lazy route를 검증한다. Release Gate는 새 route의 dynamic entry와 NVIDIA·Meta 개별 data chunk를 manifest에서 확인한다.

브라우저 QA는 1440×900부터 320×700까지 page overflow, marker·통화·입력·CTA 겹침, table 내부 스크롤, single H1, heading·label·scope, keyboard focus, console error를 확인한다. Production smoke는 full 2개와 unavailable 6개 직접 route, 기존 Company Brief·재무 피벗·리포트·편집·거시 route를 유지한다.

## 남은 한계와 다음 단계

full 모형은 USD 두 기업뿐이며 시장 내재 변수는 한 번에 매출 CAGR 하나만 역산한다. 비교기업 중앙값은 동일 정의의 검증 데이터가 없어 표시하지 않는다. 가격은 저장된 종가로 실시간 시세가 아니며 모델과 가격 날짜가 다를 수 있다. Phase 5E에서 검증 사건이 사업·재무·가정에 미치는 영향을 자동 변경 없이 설명형 연결로 추가한다.

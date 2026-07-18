# 가치평가 기대 모델

## 목적

`ValuationExpectationView`는 새 가치 엔진이 아니라 기존 `ResearchReportModel`을 공개 설명 화면으로 바꾸는 typed view model이다. 가격과 모형의 통화·날짜를 분리하고, 보수·기준·낙관 시나리오를 재계산 없이 재사용하며, 현재 가격이 요구하는 매출 CAGR을 결정론적으로 역산한다.

주요 필드는 `price`, `model`, `scenarios`, `pricePosition`, `impliedExpectation`, `premiumCandidates`, `watchItems`, `sensitivity`, `sourceIds`다. 가격은 값·통화·ISO 시각·세션·source·지연 상태를 가진다. 모형은 version·valuation as-of·financial as-of·last verified를 가진다. `impliedExpectation`은 해가 유효 범위 -20%~100%에 있을 때만 존재한다.

## 프리미엄 후보

프리미엄 후보는 모형과 시장가격의 차이를 설명할 수 있는 사업 기대의 목록이다. 금액 구성요소가 아니며 서로 중복될 수 있다. 따라서 후보별 금액 필드를 금지하고 합산하지 않는다.

각 후보는 다음을 가진다.

- `label`, `explanation`
- `confirmed`, `partiallySupported`, `editorialInference`, `unresolved` 중 하나의 근거 상태
- 존재하는 research evidence ID 1개 이상
- 다음 공식 실적에서 확인할 watch item 1개 이상

현재 NVIDIA 3개, Meta 3개로 총 6개다. 확인된 근거 2, 부분적으로 뒷받침 2, 편집자 추론 2, 미확인 0이다. 편집자 추론도 반드시 검증된 사실 evidence에 연결하며 사실로 승격하지 않는다.

## 다음 확인과 뉴스 경계

watch item은 매출 성장, 마진, 재투자·현금흐름을 다음 공식 분기 실적과 연간 가이던스에서 확인하게 한다. Published 주가해부나 오늘의 월스트리트는 Phase 5E 전까지 DCF 입력, 모형 version 또는 후보 상태를 자동으로 바꾸지 않는다. 연구 데이터 변경은 코드 리뷰·validation·version 변경을 거친다.

## 결측과 지원 상태

`full`은 공개 시나리오·내재 기대·민감도·후보가 모두 검증된 상태다. `partial`은 타입으로 허용하지만 현재 기업은 없다. `unavailable`은 계산값이나 빈 그래프 대신 검증 모형 부재를 표시한다. 통화 불일치, 누락 날짜, 비정상 주식 수, 시나리오 역전, 깨진 source/evidence, 유효 범위 밖 내재 기대는 공개 view 생성에 실패한다.

## Phase 5F 측정 연결

가치평가 route 도착, 가정 설명 펼침과 민감도 조절 영역 첫 접근만 기록한다. 시장가격, scenario value, 내재 CAGR, WACC·영구성장률 입력, 변경 조합 결과와 model gap은 절대 analytics payload에 넣지 않는다. `valuation_view`는 가치평가 지원 상태를 추천 신호로 해석하지 않으며 unavailable 기업의 0값을 만들지 않는다.

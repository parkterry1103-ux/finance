# 사건에서 가치평가 가정까지 연결하는 방법

## 1. 사건을 검증한다

사건은 글로벌 `sourceRegistry`에서 찾을 수 있는 공식 자료 또는 검증된 제한 접근 자료를 가져야 한다. 사건일과 발행일을 구분한다. 주가가 함께 움직였다는 사실만으로 기업 사건의 인과를 확정하지 않는다.

## 2. 사실과 불확실성을 분리한다

confirmed fact에는 statement와 source IDs를 붙인다. 장기 지속성, 순효과, 아직 발표되지 않은 계약·매출·마진은 unresolved로 둔다. 기업 전망은 실현된 사실과 같게 쓰지 않는다.

## 3. 사업 동인을 고른다

사건을 바로 매출이나 DCF 값에 연결하지 않는다. 고객 수요, 가격·제품 구성, 플랫폼 참여, 설비투자처럼 회사가 돈을 버는 구조의 중간 동인을 먼저 선택한다. 방향은 강화·약화·엇갈림·확인 필요이고, 투자 매력도나 주가 방향이 아니다.

## 4. Phase 5C 지표로 연결한다

연결할 metric은 `financialMetricDefinitions`의 공개 18개 중 하나여야 한다. 공시 수치는 수정하지 않는다. 연결 레코드는 사건이 어떤 지표를 다음에 확인하게 하는지 설명할 뿐 숫자를 예측하거나 빈 값을 0으로 채우지 않는다.

## 5. Phase 5D 가정을 검토한다

허용 가정은 매출 성장률, 매출총이익률, 영업이익률, 설비투자율, 재투자율, 성장 지속기간, WACC, 영구성장률, 장기 ROIC와 자본구조다. action은 monitor, scenario review, base-case review, thesis reassessment 중 하나다. `proposedValue`를 impact link에 넣지 않는다.

## 6. 사람이 결정을 기록한다

Published editorial이나 가격 업데이트는 검토 레코드를 자동 생성하거나 기존 모형을 변경하지 않는다. owner가 공식 자료, 기존 모형 기준일과 version을 확인한 뒤 decision을 기록한다.

- 변경 없음: `reviewed_no_change`, 동일한 before/after model version
- 변경 있음: 해당 update status와 별도 `ValuationAssumptionChange`
- 후속 정정: 기존 기록을 삭제하지 않고 후속 impact를 만든 뒤 `superseded`로 연결

## 7. 공개 화면에서 제한한다

Company Brief는 최대 3건, 편집 상세는 명시적 editorial link가 있는 경우, 재무 피벗은 연결 metric row에만 표시한다. 가치평가는 공식 사실, 미확인 항목, 검토 단계, 실제 결정과 model version을 함께 보여준다. 빈 section, 자동 변경 암시, BUY·SELL·목표가격 표현은 사용하지 않는다.

## 현재 Production 적용

NVIDIA FY2027 Q1과 Meta Q1 2026은 각각 공식 실적 source를 사용한다. 두 사건 모두 현재 Phase 5D artifact보다 앞서며 artifact 작성 과정에서 이미 고려됐다. 따라서 시나리오 또는 기준 가정 검토는 기록하지만 추가 변경은 하지 않고 다음 공식 분기를 확인한다.

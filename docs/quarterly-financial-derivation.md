# 독립 분기와 TTM 계산 정책

## flow와 instant

매출, 이익, 현금흐름, EPS와 가중평균 주식수는 기간 flow다. 현금, 자산, 부채, 자본과 기말 발행주식수는 특정 시점 instant다. instant를 분기 합계에 넣지 않는다.

## 독립 분기 우선

SEC의 70~110일 direct context를 독립 분기로 우선한다. direct context가 없을 때만 누적값을 차감한다.

- Q2 = H1 - Q1
- Q3 = 9M - H1
- Q4 = FY - 9M

차감 전 회사, metric, period start, concept/account ID, 통화, 단위, 연결 기준, 정정 기준이 모두 같아야 한다. 종료일 간격은 70~115일이어야 한다. 하나라도 다르면 `definition_mismatch`, `period_not_comparable`, `consolidation_basis_mismatch` 등으로 보류한다.

OpenDART는 Q1의 당기 금액을 독립 분기로 사용할 수 있다. H1·9M은 안전한 이전 누적 input과 account lineage를 연결하기 전까지 독립 분기로 게시하지 않는다.

## TTM

같은 통화·단위·연결 기준의 연속 독립 4분기만 합산한다. 분기 종료일 간격은 각각 75~115일이어야 하며, 누락 분기는 보간하지 않는다. 희석 EPS TTM도 공시 희석 EPS 독립 4분기 합계다. 분할 전후 context가 공시에서 재작성되지 않았거나 ADR 비율이 불명확하면 계산하지 않는다.

## 비교

분기 flow와 마진은 전년 동기의 같은 fiscal period를 먼저 비교한다. 직전 분기 비교는 동일한 기간·정의가 확인될 때만 보조로 사용한다. 마진과 수익률 차이는 `%p`, 성장률은 `%`로 표시한다.

# Financial Pivot 모델

## Phase 5C.1 lineage 확장

기간에는 `periodBasis`, `consolidation`, `metricOrigins`, `metricLineage`를 붙인다. 값 origin은 `reported`, `derived_from_reported`, `market_implied_derived`, `external_reference`, `unavailable`을 구분한다. 응답은 최신 filing identity와 `current`/`stale`/`filing_pending` freshness를 제공한다. 화면은 분기를 기본으로 열고 공시·연결·가격 기준을 먼저 표시한다.

## 구성

`FinancialPivotCompany`는 기존 기업 프로필과 가치평가 준비도 registry에서 파생한다. 회사명·slug·ticker·통화·CIK 또는 corpCode·산업·peer slug를 가진다. 새 기업 registry를 별도로 수기 복제하지 않는다.

`FinancialSeriesPeriod`는 다음 의미를 가진다.

```text
label / periodEnd / fiscalYear / fiscalPeriod
currency / unit(million)
metrics
sourceIds / filingType / filedAt / accessionOrReceiptNumber
```

한 기간 안의 금액은 모두 해당 통화의 백만 단위다. 값이 없으면 property 자체를 생략하며 0을 대입하지 않는다.

## 지표 registry

`FinancialMetricDefinition`은 ID, 한국어 표시명, 6개 그룹, 출력 형식, 변화 단위, 설명과 선택적 계산식을 갖는다. 원자료 지표와 계산 지표를 같은 UI 계약으로 읽되 계산 지표는 필요한 입력이 모두 finite number일 때만 만든다.

계산 지표:

- 매출총이익률 = 매출총이익 / 매출
- 영업이익률 = 영업이익 / 매출
- 순이익률 = 순이익 / 매출
- 잉여현금흐름률 = 잉여현금흐름 / 매출
- 총자산이익률 = 순이익 / 총자산
- 자기자본이익률 = 순이익 / 자기자본
- 자본 대비 차입금 = 총차입금 / (총차입금 + 자기자본)
- 유동비율 = 유동자산 / 유동부채

분모가 0이거나 입력이 없으면 계산 결과도 없다.

## 로딩 경계

`FinancialPivotRoute`는 App에서 lazy import한다. 기본 진입은 현재 기업의 선택 기간만 요청한다. 비교기업 데이터는 사용자가 비교기업 모드를 선택한 뒤에만 연간 기준으로 요청한다. 홈이나 기업 목록은 9개 기업 시계열을 선로딩하지 않는다. Netflix의 audit entry와 Company Brief도 slug별 dynamic import이므로 다른 기업 진입에 포함되지 않는다.

## Netflix 2026-07-18 기준

Netflix는 CIK `0001065280`으로 기존 SEC adapter를 재사용한다. 최신 완료 분기는 2026-06-30 종료 Q2 10-Q(`0001065280-26-000212`, 2026-07-17 제출)이며, 연결 독립 분기 수치만 공개한다. Q2 매출 12,559.938백만달러, 영업이익 4,192.610백만달러, 영업현금흐름 1,743.812백만달러, CAPEX 218.644백만달러로부터 FCF 1,525.168백만달러를 파생한다. 전년 동기 비교는 2025 Q2 같은 fiscal period만 사용하며 배열상 직전 분기와 비교하지 않는다.

## Phase 5F 측정 연결

재무 화면 도착, 지표 묶음 선택, history·peer·industry 비교 모드 선택과 지표 설명 펼침만 기록한다. 기간별 금액, 계산 비율, 비교 중앙값, 기간 label과 공시 원문 URL은 analytics payload에 넣지 않는다. 같은 묶음이나 모드를 다시 누른 동작은 상태 변화가 아니므로 이벤트를 만들지 않는다.

## Phase 5G 역할 경계

기업 상세는 공시 지표 중 대표 근거 하나씩만 핵심 카드에 표시한다. 전체 기간 표, 전년 동기·직전 분기·전년도, 자체 추세, peer·업종 비교와 lineage는 Financial Pivot이 담당한다. 기존 기업 상세 차트는 접힌 상세 데이터 영역에도 보존하지만 첫 화면에서 반복하지 않는다.

## SMCI 2026-07-24 기준

SMCI의 최신 완료 정기공시는 FY2026 3분기 10-Q(`0001375365-26-000014`, 2026-05-11 접수, 2026-03-31 종료)이고 최신 연간은 FY2025 10-K(`0001375365-25-000027`, 2025-08-28 접수)다. 2026-07-21 8-K는 주문·매출·예비 마진 업데이트이며 정기 재무제표를 대체하지 않는다. FY2026 4분기 상태는 `filing_pending`이다.

SEC instant 지표에 `InventoryNet`과 `AccountsPayableCurrent`를 추가했다. 2026-03-31 재고 $11.103B, 매입채무 $3.687B를 주문→조달→출하→현금 전환 검증에 사용한다. 분기 FCF는 동일 누적 시작점·정의·통화·연결 기준을 통과한 9개월 값에서 6개월 값을 차감한 영업현금흐름과 CAPEX로 계산한다. 결측은 0으로 바꾸지 않는다.

# Financial Pivot 모델

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

`FinancialPivotRoute`는 App에서 lazy import한다. 기본 진입은 현재 기업의 선택 기간만 요청한다. 비교기업 데이터는 사용자가 비교기업 모드를 선택한 뒤에만 연간 기준으로 요청한다. 홈이나 기업 목록은 8개 기업 시계열을 선로딩하지 않는다.

## Phase 5F 측정 연결

재무 화면 도착, 지표 묶음 선택, history·peer·industry 비교 모드 선택과 지표 설명 펼침만 기록한다. 기간별 금액, 계산 비율, 비교 중앙값, 기간 label과 공시 원문 URL은 analytics payload에 넣지 않는다. 같은 묶음이나 모드를 다시 누른 동작은 상태 변화가 아니므로 이벤트를 만들지 않는다.

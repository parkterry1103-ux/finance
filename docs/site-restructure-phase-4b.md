# 사이트 재개편 4B — 기업 리서치 리포트 파일럿

## 범위

4B는 기존 8개 기업 대시보드 가운데 NVIDIA와 Meta Platforms 두 곳에만 웹 리서치 리포트를 추가한다. 공개 경로는 `/ko/companies/nvidia/report`, `/ko/companies/meta/report`이며 다른 기업의 같은 패턴 경로는 기존 not-found 경험을 사용한다. 기업 검색·대시보드와 나머지 공개 기능은 유지한다.

## 정보 구조

각 리포트는 같은 순서로 읽힌다.

1. 표지와 한 문장 결론
2. 사업 구조와 경쟁
3. 실적과 핵심 동인
4. 현금흐름·재무·자본수익성
5. 모형 가치와 민감도
6. 산업과 거시 변수
7. 확인 계기·위험·다음 점검
8. 출처·방법론·한계·주의 문구

NVIDIA와 Meta 기업 대시보드에만 `리서치 리포트 읽기` 링크를 표시한다. 대시보드는 리포트 registry나 본문을 import하지 않는다. App은 공통 renderer를 lazy route로 불러오고 renderer 내부 registry가 선택된 기업 모듈 하나만 dynamic import한다. 따라서 검색 진입 chunk, 기업 대시보드 chunk, 다른 기업 리포트 본문이 함께 로드되지 않는다.

## 구현 경계

- 4A `artifacts/phase-4a-valuation/{nvidia,meta}`를 입력 단일 원천으로 사용한다.
- 공개 리포트에서 기존 FCFF 엔진을 다시 실행하고 저장 결과와 unit test에서 수치 일치를 확인한다.
- 신규 외부 API, 공개 API, Serverless Function, DB, migration, cron, sync endpoint, dependency를 추가하지 않는다.
- 런타임 외부 데이터 요청 없이 정적 snapshot과 원문 링크만 사용한다.
- 실시간 시세, 분석가 컨센서스, 자동 관계 생성, 행동 지시는 포함하지 않는다.
- `package.json`, `package-lock.json`은 변경하지 않는다.

## 반응형·인쇄

화면 본문은 가로 스크롤을 만들지 않는다. WACC×영구성장률과 기업 driver 5×5 표만 명시적이고 키보드 접근 가능한 국소 스크롤 영역을 가진다. 차트는 접근 가능한 이름·요약·원자료 표를 함께 제공한다. CTA와 주요 컨트롤은 최소 44px이다.

인쇄는 브라우저 `window.print()`만 사용한다. `@page`는 A4, 여백은 위 16mm·좌우 14mm·아래 18mm다. 화면 내비게이션과 인쇄 버튼을 숨기고 흰 배경을 사용하며, 카드·표·증거 행의 불필요한 페이지 분할을 피한다.

## 검증

`scripts/research-report-unit.ts`는 다음을 확인한다.

- registry가 NVIDIA·Meta 정확히 2개인지
- 모든 사실·계산·해석과 본문 claim의 근거 연결이 유효한지
- 차트의 모든 점에 출처가 있는지
- 4A 기준 주당 결과·기업가치·주주가치·WACC·관측 가격이 숫자로 일치하는지
- 두 5×5 민감도 표, 세 조건, 역산 DCF 수렴 여부
- lazy route, CTA 범위, print action, A4 margin
- 공개 문구의 금지 표현 부재

브라우저 QA 산출물과 실제 PDF는 `artifacts/phase-4b-research-report/` 아래에 둔다.

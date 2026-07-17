# Phase 5B — 기업 상세 핵심 판단 개편과 주가해부 게시 기준

## 목적

뉴스룸에서 기업 페이지로 이동한 사용자가 1분 안에 사업 구조, 최근 변화, 가치에 미치는 의미, 핵심 위험, 다음 확인 항목을 읽도록 첫 화면의 우선순위를 바꾼다. 기존 재무·공시·시장·산업 데이터는 삭제하지 않고 결론 아래에 그대로 둔다.

## SK하이닉스 최초 게시물 정리

`2026-07-13-sk-hynix-selloff`는 Phase 5A.1 게시 흐름 검증을 위한 최초 콘텐츠였다. 향후 주가해부는 검증 리서치, 웹 본문, 구조화 handoff를 함께 전달하는 표준 입력 방식으로 운영하므로 이 게시물과 홈·인사이트·기업 relation을 제거하고 새 콘텐츠부터 정식 운영을 시작한다. 이 기록은 콘텐츠의 진위나 오류에 관한 판단이 아니며 Git 이력에 보존된다.

SK하이닉스 기업 프로필, 검색, 재무·공시 데이터와 `/ko/companies/sk-hynix` route는 유지한다. Published relation이 없을 때 `최근 관련 리서치` 섹션은 렌더링하지 않는다.

## 기업 Brief 구조

지원 기업 8개 모두에 저장소의 기존 기업 view model과 source registry를 재사용하는 `CompanyBriefConfig`를 둔다. route가 선택된 기업의 config만 동적 import하고 다른 7개 Brief와 리서치 리포트 본문은 선로딩하지 않는다.

첫 화면 순서는 다음과 같다.

1. 기업명, ticker, 시장, 한 문장 사업 정의, 분석 기준일
2. 돈을 버는 구조, 최근 변화, 왜 중요한가, 가장 큰 위험, 다음 확인
3. 비교 가능한 핵심 숫자 최대 3개
4. Published 관련 리서치 최대 2개(있을 때만)
5. 숫자와 비교 보기, 실제 route가 있는 기업의 심층 리포트 읽기
6. 기존 판단·지표·차트·변화·산업·공시·출처

NVIDIA와 Meta만 기존 심층 리포트 CTA를 표시한다. 비교값이 없으면 수치를 만들지 않고 `직접 비교 자료 없음`으로 표시한다. 마진·수익률의 차이는 `%p`, 성장률은 `%`를 사용한다.

## 데이터와 보호 원칙

- 숫자는 기존 기업 dashboard metric과 source registry에서만 가져온다.
- 각 질문은 하나 이상의 source ID를 가진다.
- 지표는 finite number, 단위, 기간, source를 모두 가져야 한다.
- 지원하지 않는 slug, 깨진 editorial ID, 깨진 report route를 validation에서 거부한다.
- 기존 기업 8개, 재무·공시·시장·산업 연결, 차트·표, NVIDIA·Meta 리포트와 거시 route를 유지한다.
- 신규 API, Serverless Function, DB, dependency는 추가하지 않는다.

## 접근성·반응형

기업명은 페이지의 유일한 `h1`이며 질문은 문서 순서대로 읽힌다. CTA와 출처 링크의 최소 터치 영역은 44px이고 `:focus-visible` 표시가 있다. 900px 이하에서는 2열, 640px 이하에서는 1열로 전환한다. 긴 한국어와 단위는 카드 내부에서 줄바꿈한다.

## 검증과 게시

Company Brief validator와 unit은 기업 8개, 질문 40개, 지표 최대 3개, source·기간·단위, `%`/`%p`, editorial/report relation을 검사한다. 주가해부 게시 계약은 [stock-dissection-intake.md](stock-dissection-intake.md), 모델은 [company-brief-model.md](company-brief-model.md)에 기록한다. 정적 검사와 Production 결과는 [Phase 5B Plan HTML](plans/phase-5b-company-brief-plan.html)에 누적한다.

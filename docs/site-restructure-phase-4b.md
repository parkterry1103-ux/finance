# 사이트 재개편 4B 최종 — 시점형 기업 리서치

## 범위

NVIDIA와 Meta Platforms 두 리포트만 공개한다. 경로는 `/ko/companies/nvidia/report`, `/ko/companies/meta/report`다. 나머지 6개 기업에는 CTA·빈 리포트·예고 화면을 만들지 않는다.

리포트는 런타임에서 뉴스에 따라 바뀌지 않는다. 각 기업 모듈은 버전, 작성일, 업데이트일, 뉴스 반영 기준, 시장가격·재무·가치평가·업종 기준일을 가진 정적 snapshot이다. 리포트 갱신은 새 snapshot 작성, validator, 브라우저 QA와 배포를 거친다.

## 읽기 흐름

1. 표지와 기준일
2. 현재 핵심 판단
3. 작성 시점 핵심 이슈
4. 해자
5. 재무건전성
6. 산업·경기 사이클 역할
7. 실적과 현금흐름
8. 가치평가 방식 선택 이유
9. 시장가격과 모형 가치
10. Reverse DCF 시장 기대
11. 산업 기준 비교
12. 가치 변수·민감도·뉴스 전달 경로
13. 위험과 다음 확인
14. 출처·계산 방법·한계·면책

## 공개 표현

본문은 자연스러운 한 열 문단과 문장 끝 출처 번호를 사용한다. 내부 evidence의 유형, source ID, metric ID, calculation ID, accession과 XBRL concept은 유지하지만 공개 화면의 분류 배지와 전용 원장 영역은 제거했다. 출처 목록에는 출처명·문서 유형·공시일·대상 기간을 먼저 보여주고 기술 정보는 접어 둔다.

인쇄·PDF 저장 버튼, PDF 안내, 다운로드 CTA와 A4 전용 스타일은 제거했다. 기본 브라우저 인쇄에서 내비게이션과 목차만 숨기는 최소 print CSS만 유지한다. 과거 QA PDF는 증빙 artifact로만 보존하며 공개 화면에서 연결하지 않는다.

## 레이아웃 수정

기존 구조는 본문, 유형 배지와 출처 링크를 같은 다중 열 grid에 두어 긴 한국어 문단이 `min-content` 폭으로 축소될 가능성이 있었다. 새 `research-paragraph`는 `min-width: 0`, `max-width: 100%`를 사용하고 문단은 `word-break: keep-all`, `overflow-wrap: break-word`, `writing-mode: horizontal-tb`로 고정한다. 출처 번호는 문장 끝 `inline-flex` 묶음이다.

민감도 표만 키보드 접근 가능한 국소 가로 스크롤을 허용한다. 다른 카드·차트·표는 모바일에서 한 열 또는 블록 행으로 바뀐다. 링크·요약 컨트롤은 최소 44px이며 focus ring을 유지한다.

## 구현 경계

- 4A `artifacts/phase-4a-valuation/{nvidia,meta}`와 기존 FCFF 엔진을 단일 계산 원천으로 사용한다.
- 뉴스는 기존 검증 데이터, 기업 IR, SEC, 공식 산업·거시 자료에서 선별해 정적으로 저장한다.
- 신규 뉴스 API, 공개 API, Serverless Function, dependency, DB, migration, cron, sync endpoint가 없다.
- 런타임 외부 뉴스 요청, 실제 sync, Production 쓰기가 없다.
- `package.json`, `package-lock.json`을 변경하지 않는다.

## 검증

`scripts/research-report-unit.ts`는 snapshot 날짜, 뉴스 수·중복·cutoff·출처·전달 경로, 네 핵심 판단, 해자 약화 조건, 재무 지표 source/metric 연결, 산업 역할, 4A WACC·영구성장률·Terminal ROIC·시나리오·Reverse DCF 일치, 프리미엄·할인 fixture, 업종 집계치 표시, 공개 배지·원장·인쇄 버튼 제거를 검사한다.

브라우저 QA는 1440×900, 1280×800, 1024×768, 768×1024, 390×844, 360×800, 320×700에서 세로 한 글자 줄바꿈, 출처 분산, 큰 빈 공간, 전체 overflow, 제목 잘림, 차트 겹침, 터치 영역, focus와 표 header를 확인한다.

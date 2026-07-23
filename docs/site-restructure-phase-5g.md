# Phase 5G — 모바일 기업 해부와 홈 단순화

## 목적

홈에서 기업을 찾고, 기업 상세 첫 화면에서 성장성·수익성·해자·재무건전성·밸류에이션의 구조적 상태를 10초 안에 읽도록 정보구조를 다시 나눈다. 단기 사건과 주가 반응은 구조적 상태와 합산하지 않는다.

## 시작 감사

- 홈은 검색 hero, 오늘의 주가해부, 월가인사이트, 중복 기업 CTA의 네 영역이었다.
- 기업 상세는 다섯 질문, 최대 3개 지표, Event Impact, 관련 편집물, CTA 뒤에 assessment·전체 지표·차트·변화·거시 변수가 다시 나왔다.
- Research Report가 Valuation의 가격·시나리오·역산 기대·확률 분포·민감도 표를 다시 렌더링했다.
- `HomeEntry`, `HomeEntryCard`와 전용 `simplified-home-*` CSS는 어떤 화면에서도 사용되지 않았다.
- 현재 main의 실제 inventory는 Netflix를 포함한 기업 9개와 Published editorial 3개다. 기존 Published·point-in-time 기록은 삭제하지 않았다.

## 구현

- 홈의 핵심 영역을 Company Registry 검색, 최신 주가해부, 최신 월가인사이트로 제한했다.
- 기업 상세는 4개 핵심 카드, 5축 SVG, 시장 기대·모멘텀, 다음 확인, 역할별 CTA 순서다.
- 모바일 축 선택은 focus trap이 있는 bottom sheet, 데스크톱은 인접 detail panel을 사용한다.
- `확인 부족`은 위치값 `null`로 보존하고 중간값으로 바꾸지 않는다.
- 기존 기업 숫자와 차트는 삭제하지 않고 접힌 상세 데이터 영역에 보존했다.
- Research Report는 장기 판단 브리프와 고급 근거만 렌더링하며 완전한 가치평가 UI는 Valuation으로 연결한다.
- 검색과 기업 해부 config는 기업별 dynamic import 경계를 유지한다.

## 삭제와 보존

삭제한 런타임 항목은 미사용 `HomeEntry`, `HomeEntryCard`, `homeEntries`, `simplified-home-*` CSS와 홈의 중복 기업 CTA다. 사용 중인 route, Published 콘텐츠, 공시 lineage, 가치평가 artifact, 정정·감사 문서와 기존 차트 데이터는 보존했다. 장기 기업 판단에서 제거된 가치평가 표도 원본 report model과 artifact에는 남아 재현 가능하다.

## 범위

신규 DB, API, Serverless Function, npm dependency, 자동 기업 온보딩, 뉴스 자동 수집은 없다. Phase 5F provider와 custom event flag도 변경하지 않는다. Serverless Function 기준은 12개다.

## 관련 문서

- [모바일 기업 해부 모델](mobile-company-dissection-model.md)
- [기업 검색 index](company-search-index.md)
- [업종·peer 정책](company-industry-peer-policy.md)
- [분석 화면 역할 경계](research-surface-boundaries.md)
- [브라우저 계획·결과](plans/phase-5g-mobile-company-dissection-plan.html)

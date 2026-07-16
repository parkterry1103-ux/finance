# 기업 리서치 가치평가 UX·레이아웃 수정

## 붕괴 원인

이전 공개 화면은 본문, 분류 배지와 출처 링크를 같은 grid 행에 배치했다. 좁은 화면에서 고정 폭 유형 열과 citation 셀이 먼저 공간을 차지하고 본문이 `min-content` 폭으로 축소될 수 있었다. 한국어 문단과 각주 링크가 서로 다른 grid cell로 흐르면서 한 글자 줄바꿈과 출처 분산이 발생할 여지가 있었다.

## 수정

- 본문을 `research-paragraph` 단일 열로 변경했다.
- `min-width: 0`, `max-width: 100%`, `word-break: keep-all`, `overflow-wrap: break-word`, `white-space: normal`, `writing-mode: horizontal-tb`를 적용했다.
- 출처 번호를 문장 끝 `research-citations` inline-flex 묶음으로 렌더링한다.
- 분류 배지, 유형별 색상과 전용 원장 component를 제거했다.
- 시나리오는 좁은 화면에서 한 열 카드, 업종 비교 표는 모바일 블록 행으로 바꿨다.
- 민감도 표만 국소 가로 스크롤을 허용한다.

## 가치평가 읽기 순서

먼저 Driver-based FCFF DCF를 선택한 이유와 쉬운 설명을 보여준다. 다음으로 같은 snapshot의 시장가격·보수·기준·낙관 결과와 기준모형 괴리율을 보여준다. Reverse DCF는 고정 가정과 전망기간을 함께 제시하고, NYU Stern 값은 직접 peer 중앙값이 아닌 업종 집계치로 명확히 구분한다.

프리미엄·할인은 행동 지시가 아니다. 목표주가, 적정주가, 상승·하락여력, BUY·HOLD·SELL을 표시하지 않는다.

## 제거한 기능

공개 인쇄·PDF 저장 버튼, PDF 다운로드·저장 안내, A4 `@page`와 복잡한 출력 전용 레이아웃을 제거했다. 내비게이션을 숨기는 최소 print CSS만 남겼다.

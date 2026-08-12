# Investment Thinking Lab 모델

Phase 6A는 기업의 현재 상태를 완성된 답처럼 보여주는 대신, 사건을 본 뒤 생각이 어떻게 원칙으로 바뀌는지 기록한다. 새 모델은 Company Judgment, Financial Pivot, Valuation, Research Report와 독립적이다.

## 정보 구조

```text
홈
→ Pilot Case
→ 01 사건
→ 02 가설
→ 03 판단
→ 틀렸다는 신호
```

홈에는 경량 Case metadata와 Rulebook v0.1만 포함한다. Case 본문은 `/ko/lab/cases/:slug`에서 lazy import한다.

## 개념

- Rule: 현재 채택한 편집 가능한 투자 원칙이다. 절대적 진리나 점수가 아니다.
- Hypothesis: 제한된 범위에서 시험 중인 설명이다. 사례가 쌓이면 강화·수정·폐기할 수 있다.
- Case: 한 사건에서의 첫 생각, 익숙함, 가능한 편향, 가설, 관심 순서와 반증 신호를 기록한다.
- Review: Case의 실제 결과를 되돌아보는 모델이다. Phase 6C 전에는 구현하지 않는다.

## Pilot #001의 근거 경계

2026년 8월 10일 정책 뉴스는 사용자가 제공한 editorial input으로 표시한다. 저장소에서 검증된 정책 원문을 확인하지 못했으므로 지원 규모, 개별 기업 수혜와 가격 숫자를 추가하지 않는다.

기업 사업 설명은 다음 공식 자료에 한정한다.

- 제주반도체 2025 사업보고서: 팹리스, 저전력 메모리와 외부 위탁생산 구조
- 어보브반도체 2026년 1분기 보고서: MCU 사업, 고객 개발 생태계와 제품 구성
- 넥스트칩 2025 사업보고서: 차량용 ISP·AHD·ADAS SoC 사업 구조

관심 순서와 단기 반응 예상은 사실이 아니라 개인의 해석 또는 가설이다. recommendation, 점수, 확률, 확정적 가격 전망으로 바꾸지 않는다.

## 런타임 경계

- 홈: `src/content/investment-thinking/registry.ts`의 summary와 `rulebook.ts`만 사용
- Case route: `registry.ts`의 loader로 현재 Case 본문만 로드
- 공식 근거: 기존 `src/content/sources` registry 재사용
- analytics: 기존 route pageview와 editorial event 계약 재사용
- 신규 API, DB, Serverless Function, provider, dependency 없음

## Phase 6B 정리 대상

새 방향이 Pilot로 확인된 뒤 다음 런타임을 별도 감사해 정리한다.

- `App.tsx`에 남아 있는 구형 LandingPage와 중복 홈 구현
- legacy Picks 진입·아카이브와 새 Case가 중복하는 관심 기업 서술
- 홈과 내비게이션의 중복 CTA
- Company Judgment·DCF·Radar·재무 중심 진입 구조 가운데 새 제품 핵심 흐름에 필요하지 않은 런타임

공식 출처, 공시 lineage, point-in-time 판단, 가치평가 버전, 정정 기록과 기존 Production route 데이터는 삭제 대상이 아니다.

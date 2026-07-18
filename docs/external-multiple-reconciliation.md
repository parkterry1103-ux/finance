# 외부 멀티플 교차검증

외부 사이트 값은 원자료가 아니라 사이트 내부 계산을 검산하는 참고값이다. 기업별 2곳에서 provider, 값, 정의, trailing/forward, basic/diluted, GAAP/adjusted, 가격 기준일, 재무 기간, 조회일, URL과 차이 상태를 기록한다. 공급자가 세부 정의를 공개하지 않으면 값을 추측하지 않고 `definition_not_disclosed`로 남긴다.

## 확인 순서

1. ticker와 주식 종류가 같은지 확인한다.
2. 가격 날짜와 regular/after-hours 세션을 확인한다.
3. trailing/forward, GAAP/adjusted, basic/diluted를 구분한다.
4. TTM 기간, fiscal year end, split·ADR·주식수 기준을 확인한다.
5. 내부 공시 분모를 바꾸지 않은 상태에서 차이를 분류한다.

## 상태

- `matched`: 사실상 동일
- `matched_with_rounding`: 절대 0.15배 또는 상대 1.5% 이내
- `definition_difference`, `timing_difference`, `share_basis_difference`, `adr_ratio_difference`
- `gaap_vs_adjusted`, `trailing_vs_forward`, `stale_external_value`
- `unresolved_difference`: 원인을 설명하지 못해 Review 유지

외부 값에 맞추려고 공시 수치를 조정하지 않는다. 정의를 알 수 없는 값은 일치 판정에서 제외한다. 화면에는 최대한 간결하게 차이 유형을 표시하고 전체 기록은 감사 문서와 typed registry에서 확인한다.

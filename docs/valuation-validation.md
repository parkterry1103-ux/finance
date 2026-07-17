# 가치평가 공개 Validation

## 차단 오류

공개 가치평가 view는 다음을 차단한다.

- 8개 지원 registry 밖 slug, 중복 slug, 잘못된 공개 상태
- 가격·통화·가격 시각·모형 기준일·마지막 검증일 누락
- 0 이하 가격 또는 희석주식 수, NaN, Infinity
- 가격과 모형의 통화 불일치
- 보수 ≤ 기준 ≤ 낙관 순서 위반
- 음수·비정상 기업가치와 `WACC <= g`
- Reverse DCF 비수렴, -20%~100% 밖 해
- 깨진 source ID·evidence ID, 비어 있는 watch item
- 프리미엄 후보의 금액 필드
- 사용자 화면의 행동 지시·단일 가격 정답 표현

엔진 validation은 순현금·순부채 equity bridge와 source provenance를 검증하고, 공개 view validation은 가격·시나리오·내재 기대·후보 계약을 추가한다. 순서를 맞추기 위해 값을 정렬하지 않고 원본 순서 오류로 실패시킨다.

## 자동 검사

`npm run validate:valuation`은 기존 FCFF·WACC·terminal·normalization·scenario·sensitivity·Reverse DCF artifact를 검사한다. `npm run validate:valuation-expectations`은 full 2, partial 0, unavailable 6, 범위 위치, no-solution, WACC/g 제한, source/evidence/watch, route 연결과 문구를 검사한다. 두 검사는 Release Gate의 blocking check다.

UI에서는 계산 불가를 0으로 바꾸지 않는다. unavailable 기업은 검증 모형 부재와 재무 추세 링크만 표시한다. 가격만 업데이트된 경우 사업 가정은 변경되지 않으며 뉴스 게시도 모형을 자동 변경하지 않는다.

# 재무 데이터 Validation

## Phase 5C.1 추가 검사

`npm run validate:filing-freshness`는 8개 기업의 최신 연간·분기 filing identity, 연결 기준, 가격일 이전 제출 여부, 외부 값 2곳과 ADR 상태를 검사한다. `npm run validate:multiples`는 독립 분기 누적 차감, 연속 4분기 TTM, PER·PBR·PSR, 음수 분모, ADR 환산, 외부 오차 분류와 구체적 결측 문구를 검사한다. OpenDART 지원 기업의 OFS 자동 fallback은 허용하지 않는다.

## 입력 검증

- 지원 기업은 기존 8개 프로필과 일치해야 한다.
- 미국 기업은 CIK, 한국 기업은 OpenDART corpCode가 있어야 한다.
- companySlug와 지표 ID는 중복될 수 없다.
- periodEnd, 통화, 백만 단위와 source 추적 정보가 있어야 한다.
- metric 값은 finite number만 허용한다.

## 비교 검증

- 0 분모 성장률을 계산하지 않는다.
- 흑자·적자 부호 전환을 상대 증가율로 표시하지 않는다.
- 마진 변화는 `%p`, 금액·주당 변화는 `%`를 사용한다.
- CAGR은 양수 시작·종료값과 유효한 기간 간격이 있을 때만 계산한다.
- peer 중앙값은 결측치를 제외하며 통화가 다른 절대값을 합치지 않는다.
- 기간과 회계 기준이 다르면 QoQ·YoY를 만들지 않는다.

## UI 검증

- 첫 열은 `scope=row`, 기간은 `scope=col`인 시맨틱 표다.
- 가로 스크롤 영역은 키보드 focus를 받을 수 있다.
- 행 설명 버튼은 `aria-expanded`를 제공한다.
- 단위, +/− 기호와 결측 사유를 텍스트로 제공한다.
- 320px에서 페이지 전체 overflow 없이 표 내부만 스크롤한다.

`npm run validate:financials`와 `npm run release:gate`가 위 계약의 정적·단위 회귀 검사를 실행한다.

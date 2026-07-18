# Phase 5F — 콘텐츠 유입·리서치 전환 행동 측정

## 목적

Phase 5F는 외부 콘텐츠에서 들어온 사용자가 편집물을 읽고 기업, 재무, 가치평가, 심층 리포트로 이동하는 과정을 최소한의 익명 이벤트로 설명한다. 측정은 제품의 판단 근거를 개선하기 위한 것이며 광고 타게팅, 개인 프로필, 투자 성향 분류에 사용하지 않는다.

## 시작 감사

- 시작 SHA: `f24d9fbd2acdef0f2737abfd6e8baa8fc3f65e54`
- 기존 analytics SDK·script·event: 0
- 기존 analytics cookie·사용자 ID·동의 UI: 0
- 라우터: `history.pushState`와 `popstate`를 사용하는 자체 SPA 라우터
- Serverless Function: 12
- Published 편집물: 3Reads 1건, 주가해부 0건
- 기업: 8개
- full 가치평가·심층 리포트: NVIDIA·Meta 2개

## 구현 구조

`src/analytics`는 UI와 공급자를 분리한다.

1. `routes.ts`: 실제 path를 query·hash 없는 route template으로 정규화한다.
2. `attribution.ts`: 허용된 UTM 네 값과 referrer 범주만 탭 session에 보존한다.
3. `validation.ts`: 이벤트별 payload allowlist와 금지 필드를 검증한다.
4. `provider.ts`: Vercel Web Analytics와 테스트 adapter를 같은 계약 뒤에 둔다.
5. `runtime.ts`: SPA pageview, Strict Mode 중복 방지, 읽기 깊이와 완료 조건을 관리한다.

UI는 `trackAnalyticsEvent`만 호출하며 `window.va`를 직접 참조하지 않는다. 공급자 오류는 route 이동이나 버튼 동작을 중단시키지 않는다.

## 공급자 결정과 현재 제한

finance1의 Vercel Web Analytics를 활성화했다. 기본 pageview는 Production에서만 query·hash를 제거한 path와 route template으로 전송한다. Preview와 Development는 공급자 네트워크 전송을 하지 않고 로컬 QA record만 남긴다.

현재 team은 Hobby 플랜이다. Vercel의 공식 custom event 수집은 Pro·Enterprise 기능이므로 `VITE_ANALYTICS_CUSTOM_EVENTS=true`가 명시되지 않은 현재 Production에서는 21개 custom event를 외부로 보내지 않는다. 코드는 typed contract, UI 연결, validator와 test adapter까지 완성하되 결제 승인 없이 플랜을 변경하거나 다른 tracker로 우회하지 않는다.

따라서 완료 상태는 다음처럼 구분한다.

- 기본 익명 pageview: 배포 후 실제 network와 dashboard 반영 확인
- 21개 행동 event: 코드·단위·브라우저 검증 완료
- 21개 행동 event Production 수집: Pro 승인과 실제 transport 확인 전까지 제한

## 사용자 흐름

```text
Instagram·검색·직접 유입
→ research landing
→ editorial view
→ 25·50·75·90% 읽기
→ 90% + 10초 완료
→ 기업 클릭 / 기업 도착
→ 재무·가치평가·리포트 클릭 / 각 도착
→ 묶음·비교 모드·지표 펼침
```

클릭은 의도이고 도착은 화면이 실제로 열린 결과다. 두 이벤트를 합치지 않는다.

## 구현하지 않은 것

- 관리자 dashboard, DB, 공개 API, Serverless Function
- 신규 npm dependency
- 광고 tracker, fingerprinting, session replay, heatmap
- 원문 검색어·전체 query·전체 referrer·전체 URL 저장
- 가격·재무 금액·WACC·성장률·모형 가치 전송
- 사용자 ID·이메일·계정·브라우저 fingerprint
- 유료 플랜 변경

## 검증

- `npm run validate:analytics`
- `npm run typecheck`
- `npm run build`
- 기존 editorial·financial·valuation·event impact·research report validator
- `npm run release:gate`
- Chromium·WebKit·실제 Safari에서 SPA·hash·뒤로가기·실패 격리 확인
- Production에서 `/_vercel/insights/script.js`와 pageview transport 확인

최종 Git·PR·배포·성능·브라우저 결과는 `docs/plans/phase-5f-research-funnel-analytics-plan.html`에 갱신한다.

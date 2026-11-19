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

## 방문자가 직접 판단하는 연습 확장

2026년 11월 확장에서는 기존 Published·ownerVerified 주가해부 3건(Intel, SMCI, Netflix)을 재사용하고, 11월 6일에는 `sourceVerified` 인텔 업데이트(가격 기준 11월 5일)를 더해 4개 시점 사례를 제공한다. 새 검토 방식은 AI 보조 출처 대조이며 소유자 직접 검토를 뜻하지 않는다. 최신 인텔은 시장·산업·기업 요인을 별도 필드로 나누고 기존 인텔 ID·가격일·메모를 덮어쓰지 않는다. `practice.ts`는 경량 summary에서 진입 목록을 만들고 본문은 선택 route에서만 불러온다. `/ko/lab/cases/practice-:editorial-slug`가 새 연습 route이며 기존 `/ko/lab/cases/pilot-001` 작성자 기록은 보존한다. 정책 Pilot을 검증된 정책 사건으로 승격하지 않는다.

홈의 주요 행동은 `사건 하나로 내 판단 남기기`다. 연습은 `내 판단 → 근거 점검 → 돌아보기` 세 단계다. 첫 단계에서는 기업·시장·업종의 같은 날짜 수익률과 발표 사건·출처를 보고 시장/산업/기업/복합/판단 보류 중 하나를 선택한다. 최초 판단을 저장한 뒤 다섯 공통 질문과 작성자 해설을 볼 수 있다. 작성자 해설은 정답이 아닌 사후 편집 해석이다. 질문별 점검 메모도 확인 근거·수정 이유와 함께 재검토 저장 시 영속화한다. 저장 전 입력은 임시이며 자동 저장하지 않는다.

정보의 시점을 세 가지로 나눈다: 사건 기준일, 가격 기준일, 원고 발행일. 출처의 `publishedAt`과 `asOf`를 구분하고 발행 시각이 없으면 미확인으로 표시한다. 가격 기준일 뒤에 발행된 자료는 당시 원인 근거에서 제외한다고 명시한다. 수익률 차이를 원인 기여도로 계산하지 않으며 비교일이 다르면 해당 benchmark를 생략한다. 현재 작성 시각은 과거 사례의 가격 시각이나 예측 시각으로 취급하지 않는다.

`journal.ts`의 version 1 기록은 case ID와 가격 기준일에 귀속된다. 최초 판단을 보존하고, 확인한 근거·유지/수정 이유·다른 설명·반증 신호·파급효과 가설을 최대 50개 재검토로 추가한다. 모든 입력은 React text로 렌더하며 3,000자 상한을 둔다. localStorage의 손상·접근 차단·용량 실패를 표시하고 저장 성공 전에는 성공으로 안내하지 않는다. 다른 탭의 변경은 storage event로 반영하고, 이전 값을 비교해 오래된 기록의 덮어쓰기를 막는다. 텍스트·JSON 다운로드와 사례별 확인 후 삭제를 제공한다.

개인 메모는 브라우저에만 저장하고 서버·analytics로 보내지 않는다. 신규 API, Function, provider, DB, dependency와 런타임 AI 호출은 없다. 기존 자료를 사용하는 사후 학습이며 자동 원인 판정·점수·수익률 예측은 제공하지 않는다. 이 확장은 로컬 브랜치 개발이며 병합·Production 배포는 별도 상태다.

### 로컬 검증

화면에서는 제작 목적 설명과 Rulebook·Rule ID·원칙 소개 영역을 제거했다. 홈은 사건과 기업 검색·기존 리서치를 바로 보여주며, 주요 CTA는 `내 생각 기록하기`다. 내부 Rule·Hypothesis registry와 기존 route·기록 데이터는 보존한다. 사용자에게 보이는 navigation은 `사건 보기 / 기업 찾기 / 리서치`다.

추가된 `/ko/records`는 `내 기록` navigation으로 연결된다. 기업명·ticker·사건명 검색, 재검토 전/있음 필터와 최근 기록 순 정렬을 제공하고 최초/최근 분류를 함께 보여준다. metadata와 기존 localStorage만 읽으며 본문과 가격 API를 요청하지 않는다. 전체 백업은 `stock-autopsy-journals` version 1 형식이고 기존 단일 사례 JSON도 복원할 수 있다. 파일은 16MB로 제한하며 전체 내용을 검증·정규화한 뒤 미리보기를 보여준다. 확인 전 쓰기 0, 기존·손상 기록 덮어쓰기 0이며 부분 저장 실패는 성공·유지·실패 수를 각각 알린다. 취소·완료 후 focus는 파일 불러오기 trigger로 돌아간다. 최종 navigation은 `사건 보기 / 내 기록 / 기업 찾기 / 리서치`다.

- `npm run validate:thinking-lab`: 76개 검사. 최초 판단 불변, 재검토 순서, 다른 사례·기준일 격리, 손상/버전 불일치, 저장 실패, stale write 충돌, 질문 메모와 내보내기, 동일 비교일, draft 제외, 보관함 검색·정렬·필터와 백업 복원을 검사한다.
- Application TypeScript, 콘텐츠 validator, Vite production build와 bundle budget 검사는 통과했다.
- `scripts/thinking-practice-browser-qa.mjs`: Chromium의 1280×844, 390×844, 360×800, 320×700, 640×800에서 작성·근거 점검·재검토·reload·텍스트/JSON 다운로드·다른 사례 격리·삭제를 검증한다. 별도 흐름에서 손상 저장소, 용량 실패, 다중 탭, invalid route와 기존 Pilot 보존을 검사한다. 실행 시 기존 브라우저 QA와 같이 `CODEX_NODE_MODULES`를 지정하며 필요하면 `CHROMIUM_EXECUTABLE_PATH`, `THINKING_PRACTICE_ENGINES=chromium`을 지정한다.
- 주요 연습 흐름에서 overflow, console error, API request, 개인 메모 외부 전송은 각각 0이다. 스크린샷과 JSON 결과는 ignored 경로 `artifacts/thinking-practice/`에 남긴다.
- 설치된 WebKit 실행 파일이 시작 단계에서 응답하지 않아 WebKit 통과를 주장하지 않는다.
- 전체 Release Gate는 29개 중 28개 통과, 기존 개발 의존성 `npm audit`만 실패했다. 발견 항목은 baseline-browser-mapping(moderate), browserslist(high), source-map-js(high), vite(high)이며 production dependency audit은 0건이다. package·lock 변경은 없으며 의존성 업그레이드는 이 구현에 포함하지 않는다.

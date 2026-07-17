# Phase 5E — 사건·사업 동인·재무·가치평가 가정 연결

## 목표

Phase 5E는 검증된 사건이 어떤 사업 동인과 Phase 5C 재무지표를 거쳐 Phase 5D 가치평가 가정을 다시 보게 했는지 시점형 기록으로 설명한다. 편집 콘텐츠 게시, 가격 변동, 공식 발표는 검토의 입력일 뿐 DCF·Reverse DCF·Company Brief·핵심 판단을 자동 변경하지 않는다.

공개 흐름은 다음과 같다.

```text
사건
→ 확인된 사실 / 아직 확인되지 않은 내용
→ 사업 동인
→ 재무지표
→ 가치평가 가정
→ 검토 단계
→ 실제 결정과 변경 기록
```

## 구현 범위

- 공통 event impact taxonomy와 typed registry
- 기업별 dynamic impact module
- 사업 동인 registry
- 재무지표·가치평가 가정 연결
- 검토 단계·상태·confidence·실제 변경 기록 validation
- Company Brief의 조건부 최근 영향 최대 3건
- Financial Pivot 지표 행의 작은 사건 연결 기록
- NVIDIA·Meta 가치평가의 가정 검토 기록
- 편집 상세의 editorial ID index 기반 조건부 연결
- unit test, Release Gate, 브라우저 QA, 문서와 Plan HTML

## 감사 결과

작업 시작 SHA는 `ad7d613f48963cd5d8ff1d0d9f4af67edc592673`이다. Company Brief는 8개, Phase 5C 공개 재무지표 정의는 18개, Phase 5D full 가치평가 기업은 NVIDIA와 Meta 2개다. Published 편집 콘텐츠는 회사 연결이 없는 3Reads 1건이며 Published 주가해부는 0건이다. 따라서 편집 콘텐츠에서 Production impact를 자동 생성하지 않았다.

Production impact는 기존 글로벌 source registry와 리서치 리포트에 모두 존재하는 공식 자료만 사용한다.

| 회사 | 사건 | source | 검토 단계 | 결과 |
| --- | --- | --- | --- | --- |
| NVIDIA | FY2027 1분기 실적 | `nvidia-fy2027-q1-results` | `scenario_review` | `reviewed_no_change` |
| Meta | 2026년 1분기 실적 | `meta-q1-2026-results` | `base_case_review` | `reviewed_no_change` |

두 Phase 5D 모형은 해당 실적 발표 뒤 작성됐으므로 이 정보를 이미 포함한 시점형 artifact다. 검토 기록의 before/after model version은 동일하며 실제 `ValuationAssumptionChange`는 0건이다.

## 데이터와 화면

`src/content/event-impacts/registry.ts`는 NVIDIA와 Meta module을 dynamic import한다. 지원되지 않는 6개 기업은 빈 배열을 반환하고 빈 섹션을 렌더링하지 않는다. editorial index에는 현재 항목이 없으므로 오늘의 월스트리트와 draft fixture에도 영향 섹션이 나타나지 않는다.

기업 상세는 사실, 미확인 항목, 사업 동인과 검토 결과를 짧게 표시한다. 재무 피벗은 기존 공시값을 바꾸지 않고 해당 metric row에 연결 기록만 표시한다. 가치평가 화면은 사건일, 확인·미확인, 사업 동인, 가정별 검토 이유, 검토일, model version과 실제 결정을 분리한다.

## 제외 범위

신규 API, Serverless Function, DB, migration, cron, sync, 외부 데이터 수집, runtime LLM, 자동 관계 생성, 자동 DCF 수정, 관리자 CMS, 신규 dependency와 전용 impact route는 없다. 기존 Function은 12개를 유지하며 `package-lock.json`은 변경하지 않는다.

## 완료 조건

`npm run validate:event-impacts`가 Production 레코드 2건, 사업 동인 6개, 재무 연결 8개, 가치평가 가정 연결 7개, 실제 변경 0건을 검증한다. 자동 origin, 깨진 source·metric, 사실 상태 혼합, 잘못된 상태 전이, change 없는 update, 동일값·NaN·Infinity change를 거부한다. 전체 정적 검사와 브라우저·Production 결과는 Plan HTML과 최종 배포 기록에 갱신한다.

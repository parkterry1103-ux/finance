# Event Impact Model

## 목적

Event Impact는 사건 자체의 중요도 점수나 주가 인과 추정이 아니다. 특정 시점에 확인된 사실을 사업 구조, 실제 재무지표와 가치평가 가정의 검토 대상으로 연결하고 사람이 내린 결정을 보존하는 기록이다.

## 핵심 타입

`EventImpactRecord`는 다음을 가진다.

- 고유 ID와 지원 기업 slug
- 사건 제목, 사건일, 발행일, source IDs, 선택적 editorial ID
- 요약과 materiality
- `manual_research_review` origin
- `confirmedFacts`와 `unresolvedItems`
- `businessDriverImpacts`
- Phase 5C `financialMetricLinks`
- Phase 5D `valuationAssumptionLinks`
- review stage와 review status
- 선택적 human decision
- 다음 확인 항목과 선택적 superseded 연결

## 검토 단계

| 단계 | 의미 |
| --- | --- |
| `monitor_only` | 사실을 기록하고 다음 공시를 기다림 |
| `scenario_review` | 보수·기준·낙관 범위를 점검 |
| `base_case_review` | 기준 가정 자체를 검토 |
| `thesis_reassessment` | 핵심 사업 판단을 다시 검토 |

단계는 자동 승격하지 않는다.

## 검토 상태

| 상태 | 필수 기록 |
| --- | --- |
| `pending` | decision 없음 |
| `reviewed_no_change` | 동일 before/after model version과 결정 요약 |
| `scenario_updated` | 명시적 scenario change record |
| `base_case_updated` | 명시적 base-case change record |
| `thesis_revised` | thesis review와 명시적 change record |
| `superseded` | 존재하는 후속 impact ID |

## Confidence

- `confirmed`: 공식 자료에서 직접 확인
- `partially_supported`: 일부 경로는 근거가 있으나 순효과가 확정되지 않음
- `editorial_inference`: 출처와 분리된 편집 판단
- `unresolved`: 다음 자료가 필요함

확인된 사실을 `unresolved`로 표시할 수 없고, 미확인 항목은 반드시 `unresolved`다.

## 사업 동인

사업 동인은 기업별로 정의한다. NVIDIA는 AI 가속기 수요, 제품·지역 구성, 플랫폼 경쟁력이고 Meta는 광고 수요와 단가, AI 인프라 재투자, 플랫폼 참여다. 각 동인은 허용된 Phase 5C metric IDs와 Phase 5D assumption IDs를 갖는다. impact는 다른 기업의 driver를 참조할 수 없다.

## 실제 변경 기록

`ValuationAssumptionChange`는 실제로 숫자가 바뀐 경우에만 생성한다. before/after 값과 단위, 서로 다른 before/after model version, 변경 시각, owner, rationale과 source IDs가 필수다. 같은 값, NaN, Infinity, 깨진 impact·assumption·source는 거부한다.

현재 Production change registry는 빈 배열이다. 테스트의 update fixture는 validator의 정상·실패 경로를 검증할 뿐 runtime data가 아니다.

## 로딩 경계

회사별 entry는 `src/content/event-impacts/entries/{company}.ts`로 분리한다. 기업 상세·재무·가치평가 route가 열린 뒤 현재 회사 module만 가져온다. editorial detail은 작은 ID→company index에 명시적으로 등록된 경우에만 회사 module을 불러온다. 홈과 App entry는 전체 impact object를 선로딩하지 않는다.

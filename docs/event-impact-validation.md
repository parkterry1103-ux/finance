# Event Impact Validation

## Registry 무결성

`validateEventImpactRegistry`와 `npm run validate:event-impacts`는 다음을 차단한다.

- 중복 impact·change ID
- 지원하지 않는 company slug
- 비어 있는 사건·설명·watch item
- 깨진 source ID
- 다른 기업의 business driver
- 공개 Phase 5C 정의에 없는 metric ID
- 중복 driver·metric·assumption link
- 확인 사실과 unresolved confidence 혼합
- 자동 review origin
- 날짜·decision metadata 누락
- 깨진 editorial index와 superseded ID

## 상태 전이

- `pending`은 decision을 가질 수 없다.
- 검토 완료 상태는 decision이 필요하다.
- `reviewed_no_change`는 같은 before/after model version이어야 하고 change record를 가질 수 없다.
- `scenario_updated`, `base_case_updated`, `thesis_revised`는 연결된 change record가 필수다.
- `base_case_updated`는 base-case 또는 thesis 단계에서만 가능하다.
- `thesis_revised`는 thesis reassessment 단계에서만 가능하다.

## Change record

값은 finite number여야 하며 before와 after가 같을 수 없다. model version도 달라야 한다. impact·company·assumption 연결, 날짜, owner, rationale, source와 단위가 모두 있어야 한다. Production change count는 0이며 unit fixture만 update 성공 경로를 검사한다.

## 회귀 검사

unit은 다음을 확인한다.

- Production impact 2건과 actual change 0건
- 사업 동인 6개, 재무 연결 8개, 가정 연결 7개
- NVIDIA·Meta decision version이 현재 Phase 5D report version과 일치
- 네 review stage가 pending fixture에서 유효
- 자동 origin, source·metric 오류, confidence 혼합, 잘못된 pending decision 거부
- no-change 위장 version, update의 change 누락, NaN change 거부
- 회사별 dynamic import와 화면 소비 지점
- Published 3Reads에 영향 연결이 없어 빈 section 미노출

Release Gate는 event impact unit, application TypeScript, manifest build와 bundle budget을 blocking check로 실행한다. 브라우저 QA는 조건부 section, source link, heading, keyboard focus, 320px overflow, 지원되지 않는 기업의 빈 section 미노출을 확인한다.

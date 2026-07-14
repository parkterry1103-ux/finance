# 기업 통합 리서치 프로필 사전 Inventory

> 아래 사전 감사의 시장지도 관계 수치는 폐기 전 기록입니다. 2026-07-14 이후 프로필은 `industry-flows`와 `company-profile-relations`만 사용하며 42개 시장지도 관계 registry를 소비하지 않습니다.

기준일: 2026-07-14
시작 HEAD: `613583690f94f60b28cbec930054baa901cda0b1`

## 기존 route 감사

| 구분 | 기존 상태 | 결정 |
|---|---|---|
| 일반 기업 목록 | 없음 | `/ko/companies`, alias `/companies` |
| 일반 기업 상세 | 0개 | `/ko/companies/:slug`, alias `/companies/:slug` |
| Pick 목록·상세 | canonical `/ko/picks`, `/ko/picks/:id` | 그대로 유지 |
| Pick alias | `/picks/:id`, `/stock-autopsy-picks/:id` | 그대로 유지 |
| 분석 상세 | `/ko/analysis/:companyId` | 재무·공시 중심 기존 역할 유지 |

기업 프로필은 Pick을 대체하지 않습니다. 프로필은 사업·산업 역할·공식 이벤트·공급망 연결을 통합하고, Pick은 특정 시장 움직임을 살펴보는 편집 관점을 유지합니다.

## Canonical identity 중복 감사

프로필 `companyId`는 기업 변화 레이더의 기존 8개 ID를 그대로 사용합니다. 이름이나 ticker에서 새 ID를 만들지 않습니다.

| ticker | canonical companyId | 기존 별도 ID·표기 | 처리 |
|---|---|---|---|
| `000660.KS` | `ai-datacenter-sk-hynix` | `kr-semiconductors-sk-hynix` | 기존 산업 ID를 canonical alias로 해석 |
| `066570.KS` | `datacenter-power-lg-electronics` | 없음 | 기존 ID 유지 |
| `NVDA` | `us-semiconductors-nvidia` | 없음 | 기존 ID 유지 |
| `MU` | `ai-datacenter-micron` | 없음 | 기존 ID 유지 |
| `DELL` | `ai-datacenter-dell` | 없음 | 기존 ID 유지 |
| `ETN` | `ai-datacenter-eaton` | `datacenter-power-eaton`, `us-energy-grid-eaton` | 두 산업 ID를 canonical alias로 해석 |
| `META` | `meta-platforms` | 일반 `companies` 배열에는 없고 기업 이벤트·SEC registry에 동일 ID 존재 | 기존 이벤트 identity를 재사용, 새 identity 생성 없음 |
| `SMCI` | `ai-datacenter-supermicro` | 같은 ID에서 `Super Micro` / `Supermicro` 표기 차이 | 이벤트 registry의 표시명을 프로필 canonical 표시명으로 사용 |

프로필 8개 사이 companyId·slug·ticker 중복은 0개입니다. 산업별 별도 ID는 삭제하지 않고 selector에서만 canonical ID로 정규화합니다.

## 기존 연결 데이터 Inventory

아래 수량은 프로필 기본 화면의 노출 상한과 `review-needed` 제외 규칙을 적용한 최종 view model 기준입니다.

| 기업 | 이벤트 | 시장지도 | 관련 기업 | confirmed | contextual | 병목 | 수요공급 | Pick | 보고서 | 검증 숫자 | 공식 source |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| SK하이닉스 | 2 | 1 | 3 | 0 | 3 | 2 | 1 | 1 | 2 | 0 | 3 |
| LG전자 | 1 | 1 | 2 | 0 | 2 | 1 | 1 | 1 | 1 | 0 | 2 |
| NVIDIA | 1 | 2 | 4 | 1 | 3 | 2 | 2 | 1 | 2 | 3 | 2 |
| Micron | 2 | 1 | 1 | 0 | 1 | 2 | 1 | 1 | 2 | 2 | 3 |
| Dell | 2 | 2 | 1 | 0 | 1 | 1 | 1 | 1 | 1 | 0 | 3 |
| Eaton | 1 | 2 | 2 | 0 | 2 | 2 | 2 | 0 | 2 | 3 | 2 |
| Meta | 2 | 1 | 0 | 0 | 0 | 1 | 1 | 1 | 1 | 0 | 3 |
| Supermicro | 1 | 1 | 1 | 0 | 1 | 1 | 1 | 1 | 1 | 0 | 2 |

Meta에는 현재 시장지도 관계 registry의 직접 연결선이 없습니다. 관계를 새로 만들지 않고 빈 상태로 표시합니다. Eaton에는 연결된 Pick이 없어 Pick section을 생략합니다. 검증 숫자는 해당 기업 이벤트 source와 같은 기업 IR 보고서의 `actual` metric만 허용합니다.

## View model 원칙

- 프로필 registry는 `companyId`, slug, 초보자 설명, 역할, 질문, 주의사항, sourceRefs, 검토일만 저장합니다.
- 회사명·ticker·국가는 기업 변화 레이더 identity에서 읽습니다.
- 제품은 기존 `companies.mainProducts`가 있을 때만 최대 3개 표시합니다.
- 이벤트·시장지도·관계·병목·수요공급·Pick·보고서·source는 기존 registry에서 selector로 조합합니다.
- 관련 기업은 confirmed → contextual → 관계 유형 → registry 순서로 정렬하고 최대 4개만 표시합니다.
- `review-needed`는 기본 관련 기업에서 제외합니다.
- 가격은 기존 shared `/api/market-prices` 결과를 상세 route에서만 사용하며 가격이 없으면 section을 생략합니다.
- 관계 수·이벤트 수는 점수나 정렬 기준으로 사용하지 않습니다.

## 금지 범위 확인

신규 API, Serverless Function, DB, migration, cron, sync endpoint, sync 실행, dependency, 자동 기업 평가, 투자 의견, 기업 점수는 추가하지 않습니다. `package.json`과 `package-lock.json`은 변경하지 않습니다.

## 공개 시장지도 폐기 후 상태

프로필 8개는 그대로 유지한다. 관련 기업은 SK하이닉스 2, LG전자 2, NVIDIA 3, Micron 2, Dell 2, Eaton 2, Meta 0, Supermicro 3개로 총 16개다. 모든 관계는 `same-demand`, `production-stage`, `infrastructure` 중 하나이며 source를 최소 하나 가진다. self relation과 기업별 중복은 0개다. 직접 계약이나 공식 공급망을 나타내는 관계망으로 사용하지 않는다.

각 프로필의 산업 위치는 네 개 정적 5단계 flow에서 해석한다. 프로필의 CTA는 수요·공급과 관련 산업 리포트로 이동한다. Meta의 관련 기업 빈 상태와 Eaton의 Pick 생략은 그대로 유지한다.

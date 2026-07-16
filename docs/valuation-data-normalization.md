# 가치평가 재무자료 정규화

## 연결 감사

4A 시작 기준 기존 연결은 다음과 같습니다.

| 구분 | 위치 | 인증 | 상태 |
| --- | --- | --- | --- |
| OpenDART runtime client | `api/financials.ts`, `src/services/financials.ts` | `OPENDART_API_KEY` | Production에 존재, CFS 우선·OFS fallback |
| OpenDART write sync | `scripts/sync-opendart-financials.ts`, `api/sync/financials.ts` | OpenDART·Supabase 환경변수 | 이번 단계 실행 0 |
| SEC Companyfacts runtime client | `api/financials.ts`, `src/services/financials.ts` | `SEC_USER_AGENT` | Production·로컬 read-only 조회 가능 |
| SEC write sync | `scripts/sync-sec-companyfacts.ts`, `api/sync/financials.ts` | SEC·Supabase 환경변수 | 이번 단계 실행 0 |
| 가격 | `api/market-prices.js`, `src/services/prices.ts` | 기존 provider 환경변수 | `/api/market-prices`의 기준일·출처 사용 |
| 거시 | `api/_lib/macro-indicators.ts` | 기존 FRED 연결 | `/api/macro-indicators`의 DGS10 사용 |

8개 가치평가 registry는 `src/content/valuation/companies.ts`에 둡니다. 한국 2개 `corp_code`는 8자리 문자열, 미국 6개 CIK도 문자열로 보존합니다. API key 값은 로그·artifact·Git에 기록하지 않습니다.

## 공통 metric

`src/domain/valuation/types.ts`의 `normalizedMetricIds`가 손익, 재무상태, 현금흐름, 주식의 공통 ID를 정의합니다. 금액은 모델 내부에서 통화별 `million`, 비율은 decimal로 통일합니다. `8.5%`는 `0.085`이며 표시 단계에서만 변환합니다.

SEC concept 우선순위와 OpenDART 계정명 adapter는 `src/domain/valuation/normalize.ts`에 있습니다. 예를 들어 매출은 `RevenueFromContractWithCustomerExcludingAssessedTax → Revenues → SalesRevenueNet`, Capex는 `PaymentsToAcquirePropertyPlantAndEquipment → PaymentsToAcquireProductiveAssets` 순서입니다. 기업별 custom concept를 업종 평균 숫자로 대체하지 않습니다.

## 기간·정정·중복

- annual은 10-K·10-K/A의 약 1년 duration만 선택합니다.
- point-in-time은 start가 없는 balance sheet context만 사용합니다.
- 같은 기업·metric·기간은 수정 공시, 연결, 정상 duration, 최신 filed date 순으로 고릅니다.
- 제외한 context는 `NormalizationAuditEntry`에 선택 source와 함께 기록합니다.
- OpenDART CFS와 OFS를 한 시계열에 섞지 않습니다. 동일 기간 후보에서는 CFS를 우선합니다.
- YTD 단일 분기 파생은 통화·단위·연결·시작일이 같은 경우에만 현재 누적에서 직전 누적을 뺍니다.
- TTM은 중복 없는 단일 분기 정확히 4개만 합산합니다.

SEC `fy`는 비교열이 포함된 최신 제출의 회계연도로 바뀔 수 있으므로 정규화 period의 fiscal year는 fact의 `periodEnd` 연도를 사용하고 accession·filed date는 별도 보존합니다.

## provenance

모든 `NormalizedFinancialFact`에는 source system, source ID, filing type, filed date, accession/receipt number, taxonomy concept, statement type, consolidation, quality status가 있습니다. 파생값에는 `derivedFromMetricIds`가 붙습니다. 파일럿 결과의 `sourceIds`는 각 회사 `sources.json`에서 SEC 원문 accession까지 역추적할 수 있습니다.

## 실제 감사 결과

- OpenDART: SK하이닉스 `00164779`, LG전자 `00401731` 모두 기존 Production read-only API에서 2026년 1분기 CFS가 확인됐습니다.
- SEC: NVIDIA, Micron, Dell, Eaton, Meta, Super Micro의 6개 CIK 모두 Companyfacts가 확인됐습니다.
- 한국 기업은 기존 endpoint가 최신 요약만 반환하고 감가상각·희석주식·5년 시계열이 부족해 제한적 DCF 상태입니다.
- 미국 6개 기업은 5개 이상 annual revenue·operating income과 주요 현금흐름·희석주식을 정규화할 수 있습니다.
- 상세 상태와 누락 항목은 [가치평가 준비도](valuation-readiness-inventory.md)와 `artifacts/phase-4a-valuation/valuation-readiness.json`에 있습니다.

## 단위·품질 차단

validator는 통화 혼합, annual·quarterly 혼합, 중복 기간, 존재하지 않는 metric/source ID, NaN, Infinity, 0 이하 희석주식, `WACC <= g`를 오류로 중단합니다. CFS/OFS 우선순위, 정정공시, YTD·TTM, CIK·corp_code 형식은 `scripts/valuation-unit.ts` fixture로 검증합니다.

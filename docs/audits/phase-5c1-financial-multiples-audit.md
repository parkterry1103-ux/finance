# Phase 5C.1 재무·멀티플 정확성 감사

감사일은 2026-07-18, 가격 기준일은 2026-07-17 정규장 종가다. 지원 기업 8개만 대상으로 했으며 SEC EDGAR와 OpenDART 정기공시를 원자료로 사용했다. 외부 배수는 원자료가 아니라 계산 결과를 교차 확인하는 참고값이다.

## 감사에서 발견한 핵심 문제

- 기존 미국 분기 선택기는 최신 fact 하나를 고르므로 Micron의 9개월 누적 매출 78,959백만 달러와 Super Micro의 9개월 누적 매출 27,943.295백만 달러를 독립 3분기처럼 보여줄 수 있었다.
- 기존 한국 연간 series는 CFS 조회 실패 시 OFS로 내려가 SK하이닉스와 LG전자의 별도 매출을 연결 매출처럼 노출할 수 있었다.
- 화면의 최근 변화는 배열상 직전 행을 비교해 분기에서는 직전 분기와 전년 동기가 섞일 수 있었다.
- PER·PBR·PSR은 가격일, 분모 기간, 주식수 종류와 외부 정의를 한 묶음으로 추적하는 공통 모델이 없었다.

조치 후에는 직접 독립 분기 context를 우선하고, 없을 때만 같은 시작일·계정·통화·단위·연결·정정 기준의 누적값을 차감한다. OpenDART 지원 기업은 CFS만 게시하고 OFS 자동 대체를 제거했다. 화면 비교는 같은 회계연도 분기를 우선한다.

## 기업별 법인·거래·공시 식별

| companySlug | 법인명 | ticker · 거래소 | 통화 · 결산 | 공시 시스템 · 식별자 | 공시 형태 · 연결 | ADR · 분할 |
| --- | --- | --- | --- | --- | --- | --- |
| `sk-hynix` | SK hynix Inc. | 000660.KS · KRX | KRW · 12월 | OpenDART · 00164779 | 사업·분기보고서 · CFS | ADR 없음 · 감사기간 분할 없음 |
| `lg-electronics` | LG Electronics Inc. | 066570.KS · KRX | KRW · 12월 | OpenDART · 00401731 | 사업·분기보고서 · CFS | ADR 없음 · 감사기간 분할 없음 |
| `nvidia` | NVIDIA Corporation | NVDA · NASDAQ | USD · 1월 | SEC · CIK 1045810 | 10-K·10-Q · consolidated | ADR 없음 · 2024-06-10 10:1 |
| `micron` | Micron Technology, Inc. | MU · NASDAQ | USD · 8월 | SEC · CIK 723125 | 10-K·10-Q · consolidated | ADR 없음 · 감사기간 분할 없음 |
| `dell` | Dell Technologies Inc. | DELL · NYSE | USD · 1월 | SEC · CIK 1571996 | 10-K·10-Q · consolidated | Class C · 감사기간 분할 없음 |
| `eaton` | Eaton Corporation plc | ETN · NYSE | USD · 12월 | SEC · CIK 1551182 | 10-K·10-Q · consolidated | ADR 없음 · 감사기간 분할 없음 |
| `meta` | Meta Platforms, Inc. | META · NASDAQ | USD · 12월 | SEC · CIK 1326801 | 10-K·10-Q · consolidated | Class A · 감사기간 분할 없음 |
| `supermicro` | Super Micro Computer, Inc. | SMCI · NASDAQ | USD · 6월 | SEC · CIK 1375365 | 10-K·10-Q · consolidated | ADR 없음 · 2024-10-01 10:1 |

이번 감사 대상에는 20-F·6-K 발행사가 없다. 복수 주식 종류가 있는 Dell과 Meta는 실제 거래되는 Class C·Class A 가격을 사용하고, 공시 희석 EPS와 common equity·기말 보통주 수의 용도를 분리했다.

## 최신 공시 식별자

| 기업 | 최신 연간 | 최신 분기 | 결산 | 연결 | 정정·주식 기준 |
| --- | --- | --- | --- | --- | --- |
| SK하이닉스 | 2025 사업보고서 `20260317000635` | 2026 Q1 `20260515002287` | 12월 | CFS | ADR 없음 |
| LG전자 | 2025 사업보고서 `20260706000276` | 2026 Q1 `20260515000856` | 12월 | CFS | 연간 정정 공시, ADR 없음 |
| NVIDIA | FY2026 10-K `0001045810-26-000021` | FY2027 Q1 10-Q `0001045810-26-000052` | 1월 | consolidated | 2024-06-10 10:1 split 반영 |
| Micron | FY2025 10-K `0000723125-25-000028` | FY2026 Q3 10-Q `0000723125-26-000015` | 8월 | consolidated | 누적 9M을 Q3로 직접 사용 금지 |
| Dell | FY2026 10-K `0001571996-26-000008` | FY2027 Q1 10-Q `0001571996-26-000030` | 1월 | consolidated | Class C 가격 기준 |
| Eaton | FY2025 10-K `0001551182-26-000007` | 2026 Q1 10-Q `0001551182-26-000013` | 12월 | consolidated | ADR 없음 |
| Meta | FY2025 10-K `0001628280-26-003942` | 2026 Q1 10-Q `0001628280-26-028526` | 12월 | consolidated | Class A 가격·common equity |
| Super Micro | FY2025 10-K `0001375365-25-000027` | FY2026 Q3 10-Q `0001375365-26-000014` | 6월 | consolidated | 2024-10-01 10:1 split, 누적 9M 분리 |

공식 원문 URL은 `src/content/financial-pivots/audit-entries/`의 기업별 filing identity에 보관한다. 화면은 선택한 기업의 감사 파일만 지연 로드하며, 전체 validator는 `audit-all.ts`에서 8개 파일을 모아 검사한다. filing 제출일이 가격 기준일보다 늦으면 validator가 look-ahead로 거부한다.

## 가격과 외부 PER 교차검증

| 기업 | 2026-07-17 종가 | 외부 확인 1 | 외부 확인 2 | 차이 분류 |
| --- | ---: | --- | --- | --- |
| SK하이닉스 | KRW 1,842,000 | Npay 17.79배 | Daum 33.56배 | 외부 EPS 기간 정의 차이 |
| LG전자 | KRW 179,000 | Npay 33.03배 | Daum 36.40배 | 가격·EPS 기준시점 차이 |
| NVIDIA | USD 202.81 | StockAnalysis 31.0599배 | CompaniesMarketCap 41.5배 | 두 번째 값 분모 갱신 지연 가능성 |
| Micron | USD 848.95 | StockAnalysis 19.1581배 | CompaniesMarketCap 41.1배 | 최신 Q3 반영 시점 차이 |
| Dell | USD 396.34 | StockAnalysis 31.6824배 | CompaniesMarketCap 45.1배 | 최근 회계연도·TTM 분모 차이 |
| Eaton | USD 399.99 | StockAnalysis 39.1289배 | CompaniesMarketCap 39.1배 | 외부 TTM과 내부 연간 fallback 기준시점 차이 |
| Meta | USD 646.01 | StockAnalysis 23.5008배 | CompaniesMarketCap 23.2배 | 외부 TTM과 내부 연간 fallback 기간 차이 |
| Super Micro | USD 24.18 | StockAnalysis 12.6763배 | CompaniesMarketCap 12.8배 | 외부 TTM과 내부 연간 fallback 기간 차이 |

외부 값이 다르다는 이유로 공시 분모를 조정하지 않는다. 사이트 계산은 동일 정의의 연속 독립 4분기가 있을 때만 Verified 후보가 되며, 외부 값과 허용 오차를 넘는 원인 불명 차이는 Review로 남긴다.

각 외부 레코드에는 위 표의 요약 외에도 `multipleBasis`, `epsBasis`, `accountingBasis`, `priceAsOf`, `financialPeriod`, `retrievedAt`을 보존한다. 공급자가 세부 정의를 공개하지 않으면 추측하지 않고 `definition_not_disclosed` 또는 “provider 세부 기간 미표시”로 기록한다.

## 기업별 최신 분기 원재료 수동 확인

금액 단위는 한국 기업 KRW 백만, 미국 기업 USD 백만이다. `보류`는 실제 0이 아니라 해당 정의의 공식 원재료를 안전하게 연결하지 못했다는 뜻이다. 총차입금은 단기·장기·리스 구성 계정을 완전하게 합산하기 전까지 게시하지 않는다.

| 기업·기간 | 매출 / 영업이익 | 보통주 귀속 순이익 | 기본 / 희석 EPS | 영업CF / CAPEX | 현금 / 총부채 / 자기자본 | 기말 주식수 | YoY 매출 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SK하이닉스 2026 Q1 | 52,576,287 / 37,610,283 | 40,345,909 | 보류 / 보류 | 26,330,119 / 7,657,403 | 보류 / 58,448,945 / 164,379,799 | 보류 | Production CFS 전년 동기 재조회 후 표시 |
| LG전자 2026 Q1 | 23,727,227 / 1,673,723 | 1,005,088 | 보류 / 보류 | 1,100,897 / 689,893 | 보류 / 40,705,303 / 30,529,230 | 보류 | Production CFS 전년 동기 재조회 후 표시 |
| NVIDIA FY2027 Q1 | 81,615 / 53,536 | 58,321 | 2.40 / 2.39 | 50,344 / 1,757 | 13,237 / 64,000 / 195,474 | 24,200 | +85.2% |
| Micron FY2026 Q3 | 41,456 / 33,318 | 28,243 | 25.03 / 24.67 | 25,388 / 7,826 | 24,995 / 33,388 / 100,724 | 1,129.393 | +345.7% |
| Dell FY2027 Q1 | 43,842 / 3,656 | 3,438 | 5.30 / 5.24 | 4,081 / 963 | 11,578 / 116,317 / -1,404 | 649 | +87.5% |
| Eaton 2026 Q1 | 7,451 / 대응 계정 보류 | 866 | 2.23 / 2.22 | 507 / 193 | 565 / 공시 계정 보류 / 19,721 | 388.3 | +16.8% |
| Meta 2026 Q1 | 56,311 / 22,872 | 26,773 | 10.57 / 10.44 | 32,226 / 18,997 | 23,426 / 151,569 / 243,681 | DEI 미제공 | +33.1% |
| Super Micro FY2026 Q3 | 10,243.014 / 625.868 | 483.387 | 0.81 / 0.72 | -6,615.426 / 80.278 | 1,290.324 / 15,876.438 / 7,575.430 | 601.418 | +122.7% |

미국 수치는 각 표의 최신 10-Q accession에 연결된 CompanyFacts context를 다시 계산한 값이다. Micron 41,456과 Super Micro 10,243.014는 각각 기존 누적 9개월 표시 후보 78,959와 27,943.295를 독립 분기 대신 쓰지 않도록 보정한 결과다. 한국 EPS·현금·주식수는 이번 OpenDART 계정 매핑에서 공식 정의를 끝까지 확인하지 못했으므로 외부 표시값으로 채우지 않았다.

## 공개 멀티플 검증표

| 기업 | 사이트 PER | 공식 분모 | 사이트 PBR | 사이트 PSR | 가격일 | 외부 값 1 / 2 | 최종 상태 |
| --- | ---: | --- | ---: | ---: | --- | --- | --- |
| SK하이닉스 | 보류 | 공시 희석 EPS 미확보 | 보류 | 보류 | 2026-07-17 | 17.79 / 33.56 | unavailable · 정의 차이 |
| LG전자 | 보류 | 공시 희석 EPS 미확보 | 보류 | 보류 | 2026-07-17 | 33.03 / 36.40 | unavailable · 정의/시점 차이 |
| NVIDIA | 41.39 | FY2026 희석 EPS 4.90 | 25.11 | 19.36 | 2026-07-17 | 31.0599 / 41.5 | annual fallback · 두 번째 반올림 일치 |
| Micron | 111.85 | FY2025 희석 EPS 7.59 | 9.52 | 10.62 | 2026-07-17 | 19.1581 / 41.1 | annual fallback · 기간 정의 차이 |
| Dell | 45.66 | FY2026 희석 EPS 8.68 | 의미 없음 | 1.92 | 2026-07-17 | 31.6824 / 45.1 | annual fallback · 두 번째 반올림 일치, 음수 자본 |
| Eaton | 38.28 | FY2025 희석 EPS 10.45 | 7.88 | 5.45 | 2026-07-17 | 39.1289 / 39.1 | annual fallback · 기준시점 차이 |
| Meta | 27.50 | FY2025 희석 EPS 23.49 | 보류 | 보류 | 2026-07-17 | 23.5008 / 23.2 | annual fallback · TTM/연간 차이, 기말 주식수 없음 |
| Super Micro | 14.39 | FY2025 희석 EPS 1.68 | 1.92 | 0.43 | 2026-07-17 | 12.6763 / 12.8 | annual fallback · TTM/연간 차이 |

PER의 최근 4개 독립 분기 희석 EPS 중 회계연도 4분기 EPS는 연간 EPS에서 9개월 EPS를 단순 차감하면 가중평균 주식수 정의가 달라질 수 있다. 따라서 이번 snapshot은 TTM EPS가 안전하지 않은 미국 기업에 요청문이 허용한 최근 완료 회계연도 PER을 명시적으로 사용한다. PBR은 최신 common equity와 기말 주식수가 모두 있을 때, PSR은 기말 주식수와 독립 4분기 매출이 모두 있을 때만 계산한다.

## 감사 결과

- 공시 registry: 8/8 기업, 최신 연간·분기 식별자, 제출일, 보고기간, 연결·정정·분할·ADR 상태 기록
- 독립 분기: SEC 직접 context 우선, 누적 차감은 동일 basis에서만 허용
- 한국 재무: 지원 2개 기업 CFS 전용, OFS fallback 제거
- lineage: SEC frame·원시 filed value·unit, OpenDART account ID·account name·원시 금액·receipt를 값별로 보존
- TTM: 연속 독립 4분기만 합산
- 멀티플: PER·PBR·PSR 공식과 보류 reason code 구현, EV 계열은 원재료가 불완전해 이번 공개 범위에서 보류
- 외부 검산: 기업별 2곳, 총 16개 값과 정의·기준일·차이 상태 기록
- 결측: 0으로 대체하지 않으며 `calculation_inputs_missing`, `definition_mismatch`, `period_not_comparable` 등 구체 사유 표시

## 남은 위험

SEC CompanyFacts는 동일 concept에 여러 context를 포함할 수 있어 새 정정공시가 들어오면 재검증이 필요하다. OpenDART 반기·3분기 독립값은 안전한 누적 차감 lineage가 완성되기 전까지 화면에 게시하지 않는다. 외부 사이트의 배수 정의는 예고 없이 바뀔 수 있으므로 참고값을 정기적으로 다시 확인해야 한다.

# 8개 기업 가치평가 준비도

기준일은 2026-07-15입니다. 상태는 총점이 아니라 항목별로 `충분`, `제한적`, `계산 가능`, `보조 가정 필요`, `계산 부적합`, `자료 없음`을 사용합니다. 전체 기계 판독 결과는 `artifacts/phase-4a-valuation/valuation-readiness.json`입니다.

| 기업 | 공식 연결 | 5년 매출·영업이익 | 세금 | D&A | Capex | OCF | 운전자본 | 현금·부채 | 희석주식 | 가격 | DCF |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SK하이닉스 | OpenDART CFS | 제한적 | 제한적 | 자료 없음 | 제한적 | 제한적 | 제한적 | 제한적 | 자료 없음 | 충분 | 제한적 |
| LG전자 | OpenDART CFS | 제한적 | 제한적 | 자료 없음 | 제한적 | 제한적 | 제한적 | 제한적 | 자료 없음 | 충분 | 제한적 |
| NVIDIA | SEC Companyfacts | 충분 | 충분 | 충분 | 충분 | 충분 | 계산 가능 | 계산 가능 | 충분 | 충분 | 가능 |
| Micron | SEC Companyfacts | 충분 | 충분 | 충분 | 충분 | 충분 | 계산 가능 | 계산 가능 | 충분 | 충분 | 가능 |
| Dell | SEC Companyfacts | 충분 | 충분 | 충분 | 충분 | 충분 | 계산 가능 | 계산 가능 | 충분 | 충분 | 가능 |
| Eaton | SEC Companyfacts | 충분 | 충분 | 충분 | 충분 | 충분 | 계산 가능 | 계산 가능 | 충분 | 충분 | 가능 |
| Meta | SEC Companyfacts | 충분 | 충분 | 충분 | 충분 | 충분 | 계산 가능 | 계산 가능 | 충분 | 충분 | 가능 |
| Super Micro | SEC Companyfacts | 충분 | 충분 | 충분 | 충분 | 충분 | 계산 가능 | 계산 가능 | 충분 | 충분 | 가능 |

사업부 데이터와 기업별 KPI는 Companyfacts만으로 충분하지 않습니다. 전 기업에서 원문 MD&A·주석·IR을 함께 검토해야 하며, 부족한 KPI를 업종 평균으로 생성하지 않습니다.

## 기업별 방법

| 기업 | 주 방법 | 보조 방법 | 부적합하거나 제한적인 방법 |
| --- | --- | --- | --- |
| SK하이닉스 | 사이클 정상화 FCFF DCF | 역산 DCF, EV/EBITDA, PBR·ROE | 단일 연도 PER |
| LG전자 | 사업부 SOTP | FCFF DCF, EV/EBITDA | 냉각 기대만 분리한 DCF |
| NVIDIA | Driver-based FCFF DCF | 역산 DCF, EV/Sales, EV/EBITDA | PBR 단독 |
| Micron | 사이클 정상화 FCFF DCF | 역산 DCF, EV/EBITDA, PBR·ROE | 단일 연도 PER |
| Dell | FCFF DCF | EV/EBITDA, 운전자본 시나리오, SOTP | 매출만 반영한 EV/Sales |
| Eaton | FCFF DCF | EV/EBITDA, ROIC·WACC, 수주잔고 전망 | PBR 단독 |
| Meta | Driver-based FCFF DCF | 역산 DCF, EV/EBITDA, FCF Yield | PBR 중심 평가 |
| Super Micro | FCFF DCF | EV/Sales, EV/EBITDA, 운전자본 시나리오 | 운전자본을 무시한 단일 배수 |

구체적인 driver와 선택 이유는 `src/content/valuation/companies.ts`에 구조화했습니다.

## 파일럿 선정

NVIDIA와 Meta를 선정했습니다. 두 기업은 5개 이상 annual 손익·현금흐름, 자본구조, 희석주식, 기준일 가격, 원본 source 추적을 충족하고 반도체와 광고·플랫폼으로 driver가 다릅니다.

한국 1개·미국 1개 조합은 이번 연결 품질에서 채택하지 않았습니다. 한국 두 기업은 기존 OpenDART read-only endpoint가 최신 기간 요약만 제공하고 5년 감가상각·희석주식 시계열이 없어 계산 품질 기준에 미달합니다. 이는 데이터가 없는 자리를 업종 평균으로 채우지 않기 위한 예외입니다.

## blocker

- 한국 2개: 5년 CFS 연간 시계열, 감가상각, 희석주식, 현금·이자부 부채·리스의 일관된 bridge가 부족합니다.
- 미국 6개: SEC Companyfacts로 수치 계산은 가능하지만 일회성 항목·사업부 KPI·경영진 가이던스 정상화는 원문 검토가 더 필요합니다.
- 실제 비교기업 6~15개의 신뢰 가능한 현재 배수 연결은 없습니다. 따라서 peer median을 억지로 만들지 않고 NYU sector snapshot을 보조 sanity check로만 사용합니다.
- 모든 결과는 내부 계산이며 사용자 화면 공개 준비가 완료됐다는 뜻이 아닙니다.

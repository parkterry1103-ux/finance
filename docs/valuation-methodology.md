# 가치평가 방법론

> Phase 5C.1의 공개 시장 배수는 DCF 판단을 대체하지 않는다. PER·PBR·PSR은 가격 기준일과 공식 공시 분모를 추적하는 검산 지표이며, Forward EPS와 원인 불명 외부 값은 가치평가 입력으로 사용하지 않는다.

## 목적과 표현

4A 엔진은 같은 입력에 같은 결과를 내는 내부 계산 기반입니다. 결과 명칭은 `estimatedValuePerShare`, `baseScenarioValue`, `reverseDcfExpectation` 계열을 사용하고 목표주가·상승여력·BUY/HOLD/SELL을 공개 UI에 표시하지 않습니다.

## FCFF

```text
NOPAT = EBIT × (1 - 정상 세율)
FCFF = NOPAT + 감가상각 - 설비투자 - 운전자본 증가
```

영업 운전자본은 영업 유동자산에서 영업 유동부채를 뺍니다. 현금·단기투자·이자부 부채는 제외합니다. CFO 기반 보조 계산은 이자·세금 분류가 명확할 때만 사용합니다.

과거 구조조정, 손상, 소송, 매각, 일회성 세금, 환율, 비정상 재고, 인수비용, 보조금은 근거가 있을 때만 조정합니다. 이번 파일럿은 Companyfacts만으로 자의적인 정상화 금액을 만들지 않고 보고 수치와 명시적 전망 가정을 분리합니다.

## 전망

파일럿은 구조적 성장과 정상화 기간을 보기 위해 7년을 사용합니다. 매출 성장률은 최근 공시 CAGR을 합리적 상한 안에서 시작값으로 삼아 안정 성장에 가까워지도록 낮춥니다. 영업이익률, 정상 세율, D&A/매출, Capex/매출, 운전자본/매출을 연도별로 명시합니다. 반올림 표시값을 계산 입력으로 재사용하지 않습니다.

## WACC

```text
자기자본비용 = 무위험금리 + levered beta × ERP + country risk premium
세후 타인자본비용 = 세전 타인자본비용 × (1 - 정상 세율)
WACC = 자기자본비용 × 시장가치 자기자본 비중 + 세후 타인자본비용 × 시장가치 부채 비중
```

USD 파일럿의 무위험금리는 기존 FRED read-only 연결에서 확인한 미국 10년물 4.58%, 기준일 2026-07-14입니다. ERP는 NYU Stern 2026 snapshot 4.46%입니다. beta는 업종 cash-corrected unlevered beta를 기업 시장가치 부채비율로 relever합니다. 부채 가중치에는 모델에서 별도 차감하는 리스부채도 포함합니다. 미국 현금흐름에는 country premium 0을 사용합니다.

## Terminal Value와 재투자

```text
Terminal reinvestment rate = stable growth / stable ROIC
Terminal FCFF(n+1) = NOPAT(n+1) × (1 - reinvestment rate)
Terminal Value = Terminal FCFF(n+1) / (WACC - g)
```

`WACC > g`가 아니면 계산을 중단합니다. 영구성장모형과 업종 정상 EV/EBITDA 기반 exit multiple을 모두 계산하되, 주 계산은 영구성장모형입니다. exit 값은 교차검증이며 차이를 임의로 평균내지 않습니다. terminal value 현재가치 비중이 80%를 넘으면 경고합니다.

## Enterprise Value → Equity Value

```text
Enterprise Value
+ 현금
+ 비영업 투자자산
- 이자부 부채
- 리스부채
- 비지배지분
- 기타 청구권
= 보통주 주주가치
```

주당 내부 추정치는 보통주 주주가치를 희석주식 수로 나눕니다. 기본주식 수를 대신 쓰지 않습니다. 가격, 희석주식, 재무·자본구조 기준일은 `assumptions.json`에 각각 기록합니다.

## 시나리오

보수·기준·낙관 시나리오는 최종 결과에 배수를 곱하지 않습니다. 매출 성장, 정상 영업이익률, Capex, 운전자본, WACC, terminal growth를 각각 바꾸고 FCFF부터 다시 계산합니다. 기업별 `scenario-summary.csv`가 세 번의 독립 계산 결과입니다.

## 민감도와 역산 DCF

각 파일럿은 WACC×영구성장률 5×5와 매출 성장률×정상 영업이익률 5×5를 생성합니다. `WACC <= g` 조합은 값 대신 오류로 남습니다.

역산 DCF는 다른 기준 가정을 고정한 뒤 현재 희석 시가총액과 계산 주주가치가 같아지는 매출 CAGR을 이분법으로 풉니다. 해결값을 모델에 다시 넣은 상대오차가 `1e-6` 이하여야 합니다. 결과는 내부 artifact에만 있습니다.

## benchmark

우선순위는 실제 비교기업 중앙값, 지역·업종 sector benchmark, global benchmark입니다. 이번 저장소에는 신뢰 가능한 company-level peer multiple 공급 연결이 없으므로 가짜 peer set을 만들지 않았습니다.

NYU Stern 2026-01-05 미국 업종 snapshot의 beta, debt/capital, cost of equity/debt, WACC, ROIC, EV/Sales, EV/EBITDA, P/B를 `src/content/valuation/benchmarks/industry-2026-01.ts`와 `benchmark-snapshot.json`에 버전 고정했습니다. 표본 수·원본 단위·변환·출처일이 없는 숫자는 저장하지 않습니다. benchmark는 기업 누락값을 채우지 않고 beta·WACC·마진·ROIC·exit multiple sanity check에만 사용합니다.

## R&D·주식보상·리스

- R&D 자본화: 일관된 과거 R&D와 명시적 내용연수가 준비되지 않아 이번 파일럿에 적용하지 않습니다. 후속 적용 시 조정 전·후 EBIT·투자자본·ROIC를 모두 공개합니다.
- 주식보상: 현금흐름에서 공짜로 더하지 않습니다. 보고 영업비용에 유지하고 희석주식 수를 사용해 add-back·희석 무시의 이중 과대평가를 막습니다.
- 리스: 리스부채를 WACC 부채와 equity bridge에 일관되게 포함합니다. 영업이익 재분류가 필요한 고급 리스 조정은 적용하지 않았음을 제한사항으로 둡니다.

## 검증과 제한

오류는 NaN, Infinity, 통화·단위·기간 혼합, 중복 기간, 깨진 metric/source ID, 0 이하 희석주식, `WACC <= g`입니다. 경고는 terminal 비중, 과거 범위를 벗어난 성장·마진, 장기 Capex<D&A, terminal 재투자 불일치입니다. 경고는 오류나 투자 판단을 뜻하지 않습니다.

이번 단계는 Monte Carlo를 실행하지 않습니다. 후속 4C는 결정론적 모델 검증 뒤 변수 분포, 상관관계, 경제적으로 불가능한 조합 차단, 고정 seed 재현 테스트를 갖춘 경우에만 진행합니다.

## Phase 5D 공개 설명 기준

가치평가의 목적은 특정 가격을 정답으로 제시하는 것이 아니라 현재 시장가격에 반영된 성장·마진·경쟁력 지속 기대를 기존 모형과 비교하는 것이다. 공개 화면은 단일 숫자 대신 보수·기준·낙관 시나리오의 가치 범위와 가격 위치를 먼저 보여준다.

현재 가격은 기존 `/api/market-prices`의 저장값을 같은 ticker·통화일 때 사용한다. 값, USD, ISO 기준시각, 정규장 종가 세션, source와 지연 가능성을 표시한다. 가격 기준일과 모형 기준일이 다르면 `가격 업데이트`로 구분하고 사업 가정은 자동 변경하지 않는다. 저장값을 사용할 수 없으면 검증된 report snapshot과 그 기준일을 사용한다.

주요 가정은 7년 매출 성장 경로, 장기 영업이익률, 세율, 감가상각, 설비투자, 운전자본, WACC, 영구성장률과 Terminal ROIC다. `WACC > g`일 때만 terminal value를 계산한다. Enterprise Value에서 현금·비영업자산을 더하고 부채·리스·비지배지분·기타 청구권을 뺀 뒤 양의 희석주식 수로 나눈다. 통화는 전체 경로에서 동일해야 한다.

Reverse DCF는 다른 가정을 고정하고 시장가격과 일치하는 7년 매출 CAGR 하나만 -20%~100% 범위에서 푼다. 해가 없거나 범위 밖이면 값을 만들지 않는다. WACC×영구성장률 민감도는 유효하지 않은 조합을 `계산 제한`으로 표시하며 기준 조합과 현재 가격에 가장 가까운 조합을 텍스트로 병기한다.

모형 version, 모형 기준일, 재무 기준일, 가격 기준일과 마지막 검증일을 표시한다. full은 NVIDIA·Meta, partial은 0개, 나머지 6개는 unavailable이다. 결측치는 0으로 대체하지 않는다. 계산은 반올림 전 원값을 사용하고 가격은 통화별 표시 자릿수, 비율은 기본 소수 첫째 자리로 반올림한다.

본 계산은 공개 자료와 명시 가정의 결과다. 실제 미래 실적이나 시장가격을 예측하거나 특정 가격을 제시하지 않으며 가정이 달라지면 결과도 달라진다. 투자 권유가 아니다.

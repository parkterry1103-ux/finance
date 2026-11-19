# 인텔: 시장·산업·기업 요인을 구분한 업데이트

## 세션 확인

- 현재 서울 날짜: 2026-11-06 금요일. 출처 대조 시각: 2026-11-06 23:00 KST.
- 최근 완료 KRX 정규장: 2026-11-06. 최근 완료 미국 정규장: 2026-11-05.
- 미국 11월 5일 16:00 EST 종가는 한국 11월 6일 06:00 KST에 해당한다.
- 대표 가격과 비교값은 모두 `regular_close`. 11월 6일 미국 장전 가격은 제외한다.
- 검토 방식: AI 보조 출처 대조(`source_verified`). 소유자의 직접 검토나 원인 확정을 뜻하지 않는다.

## 선정과 게시 판단

사용자가 지정한 인텔을 우선했다. 다른 종목 순위를 만들지 않았다. 이번 글은 단일 기업 촉매를 주장하는 속보가 아니라, 검증 가능한 같은 날 가격으로 시장·산업·기업을 구분하는 업데이트다. 시장 동반 하락만으로 회사 고유 원인을 확정하지 않는다.

| 기준 | 확인 결과 |
| --- | --- |
| 가격 움직임 | INTC -10.33%, 종가 교차 확인 |
| 직접 촉매 | 검토 자료에서 11월 5일 인텔 고유 촉매 미확정 |
| 설명 가치 | 크게 하락했지만 반도체 ETF보다 덜 하락 |
| 분석 깊이 | 시장 위험회피·산업 기대와 기존 회사 전망 구분 |
| 독자 관련성 | 반도체 종목을 기업 뉴스 하나로 설명하는 오류 점검 |
| 후속 관찰 | 동일 세션 상대수익률, Q4 전망, 공급·현금흐름 |

## 가격 무결성

| 대상 | 11월 4일 종가 | 11월 5일 종가 | 수익률 | INTC와 차이 |
| --- | ---: | ---: | ---: | ---: |
| INTC | $58.27 | $52.25 | -10.33% | — |
| SPY | $766.81 | $733.00 | -4.41% | -5.92%p |
| SOXX | $150.14 | $131.90 | -12.15% | +1.82%p |

계산은 `(당일 종가 / 전일 종가 - 1) × 100`. 비교 차이는 `기업 수익률 - 비교 대상 수익률`이며 %p로 표시한다. SPY는 S&P 500 지수 자체가 아니라 추종 ETF다. SOXX는 11월 5일 3대 1 분할을 반영하므로 양쪽 모두 분할 조정 가격을 사용한다. 전일 원가격 $450.41을 그대로 연결하지 않는다. 소수 둘째 자리로 반올림했다. 거래량 평균과 직접 경쟁사 비교는 추가 검증 범위 밖이므로 생략했다.

## 원인 확신도

- `confirmed_direct_catalyst`: 당일 기업 고유 촉매 미확정. 10월 29일 실적을 11월 5일 신규 발표로 표시하지 않는다.
- `market_background`: 주요 보도가 전한 AI 관련주 매도 및 데이터센터 투자 우려. 우려의 보도와 실제 정책·발주 변경은 다르다.
- `likely_contributor`: 산업 기대 재조정은 가능한 설명이지만 인텔 가격에 미친 기여도는 계량하지 않았다.
- `unresolved`: 개별 기업 뉴스, 포지션 축소, 강제매도, 각 요인의 비중. 자료 미확인이 뉴스 부재의 증명은 아니다.

## 확인 사실과 해석

공식 Q3 매출은 $16.5B, 전년 동기 대비 +21%. 회사의 Q4 전망은 매출 $15.0B~$16.0B와 비GAAP EPS $0.25다. 회사는 Xeon 공급 확대와 PC 업황 둔화를 함께 언급했다. 이는 10월 29일 공개된 기업 배경이다.

- 펀더멘털: 공식 매출·전망·공급 과제는 갱신할 사업 정보. 11월 5일 낙폭 자체는 신규 사업 악화의 증거가 아니다.
- 기대: 산업 투자 기대의 재조정 가능성. 컨센서스 대비 수치는 검증하지 않아 사용하지 않는다.
- 밸류에이션: 주가 변화는 관찰되지만 멀티플 변화의 독립적 기여도는 미확인. 새 적정가치를 계산하지 않는다.
- 수급·유동성: 매도세 보도와 개별 강제매도 증거는 구분한다. 수급 주체·기여도 미확인.
- 종합: `mixed`. 인과 추정 모델이나 시장/업종 조정 알파가 아닌 단순 상대수익률 비교다. SOXX 구성과 인텔 사업 구조는 동일하지 않다.

## 기업 판단과 다음 확인

`thesis_impact: partially_revise`, `valuation_review_required: true`. 7월 자료만 사용한 가정은 10월 29일 전망으로 갱신해야 한다. 가격 하락만으로 가정을 낮추거나 가치평가 결과를 자동 수정하지 않는다.

1. 11월 6일 미국 정규장 종료 후(한국 11월 7일 06:00): INTC·SPY·SOXX 비교.
2. 11월 9~13일: 데이터센터 정책의 실제 문서·적용 범위.
3. 다음 공식 실적: Q4 회사 매출·EPS 전망 달성 여부. 검토한 IR 달력에서 발표일 미공개.
4. 다음 공식 사업 업데이트: Xeon 공급과 실제 출하·매출.
5. 차기 실적·공시: PC 둔화, 운전자본과 공급 투자, 현금흐름.

## 업데이트 이력

- 구분: 정정이 아닌 새 시점 업데이트. 원문 분석일 2026-07-25, 원문 가격일 2026-07-24.
- 당시 정보: Q2 실적·Q3 전망·투자 계획을 다뤘다. 해당 문서와 사용자 기록은 덮어쓰지 않는다.
- 새 정보일: 2026-10-29 회사 발표, 2026-11-05 정규장 가격.
- 새 해석: 11월 5일에는 인텔과 시장·반도체 산업의 동반 움직임을 비교한다. 7월 원인 설명을 현재에 재사용하지 않는다.
- 기업 판단: 일부 가정 재검토. 가치평가 입력 검토 필요, 신규 목표 가격 없음.

## Claim-level source pack

| Claim | Source type | Publisher | Title | Date | URL | Status |
| --- | --- | --- | --- | --- | --- | --- |
| INTC 종가 $52.25, -10.33% | price | Stock Analysis / S&P Global | INTC Historical Data | 2026-11-05 | https://stockanalysis.com/stocks/intc/history/ | market-data confirmation |
| INTC 종가·전일 대비 교차 확인 | price | ChartExchange | INTC Historical Data | 2026-11-05 | https://chartexchange.com/symbol/nasdaq-intc/historical/ | market-data confirmation |
| SPY -4.41% | market | Stock Analysis / S&P Global | SPY Historical Data | 2026-11-05 | https://stockanalysis.com/etf/spy/history/ | market-data confirmation |
| SOXX -12.15%, 조정 종가 사용 | sector | Stock Analysis / S&P Global | SOXX Historical Data | 2026-11-05 | https://stockanalysis.com/etf/soxx/history/ | market-data confirmation |
| SOXX 3대 1 분할, 11월 5일 조정 거래 | filing | iShares | October 23 supplement, PDF p.1 | 2026-10-23 | https://www.ishares.com/us/literature/sai/sai-ishares-trust-3-31.pdf | official confirmation |
| Q3 매출·Q4 전망·공급과 PC 업황 | company | Intel IR | Intel Reports Third-Quarter 2026 Financial Results | 2026-10-29 | https://www.intc.com/news-events/press-releases/detail/1786/intel-reports-third-quarter-2026-financial-results?v=2 | official confirmation |
| AI 관련주 중심 매도라는 시장 배경 | news | AP / The Hour | How major US stock indexes fared Thursday 11/5/2026 | 2026-11-05 | https://www.thehour.com/business/article/how-major-us-stock-indexes-fared-thursday-22514954.php | major-news reporting |
| AI 투자·자금조달·데이터센터 관련 우려 | news | Reuters / Investing.com | Tech-stock rout accelerates retreat from the AI trade | 2026-11-05 | https://ca.investing.com/news/stock-market-news/techstock-rout-accelerates-retreat-from-the-ai-trade-4935818 | major-news reporting |
| Q3 발표일, 다음 발표일 미공개 | company | Intel IR | IR Calendar | accessed 2026-11-06 | https://www.intc.com/news-events/ir-calendar | official confirmation |
| 상대수익률·세 요인 구분 | analysis | 주가해부실 | 본 문서의 계산·해석 | 2026-11-06 | — | editorial interpretation |
| 당일 기업 단일 촉매·강제매도·기여도 | unresolved | — | 검토 범위에서 확정 못함 | 2026-11-06 | — | not yet confirmed |

IR 달력은 사후 열람 자료이므로 11월 5일 가격 원인을 뒷받침하는 자료에서 제외한다. 뉴스의 장중 가격은 대표 수익률로 사용하지 않는다.

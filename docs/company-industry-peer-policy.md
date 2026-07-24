# 대표 업종·사업부·peer 정책

## 대표 업종

기업마다 최소 세 분류를 기록한다.

1. S&P Dow Jones Indices의 GICS 분류
2. FTSE Russell의 ICB 분류
3. 상장 거래소 또는 신뢰할 수 있는 시장 profile 분류

다수 분류가 같은 넓은 업종을 가리키면 그것을 대표 업종으로 사용한다. 용어가 모두 다르거나 복합기업의 경제적 실질을 한 라벨로 설명하기 어렵다면 `classificationNote`에 차이를 기록하고 임의로 정밀 업종을 만들지 않는다. 분류 source에는 provider, sector, industry, URL, 조회일이 필요하다.

## 공식 segment 우선

대표 업종은 검색·탐색 metadata다. 실제 사업 분석은 최신 공식 10-K·10-Q·사업보고서·실적자료의 segment를 우선한다. 각 segment는 ID, 표시명, 매출 비중 공개 여부를 기록한다. 복합기업은 대표 업종 하나와 공식 segment 둘 이상을 함께 유지한다.

## 축·지표별 비교

- 성장성: 같은 사업모델과 정의의 peer가 충분할 때 peer 중앙값, 아니면 자체 3~5년 또는 같은 분기 추세
- 수익성: 동일 정의 마진만 peer와 비교하고 사업구조가 다르면 자체 과거·segment 마진
- 재무건전성: 순현금, 현금흐름, 이자부담, CAPEX의 자체 과거 우선
- 밸류에이션: 동일 정의·동일 기간 peer가 있을 때만 peer 중앙값, 복합기업은 자체 과거 우선
- 해자: peer 숫자가 아니라 가격 결정력, 전환비용, 네트워크 효과, 규모, 브랜드, 규제, 데이터·생태계의 공식 근거

회사 전체에 하나의 peer set을 모든 축에 적용하지 않는다. 적절한 peer가 없으면 `자체 과거`, `직접 비교 자료 없음`, 또는 구체적인 비교 불완전 사유를 사용자에게 표시한다. 0이나 임의 업종값으로 채우지 않는다.

## 검증

`validateCompanyDissectionRegistry`는 분류 source 3개, provider 중복, 날짜·URL, 공식 segment, 5축 비교 문구와 source, 지원되지 않는 Valuation·Report CTA를 검사한다. 존재하지 않는 peer ID는 config에 둘 수 없으며 현재 Phase 5G는 검증된 숫자 peer ID를 새로 만들지 않는다.

## SMCI 적용

SMCI의 대표 업종은 기존 GICS·ICB·Nasdaq 분류를 사용하고 공식 Server & Storage Systems와 Subsystems & Accessories segment를 유지한다. 성장성은 최신 SEC 실제 매출의 전년 동기 비교와 주문→출하 자체 전환을 함께 보고, 수익성·재무건전성은 자체 과거 실제 마진·재고·매입채무·현금흐름을 우선한다. Dell·HPE의 동일 세션 주가 반응은 사건 배경이지 재무 peer 중앙값이 아니다. 검증 가능한 자체 과거 밸류에이션 범위가 없어 오각형 밸류에이션 축은 `확인 부족`으로 남긴다.

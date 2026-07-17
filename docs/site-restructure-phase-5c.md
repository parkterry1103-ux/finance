# Phase 5C — 비교 중심 재무 피벗 분석판

## 목적

기업 상세의 `숫자와 비교 보기`를 별도 동적 route인 `/ko/companies/{slug}/financials`로 연결했다. 사용자는 연간·분기 기준을 구분하고, 기간 추세·비교기업·산업 집계 중 검증 가능한 비교만 확인한다. 이 화면은 투자 추천이나 점수를 제공하지 않는다.

## 구현 범위

- 기존 지원 기업 8개에 같은 재무 분석판을 적용한다.
- 기존 `/api/financials`를 확장해 정규화된 연간 시계열과 안전한 최신 분기 데이터를 제공한다.
- 성장, 수익성, 현금흐름, 자본효율, 재무안전성, 주당지표의 6개 묶음을 제공한다.
- 비교기업은 반도체 3개 기업과 AI 서버 2개 기업군에만 명시적으로 연결한다.
- 산업 집계는 기존 NYU Stern 2026-01 버전 스냅샷을 재사용한다.
- 상세 기업 페이지, 공시, 차트, NVIDIA·Meta 리포트와 기존 `/ko/analysis` route는 유지한다.

## 데이터 감사 결과

| 기업 | 통화 | 연간 소스 | 분기 소스 | 비교기업 |
| --- | --- | --- | --- | --- |
| SK하이닉스 | KRW | OpenDART 사업보고서 | OpenDART 최근 정기보고서 | NVIDIA, Micron |
| LG전자 | KRW | OpenDART 사업보고서 | OpenDART 최근 정기보고서 | 안전한 빈 상태 |
| NVIDIA | USD | SEC 10-K CompanyFacts | SEC 10-Q CompanyFacts | SK하이닉스, Micron |
| Micron | USD | SEC 10-K CompanyFacts | SEC 10-Q CompanyFacts | SK하이닉스, NVIDIA |
| Dell | USD | SEC 10-K CompanyFacts | SEC 10-Q CompanyFacts | Supermicro |
| Eaton | USD | SEC 10-K CompanyFacts | SEC 10-Q CompanyFacts | 안전한 빈 상태 |
| Meta | USD | SEC 10-K CompanyFacts | SEC 10-Q CompanyFacts | 안전한 빈 상태 |
| Supermicro | USD | SEC 10-K CompanyFacts | SEC 10-Q CompanyFacts | Dell |

미국 기업은 기존 Phase 4A의 수정공시·중복 context 선택 규칙을 재사용한다. 한국 기업은 연결재무제표를 먼저 사용하고 없는 경우에만 별도재무제표를 확인한다. 누적 분기 데이터를 독립 분기로 추정하지 않는다.

## 아키텍처

```text
Company Brief CTA
→ FinancialPivotRoute 동적 chunk
→ 선택 기업 /api/financials 요청
→ 기간 추세 기본 표시
→ 비교기업 선택 시에만 peer 기업 연간 데이터 추가 요청
```

신규 Serverless Function, DB, dependency는 없다. Function 수는 12개다.

## 검증 기준

`scripts/financial-pivot-unit.ts`가 8개 기업 식별자, peer 연결, %와 %p, 0 분모, 부호 전환, CAGR, 중앙값, 결측치, lazy route와 시맨틱 표를 검사한다. 이 검사는 `validate:financials`와 Release Gate에서 실행된다.

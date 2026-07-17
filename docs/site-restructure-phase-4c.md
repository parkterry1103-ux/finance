# 사이트 재개편 4C — 확률적 가치평가와 불확실성 범위

## 범위와 기준점

- 시작 브랜치: `feat/monte-carlo-valuation-phase-4c`
- 시작 HEAD: `cbbec2d58f71c65ff6c9ac244e66eb9b4f0358df`
- 시작 Production: Vercel `finance1`, deployment `3pAu3V9E3XSN72HasMyQ1tBGqXW4`
- 대상: NVIDIA와 Meta 리서치 리포트만
- 기존 4A Driver-based FCFF DCF의 `runScenario`를 모든 표본에서 재사용
- 신규 API, Serverless Function, DB, migration, cron, sync, runtime 계산, 외부 dependency: 0

## 사용자 경험

각 리포트의 결정론적 세 조건 다음에 `가치평가의 불확실성`을 추가했다. 기본 화면은 다음 순서로 읽힌다.

1. P50 중앙값
2. P25–P75 중앙 50% 범위
3. P10–P90 넓은 80% 범위
4. 현재 시장가격의 모형 분포상 위치
5. Spearman 순위상관 절댓값 기준 주요 입력 5개
6. Terminal Value 의존도
7. 해석 한계
8. 접힌 `상세 가정·방법론`

분포 시각화는 P10·P25·P50·P75·P90과 현재 시장가격을 같은 수평 축에 표시한다. 색상 외에도 marker, 라벨, 숫자와 텍스트 대안을 제공한다. 현재 가격의 위치는 같은 `2026-07-15` snapshot끼리만 계산하며 미래 주가의 방향이나 수익 가능성으로 설명하지 않는다.

## 정적 생성과 lazy load

`scripts/generate-monte-carlo-artifacts.ts`가 Node에서 회사별 50,000회 실행을 만들고 집계 결과와 500행 검증 표본을 저장한다. 브라우저는 시뮬레이션을 실행하지 않는다.

```text
4A assumptions + company report snapshot
→ seeded Node generator
→ existing 4A runScenario × 50,000
→ aggregate JSON/CSV/SVG artifacts
→ company-specific static JSON
→ report route lazy load
```

`src/content/monte-carlo/registry.ts`는 NVIDIA와 Meta 결과를 각각 별도 dynamic import로 불러온다. 홈, 기업 검색과 기업 대시보드는 이 데이터를 import하지 않으며 NVIDIA 리포트를 열 때 Meta 결과를 요청하지 않는다.

## 뉴스 분포 조정 판단

4B의 뉴스 snapshot을 다시 검토했지만 숫자 분포를 바꾸지 않았다.

- NVIDIA: 중국 제외 가이던스, Rubin 생산 전환과 일본 프로젝트 모두 기존 4B에서 기준 숫자를 유지하고 실제 출하·매출 확인을 기다린다고 기록했다.
- Meta: Capex 가이던스는 투자 부담의 관찰 우선순위를 높였지만 4B가 4A 세 시나리오 숫자를 유지했다. 외부 컴퓨팅 판매는 보도 단계이고 신규 채권은 현금 유입과 부채 증가를 함께 확인해야 한다.

따라서 `distributionAdjustments`는 두 회사 모두 빈 배열이며 공개 화면에 빈 카드나 변경 없음 placeholder를 만들지 않는다.

## 회귀 보호

- 결정론적 보수·기준·낙관 결과를 4A 저장값과 재비교
- 12개 Serverless Function 유지
- 기업 프로필 8개, 공개 리서치 기업 2개 유지
- 기존 홈, 기업 검색, 기업 대시보드, 거시경제, 시장지도와 공시 경로 유지
- `package-lock.json`과 의존성 목록 변경 없음

세부 수식과 검증 기준은 `docs/monte-carlo-valuation-methodology.md`, 입력 목록은 `docs/monte-carlo-assumption-inventory.md`, 실행 결과는 `docs/monte-carlo-validation.md`에 기록한다.

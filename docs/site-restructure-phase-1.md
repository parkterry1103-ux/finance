# 사이트 재개편 1단계 — 홈과 내비게이션 단순화

## 작업 기준과 기존 구조 감사

- 시작 HEAD: `e26a2ea61f4db43ff2ab3bfc6b78a05c75da4ca3`
- 홈 entry: `App.tsx`의 `LandingPage` → 기존 `BeginnerLandingPage`
- 공통 Header: `App.tsx`의 `PrimaryNavigation`
- 모바일 navigation: `PrimaryNavigation`이 desktop·mobile 상태를 함께 관리
- 기존 primary navigation: `오늘`, `산업`, `기업`, `자료` 4개 그룹, 하위 링크 10개
- 기존 홈 section: top-level 8개, 중첩 section까지 포함하면 12개
- 기존 홈 데이터 요청: 시장 가격 1개, OpenDART 공시 1개, SEC EDGAR 공시 1개로 총 3개
- 기업 목록 canonical route: `/ko/companies`
- 거시경제 canonical route: `/ko/macro-dashboard`
- legacy route: `legacyMarketMapRoutes` resolver와 Vercel SPA rewrite를 그대로 유지

기존 홈에서만 조합되던 `BeginnerMarketOverview`, `BeginnerMarketDrivers`, `HomeInsightCards`, `BeginnerIndustryFlows`, 홈 기업 이벤트·Pick·공식 자료 section은 새 홈 render path에서 제외했습니다. `PrimaryNavigation`, 기업 identity, 가격·공시 서비스, 산업 흐름·병목·리포트 registry는 다른 route의 소비자가 있으므로 보존했습니다.

## 기존 홈 문제

기존 홈은 오늘 시장 브리핑, 시장 동인, 산업 흐름, 기업 이벤트, 거시 카드, 병목, Pick, 산업 리포트를 한 화면에 함께 배치했습니다. 사용자는 첫 방문에서 정보의 우선순위보다 기능 목록을 먼저 해석해야 했고, 공통 내비게이션도 4개 그룹과 10개 링크를 다시 탐색해야 했습니다.

## 1단계 목표

홈의 역할을 “기업 분석과 거시경제 중 시작점을 선택하는 화면” 하나로 제한합니다. 공통 primary navigation도 같은 두 축으로 맞추고, 모바일 메뉴에는 두 링크만 남깁니다. 이번 단계에서는 검색, 기업 대시보드, 거시경제 화면 자체를 확장하지 않습니다.

## 제거한 홈 section

- 오늘 시장 한눈에와 복잡한 시장 브리핑
- 시장 동인과 오늘 알아둘 세 가지
- 산업 흐름과 수요·공급 목록
- 기업 이벤트와 공시 목록
- 거시 요약 카드와 시장 관계 shortcut
- 공급망 병목 목록
- 이번 주 Pick과 기업 카드
- 산업 리포트 목록과 다수의 CTA
- 첫 방문 가이드와 장문의 기능 소개

위 항목은 홈 DOM과 primary navigation에서만 제거했습니다. 원본 component, route, API, content registry는 후속 재배치를 위해 유지합니다.

## 보존한 route와 데이터

- `/ko`, `/ko/companies`, `/ko/companies/:slug`
- `/ko/company-events`, `/ko/demand-supply`, `/ko/macro-dashboard`
- `/ko/market-relations`, `/ko/bottlenecks`, `/ko/reports`, `/ko/disclosures`
- 한국어 route, 영문 alias, 기존 legacy route와 deep link
- Serverless Function 12개, public API 9개, sync endpoint 6개
- 기업 프로필 8개, 기업 이벤트 12개, 수요·공급 4개, 병목 6개
- 산업 리포트 15개, 산업 흐름 4개, 거시지표 9개, 시장 관계 3개

홈은 위 데이터를 더 이상 요청하거나 렌더링하지 않습니다. 가격·OpenDART·SEC 요청은 해당 데이터가 필요한 기존 route에서만 계속 수행합니다.

## 새로운 홈 정보 구조

```text
주가해부실
├── 기업 분석 → /ko/companies
└── 거시경제 → /ko/macro-dashboard
```

홈 본문은 한 개의 `h1`, 한 줄 subtitle, 동일한 비중의 진입 카드 두 개로 구성합니다. 카드 CTA는 실제 canonical route로 이동하며 가짜 검색 입력이나 준비 중 placeholder를 두지 않습니다. Footer는 브랜드, 데이터 기준 및 출처, 투자 권유가 아니라는 안내만 유지합니다.

## 후속 단계

1. 2단계 기업 검색
2. 3단계 간결한 기업 대시보드
3. 4단계 기업 리서치 리포트
4. 5단계 거시경제 재구성
5. 6단계 기업·거시 연결
6. 7단계 시장 변곡점 연동

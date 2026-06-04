# 주가해부실

초보 투자자가 오늘의 뉴스나 급등락 종목을 보고 “왜 움직였는지”, “어떤 시장 흐름과 연결되는지”, “같이 볼 기업은 무엇인지”, “재무에서 무엇을 먼저 봐야 하는지”를 빠르게 이해하도록 돕는 시장 흐름 해설 웹사이트입니다. 완성형 금융 데이터 플랫폼이 아니라 인스타그램 콘텐츠의 확장판이자 포트폴리오형 학습 도구로 운영합니다.

## 포트폴리오 설명

- 프로젝트 목적: 초보 투자자가 뉴스와 종목 이슈를 시장 흐름, 기업 관계, 재무 핵심으로 연결해 이해하도록 돕는 학습형 금융 웹사이트입니다.
- 타깃 사용자: 금융 뉴스와 공시, 재무제표를 어렵게 느끼는 주식 입문자입니다.
- 핵심 문제: 뉴스 하나가 실제로 어떤 기업의 수요, 매출, 재무지표와 연결되는지 초보자가 한눈에 보기 어렵습니다.
- 해결 방식: `홈 -> Pick -> 시장 흐름 지도 -> 기업 해설 -> 재무 쉽게 보기` 동선으로 이슈를 먼저 보고, 관련 기업과 먼저 볼 숫자 3개로 깊이를 조절합니다.
- 사용 기술: Vite, React, TypeScript, React Flow, Vercel Serverless Functions, Supabase/PostgreSQL, OpenDART, SEC EDGAR 기반 동기화 구조를 사용합니다.
- 데이터 신뢰도 원칙: 공식 원문과 기준 보고서를 우선하며, 연결이 없거나 불확실한 데이터는 `확인 필요`, `원문 연결 필요`, `공식 데이터 연결 필요`로 표시합니다.
- MVP 범위: AI 반도체 & 데이터센터 흐름을 대표 섹터로 두고, Pick/기업 해설/재무 쉽게 보기 중심의 초보자 경험을 우선합니다.
- 향후 개선 계획: Pick 운영 데이터 관리, 추가 시장 흐름 확장, 원문 링크 보강 자동화, 모바일 공유 카드, 더 정교한 데이터 최신성 표시를 단계적으로 개선합니다.

## 프로젝트 철학: 시장 흐름을 스스로 읽는 도구

주가해부실은 특정 종목의 매수·매도 판단을 대신 내려주는 서비스가 아닙니다. 목표주가나 수익률 예측을 제공하지 않고, 공식 데이터와 출처를 바탕으로 사용자가 스스로 확인할 포인트를 찾도록 돕는 학습 도구입니다.

핵심은 초보 투자자가 “어떤 주식이 오를까?”를 묻기보다, 뉴스와 산업 변화가 어떤 밸류체인을 거쳐 기업의 실적과 연결되는지 스스로 사고할 수 있게 만드는 것입니다. 예를 들어 “AI가 성장한다”는 뉴스가 있을 때 단순히 AI 관련 종목을 나열하지 않고 다음 흐름을 단계적으로 보여줍니다.

1. AI 수요가 어디서 발생하는지
2. 그 수요가 어떤 부품·장비·인프라로 이어지는지
3. 각 단계에 어떤 기업들이 있는지
4. 그 기업들이 실제로 무엇을 팔고 누구의 수요와 연결되는지
5. 재무제표에서 어떤 숫자를 먼저 확인해야 하는지

즉, 주가해부실은 투자 추천 사이트가 아니라 `뉴스 -> 산업 흐름 -> 밸류체인 -> 기업 해설 -> 재무 핵심`으로 이어지는 초보 투자자용 시장 흐름 학습 도구입니다.

포트폴리오 관점에서는 다음 역량을 보여주는 프로젝트입니다.

- 뉴스와 거시 흐름을 산업 구조로 연결하는 기획 능력
- 밸류체인 기반으로 관련 기업과 수혜 가능 기업을 정리하는 분석 능력
- 기업의 비즈니스 모델과 재무제표를 초보자 눈높이로 설명하는 콘텐츠 설계 능력
- SEC/OpenDART 공식 데이터를 우선하는 데이터 신뢰도 설계
- React, TypeScript, Vercel Serverless Functions, Supabase를 활용한 금융 웹서비스 구현 능력

## MVP 운영 원칙

- 이 사이트는 초보 투자자를 위한 시장 흐름 해설 도구입니다.
- 홈에는 `Pick`, `시장 흐름 지도`, `기업 해설`, `재무 쉽게 보기`만 우선 노출합니다.
- 기관 동향, SEC 13F, Form 4, 공급망 참고, 관계 출처, 가격 상세, 전체 공시 목록은 고급 참고자료로 둡니다.
- AI 반도체 & 데이터센터를 첫 대표 섹터로 완성하고, 다른 섹터는 준비 중 흐름으로 낮춰 표시합니다.
- 숫자는 기준 보고서, 공시일, 데이터 상태와 함께 보여줍니다.
- 데이터가 불확실하면 `확인 필요`, `원문 연결 필요`, `공식 공시 기준 확인 필요`로 솔직하게 표시합니다.
- 차트 분석 사이트처럼 보이지 않게 하고, 가격보다 이유, 데이터보다 해석을 먼저 보여줍니다.
- 초보자가 3초 안에 “주가해부실은 뉴스와 종목을 더 큰 시장 흐름으로 연결해주는 곳”이라고 이해해야 합니다.

## 디자인 시스템 원칙

- 주가해부실은 라이트 톤, 넓은 여백, 둥근 카드, 부드러운 그림자, 블루 포인트 컬러를 기본으로 합니다.
- 기본 UI는 라이트 모드 중심으로 운영합니다.
- 초보자용 서비스이므로 읽기 쉬움과 정보 위계가 최우선입니다.
- 고급 정보는 `더 깊게 보기`로 낮춰 핵심 흐름을 먼저 읽게 합니다.
- 색상은 흰색/연한 회색/블루를 중심으로 쓰고, 상승은 초록, 하락은 빨강 의미를 유지합니다.
- 카드 하나에는 메시지 하나만 담습니다. 긴 설명은 더보기, 상세 페이지, 원문/출처 확인으로 분리합니다.
- 버튼은 `Primary CTA`, `Secondary CTA`, `Ghost`, `Small link` 흐름으로 구분하고, CTA는 눈에 띄되 과하게 만들지 않습니다.
- 배지는 작고 읽기 쉽게 사용합니다. 데이터 상태는 `최신 확인됨`, `직전 보고서 기준`, `업데이트 필요`, `원문 연결 필요`, `공식 공시 기준 확인 필요`처럼 솔직하게 표시합니다.
- 데이터보다 해석을 먼저 보여줍니다. 숫자, 13F, Form4, 관계 출처, 공급망 참고는 고급 참고자료로 낮춰 둡니다.
- 모바일 우선입니다. 카드 1열, 큰 버튼, 짧은 문장, 한 화면 정보 3개 이하를 기본으로 합니다.
- 레퍼런스 디자인은 분위기만 참고하고 직접 복제하지 않습니다.
- 공식/허용 가능한 로고 자산이 없으면 기업 이니셜/심볼 fallback을 사용합니다.
- 디자인 디테일은 라이트 톤과 브랜드 블루를 중심으로 맞춥니다. 카드마다 연한 블루/그린/퍼플/오렌지 tint를 보조로 쓰되, 원색이나 과한 대비는 피합니다.
- 아이콘은 내용을 더 빨리 이해하게 돕는 보조 수단입니다. 카드 메시지를 늘리기보다 작은 아이콘, 부드러운 배경, 짧은 문장으로 의미를 전달합니다.
- 선과 화살표는 흐름을 설명하는 수준으로만 사용합니다. 거미줄형 선이나 복잡한 네트워크 느낌은 피하고, 핵심 흐름과 선택 상태만 조금 더 선명하게 표시합니다.
- 고급 정보는 조용하게 둡니다. 원문, 출처, 기관 동향, 전체 관계는 접힌 영역이나 보조 버튼으로만 접근하게 합니다.
- 투자 추천처럼 보이는 표현은 쓰지 않습니다. `확정 수혜`, `급등 예상`, `지금 사야 할`, `보장`, `매수 추천` 대신 `같이 볼 기업`, `확인할 포인트`, `먼저 볼 숫자`를 사용합니다.

## 홈 화면 운영 원칙

- 홈은 기능 대시보드가 아니라 주가해부실의 정체성을 전달하는 랜딩 페이지입니다.
- 홈은 시장 흐름 지도형 랜딩입니다. 첫 화면에는 `오늘 시장 흐름 한눈에`, `관계지도 보기` CTA, 지금 주목할 흐름 3개만 강하게 둡니다.
- Primary CTA는 하나만 강하게 둡니다. 홈에서는 `관계지도 보기`를 filled button으로, `이번 주 Pick`은 보조 ghost button으로 표시합니다.
- 히어로 카피는 긴 설명보다 메시지 중심으로 씁니다. 사용자가 첫 문장에서 “뉴스가 왜 주가를 움직였는지 흐름으로 본다”는 목적을 이해해야 합니다.
- 섹션은 숫자 pill 대신 여백, 제목, 타이포그래피로 구분합니다. 떠 있는 숫자가 카드 흐름보다 먼저 보이지 않게 합니다.
- 네비게이션 앵커는 실제 섹션이나 페이지와 일치해야 합니다. `시장 흐름 지도`, `기업 해설`, `재무 쉽게 보기`가 같은 위치로 이동하면 안 됩니다.
- 모바일 카드 설명은 `제목 + 1줄 설명 + 보기 버튼`으로 압축합니다. 긴 문단은 Pick, 기업 해설, 재무 쉽게 보기 상세에서 다룹니다.
- 홈에는 오늘 주목 흐름, 핵심 이슈 3개, 오늘의 핵심 흐름, 이번 주 해부 종목 3개, 초보자 가이드 2~3개만 우선 노출합니다.
- 시장 흐름 미리보기는 `수요 -> AI 칩 -> 메모리 -> 파운드리 -> 전력`처럼 5단계 카드 흐름으로 압축합니다.
- 가격, 공시, 기관 동향, SEC 13F, Form4, 전체 관계, 관계 출처, 공급망 참고는 홈에서 숨기고 기업 해설의 고급 참고자료로 보냅니다.
- AI 반도체 외 섹터는 준비 중 흐름으로 낮춰 표시하고, 홈의 주요 콘텐츠처럼 보이지 않게 합니다.
- 모바일에서는 히어로, Pick, AI 흐름, 초보자 가이드 순서로 3초 안에 목적이 이해되어야 합니다.
- 모바일 지도는 1열 카드형 탐색을 우선하고, PC 지도는 중앙의 선택 기업 카드 탐색을 화면 주인공으로 둡니다.
- ReactFlow 전체 관계 보기는 고급 보기이며 기본 화면에는 노출하지 않습니다.

## 초보자용 시장 흐름 UI 원칙

- 메인 화면은 초보자가 10초 안에 이해할 수 있어야 합니다.
- 첫 화면에는 오늘의 시장 흐름, 먼저 볼 기업, 다음에 누를 버튼만 보여줍니다.
- 자세한 재무제표, 공시, 관계 출처, 13F/Form4 기록은 더보기나 상세 페이지로 분리합니다.
- 시장 흐름 지도는 거미줄 그래프가 아니라 단계형 흐름으로 보여줍니다.
- 지도 연결선은 매끈하고 정돈되게 사용하고, 기업당 기본 관계는 2~3개만 먼저 보여줍니다.
- 상세 지도도 기본값은 핵심 관계이며, 전체 관계·한국 관련주·미국 기업·공급망 참고·관계 출처는 필터로 분리합니다.
- 한국/미국은 별도 메뉴로 끊지 않고 하나의 시장 흐름 안에서 필터로 확인합니다.
- 상장기업과 비상장 참고 기업을 구분하고, 공급망·하청·OEM/ODM/CMO 정보는 보조 맥락으로 둡니다.
- 13F/Form4는 실시간 매수 신호가 아니라 보조 참고 정보로 다룹니다.
- 숫자는 해석 없이 보여주지 않고, 차트 분석 사이트처럼 보이지 않게 합니다.
- 기업 상세 첫 화면은 회사 본질, 수요 연결, 경제적 해자, 투자자가 볼 포인트를 10초 안에 이해하게 구성합니다.
- 가격·차트·기관 보고는 보조 정보로 낮추고, 재무지표는 산업별로 먼저 볼 3가지와 해석을 함께 보여줍니다.
- 재무제표 해설은 숫자 나열이 아니라 해석 중심으로 구성합니다.
- 재무제표 첫 화면에는 한 줄 결론, 쉬운 해석, 산업별 핵심 3개 지표만 먼저 보여줍니다.
- PER, EPS, PBR, ROE, FCF, CAPEX 같은 지표는 중요하지만 수익성·성장성·안정성·현금흐름·밸류에이션으로 나누어 단계적으로 보여줍니다.
- 산업 평균과 경쟁사 비교는 출처가 있을 때만 표시하고, 출처 없는 평균 숫자는 만들지 않습니다.
- 매출이 늘었다고 무조건 좋게 보지 않고, 현금흐름·재고·매출채권·CAPEX를 함께 확인합니다.

## 이번 버전 변경점

- 한국어 UI 중심으로 문구 정리
- 섹터 9개로 확장: 반도체, 자동차·미래차, 배터리·소재, 디스플레이·OLED, 조선·방산, 바이오·헬스케어, AI·데이터센터, 로봇·자동화, 화장품·소비재
- 섹터별 중심 기업 3개, 총 27개 구성
- 중심 기업별 1차 관계 기업 4개 + 중소형 보조 관계 기업 12개 배치
- 총 459개 노드, 432개 관계 후보 기업 노드 생성
- 뉴스 API 키워드와 신뢰 도메인을 한국 섹터 중심으로 확장
- 뉴스 조회 기본 기간을 최근 24시간으로 확대
- 토스 스타일에 가까운 둥근 카드, 흰색 패널, 블루 액션, 부드러운 그림자 디자인 적용
- 재무제표·공시 분석 화면을 핵심 숫자와 한 줄 결론 중심으로 먼저 보여주고, 기존 해설은 접힘 섹션으로 보존
- 인스타그램 카드뉴스 유입용 `주가해부실 Pick` 페이지 추가: `/ko/picks`, `/picks`, `/stock-autopsy-picks`

## Local

UI만 확인할 때:

```bash
npm ci
npm run dev
```

`/api/news`까지 같이 확인할 때:

```bash
npm run dev:vercel
```

일반 `npm run dev`는 Vite만 실행하므로 `/api/news`가 Vercel Serverless Function으로 실행되지 않습니다.

## Build

```bash
npm run build
```

### 현재 패키지 매니저 확인

이 프로젝트는 `package-lock.json`이 있으므로 npm 프로젝트입니다.

현재 Codex 실행 환경 확인 결과:

```bash
node -v   # v24.14.0
npm -v    # command not found
pnpm -v   # command not found
yarn -v   # command not found
corepack --version # command not found
```

따라서 이 환경에서는 `npm run build`를 직접 실행할 수 없습니다. 대신 동일한 빌드 흐름을 아래처럼 대체 검증했습니다.

```bash
/Applications/Codex.app/Contents/Resources/node ./node_modules/typescript/bin/tsc --noEmit
/Users/parktaewon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node ./node_modules/vite/bin/vite.js build
```

운영자 로컬 또는 Vercel에서는 npm이 설치된 환경에서 아래 명령을 사용하세요.

```bash
npm ci
npm run build
```

## Vercel

Vercel에서 이 폴더를 프로젝트로 가져오면 됩니다.

- Framework Preset: `Vite`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`

위 값은 `vercel.json`에 이미 들어 있습니다.

## 무료 공식 데이터 자동 업데이트 구조

유료 API를 전제로 하지 않습니다. 우선 사용하는 무료/공식 데이터 소스는 다음입니다.

- 한국 재무제표/공시/임원·주요주주: OpenDART API
- 미국 재무제표/공시: SEC EDGAR APIs, SEC CompanyFacts
- 미국 내부자 거래: SEC Form 3/4/5 filing XML
- 미국 기관 포트폴리오: SEC 13F filing
- 미국 국회의원 거래: House/Senate 공개자료 파서 또는 공개 CSV/JSON import
- 국민연금/한국 국회의원 포트폴리오: 공개자료 기반 수동/반자동 import

프론트 화면은 API/DB가 없어도 기존 `src/data.ts` mock/fallback 데이터를 계속 보여줍니다. 자동 수집 데이터는 기존 재무제표 해설, DART/SEC 분석, MD&A 해설을 대체하지 않고 보강하는 용도입니다.

`/api/financials`의 US SEC CompanyFacts 데이터는 프론트의 “재무 쉽게 보기” 화면에 연결되어 있습니다. `sourceStatus`가 `direct` 또는 `partial`일 때만 기존 “먼저 볼 숫자 3개” 카드에 실제 SEC 숫자를 일부 표시하고, 실패하거나 값이 없으면 기존 fallback을 유지합니다. 가짜 숫자는 생성하지 않으며, KR/OpenDART 프론트 연결은 다음 단계에서 진행합니다.

SEC 보조 지표는 CIK가 있는 미국 기업에 재사용 가능한 구조로 연결합니다. NVIDIA와 Micron은 필수 검증 대상이며, 유동비율, 이자보상배율, FCF, EPS, 감가상각비는 “지표 더 깊게 보기” 같은 고급 영역에만 표시합니다. FCF는 `영업현금흐름 - CAPEX`로 계산하며, 값이 없으면 기존 fallback을 유지합니다. PER/PBR은 가격·시가총액 데이터가 필요해 보류하고, EPS 성장률은 기간 비교 정합성이 필요해 보류하며, ROE는 평균자본 기준 정교화 전까지 보류 또는 고급 지표로 관리합니다. 출처 없는 숫자나 가짜 숫자는 만들지 않습니다.

`/api/financials`는 KR 기업에 대해 OpenDART 정기보고서 재무정보도 조회합니다. 연결재무제표 `CFS`를 먼저 보고, 데이터가 없으면 개별재무제표 `OFS`로 fallback하며, `11014` 3분기, `11012` 반기, `11013` 1분기, `11011` 사업보고서 순서로 최근 연도부터 탐색합니다. OpenDART에 없는 항목은 `null`로 유지하고 가짜 숫자는 만들지 않습니다. KR 프론트 화면 연결은 API 안정화 다음 단계에서 진행합니다.

### 향후 산업 데이터 연결 후보

이번 MVP에서는 산업 평균 PER/PBR/마진을 화면에 표시하지 않습니다. 출처가 검증된 API를 연결하기 전까지 `산업 평균 데이터 연결 필요`, `경쟁사 비교 데이터 연결 필요` 상태를 유지하고, 가격 데이터로 PER/PBR을 임의 계산하지 않습니다.

후보 조사는 “공식 재무 원문은 SEC/OpenDART 우선, 외부 API는 산업·peer 비교 보조” 원칙으로만 정리합니다. 실제 연결 시에는 서버리스 함수에서 호출하고, 화면에는 `출처`, `기준일`, `계산 방식`, `표본 범위`를 함께 표시해야 합니다.

| 후보 | 쓸 수 있는 데이터 | 적용 범위 | MVP 판단 | 구현 위치 후보 |
| --- | --- | --- | --- | --- |
| FMP | Sector/Industry P/E snapshot, sector/industry performance snapshot, financial ratios | 미국 섹터·산업 비교에 우선 적합. 한국 종목 적용성은 별도 확인 필요 | 산업 P/E나 섹터 흐름 후보로 가장 직접적입니다. 무료/요금제 제한과 재배포 조건 확인 후 연결합니다. | 새 `api/industry-benchmarks.ts` 또는 sync script. 기존 `/api/financials`와 분리 |
| Finnhub | Company peers, basic financials, 기업별 margin/P/E 등 보조 지표 | 미국 상장사 peer 그룹 구성에 우선 적합. 한국 커버리지는 종목별 확인 필요 | 산업 평균보다는 “peer sample” 구성 후보입니다. 평균을 만들 경우 표본과 계산식을 명시해야 합니다. | 새 peer/benchmark service. SEC 숫자와 섞지 않고 별도 source label 사용 |
| Alpha Vantage | Company Overview의 기업 정보, financial ratios, key metrics | 미국 기업 보조 지표에 우선 적합. 글로벌 ticker는 거래소 표기 확인 필요 | 기업별 valuation/ratio 보조 후보입니다. 산업 평균 원천으로 단정하지 않습니다. | 새 benchmark 후보 service. 기존 재무 원문 값과 분리 |
| Twelve Data | Fundamentals, profile, statistics, key ratios | 글로벌 커버리지 가능성이 있으나 plan 제한 확인 필요 | 이미 다른 소스가 부족할 때 보조 후보입니다. 유료 플랜/credit 비용을 먼저 확인합니다. | 별도 adapter 후보. 화면 표시는 보류 |
| FRED | 금리, 물가, 산업생산 같은 거시 시계열 | 미국 거시·금리 맥락에 적합 | 산업 PER/PBR 평균용이 아니라 매크로 배경 데이터로 분리합니다. | 시장 흐름 해설의 거시 참고자료 영역 |
| KIS | 한국 주식 현재가·기간별 시세 등 국내 가격 데이터 | 한국 상장사 가격/시세 보조에 적합 | 산업 평균보다는 가격 데이터 후보입니다. PER/PBR 계산은 공식 재무 기준과 시가총액 기준이 정리될 때까지 보류합니다. | 가격 전용 API/service. 이번 단계 연결 금지 |
| Exchange Rates | 환율 변환 | 통화 표시 보조 | 산업 비교 데이터가 아닙니다. USD/KRW 표시가 필요할 때만 보조로 검토합니다. | 통화 표시 helper 또는 서버리스 환율 cache |

참고 문서:

- FMP Sector P/E Snapshot: https://site.financialmodelingprep.com/developer/docs/stable/sector-pe-snapshot
- FMP Sector Performance Snapshot: https://site.financialmodelingprep.com/developer/docs/stable/sector-performance-snapshot
- Finnhub Company Peers / Basic Financials: https://finnhub.io/docs/api/company-peers, https://finnhub.io/docs/api/company-basic-financials
- Alpha Vantage Company Overview: https://www.alphavantage.co/documentation/#company-overview
- Twelve Data Fundamentals/Profile: https://twelvedata.com/docs/fundamentals/profile
- FRED API: https://fred.stlouisfed.org/docs/api/fred/
- KIS Developers API 문서: https://apiportal.koreainvestment.com/

### 추가된 주요 파일

- `src/services/financials.ts`: OpenDART, SEC CompanyFacts 조회 구조와 fallback
- `src/services/trades.ts`: OpenDART 소유보고, SEC Form 3/4/5, SEC 13F, 공개자료 import 구조와 fallback
- `src/services/filings.ts`: DART/SEC 직접 원문 보고서 링크 우선, 검색 링크/원문 연결 필요 상태 fallback
- `src/services/prices.ts`: 지연 가능 가격 fallback과 가격 표시용 helper
- `scripts/sync-opendart-financials.ts`
- `scripts/sync-sec-companyfacts.ts`
- `scripts/sync-sec-form4.ts`
- `scripts/sync-sec-13f.ts`
- `scripts/sync-congress-trades.ts`
- `scripts/audit-filing-links.ts`
- `scripts/sync-filing-links.ts`
- `scripts/sync-prices.ts`
- `api/sync/financials.ts`
- `api/sync/trades.ts`
- `api/sync/prices.ts`
- `supabase/schema.sql`
- `.github/workflows/sync.yml`

### 환경변수

`.env.example`을 기준으로 설정합니다. 서비스 키는 프론트에 노출되면 안 되므로 `VITE_` prefix를 붙이지 않습니다.

필수:

```bash
OPENDART_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
```

선택:

```bash
SEC_USER_AGENT=
SYNC_DEFAULT_MARKET=
SEC_13F_MANAGER_CIKS=
CONGRESS_TRADES_IMPORT_URL=
NPS_IMPORT_URL=
MARKET_PRICES_IMPORT_URL=
PRICE_IMPORT_URL=
PRICE_SYNC_SOURCE=
```

`src/data.ts`의 기업별 원문 링크 상태는 아래처럼 관리합니다.

- `sourceStatus: 'direct'`: `reportUrl`, `sourceDirectUrl`, `dartRcpNo`처럼 직접 원문으로 갈 수 있는 값이 있음
- `sourceStatus: 'search-only'`: 직접 원문은 없고 DART/SEC 검색 링크만 있음
- `sourceStatus: 'needs-link'`: 원문 URL을 추가해야 하는 상태
- `sourceStatus: 'private-company'`: 비상장 또는 공시 의무가 없는 협력사
- `sourceStatus: 'no-public-filing'`: 공개 원문 보고서를 확인할 수 없는 기업
- `sourceStatus: 'listing-unknown'`: ticker, market, DART corpCode, SEC CIK가 불완전해 상장 정보 확인이 필요한 기업

직접 링크가 없는 기업도 화면에서는 “원문 연결 필요”, “검색으로 확인”, “비상장/공시 의무 없음” 상태가 보이며, 기존 재무제표 해설과 MD&A/SEC 분석 텍스트는 삭제하지 않습니다.

### Supabase DB

`supabase/schema.sql`을 Supabase SQL Editor에서 실행합니다. 주요 테이블은 다음입니다.

- `companies`
- `filings`
- `financial_metrics`
- `ownership_trades`
- `market_prices`
- `sync_runs`

중복 저장 방지 기준:

- OpenDART: `dart_rcept_no`
- SEC filing: `accession_number`
- SEC Form 4 transaction: `accessionNumber + ownerCik + transactionDate + securityTitle + shares`를 `raw_id`로 저장
- SEC 13F: `accessionNumber + cusip + managerCik`를 `raw_id`로 저장
- Congress: `reportId + transactionDate + assetName + amountRange`를 `raw_id`로 저장
- Prices: `ticker + source + as_of`

`market_prices`는 `open`, `previous_close`, `close`, `price_label`을 함께 저장합니다. 기존 테이블이 이미 있다면 `supabase/schema.sql`의 `alter table ... add column if not exists` 구문까지 실행해 최신 컬럼을 반영하세요.

### 수동 동기화

동기화 스크립트는 `.ts` 파일이지만 Node 20에서도 실행되도록 먼저 `.sync-build`에 JS로 컴파일한 뒤 실행합니다.

```bash
npm run sync:compile
npm run sync:financials
npm run sync:trades
npm run sync:prices
npm run audit:companies
npm run audit:filings
npm run audit:listings
npm run sync:filing-links
npm run sync:all
```

개별 실행:

```bash
npm run sync:opendart
npm run sync:sec-companyfacts
npm run sync:sec-form4
npm run sync:sec-13f
npm run sync:congress
npm run sync:prices
```

API 키나 DB 환경변수가 없으면 실패하지 않고 안내 로그를 출력하며 기존 mock/fallback 데이터가 유지됩니다.

### SEC 13F 기관 포트폴리오

SEC 13F를 켜려면 Vercel Environment Variables 또는 GitHub Secrets에 `SEC_13F_MANAGER_CIKS`를 추가합니다.

```bash
SEC_13F_MANAGER_CIKS=0001067983,0001697748
```

- 값은 comma-separated CIK 문자열입니다.
- 앞의 `0`은 유지해도 되고, 공백은 자동으로 trim합니다.
- CIK는 SEC EDGAR에서 운용사/기관 페이지를 직접 확인해 입력합니다.
- 잘못된 CIK가 하나 있어도 다른 CIK sync는 계속 진행됩니다.
- 추가 후 Vercel Production Redeploy가 필요합니다.
- 수동 테스트: `/api/sync/trades?secret=CRON_SECRET값`
- 결과 확인: Supabase `sync_runs`에서 `sec-13f` status와 endpoint 응답 JSON의 `results.form13f.managers`를 확인합니다.

13F는 실시간 매수·매도 데이터가 아니라 분기 말 기관 보유 현황입니다. 실제 매수·매도 시점과 차이가 크므로 화면에서는 `13F 보유 변화`, `분기 포트폴리오`, `기관 보유 종목`처럼 표시하고, 투자 권유가 아니라 공개 자료 기반 참고 정보로만 다룹니다.

13F 운영 기준:

- `source`는 항상 `sec-13f`로 저장합니다.
- `investor_name`에는 `Berkshire Hathaway`, `ARK Investment Management`, `BlackRock`처럼 실제 managerName 또는 기관명을 저장합니다.
- SEC filing에서 managerName을 찾으면 그 값을 우선 사용하고, 없으면 CIK fallback 매핑을 사용합니다.
- UI에서는 “Berkshire Hathaway 13F 보유 종목”, “ARK Investment Management 분기 포트폴리오”, “BlackRock 보유 종목 변화”처럼 표시합니다.
- “오늘 버크셔가 샀다”, “방금 매수”처럼 실시간 매수로 오해될 표현은 쓰지 않습니다.
- 13F는 공개 지연이 있으므로 “13F는 분기 보고 기준이며 실제 매매 시점과 차이가 있을 수 있습니다.” 안내를 유지합니다.
- upsert 전 `raw_id` 기준으로 dedupe를 수행해 같은 batch 안의 `ON CONFLICT` 중복 오류를 막습니다.
- `raw_id`는 `accessionNumber + cusip + managerCik` 기준이며, CUSIP이 없으면 ticker 또는 issuer/title/shares/value/row index를 fallback으로 포함합니다.
- holdings row는 500개 단위로 chunk upsert합니다. 한 chunk가 실패해도 다음 chunk와 다른 manager sync는 계속 진행됩니다.
- `partial`은 일부 기관 또는 filing만 실패한 상태입니다. 이미 성공한 기관의 13F 데이터는 `ownership_trades`에 저장된 상태입니다.
- `sync_runs.error_message`에는 긴 raw JSON 대신 `13F partial: 3 managers success, 2 partial, 8 failed...` 형식의 요약만 남기고, 상세는 endpoint JSON의 `results.form13f.managers`에서 확인합니다.

프론트 화면은 `/api/ownership-trades`에서 최신 공개 기록만 읽습니다.

```text
/api/ownership-trades?source=all&limit=20
/api/ownership-trades?source=sec-13f&limit=20&investor=Berkshire
/api/ownership-trades?source=sec-form4&limit=20&ticker=NVDA
```

- 기본 `limit`은 20, 최대 `limit`은 100입니다.
- 서버에서 Supabase `ownership_trades`에 직접 limit/order를 적용하므로 13F 전체 row를 홈 화면에 한 번에 보내지 않습니다.
- `SUPABASE_SERVICE_ROLE_KEY`는 `/api/ownership-trades` 서버리스 함수 안에서만 사용하고 프론트 번들에는 노출하지 않습니다.
- endpoint 실패 또는 Supabase 미설정 시 프론트는 기존 mock fallback을 사용합니다.

### 미국 국회의원 거래 import

무료 API를 쓰지 않고 공개자료 기반 수동/반자동 import 구조를 사용합니다. 켜는 방법은 두 가지입니다.

1. `data/congress-trades.json` 파일을 추가
2. `CONGRESS_TRADES_IMPORT_URL` 환경변수에 JSON 또는 CSV URL 추가

JSON 예시:

```json
[
  {
    "reportId": "example-2026-001",
    "politicianName": "Example Member",
    "chamber": "House",
    "ticker": "NVDA",
    "companyName": "NVIDIA",
    "assetName": "NVIDIA common stock",
    "action": "buy",
    "amountRange": "$15,001 - $50,000",
    "transactionDate": "2026-05-01",
    "disclosedDate": "2026-05-12",
    "sourceUrl": "https://disclosures-clerk.house.gov/",
    "sector": "AI 반도체",
    "note": "공개자료 import 예시"
  }
]
```

필드는 CSV 헤더로도 동일하게 사용할 수 있습니다. 저장 시 `investor_type`은 `us-politician`, `source`는 `congress-trades`, `raw_id`는 `reportId + transactionDate + assetName + amountRange` 기반으로 생성합니다.

수동 테스트:

```text
https://YOUR_DOMAIN/api/sync/trades?secret=CRON_SECRET값
```

결과 확인:

- Supabase `sync_runs`에서 `congress-trades`
- Supabase `ownership_trades`에서 `source = congress-trades`

국회의원 거래는 공개된 거래 보고 기준이며 실제 거래일과 공개일이 다를 수 있습니다. 화면에서는 실시간 매매처럼 표현하지 않고 “공개 자료 기준이며 실제 매매 시점과 차이가 있을 수 있습니다.” 문구를 유지합니다.

### 상장/비상장 분류 점검

협력기업이나 하청업체라는 이유만으로 비상장 처리하면 안 됩니다. 주식 거래가 가능하거나 DART/SEC 식별자가 있는 기업은 상장·공시 연결 대상으로 관리합니다.

```bash
npm run audit:listings
```

출력 항목:

- 전체 기업 수, 상장기업 수, 비상장기업 수, 상장 여부 확인 필요 수
- ticker가 있는데 private으로 분류된 기업
- `corpCode` 또는 `cik`가 있는데 private으로 분류된 기업
- KOSPI/KOSDAQ/NASDAQ/NYSE 등 거래소 시장인데 `listed=false`처럼 보이는 기업
- 상장기업인데 가격 sync 대상에서 빠진 기업
- 상장기업인데 filing link 대상에서 빠진 기업

주성엔지니어링, 한미반도체, 리노공업, ISC, 원익IPS, 솔브레인, 이오테크닉스, DB하이텍, 하나마이크론, 심텍, 덕산네오룩스, 피에스케이, 테스, 에스앤에스텍처럼 거래 가능한 협력기업은 `listed`, `ticker`, `market`, `filingSource`를 확인하고 가격/공시/재무제표 연결 대상으로 둡니다. 비상장 또는 공시 확인이 어려운 기업만 “비상장 참고 노드”로 표시합니다.

### 원문 보고서 링크 점검과 보강

원문 연결 상태를 점검:

```bash
npm run audit:filings
```

출력 항목:

- 전체 기업 수
- `direct`, `search-only`, `needs-link`, `private-company`, `no-public-filing` 기업 수
- `listing-unknown` 기업 수
- `needs-link` 기업 목록
- `companyId`, `companyName`, `market`, `ticker`
- 필요한 식별자: `dartCorpCode` 또는 `secCik`
- `sourceSearchUrl` 여부
- 비상장/공시 의무 없음 기업은 `needs-link`로 세지 않습니다.

OpenDART/SEC에서 가능한 원문 링크를 보강:

```bash
npm run sync:filing-links
```

- 한국 기업은 `corpCode + OPENDART_API_KEY`로 최신 분기보고서/반기보고서/사업보고서 `rcept_no`를 찾습니다.
- 미국 기업은 `cik`로 SEC submissions에서 최신 `10-K`/`10-Q`와 primary document를 찾습니다.
- 기존 `direct` 링크는 덮어쓰지 않습니다.
- `private-company`, `no-public-filing` 상태는 자동 보강 대상에서 제외합니다.
- 확실한 원문을 찾은 경우에만 direct URL을 생성합니다.
- DB가 있으면 Supabase `filings` 테이블에 저장하고, DB가 없으면 `reports/filing-links-report.json` 리포트로 확인합니다.

수동으로 보강할 때는 `src/data.ts`의 기업 데이터에 아래 필드 중 확인된 값만 추가하세요.

```ts
reportUrl
sourceDirectUrl
dartRcpNo
secAccessionNumber
reportType
fiscalYear
fiscalPeriod
filingDate
sourceStatus
```

가짜 원문 링크는 넣지 않습니다. 상장 기업인데 직접 링크가 없지만 DART/SEC 검색 링크가 있으면 `search-only`, 검색 정보도 부족하면 `needs-link`, 비상장 또는 공개 보고 의무가 없으면 `private-company`/`no-public-filing`, 상장 정보가 불완전하면 `listing-unknown`으로 구분합니다.

### 가격 데이터

유료 실시간 시세 API는 사용하지 않습니다. 무료·공개 데이터는 지연 시세이거나 장마감 기준일 수 있으므로 UI에 `지연 가능`, `장마감 종가`, `가격 준비 중` 상태를 표시합니다.

가격 sync 흐름:

1. 기본값은 서버사이드 Yahoo Finance chart endpoint best-effort 조회입니다.
2. Yahoo 조회가 실패하거나 직접 관리 파일을 쓰고 싶으면 `PRICE_IMPORT_URL`에 JSON/CSV URL을 넣습니다.
3. 이전 호환 변수 `MARKET_PRICES_IMPORT_URL`도 계속 지원합니다.
4. 로컬 파일 `data/prices.json`도 fallback import로 지원합니다.

Yahoo 조회를 끄고 수동 import만 쓰려면 `PRICE_SYNC_SOURCE=import-only`를 설정하세요. 가격 데이터는 무료 공개 소스라 지연될 수 있고, 완전 실시간을 보장하지 않습니다.

필수 ticker 매핑:

- 삼성전자 `005930.KS`
- SK하이닉스 `000660.KS`
- LG에너지솔루션 `373220.KS`
- 현대차 `005380.KS`
- NAVER `035420.KS`
- 카카오 `035720.KS`
- NVIDIA `NVDA`
- AMD `AMD`
- Intel `INTC`
- Apple `AAPL`
- Tesla `TSLA`

수동 실행:

```bash
npm run sync:prices
```

수동 endpoint:

```text
https://YOUR_DOMAIN/api/sync/prices?secret=CRON_SECRET값
```

가격 필드 예시:

```json
[
  {
    "companyId": "us-semiconductors-nvidia",
    "ticker": "NVDA",
    "market": "NASDAQ",
    "price": "1126.40",
    "open": "1102.00",
    "previousClose": "1092.30",
    "close": "1126.40",
    "change": "+34.10",
    "changePercent": "+3.12%",
    "currency": "USD",
    "priceLabel": "close",
    "marketStatus": "afterhours",
    "asOf": "2026-05-15T20:00:00-04:00",
    "source": "manual-delayed-close",
    "isDelayed": true
  }
]
```

`/api/sync/prices` 응답에는 ticker별 `results`가 포함됩니다. 일부 ticker만 실패하면 `partial`, 모두 실패하고 import fallback도 없으면 `skipped`가 됩니다.

화면 표기는 `최신가`, `종가`, `지연 가능`, `가격 준비 중`으로 구분합니다. 등락률은 기본적으로 `close 또는 price - open` 기준으로 계산하고, `open`이 없을 때만 `previousClose`를 사용합니다. 기준가가 없으면 퍼센트를 표시하지 않고 `기준가 없음` 또는 `가격 확인 필요`로 표시합니다. 데이터가 없으면 프론트는 `src/data.ts`의 mock price fallback을 쓰되 실제 숫자처럼 보이지 않게 `가격 준비 중`으로 표시합니다.

가격 sync는 등록된 상장 티커를 최대한 대상으로 잡고, 비상장·조회불가 기업은 제외합니다. Yahoo Finance 조회용 예외 매핑은 `BRK.B → BRK-B`, `SQ → XYZ`를 사용합니다. Block, Inc.는 현재 `XYZ` 티커 기준으로 관리합니다. `/api/sync/prices` 결과의 `summary`에서 전체 기업 수, 가격 조회 대상 수, 성공/실패 티커 수, 제외 기업 수를 확인하세요.

상장 여부 점검은 `npm run audit:listings`로 먼저 확인하세요. 협력기업이라도 ticker, DART `corpCode`, SEC `cik`, 거래소 market이 있으면 가격/공시/재무제표 sync 대상입니다.

프론트 공개 조회 endpoint:

```text
/api/market-prices?limit=200
/api/market-prices?ticker=000660.KS
/api/market-prices?ticker=NVDA
```

이 endpoint도 서버에서 Supabase를 읽고, service role key는 프론트에 노출하지 않습니다.

### 가격 데이터 최신성 및 환율 환산 조사

2026-06-02 코드 조사 기준입니다. 이번 섹션은 운영 진단 메모이며 가격값, 환산값, API 로직은 수정하지 않습니다.

현재 가격 데이터 구조:

- 읽기 경로는 `src/App.tsx`가 `fetchMarketPrices()`를 1회 호출하고, `src/services/prices.ts`가 `/api/market-prices?limit=200` 응답을 `src/data.ts`의 `mockMarketPrices`와 병합하는 구조입니다.
- 공개 endpoint인 `api/market-prices.js`는 Supabase `market_prices`를 `as_of desc, created_at desc`로 조회하고, `company_id + ticker` 기준으로 중복을 제거합니다. Supabase 환경변수가 없거나 조회가 실패하면 가격 없음 상태를 반환합니다.
- 쓰기 경로는 `scripts/sync-prices.ts`입니다. 기본 source는 Yahoo Finance chart endpoint best-effort 조회이고, 실패 시 `PRICE_IMPORT_URL`, `MARKET_PRICES_IMPORT_URL`, 로컬 `data/prices.json` 순서로 수동 import를 시도합니다.
- `PRICE_SYNC_SOURCE=import-only`이면 Yahoo 조회를 건너뛰고 import만 사용합니다. `PRICE_SYNC_SOURCE=manual-only`이면 Yahoo rows가 비어 있고, import fallback이 없으면 새 가격 row가 생성되지 않습니다.
- 로컬 저장소에는 `data/prices.json`이 없고 `data/prices.example.json`만 있습니다. 따라서 배포 환경에서 import URL이 없거나 실패하면 Yahoo 조회 성공 여부가 가격 최신성을 좌우합니다.
- `src/data.ts`의 `mockMarketPrices`에는 2026-05-15 기준 mock 가격이 있으며, 실제 Supabase 가격이 없을 때만 fallback/pending 표시를 보강하는 용도입니다. 이 값을 최신 가격처럼 업데이트하면 안 됩니다.
- 현재 `MarketPrice.currency` 타입과 표시 helper는 주가 기준으로 `KRW` 또는 `USD`만 직접 처리합니다. TSMC/ASML 재무 데이터의 `TWD`/`EUR`는 재무 API 쪽 통화 표시 문제이며, 가격 helper에 바로 섞지 않는 편이 안전합니다.

업데이트 지연 원인 후보:

- Vercel Cron 설정은 `vercel.json`에 `/api/sync/prices` 평일 08:30 UTC로 들어 있습니다. [Vercel Cron 공식 문서](https://vercel.com/docs/cron-jobs/) 기준 Cron은 production deployment URL로 GET 요청을 보내며, `CRON_SECRET` 환경변수가 있으면 `Authorization: Bearer ...` 헤더를 보냅니다. 이 프로젝트의 endpoint도 같은 헤더 또는 query secret을 요구합니다.
- Cron은 설정만으로 충분하지 않습니다. Vercel 프로젝트의 Cron Jobs가 비활성화되었는지, production redeploy 후 cron이 반영되었는지, Hobby 플랜 시간 정밀도와 실행 로그가 정상인지 확인해야 합니다.
- `/api/sync/prices`는 `CRON_SECRET`이 없거나 다르면 401을 반환합니다. Vercel Production env에 `CRON_SECRET`이 빠졌거나 Preview/Production 값이 달라도 sync가 멈출 수 있습니다.
- Supabase 쓰기는 `SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`가 있어야 실제 upsert됩니다. 이 값이 없으면 스크립트는 rows prepared 상태로 끝나고 DB 최신 `as_of`는 갱신되지 않습니다.
- Yahoo Finance chart 요청이 전체 또는 다수 ticker에서 실패하고, `PRICE_IMPORT_URL`/`MARKET_PRICES_IMPORT_URL`/`data/prices.json` fallback이 없으면 sync 결과는 `skipped` 또는 `partial`이 됩니다.
- `market_prices` upsert 기준은 `ticker + source + as_of`입니다. source/asOf가 계속 같은 수동 import를 반복하면 새 기준일이 늘지 않습니다.
- `api/market-prices.js`는 최신 row를 읽기만 하므로, 2026-05-29 이후 화면이 멈췄다면 1차 확인 대상은 Supabase `market_prices`의 최대 `as_of`와 `sync_runs`의 `/api/sync/prices` 실행 결과입니다.
- GitHub Actions 대안 워크플로는 `npm run sync:all`을 평일 스케줄로 실행하지만 현재 env에는 `MARKET_PRICES_IMPORT_URL`만 전달하고 `PRICE_IMPORT_URL`, `PRICE_SYNC_SOURCE`는 전달하지 않습니다. Actions를 쓰는 경우 secrets와 실제 실행 로그를 별도로 확인해야 합니다.

`asOf` 표시 필요성:

- 현재 `PriceBadge`는 title에 `source · asOf`를 넣고 작은 글씨에 `status · 기준 · formatPriceAsOf(asOf)`를 표시합니다. 그러나 사용자에게 "가격 기준일"이라는 명시적 라벨은 없습니다.
- 다음 구현에서는 가격 카드와 재무 카드 모두 원문 기준일을 분리해 표시해야 합니다. 예: `가격 기준일 05/29 17:30`, `환율 기준일 05/29`, `SEC 20-F 원문 기준`.
- `asOf`가 없거나 파싱되지 않으면 빈 날짜 대신 `가격 기준일 확인 필요`처럼 솔직한 상태를 표시해야 합니다.

환율 환산 필요성:

- 현재 앱은 한국 주가는 원화, 미국 주가는 달러로 표시하고, 재무 원문은 OpenDART/SEC 원문 통화를 우선합니다.
- TSMC는 TWD, ASML은 EUR 재무 fact가 확인된 상태라 한국 사용자에게 KRW 참고 환산값이 있으면 이해가 쉬워집니다.
- 다만 환산값은 투자 판단용 확정 숫자가 아니라 표시 보조입니다. 원 통화 값을 기본으로 두고, KRW 환산은 `참고 환산` 또는 tooltip/보조 텍스트로만 둡니다.
- USD/KRW, TWD/KRW, EUR/KRW가 필요합니다. API가 KRW quote를 직접 주지 않으면 USD 또는 EUR 기준 cross rate 계산식과 기준일을 함께 저장해야 합니다.

환율 API 후보와 env 후보:

- [Frankfurter](https://frankfurter.dev/docs/): 공개 문서 기준 무료/open-source이며 ECB 등 기관 reference rate 기반, 최신/과거 rate endpoint를 제공합니다. 일별 reference rate 성격이라 "참고 환산"에 적합하지만 실시간 FX가 아닙니다. 후보 env: `FX_RATES_PROVIDER=frankfurter`, `FX_RATES_BASE=KRW 또는 USD`, `FX_RATES_IMPORT_URL`.
- [ExchangeRate-API](https://www.exchangerate-api.com/docs/overview): standard/pair conversion endpoint와 historical data를 제공하는 상용 API 후보입니다. key와 요금제, 재배포 조건을 확인해야 합니다. 후보 env: `EXCHANGE_RATE_API_KEY`, `FX_RATES_PROVIDER=exchangerate-api`.
- [한국은행 ECOS](https://ecos.bok.or.kr/api/#/): 한국 원화 기준 설명에는 신뢰도가 높지만 API key와 통계 코드/항목 코드 확정이 필요합니다. 후보 env: `BOK_ECOS_API_KEY`, `FX_RATES_PROVIDER=bok-ecos`.
- 수동 import: 초기에는 `FX_RATES_IMPORT_URL` 또는 `data/fx-rates.json`에 `{ base, quote, rate, asOf, source }` 형태를 넣고 서버에서 cache/import하는 방식이 가장 안전합니다.
- 기존 `.env.example`에는 환율 전용 env가 없습니다. 가격 sync env(`PRICE_IMPORT_URL`, `MARKET_PRICES_IMPORT_URL`)와 섞지 말고 별도 이름을 써야 합니다.

안전한 표시 방식:

- 가격: 원 통화 금액을 기본으로 유지합니다. 예: `TWD 1,234`, `EUR 987`, `USD 123`, `82,400원`.
- 환산: 같은 줄의 보조 정보 또는 tooltip에 `약 56,000원 · 참고 환산 · 환율 기준일 2026-05-29`처럼 표시합니다.
- 환율 기준일이 가격/재무 기준일보다 오래됐으면 환산을 숨기거나 `환율 기준일 오래됨` 상태를 표시합니다.
- TWD/EUR/USD/KRW를 한 카드에서 비교할 때는 통화별 원문 값과 환산값을 분리하고, 환산값으로 PER/PBR/성장률 같은 지표를 임의 계산하지 않습니다.

추천 구현 순서:

1. 가격 데이터 source/asOf를 명시적으로 표시합니다.
2. 가격 업데이트가 멈춘 원인을 Supabase `sync_runs`, `market_prices max(as_of)`, Vercel Cron 로그, GitHub Actions 로그 순서로 확인하고 수정합니다.
3. 환율 API 후보와 라이선스/요금/재배포 조건을 확정합니다.
4. 재무 카드에 원 통화 값을 기본으로 두고, KRW 참고 환산값을 보조로 표시합니다.
5. 환율 기준일과 source를 함께 표시합니다.
6. 환산값에는 `참고용`, `원문 통화 기준 우선` 문구를 추가합니다.

구현 시 주의사항:

- 가격값, 등락률, 환산값을 임의 생성하지 않습니다.
- 환율 API는 클라이언트에서 직접 호출하지 말고 서버리스/cache/import 계층에서 호출합니다.
- 환율 기준일, 가격 기준일, 재무 보고서 기준일을 서로 다른 날짜로 관리합니다.
- `src/data.ts` mock 가격은 최신 가격 데이터가 아니라 fallback/pending 표시용 예시로 유지합니다.
- 가격 API와 재무 API를 한 번에 섞어 고치지 않습니다. 가격 freshness 수정 후 환율 표시를 별도 작업으로 진행합니다.

### 가격 자동 업데이트 런타임 점검

2026-06-03 런타임 점검 기준입니다. 값, secret, 가격 데이터, API 로직은 수정하지 않았고 민감 env 값은 출력하지 않았습니다.

#### 요약 결론

- 가장 강한 원인 후보는 `https://finance1.vercel.app` 공개 alias가 이 저장소의 `주가해부실` Vite 앱이 아니라 다른 정적 페이지를 서빙한다는 점입니다. 루트 HTML의 title은 `Finanzas`이고, 이 저장소의 `dist/index.html` title인 `주가해부실`과 다릅니다.
- 같은 alias에서 `/api/market-prices`와 `/api/sync/prices`는 모두 404 `NOT_FOUND`입니다. 따라서 이 URL에서 가격이 최신화되지 않는 문제는 Supabase 가격 row 이전에 "공개 alias가 현재 Vercel project/deployment와 연결되어 있지 않음"으로 보는 것이 우선입니다.
- GitHub Deployments 기준 당시 확인한 `Production - finance1` deployment는 `8592f77`에서 `success`였습니다. 2026-06-04 후속 확인에서는 `ca0fd26`의 `Production - finance1` 배포도 success로 확인됐습니다.
- GitHub Actions sync workflow는 최근 schedule run이 성공했지만, public API만으로는 job log와 repository secrets, Supabase `sync_runs` 내용을 볼 수 없어 가격 row가 `success/partial/skipped` 중 무엇이었는지는 확정할 수 없습니다.

#### env 존재 여부

| 항목 | 상태 | 근거 |
| --- | --- | --- |
| `CRON_SECRET` | 확인 불가 | 로컬 shell env에는 없음. Vercel Production env는 Vercel API/CLI 인증이 없어 확인 불가 |
| `SUPABASE_URL` | 확인 불가 | 로컬 shell env에는 없음. Vercel/GitHub secrets는 인증 없이 목록 조회 불가 |
| `SUPABASE_SERVICE_ROLE_KEY` | 확인 불가 | 로컬 shell env에는 없음. 값은 출력하지 않음 |
| `PRICE_IMPORT_URL` | 확인 불가 | 로컬 shell env에는 없음. `.github/workflows/sync.yml`에는 현재 전달되지 않음 |
| `MARKET_PRICES_IMPORT_URL` | 확인 불가 | 로컬 shell env에는 없음. GitHub Actions env에는 secret reference가 있음 |
| `PRICE_SYNC_SOURCE` | 확인 불가 | 로컬 shell env에는 없음. `.github/workflows/sync.yml`에는 현재 전달되지 않음 |
| Vercel project env 전체 | 확인 불가 | Vercel env API가 인증 토큰 없음으로 403을 반환함 |
| GitHub Actions secrets 전체 | 확인 불가 | GitHub secrets API가 인증 없음으로 401을 반환함 |

참고: Vercel env 목록 조회는 [Vercel Environment Variables API](https://vercel.com/docs/rest-api/reference/examples/environment-variables) 인증이 필요하고, GitHub Actions secrets 목록 조회도 [GitHub Actions Secrets API](https://docs.github.com/en/rest/actions/secrets) 인증이 필요합니다.

#### cron route 확인 결과

- `vercel.json`에는 `/api/sync/prices`가 평일 08:30 UTC로 등록되어 있습니다.
- 실제 함수 파일은 `api/sync/prices.ts`이고, 요청 path와 파일 path는 일치합니다.
- 이 함수는 `CRON_SECRET`이 없거나 헤더/query secret이 맞지 않으면 401을 반환하도록 되어 있습니다.
- `Production - finance1` deployment 자체는 GitHub Deployments API에서 `success`로 확인됐습니다.
- Vercel Cron의 finance1 project 내 활성화 여부, 최근 cron 실행 로그, cron의 성공/실패 메시지는 Vercel dashboard 또는 인증된 Vercel API/CLI 없이는 확인하지 못했습니다.

#### API route 확인 결과

- 앱의 가격 조회 경로는 `src/services/prices.ts`의 `/api/market-prices?limit=200`입니다.
- 읽기 함수 파일은 `api/market-prices.js`이며 Vercel route는 `/api/market-prices`가 맞습니다.
- sync 함수 파일은 `api/sync/prices.ts`이며 Vercel route는 `/api/sync/prices`가 맞습니다.
- 파일 기준 route mismatch는 발견되지 않았습니다.
- 공개 alias `https://finance1.vercel.app`에서는 루트가 `Finanzas` 정적 페이지로 응답하고 `/api/market-prices`, `/api/sync/prices`는 404입니다. 이 alias는 현재 repo의 Vercel deployment가 아니라 다른 프로젝트 또는 과거 alias에 연결된 것으로 보입니다.
- GitHub Deployments가 알려준 최신 finance1 target URL은 Vercel Authentication 보호가 걸려 있어 API route가 실제 배포 안에서 실행되는지 직접 확인하지 못했습니다.

#### Supabase 상태

- 로컬에는 `.env.example`만 있고 Supabase URL/key가 없습니다.
- 공개 alias는 현재 repo API로 연결되지 않아 `/api/market-prices`를 통한 DB 조회가 불가능했습니다.
- 최신 finance1 deployment target은 Vercel Authentication 보호가 걸려 DB 조회 endpoint에 접근하지 못했습니다.
- 따라서 `market_prices` 최신 `as_of`, 최근 insert/update 시각, `sync_runs`의 가격 sync 상태는 확인 불가입니다.
- 다음 확인 SQL 후보:

```sql
select max(as_of) as latest_price_as_of, max(created_at) as latest_inserted_at
from market_prices;

select source, status, started_at, ended_at, inserted_count, updated_count, error_message
from sync_runs
where source in ('market-prices', 'endpoint-prices')
order by started_at desc
limit 20;
```

#### GitHub Actions 상태

- `.github/workflows/sync.yml`은 `workflow_dispatch`와 평일 schedule 두 개로 구성되어 있고, job은 `npm run sync:all`을 실행합니다.
- 최근 public run 상태:

| run | event | 상태 | 시작 UTC | head |
| --- | --- | --- | --- | --- |
| 32 | schedule | success | 2026-06-02T13:01:35Z | `7c5bfa8` |
| 31 | schedule | success | 2026-06-01T21:52:35Z | `dcbe636` |
| 30 | schedule | success | 2026-06-01T19:31:09Z | `dcbe636` |
| 29 | schedule | success | 2026-05-29T22:56:18Z | `eddbfc1` |
| 28 | schedule | success | 2026-05-29T18:42:28Z | `eddbfc1` |

- Actions job과 `Sync official financials and trades` step은 success로 끝났습니다.
- Public API로는 raw log 다운로드가 403이고 secrets 목록이 401이라, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `MARKET_PRICES_IMPORT_URL` 실제 존재 여부는 확인하지 못했습니다.
- 워크플로 env에는 `MARKET_PRICES_IMPORT_URL`은 전달되지만 `PRICE_IMPORT_URL`, `PRICE_SYNC_SOURCE`는 전달되지 않습니다.

#### 5월 29일 이후 업데이트 안 된 원인 후보

1. 공개 alias `finance1.vercel.app`가 현재 repo의 `Production - finance1` deployment가 아니라 다른 정적 앱을 가리킵니다. 이 경우 화면은 현재 repo의 `/api/market-prices`를 호출하지 못합니다.
2. 올바른 최신 finance1 target URL은 Vercel Authentication 보호가 걸려 있습니다. 공개 서비스로 쓰려면 production domain 연결 또는 protection/bypass 정책 확인이 필요합니다.
3. GitHub Actions는 성공하지만 Supabase `sync_runs`에서 가격 sync가 `skipped` 또는 `partial`일 수 있습니다. 현재는 DB 접근이 없어 확인하지 못했습니다.
4. Vercel Cron은 파일상 등록되어 있지만, finance1 project의 실제 cron 활성화/실행 로그는 인증된 Vercel 접근 없이는 확인하지 못했습니다.
5. Production env에 `CRON_SECRET`, Supabase key, import URL이 없거나 잘못되어 있으면 cron endpoint 또는 DB upsert가 멈출 수 있습니다.

#### 다음 조치

1. Vercel dashboard에서 `finance1.vercel.app`이 이 repo의 `Production - finance1` project에 연결되어 있는지 확인합니다. 현재 관측상 이 alias는 다른 정적 페이지를 서빙합니다.
2. `Production - finance1`의 deployment protection을 공개 정책에 맞게 조정하거나, 운영자가 접근 가능한 production custom domain을 지정합니다.
3. Vercel env에서 `CRON_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `MARKET_PRICES_IMPORT_URL` 또는 `PRICE_IMPORT_URL`, `PRICE_SYNC_SOURCE` 존재 여부만 확인합니다. 값은 기록하지 않습니다.
4. Vercel Cron dashboard에서 `/api/sync/prices` 최근 실행 로그와 HTTP status를 확인합니다.
5. Supabase에서 위 SQL로 `market_prices max(as_of)`와 `sync_runs` 최신 가격 sync 상태를 확인합니다.
6. GitHub Actions를 계속 대안으로 쓸 경우 `PRICE_IMPORT_URL`과 `PRICE_SYNC_SOURCE`를 workflow env에 전달할지 별도 작업에서 결정합니다.

### Vercel 프로젝트/도메인 매핑 확인

2026-06-04 공개 URL과 GitHub Deployments API 기준 후속 점검입니다. Vercel CLI/token, GitHub token, Supabase secret은 이 세션에 없었고 값은 출력하지 않았습니다. Vercel project settings, domain/alias 전체 목록, Git 연결 상세 설정은 인증된 Vercel dashboard/API 없이는 직접 확인하지 못했습니다.

#### GitHub remote

- 로컬 branch: `main`
- remote: `git@github.com:parkterry1103-ux/finance.git`
- 최초 점검 시작 commit: `ca0fd26d91729d7d54955451b47c585e955c7bfe`
- 재개 점검 시작 commit: `6b7bae11ccd08d8609f338703a8cf69ef63c3624`
- 재개 점검 시작 시 `HEAD`, `origin/main`, remote `refs/heads/main`이 모두 `6b7bae1`으로 일치했습니다.
- 작업트리는 재개 점검 시작 시 clean 상태였습니다. 문서화 후에도 README 외 변경이 없는지 확인합니다.

#### Vercel deployment 상태

GitHub Deployments 공개 기록상 이 GitHub repo에서 Vercel bot이 `Production - finance`와 `Production - finance1` 두 환경으로 배포를 만들고 있습니다. 따라서 두 Vercel 프로젝트 또는 환경 모두 이 repo의 main push와 연결되어 있는 것으로 보입니다. 다만 Vercel dashboard의 project Git 설정 자체는 인증 없이는 확인 불가입니다. 2026-06-04 10:12 UTC 재확인에서는 `Production - finance1`의 최신 deployment status만 공개 API로 확인했고, 추가 status 조회는 GitHub unauthenticated API rate limit에 막혔습니다.

| Vercel environment | latest observed SHA | state | target URL | URL 접근 |
| --- | --- | --- | --- | --- |
| `Production - finance1` | `6b7bae1` | success | `https://finance1-iut2s0oi6-terrypark-s-projects.vercel.app` | Vercel Authentication 401 |
| `Production - finance` | `6b7bae1` | deployment record observed | 공개 status target URL은 재확인 불가 | 추가 status 조회가 GitHub unauthenticated API rate limit으로 제한됨 |

#### URL별 응답 결과

| URL | `/` | `/ko/` | `/api/market-prices?limit=1` | `/api/sync/prices` | 판단 |
| --- | --- | --- | --- | --- | --- |
| `https://finance1.vercel.app` | 200, title `Finanzas` | 404 `NOT_FOUND` | 404 `NOT_FOUND` | 404 `NOT_FOUND` | 이 repo 앱이 아닙니다. 다른 정적 페이지 또는 다른 프로젝트 alias로 보입니다. |
| `https://finance1-flax.vercel.app` | 200, title `주가해부실` | 200, title `주가해부실` | 200 JSON, `source: supabase` | 401 JSON `Unauthorized cron request` | 현재 공개 API 확인에 사용할 올바른 base URL입니다. |
| `https://finance1-iut2s0oi6-terrypark-s-projects.vercel.app` | 401 Vercel Authentication | 미확인 | 401 Vercel Authentication | 미확인 | 최신 `Production - finance1` deployment target이나 보호되어 직접 검증 불가입니다. |
| `https://finance-jdzh1dmbl-terrypark-s-projects.vercel.app` | 401 Vercel Authentication | 401 Vercel Authentication | 401 Vercel Authentication | 401 Vercel Authentication | 이전 관측 `Production - finance` deployment target이며 보호되어 직접 검증 불가입니다. |
| `https://finance.vercel.app` | 307 `/profile` redirect | 308 redirect | 404 Next error | 404 Next error | 이 repo 앱으로 보기 어렵습니다. |

`https://finance1-flax.vercel.app/api/market-prices?limit=1`은 `ok: true`, `source: supabase`로 응답했고, 확인 시 첫 row의 `asOf`는 `2026-06-02T20:04:31.000Z`, source는 `yahoo-finance-chart`였습니다. 가격값은 문서에 기록하지 않습니다.

#### 결론

- `finance1.vercel.app`은 현재 이 repo의 `주가해부실` 앱을 가리키지 않습니다. 이 URL로 가격 API를 확인하면 404가 나는 것이 정상입니다.
- 실제 주가해부실 공개 URL로 확인된 주소는 `https://finance1-flax.vercel.app`입니다.
- 앞으로 가격 API 확인 base URL은 `https://finance1-flax.vercel.app`을 사용합니다.
- 가격 조회 확인: `https://finance1-flax.vercel.app/api/market-prices?limit=1`
- 가격 sync route 확인: `https://finance1-flax.vercel.app/api/sync/prices`는 인증 없이 401이 나와야 정상입니다.
- `Production - finance`와 `Production - finance1` 모두 GitHub Deployments에는 최신 commit으로 success가 기록되지만, per-commit target URL은 Vercel Authentication 보호 상태입니다.
- project 이름, deployment target URL, public alias가 섞여 있어 혼동이 발생했습니다. `finance1-flax.vercel.app`과 `finance1.vercel.app`은 서로 다른 앱을 서빙합니다.

#### 다음 조치

1. Vercel dashboard에서 `finance1.vercel.app` domain이 어느 project에 연결되어 있는지 확인하고, 필요하면 주가해부실 project로 alias를 옮기거나 혼동 방지를 위해 제거합니다.
2. 운영 공개 URL을 `finance1-flax.vercel.app`로 둘지, 별도 custom domain을 붙일지 결정합니다.
3. Vercel deployment protection 정책을 확인합니다. per-commit deployment URL은 보호해도 되지만, 운영 public domain은 API 확인이 가능해야 합니다.
4. Vercel project `finance`와 `finance1`이 모두 같은 GitHub repo main push를 받는 구조가 의도된 것인지 정리합니다. 중복 프로젝트가 필요 없다면 하나로 통합하거나 이름을 바꿉니다.
5. 가격 freshness와 Supabase `sync_runs` 확인은 `https://finance1-flax.vercel.app` 기준으로 다시 진행합니다.

### 가격 데이터 freshness 및 sync 상태 확인

2026-06-04 10:12 UTC 운영 API 재확인 기준입니다. 코드, API, 가격 sync 로직, 데이터, secret, 외부 서비스 설정은 수정하지 않았습니다. 가격값은 문서에 기록하지 않고 freshness와 source만 기록합니다.

#### 기준 URL

- 운영 API 확인 기준 URL은 `https://finance1-flax.vercel.app`입니다.
- `https://finance1-flax.vercel.app/`와 `/ko/`는 `주가해부실` 앱으로 200 렌더링됩니다.
- `https://finance1.vercel.app`은 현재 `/` title이 `Finanzas`이고, `/ko/`, `/api/market-prices`, `/api/sync/prices`가 404입니다. 가격 API 확인 기준으로 쓰면 안 됩니다.

#### 운영 API 응답 요약

| API | status | top-level source | prices count | 최신 `asOf` | 가장 오래된 `asOf` | row source |
| --- | --- | --- | ---: | --- | --- | --- |
| `/api/market-prices?limit=1` | 200 | `supabase` | 1 | `2026-06-02T20:04:31.000Z` | `2026-06-02T20:04:31.000Z` | `yahoo-finance-chart` 1 |
| `/api/market-prices?limit=200` | 200 | `supabase` | 81 | `2026-06-02T20:04:31.000Z` | `2026-06-02T06:30:01.000Z` | `yahoo-finance-chart` 81 |
| `/api/sync/prices` | 401 | n/a | n/a | n/a | n/a | `Unauthorized cron request` |

`limit=200` 응답 기준 source 분포는 `yahoo-finance-chart` 81개, fallback/import/manual source 0개입니다. 날짜 bucket도 81개 모두 `2026-06-02`입니다. `price`, `asOf`, `currency`, `source`, `ticker`는 비어 있지 않았습니다. `companyId`가 비어 있는 row는 `SNOW`, `AAPL` 2개입니다. `change`/`changePercent`가 0인 row는 `005930.KS`, `095340.KQ` 2개입니다.

#### 주요 ticker별 `asOf`

| ticker | 응답 | matched ticker | companyId 상태 | `asOf` | source | currency | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `NVDA` | 200 | `NVDA` | 연결됨 | `2026-06-02T20:00:00.000Z` | `yahoo-finance-chart` | `USD` | ticker query는 2 rows 반환 |
| `DELL` | 200 | `DELL` | 연결됨 | `2026-06-02T20:02:10.000Z` | `yahoo-finance-chart` | `USD` | 대표 Pick 가격 row |
| `SNOW` | 200 | `SNOW` | 비어 있음 | `2026-06-02T20:00:03.000Z` | `yahoo-finance-chart` | `USD` | ticker fallback 표시 가능, DB companyId 매핑 보강 필요 |
| `MU` | 200 | `MU` | 연결됨 | `2026-06-02T20:00:01.000Z` | `yahoo-finance-chart` | `USD` | - |
| `AMD` | 200 | `AMD` | 연결됨 | `2026-06-02T20:00:01.000Z` | `yahoo-finance-chart` | `USD` | ticker query는 2 rows 반환 |
| `AVGO` | 200 | `AVGO` | 연결됨 | `2026-06-02T20:00:01.000Z` | `yahoo-finance-chart` | `USD` | - |
| `SMCI` | 200 | `SMCI` | 연결됨 | `2026-06-02T20:00:00.000Z` | `yahoo-finance-chart` | `USD` | - |
| `VRT` | 200 | `VRT` | 연결됨 | `2026-06-02T20:00:02.000Z` | `yahoo-finance-chart` | `USD` | - |
| `MSFT` | 200 | `MSFT` | 연결됨 | `2026-06-02T20:00:01.000Z` | `yahoo-finance-chart` | `USD` | - |
| `GOOGL` | 200 | `GOOGL` | 연결됨 | `2026-06-02T20:00:01.000Z` | `yahoo-finance-chart` | `USD` | - |
| `TSM` | 200 | `TSM` | 연결됨 | `2026-06-02T20:00:03.000Z` | `yahoo-finance-chart` | `USD` | - |
| `ASML` | 200 | `ASML` | 연결됨 | `2026-06-02T20:00:01.000Z` | `yahoo-finance-chart` | `USD` | - |
| `000660.KS` | 200 | `000660.KS` | 연결됨 | `2026-06-02T06:30:28.000Z` | `yahoo-finance-chart` | `KRW` | ticker query는 2 rows 반환 |
| `005930.KS` | 200 | `005930.KS` | 연결됨 | `2026-06-02T06:30:12.000Z` | `yahoo-finance-chart` | `KRW` | `change`/`changePercent` 0 |

이번 표의 모든 주요 ticker는 `2026-06-02` 기준입니다. 2026-06-04 10:12 UTC 기준으로는 2026-06-03 장마감 이후 가격이 아직 운영 DB에 보이지 않습니다. 따라서 "일부 ticker만 stale"이라기보다 현재 관측 가능한 가격 row 전체가 6월 2일에 머물러 있습니다. 다만 5월 29일 이후 업데이트가 전혀 안 된 것으로 보였던 원인은 잘못된 URL인 `finance1.vercel.app`을 확인한 영향이 큽니다. 올바른 URL에는 6월 2일 row가 들어 있습니다.

#### API 응답 구조와 프론트 기대 필드

- `api/market-prices.js`는 Supabase `market_prices`를 `as_of.desc,created_at.desc`로 읽고 `companyId`, `ticker`, `market`, `price`, `open`, `previousClose`, `close`, `change`, `changePercent`, `currency`, `priceLabel`, `marketStatus`, `asOf`, `source`, `isDelayed`로 정규화합니다.
- `src/services/prices.ts`의 `fetchMarketPrices(200)`는 같은 필드를 기대하고, 실제 row가 없을 때만 `src/data.ts` mock fallback을 병합합니다.
- 운영 `limit=200`에서 core 필드 중 `price`, `asOf`, `currency`, `source`, `ticker` 누락은 없었습니다.
- `SNOW`와 `AAPL`은 `companyId`가 비어 있습니다. 프론트의 `getPriceForPick`/`getPriceForTicker`는 ticker fallback으로 찾을 수 있지만, DB 매핑 품질 측면에서는 보강 후보입니다.
- ticker query는 `companyId + ticker` dedupe 기준 때문에 같은 ticker가 2 rows로 나올 수 있습니다. 관측 예시는 `NVDA`, `AMD`, `000660.KS`, `005930.KS`입니다.

#### 프론트 표시 확인

- 홈 `/ko/` 자체에는 가격 배지가 노출되지 않았습니다.
- Pick 목록 `/ko/picks`는 API 로딩 전에는 `가격 불러오는 중`, 로딩 후에는 `지연 가능 · 시작가 대비 · 06. 03. 오전 04:02`처럼 표시됩니다. 이 시간은 `2026-06-02T20:02:10.000Z`의 로컬 표시입니다.
- 기업 해설 `/ko/analysis/ai-datacenter-dell`도 같은 `PriceBadge` 구조를 사용합니다.
- 시장 지도는 코드상 선택 기업 패널에서 `PriceBadge`를 사용할 수 있지만, 운영 `/ko/category/us-semiconductors?company=ai-datacenter-dell` 초기 DOM에서는 가격 라인이 바로 노출되지 않았습니다.
- 현재 UI는 `asOf`를 작은 날짜 텍스트와 title tooltip에 넣지만, "가격 기준일"이라는 명시 라벨은 없습니다. 데이터가 6월 2일이어도 사용자가 "가격 기준일"로 바로 이해하기 어렵기 때문에 UI 표시 개선 후보입니다.

#### sync route 401 해석

`/api/sync/prices`가 인증 없이 401 `Unauthorized cron request`를 반환하는 것은 코드 기준 정상입니다. `api/sync/prices.ts`는 `CRON_SECRET`이 설정되어 있고, 요청의 `Authorization: Bearer ...` 헤더 또는 `?secret=` query가 일치해야 `syncPrices()`를 실행합니다. 따라서 브라우저/curl 직접 호출 401은 route 부재가 아니라 보호 상태를 의미합니다. 실제 Vercel Cron 호출은 이 직접 호출과 구분해서 Vercel Cron 로그 또는 Supabase `sync_runs`로 확인해야 합니다.

#### Vercel Cron 설정 확인

- `vercel.json`에는 `/api/sync/prices`가 평일 `30 8 * * 1-5`로 등록되어 있습니다. UTC 기준 평일 08:30입니다.
- route path와 실제 파일 `api/sync/prices.ts`는 일치합니다.
- 코드 기준 `CRON_SECRET` 불일치 시 401, sync 실패 시 `endpoint-prices` 실패 run 기록을 시도합니다.
- 공개 API만으로는 Vercel Cron이 2026-06-04 08:30 UTC에 실제 실행되었는지, 어떤 status로 끝났는지 확인할 수 없습니다. Vercel dashboard의 Cron Jobs/Function Logs 확인이 필요합니다.

#### GitHub Actions 설정 확인

- `.github/workflows/sync.yml`은 `workflow_dispatch`와 평일 schedule 두 개를 사용합니다: `15 9 * * 1-5`, `15 */6 * * 1-5`.
- job은 Node 20, `npm ci`, `npm run sync:all`을 실행합니다. 즉 가격 sync만의 주 경로라기보다 재무/거래/가격을 모두 돌리는 대안 또는 보조 경로입니다.
- workflow env에는 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `MARKET_PRICES_IMPORT_URL` secret reference가 있습니다. `PRICE_IMPORT_URL`, `PRICE_SYNC_SOURCE`는 전달하지 않습니다.
- GitHub Actions 공개 API와 공개 run page 기준 최근 run은 성공입니다.
- 공개 run page에서 run 번호, schedule trigger 시각, status, total duration, job 이름은 보입니다.
- 공개 run page는 비로그인 상태에서 logs 영역에 sign-in 요구를 표시합니다. 따라서 `npm run sync:all` 내부의 `sync:prices` JSON 출력, Supabase upsert 성공/실패, `skipped`/`partial` 여부는 공개 비인증으로 확인하지 못했습니다.

| run number | event | conclusion | created UTC | head |
| --- | --- | --- | --- | --- |
| 36 | schedule | success | `2026-06-03T20:41:32Z` | `ca0fd26` |
| 35 | schedule | success | `2026-06-03T20:01:13Z` | `ca0fd26` |
| 34 | schedule | success | `2026-06-03T00:15:11Z` | `ca0fd26` |
| 33 | schedule | success | `2026-06-02T20:28:26Z` | `ca0fd26` |
| 32 | schedule | success | `2026-06-02T13:01:35Z` | `7c5bfa8` |

Actions run success는 `npm run sync:all` 프로세스가 non-zero exit 없이 끝났다는 뜻이지, 가격 row가 최신으로 upsert되었다는 증거는 아닙니다. `scripts/sync-prices.ts`는 Yahoo 전체 실패, Supabase env 누락, Supabase upsert 실패 상황에서도 결과 JSON을 남기고 process가 0으로 끝날 수 있습니다. 따라서 Actions 성공과 운영 `market_prices` 최신성은 `sync_runs`로 함께 확인해야 합니다.

#### Supabase 직접 확인 가능 여부

로컬 shell env에는 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `PRICE_IMPORT_URL`, `MARKET_PRICES_IMPORT_URL`, `PRICE_SYNC_SOURCE`, `VERCEL_TOKEN`, `GITHUB_TOKEN`이 설정되어 있지 않았습니다. 로컬 파일은 `.env.example`만 있습니다. `gh`, `vercel`, `supabase` CLI도 로컬 PATH에 없습니다. 따라서 직접 DB 접속과 dashboard/API 인증 조회는 하지 않았고, secret 값도 출력하지 않았습니다.

확인용 SQL 후보:

```sql
select
  max(as_of) as latest_price_as_of,
  min(as_of) as oldest_price_as_of,
  count(*) as row_count
from market_prices;

select
  ticker,
  company_id,
  source,
  as_of,
  created_at
from market_prices
where ticker in ('NVDA', 'DELL', 'SNOW', 'MU', 'AMD', 'AVGO', 'SMCI', 'VRT', 'MSFT', 'GOOGL', 'TSM', 'ASML', '000660.KS', '005930.KS')
order by ticker, as_of desc;

select
  source,
  status,
  started_at,
  ended_at,
  inserted_count,
  updated_count,
  error_message
from sync_runs
where source in ('market-prices', 'endpoint-prices')
order by started_at desc
limit 20;
```

#### 병목 후보 분류

| 후보 | 판단 | 근거 |
| --- | --- | --- |
| 문제 없음 | 아님 | 올바른 URL에서도 최신 row가 `2026-06-02`에 머물러 있습니다. |
| UI 문제 | 일부 맞음 | 가격은 표시되지만 `가격 기준일` 라벨이 명확하지 않아 오래돼 보일 수 있습니다. |
| 일부 ticker stale | 아님 | 관측 가능한 81개 row와 주요 ticker 모두 `2026-06-02`입니다. 일부가 아니라 전체 stale에 가깝습니다. |
| cron 문제 | 가능성 있음 | Vercel Cron path는 맞지만 최근 실행 성공 여부를 공개 API로 확인하지 못했습니다. |
| secret 문제 | 가능성 있음 | `/api/sync/prices` 보호는 정상입니다. 실제 Cron/수동 호출에서 `CRON_SECRET`이 빠지거나 다르면 sync는 401입니다. |
| Yahoo fetch 문제 | 가능성 있음 | Actions 성공 후에도 row가 안 늘었으므로 Yahoo 실패 후 `skipped` 또는 `partial`일 수 있습니다. `sync_runs` 확인 필요. |
| Supabase upsert 문제 | 가장 유력한 후보군 | 공개 API는 6월 2일 row를 읽지만, 그 이후 Actions success가 있어도 row가 갱신되지 않았습니다. 트리거 이후의 write 경로, 즉 Supabase env 누락/권한/REST upsert 실패 또는 `sync_runs` 기록 실패를 먼저 봐야 합니다. |
| 도메인 문제 | 확인됨 | `finance1.vercel.app`은 이 앱이 아니며 API가 404입니다. 다만 올바른 URL에서도 6월 2일 이후 갱신 여부는 별도 문제입니다. |

#### 최종 판단

올바른 운영 URL 기준으로 가격 API와 Supabase 읽기 경로는 살아 있고, fallback/import가 아니라 `yahoo-finance-chart` row를 반환합니다. 그러나 2026-06-04 10:12 UTC 기준 최신 `asOf`가 `2026-06-02T20:04:31.000Z`라서 2026-06-03 장마감 이후 row가 보이지 않습니다. 병목은 프론트 읽기보다 가격 쓰기 경로에 있습니다. 현재 가장 유력한 후보군은 트리거 이후 가격 sync write 경로입니다. 즉 Yahoo fetch가 `skipped`/`partial`로 끝났거나, Supabase env/권한/upsert 문제로 DB write가 반영되지 않았을 가능성을 먼저 확인해야 합니다.

#### 다음 액션

1. Vercel dashboard에서 `finance1` project의 Cron Jobs가 활성 상태인지, `/api/sync/prices`의 2026-06-04 08:30 UTC 실행 여부, HTTP status, function log, production alias가 `finance1-flax.vercel.app`로 연결되는지 확인합니다.
2. Vercel env에서 `CRON_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `MARKET_PRICES_IMPORT_URL` 또는 `PRICE_IMPORT_URL`, `PRICE_SYNC_SOURCE`의 존재 여부만 확인합니다. 값은 기록하지 않습니다.
3. Supabase SQL Editor에서 위 SQL로 `market_prices` 최신 `as_of`와 `sync_runs` 최신 `market-prices`/`endpoint-prices` 상태, `inserted_count`, `updated_count`, `error_message`를 확인합니다.
4. GitHub Actions run이 success여도 가격 sync 결과가 `skipped`, `partial`, `failed`였는지 authenticated log 또는 Supabase `sync_runs`로 확인합니다.
5. `SNOW`, `AAPL`의 `market_prices.company_id`가 비어 있는 원인을 확인하고, 별도 UI/API 작업에서 매핑 보강 여부를 결정합니다.
6. 별도 UI 작업에서 가격 배지에 `가격 기준일` 라벨을 명시해 날짜가 작게 숨어 보이지 않게 합니다.

#### 로그인 dashboard 기준 가격 sync 병목 확인

2026-06-04 14:17 UTC 기준으로 사용자가 직접 로그인한 Vercel, Supabase, GitHub dashboard 세션에서 확인했습니다. secret, token, key, env 실제 값은 열람하거나 문서에 기록하지 않았습니다.

확인된 항목:

- Vercel `finance1` project의 Domains에 `finance1-flax.vercel.app`이 `Valid Configuration`으로 연결되어 있습니다.
- Vercel `finance` project의 Domains에는 `finance-three-phi.vercel.app`이 연결되어 있습니다.
- Vercel dashboard의 `finance`와 `finance1` project 목록/overview 모두 GitHub repo `parkterry1103-ux/finance`에 연결되어 있습니다.
- `finance1` project의 Cron Jobs는 Enabled이고 `/api/sync/prices`가 `30 8 * * 1-5`로 등록되어 있습니다. UTC 기준 평일 08:30이며 Hobby scheduling window 안내가 표시됩니다.
- `finance1` Production/Preview env에는 `CRON_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 이름이 존재합니다. 값은 열람하지 않았습니다.
- `finance1` env 검색에서 `SUPABASE_ANON_KEY`, `SUPABASE_WRITE_KEY`, `MARKET_PRICES_IMPORT_URL`, `PRICE_IMPORT_URL`, `PRICE_SYNC_SOURCE`는 결과가 없었습니다.
- `finance` project env 검색에서는 위 가격 sync 관련 env 이름들이 결과 없음으로 확인되었습니다. 운영 domain이 붙은 `finance1`에만 sync 관련 env가 있는 구조입니다.
- Supabase에는 `parkterry1103-ux's Org` 아래 `parkterry1103-ux's Project` 1개가 확인되었습니다.
- Supabase `market_prices` 집계 결과는 `row_count = 772`, `latest_as_of = 2026-06-02T20:04:31+00:00`, `oldest_as_of = 2026-05-15T06:30:01+00:00`, `2026-06-03 이후 row = 0`입니다.
- Supabase `market_prices` source 분포는 `yahoo-finance-chart` 772 rows, latest `2026-06-02T20:04:31+00:00`입니다.
- Supabase 최근 가격 `sync_runs` 중 최신은 `market-prices`, `success`, `started_at = 2026-06-03T09:19:05.816+00:00`, `ended_at = 2026-06-03T09:19:08.416+00:00`, `inserted_count = 81`, `updated_count = 0`, error 없음입니다. 그러나 이 run이 만든 row의 가격 기준시각은 여전히 2026-06-02입니다.
- Supabase 가격 관련 `sync_runs` 최신 30개 조회에서 2026-06-03 09:19 이후의 `market-prices` 또는 `endpoint-prices` 기록은 보이지 않았습니다.
- GitHub Actions 최신 scheduled run `#36`은 success이고 `npm run sync:all` 안에서 `npm run sync:prices`가 실제 실행되었습니다.
- GitHub Actions `#36`의 가격 sync 로그에는 다수 ticker가 `Yahoo chart 429`로 실패했고, 최종 error 요약에 `Yahoo Finance chart failed for 81 tickers and no PRICE_IMPORT_URL/data/prices.json fallback produced rows.`가 표시되었습니다.
- 운영 API 재확인 결과 `/api/market-prices?limit=1`은 200, `source: supabase`, 1 row, latest `asOf = 2026-06-02T20:04:31.000Z`, source `yahoo-finance-chart`입니다.
- 운영 API 재확인 결과 `/api/market-prices?limit=200`은 200, 81 rows, latest `asOf = 2026-06-02T20:04:31.000Z`, oldest `asOf = 2026-06-02T06:30:01.000Z`, source 분포 `yahoo-finance-chart` 81 rows입니다.
- 운영 API 재확인 결과 `/api/sync/prices`는 인증 없이 401 `Unauthorized cron request`입니다. route 존재와 secret 보호 상태는 정상입니다.
- DB latest `as_of`와 API latest `asOf`는 같은 2026-06-02 20:04:31 UTC 기준으로 일치합니다. 따라서 API cache/read 문제가 아니라 DB 자체가 stale입니다.

확인 불가 항목:

- Vercel Logs 화면의 현재 `requestPath:/api/sync/prices` 필터에서는 선택된 짧은 live 범위에 `No logs found`가 표시되었습니다. dashboard UI에서 2026-06-03/2026-06-04 08:30 UTC 주변의 Vercel function status code history는 직접 확인하지 못했습니다.
- Vercel Cron의 2026-06-04 08:30 UTC 실행 status code는 확인하지 못했습니다. Supabase `sync_runs`에도 2026-06-03 09:19 이후 가격 run이 없어, 2026-06-04 Cron이 실행되지 않았는지, 실행됐지만 DB 기록 전에 실패했는지는 Vercel historical logs가 필요합니다.
- GitHub Actions log viewer의 virtualized view 때문에 가격 sync JSON의 `status` 줄 자체는 직접 캡처하지 못했습니다. 다만 `sync:prices` 실행, 전체 Yahoo 429 실패, fallback 부재 error 요약은 확인했습니다.

최종 병목 판단:

- 운영 DB와 운영 API가 모두 `2026-06-02T20:04:31Z`에 머물러 있으므로 read/API cache 문제가 아니라 가격 write 경로 문제입니다.
- 2026-06-03 09:19 UTC `market-prices` sync는 DB write 자체는 성공했지만 저장된 가격 기준시각이 2026-06-02였습니다. 이는 Yahoo chart 응답의 `regularMarketTime`이 2026-06-02였거나 최신 장 데이터가 아직 반영되지 않은 상태로 저장된 것입니다.
- 그 이후 GitHub Actions 최신 scheduled run은 성공으로 끝났지만, 가격 sync 구간은 Yahoo Finance chart가 81개 ticker 모두 429로 실패했고 import fallback도 없어 새 가격 row를 만들지 못했습니다. 이 success는 DB 최신화 성공을 의미하지 않습니다.
- 현재 확정 가능한 1차 병목은 `Yahoo Finance chart 429 + PRICE_IMPORT_URL/data/prices.json fallback 부재`입니다. 보조 병목 후보는 2026-06-04 Vercel Cron 실행 여부 또는 function log 미확인입니다.

다음 액션:

1. 가격 sync를 안정화하려면 Yahoo chart 429에 대한 backoff/rate-limit 완화, chunk size/interval 조정, 요청 User-Agent/소스 다변화, 또는 `PRICE_IMPORT_URL` fallback을 운영 `finance1`에 추가하는 작업을 별도 코드 변경으로 진행합니다.
2. 2026-06-04 Vercel Cron 실행 여부는 Vercel historical logs 또는 Observability에서 08:30-09:30 UTC 범위를 직접 열어 `/api/sync/prices` status를 확인합니다.
3. GitHub Actions secrets에서 `SUPABASE_URL`/write key 존재 여부를 값 없이 확인합니다. 최신 Actions run이 `sync_runs`에 기록되지 않은 이유가 env 누락인지, record 실패인지 분리해야 합니다.
4. 가격 sync 결과가 `success`여도 `asOf`가 이전 영업일이면 stale로 표시하거나 실패/partial로 다루는 guard를 별도 작업에서 검토합니다.
5. 수동 복구가 필요하면 secret 값을 노출하지 않는 방식으로 `/api/sync/prices`를 인증 호출하거나, Supabase SQL로 `sync_runs`와 `market_prices max(as_of)`를 즉시 재확인합니다.

### 한국투자증권 Open API 가격 sync 연결 조사

2026-06-04 코드/문서 조사 기준입니다. 이번 단계에서는 KIS Open API를 실제 운영에 연결하지 않았고, 코드/API/data/package/lock 파일과 운영 DB/API write를 수정하지 않았습니다. secret 값은 출력하거나 문서에 기록하지 않습니다.

참고 근거:

- [KIS Developers API 포털](https://apiportal.koreainvestment.com/apiservice-apiservice)
- [KIS Developers 서비스 이용안내](https://apiportal.koreainvestment.com/about-howto)
- [한국투자증권 공식 GitHub 샘플 저장소](https://github.com/koreainvestment/open-trading-api)
- [국내주식 현재가 샘플](https://github.com/koreainvestment/open-trading-api/tree/main/examples_llm/domestic_stock/inquire_price)
- [해외주식 현재체결가 샘플](https://github.com/koreainvestment/open-trading-api/tree/main/examples_llm/overseas_stock/price)
- [해외주식 현재가상세 샘플](https://github.com/koreainvestment/open-trading-api/tree/main/examples_llm/overseas_stock/price_detail)

#### 현재 가격 sync 구조

- `scripts/sync-prices.ts`가 쓰기 경로입니다. `/api/sync/prices`는 `CRON_SECRET` 인증 후 이 스크립트의 `syncPrices()`를 실행합니다.
- 가격 조회 대상은 고정 `REQUIRED_PRICE_TICKERS`, `mockMarketPrices`, `marketMovers`, `stockAutopsyPicks`, `anchors`, `companies`를 합쳐 만듭니다.
- `companies`는 `inferCompanyListing(company)` 결과가 `isPriceSyncTarget`일 때만 포함됩니다. 즉 상장으로 추정되고 거래 가능한 ticker가 있어야 합니다.
- ticker 필터는 `.KS`, `.KQ`, 또는 영문 ticker 패턴을 허용하고 `WATCH`, `비상장`은 제외합니다.
- Yahoo 조회용 alias는 `BRK.B -> BRK-B`, `SQ -> XYZ`입니다. 같은 lookup ticker는 dedupe하며, 이미 들어간 대상에 `companyId`가 없고 나중 대상에 `companyId`가 있으면 보강합니다.
- Yahoo 호출은 ticker 8개 단위 chunk로 병렬 실행합니다. URL은 `https://query1.finance.yahoo.com/v8/finance/chart/{lookupTicker}?range=5d&interval=1d`이고, `SEC_USER_AGENT` 값 또는 기본 User-Agent를 보냅니다.
- Yahoo 응답은 `regularMarketPrice` 또는 마지막 `quote.close`를 `price`로 쓰고, `regularMarketOpen`이 있으면 open 대비, 없으면 previous close 대비로 `change`와 `changePercent`를 계산합니다.
- 저장 필드는 `company_id`, `ticker`, `market`, `price`, `open`, `previous_close`, `close`, `change`, `change_percent`, `currency`, `price_label`, `market_status`, `as_of`, `source`, `is_delayed`, `created_at`입니다.
- Yahoo row의 `source`는 `yahoo-finance-chart`, `as_of`는 `regularMarketTime`이 있으면 그 값, 없으면 sync 실행 시각입니다.
- Supabase upsert key는 `market_prices(ticker, source, as_of)`입니다. `companies` 보강 upsert는 `id` 기준입니다.
- `/api/market-prices`는 Supabase `market_prices`를 `as_of desc, created_at desc`로 읽고 `companyId`, `ticker`, `market`, `price`, `open`, `previousClose`, `close`, `change`, `changePercent`, `currency`, `priceLabel`, `marketStatus`, `asOf`, `source`, `isDelayed`로 정규화합니다.
- 프론트 `src/services/prices.ts`는 위 필드를 기대하며, 서버 row가 없거나 실패할 때만 `src/data.ts`의 `mockMarketPrices`를 fallback/pending 표시용으로 병합합니다.

#### Yahoo 429 및 fallback 동작

- ticker별 Yahoo 호출이 429 등으로 실패하면 해당 ticker 결과만 `failed`로 기록하고 warn 로그를 남깁니다. 현재 재시도, backoff, chunk 간 delay, provider 전환은 없습니다.
- Yahoo에서 하나라도 row가 나오면 `loadPriceRows()`는 그 row 묶음을 즉시 사용합니다. 일부 ticker가 실패해도 import fallback은 실패 ticker만 보충하지 않습니다.
- Yahoo rows가 0개일 때만 import fallback을 시도합니다.
- `PRICE_SYNC_SOURCE=import-only`이면 Yahoo를 건너뛰고 import만 사용합니다.
- `PRICE_SYNC_SOURCE=manual-only`이면 Yahoo rows가 비고, 이어서 import fallback이 있으면 사용합니다.
- import URL은 `PRICE_IMPORT_URL`을 우선하고, 없으면 `MARKET_PRICES_IMPORT_URL`을 봅니다.
- import URL은 JSON 배열, `{ rows: [...] }`, `{ data: [...] }`, 또는 CSV를 허용합니다.
- import URL이 없거나 rows가 없으면 로컬 `data/prices.json`을 읽습니다. 현재 저장소에는 `data/prices.example.json`만 있고 실제 `data/prices.json`은 없습니다.
- fallback rows도 `ticker`가 있어야 저장 대상이 됩니다. `source`가 없으면 `manual-price-import`, `asOf/as_of`가 없으면 실행 시각으로 채웁니다.

운영에서 fallback이 새 가격 row를 만들지 못한 후보:

- Vercel `finance1` env 검색에서 `MARKET_PRICES_IMPORT_URL`, `PRICE_IMPORT_URL`, `PRICE_SYNC_SOURCE` 이름이 없었습니다.
- GitHub Actions workflow는 `MARKET_PRICES_IMPORT_URL` secret reference만 전달하고 `PRICE_IMPORT_URL`, `PRICE_SYNC_SOURCE`는 전달하지 않습니다. secret 값 존재 여부는 값 없이 별도 확인이 필요합니다.
- GitHub Actions 최신 가격 sync 로그에는 `Yahoo chart 429`가 다수 표시됐고, 최종 요약에 `no PRICE_IMPORT_URL/data/prices.json fallback produced rows`가 있었습니다.
- 저장소에는 실제 `data/prices.json`이 없으므로 배포/Actions 환경에서 import URL이 비어 있으면 로컬 fallback도 rows를 만들 수 없습니다.
- Yahoo가 일부라도 성공하는 run에서는 import fallback이 실행되지 않으므로, 일부 ticker 429는 import로 보충되지 않습니다.
- import URL이 존재하더라도 같은 `ticker + source + as_of`를 반복하면 최신 기준일이 전진하지 않습니다.

#### stale인데 success처럼 보일 수 있는 이유

- 현재 sync status는 `failedCount > 0`이면 `partial`, 아니면 `success`입니다. `as_of`가 이전 영업일인지, sync 전후 `max(as_of)`가 전진했는지는 보지 않습니다.
- Yahoo가 오래된 `regularMarketTime`을 반환해도 row 자체는 정상 rows로 처리됩니다.
- `upsertRows()`는 Supabase REST 응답의 실제 insert/update count를 읽지 않고 payload 길이를 `inserted`처럼 반환합니다. 따라서 같은 `ticker + source + as_of` 충돌 merge여도 `inserted_count`가 row 수처럼 기록될 수 있습니다.
- `sync_runs`에는 현재 `latest_as_of_before`, `latest_as_of_after`, `attempted_count`, `fetched_count`, `stale_count`가 없어서 "성공했지만 최신 기준일이 그대로"인 상태를 구분하기 어렵습니다.

#### KIS Open API 확인 내용

- 접근토큰 발급은 `POST /oauth2/tokenP`입니다. 공식 포털 기준 실전 Domain은 `https://openapi.koreainvestment.com:9443`, 모의 Domain은 `https://openapivts.koreainvestment.com:29443`입니다.
- 개인 client credentials 방식의 token body는 `grant_type=client_credentials`, `appkey`, `appsecret`입니다. 포털 설명상 개인 접근토큰은 24시간 유효하고, 6시간 이내 재호출 시 기존 토큰이 반환될 수 있습니다.
- 공식 샘플 `kis_devlp.yaml`도 실전 `prod=https://openapi.koreainvestment.com:9443`, 모의 `vps=https://openapivts.koreainvestment.com:29443`를 사용합니다.
- REST 호출 공통 header는 `authorization: Bearer ...`, `appkey`, `appsecret`, `tr_id`, `custtype: P`, 필요 시 `tr_cont` 구조입니다.
- 국내주식 현재가 REST endpoint는 `GET /uapi/domestic-stock/v1/quotations/inquire-price`, TR_ID는 `FHKST01010100`입니다.
- 국내주식 현재가 필수 params는 `FID_COND_MRKT_DIV_CODE`와 `FID_INPUT_ISCD`입니다. 샘플 기준 `FID_COND_MRKT_DIV_CODE=J`는 KRX, `NX`는 NXT, `UN`은 통합이고, `FID_INPUT_ISCD`는 `005930` 같은 6자리 국내 종목코드입니다.
- 해외주식 현재체결가 REST endpoint는 `GET /uapi/overseas-price/v1/quotations/price`, TR_ID는 `HHDFS00000300`입니다.
- 해외주식 현재가상세 REST endpoint는 `GET /uapi/overseas-price/v1/quotations/price-detail`, TR_ID는 `HHDFS76200200`입니다. 상세 endpoint는 `curr`, `open`, `last`, `base`, `t_rate`, 원화환산 필드 등을 줄 수 있어 currency 보강 후보입니다.
- 해외주식 params는 `AUTH`, `EXCD`, `SYMB`입니다. 샘플은 `AUTH=""`, `EXCD=NAS`, `SYMB=AAPL`을 사용합니다. `price_detail` 예시는 `NYS`, `NAS`, `AMS`, `HKS`, `TSE`, `SHS`, `SZS`, `HSX`, `HNX`, `BAY`, `BAQ`, `BAA` 같은 거래소 코드를 언급합니다.
- 현재가 조회 endpoint 자체에는 `CANO`, `ACNT_PRDT_CD` 같은 계좌번호 파라미터가 없습니다. 다만 Open API 서비스 신청, token 발급, 주문/잔고/체결통보 확장에는 계좌와 HTS ID가 필요할 수 있습니다.
- 국내 현재가 샘플은 "실시간 시세를 원하면 웹소켓 API를 활용"하라고 안내합니다. 즉 REST 현재가는 UI에서 계속 `지연 가능` 또는 `최신/종가` 상태를 보수적으로 표시해야 합니다.
- 해외 실시간지연체결가 샘플은 무료시세/지연시세 조건을 설명합니다. 미국은 0분 지연으로 제공될 수 있고, 홍콩/베트남/중국/일본은 15분 지연으로 설명되어 있습니다. 다만 REST 현재체결가의 정확한 지연/재배포 약관은 운영자가 KIS 약관과 API 포털에서 추가 확인해야 합니다.
- 공식 GitHub README는 `EGW00201` 초당 거래건수 초과와 모의투자 REST 호출 제한이 낮다는 점을 언급합니다. endpoint별 정확 quota는 이번 조사에서 확정하지 못했습니다.

#### KIS 적용 전략

- Yahoo를 삭제하지 않습니다. KIS를 primary 후보로 추가하고, Yahoo는 secondary/fallback으로 유지합니다.
- 1차 pilot은 국내주식 `.KS`, `.KQ` 일부 ticker가 가장 안전합니다. 현재 앱의 국내 ticker는 Yahoo 표기라서 KIS 호출 전 `005930.KS -> 005930`, `042700.KS -> 042700`, `058470.KQ -> 058470`처럼 변환하면 됩니다.
- 국내주식 KIS rows는 `source=kis-domestic-quote`, `currency=KRW`, `price=stck_prpr`, `change=prdy_vrss`, `changePercent=prdy_ctrt`, `open=stck_oprc`, `previousClose` 또는 `close` 후보는 `stck_sdpr`/전일종가 성격 필드를 실제 응답으로 확인한 뒤 매핑합니다.
- 국내 `asOf`는 KIS 현재가 응답의 영업일/체결시각 필드를 우선 확인해야 합니다. 필드 확인이 안 되면 sync 실행시각을 쓰되 `priceLabel=delayed`, `isDelayed=true`로 둡니다.
- 해외주식 KIS 우선도 가능하지만, 1차에는 조심스럽게 pilot만 권장합니다. `NASDAQ`/`NYSE` 같은 현재 market 값을 KIS `EXCD=NAS/NYS/AMS`로 바꾸는 symbol mapping이 필요합니다.
- 해외 `BRK-B`, `BRK.B`, ADR, OTC, 주간거래 symbol은 KIS `SYMB`와 Yahoo lookup ticker가 다를 수 있으므로 자동 변환보다 명시 mapping이 필요합니다.
- 해외 KIS rows는 `source=kis-overseas-quote`, `price=last`, `change=diff`, `changePercent=rate`, `previousClose=base`, `currency=curr` 또는 exchange mapping 기반 currency로 정규화합니다.
- 전체 교체 전에 pilot 대상 예시는 `005930.KS`, `000660.KS`, `042700.KS` 또는 국내 core 5개입니다. 해외는 `NVDA`, `AAPL`, `DELL`처럼 KIS `EXCD/SYMB`가 명확한 ticker만 별도 pilot로 둡니다.
- source별 stale guard를 추가한 뒤, KIS와 Yahoo를 같은 `market_prices` 테이블에 저장하되 `source`를 분리합니다. 프론트는 최신 `asOf`와 source 우선순위로 선택할 수 있게 합니다.

권장 fallback 순서:

1. KIS quote adapter: 국내 pilot 또는 명시 mapping이 있는 해외 ticker
2. Yahoo Finance chart: KIS 미지원, KIS 실패, 해외 mapping 미확정 ticker
3. `PRICE_IMPORT_URL`
4. `MARKET_PRICES_IMPORT_URL`
5. `data/prices.json`
6. 기존 DB row 유지 후 stale 표시
7. 프론트 mock price는 실제 가격이 아니라 `가격 준비 중`/pending 표시 보조로만 사용

#### 필요한 env 이름

`.env.example`에는 실제 값을 넣지 않고 이름만 추가합니다.

```bash
KIS_APP_KEY=
KIS_APP_SECRET=
KIS_ENV=
KIS_BASE_URL=
KIS_PAPER_BASE_URL=
KIS_PROD_BASE_URL=
KIS_ACCOUNT_NO=
KIS_ACCOUNT_PRODUCT_CODE=
```

- `KIS_APP_KEY`, `KIS_APP_SECRET`: 서버 전용입니다. 프론트 `VITE_` prefix를 붙이지 않습니다.
- `KIS_ENV`: `paper`/`prod` 또는 `vps`/`prod`처럼 운영 정책에서 하나로 고정합니다.
- `KIS_PROD_BASE_URL`: 기본값 후보 `https://openapi.koreainvestment.com:9443`
- `KIS_PAPER_BASE_URL`: 기본값 후보 `https://openapivts.koreainvestment.com:29443`
- `KIS_BASE_URL`: 명시 override가 필요할 때만 사용합니다. 없으면 `KIS_ENV`로 prod/paper URL을 선택합니다.
- `KIS_ACCOUNT_NO`, `KIS_ACCOUNT_PRODUCT_CODE`: 현재가 조회만으로는 필수 파라미터가 아니므로 optional입니다. 주문/잔고/체결통보 확장 또는 계좌연결형 인증으로 넓힐 때 필요합니다.

#### token 관리 계획

- token은 서버에서만 발급하고 저장합니다. 응답 JSON, 로그, `sync_runs.error_message`에 token, app key, app secret을 남기지 않습니다.
- 한 sync run 안에서는 token을 한 번만 발급/재사용합니다. ticker마다 token을 발급하면 안 됩니다.
- 접근토큰 응답의 `access_token_token_expired` 또는 `expires_in`을 기준으로 만료 5~10분 전에는 새 token을 발급합니다.
- Vercel serverless는 메모리 cache가 보장되지 않으므로 첫 구현은 "daily sync run마다 1회 발급"으로 충분한지 확인합니다. 호출 주기가 늘면 Supabase/Vercel KV 같은 서버 전용 cache를 별도 설계합니다.
- KIS 포털 설명상 잦은 token 발급은 기존 token 반환 또는 제한 정책과 연결될 수 있으므로, token 발급 실패는 가격 실패와 분리해 `error_summary`에 요약만 남깁니다.

#### symbol mapping 계획

- 현재 앱 ticker는 Yahoo/화면 표기 기준입니다. KIS용 lookup symbol을 별도 필드 또는 mapping table로 둡니다.
- 국내: `.KS`, `.KQ` suffix를 제거해 6자리 `FID_INPUT_ISCD`로 변환합니다. `FID_COND_MRKT_DIV_CODE`는 1차 `J`로 두고, NXT/통합 가격이 필요해지면 `NX`/`UN`을 명시합니다.
- 해외: `market`/`exchange`를 KIS `EXCD`로 변환합니다. 1차 mapping은 `NASDAQ -> NAS`, `NYSE -> NYS`, `AMEX -> AMS`입니다.
- 해외 `SYMB`는 화면 ticker와 다를 수 있습니다. class share, ADR, OTC, 주간거래, Yahoo alias가 있는 ticker는 명시 mapping 없이는 KIS 조회 대상에서 제외합니다.
- mapping은 `src/data.ts`의 화면 데이터와 분리해도 됩니다. 예: sync 전용 `priceSymbolMappings` 또는 DB table 후보를 두고, `ticker`, `provider`, `lookupSymbol`, `exchangeCode`, `currency`, `enabled`, `notes`를 관리합니다.

#### sync status 개선안

현재 `sync_runs.status` check constraint는 `success`, `partial`, `failed`, `skipped`만 허용합니다. stale을 별도 status로 저장하려면 schema migration이 필요합니다. 다음 코드 변경 단계에서 아래 기준을 제안합니다.

| status | 기준 |
| --- | --- |
| `success` | 대상이 있고, provider fetch가 성공했으며, `latest_as_of_after`가 `latest_as_of_before`보다 전진했거나 fresh threshold 안에 있고, 실패/오래된 row가 허용 범위 이내 |
| `partial` | 일부 ticker는 fetch/upsert 성공했지만 일부 실패, 일부 stale, 일부 provider fallback 사용 |
| `stale` | provider 호출은 끝났지만 새 기준일 row가 없거나 `latest_as_of_after <= latest_as_of_before`, 또는 모든 fetched row가 freshness threshold 밖 |
| `failed` | provider/token/network/DB write 오류로 새 row도 fallback row도 준비하지 못했고, run 자체가 비정상 종료 |
| `skipped` | 의도적으로 비활성화, 대상 0개, 필수 env 부재로 실행하지 않음 |

추가 기록 후보:

- `attempted_count`: 이번 run에서 조회하려 한 ticker 수
- `fetched_count`: provider에서 정상 row를 받은 ticker 수
- `upserted_count`: DB에 실제 upsert 요청한 row 수. 가능하면 Supabase 응답 count 또는 사전 dedupe 기준으로 "준비 row 수"와 구분합니다.
- `stale_count`: 응답은 받았지만 기준일이 fresh threshold 밖인 ticker 수
- `failed_count`: provider별 실패 ticker 수
- `latest_as_of_before`: run 시작 전 `market_prices max(as_of)`
- `latest_as_of_after`: run 종료 후 `market_prices max(as_of)`
- `error_summary`: 긴 raw response 대신 provider별 요약. 예: `KIS token failed`, `Yahoo 429: 81 tickers`, `import rows missing ticker`, `latest_as_of unchanged`

구현 시에는 `inserted_count`를 "성공적으로 최신화된 row 수"처럼 쓰지 말고, `upserted_count`와 `latest_as_of_after`를 함께 봐야 합니다.

#### 구현 단계 제안

1. 코드 변경 없이 운영 env에 `PRICE_IMPORT_URL` 또는 `MARKET_PRICES_IMPORT_URL`을 추가해 Yahoo 429 때 수동 fallback이 실제 rows를 만드는지 먼저 검증합니다.
2. 가격 sync 결과에 `latest_as_of_before/after`를 계산하는 read-only guard를 추가하고, stale이면 `success`가 아니라 `stale` 또는 `partial`로 기록하는 migration을 설계합니다.
3. KIS token 발급 helper와 provider adapter를 서버/sync 전용으로 추가합니다. token과 secret은 로그에 남기지 않습니다.
4. 국내 ticker 3~5개 pilot을 KIS primary로 돌리고 Yahoo를 secondary로 둡니다.
5. KIS 국내 응답 필드에서 `price`, `open`, `previousClose`, `change`, `changePercent`, `asOf` mapping을 실제 응답으로 확정합니다.
6. 해외 ticker는 `EXCD/SYMB/currency` mapping이 있는 일부만 pilot합니다.
7. provider별 결과와 stale 상태가 안정화되면 전체 국내주식으로 확대하고, 이후 해외 KIS 확대 여부를 약관/지연시세 조건과 함께 결정합니다.

#### 확인 불가 및 추가 확인 필요

- KIS API 포털의 상세 response 표는 SPA 동작 때문에 일부만 확인했습니다. 실제 구현 전 portal에서 국내 현재가/해외 현재체결가/해외 현재가상세의 최신 response field와 TR_ID를 다시 확인해야 합니다.
- REST 현재가의 재배포 가능 범위, 공개 웹서비스 표시 가능 범위, 유료/무료/지연시세 조건은 KIS 약관과 서비스 신청 화면에서 운영자가 확인해야 합니다.
- endpoint별 정확 rate limit은 이번 조사에서 확정하지 못했습니다. 최소한 provider별 throttle, 429/EGW backoff, chunk delay를 구현해야 합니다.
- 해외주식의 `AUTH` 값 의미와 빈 문자열 사용 가능 범위는 공식 샘플 기준으로는 빈 값 예시가 있으나, 운영 계정/시장별로 재확인해야 합니다.
- 계좌번호 env는 현재가 조회 endpoint에는 필요 없어 보이지만, KIS 서비스 신청/토큰/향후 주문·잔고 확장 정책에 따라 optional에서 required로 바뀔 수 있습니다.

### KIS 국내주식 가격 sync pilot 구현

2026-06-04 기준으로 국내주식 `.KS`/`.KQ` ticker에 한해 KIS Open API를 Yahoo Finance chart 앞단의 1차 가격 소스로 연결했습니다. 전체 가격 경로 교체가 아니라 domestic pilot이며, 해외주식은 계속 기존 Yahoo/fallback 경로를 사용합니다. Yahoo 기존 코드는 삭제하지 않았고, KIS가 성공한 국내 ticker만 Yahoo 호출 대상에서 제외합니다.

구현 파일:

- `scripts/price-sources/kis.ts`: KIS token 발급, 국내 현재가 조회, ticker 변환, 응답 normalize
- `scripts/sync-prices.ts`: KIS -> Yahoo -> import fallback 순서 통합, provider별 결과 count, latest `as_of` 전후 guard

국내 ticker 변환:

```text
005930.KS -> 005930
000660.KS -> 000660
091990.KQ -> 091990
```

KIS 국내 현재가 호출 기준:

- token endpoint: `POST /oauth2/tokenP`
- 국내 현재가 endpoint: `GET /uapi/domestic-stock/v1/quotations/inquire-price`
- 국내 현재가 TR_ID: `FHKST01010100`
- `FID_COND_MRKT_DIV_CODE=J`
- `FID_INPUT_ISCD=005930` 같은 6자리 국내 종목코드

필요 env:

```bash
KIS_APP_KEY=
KIS_APP_SECRET=
KIS_ENV=production
KIS_PROD_BASE_URL=https://openapi.koreainvestment.com:9443
KIS_PAPER_BASE_URL=https://openapivts.koreainvestment.com:29443
```

`KIS_BASE_URL`이 있으면 `KIS_ENV` 기반 URL보다 우선합니다. `KIS_ENV=production` 또는 `prod`면 실전 URL을 쓰고, 그 외에는 모의 URL을 기본값으로 둡니다. 현재가 조회에는 `KIS_ACCOUNT_NO`, `KIS_ACCOUNT_PRODUCT_CODE`를 사용하지 않습니다.

fallback 흐름:

1. 전체 가격 대상 중 `.KS`/`.KQ` 국내 ticker만 KIS 조회를 먼저 시도합니다.
2. KIS env가 없으면 KIS는 graceful skip되고 국내 ticker도 Yahoo fallback으로 넘어갑니다.
3. KIS 성공 ticker는 Yahoo 호출 대상에서 제외합니다.
4. KIS 실패 국내 ticker와 해외 ticker는 기존 Yahoo Finance chart 경로로 조회합니다.
5. KIS/Yahoo 이후에도 누락 ticker가 있거나 provider 실패가 있으면 `PRICE_IMPORT_URL`, `MARKET_PRICES_IMPORT_URL`, `data/prices.json` fallback을 시도해 아직 없는 ticker만 보충합니다.
6. 그래도 새 row가 없으면 기존 DB row와 프론트 mock/pending fallback이 유지됩니다.

KIS row normalize:

- `source`: `kis-openapi`
- `currency`: `KRW`
- `price`: `stck_prpr`
- `open`: `stck_oprc`
- `previousClose`: `stck_prdy_clpr`, `prdy_clpr`, `stck_sdpr` 후보 중 사용 가능한 값
- `change`: `prdy_vrss`와 `prdy_vrss_sign`을 함께 반영
- `changePercent`: `prdy_ctrt`와 `prdy_vrss_sign`을 함께 반영
- `priceLabel`: `delayed`
- `marketStatus`: `delayed`
- `isDelayed`: `true`

KIS 응답에 영업일과 체결시각이 함께 있으면 `asOf`에 반영합니다. 응답에서 신뢰 가능한 date+time 조합을 찾지 못하면 fetch 시각을 `asOf`로 사용합니다. 가격이 없거나 0 이하, `NaN`이면 row를 만들지 않고 해당 ticker는 Yahoo fallback으로 넘깁니다.

sync status 보강:

- `/api/sync/prices` 응답 summary에 `providerMetrics.kis`, `providerMetrics.yahoo`, `providerMetrics.import`가 포함됩니다.
- 각 provider metric은 `attemptedCount`, `successCount`, `failedCount`, `skippedCount`, `skipReason`을 담습니다.
- Supabase env가 있으면 run 시작 전후 `market_prices` latest `as_of`를 읽어 `latest_as_of_before`, `latest_as_of_after`로 응답 summary에 포함합니다.
- provider 실패가 있거나 DB latest `as_of`가 전진하지 않으면 `success`가 아니라 `partial`로 기록합니다. 현재 `sync_runs.status` schema가 `stale` 값을 허용하지 않으므로 별도 stale status는 migration 전까지 쓰지 않습니다.
- `sync_runs.error_message`에는 secret, app key, app secret, access token, raw response를 남기지 않고 provider count와 latest `as_of` 요약만 기록합니다.

로컬에서 `KIS_APP_KEY`/`KIS_APP_SECRET`이 없으면 KIS 실제 호출은 하지 않습니다. 이 경우 KIS skip path와 Yahoo/import fallback만 확인하며, 운영 확인은 Vercel Production env 설정 후 Cron 또는 인증된 `/api/sync/prices` 실행 결과로 확인합니다.

### KIS 국내주식 pilot 운영 검증

확인 일시: 2026-06-04 15:04 UTC / 2026-06-04 23:04 CST 기준입니다.

Vercel project/env 확인:

- project: `finance1`
- 운영 기준 domain: `https://finance1-flax.vercel.app`
- 사용자 확인 기준 Production env에는 `KIS_APP_KEY`, `KIS_APP_SECRET`, `KIS_ENV=production`, `KIS_PROD_BASE_URL`이 추가되어 있습니다.
- Codex는 KIS app key, app secret, access token, CRON_SECRET, Supabase key 값을 열람하거나 출력하지 않았습니다.
- 현재 로컬에는 Vercel CLI와 `.vercel/project.json`이 없어 Codex가 dashboard env 존재 여부를 직접 재확인하지는 못했습니다. 값 확인은 Vercel dashboard에서 이름 존재 여부만 추가 확인하면 됩니다.

Production redeploy 확인:

- KIS pilot 구현 commit `fc08ce8` push 후 GitHub commit status에서 `Vercel - finance1` deployment가 `success`로 확인되었습니다.
- deployment status description은 `Deployment has completed`, created/updated time은 2026-06-04 15:03:48 UTC입니다.
- 같은 commit에 별도 `Vercel - finance` deployment도 success였지만, 운영 검증 기준은 `finance1`입니다.

sync 실행 방식 확인:

- 보호된 route인 `https://finance1-flax.vercel.app/api/sync/prices`를 secret 없이 호출하면 401 `Unauthorized cron request`가 반환됩니다. 이는 정상입니다.
- 이번 확인 시점은 Vercel 가격 Cron인 평일 08:30 UTC 이후였고, KIS 구현 commit 배포가 15:03 UTC에 완료되었습니다. 따라서 새 코드가 적용된 Vercel 가격 Cron은 아직 실행되지 않았습니다.
- GitHub Actions에는 `workflow_dispatch`가 있지만 현재 workflow env에는 KIS env가 전달되지 않습니다. 따라서 GitHub Actions 수동 실행은 KIS 운영 검증 경로로 사용하지 않았습니다.
- CRON_SECRET을 query/header에 노출하는 방식은 사용하지 않았습니다.

Supabase 확인 결과:

- Supabase dashboard/SQL 세션은 이번 확인에서 직접 접근하지 못했습니다.
- 운영 API가 Supabase `market_prices`를 읽는 공개 endpoint이므로 `/api/market-prices?limit=200` 결과를 DB 최신 상태의 read-through 확인으로 사용했습니다.
- `sync_runs`는 공개 endpoint가 없고 dashboard/SQL 접근이 필요해 직접 확인하지 못했습니다.

운영 API 확인 결과:

- endpoint: `https://finance1-flax.vercel.app/api/market-prices?limit=200`
- status: 200
- row count: 81
- latest `asOf`: `2026-06-02T20:04:31.000Z`
- source 분포: `yahoo-finance-chart` 81 rows
- `005930.KS`: source `yahoo-finance-chart`, currency `KRW`, asOf `2026-06-02T06:30:12.000Z`
- `000660.KS`: source `yahoo-finance-chart`, currency `KRW`, asOf `2026-06-02T06:30:28.000Z`
- API 기준으로는 아직 `kis-openapi` row가 보이지 않습니다.

최종 판단:

- 현재 판정은 `Cron/실행 문제` 또는 `검증 대기`입니다.
- KIS pilot 코드는 Production에 배포되었지만, 배포 이후 보호된 가격 sync가 아직 실행되지 않아 KIS 성공/부분 성공/env 문제/parsing 문제/API 권한 문제를 판정할 수 없습니다.
- 현재 운영 API는 기존 stale Yahoo row를 그대로 반환하므로 DB/API read 문제 증거는 없습니다.

다음 액션:

1. Vercel dashboard에서 `finance1` Production env 이름 존재 여부를 값 열람 없이 확인합니다.
2. Vercel dashboard에서 `/api/sync/prices` Cron/function을 secret 노출 없이 수동 실행할 수 있으면 실행합니다. 수동 실행이 어렵다면 다음 Vercel 가격 Cron인 2026-06-05 08:30 UTC 이후 재확인합니다.
3. 실행 후 Supabase SQL Editor에서 `005930.KS`, `000660.KS`의 `source`, `currency`, `as_of`와 `sync_runs` 최신 status를 확인합니다.
4. GitHub Actions를 KIS 검증 경로로 쓰려면 workflow env에 KIS env 이름을 추가해야 합니다. 이번 운영 검증에서는 코드/API/package/lock 파일을 추가 수정하지 않았습니다.

### Vercel Cron

`vercel.json`에 아래 Cron이 포함되어 있습니다. Vercel Cron 시간은 UTC 기준입니다.

- `/api/sync/financials`: 평일 09:00 UTC 1회
- `/api/sync/trades`: 평일 03:00 UTC 1회
- `/api/sync/prices`: 평일 08:30 UTC 1회

엔드포인트는 `CRON_SECRET`으로 보호됩니다. Vercel Cron은 프로젝트 환경변수에 `CRON_SECRET`이 있으면 호출 시 `Authorization: Bearer ...` 헤더를 자동으로 보냅니다. 브라우저나 curl로 수동 테스트할 때는 아래처럼 헤더를 보내거나 query secret을 붙이면 됩니다.
Vercel Hobby 플랜은 하루 1회보다 잦은 Cron을 허용하지 않으므로, 공개 보유/거래 보고 데이터를 더 자주 갱신하려면 아래 GitHub Actions 스케줄을 사용하거나 Vercel Pro에서 Cron 주기를 늘리세요.

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://YOUR_DOMAIN/api/sync/financials
curl -H "Authorization: Bearer $CRON_SECRET" https://YOUR_DOMAIN/api/sync/trades
curl -H "Authorization: Bearer $CRON_SECRET" https://YOUR_DOMAIN/api/sync/prices
```

브라우저 수동 테스트:

```text
https://YOUR_DOMAIN/api/sync/financials?secret=CRON_SECRET값
https://YOUR_DOMAIN/api/sync/trades?secret=CRON_SECRET값
https://YOUR_DOMAIN/api/sync/prices?secret=CRON_SECRET값
```

수동 테스트 순서:

1. Supabase SQL Editor에서 `supabase/schema.sql` 실행
2. Vercel 프로젝트를 Production으로 재배포
3. 위 `/api/sync/financials?secret=CRON_SECRET값`, `/api/sync/trades?secret=CRON_SECRET값`, `/api/sync/prices?secret=CRON_SECRET값` 호출
4. Supabase `sync_runs` 테이블에서 `success`, `partial`, `skipped`, `failed` 로그 확인
5. 실패 시 Vercel Logs에서 endpoint 응답과 Supabase REST 오류 확인

### GitHub Actions 대안

Vercel Cron 대신 `.github/workflows/sync.yml`을 사용할 수 있습니다. GitHub Secrets에 아래 값을 등록하세요.

- `OPENDART_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `SEC_USER_AGENT`
- 선택: `SEC_13F_MANAGER_CIKS`, `CONGRESS_TRADES_IMPORT_URL`, `NPS_IMPORT_URL`, `PRICE_IMPORT_URL`, `MARKET_PRICES_IMPORT_URL`

## 운영자가 직접 해야 하는 것

1. OpenDART API 키 발급
   - OpenDART 사이트에서 인증키 신청
   - 발급받은 키를 `OPENDART_API_KEY`에 저장

2. Supabase 프로젝트 생성
   - Supabase에서 새 프로젝트 생성
   - Project URL 확인
   - Service Role Key 확인
   - DB connection string 확인

3. Supabase DB schema 적용
   - `supabase/schema.sql`을 Supabase SQL Editor에서 실행
   - Supabase CLI 사용 시 프로젝트 정책에 맞춰 schema를 적용

4. Vercel 환경변수 입력
   - `OPENDART_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET`
   - `SEC_USER_AGENT`

5. Vercel Cron 또는 GitHub Actions 설정
   - Vercel Cron 사용 시 `vercel.json` 확인
   - GitHub Actions 사용 시 GitHub Secrets 등록

6. 관심 기업 식별자 등록
   - 한국 기업: `corpCode`
   - 미국 기업: `cik`
   - 가능하면 ticker, market, sector, companyId도 일관되게 관리

7. 최초 수동 동기화 실행
   - `npm run sync:financials`
   - `npm run sync:trades`
   - `npm run sync:prices`
   - `npm run audit:filings`
   - `npm run audit:listings`
   - 또는 `/api/sync/financials?secret=CRON_SECRET값`, `/api/sync/trades?secret=CRON_SECRET값` 호출

8. 자동 업데이트 성공 여부 확인
   - `sync_runs` 테이블 확인
   - Vercel Logs 확인
   - GitHub Actions logs 확인

## Live News API

`/api/news`는 Vercel Serverless Function입니다. GDELT DOC 2.0과 Google News RSS fallback을 사용하며, 최근 24시간 기준으로 신뢰 도메인 뉴스만 통과시킵니다.

현재 허용 소스 예시:

- 공식/정책: `dart.fss.or.kr`, `kind.krx.co.kr`, `fss.or.kr`, `fsc.go.kr`, `bok.or.kr`, `motie.go.kr`
- 뉴스/산업지: `reuters.com`, `yna.co.kr`, `hankyung.com`, `mk.co.kr`, `etnews.com`, `thelec.kr`, `zdnet.co.kr`, `businesspost.co.kr`

## 주간 해부 업데이트 방법

홈은 `currentWeeklyDigest`를 기준으로 표시되는 주간 해부 피드입니다. 제작자는 주중에 인스타그램/Threads에 짧은 해부 콘텐츠를 올리고, 토요일에 그 주에 분석한 종목 3~5개를 `src/data.ts`의 `currentWeeklyDigest`에 정리해 사이트 홈을 갱신합니다.

### 주가해부실 정체성

- 주가해부실은 종목 추천 서비스가 아닙니다.
- 이번 주 크게 움직인 종목을 흐름과 숫자 3개로 해부하는 초보자용 시장 공부 앱입니다.
- 카드뉴스처럼 쉽게 보고, 숫자는 SEC/OpenDART 원문 데이터로 확인합니다.
- 다음 주가를 맞히는 곳이 아니라, 뉴스가 어떤 산업과 회사로 연결되는지 보는 연습을 돕습니다.
- 기본 화면은 쉽게 읽히는 카드형 해설로 두고, 고급 정보는 `더 깊게 보기`로 보냅니다.

### 주가해부실 운영 방식

- 주중에는 인스타그램/Threads에 짧은 해부 콘텐츠를 업로드합니다.
- 토요일에는 그 주에 분석한 종목 3~5개를 사이트에 정리합니다.
- 홈은 `currentWeeklyDigest`를 기준으로 표시됩니다.
- `featuredPickId`는 이번 주 대표 해부입니다.
- `recentItems`는 이번 주 또는 최근 해부 목록입니다. 대체 설계에서 `recentPickIds`를 쓰더라도 같은 역할입니다.
- `market`은 미국/한국 구분에 사용합니다. 현재 타입 기준으로 `US`, `KR`을 사용합니다.
- `movement` 운영 입력값은 급등/급락/실적/이슈 구분입니다. 현재 데이터 구조에서는 `movementLabel`에 넣습니다.
- `theme`은 AI 서버, 전력 인프라, 바이오처럼 이번 움직임이 속한 테마입니다.
- 실제 상세 페이지가 없는 항목은 `coming-soon` 또는 `target: 'analysis'`처럼 상세 연결이 없음을 분명히 처리합니다.
- 실제 링크가 없는 항목은 `href`를 만들지 않습니다. 빈 링크나 가짜 URL을 넣지 않습니다.

### currentWeeklyDigest 구조

`currentWeeklyDigest`는 홈의 히어로, 대표 해부, 최근 해부 목록, 시장 지도 미리보기를 한 번에 관리하는 운영 데이터입니다.

- `weekLabel`: 이번 주 표기입니다. 예: `2026년 5월 넷째 주`
- `headline`: 홈 상단에 보이는 이번 주 해부 메시지입니다.
- `featuredPickId`: 대표 해부로 연결할 Pick ID입니다.
- `featured`: 대표 해부 카드의 시장, 테마, 질문형 제목, 요약, 버튼 문구를 담습니다.
- `recentItems`: 이번 주 또는 최근 해부 목록입니다. 현재 홈은 이 배열을 사용합니다.
- `recentPickIds`: 별도 구현에서 사용할 수 있는 Pick ID 목록 이름입니다. 현재 구현은 `recentItems` 중심입니다.
- `marketMapItems`: 홈의 시장 지도 미리보기 항목입니다.
- `market`: 최근 해부 항목에서 미국/한국을 구분합니다. 값은 `US` 또는 `KR`입니다.
- `movement`: 운영상 급등/급락/실적/이슈 구분입니다. 실제 필드는 `movementLabel`입니다.
- `theme`: AI 서버, 전력 인프라, 바이오 같은 테마명입니다.
- `relatedCompanies`: 기본 화면에서 같이 볼 회사입니다. 최대 3개만 먼저 보여줍니다.
- `metricLabels`: 대표 해부에서 먼저 볼 숫자 3개입니다. 숫자 자체가 아니라 지표 라벨을 넣고, 실제 값은 SEC/OpenDART 등 원문 기준으로 확인합니다.
- `coming-soon`: 아직 상세 페이지나 지도 연결이 준비되지 않은 산업/항목은 `status: 'coming-soon'`으로 둡니다.
- `href`: 실제 연결할 페이지가 있을 때만 넣습니다. 실제 링크가 없는 항목은 `href`를 만들지 않습니다.

### 매주 입력 템플릿

아래 템플릿을 먼저 채운 뒤 `currentWeeklyDigest`에 옮깁니다. 대표 해부 1개와 최근 해부 3~5개를 기준으로 운영합니다.

```markdown
## 이번 주 해부 업데이트

weekLabel:

대표 해부:
- pickId:
- 회사명:
- 시장: 미국/한국
- 움직임: 급등/급락/실적/이슈
- 테마:
- 질문형 제목:
- 짧은 설명:
- 같이 볼 회사 3개:
- 숫자 3개:

최근 해부 목록:
1.
- pickId 또는 companyId:
- 회사명:
- 시장:
- 움직임:
- 테마:
- 질문형 제목:
- 짧은 설명:
- 같이 볼 회사:
- 숫자 3개:
- 상세 페이지 있음/없음:

2.
- pickId 또는 companyId:
- 회사명:
- 시장:
- 움직임:
- 테마:
- 질문형 제목:
- 짧은 설명:
- 같이 볼 회사:
- 숫자 3개:
- 상세 페이지 있음/없음:

3.
- pickId 또는 companyId:
- 회사명:
- 시장:
- 움직임:
- 테마:
- 질문형 제목:
- 짧은 설명:
- 같이 볼 회사:
- 숫자 3개:
- 상세 페이지 있음/없음:

시장 지도 업데이트:
- 새로 추가할 산업:
- 기존 지도와 연결되는 산업:
- 준비 중으로 둘 항목:
```

작성할 때의 주의사항:

- 매수/매도 추천 표현을 쓰지 않습니다.
- 목표주가/수익률 예측을 쓰지 않습니다.
- 가짜 숫자를 만들지 않습니다.
- 실제 상세 페이지가 없으면 `coming-soon` 또는 상세 연결 없음으로 처리합니다.
- 기본 화면에는 관련 회사 최대 3개만 보여줍니다.
- 숫자는 3개만 고릅니다.

### 주간 반영 체크리스트

1. 이번 주 분석 종목 3~5개를 정합니다.
2. 대표 해부 1개를 골라 `featuredPickId`와 `featured`를 채웁니다.
3. 나머지 종목을 `recentItems`에 넣고 `market`, `movementLabel`, `theme`, `question`, `summary`, `relatedCompanies`를 정리합니다.
4. 상세 Pick 페이지가 있으면 `pickId`를 넣고, 기업 해설만 있으면 `companyId`와 `target: 'analysis'`를 사용합니다.
5. 상세 페이지가 없으면 링크를 억지로 만들지 않고 `coming-soon` 또는 준비 중 상태로 둡니다.
6. `marketMapItems`에는 실제 연결이 있는 산업만 `active`와 `href`를 넣고, 준비 중 항목은 `status: 'coming-soon'`만 둡니다.
7. 숫자 3개는 SEC/OpenDART, 회사 IR, 공시 원문처럼 확인 가능한 기준으로만 고릅니다.

### 운영 예시: 2026년 5월 마지막 주

- 이번 주 종목은 Dell, Snowflake, Micron입니다.
- 핵심 흐름은 `AI 인프라가 서버, 데이터, 메모리로 넓어지는 흐름`입니다.
- 대표 해부는 Dell 후속 Pick `pick-dell-ai-server-earnings-check`로 둡니다.
- Snowflake는 AI 데이터 플랫폼 흐름 Pick `/ko/picks/pick-snowflake-ai-data-platform`으로 연결합니다.
- Snowflake의 가이던스/컨센서스는 자동 연결하지 않고, 숫자는 다음 단계에서 공식 자료 기준으로만 연결합니다.
- Micron처럼 기존 기업 해설과 재무 쉽게 보기가 있는 종목은 `companyId`와 `target: 'analysis'`로 기존 분석 페이지에 연결합니다.

### 참고 자료 반영 원칙

- Threads, 인스타그램 카드뉴스, 유튜브 영상은 참고하되 그대로 복사하지 않습니다.
- 가져올 것은 정보 구조, 섹터 분류, 밸류체인 흐름, 쉬운 설명 방식입니다.
- 걸러낼 것은 과도한 티커 나열, 매수/매도 추천, 점수/랭킹, 출처가 불명확한 숫자입니다.
- 모든 외부 참고 내용은 주가해부실식으로 `무슨 일 -> 왜 이 회사 -> 같이 볼 회사 -> 숫자 3개` 구조로 재해석합니다.

### Pick 상세 데이터가 필요한 경우

홈에 노출할 항목이 실제 Pick 상세 페이지로 이어져야 한다면 `stockAutopsyPicks`의 상세 데이터도 함께 관리합니다. 이때도 홈 운영의 기준은 `currentWeeklyDigest`이며, 상세 Pick은 대표 해부나 최근 해부에서 연결할 수 있는 원문 해설 데이터로 봅니다.

- `id`, `pickId`, `companyId`, `companyName`, `ticker`, `market`, `movementDirection`, `movementLabel`, `reasonSummary`, `beginnerSummary`, `publishedAt`, `status`를 실제 내용에 맞게 입력합니다.
- `flowId`, `flowLabel`, `flowStage`, `relatedSupplyChainId`, `relatedCompanyId`가 있으면 Pick 상세에서 시장 흐름 지도, 기업 해설, 재무 쉽게 보기로 연결됩니다.
- `connectedLeaders`와 `relatedCompanyIds`에는 대표 기업 3~5개만 넣고, 홈 기본 화면에는 최대 3개만 노출합니다.
- `watchMetrics`, `goodSignals`, `cautionSignals`는 실제 확인 포인트만 씁니다. 실제 값이 없으면 숫자를 만들지 않습니다.
- `sourceLinks`에는 DART, SEC, 회사 IR, 공식 보도자료, 신뢰 가능한 뉴스 원문처럼 확인 가능한 링크만 넣습니다.

## 그림책형 다크 프리미엄 UI 원칙

주가해부실은 금융 대시보드보다 시장 흐름을 쉽게 이해하는 학습형 UI를 지향합니다. 화면은 대한항공 기내 모니터처럼 깊은 네이비와 반투명 카드, 은은한 빛을 사용해 신뢰감과 몰입감을 주는 방향으로 발전시킵니다.

- 쉬운 말 먼저: 사용자가 바로 이해할 수 있는 질문과 한 줄 결론을 앞에 둡니다.
- 전문용어는 보조 배지: HBM, FCF, CAPEX 같은 용어는 작고 부담 없는 배지와 짧은 설명으로 처리합니다.
- 한 카드에 한 개념: 한 카드에는 하나의 질문, 하나의 흐름, 하나의 확인 포인트만 담습니다.
- 숫자는 마지막 확인: 공식 데이터는 유지하되, 초보자가 읽기 쉬운 순서로 `왜 봐야 하는 숫자인지`를 먼저 설명합니다.
- 더 깊게 보기는 접힘: 공시 원문, 13F, Form 4, 관계 출처, 고급 참고자료는 기본 화면에서 과도하게 튀지 않게 둡니다.
- 아이콘은 설명의 일부: lucide 아이콘을 단순 장식이 아니라 개념을 기억하게 돕는 그림책형 단서로 사용합니다.
- 다크 프리미엄 톤: 딥 네이비, 글래스 카드, 스카이블루/보라/민트 포인트는 금융 정보의 신뢰감과 학습 몰입을 위한 시각 언어입니다.
- 다크 프리미엄 UI는 단순 장식이 아니라 복잡한 시장 정보를 카드뉴스처럼 몰입해서 읽게 하기 위한 시각 언어입니다.
- 아이콘은 장식이 아니라 초보자가 `AI`, `서버`, `HBM`, `전력`, `공시`, `숫자` 개념을 빠르게 구분하도록 돕는 시각 단서입니다.
- 다크 프리미엄 UI에서는 시각적 분위기보다 읽기 쉬움이 우선입니다. 본문은 거의 흰색, 보조 설명은 밝은 blue-gray, 비활성 텍스트도 `#64748B`보다 어둡지 않게 관리합니다.
- 실제 화면 QA에서 텍스트가 묻히면 토큰만 믿지 않고 해당 클래스의 색상과 배경을 직접 보정합니다. 설명문은 opacity로 흐리게 만들지 않고 명시 색상을 사용합니다.
- 핵심 설명에는 `line-clamp`와 과한 말줄임을 쓰지 않습니다. 필요한 경우 실제 390px, 768px, 1440px 화면에서 잘림 여부를 확인한 뒤 보정합니다.
- 한국어 가독성은 `"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Noto Sans KR", "Segoe UI", sans-serif` 순서의 시스템 중심 font stack을 기본으로 합니다.
- 숫자 데이터는 `tabular-nums`를 적용해 매출, 이익, 현금흐름처럼 비교해야 하는 값을 흔들리지 않게 읽도록 합니다.
- 현재 아이콘은 `lucide-react` 중심으로 사용합니다. 설치된 `lucide-react` 패키지의 라이선스는 ISC입니다.
- 외부 무료 이미지나 아이콘은 라이선스 확인 전 사용하지 않습니다. 향후 필요하면 Phosphor Icons(MIT), Tabler Icons(MIT 계열), Simple Icons(CC0, 브랜드 보조용)처럼 라이선스가 명확한 후보만 검토합니다.

## 데이터 주의사항

내장 데이터는 투자 검토용 후보군입니다. 기업명은 실제 기업명을 사용했지만, 특정 고객사에 대한 납품 관계를 확정한 데이터가 아닙니다. 실제 서비스로 확장할 때는 OpenDART, KRX, SEC EDGAR, 회사 IR, 공급계약 공시, 뉴스 원문처럼 무료 공식·공개 자료로 관계를 검증해야 합니다.

## 기업 관계 지도 데이터 필드

기업 카드의 첫 화면은 `businessSummary`, `mainProducts`, `valueChainStage`, `mainCustomers`, `customerExposure`, `revenueExposure`, `moat`, `moatExplanation`, `investorWatchPoint`, `relationshipType`, `relationshipConfidence`, `sourceNotes`를 우선 사용합니다. 공식 공시·IR로 확인되지 않은 고객별 매출 비중은 숫자로 표시하지 않고 “미공개 / 확인 필요”로 표시합니다.

사용자 화면의 기본 용어는 유지하되 짧은 설명을 같이 붙입니다.

- 경제적 해자: 경쟁사가 쉽게 따라오기 어려운 이유
- 고객 의존도: 매출이 특정 고객에게 얼마나 기대는지
- 병목 기업: 없으면 산업 흐름이 막힐 수 있는 핵심 기업
- 밸류체인: 제품이 만들어지고 팔리기까지의 연결 구조

상장기업은 주가, 재무제표, 공시 원문, 기관 보유 보고를 연결하는 메인 분석 대상으로 표시합니다. 비상장 또는 공시 확인이 어려운 기업은 삭제하지 않고 “비상장 참고 기업 / 관계 참고용” 보조 노드로 유지하며, 출처 없는 매출·영업이익률·부채비율은 공식 숫자처럼 노출하지 않습니다.

## AI 반도체 & 데이터센터 콘텐츠 원칙

이 대표 섹터의 기본 흐름은 초보자 화면에서는 `AI 수요 -> AI 칩 -> HBM -> 파운드리 -> 장비/전력` 5단계로 압축합니다. 기본 화면은 Microsoft, Google, NVIDIA, Broadcom, SK하이닉스, 삼성전자, TSMC, ASML, Vertiv처럼 흐름을 이해하는 데 필요한 핵심 기업 8~10개만 먼저 보여주고, AMD, Micron, 한미반도체, 리노공업, ISC, 원익IPS, Super Micro, Dell, Arista, Eaton 등은 한국 관련주, 전체 관계, 공급망 참고에서 확인합니다.

한국 관련 상장기업은 비상장 참고 노드와 분리합니다. SK하이닉스, 삼성전자, 한미반도체, 리노공업, ISC, 원익IPS, 솔브레인, 주성엔지니어링, DB하이텍, 하나마이크론처럼 거래 가능한 기업은 시장/ticker와 원문 보고서 상태를 표시하고, 비상장/공시 확인 어려움으로 뭉뚱그리지 않습니다.

관계 확실성은 `공식 확인`, `공시·IR 기준`, `산업상 관련`, `검증 필요`로 유지합니다. 직접 납품, 독점 공급, 고객별 매출 비중은 공식 출처가 있을 때만 쓰고, 확인되지 않은 경우에는 “수요 연결”, “같은 흐름에서 함께 볼 기업”, “고객별 매출 비중 미공개”로 표시합니다.

경제적 해자는 단어 설명이 아니라 각 기업의 실제 경쟁력으로 작성합니다. 예를 들어 NVIDIA는 GPU와 CUDA 생태계, TSMC는 첨단 공정 생산 경험과 고객 신뢰, ASML은 EUV 장비 기술, SK하이닉스는 HBM 양산 경험처럼 해당 기업이 쉽게 대체되기 어려운 이유를 1~2문장으로 설명합니다.

원문 보고서 링크는 확실한 DART `rcpNo` 또는 SEC accession/primary document가 있을 때만 `direct`로 표시합니다. 확실하지 않은 기업은 `search-only` 또는 `needs-link` 상태를 유지하고, 가짜 원문 링크는 넣지 않습니다.

## 시장 흐름 지도 MVP 원칙

시장 흐름 지도는 전체 기업 관계 데이터베이스가 아니라 초보자용 학습 지도입니다. 기본 화면은 `AI 수요 -> AI 칩 -> HBM -> 파운드리 -> 장비/전력` 5단계 핵심 흐름으로 보여주고, 기본 노출 기업은 8~10개 이내로 제한합니다.

한국/미국은 별도 섹터가 아니라 같은 흐름 안의 필터입니다. 한국 관련주, 전체 관계, 출처 보기, 공급망 참고는 보조 보기로 두고, 비상장/공급망 참고 기업은 기본 지도에서 숨깁니다.

지도 연결선은 최소화하고 흐름 이해를 우선합니다. 기업 노드에는 기업명, 역할, 단계만 먼저 보여주며 가격 상세, 13F/Form4, 전체 공시, 전체 재무지표는 기업 해설이나 고급 참고자료로 이동시킵니다.

관계지도 기본 화면은 ReactFlow 그래프가 아니라 선택 기업 중심 카드 탐색입니다. 사용자는 5단계 탭으로 흐름을 잡고, 기업을 클릭하면 `이전 단계 기업 -> 선택 기업 -> 직접 연결 기업 3개`를 넘겨보듯 확인합니다. 전체 관계 그래프는 고급 보기로 유지하며, 기본값은 전체 축소가 아니라 선택 기업 중심 확대입니다.

## 기업 해설 MVP 원칙

기업 해설은 긴 리서치 페이지가 아니라 초보자용 기업 설명서입니다. 첫 화면은 10초 안에 `무엇을 파는 회사인지`, `누구의 수요와 연결되는지`, `경제적 해자`, `먼저 볼 지표 3개`, `같이 볼 기업 3개`를 이해할 수 있어야 합니다.

가격, 공시 원문, 관계 출처, 기관 동향, 13F/Form4, 전체 재무지표는 보조 정보입니다. 기본 화면에는 해석을 먼저 보여주고, 고급 정보는 접힌 참고자료나 더 깊게 보기로 이동시킵니다.

기업 해설 첫 화면은 `한 줄 결론`, `쉽게 말하면`, `그래서 뭘 볼까?` 3카드를 가장 먼저 보여줍니다. 설명 카드는 `무엇을 파는 회사인가`, `누구의 수요와 연결되는가`, `경제적 해자`, `투자자가 볼 포인트` 4개만 우선 노출하고, 재무지표와 같이 볼 기업은 각각 3개만 먼저 보여줍니다.

## 재무 쉽게 보기 MVP 원칙

재무 쉽게 보기는 전체 재무제표를 펼쳐놓는 화면이 아니라 `숫자 3개 먼저 보기` 화면입니다. 산업별로 먼저 볼 지표를 다르게 보여주고, 값이 없으면 가짜 숫자 대신 `공식 데이터 연결 필요`처럼 표시합니다.

오래된 데이터나 직전 보고서 기준 데이터는 기준 보고서, 공시일, 데이터 상태를 함께 보여줍니다. PER, EPS, PBR, ROE, FCF, CAPEX, 원문 보고서, MD&A, 전체 공시와 기관 동향은 더보기/고급 참고자료로 둡니다.

## 재무 쉽게 보기 v2 사전 조사

이번 조사는 실제 UI, API, data fetching 구현 없이 문서로만 정리합니다. 조사 대상은 `api/financials.ts`, `src/services/financials.ts`, `src/App.tsx`의 재무 카드 렌더링, `src/data.ts`의 financial 관련 필드, README의 재무/데이터 설명입니다.

### 현재 재무 데이터 흐름

- `/api/financials`는 미국 기업이면 `SEC_USER_AGENT + cik`로 SEC CompanyFacts를 조회하고, 한국 기업이면 `OPENDART_API_KEY + corpCode`로 OpenDART `fnlttSinglAcntAll`을 조회합니다.
- US 매출, 영업이익, 영업현금흐름은 `SEC_CONCEPTS`의 `RevenueFromContractWithCustomerExcludingAssessedTax`, `Revenues`, `SalesRevenueNet`, `OperatingIncomeLoss`, `NetCashProvidedByUsedInOperatingActivities`에서 최신 `10-Q` 또는 `10-K` fact 하나를 고릅니다.
- US EPS는 `EarningsPerShareDiluted`, `EarningsPerShareBasic`에서 fact 하나를 고르지만, 기본 3개 카드가 아니라 고급 지표 영역에서만 후보로 쓰입니다.
- KR 매출, 영업이익, 영업현금흐름은 OpenDART 행의 `account_nm` alias를 `매출액`, `영업이익`, `영업활동현금흐름` 등으로 매칭하고 `thstrm_amount`만 숫자로 파싱합니다.
- KR 조회 순서는 최근 연도부터 `11014` 3분기, `11012` 반기, `11013` 1분기, `11011` 사업보고서 순서이며, 연결재무제표 `CFS`를 먼저 보고 없으면 `OFS`를 봅니다.
- `src/services/financials.ts`는 `/api/financials` 응답의 `metrics`를 `FinancialStatementSummary.metrics` 배열로 바꾸고, `sourceStatus`가 `direct` 또는 `partial`일 때만 `api-live`로 사용합니다.
- `src/App.tsx`는 `fetchFinancialsByCompany(company)` 결과를 `financialSummary`로 저장한 뒤 `connectFinancialPriorityMetrics`를 통해 기본 카드 3개를 매출, 영업이익, 현금흐름 중심으로 치환합니다.
- 기본 질문형 카드는 현재 `얼마나 팔았나요?`, `팔고 돈이 남았나요?`, `현금이 들어왔나요?` 3개입니다.
- `src/data.ts`의 fallback 필드는 `revenue`, `revenueUnit`, `revenueBasis`, `growthBasis`, `opMargin`, `debtRatio`, `corpCode`, `cik`, `fiscalYear`, `fiscalPeriod`, `filingDate`처럼 문자열 중심입니다. fallback은 기간 비교 계산에 쓰면 안 됩니다.

### 재무 API 연결 누락 기업 조사표

2026-06-01 코드 기준 조사입니다. 배포 URL 직접 호출은 JSON 대신 HTML이 섞여 나온 이력이 있어, 아래 판단은 `src/data.ts`의 식별자, `src/services/financials.ts`의 호출 조건, `api/financials.ts`의 지표 선택 조건, `src/App.tsx`의 렌더링 조건만 기준으로 합니다. API key 또는 env 값은 기록하지 않습니다.

| companyId | 회사명 | country | cik 또는 corpCode 존재 여부 | API 호출 가능 여부 | 현재 숫자 표시 여부 | 원인 | 다음 조치 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `us-semiconductors-nvidia` | NVIDIA | US | 있음 | 가능 | 조건부 표시 | CIK가 있어 `/api/financials`에 `cik`가 전달되고, 10-K/10-Q fact 선택 대상입니다. 응답 `sourceStatus`가 `direct` 또는 `partial`일 때만 `api-live` 숫자가 표시됩니다. | 배포 `/api/financials`가 JSON으로 안정 응답하는지 라우팅과 환경 상태를 별도 확인합니다. |
| `ai-datacenter-dell` | Dell | US | 있음 | 가능 | 조건부 표시 | CIK가 있고 보고서 타입이 10-K라 현재 SEC 선택 로직 대상입니다. 응답이 실패하거나 `direct/partial`이 아니면 fallback이 유지됩니다. | 배포 API JSON 응답과 SEC 응답 상태를 확인합니다. |
| `ai-datacenter-micron` | Micron | US | 있음 | 가능 | 조건부 표시 | CIK가 있고 보고서 타입이 10-Q라 현재 SEC 선택 로직 대상입니다. | 배포 API JSON 응답과 SEC 응답 상태를 확인합니다. |
| `ai-datacenter-sk-hynix` | SK하이닉스 | KR | 있음 | 가능 | 조건부 표시 | corpCode가 있어 OpenDART 호출 조건을 통과합니다. OpenDART 계정 alias가 매출, 영업이익, 순이익, 영업현금흐름 중 일부를 찾으면 `direct/partial`로 표시됩니다. | 회사별 OpenDART 계정 매핑을 점검합니다. |
| `ai-datacenter-microsoft` | Microsoft | US | 있음 | 가능 | 조건부 표시 | CIK가 있고 보고서 타입이 10-Q라 현재 SEC 선택 로직 대상입니다. | 배포 API JSON 응답과 SEC 응답 상태를 확인합니다. |
| `ai-datacenter-google` | Google / Alphabet | US | 있음 | 가능 | 조건부 표시 | CIK가 있고 보고서 타입이 10-Q라 현재 SEC 선택 로직 대상입니다. | 배포 API JSON 응답과 SEC 응답 상태를 확인합니다. |
| `ai-datacenter-broadcom` | Broadcom | US | 있음 | 가능 | 조건부 표시 | CIK가 있고 보고서 타입이 10-Q라 현재 SEC 선택 로직 대상입니다. | 배포 API JSON 응답과 SEC 응답 상태를 확인합니다. |
| `ai-datacenter-amd` | AMD | US | 있음 | 가능 | 조건부 표시 | SEC EDGAR에서 Advanced Micro Devices Inc.의 CIK가 `0000002488`로 확인되어 실제 라우팅 `companyId`에 `cik: '2488'`을 보강했습니다. 응답 `sourceStatus`가 `direct` 또는 `partial`일 때만 `api-live` 숫자가 표시됩니다. | 배포 API JSON 응답과 SEC 응답 상태를 확인합니다. TSMC/ASML 20-F 지원은 별도 후속 작업으로 둡니다. |
| `ai-datacenter-supermicro` | Super Micro | US | 있음 | 가능 | 조건부 표시 | CIK가 있고 보고서 타입이 10-Q라 현재 SEC 선택 로직 대상입니다. | 배포 API JSON 응답과 SEC 응답 상태를 확인합니다. |
| `ai-datacenter-tsmc` | TSMC | US | 있음 | 가능 | 아니오 | CIK는 있으나 데이터의 보고서 타입이 20-F입니다. 현재 `api/financials.ts`의 `rankedFacts`는 10-Q/10-K만 선택해 20-F fact를 지표 후보에서 제외합니다. | 외국기업 20-F/6-K fact 선택 지원 여부를 별도 설계하고 검증합니다. |
| `ai-datacenter-asml` | ASML | US | 있음 | 가능 | 아니오 | CIK는 있으나 데이터의 보고서 타입이 20-F입니다. 현재 SEC 선택 로직이 10-Q/10-K만 허용합니다. | 외국기업 20-F/6-K fact 선택 지원 여부를 별도 설계하고 검증합니다. |
| `ai-datacenter-vertiv` | Vertiv | US | 있음 | 가능 | 조건부 표시 | CIK가 있고 보고서 타입이 10-Q라 현재 SEC 선택 로직 대상입니다. | 배포 API JSON 응답과 SEC 응답 상태를 확인합니다. |
| `ai-datacenter-samsung` | 삼성전자 | KR | 있음 | 가능 | 조건부 표시 | corpCode가 있어 OpenDART 호출 조건을 통과합니다. OpenDART 계정 alias가 주요 항목을 찾으면 `direct/partial`로 표시됩니다. | 회사별 OpenDART 계정 매핑을 점검합니다. |

### TSMC/ASML 20-F 재무 연결 조사

2026-06-02 코드와 SEC CompanyFacts 원문 기준 사전 조사 및 1차 구현 기록입니다. API key 또는 env 값은 기록하지 않습니다.

#### 1차 구현 결과

- `api/financials.ts`는 `ai-datacenter-tsmc`에만 `ifrs-full` 20-F annual selector를 적용하고, TWD 단위 fact만 선택합니다.
- `api/financials.ts`는 `ai-datacenter-asml`에만 `us-gaap` 20-F annual selector를 적용하고, EUR 단위 fact만 선택합니다.
- 프론트는 20-F 응답의 통화를 USD로 가정하지 않고 TWD/EUR로 표시하며, source note는 `SEC 20-F 원문 기준`으로 분리합니다.
- TSMC/ASML 20-F 응답은 YoY/QoQ comparison을 반환하지 않아 보조 비교 문구가 숨겨집니다.
- selector로 확정되지 않는 metric은 `null`로 유지해 기존 fallback/`공식 데이터 연결 필요` 표시를 유지합니다.

#### 현재 문제 요약

- `api/financials.ts`는 US 기업에서 `SEC_USER_AGENT + cik`로 SEC CompanyFacts를 조회한 뒤 `payload.facts?.['us-gaap']`만 읽습니다.
- 현재 `rankedFacts`는 유효 숫자 fact 중 `form === '10-Q' || form === '10-K'`만 통과시킵니다. `20-F`, `20-F/A`, `6-K`는 후보에서 제외됩니다.
- `formRank`는 10-Q를 10-K보다 먼저 두고, 같은 form 안에서는 `filed`, `end` 최신순으로 고릅니다. 별도 annual/quarterly/TTM 모드는 없습니다.
- fiscal period는 선택된 fact의 `fy`, `fp`, `filed`, `form`을 그대로 응답의 `fiscalYear`, `fiscalPeriod`, `asOf`, `reportType`에 씁니다.
- US 매출/영업이익/영업현금흐름 후보는 현재 `SEC_CONCEPTS` 기준으로 `RevenueFromContractWithCustomerExcludingAssessedTax`, `Revenues`, `SalesRevenueNet`, `OperatingIncomeLoss`, `NetCashProvidedByUsedInOperatingActivities`입니다.
- comparison은 서버에서 같은 concept의 과거 fact를 다시 찾아 계산합니다. YoY는 같은 `form`, 같은 `fp`, 직전 `fy`, 기간 길이 ±10일 이내일 때만 계산하고, QoQ는 선택 fact가 `10-Q`이고 `fp`가 Q2 또는 Q3일 때 직전 분기만 찾습니다. 20-F용 comparison 규칙은 없습니다.

#### 기업별 현황표

| companyId | 회사명 | country | CIK 존재 여부 | 현재 `/api/financials` 호출 가능 여부 | 현재 숫자가 안 뜨는 이유 | SEC CompanyFacts 20-F annual facts | revenue 후보 tag | operating income 후보 tag | operating cash flow 후보 tag | EPS 참고 tag | 연결 시 주의점 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `ai-datacenter-tsmc` | TSMC | US | 있음 | URL 구성 가능 | 코드상 CIK는 있어 호출 조건은 통과하지만, SEC 원문 taxonomy가 `ifrs-full` 중심입니다. 현재 API는 `facts['us-gaap']`만 읽고, `rankedFacts`도 20-F/6-K를 제외해 선택 가능한 metric이 없습니다. | 있음. `ifrs-full`에 20-F 기반 annual fact가 있고 6-K fact도 섞여 있습니다. | `ifrs-full:Revenue`, `ifrs-full:RevenueFromContractsWithCustomers` | `ifrs-full:ProfitLossFromOperatingActivities` | `ifrs-full:CashFlowsFromUsedInOperatingActivities` | `ifrs-full:DilutedEarningsLossPerShare`, `ifrs-full:BasicEarningsLossPerShare` | TWD와 USD 단위가 함께 보일 수 있어 표시 통화 기준을 명확히 해야 합니다. 20-F annual만 1차 표시하고, 6-K와 comparison은 제외하는 편이 안전합니다. |
| `ai-datacenter-asml` | ASML | US | 있음 | URL 구성 가능 | 코드상 CIK는 있어 호출 조건은 통과하지만, SEC CompanyFacts의 주요 fact가 20-F입니다. 현재 `rankedFacts`가 10-Q/10-K만 허용해 20-F fact를 모두 제외합니다. | 있음. `us-gaap`에 20-F 기반 annual fact가 있습니다. | `us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax`, 과거 후보 `us-gaap:SalesRevenueNet` | `us-gaap:OperatingIncomeLoss` | `us-gaap:NetCashProvidedByUsedInOperatingActivities` | `us-gaap:EarningsPerShareDiluted`, `us-gaap:EarningsPerShareBasic` | EUR 단위입니다. 20-F/A 과거 fact와 최신 20-F를 섞지 않도록 form과 filed 기준을 별도로 검증해야 합니다. comparison은 처음에는 숨기는 편이 안전합니다. |

#### 20-F 지원 위험 요소

- 20-F는 보통 연간 보고서입니다. 10-Q 분기 fact나 6-K 중간 보고 fact와 섞어 분기 비교처럼 표시하면 오해가 큽니다.
- 10-K/10-Q와 form 기준이 달라 기존 YoY/QoQ 계산을 그대로 붙이면 안 됩니다. 특히 QoQ는 20-F에는 적용하지 않습니다.
- foreign private issuer는 IFRS taxonomy를 쓸 수 있습니다. TSMC는 `ifrs-full` 후보가 필요하므로 `us-gaap` form 필터만 늘리는 구현으로는 부족합니다.
- ADR/외국기업은 통화와 회계 기준 확인이 필요합니다. TSMC는 TWD/USD, ASML은 EUR 단위가 확인되므로 화면에 통화와 `SEC 20-F 원문 기준`을 분명히 표시해야 합니다.
- operating income tag가 미국 기업의 `OperatingIncomeLoss`와 다를 수 있습니다. TSMC는 `ProfitLossFromOperatingActivities` 후보를 별도 매핑해야 합니다.
- operating cash flow tag가 없거나 다른 tag일 수 있습니다. TSMC는 `CashFlowsFromUsedInOperatingActivities` 후보를 별도 매핑해야 합니다.
- comparison은 처음에는 숨기는 것이 안전합니다. 20-F annual 값과 10-K/10-Q, 6-K 값을 같은 comparison 로직에서 섞지 않습니다.

#### 추천 구현 순서

1. `api/financials.ts`에 구현하기 전, TSMC/ASML만 대상으로 SEC CompanyFacts fixture 또는 dry-run audit을 만들고 taxonomy, concept, unit, form, fp, filed를 표로 확인합니다.
2. 1차 구현은 TSMC/ASML의 최신 annual 20-F 값만 표시합니다. 표시 대상은 매출, 영업이익, 영업현금흐름 중 확실히 매핑된 항목만 둡니다.
3. TSMC는 `ifrs-full` 전용 후보 tag를 별도 매핑하고, ASML은 기존 `us-gaap` 후보에 20-F form 허용을 별도 조건으로 붙입니다.
4. 응답 `reportType` 또는 source label에 `SEC 20-F 원문 기준`을 명시합니다. 통화는 fact unit 기준으로 표시하고, USD로 임의 환산하지 않습니다.
5. `sourceStatus`는 기존처럼 `direct` 또는 `partial` 기준을 유지하되, 불확실한 metric은 null/fallback으로 둡니다.
6. comparison YoY/QoQ는 1차 구현에서 반환하지 않습니다. 이후 annual 20-F끼리 같은 taxonomy, concept, unit, 기간 길이, fiscal year가 맞는 경우에만 별도 후속 작업으로 검토합니다.

#### 구현하지 말아야 할 것

- 20-F와 10-Q/10-K 또는 6-K를 같은 `rankedFacts` 우선순위 안에서 섞어 자동 선택하지 않습니다.
- TSMC `ifrs-full` 값을 `us-gaap`처럼 가장하거나, tag 이름이 비슷하다는 이유만으로 가짜 metric mapping을 만들지 않습니다.
- 통화 환산, TTM, QoQ, 컨센서스/가이던스, 가격 API 연결을 함께 추가하지 않습니다.
- EPS는 참고 후보로만 두고, 기본 3개 숫자 카드에 바로 넣지 않습니다.
- 값이 불확실하면 `partial`로 억지 표시하지 말고 기존 fallback을 유지합니다.

#### 다음 단계 요청문 참고 원칙

- 요청 범위는 `TSMC/ASML annual 20-F 최신값 표시`로 제한합니다.
- `api/financials.ts`에서 20-F 전용 selector를 기존 10-K/10-Q selector와 분리해 구현하도록 요구합니다.
- TSMC는 `ifrs-full` taxonomy 지원이 필수이고, ASML은 `us-gaap` 20-F 허용이 핵심이라는 차이를 명시합니다.
- 첫 배포 QA는 `/ko/analysis/ai-datacenter-tsmc#financial-easy-view`, `/ko/analysis/ai-datacenter-asml#financial-easy-view`, 기존 NVIDIA/Dell/Micron/AMD 회귀를 함께 확인합니다.
- 성공 기준은 숫자 표시 자체가 아니라 `SEC 20-F 원문 기준`, 통화, fallback, comparison 미표시가 모두 안전하게 동작하는지입니다.

### 현재 가능한 것과 빠진 것

- 현재 코드만으로 안정적으로 표시 가능한 값은 최신 또는 선택된 단일 기간의 `매출`, `영업이익`, `영업현금흐름`입니다. US는 `SEC CompanyFacts`, KR은 `OpenDART` 연결 상태가 `direct` 또는 `partial`일 때만 공식 숫자로 봅니다.
- US CompanyFacts 원천 payload에는 concept별 여러 기간 fact가 있으므로 period별 이전 값 접근은 원천상 가능합니다. 하지만 현재 `selectMetric`이 최신 fact 하나만 골라 응답하고 나머지 기간 배열을 버리므로 프론트는 이전 값에 접근할 수 없습니다.
- KR OpenDART도 `bsns_year`, `reprt_code`, `fs_div` 조합으로 이전 분기나 전년 동기 보고서를 다시 조회할 수 있습니다. 다만 현재 API 응답은 최신으로 선택된 보고서의 `thstrm_amount`만 반환하고, `frmtrm_amount`, `frmtrm_q_amount`, `thstrm_add_amount` 같은 비교 후보 필드는 사용하지 않습니다.
- 현재 `/api/financials` 응답에는 전년 대비, 전분기 대비 계산에 필요한 `priorYear`, `priorQuarter`, `periodStart`, `periodEnd`, `duration`, `frame`, `accountId`, `concept`, `unit` 묶음이 없습니다.
- YoY/QoQ를 구현하려면 API 응답을 `metric -> current/priorYear/priorQuarter/comparison` 형태로 확장해야 합니다. UI에서 직접 raw array를 재계산하지 말고 서버리스 API에서 기간 정합성을 먼저 검증해야 합니다.
- fallback financials는 `src/data.ts`의 스크리닝/문구형 값입니다. direct financials는 `/api/financials`가 공식 원천에서 가져온 numeric 값입니다. fallback 값으로 YoY/QoQ, EPS 성장률, 컨센서스 대비를 계산하지 않습니다.
- SK하이닉스 같은 KR 기업은 `corpCode`는 있으나 계정 매핑이 더 필요합니다. 우선 `account_id`가 있으면 `account_nm`보다 우선하고, 매출, 영업이익, 영업활동현금흐름, 기본/희석 EPS, CAPEX 후보를 회사별로 audit해야 합니다. 분기 현금흐름은 누적과 단일 분기 금액이 섞일 수 있으므로 `reprt_code`와 금액 필드를 함께 저장해야 합니다.

### 비교 지표 가능성

| 지표 | 판단 | 필요한 데이터 | 예상 난이도 | 주의점 |
| --- | --- | --- | --- | --- |
| 매출 YoY | API 확장 필요 | 현재 매출, 전년 동기 매출, 같은 회계기간 식별자 | 중 | US는 `fp/form`만 믿지 말고 기간 길이를 맞춥니다. KR은 같은 `reprt_code`와 `CFS/OFS` 기준을 맞춥니다. |
| 영업이익 YoY | API 확장 필요 | 현재 영업이익, 전년 동기 영업이익 | 중 | 적자 전환/흑자 전환은 퍼센트 대신 금액 변화와 상태 문구가 더 안전합니다. |
| 영업현금흐름 YoY | API 확장 필요 | 현재 OCF, 전년 동기 OCF, 현금흐름표 기간 기준 | 중상 | KR 반기/3분기 현금흐름은 누적 값일 수 있어 단일 분기처럼 표현하면 안 됩니다. |
| EPS YoY | API 확장 필요 | 현재 EPS, 전년 동기 EPS, basic/diluted 구분 | 중상 | US는 SEC EPS fact 후보가 있으나 KR은 EPS 계정 매핑을 추가해야 합니다. 조정 EPS와 GAAP EPS를 섞지 않습니다. |
| 매출 QoQ | API 확장 필요 | 현재 분기 매출, 직전 분기 매출, 보고서 기간 길이 | 중상 | 10-K/FY와 10-Q를 직접 비교하지 않습니다. Q4는 FY에서 9개월 누적을 빼야 하는 경우가 있어 보수적으로 처리합니다. |
| 영업이익 QoQ | API 확장 필요 | 현재 분기 영업이익, 직전 분기 영업이익 | 중상 | 계절성과 일회성 비용이 크면 단순 증감률보다 상태 문구가 필요합니다. |
| 영업현금흐름 QoQ | API 확장 필요 | 현재 분기 OCF, 직전 분기 OCF 또는 누적값 차감 로직 | 높음 | 현금흐름은 누적 보고가 많아 QoQ 계산을 가장 늦게 연결합니다. |
| EPS QoQ | API 확장 필요 | 현재 EPS, 직전 분기 EPS, basic/diluted 구분 | 높음 | 분기 EPS, 연간 EPS, 조정 EPS가 섞이면 오해가 커서 고급 보기 후보입니다. |
| EPS 실제값 | 현재 코드만으로 부분 가능 | US SEC EPS fact 또는 KR EPS 계정 | 중 | US는 고급 지표 후보로 이미 매핑되어 있습니다. KR은 기본/희석 EPS 계정 매핑 전까지 표시하지 않습니다. |
| 매출 컨센서스 대비 | 외부 API 필요 | 실제 매출, revenue estimate consensus, period | 중상 | 공식 공시 원문에는 애널리스트 컨센서스가 없습니다. 출처와 기준일을 반드시 표시합니다. |
| EPS 컨센서스 대비 | 외부 API 필요 | 실제 EPS, EPS estimate consensus, period | 중상 | GAAP EPS, non-GAAP EPS, adjusted EPS 구분이 핵심입니다. |
| 다음 분기 가이던스 | 비추천 | 회사 IR, 실적 발표자료, 8-K/press release의 guidance 문구 | 높음 | 구조화 API보다 공식 IR/보도자료를 수동 또는 별도 파이프라인으로 검증하는 편이 안전합니다. |
| 연간 가이던스 | 비추천 | 회사 IR, earnings release, conference call transcript | 높음 | 회사가 숫자 범위를 제시하지 않으면 만들지 않습니다. 매수/매도 신호처럼 보이지 않게 `회사 제시 전망`으로만 둡니다. |

### 데이터 소스 후보

현재 `.env.example`에는 `OPENDART_API_KEY`, `SEC_USER_AGENT`, Supabase, Cron, 가격 import 관련 변수만 있습니다. FMP, Finnhub, Alpha Vantage, Twelve Data, KIS용 키는 없고 이번 단계에서 새 env를 추가하지 않습니다.

| 후보 | 적합한 데이터 | 판단 | 무료/제한 메모 | 참고 |
| --- | --- | --- | --- | --- |
| SEC CompanyFacts | US quarterly/annual financials, EPS actual, 과거 기간 fact | 1차 공식 원천 | 무료 공식 API. `data.sec.gov`는 CORS를 지원하지 않으므로 서버리스에서 호출합니다. | https://www.sec.gov/search-filings/edgar-application-programming-interfaces |
| OpenDART | KR 정기보고서 재무제표, 계정별 원문 숫자 | 1차 공식 원천 | 무료 공식 API 키 필요. 정정 공시로 수치가 바뀔 수 있고 금융감독원은 정확성/완전성을 보장하지 않는다고 안내합니다. | https://opendart.fss.or.kr/guide/main.do?apiGrpCd=DS003 |
| FMP | quarterly financials, earnings calendar, EPS/revenue estimate, sector/industry comparison | 컨센서스/산업 비교 후보 | 공식 docs에 free plan 언급은 있으나 실제 한도와 재배포 조건은 확인 필요입니다. | https://site.financialmodelingprep.com/developer/docs |
| Finnhub | earnings calendar, EPS/revenue estimates, company fundamentals, peers | 컨센서스 후보 | estimates 계열은 premium 표시가 있어 무료 사용 가능 여부 확인 필요입니다. | https://finnhub.io/docs/api |
| Alpha Vantage | earnings history, earnings estimates, earnings calendar, income/cash flow statements | EPS/예상치 후보 | 무료 API key를 제공하지만 `EARNINGS_ESTIMATES`는 Trending 표시라 한도/요금 확인 필요입니다. | https://www.alphavantage.co/documentation/ |
| Twelve Data | earnings actual/estimate, earnings calendar, income statement, cash flow | 글로벌 보조 후보 | earnings/calendar는 Grow/Venture 이상으로 표시되어 기본 무료 후보로 보기는 어렵습니다. | https://twelvedata.com/docs/analysis/revenue-estimate |
| KIS | KR 가격, 재무비율, 추정실적, 종목정보 | 한국 보조 후보 | 계좌/인증과 시세정보 재배포 제한이 있어 공개 웹서비스 기본 데이터로 바로 쓰기 어렵습니다. | https://apiportal.koreainvestment.com/apiservice-category |
| 공식 IR/press release/8-K | guidance, management outlook | 가이던스 우선 후보 | 구조화 비용이 높아 자동화 전 수동 검증 또는 별도 큐레이션이 안전합니다. | 회사 IR, SEC 8-K, DART 공정공시 |

### 추천 구현 순서

1. 1차 구현: 현재 SEC/OpenDART 공식 데이터에서 같은 지표의 전년 동기와 직전 분기 후보를 API 응답에 추가합니다. 화면에는 `매출은 늘었나요?`, `돈은 더 남았나요?`, `현금은 들어왔나요?` 3개 카드만 유지하고 YoY/QoQ는 작은 보조 문구로만 표시합니다.
2. 2차 구현: EPS 실제값을 고급 보기에서 안정화합니다. US는 SEC `EarningsPerShareDiluted/Basic`, KR은 OpenDART EPS 계정 매핑 audit 후 연결합니다. 기본 카드로 올리기 전에는 `더 깊게 보기`에 둡니다.
3. 3차 구현: FMP, Finnhub, Alpha Vantage 중 하나를 골라 컨센서스 데이터 품질, 요금, 재배포 조건을 검토합니다. 실제 연결 전에는 `consensusSource`, `estimatePeriod`, `estimateType`, `analystCount`, `asOf` 필드를 설계합니다.
4. 4차 구현: 가이던스는 공식 IR/press release/8-K/DART 공정공시 기반 별도 데이터로 처리합니다. 자동 추출보다 운영자가 검증한 `회사 제시 전망` 카드로 시작합니다.

### API 응답 확장 초안

실제 구현 시 `/api/financials`는 기존 `metrics.revenue: number | null` 형태를 유지하면서, 새 필드는 별도 객체로 추가하는 방식이 안전합니다. 기존 화면을 깨지 않기 위해 v1 필드는 그대로 둡니다.

```ts
comparisonMetrics: {
  revenue?: {
    current: { value: number; fiscalYear: string; fiscalPeriod: string; unit: string; sourceTag: string };
    priorYear?: { value: number; fiscalYear: string; fiscalPeriod: string; sourceTag: string };
    priorQuarter?: { value: number; fiscalYear: string; fiscalPeriod: string; sourceTag: string };
    yoyPct?: number;
    qoqPct?: number;
    comparisonStatus: 'ready' | 'partial' | 'not-comparable';
    note: string;
  };
}
```

주의할 점:

- `sourceTag`에는 SEC concept 또는 OpenDART `account_id/account_nm`을 남깁니다.
- US는 `form`, `fp`, `fy`, `end`, `filed`, 기간 길이를 함께 저장합니다.
- KR은 `bsns_year`, `reprt_code`, `fs_div`, `sj_div`, `account_id`, `account_nm`, 사용한 금액 필드를 함께 저장합니다.
- 비교 대상이 없거나 기간이 맞지 않으면 퍼센트를 만들지 않고 `not-comparable`로 둡니다.

### 재무 쉽게 보기 v2 카드 초안

기본 화면은 계속 3개 카드만 유지합니다.

| 카드 질문 | 실제값 | 보조 비교 | 예상 대비 | 출처 note |
| --- | --- | --- | --- | --- |
| 매출은 늘었나요? | 매출 | YoY 우선, 가능하면 QoQ | 더 깊게 보기 | SEC/OpenDART 기준 보고서 |
| 돈은 더 남았나요? | 영업이익 | YoY 우선, 가능하면 QoQ | 더 깊게 보기 | 영업이익 계정 기준 |
| 현금은 들어왔나요? | 영업현금흐름 | YoY 우선, QoQ는 보수적으로 | 표시 보류 | 현금흐름표 기간 기준 |

더 깊게 보기 후보:

- `기대보다 잘했나요?`: EPS 실제값, EPS/매출 컨센서스 대비. 외부 API와 출처가 확인된 뒤에만 표시합니다.
- `다음엔 어떨까요?`: 다음 분기/연간 가이던스. 공식 IR/press release 기반 수동 검증부터 시작합니다.
- `비슷한 회사와 비교하면요?`: sector/industry/peer 비교. FMP/Finnhub/KIS 등 보조 데이터의 표본과 계산식을 표시합니다.

문구 원칙:

- `좋다/나쁘다`보다 `늘었나요?`, `남았나요?`, `들어왔나요?`, `기대보다 높았나요?`처럼 확인 질문으로 씁니다.
- `어닝 서프라이즈니까 매수`, `가이던스 상향이라 급등 예상` 같은 투자 추천 표현은 금지합니다.
- 숫자 과노출을 막기 위해 기본 카드에는 실제값 1개, 비교 문구 1개, 출처 note 1개만 둡니다.
- 컨센서스와 가이던스는 공식 원문 숫자가 아니라 기대치/전망이므로 기본 카드보다 고급 보기에서 시작합니다.

## MVP QA 원칙

핵심 사용자 동선은 `홈 -> Pick -> 시장 흐름 지도 -> 기업 해설 -> 숫자 3개 보기 -> 같이 볼 기업`입니다. 각 화면에는 다음 화면으로 가는 짧은 버튼을 둡니다: `해부 보기`, `지도에서 보기`, `기업 해설 보기`, `숫자 3개 보기`, `같이 볼 기업 보기`.

CTA 역할은 겹치지 않게 관리합니다. `기업 해설 보기`는 분석 페이지 상단으로 이동하고, `숫자 3개 보기`는 `#financial-easy-view` 앵커로 이동합니다. 같은 화면이나 같은 앵커로 가는 중복 CTA는 만들지 않으며, 분석/재무 페이지가 없는 Pick에는 가짜 CTA를 만들지 않습니다.

고급 정보는 삭제하지 않고 접힌 영역이나 보조 링크로 유지합니다. SEC 13F, Form 4, 기관 동향, 전체 공시 목록, 가격 상세, 공급망 참고, 관계 출처 전체, 전체 재무지표, MD&A 원문 상세, ReactFlow 전체 관계 지도는 기본 화면의 메인 콘텐츠처럼 노출하지 않습니다.

기업 해설과 재무 쉽게 보기에는 가능한 경우 `기준 보고서`, `공시일`, `데이터 상태`를 함께 표시합니다. 데이터가 없으면 `가격 확인 필요`, `공식 데이터 연결 필요`, `원문 확인 필요`처럼 솔직하게 표시하고, `undefined`, `null`, 깨진 이미지, 빈 링크가 보이지 않게 점검합니다.

모바일 QA는 홈 첫 화면 3초 이해, Pick 카드 1열, 시장 흐름 지도 카드형 탐색 우선, 기업 해설 3카드, 재무 숫자 3개, 버튼 크기, 불필요한 가로 스크롤, 세로로 깨지는 텍스트 여부를 기준으로 확인합니다.

## Vercel Node runtime

`package.json`에서 Vercel 런타임을 Node.js 20.x로 고정했습니다. 로컬도 Node 20.x를 권장합니다. Node 22/24로 실행하면 로컬 검증은 가능하지만, Vercel과 동일 조건을 보려면 Node 20에서 `npm ci && npm run build`를 확인하세요.

## TODO

- Vite 빌드 시 JS chunk가 500kB를 조금 넘을 수 있습니다. 현재는 기능 안정성이 우선이라 유지하며, 추후 `ReactFlow`와 분석 페이지를 `dynamic import`로 나누는 code splitting을 검토합니다.


## v2 확장 내용

- 국가: 한국 + 미국
- 국내 추가 섹터: 보험·금융지주, 은행·핀테크, 에너지·유틸리티
- 미국 추가 섹터: 반도체, AI·클라우드, EV·모빌리티, 에너지·전력망, 보험·금융, 은행·핀테크, 헬스케어·바이오, 항공우주·방산
- 기업 관계는 실제 납품 확정이 아니라 공시·감독기관·뉴스 원문으로 검증할 후보군으로 표시됩니다.
- 미국 검증 소스: SEC EDGAR, NAIC, FDIC, Federal Reserve, 회사 IR/10-K/10-Q/8-K.

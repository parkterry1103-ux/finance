# 기업 관계 지도 인텔리전스

한국·미국 산업 섹터별 중심 상장기업과 관계 후보 기업을 시각화하는 React Flow 대시보드입니다. 초보 투자자가 “무엇을 파는 회사인지”, “누구의 수요와 연결되는지”, “관계가 공식 확인됐는지”를 먼저 보고, 특정 고객·납품 관계는 단정하지 않도록 표시합니다.

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

주성엔지니어링, 한미반도체, 리노공업, ISC, 원익IPS, 솔브레인처럼 거래 가능한 협력기업은 `listed`, `ticker`, `market`, `filingSource`를 확인하고 가격/공시/재무제표 연결 대상으로 둡니다. 비상장 또는 공시 확인이 어려운 기업만 “비상장 참고 노드”로 표시합니다.

### 원문 보고서 링크 점검과 보강

원문 연결 상태를 점검:

```bash
npm run audit:filings
```

출력 항목:

- 전체 기업 수
- `direct`, `search-only`, `needs-link`, `private-company`, `no-public-filing` 기업 수
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

가짜 원문 링크는 넣지 않습니다. 상장 기업인데 링크가 없으면 `needs-link`, 비상장 또는 공개 보고 의무가 없으면 `private-company`/`no-public-filing`으로 구분합니다.

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

## 이번 주 해부 종목 업데이트 방법

`주가해부실 Pick`은 운영자가 매주 인스타그램 카드뉴스에 맞춰 `src/data.ts`의 `stockAutopsyPicks` 배열만 수정하면 됩니다.

1. 새 카드 추가: `id`, `companyName`, `ticker`, `movementDirection`, `movementLabel`, `reasonSummary`, `beginnerSummary`, `sector`, `valueChainPosition`, `connectedLeaders`, `relatedCompanies`, `publishedAt`을 입력합니다.
2. 기업 관계 지도 연결: 가능한 경우 `relatedSupplyChainId`와 `relatedCompanyId`를 넣습니다. 이 값이 있으면 상세 페이지에서 기업 관계 지도와 재무제표 해설로 바로 연결됩니다.
3. 삭제/교체: 이번 주에 노출하지 않을 카드는 배열에서 제거하거나 아래쪽으로 이동합니다.
4. 표현 주의: 직접 납품 관계가 확인되지 않은 기업은 “직접 납품”, “확정 수혜”라고 쓰지 말고 “같은 밸류체인에서 함께 볼 기업”으로 표현합니다.

필드 기준:

- 종목명: `companyName`
- 티커: `ticker`
- 상승/하락: `movementDirection`
- 왜 움직였나: `reasonSummary`
- 관련 섹터: `sector`
- 밸류체인 위치: `valueChainPosition`
- 연결 대장주: `connectedLeaders`
- 카드뉴스 발행일: `publishedAt`
- 상세 설명: `beginnerSummary`
- 기업 관계 지도 링크: `relatedSupplyChainId`

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

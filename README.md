# 중소형주 공급망 인텔리전스

한국·미국 산업 섹터별 기준 기업 3곳과 하청·협력 후보 기업을 시각화하는 React Flow 대시보드입니다. 기존 카테고리형 중소기업 노드를 실명 기업 중심으로 확장했고, 특정 원청 납품 관계는 단정하지 않도록 “검증 대상 협력 후보”로 표시합니다.

## 이번 버전 변경점

- 한국어 UI 중심으로 문구 정리
- 섹터 9개로 확장: 반도체, 자동차·미래차, 배터리·소재, 디스플레이·OLED, 조선·방산, 바이오·헬스케어, AI·데이터센터, 로봇·자동화, 화장품·소비재
- 섹터별 기준 기업 3개, 총 27개 앵커 구성
- 앵커별 1차 협력 기업 4개 + 하청·중소형 기업 12개 배치
- 총 459개 노드, 432개 협력·하청 기업 노드 생성
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
```

`src/data.ts`의 기업별 원문 링크 상태는 아래처럼 관리합니다.

- `sourceStatus: 'direct'`: `reportUrl`, `sourceDirectUrl`, `dartRcpNo`처럼 직접 원문으로 갈 수 있는 값이 있음
- `sourceStatus: 'search-only'`: 직접 원문은 없고 DART/SEC 검색 링크만 있음
- `sourceStatus: 'needs-link'`: 원문 URL을 추가해야 하는 상태

직접 링크가 없는 기업도 화면에서는 “원문 연결 필요” 또는 “검색으로 확인” 상태가 보이며, 기존 재무제표 해설과 MD&A/SEC 분석 텍스트는 삭제하지 않습니다.

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

### 수동 동기화

동기화 스크립트는 `.ts` 파일이지만 Node 20에서도 실행되도록 먼저 `.sync-build`에 JS로 컴파일한 뒤 실행합니다.

```bash
npm run sync:compile
npm run sync:financials
npm run sync:trades
npm run sync:prices
npm run audit:filings
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

13F는 분기 말 보유 현황이라 실제 매수·매도 시점과 다를 수 있습니다. 화면에서는 투자 권유가 아니라 공개 자료 기반 참고 정보로만 표시합니다.

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

국회의원 거래는 실제 거래일과 공개일이 다를 수 있습니다. “공개 자료 기준이며 실제 매매 시점과 차이가 있을 수 있습니다.” 문구를 유지합니다.

### 원문 보고서 링크 점검과 보강

원문 연결 상태를 점검:

```bash
npm run audit:filings
```

출력 항목:

- 전체 기업 수
- `direct`, `search-only`, `needs-link` 기업 수
- `needs-link` 기업 목록
- `companyId`, `companyName`, `market`, `ticker`
- 필요한 식별자: `dartCorpCode` 또는 `secCik`
- `sourceSearchUrl` 여부

OpenDART/SEC에서 가능한 원문 링크를 보강:

```bash
npm run sync:filing-links
```

- 한국 기업은 `corpCode + OPENDART_API_KEY`로 최신 분기보고서/반기보고서/사업보고서 `rcept_no`를 찾습니다.
- 미국 기업은 `cik`로 SEC submissions에서 최신 `10-K`/`10-Q`와 primary document를 찾습니다.
- 기존 `direct` 링크는 덮어쓰지 않습니다.
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

가짜 원문 링크는 넣지 않습니다. 확실하지 않으면 `search-only` 또는 `needs-link`로 유지합니다.

### 가격 데이터

유료 실시간 시세 API는 사용하지 않습니다. 무료·공개 데이터는 지연 시세이거나 장마감 기준일 수 있으므로 UI에 `지연 가능`, `장마감 종가`, `가격 준비 중` 상태를 표시합니다.

가격 import 방법:

1. `data/prices.json` 파일 추가
2. `MARKET_PRICES_IMPORT_URL` 환경변수에 JSON 또는 CSV URL 추가

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
    "change": "+34.10",
    "changePercent": "+3.12%",
    "currency": "USD",
    "marketStatus": "afterhours",
    "asOf": "2026-05-15T20:00:00-04:00",
    "source": "manual-delayed-close",
    "isDelayed": true
  }
]
```

데이터가 없으면 프론트는 `src/data.ts`의 mock price fallback을 사용합니다. 가격 데이터는 투자 참고용이며 완전한 실시간성을 보장하지 않습니다.

### Vercel Cron

`vercel.json`에 아래 Cron이 포함되어 있습니다. Vercel Cron 시간은 UTC 기준입니다.

- `/api/sync/financials`: 평일 09:00 UTC 1회
- `/api/sync/trades`: 평일 03:00 UTC 1회

엔드포인트는 `CRON_SECRET`으로 보호됩니다. Vercel Cron은 프로젝트 환경변수에 `CRON_SECRET`이 있으면 호출 시 `Authorization: Bearer ...` 헤더를 자동으로 보냅니다. 브라우저나 curl로 수동 테스트할 때는 아래처럼 헤더를 보내거나 query secret을 붙이면 됩니다.
Vercel Hobby 플랜은 하루 1회보다 잦은 Cron을 허용하지 않으므로, 매수·매도 데이터를 더 자주 갱신하려면 아래 GitHub Actions 스케줄을 사용하거나 Vercel Pro에서 Cron 주기를 늘리세요.

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
3. 위 `/api/sync/financials?secret=CRON_SECRET값`, `/api/sync/trades?secret=CRON_SECRET값` 호출
4. Supabase `sync_runs` 테이블에서 `success`, `partial`, `skipped`, `failed` 로그 확인
5. 실패 시 Vercel Logs에서 endpoint 응답과 Supabase REST 오류 확인

### GitHub Actions 대안

Vercel Cron 대신 `.github/workflows/sync.yml`을 사용할 수 있습니다. GitHub Secrets에 아래 값을 등록하세요.

- `OPENDART_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `SEC_USER_AGENT`
- 선택: `SEC_13F_MANAGER_CIKS`, `CONGRESS_TRADES_IMPORT_URL`, `NPS_IMPORT_URL`, `MARKET_PRICES_IMPORT_URL`

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

## 데이터 주의사항

내장 데이터는 투자 검토용 후보군입니다. 기업명은 실제 기업명을 사용했지만, 특정 원청에 대한 납품 관계를 확정한 데이터가 아닙니다. 실제 서비스로 확장할 때는 OpenDART, KRX, SEC EDGAR, 회사 IR, 공급계약 공시, 뉴스 원문처럼 무료 공식·공개 자료로 관계를 검증해야 합니다.

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

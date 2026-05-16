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
- `src/services/filings.ts`: DART/SEC 직접 원문 보고서 링크 우선, 검색 링크 fallback
- `scripts/sync-opendart-financials.ts`
- `scripts/sync-sec-companyfacts.ts`
- `scripts/sync-sec-form4.ts`
- `scripts/sync-sec-13f.ts`
- `scripts/sync-congress-trades.ts`
- `api/sync/financials.ts`
- `api/sync/trades.ts`
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
SYNC_DEFAULT_MARKET=KR,US
SEC_13F_MANAGER_CIKS=
CONGRESS_TRADES_IMPORT_URL=
NPS_IMPORT_URL=
```

### Supabase DB

`supabase/schema.sql`을 Supabase SQL Editor에서 실행합니다. 주요 테이블은 다음입니다.

- `companies`
- `filings`
- `financial_metrics`
- `ownership_trades`
- `sync_runs`

중복 저장 방지 기준:

- OpenDART: `dart_rcept_no`
- SEC filing: `accession_number`
- SEC Form 4 transaction: `accessionNumber + ownerCik + transactionDate + securityTitle + shares`를 `raw_id`로 저장
- SEC 13F: `accessionNumber + cusip + managerCik`를 `raw_id`로 저장
- Congress: `reportId + transactionDate + assetName + amountRange`를 `raw_id`로 저장

### 수동 동기화

동기화 스크립트는 `.ts` 파일이며 Node 22+의 TypeScript strip 기능을 사용합니다. GitHub Actions는 Node 24로 실행하도록 설정되어 있습니다.

```bash
npm run sync:financials
npm run sync:trades
npm run sync:all
```

개별 실행:

```bash
npm run sync:opendart
npm run sync:sec-companyfacts
npm run sync:sec-form4
npm run sync:sec-13f
npm run sync:congress
```

API 키나 DB 환경변수가 없으면 실패하지 않고 안내 로그를 출력하며 기존 mock/fallback 데이터가 유지됩니다.

### Vercel Cron

`vercel.json`에 아래 Cron이 포함되어 있습니다. Vercel Cron 시간은 UTC 기준입니다.

- `/api/sync/financials`: 평일 09:00 UTC 1회
- `/api/sync/trades`: 평일 03:00 UTC 1회

엔드포인트는 `CRON_SECRET`으로 보호됩니다.
Vercel Hobby 플랜은 하루 1회보다 잦은 Cron을 허용하지 않으므로, 매수·매도 데이터를 더 자주 갱신하려면 아래 GitHub Actions 스케줄을 사용하거나 Vercel Pro에서 Cron 주기를 늘리세요.

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://YOUR_DOMAIN/api/sync/financials
curl -H "Authorization: Bearer $CRON_SECRET" https://YOUR_DOMAIN/api/sync/trades
```

### GitHub Actions 대안

Vercel Cron 대신 `.github/workflows/sync.yml`을 사용할 수 있습니다. GitHub Secrets에 아래 값을 등록하세요.

- `OPENDART_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `SEC_USER_AGENT`
- 선택: `SEC_13F_MANAGER_CIKS`, `CONGRESS_TRADES_IMPORT_URL`, `NPS_IMPORT_URL`

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
   - 또는 `/api/sync/financials`, `/api/sync/trades`를 `CRON_SECRET`과 함께 호출

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

`package.json`에서 Vercel 런타임을 Node.js 20.x로 고정했습니다. API 코드는 WHATWG `URL` API인 `new URL(...)`을 사용합니다.


## v2 확장 내용

- 국가: 한국 + 미국
- 국내 추가 섹터: 보험·금융지주, 은행·핀테크, 에너지·유틸리티
- 미국 추가 섹터: 반도체, AI·클라우드, EV·모빌리티, 에너지·전력망, 보험·금융, 은행·핀테크, 헬스케어·바이오, 항공우주·방산
- 기업 관계는 실제 납품 확정이 아니라 공시·감독기관·뉴스 원문으로 검증할 후보군으로 표시됩니다.
- 미국 검증 소스: SEC EDGAR, NAIC, FDIC, Federal Reserve, 회사 IR/10-K/10-Q/8-K.

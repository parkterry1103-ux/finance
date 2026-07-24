# 2026-07-23 SMCI·오늘의 월스트리트 통합 릴리스

## 릴리스 경계

이 릴리스는 기존 지원 기업 Super Micro Computer를 최신 공식 자료로 갱신하고 SMCI 주가해부와 2026년 7월 23일 오늘의 월스트리트를 각각 독립 Published 콘텐츠로 등록한다. SMCI는 이미 Company Registry·Brief·Financial Pivot·모바일 기업 해부에 존재하므로 새 기업이나 검색 record를 중복 생성하지 않았다.

신규 API, Serverless Function, DB, migration, cron, sync, dependency, 가치평가 모형, 심층 리포트, 이미지와 SNS UI는 추가하지 않는다. Serverless Function은 12개를 유지한다.

## SMCI 주가해부

- editorial ID: `stock-2026-07-22-smci-orders-margin`
- event as of: 2026-07-21
- price as of: 2026-07-22 미국 정규장
- 종가: $25.50 → $30.56
- 수익률: +19.843%
- 거래량: 162,695,900주
- 직전 20거래일 평균 대비: 3.919배
- Nasdaq 대비: +20.409%p
- SOXX 대비: +19.331%p
- Dell 대비: +10.527%p
- HPE 대비: +16.825%p

직접 촉매는 회사가 발표한 FY2026 4분기 신규 주문 600억달러 초과, 사상 최대 수주잔고와 15~17% 예비 매출총이익률이다. 매출은 기존 $11.0B~$12.5B 전망의 하단 부근이다. 주문은 확정 매출이 아니고 예비 마진은 미감사 수치이므로 주문 확정성·취소·지연, 출하 시점, 최종 마진과 현금 전환을 미확인 항목으로 유지한다.

세 파일 입력은 다음 경로에 보존한다.

- `docs/editorial-inputs/2026-07-22-smci-orders-margin/01_verified-research.md`
- `docs/editorial-inputs/2026-07-22-smci-orders-margin/04_website-article.md`
- `docs/editorial-inputs/2026-07-22-smci-orders-margin/05_website-handoff.yaml`

## SMCI 기업 분석·재무

Company Brief는 2026-07-24 기준으로 갱신했다. 핵심 지표는 FY2026 3분기 실제 매출 성장률 +122.7%, 실제 매출총이익률 9.9%, 파생 분기 FCF -$6.696B다. 600억달러 주문과 15~17% 마진은 실제 실적 카드에 섞지 않고 최근 변화와 시장 기대 영역에서 예비 수치로 표시한다.

Financial Pivot은 2026-05-11 접수된 FY2026 3분기 10-Q를 최신 정기공시로 유지하고 7월 21일 8-K는 예비 업데이트로 구분한다. FY2026 4분기는 `filing_pending`이다. SEC instant metric에 재고와 매입채무를 추가해 주문→조달→출하→현금 경로를 확인할 수 있게 했다.

공시 기반 배수는 2026-07-22 정규장 종가 $30.56을 사용한다. 안전한 TTM 희석 EPS가 없어 FY2025 희석 EPS $1.68 기반 PER 18.19배를 명시적 fallback으로 표시한다. 최신 자기자본·기말주식수 기반 PBR은 약 2.43배, 안전한 독립 4분기 매출 기반 PSR은 약 0.55배다. EV/Sales와 EV/EBITDA는 완전한 구성 원재료가 없어 생성하지 않는다. 외부 두 곳과 분모·시점 차이를 기록하며 외부 값에 SEC 값을 맞추지 않는다.

SMCI의 가치평가와 심층 리포트 상태는 계속 `unavailable`이다. 빈 CTA, DCF, Reverse DCF, 목표값을 만들지 않는다.

## Event Impact

SMCI 사건은 `scenario_review`·`pending`이다. AI 서버 수요, 수주잔고 전환, 제품·고객 구성, 운전자본·납품의 네 사업 동인을 매출·마진·재고·매입채무·영업현금흐름·FCF와 연결한다. 가치평가 가정은 검토 대상으로만 기록하고 `scenario_updated`, `base_case_updated`, `thesis_revised`와 change record는 만들지 않는다.

## 2026-07-23 오늘의 월스트리트

- editorial ID: `wall-street-2026-07-23-option-cost`
- title: `선택권은 공짜가 아니다`
- content as of: 2026-07-23
- related company slugs: `[]`

Read 1은 WSJ의 2026-07-23 11:46 ET 업데이트를 기준으로 Tradeweb 장중 10년물 4.711%를 사용한다. 사용자 초안의 4.665%와 같은 시점처럼 혼합하지 않고 5%는 시나리오로만 남긴다.

Read 2는 10년 이상 미국 사모펀드의 미매각 자산 NAV $348.5B, 7~9년 펀드 자산 $512.7B, 북미 미매각 포트폴리오 기업가치 $3.91T·74%를 서로 다른 정의로 구분한다. 장부가치가 곧 손실이라는 해석과 모든 컨티뉴에이션 차량이 부실이라는 일반화를 금지한다.

Read 3은 WSJ 편집위원회의 Opinion이다. 확인 사실인 미·사우디 123 협정·미국 기업 참여·2년 공동 연구와, 편집위원회의 핵확산·지역 위험 시나리오를 분리한다. 사우디 국내 농축의 즉시 허용, 시설 건설, 핵무기 개발은 확정 사실이 아니다.

두 editorial은 같은 릴리스로 배포하지만 relation을 만들지 않는다.

## 검증 기준

- `npm run typecheck`
- `npm run validate:editorial`
- `npm run validate:event-impacts`
- `npm run validate:company-briefs`
- `npm run validate:company-dissections`
- `npm run validate:financials`
- `npm run validate:multiples`
- `npm run validate:filing-freshness`
- `npm run validate:content`
- `npm run build`
- `npm run release:gate`
- Production smoke와 Chromium·WebKit·Safari 반응형 QA

현재 검증 결과는 Release Gate 28개, Published editorial 5개, Company Brief 9개·질문 45개, Event Impact 4개·가정 변경 0개다. Phase 5G 회귀 QA 25개와 릴리스 전용 Chromium·WebKit QA 48개가 통과했고, 320~1440px 전체 페이지 overflow와 console error는 0이다. 실제 Safari 데스크톱에서도 홈 SMCI·월스트리트 카드, SMCI 검색, 기업 핵심 카드 4개, 오각형 5축과 축 전환, Financial CTA, 주가해부, 월스트리트 3개 Read·Opinion, 직접 URL과 뒤로가기를 확인했다. 데스크톱 시각 점검의 가로 이탈은 0이다. home entry는 raw 791,034B / gzip 215,227B로 예산 825,000B / 225,000B 안이다.

최종 commit, PR, main SHA와 Production deployment는 배포 완료 뒤 Plan HTML과 이 문서의 배포 기록에 반영한다.

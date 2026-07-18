# 2026-07-18 Netflix 기업·콘텐츠 릴리스

## 상태

- 시작 SHA: `9a3a2fda02ed2595a8004aaf9939f3b93e578265`
- feature branch: `feat/netflix-company-content-release-20260718`
- PR·최종 main·Production deployment: 배포 완료 후 기록
- 대상: Netflix 기업 분석, Netflix 주가해부픽, 2026-07-18 오늘의 월스트리트

## 입력 원고

Netflix는 `01_verified-research.md`, `04_website-article.md`, `05_website-handoff.yaml` 세 파일을 모두 검토했다. 오늘의 월스트리트는 원문 요약·팩트체크 문서와 `04_website-handoff.yaml`을 검토했다. 원고를 runtime에서 파싱하거나 외부 파일 경로를 공개하지 않고, 검증된 자체 요약과 source metadata만 typed content로 등록한다.

## Netflix 온보딩

`netflix` / `NFLX` / NASDAQ을 아홉 번째 지원 기업으로 등록했다. Company Brief는 돈을 버는 구조, 최근 변화, 중요성, 핵심 위험, 다음 확인의 다섯 질문과 Q2 매출 성장률·영업이익률·FCF 세 지표를 제공한다. `/ko/companies/netflix/financials`는 기존 SEC financial adapter를 재사용한다. 심층 리포트와 공개 가치평가 모형은 만들지 않았으므로 해당 CTA는 표시하지 않고 direct valuation route는 안전한 unavailable 상태를 유지한다.

SEC 기준은 CIK `0001065280`, Q2 2026 10-Q accession `0001065280-26-000212`, Q2 실적 8-K `0001065280-26-000211`, FY2025 10-K `0001065280-26-000034`다. Netflix의 2025년 10:1 주식분할 이후 기준을 명시하며 분할 전후 가격·EPS를 혼합하지 않는다. 외부 TTM PER과 FY2025 EPS fallback 차이는 정의 차이로 남기고 임의로 일치시키지 않는다.

## Published 콘텐츠

- 주가해부: `stock-2026-07-18-netflix-guidance-disclosure-reset`
- 상세 route: `/ko/insights/stock/2026-07-18-netflix-guidance-disclosure-reset`
- 회사 relation: `netflix` 한 건
- 오늘의 월스트리트: `wall-street-2026-07-18-capital-gate-premium`
- 상세 route: `/ko/insights/3reads/2026-07-18-capital-gate-premium`
- Wall Street relation: 0건

홈과 인사이트 index에는 두 summary가 독립 카드로 노출된다. Netflix 상세 본문과 2026-07-18 월가인사이트 본문은 각각 별도 dynamic import이며 홈 entry에 장문을 포함하지 않는다. 기존 2026-07-17 월가인사이트와 draft fixture는 유지한다.

## Event Impact

Netflix Q2 실적·가이던스·공개정책 변화는 `scenario_review`·`pending` record로 연결한다. 확인된 사실과 미확인 항목을 분리하고 재무 지표·가정 후보를 검토 대상으로만 기록한다. 자동 판단, DCF 수정, 실제 assumption change는 없으며 change registry는 0건이다.

## 범위 보호

신규 API, Serverless Function, DB, migration, cron, sync endpoint, dependency, graph library, 외부 runtime fetch는 추가하지 않는다. `package.json`과 `package-lock.json`을 변경하지 않고 Function 수는 12개를 유지한다.

## 검증·배포 기록

구현 중 검증에서 content, editorial, Company Brief, financial, filing freshness, event impact, valuation expectation과 company profile/event unit이 통과했다. 최종 typecheck, build, Release Gate, 브라우저 QA, Production smoke와 배포 식별자는 PR 병합 뒤 이 문서와 Plan HTML에 갱신한다.

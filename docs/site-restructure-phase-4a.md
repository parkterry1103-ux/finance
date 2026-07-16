# 사이트 재개편 4A단계

## 결과

8개 기업의 가치평가 준비도를 공식 OpenDART·SEC 연결로 감사하고, 파일럿 두 기업의 결정론적 FCFF DCF를 내부 artifact로 생성했습니다. 공개 route·컴포넌트·API 계약은 변경하지 않았고 사용자 화면에는 가치평가, 목표주가, 투자의견, 빈 placeholder를 추가하지 않았습니다.

## 구현

- `src/domain/valuation`: 정규화, FCFF, WACC, terminal value, EV→equity bridge, 시나리오, 민감도, 역산 DCF, validation 순수 함수
- `src/content/valuation/companies.ts`: 8개 기업 identifier·업종·방법·driver registry
- `src/content/valuation/benchmarks`: NYU Stern 2026 업종 snapshot
- `scripts/generate-valuation-artifacts.ts`: 공식 read-only 조회와 내부 snapshot 생성. sync·DB write 없음
- `scripts/valuation-unit.ts`: 공식 계정 정규화 fixture와 수작업 계산 fixture
- `artifacts/phase-4a-valuation`: 준비도·파일럿·계산·source·warning 결과

## 파일럿

NVIDIA와 Meta를 데이터 품질·업종 다양성 기준으로 선정했습니다. 한국 기업은 최신 CFS 요약 연결은 확인됐지만 5년 감가상각·희석주식·자본구조 시계열이 부족해 파일럿에서 제외했습니다. 업종 평균으로 누락값을 채우지 않았습니다.

## 기준일

- valuation date: 2026-07-15
- 가격: 기존 `/api/market-prices`, 2026-07-15 지연 종가 snapshot
- USD risk-free: 기존 `/api/macro-indicators`의 DGS10 4.58%, 2026-07-14
- 업종 benchmark: NYU Stern 미국 업종 데이터 2026-01-05, 데이터 페이지 최종 갱신 2026-01-09
- SEC: Companyfacts accession·filed date·concept를 값마다 보존
- OpenDART: Production 기존 read-only API의 2026년 1분기 CFS 확인

## 공개 범위

신규 공개 API, Serverless Function, dependency, DB, migration, cron, sync endpoint는 0입니다. 실제 sync와 Production write도 0입니다. valuation module은 사용자 route에서 import하지 않으므로 홈 entry와 companies chunk에 계산 코드가 포함되지 않습니다.

### bundle·build 비교

| 항목 | 작업 전 | 작업 후 | 변화 |
| --- | ---: | ---: | ---: |
| 홈 entry raw | 751,259B | 751,259B | 0B |
| 홈 entry gzip | 204,250B | 204,250B | 0B |
| Companies chunk raw | 64,192B | 64,192B | 0B |
| Companies chunk gzip | 16,410B | 16,410B | 0B |
| valuation source module raw | 0B | 47,885B | 내부 분석 전용 |
| valuation source module gzip | 0B | 11,347B | 내부 분석 전용 |
| Vite build | 1.88s | 3.29s | 측정 실행 편차, asset hash·크기 동일 |

entry budget은 raw 825,000B·gzip 225,000B이며 계속 통과합니다. valuation 코드는 public route에서 import하지 않아 일반 사용자 bundle에는 0B가 추가됐습니다.

## 검증

- 8개 기업 registry와 source identifier 고유성
- CFS 우선·OFS 혼합 방지
- 정정공시 우선과 제외 context 감사
- annual·quarterly·TTM 구분
- FCFF·WACC·terminal·equity bridge 수작업 fixture
- 세 시나리오의 사업 가정 독립 재계산
- 기업별 5×5 민감도 두 개
- 역산값 재입력 오차 `1e-6` 이하
- artifact NaN·Infinity·undefined·깨진 source 0
- `targetPrice` 필드 0

실행 명령은 package 파일을 바꾸지 않기 위해 기존 compile 체계를 사용합니다.

```bash
npm run sync:compile
node .sync-build/scripts/valuation-unit.js
```

artifact를 공식 최신 read-only 값으로 다시 만들 때만 다음 script를 실행합니다. API key를 출력하지 않으며 Production sync를 호출하지 않습니다.

```bash
npm run sync:compile
node .sync-build/scripts/generate-valuation-artifacts.js
```

## 후속

- 4B: 내부 계산·출처를 사용하는 기업 리서치 리포트 파일럿
- 4C: 결정론적 모델 검증 뒤 확률적 가치평가·Monte Carlo
- 5: 거시경제 화면 재구성
- 6: 기업과 거시경제 연결 강화
- 7: 시장 변곡점 연동

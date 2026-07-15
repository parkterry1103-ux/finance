# Production Release Gate inventory

기준일은 2026-07-15이다. 시작 commit은 `1920bee6beced43c2e2e84420387728b0e8d6441`, 정상 Production 기준은 `dpl_51v51jwxGMtUmGzn6QLnWCZXxvFu`였다. 시작 시 Node 22.23.1, npm 10.9.8, 전체/Production audit 0, Vite entry raw 785,360B·gzip 213,726B, JavaScript asset 9개·동적 chunk 8개를 다시 측정했다.

## 기존 자동화 감사

기존 workflow는 2개였다. `.github/workflows/ci.yml`은 PR과 main push에서 Node 22.x·npm cache·`npm ci` 뒤 content validator, application TypeScript, Vite build를 각각 실행했다. `.github/workflows/sync.yml`은 수동 실행과 평일 schedule에서 운영 secret을 사용해 실제 financial/trade/price sync를 수행한다. sync workflow는 쓰기 작업이므로 Release Gate와 공유하거나 호출하지 않는다.

기존 CI에는 dependency audit, dependency security unit, runtime/Function inventory, 산업 흐름·기업·시장지도 unit, manifest, bundle budget, lazy route 구조, 결과 summary/artifact가 없었다. validator·TypeScript·build 세 단계는 새 release runner와 중복되므로 workflow의 개별 호출을 제거하고 `npm run release:gate` 한 단계로 대체했다.

GitHub 공개 Deployments API에서 Vercel bot이 main commit에 `success` deployment status와 `environment_url`을 생성하는 것을 확인했다. 따라서 post-deployment workflow는 `deployment_status`의 success event를 사용하며, 수동 복구·재검증용 `workflow_dispatch`도 제공한다. GitHub 공식 문서상 이 event는 workflow 파일이 default branch에 존재할 때 동작한다.

## 단일 설정

`config/release-gate.json`이 Node major, Function entrypoint/count/runtime/memory 기대값/max duration, content count, bundle budget, lazy route source, smoke route/API/sync inventory를 보관한다. content validator와 관련 unit은 count를 이 설정에서 읽는다.

bundle budget은 최신 baseline 대비 큰 회귀만 차단하도록 raw 825,000B(5.05% 여유), gzip 225,000B(5.27% 여유)로 정했다. hashed asset 이름과 dynamic chunk 총수는 성공 조건으로 고정하지 않는다. Vercel의 현재 Fluid compute 정책에서는 memory를 `vercel.json`으로 설정할 수 없어 2,048MB는 배포 metadata 검증값으로 유지한다. `maxDuration` 300초는 두 Function glob에 명시해 pre-deploy gate가 검사한다.

## Check inventory

| Check | Phase | Deterministic | Blocking | Command | 기존 수동 방식 | 동적 데이터·쓰기 기준 |
| --- | --- | --- | --- | --- | --- | --- |
| Scripts TypeScript | pre | 예 | 예 | `tsc -p tsconfig.scripts.json` | 개별 실행 | 외부 요청·쓰기 없음 |
| Release config·inventory | pre | 예 | 예 | release runner 내부 | Git·파일 수동 확인 | Function exact path와 count 사용 |
| 전체 npm audit | pre | registry 결과 | 예 | `npm audit --json` | 수동 audit | registry 오류와 취약점 구분, 둘 다 차단 |
| Production npm audit | pre | registry 결과 | 예 | `npm audit --json --omit=dev` | 수동 audit | 동일 |
| Content validator | pre | 예 | 예 | `.sync-build/scripts/validate-content.js` | 개별 실행 | 정적 registry exact count |
| Node runtime unit | pre | 예 | 예 | `.sync-build/scripts/node-runtime-unit.js` | 개별 실행 | Node 22·Function inventory |
| Dependency security unit | pre | 예 | 예 | `.sync-build/scripts/dependency-security-unit.js` | 개별 실행 | audit 우회·강제 설치 금지 |
| JavaScript bundle unit | pre | 예 | 예 | `.sync-build/scripts/javascript-bundle-unit.js` | 개별 실행 | source lazy 구조 검사 |
| 산업 흐름·layout | pre | 예 | 예 | 두 industry unit | 개별 실행 | 정적 content·CSS |
| 시장지도 폐기 | pre | 예 | 예 | market-map retirement unit | 개별 실행 | ReactFlow·public UI 0 |
| 기업 profile·event | pre | 예 | 예 | 두 company unit | 개별 실행 | 설정 count 사용 |
| 수요·공급·시장 관계 | pre | 예 | 예 | demand/relations unit | validator 의존 | 외부 provider 호출 없음 |
| Application TypeScript | pre | 예 | 예 | `tsc --noEmit` | 개별 실행 | 외부 요청·쓰기 없음 |
| Production manifest build | pre | 예 | 예 | `vite build --manifest` | 일반 build | build 1회, 알려진 500KB warning만 허용 |
| Bundle·lazy budget | pre | 예 | 예 | release runner 내부 | 수동 asset 계산 | manifest 기반, 0-byte 금지 |
| Route·asset HTTP | post | 배포 상태 | 예 | `npm run release:smoke` | curl·브라우저 수동 확인 | GET만 사용 |
| 공개 API schema | post | 부분 동적 | 예 | `npm run release:smoke` | API별 수동 확인 | DART·SEC·뉴스 수량 변동 허용, schema·중복 검사 |
| Sync authentication | post | 예 | 예 | `npm run release:smoke` | 인증 없는 curl | token/body 없이 POST, 401만 허용, 쓰기 0 |

## Pre-deployment gate

로컬과 CI는 모두 다음 명령을 사용한다.

```bash
npm ci
npm run release:gate
```

runner는 scripts TypeScript를 한 번만 compile하고 18개 blocking check를 실행한다. `dist`를 지운 뒤 manifest build도 한 번만 수행한다. manifest에서 entry·CSS·6개 route dynamic entry를 찾고, 모든 asset의 0-byte 여부와 entry raw/gzip budget을 검사한다. 실패를 수집해 summary를 남기지만 최종 exit code는 반드시 1이다.

`.github/workflows/ci.yml`의 `Release Gate` workflow는 PR, main push, workflow dispatch에서 실행된다. 권한은 `contents: read`, timeout은 20분이며 동일 ref의 이전 run을 취소한다. `continue-on-error`는 없다.

## Post-deployment smoke

```bash
npm run release:smoke -- --base-url=https://finance1-flax.vercel.app
```

base URL은 HTTPS와 `finance1-flax.vercel.app` 또는 `*.vercel.app`만 허용한다. userinfo, 비표준 port, path/query/hash, localhost·IP·file URL은 거부하고 redirect 대상에도 같은 allowlist를 적용한다. 요청 timeout은 20초, redirect는 최대 5회, network/429/502/503/504만 최대 2회 재시도한다. schema 오류·404·예상 밖 401은 재시도하지 않는다.

route 17개는 최종 HTTP 200, HTML Content-Type, 비어 있지 않은 body, entry JS·CSS reference를 검사한다. entry source에서 hash에 의존하지 않고 lazy route asset을 발견해 6개 route asset과 shared asset을 GET 검증한다. 공개 API 9개는 response 전체를 저장하지 않고 status, schema, count, duplicate count, duration만 남긴다. news는 기존 계약상 `ok` field가 없음을 명시적으로 처리한다.

sync Function 6개에는 인증 header와 body 없이 POST한다. `401`, JSON, `ok:false`, error string만 통과하며 유효 token 사용·실제 sync·재시도 인증 추가는 없다.

`.github/workflows/deployment-smoke.yml`은 성공한 Production `deployment_status`에서만 자동 실행한다. event의 `environment_url`은 HTTPS Vercel allowlist metadata로 검증하고, Deployment Protection이 걸린 immutable URL 대신 같은 Current deployment를 가리키는 공개 canonical alias를 smoke한다. Preview immutable URL은 인증 화면으로 redirect되므로 자동 event에서 제외하며, 보호를 해제하지 않고 프로젝트 인증이 적용되는 `vercel curl`로 별도 검증한다. `workflow_dispatch`는 필수 수동 `base_url`을 그대로 검증한다. 권한은 `contents: read`, `deployments: read`뿐이며 Vercel 설정·alias·Production data를 변경하지 않는다.

## Summary와 artifact

로컬/CI 결과는 다음에 생성되며 git에는 포함하지 않는다.

```text
artifacts/release-gate-summary.json
artifacts/release-gate-summary.md
artifacts/release-smoke-summary.json
artifacts/release-smoke-summary.md
```

workflow는 Markdown을 `$GITHUB_STEP_SUMMARY`에 추가하고 JSON/Markdown을 `actions/upload-artifact@v4`로 14일 보존한다. 실패한 gate도 가능한 결과까지 기록한 뒤 exit code 1을 유지한다. API body, 환경변수, secret, stack trace 원문은 artifact에 저장하지 않는다.

## 범위

신규 사용자 기능, UI·카피, API, Serverless Function, DB, migration, cron, sync endpoint, dependency는 없다. Production 쓰기와 실제 sync는 0회다. Release workflow는 배포 명령이나 Production secret을 사용하지 않는다.

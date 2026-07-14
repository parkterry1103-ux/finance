# 의존성 취약점 영향도 감사

- 감사 기준일: 2026-07-14 (Asia/Seoul)
- 시작 Git SHA: `4ee7e8186663d9b890e982487316188ea864bede`
- 기준 런타임: Node.js `22.23.1`, npm `10.9.8`
- 기준 Production: `finance1`, `https://finance1-flax.vercel.app`
- rollback 기준 deployment: `dpl_E22yN9GVmDTUjzCtnjpqwmtB1Hjq`

## 결론

변경 전 `npm audit`의 취약 패키지 노드는 3개였지만 Vite 노드에 advisory 두 개가 연결되어 실제 검토한 advisory는 4개다. 세 패키지는 모두 dev dependency graph에만 있고 Production Serverless Function이나 브라우저 bundle의 실행 모듈은 아니다. 그렇더라도 Windows 로컬 개발 서버와 신뢰하지 않는 빌드 입력이라는 공격 조건이 있으므로 “devDependency라서 무시”하지 않고 모두 안전 버전으로 올렸다.

가장 작은 호환 가능한 direct 변경은 Vite `^7.3.3`에서 `^7.3.6`으로의 patch 변경이다. Vite 7.3.5가 Vite 자체 두 취약점의 최소 안전 버전이지만 esbuild 0.28을 허용하지 않는다. Vite 7.3.6은 공식 changelog에서 esbuild 0.28 지원만 추가하며, 이를 통해 취약한 esbuild 0.27.7을 override 없이 0.28.1로 선택할 수 있다. `@vitejs/plugin-react`의 기존 `@babel/core ^7.29.0` 범위는 안전 버전 7.29.6을 허용한다.

`npm audit fix --force`, `npm update`, force/legacy peer 설치, override, major 업데이트, audit 숨김 설정은 사용하지 않았다. 신규 direct dependency도 없다.

## 변경 전 기준선

| 항목 | 결과 |
| --- | ---: |
| audit 취약 패키지 노드 | 3 |
| critical / high / moderate / low | 0 / 1 / 0 / 2 |
| 실제 advisory | 4 |
| production dependency 취약점 | 0 |
| 취약 direct / transitive 패키지 | 1 / 2 |
| direct dependency | production 3 + dev 5 = 8 |
| lockfile package entry | root 제외 121 |
| transitive package entry | 113 |
| `fixAvailable: true` 패키지 | 3 |
| major가 필요한 패키지 | 0 |

원본 자료는 `/tmp/finance-dependency-audit/audit-all-before.json`, `audit-production-before.json`, `dependency-tree-before.json`, `package-lock-before.json`에 보존했다. `npm audit --omit=dev`는 변경 전에도 0건이었다.

## Advisory inventory

| Advisory | Package | Severity | Installed / affected | Minimum safe | Path | Runtime | Production reachable | Action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff), CVE-2026-53571 | Vite | high | 7.3.3 / 7.0.0–7.3.4 | 7.3.5 | root → vite | direct dev, build/dev server | no | Vite 7.3.6 |
| [GHSA-v6wh-96g9-6wx3](https://github.com/advisories/GHSA-v6wh-96g9-6wx3), CVE-2026-53632 | Vite의 launch-editor 경로 | moderate | Vite 7.3.3 / 7.0.0–7.3.4 | Vite 7.3.5 | root → vite | direct dev, dev server | no | Vite 7.3.6 |
| [GHSA-4x5r-pxfx-6jf8](https://github.com/advisories/GHSA-4x5r-pxfx-6jf8), CVE-2026-49356 | @babel/core | low | 7.29.0 / ≤7.29.0 | 7.29.6 | root → @vitejs/plugin-react 5.2.0 → @babel/core | transitive dev, build | no | @babel/core 7.29.6 |
| [GHSA-g7r4-m6w7-qqqr](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr), CVE 없음 | esbuild | low | 0.27.7 / ≥0.27.3 <0.28.1 | 0.28.1 | root → Vite 7.3.3 → esbuild | transitive dev, build/dev server | no | esbuild 0.28.1 |

네 항목 모두 audit상 `fixAvailable: true`이고 major 변경은 필요하지 않았다. 처리 후 direct/transitive 관계는 유지되며 Babel과 esbuild를 root dependency로 승격하지 않았다.

## 공격 전제와 도달성

### Vite `server.fs.deny` 우회

공식 advisory상 공격에는 Vite dev server의 명시적 network 노출, `server.fs.allow` 안의 민감 파일, Windows/NTFS alternate path 조건이 함께 필요하다. 이 프로젝트의 `dev`와 `preview` 명령은 `--host 127.0.0.1`로 loopback에 고정되어 있고 `vite.config.ts`는 `server.host`, `server.fs.allow`, `server.fs.deny`를 재정의하지 않는다. Vercel Production은 Vite dev server를 실행하지 않는다.

- 분류: `build-only`의 개발 서버 경로
- 조건 판정: 로컬 Windows에서 별도 network 공개 설정을 추가할 때만 `conditionally-reachable`; 현재 명령과 Production에서는 `not-reachable`
- 안전 변경: Vite 7.3.5가 Windows alternate path를 거부하며, 최종 7.3.6은 이 수정을 포함한다.

### Vite launch-editor UNC 처리

공격에는 Windows, 활성화된 NTLM, 실행 중인 Vite/launch-editor middleware, 그 endpoint를 향한 피해자의 요청, 공격자가 통제하는 UNC SMB 경로가 필요하다. 이 endpoint는 로컬 dev server 기능이며 정적 Production asset이나 Serverless Function에 포함되지 않는다. 기본 개발 명령도 loopback에 고정되어 있다.

- 분류: `build-only`의 개발 서버 경로
- 조건 판정: 조건을 갖춘 Windows 로컬 개발 환경에서 `conditionally-reachable`; Production은 `not-reachable`
- 안전 변경: Vite 7.3.5가 UNC 경로를 거부하며, 최종 7.3.6은 이 수정을 포함한다.

### Babel 임의 source map 읽기

공식 advisory상 공격자가 악성 입력 source를 통제하고, 변환된 output source를 읽을 수 있으며, 읽으려는 source map의 로컬 경로도 알아야 한다. 이 저장소는 신뢰한 Git source를 `@vitejs/plugin-react`로 빌드하며 업로드 코드, 외부 PR artifact, 사용자 제공 코드 생성이나 Babel runtime API를 처리하지 않는다. `src`, `api`, `scripts`에는 `@babel/core` 직접 import가 없다.

- 분류: `build-only`
- 조건 판정: untrusted source compilation 경로가 없어 현재와 Production 모두 `not-reachable`
- 안전 변경: `@babel/core` 7.29.6. 이 버전이 요구하는 `@babel/generator` 7.29.6도 함께 갱신했다.

### esbuild Windows servedir traversal

공식 advisory상 Windows에서 esbuild 자체 development server를 `servedir`와 함께 실행하고, 공격자가 backslash를 포함한 HTTP path를 보낼 수 있어야 한다. 프로젝트는 esbuild를 직접 import하거나 `esbuild --serve`를 실행하지 않고 Vite의 transform/build 경로로만 사용한다. Vite dev server와 esbuild 자체 servedir server는 서로 다른 실행 경로다.

- 분류: `build-only`; 취약한 `serve` 기능은 현재 graph에서 `unused-transitive`
- 조건 판정: 현재와 Production 모두 `not-reachable`
- 안전 변경: [esbuild 0.28.1 release](https://github.com/evanw/esbuild/releases/tag/v0.28.1)는 dev server 요청의 backslash를 거부한다.

## 코드·배포 경로 근거

- `npm explain`/`npm ls` 기준 경로는 Vite direct, Vite → esbuild, `@vitejs/plugin-react` → `@babel/core` 하나씩이며 취약 버전의 중복 설치는 없었다.
- `src`, `api`, `scripts`에 Babel/esbuild import, esbuild `serve`, Vite dev-server middleware 호출이 없다.
- `api`의 12개 Function entrypoint는 Vite, Babel, esbuild를 runtime dependency로 import하지 않는다.
- Production dependency audit는 변경 전후 모두 0건이다.
- Production browser는 Vite가 만든 정적 JS/CSS만 받으며 Vite/Babel/esbuild의 Node-side 모듈을 runtime에 싣지 않는다.

따라서 advisory 단위 분류는 `production-server 0`, `production-browser 0`, `build-only 4`, `test-only 0`, `unknown 0`이다. esbuild의 취약 함수만 기능 단위로 보면 `unused-transitive 1`이지만, 패키지 분류 합계에서는 Vite build chain의 `build-only`에 포함했다.

## 최소 업데이트와 lockfile 통제

공식 근거는 Vite [7.3.5 security fixes](https://github.com/vitejs/vite/blob/v7.3.6/packages/vite/CHANGELOG.md#735-2026-06-01), [7.3.6 esbuild 0.28 compatibility](https://github.com/vitejs/vite/releases/tag/v7.3.6), Babel [7.29.6 release](https://github.com/babel/babel/releases/tag/v7.29.6), esbuild [0.28.1 release](https://github.com/evanw/esbuild/releases/tag/v0.28.1)다.

| 종류 | 변경 |
| --- | --- |
| direct | Vite range `^7.3.3` → `^7.3.6`, installed 7.3.3 → 7.3.6 |
| transitive | `@babel/core` 7.29.0 → 7.29.6 |
| required transitive | `@babel/generator` 7.29.1 → 7.29.6 |
| transitive | esbuild 0.27.7 → 0.28.1 |
| optional platform metadata | esbuild의 26개 `@esbuild/*` entry 0.27.7 → 0.28.1 |

최종 version 변경 entry는 30개다. direct 1개와 취약 체인에 필요한 transitive 29개이며, 후자에는 실제 host 하나만 설치되는 esbuild platform optional entry 26개가 포함된다. 각 변경 entry의 `resolved`와 `integrity`만 같은 수로 바뀌고 무관한 브라우저 데이터, React, TypeScript, Rollup, PostCSS 등은 그대로다. `lockfileVersion`은 3, Node engine은 `22.x`, direct dependency 수는 8을 유지한다. lock entry 기준 patch 3개(Vite, Babel core/generator), minor 27개(esbuild와 26개 platform entry), major 0개, override 0개, 신규/제거 dependency 0개다. 논리 package family 기준 esbuild minor 변경은 1개다.

## 변경 후 기준과 회귀 방어

`scripts/dependency-security-unit.ts`는 다음을 정적으로 검증한다.

- 실행 Node와 package/lock engine이 모두 22.x
- lockfileVersion 3
- production direct 3개, dev direct 5개가 정확히 유지됨
- Vite ≥7.3.5, `@babel/core` ≥7.29.6, esbuild ≥0.28.1
- Babel/esbuild가 transitive로 남고 override가 없음
- audit 비활성화·severity 숨김·force/legacy 설치 script가 없음
- Serverless Function entrypoint가 정확히 12개
- 네 advisory와 선택 버전이 이 문서에 기록됨

변경 후 전체 audit와 production audit는 모두 0이고 신규 high/critical과 남은 advisory도 0이다. audit 숫자를 숨기는 설정은 추가하지 않았다. 변경 후 원본은 `/tmp/finance-dependency-audit/audit-all-after.json`, `audit-production-after.json`, `dependency-tree-after.json`, `package-lock-after.json`에 보존했다.

## 배포 검증과 rollback

Node 22 clean install과 전체 validator/unit/TypeScript/Vite build를 통과했다. Preview `dpl_6z3ztnDDpMoQLJSqU5p3VBvZQemL`은 `finance1-d043zn9l8-terrypark-s-projects.vercel.app`에서 Ready였고 12개 Function이 모두 `nodejs22.x`였다. 공개 Function 9개는 HTTP 200·JSON parse·기존 schema·중복 key 0·stack trace 0을 확인했고, sync Function 6개는 인증 없는 HTTP 401만 확인해 실제 sync 실행은 0회다. 지정 route와 1280×844, 390×844, 320×700, 200% 상당 640px browser QA는 horizontal overflow·빈 화면·broken image·broken route·undefined/NaN·console error/warning 0으로 통과했다. 산업 흐름의 5단계 text descendant clipping도 0이고 desktop/mobile navigation의 `aria-expanded`와 menu link를 실제 조작으로 확인했다.

Preview API schema는 변경 전 Production과 일치했다. Vite/Babel/esbuild가 Production 실행 경로에 없으므로 성능 반복 비교 대상은 아니지만 cold request의 HTTP status, body size와 시간을 기록했고 신규 timeout이나 비정상 응답 크기는 없었다. Preview build의 TypeScript diagnostic 220개는 시작 시 정상 Production build와 정규화된 집합이 완전히 같고 deployment는 Ready였으므로 이번 dependency 변경으로 생긴 신규 diagnostic은 0개다.

보안 업데이트 commit `4458b881a9ff82164f71e5d4c6909581bdeed85c`의 Production `dpl_4wFtX1q8DYzuCSKnR7n7xG7m8EN6`은 40초에 Ready가 되어 `https://finance1-flax.vercel.app`의 Current가 됐다. immutable URL은 `https://finance1-5psel8v2z-terrypark-s-projects.vercel.app`이고 asset은 `index-BZosVaFs.js`, `index-B7FbWP_N.css`로 Preview와 같다. 12개 Function은 모두 `nodejs22.x`이며 공개 API 9개는 HTTP 200·기존 schema·중복 key 0·stack trace 0, sync 6개는 인증 없는 HTTP 401이었다. 뉴스의 두 upstream 실패는 기존 Google News RSS fallback으로 정상 응답했으며 dependency runtime 오류가 아니다. Vercel runtime error·warning·5xx log는 모두 0이고 API 계약 변경도 0이다.

Production browser는 alias와 immutable URL에서 같은 asset을 확인했다. 1280×844, 390×844, 320×700, 200% 상당 640px에서 지정 route·기업 profile·legacy redirect가 모두 정상이며 page horizontal overflow, 빈 화면, broken image/route, undefined/NaN, console error/warning은 0이다. desktop 흐름 단계의 `scrollWidth` 차이는 8px 연결선 pseudo-element이며 모든 text descendant의 clipping은 0이다. desktop/mobile navigation을 실제로 열고 닫아 `aria-expanded`, menu link와 body 폭을 확인했다. rollback 조건이 없어 실행하지 않았다.

rollback은 `dpl_E22yN9GVmDTUjzCtnjpqwmtB1Hjq`를 기준으로 한다. build 실패, Function import 실패, 주요 API 5xx·schema 변경, UI 빈 화면, 지속 timeout, Function 수 또는 Node 22 runtime 이탈 때만 alias를 복구한다. 외부 provider의 일시적 항목 수 변화만으로 rollback하지 않는다.

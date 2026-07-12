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

## MSN 참고형 UI 간소화 및 타이포그래피 정비

- 참고한 원칙: 짧은 상단 탐색, 첫 화면의 핵심 정보 우선 배치, 중립적인 산세리프 글꼴, 제목/보조 정보/수치의 분명한 위계, 조밀하지만 복잡하지 않은 카드 정렬입니다.
- 복제하지 않은 요소: MSN의 브랜드, 로고, 색상 체계, 광고 구조, 콘텐츠 배열은 사용하지 않았습니다.
- 최상위 navigation: `홈 / 이번 주 / 시장지도 / 공시` 중심에서 `오늘 / Pick / 시장지도 / 공시 / 보고서`로 단순화했습니다. 기존 route와 deep link는 유지합니다.
- 내부 category 구조: Pick은 `이번 주 / 보관함`을 기본 분류로 두고 `전체 / 한국 / 미국`을 보조 필터로 둡니다. 공시는 `전체 / 한국 공시 / 미국 공시`로 보이게 하고, `OpenDART`와 `SEC EDGAR`는 출처 표기로 유지합니다.
- 홈 section 순서: `오늘 봐야 할 것 -> 이번 주 Pick -> 최근 공식 공시 -> 시장을 연결해서 보기 -> 최신 보고서` 순서로 정리했습니다.
- Pick card 간소화: 목록 카드에는 회사명, 국가/ticker, 상태, 제목, 가격/등락, 움직임 한 줄, 2~3줄 요약, `해부 보기`만 남겼습니다. 긴 배경, 관련 기업 다수, 전체 source 목록은 상세로 보냅니다.
- font stack: `"Segoe UI Variable", "Segoe UI", "Pretendard Variable", Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", system-ui, -apple-system, BlinkMacSystemFont, sans-serif`를 전역 토큰으로 사용합니다. 외부 font CDN이나 font file은 추가하지 않았습니다.
- typography token: `--font-sans`, `--text-xs`, `--text-sm`, `--text-base`, `--text-md`, `--text-lg`, `--text-xl`, `--text-2xl`, `--text-hero`를 `src/styles.css`에 정의했습니다.
- badge/chip/button text-fit 규칙: 고정 높이 대신 `min-height`, `height:auto`, `inline-flex`, `overflow-wrap:anywhere`, `word-break:keep-all`, `min-width:0`, `max-width:100%`를 공통 적용했습니다.
- ReactFlow node 처리: 시장지도 node는 콘텐츠에 맞춰 높이가 늘어나고, 회사명은 최대 2줄, 역할/상태 badge는 wrapping 가능하도록 정리했습니다.
- line-clamp 정책: Pick 목록 제목/요약, 홈 보고서/시장지도 요약처럼 상세 진입 경로가 있는 목록 요약에만 사용합니다. 회사명, 가격, 날짜, 주요 상태는 의미가 가려지지 않도록 별도 text-fit 규칙을 적용합니다.
- 적용 route: `/`, `/ko/`, `/ko/picks`, `/ko/picks/archive`, `/ko/disclosures`, `/ko/market-map`, `/ko/category/us-semiconductors`, `/ko/category/datacenter-power-cooling`, `/ko/category/reconstruction-infrastructure`, `/ko/category/semiconductor-cluster-infrastructure`, `/ko/reports`.
- QA 기준: desktop/mobile에서 navigation, tab/filter, button, badge, chip, company identity, price row, source row, market-map node의 overflow와 overlap을 확인합니다. 320/360/390px 및 200% zoom에서 horizontal overflow 0을 목표로 합니다.
- 로컬 QA 결과: 11개 route를 desktop, 390px, 360px, 320px에서 확인했고 horizontal overflow 0, clipped critical text 0, company/status overlap 0, console error 0입니다. 200% zoom 근사 viewport에서도 overflow/clip/overlap 0입니다.
- 회귀 결과: `validate-content`, TypeScript, Vite build가 통과했습니다. Vite build에서는 기존 허용 경고인 `@xyflow/react`의 `"use client"` 및 chunk size 경고만 확인됐습니다.
- 회귀 기준: 가격 API, OpenDART API, SEC EDGAR API와 sync script, Supabase schema, source registry, Pick 본문, 기존 route/slug는 UI 작업으로 변경하지 않습니다.
- 관심목록 제외: 개인 관심목록, 즐겨찾기, 로그인, 회원가입, localStorage watchlist, 포트폴리오, 알림, 개인화 홈은 구현하지 않았고 placeholder도 추가하지 않습니다.

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

## 2026-06-29 주간 Pick 업데이트

배포 정보:

- 시작 HEAD: `c88e29e29e72e5525cc898287e2e563ae0016f7e`
- 콘텐츠 commit: `c436b9cf6ab222b3e5c96aa20c35313af39e566f`
- branch: `main`
- production: `https://finance1-flax.vercel.app`
- production asset: `/assets/index-D3tCVlqv.js`, `/assets/index-CpZ3BdL7.css`
- Vercel execution host 확인: `finance1-79bt6093v-terrypark-s-projects.vercel.app`

주차 구성:

| 구분 | 값 |
| --- | --- |
| weekOf | `2026-06-29` |
| 대표 Pick | SK하이닉스 |
| 이번 주 Pick 순서 | SK하이닉스 -> Meta -> 에스폴리텍 -> 금호건설 |
| 지난주 Pick | 동양파일 -> KCC -> Hertz -> 제주반도체 |

신규 Pick:

| 회사 | id / route | ticker | 가격 row |
| --- | --- | --- | --- |
| SK하이닉스 | `pick-sk-hynix-ai-overbuild-selloff` / `/ko/picks/pick-sk-hynix-ai-overbuild-selloff` | `000660.KS` | 있음 |
| Meta | `pick-meta-ai-compute-cloud-option` / `/ko/picks/pick-meta-ai-compute-cloud-option` | `META` | 있음 |
| 에스폴리텍 | `pick-spolytech-datacenter-polycarbonate-ramp` / `/ko/picks/pick-spolytech-datacenter-polycarbonate-ramp` | `050760.KQ` | 있음 |
| 금호건설 | `pick-kumho-enc-honam-cluster-volatility` / `/ko/picks/pick-kumho-enc-honam-cluster-volatility` | `002990.KS` | 있음 |

Source registry:

- 신규 source 14개를 추가했습니다.
- 신규 restricted source는 WSJ Meta 클라우드 보도 1개이며, 접근 제한 자료로 registry에 명시했습니다.
- content validator 기준 전체 source 66개, 중복 id/URL 없음, source reference 오류 없음입니다.

OpenDART registry:

- 변경 전 감시 기업 수: 10개
- 변경 후 감시 기업 수: 13개
- 추가: SK하이닉스 `000660.KS` / `00164779`, 에스폴리텍 `050760.KQ` / `00340272`, 금호건설 `002990.KS` / `00106313`
- 제거: 없음
- 유지: 기존 10개 유지. 동양파일, KCC, 제주반도체는 `manual-watch`로 유지했고, 기존 시장지도 기업 7개도 유지했습니다.
- Meta는 미국 기업이므로 OpenDART 감시 대상에 넣지 않았습니다.

가격 API와 sync:

| 시점 | `/api/market-prices?limit=200` | source 분포 | 신규 ticker 상태 |
| --- | --- | --- | --- |
| sync 전 | 91행 | `kis-openapi` 50, `yahoo-finance-chart` 41 | SK하이닉스 있음, Meta/에스폴리텍/금호건설 없음 |
| sync 후 | 52행 | `kis-openapi` 52 | SK하이닉스/에스폴리텍/금호건설 표시, Meta는 무필터 응답에서 제외 |

수동 가격 sync는 Vercel Dashboard Cron Jobs에서 `/api/sync/prices`를 1회 실행했습니다. Vercel Logs 기준 `2026-07-05 22:09:48 KST`, `GET 200`, warning/error/fatal 0건입니다.

개별 ticker API 확인:

| ticker | source | currency | price | changePercent | asOf | 화면 badge |
| --- | --- | --- | --- | --- | --- | --- |
| `000660.KS` | `kis-openapi` | KRW | `2425000` | `+10.88%` | `2026-07-05T13:09:51.482Z` | 표시 |
| `META` | `yahoo-finance-chart` | USD | `582.9` | `-4.11%` | `2026-07-02T20:00:00.000Z` | 목록/홈은 fallback |
| `050760.KQ` | `kis-openapi` | KRW | `1390` | `-1.56%` | `2026-07-05T13:09:52.799Z` | 표시 |
| `002990.KS` | `kis-openapi` | KRW | `9500` | `-19.01%` | `2026-07-05T13:09:52.982Z` | 표시 |

주의: Meta row는 ticker별 API에서는 존재하지만, 홈과 Pick 목록은 기존 `limit=200` 가격 fetch를 사용하므로 최신 KIS row 묶음에 밀려 `가격 준비 중` fallback으로 보입니다. 가격 API와 sync 구조는 이번 작업에서 수정하지 않았습니다.

OpenDART sync와 공개 API:

- 수동 공시 sync는 Vercel Dashboard Cron Jobs에서 `/api/sync/disclosures`를 1회 실행했습니다.
- Vercel Logs 기준 `2026-07-05 22:07:18 KST`, `GET 200`, warning/error/fatal 0건입니다.
- 공개 API는 `ok:true`, `trackedCompanyCount:13`, `stale:false`입니다.
- `000660.KS`: 4건, `lastSyncedAt: 2026-07-05T13:07:19.038+00:00`
- `050760.KQ`: 0건, `lastSyncedAt: 2026-07-05T13:07:27.288+00:00`
- `002990.KS`: 1건, `lastSyncedAt: 2026-07-05T13:07:19.038+00:00`
- 최근 기간에 에스폴리텍 공시가 없는 상태는 빈 배열로 정상 표시됩니다.

Production QA:

- 홈 `/`, `/ko/`: 대표 Pick SK하이닉스, 제목, ticker, 가격 badge, 오늘 한눈에 신규 4개 확인. Meta 가격 badge는 fallback입니다.
- `/ko/picks`: SK하이닉스 -> Meta -> 에스폴리텍 -> 금호건설 순서 확인. 지난주 종목이 현재 목록에 섞이지 않습니다.
- `/ko/picks/archive`: 지난주 그룹에 동양파일, KCC, Hertz, 제주반도체 확인. selector 기준 weekOf는 `2026-06-22`이며 화면 label은 `2026년 6월 넷째 주`입니다.
- 신규 상세 4개: route 정상, title/ticker 정상, source links 정상, `details` 기본 접힘, 국내 3개 OpenDART section 정상, Meta는 OpenDART section 미표시.
- 기존 표본 route: 동양파일, KCC, Hertz, 제주반도체, Huntsman, uniQure, 현대건설, Dell Technologies, NVIDIA id가 production bundle과 registry에 유지됩니다. 제주반도체 상세는 production에서 실제 route로 열어 가격 badge와 console 0을 확인했습니다.
- Desktop QA: 홈, `/ko/picks`, `/ko/picks/archive`, 신규 상세 4개, `/ko/disclosures`, `/ko/market-map`, `/ko/reports`에서 horizontal overflow 0, console error 0.
- Mobile QA `390x844`: 홈, `/ko/picks`, `/ko/picks/archive`, 기존 상세 표본, `/ko/disclosures`, `/ko/market-map`, `/ko/reports`에서 horizontal overflow 0, console error 0.

검증:

- `git diff --check` 통과
- `tsc -p tsconfig.scripts.json` 통과
- `node .sync-build/scripts/validate-content.js` 통과: Pick 26개, Source 66개, 주간 컬렉션 5개, 대표 Pick SK하이닉스, 가격 universe 95개 target, OpenDART 감시 기업 13개
- `tsc --noEmit` 통과
- `vite build` 통과. 기존 `@xyflow/react` `"use client"` 및 chunk size 경고만 있음
- `package.json`, `package-lock.json` 변경 없음

## 2026-07-08 SEC filing detail production 활성화

Production 복구:

- 시작 HEAD: `94305e322e2c174236695a614e7d580e95ba4b64`
- 기준 commit: `94305e3` (`Structure SEC 8-K items and Form 4 transactions`)
- 원인: `finance1` production deployment `CRpvxbeuaPH1PwUHHh5RoCoGkj85`가 같은 commit에서 약 24시간 `Queued` 상태에 머물러 `/api/sync/sec-filing-details`가 production에 반영되지 않았습니다.
- 복구: stuck deployment를 Dashboard에서 cancel한 뒤 같은 commit을 production으로 redeploy했습니다.
- 복구 deployment: `86SGY1Z8FHmdRa8quyvUWXNDQmUv`
- production alias: `https://finance1-flax.vercel.app`
- production asset: `/assets/index-CcMqHaHT.js`, `/assets/index-BMH3Ig5A.css`
- 신규 보호 route 확인: `/api/sync/sec-filing-details` 무인증 요청은 `HTTP 401`, `Unauthorized cron request`
- 신규 필터 route 확인: `item=2.02`, `transactionCode=P` query가 구버전처럼 무시되지 않고 detail 기준 필터로 처리됩니다.

Migration:

- 적용 migration: `supabase/migrations/20260707_create_market_sec_filing_details.sql`
- 적용 시각: 2026-07-08 약 22:15 KST
- 적용 방식: Supabase production SQL Editor, `postgres`, primary database
- destructive statement 없음, `create table if not exists`, accession PK/FK, index 3개, RLS enabled, public write policy 없음 확인
- migration 직후: detail row 0, metadata row 226, duplicate accession 0
- backfill 대상 metadata: `8-K:30`, `4:188`

Backfill:

- Dashboard에서 secret 없이 보호 route를 직접 실행할 수 있는 Run 기능이 없어, production SQL Editor와 동일 parser 결과를 사용해 detail table만 batch upsert했습니다. 기존 SEC metadata, 가격 sync, OpenDART sync는 실행하거나 삭제하지 않았습니다.
- 8-K batch: 1회, 30건
- Form 4 batch: 8회, `25/25/25/25/25/25/25/13`
- 최종 parsed: 8-K 30건, Form 4 188건
- 8-K item entry: 73개, itemless 0건
- Form 4 reporting owner 398명, non-derivative transaction 1,120건, derivative transaction 120건, footnote 1,818개
- skipped 0, source unavailable 0, final parse error 0
- SEC 429/5xx: 0/0
- 작업 중 확인된 parser 원인: SEC Form 4 `primary_document`가 `xslF345X06/...` viewer path인 경우 HTML 변환본을 받아 `OWNERSHIP_DOCUMENT_MISSING`이 발생했습니다. raw XML path로 정규화하도록 `secPrimaryDocumentUrl`을 수정하고 영향 batch를 재처리했습니다.

DB 정합성:

| 항목 | 결과 |
| --- | --- |
| total detail rows | 218 |
| parsing status | `parsed:218` |
| form distribution | `4:188`, `8-K:30` |
| parser version | `sec-structured-v1:218` |
| duplicate detail accession | 0 |
| orphan detail rows | 0 |
| metadata rows | 226 |

공개 API 검증:

- `/api/market-sec-filings?limit=20`: `HTTP 200`, `ok:true`, 20건, structured row 20건, duplicate accession 0
- `form=8-K`: 20건, 첫 row TMHC `8.01`
- `form=4`: 20건, 첫 row QURE owner/transaction/footnote 표시
- `item=2.02`: 1건, MU `2.02`, `9.01`
- `item=5.02`: 4건, NVDA `5.02`
- `transactionCode=S`: 20건
- `transactionCode=P`: 0건. production detail의 거래 코드 분포가 `A:62`, `F:64`, `G:14`, `J:16`, `M:174`, `S:910`이라 현재 매수 코드 `P` row가 없습니다.
- `ownerRole=director`, `ownerRole=officer`, `ownership=direct`, `ownership=indirect`: 모두 `HTTP 200`, `ok:true`, structured rows 반환
- invalid `transactionCode`, `ownerRole`, `ownership`: 모두 안전하게 `HTTP 400`
- raw XML, secret, stack trace 노출 없음
- `limit=100` broad feed는 backfill 중 발생한 fallback cache가 만료된 뒤 `ok:true`, 100건, META row 포함으로 확인했습니다. 이후 unavailable 응답은 `no-store`가 되도록 cache header를 수정했습니다.

SEC 원문 대조:

- 8-K 3건: DELL `0001193125-26-296224` (`3.03`, `5.03`, `9.01`), NVDA `0001045810-26-000060` (`5.02`), MU `0000723125-26-000013` (`2.02`, `9.01`) 모두 SEC submissions item과 API item/한국어 label 일치
- Form 4 5건: META `0000950103-26-010283`, MU `0001632063-26-000003`, NVDA `0001197647-26-000005`, SMCI `0001392941-26-000011`, DELL `0001193125-26-290621` 모두 raw XML 대비 reporting owner, 역할/직책, transaction date/code/shares/price/acquired-disposed/ownership/shares after, derivative code, footnote count 일치

Production UI와 회귀:

- `/ko/disclosures` desktop: SEC 8-K Item, Form 4 보고자/거래/각주 안내, amended 구조, 회사명 -> 국가/ticker 순서, 원문 CTA 표시 확인
- `/ko/disclosures` filter: `2.02` item filter는 Micron 8-K로 축소, `S` transaction filter는 Form 4 sale rows와 footnote 안내 표시
- `/ko/disclosures` mobile `390x844`: horizontal overflow 0, SEC structured detail/owner names/source CTA/filter chip 표시, console error 0
- 미국 Pick 상세 5개: Meta, Micron, NVIDIA, Super Micro Computer, Dell 모두 가격 badge 유지, 기존 Pick 본문 유지, 해당 ticker SEC section만 표시, structured detail 표시, OpenDART section 미표시
- 국내 표본: SK하이닉스, 에스폴리텍, 금호건설 모두 OpenDART card 유지, SEC CTA 미표시
- OpenDART API: `/api/market-disclosures?limit=20` `HTTP 200`, `ok:true`, 18건
- 가격 API: `/api/market-prices?limit=200` `HTTP 200`, `ok:true`, 94개 고유 ticker, META 포함, 기존 KIS/Yahoo source 유지
- Headless Pick 상세 QA에서 `logo.clearbit.com` 외부 logo image DNS 실패가 일부 관측되었습니다. SEC/OpenDART/runtime 오류는 아니며 repo package 또는 lock file은 변경하지 않았습니다.

코드 수정과 검증:

- 수정: `scripts/sync-sec-filings.ts` raw Form 4 XML URL 정규화
- 수정: `api/market-sec-filings.ts` SEC unavailable/fallback 응답 `no-store`, 성공 응답만 `s-maxage=180, stale-while-revalidate=900`
- 수정: `scripts/validate-content.ts` `xslF345X06/` primary document URL validator 추가
- `git diff --check` 통과
- `tsc -p tsconfig.scripts.json` 통과
- `node .sync-build/scripts/validate-content.js` 통과
- `tsc --noEmit` 통과
- `vite build` 통과. 기존 `@xyflow/react` `"use client"` 및 chunk size 경고만 있음
- `package.json`, `package-lock.json` 변경 없음

## 전체 기업 회사명 중심 표시 통일

기업 식별 UI는 ticker를 첫 줄에 두던 방식에서 회사명을 첫 줄에 두는 방식으로 통일합니다.

변경 전:

```text
미국 · SMCI
한국 · 000720.KS
```

변경 후:

```text
슈퍼마이크로컴퓨터
미국 · SMCI
```

```text
현대건설
한국 · 000720.KS
```

공통 UI는 `src/App.tsx`의 `CompanyIdentity`, `CompanyIdentityForCompany`, `CompanyIdentityForPick`, `resolveCompanyIdentity`에서 처리합니다. 스타일은 `src/styles.css`의 `.company-identity`, `.company-identity__name`, `.company-identity__meta` 규칙에 둡니다.

회사명 해석 우선순위:

1. Pick 또는 공시 객체의 `companyName`
2. canonical company registry의 `name`
3. company registry의 `legalName`
4. 회사명이 없으면 `회사명 확인 필요` 표시

국가·ticker 보조 줄은 기존 registry의 `region`, `country`, `market`, `exchange`를 우선 사용하고, 국내 `.KS`/`.KQ` suffix는 `한국`으로만 fallback합니다. suffix 없는 ticker를 무조건 미국으로 추정하지 않습니다. `WATCH`, `PRIVATE`, `비상장`, `N/A`, `-` 같은 placeholder는 실제 ticker처럼 표시하지 않고 `관찰 대상` 또는 기존 상태 표현을 사용합니다.

적용 화면:

- 홈 `오늘 한눈에` Pick 목록
- `/ko/picks`, `/ko/picks/archive`, Pick 상세 hero
- `/ko/disclosures` OpenDART 공시 카드
- `/ko/market-map` 선택 기업, 같이 볼 회사, 관련 기업 카드, 오른쪽 선택 패널
- `/ko/category/us-semiconductors`
- `/ko/category/datacenter-power-cooling`
- `/ko/category/reconstruction-infrastructure`
- `/ko/category/semiconductor-cluster-infrastructure`
- 기업 분석 카드와 관련 기업 목록
- 기관/소유권 동향 카드

validator 추가 항목:

- Pick, company registry, anchor, 시장지도, OpenDART registry, 시장 카드의 회사명 누락 여부
- ticker와 완전히 같은 ticker-only companyName 여부
- 같은 ticker가 서로 다른 법적 회사명으로 충돌하는지 여부
- placeholder ticker가 실제 회사 식별자로 노출되는지 여부

로컬 검증 결과:

- `git diff --check` 통과
- `tsc -p tsconfig.scripts.json` 통과
- `node .sync-build/scripts/validate-content.js` 통과: 회사명 identity Pick 26개, 회사 893개, 앵커 61개, 지도 12개, 공시 13개, 시장 카드 4개 검증
- `tsc --noEmit` 통과
- `vite build` 통과. 기존 `@xyflow/react` `"use client"` 및 chunk size 경고만 있음
- 가격 API, 가격 sync, OpenDART sync, SEC API, Pick route/source/content는 수정하지 않았습니다.
- `package.json`, `package-lock.json` 변경 없음

## 기업 로고 외부 의존 제거

기업 로고 UI는 외부 logo API와 원격 브랜드 이미지를 런타임에서 요청하지 않습니다. 기존 문제는 `src/App.tsx`의 `companyLogoSources`와 `getCompanyLogoUrl`이 Clearbit/Wikimedia logo URL을 반환하고, `CompanyLogo`가 해당 URL을 `<img>`로 렌더링하면서 DNS 실패, broken image, layout shift 가능성을 만들던 점입니다.

변경 후 구조:

- `src/lib/companyLogo.ts`: `resolveCompanyLogo`, `resolveCompanyLogoMonogramText`, `localCompanyLogoRegistry`, monogram sample, placeholder ticker 규칙
- `src/App.tsx`: 전역 `CompanyLogo`가 resolver를 사용하고, 실패한 local asset URL은 세션 Set에 기록해 반복 요청을 막음
- `src/styles.css`: `.company-logo`, `.company-logo__image`, `.company-logo__monogram`, `.company-logo-tone-*`, `.node-company-logo`
- `scripts/validate-content.ts`: runtime Clearbit URL, legacy logo helper, registry 원격 URL, local asset 존재, monogram sample, duplicate ticker collision 검증

fallback 우선순위:

1. canonical `localCompanyLogoRegistry`의 실제 local asset
2. props로 받은 유효한 `localAssetPath`
3. `companyName` 기반 1-2자 monogram
4. 회사명이 없고 ticker가 유효하면 ticker 기반 monogram
5. 마지막 fallback은 `?`

placeholder ticker는 `WATCH`, `PRIVATE`, `N/A`, `-`, `비상장`, `UNKNOWN`이며, 회사명이 없으면 monogram으로 쓰지 않고 `?`를 표시합니다. `GOOGL`처럼 같은 상장사를 `Alphabet`과 `Google / Alphabet`으로 함께 쓰는 경우는 canonical monogram `AL`로 통일합니다.

monogram 표본:

```text
Meta -> ME
Micron -> MI
NVIDIA -> NV
Super Micro Computer -> SM
Dell Technologies -> DT
Taylor Morrison -> TM
Google / Alphabet + GOOGL -> AL
SK하이닉스 -> SK
에스폴리텍 -> 에스
금호건설 -> 금호
현대건설 -> 현대
동양파일 -> 동양
WATCH + 회사명 없음 -> ?
```

접근성:

- 회사명 텍스트가 같은 카드 안에 있는 로고는 decorative로 처리해 `aria-hidden="true"`를 유지합니다.
- standalone 사용이 필요하면 `decorative={false}`로 `role="img"`와 `${companyName} 로고` label을 사용할 수 있습니다.
- `alt="logo"`나 ticker-only alt는 사용하지 않습니다.

적용 화면:

- 홈, Pick, Pick archive, Pick 상세 cover
- `/ko/category/us-semiconductors`, `/ko/category/datacenter-power-cooling`
- 시장지도 관계 카드와 선택 기업 카드
- 기업 분석 hero, 관련 기업 목록, 오른쪽 선택 패널
- 향후 local logo asset이 추가되는 경우 같은 resolver와 validator를 거칩니다.

로컬 검증 결과:

- 제거된 Clearbit URL: 17개
- 제거된 외부 company logo source: 22개
- local logo registry: mapping 0개
- local asset: 0개, 총 0 bytes, missing 0개, SVG/PNG/WebP/JPG 0개
- monogram fallback 기업 record: 925개
- duplicate ticker collision: 0개
- runtime Clearbit URL: 0개
- legacy logo helper: 0개
- `logo.clearbit.com` request: 0
- 외부 회사 logo request: 0
- broken image/company image: 0
- local company logo 404: 0
- logo 관련 console error: 0
- horizontal overflow: desktop/390/360/320px 전체 0
- layout shift: 0
- local browser QA route: `/`, `/ko/`, `/ko/picks`, `/ko/picks/archive`, `/ko/disclosures`, `/ko/market-map`, `/ko/category/us-semiconductors`, `/ko/category/datacenter-power-cooling`, `/ko/category/reconstruction-infrastructure`, `/ko/category/semiconductor-cluster-infrastructure`, `/ko/reports`
- 화면 표본: 홈, Pick, archive, 공시, 시장지도 카드, 기업 상세/관련 기업, reports에서 회사명 텍스트 유지 확인

검증 명령:

```bash
git diff --check
./node_modules/.bin/tsc -p tsconfig.scripts.json
node .sync-build/scripts/validate-content.js
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/vite build
```

결과:

- `node .sync-build/scripts/validate-content.js`: CompanyLogo runtime Clearbit URL 0개, legacy helper 0개, local asset 0개, monogram 925개, 표본 16개
- `vite build`: `dist/assets/index-ChO1SIY5.css`, `dist/assets/index-B0_j_z79.js`
- 기존 허용 경고만 있음: `@xyflow/react` `"use client"`, chunk size
- `package.json`, `package-lock.json` 변경 없음

기능 회귀:

- 가격 API `/api/market-prices?limit=200`: HTTP 200, `ok:true`, 고유 ticker 94개, META 포함, KIS/Yahoo source 유지, 가격 sync 미실행
- OpenDART API `/api/market-disclosures?limit=20`: HTTP 200, `ok:true`
- SEC API `/api/market-sec-filings?limit=20`, `?item=2.02&limit=5`, `?transactionCode=S&limit=5`: HTTP 200, `ok:true`, 필터 route 유지
- 로고 작업으로 API 파일, Pick 본문/source/slug, price sync, OpenDART/SEC sync, Supabase 설정은 수정하지 않았습니다.

Production 대상:

- Vercel Project: `finance1`
- Branch: `main`
- Environment: `Production`
- Alias: `https://finance1-flax.vercel.app`
- 배포 성공 여부, deployment ID, commit SHA, production asset은 push 후 최종 QA 보고에 기록합니다.

## market-prices 최신 ticker별 조회 안정화

2026-06-29 주간 Pick 배포 뒤 가격 저장과 개별 ticker 조회는 정상인데, 홈과 `/ko/picks`가 쓰는 전체 가격 API에서 Meta와 기존 Yahoo ticker가 빠지는 회귀를 수정했습니다.

증상:

- 수정 전 production `/api/market-prices?limit=200`: 52 rows, unique ticker 52, duplicate ticker 0.
- source/currency 분포는 `kis-openapi` 52 / `KRW` 52뿐이었습니다.
- `META`, `NVDA`, `DELL`, `MU`, `SMCI`, `HTZ`는 개별 ticker API에는 있었지만 전체 API에는 없었습니다.
- validator 기준 가격 universe 95개 중 non-tradable label `비상장`을 제외하면, 전체 API에 없고 개별 API에는 있던 실제 가격 ticker는 42개였습니다.

실제 원인:

- 기존 API는 Supabase `market_prices` raw rows에 `order=as_of.desc,created_at.desc`와 요청 `limit`을 먼저 적용했습니다.
- 그 뒤 application에서 `company_id + ticker` 기준으로 dedupe했습니다.
- 2026-07-05 KIS sync가 만든 최신 국내 raw rows가 상위 200개를 차지하면서, 더 오래된 2026-07-02 Yahoo 최신 rows가 raw limit 밖으로 밀렸습니다.
- 반환된 응답 안의 duplicate ticker는 0이었지만, limit 의미가 "최종 고유 ticker 수"가 아니라 "raw snapshot 수"처럼 동작한 것이 문제였습니다.

수정 방식:

- `api/market-prices.js`만 수정했습니다.
- DB schema, migration, view, RPC는 추가하지 않았습니다.
- `market_prices`를 1,000 rows 단위로 pagination하여 읽고, 모든 읽은 rows에서 ticker별 대표 row를 먼저 선택합니다.
- ticker key는 `ticker.trim().toUpperCase()` 기준입니다.
- latest 선택 기준은 `정상 price row 우선 -> as_of desc -> created_at desc -> ticker/source stable tie-break`입니다.
- 그 뒤에 최종 `limit`을 적용합니다. 예: `limit=20`은 raw rows 20개가 아니라 고유 ticker 최신 row 20개입니다.
- 기존 API response schema인 `{ ok, source, limit, prices }`와 가격 row field명은 유지했습니다.
- API response header에는 stale 응답 방지를 위해 `Cache-Control: no-store`를 추가했습니다.
- 가격 sync, KIS provider, Yahoo provider, OpenDART, 주간 Pick selector, source registry는 수정하지 않았고 가격 sync도 다시 실행하지 않았습니다.

production API 검증:

| 항목 | 수정 전 | 수정 후 |
| --- | ---: | ---: |
| `/api/market-prices?limit=200` rows | 52 | 94 |
| unique ticker | 52 | 94 |
| duplicate ticker | 0 | 0 |
| `kis-openapi` rows | 52 | 52 |
| `yahoo-finance-chart` rows | 0 | 42 |
| `KRW` rows | 52 | 52 |
| `USD` rows | 0 | 42 |
| 전체 API에 없고 개별 API에 있던 실제 ticker | 42 | 0 |

- 수정 후 `newest asOf`: `2026-07-05T13:10:00.832Z`
- 수정 후 `oldest asOf`: `2026-07-02T20:00:00.000Z`
- `limit=20`은 rows 20, unique ticker 20, duplicate ticker 0으로 확인했습니다.
- production API 반영 확인 request id: `x-vercel-id = icn1::iad1::nkp6t-1783263570761-24bf847198d8`
- public HTML assets: `/assets/index-D3tCVlqv.js`, `/assets/index-CpZ3BdL7.css`. 이번 변경은 API 함수 변경이라 client asset hash는 유지됐습니다.
- Vercel CLI는 로컬에 없고 public endpoint와 unauth GitHub deployments API에서는 deployment ID가 노출되지 않아 deployment ID 자체는 확인하지 못했습니다. 반영 기준은 production API 동작과 commit SHA로 확인했습니다.

전체 API와 개별 ticker API 일치:

| ticker | source | currency | price | change | changePercent | asOf | full vs individual |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
| `000660.KS` | `kis-openapi` | KRW | `2425000` | `+238000.00` | `+10.88%` | `2026-07-05T13:09:51.482Z` | 일치 |
| `META` | `yahoo-finance-chart` | USD | `582.9` | `-25.00` | `-4.11%` | `2026-07-02T20:00:00.000Z` | 일치 |
| `050760.KQ` | `kis-openapi` | KRW | `1390` | `-22.00` | `-1.56%` | `2026-07-05T13:09:52.799Z` | 일치 |
| `002990.KS` | `kis-openapi` | KRW | `9500` | `-2230.00` | `-19.01%` | `2026-07-05T13:09:52.982Z` | 일치 |
| `228340.KQ` | `kis-openapi` | KRW | `3245` | `-1125.00` | `-25.74%` | `2026-07-05T13:09:53.174Z` | 일치 |
| `002380.KS` | `kis-openapi` | KRW | `489000` | `+19000.00` | `+4.04%` | `2026-07-05T13:09:53.357Z` | 일치 |
| `HTZ` | `yahoo-finance-chart` | USD | `2.12` | `-0.08` | `-3.64%` | `2026-07-02T20:00:01.000Z` | 일치 |
| `080220.KQ` | `kis-openapi` | KRW | `91500` | `+1800.00` | `+2.01%` | `2026-07-05T13:09:53.548Z` | 일치 |
| `NVDA` | `yahoo-finance-chart` | USD | `194.83` | `-2.31` | `-1.17%` | `2026-07-02T20:00:01.000Z` | 일치 |
| `DELL` | `yahoo-finance-chart` | USD | `394.32` | `-21.76` | `-5.23%` | `2026-07-02T20:04:40.000Z` | 일치 |
| `MU` | `yahoo-finance-chart` | USD | `975.56` | `-65.94` | `-6.33%` | `2026-07-02T20:00:01.000Z` | 일치 |
| `SMCI` | `yahoo-finance-chart` | USD | `27.22` | `-0.83` | `-2.96%` | `2026-07-02T20:00:00.000Z` | 일치 |
| `000720.KS` | `kis-openapi` | KRW | `115300` | `+100.00` | `+0.09%` | `2026-07-05T13:09:53.921Z` | 일치 |

production UI QA:

- `/`, `/ko/`: 대표 Pick SK하이닉스와 `오늘 한눈에` 신규 4개 모두 실제 가격 badge 표시. Meta는 `$582.9`, Yahoo, 기준 `07.03`으로 표시되며 `가격 준비 중`이 사라졌습니다.
- `/ko/picks`: SK하이닉스 -> Meta -> 에스폴리텍 -> 금호건설 순서 유지, 네 카드 모두 가격 표시.
- Meta 상세 `/ko/picks/pick-meta-ai-compute-cloud-option`: `$582.9`, Yahoo, 기준 `07.03` 표시.
- 신규 국내 상세 3개: SK하이닉스, 에스폴리텍, 금호건설 모두 한국투자/KRW 가격 표시.
- archive `/ko/picks/archive`: 동양파일, KCC, Hertz, 제주반도체, SMCI, MU, DELL, NVDA, 000720.KS 표본 가격 badge 정상. `WATCH` placeholder 1개는 기존 정책대로 가격 준비 중입니다.
- OpenDART 공개 API `/api/market-disclosures?limit=50`: HTTP 200, `ok: true`, items 20으로 회귀 없음.
- Mobile QA `390x844`: `/ko/`, `/ko/picks`, Meta 상세에서 horizontal overflow 0, price badge overflow 0, console error 0.

검증:

- latest-by-ticker 순수 fixture 통과: 중복 row, raw limit 회귀, `asOf` 동률 `created_at` tie-break, invalid price row, final limit 20.
- `git diff --check` 통과.
- `tsc -p tsconfig.scripts.json` 통과.
- `node .sync-build/scripts/validate-content.js` 통과: Pick 26개, Source 66개, 주간 컬렉션 5개, 대표 Pick SK하이닉스, 가격 universe 95개 target, OpenDART 감시 기업 13개.
- `tsc --noEmit` 통과.
- `vite build` 통과. 기존 `@xyflow/react` `"use client"` 및 chunk size 경고만 있음.
- `package.json`, `package-lock.json` 변경 없음.

## 이번 주 동양파일·KCC·Hertz·제주반도체 Pick 반영

2026년 6월 넷째 주 Pick을 아래 4개로 교체했습니다. 기존 Pick은 삭제하지 않고 보관함 주차만 이동했습니다.

| Pick | ticker | 이벤트 날짜 | 종가 기준 변동률 | 핵심 확인 |
| --- | --- | --- | --- | --- |
| 동양파일 | `228340.KQ` | 2026-06-26 | `+29.91%` | 호남권 반도체 클러스터 관련 보도와 PHC 파일 인프라 기대. 직접 수주 확정 표현은 쓰지 않음 |
| KCC | `002380.KS` | 2026-06-25 | `+11.27%` | 실리콘 수익성, 도료 이익, 투자자산 가치와 공개 증권사 전망. 목표주가 문구는 공개 보도 기준으로만 표시 |
| Hertz | `HTZ` | 2026-06-24 | `-40.71%` | PIK 채권과 주식 관련 자금조달 조건을 직접 촉발 요인으로, 중고차 잔존가치와 감가상각은 구조적 부담으로 분리 |
| 제주반도체 | `080220.KQ` | 2026-06-22 | `+17.24%` | 관세청 6월 1~20일 반도체 수출 호조와 중소형 팹리스 관심 확산. AI GPU 회사로 분류하지 않음 |

홈 대표 Pick은 `동양파일`로 교체했습니다. 홈 대표 카드 첫 메시지는 `반도체 회사가 아닌데 동양파일은 왜 상한가를 갔을까요?`이며, 보조 문구는 `정책 기대 ≠ 직접 수주`를 먼저 보이게 정리했습니다.

주차 이동 결과:

- 이번 주 Pick: 동양파일, KCC, Hertz, 제주반도체
- 지난주 Pick: Huntsman, uniQure
- 그 이전 주 Pick: SMCI, Micron, 현대건설, DraftKings
- 3주 전 Pick: Marvell, LG전자, Taylor Morrison
- 이전 Pick: Dell, Snowflake, NVIDIA, 삼성전자 등 기존 나머지 Pick 유지

공식·공개 근거:

- 동양파일: KIND 사업보고서와 분기보고서로 `228340.KQ`, PHC 파일 사업, 건설 기초자재 성격 확인. 호남권 반도체 클러스터는 SBS Biz/Daum 공개 보도와 Yahoo 공개 차트로 시장 반응만 확인했습니다.
- KCC: KIND 분기보고서로 `002380.KS`, 사업·재무 확인. 신한투자증권 목표주가 75만원 신규 제시와 실리콘·도료·투자자산 기대는 매일경제/머니투데이 공개 보도 기준으로만 반영했습니다.
- Hertz: Hertz 공식 발표로 3억 달러 PIK 채권 제안, 3억5천만 달러 6.75% PIK 채권 가격 확정, 37,037,037주 주당 2.70달러 보통주 대여 공모 확인. SEC S-3와 10-Q로 공모 구조, 부채, 차량 감가상각·잔존가치 부담을 확인했습니다.
- 제주반도체: KIND 사업보고서로 `080220.KQ`, 팹리스·저전력 메모리 사업 확인. 관세청 6월 1~20일 수출입 현황으로 반도체 수출 호조를 산업 배경으로만 사용했습니다.

완화하거나 제거한 초안 표현:

- 동양파일이 반도체 클러스터 공급사로 선정됐거나 직접 수주를 따낸 것처럼 보이는 표현은 제거했습니다.
- 호남권 반도체 클러스터는 공식 예산·착공·공급계약이 확정된 것으로 쓰지 않고, 공개 보도와 시장 기대 수준으로 낮췄습니다.
- KCC의 보유 투자자산 가치가 곧바로 주가에 반영된다고 단정하지 않았습니다.
- Hertz 폭락 원인을 렌터카 수요 둔화나 중고차 가격 하나로 단정하지 않고, 자금조달 조건과 구조적 차량 가치 부담을 분리했습니다.
- 제주반도체를 AI 반도체/GPU 기업으로 오해시키는 표현은 쓰지 않았습니다.

가격 row/fallback:

| ticker | 가격 row | source | currency | asOf |
| --- | --- | --- | --- | --- |
| `228340.KQ` | 없음 | `fallback-unavailable` | `KRW` | 없음 |
| `002380.KS` | 없음 | `fallback-unavailable` | `KRW` | 없음 |
| `HTZ` | 없음 | `fallback-unavailable` | `USD` | 없음 |
| `080220.KQ` | 없음 | `fallback-unavailable` | `KRW` | 없음 |

시장지도 연결 상태:

- 동양파일: 반도체 클러스터 / 산업단지 인프라 지도 준비 중
- KCC: 소재 / 실리콘 / 자산가치 지도 준비 중
- Hertz: 렌터카 / 차량 잔존가치 / 부채 지도 준비 중
- 제주반도체: 팹리스 / 저전력 메모리 시장지도 준비 중

로그인·유료·사용자 확인 필요 자료:

- KCC 증권사 원문 리포트는 홈페이지에 넣지 않았고, 공개 보도에서 확인 가능한 목표주가·전망 문구만 사용했습니다.
- 로그인 또는 유료 접근이 필요한 원문은 source link에 넣지 않았습니다.

근거 보기:

- 새 4개 Pick 모두 기본 접힘 상태의 `근거 보기`를 제공합니다.
- source 없는 빈 그룹은 렌더하지 않고, 원문 링크는 새 탭과 `rel="noreferrer noopener"`를 유지합니다.
- 이전 커밋 `a032762`의 밝은 테마 색상 수정이 유지되어 펼친 근거 본문은 `#f8fafc`와 흰색 카드 톤으로 표시됩니다.

남은 TODO:

- 반도체 클러스터 / 산업단지 인프라 지도
- 소재 / 실리콘 / 자산가치 지도
- 렌터카 / 차량 잔존가치 / 부채 지도
- 팹리스 / 저전력 메모리 지도
- production 가격 sync 후 `228340.KQ`, `002380.KS`, `HTZ`, `080220.KQ` row 저장 여부 재확인

## 이번 주 Pick 가격 데이터 연결

이번 주 Pick 4개 가격 연결 대상:

| ticker | provider | currency | provider lookup |
| --- | --- | --- | --- |
| `228340.KQ` | `kis-openapi` | `KRW` | KIS domestic code `228340` |
| `002380.KS` | `kis-openapi` | `KRW` | KIS domestic code `002380` |
| `080220.KQ` | `kis-openapi` | `KRW` | KIS domestic code `080220` |
| `HTZ` | `yahoo-finance-chart` | `USD` | Yahoo symbol `HTZ` |

누락 원인:

- 가격 API는 Supabase `market_prices`에 저장된 최신 row만 반환합니다.
- 가격 sync universe는 `REQUIRED_PRICE_TICKERS`, `mockMarketPrices`, `marketMovers`, `stockAutopsyPicks`, `anchors`, `companies`를 합쳐 만들며, 현재 코드에서는 `stockAutopsyPicks`가 이번 주 Pick ticker를 포함합니다.
- 운영 API 기준선 확인 시점에는 새 Pick 데이터가 아직 커밋·배포되지 않았고, 해당 ticker로 권한 있는 가격 sync도 실행되지 않아 네 ticker 모두 `fallback-unavailable`이었습니다.
- 로컬 컴파일 산출물 기준 `syncPrices()`의 `targetTickerCount`는 91개이며, 네 ticker 모두 target universe에 포함됩니다. 로컬에는 `KIS_APP_KEY/KIS_APP_SECRET`과 Supabase env가 없어 국내 3개는 KIS 저장까지 검증하지 못했고 Yahoo fallback 준비 결과만 확인했습니다.

수정·유지한 universe/normalization 방식:

- `scripts/sync-prices.ts`의 기존 universe 수집 구조를 유지합니다. 새 Pick ticker는 `stockAutopsyPicks.forEach((pick) => add(pick.ticker, pick.relatedCompanyId, pick.market))` 경로로 들어갑니다.
- `.KS`, `.KQ` tickers는 `scripts/price-sources/kis.ts`에서 `isKisDomesticTicker()`와 `kisDomesticSymbol()`을 통해 provider 호출 시점에만 6자리 종목코드로 변환합니다.
- DB 저장 ticker는 `228340.KQ`, `002380.KS`, `080220.KQ`처럼 사이트 canonical ticker를 유지합니다.
- `HTZ`는 Yahoo lookup alias 없이 `HTZ`로 전달됩니다.
- 가격 값은 코드나 Pick 데이터에 저장하지 않았습니다.

운영 API 기준선:

| 항목 | before |
| --- | --- |
| 전체 row 수 | 87 |
| `kis-openapi` rows | 47 |
| `yahoo-finance-chart` rows | 40 |
| `228340.KQ` | row 없음, `fallback-unavailable`, `KRW` |
| `002380.KS` | row 없음, `fallback-unavailable`, `KRW` |
| `080220.KQ` | row 없음, `fallback-unavailable`, `KRW` |
| `HTZ` | row 없음, `fallback-unavailable`, `USD` |

로컬 provider 진단:

| ticker | local provider result | price | change percent | asOf | 저장 |
| --- | --- | --- | --- | --- | --- |
| `228340.KQ` | Yahoo fallback success, KIS env missing locally | `2845` | `+0.35%` | `2026-06-26T06:30:05.000Z` | Supabase env 없음으로 저장 안 됨 |
| `002380.KS` | Yahoo fallback success, KIS env missing locally | `494500` | `-5.99%` | `2026-06-26T06:30:05.000Z` | Supabase env 없음으로 저장 안 됨 |
| `080220.KQ` | Yahoo fallback success, KIS env missing locally | `99200` | `-5.16%` | `2026-06-26T06:30:02.000Z` | Supabase env 없음으로 저장 안 됨 |
| `HTZ` | Yahoo success | `2.635` | `-0.94%` | `2026-06-26T15:24:00.000Z` | Supabase env 없음으로 저장 안 됨 |

자동 cron 확인:

- `vercel.json`의 가격 cron은 `/api/sync/prices`를 평일 `08:30 UTC`, `22:30 UTC`에 실행합니다.
- 현재 로컬에는 `CRON_SECRET`이 없어 curl로 production sync를 직접 트리거하지 않았습니다. Dashboard의 Cron Jobs `Run` 기능으로 secret 노출 없이 실행했습니다.
- Vercel Dashboard 기준 Cron Jobs는 Enabled이고 `/api/sync/prices`는 `30 8 * * 1-5`, `30 22 * * 1-5` 두 개로 등록돼 있습니다.
- 기존 row 삭제나 schema 변경 없이 `ticker + source + as_of` upsert 정책을 유지합니다.

production sync 최종 검증:

| 항목 | before | after |
| --- | ---: | ---: |
| 전체 row 수 | 87 | 91 |
| unique ticker 수 | 87 | 91 |
| `kis-openapi` rows | 47 | 50 |
| `yahoo-finance-chart` rows | 40 | 41 |
| duplicate ticker rows | 0 | 0 |

- 실행 방식: Vercel Dashboard `finance1` project, Settings > Cron Jobs, `/api/sync/prices` `Run`.
- 실행 시각: 2026-06-27 00:35:52.88 GMT+9, 즉 2026-06-26 15:35:52.88 UTC.
- HTTP status: 200.
- User agent: `vercel-cron/1.0`.
- Function duration: 17.84s / 5m.
- External API trace에서 Supabase `market_prices`, KIS token, KIS 국내 시세, Yahoo, Supabase `sync_runs` 호출을 확인했습니다.
- 성공 실행에는 `fatal`, `error`, `429`, `500`, `503` 문구가 없었습니다.
- 곧바로 두 번째 `Run`을 한 번 더 눌러 2026-06-27 00:36:36 GMT+9에 KIS token 1분 제한 경고가 한 번 남았습니다. 첫 실행에서 국내 3개 row는 이미 KIS로 저장됐고, 최종 API count/source count는 정상입니다.

신규 4개 ticker production 저장 결과:

| ticker | provider request | source | currency | price | API change percent | asOf | 저장 |
| --- | --- | --- | --- | ---: | ---: | --- | --- |
| `228340.KQ` | KIS code `228340` | `kis-openapi` | `KRW` | `2845` | `+29.91%` | `2026-06-26T15:35:56.192Z` | 성공 |
| `002380.KS` | KIS code `002380` | `kis-openapi` | `KRW` | `494500` | `-7.22%` | `2026-06-26T15:35:56.396Z` | 성공 |
| `080220.KQ` | KIS code `080220` | `kis-openapi` | `KRW` | `99200` | `-8.23%` | `2026-06-26T15:35:56.590Z` | 성공 |
| `HTZ` | Yahoo symbol `HTZ` | `yahoo-finance-chart` | `USD` | `2.635` | `-0.94%` | `2026-06-26T15:36:35.000Z` | 성공 |

회귀 확인:

- 기존 87개 row는 유지됐고, 신규 4개 추가 후 unique ticker 91개입니다.
- 국내 3개는 Yahoo fallback이 아니라 `kis-openapi` / `KRW`로 저장됐습니다.
- `HTZ`는 KIS/KRW가 아니라 `yahoo-finance-chart` / `USD`로 저장됐습니다.
- 표본 기존 ticker `SMCI`, `MU`, `VRT`, `NVDA`, `000720.KS`, `005930.KS`의 가격 row와 source/currency가 유지됐습니다.

production UI 확인:

- 확인 URL: `/`, `/ko/`, `/ko/picks`, 네 Pick 상세 route.
- 모바일 viewport: 390 x 844.
- 모든 확인 route에서 horizontal overflow 0, console error 0.
- 홈 동양파일, Pick 목록 네 종목, 상세 네 페이지에서 `가격 준비 중`/`가격 불러오는 중` 문구가 사라졌습니다.
- 동양파일, KCC, 제주반도체는 `한국투자`, 원화 가격, 기준일 `06.27`이 표시됩니다.
- Hertz는 `Yahoo`, 달러 가격, 기준일 `06.27`이 표시됩니다.
- 화면 price badge는 기존 UI 정책상 `시작가 대비` 등락률을 표시합니다. API provider row의 전일대비 등락률은 위 production 저장 결과 표에 기록했습니다.

## 반도체 클러스터 / 산업단지 인프라 시장지도 추가

새 route:

- `/ko/category/semiconductor-cluster-infrastructure`
- 기본 선택 기업: 동양파일 `228340.KQ`
- invalid query는 동양파일로 fallback합니다.

정책 사업 단계:

- 화면에서는 공식 확정 사업명처럼 쓰지 않고 `반도체 클러스터 정책 추진`으로 표현합니다.
- 호남권 또는 제2 반도체 클러스터 관련 기대는 공개 보도와 시장 반응 단계로만 취급합니다.
- 정부·지자체의 공식 확정 사업명, 예산, 부지, 착공 일정, 공장 발주, 동양파일 직접 공급계약은 현재 확인된 공식 자료 기준으로 확정하지 않았습니다.
- 기존 국가첨단산단·용인 반도체 클러스터 같은 공식 정책과 이번 호남권 기대를 섞어 쓰지 않습니다.

추가한 후보 기업:

| 기업 | ticker | status | 역할 | CTA |
| --- | --- | --- | --- | --- |
| 동양파일 | `228340.KQ` | Pick only | PHC 파일 / 기초 공사 | 관련 Pick 보기 |
| 현대건설 | `000720.KS` | Pick only | 대형 건설 / 공장·인프라 시공 | 관련 Pick 보기 |
| 삼성물산 | `028260.KS` | 시장 흐름 참고 | 건설 / EPC / 산업시설 | 시장 흐름에서 보기 |
| LS ELECTRIC | `010120.KS` | 시장 흐름 참고 | 배전 / 전력설비 / 자동화 | 시장 흐름에서 보기 |
| 효성중공업 | `298040.KS` | 시장 흐름 참고 | 변압기 / 전력망 | 시장 흐름에서 보기 |
| KCC | `002380.KS` | Pick only | 건축·산업용 소재 / 도료 | 관련 Pick 보기 |

6단계 시장 흐름:

1. 정책 추진
2. 부지·예산 확정
3. 산업단지·공장 발주
4. 기초 공사·전력·건축
5. 직접 공급계약
6. 매출·이익 검증

직접 공급계약 확인:

- 동양파일은 PHC 파일 업체로 표시하되 반도체 제조사로 표현하지 않습니다.
- 현재 확인된 동양파일의 반도체 클러스터 직접 공급계약은 없습니다.
- 그래프와 카드의 관계는 산업 흐름 설명용이며 실제 계약 관계를 뜻하지 않습니다.

관련 Pick 연결:

- 동양파일: `pick-dongyang-pile-semiconductor-cluster-infrastructure`
- 현대건설: `pick-hyundai-engineering-reconstruction-expectation`
- KCC: `pick-kcc-silicone-margin-asset-value`
- 현대건설·KCC Pick은 해당 클러스터 직접 수혜 근거가 아니라 각 기업의 사업 구조 참고 콘텐츠로만 연결합니다.

관련 산업 보고서:

- PwC `State of the semiconductor industry`: 반도체 투자와 공급망 흐름을 넓게 이해하기 위한 참고 자료
- Deloitte `2026 Engineering and Construction Industry Outlook`: 대형 건설 프로젝트가 발주, 수주, 원가와 마진으로 이어지는 구조를 이해하기 위한 참고 자료
- 보고서 카드는 `관련 산업 보고서` 섹션에만 표시하고, `근거 보기`에는 중복 표시하지 않습니다.

ReactFlow / query alias:

- ReactFlow 노드 수: 20
- edge 수: 28
- 기본 화면에서는 ReactFlow를 숨기고 `전체 연결 보기` 클릭 후 렌더합니다.
- query alias:
  - `?company=cluster-dongyang-pile`
  - `?company=cluster-hyundai-ec`
  - `?company=cluster-samsung-ct`
  - `?company=cluster-ls-electric`
  - `?company=cluster-hyosung-heavy`
  - `?company=cluster-kcc`
  - `?company=invalid` -> 동양파일 fallback

가격 badge:

- 동양파일 `228340.KQ`, 현대건설 `000720.KS`, KCC `002380.KS`는 기존 가격 API row를 재사용합니다.
- 삼성물산, LS ELECTRIC, 효성중공업은 현재 가격 row가 없으면 기존 `가격 준비 중` fallback을 사용합니다.
- 가격 sync, ticker universe, API, schema는 수정하지 않았습니다.

공식 source와 확인 상태:

- 동양파일/KCC는 KIND 공시를 우선 source로 사용합니다.
- 삼성물산과 LS ELECTRIC은 회사 공식 사업 페이지를 source로 추가했습니다.
- 효성중공업 공식 제품 페이지는 확인 시점에 500 응답이 있어 화면에는 DART 공시 검색으로 연결했습니다.
- 로그인·이메일·유료 자료는 추가하지 않았고 사용자 확인이 필요한 자료도 이번 변경에는 없습니다.

남은 TODO:

- 클러스터 사업 확정·예산·부지 추적
- 착공 일정 추적
- 동양파일 직접 수주 공시 추적
- 전력 공급 계획 보강
- 기업별 실제 공급계약 확인
- 산업단지 인프라 후보 기업 추가 검토

## 재건 / 인프라 시장지도 추가

- 새 읽기형 시장지도 route는 `/ko/category/reconstruction-infrastructure`입니다.
- `/ko/market-map`에서 `재건 / 인프라` 카드를 활성화하고 `시장 지도 보기`로 진입합니다.
- 현대건설은 `000720.KS`와 기존 `pick-hyundai-engineering-reconstruction-expectation`을 연결한 `Pick only` 상태입니다.
- 현대건설 선택 카드의 CTA는 `관련 Pick 보기`만 허용하며, 기업해설과 재무 숫자 CTA는 만들지 않습니다.
- 기본 화면은 `종전 기대감 -> 재건 수요 -> 인프라 발주 -> 수주 경쟁 -> 매출 / 이익 검증` compact 5단계 흐름을 먼저 보여줍니다.
- ReactFlow는 기본 화면에 렌더하지 않고 `전체 연결 보기`를 누른 뒤에만 표시합니다.
- `?company=reconstruction-hyundai-ec`와 `?company=hyundai-engineering-construction`은 현대건설을 선택하며, 알 수 없는 company query도 현대건설로 fallback합니다.

남은 TODO:

- 추가 후보 기업 조사
- 글로벌 EPC/건설/중장비/건자재 기업 후보
- 실제 발주/수주 source 보강
- 현대건설 기업해설/재무 연결은 별도 검토

## 재건 / 인프라 지도 후보 기업 1차 확장

재건 기대를 단일 건설사 테마로 단정하지 않고, 실제 발주와 착공 이후 함께 확인할 건설사·장비·소재 후보를 1차로 확장했습니다. 아래 관계는 직접 계약이나 확정 수주를 뜻하지 않습니다.

| 회사 | ticker | 역할 | connection status |
| --- | --- | --- | --- |
| 현대건설 | `000720.KS` | 해외 건설 / 인프라 / 플랜트 | `Pick only` |
| 삼성물산 | `028260.KS` | 건설 / EPC / 인프라 | `시장 흐름 참고` |
| 대우건설 | `047040.KS` | 해외 건설 / 플랜트 / 인프라 | `시장 흐름 참고` |
| HD현대인프라코어 | `042670.KS` | 건설장비 / 중장비 | `시장 흐름 참고` |
| POSCO홀딩스 | `005490.KS` | 철강 / 건자재 / 인프라 소재 | `시장 흐름 참고` |
| Caterpillar | `CAT` | 글로벌 중장비 | `시장 흐름 참고` |

- 기본 선택은 현대건설이며 기존 `pick-hyundai-engineering-reconstruction-expectation`과 `관련 Pick 보기`만 연결합니다. 현대건설의 기업해설/숫자 CTA는 계속 만들지 않습니다.
- 나머지 5개 후보도 기업해설/숫자 CTA 없이 `시장 흐름 참고`로만 표시합니다. 회사 카드를 선택하면 같은 지도 안에서 ticker, 거래소, 역할, 확인 포인트가 바뀝니다.
- compact 5단계는 수주 경쟁에 현대건설·삼성물산·대우건설을, 실적 검증에 HD현대인프라코어·POSCO홀딩스·Caterpillar와 매출·영업이익·현금흐름을 `대표 예시`로 표시합니다.
- `전체 연결 보기`에는 건설사 3개, 공사 진행, 건설장비 수요, 철강·소재 수요, 장비·소재 후보 3개를 추가했습니다. ReactFlow는 계속 버튼을 누른 뒤에만 렌더됩니다.
- 2026-06-19 운영 `market-prices` 확인에서 `000720.KS`만 가격 row가 있고 `028260.KS`, `047040.KS`, `042670.KS`, `005490.KS`, `CAT`는 없습니다. 기존 `PriceBadge`의 `가격 준비 중` fallback을 사용하며 price sync/API는 수정하지 않았습니다.
- Deere는 장비 기업이지만 이번 1차 재건 지도에서 연결 우선순위가 낮아 추가하지 않았습니다.
- 로컬 기본·후보 6개·invalid query와 기존 두 지도 route는 모두 HTTP 200입니다. 인앱 브라우저가 이전 충돌 상태에서 복구되지 않아 390px overflow와 클릭 전후 시각 QA는 미확인으로 남기며, 신규 브라우저 binary나 라이브러리는 설치하지 않았습니다.

남은 TODO:

- 각 후보 기업 source 보강
- 가격 universe 포함 여부 별도 점검
- 글로벌 EPC/건자재/중장비 후보 추가 검토
- 현대건설 기업해설/재무 연결 여부 별도 검토
- 실제 발주/수주 뉴스 source 보강

## 재건 / 인프라 시장지도 production 반영 확인

- 기능 구현 commit은 `b08f1f735b2c91563343f7ea06b4250b28819a43`입니다.
- 2026-06-19 최초 확인에서 local HEAD와 `origin/main`은 기능 commit으로 일치했지만, GitHub `Production – finance1` deployment record는 생성되지 않았습니다.
- 이 시점의 `https://finance1-flax.vercel.app`은 이전 asset인 `index-jLkwYM44.js`와 `index-CyGStBlb.css`를 계속 제공했습니다.
- 인앱 브라우저가 시작 단계에서 다시 충돌했고 로컬에는 Vercel CLI, token, project link가 없어 dashboard redeploy를 실행할 수 없었습니다.
- 따라서 README-only commit `49769ca1a92fc8df6c3150bf37ffcfcca09549b7`을 `main`에 push해 webhook을 최소 재트리거했습니다. 기능 코드는 변경하지 않았습니다.
- 재트리거 후 GitHub deployment ID `5112859152`, 환경 `Production – finance1`, SHA `49769ca1a92fc8df6c3150bf37ffcfcca09549b7`가 생성됐고 status는 `success`, 설명은 `Deployment has completed`입니다. 이 SHA는 기능 commit을 포함한 `main` HEAD입니다.
- 확인 대상 production domain은 `https://finance1-flax.vercel.app`입니다. HTML asset은 `index-jLkwYM44.js` / `index-CyGStBlb.css`에서 `index-D6BQRWxB.js` / `index-BS1zFfvp.css`로 교체됐고 새 JS bundle에서 재건 hero, route, `관련 Pick 보기` 문구를 확인했습니다.
- `/`, `/ko/`, `/ko/picks`, `/ko/picks/archive`, `/ko/market-map`, 재건 기본·두 alias·invalid query route, 현대건설 Pick 상세, `/ko/category/us-semiconductors`, `/ko/category/datacenter-power-cooling`은 모두 HTTP 200이며 새 asset을 참조합니다.
- 코드 계약 재확인에서 재건 기본 선택과 invalid fallback은 현대건설이고, 선택 카드 CTA는 `관련 Pick 보기`만 있습니다. 기업해설/숫자 CTA는 없으며 compact 5단계가 기본이고 ReactFlow는 `전체 연결 보기` 클릭 상태에서만 렌더됩니다. production 가격 API의 `000720.KS` KIS/KRW row도 유지됩니다.
- 기존 AI 반도체와 전력·냉각 route는 새 production asset으로 HTTP 200을 확인했습니다. 다만 인앱 브라우저가 계속 충돌해 두 화면의 시각 회귀 여부는 직접 확인하지 못했습니다.
- 390x844 모바일 `scrollWidth - innerWidth`, 버튼 가시성, compact 카드, ReactFlow 클릭 전후 overflow는 미확인입니다. 대체 Playwright package는 있었지만 실행 브라우저 binary가 없었고, 신규 다운로드 금지 조건에 따라 설치하지 않았습니다. `전체 연결 보기` 클릭 결과도 같은 이유로 시각 확인하지 못했으며 조건부 렌더링 코드만 재검증했습니다.

## 가격 기준일/source UI 강화

가격은 종목마다 수집 경로와 기준 시점이 다를 수 있으므로, 숫자만 보여주면 초보 사용자가 최신성이나 출처를 오해하기 쉽습니다. 이번 UI는 가격 API, KIS, sync 경로를 바꾸지 않고 이미 들어온 `source`, `asOf`, `currency`를 `PriceBadge`에서 더 읽기 좋게 드러냅니다.

source label 규칙은 다음과 같습니다.

- `kis-openapi` -> `한국투자`
- `yahoo-finance-chart` -> `Yahoo`
- 기타 fallback/import/manual/mock/example 계열 -> `보조`
- 그 외 값 또는 빈 값 -> `출처 확인 중`

`asOf`는 KST 기준으로 해석해 compact 날짜를 표시합니다. 배지 본문은 `기준 06.05`처럼 짧게 보여주고, 전체 기준일/시간은 hover title과 접근성 label에서 `주가 기준 2026.06.05 15:30 KST`처럼 제공합니다.

stale 판단 기준은 단순 calendar day 기준입니다.

- 0~2일: 정상 상태이며 별도 freshness 배지를 숨깁니다.
- 3~5일: `업데이트 지연` 배지를 조용하게 표시합니다.
- 6일 이상: `오래된 가격` 배지를 표시합니다.

적용 위치는 `PriceBadge` 공통, 기업해설 상단, 시장지도 선택 카드, Pick 목록/상세, 홈 대표 해부 카드, 홈 최근 해부 카드입니다. 가격이 없거나 기준일이 없을 때는 `가격 준비 중`, `출처 확인 중`, `기준일 확인 중`으로 낮춰 표시하고 같은 문구가 freshness 배지에서 반복되지 않게 합니다.

남은 TODO:

- 거래일 기준 stale 판단
- source 상세 tooltip
- 해외 KIS 확장

## 미국주식 Yahoo 가격 업데이트 점검

2026-06-18 00:31 Asia/Shanghai 기준 운영 URL은 `https://finance1-flax.vercel.app`로 확인합니다. `finance1.vercel.app`는 이 작업의 확인 대상이 아닙니다.

운영 API 확인 결과:

- `GET /api/market-prices?limit=200`는 200, `ok: true`, `source: supabase`로 응답했습니다.
- 응답 row는 83개이며 source 분포는 `kis-openapi` 46개, `yahoo-finance-chart` 37개입니다.
- currency 분포는 `KRW` 46개, `USD` 37개입니다.
- 전체 latest `asOf`는 `2026-06-12T09:07:25.134Z`, oldest `asOf`는 `2026-06-11T20:00:00.000Z`입니다.
- 미국 대표 ticker는 Yahoo source로 남아 있고 기준시각이 2026-06-11 미국장 마감 부근에 머물러 있습니다: `SMCI`, `MU`, `VRT`, `ETN`, `MRVL`, `NVDA`, `DELL`, `MSFT`, `GOOGL`.
- `DKNG`는 `limit=200` 응답에서 확인되지 않았습니다.
- 국내 확인 ticker 중 `005930.KS`, `000660.KS`, `066570.KS`는 `kis-openapi`, `KRW`를 유지합니다. `000720.KS`는 `limit=200` 응답에서 확인되지 않았습니다.
- `GET /api/sync/prices`는 인증 없이 401 `Unauthorized cron request`를 반환합니다. route 존재와 `CRON_SECRET` 보호 상태는 정상입니다.

cron schedule:

- 기존 가격 cron은 `30 8 * * 1-5`입니다. 한국장 마감 후 확인에는 맞지만 미국장 마감 후 별도 갱신이 없어 미국주식 기준시각이 길게 늦어 보일 수 있습니다.
- 이번 변경으로 `/api/sync/prices` cron을 `30 22 * * 1-5`에도 추가했습니다. 미국장 마감 후 Yahoo close가 반영될 가능성을 높이기 위한 최소 변경입니다.

문제 원인 판단:

- 프론트의 `/api/market-prices` 읽기 경로는 정상입니다. 가격 지연은 API cache보다 `market_prices` write 최신성 문제로 보는 것이 맞습니다.
- Yahoo chart source는 무료 공개 endpoint라 429가 발생할 수 있고, 이전 진단에서도 다수 ticker `Yahoo chart 429`와 import fallback 부재가 확인되었습니다.
- 현재 코드의 Yahoo 호출은 여러 ticker를 병렬로 빠르게 호출하므로 429에 취약할 수 있습니다.
- 단순 calendar day 기준 stale badge는 주말/휴일에 과민할 수 있지만, 이번 운영 데이터는 2026-06-11/12 기준에 머물러 있어 badge 기준만의 문제로 보기는 어렵습니다.
- 최신 `sync_runs`의 started_at, ended_at, inserted_count, source별 count는 공개 API만으로 확인할 수 없습니다. Vercel/Supabase dashboard 또는 인증된 SQL 접근으로 별도 확인해야 합니다.

수정한 내용:

- `scripts/sync-prices.ts`에서 Yahoo 호출 chunk를 8개 병렬에서 4개 병렬로 낮췄습니다.
- Yahoo 429 또는 5xx 응답은 한 번 짧게 재시도합니다.
- chunk 사이에 짧은 지연을 넣어 Yahoo chart endpoint에 대한 burst 요청을 줄였습니다.
- KIS 국내주식 로직, KIS env, KIS ticker 판별은 수정하지 않았습니다.
- `vercel.json`에 미국장 마감 후 가격 cron을 추가했습니다.

남은 TODO:

- Vercel Cron 실행 로그에서 `/api/sync/prices`의 실제 08:30/22:30 UTC 실행 성공 여부를 확인합니다.
- Supabase `sync_runs`에서 최신 `market-prices` run의 status, inserted_count, error_message, provider별 결과를 확인합니다.
- Yahoo 429가 계속되면 `PRICE_IMPORT_URL` 또는 `MARKET_PRICES_IMPORT_URL` fallback을 운영 환경에 추가합니다.
- stale badge는 calendar day가 아니라 거래일 기준으로 완화하는 작업을 별도 검토합니다.

## 2026-06-18 production 반영 확인

- 기능 커밋 `44567993da305260b9534729db175a08207c9035`를 `origin/main`에 push했습니다.
- Vercel `finance1` production deployment는 같은 commit SHA로 완료됐고 deployment ID는 `8YfQtCE9wErg8WFzMW7MxmqEHKWU`입니다.
- 운영 확인 URL은 `https://finance1-flax.vercel.app`입니다. production HTML asset은 `index-DIZJ0GhQ.js` / `index-qKf_3D3d.css`에서 `index-jLkwYM44.js` / `index-CyGStBlb.css`로 교체됐습니다.
- `/ko/category/datacenter-power-cooling`은 AI 반도체 지도와 같은 읽기형 구조로 반영됐습니다. 기본 화면에는 좌우 패널과 ReactFlow가 없고, `전체 연결 보기` 또는 `시장 흐름 보기` 이후에만 ReactFlow가 렌더됩니다.
- CTA는 Vertiv에 기업 해설/숫자/시장 흐름, Eaton과 Schneider Electric에는 기업 해설/숫자 CTA 없음, LG전자에는 관련 Pick만 노출되는 것으로 확인했습니다.
- 전력/냉각 기본 route와 네 회사 query route, `/ko/category/us-semiconductors`는 390px viewport에서 가로 overflow 0입니다.
- Yahoo 429 완화를 위한 4개 chunk, 재시도, chunk 지연과 08:30/22:30 UTC 가격 cron은 production commit에 포함됐습니다.
- 배포 직후 `/api/market-prices?limit=200`의 미국 대표 row는 여전히 `yahoo-finance-chart`이지만 `asOf`가 2026-06-11에 머물러 있습니다. 로컬에 `CRON_SECRET`이 없어 수동 sync는 실행하지 않았으며 다음 가격 cron 성공 후 재확인이 필요합니다.
- KIS 확인 결과 `005930.KS`, `000660.KS`, `066570.KS`는 `kis-openapi`와 KRW를 유지했습니다. `000720.KS`는 현재 `limit=200` 응답에 없습니다.
- `git diff --check`, 앱 TypeScript, scripts TypeScript, Vite production build가 모두 통과했습니다.

## Yahoo 가격 cron 재확인 및 현대건설 가격 포함 점검

2026-06-18 16:08 Asia/Shanghai 기준 production은 `https://finance1-flax.vercel.app`에서 확인했습니다.

- 가격 수정 commit은 `55754f5e03da58c4020fa0d1c94370c1e346ba91`, Vercel `finance1` production deployment ID는 `CvimZ71MDyTkapx1UoSEPmKe7GqY`입니다.
- Vercel Cron Jobs는 Enabled이며 `/api/sync/prices`에 `30 8 * * 1-5`와 `30 22 * * 1-5`가 모두 등록돼 있습니다. 시간대는 UTC이고 Hobby 플랜은 최대 1시간의 유연 실행 창이 있습니다.
- 22:30 UTC 일정은 미국 정규장 마감인 20:00 UTC(서머타임) 또는 21:00 UTC(표준시) 이후입니다. 08:30 UTC 일정과는 약 14시간 차이라 중복 실행 충돌은 없습니다.
- 수정 전 API는 83행, `kis-openapi` 46행, `yahoo-finance-chart` 37행이었습니다. 대표 USD ticker의 `asOf`는 2026-06-11이었고 `000720.KS`, `DKNG`는 없었습니다.
- `000720.KS`와 `DKNG`는 이미 `stockAutopsyPicks`를 통해 85개 가격 target universe에 포함돼 있었습니다. `.KS`는 KIS 대상으로 분기되고 `000720.KS`는 KIS 심볼 `000720`으로 변환됩니다.
- 첫 수동 cron trace는 provider 호출 후 `companies` upsert에서 끝나고 `market_prices` write가 없었습니다. 코드와 schema 대조 결과 동일 CIK `1674101`을 공유하는 두 Vertiv ID가 price target ID 변경 전후로 충돌한 것이 원인이었습니다.
- 가격 row의 company ID를 ticker 기준 canonical company로 정규화하고 company upsert payload를 ID 기준으로 dedupe했습니다. company가 없는 Pick ticker는 `company_id: null`로 가격 row를 저장합니다.
- 수정 배포 후 Vercel Dashboard에서 수동 cron을 실행했습니다. 2026-06-18 16:03:27 Asia/Shanghai 시작, HTTP 200, 약 17초였고 warning/error/fatal 및 Yahoo 429/5xx 로그는 없었습니다. trace에서 `companies`, `market_prices`, `sync_runs` POST를 모두 확인했습니다.
- 코드 및 trace 기준 sync payload와 `inserted_count`는 85개 ticker입니다. Supabase Dashboard는 별도 로그인이 필요해 `sync_runs` 행 자체는 직접 읽지 못했습니다.
- 수정 후 API는 86행, `kis-openapi` 48행, `yahoo-finance-chart` 38행입니다. 대표 USD ticker의 `asOf`는 2026-06-17 미국장 마감으로 갱신됐습니다.
- `000720.KS`는 `kis-openapi`, KRW, `asOf: 2026-06-18T08:03:32.373Z`로 생성됐습니다. `DKNG`는 `yahoo-finance-chart`, USD, `asOf: 2026-06-17T20:00:01.000Z`로 생성됐습니다.
- KIS 회귀 확인 결과 `005930.KS`, `000660.KS`, `066570.KS` 모두 2026-06-18 KIS row를 유지합니다. Pick과 시장 지도 가격 badge는 `최신`으로 표시됐습니다.
- calendar day 기반 stale 판정은 주말과 미국 휴일에 과민할 수 있으므로 거래일 기준 보정은 별도 TODO로 유지합니다.
- 수동 cron은 성공했습니다. 다음 자동 `08:30` 또는 `22:30 UTC` 실행은 Hobby 유연 창을 감안해 runtime log와 `asOf`를 한 번 더 확인합니다.

## 자동 cron 이후 가격 sync 안정화 재확인

2026-06-18 09:01 UTC까지는 자동 요청이 없었고, 작업을 09:07:39 UTC에 재개했습니다.

- production은 commit `7c78a4233b14e7ae25e9550f04e4a8b27e6dacad`, Vercel deployment `HMLoQ1XypLxNG6zbfPk4nS4wLr7x`입니다.
- `08:30 UTC` 자동 cron은 09:07:18.11 UTC에 `/api/sync/prices`로 실행됐습니다. 약 37분 지연으로 Hobby 1시간 유연 실행 창 안입니다.
- runtime log는 user agent `vercel-cron/1.0`, production/main, HTTP 200, duration 17.87초를 표시했습니다. 종료 시각은 약 09:07:36 UTC입니다.
- warning/error/fatal은 모두 0이며 Yahoo 429/5xx와 KIS 실패 로그가 없습니다. 코드와 성공 trace 기준 price payload 및 `inserted_count`는 85개 ticker입니다. Supabase `sync_runs` 행 자체는 별도 로그인 제한으로 직접 읽지 못했습니다.
- 자동 실행 후 `/api/market-prices?limit=200`는 HTTP 200, `ok: true`, 86행을 유지했습니다. source 분포는 `kis-openapi` 48행, `yahoo-finance-chart` 38행입니다.
- 자동 실행 약 5분 39초 뒤인 09:12:57 UTC에도 86행과 source 분포, `000720.KS`와 `DKNG`의 `asOf`가 동일하게 유지됐습니다.
- 미국 대표 10종 `SMCI`, `MU`, `VRT`, `ETN`, `DKNG`, `MRVL`, `NVDA`, `DELL`, `MSFT`, `GOOGL`은 모두 Yahoo/USD이며 `asOf`는 2026-06-17 20:00~20:03 UTC 미국장 마감 기준을 유지합니다. 자동 실행 사이에 새 미국장 마감이 없어 timestamp가 유지되는 것이 정상입니다.
- 한국 대표 4종 `005930.KS`, `000660.KS`, `066570.KS`, `000720.KS`는 모두 KIS/KRW이며 `asOf`가 2026-06-18 09:07:20~09:07:22 UTC로 갱신됐습니다.
- `000720.KS`는 133,200원 KIS row를 유지했고 `DKNG`는 26.32달러 Yahoo row를 유지했습니다. canonical company 정규화와 Pick-only ticker 저장은 자동 실행에서도 회귀하지 않았습니다.
- 홈, Pick 목록/보관함, SMCI/Micron/현대건설/DraftKings 상세, Vertiv 분석, 전력·냉각 지도, AI 반도체 지도에서 가격 badge와 source label을 확인했습니다. 과도한 stale label은 없었고 390px 가로 overflow는 전 route 0입니다.
- 자동 cron과 저장 안정성이 확인돼 즉시 추가 재확인은 필요하지 않습니다. `22:30 UTC` 실행은 정기 운영 모니터링 대상으로 남깁니다.

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

### 시장지도 기업 연결 상태 audit

전체 관계 보기는 산업 흐름을 한 번에 이해하기 위한 고급 참고 화면입니다. 모든 노드를 즉시 기업해설과 공식 재무 API에 연결하지 않습니다. 핵심 Pick과 재무 쉽게 보기 동선에 필요한 기업을 먼저 연결하고, 보조 기업은 빈 상세 화면으로 보내지 않도록 `시장 흐름 참고` 또는 `해설 준비 중`으로 낮춰 표시합니다.

상태 분류 기준은 다음과 같습니다.

- 완전 연결: 시장지도 노드, 기업해설 페이지, `/api/financials` direct/partial 또는 20-F/OpenDART 연결이 모두 확인된 기업입니다. 지도와 대표 기업 chip에서 `기업해설 보기`, `숫자 3개 보기`를 활성화합니다.
- 부분 연결: 시장지도 노드와 기업해설은 열 수 있지만 공식 재무 연결이 아직 확인되지 않은 기업입니다. 기업해설 이동은 가능하되 재무 CTA는 `재무 연결 준비 중`으로 낮춥니다.
- 지도 참고 기업: 전체 관계 이해를 위한 노드입니다. 노드 선택은 가능하지만 기업해설/재무 상세로 이동하지 않습니다.
- 후순위/준비 중: 원익IPS 같은 관계도 보조 기업입니다. 클릭 시 노드 선택만 하고, 상세 페이지처럼 보이는 CTA를 제공하지 않습니다.

2026-06-05 운영 기준 URL `https://finance1-flax.vercel.app/api/financials`로 전체 관계 보기 24개 노드의 상태만 확인했습니다. 관계도 전용 데이터 23개와 기존 NVIDIA 앵커를 함께 audit했으며, API 구현은 확장하지 않았고 실패하거나 미연결인 기업은 연결 후보로만 남깁니다.

완전 연결 기업:

- Dell
- NVIDIA
- SK하이닉스
- AMD
- TSMC
- ASML
- Micron
- Broadcom
- Microsoft
- Google / Alphabet
- Super Micro
- Vertiv
- 삼성전자

부분 연결 기업:

- 현재 1순위 audit 범위에서는 별도 부분 연결 기업을 두지 않습니다. 추후 기업해설만 먼저 열고 재무 API가 없는 기업이 생기면 이 상태로 분리합니다.

지도 참고 기업:

- Amazon
- Intel
- Marvell
- Arista Networks
- Eaton
- Schneider Electric

후순위/준비 중 기업:

- 한미반도체
- 리노공업
- ISC
- 원익IPS
- 솔브레인

UI 적용 규칙:

- 완전 연결 기업만 `숫자 3개 보기`를 활성화합니다.
- 기업해설 연결이 없는 기업은 노드 선택만 가능하고 `/ko/analysis/...`로 이동하지 않습니다.
- 준비 중 기업 chip과 카드에는 `해설 준비 중` 또는 `시장 흐름 참고` badge를 표시합니다.
- 원익IPS는 상장기업이지만 현재 핵심 Pick/재무 쉽게 보기 흐름에서는 후순위 연결 후보로 두며, 빈 분석 페이지로 보내지 않습니다.

추후 연결 우선순위:

1. Dell, NVIDIA, SK하이닉스, AMD, TSMC, ASML, Micron, Broadcom, Microsoft, Google, Super Micro, Vertiv, 삼성전자
2. 원익IPS 등 관계도 보조 기업. 산업 흐름 이해에는 중요하지만 현재 Pick/재무 쉽게 보기 핵심 흐름에서는 준비 중 처리합니다.

### 향후 산업 데이터 연결 후보

이번 MVP에서는 산업 평균 PER/PBR/마진을 화면에 표시하지 않습니다. 출처가 검증된 API를 연결하기 전까지 `산업 평균 데이터 연결 필요`, `경쟁사 비교 데이터 연결 필요` 상태를 유지하고, 가격 데이터로 PER/PBR을 임의 계산하지 않습니다.

### 재무 API direct 응답 프론트 fallback 표시 수정

2026-06-05 기준으로 운영 `https://finance1-flax.vercel.app/api/financials`는 완전 연결 기업에 대해 `country`, `companyId`, `cik` 또는 `corpCode`가 함께 전달될 때 `sourceStatus: direct`와 raw numeric `metrics`를 반환합니다. `companyId`만 단독으로 호출하면 일부 기업은 placeholder/not-found가 될 수 있으므로, 프론트 호출은 회사 식별자를 함께 보냅니다.

fallback처럼 보인 원인은 두 가지였습니다.

- 로컬 Vite 단독 실행에서는 `/api/financials`가 서버리스 JSON이 아니라 `api/financials.ts` 모듈로 응답할 수 있어 프론트 fetch가 null로 떨어졌습니다. 로컬 QA용 Vite proxy를 `https://finance1-flax.vercel.app/api/financials`에 연결해 같은 URL 경로로 JSON을 받도록 했습니다.
- 재무 쉽게 보기 v3 계산은 API raw numeric 대신 compact string을 역파싱했습니다. API direct 응답의 `revenue`, `operatingIncome`, `operatingCashFlow` 등 raw metric을 `FinancialStatementSummary.rawMetrics`에 보존하고, 영업이익률/현금흐름 비율 계산은 raw numeric을 우선 사용합니다.

정상으로 인정하는 응답은 `sourceStatus: direct` 또는 `sourceStatus: partial`입니다. US SEC 응답은 `SEC CompanyFacts`, `10-Q`/`10-K`/`20-F`, `currency`, `asOf`, `fiscalYear`, `fiscalPeriod`, `comparison`을 가능한 범위에서 사용합니다. KR 응답은 `OpenDART`, `corpCode`, `OpenDART 1분기보고서 CFS` 같은 report label, `KRW`, `comparison`을 사용합니다. API가 direct라도 일부 숫자가 없으면 해당 카드만 `공식 데이터 연결 필요`로 남기고, 없는 값을 만들지 않습니다.

확인한 완전 연결 기업:

- Dell, NVIDIA, SK하이닉스, AMD, TSMC, ASML, Micron, Broadcom, Microsoft, Google / Alphabet, Super Micro, Vertiv, 삼성전자

확인 결과:

- 13개 모두 운영 API에서 `sourceStatus: direct`와 `revenue`, `operatingIncome`, `operatingCashFlow` raw numeric을 반환합니다.
- Dell, NVIDIA, AMD, Microsoft, Super Micro, Vertiv는 로컬 프록시 화면에서 영업이익률/현금흐름 비율/비교 카드가 표시되는 것을 확인했습니다.
- TSMC와 ASML은 20-F 숫자와 통화(TWD/EUR)를 표시하고, comparison이 없는 성장 카드는 대기 상태로 남기는 것이 정상입니다.
- SK하이닉스와 삼성전자는 OpenDART direct 숫자와 원화 compact 표시를 확인했습니다. OpenDART cold 응답은 길 수 있어 KR timeout은 60초로 둡니다.
- 원익IPS 같은 준비 중 기업과 존재하지 않는 분석 route는 기업 해설 shell로 들어가지 않도록 유지합니다.

남은 TODO:

- 로딩 중에는 fallback 문구 대신 `공식 숫자 확인 중` 계열 상태를 별도 표시하는 개선을 검토합니다.
- OpenDART 응답 시간을 줄이려면 운영 캐시 또는 사전 sync 경로를 별도 작업으로 검토합니다.

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

#### KIS Cron 이후 운영 재확인

확인 일시: 2026-06-04 15:12 UTC / 2026-06-04 23:12 CST 기준입니다.

Vercel project/deployment:

- project: `finance1`
- 운영 기준 domain: `https://finance1-flax.vercel.app`
- KIS pilot 구현 commit `fc08ce8`은 GitHub commit status 기준 `Vercel - finance1` deployment `success`입니다.
- KIS 운영 검증 문서화 commit `5baa023`도 GitHub commit status 기준 `Vercel - finance1` deployment `success`입니다.
- 사용자 확인 기준 Production env에는 `KIS_APP_KEY`, `KIS_APP_SECRET`, `KIS_ENV=production`, `KIS_PROD_BASE_URL`이 있습니다.
- Codex는 KIS app key, app secret, access token, CRON_SECRET, Supabase key 값을 열람하거나 출력하지 않았습니다.
- 로컬에는 Vercel CLI와 `.vercel/project.json`이 없어 dashboard env 이름 존재 여부와 Cron execution log는 직접 확인하지 못했습니다.

Cron/function 실행 확인:

- `https://finance1-flax.vercel.app/api/sync/prices`를 secret 없이 호출하면 401 `Unauthorized cron request`입니다. 보호 route 동작으로 정상입니다.
- `vercel.json`의 가격 Cron schedule은 `30 8 * * 1-5`입니다.
- 확인 시점은 2026-06-04 15:12 UTC이고, KIS 구현 commit의 `finance1` 배포 완료 시각은 2026-06-04 15:03:48 UTC입니다. 따라서 같은 날 08:30 UTC 정기 Cron은 KIS 코드 배포 전에 이미 지난 상태입니다.
- 공개 경로로는 Vercel dashboard의 최근 Cron status code, function log, timeout 여부를 확인할 수 없었습니다.
- GitHub Actions 최신 scheduled run은 2026-06-04 11:38 UTC에 이전 commit `79b9921` 기준으로 실행되었습니다. KIS 구현 commit 이후 GitHub Actions run은 없고, 현재 workflow env에도 KIS env가 전달되지 않아 KIS 검증 경로로 쓰지 않았습니다.

Supabase 확인 결과:

- Supabase dashboard/SQL 세션은 이번 확인에서 직접 접근하지 못했습니다.
- 공개 운영 API가 Supabase `market_prices`를 읽으므로 `/api/market-prices?limit=200` 결과를 read-through 확인으로 사용했습니다.
- `sync_runs` 최신 status와 error summary는 공개 endpoint가 없어 확인하지 못했습니다.

운영 API 확인 결과:

- endpoint: `https://finance1-flax.vercel.app/api/market-prices?limit=200`
- status: 200
- row count: 81
- latest `asOf`: `2026-06-02T20:04:31.000Z`
- source 분포: `yahoo-finance-chart` 81 rows
- `005930.KS`: source `yahoo-finance-chart`, currency `KRW`, price `360500`, asOf `2026-06-02T06:30:12.000Z`
- `000660.KS`: source `yahoo-finance-chart`, currency `KRW`, price `2360000`, asOf `2026-06-02T06:30:28.000Z`
- API 기준으로는 `005930.KS`, `000660.KS` 모두 아직 `kis-openapi`로 갱신되지 않았습니다.

최종 판단:

- 현재 분류는 `Cron 실행 대기`입니다.
- KIS 코드와 문서화 commit은 Production에 배포되었지만, KIS 코드 배포 이후 정기 가격 Cron이 아직 도래하지 않았습니다.
- 운영 API에는 아직 KIS row가 없고 기존 Yahoo stale row만 있습니다.
- KIS token 문제, endpoint 권한 문제, parse/normalize 문제, Supabase upsert 문제, API read 문제는 sync 실행 후에만 판정할 수 있습니다.

다음 액션:

1. 다음 Vercel 가격 Cron인 2026-06-05 08:30 UTC 이후 다시 `/api/market-prices?limit=200`을 확인합니다.
2. Vercel dashboard에서 `/api/sync/prices` 최근 Cron execution status code와 function log를 확인합니다.
3. Supabase SQL Editor에서 `market_prices`의 `005930.KS`, `000660.KS` source/as_of/currency와 `sync_runs` 최신 status/error summary를 확인합니다.
4. 더 빠른 검증이 필요하면 Vercel dashboard에서 secret 노출 없이 `/api/sync/prices`를 수동 실행할 수 있는지 확인합니다.

#### KIS 국내주식 pilot Cron 이후 가격 업데이트 검증

확인 일시: 2026-06-07 06:39 UTC / 2026-06-07 14:39 CST 기준입니다.

Vercel project/Cron 확인:

- project: `finance1`
- 운영 기준 domain: `https://finance1-flax.vercel.app`
- Vercel dashboard에서 `finance1-flax.vercel.app`이 `finance1` project에 연결된 것을 확인했습니다.
- Production env 이름은 `KIS_APP_KEY`, `KIS_APP_SECRET`, `KIS_ENV`, `KIS_PROD_BASE_URL`이 존재합니다. 값은 열람하거나 출력하지 않았습니다.
- dashboard project state에서 Cron 설정은 enabled 상태로 보이며, `disabledAt`은 `null`입니다.
- `/api/sync/prices` Cron path와 schedule `30 8 * * 1-5`가 project state와 `vercel.json`에서 일치합니다.
- `https://finance1-flax.vercel.app/api/sync/prices`를 secret 없이 직접 호출하면 401 `Unauthorized cron request`입니다. 보호 route 동작으로 정상입니다.
- Vercel Logs UI는 이번 세션에서 최근 30분 범위만 확인 가능해 2026-06-05 09:17 UTC 실행의 HTTP status code를 직접 확인하지 못했습니다. 해당 시간대 성공 여부는 아래 Supabase `sync_runs`로 확인했습니다.

Supabase 확인 결과:

- `market_prices`에는 `updated_at` 컬럼이 없고 `created_at` 컬럼이 있어, 요청 SQL의 `updated_at`은 `created_at`으로 대체해 확인했습니다.
- `005930.KS`: 최신 row는 source `kis-openapi`, price `329000`, currency `KRW`, `as_of = 2026-06-05T09:17:04.270Z`, `created_at = 2026-06-05 09:17:13.727+00`입니다.
- `000660.KS`: 최신 row는 source `kis-openapi`, price `2070000`, currency `KRW`, `as_of = 2026-06-05T09:17:04.869Z`, `created_at = 2026-06-05 09:17:13.727+00`입니다.
- 두 ticker 모두 기존 Yahoo row의 `as_of = 2026-06-02`보다 최신으로 전진했습니다.
- 두 ticker의 source 집계는 `kis-openapi` 2 rows, latest `as_of = 2026-06-05T09:17:04.869Z`; `yahoo-finance-chart` 20 rows, latest `as_of = 2026-06-02T06:30:28.000Z`입니다.
- `sync_runs` 최신 가격 run은 `market-prices`, status `success`, `started_at = 2026-06-05 09:17:01.911+00`, `ended_at = 2026-06-05 09:17:16.236+00`, `inserted_count = 81`, `updated_count = 0`, error 없음입니다.

운영 API 확인 결과:

- endpoint: `https://finance1-flax.vercel.app/api/market-prices?limit=200`
- status: 200
- row count: 81
- latest `asOf`: `2026-06-05T09:17:13.089Z`
- oldest `asOf`: `2026-06-04T19:59:59.000Z`
- source 분포: `kis-openapi` 45 rows, `yahoo-finance-chart` 36 rows
- `kis-openapi` row가 운영 API에도 존재합니다.
- `005930.KS`: source `kis-openapi`, currency `KRW`, price `329000`, asOf `2026-06-05T09:17:04.270Z`, marketStatus `delayed`
- `000660.KS`: source `kis-openapi`, currency `KRW`, price `2070000`, asOf `2026-06-05T09:17:04.869Z`, marketStatus `delayed`

최종 판단:

- 현재 분류는 `KIS 성공`입니다.
- `005930.KS`, `000660.KS` 모두 `kis-openapi`로 갱신되었고, asOf가 기존 2026-06-02 Yahoo row보다 최신으로 전진했습니다.
- Supabase DB와 운영 API read-through가 같은 KIS row를 보여주므로 `Supabase upsert 문제`와 `API read 문제` 증거는 없습니다.
- KIS token 발급 실패, 국내 현재가 endpoint 권한 문제, parse/normalize 문제 증거도 없습니다.
- Vercel Cron의 해당 실행 HTTP status code 자체는 dashboard log 범위 제약 때문에 직접 확인하지 못했지만, `sync_runs` 성공 기록과 운영 API 갱신 결과가 실행 성공을 뒷받침합니다.

다음 액션:

1. 다음 평일 Cron 이후에도 `005930.KS`, `000660.KS`가 `kis-openapi`로 유지되고 asOf가 전진하는지 모니터링합니다.
2. Vercel에서 과거 Logs/Observability 범위를 열 수 있는 권한 또는 플랜이 확보되면 2026-06-05 09:17 UTC 전후 `/api/sync/prices` HTTP status code를 별도 확인합니다.
3. 국내 pilot을 확대하기 전에는 `market_prices`의 KIS source count, `sync_runs.market-prices` status, Yahoo fallback count를 함께 확인합니다.

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

홈은 `currentWeeklyDigest` export를 기준으로 표시되는 주간 해부 피드입니다. 실제 Pick 본문과 주차 운영 데이터는 `src/content/picks`에서 관리하고, `src/data.ts`는 기존 import 계약을 위한 re-export만 제공합니다. 제작자는 주중에 인스타그램/Threads에 짧은 해부 콘텐츠를 올리고, 토요일에 그 주에 분석한 종목 3~5개를 주차 파일로 등록해 사이트 홈을 갱신합니다.

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
- `featuredPickId`는 최신 주차의 `representativePickId`에서 자동 계산합니다.
- `recentItems`는 최신 주차의 `pickIds`에서 자동 계산합니다. 대체 설계에서 `recentPickIds`를 쓰더라도 같은 역할입니다.
- `market`은 미국/한국 구분에 사용합니다. 현재 타입 기준으로 `US`, `KR`을 사용합니다.
- `movement` 운영 입력값은 급등/급락/실적/이슈 구분입니다. 현재 데이터 구조에서는 `movementLabel`에 넣습니다.
- `theme`은 AI 서버, 전력 인프라, 바이오처럼 이번 움직임이 속한 테마입니다.
- 실제 상세 페이지가 없는 항목은 `coming-soon` 또는 `target: 'analysis'`처럼 상세 연결이 없음을 분명히 처리합니다.
- 실제 링크가 없는 항목은 `href`를 만들지 않습니다. 빈 링크나 가짜 URL을 넣지 않습니다.

### 주간 Pick 콘텐츠 모듈화 및 자동 주차 관리

현재 Pick 데이터 구조:

```text
src/content/picks/
├─ entries.ts
├─ index.ts
├─ legacy.ts
├─ registry.ts
├─ selectors.ts
├─ types.ts
└─ weeks/
   ├─ index.ts
   ├─ 2026-06-08.ts
   ├─ 2026-06-12.ts
   ├─ 2026-06-15.ts
   └─ 2026-06-22.ts
```

`WeeklyPickCollection` schema:

```ts
export type WeeklyPickCollection = {
  weekOf: string;
  label?: string;
  representativePickId: string;
  pickIds: string[];
  publishedAt?: string;
  status?: 'published' | 'draft';
  archiveDescription?: string;
};
```

계산 방식:

- `weeklyPickCollections`는 `weekOf` 내림차순으로 정렬합니다.
- 가장 최신 주차가 `currentWeeklyCollection`이 됩니다.
- 홈 대표 Pick은 `currentWeeklyCollection.representativePickId`로 자동 선택합니다.
- `/ko/picks`는 `currentWeeklyCollection.pickIds` 순서의 `currentWeeklyPicks`를 사용합니다.
- `/ko/picks/archive`는 최신 주차를 제외한 주차를 `지난주 Pick`, `그 이전 주 Pick`, `3주 전 Pick`으로 자동 묶고, 남은 오래된 Pick은 `legacyArchivePicks`로 `이전 Pick`에 유지합니다.
- `src/data.ts`는 `stockAutopsyPicks`, `currentWeeklyDigest`, `weeklyDigest`, `representativePick`, `currentWeeklyPickOrder`, `previousWeekArchivePickOrder`, `archivedWeeklyPickGroups` 등 기존 import가 기대할 수 있는 export를 re-export합니다.
- 상세 route는 기존처럼 Pick `id`를 사용합니다. `pickBySlug`는 현재 `pickId ?? id`를 slug 호환 키로 보관합니다.
- 가격 universe는 기존 `scripts/sync-prices.ts` 흐름을 유지합니다. `stockAutopsyPicks`가 새 모듈에서 re-export되므로 sync script는 수정하지 않고 전체 Pick ticker를 계속 수집합니다.

현재 주차 구조:

| archive 표시 | weekOf | Pick |
| --- | --- | --- |
| 이번 주 Pick | `2026-06-22` | 동양파일, KCC, Hertz, 제주반도체 |
| 지난주 Pick | `2026-06-15` | Huntsman, uniQure |
| 그 이전 주 Pick | `2026-06-12` | SMCI, Micron, 현대건설, DraftKings |
| 3주 전 Pick | `2026-06-08` | Marvell, LG전자, Taylor Morrison |
| 이전 Pick | legacy | Dell, Snowflake, NVIDIA, 삼성전자 등 기존 Pick |

주차 날짜 메모:

- `2026-06-22`와 `2026-06-15`는 Pick 본문 `publishedAt`와 기존 README 주차 기록을 기준으로 사용합니다.
- SMCI, Micron, 현대건설, DraftKings 묶음은 기존 화면 순서를 보존하기 위해 네 Pick의 `publishedAt`인 `2026-06-12`를 사용합니다.
- Marvell, LG전자, Taylor Morrison은 기존 README의 2026년 6월 둘째 주 기록과 본문 `publishedAt: 2026-06-08`을 사용합니다.
- 그 이전 Pick은 날짜 정리가 끝나지 않았으므로 억지로 주차 파일에 넣지 않고 legacy archive로 유지합니다.

검증:

```bash
npm run validate:content
```

validator는 실제 export된 TypeScript 데이터를 import해 다음을 확인합니다.

- Pick id/slug 중복, 필수 필드, 체크포인트
- 주차 `weekOf`, 중복 주차, 중복 Pick, 대표 Pick 포함 여부
- 보고서 `relatedPicks`, 시장지도 evidence Pick, 시장지도 route 참조
- source URL 형식
- Pick only 지도 항목의 기업해설/숫자 CTA 연결 방지
- 국내 ticker 형식과 현재 주차 ticker의 가격 universe 포함 여부

새 주간 Pick 추가 절차:

1. `src/content/picks/entries.ts`에 Pick 콘텐츠 객체를 추가합니다.
2. `src/content/picks/weeks/YYYY-MM-DD.ts`를 만들고 `representativePickId`와 `pickIds`를 지정합니다.
3. 필요한 홈 대표 문구가 있다면 `selectors.ts`의 featured/recent template에 복사만 추가합니다.
4. `npm run validate:content`를 실행합니다.
5. `./node_modules/.bin/tsc --noEmit`과 `./node_modules/.bin/vite build`를 실행합니다.
6. `/`, `/ko/picks`, `/ko/picks/archive`, 주요 상세 route, `/ko/market-map`, `/ko/reports`를 QA합니다.

남은 TODO:

- 오래된 legacy Pick의 주차 날짜 정리
- source registry 완전 통합
- 보고서·시장지도 참조 타입 강화
- 다음 주차 입력 템플릿
- draft/published workflow
- 관리자 입력 폼 검토

### 홈 단순화: 이번 주 대표 해부 중심

홈은 여러 콘텐츠를 동시에 나열하는 피드가 아니라, 사용자가 이번 주에 먼저 볼 대표 해부 1개를 고르는 랜딩으로 둡니다. 첫 화면은 대표 질문과 대표 Pick 카드에 집중하고, 나머지 탐색은 역할별 페이지로 분리합니다.

- 홈의 역할: 이번 주 대표 해부 1개를 강하게 안내합니다.
- 전체 Pick 역할: `/ko/picks`에서 SMCI, Micron, 현대건설, DraftKings 등 이번 주 Pick 전체를 확인합니다.
- 관계 탐색 역할: 시장지도에서 AI 반도체, 데이터센터, 전력·냉각 흐름을 확인합니다.
- 보관함/아카이브: `/ko/picks/archive`에서 이번 주 Pick에서 내려간 지난 해부를 확인합니다.
- 이번 주 대표 Pick: `pick-smci-ai-server-funding-dilution`입니다.
- SMCI는 완전 연결 상태이므로 Pick 상세와 기업해설, 숫자 3개, 시장 흐름을 함께 확인할 수 있습니다.

남은 TODO:

- 주간 업데이트 루틴 정리
- 대표 Pick 자동/수동 지정 규칙 정리

### 홈 CTA 목적지 분리

홈 CTA는 대표 해부에서 바로 복잡한 상세 화면으로 뛰지 않도록 목적지를 단계별로 나눕니다.

- 홈은 대표 해부 1개를 보여주는 첫 진입 화면입니다.
- `/ko/picks`는 이번 주 Pick만 보여줍니다. 현재 기준은 `currentWeeklyDigest.recentItems`에 들어간 SMCI, Micron, 현대건설, DraftKings입니다.
- `/ko/picks/archive`는 이번 주 Pick에서 내려간 지난 해부 보관함입니다.
- `/ko/market-map`은 시장지도 카테고리 보관함입니다. 사용자가 볼 흐름을 고른 뒤 상세 지도로 들어갑니다.
- `/ko/category/us-semiconductors`는 AI 반도체 / 데이터센터 상세 지도입니다. 홈에서 바로 들어가지 않고 `/ko/market-map`의 카테고리 CTA에서 진입합니다.
- archived 또는 지난 Pick은 `/ko/picks` 목록에 섞지 않고 `/ko/picks/archive`에서 보조로 제공합니다.

향후 시장지도 카테고리 후보:

- 데이터센터 냉각 / 전력 인프라
- M&A / 인수 프리미엄
- 클라우드 / 데이터 플랫폼

### Pick 보관함 route 추가

- `/ko/picks`: 이번 주 Pick 전용입니다. `currentWeeklyDigest.recentItems`에 있는 Pick만 표시합니다.
- `/ko/picks/archive`: 지난 해부 보관함입니다. `currentWeeklyDigest.recentItems`에 없는 `stockAutopsyPicks`를 최신 `publishedAt` 순으로 표시합니다.
- 중복 노출 방지 기준: 이번 주 Pick ID set을 먼저 만들고, archive 목록에서는 해당 ID를 제외합니다.
- archived Pick 상세 접근 유지: `/ko/picks/{pickId}` 상세 route는 `stockAutopsyPicks`에서 직접 찾으므로 `status: 'archived'` 여부와 관계없이 접근 가능합니다.
- 홈에는 보관함 CTA를 크게 넣지 않고, `/ko/picks` 안에서 `지난 해부 보관함 보기` 보조 링크로만 제공합니다.

남은 TODO:

- 보관함 필터/검색
- 주차별 그룹
- 태그별 archive
- 인스타 게시일/원문 기준 정렬

### 시장지도 상세 페이지 정보 계층 재구성

`/ko/category/us-semiconductors`는 `/ko/market-map`에서 카테고리를 고른 뒤 들어오는 상세 화면입니다. 따라서 긴 설명형 페이지가 아니라, 선택한 기업을 중심으로 시장 흐름을 바로 읽는 화면으로 둡니다.

기존 구조 문제:

- 상단 hero와 5장 흐름 카드가 커서 선택 기업 정보가 늦게 보였습니다.
- 전체 연결 보기가 핵심 기능인데 기본 흐름 카드와 섞여 목적이 흐렸습니다.
- 처음 온 사용자가 시장지도보다 긴 카드 설명 페이지처럼 느낄 수 있었습니다.

새 구조:

- 선택 기업 요약: hero 바로 아래에 회사명, 역할, 상태, 가능한 CTA를 먼저 보여줍니다.
- compact 5단계 흐름: `AI 수요 -> GPU/AI 칩 -> HBM -> 파운드리 -> 전력/냉각`을 작은 timeline으로 축약합니다.
- 같이 볼 회사: 선택 기업과 직접 이어지는 기업 2~4개, 관계 한 줄, 연결 상태를 함께 보여줍니다.
- 전체 연결 보기: 기본 화면 하단의 고급 CTA로 유지하고, 누르면 기존 ReactFlow 전체 관계 화면을 엽니다.

유지한 기능:

- `/ko/market-map`에서 `/ko/category/us-semiconductors` 진입
- `?company=...` query 기반 선택 기업 반영
- 완전 연결 기업의 `기업 해설 보기`, `숫자 3개 보기`
- `시장 흐름 참고`, `해설 준비 중` 기업의 빈 상세 화면 방지
- ReactFlow 전체 연결 보기

남은 TODO:

- ReactFlow 전체 연결 보기 polish
- 새 시장지도 카테고리 추가
- 데이터센터 냉각/전력 지도 확장

### currentWeeklyDigest 구조

`currentWeeklyDigest`는 홈의 대표 해부와 주간 Pick 운영 정보를 관리하는 데이터입니다. 홈은 `featuredPickId`와 `featured`를 중심으로 보여주고, `recentItems`와 `marketMapItems`는 `/ko/picks` 운영 맥락과 시장지도 연결을 정리하는 보조 데이터로 둡니다.

- `weekLabel`: 이번 주 표기입니다. 예: `2026년 5월 넷째 주`
- `headline`: 홈 상단에 보이는 이번 주 해부 메시지입니다.
- `featuredPickId`: 대표 해부로 연결할 Pick ID입니다.
- `featured`: 대표 해부 카드의 시장, 테마, 질문형 제목, 요약, 버튼 문구를 담습니다.
- `recentItems`: 이번 주 또는 최근 해부 목록입니다. 홈 첫 화면에 직접 나열하지 않고, 전체 Pick 운영 맥락을 정리하는 보조 데이터로 둡니다.
- `recentPickIds`: 별도 구현에서 사용할 수 있는 Pick ID 목록 이름입니다. 현재 구현은 `recentItems` 중심입니다.
- `marketMapItems`: 시장지도 연결 후보입니다. 홈에서는 큰 시장지도 CTA를 노출하지 않고, nav와 `/ko/market-map`에서 시장지도 진입을 유지합니다.
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

### 주간 Pick 업데이트 루틴

목적:

- 매주 조사한 종목과 이슈를 반영할 때 콘텐츠만 바꾸지 않고 가격 ticker, 재무보고서 연결, 시장지도 분류, CTA 노출 상태를 함께 확인합니다.
- 핵심 동선은 `/` 또는 `/ko/`의 이번 주 대표 해부 1개, `/ko/picks`의 이번 주 Pick, `/ko/picks/archive`의 지난 해부, `/ko/market-map`과 `/ko/category/...`의 시장지도, `/ko/analysis/...`의 완전 연결 기업해설입니다.
- `/ko/learn/financials`는 직접 접근 가능한 보조 학습 페이지로 유지하되 주간 Pick의 큰 CTA 목적지로 쓰지 않습니다.

전체 흐름:

1. 이번 주 대표 이슈를 선정합니다.
2. 이번 주 Pick 2~4개를 선정합니다. 현재 운영 예시는 SMCI, Micron, 현대건설, DraftKings입니다.
3. 대표 Pick 1개를 선정하고 `currentWeeklyDigest.featuredPickId`와 홈 대표 문구를 맞춥니다.
4. `/ko/picks`에는 이번 주 Pick만 노출합니다.
5. 지난 Pick은 `/ko/picks/archive`로 자동 또는 수동 이동되도록 이번 주 Pick ID set에서 제외합니다.
6. 각 Pick의 연결 상태를 `완전 연결`, `시장 흐름 참고`, `Pick only`, `준비 중` 중 하나로 결정합니다.
7. 가격 ticker가 있는지 확인합니다.
8. 완전 연결 후보는 재무 API 연결 가능 여부를 확인합니다.
9. 시장지도 카테고리와 기존 노드 관계를 반영할지 결정합니다.
10. 홈, Pick 상세, 시장지도, 기업해설의 CTA 노출 규칙이 연결 상태와 일치하는지 확인합니다.
11. 원문, 회사 발표, 공시, 신뢰 가능한 뉴스 링크를 확인합니다.
12. 운영 페이지와 모바일 390px QA를 진행합니다.
13. README에 주간 업데이트 내용, 연결 상태, QA 결과를 기록합니다.
14. 큰 구조 변경이 있으면 별도 TODO로 남기고, 단순 주간 반영이면 같은 주간 기록 안에 묶습니다.

Pick 작성 템플릿:

```text
Pick 제목:
slug/id:
ticker:
회사명:
이번 주 움직인 이유:
한 줄 해석:
시장 흐름:
핵심 체크포인트 3개:
같이 볼 회사:
가격 ticker 연결:
재무보고서 연결:
시장지도 연결:
연결 상태:
CTA 정책:
원문/출처:
archive 처리:
```

연결 상태 결정표:

| 상태 | 기준 | CTA 정책 |
| --- | --- | --- |
| 완전 연결 | `company` data 있음, ticker 있음, `/api/financials` direct/partial/20-F/OpenDART 가능, 시장지도 연결 가능 | `기업해설 보기`, `숫자 3개 보기`, `시장 흐름 보기` |
| 시장 흐름 참고 | 시장지도 또는 흐름에는 있지만 재무 API와 analysis page가 아직 없음 | `시장 흐름 보기`만 |
| Pick only | Pick 상세 콘텐츠만 있고 `data.ts` company와 시장지도 연결이 없음 | 원문 링크와 Pick 내부 설명 중심 |
| 준비 중 | 이름만 언급되고 상세 연결이 없음 | CTA 없음, 준비 중 badge만 |

가격 체크리스트:

- ticker가 있는지 확인합니다.
- `/api/market-prices?limit=200`에 해당 ticker가 있는지 확인합니다.
- source가 `kis-openapi`, `yahoo-finance-chart`, 보조/fallback 중 무엇인지 확인합니다.
- `asOf`가 최신인지 확인합니다.
- currency가 종목 시장과 맞는지 확인합니다.
- stale badge가 필요한지 확인합니다.
- 국내 주식이면 KIS 대상인지 확인합니다.
- 해외 주식이면 Yahoo fallback 상태인지 확인합니다.
- 정적 콘텐츠에 가격 숫자를 하드코딩하지 않고 `PriceBadge`와 가격 API 표시만 사용합니다.

재무 체크리스트:

- 새 회사가 완전 연결 후보인지 먼저 판단합니다.
- `country`가 맞는지 확인합니다.
- US 기업은 CIK, KR 기업은 corpCode가 있는지 확인합니다.
- SEC/OpenDART/20-F source 중 어떤 경로인지 확인합니다.
- `/api/financials`가 direct 또는 partial로 응답 가능한지 확인합니다.
- raw numeric `revenue`, `operatingIncome`, `operatingCashFlow`가 있는지 확인합니다.
- `재무 쉽게 보기 v3`가 표시되는지 확인합니다.
- 영업이익률 계산이 가능한지 확인합니다.
- 현금흐름/영업이익 비율 계산이 가능한지 확인합니다.
- source/asOf/reportType 표시가 맞는지 확인합니다.
- 재무 숫자를 정적 콘텐츠에 하드코딩하지 않습니다.
- raw numeric이 없으면 계산 카드와 비율을 억지로 표시하지 않습니다.

시장지도 체크리스트:

- 새 Pick이 기존 카테고리에 들어가는지 확인합니다: AI 반도체 / 데이터센터, 데이터센터 냉각 / 전력 인프라, M&A / 인수 프리미엄, 기타.
- 기존 노드와 연결 관계가 있는지 확인합니다.
- 새 노드를 추가해야 하는지 확인합니다.
- 완전 연결, 참고, 준비 중 중 어떤 상태인지 정합니다.
- 관계 설명 한 줄을 작성합니다.
- 기업해설이 없으면 빈 분석 페이지로 이동하지 않게 합니다.

CTA 체크리스트:

- 완전 연결: `기업해설 보기`, `숫자 3개 보기`, `시장 흐름 보기`가 가능해야 합니다.
- 시장 흐름 참고: `시장 흐름 보기`만 가능해야 합니다.
- Pick only: 원문 링크와 Pick 내부 설명을 중심으로 둡니다.
- 준비 중: CTA를 만들지 않고 준비 중 badge만 둡니다.
- 홈, Pick 상세, 시장지도, 기업해설에서 같은 연결 상태가 다르게 보이지 않는지 확인합니다.

QA 체크리스트:

- `/`
- `/ko/`
- `/ko/picks`
- `/ko/picks/archive`
- 새 Pick 상세들
- `/ko/market-map`
- 관련 `/ko/category/...`
- 완전 연결 기업해설
- 준비 중 또는 invalid route
- 모바일 390px

QA에서 확인할 것:

- 홈 대표 Pick이 명확한지 확인합니다.
- `/ko/picks`에는 이번 주 Pick만 있는지 확인합니다.
- archive에 지난 Pick이 있는지 확인합니다.
- 중복 노출이 없는지 확인합니다.
- 가격/source/asOf badge가 정상인지 확인합니다.
- 재무 카드 fallback이 계산 카드처럼 보이지 않는지 확인합니다.
- CTA가 연결 상태와 일치하는지 확인합니다.
- 모바일 가로 overflow가 없는지 확인합니다.
- 투자 조언처럼 보이는 문구가 없는지 확인합니다.

추천 주간 커밋 흐름:

1. `Update weekly research picks`
2. `Update market map connections`
3. `Document weekly update QA`

작은 주간 반영이면 한 번에 묶어도 됩니다.

```text
Update weekly picks and QA notes
```

남은 TODO:

- 주간 Pick 입력용 JSON/schema 분리
- 자동 validation script
- ticker/financial/market map 연결 누락 검사
- archive 주차별 그룹
- 카테고리 추가: 데이터센터 냉각 / 전력 인프라
- 카테고리 추가: M&A / 인수 프리미엄
- 카테고리 추가: 클라우드 / 데이터 플랫폼

### 이번 주 조사 콘텐츠 업데이트

2026년 6월 둘째 주 콘텐츠는 Marvell, LG전자, Taylor Morrison 3개 흐름으로 반영했습니다.

- Marvell: Marvell과 NVIDIA의 NVLink Fusion 공식 발표를 바탕으로 AI 데이터센터 연결 반도체, 맞춤형 XPU, 광통신/인터커넥트 수요 맥락을 Pick에 추가했습니다. Marvell은 기존 AI 반도체 관계도에서는 `지도 참고 기업`으로 유지하며, 빈 기업해설이나 숫자 3개 페이지로 보내지 않습니다.
- LG전자: LG전자 뉴스룸의 AI 데이터센터 냉각/HVAC 자료를 바탕으로 AI 서버 증가가 전력, 냉각, 공조 인프라로 번지는 흐름을 Pick 카드 중심으로 정리했습니다. 기존 기업 데이터가 없으므로 기업해설/숫자 CTA는 활성화하지 않습니다.
- Taylor Morrison: Taylor Morrison과 Berkshire Hathaway의 현금 인수 발표를 바탕으로 AI 테마와 별개의 인수 프리미엄, 주택경기, 승인 절차 체크포인트를 Pick 카드 중심으로 정리했습니다.
- 정적 콘텐츠에는 주가, 등락률, 재무 숫자를 하드코딩하지 않았습니다. 가격과 기준일은 `PriceBadge`와 `/api/market-prices` 응답이 표시합니다.
- 연결되지 않은 기업은 준비 중 또는 참고 상태로 처리합니다. 완전 연결 기업만 `기업해설 보기`와 `숫자 3개 보기` CTA를 노출하고, 지도 참고 기업은 시장 흐름 확인만 허용합니다.

### 지난주 Pick 4개 추가

확인 일시: 2026-06-15

지난주 콘텐츠 4개를 `stockAutopsyPicks`에 추가했습니다. 홈 대표 Pick과 `/ko/picks`의 이번 주 Pick은 Marvell, LG전자, Taylor Morrison 정책을 유지하고, 이번에 추가한 4개는 `currentWeeklyDigest.recentItems`에 넣지 않아 `/ko/picks/archive` 보관함에 노출됩니다.

추가한 Pick:

| Pick | slug/id | 연결 상태 | archive 노출 | 시장지도 반영 | CTA 정책 |
| --- | --- | --- | --- | --- | --- |
| Super Micro Computer / SMCI | `pick-smci-ai-server-funding-dilution` | 완전 연결 | 예 | 기존 AI 반도체 / 데이터센터 지도에서 `ai-datacenter-supermicro` 연결 유지 | `숫자 3개 보기`, `기업해설 보기`, `시장 흐름 보기` |
| 현대건설 | `pick-hyundai-engineering-reconstruction-expectation` | Pick only | 예 | 이번 작업에서는 새 카테고리 미생성 | 원문/출처와 Pick 내부 설명만 |
| DraftKings | `pick-draftkings-sports-prediction-platform` | Pick only | 예 | 이번 작업에서는 새 카테고리 미생성 | 원문/출처와 Pick 내부 설명만 |
| Micron | `pick-micron-ai-memory-hbm-demand` | 완전 연결 | 예 | 기존 AI 반도체 / 데이터센터 지도에서 `ai-datacenter-micron` 연결 유지 | `숫자 3개 보기`, `기업해설 보기`, `시장 흐름 보기` |

source 확인:

- SMCI: Supermicro IR의 2026-06-09 proposed financing 발표와 2026-06-11 pricing 발표를 source link로 넣었습니다.
- 현대건설: 연합뉴스의 미국·이란 종전 기대와 재건주 움직임 보도, 현대건설 회사 소개를 source link로 넣었습니다.
- DraftKings: SEC 8-K와 Barron’s 예측시장 보도를 source link로 넣었습니다.
- Micron: Micron FY26 2Q 실적 발표와 MarketWatch 메모리주 반등 보도를 source link로 넣었습니다.

연결 상태 메모:

- SMCI와 Micron은 기존 company data, ticker, SEC 원문, `/api/financials` 연결 후보, AI 반도체 / 데이터센터 지도 노드가 있으므로 완전 연결 Pick으로 둡니다.
- 현대건설과 DraftKings는 이번 작업에서 `data.ts` company, 재무 API, 시장지도 카테고리를 새로 만들지 않았으므로 Pick only로 둡니다.
- 현대건설과 DraftKings에는 가짜 기업해설 CTA나 숫자 3개 CTA를 만들지 않습니다.
- 가격 숫자는 정적 콘텐츠에 하드코딩하지 않고 기존 `PriceBadge`와 `/api/market-prices` 응답에 맡깁니다.

남은 TODO:

- 재건 / 인프라 카테고리 후보 검토
- 스포츠·예측 플랫폼 카테고리 후보 검토
- SMCI 자금조달 이후 희석 부담, 재고, 영업현금흐름 추적
- Micron HBM 매출, DRAM/NAND 가격, 메모리 가격 사이클 추적

### Archive 주차 묶음 및 홈 CTA 단순화

확인 일시: 2026-06-15

홈은 대표 Pick 1개를 먼저 읽는 진입 화면으로 유지합니다. 대표 카드 안에서는 해당 대표 Pick의 `해부 보기` CTA만 강하게 남기고, 카드 안의 중복 `이번 주 Pick 전체 보기` CTA는 제거했습니다. 홈 하단에는 `이번 주 Pick 전체 보기` 카드 1개만 남기고, 큰 `시장 지도 보기` 카드는 제거했습니다.

시장지도 기능과 route는 유지합니다. 상단 nav의 `시장 지도`, Pick 상세의 `시장 흐름 보기`, 기업해설 내부의 시장 흐름 이동은 그대로 두며, 홈 하단에서 큰 CTA로만 노출하지 않습니다.

Archive grouping 기준:

| 그룹 | 기준 | 포함 Pick |
| --- | --- | --- |
| 지난주 Pick | 현재 주차에서 내려간 직전 주차 콘텐츠 ID를 명시적으로 묶음 | Marvell, LG전자, Taylor Morrison |
| 이전 Pick | 이번 주 Pick도 아니고 지난주 그룹도 아닌 기존 archive Pick | Dell, Snowflake, NVIDIA, 삼성전자 등 기존 보관함 Pick |

현재 주차에서 내려간 Pick은 `/ko/picks/archive`의 `지난주 Pick` 섹션에 표시합니다. 기존 archive Pick은 `이전 Pick` 섹션으로 내려가며, Pick 카드 자체는 기존 컴포넌트를 재사용해 가격/source/asOf 배지와 연결 상태별 CTA 정책을 유지합니다. `/ko/picks`는 `currentWeeklyDigest.recentItems`만 노출하고, archive는 이 ID들을 제외합니다.

### 홈 대표 Pick 및 이번 주 Pick 교체

확인 일시: 2026-06-15

홈 대표 Pick을 Marvell에서 SMCI로 교체했습니다. 홈 대표 문구는 AI 서버 주문이 많아도 자금조달 방식과 희석 부담을 함께 봐야 한다는 흐름으로 정리하고, 대표 카드 CTA는 `SMCI 해부 보기`만 강하게 남겼습니다.

`/ko/picks` 현재 주차 Pick:

1. `pick-smci-ai-server-funding-dilution` - Super Micro Computer / SMCI
2. `pick-micron-ai-memory-hbm-demand` - Micron
3. `pick-hyundai-engineering-reconstruction-expectation` - 현대건설
4. `pick-draftkings-sports-prediction-platform` - DraftKings

Archive로 내려간 기존 Pick:

- `pick-marvell-nvlink-fusion-ai-interconnect`
- `pick-lg-electronics-ai-datacenter-cooling`
- `pick-taylor-morrison-berkshire-acquisition`

중복 노출 방지 기준:

- `/ko/picks`는 `currentWeeklyDigest.recentItems`에 있는 Pick ID만 표시합니다.
- `/ko/picks/archive`는 `currentWeeklyDigest.recentItems`에 있는 Pick ID를 제외합니다.
- archive의 `지난주 Pick` 그룹은 이번 교체로 내려간 Marvell, LG전자, Taylor Morrison을 명시적으로 묶습니다.

CTA 상태:

- SMCI와 Micron은 기존 company data, 분석 route, 재무 쉽게 보기, AI 반도체 / 데이터센터 지도 연결이 있으므로 `기업해설 보기`, `숫자 3개 보기`, `시장 흐름 보기`를 유지합니다.
- 현대건설과 DraftKings는 Pick only 상태이므로 기업해설/숫자 CTA를 만들지 않고 원문/내부 설명 중심으로 둡니다.
- 홈 하단의 큰 시장지도 CTA는 계속 노출하지 않고, 상단 nav와 상세 내부 이동만 유지합니다.

남은 TODO:

- archive 월별/주차별 자동 그룹
- archive 필터
- 카테고리별 archive
- 재건/인프라 시장지도 카테고리
- 스포츠·예측 플랫폼 카테고리
- 주차 교체 시 archive 그룹 ID를 자동으로 갱신하는 validation script

### Archive 주차 묶음 표시

확인 일시: 2026-06-15

`/ko/picks/archive`는 단순 카드 리스트가 아니라 주차 묶음으로 표시합니다. archive 대상은 `currentWeeklyDigest.recentItems`에 들어간 현재 주차 Pick을 제외한 `stockAutopsyPicks`입니다.

그룹 기준:

| 그룹 | 포함 기준 | 포함 Pick |
| --- | --- | --- |
| 지난주 Pick | 직전 현재 주차였던 Pick ID를 명시적 순서로 묶음 | Marvell, LG전자, Taylor Morrison |
| 이전 Pick | 현재 주차도 아니고 지난주 그룹도 아닌 나머지 archive Pick | Dell, Snowflake, NVIDIA, 삼성전자, 한미반도체, SK하이닉스 등 |

현재 주차 Pick인 SMCI, Micron, 현대건설, DraftKings는 archive 어느 그룹에도 노출하지 않습니다. 기존 Pick card를 그대로 재사용하므로 가격/source/asOf badge, 상세 route, 연결 상태별 CTA 규칙은 유지됩니다.

장기 TODO:

- `weekLabel` 또는 `digestId` 기반 자동 그룹화
- 월별 archive
- 카테고리별 archive 필터
- 검색/태그 필터
- 주간 업데이트 입력 템플릿과 archive 자동 이동 연결

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
- `sourceRefs`에는 DART, SEC, 회사 IR, 공식 보도자료, 신뢰 가능한 뉴스 원문처럼 확인 가능한 공통 source id만 넣습니다.

### 공통 출처 레지스트리 통합 및 legacy 경고 정리

Pick 원문 출처는 `src/content/sources`의 공통 레지스트리에서 관리합니다. 개별 Pick은 URL과 publisher를 직접 들고 있지 않고 `sourceRefs`로만 source id를 참조하며, `src/content/picks/registry.ts`에서 화면 호환용 `sourceLinks`로 해석합니다.

- `src/content/sources/types.ts`: `ContentSource`, `SourceKind`, `SourceAccessType` 스키마
- `src/content/sources/entries.ts`: 실제 source 목록
- `src/content/sources/registry.ts`: `sourceRegistry`, `sourceByUrl`, `resolvePickSourceLinks`
- `src/content/sources/index.ts`: sources public export

새 Pick을 추가할 때는 먼저 `contentSources`에 `id`, `kind`, `title`, `publisher`, `url`을 등록하고 Pick에는 `sourceRefs: [{ sourceId, note }]`만 넣습니다. 산업 보고서 원문은 `industryReports`가 별도로 관리하므로 같은 URL을 source registry에 중복 등록하지 않습니다.

제한 접근 출처는 기본적으로 Pick 원문 링크로 쓰지 않습니다. 꼭 남겨야 하는 보도 참고 자료는 `accessType: 'restricted'`를 명시하고, 화면의 evidence/source 링크에서는 공개 출처처럼 노출하지 않습니다.

`WATCH`는 실제 가격 동기화 대상 ticker가 아니라 여러 후보를 묶어 보는 placeholder입니다. 해당 Pick에는 `tickerStatus: 'placeholder'`를 붙이고 validator가 가격 universe 제외를 확인합니다. `DELL`처럼 같은 회사 ticker가 여러 이벤트 Pick에서 반복되는 경우에는 `companyId` 또는 `relatedCompanyId`가 같은 정상 공유 관계로 봅니다.

콘텐츠 검증은 다음을 함께 확인합니다.

- source id와 URL 중복 없음
- source kind, title, publisher, URL 형식 정상
- Pick의 sourceRefs 존재 여부와 참조 무결성
- published Pick의 source 연결 정상
- restricted source 명시 처리
- `WATCH` placeholder 가격 universe 제외
- Pick, 회사 registry, 시장지도, OpenDART registry, 시장 카드의 회사명 identity 누락 여부
- ticker-only companyName 사용 여부. ticker는 화면에서 `국가 · ticker` 보조 줄로만 둡니다.
- 같은 ticker가 서로 다른 회사에 잘못 연결된 충돌 여부

### GitHub Actions CI 및 Vercel 배포 전 검증

정적 콘텐츠와 TypeScript/build 검증은 GitHub Actions와 Vercel production build에서 같은 기준으로 차단합니다. production secret, 가격 sync, Supabase/KIS/API 호출은 이 검증에 사용하지 않습니다.

- workflow 파일: `.github/workflows/ci.yml`
- workflow 이름: `CI`
- status check/job 이름: `Validate content, types, and build`
- trigger: `pull_request`, `push` to `main`
- Node 버전: `20.x`
- 권한: `contents: read`

CI는 다음 순서로 실행합니다.

```bash
npm ci
npm run validate:content
npm run check:types
npm run build:app
```

`validate:content`는 stale `.sync-build`를 쓰지 않도록 먼저 `tsc -p tsconfig.scripts.json`를 실행한 뒤 `.sync-build/scripts/validate-content.js`를 실행합니다. 잘못된 source id, 중복 Pick id/slug, 잘못된 주차 참조, placeholder ticker의 가격 universe 포함, source URL 중복 같은 오류가 있으면 validator가 오류를 출력하고 exit code 1로 종료해 이후 step과 배포를 막습니다.

Vercel은 `vercel.json`의 `buildCommand: npm run build`를 사용합니다. `build` 스크립트는 `npm run check:ci && npm run build:app`이므로 production build 전에 content validator와 TypeScript 검사를 반드시 통과해야 합니다. GitHub Actions는 로그에서 실패 단계를 분리하기 위해 `validate:content`, `check:types`, `build:app`을 각각 실행합니다.

로컬에서 새 Pick을 배포하기 전 권장 순서는 다음과 같습니다.

1. Pick/source/week 파일 수정
2. `npm run validate:content`
3. `npm run check:types`
4. `npm run build`
5. commit/push
6. GitHub Actions `Validate content, types, and build` success 확인
7. Vercel production success 확인

의도적 실패 테스트는 존재하지 않는 `sourceId`를 임시로 주입해 `validate:content`가 `Unknown content source id` 또는 `missing source ref` 오류와 exit code 1로 차단하는지 확인한 뒤, 임시 변경을 되돌리고 정상 validator를 다시 실행합니다.

branch protection을 켤 때는 저장소 설정에서 자동 변경하지 않고, GitHub `Settings -> Branches` 또는 `Rules`에서 `main` 보호 규칙에 `Require status checks to pass`를 켠 뒤 `Validate content, types, and build`를 선택합니다.

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

## 재무 쉽게 보기 v3 시각화 개편 설계

이번 단계는 코드/API/data 구조 변경 없이 설계만 정리합니다. 목표는 기존 `매출`, `영업이익`, `영업현금흐름` 숫자 3개를 없애는 것이 아니라, 초보자가 절대값보다 `비율`, `변화`, `흐름`을 먼저 이해하도록 정보 계층을 바꾸는 것입니다.

### 왜 절대값 카드만으로 부족한가

현재 기업 해설 페이지의 `재무 쉽게 보기`는 `src/App.tsx`의 `financial-learning-card` 안에서 렌더링됩니다. 헤더는 이미 `숫자는 마지막 확인입니다.`라는 방향을 갖고 있지만, 실제 중심 UI는 `financial-priority-grid`의 3개 숫자 카드입니다.

현재 흐름:

- `fetchFinancialsByCompany(company)`가 `FinancialStatementSummary`를 만들고 `financialSummary` state에 저장합니다.
- `connectFinancialPriorityMetrics()`가 산업별 fallback 지표를 공식 API 지표로 치환합니다.
- `financialNumberCards`는 3개 카드로 렌더링되며 질문은 `얼마나 팔았나요?`, `팔고 돈이 남았나요?`, `현금이 들어왔나요?`입니다.
- 각 카드에는 `beginnerMetricValueLabel(metric.value)`, `financialComparisonNote(metric.comparison)`, `financialMetricSourceNote()`가 표시됩니다.
- `숫자 더 보기` details 안에는 한 줄 결론, 카드별 설명, 좋은 신호/조심할 신호, 다음 분기 확인 항목, `전체 지표 보기`, `손익·현금흐름 보기`, `공시 보기`, `원문 보고서 보기` 버튼이 있습니다.
- `전체 지표 보기`와 `재무제표 해설 더 보기`는 같은 기업 해설 페이지 하단의 details로 유지되어 있습니다.

문제는 `80.2B`, `5.1B`, `6.5B` 같은 절대값이 커 보여도 사용자가 바로 판단하기 어렵다는 점입니다. 초보자에게 먼저 필요한 질문은 `얼마나 컸나`보다 `매출 대비 얼마나 남겼나`, `전보다 나아졌나`, `이익이 현금으로 이어졌나`입니다.

### 현재 재무 API와 프론트에서 쓸 수 있는 필드

`api/financials.ts` 응답은 raw numeric `metrics`를 제공합니다. 공개 API 샘플 확인 기준으로 US NVIDIA와 KR 삼성전자 모두 아래 필드가 존재할 수 있습니다.

| 필드 | 현재 API 응답 | 현재 프론트 summary | v3 판단 |
| --- | --- | --- | --- |
| `metrics.revenue` | number/null | `FinancialMetric.value` 문자열 | API raw 값 기준 계산 가능. 프론트에서는 문자열 parse 또는 raw 보존 확장 필요 |
| `metrics.operatingIncome` | number/null | 문자열 | 영업이익률 계산에 필요 |
| `metrics.operatingCashFlow` / `cashFlow` | number/null | `cashFlow` 문자열 | 현금흐름/영업이익 비율 계산에 필요 |
| `metrics.freeCashFlow` | number/null | 고급 metric 문자열 | FCF 보조 시각화 가능하나 기본 3개에는 보류 |
| `metrics.netIncome` | number/null | 고급 metric 문자열 | 순이익 보조 가능, 기본 질문에는 보류 |
| `metrics.capitalExpenditures` | number/null | 고급 metric 문자열 | FCF 계산/설명에 쓰이지만 기본 화면에서는 과함 |
| `comparison.revenue.yoy/qoq` | number/null | metric comparison으로 일부 전달 | YoY/QoQ pill 가능. 단 QoQ는 현재 null인 경우 많음 |
| `comparison.operatingIncome.yoy/qoq` | number/null | metric comparison으로 일부 전달 | 영업이익 성장 pill 가능 |
| `comparison.operatingCashFlow.yoy/qoq` | number/null | metric comparison으로 일부 전달 | 현금흐름 변화 pill 가능 |
| `fiscalYear`, `fiscalPeriod`, `reportType`, `asOf` | 존재 | `fiscalYear`, `fiscalPeriod`, `reportType`, `filingDate`로 전달 | source/asOf badge polish 가능 |
| `sourceStatus`, `currency`, `amountBasis`, `periodBasis` | 존재 | 일부만 문자열 note에 반영 | 기준 단위와 데이터 상태 표시 가능 |
| 최근 4분기 배열 | 없음 | 없음 | API 확장 필요 |
| 과거 분기별 `revenue/operatingIncome` pair | 없음 | 없음 | 영업이익률 변화 계산에는 API 확장 필요 |

중요 제약:

- `/api/financials`는 raw number를 주지만 `src/services/financials.ts`가 이를 `FinancialStatementSummary.metrics[]`의 문자열 `value`로 변환합니다. v3 1차에서 프론트만 고치면 문자열에서 숫자를 역파싱해야 하므로 통화/단위별 오류가 생길 수 있습니다.
- 안전한 1차 구현은 `FinancialStatementSummary`에 raw metric을 보존하는 확장 또는 `src/services/financials.ts` 내부에서 계산된 derived view model을 만드는 것입니다. 이번 문서는 설계만 기록하고 데이터 구조는 바꾸지 않습니다.
- fallback financials는 `src/data.ts`의 문자열 값입니다. fallback 값으로 영업이익률, YoY/QoQ, 현금 전환 비율을 계산하지 않습니다.

### v3 정보 계층

상단 요약:

- 제목: `숫자는 마지막 확인입니다`
- subtitle: `이야기가 실제 돈과 수익성으로 이어졌는지 봅니다`
- source/asOf badge: `SEC 원문 기준 · FY2027 Q1 · 2026.05.20 확인`, `OpenDART 원문 기준 · 2026 Q1 · 2026.05.15 확인`
- 데이터가 없으면 `공식 데이터 연결 필요`, `원문 연결 준비 중`, `fallback 해설 기준`을 명확히 표시합니다.

핵심 해석 3개:

1. `수익성이 좋아졌나요?`
   - 주 지표: `영업이익률 = operatingIncome / revenue`
   - 보조: 영업이익 YoY/QoQ가 있으면 작은 pill
   - 시각화: 매출 bar 안에 영업이익이 차지하는 비율을 작은 horizontal ratio bar로 표시

2. `이익이 현금으로 이어졌나요?`
   - 주 지표: `영업현금흐름 / 영업이익`
   - 보조: 영업현금흐름이 영업이익보다 큰지/작은지 확인 문구
   - 시각화: 두 개의 막대 또는 `현금흐름이 이익의 약 n%` ratio bar

3. `성장이 이익으로 연결됐나요?`
   - 주 지표: 매출 YoY와 영업이익 YoY 비교
   - 보조: 둘 다 있으면 `매출 +85.2% / 영업이익 +147.4%`처럼 비교
   - 시각화: before/after mini comparison bar 또는 나란한 변화 pill

기존 숫자 3개 카드:

- 아래쪽에 `기준 숫자` 섹션으로 유지합니다.
- `매출`, `영업이익`, `영업현금흐름`은 큰 숫자 카드가 아니라 해석 카드의 supporting fact로 낮춥니다.
- 숫자 카드에는 `값`, `기준 보고서`, `작년 같은 기간보다/직전 분기보다`만 짧게 둡니다.

### 미니 시각화 방향

복잡한 차트보다 1초 안에 읽히는 도표를 우선합니다.

- horizontal mini bar: 영업이익률, 현금흐름/영업이익 비율에 사용합니다.
- ratio bar: `매출 중 남은 이익`, `이익 대비 현금흐름`처럼 분모/분자를 명확히 표시합니다.
- before/after mini comparison bar: YoY/QoQ가 있는 지표만 사용합니다.
- sparkline: 최근 4분기 배열이 생긴 뒤에만 사용합니다.
- gauge, 점수, 등급, 복잡한 라인 차트는 보류합니다. 투자 판단처럼 보일 수 있습니다.

### 데이터 가능/불가능 분류

즉시 가능:

- API raw `revenue`와 `operatingIncome`이 모두 있을 때 영업이익률 계산
- API raw `operatingCashFlow`와 `operatingIncome`이 모두 있을 때 현금흐름/영업이익 비율 계산
- 기존 `comparison.yoy/qoq`가 있는 매출, 영업이익, 영업현금흐름에 작은 pill 표시
- `sourceStatus`, `reportType`, `fiscalYear`, `fiscalPeriod`, `asOf`, `currency` 기반 source/asOf badge 개선
- 기존 3개 숫자 카드를 하단 supporting facts로 낮추기

API 또는 view model 확장 필요:

- 전분기 대비 영업이익률 변화: 현재와 직전 분기의 `revenue + operatingIncome` pair가 필요합니다.
- 최근 4분기 sparkline: 현재 API는 period 배열을 반환하지 않습니다.
- 매출 증가율과 영업이익률 변화의 정확한 시계열 비교: 같은 기간 기준의 과거 pair가 필요합니다.
- company별 historical quarterly chart: SEC/OpenDART source별 form, fp, report code, 기간 길이 normalization이 필요합니다.
- raw numeric을 프론트 summary에 안전하게 보존하는 구조: 현재 `FinancialMetric.value`는 문자열입니다.

보류:

- PER/PBR, ROE, 컨센서스, 가이던스, valuation 점수
- `좋음/나쁨`을 색이나 점수로 단정하는 UI
- 복잡한 라인 차트, 레이더 차트, 큰 dashboard grid
- fallback 문자열 숫자로 계산하는 모든 파생 지표

### 초보자용 문구 후보

기존 질문:

- `얼마나 팔았나요?`
- `팔고 돈이 남았나요?`
- `현금이 들어왔나요?`

v3 후보:

- `팔아서 얼마나 남겼나요?`
- `전보다 수익성이 좋아졌나요?`
- `이익이 실제 현금으로 들어왔나요?`
- `성장이 이익으로 이어졌나요?`
- `매출은 늘었는데 비용도 같이 늘었나요?`
- `현금흐름이 이익을 따라오고 있나요?`

문구 원칙:

- `좋다/나쁘다` 단정 대신 `확인할 부분`, `볼 포인트`, `흐름`을 씁니다.
- `매수`, `매도`, `급등 예상`, `확정 수혜`, `점수` 표현은 쓰지 않습니다.
- 상승/하락 색은 보조로만 쓰고, 빨강/파랑 과다 사용은 피합니다.

### 디자인 방향

DESIGN.md의 warm paper canvas, white surface, hairline border, restrained shadow, single blue accent를 따릅니다.

- 배경은 warm paper canvas, 카드 표면은 white surface 중심으로 둡니다.
- 차트는 카드 안 장식이 아니라 해석을 돕는 24~44px 높이의 작은 bar로 둡니다.
- 숫자는 크되, 해석 문구와 질문 제목이 먼저 읽히도록 headline hierarchy를 조정합니다.
- blue accent는 source badge, selected bar, CTA에만 제한합니다.
- 빨강/파랑 대비는 변화 pill에만 작게 사용하고 전체 화면 분위기를 dashboard처럼 만들지 않습니다.
- 모바일에서는 모든 chart가 1열로 접히고, 긴 통화 문자열은 줄바꿈되어 가로 overflow가 없어야 합니다.

### 전체 지표와 재무제표 해설 분리 방향

현재 `전체 지표 보기`, `재무제표 해설 더 보기`, `공시 보기`, `원문 보고서 보기`는 같은 기업 해설 페이지 하단에 details로 남아 있습니다. 정보는 유용하지만 기업 해설의 첫 경험을 무겁게 만듭니다.

추천 방향:

- 기업 해설 페이지에는 v3 재무 요약 시각화와 먼저 보는 숫자 3개만 남깁니다.
- `전체 지표 보기`는 CTA 카드로 바꾸고 상세는 `/ko/analysis/{companyId}/financials` 후보로 분리합니다.
- 재무 용어 설명과 재무제표 읽는 법은 `/ko/learn/financials` 같은 공부 페이지로 분리합니다.
- 긴 재무제표 해설은 기존 내용을 삭제하지 말고 상세 페이지 또는 접힌 CTA 뒤로 이동합니다.
- 1차에서는 라우트 추가 없이 기업 해설 하단 details를 유지하되, 기본 화면에서는 CTA만 보이게 계층을 낮춥니다.

### 구현 단계 제안

1차 구현:

- API raw metrics가 있는 경우 영업이익률을 계산합니다.
- 영업현금흐름/영업이익 비율을 계산합니다.
- mini bar와 ratio bar를 추가합니다.
- source/asOf badge를 `source · fiscalYear/fiscalPeriod · asOf` 형태로 다듬습니다.
- 기존 숫자 3개 카드는 하단 `먼저 보는 숫자`로 낮춥니다.
- fallback 상태에서는 계산을 숨기고 `공식 데이터 연결 필요`를 표시합니다.

2차 구현:

- 전분기 대비 영업이익률 변화 계산을 위해 API 응답에 현재/직전 분기 `revenue + operatingIncome` pair를 추가합니다.
- 최근 4분기 sparkline을 위한 period array를 추가합니다.
- `전체 지표 보기`와 `재무제표 해설 더 보기`를 공부 페이지 또는 기업별 재무 상세 페이지 CTA로 분리합니다.

3차 구현:

- `/ko/analysis/{companyId}/financials` 상세 페이지를 만듭니다.
- SEC/OpenDART/20-F source별 chart normalization을 정리합니다.
- 국내/해외 기업의 report period, currency, amount basis를 통일된 chart model로 변환합니다.
- 컨센서스, PER/PBR, valuation은 공식/외부 source와 재배포 조건이 확인될 때까지 별도 후보로 유지합니다.

### v3 1차 구현 결과

확인 일시: 2026-06-05

이번 구현은 API/data 구조를 바꾸지 않고 기업 해설 페이지의 `재무 쉽게 보기` 정보 계층만 조정했습니다.

구현한 것:

- 상단 문구를 `숫자는 마지막 확인입니다` / `이야기가 실제 돈과 수익성으로 이어졌는지 봅니다.`로 정리했습니다.
- 기존 숫자 3개 카드 위에 해석 카드 3개를 추가했습니다: `팔아서 얼마나 남겼나요?`, `이익이 현금으로 이어졌나요?`, `성장이 이익으로 연결됐나요?`
- 현재 summary에 연결된 공식 숫자가 있을 때 `영업이익률 = operatingIncome / revenue`, `현금흐름/영업이익 = operatingCashFlow / operatingIncome`을 계산합니다.
- 계산 가능한 값은 CSS div 기반 mini ratio bar로 표시하고, 100% 초과 값은 bar만 100%로 clamp하며 label은 실제 비율을 유지합니다.
- 기존 `comparison.yoy/qoq`가 있는 지표는 작은 pill 또는 mini comparison row로만 표시합니다.
- source/report/asOf/currency badge를 작게 묶어 표시합니다.
- 기존 `매출`, `영업이익`, `영업현금흐름` 숫자 3개 카드는 `먼저 보는 숫자 3개`로 이름을 낮춰 아래쪽에 유지했습니다.
- fallback 또는 공식 데이터 미연결 상태에서는 계산과 차트를 숨기고 `공식 데이터 연결 필요`, `값 확인 전, 지표 의미만 표시합니다.` 문구를 보여줍니다.

현재 API로 가능한 것:

- 공식 API summary가 연결된 기업의 영업이익률 계산
- 영업현금흐름/영업이익 비율 계산
- 기존 YoY/QoQ comparison 기반 변화 pill 표시
- SEC/OpenDART source, report type, fiscal period, asOf, currency badge 표시

아직 API 또는 view model 확장이 필요한 것:

- 직전 분기 대비 영업이익률 변화
- 최근 4분기 sparkline
- 매출 증가율과 영업이익률 변화의 정확한 시계열 비교
- raw numeric metric을 프론트 summary에 보존하는 구조
- 기업별 재무 상세 페이지와 source별 chart normalization

다음 단계:

- 2차에서 `/api/financials` 응답 또는 view model에 현재/직전 분기 pair와 최근 period array를 추가합니다.
- `전체 지표 보기`, `재무제표 해설 더 보기`는 당장 삭제하지 않고 상세/학습 페이지 분리 후보로 유지합니다.
- 로컬 Vite 단독 실행은 서버리스 `/api/financials`가 붙지 않으면 공식 데이터 미연결 UI를 확인하는 용도로 사용합니다.

### 기업해설 재무 상세 영역 분리 1차 구현

확인 일시: 2026-06-05

기업해설 페이지가 길고 조잡해 보이던 원인 중 하나였던 `전체 지표 보기`, `재무제표 해설 더 보기` 상세 details를 기본 기업해설 흐름에서 분리했습니다. `재무 쉽게 보기 v3`가 핵심 재무 요약을 담당하므로, 기업해설 페이지에는 시각 요약과 먼저 보는 숫자 3개를 남기고 긴 학습성 콘텐츠는 별도 진입으로 보냅니다.

기업해설 페이지에 남긴 것:

- 회사 설명, 질문 카드, 시장 흐름 CTA
- `재무 쉽게 보기 v3` 해석 카드 3개와 `먼저 보는 숫자 3개`
- 짧은 `숫자 더 보기` 보조 drawer
- 공시/원문 보고서/관계/기관 동향/뉴스를 하나로 묶은 compact `더 깊게 보기`
- `먼저 보는 숫자 3개` 안의 짧은 inline 도움말

분리한 것:

- 기본 기업해설 하단에서 `전체 지표 보기`와 `재무제표 해설 더 보기` 긴 details를 제거했습니다.
- 새 route `/ko/learn/financials`를 추가해 매출, 영업이익, 영업현금흐름, 영업이익률, 현금흐름/영업이익 비율, YoY/QoQ, 전체 지표를 언제 보는지 설명합니다.
- 기업해설의 큰 학습 CTA와 `숫자 더 보기` drawer의 학습 페이지 버튼은 제거하고, `/ko/learn/financials`는 직접 URL 접근용으로 유지합니다.

보정한 것:

- `재무 쉽게 보기 v3` 해석 카드를 다크 카드가 아닌 흰색/연한 blue-tint 문서형 카드로 바꿨습니다.
- `/ko/learn/financials`는 큰 학습 랜딩이 아니라 `숫자 3개 읽는 법` compact 참고 페이지로 줄였습니다.
- `MD&A / Risk Factors`, `원문 보고서`, `관련 기업 관계`, `관련 보유·거래`, `관련 뉴스`는 개별 긴 accordion 대신 하나의 compact 목록으로 낮췄습니다.

아직 남은 2차 작업:

- 회사별 `/ko/analysis/{companyId}/financials` 상세 페이지
- 회사별 전체 지표 table 별도화
- 기존 재무제표 해설 내용을 회사별 상세 또는 학습 페이지로 재배치
- source별 재무 상세 시각화 고도화

### 숫자 읽는 법 CTA 축소

확인 일시: 2026-06-15

큰 CTA를 줄인 이유:

- `숫자 읽는 법`은 보조 설명으로 유용하지만 홈, Pick, 시장지도, 기업해설 하단에서 독립 CTA처럼 보이면 주가해부실의 핵심 흐름이 재무 공부 페이지로 분산됩니다.
- 기본 동선은 이번 주 이슈, Pick 상세, 관련 기업, 시장지도, 기업해설의 재무 숫자 확인에 둡니다.

남긴 위치:

- 기업해설의 `재무 쉽게 보기 v3` 안에서 `먼저 보는 숫자 3개` 영역에만 inline 도움말을 남깁니다.
- `/ko/learn/financials` route는 삭제하지 않고 직접 URL 접근이 가능하게 유지합니다.

재무 영역 inline 도움말 문구:

```text
먼저 매출, 영업이익, 영업현금흐름을 보고, 그 다음 영업이익률과 현금흐름 비율을 확인합니다.
```

남은 TODO:

- `/ko/learn/financials`를 외부 또는 오래된 링크 대응용 compact 참고 페이지로만 유지합니다.
- 회사별 재무 상세 페이지를 만들 경우에도 홈/주요 CTA가 학습 페이지로 분산되지 않도록 별도 검토합니다.

### 운영 전체 QA 결과

확인 일시: 2026-06-08 19:33 CST

운영 가격 API `/api/market-prices?limit=200`은 200 응답, 83개 row, source 분포 `kis-openapi` 46개와 `yahoo-finance-chart` 37개로 확인했습니다. KIS 가격은 2026-06-08 기준, Yahoo 주요 미국주는 2026-06-05 기준으로 표시됩니다. 운영 홈 `/`와 `/ko/`는 충분히 대기하면 `가격 불러오는 중`이 남지 않고 Yahoo/한국투자 source와 기준일 badge로 바뀝니다.

재무 API는 프론트 방식 파라미터(`country`, `companyId`, `cik` 또는 `corpCode`)로 대표 기업을 확인했습니다. SK하이닉스와 삼성전자는 `OpenDART/direct` 응답에서 매출, 영업이익, 영업현금흐름 raw numeric을 받았고, 운영/로컬 화면 모두 최종 렌더에서 영업이익률과 현금흐름 비율을 표시했습니다. 초기 fallback 렌더에서는 잠깐 `공식 데이터 연결 필요`가 보일 수 있으나 OpenDART 응답 후 사라지는 것을 확인했습니다.

발견/수정:

- `/ko/analysis/ai-datacenter-wonikips`, `/ko/analysis/not-a-real-company` 같은 준비 중 또는 잘못된 analysis route가 홈을 조용히 렌더링하던 fallback 품질 이슈를 수정했습니다.
- 수정 후 준비 중 기업은 `해설 준비 중`, 미등록 기업은 `기업 해설을 찾을 수 없습니다.` 안내와 `시장 흐름에서 보기` CTA를 보여줍니다.
- SK하이닉스/삼성전자 OpenDART direct 표시 문제는 현재 운영 API와 프론트 변환에서 재현되지 않았습니다. raw numeric은 view model에 보존되고 v3 카드가 사용합니다.

QA 페이지:

- `/`, `/ko/`, `/ko/picks`
- Marvell, LG전자, Taylor Morrison, Dell Pick 상세
- `/ko/category/us-semiconductors`
- `/ko/analysis/ai-datacenter-dell`, `/ko/analysis/us-semiconductors-nvidia`, `/ko/analysis/ai-datacenter-sk-hynix`, `/ko/analysis/ai-datacenter-samsung`, `/ko/analysis/ai-datacenter-tsmc`, `/ko/analysis/ai-datacenter-asml`
- `/ko/analysis/ai-datacenter-wonikips`, `/ko/analysis/not-a-real-company`
- 모바일 390px 홈, Pick 목록, 시장지도, SK하이닉스 분석, 원익IPS fallback

남은 TODO:

- 로컬 Vite 단독 실행에는 `/api/market-prices` 프록시가 없어서 가격 화면은 mock/fallback badge로 안정됩니다. 운영 가격 badge 검증은 배포 URL에서 계속 확인합니다.
- OpenDART 응답은 수십 초 걸릴 수 있으므로, 재무 카드 QA는 초기 fallback이 아니라 응답 후 최종 상태를 기준으로 봅니다.

### 데이터센터 냉각 / 전력 인프라 시장지도 추가

확인 일시: 2026-06-15

새 route:

- `/ko/category/datacenter-power-cooling`

`/ko/market-map` 활성화:

- 기존 준비 중 카드였던 `데이터센터 냉각 / 전력 인프라`를 활성 카테고리로 바꿨습니다.
- `AI 반도체 / 데이터센터` 카테고리는 그대로 유지합니다.
- `M&A / 인수 프리미엄`, `클라우드 / 데이터 플랫폼`은 계속 준비 중 상태로 둡니다.

핵심 흐름:

```text
AI 서버 증가 -> 전력 사용 증가 -> UPS / 전력 관리 -> 냉각 / HVAC -> 운영 안정성
```

포함 회사와 connection status:

- Vertiv (`VRT`): 완전 연결. 기업해설, 숫자 3개, 시장 흐름 CTA를 허용합니다.
- Eaton (`ETN`): 시장 흐름 참고. 기업해설/숫자 CTA를 열지 않습니다.
- Schneider Electric (`SBGSY`): 시장 흐름 참고. 기업해설/숫자 CTA를 열지 않습니다.
- LG전자 (`066570.KS`): Pick only. 관련 LG전자 냉각 Pick 상세만 연결하고 기업해설/숫자 CTA를 열지 않습니다.

CTA 규칙:

- 완전 연결 기업만 `기업 해설 보기`와 `숫자 3개 보기`를 표시합니다.
- 시장 흐름 참고 노드는 지도 내 설명과 관계 출처 중심으로 둡니다.
- Pick only는 관련 Pick 상세로만 보냅니다.
- 준비 중 또는 흐름 설명 노드는 별도 CTA를 만들지 않습니다.

기존 AI 반도체 지도 회귀 확인 포인트:

- `/ko/category/us-semiconductors` route와 query 선택을 유지합니다.
- `ai-datacenter-nvidia`는 기존 NVIDIA 노드로, `ai-datacenter-smci`는 Supermicro 노드로 안전하게 매핑합니다.
- ReactFlow 전체 연결 보기와 관계 출처 패널은 기존 공통 구조를 그대로 사용합니다.

남은 TODO:

- Vertiv complete 연결 여부 보강
- Eaton/Schneider 재무 연결 후보 검토
- LG전자 냉각 Pick과 category 연결 강화
- 데이터센터 냉각/전력 카테고리 source 보강

### Vercel production 최신 commit 반영 확인

확인 일시: 2026-06-15 23:53 CST

production domain:

- `https://finance1-flax.vercel.app`

확인 결과:

- GitHub `main` HEAD는 `f9785c7ef266d483d12079be2e04a6f973017c16`입니다.
- GitHub Deployments 공개 기록에서 `Production – finance1` 최신 deployment는 `6a2d2801488616b49d46f8b9173fa52ca6b5a4b8`입니다.
- `f9785c7`에 해당하는 `Production – finance1` deployment record는 확인되지 않았습니다.
- production HTML은 이전 asset `/assets/index-BBGEd0zo.js`, `/assets/index-BrFUWAgj.css`를 계속 반환했습니다.
- response header는 `x-vercel-cache: HIT`, `last-modified: Mon, 15 Jun 2026 15:07:54 GMT`로 이전 배포 HTML을 가리켰습니다.

원인 판단:

- 브라우저 캐시나 domain alias 문제가 아니라, Vercel `finance1` production deployment가 최신 GitHub main commit을 아직 배포하지 않은 상태로 판단합니다.
- 로컬에는 Vercel CLI, `.vercel/project.json`, `VERCEL_TOKEN`이 없어 dashboard/CLI/API redeploy를 직접 실행할 수 없습니다.

조치:

- 코드 기능 변경 없이 이 README 기록 커밋을 push해 GitHub main push webhook을 다시 발생시킵니다.
- push 후 `Production – finance1` deployment가 새 commit으로 생성되는지 확인하고, `finance1-flax.vercel.app` asset 및 새 route를 다시 확인합니다.

### 산업 보고서 서재 추가

확인 일시: 2026-06-19

새 route:

- `/ko/reports`: 공개 산업 보고서를 짧게 요약하고 시장지도와 Pick으로 다시 연결하는 서재입니다.

`IndustryReport` metadata:

- 기본 식별 정보: `id`, `slug`, `title`, `firm`, `industry`, `publishedYear`, `publishedAt`, `publishedLabel`, `url`
- 접근·검증 정보: `accessType`, `sourceNote`, `statusNote`, `lastCheckedAt`, `latestEditionCheckedAt`, `sourceStatus`, `editionStatus`, `canonicalUrl`, `latestReportId`, `latestReportUrl`, `sourceStatusNote`
- 해석 정보: `summaryBullets`, `keyIdeas`, `howToUse`
- 연결 정보: `relatedMaps`, `relatedPicks`, `relatedCompanies`

`accessType` 정책:

- `public`: 로그인 없이 본문 또는 PDF가 바로 열리는 자료입니다. 기본 목록에는 이 상태이면서 현재판이고 원문 접근이 가능한 보고서만 표시합니다.
- `free-login`: 이메일 입력, 회원가입, 로그인, 다운로드 폼이 필요한 자료입니다. 사이트에 표시하지 않고 사용자에게 별도로 보고합니다.
- `restricted`: 유료, 비공개, 회원 전용, 재배포 제한 자료입니다. 사이트에 표시하지 않고 사용자에게 별도로 보고합니다.
- `dead-link`: 링크가 깨졌거나 접근할 수 없는 자료입니다. 사이트에 표시하지 않고 대체 공개 출처가 필요하다고 별도로 보고합니다.

로그인 필요 자료 처리:

- 자동 로그인, 쿠키/session 저장, 우회 다운로드를 하지 않습니다.
- 사용자가 직접 받은 PDF 또는 로그인 없는 공개 링크를 제공한 경우에만 접근 상태와 공개 가능 범위를 다시 확인합니다.
- 유료·비공개 원문은 사이트 공개 요약에 사용하지 않습니다.
- 홈페이지에는 `public + current + available/redirected` 보고서만 노출합니다. 무료 로그인, 이메일 입력, 유료, 비공개, 링크 오류 자료는 사이트에 표시하지 않고 사용자에게 별도로 보고합니다.

원문 정책:

- 원문 보고서나 PDF를 repo와 public asset에 복사하지 않습니다.
- 사이트에는 짧은 요약, 활용 질문, 공식 원문 외부 링크만 저장합니다.
- 공식 재무 숫자는 계속 SEC, OpenDART, IR, 공시를 우선하며 산업 보고서가 숫자를 대체하지 않습니다.
- 산업 전망을 개별 종목의 추천, 수혜 확정, 주가 전망으로 바꾸어 쓰지 않습니다.

초기 공개 보고서 4건:

- McKinsey, `The cost of compute: A $7 trillion race to scale data centers` (`public`)
- PwC, `State of the semiconductor industry` (`public`)
- Deloitte, `2025 Engineering and Construction Industry Outlook` (`public`)
- KPMG, `Global construction survey 2025/2026: The paradox of progress` (`public`)

시장지도/Pick 연결:

- `AI 반도체 / 데이터센터`: McKinsey, PwC
- `데이터센터 냉각 / 전력 인프라`: McKinsey
- `재건 / 인프라`: Deloitte, KPMG
- SMCI와 Micron Pick: AI 인프라·반도체 보고서
- LG전자 Pick: 데이터센터 전력·냉각 보고서
- 현대건설 Pick: 건설·인프라 보고서
- 연결은 report와 map/Pick ID를 metadata에 저장해 제목이 바뀌어도 유지합니다.

남은 TODO:

- 공개 보고서 source 추가
- `free-login` 보고서 사용자 확인 워크플로우
- 보고서 검색/필터
- 보고서 freshness check
- source validation script
- 산업 보고서 기반 Pick 작성 루틴 자동화

### 산업 보고서 최신판 및 출처 상태 관리

확인 일시: 2026-06-21

상태 필드:

- `lastCheckedAt`: 공식 원문 링크를 로그인 없이 직접 확인한 날짜입니다.
- `latestEditionCheckedAt`: 같은 시리즈의 더 최신 공개판이 있는지 확인한 날짜입니다.
- `sourceStatus`: `available`은 기존 URL에서 접근 가능, `redirected`는 공식 최종 URL로 이동, `unavailable`은 현재 원문을 확인할 수 없는 상태입니다.
- `editionStatus`: `current`는 현재 공개판, `previous`는 후속 공개판이 확인된 이전판, `unknown`은 시리즈 관계를 확정하지 못한 상태입니다.
- `canonicalUrl`은 redirect된 공식 최종 URL에만 사용하고, 원문 CTA는 이 값이 있으면 우선 사용합니다.
- `latestReportId`는 사이트에 등록된 최신판 상세 route를 연결하며, `latestReportUrl`은 최신판을 발견했지만 사이트 데이터로 등록하지 않은 경우에만 사용합니다.

노출 정책:

- `/ko/reports`, 시장지도, Pick의 기본 관련 보고서는 `public + current + available/redirected` 조건을 모두 만족할 때만 표시합니다.
- `previous`와 `unavailable` 보고서는 기본 목록에서 숨기지만 기존 상세 route는 인용과 북마크가 끊기지 않도록 유지합니다.
- 이전판 상세에는 최신판 안내와 내부 `최신판 보기` CTA를 표시합니다. 원문 확인이 불가능한 상세에서는 원문 CTA를 제거합니다.
- 로그인, 이메일 폼, 유료 또는 회원 전용 최신판은 사이트 데이터에 추가하지 않고 사용자에게 필요한 액션만 별도로 보고합니다.
- 발행월은 공식 상세 페이지나 공식 PDF 경로에서 확인되는 경우에만 기록하며 추정하지 않습니다.

공식 원문 4건 검증 결과:

- McKinsey, [The cost of compute: A $7 trillion race to scale data centers](https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-cost-of-compute-a-7-trillion-dollar-race-to-scale-data-centers): 2025년 4월 28일 발행, 로그인 없이 접근 가능, redirect 없음, `available/current`입니다. 같은 시리즈의 후속 공개판은 확인되지 않았습니다.
- PwC, [State of the semiconductor industry](https://www.pwc.com/gx/en/industries/technology/state-of-the-semicon-industry.html): 2024년 11월 28일 발행, 웹 본문과 PDF 모두 로그인 없이 접근 가능, redirect 없음, `available/current`입니다. 같은 시리즈의 후속 공개판은 확인되지 않았습니다.
- Deloitte, [2025 Engineering and Construction Industry Outlook](https://www.deloitte.com/us/en/insights/industry/engineering-and-construction/engineering-and-construction-industry-outlook/2025.html): 2024년 11월 4일 발행, 로그인 없이 접근 가능, redirect 없음, `available/previous`입니다. 기존 상세 route를 유지하고 2026판으로 연결합니다.
- KPMG, [Global construction survey 2025/2026](https://kpmg.com/xx/en/our-insights/operations/global-construction-survey.html): 공식 글로벌 페이지와 2026년 3월 PDF가 로그인 없이 열리며 redirect가 없습니다. `available/current`로 유지하고 발행 표시는 `2026년 3월`로 갱신했습니다.

발견한 최신판 및 처리:

- Deloitte [2026 Engineering and Construction Industry Outlook](https://www.deloitte.com/us/en/insights/industry/engineering-and-construction/engineering-and-construction-industry-outlook.html)은 2025년 11월 13일 공개된 같은 연간 시리즈의 후속판입니다.
- 새 report를 `current`로 추가하고 2025판을 `previous`로 변경했습니다. 재건/인프라 시장지도와 현대건설 Pick의 기본 연결은 필터를 통해 2026판을 사용합니다.
- 로그인이나 이메일 입력이 필요한 후속판은 발견되지 않아 사용자 확인 필요 자료는 없습니다.

남은 TODO:

- 공개 보고서 상태를 주기적으로 확인하는 no-dependency validator를 검토합니다. `data.ts`를 정규식으로 파싱하거나 로그인 자동화를 추가하지 않습니다.

### 근거 보기 레이어 및 사용자 화면 메타데이터 정리

적용 일시: 2026-06-21

- `lastCheckedAt`, `latestEditionCheckedAt`, `sourceStatus`, `editionStatus`, `canonicalUrl`, `latestReportId`, `sourceStatusNote`는 삭제하지 않고 내부 운영 데이터로 유지합니다.
- 정상 `current` 보고서의 원문 확인일, 최신판 확인일, 접근·판본 상태와 redirect 확인 문구는 사용자 화면에서 숨깁니다. 기본 화면에는 기관명과 공식 발행 연월만 표시합니다.
- `previous` 상세의 이전판 안내와 `최신판 보기` CTA, `unavailable` 상세의 원문 접근 불가 안내와 원문 CTA 제거는 계속 유지합니다.
- `EvidenceSource`와 `EvidenceGroup`은 시장지도와 Pick이 함께 사용하는 표시 구조입니다. 산업 보고서는 `industryReports` 레코드를 참조하고, 지도는 관련 Pick ID만 저장해 제목과 URL을 복제하지 않습니다.
- 시장지도 3개와 SMCI, Micron, LG전자, 현대건설 Pick에는 기본 접힘 상태의 `근거 보기`를 추가했습니다.
- `산업 구조`는 공개 산업 보고서, `기업·사업 확인`은 기존 SEC·IR·회사 공식 자료, `이슈·시장 확인`은 Pick에 이미 등록된 확인 자료만 사용합니다.
- 산업 보고서는 시장 구조를 이해하는 참고 자료이며 직접 계약·수주 증거로 표현하지 않습니다. 재무 숫자는 SEC, OpenDART, 회사 IR과 공시 원문을 우선합니다.
- 실제 source가 없는 그룹과 근거가 전혀 없는 섹션은 렌더하지 않습니다. 네 Pick의 기존 `원문/출처` drawer는 새 레이어로 통합해 같은 링크가 중복 표시되지 않게 했습니다.
- 외부 원문은 새 탭에서 `noreferrer noopener`로 열고, 산업 보고서 요약은 기존 내부 `/ko/reports/:reportId` route로 이동합니다.
- 로그인, 이메일 폼, 유료 또는 회원 전용 자료는 사이트에 추가하지 않습니다. 원문 PDF나 전체 보고서는 repo와 public asset에 재배포하지 않습니다.

남은 TODO:

- 모든 Pick의 공식 source 보강
- SEC/OpenDART/IR source registry 통합
- 뉴스 source freshness 관리
- 공개 링크 validator
- 출처 중복 제거 자동 검사

### 산업 보고서 서재 UI 정리 및 재건/인프라 지도 통일

확인 일시: 2026-06-19

- `/ko/reports`의 큰 접근 상태 안내 섹션을 제거하고, 개별 공개 보고서의 작은 상태 badge만 유지했습니다.
- 서재 hero의 navy 톤은 유지하면서 제목은 흰색, 본문은 밝은 slate, 보조 문구는 밝은 blue로 대비를 높였습니다.
- 보고서 metadata에 상세 route용 `slug`와 `publishedAt`, `publishedLabel`을 추가했습니다. 공식 출처에서 월을 확인할 수 있는 경우에만 연월을 표시하고, 명확하지 않으면 연도만 표시합니다.
- `/ko/reports/:reportId` 상세 route는 `public` 보고서만 렌더링하며 요약, 산업 시야, 활용 방법, 시장지도/Pick, 공식 원문을 연결합니다.
- 재건/인프라 지도는 `hero -> 선택 기업 pill -> 선택 기업/같이 볼 회사 2열 -> compact 5단계 -> 전체 연결 보기 -> 관련 보고서` 순서로 통일했습니다.
- 현대건설은 `Pick only`와 `관련 Pick 보기`만 유지합니다. 다른 reference 기업에는 기업해설이나 숫자 CTA를 만들지 않습니다.
- ReactFlow 19개 노드는 기본 화면에서 숨기고 `전체 연결 보기`를 눌렀을 때만 렌더링합니다.
- 로컬 QA에서 서재·상세·세 시장지도·재건 query·연결 Pick을 390px로 확인했으며 모두 overflow `0`이었습니다.

### 이번 주 Huntsman·uniQure Pick 반영

적용 기준일: 2026-06-22

주차 구성:

- 이번 주 Pick: Huntsman, uniQure
- 지난주 Pick: SMCI, Micron, 현대건설, DraftKings
- 그 이전 주 Pick: Marvell, LG전자, Taylor Morrison
- 이전 Pick: Dell, Snowflake, NVIDIA, 삼성전자 등 기존 나머지 Pick을 유지합니다.
- 홈 대표 Pick은 Huntsman이며, `/ko/picks`에서는 Huntsman과 uniQure만 표시합니다. 기존 Pick 상세 route는 삭제하지 않습니다.

Huntsman 공식 조건 확인:

- Huntsman과 Olin은 2026년 6월 16일 전액 주식 교환 방식의 합병을 발표했습니다.
- Huntsman 주주는 1주당 Olin `0.5476주`를 받습니다. 고정 현금 대가는 없고, 단주에 한해 무이자 현금 정산이 있습니다.
- 합병 후 예상 지분은 Olin 주주 약 54.5%, Huntsman 주주 약 45.5%입니다.
- 양사는 2027년 상반기 종결을 목표로 하며, Huntsman 주주 승인, Olin 주주 승인, 미국과 해외 규제 승인 등 통상적인 종결 조건이 남아 있습니다.
- 6월 15일 종가 기준 Olin `25.30달러 × 0.5476 = 약 13.85달러`로, Huntsman 종가 15.89달러보다 약 12.8% 낮았습니다. 발표일 Huntsman 종가는 13.18달러로 약 17.1% 하락했습니다. 회사는 교환비율이 6월 12일까지 30일 거래량가중평균가격을 기준으로 정해졌다고 설명했습니다.
- 공식 원문: [Huntsman·Olin 공동 발표](https://www.sec.gov/Archives/edgar/data/74303/000119312526271782/d99037dex991.htm), [Huntsman 8-K](https://www.sec.gov/Archives/edgar/data/1307954/000110465926074683/tm2618028d1_8k.htm), [Olin 8-K](https://www.sec.gov/Archives/edgar/data/74303/000119312526271782/d99037d8k.htm)

uniQure FDA 발표 확인:

- uniQure는 2026년 6월 17일 FDA Type B 미팅 결과를 발표했습니다. AMT-130은 헌팅턴병을 대상으로 개발 중인 유전자치료제입니다.
- FDA는 3년차 1/2상 분석을 가속승인 BLA의 주된 근거로 받아들일 수 있다고 전달했습니다. 회사는 2026년 3분기 BLA 제출을 계획하며, 제출 전 확증시험 설계를 FDA와 추가로 맞춰야 합니다.
- 이는 BLA 제출 가능성이 다시 열린 단계입니다. BLA 제출, FDA 접수, 심사, 가속승인, 상업화는 아직 완료되거나 확정되지 않았습니다.
- 발표일 uniQure 종가는 26.99달러에서 48.16달러로 약 78.4% 상승했습니다.
- 공식 원문: [uniQure 발표](https://uniqure.gcs-web.com/news-releases/news-release-details/uniqure-announces-plan-bla-submission-amt-130-huntingtons), [uniQure 8-K](https://www.sec.gov/Archives/edgar/data/1590560/000110465926074853/tm2618105d1_8k.htm), [FDA 가속승인 안내](https://www.fda.gov/drugs/nda-and-bla-approvals/accelerated-approval-program)

표시 정책과 남은 확인:

- 두 Pick 모두 기업해설·숫자 CTA를 만들지 않은 `Pick only`입니다. 공식 자료와 공개 과거 시세만 `근거 보기`에 표시하고, source가 없는 빈 그룹은 렌더하지 않습니다.
- `HUN`, `QURE` 가격 row는 2026년 6월 22일 production API에서 확인되지 않아 `가격 준비 중` fallback을 사용합니다. 가격 sync script, Yahoo/KIS source, 가격 API와 ticker universe는 수정하지 않았습니다.
- 관련 시장지도는 작은 준비 안내만 표시합니다. 화학 업황·원재료·M&A 지도와 바이오 임상·FDA 규제 경로 지도는 이번 작업에서 만들지 않습니다.
- 로그인, 이메일 입력, 유료 또는 회원 전용 자료는 사용하지 않았고 사용자 확인이 필요한 원문은 없습니다.

로컬 QA:

- production bundle 기준 `/`, `/ko/`, `/ko/picks`, `/ko/picks/archive`, Huntsman·uniQure 신규 상세, 지난주·그 이전 주 기존 상세 7개, `/ko/market-map`, `/ko/reports`를 확인했습니다.
- 390×844 viewport에서 확인한 모든 route의 `document.documentElement.scrollWidth - window.innerWidth`는 `0`이고 콘솔 오류는 `0`입니다.
- Huntsman 상세의 `근거 보기`를 클릭해 `기업·거래 확인`, `이슈·시장 확인`의 source 카드 5개가 열리는 것을 확인했습니다. uniQure 상세에는 `기업·규제 확인`, `이슈·시장 확인` source 카드 4개가 있으며 빈 그룹은 없습니다.
- 두 신규 상세에는 기업해설·숫자 CTA가 없고, `가격 준비 중` fallback과 작은 시장지도 준비 안내가 정상 표시됩니다.
- TypeScript `--noEmit`과 Vite production build를 통과했습니다. 기존 허용 경고인 ReactFlow `use client` 지시문과 500kB 이상 chunk 경고만 발생했습니다.
- 인앱 브라우저의 전체 페이지 캡처는 시간 초과했고, 번들 Playwright에는 실행 가능한 브라우저 바이너리가 없어 별도 픽셀 캡처를 만들지 못했습니다. 신규 설치 없이 visible DOM snapshot, 390px 폭 측정, 클릭 상태와 콘솔 검증으로 대체했습니다.

남은 TODO:

- Huntsman/Olin 조건 변경과 주주·규제 승인 추적
- 합병 시너지와 화학 업황 추적
- AMT-130 BLA 실제 제출과 FDA 접수·심사 결과 추적
- 확증시험 설계와 추가 임상 요구 추적
- 화학/M&A 지도와 바이오/FDA 지도 검토

## 오늘 한눈에 및 공식 공시 레이더

홈(`/`, `/ko/`)에는 `오늘 한눈에` 섹션이 추가되어 이번 주 Pick 가격 변화, OpenDART와 SEC EDGAR 공시 동기화 상태, 최근 24시간 신규 공식 공시 수, 지금 확인할 체크포인트를 함께 보여줍니다. 새 상세 route는 `/ko/disclosures`이며, 읽기 API는 `/api/market-disclosures`와 `/api/market-sec-filings`, 보호된 sync route는 `/api/sync/disclosures`와 `/api/sync/sec-filings`입니다.

OpenDART 서버 전용 환경변수는 `OPENDART_API_KEY`입니다. 클라이언트 `VITE_` prefix를 쓰지 않으며 실제 key 값은 README, 로그, API 응답에 기록하지 않습니다. key가 없으면 sync API는 `OPENDART_NOT_CONFIGURED`로 내려가고, 화면에는 `공시 데이터를 준비하고 있습니다.`만 표시합니다.

감시 기업 registry는 `src/content/disclosures/companies.ts`에 있습니다. 현재 enabled 기업은 동양파일 `228340.KQ` / `00993931`, KCC `002380.KS` / `00105271`, 제주반도체 `080220.KQ` / `00447487`, 현대건설 `000720.KS` / `00164478`, 삼성물산 `028260.KS` / `00149655`, 대우건설 `047040.KS` / `00124540`, HD현대인프라코어 `042670.KS` / `00344287`, POSCO홀딩스 `005490.KS` / `00155319`, LS ELECTRIC `010120.KS` / `00105855`, 효성중공업 `298040.KS` / `01316245`입니다. 미국 ticker와 `WATCH` placeholder는 제외합니다.

Supabase table은 `market_disclosures`입니다. primary key는 OpenDART 접수번호 `receipt_number`이며 원문 전체나 raw response는 저장하지 않습니다. 저장 필드는 회사명, ticker, 공시 제목, 제출인, deterministic category, 접수일, DART 원문 URL, sync 시각 같은 normalized metadata입니다. SQL은 `supabase/schema.sql`과 `supabase/migrations/20260703_create_market_disclosures.sql`에 있습니다.

공시 category는 `src/content/disclosures/categories.ts`의 keyword mapping으로만 분류합니다. 공급계약, 실적, 정기보고서, 자금조달, 지분, 주요경영사항, 투자, 지배구조, 기타를 지원하며, 분류는 탐색 편의용입니다. 공시 제목만 보고 직접 계약이나 실적 효과를 단정하지 않습니다.

Vercel cron은 기존 가격 cron을 유지하고 `/api/sync/disclosures`를 추가합니다. 설정 시각은 평일 `00:05`, `03:35`, `07:35`, `09:35` UTC이며 각각 `09:05`, `12:35`, `16:35`, `18:35` KST입니다. Vercel Hobby plan은 cron이 하루 1회로 제한될 수 있으므로, 실제 project plan이 이 빈도를 지원하는지 Dashboard에서 확인해야 합니다.

UI stale 기준은 2시간입니다. 정상은 `OpenDART · HH:MM 기준`, 지연은 `업데이트 지연 · 마지막 확인 HH:MM`, 데이터 없음은 `최근 7일 새 공시가 없습니다.`, 최초 연결 전은 `공시 데이터를 준비하고 있습니다.`로 표시합니다. 읽기 API가 실패해도 홈 전체가 깨지지 않도록 빈 목록과 상태 메시지로 내려갑니다.

Source registry와 공시 레이더는 역할을 분리합니다. Source registry는 편집된 Pick 설명의 근거이고, 공시 레이더는 OpenDART와 SEC EDGAR에서 새로 발생한 동적 공식 이벤트입니다. 공시를 검토한 뒤 Pick 본문 근거로 삼아야 할 때만 편집자가 별도 source로 등록합니다.

SEC EDGAR filings radar는 미국 Pick용 공식 공시 피드입니다. 공식 SEC JSON endpoint `https://data.sec.gov/submissions/CIK##########.json`만 서버에서 호출하고, 클라이언트가 SEC를 직접 bulk 호출하지 않습니다. SEC User-Agent는 서버 전용 `SEC_USER_AGENT` 환경변수로만 사용하며 값은 API 응답, README, 로그에 기록하지 않습니다. 값이 없으면 sync는 SEC를 호출하지 않고 `SEC_USER_AGENT_NOT_CONFIGURED`로 안전하게 skip합니다.

SEC 감시 기업 registry는 `src/content/disclosures/sec-companies.ts`입니다. CIK는 SEC 공식 company ticker JSON 기준으로 저장하며, enabled 기업은 Meta `META` / `0001326801`, Hertz `HTZ` / `0001657853`, Huntsman `HUN` / `0001307954`, uniQure `QURE` / `0001590560`, Marvell `MRVL` / `0001835632`, Taylor Morrison `TMHC` / `0001562476`, Super Micro Computer `SMCI` / `0001375365`, DraftKings `DKNG` / `0001883685`, Micron `MU` / `0000723125`, Dell `DELL` / `0001571996`, Snowflake `SNOW` / `0001640147`, NVIDIA `NVDA` / `0001045810`입니다.

SEC Supabase table은 `market_sec_filings`입니다. primary key는 `accession_number`이며 저장 필드는 CIK, 회사명, ticker, form type, deterministic filing category, 제출 시각, report date, primary document, SEC Archives index URL, sync 시각 같은 normalized metadata입니다. SQL은 `supabase/schema.sql`과 `supabase/migrations/20260706_create_market_sec_filings.sql`에 있습니다. 원문 HTML scraping, third-party SEC API, 가격·뉴스 대체 데이터는 사용하지 않습니다.

SEC filing category는 `src/content/disclosures/sec-categories.ts`의 form mapping으로만 분류합니다. `8-K`, `10-Q`, `10-K`, `3/4/5`, `SC 13D/G`, `DEF 14A`, `S-1/S-3/S-4/424B`, `6-K/20-F`를 지원하며 amended form도 같은 유형으로 취급합니다. 분류는 탐색 편의용이고, 공시 발생만으로 매수·매도·수요 감소·주문 취소를 단정하지 않습니다.

Vercel cron은 기존 가격/OpenDART cron을 유지하고 `/api/sync/sec-filings`를 평일 `21:15 UTC`에 추가합니다. 한국시간으로는 다음 날 `06:15 KST`입니다. SEC UI stale 기준은 36시간이며, 정상은 `SEC EDGAR · HH:MM 기준`, 지연은 `업데이트 지연 · 마지막 확인 HH:MM`, 최초 연결 전은 `미국 공시 데이터를 준비하고 있습니다.`로 표시합니다.

로컬 검증:

```bash
npm run validate:content
npm run check:types
npm run build
```

운영 sync:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://YOUR_DOMAIN/api/sync/disclosures
curl -H "Authorization: Bearer $CRON_SECRET" https://YOUR_DOMAIN/api/sync/sec-filings
```

또는 Vercel Dashboard의 `finance1` project에서 Cron Jobs의 `/api/sync/disclosures` 또는 `/api/sync/sec-filings`를 Run 합니다. 확인 항목은 HTTP 200, 감시 기업 수, 신규 공시 수, upsert 성공, 오류 기업 수, fatal 없음, API key/User-Agent 노출 없음입니다.

### Production 운영 연결 검증 시도 (2026-07-03 KST)

기준 commit은 `3fbc88a55b79acc41a8a858950442e45686b3f23`이며 로컬 `main`과 `origin/main`이 일치했습니다. 작업 전 `git diff --check`는 통과했고 working tree는 clean이었습니다.

확인 대상 production은 `https://finance1-flax.vercel.app`입니다. 루트와 `/ko/`, `/ko/disclosures`, `/ko/picks`, `/ko/market-map`, `/ko/reports`는 HTTP 200을 반환했고, production HTML은 `assets/index-Ag8rDhkE.js`와 `assets/index-CpZ3BdL7.css`를 로드했습니다.

로컬에는 `VERCEL_TOKEN`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `OPENDART_API_KEY`가 설정되어 있지 않았고, `vercel`, `supabase`, `gh` CLI도 PATH에 없었습니다. Vercel Dashboard 접근 자동화는 시간 제한으로 완료하지 못했습니다. 따라서 `OPENDART_API_KEY` Production 존재 여부, Supabase migration 실제 적용 여부, 권한 있는 Cron Run, DB row 확인, deployment ID/SHA는 확인하지 못했습니다. secret 값은 출력하거나 기록하지 않았습니다.

공개 읽기 API는 다음 query 모두 HTTP 200이지만 `ok:false`, `code:"DISCLOSURES_UNAVAILABLE"`, `items:[]`, `meta.trackedCompanyCount:10`, `meta.lastSyncedAt:null`, `meta.stale:true`를 반환했습니다.

```text
/api/market-disclosures?limit=20
/api/market-disclosures?hours=24&limit=20
/api/market-disclosures?days=7&limit=20
/api/market-disclosures?ticker=228340.KQ&limit=20
/api/market-disclosures?category=supply-contract&limit=20
```

이 상태는 production 서버가 공시 API 코드는 실행하지만 Supabase `market_disclosures` 조회에서 실패 fallback으로 내려가는 상태입니다. migration 미적용 또는 production Supabase schema 불일치 가능성을 우선 확인해야 합니다.

production UI 확인 결과 `/ko/disclosures`는 `공시 레이더`, OpenDART 상태 카드, 10개 감시 기업 수, category/company 필터, 오류 fallback 문구를 렌더했고 콘솔 오류와 가로 overflow는 없었습니다. 홈 `/ko/`에는 `오늘 한눈에` 카드 3개가 표시됐고 공시 조회 실패 fallback이 표시됐으며 콘솔 오류와 가로 overflow는 없었습니다. 실제 공시 row가 없으므로 DART 원문 링크, 공시 카드, Pick 상세 최근 공시 실데이터 표시는 아직 확인되지 않았습니다.

다음 운영 단계는 Vercel `finance1` Production env에서 `OPENDART_API_KEY` 존재 여부만 확인하고, production Supabase에 `supabase/migrations/20260703_create_market_disclosures.sql`을 적용한 뒤, production redeploy 후 Vercel Dashboard Cron Jobs에서 `/api/sync/disclosures`를 한 번만 Run 하는 것입니다. 이후 `market_disclosures` row count, duplicate receipt 0건, ticker/category 집계, 공개 API 실데이터, 홈·공시 레이더·국내 Pick 상세 실데이터, 다음 자동 cron을 확인합니다.

### Production 운영 연결 완료 (2026-07-03 KST)

기준 commit은 `704271dba6f2a4053fdb92dec9e53203c4c8774e`이며 로컬 `main`과 `origin/main`이 일치했습니다. Vercel production deployment는 `6z2Hg1hVk6psWbHne3uyvjTGDror`, production domain은 `https://finance1-flax.vercel.app`입니다. production HTML asset은 `assets/index-Ag8rDhkE.js`와 `assets/index-CpZ3BdL7.css`입니다.

Production env는 secret 값을 열람하지 않았습니다. `OPENDART_API_KEY`, `CRON_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`는 Dashboard Cron 실행과 Supabase upsert 성공으로 production configured 상태를 확인했습니다.

Supabase SQL Editor에서 `supabase/migrations/20260703_create_market_disclosures.sql`을 적용했고, `Run with Enable RLS`로 실행했습니다. 이후 확인 결과 `market_disclosures` RLS는 `true`입니다. 컬럼은 `receipt_number`, `corp_code`, `company_name`, `ticker`, `report_name`, `filer_name`, `disclosure_category`, `received_at`, `source_url`, `source`, `synced_at`이며 `ticker`와 `filer_name`만 nullable입니다. index는 `market_disclosures_pkey`, `market_disclosures_received_at_idx`, `market_disclosures_ticker_idx`, `market_disclosures_corp_code_idx`입니다.

sync 전 공개 API는 `ok:true`, `items:[]`, `lastSyncedAt:null`, `trackedCompanyCount:10`으로 바뀌어 `DISCLOSURES_UNAVAILABLE`가 제거된 것을 확인했습니다.

Vercel Dashboard `finance1 -> Settings -> Cron Jobs`에서 `/api/sync/disclosures`를 Run 했습니다. 화면 피드백이 없어 한 번 재시도되어 Vercel Logs에는 다음 두 요청이 남았습니다. 둘 다 `GET 200`, user agent `vercel-cron/1.0`입니다.

```text
2026-07-03 05:44:16.58 UTC / 2026-07-03 14:44:16.58 KST
status: success
ended_at: 2026-07-03 05:44:24.331 UTC
inserted_count: 15
updated_count: 0
duration: 8.26s

2026-07-03 05:44:34.164 UTC / 2026-07-03 14:44:34.164 KST
status: success
ended_at: 2026-07-03 05:44:40.64 UTC
inserted_count: 0
updated_count: 15
```

첫 저장 후 DB 확인 결과 `market_disclosures`는 총 15 rows이고 duplicate receipt는 0건입니다. ticker별 count는 `000720.KS:4`, `298040.KS:3`, `002380.KS:2`, `228340.KQ:2`, `028260.KS:2`, `005490.KS:2`입니다. category별 count는 `ownership:7`, `major-management:4`, `other:3`, `supply-contract:1`입니다.

공개 API 확인 결과는 모두 HTTP 200, `ok:true`, `lastSyncedAt` 존재, `stale:false`입니다.

```text
/api/market-disclosures?limit=5
items: 5
lastSyncedAt: 2026-07-03T05:44:34.164+00:00

/api/market-disclosures?days=7&limit=100
items: 15
duplicate receipt in response: 0

/api/market-disclosures?hours=24&limit=100
items: 0
lastSyncedAt: 2026-07-03T05:44:40.64+00:00

/api/market-disclosures?ticker=228340.KQ&limit=20
items: 2

/api/market-disclosures?category=supply-contract&limit=20
items: 1
```

국내 Pick 상세용 ticker 확인 결과 동양파일 `228340.KQ`는 2건, KCC `002380.KS`는 2건, 제주반도체 `080220.KQ`는 0건입니다. Hertz `HTZ`는 OpenDART 대상이 아니며 API 필터 결과 0건입니다.

DART 원문 링크 표본 3건은 모두 HTTP 200입니다.

```text
20260702900224
20260702000275
20260702800309
```

프론트 코드에서 공시 레이더와 Pick 상세의 OpenDART 링크는 `target="_blank"`와 `rel="noopener noreferrer"`를 사용합니다.

Production UI HTTP 확인 결과 `/`, `/ko/`, `/ko/disclosures`, 동양파일/KCC/제주반도체/Hertz Pick 상세 route는 모두 HTTP 200입니다. 브라우저 모바일 렌더 순회는 in-app browser navigation timeout으로 끝까지 완료하지 못했지만, API와 route HTTP, DART 링크 보안 속성, fallback 제거는 확인했습니다.

공시 cron UTC/KST 일정은 다음과 같습니다.

```text
00:05 UTC / 09:05 KST
03:35 UTC / 12:35 KST
07:35 UTC / 16:35 KST
09:35 UTC / 18:35 KST
```

가격 cron은 `08:30 UTC / 17:30 KST`, `22:30 UTC / 07:30 KST`입니다. 첫 자동 cron 확인은 아직 남아 있으며, 다음 자동 실행 후 `lastSyncedAt` 갱신과 duplicate receipt 0건을 다시 보면 됩니다.

### Production SEC EDGAR 운영 연결 완료 (2026-07-07 KST)

기준 commit은 `2a7bbdd2626e5606e317cdde31f8f2c983507b0c`이며 로컬 `main`과 `origin/main`이 일치했습니다. Vercel project는 `finance1`, production domain은 `https://finance1-flax.vercel.app`이고 production deployment는 `main`의 `2a7bbdd`로 `Ready` 상태였습니다.

Production env 값은 열람하거나 출력하지 않았습니다.

```text
SEC_USER_AGENT: Production configured
CRON_SECRET: Production configured
Supabase server env: Production configured
```

Supabase SQL Editor에서 `supabase/migrations/20260706_create_market_sec_filings.sql`을 적용했고, Dashboard의 RLS 경고에서는 `Run and enable RLS`로 실행했습니다. 적용 및 public API 정상화 확인 시각은 `2026-07-07 12:20 UTC / 2026-07-07 21:20 KST`입니다. 적용 후 `market_sec_filings`는 `accession_number` primary key, 필수 12개 column, `filed_at`, `ticker`, `cik`, `form_type` index와 primary key index를 갖습니다. RLS는 `true`, policy count는 `0`이라 browser direct anon/auth write는 차단되고, 서버 API는 service role 경로로 동작합니다.

마이그레이션 직후 공개 API는 `HTTP 200`, `ok:true`, `items:[]`, `lastSyncedAt:null`, `trackedCompanyCount:12`로 바뀌어 `SEC_FILINGS_UNAVAILABLE` fallback이 제거됐습니다. env 변경은 없었고 production이 이미 최신 commit이어서 별도 redeploy 없이 route가 정상 table을 읽었습니다.

Vercel Dashboard `finance1 -> Settings -> Cron Jobs`에서 `/api/sync/sec-filings`를 한 번 Run 했습니다. sync row의 `synced_at`은 `2026-07-07T12:22:54.138+00:00` (`2026-07-07 21:22:54 KST`)입니다. Vercel Logs 상세 화면은 timeout으로 duration을 확인하지 못했지만, sync route success path와 이후 public API/DB write로 완료를 확인했습니다.

첫 sync 후 공개 API 기준 결과:

```text
tracked companies: 12
successful ticker feeds: 12
failed ticker feeds: 0 observed
fetched/inserted rows: 225
updated rows: 0
duplicate accession: 0
lastSyncedAt: 2026-07-07T12:22:54.138+00:00
stale: false
```

Ticker별 count:

```text
META 13
HTZ 9
HUN 2
QURE 21
MRVL 21
TMHC 3
SMCI 20
DKNG 5
MU 10
DELL 66
SNOW 34
NVDA 21
```

Form별 count:

```text
4 187
8-K 30
424B5 6
10-Q 2
```

Category별 count:

```text
insider-transaction 187
current-report 30
capital-markets 6
quarterly-report 2
```

공개 API 검증 결과는 모두 `HTTP 200`, `ok:true`, `lastSyncedAt` 존재, `stale:false`입니다.

```text
/api/market-sec-filings?limit=20
items: 20

/api/market-sec-filings?days=30&limit=20
items: 20

/api/market-sec-filings?ticker=META&limit=20
items: 13

/api/market-sec-filings?ticker=HTZ&limit=20
items: 9

/api/market-sec-filings?ticker=MU&limit=20
items: 10

/api/market-sec-filings?form=8-K&limit=20
items: 20

/api/market-sec-filings?form=10-Q&limit=20
items: 2

/api/market-sec-filings?form=4&limit=20
items: 20

/api/market-sec-filings?category=insider-transaction&limit=20
items: 20
```

SEC Archives 원문 링크 표본은 모두 HTTP 200이며, URL의 CIK path와 accession path가 API row와 일치했습니다.

```text
META 0000950103-26-010283
MU 0001632063-26-000003
NVDA 0001197647-26-000005
HTZ 0001886897-26-000006
SMCI 0001392941-26-000011
```

Production UI 확인:

```text
/ko/disclosures
- SEC EDGAR tab 클릭 시 SEC row만 표시
- SEC 원문 link target="_blank", rel="noopener noreferrer"
- OpenDART tab/data 유지
- console error 0

/ko/
- 오늘 한눈에에서 SEC EDGAR sync 시각 표시
- 최근 24시간 공식 공시 count에 OpenDART와 SEC 반영
- 대표 Pick SK하이닉스 유지
- console error 0

미국 Pick 상세
- Meta, Micron 상세에서 최근 SEC 공시 표시
- 해당 ticker filing만 최근순 표시
- SEC Archives link 정상
- 가격 badge와 기존 본문 유지

국내 Pick 회귀
- SK하이닉스 상세에서 OpenDART 최근 공식 공시 유지
- SEC section 미표시
- 가격 badge와 기존 본문 유지
```

OpenDART 회귀 API는 `HTTP 200`, `ok:true`, `items:20`으로 기존 row가 유지됐습니다. 현재 OpenDART `stale:true`는 SEC 작업과 별개로 마지막 OpenDART sync가 2시간 stale 기준을 넘긴 상태입니다.

SEC cron 설정은 `/api/sync/sec-filings`, `15 21 * * 1-5`입니다. UTC/KST 변환은 `21:15 UTC / 다음 날 06:15 KST`이며, 2026-07-07 기준 다음 자동 실행 예정은 `2026-07-07 21:15 UTC / 2026-07-08 06:15 KST`입니다. 기존 가격 cron과 OpenDART cron은 유지됩니다. 첫 자동 cron 이후에는 `lastSyncedAt` 갱신, 신규 filing upsert, duplicate accession 0건을 재확인하면 됩니다.

### SEC 8-K Item 및 Form 4 구조화

이번 단계는 기존 `market_sec_filings` metadata row를 삭제하거나 다시 만들지 않고, 별도 detail table에 SEC 원문에서 기계적으로 확인 가능한 값만 저장합니다. 생성형 요약, 공시 본문 추측, 투자 판단 표현은 사용하지 않습니다.

신규 schema:

```text
table: market_sec_filing_details
primary key: accession_number
foreign key: accession_number -> market_sec_filings.accession_number on delete cascade
parser_version: sec-structured-v1
parsing_status: pending | parsed | not-applicable | source-unavailable | parse-error
jsonb: eight_k_items, reporting_owners, non_derivative_transactions, derivative_transactions, footnotes
indexes: form_type, parsing_status, parsed_at desc
RLS: enabled
policy: 없음. browser direct anon/auth write를 열지 않고 server service-role path만 사용합니다.
```

파일 위치:

- Migration: `supabase/migrations/20260707_create_market_sec_filing_details.sql`
- Schema mirror: `supabase/schema.sql`
- 8-K mapping: `src/lib/sec/eightKItems.ts`
- Form 4 parser: `src/lib/sec/form4Parser.ts`, `src/lib/sec/xml.ts`
- Transaction code mapping: `src/lib/sec/transactionCodes.ts`
- Detail sync: `scripts/sync-sec-filing-details.ts`
- 보호 route: `api/sync/sec-filing-details.ts`
- 공개 API 확장: `api/market-sec-filings.ts`
- UI 표시: `src/App.tsx`, `src/styles.css`

8-K 구조화:

- 대상 form은 `8-K`, `8-K/A`입니다.
- SEC submissions JSON의 filing별 `items` 값만 사용합니다.
- 쉼표 분리, 공백 제거, 유효 Item 번호 유지, 중복 제거, 원래 순서 보존 규칙으로 정규화합니다.
- Item이 없으면 빈 배열로 저장하고 UI는 `공시 항목 정보 없음`으로 표시합니다.
- Item mapping은 공식 Form 8-K 항목 기준 33개를 지원합니다. `2.02`, `5.02`, `7.01`, `8.01`, `9.01` 등은 중립적 한국어 설명으로 표시합니다.

Form 4 구조화:

- 대상 form은 `4`, `4/A`입니다.
- primary XML의 `ownershipDocument`만 파싱합니다.
- `reportingOwner`는 여러 명을 배열로 보존합니다.
- `nonDerivativeTransaction`과 `derivativeTransaction`은 분리 저장합니다.
- 수량, 가격, 행사 가격, 거래 후 보유량은 숫자 변환 실패 시 `null`입니다.
- 비파생 거래의 `shares * pricePerShare`는 두 값이 모두 있을 때만 계산합니다.
- 각주는 `footnote`와 거래별 `footnoteId`를 보존하고, UI에서는 `각주 있음 · 원문 조건 확인`처럼 짧게 안내합니다.

Transaction code mapping:

- SEC ownership form code table 기준으로 `P`, `S`, `V`, `A`, `D`, `F`, `I`, `M`, `C`, `E`, `H`, `O`, `X`, `G`, `L`, `W`, `Z`, `J`, `K`, `U` 20개를 지원합니다.
- UI 상위 분류는 `open-market-purchase`, `open-market-sale`, `award`, `tax-withholding`, `gift`, `option-exercise`, `derivative`, `other`입니다.
- `P`만 공개시장/사적 매수, `S`만 공개시장/사적 매도로 표시합니다.
- `A`, `M`, `F`, `G` 등은 보상 취득, 옵션 행사/전환, 세금·행사가격 납부 목적 처분, 증여처럼 실제 코드 의미로 표시합니다.

공개 API 호환:

```text
/api/market-sec-filings?limit=20
/api/market-sec-filings?form=8-K&limit=20
/api/market-sec-filings?form=4&limit=20
/api/market-sec-filings?item=2.02&limit=20
/api/market-sec-filings?transactionCode=P&limit=20
/api/market-sec-filings?ownerRole=director&limit=20
/api/market-sec-filings?ownership=direct&limit=20
```

기존 response field는 유지하고, 각 filing item에 선택 필드로 `parsingStatus`, `eightKItems`, `reportingOwners`, `nonDerivativeTransactions`, `derivativeTransactions`, `footnotes`, `footnoteCount`, `sourceDocumentUrl`, `parseError`를 붙입니다. Detail table이 아직 없거나 조회 실패해도 기존 filing 목록은 fallback으로 유지합니다.

UI 적용:

- `/ko/disclosures` SEC 카드에 8-K Item, Form 4 reporting owner, transaction code, 수량, 가격, 직접/간접 보유, 거래 후 보유량, 각주 안내를 표시합니다.
- SEC 탭에는 8-K Item 필터와 Form 4 거래 코드 필터를 추가합니다.
- 미국 Pick 상세의 `최근 SEC 공시`에도 같은 구조 요약을 표시합니다.
- `8-K/A`, `4/A`는 `수정 공시` badge를 표시하고 원본과 함께 확인하라는 안내를 붙입니다.

Backfill 절차:

```bash
npm run validate:content
./node_modules/.bin/tsc -p tsconfig.scripts.json
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/vite build
```

Production 적용 순서:

1. Supabase SQL Editor에서 `20260707_create_market_sec_filing_details.sql` 적용
2. production deploy 확인
3. 보호 route `/api/sync/sec-filing-details`를 작은 batch로 실행
4. `8-K`, `8-K/A`, `4`, `4/A` 대상만 backfill
5. `parsed`, `source-unavailable`, `parse-error`, `skipped`, SEC `429/5xx` count 확인
6. 실제 SEC 원문 표본 8-K 3건, Form 4 5건 대조
7. `/ko/disclosures`, 미국 Pick 상세, OpenDART, 가격 API 회귀 확인

운영 기록 표:

| 항목 | 값 |
| --- | --- |
| 기존 SEC rows | production backfill 후 기록 |
| 대상 8-K / 8-K-A | production backfill 후 기록 |
| parsed 8-K | production backfill 후 기록 |
| Item 없는 8-K | production backfill 후 기록 |
| 대상 Form 4 / 4-A | production backfill 후 기록 |
| parsed Form 4 | production backfill 후 기록 |
| reporting owner | production backfill 후 기록 |
| non-derivative transactions | production backfill 후 기록 |
| derivative transactions | production backfill 후 기록 |
| footnotes | production backfill 후 기록 |
| source unavailable | production backfill 후 기록 |
| parse error | production backfill 후 기록 |
| skipped | production backfill 후 기록 |
| duplicate accession / detail | production backfill 후 기록 |
| SEC 429 / 5xx | production backfill 후 기록 |

감시 기업 추가 절차:

1. 공식 OpenDART `corpCode.xml`에서 ticker와 corpCode를 확인합니다.
2. `dartTrackedCompanies`에 회사명, 내부 ticker, corpCode, source를 등록합니다.
3. `npm run validate:content`로 중복과 제외 규칙을 확인합니다.
4. `/api/sync/disclosures`를 실행합니다.
5. `/api/market-disclosures`와 `/ko/disclosures`에서 노출을 확인합니다.

남은 TODO:

- 공시 원문 세부 항목 구조화
- 공급계약 금액과 매출 대비 비중 추출
- 사용자 관심 기업 watchlist
- 공시 알림
- 공시와 기존 Pick 가설 연결
- 공시 사후 검증

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

## 오늘 시장 브리핑 및 거시 흐름 연결

홈 `/`, `/ko/`의 첫 section에 최신 거래일의 시장 결과를 먼저 보여줍니다. 정보 순서는 `시장 결과 → 주요 원인 → 자산 간 연결 → 산업 영향 → 관련 기업`입니다. 개인 관심목록, 로그인, 포트폴리오, 알림, 자동 투자 신호는 포함하지 않습니다.

운영 daily entry에는 mock 가격·샘플 해설이 없으며, 확인할 수 없는 원인을 가격 방향만으로 자동 생성하지 않습니다.

### 가격 데이터와 기존 API 재사용

클라이언트는 기존 `/api/market-prices`를 한 번만 호출합니다. `include=market-brief`일 때 서버가 Supabase의 최신 row를 우선 사용하고, 아직 저장되지 않은 거시 symbol만 기존 Yahoo Finance chart adapter로 보완합니다. 다음 가격 sync부터는 동일 symbol이 기존 `market_prices` 구조에 저장될 수 있도록 universe에도 추가했습니다. 페이지에서 asset별 요청을 만들지 않으며 KIS, Yahoo, Supabase 가격 row와 기존 shared price state를 그대로 재사용합니다.

2026-07-11 작업 시작 시 production에는 개별주 94개 row(KIS 52, Yahoo 42)가 있었고 아래 거시 symbol의 저장 row는 0개였습니다. 신규 Supabase table, 신규 cron, 신규 chart library, 신규 외부 provider는 추가하지 않았습니다. Finnhub, Twelve Data, FRED 환경변수도 필요하지 않았습니다.

| 구분 | 표시 이름 | symbol | provider | 통화·단위 |
| --- | --- | --- | --- | --- |
| 지수 | 코스피 | `^KS11` | Yahoo Finance chart | 지수 pt |
| 지수 | 코스닥 | `^KQ11` | Yahoo Finance chart | 지수 pt |
| 지수 | S&P 500 | `^GSPC` | Yahoo Finance chart | 지수 pt |
| 지수 | 나스닥 종합 | `^IXIC` | Yahoo Finance chart | 지수 pt |
| 환율 | USD/KRW | `KRW=X` | Yahoo Finance chart | KRW/USD |
| 금리 | 미국 10년물 | `^TNX` | Yahoo Finance chart | %, 변화는 bp |
| 원자재 | 금 선물 | `GC=F` | Yahoo Finance chart | USD/트로이온스 |
| 원자재 | 구리 선물 | `HG=F` | Yahoo Finance chart | USD/파운드 |
| 원자재 | WTI 선물 | `CL=F` | Yahoo Finance chart | USD/배럴 |

전일 변화는 Yahoo `range=5d&interval=1d`의 마지막 두 유효 daily close를 비교합니다. `chartPreviousClose`는 조회 범위 앞쪽 기준값일 수 있어 직전 거래일 종가로 사용하지 않습니다. 미국 10년물은 수익률 값의 차이에 100을 곱해 bp로 표시합니다. 원자재 계약 단위는 CME 계약 명세를 source registry에 함께 연결했습니다.

Yahoo에서 추가 조회 가능한 다우, SOX, USD/JPY, EUR/USD, Dollar Index, 은, Brent, 천연가스는 첫 화면을 compact하게 유지하기 위해 이번 버전에서는 제외했습니다. 미국 2년물 현물금리는 검증된 Yahoo symbol을 확인하지 못했으므로 10년-2년 spread도 표시하지 않습니다. 한국 기준금리·한국 국채 10년물도 현재 가격 adapter에 검증된 mapping이 없어 제외했습니다. 이 항목들이 꼭 필요해질 때만 기존 구조로 불가능한 이유와 provider·요금·호출 제한·라이선스를 먼저 검토합니다.

### Daily content registry와 연결 흐름

동적 가격과 정적 해설을 분리했습니다.

- `src/content/daily-market/assets.ts`: symbol, provider, currency/unit, 일반적 자산 관계
- `src/content/daily-market/entries.ts`: 최신 거래일 brief 1개, driver 3개, flow 2개
- `src/content/daily-market/selectors.ts`: 최신 날짜, driver, flow selector
- `src/content/daily-market/types.ts`: fact, relationship, interpretation을 구분하는 타입
- `src/content/sources/entries.ts`: Yahoo, CME, IEA, 당일 공개 보도 source

최신 entry는 `2026-07-10`이며 한국 시장, 미국 시장, USD/KRW, 미국 10년물, 금, 구리, WTI를 포함합니다. 흐름은 각각 4단계입니다.

1. AI 대표 기업 강세 → AI 선도 기업 선호라는 당일 해석 → S&P 500·나스닥 상승 확인 → `us-semiconductors` 시장지도와 NVIDIA·SK하이닉스·Micron
2. 구리 상승 확인 → 전력망의 구리 수요라는 일반적 관계 → 데이터센터 전력 수요 → `datacenter-power-cooling` 시장지도와 Eaton·Vertiv·Schneider Electric

상관관계를 확정적 인과처럼 쓰지 않습니다. `MarketFlowStep.type`은 `fact`, `relationship`, `interpretation` 중 하나이며 UI에도 각각 `확인된 시장 데이터`, `일반적 경제 관계`, `오늘의 시장 해석`으로 표시합니다.

### 방향 색상과 가격 panel

가격·지수 방향은 전역 token으로 통일합니다.

- 상승: 초록색 + `▲`
- 하락: 빨간색 + `▼`
- 보합: 중립 회색 + `—`

기존 반대 방향 색상은 0개였습니다. 위험·경고 상태와 시장 방향 token은 분리했습니다. 공통 `PriceBadge`는 `price-panel__main`과 `price-panel__meta` 구조로 바꾸고 큰 box를 pill이 아닌 16~22px radius 카드로 정리했습니다. 가격과 등락률은 baseline 정렬하고, source·기준일은 별도 meta 행에서 wrap됩니다. 큰 원화 값은 정수 단위, 달러 가격은 소수 둘째 자리까지 표시합니다. 홈, Pick 목록·보관함·상세, 인프라 시장지도, 기업 분석, 일반 시장지도 우측 panel의 동일 컴포넌트에 적용됩니다.

### Validator와 QA

정적 validator는 brief 날짜, 최신 selector, driver/flow/asset id 중복, flow 2~4단계, sourceRefs, marketMapId, companyIds, 비어 있는 fact, fact/interpretation 분리, mock/예시 문구, 자동 투자 신호 문구, 승인되지 않은 provider를 검사합니다. 네트워크는 validator 필수 조건이 아닙니다. 양수·음수·0 방향 helper와 큰 원화·달러 가격 format도 함께 확인합니다.

로컬 브라우저 QA 결과:

| 항목 | 결과 |
| --- | --- |
| Desktop 브리핑·9개 asset·2개 flow | 정상 |
| 390×844 | 2열, horizontal overflow 0, clipping 0 |
| 360×800 | 2열, horizontal overflow 0, clipping 0 |
| 320×700 | 1열, horizontal overflow 0, clipping 0 |
| 200% 상당 640px CSS viewport | horizontal overflow 0, clipping 0 |
| `/`, `/ko/`, Pick, 보관함, 시장지도, 공시, Pick 상세 | horizontal overflow 0 |
| 가격 panel overflow | 0 |
| CTA clipping | 0 |
| broken image | 0 |
| console warning/error | 0 |

API 회귀 기준선은 `/api/market-prices?limit=200` 200/`ok:true`/94 rows/META 포함, `/api/market-disclosures?limit=20` 200/`ok:true`/20 rows, SEC 기본 20 rows, `item=2.02` 1 row, `transactionCode=S` 5 rows였습니다. Sync endpoint는 이번 작업에서 수동 실행하지 않았습니다.

Production은 Vercel `finance1`, branch `main`, URL `https://finance1-flax.vercel.app`에서 2026-07-11 12:46 KST에 확인했습니다. 기능 배포 ID는 `GRu58UHogbV1WACSrgTJDEoDD4ch`, code commit은 `a4c3a530fb10c571cfc2a54d67850948ba1c5660`, asset은 `/assets/index-BWOPbUql.js`와 `/assets/index-DCi8d4HI.css`입니다. `/api/market-prices?limit=200&include=market-brief`는 200/`ok:true`, 기존 META를 포함한 103개 가격과 거시 symbol 9개를 반환했습니다. OpenDART와 SEC 기본·Item·transactionCode 회귀도 모두 200/`ok:true`였고 production desktop·390px·320px에서 horizontal overflow, price clipping, broken image, console warning/error가 0개였습니다.

## 산업 리포트 허브 확대 및 거시·산업·기업 연결

`/ko/reports`는 컨설팅 보고서 5건 중심의 목록에서 공공기관, 산업단체, 회사 IR의 공식 리포트 15건을 연결하는 허브로 확장했습니다. 카테고리는 `거시경제`, `반도체·AI`, `전력·데이터센터`, `에너지·원자재`, `건설·인프라` 5개이며 각 카테고리당 3건입니다.

리포트 데이터는 다음처럼 분리합니다.

- `src/content/reports/types.ts`: 카테고리, 접근 상태, 출처 유형, 실제·전망·범위 수치 타입
- `src/content/reports/entries.ts`: 15개 리포트의 3줄 요약, 검증 수치, 시장지도·기업·Pick 연결
- `src/content/reports/selectors.ts`: featured 우선 정렬, 카테고리·최근 1주/1개월·공식/회사 필터
- `src/content/sources/entries.ts`: 공식 원문 URL의 단일 레지스트리

리포트 entry에는 URL을 직접 넣지 않고 `sourceRefs`만 둡니다. `sourceRegistry`가 원문 URL과 발행처를 해석하므로 같은 링크를 여러 콘텐츠에 중복 저장하지 않습니다. 접근 상태는 `public-full`, `public-summary`, `registration-required`, `restricted`를 지원하며 현재 공개 전문 14건, 공개 요약 1건입니다. Featured는 `IEA Electricity 2026` 한 건입니다.

카드와 상세 화면은 `공식 리포트 → 3줄 요약 → 원문에서 확인한 실제/전망/범위 수치 → 시장지도 → 기업 → Pick` 순서로 읽습니다. 홈 최신 리포트는 featured를 먼저 배치한 뒤 발행일 내림차순으로 최대 3건만 표시합니다. 오늘 시장 브리핑의 두 흐름에는 `reportIds`를 추가해 `이 흐름을 이해하는 보고서`에서 상세 화면으로 이동합니다.

정적 validator는 12~18건 범위, 정확히 5개 카테고리, featured 1건, id/slug 중복, 발행일, 3줄 요약, 수치 타입, sourceRefs, 시장지도·회사·Pick 참조, daily market의 reportIds를 검사합니다. 현재 기준은 리포트 15건, 검증 수치 42개, 잘못된 참조 0개입니다.

이번 확장은 정적 콘텐츠와 기존 route/UI만 사용합니다. 신규 dependency, provider, DB table, cron, sync endpoint, 환경변수는 추가하지 않았습니다. 기존 환경에 Finnhub, Twelve Data, FRED 키가 있더라도 이번 기능은 이를 호출하지 않으며 런타임 호출 수는 0입니다.

요약은 `무엇이 달라졌나 → 왜 중요한가 → 어떤 산업·기업을 볼 것인가`를 직접 작성한 한국어 3개 bullet로 제한합니다. 원문 전체, 장문 인용, 표·차트, 유료 보고서 본문은 복제하지 않습니다. 자동 크롤링과 자동 AI 요약도 없습니다. 핵심 숫자는 단위·문맥·기준 시점과 함께 `actual`, `forecast`, `scope`로 구분합니다.

공통 source registry에는 공식 원문 14개를 추가했고 기존 `iea-electricity-2026` source 1개를 재사용했습니다. 리포트별 연결은 4개 시장지도, 기존 회사 registry와 인프라 지도 회사, 실제 존재하는 Pick만 사용합니다. 시장 브리핑 2개 flow에는 배경 이해용 리포트 6개를 연결했습니다.

로컬 QA는 `/`, `/ko/`, `/ko/reports`, 4개 활성 시장지도, Micron Pick 상세, IEA 리포트 상세에서 진행했습니다. 390×844 리포트 목록, 360×800 상세, 320×700 홈, 200% 확대 상당의 640px CSS viewport에서 horizontal overflow, 핵심 숫자·CTA clipping, broken image, console warning/error가 모두 0개였습니다. 카테고리 필터는 반도체·AI 3건, 출처 필터를 함께 적용하면 회사 IR 2건, 최근 1주 필터는 1건을 반환했습니다.

배포 전 API 회귀는 Production `finance1`에서 확인했습니다. 가격 기본은 94개와 META를 유지했고 `include=market-brief`는 기존 94개와 거시 9개를 합친 103개를 반환했습니다. provider는 기존 KIS·Yahoo만 존재했습니다. OpenDART 20개, SEC 기본 20개, Item 2.02 1개, transactionCode S 5개가 모두 HTTP 200과 `ok:true`였습니다. 배포 대상은 branch `main`, canonical project `finance1`, alias `https://finance1-flax.vercel.app`입니다.

## 공급망 병목 레이더 MVP

`/ko/bottlenecks`는 공급망 제약을 `공급 제약 → 확인된 근거 → 상태·변화 방향 → 산업 영향 → 시장지도 → 보고서 → 기업 역할 → Pick` 순서로 읽는 편집형 모니터링 화면입니다. 레이더 차트나 실시간 정밀 점수는 사용하지 않습니다.

정적 registry는 `src/content/bottlenecks/types.ts`, `entries.ts`, `selectors.ts`, `index.ts`에 있습니다. 첫 버전은 다음 6개를 추적합니다.

- 변압기·고압 전력기기
- 데이터센터 전력·냉각
- 대형 가스터빈 생산 슬롯
- HBM·첨단 패키징
- 구리·전력망 핵심 금속
- 반도체 팹 전력·건설 인프라

상태는 `normal(정상)`, `watch(관찰)`, `tight(타이트)`, `critical(심각)` 네 단계입니다. 변화 방향은 `easing(완화)`, `stable(변화 적음)`, `tightening(더 타이트해짐)`, 편집 판단 신뢰도는 `high(높음)`, `medium(보통)`, `low(제한적)`으로 구분합니다. 현재 구성은 타이트 4개·관찰 2개, 더 타이트해짐 4개·변화 적음 2개, 신뢰도 높음 4개·보통 1개·제한적 1개입니다. Featured는 변압기·고압 전력기기 한 건입니다.

각 병목은 확인된 evidence와 편집 assessment를 별도 필드로 관리합니다. 전체 evidence는 18개이며 공식 데이터 7개, 기업 공식 자료 8개, 산업 보고서 3개입니다. evidence에는 값·단위·문맥·기준일·sourceRef·근거 유형이 포함됩니다. 각 entry에는 공급 압력, 완화 신호, 불확실성을 따로 기록합니다. 공개 직접 지표가 부족한 반도체 팹 인프라는 `관찰·신뢰도 제한적`으로 표시했습니다.

기존 산업 리포트 15건과 source registry를 우선 재사용했습니다. 고유 source 10개 중 8개를 재사용하고, 가스터빈 직접 지표를 위해 GE Vernova 2026년 1분기 실적과 Siemens Energy FY2026 1분기 실적 source 2개만 추가했습니다. report 연결 13건, 시장지도 연결 10건, 기업 연결 24건, Pick 연결 5건입니다. 기업은 공급자·증설 중·수요 유발·조달 영향·대체 공급 역할과 연결 이유를 함께 표시합니다.

오늘 시장 브리핑의 AI flow에는 HBM·첨단 패키징과 데이터센터 전력·냉각을, 구리 flow에는 구리·전력망 핵심 금속과 변압기·고압 전력기기를 배경 정보로 연결했습니다. 홈에는 featured·상태 심각도·악화 방향·검토일 순으로 최대 3개만 표시합니다. 산업 리포트 목록은 연결 병목 1개, 상세는 전체 연결 병목을 역참조해 보여줍니다.

Validator는 병목 id/slug, 상태·방향·신뢰도, 날짜와 미래 날짜, featured, evidence 2~5개, source/report/map/company/Pick, 기업 역할, daily-market 및 report bottleneckIds, 공급 압력·완화 신호·불확실성, 투자 추천 문구, URL 하드코딩, DB·cron·provider 의존을 네트워크 없이 검사합니다.

로컬 QA는 `/`, `/ko/`, 목록·상세 병목 route, 리포트, 시장지도, 활성 시장지도 3개, Micron Pick 상세에서 진행했습니다. 390×844 목록, 360×800 상세, 320×700 홈, 200% 확대 상당 640px CSS viewport에서 horizontal overflow, 제목·badge·숫자·기업 역할·CTA clipping, broken image, console warning/error가 모두 0개였습니다.

자동 크롤링, 자동 뉴스 수집, 신규 DB, 신규 cron, 신규 sync endpoint, 신규 dependency, 신규 provider 호출, 가짜 정밀 점수, 자동 투자 신호는 없습니다. Finnhub·FRED·Twelve Data 런타임 요청은 각각 0이며 sync endpoint는 실행하지 않습니다. Production 대상은 Vercel `finance1`, branch `main`, alias `https://finance1-flax.vercel.app`입니다.

## 거시 유동성·금리·산업 수요 온도판 MVP

`/ko/macro-dashboard`와 `/macro-dashboard`는 미국 금리 구조, 금융여건, 시중 유동성, 산업·인프라 수요를 같은 화면에서 확인하는 거시 온도판입니다. 경기 예측 모델이나 투자 추천 화면이 아니며 종합 점수, 경기침체 확률, 자동 매수·매도 신호를 만들지 않습니다.

지원 시계열은 FRED 공식 series 9개입니다.

| 영역 | Series | 표시 단위 | 빈도 | 변화 계산 |
| --- | --- | --- | --- | --- |
| 금리 구조 | DGS2 | % | 일별 | 직전·20개 유효 관측 대비 bp |
| 금리 구조 | DGS10 | % | 일별 | 직전·20개 유효 관측 대비 bp |
| 금리 구조 | T10Y2Y | %, bp 환산 | 일별 | 직전·20개 유효 관측 대비 bp |
| 금융여건 | NFCI | index | 주별 | 직전·4주·13주 절대 변화 |
| 유동성 | WALCL | 조 달러 | 주별 | 원본 백만 달러를 조 달러로 표시, 변화는 십억 달러 |
| 유동성 | M2SL | 조 달러 | 월별 | 원본 십억 달러를 조 달러로 표시, 전월·전년 동월 대비 % |
| 산업·인프라 | INDPRO | 2017=100 index | 월별 | 전월·전년 동월 대비 % |
| 산업·인프라 | CUMFNS | % | 월별 | 전월·전년 동월 대비 percentage point |
| 산업·인프라 | PERMIT | 천 호, 계절조정 연율 | 월별 | 전월·전년 동월 대비 % |

브라우저는 `/api/macro-indicators`를 한 번 호출하고, 이 공개 route는 Vercel rewrite로 기존 `market-prices` Serverless Function의 거시 분기에 연결됩니다. Hobby plan의 12개 함수 한도를 유지하면서 내부 `api/_lib/macro-indicators.ts`가 기존 `api/_lib/providers/fred.ts` 헬퍼를 통해 series별 최대 한 번씩 FRED를 조회합니다. 서버 요청은 동시 3개로 제한하며 일부 series 실패는 성공한 결과를 보존합니다. 모든 series가 실패하면 안전한 `FRED_UPSTREAM_ERROR`, 인증 실패는 `FRED_AUTH_FAILED`, key가 없는 로컬 환경은 HTTP 503과 `FRED_NOT_CONFIGURED`를 반환합니다. raw provider body, API key, key가 포함된 URL은 응답이나 로그에 노출하지 않습니다.

응답 캐시는 `public, s-maxage=3600, stale-while-revalidate=86400`입니다. DB 영구 저장이나 cron을 추가하지 않고 Vercel CDN이 같은 시간대의 응답을 재사용하고, 재검증 중에는 기존 응답을 유지할 수 있게 합니다. FRED의 `.` 결측 관측은 0으로 바꾸지 않고 제외합니다. compact history는 일별 60개, 주별 52개, 월별 24개의 최신 유효 관측만 반환합니다. 월별·주별 공개값은 이후 수정될 수 있으며 이번 버전에는 ALFRED vintage 비교가 없습니다.

정적 설명은 동적 관측값과 분리합니다. `src/content/macro/indicators.ts`에 공식 title, 단위, 빈도, 원 기관, 해석과 주의점을 두고 `src/content/macro/briefs.ts`에는 기준일·검토일이 있는 4개 영역 해설을 둡니다. API observation이나 변화값을 보고 브라우저가 원인을 자동 생성하지 않습니다. NFCI는 값 상승이 더 타이트한 방향, 값 하락이 더 느슨한 방향임을 별도 표시합니다. 연준 총자산 증가도 시장 유동성 증가와 바로 동일시하지 않습니다.

홈은 9개 지표를 반복하지 않고 영역 요약 4개와 `거시 지표 전체 보기` CTA만 표시합니다. 오늘 시장 브리핑은 기존 Yahoo `^TNX`를 유지하고 `거시 배경 더 보기`로 FRED DGS10·장단기 금리차·금융여건 화면을 연결합니다. 거시 온도판 하단은 관련 산업 리포트 최대 4건과 5개 공급망 병목을 연결합니다. 병목 상세의 `macroIndicatorIds`는 산업생산, 제조업 가동률, 건축허가를 구조적 배경으로만 제시하며 직접 인과를 단정하지 않습니다.

Sparkline은 신규 chart library 없이 responsive SVG로 그립니다. 결측·빈 history, 동일 값의 0 나눗셈, 좁은 화면을 안전하게 처리하고 일별 60개·주별 52개·월별 24개를 사용합니다. 거시 변화 색상은 주가 상승·하락 token과 분리해 증가를 중립 파랑, 감소를 중립 보라, 변화 없음을 회색으로 표시합니다.

Validator는 정확히 9개 series, indicator/series/brief/domain 중복, 단위·빈도·변화 방식, source/report/bottleneck 참조, 날짜와 미래 날짜, 가짜 점수·경기침체 확률·투자 신호 문구, client FRED env 참조, Finnhub·Twelve Data 의존을 네트워크 없이 검사합니다. 단위 검증은 `.` 제외, 최신 유효값, history 제한, bp·percentage point, WALCL·M2 변환, NFCI 의미, partial·전체 실패, key 미설정과 raw key 비노출을 포함합니다.

신규 DB, 신규 cron, 신규 sync endpoint, 신규 dependency는 없습니다. Finnhub와 Twelve Data는 호출하지 않으며 FRED key는 `process.env.FRED_API_KEY`를 사용하는 서버 코드에만 존재합니다. Production 대상은 Vercel `finance1`, branch `main`, alias `https://finance1-flax.vercel.app`입니다. 배포 후 desktop, 390×844, 360×800, 320×700, 200% 확대와 기존 가격·OpenDART·SEC·리포트·병목 회귀를 다시 확인합니다.

## 초보자용 홈 정보 구조·시각 언어 개편

기존 홈은 시장 브리핑, 거시 지표, 병목, Pick, 공시, 시장지도, 보고서가 비슷한 비중으로 이어져 처음 방문한 사용자가 무엇부터 볼지 판단하기 어려웠습니다. 이번 개편은 전문 데이터를 삭제하지 않고 입구만 `오늘 시장 → 움직인 배경 → 오늘의 핵심 변화 → 산업 연결 → 기업 공식 문서 → 상세 기능 → 기업 → 공식 자료` 순서로 정리했습니다. 거대한 hero와 장식 이미지는 사용하지 않습니다.

홈의 최종 순서는 다음 8단계입니다.

1. 오늘 시장 한눈에
2. 왜 움직였나요?
3. 오늘 알아둘 세 가지
4. 산업이 연결되는 과정
5. 기업이 직접 밝힌 변화
6. 더 깊게 보기
7. 이번 주에 살펴볼 기업
8. 공식 자료

쉬운 이름을 먼저 표시하고 전문 명칭은 부제로 유지합니다.

| 쉬운 이름 | 함께 표시하는 전문 명칭 |
| --- | --- |
| 돈의 흐름과 경기 | 금리·유동성·산업 수요 |
| 공급이 부족한 곳 | 공급망 병목 레이더 |
| 산업을 이해하는 자료 | 공식 보고서·기업 자료 |
| 기업이 직접 밝힌 변화 | 공식 공시 |
| 산업이 연결되는 구조 | 시장지도·공급망 구조 |
| 이번 주에 살펴볼 기업 | 주가해부실 Pick |

상단 navigation은 `오늘`, `산업`, `기업`, `자료` 네 그룹입니다. Desktop은 키보드로 열 수 있는 dropdown, mobile은 하나의 메뉴 안에서 네 그룹을 여는 구조입니다. 실제 leaf에 `aria-current`를 표시하고, Escape와 외부 클릭으로 닫으며 focus-visible과 최소 44px 터치 영역을 유지합니다. 기존 deep link와 route는 삭제하지 않았습니다.

첫 방문 안내 `주가해부실은 이렇게 보면 됩니다`는 홈을 가리지 않는 compact card입니다. 닫기 상태는 localStorage 하나에만 저장하고 로그인이나 서버 저장을 사용하지 않습니다. 공식 자료 아래의 `이 사이트 보는 법 다시 보기` 버튼으로 언제든 다시 열 수 있습니다.

홈 콘텐츠는 `src/content/home/`의 결정적 reference registry를 사용합니다. `오늘 알아둘 세 가지`는 시장 driver, 거시 brief, featured 병목을 정확히 한 개씩 참조합니다. 시장은 KOSPI, Nasdaq, USD/KRW, 구리 네 자산만 먼저 표시하고 전체 9개 자산·3개 driver·2개 flow는 같은 홈의 접힌 전체 브리핑에 유지합니다. `왜 움직였나요?`는 기존 daily-market flow 두 개를 각각 4단계로 재사용하며 사실·일반 관계·당일 해석을 계속 구분합니다.

거시 요약은 금리 부담, 금융여건, 시중 유동성, 산업 수요 4카드입니다. 각 카드가 기존 brief와 evidence indicator를 참조하고 실제 `/api/macro-indicators` history를 기존 `MacroSparkline`으로 표시합니다. 첫 화면에서는 호출하지 않고 거시 요약이 viewport 가까이에 들어올 때 한 번만 불러옵니다. module-scope Promise와 내부 SPA 이동을 함께 사용하므로 홈에서 이미 불러온 뒤 상세로 이동해도 같은 API가 중복 호출되지 않습니다. 가짜 계기판, 종합 점수, 경기 확률은 없습니다.

병목은 기존 selector의 상위 3개만 `정상 → 관찰 → 타이트 → 심각` CSS 상태 막대로 표시합니다. 색상과 함께 현재 상태 텍스트, 변화 방향, 설명, 완화 신호를 제공합니다. 산업 미니 flow는 기존 시장지도와 회사 ID만 사용하는 2개 흐름이며 각 4~5단계입니다. 전체 ReactFlow 그래프는 홈에 넣지 않고 기존 상세 시장지도에 유지합니다.

기업 공식 문서는 기존 OpenDART·SEC 응답을 다시 fetch하지 않고 shared state에서 최대 3건을 선택합니다. 기존 lucide SVG를 재사용해 `실적`, `투자·증설`, `계약·수주`, `자금 조달`, `임원·주주 거래`, `인수·합병`, `그 밖의 변화` 7개 사건 유형을 표시합니다. SEC 구조화 정보가 없는 사건은 추정하지 않고 그 밖의 변화로 둡니다. 공식 자료는 검증된 metric을 가진 보고서 3개를 기관·카테고리·핵심 숫자·관련 산업과 함께 표시합니다.

`더 깊게 보기`는 돈의 흐름과 경기, 공급이 부족한 곳, 산업이 연결되는 구조, 산업을 이해하는 자료 4카드만 제공합니다. 각 카드에는 기능 설명과 현재 상태가 함께 있습니다. 상세 macro, 병목 목록·상세, 보고서 목록·상세, 공시, 시장지도에는 `한눈에 보기`, `왜 중요한가요?`, `현재 무엇을 봐야 하나요?`, `핵심 숫자` 순서를 앞단에 두고 기존 전문 지표·evidence·원문 출처는 아래에 유지했습니다.

공통 `TermHelp`는 장단기 금리차, 금융여건, 유동성, 산업생산, 가동률, 공급망 병목, 공시, 수주잔고, 리드타임 9개 정의를 제공합니다. click·Enter·Space로 열고 Escape·외부 클릭·닫기 버튼으로 닫을 수 있으며 focus가 호출 버튼으로 돌아갑니다. 모바일 panel은 viewport 안에 고정됩니다.

시각화 우선순위는 실제 데이터 SVG `MacroSparkline`, CSS 병목 상태 막대, 기존 vector icon, 텍스트입니다. 생성형 이미지, PNG/JPG stock photo, AI 자동 요약, 고정 데이터 이미지, 가짜 점수는 사용하지 않습니다. `prefers-reduced-motion`에서는 CSS motion과 ReactFlow 이동 시간을 제거합니다.

홈은 기존 가격 shared request 1회와 공시 shared state를 재사용합니다. 초기 viewport의 macro API 호출은 기존과 같은 0회이고, 거시 요약에 접근하면 `/api/macro-indicators`를 최대 1회 호출합니다. 이후 SPA 상세 이동 때도 누적 1회를 유지합니다. 브라우저의 FRED 직접 요청, Finnhub 요청, Twelve Data 요청은 각각 0입니다. 신규 API, Serverless Function, DB, cron, sync endpoint, dependency는 모두 0이며 기존 전문 데이터 삭제와 초보자·전문가 모드 분리도 없습니다.

정적 validator는 쉬운 제목, 4개 navigation route, 홈 노출 상한, insight·macro·병목·시장지도·회사·보고서 참조, 산업 flow 3~5단계, 공시 유형 7개, 용어 9개, 투자 추천·가짜 점수·외부 이미지·client secret 부재를 네트워크 없이 검사합니다. 모바일 QA 기준은 390×844, 360×800, 320×700, 200% 확대이며 horizontal overflow, 텍스트·숫자·marker·flow·icon·CTA clipping, tooltip viewport 이탈, broken route와 console error가 없어야 합니다.

가격·거시·OpenDART·SEC의 기존 공개 응답 계약은 변경하지 않았고 보고서 15개, 병목 6개, 기존 시장지도와 Pick route를 유지합니다. `package.json`과 `package-lock.json`은 변경하지 않습니다. Production 대상은 Vercel `finance1`, branch `main`, alias `https://finance1-flax.vercel.app`입니다.

로컬 브라우저 QA에서는 desktop, 390×844, 360×800, 320×700, 1280px 화면의 200% 확대 상당 640px CSS viewport에서 horizontal overflow, 텍스트·숫자·marker·CTA clipping, tooltip viewport 이탈, broken image, console warning/error가 모두 0개였습니다. 390px과 360px에서는 시장·거시 카드가 2열, 320px에서는 1열이며 insight·공시·flow는 모바일 1열입니다. Desktop dropdown과 mobile menu, leaf `aria-current`, ArrowDown, Escape, TermHelp click·Escape·외부 클릭·focus 복귀, 첫 방문 안내 dismiss·재열기, 접힌 전체 시장 브리핑의 즉시 열기를 확인했습니다.

배포 전 Production API 기준선은 가격 기본 94개, `include=market-brief` 103개, 거시 series 9개, OpenDART 20개, SEC 기본 20개, Item 2.02 1개, transactionCode S 5개이며 모두 HTTP 200과 `ok:true`입니다. 배포는 main push 뒤 `finance1` Production이 `Ready · Current`인지, canonical alias의 JS·CSS asset과 같은 회귀 수가 유지되는지 다시 확인합니다.

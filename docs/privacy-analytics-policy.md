# Privacy-first Analytics Policy

## 원칙

주가해부실의 analytics는 제품 흐름을 집계하기 위한 최소 관측 계층이다. 개인을 식별하거나 투자 관심사를 개인 프로필로 축적하지 않는다.

## 사용하는 기술

- Vercel Web Analytics의 기본 익명 pageview
- 같은 탭에서만 유지되는 `sessionStorage` attribution
- 앱 내부의 provider-neutral typed event adapter
- Development·Preview의 메모리 기반 QA record

Vercel은 Web Analytics를 cookie-free 방식으로 설명하고 있으며, 현재 Phase 5F는 별도 cookie나 persistent analytics ID를 만들지 않는다. 이 문서는 법률 자문이 아니다. 공급자, 저장 기간, 지역, 광고 목적 또는 수집 필드가 바뀌면 게시 전 별도 개인정보·동의 검토가 필요하다.

## 수집하는 값

- query·hash 없는 route template과 정규화 path
- page type, locale, schema version
- 등록된 content ID·company slug
- 정해진 placement·destination·재무 `groupId`·metric ID·검색 결과 position
- UTM source·medium·campaign·content의 제한된 정규화 값
- referrer category와 최초 landing route

## 수집하지 않는 값

- 이름, 이메일, 전화번호, 계정 또는 사용자 ID
- IP를 앱 payload에 저장하는 기능
- cookie, 장기 device ID, fingerprint
- 전체 URL, 전체 query, 원문 referrer, 원문 검색어
- 사용자가 입력한 기업 검색 문자열
- 주가·거래량·재무 금액
- WACC·성장률·영구가치·민감도 입력과 계산 결과
- 정확한 체류 시간, 키 입력, pointer 이동
- session replay, 화면 녹화, heatmap

## 보존과 환경

Attribution은 탭 sessionStorage에만 남고 서버 DB에 저장하지 않는다. Production만 Vercel provider로 pageview를 전송한다. Preview와 Development는 외부 analytics 전송을 하지 않는다. 브라우저의 Do Not Track 값이 `1`이면 앱의 analytics runtime은 pageview와 custom event를 모두 생략한다.

Referrer는 `instagram`, `search`, `social`, `direct`, `internal`, `other` 여섯 범주로 즉시 축약하며 원문 URL을 저장하지 않는다. Vercel dashboard의 보존 기간과 데이터 처리는 해당 계정 플랜·Vercel 정책을 따른다. [Vercel 공식 limits 문서](https://vercel.com/docs/analytics/limits-and-pricing)상 현재 Hobby Web Analytics 보존 기간은 30일이며, custom event 수집은 사용하지 않는다. 공급자 정책이나 플랜이 바뀌면 이 문서를 다시 검토한다.

## 동의와 변경 관리

현재 구현은 cookie·광고·개인 식별자 없이 최소 익명 집계만 사용한다. 이 전제 때문에 Phase 5F에서 별도 consent banner를 추가하지 않았다. 다음 중 하나가 생기면 배포 전에 동의 UI와 법적 근거를 다시 검토한다.

- 광고·retargeting·cross-site 목적
- cookie 또는 localStorage 기반 장기 ID
- 사용자 계정과 analytics 연결
- 원문 검색어·URL·referrer 보존
- 새 공급자나 데이터 국외 이전 조건 변경
- custom dimension에 금융 입력값 추가

## 운영 권한

분석 dashboard 접근은 최소 인원으로 제한한다. raw session을 개인 단위로 추적하지 않으며 집계가 작은 segment는 공개 보고에 사용하지 않는다. provider 장애 시 데이터를 재시도하기 위해 사용자 행동을 막거나 별도 endpoint로 우회 전송하지 않는다.

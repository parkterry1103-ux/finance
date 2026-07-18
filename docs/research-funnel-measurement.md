# Research Funnel Measurement

## 핵심 질문

1. 어떤 landing이 편집물 실제 읽기로 이어졌는가?
2. 읽은 사용자가 기업 페이지를 선택했는가?
3. 기업 도착 뒤 재무·가치평가·리포트 중 무엇을 탐색했는가?
4. 분석 화면에서 비교 모드와 근거 설명을 실제로 열었는가?

## 단계 정의

| 단계 | 분자 | 분모 | 해석 주의 |
| --- | --- | --- | --- |
| 콘텐츠 시작률 | `editorial_view` | `research_landing_view` | landing route 구성 차이를 함께 본다. |
| 90% 도달률 | depth 90 | `editorial_view` | 짧은 글과 긴 글을 직접 비교하지 않는다. |
| 읽기 완료율 | `editorial_complete` | `editorial_view` | 90%와 10초 조건이며 체류시간 자체는 없다. |
| 기업 클릭률 | `editorial_company_click` | `editorial_view` | 연결 기업이 없는 콘텐츠는 분모에서 따로 본다. |
| 기업 도착률 | `company_view` | 기업 click | 새 탭·네트워크 중단 때문에 차이가 날 수 있다. |
| 재무 탐색률 | `financials_view` | `company_view` | CTA 위치별 차이를 함께 본다. |
| 가치평가 탐색률 | `valuation_view` | full 가치평가 기업 view | unavailable 6개를 같은 분모로 쓰지 않는다. |
| 심층 리포트 탐색률 | `research_report_view` | report CTA 제공 기업 view | NVIDIA·Meta만 현재 대상이다. |

## 판형별 퍼널

### 주가해부

```text
research_landing_view
→ editorial_view (contentType=stock_dissection)
→ editorial_read_depth 25·50·75·90
→ editorial_complete
→ editorial_company_click
→ company_view
```

Published 주가해부가 없는 기간에는 0을 성과 저하로 해석하지 않고 해당 퍼널의 분모 자체가 없다고 기록한다.

### 오늘의 월스트리트

```text
research_landing_view
→ editorial_view (contentType=wall_street_edition)
→ editorial_read_depth 25·50·75·90
→ editorial_complete
→ editorial_company_click 또는 related_research_click
→ company_view 또는 다음 editorial_view
```

세 기사 판형은 글 길이가 주가해부와 다르므로 읽기 깊이·완료율을 판형 간 단순 우열로 비교하지 않는다.

### 기업 분석

```text
company_view
→ company_financials_click → financials_view
→ company_valuation_click → valuation_view
→ company_report_click → research_report_view
```

각 전환율의 분모는 실제 CTA가 제공되는 기업 view다. 가치평가·리포트가 없는 기업을 분모에 강제로 포함하지 않는다.

## 캠페인 비교

동일 콘텐츠의 profile·story 링크는 같은 campaign ID를 쓰고 `utm_content`만 나눠 placement 효과를 본다. 콘텐츠별 비교는 `contentId`, 캠페인별 비교는 `attribution.campaign`, 유입 배치 비교는 `attribution.content`로 집계한다. 날짜·판형·CTA 제공 여부가 다른 캠페인의 전환율을 같은 조건처럼 비교하지 않는다. 최소 2~4주와 충분한 표본이 쌓이기 전에는 순위를 만들지 않는다.

## Attribution 해석

Attribution은 같은 탭의 `sessionStorage`에만 남는다. UTM이 없는 다음 SPA route에서도 최초 source·medium·campaign·content와 landing route를 이어 쓴다. 탭을 닫은 뒤 장기 사용자 식별을 하지 않는다.

referrer는 URL이 아니라 아래 category로 즉시 축약한다.

```text
instagram / search / social / direct / internal / other
```

source별 표본이 작을 때 개별 session을 추적하거나 콘텐츠 결론을 바꾸지 않는다. 최소 2~4주 집계와 충분한 표본을 확인한 뒤 제품 변경 가설을 만든다.

## Click과 arrival

CTA click은 사용자의 의도이고 view는 destination이 실제 렌더링됐다는 뜻이다. 두 수치의 차이는 오류로 단정하지 않는다. 새 탭, 뒤로가기, route 데이터 미존재, 네트워크 중단, 브라우저 차단이 원인일 수 있다.

## 현재 측정 능력

- Vercel Hobby Web Analytics: 기본 익명 pageview 가능
- 21개 custom event: typed adapter·UI·test에서 검증
- Production custom event: 현재 플랜에서 미지원

custom event가 실제 수집되기 전에는 위 funnel 지표를 Production 실측치라고 보고하지 않는다.

## Page view와 visitor

Page view는 route가 표시된 횟수이고 visitor는 공급자가 개인정보 보호 방식으로 추정한 방문 단위다. 뒤로가기나 재방문은 page view를 늘릴 수 있으므로 두 값을 같은 의미로 쓰지 않는다. Provider가 안전한 unique visitor를 제공하지 않으면 page view로 visitor를 추정하지 않는다.

## Provider dashboard 구성

현재 Vercel Hobby dashboard에서는 익명 pageview의 상위 route와 referrer·국가·기기 같은 공급자 기본 집계만 운영 확인에 사용한다. Production 재배포 후 `/_vercel/insights/script.js`와 pageview 요청, `/ko/`·`/ko/insights`·기업 route의 집계를 확인한다. Preview·Development 데이터가 섞이지 않는지도 함께 본다.

21개 custom event 대시보드는 현재 Hobby에서 생성하지 않는다. 향후 승인된 Pro 기능이 열리면 event name을 1차 dimension, `contentType`·`contentId`·`companySlug`·`placement`·campaign을 제한된 breakdown으로 사용한다. 가격·금액·검색어·전체 URL을 dimension으로 추가하지 않으며 소표본 개인 session을 추적하지 않는다.

# Analytics Event Model

## 계약

모든 custom event는 schema version 1이며 공통 payload는 아래 값만 가진다.

```ts
type AnalyticsEventPayload = {
  schemaVersion: 1;
  locale: "ko";
  pageType:
    | "home" | "insights_index" | "stock_dissection"
    | "wall_street_edition" | "company" | "financials"
    | "valuation" | "research_report" | "macro" | "other";
  routeTemplate: string;
  contentType?:
    | "stock_dissection" | "wall_street_edition" | "company_brief"
    | "financial_pivot" | "valuation" | "research_report";
  contentId?: string;
  companySlug?: string;
  placement?:
    | "home" | "insights_index" | "editorial_header" | "editorial_body"
    | "editorial_footer" | "company_brief" | "financial_pivot"
    | "valuation" | "report" | "search" | "related_research";
  destinationType?: "editorial" | "company" | "financials" | "valuation" | "report" | "source" | "macro";
  attribution?: AnalyticsAttribution;
};
```

각 이벤트는 `src/analytics/validation.ts`의 개별 allowlist를 통과해야 한다. 알 수 없는 key, 비정상 숫자, query·hash가 붙은 route, 이벤트 의미와 무관한 key는 거부한다.

Attribution은 `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, referrer category, 최초 landing route만 같은 탭의 `sessionStorage`에 보존한다. 전체 query와 referrer URL은 보존하지 않는다. provider adapter는 이 중첩 객체를 공급자가 받는 primitive key로만 평탄화한다.

환경 정책은 다음과 같다.

- Production: 익명 pageview 전송. custom event는 공급자 기능과 명시적 feature flag가 모두 있을 때만 전송.
- Preview: 외부 analytics 전송 없음.
- Development: 외부 전송 없음. 메모리 test/debug adapter만 사용.

## 이벤트 21개

| 흐름 | 이벤트 | 기록 조건 | 추가 속성 |
| --- | --- | --- | --- |
| 유입 | `research_landing_view` | 외부·직접 첫 research landing | route context |
| 편집 | `editorial_view` | Published 상세가 실제 표시됨 | content type·ID |
| 편집 | `editorial_read_depth` | 25·50·75·90%를 처음 넘음 | `depthPercent` |
| 편집 | `editorial_complete` | 90% 이상이며 10초 이상 | content type·ID |
| 편집 | `editorial_source_open` | 외부 근거 링크 선택 | source type·순서·placement |
| 편집 | `editorial_company_click` | 편집 맥락에서 기업 선택 | company slug·destination |
| 편집 | `related_research_click` | 관련 편집물 선택 | content ID·placement |
| 기업 | `company_view` | 검증된 Company Brief 표시 | company slug |
| 기업 | `company_financials_click` | 재무 CTA 선택 | company slug·placement |
| 재무 | `financials_view` | 지원 재무 화면 도착 | company slug |
| 재무 | `financial_group_select` | 다른 지표 묶음 선택 | `groupId` |
| 재무 | `financial_compare_mode_select` | 다른 비교 모드 선택 | history·peer·industry |
| 재무 | `financial_metric_expand` | 지표 설명을 펼침 | metric ID·group |
| 기업 | `company_valuation_click` | 가치평가 CTA 선택 | company slug·placement |
| 가치 | `valuation_view` | 가치평가 route 도착 | company slug |
| 가치 | `valuation_assumptions_open` | 가정 설명을 펼침 | company slug |
| 가치 | `valuation_sensitivity_open` | 민감도 조절 영역에 처음 접근 | company slug |
| 기업 | `company_report_click` | 심층 리포트 CTA 선택 | company slug·placement |
| 리포트 | `research_report_view` | 실제 리포트가 표시됨 | company slug |
| 검색 | `company_search_select` | 제안에서 기업을 선택 | company slug·결과 position·placement |
| 거시 | `macro_dashboard_view` | 거시 dashboard route 도착 | route context |

## 중복 규칙

- 같은 React lifecycle의 동일 route pageview는 한 번만 기록한다.
- 다른 route를 방문한 뒤 뒤로가기로 돌아오면 새로운 pageview다.
- hash 이동은 pageview가 아니다.
- view, read milestone, complete, assumptions·sensitivity open은 한 page lifecycle에 한 번이다.
- 사용자가 명시적으로 반복한 CTA click은 각각의 의도로 볼 수 있다.

## 읽기 규칙

읽기 깊이는 콘텐츠 root의 문서상 top, 실제 scroll 높이, viewport bottom으로 계산한다. 25·50·75·90%를 역행 없이 한 번씩 기록한다. 완료는 90%와 10초를 모두 충족해야 하며 정확한 체류 시간은 payload에 넣지 않는다.

## 금지 payload

다음 값이나 이 의미의 key를 추가하지 않는다.

```text
query / raw search term
full URL / raw referrer
email / account / user ID
ticker from typed search input
price / amount / financial value
WACC / growth / terminal value / model output
exact dwell time
free-form article title or source URL
```

이벤트 추가는 taxonomy, 이벤트별 allowlist, unit fixture, 개인정보 문서와 Plan HTML을 함께 변경해야 한다.

## 2026-07-18 콘텐츠 ID

이번 릴리스는 기존 21개 이벤트 taxonomy를 변경하지 않는다. Netflix 주가해부는 `stock-2026-07-18-netflix-guidance-disclosure-reset`, 오늘의 월스트리트는 `wall-street-2026-07-18-capital-gate-premium`을 content ID와 campaign ID로 사용한다. 권장 UTM은 `instagram / social / 같은 campaign ID / profile-link`이며 제목, 가격, 등락률과 원문 URL은 payload에 넣지 않는다. Netflix 기업 상세에서는 기존 `company_view`, 재무 CTA와 editorial→company click만 재사용한다. 가치평가·리포트 CTA가 없으므로 해당 click event도 만들지 않는다.

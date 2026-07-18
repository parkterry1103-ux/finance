# 주가해부 3파일 입력 계약

## 목적

주가해부실은 시장 수치와 사건의 원천이 아니라 이를 검증하고 해석하는 분석 작성자다. Published 등록은 검증 리서치, 공개 본문, 구조화 handoff의 세 파일이 같은 사건과 핵심 수치를 가리킬 때만 허용한다. 자동 YAML parser나 업로드 도구는 만들지 않으며 개발자 review와 typed validation으로 등록한다.

## 사용자가 전달하는 세 파일

### `01_verified-research.md`

세션·날짜, 후보 선정 이유, 가격·거래량, 시장·업종·비교기업 수익률, 직접 촉매, likely contributor, 시장 배경, unresolved 원인, 확인·미확인 사실, 기업 판단 영향, 가치평가 재검토 여부, claim-level Source Pack과 검증 시각을 담는다.

### `04_website-article.md`

주가해부 상세의 공개 본문이다. 확인된 움직임, 시장·기업 요인, 미확인 내용, 움직임의 성격, 기존 판단 영향, 다음 확인 항목과 면책을 구분한다.

### `05_website-handoff.yaml`

홈 카드와 typed content 등록에 필요한 회사·ticker·시장, 사건·가격 기준일, 세션, 등락률, 시장·업종·비교기업과 `%p` 차이, 움직임 분류, 확인·미확인·다음 확인, 기업 판단·가치평가 검토 여부, 두 원문 경로와 근거 목록을 전달한다.

선택적으로 아래 analytics block을 포함할 수 있다. 누락해도 게시할 수 있고 registry ID를 기본 content ID로 쓴다. 존재하면 typed schema가 형식과 ID 충돌을 검증한다.

```yaml
analytics:
  content_id: "stock-YYYY-MM-DD-company-topic"
  campaign_id: "stock-YYYY-MM-DD-company-topic"
  recommended_utm:
    source: "instagram"
    medium: "social"
    campaign: "stock-YYYY-MM-DD-company-topic"
    content: "profile-link"
```

`analytics.content_id` 또는 `campaign_id`가 실제 editorial ID와 다르거나 `recommended_utm.campaign`이 `campaign_id`와 다르면 게시 validation이 실패한다. 이 metadata는 권장 링크를 전달할 뿐 runtime YAML parser나 자동 게시를 만들지 않는다.

## Published 필수조건

세 파일 중 하나라도 없으면 Published로 등록하지 않는다. 등록 객체는 다음을 모두 만족해야 한다.

```text
content_type == stock_dissection
status == owner_verified
event_as_of 존재
price_as_of 존재
session 존재
price_move finite number
verified_at 존재
evidence 1개 이상
confirmed_items 존재
unconfirmed_items 존재
watch_items 존재
research_source_file → 01_verified-research.md
detail_source_file → 04_website-article.md
handoff_source_file → 05_website-handoff.yaml
key_figures_consistent == true
```

`04_website-article.md`의 가격·거래량·비교 수치가 research 또는 handoff와 다르면 게시하지 않는다. evidence에는 가격·공시·뉴스의 실제 제공처, 기준일 또는 발행일을 남긴다.

## 작성자와 자료 출처

공개 화면은 다음을 분리한다.

- 작성·분석: 주가해부실
- 편집 검증: Owner Verified와 검증 시각
- 분석 기준: 사건 기준일, 가격 기준일, 세션
- 근거 자료: 기업 공시, 공식 발표, 시장 데이터, 주요 보도

`출처: 주가해부실 편집자`, `자료 출처: 주가해부실`, `가격 출처: 주가해부실`은 쓰지 않는다. 주가해부실 고유 판단에는 `주가해부실의 해석`, `편집자 판단`, `종합 분석`을 사용할 수 있다.

상세는 가격과 거래량, 기업 자료, 시장·업종 비교, 주요 보도를 구분한다. 기본 5개를 보여주고 추가 근거는 `전체 근거와 검증 기록 보기`에 둔다. 홈에는 Owner Verified, 분석 기준일, 가격 기준일만 표시하며 claim-level Source Pack 전체를 노출하지 않는다.

## `company_slug`가 null인 경우

지원 기업 8개와 확정적으로 매핑되지 않으면 `company_slug`는 null로 유지한다. 회사명·ticker는 콘텐츠에 표시할 수 있지만 가짜 기업 프로필이나 CTA를 만들지 않는다. related company index에도 넣지 않으며 새 기업 프로필은 별도 검증 단계에서만 추가한다.

## 업로드 후 검증 순서

1. 세 파일의 존재와 표준 파일명을 확인한다.
2. 사건일·가격일·세션과 시간대를 확인한다.
3. 가격·거래량·시장·업종·비교기업 수치를 세 파일에서 대조한다.
4. 직접 촉매, likely contributor, market background, unresolved를 구분한다.
5. evidence와 claim-level Source Pack의 제공처·문서명·기간·접근일을 확인한다.
6. `company_slug`와 editorial relation이 실제 registry에 있는지 확인한다.
7. typed content를 등록하고 editorial validation, unit, typecheck, build, Release Gate를 실행한다.

## Production 게시 순서

PR에서 세 원문과 typed content, summary, relation, smoke 기대값을 함께 review한다. CI와 Preview에서 홈·인사이트·상세·기업 연결을 확인하고 main merge 뒤 Current Production에서 같은 route를 smoke한다. sync endpoint나 신규 API는 사용하지 않는다.

## 정정·업데이트

사실 또는 수치가 바뀌면 원본 세 파일, typed content의 `updatedAt`, 근거와 검증 시각을 함께 갱신한다. 공개 결론이 바뀌는 정정은 변경 내용과 이유를 본문에 명시하고 동일한 검증 순서를 다시 거친다. 단순 오탈자 외에는 근거 기록 없이 Production만 직접 수정하지 않는다.

## Phase 5F 측정 연결

Published 상세이 실제 표시될 때만 `editorial_view`를 기록한다. 25·50·75·90% 읽기와 90%+10초 완료, 근거 열기, 관련 기업·리서치 이동을 typed event로 구분한다. 콘텐츠의 가격, 등락률, 거래량, 기사 제목, source URL과 사용자의 정확한 체류시간은 analytics payload에 넣지 않는다. 세 파일은 게시 근거이며, handoff의 선택 analytics block은 안정적인 콘텐츠·캠페인 ID와 권장 UTM만 전달한다.

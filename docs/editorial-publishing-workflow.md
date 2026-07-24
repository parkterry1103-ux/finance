# 편집 콘텐츠 게시 절차

## 상태 전이

`draft → verified → published → archived` 순서로 운영한다. `verified`는 사실 검토가 끝났지만 배포 승인을 받지 않은 상태이고, `archived`는 홈·목록에서는 내리되 기존 상세 링크를 보존할 때 사용한다.

## 작성부터 배포까지

1. 사용자가 작성하고 검증한 원고, 원문과 공식 교차검증 자료를 받는다.
2. 기사 전문을 복제하지 않고 출처 metadata와 자체 요약·분석만 typed object에 옮긴다.
3. 숫자, 발행일, 사건일, 가격일, 비교 기준일과 사실 상태를 확인하고 `ownerVerified` 시각과 메모를 기록한다.
4. 지원 기업 slug와 관련 콘텐츠 ID를 연결한다. 확인되지 않은 직접 관계는 만들지 않는다.
5. `npm run validate:editorial`을 실행한다.
6. 검토가 끝난 원고만 `verified`로 바꾼다.
7. summary index를 생성하고 PR review에서 상세와 일치하는지 확인한다.
8. 최종 승인 후 `published`로 바꾸고 Production에서 홈·상세·관련 기업 연결을 확인한다.

## 판형별 게시 조건

주가 해부는 대표 기사 URL을 강제하지 않는다. 대신 회사 식별자, 사건일·가격일, 유한 등락률, 직접 계기 또는 시장 해석, 확인·미확인·다음 확인, `ownerVerified`, 완성 원고와 하나 이상의 복수 근거가 필요하다. 근거는 URL이 없어도 유형, 수치의 성격과 기준일을 추적할 수 있어야 한다.

오늘의 월스트리트는 정확히 세 기사와 각 매체명·제목·발행 시각·원문 URL, 사용자가 작성한 분석, 공식 교차검증 자료, 팩트체크 상태, 통합 질문·인사이트·한 줄, `ownerVerified`를 요구한다. 기사 전문과 이미지는 저장하지 않는다. draft와 verified는 route slug를 알아도 사용자 화면에 본문이 나타나지 않는다.

## 수정과 보관

공개 후 사실이 바뀌면 원문을 덮어쓰지 않고 `updatedAt`과 변경 이유를 기록한다. 사건이 무산되거나 상태가 바뀌면 확정 표현을 수정한다. 홈에서 내릴 콘텐츠는 `archived`로 바꾸되 출처가 유효한 기존 상세는 유지할 수 있다.

## 빈 상태 운영

검증 가능한 published 원고가 없으면 홈은 정해진 준비 문구를 표시한다. 채우기 위한 예시 숫자나 가짜 콘텐츠를 만들지 않는다.

## Phase 5A.1 첫 게시

Phase 5A.1에서는 `2026-07-13-sk-hynix-selloff`와 `2026-07-17-standards-set-price`를 최초 Published로 등록했다. Phase 5B에서는 게시 흐름 검증용이던 SK하이닉스 콘텐츠를 제거하고 오늘의 월스트리트만 유지한다. 홈에는 정적 summary만 포함하고 상세 원고는 route 진입 뒤 불러온다. PayPal과 ASML이 포함된 기존 fixture는 draft 상태를 유지한다.

## Phase 5B 주가해부 등록

새 주가해부는 `01_verified-research.md`, `04_website-article.md`, `05_website-handoff.yaml` 세 파일을 모두 review한 뒤 등록한다. typed Published 객체에는 `stock_dissection`, `owner_verified`, 세션, 세 source file 경로와 `keyFiguresConsistent: true`를 기록한다. 가격·사실의 자료 제공처는 주가해부실의 작성·분석 표시와 분리한다. 전체 계약과 정정 순서는 [stock-dissection-intake.md](stock-dissection-intake.md)를 따른다.

## Phase 5F 게시와 analytics 확인

새 Published 콘텐츠는 기존 taxonomy의 content ID와 type을 재사용한다. 상세 route, summary, related link를 등록한 뒤 `npm run validate:analytics`로 payload allowlist를 함께 확인한다. Instagram link는 [instagram-linking-workflow.md](instagram-linking-workflow.md)의 UTM 규칙을 따르며 원고 제목·가격·원문 URL을 campaign 값에 복사하지 않는다. analytics가 실패해도 게시물, source link와 내부 이동은 정상이어야 한다. custom event dashboard 지원 여부는 배포 계정 플랜과 별도로 확인한다.

Website handoff의 `analytics`는 선택 필드다. 없으면 실제 registry ID를 content ID로 사용한다. 있으면 `content_id`, `campaign_id`, `recommended_utm.source`, `recommended_utm.medium`, `recommended_utm.campaign`, `recommended_utm.content`를 모두 검토한다. content ID가 실제 editorial ID와 충돌하거나 권장 campaign이 campaign ID와 다르면 Published로 올리지 않는다. 외부 주가해부·오늘의 월스트리트 스킬은 Phase 5F에서 직접 수정하지 않는다.

오늘의 월스트리트 handoff는 같은 선택 schema에서 `content_id`와 `campaign_id`를 `wall-street-YYYY-MM-DD-topic` 형식으로 제안할 수 있다. `recommended_utm`의 기본 의미는 `source: instagram`, `medium: social`, `campaign: campaign_id`, `content: profile-link`다. 실제 Published ID가 정해진 뒤에는 suggested ID가 아니라 registry ID를 우선하고, 제목을 analytics ID로 쓰지 않는다.

## 2026-07-18 Netflix·월가인사이트 릴리스

Netflix 주가해부는 세 파일을 함께 검토한 뒤 ID `stock-2026-07-18-netflix-guidance-disclosure-reset`로 게시한다. company slug는 먼저 등록·검증된 `netflix`에만 연결하며 주가해부에서 Netflix 기업 상세로 이동할 수 있다. 오늘의 월스트리트는 ID `wall-street-2026-07-18-capital-gate-premium`으로 별도 게시하고 PIX·VC·Etched 세 읽을거리를 유지한다. 두 콘텐츠는 같은 릴리스 날짜라는 이유만으로 서로 또는 관련 기업에 relation을 만들지 않는다. 홈은 짧은 Published summary 두 장을 독립적으로 노출하고 상세 본문은 각 route 진입 후 불러온다.

## Phase 5G 검색 경계

주가해부 게시만으로 Company Registry나 검색 index를 만들지 않는다. 기업 CTA와 검색 편입은 Company Registry, Company Brief, 공식 source, 기업 route, `searchVisible` validation이 모두 통과한 뒤에만 허용한다. `companySlug: null` 콘텐츠는 기업 CTA 없이 게시할 수 있다.

## 2026-07-23 통합 릴리스

SMCI 주가해부와 오늘의 월스트리트는 하나의 배포 단위로 검증하지만 서로 독립적인 registry record와 route를 가진다. SMCI만 기존 `supermicro` 기업에 연결하고 `wall-street-2026-07-23-option-cost`의 `relatedCompanySlugs`는 빈 배열을 유지한다. 홈 summary와 상세 typed module을 각각 추가하고 기존 edition·draft를 덮어쓰지 않는다. 긴 본문과 근거는 상세 route에서만 동적 로드한다.

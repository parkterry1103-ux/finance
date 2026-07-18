# Instagram Linking Workflow

## 링크 형식

인스타그램 프로필, 스토리 또는 게시물에서 사이트로 연결할 때 목적 페이지와 캠페인 문맥을 명시한다.

```text
https://finance1-flax.vercel.app/ko/insights/stock/{slug}
?utm_source=instagram
&utm_medium=social
&utm_campaign=stock-{date}-{company}-{topic}
&utm_content={placement}
```

오늘의 월스트리트는 `/ko/insights/3reads/{slug}`와 `wall-street-{date}-{topic}` 형식을 사용한다. 아래 값은 형식 예시이며 해당 콘텐츠가 실제 Published라는 뜻은 아니다.

```text
utm_source=instagram
utm_medium=social
utm_campaign=wall-street-2026-07-18-example-topic
utm_content=profile-link
```

## 값 규칙

- 소문자 영문·숫자·하이픈을 사용한다.
- 실제 Published editorial registry ID를 `content_id`로 사용하고 `campaign_id`와 같은 안정적인 식별자로 맞춘다. suggested ID보다 실제 registry ID가 우선이다.
- 제목을 ID로 쓰지 않으며 제목이 바뀌어도 `content_id`와 `campaign_id`는 바꾸지 않는다.
- content는 `profile-link`, `story-link`, `carousel-slide-10`처럼 배치만 설명한다.
- 이름, 이메일, 계정 ID, 검색어, 기사 제목 전체를 넣지 않는다.
- URL, `@`, `?`, `#`, `=`, `&`가 들어간 UTM 값은 runtime에서 버린다.
- `utm_term`과 임의 query는 analytics payload에 보존하지 않는다.

## 게시 전 확인

1. canonical Production URL인지 확인한다.
2. route가 Published 콘텐츠인지 확인한다.
3. UTM 네 값의 철자와 날짜를 검토한다.
4. 시크릿 창에서 링크가 200이고 모바일 가로 overflow가 없는지 확인한다.
5. dashboard에는 query가 제거된 route pageview만 보이는지 확인한다.
6. custom event를 확인할 때는 현재 Vercel 플랜이 이를 지원하는지 먼저 확인한다.

## 인스타그램 배치별 운영

- 프로필 링크는 `utm_content=profile-link`, 스토리 링크는 `utm_content=story-link`를 사용해 클릭 위치를 구분한다.
- 링크 인 바이오 서비스가 중간 redirect URL, 자체 UTM 또는 사용자 식별 query를 덧붙이는지 게시 전 확인한다. 원 목적 URL과 UTM 네 값이 그대로 전달되지 않으면 사용하지 않는다.
- 같은 콘텐츠의 profile·story 링크는 `campaign_id`를 공유하고 `utm_content`만 달리한다.
- 게시 후 campaign ID는 변경하지 않는다. 오탈자가 발견되면 콘텐츠 route와 기존 ID는 유지하고 잘못된 배치 URL만 바로잡아 변경 시각과 이전·새 값을 기록한다.

## Attribution 유지

사용자가 UTM landing 뒤 기업·재무·가치평가로 이동해 주소에서 UTM이 사라져도 최초 attribution은 같은 탭에서 유지된다. 탭을 닫거나 sessionStorage를 지우면 종료된다. 다른 탭이나 재방문자를 연결하지 않는다.

## 링크 수정

잘못된 campaign 링크를 이미 게시했다면 콘텐츠 route는 유지하고 Instagram 링크의 UTM 철자만 고친다. campaign ID를 새 ID로 재정의하거나 서로 다른 표기를 임의 병합하지 말고 변경 시각과 이전 값을 편집 기록에 남긴다.

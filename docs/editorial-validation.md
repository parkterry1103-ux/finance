# 편집 콘텐츠 검증

## 실행

```bash
npm run validate:editorial
```

이 명령은 script TypeScript를 컴파일한 뒤 실제 draft registry와 정상·실패 fixture를 검사한다. `release:gate`에도 같은 검사를 blocking check로 포함한다.

## 검사 항목

- 상태별 홈·상세 노출 규칙
- 미래 발행일 차단
- 3Reads read 수 2개·4개 차단, 1·2·3 order 강제
- central question, common thread, one-line takeaway 필수
- 공개 read의 URL·발행일·접근일과 중복 URL
- 주가 해부의 `percent` 단위, NaN·Infinity 차단
- 주가·시장·업종 비교 기준일 일치
- 상대수익률 계산과 `%p` 표시
- 미지원 기업 slug와 깨진 관련 콘텐츠 ID 차단
- 공개 주가 해부의 source ID 존재와 URL metadata
- Phase 5A 사용자 화면의 금지 표현

## 고정 fixture

정상 published 주가 해부와 3Reads 한 세트, 미래 날짜, read 2개, read 4개, 미지원 기업, 깨진 관계, 누락 출처, 실제 draft registry를 검사한다. 비교 fixture는 기업 `+17.0%`, 시장 `+1.8%`에서 `+15.2%p`가 나와야 한다.

## 실패 처리

검증 실패를 경고로 낮추거나 공개 index에서 조용히 보정하지 않는다. 원고·출처·기준일·관계의 원인을 수정한 뒤 다시 실행한다. 비교 자료가 없으면 0을 넣지 않고 UI에서 해당 행을 숨긴다.

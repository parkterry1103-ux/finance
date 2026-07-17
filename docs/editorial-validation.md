# 편집 콘텐츠 검증

## 실행

```bash
npm run validate:editorial
```

이 명령은 script TypeScript를 컴파일한 뒤 실제 draft registry와 정상·실패 fixture를 검사한다. `release:gate`에도 같은 검사를 blocking check로 포함한다.

## 검사 항목

- 상태별 홈·상세 노출 규칙
- 미래 발행일 차단
- 오늘의 월스트리트 기사 수 2개·4개 차단, 1·2·3 order 강제
- central question, common thread, one-line takeaway 필수
- 공개 read의 매체·제목·URL·발행일·접근일, 공식 교차검증 자료와 중복 URL
- 주가 해부의 `percent` 단위, NaN·Infinity 차단
- 주가·시장·업종 비교 기준일 일치
- 상대수익률 계산과 `%p` 표시
- 미지원 기업 slug와 깨진 관련 콘텐츠 ID 차단
- 공개 콘텐츠의 `ownerVerified` 존재
- 공개 주가 해부의 완성 원고와 하나 이상의 evidence
- evidence ID·유형·사실 성격·기준일과 참조 무결성; URL은 있을 때만 형식 검사
- Phase 5A 사용자 화면의 금지 표현

## 고정 fixture

기사 URL이 없는 owner-verified 주가 해부, 근거가 없는 공개 주가 해부, 정확히 세 원문과 공식 자료를 가진 오늘의 월스트리트, 미래 날짜, 기사 2개·4개, 미지원 기업, 깨진 관계, 실제 draft registry를 검사한다. 비교 fixture는 SK하이닉스 `-15.37%`, 삼성전자 `-10.70%`에서 `-4.67%p`가 나와야 하며 기준일이 다르면 validation이 실패한다. SK하이닉스 기존 slug 연결과 Burberry 가짜 프로필 부재도 검사한다.

## 실패 처리

검증 실패를 경고로 낮추거나 공개 index에서 조용히 보정하지 않는다. 원고·출처·기준일·관계의 원인을 수정한 뒤 다시 실행한다. 비교 자료가 없으면 0을 넣지 않고 UI에서 해당 행을 숨긴다.

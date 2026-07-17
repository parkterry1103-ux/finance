# 편집 콘텐츠 모델

## 두 콘텐츠를 분리하는 이유

3Reads는 세 출처를 한 질문으로 연결하는 판형이고, 주가 해부는 특정 사건 시점의 가격 반응과 비교·불확실성을 설명하는 판형이다. 공통 base로 억지로 합치지 않고 `ThreeReadsEdition`과 `DailyStockDissection`을 별도 타입으로 유지한다.

## 공통 규칙

- 식별자: registry 전체에서 `id`와 `slug`가 중복되지 않아야 한다.
- 상태: `draft`, `verified`, `published`, `archived` 중 하나다.
- 날짜: 공개 콘텐츠는 발행일과 콘텐츠 기준일을 가져야 하며 미래일 수 없다.
- 관계: 관련 콘텐츠 ID와 기업 slug는 실제 registry에 있어야 한다.
- 출처: 매체명, 원문 URL, 발행일, 접근일을 저장한다. 기사 전문·이미지·스크린샷은 저장하지 않는다.

## 3Reads

`reads`는 tuple로 정확히 세 개이며 `order`는 1, 2, 3이다. 각 read는 원문 metadata와 사용자가 작성한 `whatHappened`, `whyItMatters`, `structuralMeaning`, 선택적 주의점과 확인 항목을 가진다. edition은 `centralQuestion`, `commonThread`, `investorQuestions`, `oneLineTakeaway`로 세 사례를 연결한다.

## 주가 해부

`priceMove.value`는 percent 단위의 유한 숫자다. 시장·업종 비교는 같은 `priceAsOf`에서만 허용하며 selector가 퍼센트포인트 차이를 계산한다. 사건 해석은 직접 계기, 시장 해석, 확인·미확인, 움직임의 성격, 시장·기업 요인, 다음 확인으로 나뉜다.

## summary index와 상세 원고

`publishedEditorialSummaryIndex`는 홈과 목록에 필요한 짧은 필드만 가진다. 상세 object는 날짜별 module에 저장하고 route 진입 시 dynamic import한다. 게시 승인 시 상세 registry와 summary index를 함께 갱신하고 validator가 두 상태를 확인한다.

## 현재 fixture

PayPal·ASML·커넥티드카 예시는 형식 확인용 draft다. 원문 URL, 발행일, 가격 기준일이 확인되지 않아 공개 index에는 포함하지 않는다.

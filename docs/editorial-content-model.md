# 편집 콘텐츠 모델

## 두 콘텐츠를 분리하는 이유

사용자 화면의 `오늘의 월스트리트`는 세 출처를 한 질문으로 연결하는 판형이고, 주가 해부는 특정 사건 시점의 가격 반응과 비교·불확실성을 설명하는 판형이다. 내부 타입과 route 호환성을 위해 `ThreeReadsEdition`, `three-reads` 이름은 유지하고 `DailyStockDissection`과 별도 타입으로 운영한다.

## 공통 규칙

- 식별자: registry 전체에서 `id`와 `slug`가 중복되지 않아야 한다.
- 상태: `draft`, `verified`, `published`, `archived` 중 하나다.
- 날짜: 공개 콘텐츠는 발행일과 콘텐츠 기준일을 가져야 하며 미래일 수 없다.
- 관계: 관련 콘텐츠 ID와 기업 slug는 실제 registry에 있어야 한다.
- 편집 검증: 공개 원고는 `EditorialVerification`의 `ownerVerified` 기록을 가져야 한다. 이는 작성자가 사실과 숫자를 확인했다는 기록이며 사건의 미래 결과를 보증하지 않는다.
- 원고 보존: 확정 사실, 전망, 편집자 해석, 미확정 내용, 현금흐름 전달 경로, 반대 시나리오와 다음 변수를 분리한다. 기사 전문·이미지·스크린샷은 저장하지 않는다.

## 오늘의 월스트리트

`reads`는 tuple로 정확히 세 개이며 `order`는 1, 2, 3이다. 각 read는 매체명·제목·발행 시각·원문 URL, 사용자가 작성한 분석, 공식 교차검증 자료와 팩트체크 상태를 가진다. edition은 `centralQuestion`, `commonThread`, `cashFlowTransmission`, `investorQuestions`, `oneLineTakeaway`로 세 사례를 연결한다. 선정 범위·14일 중복 검사·후보 선정·수정 표현·Not Yet Final·가격 기준은 `methodology`에 보존해 상세 화면의 접이식 영역에서만 표시한다.

WSJ 원문은 분석의 주요 출처일 뿐이며 콘텐츠 자체는 주가해부실의 독자적 해설이다. 상세에는 The Wall Street Journal·Dow Jones와 제휴·후원 관계가 없다는 고지를 표시한다.

## 주가 해부

`priceMove.value`는 percent 단위의 유한 숫자다. 시장·업종 비교는 같은 `priceAsOf`에서만 허용하며 selector가 퍼센트포인트 차이를 계산한다. 특정 기사 하나가 아니라 가격, 뉴스, 기업 발표, 공시, 규제, 시장, 업종, 수급 자료를 `EditorialEvidence`로 조합한다. 근거 URL은 선택 사항이지만 `type`, `factStatus`, 기준일 또는 발행일을 추적할 수 있어야 한다. 공개 원고는 회사·ticker 또는 company slug, 사건일·가격일, 등락률, 직접 계기 또는 시장 해석, 확인·미확인·다음 확인, `ownerVerified`, 하나 이상의 evidence와 완성 원고가 필수다.

## summary index와 상세 원고

`publishedEditorialSummaryIndex`는 홈과 목록에 필요한 짧은 필드만 가진다. 상세 object는 날짜별 module에 저장하고 route 진입 시 dynamic import한다. 게시 승인 시 상세 registry와 summary index를 함께 갱신하고 validator가 두 상태를 확인한다.

## 현재 공개 콘텐츠와 fixture

첫 공개 콘텐츠는 `2026-07-13-sk-hynix-selloff`와 `2026-07-17-standards-set-price` 두 건이다. SK하이닉스는 기존 `sk-hynix` 프로필에만 연결하고 Burberry, Moonshot AI, USA Rare Earth, Pensana, Serra Verde의 가짜 프로필은 만들지 않는다. PayPal·ASML·커넥티드카 예시는 형식 확인용 draft로 계속 유지하며 공개 index에는 포함하지 않는다.

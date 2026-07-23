# 모바일 기업 해부 모델

## 화면 순서

1. 기업명, ticker, 거래소, 대표 업종, 한 줄 사업 정의, 기준일
2. 성장성·수익성·재무건전성·밸류에이션 핵심 카드 4개
3. 성장성·수익성·해자·재무건전성·밸류에이션 5축
4. 시장 기대·모멘텀
5. 다음 확인 최대 3개
6. Financial·Valuation·Report·Stock Dissection 조건부 CTA
7. 접힌 기존 상세 데이터·차트·출처

## 핵심 카드

카드는 상태 문구, 대표 근거 하나, 비교 기준, 기준 기간만 표시한다. 숫자가 없으면 `자료 미수집` 또는 구체적인 근거 부족 사유를 표시하며 0을 만들지 않는다. 마진·수익률 차이는 `%p`, 성장률은 `%`를 유지한다.

## 오각형 5축

내부 상태는 `낮은 편`, `중간보다 낮음`, `중간`, `중간보다 높음`, `높은 편`, `확인 부족`이다. 위치 1~5는 한 축을 그리기 위한 비교 단계이지 투자 점수나 다섯 축의 합산 점수가 아니다. `확인 부족`은 `position: null`이고 화면에서 안쪽 빈 점과 상태 문구로 구분한다.

각 축에는 비교 종류, 사용자 표시 문구, 근거, 쉬운 해석, 다음 확인, source가 필요하다. 해자는 공식 사업·공시·검증 리포트의 구조적 근거와 약화 가능성을 함께 요구한다. 단기 주가 상승은 해자 근거가 아니다.

## 시장 기대 분리

관련 Published Stock Dissection이 있으면 최신 한 건의 사건 기준일·가격 반응·확인/미확인 내용을 사용한다. 없으면 Company Brief의 공식 최근 변화만 표시한다. 이 영역은 오각형 위치나 장기 판단에 자동 반영되지 않는다.

## 모바일 bottom sheet와 접근성

- 각 축은 최소 44px button이며 `aria-pressed`와 상태가 포함된 accessible name을 가진다.
- 모바일은 `role="dialog"`, `aria-modal`, heading label, focus trap과 Escape 닫기를 제공한다.
- 닫은 뒤 선택한 축 button으로 focus를 돌린다.
- sheet가 열리면 body scroll을 잠그고 sheet 내부를 스크롤한다.
- 데스크톱은 같은 정보 순서의 인접 detail panel을 사용한다.
- 색상만으로 상태·선택을 구분하지 않는다.

## 코드

모델은 `../src/content/company-dissections`, UI는 `../src/components/company-profiles/CompanyDissectionRadar.tsx`에 있다. config는 slug별 dynamic module이며 현재 기업 것만 기업 route에서 불러온다.

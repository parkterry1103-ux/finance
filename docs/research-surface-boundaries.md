# 기업 리서치 화면 역할 경계

## Financial Pivot

공시 숫자, 전년 동기·직전 분기·전년도, 자체 추세, 가능한 peer·업종 비교와 lineage를 담당한다. 기업 상세에는 대표 근거만 남기고 전체 표와 비교 interaction은 `/ko/companies/:slug/financials`에서 제공한다.

## Valuation

현재 시장가격, 모형 가치 범위, 가격 위치, Reverse DCF, 내재 기대, 가정, 민감도와 모형 version을 담당한다. 완전한 DCF·Reverse DCF·민감도·확률 분포는 `/ko/companies/:slug/valuation`에만 렌더링한다.

## Research Report

사업 구조, 해자, 성장동력, 위험, 장기 기업 판단, 반증 조건과 다음 확인을 담당한다. 기본은 한 줄 판단, 좋은 점 3개, 위험 3개, 최근 변화, 현재 가격 기대의 한 줄 handoff, 반증 조건, 다음 확인이다. 사업부·해자·공시 근거·사건 영향 기록은 고급 보기에서 연다.

리포트가 DCF 계산표를 복제하지 않는 이유는 같은 모형이 두 화면에서 서로 다른 시점·표현으로 남는 것을 막고, 가격 설명과 사업 판단을 구분하기 위해서다. 원본 valuation artifact와 report model의 계산 데이터는 감사·재현을 위해 삭제하지 않는다.

## Related Stock Dissection

특정 사건, 정확한 가격 기준일과 세션, 주가 움직임, 직접 촉매, 시장 요인, 확인·미확인 사실과 당시 기업 판단 영향을 기록한다. 기업의 영구 점수나 가치평가 모형이 아니다.

## CTA 관계

- 기업 상세 → `숫자와 비교` → Financial Pivot
- 기업 상세·Research Report → `시장가격에 반영된 기대` → full Valuation 지원 기업만
- 기업 상세 → `장기 기업 판단` → 실제 Report 지원 기업만
- 기업 상세 → `최근 주가 움직임` → Published relation이 있을 때만

지원되지 않는 기능은 0값·빈 화면·비활성 강조 버튼으로 만들지 않는다.

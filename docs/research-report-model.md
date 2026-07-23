# Research Report 모델

Research Report는 사업 구조·해자·성장동력·위험의 장기 판단 화면이다. Phase 5G 기본 화면은 한 줄 판단, 좋은 점 3개, 위험 3개, 최근 바뀐 것, 현재 가격 기대의 Valuation handoff, 반증 조건과 다음 확인으로 구성한다.

고급 보기에는 상세 사업 주장, 해자 근거·약화 조건, 재무건전성과 산업 역할, 작성 시점 사건 영향, source·공시 기술정보를 둔다. 원본 `ResearchReportModel`의 evidence graph와 point-in-time snapshot은 삭제하지 않는다.

DCF·Reverse DCF·민감도·확률 분포의 완전한 UI는 Valuation에만 둔다. Report는 계산값을 복제하지 않고 해당 기업에 full Valuation이 있을 때 한 줄 설명과 route CTA만 제공한다. 현재 공개 Report와 full Valuation은 NVIDIA와 Meta 두 기업이다.

`ResearchReportRoute`와 기업별 report data는 각각 lazy load된다. Report 진입은 Monte Carlo artifact를 선로딩하지 않는다. validation은 evidence/source 무결성, 수치 artifact 일치, 금지 표현, Report UI의 가치평가 중복 0을 검사한다.

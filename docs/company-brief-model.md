# Company Brief 모델

## 역할

Company Brief는 기업 전체 데이터의 복제본이 아니라 첫 화면 결론을 구성하는 작은 typed config다. `src/content/company-briefs/entries/{companySlug}.ts`에는 기존 metric ID와 source ID만 선택해 기록하고, route에서 선택한 회사의 기존 `CompanyResearchProfileViewModel`과 결합한다.

```text
CompanyBriefConfig
├─ companySlug
├─ asOf
├─ oneLineBusiness
├─ questions
│  ├─ revenueEngine
│  ├─ recentChange
│  ├─ whyItMatters
│  ├─ keyRisk
│  └─ watchNext
├─ keyMetricSelections (1~3)
├─ relatedEditorialIds
└─ reportSlug (optional)
```

각 `BriefAnswer`는 `summary`, `sourceIds`, 선택적 `title`과 `asOf`를 가진다. 핵심 지표의 값·표시값·단위·기간·해석·source는 기존 dashboard metric에서 만들어진다. config에는 비교 기준이 실제로 있을 때만 `referenceValue`, `difference`, `differenceUnit`, `referencePeriod`를 둔다.

## 로딩

`registry.ts`는 8개 config를 각각 동적 import한다. `/ko/companies/{slug}` route가 기업 view model을 확인한 뒤 해당 slug의 Brief 하나만 불러온다. 목록·홈은 전체 Brief를 import하지 않으며 `/report` 본문도 기업 상세 진입 시 가져오지 않는다.

## validation

- 지원 기업 8개와 Brief 8개의 집합이 같다.
- slug 중복과 지원하지 않는 slug가 없다.
- 다섯 질문의 summary가 비어 있지 않고 source가 존재한다.
- 핵심 지표는 1~3개이고 값이 finite number다.
- 단위·기간·source가 존재하며 없는 값을 0으로 바꾸지 않는다.
- 마진 차이는 `percentagePoint`, 성장률은 `percent`다.
- 관련 editorial은 Published index에, report slug는 기존 report registry에 존재한다.
- 사용자 화면 금지 표현이 config에 없다.

`scripts/company-brief-unit.ts`가 registry, build, lazy import와 UI 조건을 함께 검사하고 Release Gate에 포함된다.

## 현재 inventory

지원 기업은 SK하이닉스, LG전자, NVIDIA, Micron, Dell, Eaton, Meta, Supermicro 8개다. 리포트 CTA는 기존 route가 있는 NVIDIA와 Meta에만 표시한다. Phase 5B 시점에는 기업에 연결된 Published editorial이 없으므로 관련 리서치 섹션을 렌더링하지 않는다.

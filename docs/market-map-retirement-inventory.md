# 시장지도 공개 기능 폐기 인벤토리

- 감사일: 2026-07-14
- 시작 HEAD: `ad59a384620fe46de80ce3add6ea1de48dc712b6`
- 대상: 공개 route, navigation, 홈, 기업 프로필·이벤트, 수요·공급, 병목, Pick, 보고서, ReactFlow, 관계 registry, validator, test, CSS, query, SEO와 문서
- 결정: 시장지도와 기업 관계망은 공개 runtime에서 제거하고, 네 산업의 설명은 정적 5단계 산업 흐름으로 보존한다.

## 감사 요약

| 감사 대상 | 기존 상태 | 처리 | 최종 공개 상태 |
| --- | --- | --- | --- |
| 허브 route | `/ko/market-map`, `/market-map` | 수요·공급으로 `history.replaceState` | 404·안내 화면 없이 대체 route 도착 |
| 상세 route | 한국어 4개와 영문 alias 4개 | 대응 수요·공급 상세 query로 교체 | 8개 legacy route 모두 안전하게 도착 |
| navigation | 산업 그룹의 시장지도 링크 1개 | 제거 | 상위 4그룹 유지, 공개 링크 0 |
| 홈 | 기존 시장지도 진입·카드 | 기존 산업 흐름 영역에서 정적 카드를 재사용 | section 수 증가 0, 공개 링크 0 |
| 기업 프로필 | 지도 view model과 42개 관계 selector 소비 | `industry-flows`와 단순 profile relation registry로 교체 | 프로필 8개, 지도 의존 0 |
| 기업 이벤트 | `marketMapIds`가 허브로 이동 | 산업 흐름에 대응하는 수요·공급 링크로 교체 | 지도 href 0 |
| 수요·공급 | 산업 배경만 표시 | entry별 `IndustryFlowCard` 연결 | 4개 entry가 정적 flow 1개씩 해석 |
| 병목 | 지도 ID 기반 버튼 | 기존 ID는 호환 metadata로 두고 `openCategory`가 수요·공급으로 이동 | 지도 화면 노출 0 |
| Pick | 지도/산업 ID 기반 이동과 준비 문구 | 이동은 기업 프로필 또는 수요·공급으로 교체 | 지도 CTA 0 |
| 보고서 | `marketMapIds` 연결 | 같은 ID를 산업 흐름 호환 키로 읽고 수요·공급으로 이동 | 지도 화면 노출 0 |
| ReactFlow | 4개 상세 그래프, node·edge·fitView | component·import·CSS·dependency 제거 | runtime import 0 |
| 관계 UI | toolbar, legend, panel, 접근성 표 | 삭제 | 공개 관계 필터·panel·표 0 |
| 관계 registry | 기업 관계 42개, 6개 유형, 3개 근거 수준 | `src/content/market-map-relations`와 모든 runtime consumer 삭제 | runtime 관계 0 |
| 상세 registry | available 4개, planned 2개 | `src/content/market-map-details` 삭제 | 공개 카드 0 |
| query | `company`, `view`, `region`, `density`, `relationType`, `relation` | legacy 진입 시 대체 URL로 교체하며 폐기 | graph query runtime 0 |
| SEO | 시장지도 title·설명 | 수요·공급 및 산업 흐름 설명으로 교체 | 공개 시장지도 명칭 0 |
| validator | 지도·관계 taxonomy 검증 | 산업 흐름·프로필 관계·폐기 상태·legacy route 검증으로 교체 | 현재 공개 콘텐츠만 검사 |
| unit test | detail, relation, visual consistency 3개 | 삭제하고 flow·retirement test 추가 | 폐기 기능 test 0 |
| CSS | graph·map·relation 전용 selector | 전용 규칙 873개를 제거하거나 혼합 selector에서 분리 | ReactFlow·market-map 전용 selector 0, 빈 media query 0 |

## Route 목록

| Legacy route | 대체 route |
| --- | --- |
| `/ko/market-map` | `/ko/demand-supply` |
| `/market-map` | `/demand-supply` |
| `/ko/category/us-semiconductors` | `/ko/demand-supply?industry=semiconductor-fab-infrastructure-demand-supply` |
| `/category/us-semiconductors` | `/demand-supply?industry=semiconductor-fab-infrastructure-demand-supply` |
| `/ko/category/datacenter-power-cooling` | `/ko/demand-supply?industry=data-center-power-cooling-demand-supply` |
| `/category/datacenter-power-cooling` | `/demand-supply?industry=data-center-power-cooling-demand-supply` |
| `/ko/category/reconstruction-infrastructure` | `/ko/demand-supply?industry=copper-grid-metals-demand-supply` |
| `/category/reconstruction-infrastructure` | `/demand-supply?industry=copper-grid-metals-demand-supply` |
| `/ko/category/semiconductor-cluster-infrastructure` | `/ko/demand-supply?industry=grid-equipment-demand-supply` |
| `/category/semiconductor-cluster-infrastructure` | `/demand-supply?industry=grid-equipment-demand-supply` |

Legacy query 여섯 개는 pathname을 먼저 판별한 뒤 대체 URL로 교체하므로 잘못된 값도 새 상태로 복원하지 않는다. 다른 페이지가 사용하는 동일 이름의 query는 변경하지 않는다.

## 보존·대체 데이터

- `src/content/industry-flows`: AI 반도체·서버, 데이터센터 전력·냉각, 재건·인프라, 반도체 클러스터·산업단지의 정확히 네 flow와 각 5단계.
- `src/content/company-profile-relations`: 8개 프로필용 관련 기업 16개. 기업별 최대 3개, self·중복·source 누락 0, Meta 0개.
- `src/components/industry-flows/IndustryFlowCard.tsx`: semantic `section`·`ol`·`li`, 단계 번호·유형 text, 대표 기업 최대 2개, 현재 기업 단계 표시.
- 기존 `marketMapIds`라는 일부 필드명은 리포트·병목·이벤트의 정적 호환 ID로 남지만 시장지도 또는 42개 관계 registry를 소비하지 않는다. 공개 UI에서는 산업 흐름·수요와 공급으로 표현한다.

## 삭제 목록

- 공개 상세 graph 4개와 허브 available 카드 4개·planned 카드 2개.
- `MarketMapDetailTemplate`, `MarketMapRelationPanel` 2개 component와 App 내부 ReactFlow graph 구현.
- `src/content/market-map-details` 4개 파일, `src/content/market-map-relations` 5개 파일.
- `market-map-detail-unit`, `market-map-relations-unit`, `market-map-visual-consistency-unit` 3개 test.
- `@xyflow/react` dependency 1개와 runtime import·전용 stylesheet import.

## 기록 보존

`docs/market-map-node-inventory.md`와 `docs/market-map-relation-inventory.md`는 폐기 구현의 archive 기록이다. 두 문서는 현재 공개 서비스의 노드·관계 데이터가 아니며 validator의 현재 콘텐츠 대상으로 사용하지 않는다.

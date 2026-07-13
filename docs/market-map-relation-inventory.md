# 시장지도 기업 관계 인벤토리 (정규화 전 검토)

- 조사 기준 HEAD: `0caba273e4de0d93a18cde41501d20131a87228c`
- 조사일·검토일: `2026-07-13`
- 대상: available 시장지도 4개, 기존 기업 관계 42개
- 원칙: 선의 존재를 직접 계약으로 해석하지 않으며, 공식 문서가 두 기업의 관계를 직접 뒷받침할 때만 `confirmed`를 사용한다.

## 집계

| 항목 | 수량 |
| --- | ---: |
| 기존 관계 | 42 |
| 유지하되 의미·type을 정규화한 관계 | 42 |
| type 수정 | 42 |
| 방향 수정 (`directed` → `contextual`) | 13 |
| 공통 `sourceRefs` 추가 | 42 |
| `review-needed` | 4 |
| 제거 | 0 |
| 최종 관계 | 42 |

기존 42개는 모두 산업 흐름을 설명할 수 있어 제거하지 않는다. 다만 기존 데이터에는 공통 source registry 참조가 없었고, AI 지도에서 Marvell·NVIDIA 관계 한 건만 관계 객체에 공식 URL을 직접 저장하고 있었다. 이 URL은 기존 source registry ID로 교체한다. 직접 계약으로 확인된 관계는 0개다.

## 근거 부족·중복·방향 문제 목록

- 근거 부족: 리노공업–NVIDIA, ISC–NVIDIA, 원익IPS–삼성전자, 솔브레인–삼성전자 4건이다. 산업 역할 후보는 이해할 수 있지만 두 기업의 직접 관계 근거가 부족해 `market-context + review-needed`로 낮추고 핵심 관계에서 제외한다.
- 중복: 동일 map의 `from/to/type` 중복은 0건이다. 동일 기업 쌍의 복수 관계선도 없다.
- 방향 수정: 시장 비교 성격 9건과 위 근거 부족 후보 4건, 총 13건을 `directed`에서 `contextual`로 바꾼다.
- 잘못된 강한 의미: 기존 `고객`, `위탁생산`, `핵심 장비` 같은 label만으로 직접 계약·공급을 암시할 수 있는 관계는 실제 의미에 맞춰 수요·생산·인프라·시장 맥락으로 낮춘다.
- 직접 URL 저장: NVIDIA–Marvell 1건의 기존 URL은 제거하고 기존 source registry의 두 공식 발표 ID로 교체한다.

## AI 반도체 (`us-semiconductors`, 22개)

| 기존 from → to | 기존 label·방향 | 실제 의미 | 기존 공식 근거 | 권장 type / evidence / direction | 권장 sourceRefs | 처리·이유 |
| --- | --- | --- | --- | --- | --- | --- |
| Google → Broadcom | 고객·수요 연결 · directed | 클라우드 AI 투자와 맞춤형 반도체 수요의 산업 연결 | registry 없음 | `demand-link` / contextual / directed | `iea-energy-and-ai-2025` | 수정·직접 고객 관계를 단정하지 않음 |
| Google → NVIDIA | 클라우드 고객·수요 · directed | AI 서비스와 GPU 수요의 산업 연결 | registry 없음 | `demand-link` / contextual / directed | `iea-energy-and-ai-2025`, `nvidia-fy2027-q1-results` | 수정·특정 구매 관계가 아님 |
| Broadcom → TSMC | 위탁생산 · directed | 팹리스 설계와 파운드리 생산 역할의 연결 | registry 없음 | `production-link` / contextual / directed | `semi-memory-fab-outlook-q2-2026` | 수정·공식 공급사로 단정하지 않음 |
| NVIDIA → TSMC | 위탁생산 · directed | GPU 설계와 첨단 파운드리 생산 생태계 연결 | registry 없음 | `production-link` / contextual / directed | `nvidia-fy2027-q1-results`, `semi-memory-fab-outlook-q2-2026` | 수정·직접 계약 표시 금지 |
| NVIDIA → SK하이닉스 | HBM 수요 · directed | AI 가속기 수요와 HBM 수요 연결 | registry 없음 | `demand-link` / contextual / directed | `nvidia-fy2027-q1-results`, `sk-hynix-hbm4-production-2025` | 수정·고객별 거래 비중을 뜻하지 않음 |
| SK하이닉스 → 삼성전자 | 메모리 업황 비교 · directed | 같은 HBM·메모리 시장에서 비교하는 관계 | registry 없음 | `market-context` / contextual / contextual | `sk-hynix-q1-2026-results`, `samsung-electronics-earnings-releases` | 방향 수정·양방향 시장 비교 |
| NVIDIA → Micron | HBM 수요 · directed | AI 가속기 수요와 고성능 메모리 수요 연결 | registry 없음 | `demand-link` / contextual / directed | `nvidia-fy2027-q1-results`, `micron-fy2026-q3-results` | 수정·직접 구매 관계가 아님 |
| NVIDIA → Vertiv | 데이터센터 수요 · directed | AI 서버와 전력·냉각 인프라 수요 연결 | registry 없음 | `infrastructure-link` / contextual / directed | `iea-energy-and-ai-2025`, `nvidia-fy2027-q1-results` | 수정·직접 공급 관계가 아님 |
| NVIDIA → Dell | AI 서버 수요 · directed | 가속기 수요와 AI 서버 시스템 수요 연결 | registry 없음 | `demand-link` / contextual / directed | `nvidia-fy2027-q1-results`, `dell-fy2027-q1-results` | 수정·특정 납품계약이 아님 |
| NVIDIA → Super Micro | AI 서버 수요 · directed | 가속기 수요와 고성능 서버 수요 연결 | registry 없음 | `demand-link` / contextual / directed | `nvidia-fy2027-q1-results`, `ir-supermicro-2026-supermicro-announces-pricing-of-equity-and-equity-lin-f33c9243` | 수정·특정 납품계약이 아님 |
| NVIDIA → Arista | 네트워크 수요 · directed | AI 서버 확장과 데이터센터 네트워크 수요 연결 | registry 없음 | `demand-link` / contextual / directed | `iea-energy-and-ai-2025`, `nvidia-fy2027-q1-results` | 수정·직접 고객 관계가 아님 |
| NVIDIA → Marvell | 맞춤형 반도체·인터커넥트 · directed | 양사가 발표한 NVLink Fusion 전략적 파트너십 | 공식 URL 직접 저장 | `official-supply` / confirmed / directed | `marvell-company-newsroom-nvidia-ai-ecosystem-expands-marvell-joins-force-8761be8f`, `investor-nvidia-2025-nvidia-unveils-nvlink-fusion-for-industry-to-build-cc4f6311` | 유지·공식 협력은 확인되지만 계약 금액은 의미하지 않음 |
| ASML → TSMC | 핵심 장비 · directed | 첨단 파운드리와 EUV 장비 역할 연결 | registry 없음 | `production-link` / contextual / directed | `semi-memory-fab-outlook-q2-2026` | 수정·개별 공급계약을 표시하지 않음 |
| ASML → 삼성전자 | 핵심 장비 · directed | 첨단 메모리·파운드리와 EUV 장비 역할 연결 | registry 없음 | `production-link` / contextual / directed | `semi-memory-fab-outlook-q2-2026`, `samsung-electronics-earnings-releases` | 수정·개별 공급계약을 표시하지 않음 |
| ASML → Intel | 핵심 장비 · directed | 첨단 제조와 EUV 장비 역할 연결 | registry 없음 | `production-link` / contextual / directed | `semi-memory-fab-outlook-q2-2026` | 수정·개별 공급계약을 표시하지 않음 |
| 한미반도체 → SK하이닉스 | HBM 후공정 장비 · directed | HBM 증설과 후공정 장비 수요 연결 | registry 없음 | `production-link` / contextual / directed | `sk-hynix-hbm4-production-2025`, `semi-memory-fab-outlook-q2-2026` | 수정·직접 납품계약을 뜻하지 않음 |
| 리노공업 → NVIDIA | 테스트 부품 · directed | AI 칩과 테스트 부품 역할의 후보 연결 | registry 없음 | `market-context` / review-needed / contextual | `nvidia-fy2027-q1-results` | 유형·방향 수정·특정 고객 관계 근거 부족, 핵심 관계 제외 |
| ISC → NVIDIA | 테스트 부품 · directed | AI 칩과 테스트 소켓 역할의 후보 연결 | registry 없음 | `market-context` / review-needed / contextual | `nvidia-fy2027-q1-results` | 유형·방향 수정·특정 고객 관계 근거 부족, 핵심 관계 제외 |
| 원익IPS → 삼성전자 | 공정 장비 · directed | 반도체 투자와 공정 장비 수요 후보 연결 | registry 없음 | `market-context` / review-needed / contextual | `samsung-electronics-2026-q1-dart-report`, `semi-memory-fab-outlook-q2-2026` | 유형·방향 수정·현재 registry로 직접 공급 관계 확인 부족 |
| 솔브레인 → 삼성전자 | 공정 소재 · directed | 반도체 생산과 공정 소재 수요 후보 연결 | registry 없음 | `market-context` / review-needed / contextual | `samsung-electronics-2026-q1-dart-report`, `semi-memory-fab-outlook-q2-2026` | 유형·방향 수정·현재 registry로 직접 공급 관계 확인 부족 |
| Microsoft → NVIDIA | 클라우드 수요 · directed | Azure AI 투자와 가속기 수요의 산업 연결 | registry 없음 | `demand-link` / contextual / directed | `iea-energy-and-ai-2025`, `nvidia-fy2027-q1-results` | 수정·특정 구매계약이 아님 |
| Amazon → NVIDIA | 클라우드 수요 · directed | AWS AI 투자와 가속기 수요의 산업 연결 | registry 없음 | `demand-link` / contextual / directed | `iea-energy-and-ai-2025`, `nvidia-fy2027-q1-results` | 수정·특정 구매계약이 아님 |

## 데이터센터 전력·냉각 (`datacenter-power-cooling`, 5개)

| 기존 from → to | 기존 label·방향 | 실제 의미 | 기존 공식 근거 | 권장 type / evidence / direction | 권장 sourceRefs | 처리·이유 |
| --- | --- | --- | --- | --- | --- | --- |
| Vertiv → Eaton | 전력 관리 비교 · directed | 데이터센터 전력 관리 시장 비교 | 없음 | `market-context` / contextual / contextual | `iea-energy-and-ai-2025`, `eaton-q1-2026-results` | 방향 수정·직접 거래 아님 |
| Vertiv → Schneider Electric | 에너지 관리 비교 · directed | 데이터센터 전력·에너지 관리 시장 비교 | 없음 | `market-context` / contextual / contextual | `iea-energy-and-ai-2025` | 방향 수정·직접 거래 아님 |
| Vertiv → LG전자 | 냉각 수요 연결 · directed | AI 데이터센터 냉각 인프라 역할 연결 | 없음 | `infrastructure-link` / contextual / directed | `iea-energy-and-ai-2025`, `lg-news-eco-solution-lg-electronics-showcases-ai-data-center-cooling-sol-6f61b0d8` | 수정·직접 계약 아님 |
| Eaton → Schneider Electric | 배전·자동화 비교 · directed | 배전·에너지 관리 시장 비교 | 없음 | `market-context` / contextual / contextual | `iea-energy-and-ai-2025`, `eaton-q1-2026-results` | 방향 수정·직접 거래 아님 |
| Schneider Electric → LG전자 | 운영 효율 흐름 · directed | 전력 효율과 냉각 효율의 인프라 연결 | 없음 | `infrastructure-link` / contextual / directed | `iea-energy-and-ai-2025`, `lg-news-eco-solution-lg-electronics-showcases-ai-data-center-cooling-sol-6f61b0d8` | 수정·직접 계약 아님 |

## 재건·인프라 (`reconstruction-infrastructure`, 7개)

| 기존 from → to | 기존 label·방향 | 실제 의미 | 기존 공식 근거 | 권장 type / evidence / direction | 권장 sourceRefs | 처리·이유 |
| --- | --- | --- | --- | --- | --- | --- |
| 현대건설 → 삼성물산 | 대형 EPC 비교 · directed | 대형 인프라·EPC 기업 비교 | 없음 | `market-context` / contextual / contextual | `world-bank-infrastructure-foundations-2026` | 방향 수정·공동 수주를 뜻하지 않음 |
| 현대건설 → 대우건설 | 해외 수주 비교 · directed | 해외 건설·플랜트 기업 비교 | 없음 | `market-context` / contextual / contextual | `world-bank-infrastructure-foundations-2026` | 방향 수정·직접 관계 아님 |
| 현대건설 → HD현대인프라코어 | 착공 뒤 장비 수요 · directed | 시공과 중장비 수요의 인프라 연결 | 없음 | `infrastructure-link` / contextual / directed | `world-bank-infrastructure-foundations-2026` | 수정·납품계약을 뜻하지 않음 |
| 삼성물산 → POSCO홀딩스 | 시공·소재 흐름 · directed | 인프라 시공과 철강·소재 수요 연결 | 없음 | `infrastructure-link` / contextual / directed | `world-bank-infrastructure-foundations-2026`, `world-bank-commodity-outlook-april-2026` | 수정·납품계약을 뜻하지 않음 |
| 대우건설 → POSCO홀딩스 | 플랜트·소재 흐름 · directed | 플랜트 시공과 철강·소재 수요 연결 | 없음 | `infrastructure-link` / contextual / directed | `world-bank-infrastructure-foundations-2026`, `world-bank-commodity-outlook-april-2026` | 수정·납품계약을 뜻하지 않음 |
| HD현대인프라코어 → Caterpillar | 중장비 업황 비교 · directed | 글로벌 중장비 시장 비교 | 없음 | `market-context` / contextual / contextual | `world-bank-infrastructure-foundations-2026` | 방향 수정·직접 관계 아님 |
| 현대건설 → Caterpillar | 착공 뒤 장비 수요 · directed | 대형 공사와 중장비 수요 연결 | 없음 | `infrastructure-link` / contextual / directed | `world-bank-infrastructure-foundations-2026` | 수정·납품계약을 뜻하지 않음 |

## 반도체 클러스터 (`semiconductor-cluster-infrastructure`, 8개)

| 기존 from → to | 기존 label·방향 | 실제 의미 | 기존 공식 근거 | 권장 type / evidence / direction | 권장 sourceRefs | 처리·이유 |
| --- | --- | --- | --- | --- | --- | --- |
| 현대건설 → 삼성물산 | 산업시설 EPC 비교 · directed | 대형 산업시설 EPC 기업 비교 | 없음 | `market-context` / contextual / contextual | `semi-memory-fab-outlook-q2-2026`, `molit-work-plan-2026` | 방향 수정·공동 수주를 뜻하지 않음 |
| 현대건설 → 동양파일 | 기초 공사 흐름 · directed | 산업시설 시공과 기초 파일 수요 연결 | 없음 | `infrastructure-link` / contextual / directed | `semi-memory-fab-outlook-q2-2026`, `kind-krx-20260318002468` | 수정·직접 계약 아님 |
| 삼성물산 → 동양파일 | 기초 공사 흐름 · directed | 산업시설 시공과 기초 파일 수요 연결 | 없음 | `infrastructure-link` / contextual / directed | `semi-memory-fab-outlook-q2-2026`, `kind-krx-20260318002468` | 수정·직접 계약 아님 |
| 현대건설 → LS ELECTRIC | 배전 설비 흐름 · directed | 공장 건설과 배전·자동화 설비 수요 연결 | 없음 | `infrastructure-link` / contextual / directed | `semi-memory-fab-outlook-q2-2026`, `iea-electricity-2026` | 수정·직접 공급 관계 아님 |
| 삼성물산 → 효성중공업 | 전력망 설비 흐름 · directed | 산업시설 건설과 변압기·전력망 수요 연결 | 없음 | `infrastructure-link` / contextual / directed | `semi-memory-fab-outlook-q2-2026`, `iea-electricity-2026` | 수정·직접 공급 관계 아님 |
| LS ELECTRIC → 효성중공업 | 전력설비 비교 · directed | 배전·전력망 설비 시장 비교 | 없음 | `market-context` / contextual / contextual | `iea-electricity-2026` | 방향 수정·직접 거래 아님 |
| 현대건설 → KCC | 건축 소재 흐름 · directed | 산업시설 건설과 건축 소재 수요 연결 | 없음 | `infrastructure-link` / contextual / directed | `semi-memory-fab-outlook-q2-2026`, `kind-krx-20260515001457` | 수정·직접 공급 관계 아님 |
| 삼성물산 → KCC | 산업시설 소재 흐름 · directed | 산업시설 EPC와 건축·산업 소재 수요 연결 | 없음 | `infrastructure-link` / contextual / directed | `semi-memory-fab-outlook-q2-2026`, `kind-krx-20260515001457` | 수정·직접 공급 관계 아님 |

## 최종 taxonomy 집계

| relation type | 수량 |
| --- | ---: |
| `direct-contract` | 0 |
| `official-supply` | 1 |
| `demand-link` | 9 |
| `production-link` | 6 |
| `infrastructure-link` | 13 |
| `market-context` | 13 |

| evidence level | 수량 |
| --- | ---: |
| `confirmed` | 1 |
| `contextual` | 37 |
| `review-needed` | 4 |

공식 자료가 두 기업의 직접 계약을 명시한 관계는 현재 0개다. Marvell·NVIDIA 관계는 양사의 공식 발표가 전략적 파트너십과 제공 역할을 명시하므로 `official-supply + confirmed`로 분류하지만, 특정 구매계약 금액이나 고객별 매출을 의미하지 않는다.

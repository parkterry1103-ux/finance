# 가치평가 준비도 요약

- 기준일: 2026-07-15
- 생성일: 2026-07-16T15:15:35.889Z
- 원칙: 기업 공시 우선, 업종 benchmark는 검증용이며 누락 회사 수치를 대체하지 않음
- OpenDART: 기존 Production read-only API만 조회, sync·DB·Production write 0
- SEC: Companyfacts 6개 CIK 순차 조회, runtime route 추가 0

| 기업 | 공식 연결 | 매출 5년 | 영업이익 5년 | 감가상각 | Capex | OCF | 희석주식 | 가격 | DCF | 주 방법 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SK하이닉스 | OpenDART CFS via existing read-only API | 제한적 | 제한적 | 자료 없음 | 제한적 | 제한적 | 자료 없음 | 충분 | 제한적 | 사이클 정상화 FCFF DCF |
| LG전자 | OpenDART CFS via existing read-only API | 제한적 | 제한적 | 자료 없음 | 제한적 | 제한적 | 자료 없음 | 충분 | 제한적 | 사업부 SOTP |
| NVIDIA | SEC Companyfacts | 충분 | 충분 | 충분 | 충분 | 충분 | 충분 | 충분 | 가능 | Driver-based FCFF DCF |
| Micron Technology | SEC Companyfacts | 충분 | 충분 | 충분 | 충분 | 충분 | 충분 | 충분 | 가능 | 사이클 정상화 FCFF DCF |
| Dell Technologies | SEC Companyfacts | 충분 | 충분 | 충분 | 충분 | 충분 | 충분 | 충분 | 가능 | FCFF DCF |
| Eaton | SEC Companyfacts | 충분 | 충분 | 충분 | 충분 | 충분 | 충분 | 충분 | 가능 | FCFF DCF |
| Meta Platforms | SEC Companyfacts | 충분 | 충분 | 충분 | 충분 | 충분 | 충분 | 충분 | 가능 | Driver-based FCFF DCF |
| Super Micro Computer | SEC Companyfacts | 충분 | 충분 | 충분 | 충분 | 충분 | 충분 | 충분 | 가능 | FCFF DCF |

## 공통 제한

- OpenDART 기존 read-only 응답은 최신 기간 요약이라 한국 기업의 5년 DCF 공개 준비가 완료되지 않았습니다.
- SEC Companyfacts는 사업부 KPI와 일회성 정상화 판단을 완전하게 제공하지 않으므로 원문 10-K MD&A 검토가 후속으로 필요합니다.
- 결과는 내부 계산 검증용이며 목표주가·투자의견이 아닙니다.

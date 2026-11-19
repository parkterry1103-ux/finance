export type PublishedJournal = {
  id: string;
  path: string;
  title: string;
  subtitle: string;
  company: string;
  ticker: string;
  purchasedAt: string;
  publishedAt: string;
  summary: string;
  sections: { id: string; title: string; paragraphs: string[]; sourceIds?: string[] }[];
  sources: { id: string; title: string; url: string; publishedAt: string; pages?: string }[];
};

export const publishedJournals: PublishedJournal[] = [{
  id: '2026-11-19-korean-re-review',
  path: '/ko/records/2026-11-19-korean-re-review',
  title: '코리안리 투자 복기',
  subtitle: '국내 자동차보험 축소와 유럽·북미 확대를 보고 세운 투자 가설',
  company: '코리안리',
  ticker: '003690',
  purchasedAt: '2026-05-14',
  publishedAt: '2026-11-19',
  summary: '방어적인 종목을 찾던 중 국내 자동차보험 비중을 줄이고 유럽·북미로 사업을 다각화하는 변화에 주목했다. 해외 확대가 실제 수익성과 위험 분산으로 이어지는지 돌아봤다.',
  sections: [
    {
      id: 'timing', title: '주식 비중을 줄이면서 방어적인 종목을 찾았다',
      paragraphs: [
        '2026년 5월, 나는 코스피가 고점권에 와 있다고 판단해 포트폴리오에서 주식 비중을 줄이고 있었다. 그 과정에서 방어적인 성격의 종목을 찾다가 코리안리에 관심을 갖게 됐고, 5월 14일 주식을 매수했다.',
        '내가 주목한 것은 보험업이라는 이름 자체보다 사업 포트폴리오가 바뀌는 방향이었다. 국내 자동차보험 비중을 줄이는 한편 유럽·북미 등 해외로 수익원을 넓히는 변화가 투자 판단의 핵심이었다. 이 글에서 말하는 해외 다각화는 주로 보험계약을 인수하는 수재 사업의 지역·종목 분산이며, 운용자산의 해외 투자와는 구분한다.',
        '당시 매수 계기와 이후 확인한 결과는 나눠 보려고 한다. 2025년 말 경영실적 자료는 매수 전인 2026년 2월 12일 공개됐지만, 2026년 1분기 IR 자료는 매수 다음 날인 5월 15일 공개됐다. 매수 후 나온 실적은 당시 근거로 소급하지 않고 가설을 점검하는 자료로만 사용한다.',
      ], sourceIds: ['ir-library'],
    },
    {
      id: 'earnings', title: '국내 자동차보험을 줄이고 해외 수익원을 넓히는 변화',
      paragraphs: [
        '매수 전 공개된 2025년 말 IR을 다시 보면, 전체 보험수익에서 국내 자동차보험이 차지하는 비중은 2024년 5.3%에서 2025년 3.9%로 낮아졌다. 회사는 자동차보험 등을 포함한 저마진 비례특약 축소와 해외 수재 확대를 설명했다.',
        '같은 자료의 IFRS17 보험수익 기준 해외 비중은 2024년 41%에서 2025년 44%로 높아졌다. 나는 국내 특정 시장과 종목에 대한 의존도를 줄이려는 방향에 주목했다. 다만 비중 변화만으로 수익성 개선이나 방어력이 입증됐다고 보지는 않는다.',
        '또 자동차보험 전체에서 일괄적으로 철수하는 전략은 아니었다. 회사는 해외에서 유럽 자동차 비비례특약 인수를 확대했다고 밝혔다. 내가 보려는 것은 자동차보험이라는 이름보다 지역과 계약 조건에 따라 인수 구성을 조정하는 능력이다.',
      ], sourceIds: ['fy2025-domestic', 'fy2025-overseas'],
    },
    {
      id: 'risks', title: '유럽·북미 확대와 현지 영업 기반에 주목했다',
      paragraphs: [
        'IFRS4 수재보험료 기준 해외 포트폴리오에서 유럽 비중은 2024년 26.1%에서 2025년 27.8%로, 북미는 23.3%에서 25.7%로 높아졌다. 이 수치는 해외 수재 안의 지역별 비중으로, 앞서 본 전체 보험수익 기준 해외 비중과 분모가 다르다.',
        '북미에서는 현지 거점을 통한 사업 확대에 관심을 가졌다. 다만 신설 시점과 조직 형태를 정확히 구분할 필요가 있다. 공식 발표에서 확인되는 것은 2021년 설립된 미국 뉴저지 보험중개법인과 같은 해의 재보험 중개면허 취득이다. 이를 2026년 새 사무소 설립 사건으로 쓰지 않고, 장기 해외 확장 전략의 일부로 본다.',
        '내 가설은 단순히 해외 매출이 늘면 좋다는 것이 아니다. 지역과 종목을 다각화하면서도 계약을 수익성 있게 인수할 수 있다면 국내 특정 사업에 대한 의존도를 줄일 수 있다는 기대다. 현지 거점의 존재 자체보다 실제 계약과 이익으로 연결되는지가 중요하다.',
      ], sourceIds: ['fy2025-overseas', 'us-brokerage'],
    },
    {
      id: 'judgment', title: '해외 다각화가 곧 방어력이라는 뜻은 아니다',
      paragraphs: [
        '내가 방어적인 종목을 찾았다는 투자 목적과 코리안리가 실제로 어떤 위험을 부담하는지는 별개다. 재보험 요율과 대형 사고는 산업 공통 위험이고, 어떤 지역과 계약에 얼마나 노출되는지는 회사의 선택이다. 해외 비중이 높아져도 손해가 큰 계약에 노출되면 기대한 위험 분산이 실현되지 않을 수 있다.',
        '매수 후 공개된 별도 기준 2026년 1~3분기 실적에서도 이익을 나눠 볼 필요가 있다. 순이익은 전년 동기보다 48.9% 증가했지만 보험손익은 0.3% 감소했고 투자손익은 87.0% 증가했다. 순이익 증가만으로 해외 수재 다각화 가설이 맞았다고 결론 내릴 수는 없다.',
        '따라서 현재의 복기는 단순한 이익 증가 설명이 아니라, 내가 기대한 사업 구성의 변화가 보험 부문의 수익성과 위험 분산으로 이어졌는지 확인하는 과정이다.',
      ], sourceIds: ['q3-earnings'],
    },
    {
      id: 'follow-up', title: '다음 확인할 것과 가설을 바꿀 조건',
      paragraphs: [
        '앞으로는 국내 자동차보험과 해외 사업의 비중을 같은 기준으로 이어서 비교하겠다. 유럽·북미 확대가 유지되는지와 함께 보험손익, 손해율·합산비율, 고액 사고에 대한 노출을 확인하고, 북미 현지 영업 기반이 실제 사업 성과로 연결되는지도 살펴볼 생각이다.',
        '해외 비중은 늘지만 계약 수익성이 나빠지거나 특정 지역의 대형 사고에 대한 노출이 커진다면 가설을 다시 검토해야 한다. 반대로 저수익 계약을 줄이는 과정이라면 단기 매출 감소만으로 전략이 실패했다고 판단하지 않으려 한다.',
        '내가 복기하려는 질문은 “보험주라서 안전했는가”가 아니라 “국내 특정 사업에 대한 의존도를 줄이고 해외에서 수익성 있는 계약을 늘릴 수 있는가”다. 당시의 기대와 이후의 자료를 구분하면서 이 질문을 계속 확인하려고 한다.',
      ],
    },
  ],
  sources: [
    { id: 'ir-library', title: '코리안리 공식 IR 자료실 · 2025년 말 및 2026년 1분기 자료 등록 내역', url: 'https://www.koreanre.co.kr/sub.asp?exec=list&maincode=503&strBoardID=kui_552&sub_sequence=551&sub_sub_sequence=552', publishedAt: '2026-05-15' },
    { id: 'fy2025-domestic', title: '2025년 말 경영실적 · 국내 자동차보험과 해외 보험수익', url: 'https://www.koreanre.co.kr/magicboard/Library/fileDown.asp?strBoardID=kui_552&intNum=1158&intSeq=1523', publishedAt: '2026-02-12', pages: '4·20쪽' },
    { id: 'fy2025-overseas', title: '2025년 말 경영실적 · 종목별·지역별 해외 수재 포트폴리오', url: 'https://www.koreanre.co.kr/magicboard/Library/fileDown.asp?strBoardID=kui_552&intNum=1158&intSeq=1523', publishedAt: '2026-02-12', pages: '7~8쪽' },
    { id: 'us-brokerage', title: '미국중개법인 재보험 중개면허 취득 완료 · 2021년 공식 발표', url: 'https://www.koreanre.co.kr/sub.asp?exec=view&intSeq=1179&maincode=501&strBoardID=kui_519&sub_sequence=519', publishedAt: '2021' },
    { id: 'q3-earnings', title: '2026년 3분기 경영실적 · 주요 경영실적', url: 'https://www.koreanre.co.kr/magicboard/Library/fileDown.asp?strBoardID=kui_552&intNum=1210&intSeq=1561', publishedAt: '2026-11-16', pages: '2쪽' },
  ],
}];

export function publishedJournalById(id: string) {
  return publishedJournals.find((entry) => entry.id === id);
}

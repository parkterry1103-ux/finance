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
  subtitle: '실제 투자 이후 다시 살펴본 이익의 구조와 위험',
  company: '코리안리',
  ticker: '003690',
  purchasedAt: '2026-05-14',
  publishedAt: '2026-11-19',
  summary: '순이익 증가를 본업의 개선으로 바로 해석할 수 있을까? 보험손익과 투자손익을 나누고, 산업 공통 위험과 회사의 선택을 다시 살펴봤다.',
  sections: [
    {
      id: 'timing', title: '매수 사실과 사후 분석을 구분하며',
      paragraphs: [
        '나는 2026년 5월 14일 코리안리 주식을 매수했다. 이번에는 매수 결과를 평가하기에 앞서, 이 회사가 어떤 위험을 부담하고 무엇으로 이익을 내는지 다시 살펴봤다.',
        '당시의 판단과 이후에 알게 된 내용은 구분하려고 한다. 회사의 2026년 1분기 IR 자료는 매수 다음 날인 5월 15일 공개됐다. 따라서 이후 확인한 실적을 당시 매수 근거였던 것처럼 설명하지 않는다. 이 글은 현재 공개된 자료를 바탕으로 작성한 사후 복기다.',
      ], sourceIds: ['ir-library'],
    },
    {
      id: 'earnings', title: '순이익 증가보다 먼저 확인한 이익의 구성',
      paragraphs: [
        '별도 기준 2026년 1~3분기 누적 순이익은 약 4,016억원으로 전년 동기보다 48.9% 증가했다. 하지만 보험손익은 약 2,361억원으로 0.3% 감소했고, 투자손익은 약 3,018억원으로 87.0% 증가했다.',
        '이 숫자를 보고 내린 판단은, 순이익 증가를 재보험 본업의 수익성 개선으로 곧바로 해석해서는 안 된다는 것이다. 투자 부문의 성과가 얼마나 반복될 수 있는지, 보험 부문의 이익 기반은 유지되는지 따로 확인해야 한다.',
      ], sourceIds: ['q3-earnings'],
    },
    {
      id: 'risks', title: '산업 공통 위험과 회사의 선택',
      paragraphs: [
        '산업 측면에서는 재보험 요율 경쟁과 대형 사고에 주목했다. 회사는 국내 요율 경쟁에 대응해 일부 종목의 인수를 축소했고, 해외에서는 지진·홍수 관련 손해를 반영했다고 설명했다.',
        '다만 같은 산업 환경에서도 결과는 회사마다 달라질 수 있다. 어떤 계약을 어떤 가격에 인수하는지, 지역과 종목이 얼마나 분산돼 있는지에 따라 부담이 달라지기 때문이다.',
        '그래서 나는 위험을 두 단계로 나눠 보려고 한다. 먼저 산업 전체에 어떤 변화가 생겼는지 확인하고, 다음으로 코리안리의 계약 구성과 인수 판단이 그 변화에 어떻게 노출돼 있는지 살펴보는 방식이다. 산업 위험과 기업 위험은 완전히 분리된 것이 아니라 서로 연결돼 있다고 본다.',
      ], sourceIds: ['q3-risks'],
    },
    {
      id: 'judgment', title: '현재의 판단과 반대 가능성',
      paragraphs: [
        '현재 내 판단은 ‘이익이 늘었으니 투자 판단이 맞았다’고 결론 내리기에는 부족하다는 것이다. 보험손익과 투자손익을 구분하고, 이번 이익 수준이 다른 시장 환경에서도 유지될 수 있는지 확인해야 한다.',
        '반대 가능성도 남겨둔다. 보험손익이 크게 늘지 않았더라도 수익성이 낮은 계약을 줄이는 과정이라면 단기 성장률만으로 부정적으로 평가하기 어렵다. 반대로 투자 성과가 좋았더라도 그 효과를 장기 이익으로 그대로 연장하면 기업가치를 과대평가할 수 있다.',
        '따라서 지금은 목표주가나 저평가 여부를 단정하기보다, 이익이 만들어진 이유와 지속 가능성을 설명하는 데 집중하려고 한다.',
      ],
    },
    {
      id: 'follow-up', title: '다음에 확인할 것',
      paragraphs: [
        '다음 실적에서는 보험손익과 투자손익의 변화를 다시 나눠 확인하겠다. 특히 계약 구성의 변화가 수익성으로 이어지는지, 사고 관련 손해 추정이 어떻게 달라지는지 살펴볼 생각이다.',
        '이번 복기의 핵심은 투자 결과에 맞춰 매수 이유를 다시 만드는 것이 아니다. 당시 알고 있던 것과 나중에 확인한 것을 구분하고, 같은 기업을 다시 볼 때 어떤 질문을 먼저 해야 하는지 정리하는 데 있다.',
      ],
    },
  ],
  sources: [
    { id: 'ir-library', title: '코리안리 공식 IR 자료실', url: 'https://www.koreanre.co.kr/sub.asp?exec=list&maincode=503&strBoardID=kui_552&sub_sequence=551&sub_sub_sequence=552', publishedAt: '2026-05-15' },
    { id: 'q3-earnings', title: '2026년 3분기 경영실적 · 주요 경영실적', url: 'https://www.koreanre.co.kr/magicboard/Library/fileDown.asp?strBoardID=kui_552&intNum=1210&intSeq=1561', publishedAt: '2026-11-16', pages: '2쪽' },
    { id: 'q3-risks', title: '2026년 3분기 경영실적 · 보험수익과 합산비율', url: 'https://www.koreanre.co.kr/magicboard/Library/fileDown.asp?strBoardID=kui_552&intNum=1210&intSeq=1561', publishedAt: '2026-11-16', pages: '3~4쪽' },
  ],
}];

export function publishedJournalById(id: string) {
  return publishedJournals.find((entry) => entry.id === id);
}

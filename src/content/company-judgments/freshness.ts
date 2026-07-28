import type {
  CompanyDirectionJudgment,
  CompanyJudgmentCard,
  CompanyJudgmentLatestOfficialUpdate,
} from './types.js';

function atOrAfter(value: string, threshold: string) {
  return Date.parse(`${value}T00:00:00Z`) >= Date.parse(`${threshold}T00:00:00Z`);
}

export function isCompanyJudgmentCardCurrent(
  card: CompanyJudgmentCard,
  latest: CompanyJudgmentLatestOfficialUpdate,
) {
  const threshold = card.key === 'investmentBurden'
    ? latest.latestMaterialEventAt
    : latest.latestQuarterlyResultsAt;
  return atOrAfter(card.reviewedAt, threshold) && atOrAfter(card.asOf, latest.latestQuarterlyResultsAt);
}

export function isMarketExpectationCurrent(
  judgment: CompanyDirectionJudgment,
  latest: CompanyJudgmentLatestOfficialUpdate,
) {
  return atOrAfter(judgment.reviewedAt, latest.latestMaterialEventAt)
    && atOrAfter(judgment.asOf, latest.latestQuarterlyResultsAt);
}

export function isCompanyDirectionCurrent(
  judgment: CompanyDirectionJudgment,
  latest: CompanyJudgmentLatestOfficialUpdate,
) {
  return atOrAfter(judgment.reviewedAt, latest.latestQuarterlyResultsAt)
    && atOrAfter(judgment.asOf, latest.latestQuarterlyResultsAt);
}

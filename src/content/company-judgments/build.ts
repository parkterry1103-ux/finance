import {
  isCompanyDirectionCurrent,
  isCompanyJudgmentCardCurrent,
  isMarketExpectationCurrent,
} from './freshness.js';
import type { CompanyJudgmentConfig, CompanyJudgmentModel } from './types.js';

export function buildCompanyJudgment(config: CompanyJudgmentConfig): CompanyJudgmentModel | null {
  if (!isCompanyDirectionCurrent(config.companyDirection, config.latestOfficialUpdate)) return null;
  if (!isMarketExpectationCurrent(config.marketExpectation, config.latestOfficialUpdate)) return null;
  const cards = config.cards.filter((card) => isCompanyJudgmentCardCurrent(card, config.latestOfficialUpdate));
  if (!cards.length) return null;
  return { ...config, cards };
}

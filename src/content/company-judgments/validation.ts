import { companyProfiles } from '../company-profiles/entries.js';
import { sourceRegistry } from '../sources/registry.js';
import { isCompanyDirectionCurrent, isCompanyJudgmentCardCurrent, isMarketExpectationCurrent } from './freshness.js';
import { companyJudgmentSlugs, loadAllCompanyJudgmentConfigs } from './registry.js';
import type { CompanyJudgmentCardKey } from './types.js';

const cardKeys: CompanyJudgmentCardKey[] = ['businessGrowth', 'earningsQuality', 'cashQuality', 'investmentBurden'];
const forbidden = /(BUY|HOLD|SELL|목표주가|종합\s*(의견|시각|등급|점수)|투자\s*(추천|점수)|확인\s*필요)/i;

function isDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`));
}

export async function validateCompanyJudgmentRegistry() {
  const errors: string[] = [];
  const configs = await loadAllCompanyJudgmentConfigs();
  const profileSlugs = new Set(companyProfiles.map(({ slug }) => slug));

  if (configs.length !== companyJudgmentSlugs.length) errors.push('company judgment loader count mismatch');
  if (new Set(configs.map(({ companySlug }) => companySlug)).size !== configs.length) errors.push('duplicate company judgment slug');

  for (const config of configs) {
    if (!profileSlugs.has(config.companySlug)) errors.push(`${config.companySlug}: company profile missing`);
    if (!isDate(config.latestOfficialUpdate.latestQuarterlyResultsAt) || !isDate(config.latestOfficialUpdate.latestMaterialEventAt)) {
      errors.push(`${config.companySlug}: latest official update date invalid`);
    }
    if (!isCompanyDirectionCurrent(config.companyDirection, config.latestOfficialUpdate)) errors.push(`${config.companySlug}: company direction is stale`);
    if (!isMarketExpectationCurrent(config.marketExpectation, config.latestOfficialUpdate)) errors.push(`${config.companySlug}: market expectation is stale`);
    if (config.companyDirection.horizon !== '향후 6~12개월') errors.push(`${config.companySlug}: company direction horizon invalid`);
    if (config.marketExpectation.horizon !== '다음 1~2개 분기') errors.push(`${config.companySlug}: market expectation horizon invalid`);
    if (forbidden.test(JSON.stringify({ companyDirection: config.companyDirection, marketExpectation: config.marketExpectation }))) {
      errors.push(`${config.companySlug}: forbidden top judgment copy`);
    }

    if (config.cards.length !== cardKeys.length) errors.push(`${config.companySlug}: four current cards required`);
    if (config.cards.map(({ key }) => key).join('|') !== cardKeys.join('|')) errors.push(`${config.companySlug}: card order invalid`);
    for (const card of config.cards) {
      if (!isCompanyJudgmentCardCurrent(card, config.latestOfficialUpdate)) errors.push(`${config.companySlug}/${card.key}: stale card`);
      if (!card.reason.trim() || card.causeFlow.some((item) => !item.trim()) || !card.reversalCondition.trim()) {
        errors.push(`${config.companySlug}/${card.key}: judgment explanation incomplete`);
      }
      if (card.metrics.length < 2 || card.metrics.length > 3) errors.push(`${config.companySlug}/${card.key}: metric count invalid`);
      if (forbidden.test(JSON.stringify(card))) errors.push(`${config.companySlug}/${card.key}: forbidden copy`);
      if (!card.sourceIds.length) errors.push(`${config.companySlug}/${card.key}: source missing`);
    }

    const sourceIds = new Set(config.sources.map(({ sourceId }) => sourceId));
    if (sourceIds.size !== config.sources.length) errors.push(`${config.companySlug}: duplicate judgment source`);
    for (const source of config.sources) {
      if (!sourceRegistry[source.sourceId]) errors.push(`${config.companySlug}: source registry missing ${source.sourceId}`);
      if (!/^https:\/\//.test(source.sourceUrl) || !isDate(source.publishedAt) || !isDate(source.asOf)) {
        errors.push(`${config.companySlug}: source metadata invalid ${source.sourceId}`);
      }
      if (!source.sourceTitle.trim() || !source.period.trim() || !source.metricDefinition.trim()) {
        errors.push(`${config.companySlug}: source detail incomplete ${source.sourceId}`);
      }
    }
    const usedSourceIds = [
      ...config.companyDirection.sourceIds,
      ...config.marketExpectation.sourceIds,
      ...config.cards.flatMap(({ sourceIds: ids }) => ids),
    ];
    usedSourceIds.forEach((sourceId) => {
      if (!sourceIds.has(sourceId)) errors.push(`${config.companySlug}: unresolved judgment source ${sourceId}`);
    });
    if (!isDate(config.anomalyReview.reviewedAt) || !config.anomalyReview.findings.length || !config.anomalyReview.operatorDecision.trim()) {
      errors.push(`${config.companySlug}: internal anomaly review incomplete`);
    }
  }
  return errors;
}

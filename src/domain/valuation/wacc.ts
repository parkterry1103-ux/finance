import type { DiscountRateAssumptions } from './types.js';

export function calculateWacc(input: DiscountRateAssumptions) {
  const values = Object.values(input).filter((value): value is number => typeof value === 'number');
  if (values.some((value) => !Number.isFinite(value))) throw new Error('WACC input contains NaN or Infinity.');
  if (input.normalizedTaxRate < 0 || input.normalizedTaxRate > 1) throw new Error('WACC tax rate must be between 0 and 1.');
  if (input.equityWeight < 0 || input.debtWeight < 0) throw new Error('WACC weights cannot be negative.');
  const totalWeight = input.equityWeight + input.debtWeight;
  if (Math.abs(totalWeight - 1) > 1e-8) throw new Error('WACC market-value weights must sum to 1.');
  const costOfEquity = input.riskFreeRate
    + input.leveredBeta * input.equityRiskPremium
    + (input.countryRiskPremium ?? 0);
  const afterTaxCostOfDebt = input.preTaxCostOfDebt * (1 - input.normalizedTaxRate);
  const wacc = costOfEquity * input.equityWeight + afterTaxCostOfDebt * input.debtWeight;
  return { costOfEquity, afterTaxCostOfDebt, wacc };
}

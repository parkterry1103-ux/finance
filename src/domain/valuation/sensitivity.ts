import { runScenario } from './scenarios.js';
import type { SensitivityMatrix, ValuationModelInput } from './types.js';

function cloneInput(input: ValuationModelInput): ValuationModelInput {
  return structuredClone(input);
}

function uniqueFinite(values: number[], label: string) {
  if (!values.length || values.some((value) => !Number.isFinite(value))) throw new Error(`${label} values must be finite.`);
  if (new Set(values).size !== values.length) throw new Error(`${label} values must be unique.`);
}

export function buildSensitivityMatrix(
  input: ValuationModelInput,
  rowValues: number[],
  columnValues: number[],
  applyVariables: (candidate: ValuationModelInput, rowValue: number, columnValue: number) => void,
  labels = { rowVariable: 'row', columnVariable: 'column' },
): SensitivityMatrix {
  uniqueFinite(rowValues, labels.rowVariable);
  uniqueFinite(columnValues, labels.columnVariable);
  const cells = rowValues.flatMap((rowValue) => columnValues.map((columnValue) => {
    const candidate = cloneInput(input);
    applyVariables(candidate, rowValue, columnValue);
    try {
      return { rowValue, columnValue, estimatedValuePerShare: runScenario(candidate).estimatedValuePerShare };
    } catch (error) {
      return {
        rowValue,
        columnValue,
        estimatedValuePerShare: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }));
  return { ...labels, rowValues, columnValues, cells };
}

export function buildWaccGrowthSensitivity(input: ValuationModelInput, waccValues: number[], growthValues: number[]) {
  return buildSensitivityMatrix(
    input,
    waccValues,
    growthValues,
    (candidate, targetWacc, stableGrowthRate) => {
      const current = candidate.discountRateAssumptions;
      const afterTaxDebt = current.preTaxCostOfDebt * (1 - current.normalizedTaxRate);
      const equityWeight = current.equityWeight;
      const requiredCostOfEquity = (targetWacc - afterTaxDebt * current.debtWeight) / equityWeight;
      current.leveredBeta = (requiredCostOfEquity - current.riskFreeRate - (current.countryRiskPremium ?? 0)) / current.equityRiskPremium;
      candidate.terminalAssumptions.stableGrowthRate = stableGrowthRate;
    },
    { rowVariable: 'wacc', columnVariable: 'stableGrowthRate' },
  );
}

export function buildGrowthMarginSensitivity(input: ValuationModelInput, growthValues: number[], marginValues: number[]) {
  return buildSensitivityMatrix(
    input,
    growthValues,
    marginValues,
    (candidate, revenueGrowthRate, operatingMargin) => {
      candidate.forecastAssumptions.years.forEach((year) => {
        year.revenueGrowthRate = revenueGrowthRate;
        year.operatingMargin = operatingMargin;
      });
    },
    { rowVariable: 'revenueGrowthRate', columnVariable: 'operatingMargin' },
  );
}

import { calculateEquityValue, calculatePerShareValue } from './enterprise-equity-bridge.js';
import { calculateFcff } from './fcff.js';
import {
  calculateExitMultipleTerminalValue,
  calculateTerminalFcff,
  calculateTerminalReinvestmentRate,
  calculateTerminalValue,
} from './terminal-value.js';
import type {
  ForecastPeriodResult,
  ValuationModelInput,
  ValuationModelResult,
  ValuationScenario,
  ValuationWarning,
} from './types.js';
import { validateValuationInput } from './validation.js';
import { valuationWarningThresholds } from './warning-config.js';
import { calculateWacc } from './wacc.js';

export function calculateEnterpriseValue(presentValueOfForecastFcff: number, presentValueOfTerminalValue: number) {
  if (![presentValueOfForecastFcff, presentValueOfTerminalValue].every(Number.isFinite)) {
    throw new Error('Enterprise value input contains NaN or Infinity.');
  }
  return presentValueOfForecastFcff + presentValueOfTerminalValue;
}

function historicalOperatingMargins(input: ValuationModelInput) {
  return input.historicals.flatMap((period) => {
    const revenue = period.metrics.revenue;
    const operatingIncome = period.metrics.operatingIncome ?? period.metrics.ebit;
    return revenue && operatingIncome !== undefined ? [operatingIncome / revenue] : [];
  });
}

function historicalRevenueGrowth(input: ValuationModelInput) {
  const revenues = [...input.historicals]
    .sort((a, b) => a.periodEnd.localeCompare(b.periodEnd))
    .flatMap((period) => period.metrics.revenue === undefined ? [] : [period.metrics.revenue]);
  return revenues.slice(1).flatMap((revenue, index) => revenues[index] > 0 ? [revenue / revenues[index] - 1] : []);
}

function buildWarnings(input: ValuationModelInput, result: Omit<ValuationModelResult, 'warnings'>): ValuationWarning[] {
  const warnings: ValuationWarning[] = [];
  if (result.terminalValueShareOfEnterpriseValue > valuationWarningThresholds.terminalValueShareHigh) {
    warnings.push({
      code: 'terminal-value-share-high',
      message: 'Terminal Value 비중이 설정된 경고 기준을 초과합니다.',
      value: result.terminalValueShareOfEnterpriseValue,
      threshold: valuationWarningThresholds.terminalValueShareHigh,
    });
  }

  const margins = historicalOperatingMargins(input);
  if (margins.length) {
    const min = Math.min(...margins) - valuationWarningThresholds.marginOutsideHistoryPoints;
    const max = Math.max(...margins) + valuationWarningThresholds.marginOutsideHistoryPoints;
    const terminalMargin = result.forecast[result.forecast.length - 1]?.operatingMargin ?? 0;
    if (terminalMargin < min || terminalMargin > max) {
      warnings.push({ code: 'margin-outside-history', message: '정상 영업이익률이 과거 범위를 크게 벗어납니다.', value: terminalMargin });
    }
  }

  const growth = historicalRevenueGrowth(input);
  if (growth.length) {
    const min = Math.min(...growth) - valuationWarningThresholds.growthOutsideHistoryPoints;
    const max = Math.max(...growth) + valuationWarningThresholds.growthOutsideHistoryPoints;
    const outlier = result.forecast.find((period) => period.revenueGrowthRate < min || period.revenueGrowthRate > max);
    if (outlier) warnings.push({ code: 'growth-outside-history', message: '전망 매출 성장률이 과거 범위를 크게 벗어납니다.', value: outlier.revenueGrowthRate });
  }

  let consecutiveCapexBelowDepreciation = 0;
  for (const period of result.forecast) {
    consecutiveCapexBelowDepreciation = period.capitalExpenditure < period.depreciationAndAmortization
      ? consecutiveCapexBelowDepreciation + 1
      : 0;
    if (consecutiveCapexBelowDepreciation >= valuationWarningThresholds.capexBelowDepreciationYears) {
      warnings.push({ code: 'capex-below-depreciation', message: 'Capex가 감가상각보다 장기간 낮습니다.' });
      break;
    }
  }

  const stableRoic = input.terminalAssumptions.stableRoic;
  if (stableRoic !== undefined) {
    const reinvestmentRate = calculateTerminalReinvestmentRate(input.terminalAssumptions.stableGrowthRate, stableRoic) ?? 0;
    const impliedGrowth = reinvestmentRate * stableRoic;
    if (Math.abs(impliedGrowth - input.terminalAssumptions.stableGrowthRate) > valuationWarningThresholds.terminalReinvestmentTolerance) {
      warnings.push({ code: 'terminal-reinvestment-inconsistent', message: 'Terminal ROIC·재투자율과 성장률이 일치하지 않습니다.' });
    }
  }
  return warnings;
}

export function runScenario(input: ValuationModelInput): ValuationModelResult {
  validateValuationInput(input);
  const orderedHistoricals = [...input.historicals].sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));
  const latestHistorical = orderedHistoricals[orderedHistoricals.length - 1];
  let revenue = latestHistorical.metrics.revenue!;
  const { costOfEquity, afterTaxCostOfDebt, wacc } = calculateWacc(input.discountRateAssumptions);
  if (wacc <= input.terminalAssumptions.stableGrowthRate) throw new Error('WACC must be greater than the stable growth rate.');

  const forecast: ForecastPeriodResult[] = input.forecastAssumptions.years.map((assumption, index) => {
    revenue *= 1 + assumption.revenueGrowthRate;
    const ebit = revenue * assumption.operatingMargin;
    const depreciationAndAmortization = revenue * assumption.depreciationAsPercentRevenue;
    const capitalExpenditure = revenue * assumption.capexAsPercentRevenue;
    const changeInWorkingCapital = revenue * assumption.changeInWorkingCapitalAsPercentRevenue;
    const { nopat, fcff } = calculateFcff({
      ebit,
      normalizedTaxRate: assumption.normalizedTaxRate,
      depreciationAndAmortization,
      capitalExpenditure,
      changeInWorkingCapital,
    });
    const discountFactor = 1 / ((1 + wacc) ** (index + 1));
    return {
      ...assumption,
      revenue,
      ebit,
      nopat,
      depreciationAndAmortization,
      capitalExpenditure,
      changeInWorkingCapital,
      fcff,
      discountFactor,
      presentValueOfFcff: fcff * discountFactor,
    };
  });

  const terminalPeriod = forecast[forecast.length - 1];
  const terminalFcff = calculateTerminalFcff(
    terminalPeriod.ebit,
    terminalPeriod.normalizedTaxRate,
    input.terminalAssumptions.stableGrowthRate,
    input.terminalAssumptions.stableRoic,
  );
  const terminalValue = calculateTerminalValue(terminalFcff, wacc, input.terminalAssumptions.stableGrowthRate);
  const exitMultipleTerminalValue = input.terminalAssumptions.exitMultiple === undefined
    ? undefined
    : calculateExitMultipleTerminalValue(
        terminalPeriod.ebit + terminalPeriod.depreciationAndAmortization,
        input.terminalAssumptions.exitMultiple,
      );
  const presentValueOfForecastFcff = forecast.reduce((sum, period) => sum + period.presentValueOfFcff, 0);
  const presentValueOfTerminalValue = terminalValue / ((1 + wacc) ** forecast.length);
  const enterpriseValue = calculateEnterpriseValue(presentValueOfForecastFcff, presentValueOfTerminalValue);
  const equityBridge = calculateEquityValue({ enterpriseValue, ...input.capitalStructure });
  const estimatedValuePerShare = calculatePerShareValue(equityBridge.equityValue, input.capitalStructure.dilutedShares);
  const terminalValueShareOfEnterpriseValue = enterpriseValue === 0 ? 0 : presentValueOfTerminalValue / enterpriseValue;
  const partial: Omit<ValuationModelResult, 'warnings'> = {
    companySlug: input.companySlug,
    valuationDate: input.valuationDate,
    currency: input.currency,
    forecast,
    wacc,
    costOfEquity,
    afterTaxCostOfDebt,
    presentValueOfForecastFcff,
    terminalFcff,
    terminalValue,
    exitMultipleTerminalValue,
    presentValueOfTerminalValue,
    enterpriseValue,
    equityBridge,
    dilutedShares: input.capitalStructure.dilutedShares,
    estimatedValuePerShare,
    terminalValueShareOfEnterpriseValue,
    sourceIds: [...input.sources],
  };
  return { ...partial, warnings: buildWarnings(input, partial) };
}

export function runScenarios(scenarios: ValuationScenario[]) {
  const names = new Set(scenarios.map((scenario) => scenario.name));
  if (names.size !== scenarios.length) throw new Error('Scenario names must be unique.');
  return scenarios.map((scenario) => ({ name: scenario.name, result: runScenario(scenario.input) }));
}

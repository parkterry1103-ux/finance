import { runScenario } from './scenarios.js';
import type { ReverseDcfResult, ReverseDcfVariable, ValuationModelInput } from './types.js';

function applyVariable(input: ValuationModelInput, variable: ReverseDcfVariable, value: number) {
  if (variable === 'revenueCagr') input.forecastAssumptions.years.forEach((year) => { year.revenueGrowthRate = value; });
  if (variable === 'operatingMargin') input.forecastAssumptions.years.forEach((year) => { year.operatingMargin = value; });
  if (variable === 'terminalGrowth') input.terminalAssumptions.stableGrowthRate = value;
}

export function solveReverseDcf({
  input,
  variable,
  lowerBound,
  upperBound,
  currentPrice,
  tolerance = 1e-6,
  maxIterations = 200,
}: {
  input: ValuationModelInput;
  variable: ReverseDcfVariable;
  lowerBound: number;
  upperBound: number;
  currentPrice: number;
  tolerance?: number;
  maxIterations?: number;
}): ReverseDcfResult {
  if (![lowerBound, upperBound, currentPrice, tolerance].every(Number.isFinite)) throw new Error('Reverse DCF input contains NaN or Infinity.');
  if (lowerBound >= upperBound) throw new Error('Reverse DCF lower bound must be below the upper bound.');
  if (currentPrice <= 0 || tolerance <= 0) throw new Error('Reverse DCF price and tolerance must be positive.');
  const targetEquityValue = currentPrice * input.capitalStructure.dilutedShares;
  const evaluate = (value: number) => {
    const candidate = structuredClone(input);
    applyVariable(candidate, variable, value);
    return runScenario(candidate).equityBridge.equityValue;
  };
  let low = lowerBound;
  let high = upperBound;
  let lowValue = evaluate(low) - targetEquityValue;
  let highValue = evaluate(high) - targetEquityValue;
  if (lowValue === 0 || highValue === 0) {
    const solvedValue = lowValue === 0 ? low : high;
    return { variable, solvedValue, targetEquityValue, solvedEquityValue: targetEquityValue, absoluteError: 0, relativeError: 0, iterations: 0, converged: true };
  }
  if (Math.sign(lowValue) === Math.sign(highValue)) throw new Error('Reverse DCF bounds do not bracket the target equity value.');

  let midpoint = (low + high) / 2;
  let solvedEquityValue = evaluate(midpoint);
  let iterations = 0;
  for (; iterations < maxIterations; iterations += 1) {
    midpoint = (low + high) / 2;
    solvedEquityValue = evaluate(midpoint);
    const difference = solvedEquityValue - targetEquityValue;
    if (Math.abs(difference) / targetEquityValue <= tolerance) break;
    if (Math.sign(difference) === Math.sign(lowValue)) {
      low = midpoint;
      lowValue = difference;
    } else {
      high = midpoint;
      highValue = difference;
    }
  }
  const absoluteError = Math.abs(solvedEquityValue - targetEquityValue);
  const relativeError = absoluteError / targetEquityValue;
  return {
    variable,
    solvedValue: midpoint,
    targetEquityValue,
    solvedEquityValue,
    absoluteError,
    relativeError,
    iterations: iterations + 1,
    converged: relativeError <= tolerance,
  };
}

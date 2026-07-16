export function calculateTerminalReinvestmentRate(stableGrowthRate: number, stableRoic?: number) {
  if (stableRoic === undefined) return null;
  if (!Number.isFinite(stableGrowthRate) || !Number.isFinite(stableRoic) || stableRoic <= 0) {
    throw new Error('Stable growth and ROIC must be finite, and stable ROIC must be positive.');
  }
  const reinvestmentRate = stableGrowthRate / stableRoic;
  if (reinvestmentRate < 0 || reinvestmentRate >= 1) {
    throw new Error('Terminal reinvestment rate must be between 0 and 1.');
  }
  return reinvestmentRate;
}

export function calculateTerminalFcff(
  terminalEbit: number,
  normalizedTaxRate: number,
  stableGrowthRate: number,
  stableRoic?: number,
) {
  const nextPeriodNopat = terminalEbit * (1 + stableGrowthRate) * (1 - normalizedTaxRate);
  const reinvestmentRate = calculateTerminalReinvestmentRate(stableGrowthRate, stableRoic);
  return nextPeriodNopat * (1 - (reinvestmentRate ?? 0));
}

export function calculateTerminalValue(terminalFcff: number, wacc: number, stableGrowthRate: number) {
  if (![terminalFcff, wacc, stableGrowthRate].every(Number.isFinite)) throw new Error('Terminal value input contains NaN or Infinity.');
  if (wacc <= stableGrowthRate) throw new Error('WACC must be greater than the stable growth rate.');
  return terminalFcff / (wacc - stableGrowthRate);
}

export function calculateExitMultipleTerminalValue(terminalEbitda: number, exitMultiple: number) {
  if (![terminalEbitda, exitMultiple].every(Number.isFinite) || exitMultiple <= 0) {
    throw new Error('Exit multiple inputs must be finite and the multiple must be positive.');
  }
  return terminalEbitda * exitMultiple;
}

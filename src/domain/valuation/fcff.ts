export type FcffInput = {
  ebit: number;
  normalizedTaxRate: number;
  depreciationAndAmortization: number;
  capitalExpenditure: number;
  changeInWorkingCapital: number;
};

function assertFinite(values: number[]) {
  if (values.some((value) => !Number.isFinite(value))) throw new Error('FCFF input contains NaN or Infinity.');
}

export function calculateFcff(input: FcffInput) {
  assertFinite(Object.values(input));
  if (input.normalizedTaxRate < 0 || input.normalizedTaxRate > 1) {
    throw new Error('Normalized tax rate must be a decimal between 0 and 1.');
  }
  const nopat = input.ebit * (1 - input.normalizedTaxRate);
  const fcff = nopat
    + input.depreciationAndAmortization
    - input.capitalExpenditure
    - input.changeInWorkingCapital;
  return { nopat, fcff };
}

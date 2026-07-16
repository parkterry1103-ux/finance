export type EquityBridgeInput = {
  enterpriseValue: number;
  cash: number;
  nonOperatingAssets?: number;
  debt: number;
  leaseLiabilities?: number;
  minorityInterest?: number;
  otherClaims?: number;
};

export function calculateEquityValue(input: EquityBridgeInput) {
  const values = Object.values(input).filter((value): value is number => typeof value === 'number');
  if (values.some((value) => !Number.isFinite(value))) throw new Error('Equity bridge contains NaN or Infinity.');
  const nonOperatingAssets = input.nonOperatingAssets ?? 0;
  const leaseLiabilities = input.leaseLiabilities ?? 0;
  const minorityInterest = input.minorityInterest ?? 0;
  const otherClaims = input.otherClaims ?? 0;
  const equityValue = input.enterpriseValue
    + input.cash
    + nonOperatingAssets
    - input.debt
    - leaseLiabilities
    - minorityInterest
    - otherClaims;
  return { ...input, nonOperatingAssets, leaseLiabilities, minorityInterest, otherClaims, equityValue };
}

export function calculatePerShareValue(equityValue: number, dilutedShares: number) {
  if (![equityValue, dilutedShares].every(Number.isFinite)) throw new Error('Per-share value input contains NaN or Infinity.');
  if (dilutedShares <= 0) throw new Error('Diluted shares must be greater than zero.');
  return equityValue / dilutedShares;
}

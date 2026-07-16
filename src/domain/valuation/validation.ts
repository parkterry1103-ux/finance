import { normalizedMetricIds, type ValuationModelInput } from './types.js';

export type ValuationValidationOptions = {
  knownSourceIds?: Set<string>;
};

function assertFinite(value: number, label: string) {
  if (!Number.isFinite(value)) throw new Error(`${label} contains NaN or Infinity.`);
}

export function validateValuationInput(input: ValuationModelInput, options: ValuationValidationOptions = {}) {
  if (!input.companySlug.trim()) throw new Error('Company slug is required.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.valuationDate)) throw new Error('Valuation date must use YYYY-MM-DD.');
  if (!input.currency.trim()) throw new Error('Valuation currency is required.');
  if (!input.historicals.length) throw new Error('At least one historical period is required.');
  if (!input.forecastAssumptions.years.length) throw new Error('At least one forecast period is required.');
  if (input.capitalStructure.dilutedShares <= 0) throw new Error('Diluted shares must be greater than zero.');

  const periodKeys = new Set<string>();
  const periodTypes = new Set(input.historicals.map((period) => period.periodType));
  if (periodTypes.size > 1) throw new Error('Annual, quarterly, TTM, and point-in-time historicals cannot be mixed in one model.');
  input.historicals.forEach((period) => {
    const key = `${period.periodType}:${period.periodEnd}`;
    if (periodKeys.has(key)) throw new Error(`Duplicate financial period: ${key}.`);
    periodKeys.add(key);
    if (period.currency !== input.currency) throw new Error(`Currency mismatch in historical period ${period.periodEnd}.`);
    if (period.unit !== 'million') throw new Error(`Amount unit must be million in historical period ${period.periodEnd}.`);
    Object.entries(period.metrics).forEach(([metricId, value]) => {
      if (!normalizedMetricIds.includes(metricId as (typeof normalizedMetricIds)[number])) {
        throw new Error(`Unknown normalized metric ID: ${metricId}.`);
      }
      assertFinite(value, `${period.periodEnd}/${metricId}`);
    });
  });

  const orderedHistoricals = [...input.historicals].sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));
  const latest = orderedHistoricals[orderedHistoricals.length - 1];
  if (!latest || latest.metrics.revenue === undefined) throw new Error('Latest historical revenue is required.');

  const forecastYears = new Set<number>();
  input.forecastAssumptions.years.forEach((assumption) => {
    if (forecastYears.has(assumption.year)) throw new Error(`Duplicate forecast year: ${assumption.year}.`);
    forecastYears.add(assumption.year);
    Object.entries(assumption).forEach(([key, value]) => assertFinite(value, `forecast ${assumption.year}/${key}`));
    if (assumption.normalizedTaxRate < 0 || assumption.normalizedTaxRate > 1) {
      throw new Error(`Forecast tax rate must be between 0 and 1 for ${assumption.year}.`);
    }
  });

  const capitalValues = Object.entries(input.capitalStructure)
    .filter((entry): entry is [string, number] => typeof entry[1] === 'number');
  capitalValues.forEach(([key, value]) => assertFinite(value, `capital structure/${key}`));

  Object.entries(input.discountRateAssumptions)
    .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
    .forEach(([key, value]) => assertFinite(value, `discount rate/${key}`));
  Object.entries(input.terminalAssumptions)
    .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
    .forEach(([key, value]) => assertFinite(value, `terminal/${key}`));

  if (!input.sources.length) throw new Error('At least one source ID is required.');
  if (new Set(input.sources).size !== input.sources.length) throw new Error('Duplicate source IDs are not allowed.');
  if (options.knownSourceIds) {
    input.sources.forEach((sourceId) => {
      if (!options.knownSourceIds?.has(sourceId)) throw new Error(`Unknown valuation source ID: ${sourceId}.`);
    });
  }
  return true;
}

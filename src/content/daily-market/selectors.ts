import { dailyMarketBriefEntries, marketDrivers, marketFlows } from './entries.js';

export const marketDriverRegistry = Object.fromEntries(marketDrivers.map((driver) => [driver.id, driver]));
export const marketFlowRegistry = Object.fromEntries(marketFlows.map((flow) => [flow.id, flow]));

export function latestDailyMarketBrief() {
  return [...dailyMarketBriefEntries].sort((left, right) => right.date.localeCompare(left.date))[0];
}

export function driversForDailyMarketBrief(brief = latestDailyMarketBrief()) {
  return brief?.marketDriverIds.map((id) => marketDriverRegistry[id]).filter(Boolean) ?? [];
}

export function flowsForDailyMarketBrief(brief = latestDailyMarketBrief()) {
  return brief?.flowIds.map((id) => marketFlowRegistry[id]).filter(Boolean) ?? [];
}

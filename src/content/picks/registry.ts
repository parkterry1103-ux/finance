import type { StockAutopsyPick } from '../../data.js';
import { resolvePickSourceLinks } from '../sources/index.js';
import { stockAutopsyPickEntries } from './entries.js';

function resolvePickSources(pick: StockAutopsyPick): StockAutopsyPick {
  if (!pick.sourceRefs?.length || pick.sourceLinks?.length) return pick;
  return {
    ...pick,
    sourceLinks: resolvePickSourceLinks(pick.sourceRefs),
  };
}

export const stockAutopsyPicks: StockAutopsyPick[] = stockAutopsyPickEntries.map(resolvePickSources);

export const pickRegistry: Record<string, StockAutopsyPick> = Object.fromEntries(
  stockAutopsyPicks.map((pick) => [pick.id, pick]),
);

export const pickBySlug = new Map(
  stockAutopsyPicks.map((pick) => [pick.pickId ?? pick.id, pick]),
);

export const pickTickerUniverse = Array.from(
  new Set(
    stockAutopsyPicks
      .filter((pick) => pick.tickerStatus !== 'placeholder')
      .map((pick) => pick.ticker.trim().toUpperCase())
      .filter(Boolean),
  ),
).sort();

export function resolvePick(pickId: string) {
  const pick = pickRegistry[pickId];
  if (!pick) {
    throw new Error(`Unknown Pick id: ${pickId}`);
  }
  return pick;
}

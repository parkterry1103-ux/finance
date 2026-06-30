import type { StockAutopsyPick } from '../../data.js';
import { stockAutopsyPickEntries } from './entries.js';

export const stockAutopsyPicks: StockAutopsyPick[] = stockAutopsyPickEntries;

export const pickRegistry: Record<string, StockAutopsyPick> = Object.fromEntries(
  stockAutopsyPicks.map((pick) => [pick.id, pick]),
);

export const pickBySlug = new Map(
  stockAutopsyPicks.map((pick) => [pick.pickId ?? pick.id, pick]),
);

export const pickTickerUniverse = Array.from(
  new Set(
    stockAutopsyPicks
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

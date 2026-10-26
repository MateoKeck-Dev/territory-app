import { rollDrops } from '../../mocks/items';
import type { InventoryItem } from '../../mocks/items';
import { WALK_CONFIG } from './config';

/**
 * Walks under `minActiveMinutesForFirstDrop` earn nothing; at that
 * threshold they earn one drop, plus one more per
 * `activeMinutesPerBonusDrop` beyond it. E.g. with the defaults (5, 10):
 * <5 min -> 0, 5-14 min -> 1, 15-24 min -> 2, 25-34 min -> 3, ...
 */
export function dropCountForSummary(
  summary: { activeMinutes: number },
  config: typeof WALK_CONFIG = WALK_CONFIG,
): number {
  if (summary.activeMinutes < config.minActiveMinutesForFirstDrop) return 0;
  const bonus = Math.floor(
    (summary.activeMinutes - config.minActiveMinutesForFirstDrop) / config.activeMinutesPerBonusDrop,
  );
  return 1 + bonus;
}

/**
 * Rolls the drops a finished walk earns, from mock item data for now.
 * Deliberately the one place that decides "how many and which items" —
 * swap the body for a server call later (e.g. POST the walk summary, get
 * drops back) without touching any caller.
 */
export function rollDropsForWalk(
  summary: { activeMinutes: number },
  config: typeof WALK_CONFIG = WALK_CONFIG,
): InventoryItem[] {
  return rollDrops(dropCountForSummary(summary, config));
}

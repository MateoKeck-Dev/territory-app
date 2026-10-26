import { useGameData } from './GameDataProvider';
import type { InventoryItem } from '../mocks/items';

export type WalkSessionPhase = 'idle' | 'active' | 'recap' | 'revealing' | 'done';
export type RouteNovelty = 'new' | 'regular';

export type WalkResult = {
  distanceKm: number;
  activeMinutes: number;
  sniffSpotsHit: number;
  routeNovelty: RouteNovelty;
  drops: InventoryItem[];
};

/**
 * Walk flow state machine: idle -> active -> recap -> revealing -> done.
 * A thin consumer of GameDataProvider's shared state — WalkStartScreen,
 * WalkActiveScreen, WalkRecapScreen, and DropRevealScreen are each a
 * separate component instance, so this state can't live in a plain
 * useState here (every screen would get its own disconnected copy).
 *
 * Real tracking is GPS, on-device, background-capable — lib/walkTask.ts is
 * the base for that (currently unused by this mock UI, wiring it in is a
 * separate task). Distance, active minutes, route, sniff spots, and
 * new-vs-regular route detection all get computed on the phone and stored
 * locally (SQLite); only a summary — distance_m, active_minutes,
 * sniff_spots_hit, route_novelty — ever reaches the server. No step
 * counting anywhere in this model. WalkResult's shape here already
 * matches that summary, just named for the mock UI (distanceKm instead of
 * distance_m, etc.) rather than wired to a real local DB yet.
 */
export function useWalkSession() {
  const {
    walkPhase: phase,
    walkStartedAt: startedAt,
    walkResult: result,
    startWalk,
    endWalk,
    beginReveal,
    finishReveal,
    resetWalkSession: reset,
  } = useGameData();

  return { phase, startedAt, result, startWalk, endWalk, beginReveal, finishReveal, reset };
}

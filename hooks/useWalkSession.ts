import { useCallback, useState } from 'react';

import { rollDrops, type InventoryItem } from '../mocks/items';
import { useGameData } from './GameDataProvider';

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
  const { addItems, addWalkRecord, justOnboarded, acknowledgeFirstWalkNudge } = useGameData();
  const [phase, setPhase] = useState<WalkSessionPhase>('idle');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [result, setResult] = useState<WalkResult | null>(null);

  const startWalk = useCallback(() => {
    // The post-onboarding nudge's job is done once a walk actually starts.
    if (justOnboarded) acknowledgeFirstWalkNudge();
    setStartedAt(Date.now());
    setPhase('active');
  }, [justOnboarded, acknowledgeFirstWalkNudge]);

  const endWalk = useCallback(() => {
    const elapsedMin = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 60000)) : 5;
    // Mock GPS-derived numbers scaled to elapsed time, not a real track.
    // ~70-100m/min is a plausible dog-walking pace for the mock.
    const distanceKm = Math.round(elapsedMin * (0.07 + Math.random() * 0.03) * 100) / 100;
    const sniffSpotsHit = Math.floor(Math.random() * 4);
    const routeNovelty: RouteNovelty = Math.random() < 0.3 ? 'new' : 'regular';
    const walkResult: WalkResult = {
      distanceKm,
      activeMinutes: elapsedMin,
      sniffSpotsHit,
      routeNovelty,
      drops: rollDrops(),
    };
    setResult(walkResult);
    setPhase('recap');
  }, [startedAt]);

  const beginReveal = useCallback(() => setPhase('revealing'), []);

  const finishReveal = useCallback(() => {
    if (result) {
      addItems(result.drops);
      addWalkRecord({
        id: `walk-${Date.now()}`,
        dateLabel: 'Today',
        distanceKm: result.distanceKm,
        activeMinutes: result.activeMinutes,
        sniffSpotsHit: result.sniffSpotsHit,
        itemsFound: result.drops.length,
      });
    }
    setPhase('done');
  }, [result, addItems, addWalkRecord]);

  const reset = useCallback(() => {
    setPhase('idle');
    setStartedAt(null);
    setResult(null);
  }, []);

  return { phase, startedAt, result, startWalk, endWalk, beginReveal, finishReveal, reset };
}

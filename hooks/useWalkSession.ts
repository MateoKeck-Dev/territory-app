import { useCallback, useState } from 'react';

import { rollDrops, type InventoryItem } from '../mocks/items';
import { useGameData } from './GameDataProvider';

export type WalkSessionPhase = 'idle' | 'active' | 'recap' | 'revealing' | 'done';

export type WalkResult = {
  steps: number;
  distanceKm: number;
  activeMinutes: number;
  drops: InventoryItem[];
};

/**
 * Walk flow state machine: idle -> active -> recap -> revealing -> done.
 * Measured by steps/distance/duration only — no GPS, no routes, no map.
 *
 * TODO: once this moves off mock data, start the walk by checking
 * expo-sensors Pedometer.isAvailableAsync() and recording `startedAt`, then
 * end it with Pedometer.getStepCountAsync(startedAt, new Date()) for the
 * real step count. WalkResult's shape (steps/distanceKm/activeMinutes,
 * no coordinates) is already what that call would feed.
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
    // Mock step-counter reading — plausible numbers scaled to elapsed time,
    // not a real sensor read. See TODO above.
    const steps = elapsedMin * (90 + Math.floor(Math.random() * 40));
    const distanceKm = Math.round(steps * 0.0007 * 100) / 100;
    const walkResult: WalkResult = {
      steps,
      distanceKm,
      activeMinutes: elapsedMin,
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
        steps: result.steps,
        distanceKm: result.distanceKm,
        activeMinutes: result.activeMinutes,
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

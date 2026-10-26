import { useGameData, type StartWalkOutcome } from './GameDataProvider';
import type { WalkTrackingMode } from '../lib/walkTask';
import type { WalkSummary } from '../lib/walk/types';

export type { StartWalkOutcome, WalkTrackingMode, WalkSummary };

/**
 * Walk flow state machine: idle -> active -> recap -> revealing -> done.
 * A thin consumer of GameDataProvider's shared state — WalkStartScreen,
 * WalkActiveScreen, WalkRecapScreen, and DropRevealScreen are each a
 * separate component instance, so this state can't live in a plain
 * useState here (every screen would get its own disconnected copy).
 *
 * startWalk/endWalk delegate to lib/walkTask.ts for the real GPS
 * tracking and SQLite persistence — see that file for how distance/
 * active-minutes/route/sniff-spots/novelty get computed and why nothing
 * here ever touches the network.
 */
export function useWalkSession() {
  const {
    walkPhase: phase,
    walkId,
    walkStartedAt: startedAt,
    walkTrackingMode: trackingMode,
    walkSummary: summary,
    walkDrops: drops,
    startWalk,
    endWalk,
    simulateWalk,
    beginReveal,
    finishReveal,
    resetWalkSession: reset,
  } = useGameData();

  return {
    phase,
    walkId,
    startedAt,
    trackingMode,
    summary,
    drops,
    startWalk,
    endWalk,
    simulateWalk,
    beginReveal,
    finishReveal,
    reset,
  };
}


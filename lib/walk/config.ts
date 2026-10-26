/**
 * Every tunable number for walk tracking/scoring lives here. Change
 * behavior by changing a value here, not by hunting through
 * calculations.ts/drops.ts.
 */
export const WALK_CONFIG = {
  /** GPS fixes reporting worse (higher) accuracy than this are dropped
   * outright before any distance/active-time math runs. */
  maxAcceptableAccuracyMeters: 50,

  /** A fix implying speed faster than this since the previous accepted
   * fix is treated as an impossible jump (GPS glitch) and dropped. ~15
   * km/h is a brisk jog — well above any real dog-walking pace. */
  maxPlausibleSpeedKmh: 15,

  /** Consecutive-point movement smaller than this is GPS jitter, not real
   * movement — excluded from the distance total entirely (not merely
   * capped), so standing still doesn't slowly accumulate fake distance. */
  jitterRadiusMeters: 3,

  /** Below this instantaneous speed, time doesn't count as "active". ~0.3
   * m/s is a slow amble/sniffing pace, well below actual walking. */
  movementSpeedThresholdMs: 0.3,

  /** Speed is smoothed over a window this wide (centered on each segment)
   * before thresholding, so one noisy fix doesn't flip active/inactive. */
  activeMinutesSmoothingWindowSec: 15,

  /** Route points closer to the straight line between their neighbors
   * than this (meters) get dropped by Douglas-Peucker simplification. */
  douglasPeuckerToleranceMeters: 5,

  /** Walks under this many active minutes earn no drops. */
  minActiveMinutesForFirstDrop: 5,

  /** Every this-many additional active minutes earns one more drop,
   * on top of the first. */
  activeMinutesPerBonusDrop: 10,

  /** Walks shorter than this (in distance) AND with no active minutes are
   * not worth keeping — flagged as not meaningful rather than discarded
   * outright, so the caller decides whether to prompt or just drop it. */
  minMeaningfulDistanceMeters: 50,

  /** A walk still "active" after this long auto-ends — most likely the
   * app lost track of a stop, not a 4-hour walk. */
  maxWalkDurationMs: 4 * 60 * 60 * 1000,
};

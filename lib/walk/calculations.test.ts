import {
  computeActiveMinutes,
  computeDistanceMeters,
  computeWalkSummary,
  filterImpossibleJumps,
  haversineMeters,
  simplifyRoute,
} from './calculations';
import { WALK_CONFIG } from './config';
import type { GpsPoint } from './types';

const START_TIME = Date.parse('2026-01-01T09:00:00Z');
// Roughly meters-per-degree at mid latitudes — good enough to build
// deterministic test fixtures without re-deriving haversine by hand.
const METERS_PER_DEG_LAT = 110574;
const START_LAT = 40;
const METERS_PER_DEG_LNG = 111320 * Math.cos((START_LAT * Math.PI) / 180);

/** Walks due east from (START_LAT, 0) at a constant speed, one point every
 * `intervalSec` seconds, for `durationSec` total. */
function walkingTrack(speedMs: number, durationSec: number, intervalSec = 5, accuracy = 8): GpsPoint[] {
  const points: GpsPoint[] = [];
  for (let t = 0; t <= durationSec; t += intervalSec) {
    const distM = speedMs * t;
    points.push({
      lat: START_LAT,
      lng: distM / METERS_PER_DEG_LNG,
      timestamp: START_TIME + t * 1000,
      accuracy,
    });
  }
  return points;
}

/** Stands at one spot, GPS jittering randomly within `jitterM` meters. */
function standingStillTrack(durationSec: number, jitterM = 2.5, intervalSec = 5): GpsPoint[] {
  const points: GpsPoint[] = [];
  let seed = 42;
  const rand = () => {
    // Deterministic pseudo-random so the test is stable across runs.
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let t = 0; t <= durationSec; t += intervalSec) {
    const angle = rand() * 2 * Math.PI;
    const radius = rand() * jitterM;
    points.push({
      lat: START_LAT + (Math.sin(angle) * radius) / METERS_PER_DEG_LAT,
      lng: (Math.cos(angle) * radius) / METERS_PER_DEG_LNG,
      timestamp: START_TIME + t * 1000,
      accuracy: 6,
    });
  }
  return points;
}

describe('haversineMeters', () => {
  it('is ~0 for the same point', () => {
    expect(haversineMeters({ lat: 40, lng: 0 }, { lat: 40, lng: 0 })).toBeCloseTo(0, 3);
  });

  it('matches a known distance within a small tolerance', () => {
    // 1 degree of longitude at the equator is ~111.32 km.
    const d = haversineMeters({ lat: 0, lng: 0 }, { lat: 0, lng: 1 });
    expect(d).toBeGreaterThan(111000);
    expect(d).toBeLessThan(111500);
  });
});

describe('computeDistanceMeters — standing still (jitter)', () => {
  const track = standingStillTrack(120); // 2 minutes of GPS noise, no real movement

  it('does not accumulate meaningful distance from jitter alone', () => {
    const distance = computeDistanceMeters(track, WALK_CONFIG);
    // Any single jitter step is well under the real walking distance a
    // 2-minute walk would cover (tens of meters), even if a few noisy
    // segments slip past the per-segment threshold.
    expect(distance).toBeLessThan(15);
  });
});

describe('computeDistanceMeters / computeActiveMinutes — normal walk', () => {
  // ~1.2 m/s is a comfortable dog-walking pace (~4.3 km/h).
  const track = walkingTrack(1.2, 600); // 10 minutes

  it('reports distance close to speed * time', () => {
    const distance = computeDistanceMeters(track, WALK_CONFIG);
    expect(distance).toBeGreaterThan(680);
    expect(distance).toBeLessThan(740);
  });

  it('counts nearly all of a steady walk as active', () => {
    const activeMinutes = computeActiveMinutes(track, WALK_CONFIG);
    expect(activeMinutes).toBeGreaterThan(9);
    expect(activeMinutes).toBeLessThanOrEqual(10);
  });
});

describe('filterImpossibleJumps — GPS glitch', () => {
  it('drops a single impossible jump without poisoning the rest of the track', () => {
    const track = walkingTrack(1.2, 300); // 5 minutes of normal walking
    const glitchIndex = Math.floor(track.length / 2);
    const glitched: GpsPoint[] = [...track];
    // Teleport 2km away for one fix, one second after the previous one —
    // implies ~7200 km/h, then the next real fix resumes the normal path.
    glitched.splice(glitchIndex, 0, {
      lat: track[glitchIndex].lat,
      lng: track[glitchIndex].lng + 2000 / METERS_PER_DEG_LNG,
      timestamp: track[glitchIndex].timestamp + 1000,
      accuracy: 10,
    });

    const cleaned = filterImpossibleJumps(glitched, WALK_CONFIG);

    expect(cleaned).toHaveLength(track.length);
    const distance = computeDistanceMeters(cleaned, WALK_CONFIG);
    const expectedDistance = computeDistanceMeters(track, WALK_CONFIG);
    expect(Math.abs(distance - expectedDistance)).toBeLessThan(5);
  });

  it('drops points with a non-positive time delta', () => {
    const base = walkingTrack(1.2, 60);
    const withDuplicateTimestamp: GpsPoint[] = [
      base[0],
      { ...base[1], timestamp: base[0].timestamp }, // same instant as the previous fix
      base[2],
    ];
    const cleaned = filterImpossibleJumps(withDuplicateTimestamp, WALK_CONFIG);
    expect(cleaned).toEqual([base[0], base[2]]);
  });
});

describe('simplifyRoute', () => {
  it('keeps a straight line down to its two endpoints', () => {
    const track = walkingTrack(1.2, 300);
    const simplified = simplifyRoute(track, WALK_CONFIG.douglasPeuckerToleranceMeters);
    expect(simplified).toHaveLength(2);
    expect(simplified[0]).toEqual(track[0]);
    expect(simplified[simplified.length - 1]).toEqual(track[track.length - 1]);
  });

  it('never returns more points than it was given', () => {
    const track = standingStillTrack(120);
    const simplified = simplifyRoute(track, WALK_CONFIG.douglasPeuckerToleranceMeters);
    expect(simplified.length).toBeLessThanOrEqual(track.length);
  });
});

describe('computeWalkSummary — very short walk', () => {
  it('flags a walk with no real movement at all as not meaningful', () => {
    // Started and immediately ended, or stood still the whole time —
    // the degenerate case the guard exists for, distinct from "short but
    // real" below.
    const track = standingStillTrack(10);
    const summary = computeWalkSummary(track, WALK_CONFIG);
    expect(summary.meaningful).toBe(false);
  });

  it('still counts a short-but-real walk as meaningful, just not drop-worthy', () => {
    const track = walkingTrack(1.2, 20, 5); // ~24m over 20s of real movement
    const summary = computeWalkSummary(track, WALK_CONFIG);
    expect(summary.meaningful).toBe(true);
    // Rounds to 0 active minutes — well under the 5-minute drop threshold,
    // which is the mechanism that keeps a walk this short from earning
    // anything, not the meaningful guard.
    expect(summary.activeMinutes).toBe(0);
  });

  it('stubs sniffSpotsHit and routeNovelty', () => {
    const track = walkingTrack(1.2, 600);
    const summary = computeWalkSummary(track, WALK_CONFIG);
    expect(summary.sniffSpotsHit).toBe(0);
    expect(summary.routeNovelty).toBeNull();
  });
});

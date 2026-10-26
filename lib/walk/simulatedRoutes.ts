import type { GpsPoint } from './types';

/**
 * Dev-only scripted GPS tracks for exercising the real pipeline
 * (lib/walkTask.ts's simulateWalk, which runs these through the exact
 * same ingestPoint/endWalk code a real walk uses) without needing to
 * actually walk anywhere — see WalkStartScreen's dev-only buttons.
 */

const METERS_PER_DEG_LAT = 110574;
const BASE_LAT = 37.7749; // San Francisco-ish, arbitrary
const METERS_PER_DEG_LNG = 111320 * Math.cos((BASE_LAT * Math.PI) / 180);

function straightWalk(speedMs: number, durationSec: number, intervalSec = 10): GpsPoint[] {
  const startedAt = Date.now() - durationSec * 1000;
  const points: GpsPoint[] = [];
  for (let t = 0; t <= durationSec; t += intervalSec) {
    const distM = speedMs * t;
    // A gentle curve, not a perfectly straight line, so the route doodle
    // has some shape to it.
    const curveM = Math.sin(t / 60) * 15;
    points.push({
      lat: BASE_LAT + curveM / METERS_PER_DEG_LAT,
      lng: distM / METERS_PER_DEG_LNG,
      timestamp: startedAt + t * 1000,
      accuracy: 8,
    });
  }
  return points;
}

export type SimulatedRoute = { id: string; label: string; points: GpsPoint[] };

export const simulatedRoutes: SimulatedRoute[] = [
  {
    id: 'too-short',
    label: 'Too short (1 min, no drops)',
    points: straightWalk(1.1, 60),
  },
  {
    id: 'normal',
    label: 'Normal walk (15 min, 2 drops)',
    points: straightWalk(1.2, 900),
  },
  {
    id: 'long',
    label: 'Long walk (45 min, 5 drops)',
    points: straightWalk(1.3, 2700),
  },
];

import { WALK_CONFIG } from './config';
import type { GpsPoint, WalkSummary } from './types';

const EARTH_RADIUS_M = 6371000;

export function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Drops fixes with worse accuracy than config allows. Doesn't look at
 * neighbors — a cheap first pass before anything order-dependent runs. */
export function filterByAccuracy(
  points: GpsPoint[],
  config: typeof WALK_CONFIG = WALK_CONFIG,
): GpsPoint[] {
  return points.filter(
    (p) => p.accuracy == null || p.accuracy <= config.maxAcceptableAccuracyMeters,
  );
}

/** Drops fixes implying an impossible speed since the last ACCEPTED fix
 * (a glitchy fix rejected here doesn't poison comparisons for the next
 * one — distance/time is measured from the last good fix, not the last
 * raw one). Also drops anything with a non-positive or missing time
 * delta (out-of-order or duplicate timestamps). */
export function filterImpossibleJumps(
  points: GpsPoint[],
  config: typeof WALK_CONFIG = WALK_CONFIG,
): GpsPoint[] {
  if (points.length === 0) return [];
  const result: GpsPoint[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = result[result.length - 1];
    const curr = points[i];
    const dtSec = (curr.timestamp - prev.timestamp) / 1000;
    if (dtSec <= 0) continue;
    const speedKmh = (haversineMeters(prev, curr) / dtSec) * 3.6;
    if (speedKmh > config.maxPlausibleSpeedKmh) continue;
    result.push(curr);
  }
  return result;
}

/** Sums distance between consecutive points, excluding any segment
 * shorter than the jitter radius entirely (not clamped to zero and
 * added — genuinely not counted), so a stationary dog's GPS noise
 * doesn't slowly add up into fake distance over a long walk. */
export function computeDistanceMeters(
  points: GpsPoint[],
  config: typeof WALK_CONFIG = WALK_CONFIG,
): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const segment = haversineMeters(points[i - 1], points[i]);
    if (segment >= config.jitterRadiusMeters) {
      total += segment;
    }
  }
  return total;
}

/**
 * Minutes spent actually moving. A segment counts only if the
 * *smoothed* speed around it (weighted average over a short window
 * centered on it, not just its own instantaneous value) clears the
 * movement threshold — avoids flickering active/inactive from one noisy
 * fix, and means standing around (even if GPS jitters a little) earns
 * close to nothing.
 */
export function computeActiveMinutes(
  points: GpsPoint[],
  config: typeof WALK_CONFIG = WALK_CONFIG,
): number {
  type Segment = { midTimestamp: number; dtSec: number; speedMs: number };
  const segments: Segment[] = [];

  for (let i = 1; i < points.length; i++) {
    const dtSec = (points[i].timestamp - points[i - 1].timestamp) / 1000;
    if (dtSec <= 0) continue;
    const distM = haversineMeters(points[i - 1], points[i]);
    // Same jitter floor as computeDistanceMeters: a sub-jitter-radius
    // segment is GPS noise, not movement, so it must not read as "fast"
    // just because it covered a couple of meters in a couple of seconds.
    // Without this, standing still can register as active purely from
    // noise landing near the speed threshold.
    const effectiveDistM = distM >= config.jitterRadiusMeters ? distM : 0;
    segments.push({
      midTimestamp: (points[i].timestamp + points[i - 1].timestamp) / 2,
      dtSec,
      speedMs: effectiveDistM / dtSec,
    });
  }

  const halfWindowMs = (config.activeMinutesSmoothingWindowSec * 1000) / 2;
  let activeSec = 0;

  for (const segment of segments) {
    const windowSegments = segments.filter(
      (s) => Math.abs(s.midTimestamp - segment.midTimestamp) <= halfWindowMs,
    );
    const totalDt = windowSegments.reduce((sum, s) => sum + s.dtSec, 0);
    const smoothedSpeed =
      totalDt > 0
        ? windowSegments.reduce((sum, s) => sum + s.speedMs * s.dtSec, 0) / totalDt
        : 0;

    if (smoothedSpeed >= config.movementSpeedThresholdMs) {
      activeSec += segment.dtSec;
    }
  }

  return activeSec / 60;
}

function perpendicularDistanceMeters(point: GpsPoint, lineStart: GpsPoint, lineEnd: GpsPoint): number {
  // Small-scale equirectangular projection centered on lineStart — fine
  // at walk scale, not meant for long distances.
  const latRad = (lineStart.lat * Math.PI) / 180;
  const metersPerDegLat = 110574;
  const metersPerDegLng = 111320 * Math.cos(latRad);

  const toXY = (p: GpsPoint) => ({
    x: (p.lng - lineStart.lng) * metersPerDegLng,
    y: (p.lat - lineStart.lat) * metersPerDegLat,
  });

  const p = toXY(point);
  const a = { x: 0, y: 0 };
  const b = toXY(lineEnd);

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) {
    return Math.hypot(p.x - a.x, p.y - a.y);
  }

  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy);
  const closestX = a.x + t * dx;
  const closestY = a.y + t * dy;
  return Math.hypot(p.x - closestX, p.y - closestY);
}

/** Standard Douglas-Peucker polyline simplification. Keeps only the
 * points needed to redraw the route's shape within tolerance — for the
 * recap doodle and history, not for distance math (run this on already
 * distance-computed points, never the other way around). */
export function simplifyRoute(
  points: GpsPoint[],
  toleranceMeters: number = WALK_CONFIG.douglasPeuckerToleranceMeters,
): GpsPoint[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIndex = 0;
  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistanceMeters(points[i], first, last);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }

  if (maxDist > toleranceMeters) {
    const left = simplifyRoute(points.slice(0, maxIndex + 1), toleranceMeters);
    const right = simplifyRoute(points.slice(maxIndex), toleranceMeters);
    return [...left.slice(0, -1), ...right];
  }
  return [first, last];
}

/**
 * The whole pipeline: raw on-device points in, a clean summary out.
 * sniffSpotsHit and routeNovelty are V2 stubs (0 / null) — see the TODOs
 * below for what they need — but the shape is final so wiring a real
 * implementation in later doesn't touch any caller.
 */
export function computeWalkSummary(
  rawPoints: GpsPoint[],
  config: typeof WALK_CONFIG = WALK_CONFIG,
): WalkSummary {
  const accurate = filterByAccuracy(rawPoints, config);
  const clean = filterImpossibleJumps(accurate, config);

  const distanceM = computeDistanceMeters(clean, config);
  const activeMinutes = computeActiveMinutes(clean, config);
  const simplifiedRoute = simplifyRoute(clean, config.douglasPeuckerToleranceMeters);

  return {
    distanceM: Math.round(distanceM),
    activeMinutes: Math.round(activeMinutes),
    // TODO V2: sniff spots — detect clusters of low-speed dwelling (several
    // consecutive points within a small radius for 10s+) along `clean`.
    sniffSpotsHit: 0,
    // TODO V2: route novelty — compare `simplifiedRoute` against past
    // walks' simplified routes (e.g. a grid-cell overlap ratio) to decide
    // 'new' vs 'regular'.
    routeNovelty: null,
    simplifiedRoute,
    meaningful: distanceM >= config.minMeaningfulDistanceMeters || activeMinutes > 0,
  };
}

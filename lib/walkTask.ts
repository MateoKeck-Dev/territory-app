import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { computeWalkSummary, haversineMeters } from './walk/calculations';
import { WALK_CONFIG } from './walk/config';
import * as walkDb from './walk/db';
import { rollDropsForWalk } from './walk/drops';
import type { GpsPoint, WalkSummary } from './walk/types';
import type { InventoryItem } from '../mocks/items';

export const WALK_LOCATION_TASK = 'territory-walk-location-task';

/**
 * 'background' = TaskManager-backed tracking that keeps delivering fixes
 * with the screen locked and the app backgrounded. Requires "Always"
 * location authorization — see requestWalkPermissions' doc comment for
 * why that's unavoidable here, not a shortcut we took.
 * 'foreground' = the permission-denied/Expo-Go fallback: the caller must
 * run its own watchPositionAsync subscription and feed points to
 * ingestPoint itself; tracking stops the moment the app backgrounds.
 */
export type WalkTrackingMode = 'background' | 'foreground';

// ---------------------------------------------------------------------------
// Privacy: every function in this file that touches the network is named
// and visible above. There is none. Raw points go into appendPoints below
// (local SQLite) and nowhere else. The only thing that will ever leave the
// device is the WalkSummary a future task syncs — distance/active-minutes/
// sniff-spots/route-novelty, never a coordinate.
// ---------------------------------------------------------------------------

// ---- active walk id -------------------------------------------------------
// Module-level, not component state: the background TaskManager callback
// has no mounted screen to read state from. Lazily restored from the DB
// (rather than, say, expo-sqlite/kv-store) on first use each process,
// since "is there an unfinished walk" is already stored there as the
// single source of truth — see walk/db.ts's getUnfinishedWalk.
let activeWalkId: string | null = null;
let activeWalkIdChecked = false;

async function resolveActiveWalkId(): Promise<string | null> {
  if (activeWalkId !== null || activeWalkIdChecked) return activeWalkId;
  activeWalkIdChecked = true;
  const unfinished = await walkDb.getUnfinishedWalk();
  activeWalkId = unfinished?.id ?? null;
  return activeWalkId;
}

function setActiveWalkId(id: string | null) {
  activeWalkId = id;
  activeWalkIdChecked = true;
}

// ---- live distance preview ------------------------------------------------
// A cheap, incremental echo of computeDistanceMeters' filtering (accuracy,
// implausible jumps, jitter floor) applied point-by-point, purely so
// WalkActiveScreen has something to show while the walk is in progress.
// Not the source of truth — computeWalkSummary re-derives everything from
// the stored raw points when the walk ends.
let lastAcceptedPoint: GpsPoint | null = null;
let liveDistanceMeters = 0;

export function getLiveDistanceMeters(): number {
  return liveDistanceMeters;
}

export function resetLiveTracking(): void {
  lastAcceptedPoint = null;
  liveDistanceMeters = 0;
}

function updateLiveDistance(point: GpsPoint, config = WALK_CONFIG) {
  if (point.accuracy != null && point.accuracy > config.maxAcceptableAccuracyMeters) return;

  if (lastAcceptedPoint) {
    const dtSec = (point.timestamp - lastAcceptedPoint.timestamp) / 1000;
    if (dtSec <= 0) return;
    const distM = haversineMeters(lastAcceptedPoint, point);
    const speedKmh = (distM / dtSec) * 3.6;
    if (speedKmh > config.maxPlausibleSpeedKmh) return; // glitch — don't move lastAcceptedPoint either
    if (distM >= config.jitterRadiusMeters) {
      liveDistanceMeters += distM;
    }
  }
  lastAcceptedPoint = point;
}

// ---- point ingestion --------------------------------------------------
/**
 * Shared entry point for a single GPS fix, used by the background
 * TaskManager task below, a foreground watchPositionAsync subscription
 * (the permission-denied/Expo Go fallback), and the dev-only simulated
 * walk. Writes straight to local SQLite — never buffered for a network
 * call, there is no such call in this file.
 */
export async function ingestPoint(point: GpsPoint): Promise<void> {
  const walkId = await resolveActiveWalkId();
  if (!walkId) return; // no active walk — nothing to attach this point to
  updateLiveDistance(point);
  await walkDb.appendPoints(walkId, [point]);
}

type LocationTaskData = { locations: Location.LocationObject[] };

TaskManager.defineTask<LocationTaskData>(WALK_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.warn('[walk] location task error:', error.message);
    return;
  }
  const walkId = await resolveActiveWalkId();
  if (!walkId) return;

  for (const loc of data?.locations ?? []) {
    await ingestPoint({
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
      timestamp: loc.timestamp,
      accuracy: loc.coords.accuracy ?? null,
    });
  }

  // Safety net for the purely-backgrounded case: if the app never comes
  // back to the foreground (so nothing else is checking elapsed time),
  // this callback is still the one place guaranteed to run periodically
  // while tracking is active. Auto-end rather than track indefinitely.
  const unfinished = await walkDb.getUnfinishedWalk();
  if (unfinished && Date.now() - unfinished.startedAt > WALK_CONFIG.maxWalkDurationMs) {
    await endWalk(unfinished.id, 'background').catch((err) =>
      console.warn('[walk] auto-end after max duration failed:', err),
    );
  }
});

// ---- permissions ------------------------------------------------------
export type PermissionResult =
  | { granted: true; mode: WalkTrackingMode }
  | { granted: false; mode: null };

/**
 * "Always" is genuinely required here, not a default we reached for:
 * expo-location's background task (startLocationUpdatesAsync) sets
 * CLLocationManager.allowsBackgroundLocationUpdates = true unconditionally
 * on iOS, and that flag only functions with "Always" authorization —
 * with only "When In Use", iOS simply stops delivering fixes once the
 * screen locks or the app backgrounds, confirmed against expo-location's
 * own native source (ios/TaskConsumers/EXLocationTaskConsumer.m) and
 * docs. There's no "When In Use" + active-session trick available
 * through expo-location's JS API that avoids this — it would need custom
 * native code. So: request "When In Use" first (always required as the
 * first step on iOS), then "Always"; if "Always" is refused, fall back to
 * foreground-only tracking rather than failing outright.
 *
 * Android has no equivalent problem: a foreground service (visible
 * notification, started in startBackgroundTracking below) keeps location
 * flowing in the background without needing the scarier
 * ACCESS_BACKGROUND_LOCATION permission at all — see app.json, which
 * deliberately does not request it.
 */
export async function requestWalkPermissions(): Promise<PermissionResult> {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== 'granted') return { granted: false, mode: null };

  try {
    const background = await Location.requestBackgroundPermissionsAsync();
    if (background.status === 'granted') return { granted: true, mode: 'background' };
  } catch (err) {
    console.warn('[walk] background permission request failed, using foreground-only:', err);
  }
  return { granted: true, mode: 'foreground' };
}

// ---- background tracking lifecycle ------------------------------------
export async function startBackgroundTracking(dogName: string): Promise<void> {
  await Location.startLocationUpdatesAsync(WALK_LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    activityType: Location.ActivityType.Fitness,
    // Meters/milliseconds chosen for a walking pace at reasonable battery
    // cost: a dog walk rarely benefits from a fix more often than this.
    timeInterval: 10000,
    distanceInterval: 15,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Territory',
      notificationBody: `Walking with ${dogName}`,
    },
  });
}

export async function stopBackgroundTracking(): Promise<void> {
  const started = await Location.hasStartedLocationUpdatesAsync(WALK_LOCATION_TASK).catch(() => false);
  if (started) {
    await Location.stopLocationUpdatesAsync(WALK_LOCATION_TASK);
  }
}

// ---- walk session orchestration ----------------------------------------
function generateWalkId(): string {
  return `walk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type StartWalkResult =
  | { ok: true; walkId: string; startedAt: number; trackingMode: WalkTrackingMode }
  | { ok: false; reason: 'permission_denied' };

export async function startWalk(dogName: string): Promise<StartWalkResult> {
  const permission = await requestWalkPermissions();
  if (!permission.granted) return { ok: false, reason: 'permission_denied' };

  const walkId = generateWalkId();
  const startedAt = Date.now();
  resetLiveTracking();
  await walkDb.createWalk(walkId, startedAt);
  setActiveWalkId(walkId);

  if (permission.mode === 'background') {
    await startBackgroundTracking(dogName);
  }
  // Foreground mode: the caller (HomeScreen) is responsible for starting
  // its own watchPositionAsync subscription and calling ingestPoint.

  return { ok: true, walkId, startedAt, trackingMode: permission.mode };
}

export type EndWalkResult = { summary: WalkSummary; drops: InventoryItem[] };

export async function endWalk(walkId: string, trackingMode: WalkTrackingMode): Promise<EndWalkResult> {
  if (trackingMode === 'background') {
    await stopBackgroundTracking().catch((err) =>
      console.warn('[walk] failed to stop background tracking:', err),
    );
  }

  const rawPoints = await walkDb.getWalkPoints(walkId);
  const summary = computeWalkSummary(rawPoints, WALK_CONFIG);
  const drops = summary.meaningful ? rollDropsForWalk(summary, WALK_CONFIG) : [];
  const endedAt = Date.now();

  await walkDb.finalizeWalk(walkId, {
    endedAt,
    distanceM: summary.distanceM,
    activeMinutes: summary.activeMinutes,
    sniffSpotsHit: summary.sniffSpotsHit,
    routeNovelty: summary.routeNovelty,
    simplifiedRoute: summary.simplifiedRoute,
    drops,
    meaningful: summary.meaningful,
  });

  setActiveWalkId(null);
  resetLiveTracking();

  return { summary, drops };
}

export async function discardWalk(walkId: string): Promise<void> {
  await stopBackgroundTracking().catch(() => {});
  await walkDb.discardWalk(walkId);
  setActiveWalkId(null);
  resetLiveTracking();
}

/**
 * Called once at app start. Finds a walk that never got an end (app was
 * killed mid-walk) — if it's already past the max-duration guard, there's
 * nothing useful to resume, so it's auto-finalized silently instead of
 * prompting. Otherwise the caller should offer resume-or-end.
 */
export async function checkForUnfinishedWalk(): Promise<walkDb.UnfinishedWalk | null> {
  const unfinished = await walkDb.getUnfinishedWalk();
  if (!unfinished) return null;

  if (Date.now() - unfinished.startedAt > WALK_CONFIG.maxWalkDurationMs) {
    await endWalk(unfinished.id, 'background').catch((err) =>
      console.warn('[walk] auto-end of a stale unfinished walk failed:', err),
    );
    return null;
  }

  setActiveWalkId(unfinished.id);
  return unfinished;
}

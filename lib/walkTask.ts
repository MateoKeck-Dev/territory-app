import AsyncStorage from 'expo-sqlite/kv-store';
import type * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { uploadWalkPoints, type WalkPointInput } from './api';
import { supabase } from './supabase';

export const WALK_LOCATION_TASK = 'territory-walk-location-task';

const ACTIVE_WALK_KEY = 'territory.activeWalkId';
const FLUSH_THRESHOLD = 20;
const EARTH_RADIUS_M = 6371000;

// Module-level state, not component state: this file is imported once from
// index.ts so TaskManager's background callback (which can run with no
// screen mounted) and the live walk screen share the same buffer/counters.
let pointBuffer: WalkPointInput[] = [];
let flushing = false;
let lastPoint: { lat: number; lng: number } | null = null;
let trackedDistanceMeters = 0;

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

function recordPoint(point: WalkPointInput) {
  pointBuffer.push(point);
  if (lastPoint) {
    trackedDistanceMeters += haversineMeters(lastPoint, point);
  }
  lastPoint = { lat: point.lat, lng: point.lng };
}

export function getTrackedDistanceMeters(): number {
  return trackedDistanceMeters;
}

/** Call when starting a fresh walk and once after it ends. */
export function resetWalkTracking() {
  pointBuffer = [];
  lastPoint = null;
  trackedDistanceMeters = 0;
}

export async function setActiveWalkId(walkId: string | null) {
  if (walkId) {
    await AsyncStorage.setItem(ACTIVE_WALK_KEY, walkId);
  } else {
    await AsyncStorage.removeItem(ACTIVE_WALK_KEY);
  }
}

async function getActiveWalkId(): Promise<string | null> {
  return AsyncStorage.getItem(ACTIVE_WALK_KEY);
}

/**
 * Sends whatever's buffered. Re-fetches the session token fresh each time
 * (rather than caching it) so this still works if the background task's JS
 * context was relaunched headless and lost any in-memory token.
 */
export async function flushBufferedPoints(): Promise<void> {
  if (flushing || pointBuffer.length === 0) return;

  const walkId = await getActiveWalkId();
  if (!walkId) {
    pointBuffer = [];
    return;
  }

  flushing = true;
  const toSend = pointBuffer;
  pointBuffer = [];
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('no active session');
    await uploadWalkPoints(token, walkId, toSend);
  } catch (err) {
    // Couldn't send: put them back so nothing's lost, next flush retries.
    pointBuffer = [...toSend, ...pointBuffer];
    console.warn('[walk] failed to flush points, will retry:', err);
  } finally {
    flushing = false;
  }
}

type LocationTaskData = { locations: Location.LocationObject[] };

TaskManager.defineTask<LocationTaskData>(WALK_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.warn('[walk] location task error:', error.message);
    return;
  }
  for (const loc of data?.locations ?? []) {
    recordPoint({
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
      recorded_at: new Date(loc.timestamp).toISOString(),
    });
  }
  if (pointBuffer.length >= FLUSH_THRESHOLD) {
    await flushBufferedPoints();
  }
});

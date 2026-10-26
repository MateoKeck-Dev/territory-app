import * as SQLite from 'expo-sqlite';

import type { InventoryItem } from '../../mocks/items';
import type { GpsPoint, RouteNovelty } from './types';

const DB_NAME = 'territory_walks.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME).then(async (db) => {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS walks (
          id TEXT PRIMARY KEY,
          started_at INTEGER NOT NULL,
          tracking_mode TEXT NOT NULL,
          ended_at INTEGER,
          distance_m REAL,
          active_minutes REAL,
          sniff_spots_hit INTEGER,
          route_novelty TEXT,
          simplified_route TEXT,
          drops TEXT,
          meaningful INTEGER,
          synced INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS walk_points (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          walk_id TEXT NOT NULL REFERENCES walks(id) ON DELETE CASCADE,
          lat REAL NOT NULL,
          lng REAL NOT NULL,
          timestamp INTEGER NOT NULL,
          accuracy REAL
        );

        CREATE INDEX IF NOT EXISTS idx_walk_points_walk ON walk_points(walk_id);
      `);
      return db;
    });
  }
  return dbPromise;
}

export async function createWalk(
  id: string,
  startedAt: number,
  trackingMode: 'background' | 'foreground',
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO walks (id, started_at, tracking_mode, synced) VALUES (?, ?, ?, 0)',
    id,
    startedAt,
    trackingMode,
  );
}

/** Points are written as they arrive (not buffered in memory) so a walk's
 * track survives the app being killed mid-walk. */
export async function appendPoints(walkId: string, points: GpsPoint[]): Promise<void> {
  if (points.length === 0) return;
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const p of points) {
      await db.runAsync(
        'INSERT INTO walk_points (walk_id, lat, lng, timestamp, accuracy) VALUES (?, ?, ?, ?, ?)',
        walkId,
        p.lat,
        p.lng,
        p.timestamp,
        p.accuracy,
      );
    }
  });
}

export async function getWalkPoints(walkId: string): Promise<GpsPoint[]> {
  const db = await getDb();
  return db.getAllAsync<GpsPoint>(
    'SELECT lat, lng, timestamp, accuracy FROM walk_points WHERE walk_id = ? ORDER BY timestamp ASC',
    walkId,
  );
}

export async function countWalkPoints(walkId: string): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM walk_points WHERE walk_id = ?',
    walkId,
  );
  return row?.count ?? 0;
}

type FinalizeInput = {
  endedAt: number;
  distanceM: number;
  activeMinutes: number;
  sniffSpotsHit: number;
  routeNovelty: RouteNovelty | null;
  simplifiedRoute: GpsPoint[];
  drops: InventoryItem[];
  meaningful: boolean;
};

/** Stores the computed summary + simplified route, then clears the raw
 * points — only the simplified route is kept after this, per the privacy/
 * storage rule of not holding onto a dense GPS track longer than needed. */
export async function finalizeWalk(walkId: string, input: FinalizeInput): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE walks SET
        ended_at = ?, distance_m = ?, active_minutes = ?, sniff_spots_hit = ?,
        route_novelty = ?, simplified_route = ?, drops = ?, meaningful = ?
       WHERE id = ?`,
      input.endedAt,
      input.distanceM,
      input.activeMinutes,
      input.sniffSpotsHit,
      input.routeNovelty,
      JSON.stringify(input.simplifiedRoute),
      JSON.stringify(input.drops),
      input.meaningful ? 1 : 0,
      walkId,
    );
    await db.runAsync('DELETE FROM walk_points WHERE walk_id = ?', walkId);
  });
}

export async function discardWalk(walkId: string): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM walk_points WHERE walk_id = ?', walkId);
    await db.runAsync('DELETE FROM walks WHERE id = ?', walkId);
  });
}

export type UnfinishedWalk = {
  id: string;
  startedAt: number;
  trackingMode: 'background' | 'foreground';
};

/** At most one of these should ever exist — the app only ever starts one
 * walk at a time — but if the app was killed mid-walk, this is how the
 * next launch finds it to offer resume-or-end. */
export async function getUnfinishedWalk(): Promise<UnfinishedWalk | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{
    id: string;
    started_at: number;
    tracking_mode: 'background' | 'foreground';
  }>('SELECT id, started_at, tracking_mode FROM walks WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1');
  return row ? { id: row.id, startedAt: row.started_at, trackingMode: row.tracking_mode } : null;
}

export type StoredWalk = {
  id: string;
  startedAt: number;
  endedAt: number;
  distanceM: number;
  activeMinutes: number;
  sniffSpotsHit: number;
  routeNovelty: RouteNovelty | null;
  simplifiedRoute: GpsPoint[];
  drops: InventoryItem[];
  meaningful: boolean;
  synced: boolean;
};

type WalkRow = {
  id: string;
  started_at: number;
  ended_at: number;
  distance_m: number;
  active_minutes: number;
  sniff_spots_hit: number;
  route_novelty: RouteNovelty | null;
  simplified_route: string;
  drops: string;
  meaningful: number;
  synced: number;
};

function rowToStoredWalk(row: WalkRow): StoredWalk {
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    distanceM: row.distance_m,
    activeMinutes: row.active_minutes,
    sniffSpotsHit: row.sniff_spots_hit,
    routeNovelty: row.route_novelty,
    simplifiedRoute: JSON.parse(row.simplified_route ?? '[]'),
    drops: JSON.parse(row.drops ?? '[]'),
    meaningful: row.meaningful === 1,
    synced: row.synced === 1,
  };
}

export async function listFinishedWalks(limit = 20): Promise<StoredWalk[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<WalkRow>(
    'SELECT * FROM walks WHERE ended_at IS NOT NULL ORDER BY started_at DESC LIMIT ?',
    limit,
  );
  return rows.map(rowToStoredWalk);
}

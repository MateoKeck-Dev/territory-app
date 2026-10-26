/** One raw GPS fix, as read off the device. Never leaves the phone. */
export type GpsPoint = {
  lat: number;
  lng: number;
  /** ms since epoch. */
  timestamp: number;
  /** Horizontal accuracy in meters, lower is better. null if unknown. */
  accuracy: number | null;
};

export type RouteNovelty = 'new' | 'regular';

/**
 * What a walk reduces to once it's over. This is the whole payload a
 * future server sync will send — distance_m/active_minutes/
 * sniff_spots_hit/route_novelty, nothing else. No coordinates.
 */
export type WalkSummary = {
  distanceM: number;
  activeMinutes: number;
  /** V2 stub — see lib/walk/calculations.ts. */
  sniffSpotsHit: number;
  /** V2 stub — see lib/walk/calculations.ts. */
  routeNovelty: RouteNovelty | null;
  /** Douglas-Peucker-simplified route, kept locally for the recap doodle
   * and history — not part of what would sync to a server. */
  simplifiedRoute: GpsPoint[];
  /** False if the walk was too short/motionless to be worth keeping. */
  meaningful: boolean;
};

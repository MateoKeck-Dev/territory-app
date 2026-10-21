import { Platform } from 'react-native';

/**
 * territory-api base URL. Comes from EXPO_PUBLIC_API_URL in .env.
 *
 * NOTE: on a physical phone (Expo Go), "localhost" points at the *phone*, not
 * your laptop. Set EXPO_PUBLIC_API_URL to your laptop's LAN IP, e.g.
 * http://192.168.1.184:8000, and make sure the API is bound to 0.0.0.0.
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000').replace(
  /\/+$/,
  '',
);

if (
  Platform.OS !== 'web' &&
  /(localhost|127\.0\.0\.1)/.test(API_URL)
) {
  console.warn(
    `[territory-app] EXPO_PUBLIC_API_URL is "${API_URL}". A physical device ` +
      `can't reach your laptop via localhost — use the laptop's LAN IP instead.`,
  );
}

export type Dog = {
  id: string;
  owner_id: string;
  name: string;
  breed: string | null;
  color_hex: string | null;
  avatar_id: string | null;
  created_at: string;
};

export type DogCreateInput = {
  name: string;
  breed?: string | null;
  color_hex?: string | null;
  avatar_id?: string | null;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Pull a human-readable message out of a FastAPI error body. */
function messageFromBody(status: number, body: unknown): string {
  if (body && typeof body === 'object' && 'detail' in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string };
      if (first?.msg) return first.msg;
    }
  }
  return `Request failed (HTTP ${status}).`;
}

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });
  } catch (err) {
    throw new ApiError(
      `Could not reach the API at ${API_URL}. Is the backend running and the ` +
        `URL reachable from this device?`,
      0,
    );
  }

  const text = await res.text();
  const body = text ? safeJson(text) : null;

  if (!res.ok) {
    throw new ApiError(messageFromBody(res.status, body), res.status);
  }
  return body as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function listMyDogs(token: string): Promise<Dog[]> {
  return request<Dog[]>('/dogs/me', token, { method: 'GET' });
}

export function createDog(token: string, input: DogCreateInput): Promise<Dog> {
  return request<Dog>('/dogs', token, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export type WalkPointInput = { lat: number; lng: number; recorded_at: string };

export type WalkStartResponse = { id: string; started_at: string };

export type WalkPointsResponse = { points_saved: number };

export type WalkSummary = {
  distance_meters: number;
  newly_claimed_cells: number;
  total_area_sq_meters: number;
  flavor_text: string;
};

export type WalkDiscardResponse = { id: string; status: string };

export function startWalk(token: string, dogId: string): Promise<WalkStartResponse> {
  return request<WalkStartResponse>('/walks/start', token, {
    method: 'POST',
    body: JSON.stringify({ dog_id: dogId }),
  });
}

export function uploadWalkPoints(
  token: string,
  walkId: string,
  points: WalkPointInput[],
): Promise<WalkPointsResponse> {
  return request<WalkPointsResponse>(`/walks/${walkId}/points`, token, {
    method: 'POST',
    body: JSON.stringify({ points }),
  });
}

export function endWalk(token: string, walkId: string): Promise<WalkSummary> {
  return request<WalkSummary>(`/walks/${walkId}/end`, token, { method: 'POST' });
}

export function discardWalk(token: string, walkId: string): Promise<WalkDiscardResponse> {
  return request<WalkDiscardResponse>(`/walks/${walkId}/discard`, token, { method: 'POST' });
}

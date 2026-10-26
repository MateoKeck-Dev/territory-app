# TODO

## Walk tracking — what's done, what's next

Done (this branch, `walk-tracking`): real on-device GPS tracking end to
end. `lib/walkTask.ts` requests location permission (foreground, then
background) and runs a TaskManager background task (or a foreground
`watchPositionAsync` fallback when background is denied/unavailable, e.g.
Expo Go). Raw points are written straight to local SQLite
(`lib/walk/db.ts`) as they arrive — never buffered for a network call,
because there is no network call. `lib/walk/calculations.ts` turns stored
points into a summary (distance, active minutes, a simplified route) with
unit-tested filtering for GPS jitter, accuracy, and impossible-speed
glitches; `lib/walk/drops.ts` rolls item drops from that summary. A walk
killed mid-flight is found and offered resume-or-end on next launch
(`navigation/UnfinishedWalkGate.tsx`). Dog Profile's walk history reads
real finished walks from SQLite. A dev-only "Simulate walk" tool runs
scripted routes through the exact same pipeline for testing without GPS.

Next (separate task, deliberately not started here):

- **Server sync of walk summaries.** Nothing syncs anywhere right now —
  `walks.synced` exists as a column but is never set to 1. The sync
  payload is already shaped correctly (`WalkSummary`: `distanceM`,
  `activeMinutes`, `sniffSpotsHit`, `routeNovelty` — no coordinates, per
  the privacy rule), so this should be close to "POST the summary,
  flip `synced`" rather than a redesign. Needs a backend endpoint shaped
  for that payload — the old `territory-api` `/walks/{id}/points` and
  `/walks/{id}/end` endpoints assumed server-side distance/claim
  computation from raw points and don't match this model.
- **Server-side drop rolls.** `rollDropsForWalk` picks items from local
  mock data entirely client-side — fine for now, but a real economy
  almost certainly wants drops decided server-side (anti-cheat, balancing
  without an app release). `lib/walk/drops.ts`'s `rollDropsForWalk` is
  already the one seam to swap for a server call.
- **Sniff spots and route novelty are stubs** (`sniffSpotsHit: 0`,
  `routeNovelty: null`) — see the TODO comments in
  `lib/walk/calculations.ts` for what a real implementation of each
  needs (dwell-cluster detection; comparing the simplified route against
  past walks).
- **Dog.stats (total walks/distance/streak) is still static mock data** on
  the profile header — only the walk history *list* was wired to real
  data, not the aggregate tiles above it. Needs either a query over
  `listFinishedWalks()` or incremental updates on `finishReveal()`.
- `lib/api.ts`'s `startWalk`/`uploadWalkPoints`/`endWalk`/`discardWalk`
  (the old server-calling versions, name-colliding with the new local
  ones in `lib/walkTask.ts`) are now fully orphaned — no live caller,
  only the already-dead pre-UI-shell screens used them. Whatever the
  summary-sync endpoint ends up looking like, these almost certainly
  need replacing rather than reviving as-is.

## Cleanup

- **Delete the pre-UI-shell dead files.** `lib/RootNavigator.tsx`,
  `lib/WalkFlow.tsx`, `screens/AuthScreen.tsx`, `screens/CreateDogScreen.tsx`,
  `screens/HomeScreen.tsx`, `screens/LiveWalkScreen.tsx`, and
  `screens/WalkSummaryScreen.tsx` are superseded by the new navigation/
  screens and are no longer referenced from anywhere. They're excluded from
  `tsconfig.json`'s typecheck so they don't break the build, but they should
  be deleted in a follow-up — a bulk `git rm` was blocked here as a
  destructive action the agent couldn't push through.

## Onboarding

- **Dog-first onboarding will need Supabase anonymous sign-in.** Creating a
  dog currently requires an authenticated Bearer token (`POST /dogs`), but
  the new onboarding order creates the dog before any account exists. For
  this UI shell, dog creation during onboarding is local mock state only —
  wiring it to the real API later means signing in anonymously first (or
  deferring the real `POST /dogs` call until after sign-up and reconciling).

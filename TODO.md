# TODO

## Cleanup

- **Delete the pre-UI-shell dead files.** `lib/RootNavigator.tsx`,
  `lib/WalkFlow.tsx`, `screens/AuthScreen.tsx`, `screens/CreateDogScreen.tsx`,
  `screens/HomeScreen.tsx`, `screens/LiveWalkScreen.tsx`, and
  `screens/WalkSummaryScreen.tsx` are superseded by the new navigation/
  screens and are no longer referenced from anywhere. They're excluded from
  `tsconfig.json`'s typecheck so they don't break the build, but they should
  be deleted in a follow-up — a bulk `git rm` was blocked here as a
  destructive action the agent couldn't push through.
- **Wire `lib/walkTask.ts` up to the new local-first walk model.** Walks are
  GPS-tracked on-device (background location, same as this file already
  does); the correction is what happens with that data. Distance, active
  minutes, route, sniff spots, and new-vs-regular route detection should all
  be computed on the phone and stored locally (SQLite) as the walk happens,
  with only a summary (`distance_m`, `active_minutes`, `sniff_spots_hit`,
  `route_novelty`) ever synced to the server — not the current
  `walkTask.ts` behavior of streaming raw points to `/walks/{id}/points`
  during the walk, which assumed server-side distance/claim computation.
  Kept in place deliberately (it's the base for this — the location
  tracking plumbing stays, the sync model needs to change), left unused by
  this mock UI for now.

## Onboarding

- **Dog-first onboarding will need Supabase anonymous sign-in.** Creating a
  dog currently requires an authenticated Bearer token (`POST /dogs`), but
  the new onboarding order creates the dog before any account exists. For
  this UI shell, dog creation during onboarding is local mock state only —
  wiring it to the real API later means signing in anonymously first (or
  deferring the real `POST /dogs` call until after sign-up and reconciling).


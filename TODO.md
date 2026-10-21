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
- **Remove `lib/walkTask.ts` and the `@rnmapbox/maps` setup** (dependency,
  `app.json` plugin config, `ios`/`android` native bits) once confirmed
  unneeded — walks are now measured by step count, not GPS, so the old
  background-location machinery has no path back in. Left in place
  deliberately for this PR, per instructions, for a separate cleanup pass.

## Onboarding

- **Dog-first onboarding will need Supabase anonymous sign-in.** Creating a
  dog currently requires an authenticated Bearer token (`POST /dogs`), but
  the new onboarding order creates the dog before any account exists. For
  this UI shell, dog creation during onboarding is local mock state only —
  wiring it to the real API later means signing in anonymously first (or
  deferring the real `POST /dogs` call until after sign-up and reconciling).


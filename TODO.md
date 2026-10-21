# TODO

Lower-priority findings from a CodeRabbit CLI review, deferred deliberately —
not forgotten.

## Functional correctness

- **`App.tsx` — core `SafeAreaView` only applies insets on iOS.** Newer RN
  versions deprecate it, and recent Expo SDKs make Android edge-to-edge
  mandatory, so content can draw under the status/nav bar on Android. Not
  touched yet since only iOS has been tested. Switch to
  `SafeAreaProvider`/`SafeAreaView` from `react-native-safe-area-context`
  before testing on Android.

- **`screens/LiveWalkScreen.tsx` — stops GPS tracking before confirming
  `endWalk` succeeds.** If `endWalk` fails (network blip, expired session),
  the user stays on the live screen but tracking has already stopped — any
  ground covered before they retry "End walk" goes unrecorded. Fix: restart
  tracking for the current `trackingMode` on failure, or don't stop tracking
  until `endWalk` resolves.

## Data integrity

- **`lib/WalkFlow.tsx` — no recovery for an active walk after a crash or
  force-quit.** `activeWalkId` persists in storage, but `WalkFlow` always
  starts in `idle` on a fresh mount, so the user lands on Home with no way
  to resume or close the orphaned walk from the app — it never gets an
  `/end` or `/discard` call. In background mode (once the dev build is in
  use), the location task could also keep delivering/uploading points to
  that orphaned walk indefinitely. Fix: on mount, check for a persisted
  active walk id and either resume `LiveWalkScreen` or explicitly end/discard
  it. Matters most once background tracking is actually reachable — low
  urgency while still on the Expo Go foreground-only fallback.

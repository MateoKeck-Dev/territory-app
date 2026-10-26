import { useGameData } from './GameDataProvider';

/** Onboarding completion slice, shared via GameDataProvider so both
 * RootNavigator (gating) and HomeScreen (the one-time first-walk nudge)
 * see the same state. */
export function useOnboarding() {
  const { onboardingLoaded, hasOnboarded, completeOnboarding, justOnboarded, acknowledgeFirstWalkNudge } =
    useGameData();
  return { onboardingLoaded, hasOnboarded, completeOnboarding, justOnboarded, acknowledgeFirstWalkNudge };
}

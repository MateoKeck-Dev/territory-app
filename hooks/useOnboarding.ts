import { useCallback, useState } from 'react';

/**
 * Whether the dog-first onboarding flow has been completed. In-memory only
 * for this UI shell (resets on reload), independent of Supabase session
 * state — see RootNavigator for why.
 */
export function useOnboardingState() {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const completeOnboarding = useCallback(() => setHasOnboarded(true), []);
  return { hasOnboarded, completeOnboarding };
}

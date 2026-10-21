import React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';

import { AppNavigator } from './AppNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { useOnboarding } from '../hooks/useOnboarding';
import { useTheme } from '../lib/theme';

/**
 * Top-level navigator: onboarding until completeOnboarding() fires, then
 * the main app. Deliberately NOT gated on useAuth()'s session: the
 * onboarding flow is dog-first/account-later, independent of whether a
 * Supabase session (e.g. from dev auto-login) already exists — see
 * SignUpScreen, which just shows a shortcut if one does.
 */
export function RootNavigator() {
  const { scheme, colors } = useTheme();
  const { hasOnboarded } = useOnboarding();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {hasOnboarded ? <AppNavigator /> : <OnboardingNavigator />}
    </NavigationContainer>
  );
}

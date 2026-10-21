import React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';

import { AppNavigator } from './AppNavigator';
import { useTheme } from '../lib/theme';

/**
 * Top-level navigator. Onboarding gating lands in a later phase — for now
 * this always renders the main app shell so tabs/screens are reviewable
 * phase by phase. Deliberately NOT gated on useAuth()'s session here: the
 * onboarding flow being built is dog-first/account-later, independent of
 * whether a Supabase session (e.g. from dev auto-login) already exists.
 */
export function RootNavigator() {
  const { scheme, colors } = useTheme();
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
      <AppNavigator />
    </NavigationContainer>
  );
}

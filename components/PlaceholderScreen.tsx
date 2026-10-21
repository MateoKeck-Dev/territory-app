import React from 'react';
import { Text } from 'react-native';

import { ScreenContainer } from './ScreenContainer';
import { useTheme } from '../lib/theme';

/** Temporary stand-in for a screen not yet built in the current phase. */
export function PlaceholderScreen({ label, emoji = '🚧' }: { label: string; emoji?: string }) {
  const { colors, fontSizes, fontWeights } = useTheme();
  return (
    <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 48 }}>{emoji}</Text>
      <Text
        style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold, marginTop: 12 }}
      >
        {label}
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm, marginTop: 4 }}>
        Coming in a later phase
      </Text>
    </ScreenContainer>
  );
}

import React from 'react';
import { Text } from 'react-native';
import type { RouteProp } from '@react-navigation/native';

import { ScreenContainer } from '../../components/ScreenContainer';
import { useTheme } from '../../lib/theme';
import type { PlayStackParamList } from '../../navigation/types';

export function ComingSoonScreen({ route }: { route: RouteProp<PlayStackParamList, 'ComingSoon'> }) {
  const { colors, fontSizes, fontWeights } = useTheme();
  const { gameName, emoji } = route.params;

  return (
    <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <Text style={{ fontSize: 56 }}>{emoji}</Text>
      <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>
        {gameName} is coming soon
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm, textAlign: 'center' }}>
        We're still teaching the dogs the rules. Check back soon!
      </Text>
    </ScreenContainer>
  );
}

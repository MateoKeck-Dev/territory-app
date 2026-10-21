import React from 'react';
import { Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/Button';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useWalkSession } from '../../hooks/useWalkSession';
import { useTheme } from '../../lib/theme';
import type { AppStackParamList, WalkStackParamList } from '../../navigation/types';

export function WalkStartScreen({
  navigation,
}: {
  navigation: NativeStackNavigationProp<WalkStackParamList, 'WalkStart'>;
}) {
  const { colors, fontSizes, fontWeights } = useTheme();
  const { startWalk } = useWalkSession();
  const rootNavigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  function handleStart() {
    startWalk();
    navigation.navigate('WalkActive');
  }

  return (
    <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <Text style={{ fontSize: 64 }}>🐾</Text>
      <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold, textAlign: 'center' }}>
        Ready for a walk?
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm, textAlign: 'center' }}>
        We'll count your steps the whole way. No need to check your phone —
        pop it in your pocket and go.
      </Text>
      <Button label="Start walk" size="lg" onPress={handleStart} />
      <Button label="Not now" variant="ghost" onPress={() => rootNavigation.goBack()} />
    </ScreenContainer>
  );
}

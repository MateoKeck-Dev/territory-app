import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/Button';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useDog } from '../../hooks/useDog';
import { useWalkSession } from '../../hooks/useWalkSession';
import { useTheme } from '../../lib/theme';
import type { AppStackParamList, WalkStackParamList } from '../../navigation/types';

export function WalkStartScreen({
  navigation,
}: {
  navigation: NativeStackNavigationProp<WalkStackParamList, 'WalkStart'>;
}) {
  const { colors, fontSizes, fontWeights } = useTheme();
  const { dog } = useDog();
  const { startWalk } = useWalkSession();
  const rootNavigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [starting, setStarting] = useState(false);

  async function handleStart() {
    setStarting(true);
    try {
      const outcome = await startWalk(dog.name);
      if (!outcome.ok) {
        Alert.alert(
          'No location, no walk',
          'Territory needs location access to track the walk. You can turn it on in Settings.',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
      navigation.navigate('WalkActive');
    } finally {
      setStarting(false);
    }
  }

  return (
    <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <Text style={{ fontSize: 64 }}>🐾</Text>
      <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold, textAlign: 'center' }}>
        Ready for a walk?
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm, textAlign: 'center' }}>
        We'll track the walk on your phone the whole way. No need to check it —
        pop it in your pocket and go.
      </Text>
      {starting ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Button label="Start walk" size="lg" onPress={handleStart} />
      )}
      <Button label="Not now" variant="ghost" onPress={() => rootNavigation.goBack()} />
    </ScreenContainer>
  );
}

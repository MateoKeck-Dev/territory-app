import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/Button';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useDog } from '../../hooks/useDog';
import { useWalkSession } from '../../hooks/useWalkSession';
import { simulatedRoutes } from '../../lib/walk/simulatedRoutes';
import { useTheme } from '../../lib/theme';
import type { AppStackParamList, WalkStackParamList } from '../../navigation/types';

export function WalkStartScreen({
  navigation,
}: {
  navigation: NativeStackNavigationProp<WalkStackParamList, 'WalkStart'>;
}) {
  const { colors, spacing, radii, fontSizes, fontWeights } = useTheme();
  const { dog } = useDog();
  const { startWalk, simulateWalk } = useWalkSession();
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

  async function handleSimulate(routeId: string) {
    const route = simulatedRoutes.find((r) => r.id === routeId);
    if (!route) return;
    setStarting(true);
    try {
      await simulateWalk(route.points);
      navigation.navigate('WalkRecap');
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

      {__DEV__ && !starting && (
        <View
          style={[
            styles.devPanel,
            { borderColor: colors.border, backgroundColor: colors.surfaceAlt, borderRadius: radii.md },
          ]}
        >
          <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs, fontWeight: fontWeights.bold }}>
            🧪 DEV: simulate a walk
          </Text>
          {simulatedRoutes.map((route) => (
            <Pressable key={route.id} onPress={() => handleSimulate(route.id)} style={{ paddingVertical: spacing.xs }}>
              <Text style={{ color: colors.primaryDark, fontSize: fontSizes.sm }}>{route.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  devPanel: { borderWidth: 1, padding: 12, gap: 2, position: 'absolute', bottom: 24, width: '85%' },
});

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/Button';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useWalkSession } from '../../hooks/useWalkSession';
import { useTheme } from '../../lib/theme';
import type { WalkStackParamList } from '../../navigation/types';

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Deliberately minimal — glanced at, not used. The live distance here is a
 * rough mock estimate for feel; the real version reads it from the
 * on-device GPS track lib/walkTask.ts is building toward, not a server
 * round-trip — see the doc comment on useWalkSession.
 */
export function WalkActiveScreen({
  navigation,
}: {
  navigation: NativeStackNavigationProp<WalkStackParamList, 'WalkActive'>;
}) {
  const { colors, fontSizes, fontWeights } = useTheme();
  const { startedAt, endWalk } = useWalkSession();
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const tick = () => setElapsedSec(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const estDistanceKm = Math.round(((elapsedSec / 60) * 0.08) * 100) / 100;

  function handleEnd() {
    endWalk();
    navigation.replace('WalkRecap');
  }

  return (
    <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center', gap: 28 }}>
      <Text style={{ color: colors.text, fontSize: 56, fontWeight: fontWeights.bold }}>
        {formatElapsed(elapsedSec)}
      </Text>

      <View style={styles.stat}>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>
          {estDistanceKm.toFixed(1)}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>km</Text>
      </View>

      <Button label="End walk" size="lg" variant="danger" onPress={handleEnd} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stat: { alignItems: 'center' },
});

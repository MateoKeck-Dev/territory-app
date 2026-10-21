import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { PawTrail } from '../../components/PawTrail';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useWalkSession } from '../../hooks/useWalkSession';
import { useTheme } from '../../lib/theme';
import type { WalkStackParamList } from '../../navigation/types';

export function WalkRecapScreen({
  navigation,
}: {
  navigation: NativeStackNavigationProp<WalkStackParamList, 'WalkRecap'>;
}) {
  const { colors, fontSizes, fontWeights } = useTheme();
  const { result, beginReveal } = useWalkSession();

  if (!result) {
    // Shouldn't happen — recap is only reachable after endWalk() sets a result.
    return null;
  }

  function handleContinue() {
    beginReveal();
    navigation.replace('DropReveal');
  }

  return (
    <ScreenContainer style={{ alignItems: 'center', gap: 20 }}>
      <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>
        Great walk!
      </Text>

      <PawTrail />

      <View style={styles.statsRow}>
        <Stat label="Steps" value={result.steps.toLocaleString()} />
        <Stat label="Distance" value={`${result.distanceKm.toFixed(1)} km`} />
        <Stat label="Active" value={`${result.activeMinutes} min`} />
      </View>

      <Card style={{ backgroundColor: colors.accent, alignItems: 'center' }}>
        <Text style={{ fontSize: 28 }}>🎁</Text>
        <Text style={{ color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.bold }}>
          You found {result.drops.length} item{result.drops.length === 1 ? '' : 's'}!
        </Text>
      </Card>

      <Button label="Open your finds" size="lg" onPress={handleContinue} />
    </ScreenContainer>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { colors, fontSizes, fontWeights } = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>
        {value}
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: 28 },
  stat: { alignItems: 'center' },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { RouteDoodle } from '../../components/RouteDoodle';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useWalkSession } from '../../hooks/useWalkSession';
import { useTheme } from '../../lib/theme';
import type { AppStackParamList, WalkStackParamList } from '../../navigation/types';

export function WalkRecapScreen({
  navigation,
}: {
  navigation: NativeStackNavigationProp<WalkStackParamList, 'WalkRecap'>;
}) {
  const { colors, fontSizes, fontWeights } = useTheme();
  const { summary, drops, beginReveal, finishReveal } = useWalkSession();
  const rootNavigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  if (!summary) {
    // Shouldn't happen — recap is only reachable after endWalk() sets a summary.
    return null;
  }

  function handleContinue() {
    if (drops.length === 0) {
      // Nothing to reveal — a short walk earns no drops. Skip straight to
      // done rather than show an empty reveal screen.
      finishReveal();
      rootNavigation.navigate('MainTabs', { screen: 'Home', params: { screen: 'HomeMain' } } as never);
      return;
    }
    beginReveal();
    navigation.replace('DropReveal');
  }

  return (
    <ScreenContainer style={{ alignItems: 'center', gap: 20 }}>
      <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>
        Great walk!
      </Text>

      <RouteDoodle route={summary.simplifiedRoute} />

      {summary.routeNovelty === 'new' && (
        <Text style={{ color: colors.primaryDark, fontSize: fontSizes.sm, fontWeight: fontWeights.bold }}>
          ✨ A brand new route!
        </Text>
      )}

      <View style={styles.statsRow}>
        <Stat label="Distance" value={`${(summary.distanceM / 1000).toFixed(2)} km`} />
        <Stat label="Active" value={`${summary.activeMinutes} min`} />
        <Stat label="Sniff spots" value={String(summary.sniffSpotsHit)} />
      </View>

      <Card style={{ backgroundColor: colors.accent, alignItems: 'center' }}>
        <Text style={{ fontSize: 28 }}>🎁</Text>
        <Text style={{ color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.bold }}>
          {drops.length > 0
            ? `You found ${drops.length} item${drops.length === 1 ? '' : 's'}!`
            : "No finds this time — try a longer walk next time!"}
        </Text>
      </Card>

      <Button label={drops.length > 0 ? 'Open your finds' : 'Continue'} size="lg" onPress={handleContinue} />
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

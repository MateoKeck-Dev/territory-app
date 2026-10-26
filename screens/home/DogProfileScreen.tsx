import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { DogAvatar } from '../../components/DogAvatar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useDog } from '../../hooks/useDog';
import { useGameData } from '../../hooks/GameDataProvider';
import { useTheme } from '../../lib/theme';

export function DogProfileScreen() {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const { dog } = useDog();
  const { walkHistory } = useGameData();

  const stats: { label: string; value: string }[] = [
    { label: 'Total walks', value: String(dog.stats.totalWalks) },
    { label: 'Distance', value: `${dog.stats.totalDistanceKm.toFixed(1)} km` },
    { label: 'Streak', value: `${dog.stats.streakDays} days` },
    { label: 'Items found', value: String(dog.stats.itemsFound) },
  ];

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <DogAvatar markings={dog.markings} size={96} />
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>
          {dog.name}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>{dog.breed}</Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <Card key={stat.label} style={styles.statCard}>
            <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>
              {stat.value}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs, textAlign: 'center' }}>
              {stat.label}
            </Text>
          </Card>
        ))}
      </View>

      <Text style={{ color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.bold }}>
        Walk history
      </Text>
      {walkHistory.map((walk) => (
        <Card key={walk.id} style={styles.walkRow}>
          <Text style={{ color: colors.text, fontWeight: fontWeights.bold, width: 80 }}>{walk.dateLabel}</Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
            {walk.distanceKm.toFixed(1)} km · {walk.activeMinutes} min · {walk.sniffSpotsHit} sniff spot
            {walk.sniffSpotsHit === 1 ? '' : 's'} · {walk.itemsFound} found
          </Text>
        </Card>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { flexBasis: '47%', alignItems: 'center', gap: 2 },
  walkRow: { gap: 4 },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { rarityLabel, useTheme, type Rarity } from '../lib/theme';

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  const { colors, radii, spacing, fontSizes, fontWeights } = useTheme();
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.rarity[rarity],
          borderRadius: radii.pill,
          paddingHorizontal: spacing.sm,
          paddingVertical: 2,
        },
      ]}
    >
      <Text style={{ color: '#FFFFFF', fontSize: fontSizes.xs, fontWeight: fontWeights.bold }}>
        {rarityLabel(rarity)}
      </Text>
    </View>
  );
}

export function CoinBadge({ coins }: { coins: number }) {
  const { colors, radii, spacing, fontSizes, fontWeights } = useTheme();
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.surfaceAlt,
          borderRadius: radii.pill,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          gap: 6,
        },
      ]}
    >
      <Text style={{ fontSize: fontSizes.sm }}>🪙</Text>
      <Text style={{ color: colors.coin, fontSize: fontSizes.md, fontWeight: fontWeights.bold }}>
        {coins}
      </Text>
    </View>
  );
}

export function PeriodBadge({ period }: { period: 'daily' | 'weekly' }) {
  const { colors, radii, spacing, fontSizes, fontWeights } = useTheme();
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.secondary,
          borderRadius: radii.pill,
          paddingHorizontal: spacing.sm,
          paddingVertical: 2,
        },
      ]}
    >
      <Text style={{ color: '#FFFFFF', fontSize: fontSizes.xs, fontWeight: fontWeights.bold }}>
        {period === 'daily' ? 'Daily' : 'Weekly'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
});

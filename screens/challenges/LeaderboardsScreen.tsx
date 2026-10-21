import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SegmentedControl } from '../../components/SegmentedControl';
import { useChallenges } from '../../hooks/useChallenges';
import {
  leaderboardKinds,
  leaderboardScopes,
  type LeaderboardKind,
  type LeaderboardScope,
} from '../../mocks/challenges';
import { useTheme } from '../../lib/theme';

export function LeaderboardsScreen() {
  const { colors, spacing, radii, fontSizes, fontWeights } = useTheme();
  const { leaderboard } = useChallenges();
  const [kind, setKind] = useState<LeaderboardKind>('Longest walk');
  const [scope, setScope] = useState<LeaderboardScope>('Friends');

  const entries = leaderboard(kind, scope);

  return (
    <ScreenContainer scroll={false} style={{ gap: spacing.md }}>
      <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>
        Leaderboards
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>Resets weekly on Monday</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        {leaderboardKinds.map((k) => {
          const active = k === kind;
          return (
            <Pressable
              key={k}
              onPress={() => setKind(k)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.surfaceAlt,
                  borderRadius: radii.pill,
                },
              ]}
            >
              <Text style={{ color: active ? colors.textOnPrimary : colors.text, fontWeight: fontWeights.bold }}>
                {k}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <SegmentedControl options={leaderboardScopes} value={scope} onChange={setScope} />

      <ScrollView contentContainerStyle={{ gap: spacing.sm }}>
        {entries.map((entry, i) => (
          <Card
            key={entry.id}
            style={[styles.row, entry.isMe && { borderColor: colors.primary, borderWidth: 2 }]}
          >
            <Text style={{ color: colors.textMuted, fontWeight: fontWeights.bold, width: 24 }}>{i + 1}</Text>
            <Text style={{ color: colors.text, flex: 1, fontWeight: fontWeights.bold }}>{entry.name}</Text>
            <Text style={{ color: colors.text }}>{entry.value}</Text>
          </Card>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chipsRow: { flexGrow: 0 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

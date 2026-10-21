import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Dog, WalkSummary } from '../lib/api';
import { colors } from '../lib/theme';

export default function WalkSummaryScreen({
  dog,
  summary,
  onDone,
}: {
  dog: Dog;
  summary: WalkSummary;
  onDone: () => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.crest}>🏆</Text>
      <Text style={styles.title}>The campaign is won</Text>
      <Text style={styles.flavor}>{summary.flavor_text}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatDistance(summary.distance_meters)}</Text>
          <Text style={styles.statLabel}>Marched</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{summary.newly_claimed_cells}</Text>
          <Text style={styles.statLabel}>Plots claimed</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatArea(summary.total_area_sq_meters)}</Text>
          <Text style={styles.statLabel}>Domain held</Text>
        </View>
      </View>

      <Text style={styles.footnote}>{dog.name}'s banner now flies a little wider.</Text>

      <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={onDone}>
        <Text style={styles.buttonText}>Back to the keep</Text>
      </Pressable>
    </View>
  );
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

function formatArea(squareMeters: number): string {
  if (squareMeters < 10000) return `${Math.round(squareMeters)} m²`;
  return `${(squareMeters / 10000).toFixed(2)} ha`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.parchment,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 18,
  },
  crest: { fontSize: 48 },
  title: { fontSize: 26, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  flavor: {
    fontSize: 16,
    color: colors.inkSoft,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  statsRow: { flexDirection: 'row', gap: 12, width: '100%' },
  stat: {
    flex: 1,
    backgroundColor: colors.fieldBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 6,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.ink },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  footnote: { fontSize: 14, color: colors.inkSoft, textAlign: 'center' },
  button: {
    backgroundColor: colors.crest,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPressed: { backgroundColor: colors.crestDark },
  buttonText: { color: colors.white, fontSize: 17, fontWeight: '800' },
});

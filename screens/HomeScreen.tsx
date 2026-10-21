import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Dog } from '../lib/api';
import { avatarEmoji, colors } from '../lib/theme';

export default function HomeScreen({
  dog,
  ownerFirstName,
  onSignOut,
}: {
  dog: Dog;
  ownerFirstName: string;
  onSignOut: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View
          style={[
            styles.avatarRing,
            { borderColor: dog.color_hex ?? colors.border },
          ]}
        >
          <Text style={styles.avatar}>{avatarEmoji(dog.avatar_id)}</Text>
        </View>

        <Text style={styles.name}>{dog.name}</Text>
        <Text style={styles.owner}>
          {ownerFirstName}&rsquo;s loyal companion
        </Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Breed</Text>
          <Text style={styles.rowValue}>{dog.breed || 'Of mysterious lineage'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Banner</Text>
          <View style={styles.bannerValue}>
            <View
              style={[
                styles.swatch,
                { backgroundColor: dog.color_hex ?? colors.border },
              ]}
            />
            <Text style={styles.rowValue}>{dog.color_hex ?? '—'}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.mapPlaceholder}>
        🗺️  The map of your domain will unfurl here.
      </Text>

      <Pressable
        style={({ pressed }) => [styles.signOut, pressed && styles.signOutPressed]}
        onPress={onSignOut}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.parchment,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 22,
  },
  card: {
    width: '100%',
    backgroundColor: colors.fieldBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 26,
    alignItems: 'center',
    gap: 6,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.parchmentDark,
    marginBottom: 6,
  },
  avatar: { fontSize: 46 },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: 0.5,
  },
  owner: { fontSize: 15, color: colors.inkSoft, fontStyle: 'italic' },
  divider: {
    height: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingVertical: 8,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowValue: { fontSize: 16, color: colors.ink, fontWeight: '600' },
  bannerValue: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  mapPlaceholder: {
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  signOut: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  signOutPressed: { backgroundColor: colors.parchmentDark },
  signOutText: { fontSize: 15, fontWeight: '700', color: colors.crest },
});

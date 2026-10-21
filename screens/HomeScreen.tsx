import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';

import { startWalk, type Dog } from '../lib/api';
import { supabase } from '../lib/supabase';
import { avatarEmoji, colors } from '../lib/theme';
import { WALK_LOCATION_TASK, resetWalkTracking, setActiveWalkId } from '../lib/walkTask';

const WALK_LOCATION_OPTIONS = {
  accuracy: Location.Accuracy.BestForNavigation,
  timeInterval: 5000,
  distanceInterval: 10,
  showsBackgroundLocationIndicator: true,
  pausesUpdatesAutomatically: false,
  foregroundService: {
    notificationTitle: 'Territory is on the march',
    notificationBody: 'Tracking your walk in the background.',
  },
};

export default function HomeScreen({
  dog,
  ownerFirstName,
  onSignOut,
  onWalkStarted,
}: {
  dog: Dog;
  ownerFirstName: string;
  onSignOut: () => void;
  onWalkStarted: (walkId: string, startedAt: string) => void;
}) {
  const [startingWalk, setStartingWalk] = useState(false);

  async function handleStartWalk() {
    setStartingWalk(true);
    try {
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== 'granted') {
        Alert.alert(
          'The scouts refuse to march',
          'Territory needs leave to see your position before a walk can begin. Grant location access in Settings to proceed.',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }

      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus !== 'granted') {
        Alert.alert(
          'No scout rides ahead',
          "Without leave to track in the background, the trail may go cold whenever Territory isn't on screen. You can still walk with the app open.",
        );
      }

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Your session has expired. Sign in again to continue.');

      resetWalkTracking();
      const walk = await startWalk(token, dog.id);
      await setActiveWalkId(walk.id);
      await Location.startLocationUpdatesAsync(WALK_LOCATION_TASK, WALK_LOCATION_OPTIONS);

      onWalkStarted(walk.id, walk.started_at);
    } catch (err) {
      Alert.alert(
        'The quest failed to begin',
        err instanceof Error ? err.message : 'Something went wrong starting the walk.',
      );
    } finally {
      setStartingWalk(false);
    }
  }

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
        style={({ pressed }) => [styles.startWalk, pressed && styles.startWalkPressed]}
        disabled={startingWalk}
        onPress={handleStartWalk}
      >
        {startingWalk ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.startWalkText}>Start walk</Text>
        )}
      </Pressable>

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
  startWalk: {
    backgroundColor: colors.crest,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
    minWidth: 180,
  },
  startWalkPressed: { backgroundColor: colors.crestDark },
  startWalkText: { color: colors.white, fontSize: 17, fontWeight: '800' },
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

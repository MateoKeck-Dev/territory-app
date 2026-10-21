import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';

import { endWalk, type Dog, type WalkSummary } from '../lib/api';
import { supabase } from '../lib/supabase';
import { colors } from '../lib/theme';
import {
  WALK_LOCATION_TASK,
  flushBufferedPoints,
  getTrackedDistanceMeters,
  ingestPoint,
  resetWalkTracking,
  setActiveWalkId,
  type WalkTrackingMode,
} from '../lib/walkTask';

export default function LiveWalkScreen({
  dog,
  walkId,
  startedAt,
  trackingMode,
  onEnded,
}: {
  dog: Dog;
  walkId: string;
  startedAt: string;
  trackingMode: WalkTrackingMode;
  onEnded: (summary: WalkSummary) => void;
}) {
  const [elapsedSec, setElapsedSec] = useState(0);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [ending, setEnding] = useState(false);
  const foregroundWatch = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    const startedMs = new Date(startedAt).getTime();
    const tick = () => {
      setElapsedSec(Math.max(0, Math.floor((Date.now() - startedMs) / 1000)));
      setDistanceMeters(getTrackedDistanceMeters());
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  // Expo Go fallback: no background TaskManager task, so poll position
  // while this screen is mounted and in the foreground instead.
  useEffect(() => {
    if (trackingMode !== 'foreground') return;

    let cancelled = false;
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (loc) => {
        ingestPoint({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          recorded_at: new Date(loc.timestamp).toISOString(),
        });
      },
    ).then((subscription) => {
      if (cancelled) {
        subscription.remove();
      } else {
        foregroundWatch.current = subscription;
      }
    });

    return () => {
      cancelled = true;
      foregroundWatch.current?.remove();
      foregroundWatch.current = null;
    };
  }, [trackingMode]);

  async function handleEndWalk() {
    setEnding(true);
    try {
      if (trackingMode === 'background') {
        await Location.stopLocationUpdatesAsync(WALK_LOCATION_TASK).catch(() => {});
      } else {
        foregroundWatch.current?.remove();
        foregroundWatch.current = null;
      }
      await flushBufferedPoints();

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Your session has expired. Sign in again to continue.');

      const summary = await endWalk(token, walkId);
      await setActiveWalkId(null);
      resetWalkTracking();
      onEnded(summary);
    } catch (err) {
      Alert.alert(
        'The hunt will not end',
        err instanceof Error ? err.message : 'Something went wrong ending the walk.',
      );
    } finally {
      setEnding(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{dog.name} is on the march</Text>
      <Text style={styles.sub}>Claiming every yard beneath your boots.</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatElapsed(elapsedSec)}</Text>
          <Text style={styles.statLabel}>Time afield</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatDistance(distanceMeters)}</Text>
          <Text style={styles.statLabel}>Ground covered</Text>
        </View>
      </View>

      {trackingMode === 'foreground' && (
        <Text style={styles.foregroundNotice}>
          ⚠️ Keep this screen open and awake — thy hound's trail is only marked while Territory
          stays in view.
        </Text>
      )}

      <Text style={styles.mapPlaceholder}>🗺️  The map of your domain will unfurl here.</Text>

      <Pressable
        style={({ pressed }) => [styles.endButton, pressed && styles.endButtonPressed]}
        disabled={ending}
        onPress={handleEndWalk}
      >
        {ending ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.endButtonText}>End walk</Text>
        )}
      </Pressable>
    </View>
  );
}

function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.parchment,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 24,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink,
    textAlign: 'center',
  },
  sub: { fontSize: 15, color: colors.inkSoft, textAlign: 'center', marginTop: -10 },
  statsRow: {
    flexDirection: 'row',
    gap: 18,
    width: '100%',
  },
  stat: {
    flex: 1,
    backgroundColor: colors.fieldBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
  },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.ink },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mapPlaceholder: { fontSize: 14, color: colors.inkSoft, textAlign: 'center' },
  foregroundNotice: {
    fontSize: 13,
    color: colors.crestDark,
    textAlign: 'center',
    backgroundColor: colors.fieldBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  endButton: {
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  endButtonPressed: { opacity: 0.85 },
  endButtonText: { color: colors.white, fontSize: 17, fontWeight: '800' },
});

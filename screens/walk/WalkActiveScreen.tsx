import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/Button';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useWalkSession } from '../../hooks/useWalkSession';
import { getLiveDistanceMeters, ingestPoint } from '../../lib/walkTask';
import { useTheme } from '../../lib/theme';
import type { WalkStackParamList } from '../../navigation/types';

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Deliberately minimal — glanced at, not used. Distance is read live from
 * lib/walkTask.ts's running on-device total, not estimated — the same
 * filtering (accuracy/jitter/impossible jumps) the final summary uses,
 * just applied incrementally. In foreground mode (no background
 * permission), this screen owns the watchPositionAsync subscription
 * itself, since tracking only runs while it's mounted and in the
 * foreground.
 */
export function WalkActiveScreen({
  navigation,
}: {
  navigation: NativeStackNavigationProp<WalkStackParamList, 'WalkActive'>;
}) {
  const { colors, fontSizes, fontWeights } = useTheme();
  const { startedAt, trackingMode, endWalk } = useWalkSession();
  const [elapsedSec, setElapsedSec] = useState(0);
  const [distanceM, setDistanceM] = useState(0);
  const [ending, setEnding] = useState(false);
  const foregroundWatch = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!startedAt) return;
    const tick = () => {
      setElapsedSec(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
      setDistanceM(getLiveDistanceMeters());
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  // Expo Go / permission-denied fallback: no background TaskManager task,
  // so poll position while this screen is mounted and in the foreground.
  useEffect(() => {
    if (trackingMode !== 'foreground') return;

    let cancelled = false;
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 15,
      },
      (loc) => {
        ingestPoint({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          timestamp: loc.timestamp,
          accuracy: loc.coords.accuracy ?? null,
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

  async function handleEnd() {
    setEnding(true);
    try {
      foregroundWatch.current?.remove();
      foregroundWatch.current = null;
      await endWalk();
      navigation.replace('WalkRecap');
    } finally {
      setEnding(false);
    }
  }

  return (
    <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center', gap: 28 }}>
      <Text style={{ color: colors.text, fontSize: 56, fontWeight: fontWeights.bold }}>
        {formatElapsed(elapsedSec)}
      </Text>

      <View style={styles.stat}>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>
          {(distanceM / 1000).toFixed(2)}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>km</Text>
      </View>

      {ending ? (
        <ActivityIndicator color={colors.danger} />
      ) : (
        <Button label="End walk" size="lg" variant="danger" onPress={handleEnd} />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stat: { alignItems: 'center' },
});

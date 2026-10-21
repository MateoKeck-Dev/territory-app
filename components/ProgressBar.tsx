import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../lib/theme';

export function ProgressBar({ progress, color }: { progress: number; color?: string }) {
  const { colors, radii } = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View
      style={[
        styles.track,
        { backgroundColor: colors.surfaceAlt, borderRadius: radii.pill },
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clamped * 100}%`,
            backgroundColor: color ?? colors.primary,
            borderRadius: radii.pill,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 10, overflow: 'hidden', width: '100%' },
  fill: { height: '100%' },
});

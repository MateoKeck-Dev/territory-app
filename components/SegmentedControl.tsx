import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../lib/theme';

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { colors, radii, spacing, fontSizes, fontWeights } = useTheme();

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: colors.surfaceAlt, borderRadius: radii.pill, padding: 4 },
      ]}
    >
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[
              styles.segment,
              {
                backgroundColor: active ? colors.primary : 'transparent',
                borderRadius: radii.pill,
                paddingVertical: spacing.sm,
              },
            ]}
          >
            <Text
              style={{
                textAlign: 'center',
                color: active ? colors.textOnPrimary : colors.textMuted,
                fontSize: fontSizes.sm,
                fontWeight: fontWeights.bold,
              }}
              numberOfLines={1}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  segment: { flex: 1 },
});

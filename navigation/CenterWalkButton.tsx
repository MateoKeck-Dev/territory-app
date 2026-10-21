import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

import { useTheme } from '../lib/theme';

/** The big center "Walk" tab button. Rendered via tabBarButton; the actual
 * navigation (push the walk flow over the tabs, don't switch tabs) happens
 * in the Walk tab's tabPress listener in MainTabs.tsx. */
export function CenterWalkButton(props: BottomTabBarButtonProps) {
  const { colors, radii } = useTheme();

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <Pressable
        onPress={props.onPress}
        accessibilityRole="button"
        accessibilityLabel="Start a walk"
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.primary,
            borderRadius: radii.pill,
            borderColor: colors.background,
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          },
        ]}
      >
        <Text style={styles.emoji}>🐾</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, alignItems: 'center' },
  button: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -26,
    borderWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  emoji: { fontSize: 26 },
});

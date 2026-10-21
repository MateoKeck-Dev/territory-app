import React from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '../lib/theme';

export function ScreenContainer({
  children,
  scroll = true,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}) {
  const { colors, spacing } = useTheme();
  const containerStyle = [
    styles.container,
    { backgroundColor: colors.background, padding: spacing.lg },
    style,
  ];

  if (!scroll) {
    return <View style={containerStyle}>{children}</View>;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={containerStyle}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, gap: 16 },
});

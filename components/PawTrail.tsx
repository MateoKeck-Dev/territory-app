import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/** Purely decorative paw-print trail — not a route, not a map, just a
 * playful graphic for the walk recap screen. */
export function PawTrail() {
  const offsets = [0, 14, 0, 14, 0, 14, 0];
  return (
    <View style={styles.row}>
      {offsets.map((offset, i) => (
        <Text key={i} style={[styles.paw, { marginTop: offset }]}>
          🐾
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  paw: { fontSize: 22, transform: [{ rotate: '15deg' }] },
});

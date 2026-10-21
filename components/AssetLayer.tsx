import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { AssetRef } from '../lib/assetRegistry';

/**
 * Renders one AssetRef, whatever kind it currently is. This is the only
 * place that knows how to turn a registry entry into pixels — when real
 * art replaces a placeholder shape/emoji, only AssetRef's cases (here and
 * in assetRegistry.ts) need to grow, not every caller.
 */
export function AssetLayer({
  asset,
  size,
  color,
  style,
}: {
  asset: AssetRef | null;
  size: number;
  /** Resolved color for 'shape' assets — the registry only says *which*
   * tint role (base/marking) to use, callers resolve it to an actual color. */
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  if (!asset) return null;

  if (asset.kind === 'emoji') {
    return (
      <Text style={[{ fontSize: size, lineHeight: size * 1.1 }, style]}>{asset.glyph}</Text>
    );
  }

  const shapeStyle: ViewStyle = {
    width: size,
    height: asset.shape === 'oval' ? size * 0.6 : size,
    backgroundColor: color,
  };

  if (asset.shape === 'circle' || asset.shape === 'oval') {
    shapeStyle.borderRadius = size / 2;
  } else if (asset.shape === 'triangle') {
    // Plain View can't do a real triangle without borders — approximate
    // with a rotated rounded square, good enough as a placeholder.
    shapeStyle.borderRadius = size * 0.2;
    shapeStyle.transform = [{ rotate: '45deg' }];
    shapeStyle.width = size * 0.75;
    shapeStyle.height = size * 0.75;
  }

  return <View style={[styles.shape, shapeStyle, style]} />;
}

const styles = StyleSheet.create({
  shape: { overflow: 'hidden' },
});

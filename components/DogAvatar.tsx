import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AssetLayer } from './AssetLayer';
import { dogPartAssets } from '../lib/assetRegistry';
import type { DogMarkings } from '../mocks/dog';

/**
 * Composed from layered parts — tail, base body, markings, ears, outfit —
 * each resolved through the asset registry. Placeholder colored shapes for
 * now; dropping in real art later means only assetRegistry.ts changes,
 * not this component or anywhere it's used.
 */
export function DogAvatar({ markings, size = 96 }: { markings: DogMarkings; size: number }) {
  const markingAsset =
    markings.pattern === 'solid'
      ? null
      : markings.pattern === 'spots'
        ? dogPartAssets.ears.cropped // small round spot shape, reused here
        : ({ kind: 'shape', shape: 'oval', tint: 'marking' } as const);

  return (
    <View style={{ width: size, height: size }}>
      {/* Tail layer, behind the body */}
      <View style={[styles.tail, { right: -size * 0.12, top: size * 0.3 }]}>
        <AssetLayer asset={dogPartAssets.tail[markings.tailStyle]} size={size * 0.3} color={markings.baseColor} />
      </View>

      {/* Ears layer, behind the body so only their tops peek out */}
      <View style={[styles.ear, { left: size * 0.02, top: -size * 0.06 }]}>
        <AssetLayer asset={dogPartAssets.ears[markings.earStyle]} size={size * 0.32} color={markings.baseColor} />
      </View>
      <View style={[styles.ear, { right: size * 0.02, top: -size * 0.06 }]}>
        <AssetLayer asset={dogPartAssets.ears[markings.earStyle]} size={size * 0.32} color={markings.baseColor} />
      </View>

      {/* Base body */}
      <View
        style={[
          styles.body,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: markings.baseColor },
        ]}
      >
        {/* Markings layer, on top of the body */}
        {markingAsset && markings.pattern === 'spots' && (
          <>
            <View style={[styles.spot, { top: size * 0.15, left: size * 0.18 }]}>
              <AssetLayer asset={markingAsset} size={size * 0.22} color={markings.markingColor} />
            </View>
            <View style={[styles.spot, { bottom: size * 0.18, right: size * 0.2 }]}>
              <AssetLayer asset={markingAsset} size={size * 0.18} color={markings.markingColor} />
            </View>
          </>
        )}
        {markingAsset && markings.pattern === 'patch' && (
          <View style={[styles.spot, { top: size * 0.08, left: -size * 0.05 }]}>
            <AssetLayer asset={markingAsset} size={size * 0.55} color={markings.markingColor} />
          </View>
        )}

        {/* Outfit layer, topmost */}
        {markings.outfitId !== 'none' && (
          <View style={styles.outfit}>
            <AssetLayer asset={dogPartAssets.outfits[markings.outfitId]} size={size * 0.3} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  ear: { position: 'absolute', zIndex: -1 },
  tail: { position: 'absolute', zIndex: -1 },
  spot: { position: 'absolute' },
  outfit: { position: 'absolute', bottom: -4, alignSelf: 'center' },
});

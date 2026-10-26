import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../lib/theme';
import type { GpsPoint } from '../lib/walk/types';

const WIDTH = 220;
const HEIGHT = 140;
const PADDING = 20;

/**
 * Draws the walk's simplified route as a stylised doodle — plain rotated
 * Views for each segment, not a real map (no basemap, no react-native-svg
 * dependency either; a handful of line segments doesn't need it). The
 * history tab will eventually use react-native-maps for something more
 * literal — this is deliberately just a shape.
 */
export function RouteDoodle({ route }: { route: GpsPoint[] }) {
  const { colors } = useTheme();

  if (route.length < 2) {
    return (
      <View style={[styles.canvas, { width: WIDTH, height: HEIGHT }]}>
        <Text style={{ fontSize: 28 }}>🐾</Text>
      </View>
    );
  }

  const lats = route.map((p) => p.lat);
  const lngs = route.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latRange = maxLat - minLat || 1e-6;
  const lngRange = maxLng - minLng || 1e-6;
  // Preserve aspect ratio-ish by scaling both axes against the same
  // factor (the smaller of the two), so a route doesn't look stretched.
  const availableW = WIDTH - PADDING * 2;
  const availableH = HEIGHT - PADDING * 2;
  const scale = Math.min(availableW / lngRange, availableH / latRange);

  const toXY = (p: GpsPoint) => ({
    x: PADDING + (p.lng - minLng) * scale,
    // Screen Y grows downward; latitude grows "up" (north), so flip it.
    y: PADDING + (maxLat - p.lat) * scale,
  });

  const points = route.map(toXY);

  const segments = points.slice(1).map((end, i) => {
    const start = points[i];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    return { start, length, angle };
  });

  return (
    <View style={[styles.canvas, { width: WIDTH, height: HEIGHT }]}>
      {segments.map((segment, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            {
              left: segment.start.x,
              top: segment.start.y,
              width: Math.max(segment.length, 1),
              backgroundColor: colors.primary,
              transform: [{ rotate: `${segment.angle}deg` }],
            },
          ]}
        />
      ))}
      <Text style={[styles.marker, { left: points[0].x - 9, top: points[0].y - 9 }]}>🐾</Text>
      <Text style={[styles.marker, { left: points[points.length - 1].x - 9, top: points[points.length - 1].y - 9 }]}>
        🏁
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { alignItems: 'center', justifyContent: 'center' },
  segment: {
    position: 'absolute',
    height: 3,
    borderRadius: 2,
    transformOrigin: '0 50%',
  },
  marker: { position: 'absolute', fontSize: 18 },
});

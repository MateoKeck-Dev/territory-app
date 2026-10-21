import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { RarityBadge } from './Badges';
import { ScreenContainer } from './ScreenContainer';
import { rarityLabel, useTheme } from '../lib/theme';
import type { InventoryItem } from '../mocks/items';

const SPARKLE_RARITIES = new Set(['rare', 'seasonal']);

/**
 * The present-opening moment: tap to reveal each drop one at a time, with
 * a scale/spring bounce and an extra sparkle burst for rare/seasonal
 * finds. Shared by the walk flow's DropRevealScreen and onboarding's
 * WelcomeGiftScreen — same reveal, different footer once the last item is
 * open (walk: Go home/View inventory; onboarding: Continue).
 */
export function DropRevealSequence({
  drops,
  footer,
}: {
  drops: InventoryItem[];
  footer: React.ReactNode;
}) {
  const { colors, fontSizes, fontWeights } = useTheme();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const scale = useRef(new Animated.Value(0)).current;
  const sparkle = useRef(new Animated.Value(0)).current;

  const current = drops[index];
  const isLast = index === drops.length - 1;
  const extraFlair = current ? SPARKLE_RARITIES.has(current.rarity) : false;

  function reveal() {
    setRevealed(true);
    scale.setValue(0);
    sparkle.setValue(0);
    Animated.sequence([
      Animated.spring(scale, {
        toValue: extraFlair ? 1.2 : 1.1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    if (extraFlair) {
      Animated.timing(sparkle, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  }

  function handlePresentTap() {
    if (!revealed) {
      reveal();
      return;
    }
    if (!isLast) {
      setIndex((i) => i + 1);
      setRevealed(false);
      scale.setValue(0);
    }
  }

  if (!current) return null;

  const showFooter = revealed && isLast;

  return (
    <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      {drops.length > 1 && (
        <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
          Find {index + 1} of {drops.length}
        </Text>
      )}

      <Pressable onPress={handlePresentTap} style={styles.presentArea}>
        {extraFlair && revealed && (
          <Animated.Text
            style={[
              styles.sparkle,
              {
                opacity: sparkle,
                transform: [{ scale: sparkle.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.6] }) }],
              },
            ]}
          >
            ✨
          </Animated.Text>
        )}

        {revealed ? (
          <Animated.View style={{ transform: [{ scale }] }}>
            <Text style={styles.emoji}>{current.emoji}</Text>
          </Animated.View>
        ) : (
          <Text style={styles.emoji}>🎁</Text>
        )}

        {revealed ? (
          <>
            <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>
              {current.name}
            </Text>
            <RarityBadge rarity={current.rarity} />
            {extraFlair && (
              <Text style={{ color: colors.accent, fontSize: fontSizes.sm, fontWeight: fontWeights.bold }}>
                {rarityLabel(current.rarity)} find!
              </Text>
            )}
          </>
        ) : (
          <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>Tap to open</Text>
        )}
      </Pressable>

      {!showFooter && revealed && !isLast && <Button label="Next find" onPress={handlePresentTap} />}

      {showFooter && <View style={styles.footer}>{footer}</View>}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  presentArea: { alignItems: 'center', gap: 8, minHeight: 220, justifyContent: 'center' },
  emoji: { fontSize: 88 },
  sparkle: { position: 'absolute', top: -10, fontSize: 56 },
  footer: { gap: 10, alignItems: 'center' },
});

import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/Button';
import { RarityBadge } from '../../components/Badges';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useWalkSession } from '../../hooks/useWalkSession';
import { rarityLabel, useTheme } from '../../lib/theme';
import type { AppStackParamList } from '../../navigation/types';

const SPARKLE_RARITIES = new Set(['rare', 'seasonal']);

export function DropRevealScreen() {
  const { colors, fontSizes, fontWeights } = useTheme();
  const { result, finishReveal } = useWalkSession();
  const rootNavigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const drops = result?.drops ?? [];
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

  function goHome() {
    finishReveal();
    // Targeting a screen already below this modal in the stack pops back
    // to it rather than pushing a new one, so this both closes the walk
    // flow and picks which tab/screen MainTabs shows.
    rootNavigation.navigate('MainTabs', { screen: 'Home', params: { screen: 'HomeMain' } } as never);
  }

  function goToInventory() {
    finishReveal();
    rootNavigation.navigate('MainTabs', { screen: 'Home', params: { screen: 'Inventory' } } as never);
  }

  if (!current) return null;

  const showFinalButtons = revealed && isLast;

  return (
    <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
        Find {index + 1} of {drops.length}
      </Text>

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

      {!showFinalButtons && revealed && !isLast && (
        <Button label="Next find" onPress={handlePresentTap} />
      )}

      {showFinalButtons && (
        <View style={styles.finalButtons}>
          <Button label="Go home" onPress={goHome} />
          <Button label="View inventory" variant="secondary" onPress={goToInventory} />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  presentArea: { alignItems: 'center', gap: 8, minHeight: 220, justifyContent: 'center' },
  emoji: { fontSize: 88 },
  sparkle: { position: 'absolute', top: -10, fontSize: 56 },
  finalButtons: { gap: 10, alignItems: 'center' },
});

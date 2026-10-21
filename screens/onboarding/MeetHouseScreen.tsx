import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/Button';
import { DogAvatar } from '../../components/DogAvatar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useGameData } from '../../hooks/GameDataProvider';
import { useDog } from '../../hooks/useDog';
import { itemAssetGlyphs } from '../../lib/assetRegistry';
import { useTheme } from '../../lib/theme';
import type { OnboardingStackParamList } from '../../navigation/types';

const STARTER_ITEM_KEYS = ['item-1', 'item-2'];

export function MeetHouseScreen({
  navigation,
}: {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'MeetHouse'>;
}) {
  const { colors, radii, fontSizes, fontWeights } = useTheme();
  const { dog } = useDog();
  const { addItems } = useGameData();
  const granted = useRef(false);

  useEffect(() => {
    if (granted.current) return;
    granted.current = true;
    addItems(
      STARTER_ITEM_KEYS.map((key, i) => ({
        id: `starter-${i}`,
        name: 'Starter gift',
        emoji: itemAssetGlyphs[key] ?? '🎁',
        rarity: 'common',
        coinValue: 4,
        placed: true,
      })),
    );
  }, [addItems]);

  return (
    <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold, textAlign: 'center' }}>
        Welcome home, {dog.name}!
      </Text>

      <View
        style={[
          styles.room,
          { backgroundColor: colors.surfaceAlt, borderRadius: radii.xl, borderColor: colors.border },
        ]}
      >
        <View style={styles.starterItems}>
          {STARTER_ITEM_KEYS.map((key) => (
            <Text key={key} style={{ fontSize: 24 }}>
              {itemAssetGlyphs[key]}
            </Text>
          ))}
        </View>
        <DogAvatar markings={dog.markings} size={88} />
      </View>

      <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm, textAlign: 'center' }}>
        {dog.name} already came with a couple of things to decorate with.
      </Text>

      <Button label="Continue" size="lg" onPress={() => navigation.navigate('WelcomeGift')} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  room: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: 36,
    gap: 10,
  },
  starterItems: { flexDirection: 'row', gap: 14, position: 'absolute', top: 14, left: 14 },
});

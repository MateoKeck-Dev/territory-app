import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { CoinBadge } from '../../components/Badges';
import { DogAvatar } from '../../components/DogAvatar';
import { ProgressBar } from '../../components/ProgressBar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useChallenges } from '../../hooks/useChallenges';
import { useCoins } from '../../hooks/useCoins';
import { useDog } from '../../hooks/useDog';
import { useInventory } from '../../hooks/useInventory';
import { useOnboarding } from '../../hooks/useOnboarding';
import { APP_NAME, useTheme } from '../../lib/theme';
import type { HomeStackParamList } from '../../navigation/types';

export function HomeScreen({
  navigation,
}: {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;
}) {
  const { colors, spacing, radii, fontSizes, fontWeights } = useTheme();
  const { dog } = useDog();
  const { coins } = useCoins();
  const { items, toggleDisplay } = useInventory();
  const { challenges } = useChallenges();
  const { justOnboarded } = useOnboarding();
  const [decorating, setDecorating] = useState(false);

  const placedItems = items.filter((i) => i.placed);
  const todayChallenge = challenges.find((c) => c.period === 'daily') ?? challenges[0];

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>
          {APP_NAME}
        </Text>
        <CoinBadge coins={coins} />
      </View>

      <Card style={{ backgroundColor: colors.secondary }}>
        <Text style={{ color: '#FFFFFF', fontSize: fontSizes.md, fontWeight: fontWeights.bold }}>
          {justOnboarded
            ? `🐕 Take ${dog.name} on their first walk!`
            : `🐕 ${dog.name} is restless — time for a walk?`}
        </Text>
      </Card>

      {todayChallenge && (
        <Card>
          <View style={styles.rowBetween}>
            <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs, fontWeight: fontWeights.bold }}>
              TODAY'S CHALLENGE
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>{todayChallenge.reward}</Text>
          </View>
          <Text style={{ color: colors.text, fontSize: fontSizes.sm, marginTop: 4, marginBottom: 8 }}>
            {todayChallenge.title}
          </Text>
          <ProgressBar progress={todayChallenge.progress} />
        </Card>
      )}

      <Pressable
        onPress={() => navigation.navigate('DogProfile')}
        style={[
          styles.room,
          { backgroundColor: colors.surfaceAlt, borderRadius: radii.xl, borderColor: colors.border },
        ]}
      >
        <View style={styles.roomItems}>
          {placedItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => decorating && toggleDisplay(item.id)}
              style={styles.roomItem}
            >
              <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
              {decorating && <Text style={{ fontSize: 10, color: colors.danger }}>remove</Text>}
            </Pressable>
          ))}
        </View>
        <DogAvatar markings={dog.markings} size={88} />
        <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>Tap {dog.name} to see their profile</Text>
      </Pressable>

      <View style={styles.actionsRow}>
        <Button
          label={decorating ? 'Done decorating' : 'Decorate'}
          variant={decorating ? 'primary' : 'secondary'}
          onPress={() => setDecorating((d) => !d)}
          style={{ flex: 1 }}
        />
        <Button
          label="Inventory"
          variant="secondary"
          onPress={() => navigation.navigate('Inventory')}
          style={{ flex: 1 }}
        />
        <Button label="Shop" variant="secondary" onPress={() => navigation.navigate('Shop')} style={{ flex: 1 }} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  room: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, paddingVertical: 36, gap: 6 },
  roomItems: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, position: 'absolute', top: 10, left: 10 },
  roomItem: { alignItems: 'center' },
  actionsRow: { flexDirection: 'row', gap: 10 },
});

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import { mockMiniGames } from '../../mocks/miniGames';
import { useTheme } from '../../lib/theme';
import type { PlayStackParamList } from '../../navigation/types';

export function PlayScreen({
  navigation,
}: {
  navigation: NativeStackNavigationProp<PlayStackParamList, 'PlayMain'>;
}) {
  const { colors, fontSizes, fontWeights } = useTheme();

  return (
    <ScreenContainer>
      <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>Play</Text>
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
        A few mini games to enjoy with your dog between walks.
      </Text>
      <View style={styles.grid}>
        {mockMiniGames.map((game) => (
          <Pressable
            key={game.id}
            onPress={() => navigation.navigate('ComingSoon', { gameName: game.name, emoji: game.emoji })}
            style={styles.cardWrapper}
          >
            <Card style={styles.card}>
              <Text style={{ fontSize: 40 }}>{game.emoji}</Text>
              <Text style={{ color: colors.text, fontWeight: fontWeights.bold }}>{game.name}</Text>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cardWrapper: { flexBasis: '47%' },
  card: { alignItems: 'center', gap: 6 },
});

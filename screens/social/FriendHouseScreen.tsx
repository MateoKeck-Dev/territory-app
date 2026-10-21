import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';

import { Button } from '../../components/Button';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useSocial } from '../../hooks/useSocial';
import { mockInventory } from '../../mocks/items';
import { useTheme } from '../../lib/theme';
import type { SocialStackParamList } from '../../navigation/types';

export function FriendHouseScreen({ route }: { route: RouteProp<SocialStackParamList, 'FriendHouse'> }) {
  const { colors, radii, fontSizes, fontWeights } = useTheme();
  const { friends, leavePawPrint } = useSocial();
  const [left, setLeft] = useState(false);

  const friend = friends.find((f) => f.id === route.params.friendId);
  // A friend's house is read-only — borrow a few items from the mock
  // catalogue to show something placed, since we don't model per-friend
  // houses yet.
  const displayedItems = mockInventory.slice(0, 3);

  function handleLeavePawPrint() {
    leavePawPrint(route.params.friendId);
    setLeft(true);
    Alert.alert('Paw print left!', `${friend?.name ?? 'Your friend'} will see it next time they visit.`);
  }

  return (
    <ScreenContainer style={{ alignItems: 'center', gap: 16 }}>
      <Text style={{ fontSize: 56 }}>{friend?.avatarEmoji ?? '🐾'}</Text>
      <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>
        {friend?.dogName ?? 'Their dog'}'s house
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>with {friend?.name ?? 'a friend'} · read only</Text>

      <View
        style={{
          width: '100%',
          backgroundColor: colors.surfaceAlt,
          borderRadius: radii.xl,
          borderWidth: 1,
          borderColor: colors.border,
          paddingVertical: 32,
          alignItems: 'center',
          gap: 8,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {displayedItems.map((item) => (
            <Text key={item.id} style={{ fontSize: 26 }}>
              {item.emoji}
            </Text>
          ))}
        </View>
        <Text style={{ fontSize: 64 }}>🐶</Text>
      </View>

      <Button
        label={left ? 'Paw print left!' : 'Leave a paw print'}
        disabled={left}
        onPress={handleLeavePawPrint}
      />
    </ScreenContainer>
  );
}

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useSocial } from '../../hooks/useSocial';
import { useTheme } from '../../lib/theme';
import type { SocialStackParamList } from '../../navigation/types';

export function SocialScreen({
  navigation,
}: {
  navigation: NativeStackNavigationProp<SocialStackParamList, 'SocialMain'>;
}) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const { friends, pawPrints, pack, joinPack, createPack } = useSocial();

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>Social</Text>
        <Button label="Add friends" size="md" onPress={() => navigation.navigate('AddFriends')} />
      </View>

      <Section title="Friends">
        {friends.map((friend) => (
          <Pressable key={friend.id} onPress={() => navigation.navigate('FriendHouse', { friendId: friend.id })}>
            <Card style={styles.friendRow}>
              <Text style={{ fontSize: 28 }}>{friend.avatarEmoji}</Text>
              <View>
                <Text style={{ color: colors.text, fontWeight: fontWeights.bold }}>{friend.name}</Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>with {friend.dogName}</Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </Section>

      <Section title="Pack">
        {pack ? (
          <Card style={{ gap: spacing.sm }}>
            <Text style={{ color: colors.text, fontWeight: fontWeights.bold, fontSize: fontSizes.md }}>
              {pack.name}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
              {pack.members.length} member{pack.members.length === 1 ? '' : 's'}
            </Text>
            <ProgressBar progress={pack.progressSteps / pack.goalSteps} />
            <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
              {pack.progressSteps.toLocaleString()} / {pack.goalSteps.toLocaleString()} steps this week
            </Text>
          </Card>
        ) : (
          <View style={styles.packButtons}>
            <Button label="Join a pack" variant="secondary" onPress={() => joinPack('pack-1')} style={{ flex: 1 }} />
            <Button label="Create a pack" variant="secondary" onPress={() => createPack('My Pack')} style={{ flex: 1 }} />
          </View>
        )}
      </Section>

      <Section title="Paw prints received">
        {pawPrints.length === 0 ? (
          <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>No paw prints yet.</Text>
        ) : (
          pawPrints.map((print) => (
            <Card key={print.id} style={styles.pawPrintRow}>
              <Text style={{ fontSize: 20 }}>🐾</Text>
              <Text style={{ color: colors.text, fontSize: fontSizes.sm, flex: 1 }}>
                {print.fromName} & {print.fromDogName} left a paw print
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>{print.whenLabel}</Text>
            </Card>
          ))
        )}
      </Section>
    </ScreenContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, fontSizes, fontWeights } = useTheme();
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.bold }}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  packButtons: { flexDirection: 'row', gap: 10 },
  pawPrintRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

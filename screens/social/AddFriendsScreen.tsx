import React, { useState } from 'react';
import { Alert, Share, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useSocial } from '../../hooks/useSocial';
import { APP_NAME, useTheme } from '../../lib/theme';

const INVITE_LINK = 'https://pawlace.app/invite/biscuit_and_you';

export function AddFriendsScreen() {
  const { colors, radii, spacing, fontSizes, fontWeights } = useTheme();
  const { myUsername, addFriendByUsername, addFriendByQrScan } = useSocial();
  const [username, setUsername] = useState('');

  function handleSearch() {
    if (!username.trim()) return;
    const ok = addFriendByUsername(username.trim());
    Alert.alert(ok ? 'Friend request sent!' : 'Could not find that username');
    setUsername('');
  }

  function handleScan() {
    // Stub: real version opens the camera (expo-camera / expo-barcode-scanning).
    const ok = addFriendByQrScan();
    Alert.alert(ok ? 'Friend added!' : 'Could not read that code', 'Camera scanning coming soon.');
  }

  function handleShare() {
    Share.share({ message: `Come hang out with my dog on ${APP_NAME}! ${INVITE_LINK}` }).catch(() => {});
  }

  return (
    <ScreenContainer style={{ gap: spacing.lg }}>
      <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>Add friends</Text>

      <Card style={{ alignItems: 'center', gap: spacing.sm }}>
        <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>YOUR CODE</Text>
        <FauxQrCode />
        <Text style={{ color: colors.text, fontWeight: fontWeights.bold }}>@{myUsername}</Text>
      </Card>

      <View style={styles.row}>
        <Button label="Scan a QR code" variant="secondary" onPress={handleScan} style={{ flex: 1 }} />
        <Button label="Share invite link" variant="secondary" onPress={handleShare} style={{ flex: 1 }} />
      </View>

      <Card style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.text, fontWeight: fontWeights.bold }}>Find by username</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="their_username"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          style={{
            backgroundColor: colors.surfaceAlt,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            color: colors.text,
          }}
        />
        <Button label="Add friend" onPress={handleSearch} />
      </Card>
    </ScreenContainer>
  );
}

/** Purely decorative placeholder — not a real scannable QR code. */
function FauxQrCode() {
  const { colors } = useTheme();
  const cells = Array.from({ length: 49 }, (_, i) => (i * 7 + (i % 3)) % 5 < 2);
  return (
    <View style={[styles.qr, { backgroundColor: colors.text }]}>
      {cells.map((filled, i) => (
        <View
          key={i}
          style={[styles.qrCell, { backgroundColor: filled ? colors.surface : colors.text }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  qr: {
    width: 126,
    height: 126,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4,
    borderRadius: 8,
  },
  qrCell: { width: '14.28%', height: '14.28%' },
});

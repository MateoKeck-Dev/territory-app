import React, { useState } from 'react';
import { Alert, Text } from 'react-native';

import { Button } from '../../components/Button';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useTheme } from '../../lib/theme';

export function LocationPermissionScreen() {
  const { colors, fontSizes, fontWeights } = useTheme();
  const { completeOnboarding } = useOnboarding();
  const [asked, setAsked] = useState(false);

  function handleAllow() {
    // Stub: real version requests expo-location's foreground, then
    // background, permission here — the same flow lib/walkTask.ts is
    // built around. Distance, active minutes, route, and sniff spots all
    // get computed from that location data, but entirely on-device.
    setAsked(true);
    Alert.alert('Thanks!', 'Location access granted (stubbed for now).');
  }

  return (
    <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <Text style={{ fontSize: 56 }}>🧭</Text>
      <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold, textAlign: 'center' }}>
        How we measure walks
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm, textAlign: 'center' }}>
        We track your walk's path on your phone to measure distance and find
        sniff spots. Your route stays on your device — we only ever send a
        short summary, never your precise location.
      </Text>

      {!asked ? (
        <Button label="Allow location access" size="lg" onPress={handleAllow} />
      ) : (
        <Button label="Let's go!" size="lg" onPress={completeOnboarding} />
      )}
    </ScreenContainer>
  );
}

import React, { useState } from 'react';
import { Alert, Text } from 'react-native';

import { Button } from '../../components/Button';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useTheme } from '../../lib/theme';

export function MotionPermissionScreen() {
  const { colors, fontSizes, fontWeights } = useTheme();
  const { completeOnboarding } = useOnboarding();
  const [asked, setAsked] = useState(false);

  function handleAllow() {
    // Stub: real version calls the expo-sensors Pedometer permission
    // request here. No location permission is ever requested — steps
    // only.
    setAsked(true);
    Alert.alert('Thanks!', 'Motion & Fitness access granted (stubbed for now).');
  }

  return (
    <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <Text style={{ fontSize: 56 }}>🚶</Text>
      <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold, textAlign: 'center' }}>
        How we measure walks
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm, textAlign: 'center' }}>
        We count your steps to measure walks. We never track your location.
        Your phone can stay in your pocket the whole time.
      </Text>

      {!asked ? (
        <Button label="Allow Motion & Fitness access" size="lg" onPress={handleAllow} />
      ) : (
        <Button label="Let's go!" size="lg" onPress={completeOnboarding} />
      )}
    </ScreenContainer>
  );
}

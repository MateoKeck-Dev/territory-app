import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/Button';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useAuth } from '../../lib/AuthContext';
import { prettyAuthError } from '../../lib/authErrors';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../lib/theme';
import { useDog } from '../../hooks/useDog';
import type { OnboardingStackParamList } from '../../navigation/types';

export function SignUpScreen({
  navigation,
}: {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'SignUp'>;
}) {
  const { colors, spacing, radii, fontSizes, fontWeights } = useTheme();
  const { session } = useAuth();
  const { dog } = useDog();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [accountCreated, setAccountCreated] = useState(false);

  async function handleCreateAccount() {
    setError(null);
    setNotice(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Add an email and a password to continue.');
      return;
    }
    if (password.length < 6) {
      setError('Password needs to be at least 6 characters.');
      return;
    }

    setBusy(true);
    try {
      // Reusing the existing Supabase auth call — nothing new here, just a
      // different point in the flow (after the dog, not before it).
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
      });
      if (signUpError) {
        setError(prettyAuthError(signUpError.message));
        return;
      }
      if (!data.session) {
        setNotice('Check your email to confirm your account — you can keep going for now.');
      }
      setAccountCreated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  const alreadySignedIn = !!session && !accountCreated;

  return (
    <ScreenContainer style={{ gap: spacing.lg }}>
      <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>
        Save {dog.name}'s profile
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
        Create an account so {dog.name}'s house, finds, and progress aren't lost.
      </Text>

      {alreadySignedIn ? (
        <Text style={{ color: colors.text, fontSize: fontSizes.sm }}>
          You're already signed in as {session?.user.email}.
        </Text>
      ) : (
        <View style={{ gap: spacing.md }}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!accountCreated}
            style={{
              backgroundColor: colors.surfaceAlt,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radii.md,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              color: colors.text,
              fontSize: fontSizes.md,
            }}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            secureTextEntry
            editable={!accountCreated}
            style={{
              backgroundColor: colors.surfaceAlt,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radii.md,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              color: colors.text,
              fontSize: fontSizes.md,
            }}
          />

          {error && <Text style={{ color: colors.danger, fontSize: fontSizes.sm }}>{error}</Text>}
          {notice && <Text style={{ color: colors.primaryDark, fontSize: fontSizes.sm }}>{notice}</Text>}

          {!accountCreated && (
            <Button
              label={busy ? '' : 'Create account'}
              onPress={handleCreateAccount}
              disabled={busy}
            />
          )}
          {busy && <ActivityIndicator color={colors.primary} />}
        </View>
      )}

      <Button
        label="Continue"
        size="lg"
        disabled={!accountCreated && !alreadySignedIn}
        onPress={() => navigation.navigate('MotionPermission')}
      />
    </ScreenContainer>
  );
}

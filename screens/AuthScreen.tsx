import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { supabase } from '../lib/supabase';
import { colors } from '../lib/theme';

type Mode = 'signIn' | 'signUp';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signIn');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isSignUp = mode === 'signUp';

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  async function submit() {
    setError(null);
    setNotice(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('A raven needs both an address and a password to fly.');
      return;
    }
    if (isSignUp && password.length < 6) {
      setError('Thy password must be at least 6 characters — guard the keep well.');
      return;
    }

    setBusy(true);
    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: { data: { first_name: firstName.trim() } },
        });
        if (signUpError) {
          setError(prettyAuthError(signUpError.message));
          return;
        }
        // Email-confirmation projects return a user but no session.
        if (!data.session) {
          setNotice(
            'Thy account is forged! Check thine email to confirm it, then return to sign in.',
          );
          setMode('signIn');
          setPassword('');
        }
        // If a session came back, AuthProvider's listener takes it from here.
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (signInError) {
          setError(prettyAuthError(signInError.message));
          return;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went awry. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.crest}>⚔️</Text>
        <Text style={styles.title}>Territory</Text>
        <Text style={styles.subtitle}>
          Claim the realm, one lamppost at a time.
        </Text>

        <View style={styles.tabs}>
          <Tab
            label="Sign In"
            active={!isSignUp}
            onPress={() => switchMode('signIn')}
          />
          <Tab
            label="Sign Up"
            active={isSignUp}
            onPress={() => switchMode('signUp')}
          />
        </View>

        {isSignUp && (
          <Field
            label="Your name, good sire"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Reginald"
            autoCapitalize="words"
          />
        )}

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="knight@realm.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />

        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          autoCapitalize="none"
          secureTextEntry
        />

        {error && <Text style={styles.error}>{error}</Text>}
        {notice && <Text style={styles.notice}>{notice}</Text>}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            busy && styles.buttonDisabled,
          ]}
          disabled={busy}
          onPress={submit}
        >
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? 'Forge my account' : 'Enter the realm'}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={() => switchMode(isSignUp ? 'signIn' : 'signUp')}>
          <Text style={styles.switchHint}>
            {isSignUp
              ? 'Already sworn in? Sign in.'
              : 'New to the realm? Create an account.'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Tab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

type FieldProps = React.ComponentProps<typeof TextInput> & { label: string };

function Field({ label, ...inputProps }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.inkSoft}
        {...inputProps}
      />
    </View>
  );
}

/** Map Supabase's raw auth error strings to something a human wants to read. */
function prettyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) {
    return 'That email and password do not match our records.';
  }
  if (m.includes('already registered') || m.includes('already been registered')) {
    return 'That email is already sworn to the realm. Try signing in.';
  }
  if (m.includes('email not confirmed')) {
    return 'This email is not yet confirmed. Check your inbox for the link.';
  }
  if (m.includes('password should be at least')) {
    return 'Password is too short — at least 6 characters.';
  }
  if (m.includes('unable to validate email address')) {
    return 'That does not look like a valid email address.';
  }
  return message;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.parchment },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 28,
    gap: 14,
  },
  crest: { fontSize: 46, textAlign: 'center' },
  title: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.ink,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: colors.inkSoft,
    marginBottom: 10,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.parchmentDark,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  tabActive: { backgroundColor: colors.crest },
  tabText: { fontSize: 15, fontWeight: '700', color: colors.inkSoft },
  tabTextActive: { color: colors.white },
  field: { gap: 6 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.fieldBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  notice: {
    color: colors.crestDark,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.crest,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonPressed: { backgroundColor: colors.crestDark },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.white, fontSize: 17, fontWeight: '800' },
  switchHint: {
    textAlign: 'center',
    color: colors.inkSoft,
    fontSize: 14,
    marginTop: 4,
  },
});

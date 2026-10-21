import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { listMyDogs, type Dog } from './api';
import { firstNameFromSession, useAuth } from './AuthContext';
import { colors } from './theme';
import WalkFlow from './WalkFlow';
import AuthScreen from '../screens/AuthScreen';
import CreateDogScreen from '../screens/CreateDogScreen';

/**
 * The whole "navigation" of the app right now — three mutually exclusive states,
 * each picked from auth + data, not from user-driven routing:
 *
 *   no session            -> AuthScreen
 *   session, zero dogs     -> CreateDogScreen
 *   session, has a dog     -> WalkFlow (home <-> live walk <-> summary)
 */
export default function RootNavigator() {
  const { session, initializing } = useAuth();

  if (initializing) return <Splash label="Unrolling the map…" />;
  if (!session) return <AuthScreen />;

  // Remount the gate whenever the signed-in user changes.
  return <DogGate key={session.user.id} />;
}

function DogGate() {
  const { session, signOut } = useAuth();
  const token = session?.access_token ?? null;

  const [dogs, setDogs] = useState<Dog[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const result = await listMyDogs(token);
      setDogs(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your dogs.');
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <Splash label={error} tone="error">
        <Pressable style={styles.retry} onPress={load}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
        <Pressable style={styles.retryGhost} onPress={signOut}>
          <Text style={styles.retryGhostText}>Sign out</Text>
        </Pressable>
      </Splash>
    );
  }

  if (dogs === null) return <Splash label="Counting your hounds…" />;

  if (dogs.length === 0) {
    return <CreateDogScreen onCreated={(dog) => setDogs([dog])} />;
  }

  return (
    <WalkFlow
      dog={dogs[0]}
      ownerFirstName={firstNameFromSession(session)}
      onSignOut={signOut}
    />
  );
}

function Splash({
  label,
  tone = 'normal',
  children,
}: {
  label: string;
  tone?: 'normal' | 'error';
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.splash}>
      {tone === 'normal' && <ActivityIndicator size="large" color={colors.crest} />}
      <Text style={[styles.splashText, tone === 'error' && styles.splashError]}>
        {label}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.parchment,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  splashText: {
    fontSize: 16,
    color: colors.inkSoft,
    textAlign: 'center',
    fontWeight: '600',
  },
  splashError: { color: colors.danger },
  retry: {
    backgroundColor: colors.crest,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  retryText: { color: colors.white, fontWeight: '800', fontSize: 15 },
  retryGhost: { paddingVertical: 10, paddingHorizontal: 24 },
  retryGhostText: { color: colors.inkSoft, fontWeight: '700', fontSize: 14 },
});

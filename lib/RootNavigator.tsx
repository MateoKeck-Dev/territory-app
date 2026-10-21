import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { listMyDogs, type Dog } from './api';
import { firstNameFromSession, useAuth } from './AuthContext';
import { supabase } from './supabase';
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

  const [dogs, setDogs] = useState<Dog[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Ref, not state: lets `load` stay referentially stable (empty dep array)
  // while still knowing whether this is the first-ever load.
  const hasLoadedOnce = useRef(false);

  // Deliberately NOT keyed on the access token. Supabase rotates it roughly
  // hourly via autoRefreshToken, which fires onAuthStateChange and would
  // retrigger this on every refresh if it were a dependency — and a failed
  // refetch mid-walk would replace WalkFlow with this screen's error state,
  // unmounting LiveWalkScreen and orphaning the walk server-side. Fetch
  // once per signed-in user instead (RootNavigator already remounts this
  // component via key={session.user.id} when the user changes), reading a
  // fresh token lazily inside load() rather than depending on it.
  const load = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Your session has expired. Sign in again to continue.');

      const result = await listMyDogs(token);
      hasLoadedOnce.current = true;
      setDogs(result);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load your dogs.';
      if (!hasLoadedOnce.current) {
        // Nothing loaded yet — there's no "last known state" to fall back
        // to, so this is the only case where showing the error screen is
        // safe (there's no active walk yet to unmount).
        setError(message);
      } else {
        console.warn('[dogs] background refetch failed, keeping last known dogs:', message);
      }
    }
  }, []);

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

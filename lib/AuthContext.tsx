import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

import { attemptDevAutoLogin } from './devAutoLogin';
import { supabase } from './supabase';

type AuthContextValue = {
  /** Undefined while we're still restoring a persisted session on cold start. */
  session: Session | null;
  initializing: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      let activeSession = data.session;

      // Dev-only convenience: skip the auth screen with a configured test
      // account. No-ops (and is stripped) outside __DEV__ builds.
      if (!activeSession) {
        activeSession = await attemptDevAutoLogin();
      }

      if (!mounted) return;
      setSession(activeSession);
      setInitializing(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      initializing,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>');
  return ctx;
}

/** First name the knight gave us at sign-up, stored in Supabase user metadata. */
export function firstNameFromSession(session: Session | null): string {
  const meta = session?.user?.user_metadata as { first_name?: unknown } | undefined;
  const fromMeta = typeof meta?.first_name === 'string' ? meta.first_name.trim() : '';
  if (fromMeta) return fromMeta;

  const email = session?.user?.email ?? '';
  const local = email.split('@')[0] ?? '';
  if (!local) return 'friend';
  return local.charAt(0).toUpperCase() + local.slice(1);
}

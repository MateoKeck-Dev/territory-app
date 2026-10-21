import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';

/**
 * Local-dev convenience only. The EXPO_PUBLIC_DEV_* reads happen inside this
 * __DEV__ guard (not at module scope) so the strings can't be inlined into
 * a release bundle in the first place — __DEV__ is statically false there,
 * so a minifier can prove everything after the early return is unreachable
 * and strip it, rather than relying on a derived boolean to not be *used*.
 */
export async function attemptDevAutoLogin(): Promise<Session | null> {
  if (!__DEV__) return null;

  const email = process.env.EXPO_PUBLIC_DEV_EMAIL?.trim();
  const password = process.env.EXPO_PUBLIC_DEV_PASSWORD;
  if (!email || !password) return null;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.warn('[dev auto-login] sign-in failed, falling back to the auth screen:', error.message);
    return null;
  }
  return data.session;
}

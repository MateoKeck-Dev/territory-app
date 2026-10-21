import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';

const DEV_EMAIL = process.env.EXPO_PUBLIC_DEV_EMAIL?.trim();
const DEV_PASSWORD = process.env.EXPO_PUBLIC_DEV_PASSWORD;

/**
 * Local-dev convenience only. __DEV__ is statically false in production
 * bundles, so this whole path (and the credentials it reads) is stripped
 * from release builds — the real AuthScreen flow is untouched.
 */
export const devAutoLoginEnabled = __DEV__ && !!DEV_EMAIL && !!DEV_PASSWORD;

/** Signs in with the dev credentials. Returns null (and warns) on failure. */
export async function attemptDevAutoLogin(): Promise<Session | null> {
  if (!devAutoLoginEnabled) return null;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: DEV_EMAIL!,
    password: DEV_PASSWORD!,
  });

  if (error) {
    console.warn('[dev auto-login] sign-in failed, falling back to the auth screen:', error.message);
    return null;
  }
  return data.session;
}

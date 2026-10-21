/** Maps Supabase's raw auth error strings to plain, friendly copy. */
export function prettyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) {
    return 'That email and password don’t match our records.';
  }
  if (m.includes('already registered') || m.includes('already been registered')) {
    return 'That email is already signed up — try signing in instead.';
  }
  if (m.includes('email not confirmed')) {
    return 'This email isn’t confirmed yet. Check your inbox for the link.';
  }
  if (m.includes('password should be at least')) {
    return 'Password is too short — at least 6 characters.';
  }
  if (m.includes('unable to validate email address')) {
    return 'That doesn’t look like a valid email address.';
  }
  return message;
}

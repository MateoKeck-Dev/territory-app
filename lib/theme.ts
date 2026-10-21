/**
 * Shared look-and-feel + the preset choices offered on the "create your dog"
 * screen. Kept deliberately small — avatars are emoji, not uploads (V2 problem).
 */

export const colors = {
  parchment: '#F4ECD8',
  parchmentDark: '#E7DABE',
  ink: '#2B2118',
  inkSoft: '#6B5D4B',
  crest: '#7A2E2E',
  crestDark: '#5E2121',
  border: '#C9B48C',
  danger: '#B23B2E',
  fieldBg: '#FBF6EA',
  white: '#FFFFFF',
};

/** Territory colours — a knight picks their banner from these. */
export const TERRITORY_COLORS: string[] = [
  '#C0392B', // crimson
  '#E67E22', // amber
  '#F1C40F', // gold
  '#27AE60', // forest
  '#16A085', // teal
  '#2980B9', // royal blue
  '#8E44AD', // indigo
  '#E84393', // rose
];

export type AvatarOption = { id: string; emoji: string; label: string };

/** avatar_id sent to the API is the `id` string; the emoji is just for display. */
export const AVATARS: AvatarOption[] = [
  { id: 'hound', emoji: '🐕', label: 'Hound' },
  { id: 'wolf', emoji: '🐺', label: 'Wolf' },
  { id: 'paw', emoji: '🐾', label: 'Paw' },
  { id: 'bone', emoji: '🦴', label: 'Bone' },
  { id: 'crown', emoji: '👑', label: 'Crown' },
  { id: 'shield', emoji: '🛡️', label: 'Shield' },
  { id: 'sword', emoji: '⚔️', label: 'Blade' },
  { id: 'castle', emoji: '🏰', label: 'Keep' },
];

export function avatarEmoji(avatarId: string | null | undefined): string {
  return AVATARS.find((a) => a.id === avatarId)?.emoji ?? '🐾';
}

/**
 * Single source of truth for every visual asset in the app. Nothing
 * outside this file should hardcode a glyph, color, or (later) image path
 * for a game asset — look it up here by key instead. Right now everything
 * resolves to a placeholder shape or emoji; swapping in real illustrations
 * later means adding an `{ kind: 'image', source: require(...) }` case to
 * AssetRef and changing entries in this file, not touching any screen.
 */

export type AssetRef =
  | { kind: 'shape'; shape: 'circle' | 'oval' | 'triangle'; tint: 'base' | 'marking' }
  | { kind: 'emoji'; glyph: string };
// Future: | { kind: 'image'; source: ImageSourcePropType }

export type EarStyle = 'floppy' | 'perked' | 'cropped';
export type TailStyle = 'curly' | 'straight' | 'fluffy';
export type OutfitId = 'none' | 'bandana' | 'bowtie';

export const earStyleOptions: EarStyle[] = ['floppy', 'perked', 'cropped'];
export const tailStyleOptions: TailStyle[] = ['curly', 'straight', 'fluffy'];
export const outfitOptions: OutfitId[] = ['none', 'bandana', 'bowtie'];

/** Dog avatar parts, layered bottom to top: tail, base body, markings,
 * ears, outfit. Each keyed by the style id a user picks in onboarding. */
export const dogPartAssets = {
  ears: {
    floppy: { kind: 'shape', shape: 'oval', tint: 'base' } as AssetRef,
    perked: { kind: 'shape', shape: 'triangle', tint: 'base' } as AssetRef,
    cropped: { kind: 'shape', shape: 'circle', tint: 'base' } as AssetRef,
  } satisfies Record<EarStyle, AssetRef>,

  tail: {
    curly: { kind: 'shape', shape: 'circle', tint: 'base' } as AssetRef,
    straight: { kind: 'shape', shape: 'oval', tint: 'base' } as AssetRef,
    fluffy: { kind: 'shape', shape: 'circle', tint: 'base' } as AssetRef,
  } satisfies Record<TailStyle, AssetRef>,

  outfits: {
    none: null,
    bandana: { kind: 'emoji', glyph: '🧣' } as AssetRef,
    bowtie: { kind: 'emoji', glyph: '🎀' } as AssetRef,
  } satisfies Record<OutfitId, AssetRef | null>,
};

/**
 * Found-item / catalogue / mini-game glyphs. Keyed by each item's stable
 * id (see mocks/items.ts, mocks/catalogue.ts, mocks/miniGames.ts, which
 * import from here rather than inlining emoji themselves) so every visual
 * still funnels through this one file even though these don't need
 * layering the way the dog avatar does.
 */
export const itemAssetGlyphs: Record<string, string> = {
  'item-1': '🌲',
  'item-2': '🎾',
  'item-3': '🟫',
  'item-4': '💎',
  'item-5': '✨',
  'item-6': '🎃',
  'item-7': '🌰',
  'item-8': '🦴',
  'drop-pinecone': '🌲',
  'drop-acorn': '🌰',
  'drop-stick': '🪵',
  'drop-feather': '🪶',
  'drop-fairy-lights': '✨',
  'drop-cosy-rug': '🟫',
  'drop-lucky-clover': '🍀',
  'drop-shiny-pebble': '💎',
  'drop-golden-bone': '🦴',
  'drop-pumpkin': '🎃',
};

export const catalogueAssetGlyphs: Record<string, string> = {
  'cat-1': '🧶',
  'cat-2': '🪔',
  'cat-3': '🛋️',
  'cat-4': '☕',
  'cat-5': '🚀',
  'cat-6': '🌌',
  'cat-7': '🤖',
  'cat-8': '🎃',
  'cat-9': '🕸️',
  'cat-10': '🦇',
  'cat-11': '🎄',
  'cat-12': '🧦',
  'cat-13': '❄️',
};

export const miniGameAssetGlyphs: Record<string, string> = {
  fetch: '🎾',
  frisbee: '🥏',
  agility: '🏃',
  hideseek: '🙈',
};

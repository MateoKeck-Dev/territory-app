import { itemAssetGlyphs } from '../lib/assetRegistry';
import type { Rarity } from '../lib/theme';

export type InventoryItem = {
  id: string;
  name: string;
  emoji: string;
  rarity: Rarity;
  coinValue: number;
  placed: boolean;
};

function glyph(key: string): string {
  return itemAssetGlyphs[key] ?? '❓';
}

export const mockInventory: InventoryItem[] = [
  { id: 'item-1', name: 'Pinecone', emoji: glyph('item-1'), rarity: 'common', coinValue: 5, placed: true },
  { id: 'item-2', name: 'Tennis Ball', emoji: glyph('item-2'), rarity: 'common', coinValue: 5, placed: false },
  { id: 'item-3', name: 'Cosy Rug', emoji: glyph('item-3'), rarity: 'uncommon', coinValue: 15, placed: true },
  { id: 'item-4', name: 'Shiny Pebble', emoji: glyph('item-4'), rarity: 'rare', coinValue: 40, placed: false },
  { id: 'item-5', name: 'Fairy Lights', emoji: glyph('item-5'), rarity: 'uncommon', coinValue: 18, placed: false },
  { id: 'item-6', name: 'Pumpkin', emoji: glyph('item-6'), rarity: 'seasonal', coinValue: 30, placed: false },
  { id: 'item-7', name: 'Acorn', emoji: glyph('item-7'), rarity: 'common', coinValue: 4, placed: false },
  { id: 'item-8', name: 'Golden Bone', emoji: glyph('item-8'), rarity: 'rare', coinValue: 50, placed: false },
];

type DropTemplate = { assetKey: string; name: string; rarity: Rarity; coinValue: number };

/** Pool new walk/welcome-gift drops are rolled from. */
const dropPool: DropTemplate[] = [
  { assetKey: 'drop-pinecone', name: 'Pinecone', rarity: 'common', coinValue: 5 },
  { assetKey: 'drop-acorn', name: 'Acorn', rarity: 'common', coinValue: 4 },
  { assetKey: 'drop-stick', name: 'Stick', rarity: 'common', coinValue: 3 },
  { assetKey: 'drop-feather', name: 'Feather', rarity: 'common', coinValue: 4 },
  { assetKey: 'drop-fairy-lights', name: 'Fairy Lights', rarity: 'uncommon', coinValue: 18 },
  { assetKey: 'drop-cosy-rug', name: 'Cosy Rug', rarity: 'uncommon', coinValue: 15 },
  { assetKey: 'drop-lucky-clover', name: 'Lucky Clover', rarity: 'uncommon', coinValue: 20 },
  { assetKey: 'drop-shiny-pebble', name: 'Shiny Pebble', rarity: 'rare', coinValue: 40 },
  { assetKey: 'drop-golden-bone', name: 'Golden Bone', rarity: 'rare', coinValue: 50 },
  { assetKey: 'drop-pumpkin', name: 'Pumpkin', rarity: 'seasonal', coinValue: 30 },
];

/** Rolls exactly `count` random drops — used by onboarding's welcome gift
 * directly, and by lib/walk/drops.ts's rollDropsForWalk (which decides
 * `count` from the walk summary) for real walks. */
export function rollDrops(count: number): InventoryItem[] {
  const n = Math.max(0, count);
  return Array.from({ length: n }, (_, i) => {
    const template = dropPool[Math.floor(Math.random() * dropPool.length)];
    return {
      id: `drop-${Date.now()}-${i}`,
      name: template.name,
      emoji: glyph(template.assetKey),
      rarity: template.rarity,
      coinValue: template.coinValue,
      placed: false,
    };
  });
}

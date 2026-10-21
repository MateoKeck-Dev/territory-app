import type { Rarity } from '../lib/theme';

export type InventoryItem = {
  id: string;
  name: string;
  emoji: string;
  rarity: Rarity;
  coinValue: number;
  placed: boolean;
};

export const mockInventory: InventoryItem[] = [
  { id: 'item-1', name: 'Pinecone', emoji: '🌲', rarity: 'common', coinValue: 5, placed: true },
  { id: 'item-2', name: 'Tennis Ball', emoji: '🎾', rarity: 'common', coinValue: 5, placed: false },
  { id: 'item-3', name: 'Cosy Rug', emoji: '🟫', rarity: 'uncommon', coinValue: 15, placed: true },
  { id: 'item-4', name: 'Shiny Pebble', emoji: '💎', rarity: 'rare', coinValue: 40, placed: false },
  { id: 'item-5', name: 'Fairy Lights', emoji: '✨', rarity: 'uncommon', coinValue: 18, placed: false },
  { id: 'item-6', name: 'Pumpkin', emoji: '🎃', rarity: 'seasonal', coinValue: 30, placed: false },
  { id: 'item-7', name: 'Acorn', emoji: '🌰', rarity: 'common', coinValue: 4, placed: false },
  { id: 'item-8', name: 'Golden Bone', emoji: '🦴', rarity: 'rare', coinValue: 50, placed: false },
];

/** Pool new walk drops are rolled from — see mocks/drops.ts. */
export const dropPool: Omit<InventoryItem, 'id' | 'placed'>[] = [
  { name: 'Pinecone', emoji: '🌲', rarity: 'common', coinValue: 5 },
  { name: 'Acorn', emoji: '🌰', rarity: 'common', coinValue: 4 },
  { name: 'Stick', emoji: '🪵', rarity: 'common', coinValue: 3 },
  { name: 'Feather', emoji: '🪶', rarity: 'common', coinValue: 4 },
  { name: 'Fairy Lights', emoji: '✨', rarity: 'uncommon', coinValue: 18 },
  { name: 'Cosy Rug', emoji: '🟫', rarity: 'uncommon', coinValue: 15 },
  { name: 'Lucky Clover', emoji: '🍀', rarity: 'uncommon', coinValue: 20 },
  { name: 'Shiny Pebble', emoji: '💎', rarity: 'rare', coinValue: 40 },
  { name: 'Golden Bone', emoji: '🦴', rarity: 'rare', coinValue: 50 },
  { name: 'Pumpkin', emoji: '🎃', rarity: 'seasonal', coinValue: 30 },
];

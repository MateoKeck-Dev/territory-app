import { miniGameAssetGlyphs } from '../lib/assetRegistry';

export type MiniGame = {
  id: string;
  name: string;
  emoji: string;
};

function glyph(id: string): string {
  return miniGameAssetGlyphs[id] ?? '❓';
}

export const mockMiniGames: MiniGame[] = [
  { id: 'fetch', name: 'Fetch', emoji: glyph('fetch') },
  { id: 'frisbee', name: 'Frisbee', emoji: glyph('frisbee') },
  { id: 'agility', name: 'Agility', emoji: glyph('agility') },
  { id: 'hideseek', name: 'Hide & Seek', emoji: glyph('hideseek') },
];

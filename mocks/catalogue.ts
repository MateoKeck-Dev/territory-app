import { catalogueAssetGlyphs } from '../lib/assetRegistry';

export type Collection = 'Cosy' | 'Sci-fi' | 'Halloween' | 'Christmas';
export type Currency = 'coins' | 'premium';

export type CatalogueItem = {
  id: string;
  name: string;
  emoji: string;
  collection: Collection;
  currency: Currency;
  price: number;
};

function glyph(id: string): string {
  return catalogueAssetGlyphs[id] ?? '❓';
}

export const mockCatalogue: CatalogueItem[] = [
  { id: 'cat-1', name: 'Knit Blanket', emoji: glyph('cat-1'), collection: 'Cosy', currency: 'coins', price: 20 },
  { id: 'cat-2', name: 'Reading Lamp', emoji: glyph('cat-2'), collection: 'Cosy', currency: 'coins', price: 25 },
  { id: 'cat-3', name: 'Armchair', emoji: glyph('cat-3'), collection: 'Cosy', currency: 'coins', price: 60 },
  { id: 'cat-4', name: 'Hot Cocoa', emoji: glyph('cat-4'), collection: 'Cosy', currency: 'coins', price: 10 },
  { id: 'cat-5', name: 'Rocket Lamp', emoji: glyph('cat-5'), collection: 'Sci-fi', currency: 'premium', price: 3 },
  { id: 'cat-6', name: 'Star Rug', emoji: glyph('cat-6'), collection: 'Sci-fi', currency: 'premium', price: 2 },
  { id: 'cat-7', name: 'Robot Pal', emoji: glyph('cat-7'), collection: 'Sci-fi', currency: 'premium', price: 5 },
  { id: 'cat-8', name: 'Carved Pumpkin', emoji: glyph('cat-8'), collection: 'Halloween', currency: 'coins', price: 30 },
  { id: 'cat-9', name: 'Spooky Web', emoji: glyph('cat-9'), collection: 'Halloween', currency: 'coins', price: 15 },
  { id: 'cat-10', name: 'Bat Lantern', emoji: glyph('cat-10'), collection: 'Halloween', currency: 'premium', price: 2 },
  { id: 'cat-11', name: 'Tiny Tree', emoji: glyph('cat-11'), collection: 'Christmas', currency: 'coins', price: 35 },
  { id: 'cat-12', name: 'Stocking', emoji: glyph('cat-12'), collection: 'Christmas', currency: 'coins', price: 12 },
  { id: 'cat-13', name: 'Snow Globe', emoji: glyph('cat-13'), collection: 'Christmas', currency: 'premium', price: 4 },
];

export const collections: Collection[] = ['Cosy', 'Sci-fi', 'Halloween', 'Christmas'];

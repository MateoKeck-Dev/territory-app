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

export const mockCatalogue: CatalogueItem[] = [
  { id: 'cat-1', name: 'Knit Blanket', emoji: '🧶', collection: 'Cosy', currency: 'coins', price: 20 },
  { id: 'cat-2', name: 'Reading Lamp', emoji: '🪔', collection: 'Cosy', currency: 'coins', price: 25 },
  { id: 'cat-3', name: 'Armchair', emoji: '🛋️', collection: 'Cosy', currency: 'coins', price: 60 },
  { id: 'cat-4', name: 'Hot Cocoa', emoji: '☕', collection: 'Cosy', currency: 'coins', price: 10 },
  { id: 'cat-5', name: 'Rocket Lamp', emoji: '🚀', collection: 'Sci-fi', currency: 'premium', price: 3 },
  { id: 'cat-6', name: 'Star Rug', emoji: '🌌', collection: 'Sci-fi', currency: 'premium', price: 2 },
  { id: 'cat-7', name: 'Robot Pal', emoji: '🤖', collection: 'Sci-fi', currency: 'premium', price: 5 },
  { id: 'cat-8', name: 'Carved Pumpkin', emoji: '🎃', collection: 'Halloween', currency: 'coins', price: 30 },
  { id: 'cat-9', name: 'Spooky Web', emoji: '🕸️', collection: 'Halloween', currency: 'coins', price: 15 },
  { id: 'cat-10', name: 'Bat Lantern', emoji: '🦇', collection: 'Halloween', currency: 'premium', price: 2 },
  { id: 'cat-11', name: 'Tiny Tree', emoji: '🎄', collection: 'Christmas', currency: 'coins', price: 35 },
  { id: 'cat-12', name: 'Stocking', emoji: '🧦', collection: 'Christmas', currency: 'coins', price: 12 },
  { id: 'cat-13', name: 'Snow Globe', emoji: '❄️', collection: 'Christmas', currency: 'premium', price: 4 },
];

export const collections: Collection[] = ['Cosy', 'Sci-fi', 'Halloween', 'Christmas'];

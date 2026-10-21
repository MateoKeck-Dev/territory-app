import type { EarStyle, OutfitId, TailStyle } from '../lib/assetRegistry';

export type DogMarkings = {
  baseColor: string;
  markingColor: string;
  pattern: 'solid' | 'spots' | 'patch';
  earStyle: EarStyle;
  tailStyle: TailStyle;
  outfitId: OutfitId;
};

export type DogProfile = {
  id: string;
  name: string;
  breed: string;
  markings: DogMarkings;
  stats: {
    totalWalks: number;
    totalDistanceKm: number;
    streakDays: number;
    itemsFound: number;
  };
};

export const dogPatterns: DogMarkings['pattern'][] = ['solid', 'spots', 'patch'];

/** Simple placeholder palette for the dog-creation step — real art later. */
export const markingColors: string[] = [
  '#E8A866', // tan
  '#4A3A2E', // dark brown
  '#F5F0E6', // cream
  '#3A3A3A', // black/grey
  '#D9743A', // red/ginger
  '#B7B7B7', // silver
];

export const mockDog: DogProfile = {
  id: 'dog-1',
  name: 'Biscuit',
  breed: 'Corgi mix',
  markings: {
    baseColor: '#E8A866',
    markingColor: '#FFF4E3',
    pattern: 'patch',
    earStyle: 'floppy',
    tailStyle: 'fluffy',
    outfitId: 'none',
  },
  stats: {
    totalWalks: 14,
    totalDistanceKm: 38.2,
    streakDays: 3,
    itemsFound: 21,
  },
};

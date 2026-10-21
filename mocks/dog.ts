export type DogMarkings = {
  baseColor: string;
  spotColor?: string;
  pattern: 'solid' | 'spots' | 'patch';
  earEmoji: string;
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

export const mockDog: DogProfile = {
  id: 'dog-1',
  name: 'Biscuit',
  breed: 'Corgi mix',
  markings: {
    baseColor: '#E8A866',
    spotColor: '#FFF4E3',
    pattern: 'patch',
    earEmoji: '🐶',
  },
  stats: {
    totalWalks: 14,
    totalDistanceKm: 38.2,
    streakDays: 3,
    itemsFound: 21,
  },
};

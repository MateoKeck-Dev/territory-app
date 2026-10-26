export type PackMember = {
  id: string;
  name: string;
  dogName: string;
  distanceKmThisWeek: number;
};

export type Pack = {
  id: string;
  name: string;
  members: PackMember[];
  goalDistanceKm: number;
  progressDistanceKm: number;
};

export const mockPack: Pack = {
  id: 'pack-1',
  name: 'The Backyard Buddies',
  members: [
    { id: 'me', name: 'You', dogName: 'Biscuit', distanceKmThisWeek: 8.2 },
    { id: 'f-1', name: 'Nora', dogName: 'Pepper', distanceKmThisWeek: 6.1 },
    { id: 'f-2', name: 'Theo', dogName: 'Mochi', distanceKmThisWeek: 4.3 },
  ],
  goalDistanceKm: 25,
  progressDistanceKm: 18.6,
};

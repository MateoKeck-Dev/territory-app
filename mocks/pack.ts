export type PackMember = {
  id: string;
  name: string;
  dogName: string;
  stepsThisWeek: number;
};

export type Pack = {
  id: string;
  name: string;
  members: PackMember[];
  goalSteps: number;
  progressSteps: number;
};

export const mockPack: Pack = {
  id: 'pack-1',
  name: 'The Backyard Buddies',
  members: [
    { id: 'me', name: 'You', dogName: 'Biscuit', stepsThisWeek: 8200 },
    { id: 'f-1', name: 'Nora', dogName: 'Pepper', stepsThisWeek: 6100 },
    { id: 'f-2', name: 'Theo', dogName: 'Mochi', stepsThisWeek: 4300 },
  ],
  goalSteps: 25000,
  progressSteps: 18600,
};

export type Friend = {
  id: string;
  name: string;
  dogName: string;
  avatarEmoji: string;
};

export const mockFriends: Friend[] = [
  { id: 'f-1', name: 'Nora', dogName: 'Pepper', avatarEmoji: '🐩' },
  { id: 'f-2', name: 'Theo', dogName: 'Mochi', avatarEmoji: '🐕' },
  { id: 'f-3', name: 'Ada', dogName: 'Finn', avatarEmoji: '🦮' },
];

export type PawPrint = {
  id: string;
  fromName: string;
  fromDogName: string;
  whenLabel: string;
};

export const mockPawPrints: PawPrint[] = [
  { id: 'pp-1', fromName: 'Nora', fromDogName: 'Pepper', whenLabel: '2h ago' },
  { id: 'pp-2', fromName: 'Theo', fromDogName: 'Mochi', whenLabel: 'Yesterday' },
];

export const myUsername = 'biscuit_and_you';

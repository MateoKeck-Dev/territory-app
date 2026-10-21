export type MiniGame = {
  id: string;
  name: string;
  emoji: string;
};

export const mockMiniGames: MiniGame[] = [
  { id: 'fetch', name: 'Fetch', emoji: '🎾' },
  { id: 'frisbee', name: 'Frisbee', emoji: '🥏' },
  { id: 'agility', name: 'Agility', emoji: '🏃' },
  { id: 'hideseek', name: 'Hide & Seek', emoji: '🙈' },
];

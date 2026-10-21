export type ChallengeCategory = 'Walking' | 'Mini games' | 'Pack';
export type ChallengePeriod = 'daily' | 'weekly';

export type Challenge = {
  id: string;
  category: ChallengeCategory;
  title: string;
  progress: number; // 0..1
  reward: string;
  period: ChallengePeriod;
};

export const mockChallenges: Challenge[] = [
  { id: 'ch-1', category: 'Walking', title: 'Walk 2,000 steps', progress: 0.65, reward: '15 coins', period: 'daily' },
  { id: 'ch-2', category: 'Walking', title: 'Go on 5 walks this week', progress: 0.4, reward: 'Rare find', period: 'weekly' },
  { id: 'ch-3', category: 'Mini games', title: 'Play Fetch 3 times', progress: 0.33, reward: '10 coins', period: 'daily' },
  { id: 'ch-4', category: 'Mini games', title: 'Try every mini game', progress: 0.25, reward: '20 coins', period: 'weekly' },
  { id: 'ch-5', category: 'Pack', title: 'Pack walks 10,000 steps together', progress: 0.52, reward: 'Pack badge', period: 'weekly' },
  { id: 'ch-6', category: 'Pack', title: 'Visit a pack member’s house', progress: 1, reward: '5 coins', period: 'daily' },
];

export type LeaderboardKind = 'Longest walk' | 'Most walks' | 'Longest streak' | 'Packs' | 'Mini games';
export type LeaderboardScope = 'Friends' | 'Pack' | 'Global';

export type LeaderboardEntry = {
  id: string;
  name: string;
  value: string;
  isMe?: boolean;
};

const sampleBoard: LeaderboardEntry[] = [
  { id: 'p1', name: 'Nora & Pepper', value: '—' },
  { id: 'me', name: 'You & Biscuit', value: '—', isMe: true },
  { id: 'p2', name: 'Theo & Mochi', value: '—' },
  { id: 'p3', name: 'Ada & Finn', value: '—' },
];

function board(values: string[]): LeaderboardEntry[] {
  return sampleBoard.map((e, i) => ({ ...e, value: values[i] ?? '—' }));
}

export const mockLeaderboards: Record<LeaderboardKind, Record<LeaderboardScope, LeaderboardEntry[]>> = {
  'Longest walk': {
    Friends: board(['4.8 km', '3.1 km', '2.6 km', '2.0 km']),
    Pack: board(['5.2 km', '3.1 km', '2.9 km', '1.4 km']),
    Global: board(['12.3 km', '3.1 km', '10.8 km', '9.9 km']),
  },
  'Most walks': {
    Friends: board(['9', '7', '6', '4']),
    Pack: board(['11', '7', '8', '3']),
    Global: board(['40', '7', '38', '35']),
  },
  'Longest streak': {
    Friends: board(['6 days', '3 days', '2 days', '1 day']),
    Pack: board(['9 days', '3 days', '5 days', '1 day']),
    Global: board(['61 days', '3 days', '50 days', '44 days']),
  },
  Packs: {
    Friends: board(['—', '—', '—', '—']),
    Pack: board(['2,400 steps', '1,800 steps', '1,200 steps', '900 steps']),
    Global: board(['88,000 steps', '1,800 steps', '81,000 steps', '76,000 steps']),
  },
  'Mini games': {
    Friends: board(['18 plays', '12 plays', '9 plays', '5 plays']),
    Pack: board(['21 plays', '12 plays', '14 plays', '6 plays']),
    Global: board(['140 plays', '12 plays', '133 plays', '120 plays']),
  },
};

export const leaderboardKinds: LeaderboardKind[] = [
  'Longest walk',
  'Most walks',
  'Longest streak',
  'Packs',
  'Mini games',
];

export const leaderboardScopes: LeaderboardScope[] = ['Friends', 'Pack', 'Global'];

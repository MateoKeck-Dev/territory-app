import {
  mockChallenges,
  mockLeaderboards,
  type Challenge,
  type ChallengeCategory,
  type LeaderboardKind,
  type LeaderboardScope,
} from '../mocks/challenges';

/** Challenges + leaderboards slice. Read-only mock data for now; swap for
 * a real GET /challenges + GET /leaderboards call later. */
export function useChallenges() {
  function byCategory(category: ChallengeCategory): Challenge[] {
    return mockChallenges.filter((c) => c.category === category);
  }

  function leaderboard(kind: LeaderboardKind, scope: LeaderboardScope) {
    return mockLeaderboards[kind][scope];
  }

  return { challenges: mockChallenges, byCategory, leaderboard };
}

import { useGameData } from './GameDataProvider';

/** Coin balance slice of the shared game data. */
export function useCoins() {
  const { coins, addCoins, spendCoins } = useGameData();
  return { coins, addCoins, spendCoins };
}

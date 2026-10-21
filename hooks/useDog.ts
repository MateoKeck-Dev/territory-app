import { useGameData } from './GameDataProvider';

/** Dog profile slice of the shared game data. Swap for a real GET/PATCH
 * /dogs/me call later inside GameDataProvider without touching screens. */
export function useDog() {
  const { dog, updateDog } = useGameData();
  return { dog, updateDog };
}

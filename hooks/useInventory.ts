import { useGameData } from './GameDataProvider';

/** Inventory slice of the shared game data: found items, sell, display. */
export function useInventory() {
  const { inventory, sellItem, toggleDisplay } = useGameData();
  return { items: inventory, sellItem, toggleDisplay };
}

import React, { createContext, useCallback, useContext, useState } from 'react';

import { mockDog, type DogProfile } from '../mocks/dog';
import { mockInventory, type InventoryItem } from '../mocks/items';
import { mockWalkHistory, type WalkRecord } from '../mocks/walkHistory';

type GameData = {
  dog: DogProfile;
  updateDog: (patch: Partial<DogProfile>) => void;

  coins: number;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;

  inventory: InventoryItem[];
  addItems: (items: InventoryItem[]) => void;
  sellItem: (id: string) => void;
  toggleDisplay: (id: string) => void;

  ownedCatalogueIds: string[];
  buyCatalogueItem: (id: string) => void;

  walkHistory: WalkRecord[];
  addWalkRecord: (record: WalkRecord) => void;

  hasOnboarded: boolean;
  completeOnboarding: () => void;
  /** True only right after onboarding finishes, so Home can show a
   * one-time "take [dog] on their first walk" nudge instead of the usual
   * one. Cleared the first time something reads it. */
  justOnboarded: boolean;
  acknowledgeFirstWalkNudge: () => void;
};

const GameDataContext = createContext<GameData | undefined>(undefined);

/**
 * Single in-memory store for all the mock "save data" screens share
 * (coins, inventory, dog, walk history, catalogue ownership). This is the
 * data-access layer: screens read it through the useDog/useInventory/etc.
 * hooks below, never this file directly, so swapping any slice for a real
 * API later doesn't touch screen code.
 */
export function GameDataProvider({ children }: { children: React.ReactNode }) {
  const [dog, setDog] = useState<DogProfile>(mockDog);
  const [coins, setCoins] = useState(240);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [ownedCatalogueIds, setOwnedCatalogueIds] = useState<string[]>([]);
  const [walkHistory, setWalkHistory] = useState<WalkRecord[]>(mockWalkHistory);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [justOnboarded, setJustOnboarded] = useState(false);

  const updateDog = useCallback((patch: Partial<DogProfile>) => {
    setDog((prev) => ({ ...prev, ...patch }));
  }, []);

  const addCoins = useCallback((amount: number) => setCoins((c) => c + amount), []);

  const spendCoins = useCallback((amount: number) => {
    let ok = false;
    setCoins((c) => {
      if (c < amount) return c;
      ok = true;
      return c - amount;
    });
    return ok;
  }, []);

  const addItems = useCallback((items: InventoryItem[]) => {
    setInventory((prev) => [...items, ...prev]);
  }, []);

  const sellItem = useCallback((id: string) => {
    setInventory((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) setCoins((c) => c + item.coinValue);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const toggleDisplay = useCallback((id: string) => {
    setInventory((prev) => prev.map((i) => (i.id === id ? { ...i, placed: !i.placed } : i)));
  }, []);

  const buyCatalogueItem = useCallback((id: string) => {
    setOwnedCatalogueIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const addWalkRecord = useCallback((record: WalkRecord) => {
    setWalkHistory((prev) => [record, ...prev]);
  }, []);

  const completeOnboarding = useCallback(() => {
    setHasOnboarded(true);
    setJustOnboarded(true);
  }, []);

  const acknowledgeFirstWalkNudge = useCallback(() => setJustOnboarded(false), []);

  const value: GameData = {
    dog,
    updateDog,
    coins,
    addCoins,
    spendCoins,
    inventory,
    addItems,
    sellItem,
    toggleDisplay,
    ownedCatalogueIds,
    buyCatalogueItem,
    walkHistory,
    addWalkRecord,
    hasOnboarded,
    completeOnboarding,
    justOnboarded,
    acknowledgeFirstWalkNudge,
  };

  return <GameDataContext.Provider value={value}>{children}</GameDataContext.Provider>;
}

export function useGameData(): GameData {
  const ctx = useContext(GameDataContext);
  if (!ctx) throw new Error('useGameData must be used within a <GameDataProvider>');
  return ctx;
}

import React, { createContext, useCallback, useContext, useState } from 'react';

import { mockDog, type DogProfile } from '../mocks/dog';
import { mockInventory, rollDrops, type InventoryItem } from '../mocks/items';
import { mockWalkHistory, type WalkRecord } from '../mocks/walkHistory';

type WalkSessionPhase = 'idle' | 'active' | 'recap' | 'revealing' | 'done';
type RouteNovelty = 'new' | 'regular';

type WalkResult = {
  distanceKm: number;
  activeMinutes: number;
  sniffSpotsHit: number;
  routeNovelty: RouteNovelty;
  drops: InventoryItem[];
};

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

  // Walk session: shared state, not screen-local — WalkStartScreen,
  // WalkActiveScreen, WalkRecapScreen, and DropRevealScreen are each a
  // separate component instance, so this must live here (or another
  // shared provider) rather than in a useState inside a hook they each
  // call independently, or each screen would see its own disconnected copy.
  walkPhase: WalkSessionPhase;
  walkStartedAt: number | null;
  walkResult: WalkResult | null;
  startWalk: () => void;
  endWalk: () => void;
  beginReveal: () => void;
  finishReveal: () => void;
  resetWalkSession: () => void;
};

const GameDataContext = createContext<GameData | undefined>(undefined);

/**
 * Single in-memory store for all the mock "save data" screens share
 * (coins, inventory, dog, walk history, catalogue ownership, the walk
 * session in progress). This is the data-access layer: screens read it
 * through the useDog/useInventory/useWalkSession/etc. hooks below, never
 * this file directly, so swapping any slice for a real API later doesn't
 * touch screen code.
 */
export function GameDataProvider({ children }: { children: React.ReactNode }) {
  const [dog, setDog] = useState<DogProfile>(mockDog);
  const [coins, setCoins] = useState(240);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [ownedCatalogueIds, setOwnedCatalogueIds] = useState<string[]>([]);
  const [walkHistory, setWalkHistory] = useState<WalkRecord[]>(mockWalkHistory);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [justOnboarded, setJustOnboarded] = useState(false);
  const [walkPhase, setWalkPhase] = useState<WalkSessionPhase>('idle');
  const [walkStartedAt, setWalkStartedAt] = useState<number | null>(null);
  const [walkResult, setWalkResult] = useState<WalkResult | null>(null);

  const updateDog = useCallback((patch: Partial<DogProfile>) => {
    setDog((prev) => ({ ...prev, ...patch }));
  }, []);

  const addCoins = useCallback((amount: number) => setCoins((c) => c + amount), []);

  // Reads the balance synchronously rather than deciding inside the
  // setCoins updater: that updater can run after this function has
  // already returned (React never guarantees it runs inline), so a flag
  // set inside it and read right after would always read its initial
  // value — the purchase would silently succeed in state while the caller
  // was told it failed.
  const spendCoins = useCallback(
    (amount: number) => {
      if (coins < amount) return false;
      setCoins((c) => c - amount);
      return true;
    },
    [coins],
  );

  const addItems = useCallback((items: InventoryItem[]) => {
    setInventory((prev) => [...items, ...prev]);
  }, []);

  // Reads the item from current state rather than inside the setInventory
  // updater: updaters must stay pure (React can invoke one more than once,
  // e.g. under StrictMode), and calling setCoins from inside one would
  // double-credit on a repeat invocation.
  const sellItem = useCallback(
    (id: string) => {
      const item = inventory.find((i) => i.id === id);
      if (!item) return;
      setCoins((c) => c + item.coinValue);
      setInventory((prev) => prev.filter((i) => i.id !== id));
    },
    [inventory],
  );

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

  const startWalk = useCallback(() => {
    if (justOnboarded) acknowledgeFirstWalkNudge();
    setWalkStartedAt(Date.now());
    setWalkResult(null);
    setWalkPhase('active');
  }, [justOnboarded, acknowledgeFirstWalkNudge]);

  const endWalk = useCallback(() => {
    const elapsedMin = walkStartedAt
      ? Math.max(1, Math.round((Date.now() - walkStartedAt) / 60000))
      : 5;
    // Mock GPS-derived numbers scaled to elapsed time, not a real track.
    // ~70-100m/min is a plausible dog-walking pace for the mock.
    const distanceKm = Math.round(elapsedMin * (0.07 + Math.random() * 0.03) * 100) / 100;
    const sniffSpotsHit = Math.floor(Math.random() * 4);
    const routeNovelty: RouteNovelty = Math.random() < 0.3 ? 'new' : 'regular';
    setWalkResult({
      distanceKm,
      activeMinutes: elapsedMin,
      sniffSpotsHit,
      routeNovelty,
      drops: rollDrops(),
    });
    setWalkPhase('recap');
  }, [walkStartedAt]);

  const beginReveal = useCallback(() => setWalkPhase('revealing'), []);

  const finishReveal = useCallback(() => {
    if (walkResult) {
      addItems(walkResult.drops);
      addWalkRecord({
        id: `walk-${Date.now()}`,
        dateLabel: 'Today',
        distanceKm: walkResult.distanceKm,
        activeMinutes: walkResult.activeMinutes,
        sniffSpotsHit: walkResult.sniffSpotsHit,
        itemsFound: walkResult.drops.length,
      });
    }
    setWalkPhase('done');
  }, [walkResult, addItems, addWalkRecord]);

  const resetWalkSession = useCallback(() => {
    setWalkPhase('idle');
    setWalkStartedAt(null);
    setWalkResult(null);
  }, []);

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
    walkPhase,
    walkStartedAt,
    walkResult,
    startWalk,
    endWalk,
    beginReveal,
    finishReveal,
    resetWalkSession,
  };

  return <GameDataContext.Provider value={value}>{children}</GameDataContext.Provider>;
}

export function useGameData(): GameData {
  const ctx = useContext(GameDataContext);
  if (!ctx) throw new Error('useGameData must be used within a <GameDataProvider>');
  return ctx;
}

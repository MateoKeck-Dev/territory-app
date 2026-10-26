import React, { createContext, useCallback, useContext, useState } from 'react';

import { mockDog, type DogProfile } from '../mocks/dog';
import { mockInventory, type InventoryItem } from '../mocks/items';
import { mockWalkHistory, type WalkRecord } from '../mocks/walkHistory';
import * as walkTask from '../lib/walkTask';
import type { UnfinishedWalk } from '../lib/walk/db';
import type { WalkSummary } from '../lib/walk/types';

type WalkSessionPhase = 'idle' | 'active' | 'recap' | 'revealing' | 'done';

export type StartWalkOutcome = { ok: true } | { ok: false; reason: 'permission_denied' };

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
  // separate component instance, so this must live here rather than in a
  // useState inside a hook they each call independently, or each screen
  // would see its own disconnected copy. startWalk/endWalk delegate to
  // lib/walkTask.ts for the real permission/tracking/SQLite work.
  walkPhase: WalkSessionPhase;
  walkId: string | null;
  walkStartedAt: number | null;
  walkTrackingMode: walkTask.WalkTrackingMode | null;
  walkSummary: WalkSummary | null;
  walkDrops: InventoryItem[];
  startWalk: (dogName: string) => Promise<StartWalkOutcome>;
  endWalk: () => Promise<void>;
  beginReveal: () => void;
  finishReveal: () => void;
  resetWalkSession: () => void;

  // Resume-or-discard an unfinished walk found at app launch (killed
  // mid-walk last time). See App.tsx, which runs the check once on boot.
  unfinishedWalk: UnfinishedWalk | null;
  checkForUnfinishedWalk: () => Promise<void>;
  resumeUnfinishedWalk: () => Promise<void>;
  discardUnfinishedWalk: () => Promise<void>;
};

const GameDataContext = createContext<GameData | undefined>(undefined);

/**
 * Single in-memory store for all the mock "save data" screens share
 * (coins, inventory, dog, walk history, catalogue ownership, the walk
 * session in progress). This is the data-access layer: screens read it
 * through the useDog/useInventory/useWalkSession/etc. hooks below, never
 * this file directly, so swapping any slice for a real API later doesn't
 * touch screen code. Walk tracking itself is already real (lib/walkTask.ts
 * + SQLite) — only the economy around it (coins/inventory/catalogue) is
 * still mock.
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
  const [walkId, setWalkId] = useState<string | null>(null);
  const [walkStartedAt, setWalkStartedAt] = useState<number | null>(null);
  const [walkTrackingMode, setWalkTrackingMode] = useState<walkTask.WalkTrackingMode | null>(null);
  const [walkSummary, setWalkSummary] = useState<WalkSummary | null>(null);
  const [walkDrops, setWalkDrops] = useState<InventoryItem[]>([]);
  const [unfinishedWalk, setUnfinishedWalk] = useState<UnfinishedWalk | null>(null);

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

  const startWalk = useCallback(
    async (dogName: string): Promise<StartWalkOutcome> => {
      const result = await walkTask.startWalk(dogName);
      if (!result.ok) return { ok: false, reason: result.reason };

      if (justOnboarded) acknowledgeFirstWalkNudge();
      setWalkId(result.walkId);
      setWalkStartedAt(result.startedAt);
      setWalkTrackingMode(result.trackingMode);
      setWalkSummary(null);
      setWalkDrops([]);
      setWalkPhase('active');
      return { ok: true };
    },
    [justOnboarded, acknowledgeFirstWalkNudge],
  );

  const endWalk = useCallback(async () => {
    if (!walkId || !walkTrackingMode) return;
    const { summary, drops } = await walkTask.endWalk(walkId, walkTrackingMode);
    setWalkSummary(summary);
    setWalkDrops(drops);
    setWalkPhase('recap');
  }, [walkId, walkTrackingMode]);

  const beginReveal = useCallback(() => setWalkPhase('revealing'), []);

  const finishReveal = useCallback(() => {
    if (walkSummary) {
      addItems(walkDrops);
      addWalkRecord({
        id: walkId ?? `walk-${Date.now()}`,
        dateLabel: 'Today',
        distanceKm: walkSummary.distanceM / 1000,
        activeMinutes: walkSummary.activeMinutes,
        sniffSpotsHit: walkSummary.sniffSpotsHit,
        itemsFound: walkDrops.length,
      });
    }
    setWalkPhase('done');
  }, [walkId, walkSummary, walkDrops, addItems, addWalkRecord]);

  const resetWalkSession = useCallback(() => {
    setWalkPhase('idle');
    setWalkId(null);
    setWalkStartedAt(null);
    setWalkTrackingMode(null);
    setWalkSummary(null);
    setWalkDrops([]);
  }, []);

  const checkForUnfinishedWalk = useCallback(async () => {
    const found = await walkTask.checkForUnfinishedWalk();
    setUnfinishedWalk(found);
  }, []);

  const resumeUnfinishedWalk = useCallback(async () => {
    if (!unfinishedWalk) return;
    await walkTask.resumeWalk(unfinishedWalk, dog.name);
    setWalkId(unfinishedWalk.id);
    setWalkStartedAt(unfinishedWalk.startedAt);
    setWalkTrackingMode(unfinishedWalk.trackingMode);
    setWalkSummary(null);
    setWalkDrops([]);
    setWalkPhase('active');
    setUnfinishedWalk(null);
  }, [unfinishedWalk, dog.name]);

  const discardUnfinishedWalk = useCallback(async () => {
    if (!unfinishedWalk) return;
    await walkTask.discardWalk(unfinishedWalk.id);
    setUnfinishedWalk(null);
  }, [unfinishedWalk]);

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
    walkId,
    walkStartedAt,
    walkTrackingMode,
    walkSummary,
    walkDrops,
    startWalk,
    endWalk,
    beginReveal,
    finishReveal,
    resetWalkSession,
    unfinishedWalk,
    checkForUnfinishedWalk,
    resumeUnfinishedWalk,
    discardUnfinishedWalk,
  };

  return <GameDataContext.Provider value={value}>{children}</GameDataContext.Provider>;
}

export function useGameData(): GameData {
  const ctx = useContext(GameDataContext);
  if (!ctx) throw new Error('useGameData must be used within a <GameDataProvider>');
  return ctx;
}

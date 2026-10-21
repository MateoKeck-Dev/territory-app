import { useCallback } from 'react';

import { mockCatalogue, type CatalogueItem } from '../mocks/catalogue';
import { useGameData } from './GameDataProvider';

export type PurchaseResult = { ok: true } | { ok: false; reason: 'insufficient_coins' };

/**
 * Shop catalogue slice. Coin purchases actually spend from the shared
 * balance; premium purchases are stubbed (no real payment) and just
 * record ownership — wire up a real IAP/Stripe flow later.
 */
export function useCatalogue() {
  const { ownedCatalogueIds, buyCatalogueItem, spendCoins } = useGameData();

  const buyItem = useCallback(
    (item: CatalogueItem): PurchaseResult => {
      if (item.currency === 'coins') {
        const ok = spendCoins(item.price);
        if (!ok) return { ok: false, reason: 'insufficient_coins' };
      }
      // Premium: stub — no real payment flow yet, just grant ownership.
      buyCatalogueItem(item.id);
      return { ok: true };
    },
    [spendCoins, buyCatalogueItem],
  );

  return { catalogue: mockCatalogue, ownedIds: ownedCatalogueIds, buyItem };
}

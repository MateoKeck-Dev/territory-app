import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { listFinishedWalks, type StoredWalk } from '../lib/walk/db';
import { mockWalkHistory, type WalkRecord } from '../mocks/walkHistory';

function formatDateLabel(startedAt: number): string {
  const date = new Date(startedAt);
  const now = new Date();
  const daysAgo = Math.floor((now.setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) / 86400000);
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  if (daysAgo < 7) return date.toLocaleDateString(undefined, { weekday: 'short' });
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function toWalkRecord(walk: StoredWalk): WalkRecord {
  return {
    id: walk.id,
    dateLabel: formatDateLabel(walk.startedAt),
    distanceKm: walk.distanceM / 1000,
    activeMinutes: walk.activeMinutes,
    sniffSpotsHit: walk.sniffSpotsHit,
    itemsFound: walk.drops.length,
  };
}

/**
 * Real walk history from SQLite. Falls back to mock data only in dev, and
 * only when there are zero real walks yet, so the screen isn't empty
 * while reviewing UI before ever taking a real walk — production always
 * shows the real (possibly empty) list.
 */
export function useWalkHistory() {
  const [records, setRecords] = useState<WalkRecord[] | null>(null);

  const reload = useCallback(() => {
    listFinishedWalks(20).then((walks) => {
      if (walks.length > 0) {
        setRecords(walks.map(toWalkRecord));
      } else if (__DEV__) {
        setRecords(mockWalkHistory);
      } else {
        setRecords([]);
      }
    });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Re-read on focus too, so finishing a walk and navigating back here
  // shows it without needing a full remount.
  useFocusEffect(reload);

  return { walkHistory: records ?? [], loading: records === null, reload };
}

export type WalkRecord = {
  id: string;
  dateLabel: string;
  distanceKm: number;
  activeMinutes: number;
  sniffSpotsHit: number;
  itemsFound: number;
};

export const mockWalkHistory: WalkRecord[] = [
  { id: 'w-1', dateLabel: 'Today', distanceKm: 1.4, activeMinutes: 18, sniffSpotsHit: 2, itemsFound: 2 },
  { id: 'w-2', dateLabel: 'Yesterday', distanceKm: 2.3, activeMinutes: 29, sniffSpotsHit: 3, itemsFound: 3 },
  { id: 'w-3', dateLabel: 'Mon', distanceKm: 1.2, activeMinutes: 15, sniffSpotsHit: 1, itemsFound: 1 },
  { id: 'w-4', dateLabel: 'Sun', distanceKm: 2.9, activeMinutes: 34, sniffSpotsHit: 4, itemsFound: 4 },
];

export type WalkRecord = {
  id: string;
  dateLabel: string;
  steps: number;
  distanceKm: number;
  activeMinutes: number;
  itemsFound: number;
};

export const mockWalkHistory: WalkRecord[] = [
  { id: 'w-1', dateLabel: 'Today', steps: 2100, distanceKm: 1.4, activeMinutes: 18, itemsFound: 2 },
  { id: 'w-2', dateLabel: 'Yesterday', steps: 3400, distanceKm: 2.3, activeMinutes: 29, itemsFound: 3 },
  { id: 'w-3', dateLabel: 'Mon', steps: 1800, distanceKm: 1.2, activeMinutes: 15, itemsFound: 1 },
  { id: 'w-4', dateLabel: 'Sun', steps: 4200, distanceKm: 2.9, activeMinutes: 34, itemsFound: 4 },
];

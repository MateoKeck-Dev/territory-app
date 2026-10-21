import { useCallback, useState } from 'react';

import { mockFriends, mockPawPrints, myUsername, type Friend, type PawPrint } from '../mocks/friends';
import { mockPack, type Pack } from '../mocks/pack';

/**
 * Social slice: friends, pack, paw prints. Mock data with stub mutations —
 * swap for real friend-request/pack APIs later without touching screens.
 */
export function useSocial() {
  const [friends] = useState<Friend[]>(mockFriends);
  const [pawPrints, setPawPrints] = useState<PawPrint[]>(mockPawPrints);
  const [pack, setPack] = useState<Pack | null>(mockPack);

  /** Stub: in the real version this sends a friend request by username. */
  const addFriendByUsername = useCallback((_username: string): boolean => {
    return true;
  }, []);

  /** Stub: in the real version this decodes a scanned QR payload. */
  const addFriendByQrScan = useCallback((): boolean => {
    return true;
  }, []);

  const leavePawPrint = useCallback((_friendId: string) => {
    // Stub: would POST a paw print to the friend's house.
  }, []);

  const joinPack = useCallback((_packId: string) => {
    setPack(mockPack);
  }, []);

  const createPack = useCallback((name: string) => {
    setPack({ ...mockPack, name, members: [mockPack.members[0]] });
  }, []);

  return {
    friends,
    pawPrints,
    pack,
    myUsername,
    addFriendByUsername,
    addFriendByQrScan,
    leavePawPrint,
    joinPack,
    createPack,
    clearPawPrints: () => setPawPrints([]),
  };
}

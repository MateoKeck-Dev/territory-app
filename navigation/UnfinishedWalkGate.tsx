import React, { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useGameData } from '../hooks/GameDataProvider';
import type { AppStackParamList } from './types';

/**
 * Renders nothing — just runs the "was a walk left unfinished last time
 * the app was killed?" check once on mount, and prompts resume-or-end if
 * so. Lives inside AppNavigator (not above it) specifically so it can use
 * useNavigation to jump straight into the walk flow once the user picks.
 */
export function UnfinishedWalkGate() {
  const { unfinishedWalk, checkForUnfinishedWalk, resumeUnfinishedWalk, endWalk } = useGameData();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const prompted = useRef(false);

  useEffect(() => {
    checkForUnfinishedWalk();
  }, [checkForUnfinishedWalk]);

  useEffect(() => {
    if (!unfinishedWalk || prompted.current) return;
    prompted.current = true;

    const startedAgo = Math.max(1, Math.round((Date.now() - unfinishedWalk.startedAt) / 60000));

    Alert.alert(
      'Unfinished walk',
      `Looks like a walk from ${startedAgo} minute${startedAgo === 1 ? '' : 's'} ago never finished — the app probably closed mid-walk. Resume it, or end it now?`,
      [
        {
          text: 'Resume',
          onPress: async () => {
            await resumeUnfinishedWalk();
            navigation.navigate('WalkFlow', { screen: 'WalkActive' } as never);
          },
        },
        {
          text: 'End walk',
          onPress: async () => {
            await resumeUnfinishedWalk();
            await endWalk();
            navigation.navigate('WalkFlow', { screen: 'WalkRecap' } as never);
          },
        },
      ],
      { cancelable: false },
    );
  }, [unfinishedWalk, resumeUnfinishedWalk, endWalk, navigation]);

  return null;
}

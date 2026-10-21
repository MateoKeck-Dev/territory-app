import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ChallengesScreen } from '../screens/challenges/ChallengesScreen';
import { LeaderboardsScreen } from '../screens/challenges/LeaderboardsScreen';
import type { ChallengesStackParamList } from './types';

const Stack = createNativeStackNavigator<ChallengesStackParamList>();

export function ChallengesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChallengesMain" component={ChallengesScreen} />
      <Stack.Screen
        name="Leaderboards"
        component={LeaderboardsScreen}
        options={{ headerShown: true, title: 'Leaderboards' }}
      />
    </Stack.Navigator>
  );
}

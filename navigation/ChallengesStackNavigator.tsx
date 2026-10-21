import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PlaceholderScreen } from '../components/PlaceholderScreen';
import type { ChallengesStackParamList } from './types';

const Stack = createNativeStackNavigator<ChallengesStackParamList>();

export function ChallengesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChallengesMain">
        {() => <PlaceholderScreen label="Challenges" emoji="🏆" />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

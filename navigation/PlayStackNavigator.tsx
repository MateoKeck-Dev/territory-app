import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PlaceholderScreen } from '../components/PlaceholderScreen';
import type { PlayStackParamList } from './types';

const Stack = createNativeStackNavigator<PlayStackParamList>();

export function PlayStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlayMain">
        {() => <PlaceholderScreen label="Play" emoji="🎮" />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

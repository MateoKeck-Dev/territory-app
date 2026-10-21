import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PlaceholderScreen } from '../components/PlaceholderScreen';
import type { SocialStackParamList } from './types';

const Stack = createNativeStackNavigator<SocialStackParamList>();

export function SocialStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SocialMain">
        {() => <PlaceholderScreen label="Social" emoji="🐾" />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

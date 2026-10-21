import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PlaceholderScreen } from '../components/PlaceholderScreen';
import type { WalkStackParamList } from './types';

const Stack = createNativeStackNavigator<WalkStackParamList>();

/** Presented over the tabs when the center Walk button is pressed — see
 * MainTabs' tabPress listener, which intercepts the press rather than
 * switching to a "Walk" tab. */
export function WalkStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WalkStart">
        {() => <PlaceholderScreen label="Walk" emoji="🚶" />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

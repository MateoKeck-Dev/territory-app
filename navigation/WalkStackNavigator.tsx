import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DropRevealScreen } from '../screens/walk/DropRevealScreen';
import { WalkActiveScreen } from '../screens/walk/WalkActiveScreen';
import { WalkRecapScreen } from '../screens/walk/WalkRecapScreen';
import { WalkStartScreen } from '../screens/walk/WalkStartScreen';
import type { WalkStackParamList } from './types';

const Stack = createNativeStackNavigator<WalkStackParamList>();

/** Presented over the tabs when the center Walk button is pressed — see
 * MainTabs' tabPress listener, which intercepts the press rather than
 * switching to a "Walk" tab. Start -> Active -> Recap -> DropReveal, then
 * DropReveal's own buttons exit back to MainTabs (Home or Inventory). */
export function WalkStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="WalkStart" component={WalkStartScreen} />
      <Stack.Screen name="WalkActive" component={WalkActiveScreen} />
      <Stack.Screen name="WalkRecap" component={WalkRecapScreen} />
      <Stack.Screen name="DropReveal" component={DropRevealScreen} />
    </Stack.Navigator>
  );
}

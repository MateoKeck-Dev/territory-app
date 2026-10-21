import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainTabs } from './MainTabs';
import type { AppStackParamList } from './types';
import { WalkStackNavigator } from './WalkStackNavigator';

const Stack = createNativeStackNavigator<AppStackParamList>();

/** Main app shell once onboarding is complete: the 5-tab app, with the
 * walk flow presented as a modal stack over it. */
export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="WalkFlow"
        component={WalkStackNavigator}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

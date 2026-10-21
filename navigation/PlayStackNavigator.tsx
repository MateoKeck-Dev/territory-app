import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ComingSoonScreen } from '../screens/play/ComingSoonScreen';
import { PlayScreen } from '../screens/play/PlayScreen';
import type { PlayStackParamList } from './types';

const Stack = createNativeStackNavigator<PlayStackParamList>();

export function PlayStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlayMain" component={PlayScreen} />
      <Stack.Screen
        name="ComingSoon"
        component={ComingSoonScreen}
        options={{ headerShown: true, title: '' }}
      />
    </Stack.Navigator>
  );
}

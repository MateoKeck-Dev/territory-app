import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AddFriendsScreen } from '../screens/social/AddFriendsScreen';
import { FriendHouseScreen } from '../screens/social/FriendHouseScreen';
import { SocialScreen } from '../screens/social/SocialScreen';
import type { SocialStackParamList } from './types';

const Stack = createNativeStackNavigator<SocialStackParamList>();

export function SocialStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SocialMain" component={SocialScreen} />
      <Stack.Screen
        name="FriendHouse"
        component={FriendHouseScreen}
        options={{ headerShown: true, title: '' }}
      />
      <Stack.Screen
        name="AddFriends"
        component={AddFriendsScreen}
        options={{ headerShown: true, title: 'Add friends' }}
      />
    </Stack.Navigator>
  );
}

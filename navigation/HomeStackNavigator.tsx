import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DogProfileScreen } from '../screens/home/DogProfileScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { InventoryScreen } from '../screens/inventory/InventoryScreen';
import { ShopScreen } from '../screens/shop/ShopScreen';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="DogProfile" component={DogProfileScreen} options={{ headerShown: true, title: 'Dog profile' }} />
      <Stack.Screen name="Inventory" component={InventoryScreen} options={{ headerShown: true, title: 'Inventory' }} />
      <Stack.Screen name="Shop" component={ShopScreen} options={{ headerShown: true, title: 'Shop' }} />
    </Stack.Navigator>
  );
}

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CreateDogScreen } from '../screens/onboarding/CreateDogScreen';
import { LocationPermissionScreen } from '../screens/onboarding/LocationPermissionScreen';
import { MeetHouseScreen } from '../screens/onboarding/MeetHouseScreen';
import { SignUpScreen } from '../screens/onboarding/SignUpScreen';
import { WelcomeGiftScreen } from '../screens/onboarding/WelcomeGiftScreen';
import type { OnboardingStackParamList } from './types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

/**
 * Dog-first, account-later: create the dog, meet the house, open a
 * welcome gift, THEN sign up, then the location-permission explainer.
 * Finishing calls completeOnboarding() (see LocationPermissionScreen),
 * which flips RootNavigator over to the main app — no explicit
 * navigation out of this stack needed.
 */
export function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="CreateDog" component={CreateDogScreen} />
      <Stack.Screen name="MeetHouse" component={MeetHouseScreen} />
      <Stack.Screen name="WelcomeGift" component={WelcomeGiftScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="LocationPermission" component={LocationPermissionScreen} />
    </Stack.Navigator>
  );
}

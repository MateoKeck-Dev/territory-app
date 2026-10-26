import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/Button';
import { DropRevealSequence } from '../../components/DropRevealSequence';
import { useWalkSession } from '../../hooks/useWalkSession';
import type { AppStackParamList } from '../../navigation/types';

export function DropRevealScreen() {
  const { drops, finishReveal } = useWalkSession();
  const rootNavigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  function goHome() {
    finishReveal();
    // Targeting a screen already below this modal in the stack pops back
    // to it rather than pushing a new one, so this both closes the walk
    // flow and picks which tab/screen MainTabs shows.
    rootNavigation.navigate('MainTabs', { screen: 'Home', params: { screen: 'HomeMain' } } as never);
  }

  function goToInventory() {
    finishReveal();
    rootNavigation.navigate('MainTabs', { screen: 'Home', params: { screen: 'Inventory' } } as never);
  }

  if (drops.length === 0) return null;

  return (
    <DropRevealSequence
      drops={drops}
      footer={
        <View style={{ gap: 10, alignItems: 'center' }}>
          <Button label="Go home" onPress={goHome} />
          <Button label="View inventory" variant="secondary" onPress={goToInventory} />
        </View>
      }
    />
  );
}

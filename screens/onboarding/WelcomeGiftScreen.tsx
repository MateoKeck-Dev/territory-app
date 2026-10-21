import React, { useState } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/Button';
import { DropRevealSequence } from '../../components/DropRevealSequence';
import { useGameData } from '../../hooks/GameDataProvider';
import { rollDrops, type InventoryItem } from '../../mocks/items';
import type { OnboardingStackParamList } from '../../navigation/types';

export function WelcomeGiftScreen({
  navigation,
}: {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'WelcomeGift'>;
}) {
  const { addItems } = useGameData();
  const [drops] = useState<InventoryItem[]>(() => rollDrops(1));

  function handleContinue() {
    addItems(drops);
    navigation.navigate('SignUp');
  }

  return (
    <DropRevealSequence drops={drops} footer={<Button label="Continue" onPress={handleContinue} />} />
  );
}

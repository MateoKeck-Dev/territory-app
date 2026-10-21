import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SegmentedControl } from '../../components/SegmentedControl';
import { collections, type CatalogueItem, type Currency } from '../../mocks/catalogue';
import { useCatalogue } from '../../hooks/useCatalogue';
import { useTheme } from '../../lib/theme';

export function ShopScreen() {
  const { colors, fontSizes, fontWeights } = useTheme();
  const { catalogue, ownedIds, buyItem } = useCatalogue();
  const [tab, setTab] = useState<Currency>('coins');

  function handleBuy(item: CatalogueItem) {
    const result = buyItem(item);
    if (!result.ok) {
      Alert.alert('Not enough coins', `You need ${item.price} coins for ${item.name}.`);
      return;
    }
    Alert.alert('Added to your house!', `${item.name} is ready to display.`);
  }

  const itemsForTab = catalogue.filter((item) => item.currency === tab);

  return (
    <ScreenContainer>
      <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>Shop</Text>

      <SegmentedControl
        options={['coins', 'premium'] as Currency[]}
        value={tab}
        onChange={setTab}
      />
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
        {tab === 'coins' ? 'Bought with coins you find on walks' : 'Premium items (real money — stubbed here)'}
      </Text>

      {collections.map((collection) => {
        const collectionItems = itemsForTab.filter((item) => item.collection === collection);
        if (collectionItems.length === 0) return null;
        return (
          <View key={collection} style={styles.section}>
            <Text style={{ color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.bold }}>
              {collection}
            </Text>
            <View style={styles.grid}>
              {collectionItems.map((item) => {
                const owned = ownedIds.includes(item.id);
                return (
                  <Card key={item.id} style={styles.card}>
                    <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
                    <Text style={{ color: colors.text, fontWeight: fontWeights.bold, textAlign: 'center' }}>
                      {item.name}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
                      {item.currency === 'coins' ? `🪙 ${item.price}` : `💎 ${item.price}`}
                    </Text>
                    <Button
                      label={owned ? 'Owned' : 'Buy'}
                      variant={owned ? 'ghost' : 'primary'}
                      size="md"
                      disabled={owned}
                      onPress={() => handleBuy(item)}
                      style={styles.buyButton}
                    />
                  </Card>
                );
              })}
            </View>
          </View>
        );
      })}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { flexBasis: '47%', alignItems: 'center', gap: 6 },
  buyButton: { paddingHorizontal: 0, paddingVertical: 8, width: '100%' },
});

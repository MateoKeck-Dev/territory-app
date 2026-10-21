import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { RarityBadge } from '../../components/Badges';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useInventory } from '../../hooks/useInventory';
import { useTheme } from '../../lib/theme';

export function InventoryScreen() {
  const { colors, fontSizes, fontWeights } = useTheme();
  const { items, sellItem, toggleDisplay } = useInventory();

  if (items.length === 0) {
    return (
      <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 40 }}>🎒</Text>
        <Text style={{ color: colors.textMuted, marginTop: 8 }}>
          Nothing in here yet — go find some treasures on a walk!
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>
        Inventory
      </Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <Card key={item.id} style={styles.card}>
            <Text style={{ fontSize: 36 }}>{item.emoji}</Text>
            <Text style={{ color: colors.text, fontWeight: fontWeights.bold }}>{item.name}</Text>
            <RarityBadge rarity={item.rarity} />
            <Text style={{ color: colors.coin, fontSize: fontSizes.xs }}>🪙 {item.coinValue}</Text>
            <View style={styles.actions}>
              <Button
                label={item.placed ? 'Displayed' : 'Display'}
                variant={item.placed ? 'primary' : 'secondary'}
                size="md"
                onPress={() => toggleDisplay(item.id)}
                style={styles.actionButton}
              />
              <Button
                label="Sell"
                variant="ghost"
                size="md"
                onPress={() => sellItem(item.id)}
                style={styles.actionButton}
              />
            </View>
          </Card>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { flexBasis: '47%', alignItems: 'center', gap: 6 },
  actions: { gap: 6, width: '100%' },
  actionButton: { paddingHorizontal: 0, paddingVertical: 8 },
});

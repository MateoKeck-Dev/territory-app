import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/Button';
import { DogAvatar } from '../../components/DogAvatar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SegmentedControl } from '../../components/SegmentedControl';
import { useDog } from '../../hooks/useDog';
import { earStyleOptions, tailStyleOptions, type EarStyle, type TailStyle } from '../../lib/assetRegistry';
import { useTheme } from '../../lib/theme';
import { dogPatterns, markingColors, type DogMarkings } from '../../mocks/dog';
import type { OnboardingStackParamList } from '../../navigation/types';

function Label({ children }: { children: string }) {
  const { colors } = useTheme();
  return <Text style={[styles.label, { color: colors.textMuted }]}>{children}</Text>;
}

export function CreateDogScreen({
  navigation,
}: {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'CreateDog'>;
}) {
  const { colors, spacing, radii, fontSizes, fontWeights } = useTheme();
  const { dog, updateDog } = useDog();

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [markings, setMarkings] = useState<DogMarkings>(dog.markings);

  function handleContinue() {
    if (!name.trim()) return;
    updateDog({ name: name.trim(), breed: breed.trim() || 'Good dog', markings });
    navigation.navigate('MeetHouse');
  }

  return (
    <ScreenContainer style={{ gap: spacing.lg }}>
      <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>
        Tell us about your dog
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
        We'll use this to put together a little look-alike — real art comes later!
      </Text>

      <View style={{ alignItems: 'center' }}>
        <DogAvatar markings={markings} size={120} />
      </View>

      <View style={{ gap: spacing.sm }}>
        <Label>Name</Label>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="What's your dog's name?"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
        />
      </View>

      <View style={{ gap: spacing.sm }}>
        <Label>Breed</Label>
        <TextInput
          value={breed}
          onChangeText={setBreed}
          placeholder="e.g. Labrador, mixed breed, not sure!"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }]}
        />
      </View>

      <View style={{ gap: spacing.sm }}>
        <Label>Coat colour</Label>
        <View style={styles.swatchRow}>
          {markingColors.map((hex) => (
            <Pressable
              key={hex}
              onPress={() => setMarkings((m) => ({ ...m, baseColor: hex }))}
              style={[
                styles.swatch,
                {
                  backgroundColor: hex,
                  borderRadius: radii.pill,
                  borderWidth: markings.baseColor === hex ? 3 : 0,
                  borderColor: colors.primary,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <Label>Markings</Label>
        <SegmentedControl
          options={dogPatterns}
          value={markings.pattern}
          onChange={(pattern) => setMarkings((m) => ({ ...m, pattern }))}
        />
      </View>

      {markings.pattern !== 'solid' && (
        <View style={{ gap: spacing.sm }}>
          <Label>Marking colour</Label>
          <View style={styles.swatchRow}>
            {markingColors.map((hex) => (
              <Pressable
                key={hex}
                onPress={() => setMarkings((m) => ({ ...m, markingColor: hex }))}
                style={[
                  styles.swatch,
                  {
                    backgroundColor: hex,
                    borderRadius: radii.pill,
                    borderWidth: markings.markingColor === hex ? 3 : 0,
                    borderColor: colors.primary,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      )}

      <View style={{ gap: spacing.sm }}>
        <Label>Ears</Label>
        <SegmentedControl<EarStyle>
          options={earStyleOptions}
          value={markings.earStyle}
          onChange={(earStyle) => setMarkings((m) => ({ ...m, earStyle }))}
        />
      </View>

      <View style={{ gap: spacing.sm }}>
        <Label>Tail</Label>
        <SegmentedControl<TailStyle>
          options={tailStyleOptions}
          value={markings.tailStyle}
          onChange={(tailStyle) => setMarkings((m) => ({ ...m, tailStyle }))}
        />
      </View>

      <Button label="Continue" size="lg" disabled={!name.trim()} onPress={handleContinue} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 40, height: 40 },
});

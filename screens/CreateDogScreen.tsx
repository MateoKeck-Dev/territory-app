import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { createDog, type Dog } from '../lib/api';
import { supabase } from '../lib/supabase';
import { AVATARS, TERRITORY_COLORS, colors } from '../lib/theme';

export default function CreateDogScreen({
  onCreated,
}: {
  onCreated: (dog: Dog) => void;
}) {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [colorHex, setColorHex] = useState<string>(TERRITORY_COLORS[0]);
  const [avatarId, setAvatarId] = useState<string>(AVATARS[0].id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Every Lord needs a name.');
      return;
    }

    setBusy(true);
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (sessionError || !token) {
        setError('Your session has expired. Sign in again to continue.');
        return;
      }

      const dog = await createDog(token, {
        name: trimmed,
        breed: breed.trim() || null,
        color_hex: colorHex,
        avatar_id: avatarId,
      });
      onCreated(dog);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your dog. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Name your Lord</Text>
        <Text style={styles.subtitle}>
          Every noble hound needs a banner before the conquest begins.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Sir Barksalot"
            placeholderTextColor={colors.inkSoft}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Breed</Text>
          <TextInput
            style={styles.input}
            value={breed}
            onChangeText={setBreed}
            placeholder="Corgi of the Round Table"
            placeholderTextColor={colors.inkSoft}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Banner colour</Text>
          <Text style={styles.hint}>The hue your claimed lands will fly.</Text>
          <View style={styles.swatchRow}>
            {TERRITORY_COLORS.map((hex) => {
              const selected = hex === colorHex;
              return (
                <Pressable
                  key={hex}
                  onPress={() => setColorHex(hex)}
                  style={[
                    styles.swatch,
                    { backgroundColor: hex },
                    selected && styles.swatchSelected,
                  ]}
                >
                  {selected && <Text style={styles.swatchCheck}>✓</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Crest</Text>
          <View style={styles.avatarRow}>
            {AVATARS.map((a) => {
              const selected = a.id === avatarId;
              return (
                <Pressable
                  key={a.id}
                  onPress={() => setAvatarId(a.id)}
                  style={[styles.avatar, selected && styles.avatarSelected]}
                >
                  <Text style={styles.avatarEmoji}>{a.emoji}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            busy && styles.buttonDisabled,
          ]}
          disabled={busy}
          onPress={submit}
        >
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Begin the conquest</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.parchment },
  container: { padding: 28, paddingTop: 72, gap: 18 },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: 0.5,
  },
  subtitle: { fontSize: 15, color: colors.inkSoft, marginBottom: 4 },
  field: { gap: 8 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hint: { fontSize: 13, color: colors.inkSoft, marginTop: -2 },
  input: {
    backgroundColor: colors.fieldBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatch: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  swatchSelected: { borderColor: colors.ink, borderWidth: 3 },
  swatchCheck: { color: colors.white, fontSize: 20, fontWeight: '900' },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.fieldBg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarSelected: { borderColor: colors.crest, backgroundColor: colors.parchmentDark },
  avatarEmoji: { fontSize: 26 },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.crest,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonPressed: { backgroundColor: colors.crestDark },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.white, fontSize: 17, fontWeight: '800' },
});

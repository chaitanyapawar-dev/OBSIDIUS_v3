// app/onboarding/ready.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t, Colors, Spacing, DimensionAccent } from '../../src/theme';
import { SilverButton, MonoLabel, ObsidiusLogo } from '../../src/components';
import { useOnboardingStore } from '../../src/store/useOnboardingStore';
import type { DimensionKey } from '../../src/theme';

const DIMENSIONS: { key: DimensionKey; label: string }[] = [
  { key: 'circadian',   label: 'Circadian'   },
  { key: 'nutrition',   label: 'Nutrition'   },
  { key: 'physical',    label: 'Physical'    },
  { key: 'recovery',    label: 'Recovery'    },
  { key: 'social',      label: 'Social'      },
  { key: 'consistency', label: 'Consistency' },
];

export default function ReadyScreen(): React.ReactElement {
  const router      = useRouter();
  const setComplete = useOnboardingStore((s) => s.setComplete);

  const handleEnter = () => {
    setComplete(true);
    router.replace('/(tabs)/today');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <ObsidiusLogo logoSize={18} wordmarkSize={11} wordmarkLetterSpacing={3} />
        <MonoLabel style={styles.step}>04 / 04</MonoLabel>
      </View>

      <View style={styles.container}>

        {/* ── Hero title ──────────────────────────────────────────── */}
        <Text style={[t('display-l'), styles.title]}>
          You are ready.
        </Text>

        {/* ── Confirmation copy ───────────────────────────────────── */}
        <Text style={[t('body-l'), styles.body]}>
          From this moment, Obsidius begins tracking your six behavioral
          dimensions — quietly, every day, without interruption.
        </Text>

        <Text style={[t('body-m'), styles.bodySecondary]}>
          Check in each morning and evening. The signal builds over time.
          Patterns you can't currently see will surface within two weeks.
        </Text>

        {/* ── Dimension colour chips ───────────────────────────────── */}
        <View style={styles.dimensionRow}>
          {DIMENSIONS.map(({ key, label }) => (
            <View key={key} style={styles.dimensionChip}>
              <View
                style={[
                  styles.accentDot,
                  { backgroundColor: DimensionAccent[key] },
                ]}
              />
              <MonoLabel>{label}</MonoLabel>
            </View>
          ))}
        </View>

        {/* ── Spacer ──────────────────────────────────────────────── */}
        <View style={styles.spacer} />

        {/* ── CTA ─────────────────────────────────────────────────── */}
        <SilverButton
          label="Enter Obsidius"
          onPress={handleEnter}
          style={styles.cta}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.void,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  step: {
    color: Colors.silverLo,
  },
  title: {
    color: Colors.silverHi,
    marginBottom: Spacing.lg,
  },
  body: {
    color: Colors.silverHi,
    marginBottom: Spacing.md,
  },
  bodySecondary: {
    color: Colors.silverLo,
    marginBottom: Spacing.xl,
  },
  dimensionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  dimensionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  spacer: {
    flex: 1,
  },
  cta: {
    width: '100%',
  },
});

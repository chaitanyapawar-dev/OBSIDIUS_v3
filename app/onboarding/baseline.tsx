// app/onboarding/baseline.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
// Requires dev build — will not open in Expo Go
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { t, Colors, Spacing, Radius } from '../../src/theme';
import { SilverButton, MonoLabel, GhostCard, ObsidiusLogo } from '../../src/components';
import { useOnboardingStore } from '../../src/store/useOnboardingStore';



export default function BaselineScreen(): React.ReactElement {
  const router = useRouter();

  const storedIntention   = useOnboardingStore((s) => s.intention);
  const storedMorningTime = useOnboardingStore((s) => s.morningTime);
  const storedEveningTime = useOnboardingStore((s) => s.eveningTime);

  const setIntention   = useOnboardingStore((s) => s.setIntention);
  const setMorningTime = useOnboardingStore((s) => s.setMorningTime);
  const setEveningTime = useOnboardingStore((s) => s.setEveningTime);

  const [intention, setLocalIntention] = useState(storedIntention);
  
  const [showPicker, setShowPicker] = useState<'morning' | 'evening' | null>(null);
  const [morningDate, setMorningDate] = useState(() => {
    const d = new Date();
    const [h, m] = storedMorningTime.split(':');
    d.setHours(parseInt(h || '8', 10), parseInt(m || '0', 10), 0, 0);
    return d;
  });
  const [eveningDate, setEveningDate] = useState(() => {
    const d = new Date();
    const [h, m] = storedEveningTime.split(':');
    d.setHours(parseInt(h || '21', 10), parseInt(m || '30', 10), 0, 0);
    return d;
  });

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const canContinue = (intention || '').trim().length > 0;

  const handleContinue = () => {
    if (!canContinue) return;
    setIntention(intention.trim());
    setMorningTime(formatTime(morningDate));
    setEveningTime(formatTime(eveningDate));
    router.push('/onboarding/permissions');
  };



  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ────────────────────────────────────────────── */}
      <View style={styles.header}>
        <ObsidiusLogo logoSize={18} wordmarkSize={11} wordmarkLetterSpacing={3} />
        <MonoLabel style={styles.step}>02 / 04</MonoLabel>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── Title ───────────────────────────────────────────────── */}
          <Text style={[t('heading-l'), styles.title]}>
            Establish your baseline
          </Text>

          <Text style={[t('body-m'), styles.subtitle]}>
            Your implementation intention is the foundation of your practice. Be specific.
          </Text>

          {/* ── Intention input ─────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.inputBlock}>
              <GhostCard style={styles.ghostCardPadding}>
                <Text style={[t('data-s'), styles.fieldHintAccent]}>
                  WHEN X HAPPENS, I WILL Y.
                </Text>
                <TextInput
                  value={intention}
                  onChangeText={setLocalIntention}
                  placeholder="e.g. When I reach for my phone, I will breathe first."
                  placeholderTextColor={Colors.silverLo}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={[t('body-m'), styles.intentionInput]}
                  returnKeyType="done"
                  blurOnSubmit
                />
              </GhostCard>
            </View>
          </View>

          {/* ── Schedule inputs ─────────────────────────────────────── */}
          <View style={styles.section}>
            <MonoLabel style={styles.fieldLabel}>
              daily check-in schedule
            </MonoLabel>

            <View style={styles.timeRow}>
              {/* Morning */}
              <View style={styles.timeBlock}>
                <MonoLabel style={styles.timeLabel}>morning</MonoLabel>
                <Pressable onPress={() => setShowPicker('morning')}>
                  <GhostCard style={styles.timeContainer}>
                    <Text style={[t('data-l'), styles.timeDisplay]}>
                      {formatTime(morningDate)}
                    </Text>
                  </GhostCard>
                </Pressable>
              </View>

              {/* Evening */}
              <View style={styles.timeBlock}>
                <MonoLabel style={styles.timeLabel}>evening</MonoLabel>
                <Pressable onPress={() => setShowPicker('evening')}>
                  <GhostCard style={styles.timeContainer}>
                    <Text style={[t('data-l'), styles.timeDisplay]}>
                      {formatTime(eveningDate)}
                    </Text>
                  </GhostCard>
                </Pressable>
              </View>
            </View>
          </View>

          {/* ── Spacer ──────────────────────────────────────────────── */}
          <View style={styles.spacer} />

          {/* ── CTA ─────────────────────────────────────────────────── */}
          <SilverButton
            label="Continue"
            onPress={handleContinue}
            disabled={!canContinue}
            style={styles.cta}
          />

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Requires Expo dev build — DateTimePicker will not open in Expo Go */}
      {showPicker !== null && (
        <DateTimePicker
          value={showPicker === 'morning' ? morningDate : eveningDate}
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
            if (selectedDate) {
              if (showPicker === 'morning') setMorningDate(selectedDate);
              else setEveningDate(selectedDate);
            }
            setShowPicker(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.void,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  step: {
    color: Colors.silverLo,
  },
  title: {
    color: Colors.silverHi,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.silverLo,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  fieldLabel: {
    marginBottom: Spacing.sm,
  },
  fieldHintAccent: {
    color: Colors.silverLo,
    marginBottom: Spacing.sm,
  },
  inputBlock: {
    borderRadius: Radius.md,
  },
  ghostCardPadding: {
    padding: Spacing.md,
  },
  intentionInput: {
    color: Colors.silverHi,
    minHeight: 100,
    padding: 0,
    marginTop: Spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  timeBlock: {
    flex: 1,
  },
  timeLabel: {
    marginBottom: Spacing.xs,
  },
  timeContainer: {
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDisplay: {
    color: Colors.silverHi,
  },
  spacer: {
    flex: 1,
    minHeight: Spacing.xl,
  },
  cta: {
    width: '100%',
  },
});

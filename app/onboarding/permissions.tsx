// app/onboarding/permissions.tsx
import React from 'react';
import { View, Text, Linking, StyleSheet, PermissionsAndroid, Platform, ScrollView, AppState, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { t, Colors, Spacing, DimensionAccent } from '../../src/theme';
import { GhostCard, OutlineButton, SilverButton, MonoLabel, ObsidiusLogo } from '../../src/components';
import { useOnboardingStore } from '../../src/store/useOnboardingStore';

const PERM_ICON_SIZE = 20;

export default function PermissionsScreen(): React.ReactElement {
  const router = useRouter();

  const usageGranted    = useOnboardingStore((s) => s.usageAccessGranted);
  const activityGranted = useOnboardingStore((s) => s.activityAccessGranted);
  const setUsage        = useOnboardingStore((s) => s.setUsageAccessGranted);
  const setActivity     = useOnboardingStore((s) => s.setActivityAccessGranted);

  const canContinue = true;

  const handleUsagePress = async () => {
    if (usageGranted) return;
    
    // Open the specific Usage Access settings page
    await Linking.sendIntent('android.settings.USAGE_ACCESS_SETTINGS');
    
    // Set up AppState listener to check when user returns
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        subscription.remove();
        // Show a prompt asking user to confirm they granted it
        Alert.alert(
          'Did you grant access?',
          'Did you turn on Usage Access for Obsidius in the settings?',
          [
            {
              text: 'Yes, I granted it',
              onPress: () => setUsage(true),
            },
            {
              text: 'Not yet',
              style: 'cancel',
            },
          ]
        );
      }
    });
  };

  const handleActivityPress = async () => {
    if (activityGranted) return;
    if (Platform.OS !== 'android') return;

    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
        {
          title: 'Step Counting Access',
          message: 'Obsidius counts your daily steps to track Physical Activation.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
        }
      );
      // ONLY set true if actually granted — do not fake it
      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        setActivity(true);
      } else {
        Alert.alert(
          'Permission not granted',
          'Step counting will show placeholder data. You can grant access later in Profile.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.warn('Activity permission request failed:', err);
      // Do NOT call setActivity(true) here
    }
  };

  const handleContinue = () => {
    router.push('/onboarding/ready');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <ObsidiusLogo logoSize={18} wordmarkSize={11} wordmarkLetterSpacing={3} />
        <MonoLabel style={styles.step}>03 / 04</MonoLabel>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Title ───────────────────────────────────────────────── */}
        <Text style={[t('heading-l'), styles.title]}>
          Two quick accesses
        </Text>

        <Text style={[t('body-m'), styles.subtitle]}>
          Obsidius needs two Android permissions to measure your behavioral
          dimensions accurately. Both are optional, but the relevant
          dimension will show placeholder data without them.
        </Text>

        {/* ── Permission cards ────────────────────────────────────── */}
        <View style={styles.cards}>

          {/* ── Digital Nutrition — Usage Access ──────────────────── */}
          <GhostCard
            style={[
              styles.permCard,
              {
                borderLeftWidth: 2,
                borderLeftColor: DimensionAccent.nutrition,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Feather
                name="smartphone"
                size={PERM_ICON_SIZE}
                color={DimensionAccent.nutrition}
              />
              <MonoLabel>
                digital nutrition
              </MonoLabel>
            </View>

            <Text style={[t('heading-m'), styles.cardTitle]}>
              App Usage Access
            </Text>

            <Text style={[t('body-s'), styles.cardBody]}>
              Reads total screen time split by app category. Only aggregate
              minutes are used — no app names or content are ever collected.
            </Text>

            <OutlineButton
              label={usageGranted ? '✓  Granted' : 'Grant Usage Access'}
              onPress={handleUsagePress}
              disabled={usageGranted}
              style={styles.permButton}
            />
          </GhostCard>

          {/* ── Physical Activation — Activity Recognition ─────────── */}
          <GhostCard
            style={[
              styles.permCard,
              {
                borderLeftWidth: 2,
                borderLeftColor: DimensionAccent.physical,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Feather
                name="activity"
                size={PERM_ICON_SIZE}
                color={DimensionAccent.physical}
              />
              <MonoLabel>
                physical activation
              </MonoLabel>
            </View>

            <Text style={[t('heading-m'), styles.cardTitle]}>
              Activity Recognition
            </Text>

            <Text style={[t('body-s'), styles.cardBody]}>
              Counts steps using the device motion sensor. No GPS or location
              data is accessed at any point.
            </Text>

            <OutlineButton
              label={activityGranted ? '✓  Granted' : 'Grant Activity Access'}
              onPress={handleActivityPress}
              disabled={activityGranted}
              style={styles.permButton}
            />
          </GhostCard>

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
  cards: {
    gap: Spacing.md,
  },
  permCard: {
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    color: Colors.silverHi,
    marginBottom: Spacing.sm,
  },
  cardBody: {
    color: Colors.silverLo,
    marginBottom: Spacing.md,
  },
  permButton: {},
  spacer: {
    flex: 1,
  },
  cta: {
    width: '100%',
  },
});

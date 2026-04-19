// app/onboarding/intro.tsx
//
// Welcome screen — the first surface a new user sees after the splash.
//
// Layout: Vertically centered, completely custom redesigned.

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { t, Colors, Spacing } from '../../src/theme';
import { SilverButton, MonoLabel, ObsidiusLogo } from '../../src/components';

export default function IntroScreen(): React.ReactElement {
  const router = useRouter();

  // ─── Animations ───────────────────────────────────────────
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) });
    translateY.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.ease) });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleBegin = () => {
    router.push('/onboarding/baseline');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        
        {/* Top Area */}
        <View style={styles.topArea}>
          <Animated.View style={animStyle}>
            <ObsidiusLogo
              orientation="vertical"
              logoSize={64}
              wordmarkSize={13}
              wordmarkLetterSpacing={4}
            />
          </Animated.View>
        </View>

        {/* Center Area */}
        <View style={styles.centerArea}>
          <Text style={[t('display-l'), styles.title]}>
            Know thyself.
          </Text>
          <View style={styles.gap20} />
          <Text style={[t('body-l'), styles.primaryText]}>
            Most apps track what you do. Obsidius reveals who you are — through six quiet measurements, every day, without judgement.
          </Text>
          <View style={styles.gap12} />
          <Text style={[t('body-s'), styles.secondaryText]}>
            No feeds. No noise. Just the signal beneath your own behaviour.
          </Text>
        </View>

        {/* Bottom Area */}
        <View style={styles.bottomArea}>
          <MonoLabel style={styles.step}>
            01 / 04
          </MonoLabel>
          <SilverButton
            label="Begin"
            onPress={handleBegin}
            style={styles.cta}
          />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.void,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  topArea: {
    flex: 3.5, // Approx 35% height for visual balance
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerArea: {
    flex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomArea: {
    flex: 1.5,
    justifyContent: 'flex-end',
    alignItems: 'center', // centers the label above full-width button
  },
  
  title: {
    // t('display-l') defaults to 48px, but spec asks for 52px. We apply a font size override without changing weight.
    fontSize: 52,
    color: Colors.silverHi,
    textAlign: 'center',
  },
  gap20: {
    height: 20,
  },
  gap12: {
    height: 12,
  },
  primaryText: {
    color: Colors.silver,
    textAlign: 'center',
    maxWidth: 300,
    fontSize: 15, // t('body-l') typically has this
    lineHeight: 24,
  },
  secondaryText: {
    color: Colors.silverMid,
    textAlign: 'center',
    fontSize: 13, // t('body-s') typically has this
  },
  step: {
    marginBottom: Spacing.md,
    color: Colors.silverLo,
  },
  cta: {
    width: '100%',
  },
});

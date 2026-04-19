// src/components/SilverButton.tsx
//
// Primary call-to-action button. Used for "Get Started", "Continue",
// "Start Today", "Close the Day", "Restart", and "Log and continue".
//
// Structure: AnimatedPressable → LinearGradient → Text
//   AnimatedPressable handles press events and the spring scale.
//   LinearGradient fills it entirely (overflow: hidden clips to radius).
//   Text renders the label in Syne Bold on void (#000000).
//
// RULES:
//   - No fontWeight on Text — Syne_700Bold weight is in the family name.
//   - No hardcoded pixels or hex values.

import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { t, Colors, Gradients, Layout, Radius } from '../theme';
import type { ViewStyle } from 'react-native';

// ─── Reanimated animated Pressable ───────────────────────────────────────
// Created once at module scope — createAnimatedComponent is expensive
// to call inside a render function.
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Spring config ────────────────────────────────────────────────────────
// Matches the spec: "Reanimated spring scale 0.97"
// damping + stiffness tuned for a snappy-but-not-jarring press feel.
const SPRING_IN:  Parameters<typeof withSpring>[1] = { damping: 15, stiffness: 300, mass: 1 };
const SPRING_OUT: Parameters<typeof withSpring>[1] = { damping: 12, stiffness: 250, mass: 1 };

// ─── Props ────────────────────────────────────────────────────────────────

interface SilverButtonProps {
  label:     string;
  onPress:   () => void;
  disabled?: boolean;
  style?:    ViewStyle | ViewStyle[];
}

// ─── Component ────────────────────────────────────────────────────────────

export function SilverButton({
  label,
  onPress,
  disabled = false,
  style,
}: SilverButtonProps): React.ReactElement {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.97, SPRING_IN);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, SPRING_OUT);
  };

  const handlePress = () => {
    if (disabled) return;
    onPress();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
      style={style}
    >
      <Animated.View
        style={[
          styles.container,
          animatedStyle,
          disabled && styles.disabled,
        ]}
      >
        <LinearGradient
          colors={[...Gradients.silverEdge.colors]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Text style={[t('heading-m'), styles.label]}>
            {label}
          </Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    height:       Layout.silverButtonHeight, // 52
    borderRadius: Radius.md,                 // 10
    overflow:     'hidden',
    // overflow: hidden is required so LinearGradient's rectangular fill
    // is clipped to the container's borderRadius. Without it the gradient
    // bleeds past the rounded corners on Android.
  },

  gradient: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },

  label: {
    color: Colors.void,
    // No fontWeight — Syne_700Bold weight is encoded in the family name.
    // textTransform not applied here — button labels are sentence case
    // ("Get Started", not "GET STARTED"). MonoLabel handles uppercase.
  },

  disabled: {
    opacity: 0.4,
    // Press animation is suppressed in handlePressIn — opacity is the
    // only visual indicator that the button is non-interactive.
  },
});

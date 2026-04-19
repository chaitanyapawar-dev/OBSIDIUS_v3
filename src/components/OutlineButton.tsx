// src/components/OutlineButton.tsx
//
// Secondary call-to-action button. Used for permission grants ("Grant access"),
// secondary navigation ("Edit", "Skip"), and inline actions that should not
// compete visually with a nearby SilverButton.
//
// Structure: AnimatedPressable (transparent bg + border) → Text
//   No LinearGradient — the border alone defines the button boundary.
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
import { t, Colors, Layout, Radius } from '../theme';
import type { ViewStyle } from 'react-native';

// ─── Reanimated animated Pressable ───────────────────────────────────────
// Module-scope — same reasoning as SilverButton.
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Spring config ────────────────────────────────────────────────────────
// Identical to SilverButton — consistent interaction feel across both
// button types prevents the UI from feeling inconsistent on secondary taps.
const SPRING_IN:  Parameters<typeof withSpring>[1] = { damping: 15, stiffness: 300, mass: 1 };
const SPRING_OUT: Parameters<typeof withSpring>[1] = { damping: 12, stiffness: 250, mass: 1 };

// ─── Border colour constant ───────────────────────────────────────────────
// Spec: "Border: 1px rgba(194,203,214,0.2)"
// Derived from Colors.silver (#C2CBD6 = rgb 194,203,214) at 20% opacity.
// At 20% this reads as a hairline edge in the dark environment — visible
// enough to define the button shape, subtle enough not to compete with
// a nearby SilverButton. Using solid Colors.silverLo (#565E68) would
// produce a much more prominent border at full opacity.
const OUTLINE_BORDER = 'rgba(194,203,214,0.20)' as const;

// ─── Props ────────────────────────────────────────────────────────────────

interface OutlineButtonProps {
  label:     string;
  onPress:   () => void;
  disabled?: boolean;
  style?:    ViewStyle | ViewStyle[];
}

// ─── Component ────────────────────────────────────────────────────────────

export function OutlineButton({
  label,
  onPress,
  disabled = false,
  style,
}: OutlineButtonProps): React.ReactElement {
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
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
      style={[
        styles.container,
        animatedStyle,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[t('heading-m'), styles.label]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    height:            Layout.outlineButtonHeight, // 44
    borderRadius:      Radius.md,                  // 10
    borderWidth:       1,
    borderColor:       OUTLINE_BORDER,
    backgroundColor:   'transparent',
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: Radius.lg,                  // 16 — comfortable inline tap target
  },

  label: {
    color: Colors.silverHi,
    // No fontWeight — Syne_700Bold is encoded in the family name.
  },

  disabled: {
    opacity: 0.4,
  },
});

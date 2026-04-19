// src/components/GhostCard.tsx
//
// Base surface container for the Obsidius card system.
// Used directly for: check-in rows, data sections, profile rows, and
// any full-width content block that needs a lifted surface.
// DimensionCard and InsightCard extend this visual language by adding
// a left accent border on top of the GhostCard base.
//
// RULES:
//   - No hardcoded hex values for themeable tokens.
//   - No hardcoded pixel values — Layout and Radius tokens only.
//   - The two rgba surface values below are NOT yet in Colors (they
//     require alpha). They are traced back to their parent tokens
//     in the comments. Promote to Colors if a project-wide rgba pass
//     is approved.

import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { Radius, Layout } from '../theme';

// ─── Surface colour constants ─────────────────────────────────────────────
// These two values come directly from the spec (Section 03 — GhostCard).
// They are rgba variants of Colors tokens — not arbitrary values.
//
//   CARD_SURFACE: rgba(14, 0, 14, 0.60)
//     Derived from Colors.plumMid (#140014 = rgb 20,0,20) at ~60% opacity,
//     shifted fractionally toward Colors.plum (#0A000A = rgb 10,0,10).
//     The midpoint creates a surface that reads as clearly "above" the
//     void background without competing with text contrast.
//
//   CARD_BORDER: rgba(194, 203, 214, 0.07)
//     Derived from Colors.silver (#C2CBD6 = rgb 194,203,214) at 7% opacity.
//     At this opacity the border is perceptible in the dark environment
//     but invisible enough to not create a grid-like visual pattern.

const CARD_SURFACE = 'rgba(14,0,14,0.60)'     as const;
const CARD_BORDER  = 'rgba(194,203,214,0.07)' as const;

// ─── Props ────────────────────────────────────────────────────────────────

interface GhostCardProps extends ViewProps {
  children?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────

export function GhostCard({
  style,
  children,
  ...rest
}: GhostCardProps): React.ReactElement {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_SURFACE,
    borderWidth:     Layout.cardBorderWidth, // 1 — from Layout token
    borderColor:     CARD_BORDER,
    borderRadius:    Radius.lg,              // 16 — cards and sheets
  },
});

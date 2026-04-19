// src/components/DimensionCard.tsx
//
// Vertical-stack card used on the Today screen. Displays one behavioral
// dimension per card. The left-border accent is the only place dimension
// colors appear in the UI — never as fills or backgrounds.
//
// Structure: Pressable → GhostCard (with accent border override) → content
//
// RULES:
//   - No hardcoded hex values — DimensionAccent lookup only for accent color.
//   - No hardcoded pixel values — Layout and Spacing tokens only.
//   - No fontWeight.

import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { GhostCard }   from './GhostCard';
import { MonoLabel }   from './MonoLabel';
import { DimensionAccent, Layout, Spacing } from '../theme';
import type { DimensionKey } from '../theme';
import type { ViewStyle }    from 'react-native';

// ─── Props ────────────────────────────────────────────────────────────────

interface DimensionCardProps {
  // Which of the six behavioral dimensions this card represents.
  // Drives the left-border accent colour via DimensionAccent lookup.
  dimension: DimensionKey;

  // The card's section label — rendered as MonoLabel in ALL-CAPS at top.
  // Pass lowercase; MonoLabel applies textTransform: 'uppercase'.
  title: string;

  onPress: () => void;

  // Slot for dimension-specific data readouts (primary value, secondary
  // value, context line). Composed by the Today screen, not this component.
  children: React.ReactNode;

  style?: ViewStyle;
}

// ─── Component ────────────────────────────────────────────────────────────

export function DimensionCard({
  dimension,
  title,
  onPress,
  children,
  style,
}: DimensionCardProps): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title} dimension card`}
      style={[styles.pressable, style]}
    >
      <GhostCard
        style={[
          styles.card,
          // Left accent — the ONLY place a dimension color appears in UI.
          // Overrides GhostCard's uniform borderWidth on the left side.
          // borderWidth: 1 (from GhostCard base) remains on top/right/bottom.
          {
            borderLeftWidth: Layout.accentBorderWidth,  // 2
            borderLeftColor: DimensionAccent[dimension],
          },
        ]}
      >
        {/* ── Title label ─────────────────────────────────────────────── */}
        <MonoLabel style={styles.title}>
          {title}
        </MonoLabel>

        {/* ── Data slot ────────────────────────────────────────────────── */}
        {/* Primary value, secondary value, and context line are composed  */}
        {/* by the Today screen and passed as children. DimensionCard does */}
        {/* not know or care about the specific layout of each dimension.  */}
        <View style={styles.content}>
          {children}
        </View>
      </GhostCard>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },

  card: {
    minHeight:  Layout.dimensionCardHeight, // 140 — from Layout token
    padding: Spacing.lg,
    
    // borderLeftWidth and borderLeftColor are injected per-instance via the
    // style array in the component. The remaining three sides retain
    // GhostCard's 1px rgba ghost border unchanged.

    // borderRadius: Radius.lg is already set by GhostCard base styles.
  },

  title: {
    // MonoLabel default: data-s (11px JetBrains Mono), silverLo, uppercase.
    // Per spec: "CIRCADIAN" / "NUTRITION" etc. at top-left of each card.
    marginBottom: Spacing.sm, // 8 — visual gap between label and data values
  },

  content: {
    flex: 1,
    // Fills remaining card height below the title MonoLabel.
    // Children own their internal layout — e.g. Nutrition uses a row
    // with a vertical divider; Physical uses a single large number.
  },
});

// src/components/InsightCard.tsx
//
// Static informational card used on the Insights screen. Displays pattern
// observations, cross-dimension correlations, and Restart Intelligence rows.
//
// Structure: GhostCard → MonoLabel title + children slot
//   Unlike DimensionCard there is no Pressable wrapper — InsightCards are
//   read-only surfaces. No fixed height — the card hugs its content.
//
// The left-border accent logic is identical to DimensionCard, keeping the
// two screens visually coherent without sharing a component that would
// need to accommodate both fixed-height and auto-height behaviour.
//
// RULES:
//   - No hardcoded hex values — DimensionAccent lookup only.
//   - No hardcoded pixel values — Layout and Spacing tokens only.
//   - No fontWeight.

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GhostCard } from './GhostCard';
import { MonoLabel } from './MonoLabel';
import { DimensionAccent, Layout, Spacing } from '../theme';
import type { DimensionKey } from '../theme';
import type { ViewStyle }    from 'react-native';

// ─── Props ────────────────────────────────────────────────────────────────

interface InsightCardProps {
  // Which dimension this insight belongs to.
  // Drives the left-border accent colour via DimensionAccent lookup.
  dimension: DimensionKey;

  // Section label rendered as MonoLabel in ALL-CAPS at the top of the card.
  // Pass lowercase; MonoLabel applies textTransform: 'uppercase'.
  title: string;

  // Insight body — typically one or more Text nodes, a chart, or a
  // correlation row. Composed by the Insights screen, not this component.
  children: React.ReactNode;

  style?: ViewStyle;
}

// ─── Component ────────────────────────────────────────────────────────────

export function InsightCard({
  dimension,
  title,
  children,
  style,
}: InsightCardProps): React.ReactElement {
  return (
    <GhostCard
      style={[
        styles.card,
        // Left accent — identical pattern to DimensionCard.
        // borderLeftWidth: 2 replaces GhostCard's 1px border on the left.
        // The top, right, and bottom sides retain the 1px ghost border.
        {
          borderLeftWidth: Layout.accentBorderWidth,  // 2
          borderLeftColor: DimensionAccent[dimension],
        },
        style,
      ]}
    >
      {/* ── Title label ──────────────────────────────────────────────── */}
      <MonoLabel style={styles.title}>
        {title}
      </MonoLabel>

      {/* ── Content slot ─────────────────────────────────────────────── */}
      {/* Insight text, sparkline, correlation row, or any combination.  */}
      {/* Does not flex — allows card height to be driven by content.    */}
      <View>
        {children}
      </View>
    </GhostCard>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg, // 24 — matches DimensionCard internal padding
    // No height — InsightCard hugs its content. Insights may be one line
    // of text, a mini sparkline, or a multi-row correlation table.
    // The GhostCard base sets borderRadius: Radius.lg (16) automatically.
  },

  title: {
    // MonoLabel default: data-s (11px JetBrains Mono), silverLo, uppercase.
    marginBottom: Spacing.sm, // 8 — gap between label and insight body
  },
});

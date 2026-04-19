// src/theme/spacing.ts
//
// Spacing and border-radius tokens for Obsidius.
// RULE: No component may use a hardcoded pixel value for margin, padding,
//       gap, or border radius. Use these tokens exclusively.
//
// Every value here maps 1-to-1 to the spec (Section 03 — Design System).

// ─── Spacing Scale ────────────────────────────────────────────────────────
// Used for: margin, padding, gap, top/bottom/left/right offsets
export const Spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   40,
  xxl:  64,
  xxxl: 96,
} as const;

export type SpacingKey = keyof typeof Spacing;

// ─── Border Radius Scale ──────────────────────────────────────────────────
// Used for: borderRadius on all cards, buttons, inputs, modals
export const Radius = {
  sm:   6,    // Pills, small chips
  md:   10,   // Buttons, inputs
  lg:   16,   // Cards, sheets
  xl:   24,   // Large modals
  pill: 999,  // Fully round — filter pills, energy circles
} as const;

export type RadiusKey = keyof typeof Radius;

// ─── Named Layout Constants ───────────────────────────────────────────────
// Fixed measurements that are referenced by name in the spec and appear
// in multiple components. Centralised here so they stay in sync.

export const Layout = {
  // DimensionCard — horizontal scroll card on Today screen
  dimensionCardHeight:   140,
  dimensionCardWidthPct: 0.72,  // 72% of screen width; next card peeks at ~12%
  dimensionCardGap:      12,
  dimensionCardPadH:     24,    // Left and right padding on the scroll container

  // Tab bar
  tabBarHeight: 56,             // Exclusive of safe area inset

  // SilverButton
  silverButtonHeight: 52,

  // OutlineButton
  outlineButtonHeight: 44,

  // Bottom sheet handle bar
  sheetHandleWidth:  36,
  sheetHandleHeight: 4,

  // Circular pause timer
  pauseTimerDiameter: 160,

  // Accent left-border on DimensionCard / InsightCard
  accentBorderWidth: 2,

  // Card border
  cardBorderWidth: 1,
} as const;

export type LayoutKey = keyof typeof Layout;

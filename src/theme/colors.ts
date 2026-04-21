// src/theme/colors.ts
//
// Single source of truth for every color value in Obsidius.
// RULE: No component file may contain a hardcoded hex value.
//       All color references must come from this module.
//
// Palette philosophy:
//   - No bright colors anywhere. Every color is deliberately muted.
//   - No green/red to signal good/bad. The app does not make that judgment.
//   - Dimension accents appear ONLY as 2px left borders on cards.
//     Never as fills, backgrounds, or icon colors.

export const Colors = {

  // ─── Background System ───────────────────────────────────────────────────
  // Surfaces stack from darkest (void) to slightly lifted (plumMid)
  void:        '#000000',   // Primary background — every screen
  plum:        '#0A000A',   // Card surface — slightly lifted
  plumMid:     '#140014',   // Modal and sheet surfaces
  plumBorder:  '#1E001E',   // Subtle borders on dark surfaces

  // ─── Silver Text Scale ────────────────────────────────────────────────────
  // From primary text down to disabled/timestamp text
  silverHi:    '#EDEEF2',   // Primary text — titles, heroes, key data
  silver:      '#C2CBD6',   // Body text — descriptions, card copy
  silverMid:   '#8C95A0',   // Secondary text — labels, helper text
  silverLo:    '#565E68',   // Tertiary text — timestamps, disabled states

  // ─── Dimension Accents ────────────────────────────────────────────────────
  // Used ONLY as 2px left-border indicators on DimensionCard and InsightCard.
  // Never as background fills, icon colors, or text colors.
  dCircadian:   '#6B7FA3',  // Muted blue-grey  — wake and time
  dNutrition:   '#7A9B7A',  // Muted sage       — digital diet
  dPhysical:    '#9B8B6B',  // Muted amber      — movement
  dRecovery:    '#7A6B9B',  // Muted lavender   — rest
  dSocial:      '#9B6B7A',  // Muted rose       — connection
  dConsistency: '#6B9B8B',  // Muted teal       — routine
  dRetention:   '#8B5E8B',
  dSleepQuality:'#5E7A8B',
  dHydration:   '#5E8B7A',
  dColdExposure:'#8B7A5E',
  dPhysicalTraining: '#8B6A5E',

  // ─── Semantic ─────────────────────────────────────────────────────────────
  // Only one semantic color — used exclusively for reset/restart actions.
  // Never repurposed as an error indicator or validation feedback.
  reset:       '#8B5E5E',   // Muted red — reset/restart only, never bright

} as const;

export type ColorKey = keyof typeof Colors;

// ─── Gradient Definitions ─────────────────────────────────────────────────
// Stored as typed objects ready for <LinearGradient> from expo-linear-gradient.
// colors[] maps directly to the `colors` prop.
// angle is in degrees (converted to start/end in the component layer).

export const Gradients = {

  // Fixed background gradient — applied to every screen as a non-scrolling
  // backdrop. Starts near-black, walks through deep plum, ends with a ghost
  // of silver at the bottom right. Creates depth without adding "color".
  background: {
    colors: [
      'rgba(0,0,0,1)',
      'rgba(10,0,10,1)',
      'rgba(20,0,20,0.97)',
      'rgba(50,58,68,0.15)',
      'rgba(140,152,164,0.18)',
      'rgba(180,190,200,0.12)',
    ] as const,
    angleDeg: 121,
  },

  // CTA button gradient — SilverButton only.
  // Horizontal sweep from bright silver to softer silver.
  silverEdge: {
    colors: ['#EDEEF2', '#C2CBD6'] as const,
    angleDeg: 135,
  },

  // Hero number gradient — applied as a masked text gradient on primary
  // display numbers (not all text — only hero data moments).
  silverFade: {
    colors: ['#EDEEF2', '#A8B2BC', '#565E68'] as const,
    angleDeg: 180,
  },

  // Card inner surface — used as the fill of GhostCard and DimensionCard.
  // Semi-transparent so the background gradient bleeds through subtly.
  ghostSurface: {
    colors: [
      'rgba(20,0,20,0.5)',
      'rgba(10,0,10,0.7)',
    ] as const,
    angleDeg: 135,
  },

} as const;

export type GradientKey = keyof typeof Gradients;

// ─── Dimension accent lookup ───────────────────────────────────────────────
// Maps the six dimension string keys (as used in stores and props) to their
// accent color. Use this in DimensionCard and InsightCard instead of a
// switch statement.

export type DimensionKey =
  | 'circadian'
  | 'nutrition'
  | 'physical'
  | 'recovery'
  | 'social'
  | 'consistency'
  | 'retention'
  | 'sleep-quality'
  | 'hydration'
  | 'cold-exposure'
  | 'physical-training';

export const DimensionAccent: Record<DimensionKey, string> = {
  circadian:   Colors.dCircadian,
  nutrition:   Colors.dNutrition,
  physical:    Colors.dPhysical,
  recovery:    Colors.dRecovery,
  social:      Colors.dSocial,
  consistency: Colors.dConsistency,
  retention:   Colors.dRetention,
  'sleep-quality': Colors.dSleepQuality,
  hydration:   Colors.dHydration,
  'cold-exposure': Colors.dColdExposure,
  'physical-training': Colors.dPhysicalTraining,
};

// src/theme/typography.ts
//
// Complete type scale for Obsidius — 13 tokens covering every text role
// in the app. Maps directly to Section 03 of the spec.
//
// RULES:
//   - Import FontFamily from ./fonts — no hardcoded font strings here.
//   - Never include fontWeight in any token. Weight is encoded in the
//     family name (Syne_700Bold is already bold by definition).
//   - These are plain style objects, not StyleSheet.create() entries,
//     so they can be spread into inline styles and StyleSheet alike.

import { FontFamily } from './fonts';

// ─── Token Shape ─────────────────────────────────────────────────────────
// Every token carries exactly the four style properties needed for text
// rendering. Nothing more — color, opacity, and transforms live in
// component-level styles.

export interface TypeToken {
  fontFamily:    string;
  fontSize:      number;
  lineHeight:    number;
  letterSpacing: number;
}

// ─── Type Scale ───────────────────────────────────────────────────────────
// Spec section 03 — Typography Scale. Token names match the spec 1-to-1.
// Read as: display = Cormorant Italic (emotion/data heroes)
//           heading = Syne Bold       (structural, uppercase labels)
//           body    = Plus Jakarta    (readable, natural language)
//           data    = JetBrains Mono  (raw numbers, timestamps, metadata)

export const Typography = {

  // ── Display — Cormorant Garamond Italic ──────────────────────────────
  // Reserved for hero moments: onboarding headlines, screen titles,
  // primary large numbers that carry emotional weight.

  'display-xl': {
    fontFamily:    FontFamily.display,
    fontSize:      72,
    lineHeight:    72,
    letterSpacing: 0,
  },
  'display-l': {
    fontFamily:    FontFamily.display,
    fontSize:      56,
    lineHeight:    58,
    letterSpacing: 0,
  },
  'display-m': {
    fontFamily:    FontFamily.display,
    fontSize:      40,
    lineHeight:    44,
    letterSpacing: 0,
  },
  'display-s': {
    fontFamily:    FontFamily.display,
    fontSize:      28,
    lineHeight:    32,
    letterSpacing: 0,
  },

  // ── Heading — Syne Bold ───────────────────────────────────────────────
  // Structural labels: section headers, tab names, ALL-CAPS pill text.
  // Always rendered in uppercase by the component (textTransform handled
  // at the component layer, not here).

  'heading-l': {
    fontFamily:    FontFamily.ui,
    fontSize:      18,
    lineHeight:    24,
    letterSpacing: 0.5,
  },
  'heading-m': {
    fontFamily:    FontFamily.ui,
    fontSize:      13,
    lineHeight:    18,
    letterSpacing: 1.5,
  },
  'heading-s': {
    fontFamily:    FontFamily.ui,
    fontSize:      11,
    lineHeight:    16,
    letterSpacing: 2.0,
  },

  // ── Body — Plus Jakarta Sans ──────────────────────────────────────────
  // Natural-language text: card descriptions, paragraphs, helper text.
  // Uses Regular (400) weight. Where the spec calls for Medium (500) —
  // e.g. the morning/evening row labels — use body-med-* variants below.

  'body-l': {
    fontFamily:    FontFamily.body,
    fontSize:      15,
    lineHeight:    24,
    letterSpacing: 0,
  },
  'body-m': {
    fontFamily:    FontFamily.body,
    fontSize:      14,
    lineHeight:    22,
    letterSpacing: 0,
  },
  'body-s': {
    fontFamily:    FontFamily.body,
    fontSize:      13,
    lineHeight:    20,
    letterSpacing: 0,
  },

  // Medium-weight body variants — same scale, bodyMed family.
  // Use when the spec explicitly says "Medium 500" (e.g. check-in row labels).
  'body-med-l': {
    fontFamily:    FontFamily.bodyMed,
    fontSize:      15,
    lineHeight:    24,
    letterSpacing: 0,
  },
  'body-med-m': {
    fontFamily:    FontFamily.bodyMed,
    fontSize:      14,
    lineHeight:    22,
    letterSpacing: 0,
  },

  // ── Data — JetBrains Mono ─────────────────────────────────────────────
  // All numeric output, timestamps, raw sensor values, version strings.
  // Monospace ensures digit columns align in chart axes and value pairs.

  'data-l': {
    fontFamily:    FontFamily.mono,
    fontSize:      28,
    lineHeight:    32,
    letterSpacing: 0,
  },
  'data-m': {
    fontFamily:    FontFamily.mono,
    fontSize:      14,
    lineHeight:    20,
    letterSpacing: 0,
  },
  'data-s': {
    fontFamily:    FontFamily.mono,
    fontSize:      11,
    lineHeight:    16,
    letterSpacing: 0.5,
  },

} as const satisfies Record<string, TypeToken>;

export type TypographyKey = keyof typeof Typography;

// ─── Convenience helper ───────────────────────────────────────────────────
// Spreads a typography token into a style object.
// Usage:  style={[t('data-l'), { color: Colors.silverHi }]}
// This is a thin wrapper — no logic, just readability at the call site.
export function t(token: TypographyKey): TypeToken {
  return Typography[token];
}

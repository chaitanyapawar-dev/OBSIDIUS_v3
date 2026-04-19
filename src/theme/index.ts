// src/theme/index.ts
//
// Single entry point for the Obsidius theme module.
// Every component imports from '@/src/theme' — never from individual
// theme files directly. This barrel keeps import paths short and makes
// future theme reorganisation a one-file change.
//
// RULES:
//   - Named exports only. No default export.
//   - No logic, no constants defined here — pure re-exports.
//   - Export order matches the build order in the spec (fonts → colors
//     → spacing → typography) so the file reads as a table of contents.

export {
  useObsidiusFonts,
  FontFamily,
} from './fonts';

export type { FontFamilyKey } from './fonts';

export {
  Colors,
  Gradients,
  DimensionAccent,
} from './colors';

export type {
  ColorKey,
  GradientKey,
  DimensionKey,
} from './colors';

export {
  Spacing,
  Radius,
  Layout,
} from './spacing';

export type {
  SpacingKey,
  RadiusKey,
  LayoutKey,
} from './spacing';

export {
  Typography,
  t,
} from './typography';

export type {
  TypeToken,
  TypographyKey,
} from './typography';

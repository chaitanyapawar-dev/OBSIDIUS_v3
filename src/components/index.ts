// src/components/index.ts
//
// Barrel file — single entry point for the shared components module.
//
// Rules:
//   - Named exports only. No default exports.
//   - No export * wildcards — explicit re-exports only, so Metro's
//     module graph stays deterministic and tree-shaking works correctly.
//   - No logic, constants, or type definitions live here.
//     This file is purely a re-export surface.
//
// Import pattern for consumers:
//   import { MonoLabel, GhostCard, SilverButton } from '../components';

// ─── Components ───────────────────────────────────────────────────────────

export { MonoLabel }     from './MonoLabel';
export { GhostCard }     from './GhostCard';
export { SilverButton }  from './SilverButton';
export { OutlineButton } from './OutlineButton';
export { DimensionCard } from './DimensionCard';
export { InsightCard }   from './InsightCard';
export { ObsidiusLogo }  from './ObsidiusLogo';

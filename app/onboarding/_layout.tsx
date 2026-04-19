// app/onboarding/_layout.tsx
//
// Stack navigator shell for the onboarding sequence.
// Screens: intro → baseline → permissions → ready
//
// Animation: slide_from_right — communicates linear forward progression.
// Each step feels like advancing through a sequence, not appearing from
// nowhere. 'fade' was considered but lacks the positional context that
// helps users understand they are moving through ordered steps.
//
// Screens are left implicit — Expo Router's file-based routing resolves
// app/onboarding/intro.tsx, baseline.tsx, permissions.tsx, and ready.tsx
// automatically. No explicit <Stack.Screen> declarations needed unless
// a specific screen requires overridden options (e.g. a back-gesture lock).
//
// RULE: Strict TypeScript, no any types.

import React from 'react';
import { Stack } from 'expo-router';

// ─── Onboarding stack ─────────────────────────────────────────────────────

export default function OnboardingLayout(): React.ReactElement {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation:   'slide_from_right',
        // Gesture-driven back swipe is intentionally left enabled.
        // The onboarding flow has no irreversible steps — the user can
        // freely go back to correct an earlier answer before completing.
      }}
    />
  );
}

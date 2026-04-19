// app/index.tsx
//
// Routing gatekeeper. Renders no UI — its sole purpose is to redirect
// the user to the correct entry screen based on onboarding completion.
//
// Decision:
//   isComplete === true  → /(tabs)/today       (returning user)
//   isComplete === false → /onboarding/intro   (first-time user)
//
// This file executes only after _layout.tsx has confirmed that:
//   - Fonts are loaded (fontsLoaded === true)
//   - MMKV has rehydrated  (hasHydrated === true)
// The null-return guard in _layout.tsx means isComplete here always
// reflects the persisted value, never the false default.
//
// RULE: Strict TypeScript, no any types. No UI rendered here.

import { Redirect } from 'expo-router';
import { useOnboardingStore } from '../src/store/useOnboardingStore';

// ─── Gatekeeper ───────────────────────────────────────────────────────────

export default function Index(): React.ReactElement {
  const isComplete = useOnboardingStore((s) => s.isComplete);

  if (isComplete) {
    return <Redirect href="/(tabs)/today" />;
  }

  return <Redirect href="/onboarding/intro" />;
}

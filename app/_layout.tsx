// app/_layout.tsx
//
// Root layout for the Expo Router app. Three responsibilities:
//
//   1. Splash gate — holds the native splash screen until both the
//      font bundle AND MMKV hydration are complete. Returning null
//      while either is pending keeps the splash visible natively.
//
//   2. Day-reset — calls resetIfNewDay() on mount and on every
//      'active' AppState transition so check-in state never bleeds
//      from one calendar day into the next, regardless of how long
//      the app spent in the background.
//
//   3. Navigation shell — returns an Expo Router <Stack> with all
//      chrome hidden. Screen-level routing (onboarding vs. tabs) is
//      handled in app/index.tsx, not here.
//
// RULE: Strict TypeScript, no any types.

import { useEffect, useRef }   from 'react';
import { AppState }            from 'react-native';
import { Stack }               from 'expo-router';
import * as SplashScreen       from 'expo-splash-screen';
import type { AppStateStatus } from 'react-native';

import { useObsidiusFonts }   from '../src/theme';
import { useOnboardingStore } from '../src/store/useOnboardingStore';
import { useCheckinStore }    from '../src/store/useCheckinStore';
import { useDimensionStore }  from '../src/store/useDimensionStore';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// ─── Splash guard ─────────────────────────────────────────────────────────
// Called at module evaluation time — before any component renders.
// This is the only safe place; calling it inside the component body risks
// a race where the native splash auto-hides before the call lands.
SplashScreen.preventAutoHideAsync();

// ─── Root layout ──────────────────────────────────────────────────────────

export default function RootLayout(): React.ReactElement | null {
  // Font loading — useFonts returns [loaded: boolean, error: Error | null]
  const [fontsLoaded] = useObsidiusFonts();

  // MMKV hydration gate — false on cold start, set to true by
  // onRehydrateStorage in useOnboardingStore once MMKV read completes.
  const hasHydrated = useOnboardingStore((s) => s.hasHydrated);

  // Day-reset action — stable reference (Zustand action identity is fixed).
  const resetIfNewDay = useCheckinStore((s) => s.resetIfNewDay);

  // ── Day-reset on mount ────────────────────────────────────────────
  // Guards against the case where the user left the app open overnight
  // and returns to an already-mounted layout without triggering an
  // AppState 'active' transition from background.
  // Note: Initial reset on cold start is handled post-hydration below.
  // This useEffect covers cases where the component re-mounts or is kept alive.

  // ── Day-reset on foreground ───────────────────────────────────────
  // AppState fires 'change' on every transition. We only want to reset
  // when the app returns to active FROM background/inactive — not on the
  // initial mount (handled above) or on transitions away from active.
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextState === 'active'
        ) {
          resetIfNewDay();
        }
        appStateRef.current = nextState;
      },
    );

    return () => subscription.remove();
  }, [resetIfNewDay]);

  // ── Splash reveal ─────────────────────────────────────────────────
  // Only hide when BOTH conditions are satisfied:
  //   - fontsLoaded: font bundle parsed by the JS engine
  //   - hasHydrated: MMKV has finished restoring persisted state
  // If either is false the user sees the native splash instead of a
  // partially-styled or incorrectly-routed screen.
  useEffect(() => {
    if (fontsLoaded && hasHydrated) {
      useCheckinStore.getState().resetIfNewDay();
      useDimensionStore.getState().seedIfNeeded();
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, hasHydrated]);

  // ── Null render — keep native splash painted ─────────────────────
  if (!fontsLoaded || !hasHydrated) {
    return null;
  }

  // ── Navigation shell ──────────────────────────────────────────────
  // All header chrome is hidden globally. Individual screens manage
  // their own headings via text elements, not the navigator header.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

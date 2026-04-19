// src/store/useOnboardingStore.ts
//
// Persisted onboarding state — the first store hydrated on app launch.
//
// Cold-start flash prevention:
//   hasHydrated starts as false on every launch (it is excluded from
//   persistence via `partialize`). Once MMKV finishes rehydrating,
//   onRehydrateStorage fires setHydrated(true). Both app/_layout.tsx
//   (splash hold) and app/index.tsx (redirect guard) read hasHydrated
//   before making any routing decision.
//
// RULE: No any types. No hardcoded strings outside this file.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from './mmkv';

// ─── State interface ──────────────────────────────────────────────────────

interface OnboardingState {
  // Runtime-only flag — never persisted. Starts false, becomes true
  // the moment onRehydrateStorage fires after MMKV read completes.
  hasHydrated: boolean;

  // True once the user completes Step 4 ("Enter Obsidius") of onboarding.
  // Drives the redirect logic in app/index.tsx.
  isComplete: boolean;

  // Implementation intention set during onboarding Step 2 (baseline.tsx).
  // Format: the full composed sentence "When X happens I will Y".
  // Displayed on Profile screen and surfaced during the Reset flow.
  intention: string;

  // The number of days the user has maintained their intention without
  // a reset. Written by useCheckinStore after each successful evening
  // debrief and reset event. Read by the Consistency dimension card.
  streakBaseline: number;

  // Scheduled local notification times for morning check-in and
  // evening debrief. Format: "HH:MM" (24-hour, zero-padded).
  morningTime: string;
  eveningTime: string;

  // Android permission states, written by the permissions step of
  // onboarding (permissions.tsx) and read by Profile screen and native
  // module initialisation in Phase 7.
  // usageAccessGranted  — android.permission.PACKAGE_USAGE_STATS
  //                       (Special App Access — not a runtime permission;
  //                        user must grant manually in Settings.)
  // activityAccessGranted — android.permission.ACTIVITY_RECOGNITION
  //                          (Runtime permission, requestable via Expo.)
  usageAccessGranted:    boolean;
  activityAccessGranted: boolean;

  // ── Actions ──────────────────────────────────────────────────────────
  setHydrated:              (value: boolean) => void;
  setComplete:              (value: boolean) => void;
  setIntention:             (value: string)  => void;
  setStreakBaseline:         (value: number)  => void;
  setMorningTime:           (time: string)   => void;
  setEveningTime:           (time: string)   => void;
  setUsageAccessGranted:    (value: boolean) => void;
  setActivityAccessGranted: (value: boolean) => void;
  reset:                    () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      // ── Initial state ───────────────────────────────────────────────
      hasHydrated:           false,   // Always false at launch — set by onRehydrateStorage
      isComplete:            false,
      intention:             '',
      streakBaseline:        0,
      morningTime:           '08:00',
      eveningTime:           '21:30',
      usageAccessGranted:    false,
      activityAccessGranted: false,

      // ── Actions ─────────────────────────────────────────────────────
      setHydrated:              (value) => set({ hasHydrated: value }),
      setComplete:              (value) => set({ isComplete: value }),
      setIntention:             (value) => set({ intention: value }),
      setStreakBaseline:         (value) => set({ streakBaseline: value }),
      setMorningTime:           (time)  => set({ morningTime: time }),
      setEveningTime:           (time)  => set({ eveningTime: time }),
      setUsageAccessGranted:    (value) => set({ usageAccessGranted: value }),
      setActivityAccessGranted: (value) => set({ activityAccessGranted: value }),
      reset:                    () => set({
        hasHydrated: false,
        isComplete: false,
        intention: '',
        streakBaseline: 0,
        morningTime: '08:00',
        eveningTime: '21:00',
        usageAccessGranted: false,
        activityAccessGranted: false,
      }),
    }),
    {
      name: 'obsidius-onboarding',
      storage: createJSONStorage(() => zustandMMKVStorage),

      // ── Rehydration callback ─────────────────────────────────────────
      // Called after MMKV has finished reading and restoring persisted state.
      // The outer function receives state-before-rehydration (unused here).
      // The inner function receives the fully rehydrated state — or undefined
      // if MMKV threw during read. The optional chain guards that case.
      onRehydrateStorage: () => (rehydratedState) => {
        rehydratedState?.setHydrated(true);
      },

      // ── Partialize — exclude hasHydrated from persistence ────────────
      // hasHydrated is a runtime signal, not user data. Persisting it
      // would mean the app launches with hasHydrated === true from MMKV,
      // skipping the rehydration guard and causing the cold-start flash
      // this entire mechanism exists to prevent.
      partialize: (state): Omit<OnboardingState, 'hasHydrated'> => {
        const { hasHydrated: _, ...persisted } = state;
        return persisted;
      },
    },
  ),
);

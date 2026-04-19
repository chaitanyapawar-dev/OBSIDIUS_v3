// src/theme/fonts.ts
//
// Loads all four Obsidius font families via @expo-google-fonts before
// the splash screen is dismissed. Called once in app/_layout.tsx.
//
// RULE: Never pass `fontWeight` to a <Text> using a custom font.
//       Weight is encoded in the family name (e.g. Syne_700Bold).
//       Passing fontWeight on top of a loaded custom font causes
//       the OS to apply a synthetic bold on top — breaking the design.

import {
  useFonts,
  CormorantGaramond_400Regular_Italic,
} from '@expo-google-fonts/cormorant-garamond';

import {
  Syne_700Bold,
} from '@expo-google-fonts/syne';

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
} from '@expo-google-fonts/plus-jakarta-sans';

import {
  JetBrainsMono_400Regular,
} from '@expo-google-fonts/jetbrains-mono';

// Re-export the hook pre-wired with the exact four families Obsidius uses.
// Usage in app/_layout.tsx:
//   const [fontsLoaded, fontError] = useObsidiusFonts();
export function useObsidiusFonts() {
  return useFonts({
    // Display — hero numbers, screen titles, emotional moments
    CormorantGaramond_400Regular_Italic,

    // UI — section labels, navigation, ALL-CAPS tags, button text
    Syne_700Bold,

    // Body — card descriptions, body copy, standard paragraphs
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,

    // Data — all numeric values, timestamps, raw data output
    JetBrainsMono_400Regular,
  });
}

// Font family name constants — use these as the `fontFamily` value in
// StyleSheet / inline styles. Never construct these strings by hand.
export const FontFamily = {
  display: 'CormorantGaramond_400Regular_Italic',
  ui:      'Syne_700Bold',
  body:    'PlusJakartaSans_400Regular',
  bodyMed: 'PlusJakartaSans_500Medium',
  mono:    'JetBrainsMono_400Regular',
} as const;

export type FontFamilyKey = keyof typeof FontFamily;

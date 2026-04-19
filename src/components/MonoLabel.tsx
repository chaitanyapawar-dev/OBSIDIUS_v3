// src/components/MonoLabel.tsx
//
// Reusable monospace text component for metadata, timestamps, section
// labels, and dimension tags. The backbone of the app's structural
// typographic layer.
//
// RULES:
//   - No fontWeight — weight is encoded in JetBrainsMono_400Regular.
//   - No hardcoded hex values — Colors tokens only.
//   - textTransform: 'uppercase' is always applied; components do not
//     need to uppercase their strings before passing them as children.

import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { t, Colors } from '../theme';
import type { TypographyKey } from '../theme';

// ─── Props ────────────────────────────────────────────────────────────────

// Only data-* tokens are valid for MonoLabel — this component is
// exclusively for JetBrains Mono output. Passing 'body-m' here would
// still render, but it signals an incorrect usage of the component.
// The type constraint enforces intent at the call site.
type DataToken = Extract<TypographyKey, `data-${string}`>;

interface MonoLabelProps extends TextProps {
  // Typography token — defaults to 'data-s' (11px, the spec baseline
  // for section labels, dimension tags, and timestamps).
  token?: DataToken;
}

// ─── Component ────────────────────────────────────────────────────────────

export function MonoLabel({
  token = 'data-s',
  style,
  children,
  ...rest
}: MonoLabelProps): React.ReactElement {
  return (
    <Text
      style={[styles.base, t(token), style]}
      {...rest}
    >
      {children}
    </Text>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    color:         Colors.silverLo,
    textTransform: 'uppercase',
    // No fontWeight — JetBrainsMono_400Regular weight is baked into the
    // family name. Adding fontWeight here causes Android to apply a
    // synthetic bold pass on top, breaking the designed weight.
  },
});

// src/components/ObsidiusLogo.tsx
//
// The universal logomark for Obsidius.
// A custom SVG rhombus with a silver fade gradient, paired with the uppercase
// wordmark.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Defs, LinearGradient, Stop } from 'react-native-svg';
import { t, Colors, Spacing } from '../theme';

interface ObsidiusLogoProps {
  orientation?: 'horizontal' | 'vertical';
  logoSize?: number;
  wordmarkSize?: number;
  wordmarkLetterSpacing?: number;
}

export function ObsidiusLogo({
  orientation = 'horizontal',
  logoSize = 18,
  wordmarkSize = 11,
  wordmarkLetterSpacing = 3,
}: ObsidiusLogoProps): React.ReactElement {
  const isVertical = orientation === 'vertical';

  return (
    <View style={[styles.container, isVertical && styles.verticalContainer]}>
      <Svg width={logoSize} height={logoSize} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id="silverFade" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={Colors.silverHi} />
            <Stop offset="50%" stopColor={Colors.silver} />
            <Stop offset="100%" stopColor={Colors.silverLo} />
          </LinearGradient>
        </Defs>
        <Polygon
          points="12,2 22,12 12,22 2,12"
          fill="url(#silverFade)"
        />
      </Svg>

      <Text
        style={[
          t('heading-s'),
          {
            color: Colors.silverLo,
            textTransform: 'uppercase',
            fontSize: wordmarkSize,
            letterSpacing: wordmarkLetterSpacing,
          },
          isVertical ? { marginTop: Spacing.sm } : { marginLeft: Spacing.sm },
        ]}
      >
        Obsidius
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
});

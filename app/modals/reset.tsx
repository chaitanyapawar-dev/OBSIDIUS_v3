// app/modals/reset.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Colors } from '../../src/theme/colors';
import { Typography, t, Spacing } from '../../src/theme';
import { GhostCard } from '../../src/components/GhostCard';
import { SilverButton } from '../../src/components/SilverButton';
import { usePauseStore } from '../../src/store/usePauseStore';
import { useCheckinStore } from '../../src/store/useCheckinStore';

export default function ResetModal() {
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');

  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleRestartWithLog = () => {
    usePauseStore.getState().logReset({
      timestamp: Date.now(),
      q1: q1 || undefined,
      q2: q2 || undefined,
      q3: q3 || undefined,
      anchorUpdated: false,
    });
    useCheckinStore.getState().resetToday();
    router.dismissAll();
    router.replace('/(tabs)/today');
  };

  const handleJustRestart = () => {
    useCheckinStore.getState().resetToday();
    router.dismissAll();
    router.replace('/(tabs)/today');
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconWrapper}>
          <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
            <Path d="M12 2L2 12L12 22L22 12L12 2Z" fill={Colors.silverHi} />
          </Svg>
        </View>

        <Text style={[t('display-m'), styles.title]}>It's data.</Text>
        <Text style={[t('body-l'), styles.subtitle]}>Not failure. What happened?</Text>

        <GhostCard style={styles.card}>
          <Text style={[t('heading-s'), styles.cardLabel]}>IN THE HOUR BEFORE</Text>
          <TextInput
            style={[t('body-m'), styles.input]}
            placeholder="What were you doing?"
            placeholderTextColor={Colors.silverLo}
            multiline={true}
            numberOfLines={3}
            value={q1}
            onChangeText={setQ1}
          />
        </GhostCard>

        <GhostCard style={styles.card}>
          <Text style={[t('heading-s'), styles.cardLabel]}>WHAT WOULD HAVE HELPED</Text>
          <TextInput
            style={[t('body-m'), styles.input]}
            placeholder="What would have changed the outcome?"
            placeholderTextColor={Colors.silverLo}
            multiline={true}
            numberOfLines={3}
            value={q2}
            onChangeText={setQ2}
          />
        </GhostCard>

        <GhostCard style={styles.card}>
          <Text style={[t('heading-s'), styles.cardLabel]}>TOMORROW</Text>
          <TextInput
            style={[t('body-m'), styles.input]}
            placeholder="What do you want tomorrow to look like?"
            placeholderTextColor={Colors.silverLo}
            multiline={true}
            numberOfLines={3}
            value={q3}
            onChangeText={setQ3}
          />
        </GhostCard>

        <View style={styles.footer}>
          <SilverButton label="Restart" onPress={handleRestartWithLog} style={styles.button} />
          
          <Pressable onPress={handleJustRestart} style={styles.linkWrapper}>
            <Text style={[t('body-s'), styles.linkText]}>Just restart</Text>
          </Pressable>
        </View>

      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.void,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxxl * 2,
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.silverHi,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.silver,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  card: {
    width: '100%',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardLabel: {
    color: Colors.silverLo,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  input: {
    color: Colors.silverHi,
    backgroundColor: 'transparent',
    padding: 0,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  footer: {
    width: '100%',
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  linkWrapper: {
    padding: Spacing.sm,
  },
  linkText: {
    color: Colors.silverLo,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});

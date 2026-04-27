// src/components/sheets/MorningCheckinSheet.tsx
import React, { useState, forwardRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Gradients } from '../../theme/colors';
import { Typography, t, Spacing } from '../../theme';
import { SilverButton } from '../SilverButton';
import { useCheckinStore } from '../../store/useCheckinStore';
import { useDimensionStore } from '../../store/useDimensionStore';
import { format } from 'date-fns';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function EnergyCircularOption({ 
  value, 
  selected, 
  onPress 
}: { 
  value: number; 
  selected: boolean; 
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  
  const handlePressIn = () => { scale.value = withSpring(0.94); };
  const handlePressOut = () => { scale.value = withSpring(1); };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[
        styles.energyCircle, 
        selected && styles.energyCircleSelected,
        animatedStyle
      ]}
    >
      {selected && (
        <LinearGradient
          colors={[...Gradients.silverEdge.colors]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      <Text style={[t('heading-s'), { color: selected ? Colors.void : Colors.silverMid, zIndex: 2 }]}>
        {value}
      </Text>
    </AnimatedPressable>
  );
}

function CustomHandle() {
  return (
    <View style={styles.handleContainer}>
      <View style={styles.handle} />
    </View>
  );
}

export const MorningCheckinSheet = forwardRef<BottomSheetModal, {}>((_, ref) => {
  const [selectedEnergy, setSelectedEnergy] = useState<number | undefined>(undefined);
  const [sleepQuality, setSleepQuality] = useState<number | undefined>(undefined);
  const [wordInput, setWordInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      setSelectedEnergy(undefined);
      setSleepQuality(undefined);
      setWordInput('');
      setInputFocused(false);
    }
  };

  const dismiss = () => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.dismiss();
    }
  };

  const handleStart = () => {
    if (selectedEnergy === undefined) return;
    useCheckinStore.getState().completeMorning(selectedEnergy, wordInput.trim());
    if (sleepQuality !== undefined) {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      useDimensionStore.getState().logManualEntry(todayStr, { dailySleepQuality: sleepQuality });
    }
    dismiss();
  };

  const handleSkip = () => {
    dismiss();
  };

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={['65%']}
      backgroundStyle={styles.bg}
      handleComponent={CustomHandle}
      onChange={handleSheetChanges}
    >
      <BottomSheetView style={styles.content}>
        <Text style={[t('display-s'), styles.title]}>Good morning.</Text>
        <Text style={[t('body-m'), styles.subtitle]}>How are you starting today?</Text>

        <Text style={[t('heading-s'), styles.label]}>ENERGY LEVEL</Text>
        <View style={styles.energyRow}>
          {[1, 2, 3, 4, 5].map((val) => (
            <EnergyCircularOption 
              key={val} 
              value={val} 
              selected={selectedEnergy === val} 
              onPress={() => setSelectedEnergy(val)} 
            />
          ))}
        </View>

        <Text style={[t('heading-s'), styles.label]}>SLEEP QUALITY (1-5)</Text>
        <View style={styles.energyRow}>
          {[1, 2, 3, 4, 5].map((val) => (
            <EnergyCircularOption 
              key={`sq-${val}`} 
              value={val} 
              selected={sleepQuality === val} 
              onPress={() => setSleepQuality(val)} 
            />
          ))}
        </View>

        <Text style={[t('heading-s'), styles.label]}>ONE WORD</Text>
        <TextInput
          style={[
            t('body-l'), 
            styles.input, 
            inputFocused && styles.inputFocused
          ]}
          placeholder="Today feels..."
          placeholderTextColor={Colors.silverLo}
          selectionColor={Colors.silverHi}
          value={wordInput}
          onChangeText={setWordInput}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
        />

        <View style={styles.footer}>
          <SilverButton 
            label="Start Today" 
            onPress={handleStart} 
            disabled={selectedEnergy === undefined}
            style={styles.btn}
          />
          <Pressable onPress={handleSkip}>
            <Text style={[t('body-s'), styles.skip]}>Skip</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  bg: {
    backgroundColor: Colors.plumMid,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: Spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(194,203,214,0.15)',
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  title: {
    color: Colors.silverHi,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.silverMid,
    marginBottom: Spacing.xl,
  },
  label: {
    color: Colors.silverLo,
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  energyRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.xl,
  },
  energyCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.plumMid,
    borderWidth: 1,
    borderColor: 'rgba(194,203,214,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  energyCircleSelected: {
    borderWidth: 0,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(194,203,214,0.2)',
    paddingVertical: Spacing.sm,
    color: Colors.silverHi,
    marginBottom: Spacing.xl,
  },
  inputFocused: {
    borderBottomColor: Colors.silver,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  btn: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  skip: {
    color: Colors.silverLo,
  },
});

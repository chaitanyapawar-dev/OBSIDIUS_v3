// src/components/sheets/EveningDebriefSheet.tsx
import React, { useState, forwardRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { RotateCcw } from 'lucide-react-native';

import { Colors, Gradients } from '../../theme/colors';
import { Typography, t, Spacing } from '../../theme';
import { SilverButton } from '../SilverButton';
import { GhostCard } from '../GhostCard';
import { useCheckinStore } from '../../store/useCheckinStore';
import { useDimensionStore } from '../../store/useDimensionStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getTodayInsight(): string {
  const today = format(new Date(), 'yyyy-MM-dd');
  const dimState = useDimensionStore.getState();
  const passive = dimState.nutrition?.dailyPassiveMinutes?.[today] ?? 0;
  const steps = dimState.physical?.dailySteps?.[today] ?? 0;
  const longestBreak = dimState.recovery?.dailyLongestBreakMinutes?.[today] ?? 0;
  
  const weekAvgSteps = dimState.getWeekAverage ? dimState.getWeekAverage('physical') : 0;
  const weekPassiveDays = dimState.nutrition?.dailyPassiveMinutes 
    ? Object.values(dimState.nutrition.dailyPassiveMinutes) 
    : [];
    
  const weekAvgPassive = weekPassiveDays.length
    ? weekPassiveDays.reduce((a, b) => a + b, 0) / weekPassiveDays.length
    : 0;
    
  if (passive > weekAvgPassive * 1.4)
    return `Your passive screen use was higher than your weekly average today.`;
  if (steps > weekAvgSteps * 1.3)
    return `You moved significantly more than usual today — ${steps.toLocaleString()} steps.`;
  if (longestBreak > 45)
    return `You took a ${longestBreak}-minute screen break — your longest this week.`;
  if (longestBreak === 0)
    return `No screen breaks detected today. Your phone was active almost continuously.`;
    
  return `Today's pattern is recorded. Check Insights for emerging patterns.`;
}

function StatusCard({
  type,
  selected,
  onPress
}: {
  type: 'maintained' | 'reset';
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const handlePressIn = () => { scale.value = withSpring(0.96); };
  const handlePressOut = () => { scale.value = withSpring(1); };
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const isReset = type === 'reset';
  const label = isReset ? 'Reset' : 'Maintained';
  const color = isReset ? Colors.reset : Colors.silverHi;
  
  const borderStyle = selected ? { borderWidth: 1, borderColor: color } : {};
  const backgroundStyle = selected 
    ? { backgroundColor: isReset ? 'rgba(139,94,94,0.06)' : 'rgba(234,236,240,0.04)' }
    : {};

  return (
    <Animated.View style={[styles.statusCardWrapper, animatedStyle]}>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
        <GhostCard style={[styles.statusCard, borderStyle, backgroundStyle]}>
          {isReset ? (
            <RotateCcw size={16} color={Colors.silverMid} />
          ) : (
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M12 2L2 12L12 22L22 12L12 2Z" fill={Colors.silverHi} />
            </Svg>
          )}
          <Text style={[t('body-s'), { color, marginLeft: 8 }]}>{label}</Text>
        </GhostCard>
      </Pressable>
    </Animated.View>
  );
}

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

export const EveningDebriefSheet = forwardRef<BottomSheetModal, {}>((_, ref) => {
  const [selectedStatus, setSelectedStatus] = useState<'maintained' | 'reset' | undefined>(undefined);
  const [selectedEnergy, setSelectedEnergy] = useState<number | undefined>(undefined);
  const [reflection, setReflection] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      setSelectedStatus(undefined);
      setSelectedEnergy(undefined);
      setReflection('');
      setInputFocused(false);
    }
  };

  const dismiss = () => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.dismiss();
    }
  };

  const handleCloseDay = () => {
    if (!selectedStatus || selectedEnergy === undefined) return;
    useCheckinStore.getState().completeEvening(selectedStatus, selectedEnergy, reflection.trim());
    dismiss();
    if (selectedStatus === 'reset') {
      setTimeout(() => router.push('/modals/reset'), 400);
    }
  };

  const insight = getTodayInsight();

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={['80%']}
      backgroundStyle={styles.bg}
      handleComponent={CustomHandle}
      onChange={handleSheetChanges}
    >
      <BottomSheetView style={styles.bottomSheetView}>
        <ScrollView 
           contentContainerStyle={styles.content}
           keyboardShouldPersistTaps="handled"
           showsVerticalScrollIndicator={false}
        >
          <Text style={[t('display-s'), styles.title]}>How did today go?</Text>
          <Text style={[t('body-m'), styles.subtitle]}>Take a moment.</Text>

          <Text style={[t('heading-s'), styles.label]}>TODAY</Text>
          <View style={styles.statusRow}>
            <StatusCard 
              type="maintained" 
              selected={selectedStatus === 'maintained'} 
              onPress={() => setSelectedStatus('maintained')} 
            />
            <StatusCard 
              type="reset" 
              selected={selectedStatus === 'reset'} 
              onPress={() => setSelectedStatus('reset')} 
            />
          </View>

          <Text style={[t('heading-s'), styles.label]}>ENERGY</Text>
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

          <Text style={[t('heading-s'), styles.label]}>REFLECTION</Text>
          <TextInput
            style={[
              t('body-l'), 
              styles.input, 
              inputFocused && styles.inputFocused
            ]}
            placeholder="One line — how did today actually feel?"
            placeholderTextColor={Colors.silverLo}
            selectionColor={Colors.silverHi}
            value={reflection}
            onChangeText={setReflection}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            multiline={true}
          />

          <GhostCard style={styles.insightCard}>
             <Text style={[t('data-s'), styles.insightLabel]}>TODAY'S OBSERVATION</Text>
             <Text style={[t('body-m'), styles.insightText]}>{insight}</Text>
          </GhostCard>

          <View style={styles.footer}>
            <SilverButton 
              label="Close the Day" 
              onPress={handleCloseDay} 
              disabled={!selectedStatus || selectedEnergy === undefined}
              style={styles.btn}
            />
          </View>
        </ScrollView>
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
  bottomSheetView: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl * 2,
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  statusCardWrapper: {
    width: '48%',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
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
    minHeight: 40,
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderBottomColor: Colors.silver,
  },
  insightCard: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.dNutrition,
    padding: Spacing.lg,
    marginBottom: Spacing.xxxl,
  },
  insightLabel: {
    color: Colors.silverLo,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  insightText: {
    color: Colors.silverMid,
  },
  footer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  btn: {
    width: '100%',
  },
});

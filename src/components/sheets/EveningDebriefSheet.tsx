// src/components/sheets/EveningDebriefSheet.tsx
import React, { useState, forwardRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Keyboard } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { RotateCcw, Droplets, Snowflake, Dumbbell } from 'lucide-react-native';

import { Colors, Gradients } from '../../theme/colors';
import { Typography, t, Spacing } from '../../theme';
import { SilverButton } from '../SilverButton';
import { GhostCard } from '../GhostCard';
import { useCheckinStore } from '../../store/useCheckinStore';
import { useDimensionStore } from '../../store/useDimensionStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function LogToggleRow({
  icon: Icon,
  label,
  value,
  onToggle
}: {
  icon: any;
  label: string;
  value: boolean | undefined;
  onToggle: (v: boolean) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icon color={Colors.silverMid} size={20} />
        <Text style={[t('heading-s'), styles.label, { marginBottom: 0, marginLeft: 12 }]}>{label}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable 
          onPress={() => onToggle(true)} 
          style={[styles.pillBtn, value === true && styles.pillBtnActive]}
        >
          <Text style={[t('body-s'), { color: value === true ? Colors.void : Colors.silverMid }]}>YES</Text>
        </Pressable>
        <Pressable 
          onPress={() => onToggle(false)} 
          style={[styles.pillBtn, value === false && styles.pillBtnActive]}
        >
          <Text style={[t('body-s'), { color: value === false ? Colors.void : Colors.silverMid }]}>NO</Text>
        </Pressable>
      </View>
    </View>
  );
}

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
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const [selectedStatus, setSelectedStatus] = useState<'maintained' | 'reset' | undefined>(undefined);
  const [selectedEnergy, setSelectedEnergy] = useState<number | undefined>(undefined);
  const [reflection, setReflection] = useState('');
  
  const dimState = useDimensionStore.getState();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const alreadyHydrated = dimState.manualLogs.dailyHydrationLogged[todayStr];
  const alreadyHydrationLiters = dimState.manualLogs.dailyHydrationLiters[todayStr];
  
  const alreadyCold = dimState.manualLogs.dailyColdExposure[todayStr];
  const alreadyColdMins = dimState.manualLogs.dailyColdMinutes[todayStr];
  
  const alreadyTrained = dimState.manualLogs.dailyTrainingMinutes[todayStr] !== undefined && dimState.manualLogs.dailyTrainingMinutes[todayStr] > 0;
  const alreadyTrainedMins = dimState.manualLogs.dailyTrainingMinutes[todayStr];
  const alreadyTrainedType = dimState.manualLogs.dailyTrainingType[todayStr];

  const [hydrated, setHydrated] = useState<boolean | undefined>(undefined);
  const [hydrationLiters, setHydrationLiters] = useState('');
  
  const [coldExposure, setColdExposure] = useState<boolean | undefined>(undefined);
  const [coldMinutes, setColdMinutes] = useState('');
  
  const [trained, setTrained] = useState<boolean | undefined>(undefined);
  const [trainingMinutes, setTrainingMinutes] = useState('');
  const [trainingType, setTrainingType] = useState('');

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      setSelectedStatus(undefined);
      setSelectedEnergy(undefined);
      setReflection('');
      setHydrated(undefined);
      setHydrationLiters('');
      setColdExposure(undefined);
      setColdMinutes('');
      setTrained(undefined);
      setTrainingMinutes('');
      setTrainingType('');
    }
  };

  const dismiss = () => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.dismiss();
    }
  };

  const handleCloseDay = () => {
    if (!selectedStatus || selectedEnergy === undefined) return;
    
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    // Save standard checkin
    useCheckinStore.getState().completeEvening(selectedStatus, selectedEnergy, reflection.trim());
    
    // Save manual logs
    const logs: any = {};
    
    if (alreadyHydrated === undefined) {
      if (hydrated) {
        const liters = parseFloat(hydrationLiters);
        if (!isNaN(liters)) {
          logs.dailyHydrationLogged = true;
          logs.dailyHydrationLiters = liters;
        }
      } else if (hydrated === false) {
        logs.dailyHydrationLogged = false;
        logs.dailyHydrationLiters = 0;
      }
    }
    
    if (alreadyCold === undefined) {
      if (coldExposure) {
        logs.dailyColdExposure = true;
        const cMins = parseInt(coldMinutes, 10);
        if (!isNaN(cMins)) logs.dailyColdMinutes = cMins;
      } else if (coldExposure === false) {
        logs.dailyColdExposure = false;
        logs.dailyColdMinutes = 0;
      }
    }
    
    if (alreadyTrained === false || alreadyTrained === undefined) {
      if (trained) {
        const tMins = parseInt(trainingMinutes, 10);
        if (!isNaN(tMins)) logs.dailyTrainingMinutes = tMins;
        if (trainingType.trim()) logs.dailyTrainingType = trainingType.trim();
      } else if (trained === false) {
        logs.dailyTrainingMinutes = 0;
        logs.dailyTrainingType = '';
      }
    }

    useDimensionStore.getState().logManualEntry(todayStr, logs);

    dismiss();
    if (selectedStatus === 'reset') {
      setTimeout(() => router.push('/modals/reset'), 400);
    }
  };

  const insight = getTodayInsight();

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={['85%', '95%']}
      enablePanDownToClose={!isKeyboardVisible}
      backgroundStyle={styles.bg}
      handleComponent={CustomHandle}
      onChange={handleSheetChanges}
      keyboardBehavior="extend"
    >
      <BottomSheetView style={styles.bottomSheetView}>
        <BottomSheetScrollView 
           contentContainerStyle={styles.content}
           keyboardShouldPersistTaps="handled"
           showsVerticalScrollIndicator={false}
        >
          <Text style={[t('display-s'), styles.title]}>How did today go?</Text>
          <Text style={[t('body-m'), styles.subtitle]}>Log your manual tracking and take a moment.</Text>

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

          <Text style={[t('heading-s'), styles.label]}>TOTAL ENERGY</Text>
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

          <View style={styles.logSection}>
            {alreadyHydrated !== undefined ? (
              <GhostCard style={{padding: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                 <View style={{flexDirection: 'row', alignItems: 'center'}}>
                   <Droplets size={16} color={Colors.silverMid}/>
                   <Text style={[t('body-m'), {color: Colors.silverHi, marginLeft: Spacing.sm}]}>Hydration</Text>
                 </View>
                 <Text style={[t('data-s'), {color: Colors.silverHi}]}>{alreadyHydrated ? `${alreadyHydrationLiters}L ✓` : 'Skipped'}</Text>
              </GhostCard>
            ) : (
               <React.Fragment>
                 <LogToggleRow 
                   icon={Droplets} 
                   label="HYDRATION" 
                   value={hydrated} 
                   onToggle={setHydrated} 
                 />
                 {hydrated && (
                  <TextInput
                    style={[t('body-l'), styles.input, {marginTop: Spacing.sm}]}
                    placeholder="Liters of water (e.g. 2.5)"
                    placeholderTextColor={Colors.silverLo}
                    selectionColor={Colors.silverHi}
                    value={hydrationLiters}
                    onChangeText={setHydrationLiters}
                    keyboardType="decimal-pad"
                  />
                 )}
               </React.Fragment>
            )}
          </View>
          
          <View style={styles.logSection}>
            {alreadyCold !== undefined ? (
              <GhostCard style={{padding: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                 <View style={{flexDirection: 'row', alignItems: 'center'}}>
                   <Snowflake size={16} color={Colors.silverMid}/>
                   <Text style={[t('body-m'), {color: Colors.silverHi, marginLeft: Spacing.sm}]}>Cold Exposure</Text>
                 </View>
                 <Text style={[t('data-s'), {color: Colors.silverHi}]}>{alreadyCold ? `${alreadyColdMins}m ✓` : 'Skipped'}</Text>
              </GhostCard>
            ) : (
               <React.Fragment>
                 <LogToggleRow 
                   icon={Snowflake} 
                   label="COLD EXPOSURE" 
                   value={coldExposure} 
                   onToggle={setColdExposure} 
                 />
                {coldExposure && (
                  <TextInput
                    style={[t('body-l'), styles.input, {marginTop: Spacing.sm}]}
                    placeholder="Minutes in cold (e.g. 3)"
                    placeholderTextColor={Colors.silverLo}
                    selectionColor={Colors.silverHi}
                    value={coldMinutes}
                    onChangeText={setColdMinutes}
                    keyboardType="numeric"
                  />
                )}
               </React.Fragment>
            )}
          </View>

          <View style={styles.logSection}>
            {alreadyTrained ? (
              <GhostCard style={{padding: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                 <View style={{flexDirection: 'row', alignItems: 'center'}}>
                   <Dumbbell size={16} color={Colors.silverMid}/>
                   <Text style={[t('body-m'), {color: Colors.silverHi, marginLeft: Spacing.sm}]}>Training</Text>
                 </View>
                 <Text style={[t('data-s'), {color: Colors.silverHi}]}>{alreadyTrainedMins}m {alreadyTrainedType} ✓</Text>
              </GhostCard>
            ) : (
               <React.Fragment>
                 <LogToggleRow 
                   icon={Dumbbell} 
                   label="PHYSICAL TRAINING" 
                   value={trained} 
                   onToggle={setTrained} 
                 />
                 {trained && (
                  <View style={{flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm}}>
                    <TextInput
                      style={[t('body-l'), styles.input, {flex: 1}]}
                      placeholder="Active Mins"
                      placeholderTextColor={Colors.silverLo}
                      selectionColor={Colors.silverHi}
                      value={trainingMinutes}
                      onChangeText={setTrainingMinutes}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={[t('body-l'), styles.input, {flex: 2}]}
                      placeholder="Type (e.g. Cardio)"
                      placeholderTextColor={Colors.silverLo}
                      selectionColor={Colors.silverHi}
                      value={trainingType}
                      onChangeText={setTrainingType}
                    />
                  </View>
                )}
               </React.Fragment>
            )}
          </View>

          <Text style={[t('heading-s'), styles.label]}>REFLECTION</Text>
          <TextInput
            style={[t('body-l'), styles.input]}
            placeholder="One line — how did today actually feel?"
            placeholderTextColor={Colors.silverLo}
            selectionColor={Colors.silverHi}
            value={reflection}
            onChangeText={setReflection}
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
        </BottomSheetScrollView>
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
  logSection: {
    marginBottom: Spacing.xl,
  },
  pillBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  pillBtnActive: {
    backgroundColor: Colors.silverHi,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(194,203,214,0.2)',
    paddingVertical: Spacing.sm,
    color: Colors.silverHi,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  insightCard: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.dNutrition,
    padding: Spacing.lg,
    marginBottom: Spacing.xxxl,
    marginTop: Spacing.xl,
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

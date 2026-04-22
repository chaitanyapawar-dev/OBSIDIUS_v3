// app/(tabs)/today.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ChevronRight } from 'lucide-react-native';
import { format } from 'date-fns';

import { Colors, DimensionAccent, DimensionKey } from '../../src/theme/colors';
import { Typography, t, Spacing, Radius } from '../../src/theme';
import { GhostCard } from '../../src/components/GhostCard';
import { ObsidiusLogo } from '../../src/components/ObsidiusLogo';
import { useDimensionStore } from '../../src/store/useDimensionStore';
import { useCheckinStore } from '../../src/store/useCheckinStore';
import { MorningCheckinSheet } from '../../src/components/sheets/MorningCheckinSheet';
import { EveningDebriefSheet } from '../../src/components/sheets/EveningDebriefSheet';

function DimensionCardItem({ itemKey, name }: { itemKey: DimensionKey; name: string }) {
  const scale = useSharedValue(1);
  const getDayReading = useDimensionStore(s => s.getDayReading);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const reading = getDayReading(itemKey, todayStr);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, { marginBottom: 12 }]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.97, { stiffness: 300, damping: 20 }); }}
        onPressOut={() => { scale.value = withSpring(1, { stiffness: 300, damping: 20 }); }}
        onPress={() => router.push(`/dimension/${itemKey}`)}
      >
        <GhostCard style={styles.dimensionCard}>
          <View style={[styles.dimensionAccent, { backgroundColor: DimensionAccent[itemKey] }]} />
          <View style={styles.dimensionTextGroup}>
            <Text style={[t('heading-s'), { color: Colors.silverMid, marginBottom: 4 }]}>{name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', flexShrink: 1 }}>
              <Text style={[t('data-l'), { color: Colors.silverHi, marginRight: Spacing.sm }]} numberOfLines={1}>
                {reading.primaryValue}
              </Text>
              <Text style={[t('body-m'), { color: Colors.silver, paddingBottom: 4, flexShrink: 1 }]} numberOfLines={1} ellipsizeMode="tail">
                {reading.secondaryLabel}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={Colors.silverLo} />
        </GhostCard>
      </Pressable>
    </Animated.View>
  );
}

export default function TodayScreen() {
  const checkinHistory = useCheckinStore(s => s.checkinHistory);
  
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayEntry = checkinHistory.find(e => e.date === todayStr);

  const morningDone = todayEntry?.morningDone || false;
  const morningTime = todayEntry?.morningTime || '';
  const eveningDone = todayEntry?.eveningDone || false;

  const currentHour = parseInt(format(new Date(), 'HH'), 10);
  const isEveningAvailable = currentHour >= 17;

  const morningSheetRef = useRef<BottomSheetModal>(null);
  const eveningSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    useDimensionStore.getState().seedIfNeeded();
    useDimensionStore.getState().refreshTodayData(); // real data if native build

    const state = useDimensionStore.getState()
    const checkin = useCheckinStore.getState()
    const today = format(new Date(), 'yyyy-MM-dd')
    console.log('[Data Check] Today:', today)
    console.log('[Data Check] Steps:', state.physical.dailySteps[today])
    console.log('[Data Check] Passive:', state.nutrition.dailyPassiveMinutes[today])
    console.log('[Data Check] FirstUnlock:', state.circadian.dailyFirstUnlock[today])
    console.log('[Data Check] Checkin history:', checkin.checkinHistory)
    console.log('[Data Check] IS_MOCK:', state.IS_MOCK)
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView 
        bounces={false} 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ObsidiusLogo />
          <Text style={[t('data-m'), { color: Colors.silverLo }]}>
            {`${format(new Date(), 'EEE').toUpperCase()} · ${format(new Date(), 'd MMM').toUpperCase()}`}
          </Text>
        </View>

        <View style={styles.hero}>
          <Text style={[t('display-m'), { color: Colors.silverHi, marginBottom: 4 }]}>
            {format(new Date(), 'EEEE')}
          </Text>
          <Text style={[t('data-m'), { color: Colors.silverMid }]}>
            {format(new Date(), 'd MMMM yyyy')}
          </Text>
        </View>

        <View style={styles.dimensionList}>
          <DimensionCardItem itemKey="circadian" name="WAKE RHYTHM" />
          <DimensionCardItem itemKey="nutrition" name="SCREEN USE" />
          <DimensionCardItem itemKey="physical" name="MOVEMENT" />
          <DimensionCardItem itemKey="recovery" name="REST BREAKS" />
          <DimensionCardItem itemKey="social" name="CONNECTION" />
          <DimensionCardItem itemKey="consistency" name="DAILY RHYTHM" />
          <DimensionCardItem itemKey="retention" name="RETENTION" />
          <DimensionCardItem itemKey="sleep-quality" name="SLEEP QUALITY" />
          <DimensionCardItem itemKey="hydration" name="HYDRATION" />
          <DimensionCardItem itemKey="cold-exposure" name="COLD EXPOSURE" />
          <DimensionCardItem itemKey="physical-training" name="PHYSICAL TRAINING" />
        </View>

        <View style={styles.checkinContainer}>
          <GhostCard style={styles.checkinCard}>
            <Pressable 
              onPress={() => !morningDone && morningSheetRef.current?.present()}
              style={styles.checkinPressable}
              disabled={morningDone}
            >
              <Text style={[t('heading-s'), { color: Colors.silverHi }]}>MORNING INTENT</Text>
              <Text style={[t('body-m'), { color: morningDone ? Colors.silverLo : Colors.silverMid }]}>
                {morningDone ? `✓ Done · ${morningTime}` : 'Tap to check in'}
              </Text>
            </Pressable>
          </GhostCard>

          <GhostCard style={[styles.checkinCard, !isEveningAvailable && { opacity: 0.35 }]}>
            <Pressable 
              onPress={() => isEveningAvailable && !eveningDone && eveningSheetRef.current?.present()}
              style={styles.checkinPressable}
              disabled={!isEveningAvailable || eveningDone}
            >
              <Text style={[t('heading-s'), { color: Colors.silverHi }]}>EVENING DEBRIEF</Text>
              <Text style={[t('body-m'), { color: eveningDone ? Colors.silverLo : Colors.silverMid }]}>
                {eveningDone 
                  ? '✓ Done' 
                  : isEveningAvailable ? 'Tap to check in' : 'Available at 5pm'}
              </Text>
            </Pressable>
          </GhostCard>
        </View>

        <GhostCard style={styles.pauseCard}>
          <Pressable style={styles.pausePressable} onPress={() => router.push('/modals/pause')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.pauseDot} />
              <Text style={[t('heading-s'), { color: Colors.silverMid }]}>PAUSE OBSIDIUS</Text>
            </View>
            <ChevronRight size={20} color={Colors.silverLo} />
          </Pressable>
        </GhostCard>

      </ScrollView>

      {/* Sheets */}
      <MorningCheckinSheet ref={morningSheetRef} />
      <EveningDebriefSheet ref={eveningSheetRef} />
    </View>
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
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.void, // Matches container to act as solid sticky overlay
    marginBottom: Spacing.xl,
  },
  hero: {
    marginBottom: Spacing.xxl,
  },
  dimensionList: {
    marginBottom: Spacing.xl,
  },
  dimensionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  dimensionAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: Radius.lg,
    borderBottomLeftRadius: Radius.lg,
  },
  dimensionTextGroup: {
    flex: 1,
    paddingLeft: Spacing.sm,
  },
  checkinContainer: {
    marginBottom: Spacing.xxl,
  },
  checkinCard: {
    marginBottom: Spacing.sm,
  },
  checkinPressable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  pauseCard: {
    marginTop: Spacing.lg,
  },
  pausePressable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  pauseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.reset,
    marginRight: Spacing.md,
  },
});

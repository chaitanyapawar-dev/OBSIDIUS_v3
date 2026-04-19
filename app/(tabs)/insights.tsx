// app/(tabs)/insights.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import Svg, { Rect } from 'react-native-svg';
import { format } from 'date-fns';

import { Colors, DimensionAccent, DimensionKey } from '../../src/theme/colors';
import { Typography, t, Spacing, Radius } from '../../src/theme';
import { GhostCard } from '../../src/components/GhostCard';
import { ObsidiusLogo } from '../../src/components/ObsidiusLogo';
import { useDimensionStore } from '../../src/store/useDimensionStore';
import { useCheckinStore } from '../../src/store/useCheckinStore';
import { usePauseStore } from '../../src/store/usePauseStore';
import { generateInsights, Insight } from '../../src/utils/insightEngine';

const NAME_MAP: Record<DimensionKey, string> = {
  circadian: 'WAKE RHYTHM',
  nutrition: 'SCREEN USE',
  physical: 'MOVEMENT',
  recovery: 'REST BREAKS',
  social: 'CONNECTION',
  consistency: 'DAILY RHYTHM',
};

function Sparkline({ dimensionKey }: { dimensionKey: DimensionKey }) {
  const getWeekSeries = useDimensionStore(s => s.getWeekSeries);
  const series = getWeekSeries(dimensionKey);
  const max = Math.max(...series, 0);

  return (
    <Svg width={60} height={32}>
      {series.map((val, i) => {
        let h = max > 0 ? (val / max) * 32 : 4;
        h = Math.max(h, 4);
        const x = i * 9; // 6px wide + 3px gap
        const y = 32 - h;
        return (
          <Rect 
            key={i} 
            x={x} 
            y={y} 
            width={6} 
            height={h} 
            rx={2} 
            fill={DimensionAccent[dimensionKey]} 
            opacity={0.6} 
          />
        );
      })}
    </Svg>
  );
}

function GridCell({ itemKey }: { itemKey: DimensionKey }) {
  const getDayReading = useDimensionStore(s => s.getDayReading);
  const todayVal = getDayReading(itemKey, format(new Date(), 'yyyy-MM-dd'));

  return (
    <Pressable onPress={() => router.push(`/dimension/${itemKey}`)} style={styles.gridCellWrapper}>
      <GhostCard style={styles.gridCellCard}>
        <View style={[styles.gridCellAccent, { backgroundColor: DimensionAccent[itemKey] }]} />
        <Text style={[t('heading-s'), styles.gridCellLabel]}>{NAME_MAP[itemKey]}</Text>
        <View style={styles.gridCellBottom}>
          <Text style={[t('data-l'), styles.primaryValue]} numberOfLines={1} adjustsFontSizeToFit>
            {todayVal.primaryValue}
          </Text>
          <Sparkline dimensionKey={itemKey} />
        </View>
      </GhostCard>
    </Pressable>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  return (
    <Pressable onPress={() => router.push(`/dimension/${insight.dimensionA}`)} style={styles.insightWrapper}>
      <GhostCard style={styles.insightCard}>
        <View style={[styles.insightAccent, { backgroundColor: DimensionAccent[insight.dimensionA] }]} />
        <View style={styles.insightContent}>
          <Text style={[t('data-s'), styles.insightRelation]}>
            {insight.relationLabel.toUpperCase()}
          </Text>
          <Text style={[t('body-l'), styles.insightText]}>
            {insight.text}
          </Text>
          <Text style={[t('data-s'), styles.insightData]}>
            {insight.dataPoints}
          </Text>
        </View>
      </GhostCard>
    </Pressable>
  );
}

export default function InsightsScreen() {
  const dimensionCircadian = useDimensionStore(s => s.circadian);
  const dimensionNutrition = useDimensionStore(s => s.nutrition);
  const dimensionPhysical = useDimensionStore(s => s.physical);
  const dimensionRecovery = useDimensionStore(s => s.recovery);
  const dimensionSocial = useDimensionStore(s => s.social);
  const seeded = useDimensionStore(s => s.seeded);
  
  const checkinHistory = useCheckinStore(s => s.checkinHistory);
  const resetLogLength = usePauseStore(s => s.resetLog.length);

  const insights = useMemo(() => {
    const rawState = useDimensionStore.getState();
    let list = generateInsights(rawState, checkinHistory);
    
    const restSoc = list.find(l => l.id === 'rest-social');
    const recSoc = list.find(l => l.id === 'recovery-social');
    if (restSoc && recSoc) {
      list = restSoc.strength >= recSoc.strength
        ? list.filter(l => l.id !== 'recovery-social')
        : list.filter(l => l.id !== 'rest-social');
    }
    
    return list.slice(0, 4);
  }, [
    dimensionCircadian, 
    dimensionNutrition, 
    dimensionPhysical,
    dimensionRecovery, 
    dimensionSocial, 
    seeded, 
    checkinHistory
  ]);

  return (
    <View style={styles.container}>
      <ScrollView 
        bounces={false} 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ObsidiusLogo />
        </View>
        <Text style={[t('display-m'), styles.pageTitle]}>
          Insights
        </Text>

        <View style={styles.gridContainer}>
          <GridCell itemKey="circadian" />
          <GridCell itemKey="nutrition" />
          <GridCell itemKey="physical" />
          <GridCell itemKey="recovery" />
          <GridCell itemKey="social" />
          <GridCell itemKey="consistency" />
        </View>

        <View style={styles.section}>
          <Text style={[t('heading-s'), styles.sectionLabel]}>PATTERNS</Text>
          {insights.length < 2 ? (
            <GhostCard style={styles.placeholderCard}>
              <Text style={[t('body-m'), { color: Colors.silver }]}>
                Patterns emerge after 7 days of check-ins. Keep going.
              </Text>
            </GhostCard>
          ) : (
            insights.map(insight => (
              <InsightCard key={insight.id} insight={insight} />
            ))
          )}
        </View>

        <View style={styles.section}>
          {resetLogLength > 0 ? (
            <>
              <Text style={[t('heading-s'), styles.sectionLabel]}>RESTART INTELLIGENCE</Text>
              {/* Reset intelligence content goes here when spec is defined */}
            </>
          ) : (
            <>
              <Text style={[t('heading-s'), styles.sectionLabel]}>RESTART INTELLIGENCE</Text>
              <GhostCard style={styles.placeholderCard}>
                <Text style={[t('body-m'), { color: Colors.silver }]}>
                  When a reset happens, your reflection answers surface here as patterns.
                </Text>
              </GhostCard>
            </>
          )}
        </View>

      </ScrollView>
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    marginBottom: Spacing.md,
  },
  pageTitle: {
    color: Colors.silverHi,
    marginBottom: Spacing.xl,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  },
  gridCellWrapper: {
    width: '48%',
    marginBottom: Spacing.md,
  },
  gridCellCard: {
    padding: Spacing.md,
    height: 100, // ensures consistent height and proportional spacing for bottom row
  },
  gridCellAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: Radius.lg,
    borderBottomLeftRadius: Radius.lg,
  },
  gridCellLabel: {
    color: Colors.silverMid,
    paddingLeft: Spacing.xs,
  },
  gridCellBottom: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingLeft: Spacing.xs,
  },
  primaryValue: {
    color: Colors.silverHi,
    flex: 1,
    marginRight: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionLabel: {
    color: Colors.silverLo,
    marginBottom: Spacing.md,
  },
  placeholderCard: {
    padding: Spacing.lg,
  },
  insightWrapper: {
    marginBottom: Spacing.md,
  },
  insightCard: {
    padding: Spacing.lg,
  },
  insightAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: Radius.lg,
    borderBottomLeftRadius: Radius.lg,
  },
  insightContent: {
    paddingLeft: Spacing.sm,
  },
  insightRelation: {
    color: Colors.silverLo,
    marginBottom: Spacing.xs,
  },
  insightText: {
    color: Colors.silver,
    marginBottom: Spacing.sm,
  },
  insightData: {
    color: Colors.silverLo,
  },
});

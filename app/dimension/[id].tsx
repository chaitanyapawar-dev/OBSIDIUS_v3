// app/dimension/[id].tsx
import React, { useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Svg, { Rect, Circle, Polyline, Line, Text as SvgText } from 'react-native-svg';
import Animated, { 
  AnimatedProps,
  useAnimatedProps, 
  withDelay, 
  withTiming, 
  withRepeat, 
  useSharedValue 
} from 'react-native-reanimated';
import { format } from 'date-fns';

import { Colors } from '../../src/theme/colors';
import { Typography, t, Spacing } from '../../src/theme';
import { GhostCard } from '../../src/components/GhostCard';
import { useDimensionStore, DimensionKey } from '../../src/store/useDimensionStore';
import { useCheckinStore } from '../../src/store/useCheckinStore';
import { getLastNDates, getDayLabel } from '../../src/utils/formatters';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type AnimatedRectProps = AnimatedProps<React.ComponentProps<typeof Rect>>;
type AnimatedCircleProps = AnimatedProps<React.ComponentProps<typeof Circle>>;

const NameMap: Record<DimensionKey, string> = {
  circadian: 'Circadian Rhythm',
  nutrition: 'Digital Diet',
  physical: 'Physical Base',
  recovery: 'Recovery State',
  social: 'Social Connection',
  consistency: 'Daily Routine',
};

const CitationMap: Record<DimensionKey, string> = {
  circadian: 'Irregular sleep-wake rhythms correlate with reduced prefrontal gray matter volume and mood dysregulation (Smith et al., 2022).',
  nutrition: 'High passive screen time is linked to higher baseline cortisol and increased temporal anxiety (Johnson, 2023).',
  physical: 'Daily step counts strongly reverse sedentary all-cause neurological decline (Davis & Wang, 2021).',
  recovery: 'Micro-breaks longer than 20 minutes significantly restore attentional control networks (Lee et al., 2020).',
  social: 'Active social connection buffers against cognitive exhaustion more effectively than solitary rest (Chen, 2024).',
  consistency: 'Routine automaticity reduces working memory load by up to 40% throughout the day (Miller et al., 2023).',
};

function AnimatedStackedVerticalBar({ x, yTarget, totalHeight, width, index }: { x: number, yTarget: number, totalHeight: number, width: number, index: number }) {
  const h = useSharedValue(0);

  useEffect(() => {
    h.value = withDelay(index * 80, withTiming(totalHeight, { duration: 500 }));
  }, [totalHeight, index]);

  const topProps = useAnimatedProps<AnimatedRectProps>(() => ({
    height: h.value * 0.4,
    y: (yTarget + totalHeight) - h.value
  }));

  const bottomProps = useAnimatedProps<AnimatedRectProps>(() => ({
    height: h.value * 0.6,
    y: (yTarget + totalHeight) - (h.value * 0.6)
  }));

  return (
    <>
      <AnimatedRect x={x} width={width} fill="rgba(194,203,214,0.6)" rx={4} animatedProps={topProps} />
      <AnimatedRect x={x} width={width} fill="rgba(194,203,214,0.25)" rx={4} animatedProps={bottomProps} />
    </>
  );
}

function AnimatedHorizontalStack({ x, y, width1, width2, fill1, fill2, index }: { x: number, y: number, width1: number, width2: number, fill1: string, fill2: string, index: number }) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(index * 80, withTiming(1, { duration: 500 }));
  }, [index]);

  const b1Props = useAnimatedProps<AnimatedRectProps>(() => ({
    width: width1 * scale.value,
  }));

  const b2Props = useAnimatedProps<AnimatedRectProps>(() => ({
    x: x + (width1 * scale.value),
    width: width2 * scale.value,
  }));

  return (
    <>
      <AnimatedRect x={x} y={y} height={14} fill={fill1} animatedProps={b1Props} />
      <AnimatedRect y={y} height={14} fill={fill2} animatedProps={b2Props} />
    </>
  );
}

function AnimatedCircadianDot({ x, y, index }: { x: number, y: number, index: number }) {
  const r = useSharedValue(0);
  useEffect(() => {
    r.value = withDelay(index * 80, withTiming(5, { duration: 400 }));
  }, [index]);

  const animatedProps = useAnimatedProps<AnimatedCircleProps>(() => ({
    r: r.value
  }));

  return <AnimatedCircle cx={x} cy={y} fill={Colors.silverHi} animatedProps={animatedProps} />;
}

function AnimatedStatusDot({ status, cx, cy, delay }: { status: string, cx: number, cy: number, delay: number }) {
  const r = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    r.value = withDelay(delay, withTiming(8, { duration: 400 }));
    if (status === 'pending') {
      pulse.value = withRepeat(withTiming(0.3, { duration: 800 }), -1, true);
    } else {
      pulse.value = 1;
    }
  }, [status, delay]);

  const strokeColor = (status === 'missed' || status === 'pending') ? Colors.silverLo : 'transparent';
  const fillColor = status === 'maintained' ? Colors.silverHi : 
                    status === 'reset' ? Colors.reset : 
                    'transparent';

  const animatedProps = useAnimatedProps<AnimatedCircleProps>(() => ({
    r: r.value,
    opacity: pulse.value,
  }));

  return (
    <AnimatedCircle 
      cx={cx} 
      cy={cy} 
      stroke={strokeColor} 
      strokeWidth={2} 
      fill={fillColor} 
      animatedProps={animatedProps} 
    />
  );
}

export default function DimensionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: DimensionKey }>();
  
  const getDayReading = useDimensionStore(s => s.getDayReading);
  const getWeekSeries = useDimensionStore(s => s.getWeekSeries);
  const getWeekAverage = useDimensionStore(s => s.getWeekAverage);
  const getWeekBest = useDimensionStore(s => s.getWeekBest);
  const getTodayContext = useDimensionStore(s => s.getTodayContext);
  const getWeekConsistency = useCheckinStore(s => s.getWeekConsistency);

  const circadianData = useDimensionStore(s => s.circadian.dailyFirstUnlock);
  const nutritionPassive = useDimensionStore(s => s.nutrition.dailyPassiveMinutes);
  const nutritionActive = useDimensionStore(s => s.nutrition.dailyActiveMinutes);
  const recoveryData = useDimensionStore(s => s.recovery.dailyLongestBreakMinutes);
  const socialActive = useDimensionStore(s => s.social.dailyActiveCommMinutes);
  const socialPassive = useDimensionStore(s => s.social.dailyPassiveSocialMinutes);

  if (!id || !NameMap[id]) return null;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const reading = getDayReading(id, todayStr);
  const context = getTodayContext(id);
  const avg = getWeekAverage(id);
  const best = getWeekBest(id);
  const seriesData = getWeekSeries(id);
  
  const dates = getLastNDates(7);
  const labels = dates.map(d => getDayLabel(d));
  
  const screenWidth = Dimensions.get('window').width;
  const paddingH = Spacing.lg;
  const chartWidth = screenWidth - (paddingH * 2);

  const renderPhysicalChart = () => {
    const chartHeight = 120;
    const maxVal = Math.max(...seriesData, 1);
    const barWidth = 24;
    const gap = (chartWidth - (barWidth * 7)) / 6;

    return (
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {seriesData.map((val, i) => {
            const h = (val / maxVal) * chartHeight;
            return (
              <AnimatedStackedVerticalBar 
                key={i} 
                x={i * (barWidth + gap)} 
                yTarget={chartHeight - h} 
                totalHeight={h} 
                width={barWidth} 
                index={i} 
              />
            );
          })}
        </Svg>
        <View style={styles.labelsRow}>
          {labels.map((lab, i) => (
            <View key={i} style={{ width: barWidth, marginLeft: i === 0 ? 0 : gap, alignItems: 'center' }}>
              <Text style={[t('heading-s'), { color: Colors.silverLo }]}>{lab}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderCircadianChart = () => {
    const chartHeight = 120;
    
    const parseTime = (timeStr?: string) => {
      if (!timeStr) return null;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const dayMins = dates.map(d => parseTime(circadianData[d]));
    const validMins = dayMins.filter((m): m is number => m !== null);
    const avgMins = validMins.length ? validMins.reduce((a,b)=>a+b, 0) / validMins.length : null;
    const avgY = avgMins ? Math.max(0, Math.min(((avgMins - 300) / 360) * chartHeight, chartHeight)) : null;

    return (
      <View style={styles.chartContainer}>
        <View style={{ flexDirection: 'row', width: '100%', height: chartHeight + 30 }}>
          <View style={{ width: 30, height: chartHeight, justifyContent: 'space-between' }}>
            {['5am', '7am', '9am', '11am'].map((l, i) => (
               <Text key={i} style={{ fontFamily: Typography['data-s'].fontFamily, fontSize: 9, color: Colors.silverLo, marginTop: i === 0 ? -4 : 0 }}>{l}</Text>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Svg width={chartWidth - 30} height={chartHeight}>
              {avgY !== null && (
                <Line x1={0} y1={avgY} x2={chartWidth - 30} y2={avgY} stroke={Colors.silverMid} strokeDasharray="4 2" opacity={0.4} />
              )}
              {dayMins.map((mins, i) => {
                 if (mins === null) return null;
                 const clamped = Math.max(300, Math.min(mins, 660));
                 const y = ((clamped - 300) / 360) * chartHeight;
                 const x = i * ((chartWidth - 30) / 7) + ((chartWidth - 30) / 14);
                 return <AnimatedCircadianDot key={i} x={x} y={y} index={i} />;
              })}
            </Svg>
            <View style={{ flexDirection: 'row', width: '100%', marginTop: Spacing.sm }}>
              {labels.map((lab, i) => (
                <View key={i} style={{ width: (chartWidth - 30) / 7, alignItems: 'center' }}>
                  <Text style={[t('heading-s'), { color: Colors.silverLo }]}>{lab}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderHorizontalStackedChart = (dim: 'nutrition' | 'social') => {
    const chartHeight = 7 * 24; 
    const passData = dim === 'nutrition' ? nutritionPassive : socialPassive;
    const actData = dim === 'nutrition' ? nutritionActive : socialActive;
    
    const usableWidth = chartWidth - 70; // 40 for day left, 30 for right label

    const maxCombined = Math.max(
      ...dates.map(d => (passData[d] || 0) + (actData[d] || 0)),
      1
    );

    const fill1 = dim === 'nutrition' ? 'rgba(194,203,214,0.15)' : 'rgba(107,127,163,0.4)';
    const fill2 = dim === 'nutrition' ? 'rgba(194,203,214,0.4)' : 'rgba(194,203,214,0.15)';

    return (
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {dates.map((d, i) => {
            const pass = passData[d] || 0;
            const act = actData[d] || 0;
            const y = i * 24;
            
            const val1 = dim === 'nutrition' ? pass : act;
            const val2 = dim === 'nutrition' ? act : pass;
            
            const w1 = (val1 / maxCombined) * usableWidth;
            const w2 = (val2 / maxCombined) * usableWidth;
            const totalHrs = (pass + act) / 60;
            
            return (
              <React.Fragment key={i}>
                <SvgText 
                  x={0} y={y + 11} fill={Colors.silverLo} 
                  fontSize={11} fontFamily={Typography['heading-s'].fontFamily}
                >
                  {labels[i]}
                </SvgText>

                <AnimatedHorizontalStack 
                  x={40} y={y} 
                  width1={w1} width2={w2} 
                  fill1={fill1} fill2={fill2} 
                  index={i} 
                />

                <SvgText 
                  x={40 + w1 + w2 + 6} y={y + 11} 
                  fill={Colors.silverLo} fontSize={9} 
                  fontFamily={Typography['data-s'].fontFamily}
                >
                  {totalHrs > 0 ? `${(Math.round(totalHrs * 10) / 10)}h` : ''}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    );
  };

  const renderRecoveryChart = () => {
    const chartHeight = 120;
    const breakData = dates.map(d => Math.min(recoveryData[d] || 0, 90));
    const dotGap = chartWidth / 7;

    const points = breakData.map((val, i) => {
      const x = i * dotGap + dotGap / 2;
      const y = chartHeight - (val / 90 * chartHeight);
      return `${x},${y}`;
    }).join(' ');

    const bandYTop = ((90 - 45) / 90) * chartHeight;
    const bandYBottom = ((90 - 20) / 90) * chartHeight;

    return (
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          <Rect 
            x={0} y={bandYTop} 
            width={chartWidth} height={bandYBottom - bandYTop} 
            fill="rgba(155,139,107,0.08)" 
          />
          <Polyline 
            points={points} stroke={Colors.silverMid} 
            strokeWidth={1} opacity={0.5} fill="none" 
          />
          {breakData.map((val, i) => {
            const x = i * dotGap + dotGap / 2;
            const y = chartHeight - (val / 90 * chartHeight);
            return <Circle key={i} cx={x} cy={y} r={4} fill={Colors.silverHi} />;
          })}
          <SvgText 
            x={chartWidth - 5} y={bandYTop + 10} 
            fill={Colors.silverLo} fontSize={8} 
            fontFamily={Typography['data-s'].fontFamily} textAnchor="end"
          >
            suggested range
          </SvgText>
        </Svg>
        <View style={styles.labelsRow}>
          {labels.map((lab, i) => (
             <View key={i} style={{ width: dotGap, alignItems: 'center' }}>
               <Text style={[t('heading-s'), { color: Colors.silverLo }]}>{lab}</Text>
             </View>
          ))}
        </View>
      </View>
    );
  };

  const renderConsistencyChart = () => {
    const statuses = getWeekConsistency();
    const dotGap = chartWidth / 7;
    return (
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={80}>
          {statuses.map((st, i) => (
            <AnimatedStatusDot 
              key={i} 
              status={st} 
              cx={i * dotGap + dotGap / 2} 
              cy={40} 
              delay={i * 80} 
            />
          ))}
        </Svg>
        <View style={styles.labelsRow}>
          {labels.map((lab, i) => (
            <View key={i} style={{ width: dotGap, alignItems: 'center' }}>
              <Text style={[t('heading-s'), { color: Colors.silverLo }]}>{lab}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderChart = () => {
    switch (id) {
      case 'circadian': return renderCircadianChart();
      case 'nutrition': return renderHorizontalStackedChart('nutrition');
      case 'physical': return renderPhysicalChart();
      case 'recovery': return renderRecoveryChart();
      case 'social': return renderHorizontalStackedChart('social');
      case 'consistency': return renderConsistencyChart();
      default: return null;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} bounces={false}>
      <Text style={[t('display-l'), styles.title]}>{NameMap[id]}</Text>
      <Text style={[t('body-m'), styles.citation]}>"{CitationMap[id]}"</Text>

      {renderChart()}

      <GhostCard style={styles.todayCard}>
        <Text style={[t('heading-s'), styles.sectionLabel]}>TODAY</Text>
        <View style={styles.readingRow}>
          <Text style={[t('display-m'), styles.primaryValue]}>{reading.primaryValue}</Text>
          <Text style={[t('body-l'), styles.secondaryLabel]}>{reading.secondaryLabel}</Text>
        </View>
        <Text style={[t('body-m'), styles.contextText]}>{context}</Text>
      </GhostCard>

      {id !== 'consistency' && (
        <View style={styles.summaryRow}>
          <GhostCard style={styles.summaryCard}>
            <Text style={[t('heading-s'), styles.sectionLabel]}>7-DAY AVERAGE</Text>
            <Text style={[t('data-l'), styles.summaryValue]}>{avg}</Text>
          </GhostCard>
          
          <GhostCard style={styles.summaryCard}>
            <Text style={[t('heading-s'), styles.sectionLabel]}>7-DAY BEST</Text>
            <Text style={[t('data-l'), styles.summaryValue]}>{best.value}</Text>
            <Text style={[t('body-s'), styles.bestDate]}>{best.date}</Text>
          </GhostCard>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.void,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  title: {
    color: Colors.silverHi,
    marginBottom: Spacing.xs,
  },
  citation: {
    color: Colors.silverMid,
    fontStyle: 'italic',
    marginBottom: Spacing.xl,
  },
  chartContainer: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  labelsRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: Spacing.md,
  },
  todayCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    color: Colors.silverMid,
    marginBottom: Spacing.sm,
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.xs,
  },
  primaryValue: {
    color: Colors.silverHi,
    marginRight: Spacing.sm,
  },
  secondaryLabel: {
    color: Colors.silver,
  },
  contextText: {
    color: Colors.silverLo,
    marginTop: Spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    padding: Spacing.lg,
  },
  summaryValue: {
    color: Colors.silverHi,
  },
  bestDate: {
    color: Colors.silverLo,
    marginTop: Spacing.xs,
  },
});

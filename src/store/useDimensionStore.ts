// src/store/useDimensionStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from './mmkv';
import { format, subDays, isWeekend, parse } from 'date-fns';
import {
  formatCircadian,
  formatNutrition,
  formatPhysical,
  formatRecovery,
  formatSocial,
  formatConsistency,
  getLastNDates
} from '../utils/formatters';

export interface DimensionReading {
  primaryValue: string;
  secondaryLabel: string;
  rawNumber: number;
  distribution?: string;
  activeFormatted?: string;
}

export type DimensionKey = 'circadian' | 'nutrition' | 'physical' | 'recovery' | 'social' | 'consistency';

export interface DimensionState {
  seeded: boolean;
  // MOCK — replace with native module in native phase
  circadian: { dailyFirstUnlock: Record<string, string> };
  nutrition: { dailyPassiveMinutes: Record<string, number>; dailyActiveMinutes: Record<string, number> };
  physical: { dailySteps: Record<string, number>; dailyStepDistribution: Record<string, 'AM' | 'PM' | 'EVEN' | 'NONE'> };
  recovery: { dailyLongestBreakMinutes: Record<string, number>; dailyBreakCount: Record<string, number> };
  social: { dailyActiveCommMinutes: Record<string, number>; dailyPassiveSocialMinutes: Record<string, number> };

  reset: () => void;
  seedIfNeeded: () => void;

  getDayReading: (dimension: DimensionKey, dateStr: string) => DimensionReading;
  getWeekSeries: (dimension: DimensionKey) => number[];
  getWeekAverage: (dimension: DimensionKey) => number;
  getWeekBest: (dimension: DimensionKey) => { value: number; date: string };
  getTodayContext: (dimension: DimensionKey) => string;
}

// MOCK — replace with native module in native phase
function seedMockData() {
  const data = {
    circadian: { dailyFirstUnlock: {} as Record<string, string> },
    nutrition: { dailyPassiveMinutes: {} as Record<string, number>, dailyActiveMinutes: {} as Record<string, number> },
    physical: { dailySteps: {} as Record<string, number>, dailyStepDistribution: {} as Record<string, 'AM' | 'PM' | 'EVEN' | 'NONE'> },
    recovery: { dailyLongestBreakMinutes: {} as Record<string, number>, dailyBreakCount: {} as Record<string, number> },
    social: { dailyActiveCommMinutes: {} as Record<string, number>, dailyPassiveSocialMinutes: {} as Record<string, number> },
  };

  const today = new Date();
  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  let lowStepStreak = 0;

  for (let i = 20; i >= 0; i--) {
    const d = subDays(today, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const weekend = isWeekend(d);

    // Circadian
    const baseWake = weekend ? randomInt(480, 585) : randomInt(390, 480);
    const wakeHH = String(Math.floor(baseWake / 60)).padStart(2, '0');
    const wakeMM = String(baseWake % 60).padStart(2, '0');
    data.circadian.dailyFirstUnlock[dateStr] = `${wakeHH}:${wakeMM}`;

    // Nutrition
    let passive, active;
    if (weekend) {
      passive = randomInt(180, 300);
      active = randomInt(30, 90);
    } else {
      passive = randomInt(60, 240);
      active = randomInt(60, 180);
    }
    data.nutrition.dailyPassiveMinutes[dateStr] = passive;
    data.nutrition.dailyActiveMinutes[dateStr] = active;

    // Physical
    let steps = randomInt(1800, 11000);
    if (steps < 3000) {
      lowStepStreak++;
      if (lowStepStreak > 2) {
        steps = randomInt(3500, 11000);
        lowStepStreak = 0;
      }
    } else {
      lowStepStreak = 0;
    }
    data.physical.dailySteps[dateStr] = steps;

    const distRand = Math.random();
    let dist: 'AM' | 'PM' | 'EVEN' | 'NONE' = 'AM';
    if (distRand < 0.6) dist = 'AM';
    else if (distRand < 0.8) dist = 'PM';
    else if (distRand < 0.95) dist = 'EVEN';
    else dist = 'NONE';
    data.physical.dailyStepDistribution[dateStr] = dist;

    // Recovery
    if (Math.random() < 0.3) {
      data.recovery.dailyLongestBreakMinutes[dateStr] = 0;
      data.recovery.dailyBreakCount[dateStr] = 0;
    } else {
      const longest = randomInt(5, 90);
      data.recovery.dailyLongestBreakMinutes[dateStr] = longest;
      data.recovery.dailyBreakCount[dateStr] = longest >= 20 ? randomInt(1, 5) : 0;
    }

    // Social
    data.social.dailyActiveCommMinutes[dateStr] = randomInt(10, 60);
    data.social.dailyPassiveSocialMinutes[dateStr] = randomInt(30, 180);
  }

  return data;
}

const emptyState = {
  seeded: false,
  circadian: { dailyFirstUnlock: {} },
  nutrition: { dailyPassiveMinutes: {}, dailyActiveMinutes: {} },
  physical: { dailySteps: {}, dailyStepDistribution: {} },
  recovery: { dailyLongestBreakMinutes: {}, dailyBreakCount: {} },
  social: { dailyActiveCommMinutes: {}, dailyPassiveSocialMinutes: {} },
};

export const useDimensionStore = create<DimensionState>()(
  persist(
    (set, get) => ({
      ...emptyState,

      reset: () => {
        set({ ...emptyState });
      },

      seedIfNeeded: () => {
        const { seeded } = get();
        if (!seeded) {
          set({ ...seedMockData(), seeded: true });
        }
      },

      getDayReading: (dimension: DimensionKey, dateStr: string) => {
        const state = get();
        switch (dimension) {
          case 'circadian': {
            const timeStr = state.circadian.dailyFirstUnlock[dateStr] || '';
            let raw = 0;
            if (timeStr) {
              const [h, m] = timeStr.split(':').map(Number);
              raw = h * 60 + m;
            }
            return {
              rawNumber: raw,
              primaryValue: formatCircadian(timeStr),
              secondaryLabel: 'first unlock',
            };
          }
          case 'nutrition': {
            const pass = state.nutrition.dailyPassiveMinutes[dateStr] || 0;
            const act = state.nutrition.dailyActiveMinutes[dateStr] || 0;
            return formatNutrition(pass, act);
          }
          case 'physical': {
            const steps = state.physical.dailySteps[dateStr] || 0;
            const dist = state.physical.dailyStepDistribution[dateStr];
            return { ...formatPhysical(steps), distribution: dist };
          }
          case 'recovery': {
            const longest = state.recovery.dailyLongestBreakMinutes[dateStr] || 0;
            const count = state.recovery.dailyBreakCount[dateStr] || 0;
            return formatRecovery(longest, count);
          }
          case 'social': {
            const act = state.social.dailyActiveCommMinutes[dateStr] || 0;
            const pass = state.social.dailyPassiveSocialMinutes[dateStr] || 0;
            return formatSocial(act, pass);
          }
          case 'consistency': {
            const { useCheckinStore } = require('./useCheckinStore');
            const series = useCheckinStore.getState().getWeekConsistency();
            return formatConsistency(series);
          }
        }
      },

      getWeekSeries: (dimension: DimensionKey) => {
        const state = get();
        const dates = getLastNDates(7);

        switch (dimension) {
          case 'circadian':
            return dates.map(d => {
              const timeStr = state.circadian.dailyFirstUnlock[d];
              if (!timeStr) return 0;
              const [h, m] = timeStr.split(':').map(Number);
              return h * 60 + m;
            });
          case 'nutrition':
            return dates.map(d => state.nutrition.dailyPassiveMinutes[d] || 0);
          case 'physical':
            return dates.map(d => state.physical.dailySteps[d] || 0);
          case 'recovery':
            return dates.map(d => state.recovery.dailyLongestBreakMinutes[d] || 0);
          case 'social':
            return dates.map(d => state.social.dailyActiveCommMinutes[d] || 0);
          case 'consistency':
            return dates.map(() => 0);
        }
      },

      getWeekAverage: (dimension: DimensionKey) => {
        const series = get().getWeekSeries(dimension).filter(x => x > 0);
        if (series.length === 0) return 0;
        return Math.round(series.reduce((a, b) => a + b, 0) / series.length);
      },

      getWeekBest: (dimension: DimensionKey) => {
        const dates = getLastNDates(7);
        const series = get().getWeekSeries(dimension);
        
        const isMinSeeking = dimension === 'circadian' || dimension === 'nutrition';
        let bestVal = isMinSeeking ? Infinity : -Infinity;
        let bestIdx = 0;

        for (let i = 0; i < 7; i++) {
          if (isMinSeeking) {
            if (series[i] < bestVal && series[i] > 0) {
              bestVal = series[i];
              bestIdx = i;
            }
          } else {
            if (series[i] > bestVal) {
              bestVal = series[i];
              bestIdx = i;
            }
          }
        }

        const formattedDate = format(parse(dates[bestIdx], 'yyyy-MM-dd', new Date()), 'EEE d');
        return { value: bestVal, date: formattedDate };
      },

      getTodayContext: (dimension: DimensionKey) => {
        const avg = get().getWeekAverage(dimension);
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const todayVal = get().getDayReading(dimension, todayStr).rawNumber;

        if (dimension === 'consistency') {
          return "Your rhythm is steady.";
        }

        if (!todayVal || !avg) return "Data establishing baseline.";

        const diff = todayVal - avg;
        const absDiff = Math.abs(diff);

        switch (dimension) {
          case 'circadian':
            return diff < 0 ? `${absDiff} min earlier than your average` : `${absDiff} min later than your average`;
          case 'nutrition': {
            const pct = Math.round((absDiff / avg) * 100);
            return diff > 0 ? `${pct}% more passive than your weekly average` : `${pct}% less passive than your weekly average`;
          }
          case 'physical':
            return diff > 0 ? `${absDiff.toLocaleString()} steps above your weekly average` : `${absDiff.toLocaleString()} steps below your weekly average`;
          case 'recovery':
            if (todayVal >= avg) return "Your longest break this week";
            return "Shorter breaks than usual today";
          case 'social':
            return diff < 0 ? "Less active communication than usual" : "Above average active connection";
        }
        return "Maintaining baseline.";
      },
    }),
    {
      name: 'obsidius-dimensions',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);

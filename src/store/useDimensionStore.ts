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
import UsageStatsModule from '../../modules/usage-stats';
import StepCounterModule from '../../modules/step-counter';

export interface DimensionReading {
  primaryValue: string;
  secondaryLabel: string;
  rawNumber: number;
  distribution?: string;
  activeFormatted?: string;
}

export type DimensionKey =
  | 'circadian'
  | 'nutrition'
  | 'physical'
  | 'recovery'
  | 'social'
  | 'consistency'
  | 'retention'
  | 'sleep-quality'
  | 'hydration'
  | 'cold-exposure'
  | 'physical-training';

export interface DimensionState {
  seeded: boolean;
  IS_MOCK: boolean;
  circadian: { dailyFirstUnlock: Record<string, string> };
  nutrition: { dailyPassiveMinutes: Record<string, number>; dailyActiveMinutes: Record<string, number> };
  physical: { dailySteps: Record<string, number>; dailyStepDistribution: Record<string, 'AM' | 'PM' | 'EVEN' | 'NONE'> };
  recovery: { dailyLongestBreakMinutes: Record<string, number>; dailyBreakCount: Record<string, number> };
  social: { dailyActiveCommMinutes: Record<string, number>; dailyPassiveSocialMinutes: Record<string, number> };

  retention: {
    currentStreak: number;
    relapseLog: Array<{ timestamp: number; trigger: string; notes?: string }>;
  };
  manualLogs: {
    dailySleepQuality: Record<string, number>;
    dailyHydrationLogged: Record<string, boolean>;
    dailyHydrationLiters: Record<string, number>;
    dailyColdExposure: Record<string, boolean>;
    dailyColdMinutes: Record<string, number>;
    dailyTrainingMinutes: Record<string, number>;
    dailyTrainingType: Record<string, string>;
  };

  reset: () => void;
  seedIfNeeded: () => void;
  refreshTodayData: () => Promise<void>;
  logManualEntry: (dateStr: string, updates: {
    dailySleepQuality?: number;
    dailyHydrationLogged?: boolean;
    dailyHydrationLiters?: number;
    dailyColdExposure?: boolean;
    dailyColdMinutes?: number;
    dailyTrainingMinutes?: number;
    dailyTrainingType?: string;
  }) => void;
  logRelapse: (trigger: string, notes?: string) => void;

  getDayReading: (dimension: DimensionKey, dateStr: string) => DimensionReading;
  getWeekSeries: (dimension: DimensionKey) => number[];
  getWeekAverage: (dimension: DimensionKey) => number;
  getWeekBest: (dimension: DimensionKey) => { value: number; date: string };
  getTodayContext: (dimension: DimensionKey) => string;
}

const emptyState = {
  seeded: false,
  IS_MOCK: true,
  circadian: { dailyFirstUnlock: {} },
  nutrition: { dailyPassiveMinutes: {}, dailyActiveMinutes: {} },
  physical: { dailySteps: {}, dailyStepDistribution: {} },
  recovery: { dailyLongestBreakMinutes: {}, dailyBreakCount: {} },
  social: { dailyActiveCommMinutes: {}, dailyPassiveSocialMinutes: {} },
  retention: { currentStreak: 0, relapseLog: [] },
  manualLogs: {
    dailySleepQuality: {},
    dailyHydrationLogged: {},
    dailyHydrationLiters: {},
    dailyColdExposure: {},
    dailyColdMinutes: {},
    dailyTrainingMinutes: {},
    dailyTrainingType: {},
  }
};

function seedMockData() {
  // WIPE MOCK DATA: completely remove all for loops and return 100% blank slate
  return { ...emptyState };
}

export const useDimensionStore = create<DimensionState>()(
  persist(
    (set, get) => ({
      ...emptyState,

      reset: () => {
        set({ ...emptyState });
      },

      seedIfNeeded: () => {
        const { seeded, physical } = get();
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const hasToday = physical.dailySteps[todayStr] !== undefined;
        
        if (!seeded) {
          set({ ...seedMockData(), seeded: true });
        }
        if (!hasToday) {
           get().refreshTodayData();
        }
      },

      refreshTodayData: async () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        try {
          // Native modules are statically imported at the top of the file.
          // requireOptionalNativeModule inside each module returns null in Expo Go,
          // which causes getDailyUsage/getTodaySteps to reject — caught below.
          const [usage, stepData] = await Promise.all([
            UsageStatsModule.getDailyUsage(today),
            StepCounterModule.getTodaySteps(),
          ]);

          set((state) => ({
            IS_MOCK: false,
            circadian: {
              dailyFirstUnlock: {
                ...state.circadian.dailyFirstUnlock,
                [today]: usage.firstUnlockTime,
              },
            },
            nutrition: {
              dailyPassiveMinutes: {
                ...state.nutrition.dailyPassiveMinutes,
                [today]: usage.passiveMinutes,
              },
              dailyActiveMinutes: {
                ...state.nutrition.dailyActiveMinutes,
                [today]: usage.activeMinutes,
              },
            },
            physical: {
              dailySteps: {
                ...state.physical.dailySteps,
                [today]: stepData.steps,
              },
              dailyStepDistribution: {
                ...state.physical.dailyStepDistribution,
                [today]: 'AM' as const,
              },
            },
            recovery: {
              dailyLongestBreakMinutes: {
                ...state.recovery.dailyLongestBreakMinutes,
                [today]: usage.longestScreenOffBreakMinutes,
              },
              dailyBreakCount: {
                ...state.recovery.dailyBreakCount,
                [today]: usage.breakCount,
              },
            },
            social: {
              dailyActiveCommMinutes: {
                ...state.social.dailyActiveCommMinutes,
                [today]: usage.activeCommMinutes,
              },
              dailyPassiveSocialMinutes: {
                ...state.social.dailyPassiveSocialMinutes,
                [today]: usage.passiveMinutes,
              },
            },
          }));

          console.log('[Obsidius] ✅ Real sensor data loaded for', today);
        } catch (e: any) {
          // Native modules unavailable (Expo Go) or permissions not yet granted.
          // Keeps existing stored data without crashing.
          console.warn('[Obsidius] ⚠️ Native data fetch failed:', e?.message ?? e);
        }
      },

      logManualEntry: (dateStr: string, updates: any) => {
        set(state => {
          const newLogs = { ...(state.manualLogs || emptyState.manualLogs) };
          Object.keys(updates).forEach(k => {
            const key = k as keyof DimensionState['manualLogs'];
            // @ts-ignore
            newLogs[key] = { ...(newLogs[key] || {}), [dateStr]: updates[key] };
          });
          return { manualLogs: newLogs };
        });
      },

      logRelapse: (trigger: string, notes?: string) => {
        set(state => ({
          retention: {
            currentStreak: 0,
            relapseLog: [...state.retention.relapseLog, { timestamp: Date.now(), trigger, notes }],
          }
        }));
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
          case 'retention': {
            return { primaryValue: `${state.retention.currentStreak}d`, secondaryLabel: 'current streak', rawNumber: state.retention.currentStreak };
          }
          case 'sleep-quality': {
            const sq = state.manualLogs?.dailySleepQuality?.[dateStr];
            return { primaryValue: sq ? `${sq}/5` : '—', secondaryLabel: 'rating', rawNumber: sq || 0 };
          }
          case 'hydration': {
            const gls = state.manualLogs?.dailyHydrationLiters?.[dateStr];
            return { primaryValue: gls ? `${gls}L` : '—', secondaryLabel: 'logged', rawNumber: gls || 0 };
          }
          case 'cold-exposure': {
            const mins = state.manualLogs?.dailyColdMinutes?.[dateStr];
            return { primaryValue: mins ? `${mins}m` : '—', secondaryLabel: 'immersion', rawNumber: mins || 0 };
          }
          case 'physical-training': {
            const mins = state.manualLogs?.dailyTrainingMinutes?.[dateStr];
            return { primaryValue: mins ? `${mins}m` : '—', secondaryLabel: state.manualLogs?.dailyTrainingType?.[dateStr] || 'training', rawNumber: mins || 0 };
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
          case 'retention':
            return dates.map(() => 0);
          case 'sleep-quality':
            return dates.map(d => state.manualLogs?.dailySleepQuality?.[d] || 0);
          case 'hydration':
            return dates.map(d => state.manualLogs?.dailyHydrationLiters?.[d] || 0);
          case 'cold-exposure':
            return dates.map(d => state.manualLogs?.dailyColdMinutes?.[d] || 0);
          case 'physical-training':
            return dates.map(d => state.manualLogs?.dailyTrainingMinutes?.[d] || 0);
        }
      },

      getWeekAverage: (dimension: DimensionKey) => {
        if (dimension === 'consistency' || dimension === 'retention') return 0;
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

        if (dimension === 'consistency') return "Your rhythm is steady.";
        if (dimension === 'retention') return "Maintaining control.";

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
          case 'sleep-quality':
          case 'hydration':
          case 'cold-exposure':
          case 'physical-training':
            return diff >= 0 ? "Above average today" : "Below average today";
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

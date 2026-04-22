// src/store/useCheckinStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from './mmkv';
import { format, subDays, parse, differenceInMinutes } from 'date-fns';

export interface CheckinEntry {
  date: string; // YYYY-MM-DD
  morningDone: boolean;
  morningEnergy?: number;
  morningWord?: string;
  morningTime?: string; // HH:mm
  eveningDone: boolean;
  eveningStatus?: 'maintained' | 'reset';
  eveningEnergy?: number;
  eveningReflection?: string;
  morningOnTime?: boolean;
}

export type ConsistencyStatus = 'maintained' | 'reset' | 'missed' | 'pending';

export interface CheckinState {
  checkinHistory: CheckinEntry[];
  resetIfNewDay: () => void;
  completeMorning: (energy: number, word: string) => void;
  completeEvening: (status: 'maintained' | 'reset', energy: number, reflection: string) => void;
  resetToday: () => void;
  wasMorningOnTime: () => boolean;
  getWeekConsistency: () => ConsistencyStatus[];
  debugWeekState: () => void;
  reset: () => void;
}

function getBlankEntry(date: string): CheckinEntry {
  return {
    date,
    morningDone: false,
    eveningDone: false,
  };
}

export const useCheckinStore = create<CheckinState>()(
  persist(
    (set, get) => ({
      checkinHistory: [],

      resetIfNewDay: () => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const history = get().checkinHistory;
        
        const lastEntry = history.length > 0 ? history[history.length - 1] : null;
        
        if (!lastEntry || lastEntry.date !== todayStr) {
          const newEntry = getBlankEntry(todayStr);
          const newHistory = [...history, newEntry].slice(-7);
          set({ checkinHistory: newHistory });
        }
      },

      completeMorning: (energy, word) => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const nowTimeStr = format(new Date(), 'HH:mm');
        const history = [...get().checkinHistory];
        
        let todayIdx = history.findIndex(e => e.date === todayStr);
        if (todayIdx === -1) {
          history.push(getBlankEntry(todayStr));
          todayIdx = history.length - 1;
        }
        
        history[todayIdx] = {
          ...history[todayIdx],
          morningDone: true,
          morningEnergy: energy,
          morningWord: word,
          morningTime: nowTimeStr,
        };
        
        set({ checkinHistory: history.slice(-7) });
      },

      completeEvening: (status, energy, reflection) => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const history = [...get().checkinHistory];
        
        let todayIdx = history.findIndex(e => e.date === todayStr);
        if (todayIdx === -1) {
          history.push(getBlankEntry(todayStr));
          todayIdx = history.length - 1;
        }
        
        history[todayIdx] = {
          ...history[todayIdx],
          eveningDone: true,
          eveningStatus: status,
          eveningEnergy: energy,
          eveningReflection: reflection,
        };
        
        set({ checkinHistory: history.slice(-7) });
      },

      resetToday: () => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const history = [...get().checkinHistory];
        const todayIdx = history.findIndex(e => e.date === todayStr);
        
        if (todayIdx !== -1) {
          history[todayIdx] = getBlankEntry(todayStr);
          set({ checkinHistory: history });
        }
      },

      wasMorningOnTime: () => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const history = get().checkinHistory;
        const todayEntry = history.find(e => e.date === todayStr);
        
        if (!todayEntry || !todayEntry.morningTime) return false;

        const { useOnboardingStore } = require('./useOnboardingStore');
        const targetTimeStr = useOnboardingStore.getState().morningTime || '08:00';
        
        const actualDate = parse(todayEntry.morningTime, 'HH:mm', new Date());
        const targetDate = parse(targetTimeStr, 'HH:mm', new Date());
        
        const diff = Math.abs(differenceInMinutes(actualDate, targetDate));
        return diff <= 30;
      },

      getWeekConsistency: () => {
        const result: ConsistencyStatus[] = [];
        const history = get().checkinHistory;
        const now = new Date();
        const todayStr = format(now, 'yyyy-MM-dd');
        
        for (let i = 6; i >= 0; i--) {
          const dStr = format(subDays(now, i), 'yyyy-MM-dd');
          const entry = history.find(e => e.date === dStr);
          
          if (entry && entry.eveningDone && entry.eveningStatus) {
            result.push(entry.eveningStatus);
          } else {
            if (dStr === todayStr) {
              const currentHour = parseInt(format(now, 'HH'), 10);
              if (currentHour >= 22) {
                result.push('missed');
              } else {
                result.push('pending');
              }
            } else {
              result.push('missed');
            }
          }
        }
        
        return result;
      },

      reset: () => {
        set({ checkinHistory: [] });
      },

      debugWeekState: () => {
        const history: CheckinEntry[] = [];
        const now = new Date();
        const statuses: Array<'maintained' | 'reset'> = ['maintained', 'maintained', 'reset', 'maintained', 'maintained', 'maintained', 'maintained'];
        for (let i = 6; i >= 0; i--) {
          const dStr = format(subDays(now, i), 'yyyy-MM-dd');
          history.push({
            date: dStr,
            morningDone: true,
            eveningDone: true,
            eveningStatus: statuses[6 - i]
          });
        }
        set({ checkinHistory: history });
      },
    }),
    {
      name: 'obsidius-checkin',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);

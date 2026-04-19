// src/store/usePauseStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from './mmkv';

export interface PauseEntry {
  id: string;
  timestamp: number;          // Date.now()
  durationSeconds: number;    // how long they actually sat (max 300)
  completedFully: boolean;    // did the 5 min timer finish?
  rating?: number;            // 1-5: did urge pass?
  triggerTag?: string;        // optional user tag
}

export interface ResetEntry {
  id: string;
  timestamp: number;
  q1?: string;                // "What were you doing in the hour before?"
  q2?: string;                // "What would have changed the outcome?"
  q3?: string;                // "What do you want tomorrow to look like?"
  anchorUpdated: boolean;
}

export interface PauseState {
  pauseLog: PauseEntry[];
  resetLog: ResetEntry[];
  
  logPause: (entry: Omit<PauseEntry, 'id'>) => void;
  logReset: (entry: Omit<ResetEntry, 'id'>) => void;
  
  getTotalPauses: () => number;
  getSuccessfulPauses: () => number;
  getAverageRating: () => number;
  
  reset: () => void;
}

export const usePauseStore = create<PauseState>()(
  persist(
    (set, get) => ({
      pauseLog: [],
      resetLog: [],

      logPause: (entry) => {
        const id = Date.now().toString();
        const fullEntry: PauseEntry = { id, ...entry };
        set((state) => ({
          pauseLog: [fullEntry, ...state.pauseLog],
        }));
      },

      logReset: (entry) => {
        const id = Date.now().toString();
        const fullEntry: ResetEntry = { id, ...entry };
        set((state) => ({
          resetLog: [fullEntry, ...state.resetLog],
        }));
      },

      getTotalPauses: () => {
        return get().pauseLog.length;
      },

      getSuccessfulPauses: () => {
        return get().pauseLog.filter(p => p.completedFully).length;
      },

      getAverageRating: () => {
        const ratings = get().pauseLog
          .map(p => p.rating)
          .filter((r): r is number => r !== undefined);
          
        if (ratings.length === 0) return 0;
        
        const sum = ratings.reduce((a, b) => a + b, 0);
        const avg = sum / ratings.length;
        
        return Math.round(avg * 10) / 10;
      },

      reset: () => {
        set({ pauseLog: [], resetLog: [] });
      },
    }),
    {
      name: 'obsidius-pause',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);

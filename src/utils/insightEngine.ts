// src/utils/insightEngine.ts
import { getLastNDates } from './formatters';
import type { DimensionState, DimensionKey } from '../store/useDimensionStore';
import type { CheckinEntry } from '../store/useCheckinStore';

export interface Insight {
  id: string;
  dimensionA: DimensionKey;
  dimensionB: DimensionKey;
  relationLabel: string;
  text: string;
  dataPoints: string;
  strength: number;
}

// Helpers
function parseMins(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length !== 2) return 0;
  const [h, m] = parts.map(Number);
  return h * 60 + m;
}

function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const mu = average(arr);
  const sumSq = arr.reduce((a, b) => a + Math.pow(b - mu, 2), 0);
  return Math.sqrt(sumSq / (arr.length - 1));
}

function getStatusValid(dateStr: string, history: CheckinEntry[]): boolean {
  const entry = history.find(e => e.date === dateStr);
  if (!entry) return false;
  // pending is treated as neither maintained nor reset, so it's not a valid definitive check-in status
  if (!entry.eveningDone) return false;
  return entry.eveningStatus === 'maintained' || entry.eveningStatus === 'reset';
}

export function generateInsights(dimensionState: DimensionState, checkinHistory: CheckinEntry[]): Insight[] {
  const last21 = getLastNDates(21);
  const last7 = getLastNDates(7);
  const insights: Insight[] = [];

  // Check 1: Screen Use -> Movement (nutrition passive < 120min vs physical steps)
  const lowPassSteps: number[] = [];
  const highPassSteps: number[] = [];
  
  for (const d of last21) {
    const passive = dimensionState.nutrition.dailyPassiveMinutes[d];
    const steps = dimensionState.physical.dailySteps[d];
    if (passive !== undefined && steps !== undefined && steps > 0) {
      if (passive < 120) lowPassSteps.push(steps);
      else highPassSteps.push(steps);
    }
  }
  
  if (lowPassSteps.length > 0 && highPassSteps.length > 0) {
    const lowAvg = average(lowPassSteps);
    const highAvg = average(highPassSteps);
    const maxVal = Math.max(lowAvg, highAvg);
    if (maxVal > 0) {
      const diffPct = (lowAvg - highAvg) / maxVal;
      const str = Math.min(1, Math.abs(diffPct) * 1.5);
      const sign = diffPct > 0 ? '+' : '';
      insights.push({
        id: 'screen-movement',
        dimensionA: 'nutrition',
        dimensionB: 'physical',
        relationLabel: 'Passive Screen vs Movement',
        text: `< 2h screen time maps to ${sign}${Math.round(diffPct * 100)}% daily steps`,
        dataPoints: `${Math.round(lowAvg)} vs ${Math.round(highAvg)} steps avg`,
        strength: str
      });
    }
  }

  // Check 2: Wake Rhythm -> Movement (circadian unlock before 8am vs physical steps)
  const earlySteps: number[] = [];
  const lateSteps: number[] = [];
  
  for (const d of last21) {
    const wakeStr = dimensionState.circadian.dailyFirstUnlock[d];
    const steps = dimensionState.physical.dailySteps[d];
    if (wakeStr && steps !== undefined && steps > 0) {
      const mins = parseMins(wakeStr);
      if (mins < 480) earlySteps.push(steps); // 8am = 480 mins
      else lateSteps.push(steps);
    }
  }
  
  if (earlySteps.length > 0 && lateSteps.length > 0) {
    const earlyAvg = average(earlySteps);
    const lateAvg = average(lateSteps);
    const maxVal = Math.max(earlyAvg, lateAvg);
    if (maxVal > 0) {
      const diffPct = (earlyAvg - lateAvg) / maxVal;
      const str = Math.min(1, Math.abs(diffPct) * 1.5);
      const sign = diffPct > 0 ? '+' : '';
      insights.push({
        id: 'wake-movement',
        dimensionA: 'circadian',
        dimensionB: 'physical',
        relationLabel: 'Wake Time vs Movement',
        text: `Before 8am unlocks map to ${sign}${Math.round(diffPct * 100)}% daily steps`,
        dataPoints: `${Math.round(earlyAvg)} vs ${Math.round(lateAvg)} avg`,
        strength: str
      });
    }
  }

  // Check 3: Rest Breaks -> Passive Social (recovery longest break > 30 vs social passive)
  const longBreakSoc: number[] = [];
  const shortBreakSoc: number[] = [];
  
  for (const d of last21) {
    const longest = dimensionState.recovery.dailyLongestBreakMinutes[d];
    const passSoc = dimensionState.social.dailyPassiveSocialMinutes[d];
    if (longest !== undefined && passSoc !== undefined) {
      if (longest > 30) longBreakSoc.push(passSoc);
      else shortBreakSoc.push(passSoc);
    }
  }
  
  if (longBreakSoc.length > 0 && shortBreakSoc.length > 0) {
    const longAvg = average(longBreakSoc);
    const shortAvg = average(shortBreakSoc);
    const maxVal = Math.max(longAvg, shortAvg);
    if (maxVal > 0) {
      const diffPct = (longAvg - shortAvg) / maxVal;
      const str = Math.min(1, Math.abs(diffPct) * 1.5);
      const sign = diffPct > 0 ? '+' : '';
      const textDir = diffPct < 0 ? 'reduces' : 'increases';
      insights.push({
        id: 'rest-social',
        dimensionA: 'recovery',
        dimensionB: 'social',
        relationLabel: 'Breaks vs Passive Social',
        text: `>30m breaks ${textDir} passive scrolling by ${Math.round(Math.abs(diffPct) * 100)}%`,
        dataPoints: `${Math.round(longAvg)}m vs ${Math.round(shortAvg)}m avg scrolling`,
        strength: str
      });
    }
  }

  // Check 4: Wake Variance -> Consistency (stdDev of unlock times across 7 days)
  const wakeTarget = last7.map(d => parseMins(dimensionState.circadian.dailyFirstUnlock[d] || ''));
  const validWakes = wakeTarget.filter(m => m > 0);
  const sDev = stdDev(validWakes);

  let checkedInDays = 0;
  let totalValidDays = 0;
  for (const d of last7) {
    const entry = checkinHistory.find(e => e.date === d);
    if (entry && entry.eveningDone) {
      totalValidDays++;
      if (entry.eveningStatus === 'maintained' || entry.eveningStatus === 'reset') {
        checkedInDays++;
      }
    }
  }

  if (totalValidDays >= 3 && validWakes.length >= 3) {
    if (sDev < 45) {
      const str = Math.min(1, ((45 - sDev) / 45) * 0.8 + 0.2);
      insights.push({
        id: 'wake-consistency',
        dimensionA: 'circadian',
        dimensionB: 'consistency',
        relationLabel: 'Wake Variance vs Consistency',
        text: `Steady wake rhythm (+/- ${Math.round(sDev)}m) aligns with strong check-in habits`,
        dataPoints: `${checkedInDays}/${totalValidDays} days logged`,
        strength: str
      });
    } else {
      const str = Math.min(1, ((sDev - 45) / 60) * 0.8 + 0.2);
      insights.push({
        id: 'wake-consistency',
        dimensionA: 'circadian',
        dimensionB: 'consistency',
        relationLabel: 'Wake Variance vs Consistency',
        text: `Erratic wake times (+/- ${Math.round(sDev)}m) map to variable check-ins`,
        dataPoints: `${totalValidDays - checkedInDays} missed/pending check-ins`,
        strength: str
      });
    }
  }

  // Check 5: Recovery -> Evening Social (good/poor recovery vs passive social)
  const goodRecSoc: number[] = [];
  const poorRecSoc: number[] = [];
  
  for (const d of last21) {
    const longest = dimensionState.recovery.dailyLongestBreakMinutes[d];
    const count = dimensionState.recovery.dailyBreakCount[d];
    const passSoc = dimensionState.social.dailyPassiveSocialMinutes[d];
    
    if (longest !== undefined && count !== undefined && passSoc !== undefined) {
      if (longest >= 20 || count >= 2) goodRecSoc.push(passSoc);
      else poorRecSoc.push(passSoc);
    }
  }
  
  if (goodRecSoc.length > 0 && poorRecSoc.length > 0) {
    const goodAvg = average(goodRecSoc);
    const poorAvg = average(poorRecSoc);
    const maxVal = Math.max(goodAvg, poorAvg);
    if (maxVal > 0) {
      const diffPct = (goodAvg - poorAvg) / maxVal;
      const str = Math.min(1, Math.abs(diffPct) * 1.5);
      const sign = diffPct > 0 ? '+' : '';
      const textDir = diffPct < 0 ? 'reductions' : 'increases';
      insights.push({
        id: 'recovery-social',
        dimensionA: 'recovery',
        dimensionB: 'social',
        relationLabel: 'Recovery Quality vs Scrolling',
        text: `Good recovery corresponds to ${Math.round(Math.abs(diffPct) * 100)}% ${textDir} in scrolling`,
        dataPoints: `${Math.round(goodAvg)}m vs ${Math.round(poorAvg)}m avg`,
        strength: str
      });
    }
  }

  // Check 6: Active Comm -> Consistency (activeComm > 30min vs eveningStatus consistency)
  let activeMaint = 0, activeTotal = 0;
  let inactiveMaint = 0, inactiveTotal = 0;

  for (const d of last7) {
    const activeComm = dimensionState.social.dailyActiveCommMinutes[d];
    const valid = getStatusValid(d, checkinHistory);
    
    if (activeComm !== undefined) {
      if (activeComm > 30) {
        activeTotal++;
        if (valid) activeMaint++;
      } else {
        inactiveTotal++;
        if (valid) inactiveMaint++;
      }
    }
  }
  
  if (activeTotal > 0 && inactiveTotal > 0) {
    const actRate = activeMaint / activeTotal;
    const inactRate = inactiveMaint / inactiveTotal;
    const diff = actRate - inactRate;
    const str = Math.min(1, Math.abs(diff) * 1.5);
    const diffPct = Math.round(diff * 100);
    const sign = diff > 0 ? '+' : '';
    
    insights.push({
      id: 'activecomm-consistency',
      dimensionA: 'social',
      dimensionB: 'consistency',
      relationLabel: 'Active Connect vs Check-in',
      text: `>30m active connection changes check-in rate by ${sign}${diffPct}%`,
      dataPoints: `${Math.round(actRate * 100)}% vs ${Math.round(inactRate * 100)}% logged`,
      strength: str
    });
  }

  // Sort by strength descending
  insights.sort((a, b) => b.strength - a.strength);

  // Return max 4, min 2 (if enough generated)
  return insights.slice(0, 4);
}

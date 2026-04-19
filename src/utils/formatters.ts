// src/utils/formatters.ts

import { format, subDays, parse } from 'date-fns';
import type { DimensionReading } from '../store/useDimensionStore'; // We will define this when updating the store later

/**
 * Format dimension reading into display strings.
 */

// Circadian
// formatCircadian returns the same time string as the input but ensures uniform padding
export function formatCircadian(timeStr: string): string {
  if (!timeStr) return "—";
  return timeStr;
}

// Nutrition
export function formatNutrition(passiveMin: number, activeMin: number): DimensionReading & { activeFormatted: string } {
  return {
    rawNumber: passiveMin,
    primaryValue: minsToHours(passiveMin),
    secondaryLabel: "passive today",
    activeFormatted: minsToHours(activeMin),
  };
}

// Physical
export function formatPhysical(steps: number): DimensionReading {
  return {
    rawNumber: steps,
    primaryValue: formatSteps(steps),
    secondaryLabel: "steps",
  };
}

// Recovery
export function formatRecovery(longestBreakMin: number, breakCount: number): DimensionReading {
  let primaryValue = '—';
  if (longestBreakMin > 0) {
    primaryValue = longestBreakMin < 5 ? '< 5 min' : `${longestBreakMin} min`;
  }
  return {
    rawNumber: longestBreakMin,
    primaryValue,
    secondaryLabel: "longest break",
  };
}

// Social
export function formatSocial(activeMin: number, passiveMin: number): DimensionReading {
  return {
    rawNumber: activeMin,
    primaryValue: minsToHours(activeMin),
    secondaryLabel: "active today",
  };
}

// Consistency
export function formatConsistency(weekSeries: ('maintained' | 'reset' | 'missed' | 'pending')[]): DimensionReading {
  if (!weekSeries || weekSeries.length === 0) {
    return {
      rawNumber: 0,
      primaryValue: "—",
      secondaryLabel: "days checked in",
    };
  }
  const checkedInDays = weekSeries.filter(status => status === 'maintained' || status === 'reset').length;
  
  return {
    rawNumber: checkedInDays,
    primaryValue: `${checkedInDays} of 7`,
    secondaryLabel: "days checked in",
  };
}

/**
 * Format minutes to an hours string like "3.1h", "45 min".
 */
export function minsToHours(minutes: number): string {
  if (minutes === 0 || isNaN(minutes)) return "—";
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return `${(Math.round(hours * 10) / 10).toString()}h`;
}

/**
 * Format steps with a comma separator.
 */
export function formatSteps(steps: number): string {
  if (steps === 0 || isNaN(steps)) return "—";
  return steps.toLocaleString('en-US');
}

/**
 * Get the last N dates as YYYY-MM-DD strings. 
 * Today is the last element (index N-1).
 */
export function getLastNDates(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    dates.push(format(subDays(today, i), 'yyyy-MM-dd'));
  }
  return dates;
}

/**
 * Get day abbreviation for a date string ("2026-04-14" -> "MON")
 */
export function getDayLabel(dateStr: string): string {
  if (!dateStr) return "—";
  const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
  return format(parsedDate, 'EEE').toUpperCase();
}

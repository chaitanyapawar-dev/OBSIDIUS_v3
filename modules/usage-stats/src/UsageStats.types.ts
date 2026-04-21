export interface DailyUsageData {
  date: string
  firstUnlockTime: string        // "HH:MM" or "—" if no unlock detected
  passiveMinutes: number
  activeMinutes: number
  activeCommMinutes: number
  longestScreenOffBreakMinutes: number
  breakCount: number
}

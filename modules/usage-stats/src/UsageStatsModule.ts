import { NativeModulesProxy } from 'expo-modules-core'

const { UsageStats } = NativeModulesProxy

export default {
  getDailyUsage: (date: string): Promise<DailyUsageData> =>
    UsageStats.getDailyUsage(date),
}

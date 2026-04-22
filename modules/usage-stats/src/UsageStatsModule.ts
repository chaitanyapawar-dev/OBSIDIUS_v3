import { requireOptionalNativeModule } from 'expo-modules-core'

// requireOptionalNativeModule returns null in Expo Go (not a native build)
// and the actual module object in dev/release native builds.
const UsageStatsNative = requireOptionalNativeModule('UsageStats')

export default {
  getDailyUsage: (date: string): Promise<any> => {
    if (!UsageStatsNative) {
      return Promise.reject(new Error('UsageStats native module not available'))
    }
    return UsageStatsNative.getDailyUsage(date)
  },
}

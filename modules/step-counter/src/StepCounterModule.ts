import { requireOptionalNativeModule } from 'expo-modules-core'

// requireOptionalNativeModule returns null in Expo Go (not a native build)
// and the actual module object in dev/release native builds.
const StepCounterNative = requireOptionalNativeModule('StepCounter')

export default {
  getTodaySteps: (): Promise<{ steps: number; available: boolean }> => {
    if (!StepCounterNative) {
      return Promise.reject(new Error('StepCounter native module not available'))
    }
    return StepCounterNative.getTodaySteps()
  },
}

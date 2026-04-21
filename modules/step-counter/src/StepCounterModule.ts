import { NativeModulesProxy } from 'expo-modules-core'

const { StepCounter } = NativeModulesProxy

export default {
  getTodaySteps: (): Promise<{ steps: number; available: boolean }> =>
    StepCounter.getTodaySteps(),
}

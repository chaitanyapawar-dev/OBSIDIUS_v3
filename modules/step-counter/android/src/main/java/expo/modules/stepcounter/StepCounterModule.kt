package expo.modules.stepcounter

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class StepCounterModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("StepCounter")

    AsyncFunction("getTodaySteps") {
      val context = appContext.reactContext
        ?: return@AsyncFunction mapOf("steps" to 0, "available" to false)

      val sensorManager = context.getSystemService(Context.SENSOR_SERVICE)
        as? SensorManager
        ?: return@AsyncFunction mapOf("steps" to 0, "available" to false)

      val stepSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)
        ?: return@AsyncFunction mapOf("steps" to 0, "available" to false)

      var stepCount = 0
      var received = false

      val listener = object : SensorEventListener {
        override fun onSensorChanged(event: SensorEvent) {
          stepCount = event.values[0].toInt()
          received = true
        }
        override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {}
      }

      sensorManager.registerListener(
        listener, stepSensor, SensorManager.SENSOR_DELAY_NORMAL
      )

      // Wait up to 1 second for first reading
      val deadline = System.currentTimeMillis() + 1000L
      while (!received && System.currentTimeMillis() < deadline) {
        Thread.sleep(50)
      }
      sensorManager.unregisterListener(listener)

      mapOf("steps" to stepCount, "available" to received)
    }
  }
}

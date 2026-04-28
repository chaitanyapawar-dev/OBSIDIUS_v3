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

      var finalSteps = 0
      if (received) {
        val prefs = context.getSharedPreferences("ObsidiusStepData", Context.MODE_PRIVATE)
        val todayDateStr = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US).format(java.util.Date())

        val savedDate = prefs.getString("lastDate", "")
        var accumulated = prefs.getInt("accumulated", 0)
        var lastSensor = prefs.getInt("lastSensor", -1)

        val currentSteps = stepCount

        if (savedDate != todayDateStr) {
          accumulated = 0
          lastSensor = currentSteps
          prefs.edit()
            .putString("lastDate", todayDateStr)
            .putInt("accumulated", 0)
            .putInt("lastSensor", currentSteps)
            .apply()
          finalSteps = 0
        } else {
          if (lastSensor == -1) {
             lastSensor = currentSteps
          }
          if (currentSteps < lastSensor) {
            accumulated += lastSensor
            lastSensor = currentSteps
          }
          
          val diff = currentSteps - lastSensor
          finalSteps = accumulated + diff
          
          prefs.edit()
            .putInt("lastSensor", currentSteps)
            .putInt("accumulated", accumulated)
            .apply()
        }
      }

      mapOf("steps" to finalSteps, "available" to received)
    }
  }
}

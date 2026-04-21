package expo.modules.usagestats

import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.Calendar

// Passive consumption app package names
private val PASSIVE_PACKAGES = setOf(
  "com.instagram.android",
  "com.zhiliaoapp.musically",
  "com.twitter.android",
  "com.google.android.youtube",
  "com.reddit.frontpage",
  "com.snapchat.android",
  "com.netflix.mediaclient",
  "com.amazon.avod",
  "com.facebook.katana",
  "com.facebook.android"
)

// Active communication app package names
private val COMM_PACKAGES = setOf(
  "com.whatsapp",
  "org.telegram.messenger",
  "com.google.android.apps.messaging",
  "com.discord",
  "com.microsoft.teams"
)

class UsageStatsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("UsageStats")

    AsyncFunction("getDailyUsage") { date: String ->
      val context = appContext.reactContext
        ?: return@AsyncFunction buildEmptyResult(date)

      val usm = context.getSystemService(Context.USAGE_STATS_SERVICE)
        as? UsageStatsManager
        ?: return@AsyncFunction buildEmptyResult(date)

      // Parse YYYY-MM-DD to start/end milliseconds
      val parts = date.split("-")
      if (parts.size != 3) return@AsyncFunction buildEmptyResult(date)

      val cal = Calendar.getInstance()
      cal.set(parts[0].toInt(), parts[1].toInt() - 1, parts[2].toInt(), 0, 0, 0)
      cal.set(Calendar.MILLISECOND, 0)
      val startTime = cal.timeInMillis
      cal.add(Calendar.DAY_OF_MONTH, 1)
      val endTime = cal.timeInMillis

      // Query app usage stats
      val stats = usm.queryUsageStats(
        UsageStatsManager.INTERVAL_DAILY, startTime, endTime
      ) ?: emptyList()

      var passiveMinutes = 0L
      var activeMinutes = 0L
      var activeCommMinutes = 0L

      stats.forEach { stat ->
        val mins = stat.totalTimeInForeground / 60000L
        if (mins <= 0) return@forEach
        when {
          PASSIVE_PACKAGES.contains(stat.packageName) -> passiveMinutes += mins
          COMM_PACKAGES.contains(stat.packageName) -> activeCommMinutes += mins
          else -> activeMinutes += mins
        }
      }

      // Find first unlock time and screen-off break periods
      val events = usm.queryEvents(startTime, endTime)
      val event = UsageEvents.Event()

      var firstUnlockMs = 0L
      var lastScreenOnMs = 0L
      var longestBreakMs = 0L
      var breakCount = 0
      val BREAK_THRESHOLD_MS = 20L * 60L * 1000L // 20 minutes

      while (events.hasNextEvent()) {
        events.getNextEvent(event)
        when (event.eventType) {
          UsageEvents.Event.SCREEN_INTERACTIVE -> {
            if (firstUnlockMs == 0L) firstUnlockMs = event.timeStamp
            // Calculate break if screen was off
            if (lastScreenOnMs > 0) {
              val breakMs = event.timeStamp - lastScreenOnMs
              if (breakMs > longestBreakMs) longestBreakMs = breakMs
              if (breakMs >= BREAK_THRESHOLD_MS) breakCount++
            }
            lastScreenOnMs = 0L
          }
          UsageEvents.Event.SCREEN_NON_INTERACTIVE -> {
            lastScreenOnMs = event.timeStamp
          }
        }
      }

      val firstUnlockTime = if (firstUnlockMs > 0L) {
        val c = Calendar.getInstance()
        c.timeInMillis = firstUnlockMs
        "%02d:%02d".format(
          c.get(Calendar.HOUR_OF_DAY),
          c.get(Calendar.MINUTE)
        )
      } else "—"

      mapOf(
        "date" to date,
        "firstUnlockTime" to firstUnlockTime,
        "passiveMinutes" to passiveMinutes.toInt(),
        "activeMinutes" to activeMinutes.toInt(),
        "activeCommMinutes" to activeCommMinutes.toInt(),
        "longestScreenOffBreakMinutes" to (longestBreakMs / 60000L).toInt(),
        "breakCount" to breakCount
      )
    }
  }

  private fun buildEmptyResult(date: String) = mapOf(
    "date" to date,
    "firstUnlockTime" to "—",
    "passiveMinutes" to 0,
    "activeMinutes" to 0,
    "activeCommMinutes" to 0,
    "longestScreenOffBreakMinutes" to 0,
    "breakCount" to 0
  )
}

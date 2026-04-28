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
        UsageStatsManager.INTERVAL_BEST, startTime, endTime
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

      // Calculate total actual screen-on time from events
      var totalScreenOnMs = 0L
      var screenOnStart = 0L
      val screenEvents = usm.queryEvents(startTime, endTime)
      val screenEvt = UsageEvents.Event()

      while (screenEvents.hasNextEvent()) {
        screenEvents.getNextEvent(screenEvt)
        when (screenEvt.eventType) {
          UsageEvents.Event.SCREEN_INTERACTIVE -> screenOnStart = screenEvt.timeStamp
          UsageEvents.Event.SCREEN_NON_INTERACTIVE -> {
            if (screenOnStart > 0) {
              totalScreenOnMs += screenEvt.timeStamp - screenOnStart
              screenOnStart = 0L
            }
          }
        }
      }
      // If screen is still on at end of period
      if (screenOnStart > 0) totalScreenOnMs += endTime - screenOnStart

      val totalScreenOnMinutes = (totalScreenOnMs / 60000L).toInt()

      // Cap the sum so it cannot exceed actual screen-on time
      val rawTotal = passiveMinutes + activeMinutes + activeCommMinutes
      if (rawTotal > totalScreenOnMinutes && totalScreenOnMinutes > 0) {
        val ratio = totalScreenOnMinutes.toDouble() / rawTotal.toDouble()
        passiveMinutes = (passiveMinutes * ratio).toLong()
        activeMinutes = (activeMinutes * ratio).toLong()
        activeCommMinutes = (activeCommMinutes * ratio).toLong()
      }

      // BUG 1: Wake Rhythm shows "00:02" instead of real hour
      val EXCLUDED_PACKAGES = setOf(
        "com.android.systemui",
        "com.sec.android.app.launcher",
        "com.google.android.apps.nexuslauncher",
        "com.miui.home",
        "com.coloros.launcher"
      )

      var firstUnlockMs = 0L
      var currentUnlockCandidate = 0L

      // Define the valid window: 05:00 to midnight of the queried date
      val fiveAmCal = Calendar.getInstance()
      fiveAmCal.timeInMillis = startTime
      fiveAmCal.set(Calendar.HOUR_OF_DAY, 5)
      fiveAmCal.set(Calendar.MINUTE, 0)
      fiveAmCal.set(Calendar.SECOND, 0)
      val fiveAmMs = fiveAmCal.timeInMillis

      // Query events again for unlock detection
      val unlockEvents = usm.queryEvents(fiveAmMs, endTime)
      val unlockEvent = UsageEvents.Event()

      while (unlockEvents.hasNextEvent()) {
        unlockEvents.getNextEvent(unlockEvent)
        if (firstUnlockMs > 0L) break

        if (unlockEvent.eventType == UsageEvents.Event.KEYGUARD_HIDDEN) {
          if (currentUnlockCandidate == 0L) {
            currentUnlockCandidate = unlockEvent.timeStamp
          }
        } else if (unlockEvent.eventType == UsageEvents.Event.SCREEN_NON_INTERACTIVE) {
          currentUnlockCandidate = 0L
        } else if (unlockEvent.eventType == UsageEvents.Event.ACTIVITY_PAUSED) {
          if (currentUnlockCandidate > 0L && !EXCLUDED_PACKAGES.contains(unlockEvent.packageName)) {
            if (unlockEvent.timeStamp - currentUnlockCandidate >= 120_000L) {
              firstUnlockMs = currentUnlockCandidate
              break
            }
          }
        }
      }
      if (firstUnlockMs == 0L && currentUnlockCandidate > 0L) {
         if (System.currentTimeMillis() - currentUnlockCandidate >= 120_000L) {
            firstUnlockMs = currentUnlockCandidate
         }
      }

      // BUG 4: Recovery State showing 328 min (counting sleep time)
      val sevenAmCal = Calendar.getInstance()
      sevenAmCal.timeInMillis = startTime
      sevenAmCal.set(Calendar.HOUR_OF_DAY, 7)
      sevenAmCal.set(Calendar.MINUTE, 0)
      val sevenAmMs = sevenAmCal.timeInMillis

      val tenPmCal = Calendar.getInstance()
      tenPmCal.timeInMillis = startTime
      tenPmCal.set(Calendar.HOUR_OF_DAY, 22)
      tenPmCal.set(Calendar.MINUTE, 0)
      val tenPmMs = tenPmCal.timeInMillis

      val BREAK_THRESHOLD_MS = 15L * 60L * 1000L // 15 minutes minimum (research: Kleitman ultradian)

      var longestBreakMs = 0L
      var breakCount = 0
      var screenOffStartMs = 0L

      val breakEvents = usm.queryEvents(sevenAmMs, tenPmMs)
      val breakEvt = UsageEvents.Event()

      while (breakEvents.hasNextEvent()) {
        breakEvents.getNextEvent(breakEvt)
        when (breakEvt.eventType) {
          UsageEvents.Event.SCREEN_NON_INTERACTIVE -> {
            screenOffStartMs = breakEvt.timeStamp
          }
          UsageEvents.Event.SCREEN_INTERACTIVE -> {
            if (screenOffStartMs > 0) {
              val breakDurationMs = breakEvt.timeStamp - screenOffStartMs
              if (breakDurationMs >= BREAK_THRESHOLD_MS) {
                breakCount++
                if (breakDurationMs > longestBreakMs) longestBreakMs = breakDurationMs
              }
              screenOffStartMs = 0L
            }
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

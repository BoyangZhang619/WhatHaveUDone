/**
 * 通知与提醒相关操作
 */
import { useI18n } from "vue-i18n";
import { saveSettings } from "./useSettingsStorage";
import type { useSettingState } from "./useSettingState";

type SettingState = ReturnType<typeof useSettingState>;

export function useNotificationSettings(
  current: SettingState["current"],
  setStatus: SettingState["setStatus"]
) {
  const { t } = useI18n();

  function onDailyReminderToggle() {
    current.dailyReminder = !current.dailyReminder;
    saveSettings({ dailyReminder: current.dailyReminder });
    setStatus(
      current.dailyReminder
        ? t("setting.status.daily_reminder_on")
        : t("setting.status.daily_reminder_off"),
      "success"
    );
  }

  function onReminderTimeChange() {
    saveSettings({ reminderTime: current.reminderTime });
    setStatus(
      t("setting.status.reminder_time_set", { time: current.reminderTime }),
      "success"
    );
  }

  function onStreakReminderToggle() {
    current.streakReminder = !current.streakReminder;
    saveSettings({ streakReminder: current.streakReminder });
    setStatus(
      current.streakReminder
        ? t("setting.status.streak_reminder_on")
        : t("setting.status.streak_reminder_off"),
      "success"
    );
  }

  function onWeeklyReportChange() {
    saveSettings({ weeklyReport: current.weeklyReport });
    const labels: Record<string, string> = {
      off: t("setting.notification.weekly_report.off"),
      popup: t("setting.notification.weekly_report.popup"),
      email: t("setting.notification.weekly_report.email"),
    };
    setStatus(
      t("setting.status.weekly_report_set", {
        mode: labels[current.weeklyReport] || current.weeklyReport,
      }),
      "success"
    );
  }

  return {
    onDailyReminderToggle,
    onReminderTimeChange,
    onStreakReminderToggle,
    onWeeklyReportChange,
  };
}

/**
 * 关于页面相关操作（含重置所有设置）
 */
import { useI18n } from "vue-i18n";
import { setLocale, type SupportedLocale } from "@/i18n";
import { STORAGE_KEY } from "./useSettingsStorage";
import type { useSettingState } from "./useSettingState";

type SettingState = ReturnType<typeof useSettingState>;

export function useAboutSettings(
  current: SettingState["current"],
  setStatus: SettingState["setStatus"]
) {
  const { t } = useI18n();

  function onCheckUpdate() {
    setStatus(t("setting.status.check_update_latest"), "success");
  }

  function onChangelog() {
    window.open(
      "https://github.com/BoyangZhang619/whatHaveUDone/commits/main/",
      "_blank"
    );
  }

  function onResetAllSettings() {
    if (
      !confirm(
        t("setting.about.reset.confirm") || "Reset all settings to default?"
      )
    )
      return;

    // 清除存储
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("whatIveDone_theme");
    localStorage.removeItem("whatIveDone_locale");

    // 重置 current 到默认值
    current.language = "zh-CN" as SupportedLocale;
    current.pageSize = 10;
    current.sortOrder = "newest";
    current.autoDraft = true;
    current.draftInterval = 30;
    current.confirmDelete = true;
    current.shortcuts = true;
    current.timezone = "-";

    current.theme = "light";
    current.fontSize = 14;
    current.cardLayout = "grid";
    current.animation = true;
    current.borderRadius = "large";
    current.previewLines = 3;

    current.dailyReminder = false;
    current.reminderTime = "21:00";
    current.streakReminder = false;
    current.weeklyReport = "off";

    // 恢复 DOM 状态
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.style.removeProperty("--font-base");
    document.documentElement.style.removeProperty("--radius");
    document.documentElement.style.removeProperty("--preview-lines");
    document.documentElement.removeAttribute("data-no-animation");
    setLocale("zh-CN" as SupportedLocale);

    setStatus(t("setting.status.reset_done"), "success");
  }

  return {
    onCheckUpdate,
    onChangelog,
    onResetAllSettings,
  };
}

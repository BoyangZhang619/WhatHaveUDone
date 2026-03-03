/**
 * 通用设置相关操作
 */
import { useI18n } from "vue-i18n";
import { setLocale, SUPPORTED_LOCALES, type SupportedLocale } from "@/i18n";
import { saveSettings } from "./useSettingsStorage";
import type { useSettingState } from "./useSettingState";

type SettingState = ReturnType<typeof useSettingState>;

export function useGeneralSettings(
  current: SettingState["current"],
  setStatus: SettingState["setStatus"]
) {
  const { t } = useI18n();

  function onLanguageChange() {
    setLocale(current.language);
    setStatus(
      t("setting.status.lang_switched", {
        lang: SUPPORTED_LOCALES[current.language],
      }),
      "success"
    );
  }

  function onPageSizeChange() {
    saveSettings({ pageSize: current.pageSize });
    setStatus(
      t("setting.status.page_size_set", { n: current.pageSize }),
      "success"
    );
  }

  function onSortOrderChange() {
    saveSettings({ sortOrder: current.sortOrder });
    setStatus(t("setting.status.sort_updated"), "success");
  }

  function onAutoDraftToggle() {
    current.autoDraft = !current.autoDraft;
    saveSettings({ autoDraft: current.autoDraft });
    setStatus(
      current.autoDraft
        ? t("setting.status.auto_draft_on")
        : t("setting.status.auto_draft_off"),
      "success"
    );
  }

  function onConfirmDeleteToggle() {
    if (
      !current.confirmDelete ||
      confirm(t("setting.confirm_delete"))
    ) {
      current.confirmDelete = !current.confirmDelete;
      saveSettings({ confirmDelete: current.confirmDelete });
      setStatus(
        current.confirmDelete
          ? t("setting.status.confirm_delete_on")
          : t("setting.status.confirm_delete_off"),
        "success"
      );
    }
  }

  function onShortcutsToggle() {
    current.shortcuts = !current.shortcuts;
    saveSettings({ shortcuts: current.shortcuts });
    setStatus(
      current.shortcuts
        ? t("setting.status.shortcuts_on")
        : t("setting.status.shortcuts_off"),
      "success"
    );
  }

  function onTimezoneChange() {
    saveSettings({ timezone: current.timezone });
    setStatus(
      t("setting.status.timezone_set", {
        tz:
          current.timezone === "auto"
            ? t("setting.status.timezone_auto")
            : current.timezone,
      }),
      "success"
    );
  }

  return {
    onLanguageChange,
    onPageSizeChange,
    onSortOrderChange,
    onAutoDraftToggle,
    onConfirmDeleteToggle,
    onShortcutsToggle,
    onTimezoneChange,
  };
}

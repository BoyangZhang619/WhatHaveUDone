/**
 * 外观设置相关操作
 */
import { useI18n } from "vue-i18n";
import { saveSettings } from "./useSettingsStorage";
import type { useSettingState } from "./useSettingState";

type SettingState = ReturnType<typeof useSettingState>;

export function useStyleSettings(
  current: SettingState["current"],
  setStatus: SettingState["setStatus"]
) {
  const { t } = useI18n();

  function onThemeToggle() {
    current.theme = current.theme === "light" ? "dark" : "light";
    localStorage.setItem("whatIveDone_theme", current.theme);
    document.documentElement.setAttribute("data-theme", current.theme);
    setStatus(
      current.theme === "dark"
        ? t("setting.status.theme_dark")
        : t("setting.status.theme_light"),
      "success"
    );
  }

  function onFontSizeChange() {
    saveSettings({ fontSize: current.fontSize });
    document.documentElement.style.setProperty(
      "--font-base",
      current.fontSize + "px"
    );
    setStatus(
      t("setting.status.font_size_set", { n: current.fontSize }),
      "success"
    );
  }

  function onCardLayoutChange() {
    saveSettings({ cardLayout: current.cardLayout });
    const labels: Record<string, string> = {
      grid: t("setting.style.card_layout.grid"),
      list: t("setting.style.card_layout.list"),
      compact: t("setting.style.card_layout.compact"),
    };
    setStatus(
      t("setting.status.card_layout_set", {
        layout: labels[current.cardLayout] || current.cardLayout,
      }),
      "success"
    );
  }

  function onAnimationToggle() {
    current.animation = !current.animation;
    saveSettings({ animation: current.animation });
    if (current.animation) {
      document.documentElement.removeAttribute("data-no-animation");
    } else {
      document.documentElement.setAttribute("data-no-animation", "");
    }
    setStatus(
      current.animation
        ? t("setting.status.animation_on")
        : t("setting.status.animation_off"),
      "success"
    );
  }

  function onBorderRadiusChange() {
    const radiusMap: Record<string, string> = {
      none: "0px",
      small: "6px",
      medium: "10px",
      large: "14px",
    };
    saveSettings({ borderRadius: current.borderRadius });
    document.documentElement.style.setProperty(
      "--radius",
      radiusMap[current.borderRadius] || "14px"
    );
    setStatus(t("setting.status.border_radius_updated"), "success");
  }

  function onPreviewLinesChange() {
    saveSettings({ previewLines: current.previewLines });
    document.documentElement.style.setProperty(
      "--preview-lines",
      current.previewLines === 0 ? "9999" : String(current.previewLines)
    );
    setStatus(
      t("setting.status.preview_lines_set", {
        n:
          current.previewLines === 0
            ? t("setting.status.preview_lines_all")
            : current.previewLines,
      }),
      "success"
    );
  }

  return {
    onThemeToggle,
    onFontSizeChange,
    onCardLayoutChange,
    onAnimationToggle,
    onBorderRadiusChange,
    onPreviewLinesChange,
  };
}

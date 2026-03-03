/**
 * 设置页面的响应式状态 & 状态提示
 */
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { load } from "./useSettingsStorage";
import type { SupportedLocale } from "@/i18n";
import { SUPPORTED_LOCALES } from "@/i18n";

export function useSettingState() {
  const { locale } = useI18n();

  // ============ 折叠状态 ============
  const displayState = ref<
    "general" | "style" | "account" | "notification" | "about" | ""
  >("");

  // ============ 当前设置值（全部从 localStorage 初始化） ============
  const current = reactive({
    // 通用
    language: locale.value as SupportedLocale,
    pageSize: load<number>("pageSize", 10),
    sortOrder: load<string>("sortOrder", "newest"),
    autoDraft: load<boolean>("autoDraft", true),
    draftInterval: load<number>("draftInterval", 30),
    confirmDelete: load<boolean>("confirmDelete", true),
    shortcuts: load<boolean>("shortcuts", true),
    timezone: load<string>("timezone", "-"),
    // 外观
    theme: (localStorage.getItem("whatIveDone_theme") || "light") as
      | "light"
      | "dark",
    fontSize: load<number>("fontSize", 14),
    cardLayout: load<string>("cardLayout", "grid"),
    animation: load<boolean>("animation", true),
    borderRadius: load<string>("borderRadius", "large"),
    previewLines: load<number>("previewLines", 3),
    // 通知
    dailyReminder: load<boolean>("dailyReminder", false),
    reminderTime: load<string>("reminderTime", "21:00"),
    streakReminder: load<boolean>("streakReminder", false),
    weeklyReport: load<string>("weeklyReport", "off"),
  });

  // ============ 语言选项 ============
  const languageOptions = SUPPORTED_LOCALES;

  // ============ 状态提示 ============
  const statusMsg = ref("");
  const statusKind = ref<"muted" | "success" | "error">("muted");

  function setStatus(
    msg: string,
    kind: "muted" | "success" | "error" = "muted"
  ) {
    statusMsg.value = msg;
    statusKind.value = kind;
    setTimeout(() => {
      if (statusMsg.value === msg) statusMsg.value = "";
    }, 5000);
  }

  return {
    displayState,
    current,
    languageOptions,
    statusMsg,
    statusKind,
    setStatus,
  };
}

/**
 * 设置页面的响应式状态 & 状态提示
 * 通过 provide/inject 在 setting.vue 及其所有子组件间共享同一份实例
 */
import { inject, provide, reactive, ref, type InjectionKey } from "vue";
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
    pageSize: load<number>("pageSize", 5),
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

/** provide/inject 共享 key */
export type SettingStateReturn = ReturnType<typeof useSettingState>;
const SETTING_STATE_KEY: InjectionKey<SettingStateReturn> = Symbol("SettingState");

/**
 * 在 setting.vue（根组件）中调用：创建状态并 provide 给所有子组件
 */
export function provideSettingState() {
  const state = useSettingState();
  provide(SETTING_STATE_KEY, state);
  return state;
}

/**
 * 在子组件（general.vue、account.vue 等）中调用：inject 父级 provide 的同一份状态
 */
export function injectSettingState(): SettingStateReturn {
  const state = inject(SETTING_STATE_KEY);
  if (!state) {
    throw new Error("injectSettingState() 必须在 provideSettingState() 的子组件树中调用");
  }
  return state;
}

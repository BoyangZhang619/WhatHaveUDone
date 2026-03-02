<template>
  <div class="setting-page">
    <!-- Header -->
    <header class="setting-header">
      <div class="setting-header-left">
      </div>
      <h1 class="setting-title">{{ t('setting.header.title') }}</h1>
      <div class="setting-header-right">
        <button class="btn ghost" @click="$emit('close')">{{ t('setting.header.back') }}</button>
      </div>
    </header>
    <div class="setting-header-desc">{{ t('setting.header.desc') }}</div>

    <main class="setting-body">
      <!-- ===================== 通用设置 ===================== -->
      <section class="setting-group">
        <div class="group-toggle" @click="displayState = displayState === 'general' ? '' : 'general'">
          <span class="group-label">{{ t('setting.group.general') }}</span>
          <span class="group-arrow" :class="{ open: displayState === 'general' }"><strong>▸</strong></span>
        </div>

        <transition name="slide">
          <div v-if="displayState === 'general'" class="group-content">
            <!-- 语言 -->
            <div class="setting-item">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.general.language.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.general.language.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <select v-model="current.language" class="setting-select" @change="onLanguageChange">
                  <option v-for="(label, key) in languageOptions" :key="key" :value="key">
                    {{ label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- 每页默认条数 -->
            <div class="setting-item">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.general.page_size.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.general.page_size.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <select v-model.number="current.pageSize" class="setting-select" @change="onPageSizeChange">
                  <option :value="1">1</option>
                  <option :value="3">3</option>
                  <option :value="5">5</option>
                  <option :value="10">10</option>
                  <option :value="15">15</option>
                  <option :value="20">20</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                </select>
              </div>
            </div>

            <!-- 默认排序 -->
            <div class="setting-item">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.general.sort_order.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.general.sort_order.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <select v-model="current.sortOrder" class="setting-select" @change="onSortOrderChange">
                  <option value="updated">{{ t('setting.general.sort_order.pin') }}</option>
                  <option value="newest">{{ t('setting.general.sort_order.newest') }}</option>
                  <option value="oldest">{{ t('setting.general.sort_order.oldest') }}</option>
                  <option value="duration">{{ t('setting.general.sort_order.duration') }}</option>
                </select>
              </div>
            </div>

            <!-- 草稿自动保存 -->
            <div class="setting-item">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.general.auto_draft.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.general.auto_draft.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <button class="switch-track" :class="{ active: current.autoDraft }" role="switch"
                  :aria-checked="current.autoDraft" @click="onAutoDraftToggle">
                  <span class="switch-thumb"></span>
                </button>
              </div>
            </div>

            <!-- 确认删除 -->
            <div class="setting-item">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.general.confirm_delete.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.general.confirm_delete.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <button class="switch-track" :class="{ active: current.confirmDelete }" role="switch"
                  :aria-checked="current.confirmDelete" @click="onConfirmDeleteToggle">
                  <span class="switch-thumb"></span>
                </button>
              </div>
            </div>

            <!-- 快捷键 -->
            <div class="setting-item">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.general.shortcuts.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.general.shortcuts.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <button class="switch-track" :class="{ active: current.shortcuts }" role="switch"
                  :aria-checked="current.shortcuts" @click="onShortcutsToggle">
                  <span class="switch-thumb"></span>
                </button>
              </div>
            </div>

            <!-- 时区 -->
            <div class="setting-item locked">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.general.timezone.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.general.timezone.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <select v-model="current.timezone" class="setting-select" @change="onTimezoneChange">
                  <option value="-">-</option>
                  <option value="auto">{{ t('setting.general.timezone.auto') }}</option>
                  <option value="Asia/Shanghai">{{ t('setting.general.timezone.asia_shanghai') }}</option>
                  <option value="Asia/Tokyo">{{ t('setting.general.timezone.asia_tokyo') }}</option>
                  <option value="America/New_York">{{ t('setting.general.timezone.america_new_york') }}</option>
                  <option value="America/Los_Angeles">{{ t('setting.general.timezone.america_los_angeles') }}</option>
                  <option value="Europe/London">{{ t('setting.general.timezone.europe_london') }}</option>
                  <option value="Europe/Berlin">{{ t('setting.general.timezone.europe_berlin') }}</option>
                </select>
              </div>
            </div>
          </div>
        </transition>
      </section>

      <!-- ===================== 外观设置 ===================== -->
      <section class="setting-group">
        <div class="group-toggle" @click="displayState = displayState === 'style' ? '' : 'style'">
          <span class="group-label">{{ t('setting.group.style') }}</span>
          <span class="group-arrow" :class="{ open: displayState === 'style' }"><strong>▸</strong></span>
        </div>

        <transition name="slide">
          <div v-if="displayState === 'style'" class="group-content">
            <!-- 主题切换 -->
            <div class="setting-item">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.style.theme.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.style.theme.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <button class="switch-track" :class="{ active: current.theme === 'dark' }" role="switch"
                  :aria-checked="current.theme === 'dark'" @click="onThemeToggle">
                  <span class="switch-thumb"></span>
                  <span class="switch-label">{{ current.theme === 'dark' ? t('setting.style.theme.dark') :
                    t('setting.style.theme.light') }}</span>
                </button>
              </div>
            </div>

            <!-- 字体大小 -->
            <div class="setting-item">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.style.font_size.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.style.font_size.desc', { n: current.fontSize }) }}
                </div>
              </div>
              <div class="setting-item-ctrl">
                <input type="range" class="setting-range" v-model.number="current.fontSize" min="12" max="20" step="1"
                  @change="onFontSizeChange" />
              </div>
            </div>

            <!-- 卡片布局 -->
            <div class="setting-item locked">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.style.card_layout.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.style.card_layout.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <select v-model="current.cardLayout" class="setting-select" @change="onCardLayoutChange">
                  <option value="grid">{{ t('setting.style.card_layout.grid') }}</option>
                  <option value="list">{{ t('setting.style.card_layout.list') }}</option>
                  <option value="compact">{{ t('setting.style.card_layout.compact') }}</option>
                </select>
              </div>
            </div>

            <!-- 动画效果 -->
            <div class="setting-item">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.style.animation.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.style.animation.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <button class="switch-track" :class="{ active: current.animation }" role="switch"
                  :aria-checked="current.animation" @click="onAnimationToggle">
                  <span class="switch-thumb"></span>
                </button>
              </div>
            </div>

            <!-- 圆角大小 -->
            <div class="setting-item">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.style.border_radius.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.style.border_radius.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <select v-model="current.borderRadius" class="setting-select" @change="onBorderRadiusChange">
                  <option value="none">{{ t('setting.style.border_radius.none') }}</option>
                  <option value="small">{{ t('setting.style.border_radius.small') }}</option>
                  <option value="medium">{{ t('setting.style.border_radius.medium') }}</option>
                  <option value="large">{{ t('setting.style.border_radius.large') }}</option>
                </select>
              </div>
            </div>

            <!-- 内容预览行数 -->
            <div class="setting-item">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.style.preview_lines.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.style.preview_lines.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <select v-model.number="current.previewLines" class="setting-select" @change="onPreviewLinesChange">
                  <option :value="2">{{ t('setting.style.preview_lines.lines_2') }}</option>
                  <option :value="3">{{ t('setting.style.preview_lines.lines_3') }}</option>
                  <option :value="5">{{ t('setting.style.preview_lines.lines_5') }}</option>
                  <option :value="8">{{ t('setting.style.preview_lines.lines_8') }}</option>
                  <option :value="0">{{ t('setting.style.preview_lines.lines_all') }}</option>
                </select>
              </div>
            </div>
          </div>
        </transition>
      </section>

      <!-- ===================== 账户设置 ===================== -->
      <section class="setting-group">
        <div class="group-toggle" @click="displayState = displayState === 'account' ? '' : 'account'">
          <span class="group-label">{{ t('setting.group.account') }}</span>
          <span class="group-arrow" :class="{ open: displayState === 'account' }"><strong>▸</strong></span>
        </div>

        <transition name="slide">
          <div v-if="displayState === 'account'" class="group-content">
            <!-- 用户名 / 昵称 -->
            <div class="setting-item locked">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.account.nickname.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.account.nickname.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <button class="btn secondary-sm" @click="onChangeNickname">{{ t('setting.account.nickname.btn')
                }}</button>
              </div>
            </div>

            <!-- 修改密码 -->
            <div class="setting-item locked">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.account.password.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.account.password.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <button class="btn secondary-sm" @click="onChangePassword">{{ t('setting.account.password.btn')
                }}</button>
              </div>
            </div>

            <!-- 修改邮箱 -->
            <div class="setting-item locked">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.account.email.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.account.email.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <button class="btn secondary-sm" @click="onChangeEmail">{{ t('setting.account.email.btn') }}</button>
              </div>
            </div>

            <div class="setting-divider"></div>

            <!-- 导出数据 -->
            <div class="setting-item">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.account.export.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.account.export.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <button class="btn secondary-sm" @click="onExportData">{{ t('setting.account.export.btn') }}</button>
              </div>
            </div>

            <!-- 导入数据 -->
            <div class="setting-item locked">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.account.import.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.account.import.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <button class="btn secondary-sm" @click="onImportData">{{ t('setting.account.import.btn') }}</button>
              </div>
            </div>

            <div class="setting-divider"></div>

            <!-- 登录会话 -->
            <div class="setting-item locked">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.account.sessions.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.account.sessions.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <button class="btn secondary-sm" @click="onManageSessions">{{ t('setting.account.sessions.btn')
                }}</button>
              </div>
            </div>

            <div class="setting-divider"></div>

            <!-- 清空数据 -->
            <div class="setting-item">
              <div class="setting-item-info">
                <div class="setting-item-title danger-text">{{ t('setting.account.clear_data.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.account.clear_data.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <button class="btn danger-sm" @click="onDeleteAllData">{{ t('setting.account.clear_data.btn')
                }}</button>
              </div>
            </div>

            <!-- 注销账户 -->
            <div class="setting-item locked">
              <div class="setting-item-info">
                <div class="setting-item-title danger-text">{{ t('setting.account.delete_account.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.account.delete_account.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <button class="btn danger-sm" @click="onDeleteAccount">{{ t('setting.account.delete_account.btn')
                }}</button>
              </div>
            </div>
          </div>
        </transition>
      </section>

      <!-- ===================== 通知与提醒 ===================== -->
      <section class="setting-group">
        <div class="group-toggle" @click="displayState = displayState === 'notification' ? '' : 'notification'">
          <span class="group-label">{{ t('setting.group.notification') }}</span>
          <span class="group-arrow" :class="{ open: displayState === 'notification' }"><strong>▸</strong></span>
        </div>

        <transition name="slide">
          <div v-if="displayState === 'notification'" class="group-content">
            <!-- 每日学习提醒 -->
            <div class="setting-item locked">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.notification.daily_reminder.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.notification.daily_reminder.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <button class="switch-track" :class="{ active: current.dailyReminder }" role="switch"
                  :aria-checked="current.dailyReminder" @click="onDailyReminderToggle">
                  <span class="switch-thumb"></span>
                </button>
              </div>
            </div>

            <!-- 提醒时间 -->
            <div class="setting-item locked" v-if="current.dailyReminder">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.notification.reminder_time.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.notification.reminder_time.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <input type="time" class="setting-time" v-model="current.reminderTime" @change="onReminderTimeChange" />
              </div>
            </div>

            <!-- 连续打卡提醒 -->
            <div class="setting-item locked">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.notification.streak_reminder.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.notification.streak_reminder.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <button class="switch-track" :class="{ active: current.streakReminder }" role="switch"
                  :aria-checked="current.streakReminder" @click="onStreakReminderToggle">
                  <span class="switch-thumb"></span>
                </button>
              </div>
            </div>

            <!-- 周报摘要 -->
            <div class="setting-item locked">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.notification.weekly_report.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.notification.weekly_report.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <select v-model="current.weeklyReport" class="setting-select" @change="onWeeklyReportChange">
                  <option value="off">{{ t('setting.notification.weekly_report.off') }}</option>
                  <option value="popup">{{ t('setting.notification.weekly_report.popup') }}</option>
                  <option value="email">{{ t('setting.notification.weekly_report.email') }}</option>
                </select>
              </div>
            </div>
          </div>
        </transition>
      </section>

      <!-- ===================== 关于 ===================== -->
      <section class="setting-group">
        <div class="group-toggle" @click="displayState = displayState === 'about' ? '' : 'about'">
          <span class="group-label">{{ t('setting.group.about') }}</span>
          <span class="group-arrow" :class="{ open: displayState === 'about' }"><strong>▸</strong></span>
        </div>

        <transition name="slide">
          <div v-if="displayState === 'about'" class="group-content">
            <!-- 版本 -->
            <div class="setting-item">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.about.version.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.about.version.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <span class="setting-badge">v1.1.0</span>
              </div>
            </div>

            <!-- 检查更新 -->
            <div class="setting-item">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.about.check_update.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.about.check_update.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <button class="btn secondary-sm" @click="onCheckUpdate">{{ t('setting.about.check_update.btn')
                }}</button>
              </div>
            </div>

            <!-- 更新日志 -->
            <div class="setting-item">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.about.changelog.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.about.changelog.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <button class="btn secondary-sm" @click="onChangelog">{{ t('setting.about.changelog.btn') }}</button>
              </div>
            </div>

            <!-- 反馈 -->
            <div class="setting-item">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.about.feedback.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.about.feedback.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <a href="mailto:boyangzhang246@gmail.com" class="btn secondary-sm" style="text-decoration:none;">{{
                  t('setting.about.feedback.btn') }}</a>
              </div>
            </div>

            <!-- GitHub -->
            <div class="setting-item">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.about.source.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.about.source.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <a href="https://github.com/BoyangZhang619/whatIveDone" target="_blank" rel="noopener"
                  class="btn secondary-sm" style="text-decoration:none;">{{ t('setting.about.source.btn') }}</a>
              </div>
            </div>

            <!-- 重置所有设置 -->
            <div class="setting-divider"></div>
            <div class="setting-item">
              <div class="setting-item-info">
                <div class="setting-item-title">{{ t('setting.about.reset.title') }}</div>
                <div class="setting-item-desc muted">{{ t('setting.about.reset.desc') }}</div>
              </div>
              <div class="setting-item-ctrl">
                <button class="btn danger-sm" @click="onResetAllSettings">{{ t('setting.about.reset.btn') }}</button>
              </div>
            </div>
          </div>
        </transition>
      </section>

      <!-- Status -->
      <transition name="fade">
        <div v-if="statusMsg" class="setting-status" :class="statusKind">
          {{ statusMsg }}
        </div>
      </transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { reactive, ref } from "vue";
import { setLocale, SUPPORTED_LOCALES, type SupportedLocale } from "@/i18n";

const { t, locale } = useI18n();

const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? "";

defineEmits<{
  (e: "close"): void;
}>();

async function api(path: string, options: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: any;
  body?: string;
} = { method: "GET" }) {
  const headers = options.headers ? { ...options.headers } : {};
  if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(API_BASE + path, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch (err: any) {
    throw { kind: "network", message: err?.message || String(err), err };
  }

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw { kind: "http", status: res.status, statusText: res.statusText, data };
  }
  return data;
}

// ============ 本地持久化工具 ============
const STORAGE_KEY = "whatIveDone_settings";

function loadSettings(): Record<string, any> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch { return {}; }
}
function saveSettings(patch: Record<string, any>) {
  const all = { ...loadSettings(), ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
function load<T>(key: string, fallback: T): T {
  const v = loadSettings()[key];
  return v !== undefined ? v as T : fallback;
}

// ============ 折叠状态 ============
const displayState = ref("" as "general" | "style" | "account" | "notification" | "about" | "");

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
  theme: (localStorage.getItem("whatIveDone_theme") || "light") as "light" | "dark",
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

function setStatus(msg: string, kind: "muted" | "success" | "error" = "muted") {
  statusMsg.value = msg;
  statusKind.value = kind;
  // 5 秒后自动清除
  setTimeout(() => { if (statusMsg.value === msg) statusMsg.value = ""; }, 5000);
}

// ========================================================
//  通用设置
// ========================================================

// }
function onLanguageChange() {
  setLocale(current.language);
  setStatus(t('setting.status.lang_switched', { lang: SUPPORTED_LOCALES[current.language] }), "success");
  // TODO: 如果需要同步到后端，在这里调用 API
}

/** 每页条数 */
function onPageSizeChange() {
  saveSettings({ pageSize: current.pageSize });
  setStatus(t('setting.status.page_size_set', { n: current.pageSize }), "success");
  // TODO: 通知列表组件刷新
}

/** 排序方式 */
function onSortOrderChange() {
  saveSettings({ sortOrder: current.sortOrder });
  setStatus(t('setting.status.sort_updated'), "success");
  // TODO: 通知列表组件按新排序刷新
}

/** 草稿自动保存 */
function onAutoDraftToggle() {
  current.autoDraft = !current.autoDraft;
  saveSettings({ autoDraft: current.autoDraft });
  setStatus(current.autoDraft ? t('setting.status.auto_draft_on') : t('setting.status.auto_draft_off'), "success");
}

/** 删除前确认 */
function onConfirmDeleteToggle() {
  if (!current.confirmDelete || confirm(t("setting.confirm_delete"))) {
    current.confirmDelete = !current.confirmDelete;
    saveSettings({ confirmDelete: current.confirmDelete });
    setStatus(current.confirmDelete ? t('setting.status.confirm_delete_on') : t('setting.status.confirm_delete_off'), "success");
  }
}

/** 快捷键 */
function onShortcutsToggle() {
  current.shortcuts = !current.shortcuts;
  saveSettings({ shortcuts: current.shortcuts });
  setStatus(current.shortcuts ? t('setting.status.shortcuts_on') : t('setting.status.shortcuts_off'), "success");
  // TODO: 注册 / 注销全局键盘监听
}

/** 时区 */
function onTimezoneChange() {
  saveSettings({ timezone: current.timezone });
  setStatus(t('setting.status.timezone_set', { tz: current.timezone === "auto" ? t('setting.status.timezone_auto') : current.timezone }), "success");
  // TODO: 更新所有时间展示
}

// ========================================================
//  外观设置
// ========================================================

/** 主题切换 */
function onThemeToggle() {
  current.theme = current.theme === "light" ? "dark" : "light";
  localStorage.setItem("whatIveDone_theme", current.theme);
  document.documentElement.setAttribute("data-theme", current.theme);
  setStatus(current.theme === "dark" ? t('setting.status.theme_dark') : t('setting.status.theme_light'), "success");
}

/** 字体大小 */
function onFontSizeChange() {
  saveSettings({ fontSize: current.fontSize });
  document.documentElement.style.setProperty('--font-base', current.fontSize + 'px');
  setStatus(t('setting.status.font_size_set', { n: current.fontSize }), "success");
}

/** 卡片布局 */
function onCardLayoutChange() {
  saveSettings({ cardLayout: current.cardLayout });
  const labels: Record<string, string> = { grid: t('setting.style.card_layout.grid'), list: t('setting.style.card_layout.list'), compact: t('setting.style.card_layout.compact') };
  setStatus(t('setting.status.card_layout_set', { layout: labels[current.cardLayout] || current.cardLayout }), "success");
  // TODO: 通知列表组件切换布局
}

/** 界面动画 */
function onAnimationToggle() {
  current.animation = !current.animation;
  saveSettings({ animation: current.animation });
  if (current.animation) {
    document.documentElement.removeAttribute('data-no-animation');
  } else {
    document.documentElement.setAttribute('data-no-animation', '');
  }
  setStatus(current.animation ? t('setting.status.animation_on') : t('setting.status.animation_off'), "success");
}

/** 圆角风格 */
function onBorderRadiusChange() {
  const radiusMap: Record<string, string> = { none: '0px', small: '6px', medium: '10px', large: '14px' };
  saveSettings({ borderRadius: current.borderRadius });
  document.documentElement.style.setProperty('--radius', radiusMap[current.borderRadius] || '14px');
  setStatus(t('setting.status.border_radius_updated'), "success");
}

/** 卡片预览行数 */
function onPreviewLinesChange() {
  saveSettings({ previewLines: current.previewLines });
  document.documentElement.style.setProperty('--preview-lines', current.previewLines === 0 ? '9999' : String(current.previewLines));
  setStatus(t('setting.status.preview_lines_set', { n: current.previewLines === 0 ? t('setting.status.preview_lines_all') : current.previewLines }), "success");
}

// ========================================================
//  账户设置
// ========================================================

/** 修改昵称 */
function onChangeNickname() {
  // TODO: 弹出修改昵称对话框 / 调用后端 API
  setStatus(t('setting.status.nickname_todo'), "muted");
}

/** 修改密码 */
function onChangePassword() {
  // TODO: 弹出修改密码对话框 / 调用后端 API
  setStatus(t('setting.status.password_todo'), "muted");
}

/** 修改邮箱 */
function onChangeEmail() {
  // TODO: 弹出修改邮箱对话框 / 调用后端 API
  setStatus(t('setting.status.email_todo'), "muted");
}

/** 导出数据 */
async function onExportData() {
  // 简单前端限流：导出后 1 小时内不可再次导出
  const LOCK_KEY = "whatIveDone_export_lock_v1";

  async function sha256Base64(msg: string) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest("SHA-256", enc.encode(msg));
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  // 检查是否存在有效锁（并验证签名以尽可能防篡改）
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (raw) {
      try {
        const obj = JSON.parse(raw);
        if (obj?.ts && obj?.sig) {
          const expected = await sha256Base64(String(obj.ts) + "|" + location.origin + "|" + navigator.userAgent);
          if (expected === obj.sig) {
            const now = Date.now();
            const elapsed = now - Number(obj.ts);
            const limit = 60 * 60 * 1000; // 1 小时
            if (elapsed < limit) {
              const remainingSec = Math.ceil((limit - elapsed) / 1000);
              // 显示剩余时间，防止重复下载
              setStatus(t('setting.account.export.locked', { s: remainingSec }), "error");
              return;
            }
          } else {
            // 签名不匹配，疑似被篡改，清除锁
            localStorage.removeItem(LOCK_KEY);
          }
        } else {
          localStorage.removeItem(LOCK_KEY);
        }
      } catch {
        localStorage.removeItem(LOCK_KEY);
      }
    }
  } catch (e) {
    // 若 localStorage 不可用则继续（无法可靠限制）
    console.warn("Export lock check failed:", e);
  }

  // 进行导出
  try {
    const data = await api(`/api/posts?all="true"`);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `whatIveDone_export_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();

    // 延迟清理，以确保下载已触发
    setTimeout(() => {
      try { URL.revokeObjectURL(url); } catch (e) { /* noop */ }
      try { document.body.removeChild(a); } catch (e) { /* noop */ }
    }, 1500);

    // 成功后设置锁并签名（防止用户直接修改时间戳绕过）
    try {
      const ts = Date.now();
      const sig = await sha256Base64(String(ts) + "|" + location.origin + "|" + navigator.userAgent);
      localStorage.setItem(LOCK_KEY, JSON.stringify({ ts, sig }));
    } catch (e) {
      console.warn("Failed to persist export lock:", e);
    }
    setStatus(t('setting.status.export_success', { timestamp: dateStr }), "success");
  } catch (err) {
    console.error("Export failed:", err);
    setStatus(t('setting.status.export_failed', { error: (err as Error).message }), "error");
    return;
  }
}

/** 导入数据 */
function onImportData() {
  // TODO: 打开文件选择器 → 读取 JSON → 调用后端 API 批量导入
  setStatus(t('setting.status.import_todo'), "muted");
}

/** 管理会话 */
function onManageSessions() {
  // TODO: 调用后端 API 获取活跃会话列表 → 弹出管理面板
  setStatus(t('setting.status.sessions_todo'), "muted");
}

/** 清空所有数据 */
async function onDeleteAllData() {
  // TODO: 二次确认 + 调用后端 API 删除所有记录
  if (current.confirmDelete && prompt(t('setting.status.clear_data_confirm')) !== t('setting.status.clear_data_confirm_text')) {
    alert(t('setting.status.clear_data_cancelled'));
    return;
  }
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("whatIveDone_theme");
    localStorage.removeItem("whatIveDone_locale");
    await api("/api/delete", { method: "DELETE" });
  } catch (e) {
    console.warn("Failed to clear local settings:", e);
  }
  setStatus(t('setting.status.clear_data_success'), "muted");
}

/** 注销账户 */
function onDeleteAccount() {
  // TODO: 二次确认 + 调用后端 API 注销账户
  setStatus(t('setting.status.delete_account_todo'), "muted");
}

// ========================================================
//  通知与提醒
// ========================================================

/** 每日学习提醒 */
function onDailyReminderToggle() {
  current.dailyReminder = !current.dailyReminder;
  saveSettings({ dailyReminder: current.dailyReminder });
  setStatus(current.dailyReminder ? t('setting.status.daily_reminder_on') : t('setting.status.daily_reminder_off'), "success");
  // TODO: 注册 / 取消 Notification API 或后端推送
}

/** 提醒时间 */
function onReminderTimeChange() {
  saveSettings({ reminderTime: current.reminderTime });
  setStatus(t('setting.status.reminder_time_set', { time: current.reminderTime }), "success");
  // TODO: 更新推送计划
}

/** 连续打卡提醒 */
function onStreakReminderToggle() {
  current.streakReminder = !current.streakReminder;
  saveSettings({ streakReminder: current.streakReminder });
  setStatus(current.streakReminder ? t('setting.status.streak_reminder_on') : t('setting.status.streak_reminder_off'), "success");
  // TODO: 注册 / 取消连续性检查逻辑
}

/** 每周学习周报 */
function onWeeklyReportChange() {
  saveSettings({ weeklyReport: current.weeklyReport });
  const labels: Record<string, string> = { off: t('setting.notification.weekly_report.off'), popup: t('setting.notification.weekly_report.popup'), email: t('setting.notification.weekly_report.email') };
  setStatus(t('setting.status.weekly_report_set', { mode: labels[current.weeklyReport] || current.weeklyReport }), "success");
  // TODO: 配置后端周报任务
}

// ========================================================
//  关于
// ========================================================

/** 检查更新 */
function onCheckUpdate() {
  // TODO: 请求远程版本号并与本地比较
  setStatus(t('setting.status.check_update_latest'), "success");
}

/** 更新日志 */
function onChangelog() {
  // TODO: 弹出更新日志弹窗或跳转到 GitHub releases
  window.open("https://github.com/BoyangZhang619/whatIveDone/releases", "_blank");
}

/** 重置所有设置 */
function onResetAllSettings() {
  if (!confirm(t('setting.about.reset.confirm') || 'Reset all settings to default?')) return;

  // 清除存储
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("whatIveDone_theme");
  localStorage.removeItem("whatIveDone_locale");

  // 重置 current 到默认值
  current.language = 'zh-CN' as SupportedLocale;
  current.pageSize = 10;
  current.sortOrder = 'newest';
  current.autoDraft = true;
  current.draftInterval = 30;
  current.confirmDelete = true;
  current.shortcuts = true;
  current.timezone = '-';

  current.theme = 'light';
  current.fontSize = 14;
  current.cardLayout = 'grid';
  current.animation = true;
  current.borderRadius = 'large';
  current.previewLines = 3;

  current.dailyReminder = false;
  current.reminderTime = '21:00';
  current.streakReminder = false;
  current.weeklyReport = 'off';

  // 恢复 DOM 状态
  document.documentElement.setAttribute('data-theme', 'light');
  document.documentElement.style.removeProperty('--font-base');
  document.documentElement.style.removeProperty('--radius');
  document.documentElement.style.removeProperty('--preview-lines');
  document.documentElement.removeAttribute('data-no-animation');
  setLocale('zh-CN' as SupportedLocale);

  setStatus(t('setting.status.reset_done'), "success");
}
</script>

<style src="@/css/setting.css"></style>
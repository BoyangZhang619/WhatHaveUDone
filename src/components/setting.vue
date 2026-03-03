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
/**
 * 设置页面 — 逻辑已抽离到 composables，这里只做组装
 */
import { useI18n } from "vue-i18n";
import { useSettingState } from "@/composables/useSettingState";
import { useGeneralSettings } from "@/composables/useGeneralSettings";
import { useStyleSettings } from "@/composables/useStyleSettings";
import { useAccountSettings } from "@/composables/useAccountSettings";
import { useNotificationSettings } from "@/composables/useNotificationSettings";
import { useAboutSettings } from "@/composables/useAboutSettings";

const { t } = useI18n();

defineEmits<{
  (e: "close"): void;
}>();

const {
  displayState, current, languageOptions,
  statusMsg, statusKind, setStatus,
} = useSettingState();

const {
  onLanguageChange, onPageSizeChange, onSortOrderChange,
  onAutoDraftToggle, onConfirmDeleteToggle, onShortcutsToggle, onTimezoneChange,
} = useGeneralSettings(current, setStatus);

const {
  onThemeToggle, onFontSizeChange, onCardLayoutChange,
  onAnimationToggle, onBorderRadiusChange, onPreviewLinesChange,
} = useStyleSettings(current, setStatus);

const {
  onChangeNickname, onChangePassword, onChangeEmail,
  onExportData, onImportData, onManageSessions,
  onDeleteAllData, onDeleteAccount,
} = useAccountSettings(current, setStatus);

const {
  onDailyReminderToggle, onReminderTimeChange,
  onStreakReminderToggle, onWeeklyReportChange,
} = useNotificationSettings(current, setStatus);

const {
  onCheckUpdate, onChangelog, onResetAllSettings,
} = useAboutSettings(current, setStatus);
</script>

<style src="@/css/setting.css"></style>
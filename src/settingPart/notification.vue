<template>
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
                        <input type="time" class="setting-time" v-model="current.reminderTime"
                            @change="onReminderTimeChange" />
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
</template>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { injectSettingState } from "@/composables/useSettingState";
import { useNotificationSettings } from "@/composables/useNotificationSettings";

const { t } = useI18n();

const {
    displayState, current, languageOptions,
    statusMsg, statusKind, setStatus,
} = injectSettingState();

const {
    onDailyReminderToggle, onReminderTimeChange,
    onStreakReminderToggle, onWeeklyReportChange,
} = useNotificationSettings(current, setStatus);
</script>

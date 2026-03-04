<template>
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
                        <button class="btn secondary-sm" @click="onChangelog">{{ t('setting.about.changelog.btn')
                            }}</button>
                    </div>
                </div>

                <!-- 反馈 -->
                <div class="setting-item">
                    <div class="setting-item-info">
                        <div class="setting-item-title">{{ t('setting.about.feedback.title') }}</div>
                        <div class="setting-item-desc muted">{{ t('setting.about.feedback.desc') }}</div>
                    </div>
                    <div class="setting-item-ctrl">
                        <a href="mailto:boyangzhang246@gmail.com" class="btn secondary-sm"
                            style="text-decoration:none;">{{
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
                            class="btn secondary-sm" style="text-decoration:none;">{{ t('setting.about.source.btn')
                            }}</a>
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
                        <button class="btn danger-sm" @click="onResetAllSettings">{{ t('setting.about.reset.btn')
                            }}</button>
                    </div>
                </div>
            </div>
        </transition>
    </section>
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { injectSettingState } from "@/composables/useSettingState";
import { useAboutSettings } from "@/composables/useAboutSettings";

const { t } = useI18n();

const {
  displayState, current, languageOptions,
  statusMsg, statusKind, setStatus,
} = injectSettingState();

const {
  onCheckUpdate, onChangelog, onResetAllSettings,
} = useAboutSettings(current, setStatus);
</script>
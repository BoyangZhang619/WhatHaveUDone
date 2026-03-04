<template>
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
                            <option value="America/New_York">{{ t('setting.general.timezone.america_new_york') }}
                            </option>
                            <option value="America/Los_Angeles">{{ t('setting.general.timezone.america_los_angeles') }}
                            </option>
                            <option value="Europe/London">{{ t('setting.general.timezone.europe_london') }}</option>
                            <option value="Europe/Berlin">{{ t('setting.general.timezone.europe_berlin') }}</option>
                        </select>
                    </div>
                </div>
            </div>
        </transition>
    </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { injectSettingState } from "@/composables/useSettingState";
import { useGeneralSettings } from "@/composables/useGeneralSettings";

const { t } = useI18n();

const {
    displayState, current, languageOptions,
    statusMsg, statusKind, setStatus,
} = injectSettingState();

const {
    onLanguageChange, onPageSizeChange, onSortOrderChange,
    onAutoDraftToggle, onConfirmDeleteToggle, onShortcutsToggle, onTimezoneChange,
} = useGeneralSettings(current, setStatus);
</script>
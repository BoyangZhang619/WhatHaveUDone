<template>
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
                        <div class="setting-item-desc muted">{{ t('setting.style.font_size.desc', {
                            n: current.fontSize
                            }) }}
                        </div>
                    </div>
                    <div class="setting-item-ctrl">
                        <input type="range" class="setting-range" v-model.number="current.fontSize" min="12" max="20"
                            step="1" @change="onFontSizeChange" />
                    </div>
                </div>

                <!-- 卡片布局 -->
                <div class="setting-item">
                    <div class="setting-item-info">
                        <div class="setting-item-title">{{ t('setting.style.card_layout.title') }}</div>
                        <div class="setting-item-desc muted">{{ t('setting.style.card_layout.desc') }}</div>
                    </div>
                    <div class="setting-item-ctrl">
                        <select v-model="current.cardLayout" class="setting-select" @change="onCardLayoutChange">
                            <option value="Grid">{{ t('setting.style.card_layout.grid') }}</option>
                            <option value="List">{{ t('setting.style.card_layout.list') }}</option>
                            <option value="Compact" disabled>{{ t('setting.style.card_layout.compact') }}</option>
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
                        <select v-model.number="current.previewLines" class="setting-select"
                            @change="onPreviewLinesChange">
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
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { injectSettingState } from "@/composables/useSettingState";
import { useStyleSettings } from "@/composables/useStyleSettings";

const { t } = useI18n();

const {
    displayState, current, languageOptions,
    statusMsg, statusKind, setStatus,
} = injectSettingState();

const {
    onThemeToggle, onFontSizeChange, onCardLayoutChange,
    onAnimationToggle, onBorderRadiusChange, onPreviewLinesChange,
} = useStyleSettings(current, setStatus);
</script>
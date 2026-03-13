<template>
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
                        <button class="btn secondary-sm" @click="onChangeEmail">{{ t('setting.account.email.btn')
                            }}</button>
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
                        <button class="btn secondary-sm" @click="onExportData">{{ t('setting.account.export.btn')
                            }}</button>
                    </div>
                </div>

                <!-- 导入数据 -->
                <div class="setting-item locked">
                    <div class="setting-item-info">
                        <div class="setting-item-title">{{ t('setting.account.import.title') }}</div>
                        <div class="setting-item-desc muted">{{ t('setting.account.import.desc') }}</div>
                    </div>
                    <div class="setting-item-ctrl">
                        <button class="btn secondary-sm" @click="onImportData">{{ t('setting.account.import.btn')
                            }}</button>
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
                <div class="setting-item">
                    <div class="setting-item-info">
                        <div class="setting-item-title danger-text">{{ t('setting.account.delete_account.title') }}
                        </div>
                        <div class="setting-item-desc muted">{{ t('setting.account.delete_account.desc') }}</div>
                    </div>
                    <div class="setting-item-ctrl">
                        <button class="btn danger-sm" @click="onDeleteAccount">{{
                            t('setting.account.delete_account.btn')
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
import { useAccountSettings } from "@/composables/useAccountSettings";

const { t } = useI18n();

const {
    displayState, current, languageOptions,
    statusMsg, statusKind, setStatus,
} = injectSettingState();

const {
    onChangeNickname, onChangePassword, onChangeEmail,
    onExportData, onImportData, onManageSessions,
    onDeleteAllData, onDeleteAccount,
} = useAccountSettings(current, setStatus);
</script>

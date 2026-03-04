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
      <!-- 通用设置 -->
      <General />

      <!-- 外观设置 -->
      <Appearance />

      <!-- 账户设置 -->
      <Account 
      @close="$emit('close')"
      @log-out="$emit('log-out')"
      />

      <!-- 通知与提醒 -->
      <Notification />

      <!-- 关于 -->
      <About />

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
import { provideSettingState } from "@/composables/useSettingState";
import General from "@/settingPart/general.vue";
import Appearance from "@/settingPart/appearance.vue";
import Account from "@/settingPart/account.vue";
import Notification from "@/settingPart/notification.vue";
import About from "@/settingPart/about.vue";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "log-out"): void;
}>();

const { t } = useI18n();

const {
  displayState, current, languageOptions,
  statusMsg, statusKind, setStatus,
} = provideSettingState();

</script>

<style src="@/css/setting.css"></style>
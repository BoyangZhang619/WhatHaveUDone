<template>
  <div class="setting-page">
    <!-- Header -->
    <header class="setting-header">
      <div class="setting-header-left">
      </div>
      <h1 class="setting-title">{{ t('setting.header.title') }}</h1>
      <div class="setting-header-right">
        <button class="btn ghost" @click="closeSetting()">{{ t('setting.header.back') }}</button>
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
      @close="closeSetting()"
      @log-out="onLogout"
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
import General from "@/partSetting/general.vue";
import Appearance from "@/partSetting/appearance.vue";
import Account from "@/partSetting/account.vue";
import Notification from "@/partSetting/notification.vue";
import About from "@/partSetting/about.vue";
import { useAuth } from "@/composables/useAuth";
import { useRouter } from "vue-router";

const router = useRouter();
const { onLogout } = useAuth();
const { t } = useI18n();
const {
  statusMsg, statusKind, setStatus,
} = provideSettingState();

const closeSetting = () => {
  router.push('/');
};

</script>

<style src="@/css/setting.css"></style>
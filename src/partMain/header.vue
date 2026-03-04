<template>

    <header class="topbar">
        <div class="brand">
            <div class="brand-dot">
                <span role="img" aria-label="book">📚</span>
            </div>
            <div class="brand-text">
                <div class="brand-title">Study Log</div>
                <div class="brand-sub muted">
                    <span v-if="meLoading">{{ t("main_page.header.user_loading") }}</span>
                    <span v-else-if="meUser">{{ meUser.email }}</span>
                    <span v-else>{{ t("main_page.header.user_load_fail") }}</span>
                </div>
            </div>
        </div>
        <div class="topbar-actions">
            <button class="btn ghost" @click="$emit('settingOpen')">{{ t("main_page.header.settings") }}</button>
            <button class="btn ghost" @click="$emit('log-out')">{{ t("main_page.header.logout") }}</button>
        </div>

    </header>
</template>

<script setup lang="ts">

import { useI18n } from "vue-i18n";
import { useAuth } from "@/composables/useAuth";

const { t } = useI18n();
const emit = defineEmits(["log-out", "settingOpen"]);
const { meUser, meLoading, refreshMe, onOpenSettings, onLogout } = useAuth(emit);
</script>
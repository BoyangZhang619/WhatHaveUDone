<template>
    <section class="create-area">
        <div class="create-card" :class="{ compact: !composerOpen }" role="button" tabindex="0" @click="openComposer"
            @keydown.enter.prevent="openComposer" @keydown.space.prevent="openComposer">
            <div class="create-card-left">
                <div class="create-badge">+</div>
                <div>
                    <div class="create-title">{{ t("main_page.body.create_block.title") }}</div>
                    <div class="muted create-sub">
                        {{ t("main_page.body.create_block.create_sub") }}
                    </div>
                </div>
            </div>
            <div class="create-card-right">
                <span class="pill">{{ t("main_page.body.create_block.pills.a") }}</span>
                <span class="pill">{{ t("main_page.body.create_block.pills.b") }}</span>
                <span class="pill">{{ t("main_page.body.create_block.pills.c") }}</span>
                <span class="pill">{{ t("main_page.body.create_block.pills.d") }}</span>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { injectComposer } from "@/composables/useComposer";

const { t } = useI18n();

const { composerOpen, openComposer } = injectComposer();
</script>
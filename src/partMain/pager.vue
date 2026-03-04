<template>
    <div class="pager" v-if="showPager">
        <button class="btn ghost" :disabled="pager.page <= 1 || listLoading" @click="goPage(pager.page - 1)"
            style="color: var(--text);">
            ‹
        </button>

        <button v-for="it in pageItems" :key="String(it.key)" class="btn"
            :class="{ active: it.type === 'page' && it.value === pager.page }"
            :disabled="it.type !== 'page' || listLoading" @click="it.type === 'page' && goPage(it.value)">
            <span v-if="it.type === 'page'">{{ it.value }}</span>
            <span v-else class="muted">…</span>
        </button>

        <button class="btn ghost" :disabled="!pager.hasNext || listLoading" @click="goPage(pager.page + 1)"
            style="color: var(--text);">
            ›
        </button>

        <div class="pager-right">
            <div class="jump">
                <span class="muted">{{ t("main_page.body.list_area.pagination.jump") }}</span>
                <input v-model="jumpInput" inputmode="numeric" pattern="[0-9]*"
                    :placeholder="t('main_page.body.list_area.pagination.pager')" @keydown.enter.prevent="jumpToPage" />
                <button class="btn secondary" @click="jumpToPage" :disabled="listLoading">{{
                    t("main_page.body.list_area.pagination.go")
                }}
                </button>
            </div>

            <div class="muted pager-note">
                <span v-if="pager.total != null">{{
                    t("main_page.body.list_area.pagination.pages_total", {
                        total: pager.total
                    })
                }}</span>
                <span v-else>{{ t("main_page.body.list_area.pagination.pages_total_unknown") }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { injectPosts } from '@/composables/usePosts';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const { pager, pageItems, listLoading, showPager, jumpInput, goPage, jumpToPage } = injectPosts();
</script>
<template>
    <div v-if="listLoading" class="skeleton-wrap">
        <div class="skeleton" v-for="i in 6" :key="i" />
    </div>

    <div v-else-if="listError" class="errorbox">
        {{ t("main_page.body.list_area.errorbox", { error: listError }) }}
    </div>

    <div v-else-if="!posts.length" class="empty">
        <div class="empty-title">{{ t("main_page.body.list_area.empty.empty_title") }}</div>
        <div class="muted">{{ t("main_page.body.list_area.empty.text") }}</div>
        <button class="btn primary" @click="openComposer">{{
            t("main_page.body.list_area.empty.plus")
        }}
        </button>
    </div>

    <div v-else class="cards" :class="{ 'is-grid': cardLayout === 'Grid', 'is-list': cardLayout === 'List' }">
        <article class="post-card" :class="{ 'is-pinned': !!p.pinToTop }" v-for="p in posts" :key="p.id">
            <header class="post-head" :class="{ 'is-List': cardLayout === 'List' }">
                <div class="post-title">
                    <span class="post-id muted">#{{ p.id }}</span>
                    <span class="post-title-text">{{
                        p.title ||
                        t("main_page.body.list_area.cards.non-title")
                        }}</span>
                    <span v-if="p.pinToTop" class="badge">{{
                        t("main_page.body.list_area.cards.pinToTop")
                        }}</span>
                </div>

                <p class="post-preview" v-if="cardLayout === 'List' && isMobile">
                    {{
                        (p.preview?.slice(0, 30) || p.contentPreview?.slice(0, 30) || p.content?.slice(0, 30) ||
                        t("main_page.body.list_area.cards.non-content")) + "..."
                    }}
                </p>

                <div class="post-actions">
                    <button class="btn ghost" @click="openDetail(p.id)">{{
                        t("main_page.body.list_area.cards.detail")
                        }}
                    </button>
                </div>
            </header>

            <div class="post-meta" v-if="cardLayout === 'Grid'">
                <span v-if="p.happenedAt">{{ formatDate(p.happenedAt) }}</span>

                <span v-if="p.durationMin" class="sep">·</span>
                <span v-if="p.durationMin">{{ p.durationMin }} {{
                    t("main_page.body.list_area.cards.min")
                    }}</span>

                <span v-if="p.focus != null" class="sep">·</span>
                <span v-if="p.focus != null">{{ t("main_page.body.list_area.cards.focus") }} {{
                    p.focus
                    }}</span>

                <span v-if="p.difficulty != null" class="sep">·</span>
                <span v-if="p.difficulty != null">{{ t("main_page.body.list_area.cards.diff") }} {{
                    p.difficulty
                    }}</span>

                <span v-if="p.updated_at" class="sep">·</span>
                <span v-if="p.updated_at">{{ t("main_page.body.list_area.cards.update") }} {{
                    formatDate(p.updated_at)
                    }}</span>
            </div>

            <section class="post-body" v-if="cardLayout === 'Grid'">
                <p class="post-preview">
                    {{
                        p.preview || p.contentPreview || p.content ||
                        t("main_page.body.list_area.cards.non-content")
                    }}
                </p>

                <div v-if="p.goal" class="post-block">
                    <div class="post-block-title muted">{{ t("main_page.body.list_area.cards.goal") }}</div>
                    <div class="post-block-content">{{ p.goal }}</div>
                </div>

                <div v-if="todoList(p).length" class="post-block">
                    <div class="post-block-title muted">
                        {{ t("main_page.body.list_area.cards.todos") }} <span class="muted">({{
                            todoList(p).length
                            }})</span>
                    </div>

                    <ul class="todo-list" style="justify-content: left !important;">
                        <li v-for="(t, i) in todoList(p).slice(0, 1)" :key="i" class="todo-item">
                            <span class="checkbox" aria-hidden="true"></span>
                            <span class="todo-text">{{ t?.text ?? t }}</span>
                        </li>

                        <li v-if="todoList(p).length > 3" class="todo-more muted">
                            +{{ todoList(p).length - 3 }} {{ t("main_page.body.list_area.cards.more") }}
                        </li>
                    </ul>
                </div>
            </section>
            <footer class="post-foot" v-if="cardLayout === 'Grid'">
                <div class="tag-row" v-if="tagList(p).length">
                    <span class="tag" v-for="(t, i) in tagList(p).slice(0, 3)" :key="i">
                        {{ t }}
                    </span>
                    <span v-if="tagList(p).length > 3" class="tag muted">
                        +{{ tagList(p).length - 3 }}
                    </span>
                </div>

                <div class="post-time muted">
                    <span v-if="p.created_at">{{ t("main_page.body.list_area.cards.create") }} {{
                        formatDate(p.created_at)
                        }}</span>
                </div>
            </footer>
        </article>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { formatDate, tagList, todoList } from "@/composables/useHelpers";
import { injectPosts } from "@/composables/usePosts";
import { injectComposer } from "@/composables/useComposer";
import { injectPostDetail } from "@/composables/usePostDetail";

const { t } = useI18n();
const { posts, listLoading, listError, cardLayout } = injectPosts();
const { openComposer } = injectComposer();
const { openDetail } = injectPostDetail();

// evaluate navigator in script scope so template type-checking doesn't try to treat it as a component property
const isMobile = ref(!/Android|iPhone|iPad|Phone/.test(navigator.userAgent));
</script>
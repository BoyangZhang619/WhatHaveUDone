<template>
    <div v-if="detail.open" class="neoOverlay" role="dialog" aria-modal="true" tabindex="-1"
        @click.self="detail.open = false">
        <section class="neoPanel" @click.stop>
            <!-- Topbar -->
            <header class="neoTop">
                <div class="neoTop__left">
                    <div class="neoKicker">
                        <span class="neoKicker__id">{{
                            t("main_page.body.detail.header.id", { id: detail.id })
                        }}</span>
                        <span class="neoKicker__dot">•</span>
                        <span v-if="detailLoading" class="neoKicker__muted">{{
                            t("main_page.body.detail.header.loading")
                        }}</span>
                        <span v-else-if="detailError" class="neoKicker__err">{{ detailError }}</span>
                        <span v-else class="neoKicker__muted">{{ detailSubtitle }}</span>
                    </div>

                    <div class="neoTitleRow">
                        <div class="neoTitle">
                            {{ detail.post?.title || t("main_page.body.detail.header.no_title") }}
                        </div>

                        <div class="neoBadges">
                            <span v-if="detail.post?.pinToTop" class="neoBadge neoBadge--pin">{{
                                t("main_page.body.detail.header.pin")
                            }}</span>
                            <span v-if="detail.post?.goal" class="neoBadge">{{
                                t("main_page.body.detail.header.goal")
                            }}</span>
                        </div>
                    </div>
                </div>

                <div class="neoTop__right">
                    <button class="neoBtn neoBtn--ghost" type="button" @click="detail.open = false">{{
                        t("main_page.body.detail.header.close")
                    }}
                    </button>
                </div>
            </header>

            <!-- Body -->
            <main class="neoBody">
                <!-- Loading -->
                <div v-if="detailLoading" class="neoLoad">
                    <div class="neoLoad__bar" v-for="i in 11" :key="i" />
                </div>

                <!-- Error -->
                <div v-else-if="detailError" class="neoError">
                    <div class="neoError__title">{{ t("main_page.body.detail.body.error") }}</div>
                    <div class="neoError__msg">{{ detailError }}</div>
                </div>

                <!-- Content -->
                <div v-else class="neoWrap">
                    <!-- Hero strip -->
                    <section class="neoHero">
                        <div class="neoHero__left">
                            <div class="neoMetaLine">
                                <span class="neoMeta" v-if="detail.post?.happenedAt || detailDate">
                                    {{ t("main_page.body.detail.body.hero_left.start_at") }}{{
                                        formatDate(detail.post?.happenedAt || detailDate)
                                    }}
                                </span>
                                <span class="neoSep"
                                    v-if="(detail.post?.happenedAt || detailDate) && (detail.post?.durationMin != null)">/</span>
                                <span class="neoMeta" v-if="detail.post?.durationMin != null">
                                    {{ detail.post.durationMin }} {{
                                        t("main_page.body.detail.body.hero_left.min")
                                    }}
                                </span>
                            </div>

                            <div class="neoTags" v-if="(detail.post?.tags?.length || detailTags.length)">
                                <span v-for="(t, idx) in (detail.post?.tags?.length ? detail.post.tags : detailTags)"
                                    :key="String(t) + '_' + idx" class="neoTag">
                                    {{ t }}
                                </span>
                            </div>
                        </div>

                        <div class="neoHero__right">
                            <div class="neoSwitch" :class="{ 'isOn': !!detail.post?.pinToTop }" aria-hidden="true">
                                <div class="neoSwitch__dot"></div>
                                <div class="neoSwitch__txt">{{
                                    detail.post?.pinToTop ?
                                        t("main_page.body.detail.body.hero_left.pinned") :
                                        t("main_page.body.detail.body.hero_left.normal")
                                }}
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Layout: desktop 2 cols, mobile 1 col -->
                    <section class="neoGrid">
                        <!-- Left: main -->
                        <div class="neoMain">
                            <!-- Content card -->
                            <section class="neoCard">
                                <div class="neoCard__hd">
                                    <div class="neoCard__title">{{
                                        t("main_page.body.detail.body.grid.hd.content")
                                    }}
                                    </div>
                                    <div class="neoCard__side neoMuted" v-if="detail.post?.content?.length">
                                        {{ detail.post.content.length }} {{
                                            t("main_page.body.detail.body.grid.hd.chars")
                                        }}
                                    </div>
                                </div>

                                <pre class="neoContent">{{ detail.post?.content || "" }}</pre>
                            </section>

                            <!-- Todos -->
                            <section v-if="(detail.post?.todos?.length || 0) > 0" class="neoCard">
                                <div class="neoCard__hd">
                                    <div class="neoCard__title">{{
                                        t("main_page.body.detail.body.grid.todos.content")
                                    }}
                                    </div>
                                    <div class="neoCard__side">
                                        <span class="neoPill">{{ detail.post.todos.length }}</span>
                                    </div>
                                </div>

                                <ul class="neoTodos">
                                    <li v-for="(todo, i) in detail.post.todos" :key="i" class="neoTodo"
                                        :class="{ isDone: typeof todo === 'object' ? !!todo?.done : false }">
                                        <span class="neoTodo__box" aria-hidden="true"></span>
                                        <div class="neoTodo__txt">
                                            {{ typeof todo === "object" ? (todo?.text ?? "") : todo }}
                                        </div>
                                    </li>
                                </ul>
                            </section>
                        </div>

                        <!-- Right: sidebar -->
                        <aside class="neoSide">
                            <!-- Gauges -->
                            <section class="neoCard">
                                <div class="neoCard__hd">
                                    <div class="neoCard__title">{{
                                        t("main_page.body.detail.body.grid.sidebar.card_A.title")
                                    }}
                                    </div>
                                    <div class="neoCard__side neoMuted">{{
                                        t("main_page.body.detail.body.grid.sidebar.card_A.visualization")
                                    }}
                                    </div>
                                </div>

                                <div class="neoGauges">
                                    <div class="neoGauge" :style="{
                                        '--p': detail.post?.focus != null ? Math.min(100, Math.max(0, (Number(detail.post.focus) / 5) * 100)) : 0
                                    }">
                                        <div class="neoGauge__ring" aria-hidden="true"></div>
                                        <div class="neoGauge__txt">
                                            <div class="neoGauge__num">{{ detail.post?.focus ?? "—" }}</div>
                                            <div class="neoGauge__cap neoMuted">{{
                                                t("main_page.body.detail.body.grid.sidebar.card_A.focus")
                                            }}
                                            </div>
                                        </div>
                                    </div>

                                    <div class="neoGauge" :style="{
                                        '--p': detail.post?.difficulty != null ? Math.min(100, Math.max(0, (Number(detail.post.difficulty) / 5) * 100)) : 0
                                    }">
                                        <div class="neoGauge__ring" aria-hidden="true"></div>
                                        <div class="neoGauge__txt">
                                            <div class="neoGauge__num">{{ detail.post?.difficulty ?? "—" }}
                                            </div>
                                            <div class="neoGauge__cap neoMuted">{{
                                                t("main_page.body.detail.body.grid.sidebar.card_A.diff")
                                            }}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="neoTape">
                                    <div class="neoTape__top">
                                        <div class="neoTape__label neoMuted">{{
                                            t("main_page.body.detail.body.grid.sidebar.card_A.duration")
                                        }}
                                        </div>
                                        <div class="neoTape__value">{{
                                            detail.post?.durationMin != null ?
                                                (detail.post.durationMin + " " +
                                                    t("main_page.body.detail.body.grid.sidebar.card_A.min")) : "—"
                                        }}
                                        </div>
                                    </div>

                                    <div class="neoTape__track" aria-hidden="true">
                                        <div class="neoTape__fill" :style="{
                                            width:
                                                detail.post?.durationMin != null
                                                    ? Math.min(100, Math.max(0, (Number(detail.post.durationMin) / 180) * 100)) + '%'
                                                    : '0%'
                                        }" />
                                    </div>
                                    <div class="neoTape__hint neoMuted">{{
                                        detail.post?.durationMin != null ?
                                            (detail.post.durationMin + " / 180 " +
                                                t("main_page.body.detail.body.grid.sidebar.card_A.min")) :
                                            t("main_page.body.detail.body.grid.sidebar.card_A.no_data")
                                    }}
                                    </div>
                                </div>
                            </section>

                            <!-- Goal + Raw fields -->
                            <section class="neoCard">
                                <div class="neoCard__hd">
                                    <div class="neoCard__title">{{
                                        t("main_page.body.detail.body.grid.sidebar.card_B.title")
                                    }}
                                    </div>
                                </div>
                                <div class="neoText">
                                    {{ detail.post?.goal || "—" }}
                                </div>

                                <div class="neoDivider"></div>

                                <ul class="neoKV">
                                    <li class="neoKV__row">
                                        <span class="neoKV__k">{{
                                            t("main_page.body.detail.body.grid.sidebar.card_B.happened_at")
                                        }}</span>
                                        <span class="neoKV__v">{{
                                            detail.post?.happenedAt ?
                                                formatDate(detail.post.happenedAt) : "—"
                                        }}</span>
                                    </li>
                                    <li class="neoKV__row">
                                        <span class="neoKV__k">{{
                                            t("main_page.body.detail.body.grid.sidebar.card_B.duration")
                                        }}</span>
                                        <span class="neoKV__v">{{ detail.post?.durationMin ?? "—" }}</span>
                                    </li>
                                    <li class="neoKV__row">
                                        <span class="neoKV__k">{{
                                            t("main_page.body.detail.body.grid.sidebar.card_B.focus")
                                        }}</span>
                                        <span class="neoKV__v">{{ detail.post?.focus ?? "—" }}</span>
                                    </li>
                                    <li class="neoKV__row">
                                        <span class="neoKV__k">{{
                                            t("main_page.body.detail.body.grid.sidebar.card_B.diff")
                                        }}</span>
                                        <span class="neoKV__v">{{ detail.post?.difficulty ?? "—" }}</span>
                                    </li>
                                    <li class="neoKV__row">
                                        <span class="neoKV__k">{{
                                            t("main_page.body.detail.body.grid.sidebar.card_B.pin_to_top")
                                        }}</span>
                                        <span class="neoKV__v">{{
                                            detail.post?.pinToTop ?
                                                t("main_page.body.detail.body.grid.sidebar.card_B.pin_status.true")
                                                :
                                                t("main_page.body.detail.body.grid.sidebar.card_B.pin_status.false")
                                        }}</span>
                                    </li>
                                </ul>
                            </section>
                        </aside>
                    </section>
                </div>
            </main>
            <footer class="neoFooter">
                <button @click="$emit('edit-post')" class="neoFooter_button">{{ t("main_page.body.detail.body.footer.edit") }}</button>
                <button @click="$emit('delete-post')" class="neoFooter_button">{{ t("main_page.body.detail.body.footer.delete") }}</button>
            </footer>
        </section>
    </div>
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { injectPostDetail } from "@/composables/usePostDetail";
import { formatDate } from "@/composables/useHelpers";

const { t } = useI18n();

const {
    detail, detailLoading, detailError, detailDate, detailTags, detailSubtitle,
    deletePost: _deletePost,
} = injectPostDetail();
</script>
<style src="@/partMain/css/detail.css"></style>
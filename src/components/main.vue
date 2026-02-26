<template>
    <div class="page">
        <!-- Top bar -->
        <header class="topbar">
            <div class="brand">
                <div class="brand-dot">
                    <span role="img" aria-label="book">📚</span>
                </div>
                <div class="brand-text">
                    <div class="brand-title">Study Log</div>
                    <div class="brand-sub muted">
                        <span v-if="meLoading">加载用户中…</span>
                        <span v-else-if="meUser">{{ meUser.email }}</span>
                        <span v-else>未登录 / 会话失效</span>
                    </div>
                </div>
            </div>
            <div class="topbar-actions">
                <button class="btn ghost" @click="onOpenSettings">设置</button>
                <button class="btn ghost" @click="onLogout">退登</button>
            </div>

        </header>

        <!-- Body -->
        <main class="content">
            <!-- Create block -->
            <section class="create-area">
                <div class="create-card" :class="{ compact: !composerOpen }" role="button" tabindex="0"
                    @click="openComposer" @keydown.enter.prevent="openComposer" @keydown.space.prevent="openComposer">
                    <div class="create-card-left">
                        <div class="create-badge">+</div>
                        <div>
                            <div class="create-title">新增学习记录</div>
                            <div class="muted create-sub">
                                点击展开全屏编辑（支持草稿自动保存、Ctrl/⌘ + Enter 快速保存）
                            </div>
                        </div>
                    </div>
                    <div class="create-card-right">
                        <span class="pill">Reading</span>
                        <span class="pill">Coding</span>
                        <span class="pill">Project</span>
                        <span class="pill">Reciting</span>
                    </div>
                </div>
            </section>

            <!-- List -->
            <section class="list-area">
                <div class="list-head">
                    <div class="list-title">全部记录</div>

                    <div class="list-tools">
                        <div class="select">
                            <span class="muted">每页</span>
                            <select v-model.number="pager.limit" @change="resetAndList">
                                <option :value="5">5</option>
                                <option :value="10">10</option>
                                <option :value="15">15</option>
                                <option :value="20">20</option>
                                <option :value="25">25</option>
                            </select>
                        </div>
                        <button class="btn secondary" @click="listPosts()">刷新</button>
                    </div>
                </div>

                <div v-if="listLoading" class="skeleton-wrap">
                    <div class="skeleton" v-for="i in 6" :key="i" />
                </div>

                <div v-else-if="listError" class="errorbox">
                    加载失败：{{ listError }}
                </div>

                <div v-else-if="!posts.length" class="empty">
                    <div class="empty-title">暂无内容</div>
                    <div class="muted">先写一条学习记录吧。</div>
                    <button class="btn primary" @click="openComposer">立即新增</button>
                </div>

                <div v-else class="cards">
                    <article class="post-card" :class="{ 'is-pinned': !!p.pinToTop }" v-for="p in posts" :key="p.id">
                        <header class="post-head">
                            <div class="post-title">
                                <span class="post-id muted">#{{ p.id }}</span>
                                <span class="post-title-text">{{ p.title || "(无标题)" }}</span>
                                <span v-if="p.pinToTop" class="badge">置顶</span>
                            </div>

                            <div class="post-actions">
                                <button class="btn ghost" @click="openDetail(p.id)">Detail</button>
                            </div>
                        </header>

                        <div class="post-meta">
                            <span v-if="p.happenedAt">{{ formatDate(p.happenedAt) }}</span>

                            <span v-if="p.durationMin" class="sep">·</span>
                            <span v-if="p.durationMin">{{ p.durationMin }} min</span>

                            <span v-if="p.focus != null" class="sep">·</span>
                            <span v-if="p.focus != null">Focus {{ p.focus }}</span>

                            <span v-if="p.difficulty != null" class="sep">·</span>
                            <span v-if="p.difficulty != null">Diff {{ p.difficulty }}</span>

                            <span v-if="p.updated_at" class="sep">·</span>
                            <span v-if="p.updated_at">更新 {{ formatDate(p.updated_at) }}</span>
                        </div>

                        <section class="post-body">
                            <p class="post-preview">
                                {{ p.preview || p.contentPreview || p.content || "（无内容）" }}
                            </p>

                            <div v-if="p.goal" class="post-block">
                                <div class="post-block-title muted">Goal</div>
                                <div class="post-block-content">{{ p.goal }}</div>
                            </div>

                            <div v-if="todoList(p).length" class="post-block">
                                <div class="post-block-title muted">
                                    Todos <span class="muted">({{ todoList(p).length }})</span>
                                </div>

                                <ul class="todo-list" style="justify-content: left !important;">
                                    <li v-for="(t, i) in todoList(p).slice(0, 3)" :key="i" class="todo-item">
                                        <span class="checkbox" aria-hidden="true"></span>
                                        <span class="todo-text">{{ t?.text ?? t }}</span>
                                    </li>

                                    <li v-if="todoList(p).length > 3" class="todo-more muted">
                                        +{{ todoList(p).length - 3 }} more
                                    </li>
                                </ul>
                            </div>
                        </section>
                        <footer class="post-foot">
                            <div class="tag-row" v-if="tagList(p).length">
                                <span class="tag" v-for="(t, i) in tagList(p).slice(0, 6)" :key="i">
                                    {{ t }}
                                </span>
                                <span v-if="tagList(p).length > 6" class="tag muted">
                                    +{{ tagList(p).length - 6 }}
                                </span>
                            </div>

                            <div class="post-time muted">
                                <span v-if="p.created_at">创建于 {{ formatDate(p.created_at) }}</span>
                            </div>
                        </footer>
                    </article>
                </div>

                <!-- Pagination -->
                <div class="pager" v-if="showPager">
                    <button class="btn ghost" :disabled="pager.page <= 1 || listLoading" @click="goPage(pager.page - 1)"
                        style="color: #333;">
                        ‹
                    </button>

                    <button v-for="it in pageItems" :key="String(it.key)" class="btn"
                        :class="{ active: it.type === 'page' && it.value === pager.page }"
                        :disabled="it.type !== 'page' || listLoading" @click="it.type === 'page' && goPage(it.value)">
                        <span v-if="it.type === 'page'">{{ it.value }}</span>
                        <span v-else class="muted">…</span>
                    </button>

                    <button class="btn ghost" :disabled="!pager.hasNext || listLoading" @click="goPage(pager.page + 1)"
                        style="color: #333;">
                        ›
                    </button>

                    <div class="pager-right">
                        <div class="jump">
                            <span class="muted">跳转</span>
                            <input v-model="jumpInput" inputmode="numeric" pattern="[0-9]*" placeholder="页码"
                                @keydown.enter.prevent="jumpToPage" />
                            <button class="btn secondary" @click="jumpToPage" :disabled="listLoading">Go</button>
                        </div>

                        <div class="muted pager-note">
                            <span v-if="pager.total != null">共 {{ pager.total }} 条</span>
                            <span v-else>（总数未知）</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <!-- Fullscreen composer -->
        <transition name="overlay">
            <div v-if="composerOpen" class="overlay" @keydown.esc.prevent="closeComposer" tabindex="-1" ref="overlayEl">
                <div class="overlay-top">
                    <div class="overlay-title">
                        <div class="overlay-title-main">新增记录</div>
                        <div class="muted overlay-title-sub">
                            草稿：{{ draftStatus }}
                            <span class="dot">·</span>
                            字数：{{ wordCount }}
                        </div>
                    </div>

                    <div class="overlay-actions">
                        <button class="btn ghost" @click="resetDraft(false)">清空</button>
                        <button class="btn ghost" @click="closeComposer">关闭</button>
                        <button class="btn primary" :disabled="createLoading" @click="createPost">
                            {{ createLoading ? '保存中…' : '保存' }}
                        </button>
                    </div>
                </div>

                <div class="overlay-body">
                    <div class="grid">
                        <!-- Left column -->
                        <div class="panel">
                            <div class="panel-head">
                                <div class="panel-title">基础信息</div>
                                <div class="panel-tools">
                                    <select v-model="draft.template" @change="applyTemplate" class="mini-select">
                                        <option value="">模板：无</option>
                                        <option value="reading">阅读</option>
                                        <option value="coding">编码</option>
                                        <option value="lecture">课程/讲座</option>
                                        <option value="review">复盘/总结</option>
                                    </select>

                                    <label class="toggle">
                                        <input type="checkbox" v-model="draft.pinToTop" />
                                        <span>置顶</span>
                                    </label>
                                </div>
                            </div>

                            <div class="field">
                                <label>标题</label>
                                <input v-model.trim="draft.title" maxlength="120" placeholder="例如: 单词ABANDON的学习" />
                                <div class="muted tiny">建议 10–60 字；最多 120 字</div>
                            </div>

                            <div class="row">
                                <div class="field">
                                    <label>学习时间</label>
                                    <input v-model="draft.happenedAt" type="datetime-local" />
                                </div>
                                <div class="field">
                                    <label>时长（分钟）</label>
                                    <input v-model.number="draft.durationMin" type="number" min="0" max="1440"
                                        placeholder="例如 45" />
                                </div>
                            </div>

                            <div class="row">
                                <div class="field">
                                    <label>专注度（1-5）</label>
                                    <input v-model.number="draft.focus" type="range" min="1" max="5" step="0.05" />
                                    <div class="muted tiny">当前：{{ draft.focus }}</div>
                                </div>
                                <div class="field">
                                    <label>难度（1-5）</label>
                                    <input v-model.number="draft.difficulty" type="range" min="1" max="5" step="0.05" />
                                    <div class="muted tiny">当前：{{ draft.difficulty }}</div>
                                </div>
                            </div>

                            <div class="field">
                                <label>标签（回车添加）</label>
                                <div class="tagbox">
                                    <div>
                                        <span class="tag" v-for="t in draft.tags" :key="t">
                                            {{ t }}
                                            <button class="tag-x" @click="removeTag(t)" aria-label="remove">×</button>
                                        </span>
                                    </div>
                                    <input v-model.trim="tagInput" placeholder="例如：Vue / 算法 / 英语"
                                        @keydown.enter.prevent="addTag(tagInput)"
                                        @keydown.,.prevent="addTag(tagInput)" />
                                </div>

                                <div class="quick-tags">
                                    <button class="btn chip" @click="addTag('reading')">reading</button>
                                    <button class="btn chip" @click="addTag('coding')">coding</button>
                                    <button class="btn chip" @click="addTag('notes')">notes</button>
                                    <button class="btn chip" @click="addTag('review')">review</button>
                                </div>
                            </div>

                            <div class="field">
                                <label>目标 / 预期收获</label>
                                <textarea v-model.trim="draft.goal" rows="3" placeholder="这次想解决什么问题？"></textarea>
                            </div>
                        </div>

                        <!-- Right column -->
                        <div class="panel">
                            <div class="panel-head">
                                <div class="panel-title">内容</div>
                                <div class="panel-tools">
                                    <label class="toggle">
                                        <input type="checkbox" v-model="ui.previewMode" />
                                        <span>预览</span>
                                    </label>
                                </div>
                            </div>

                            <div class="field" v-if="!ui.previewMode">
                                <label>详述</label>
                                <textarea v-model.trim="draft.content" rows="14" placeholder="写下做了什么、学到了什么、哪里卡住、下一步是什么…"
                                    @keydown.ctrl.enter.prevent="createPost"
                                    @keydown.meta.enter.prevent="createPost"></textarea>
                                <div class="muted tiny">
                                    小提示：用“结论 / 过程 / 反思 / 下一步”四段写，回头复盘更快。
                                </div>
                            </div>

                            <div class="field" v-else>
                                <label>预览（纯文本安全预览）</label>
                                <pre class="preview">{{ composedPreview }}</pre>
                            </div>

                            <div class="field">
                                <label>下一步行动（可选）</label>
                                <div class="todo">
                                    <input v-model.trim="todoInput" placeholder="输入后回车添加"
                                        @keydown.enter.prevent="addTodo(todoInput)" />
                                    <button class="btn secondary" @click="addTodo(todoInput)">添加</button>
                                </div>

                                <ul class="todo-list" v-if="draft.todos.length">
                                    <li v-for="(t, i) in draft.todos" :key="i">
                                        <input type="checkbox" v-model="t.done" />
                                        <span :class="{ done: t.done }">{{ t.text }}</span>
                                        <button class="btn ghost tinybtn" @click="removeTodo(i)">移除</button>
                                    </li>
                                </ul>
                            </div>

                            <div v-if="createStatus.msg" class="status-msg" :class="createStatus.kind">
                                {{ createStatus.msg }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="overlay-bottom muted">
                    <span>快捷键：Esc 关闭</span>
                    <span class="dot">·</span>
                    <span>Ctrl/⌘ + Enter 保存</span>
                    <span class="dot">·</span>
                    <span>草稿自动保存到本地</span>
                </div>
            </div>
        </transition>

        <!-- Detail modal -->
        <transition name="neo-pop">
            <div v-if="detail.open" class="neoOverlay" role="dialog" aria-modal="true" tabindex="-1"
                @click.self="detail.open = false">
                <section class="neoPanel" @click.stop>
                    <!-- Topbar -->
                    <header class="neoTop">
                        <div class="neoTop__left">
                            <div class="neoKicker">
                                <span class="neoKicker__id">内容 #{{ detail.id }}</span>
                                <span class="neoKicker__dot">•</span>
                                <span v-if="detailLoading" class="neoKicker__muted">加载中…</span>
                                <span v-else-if="detailError" class="neoKicker__err">{{ detailError }}</span>
                                <span v-else class="neoKicker__muted">{{ detailSubtitle }}</span>
                            </div>

                            <div class="neoTitleRow">
                                <div class="neoTitle">
                                    {{ detail.post?.title || "(无标题)" }}
                                </div>

                                <div class="neoBadges">
                                    <span v-if="detail.post?.pinToTop" class="neoBadge neoBadge--pin">PIN</span>
                                    <span v-if="detail.post?.goal" class="neoBadge">GOAL</span>
                                </div>
                            </div>
                        </div>

                        <div class="neoTop__right">
                            <button class="neoBtn neoBtn--ghost" type="button" @click="detail.open = false">关闭</button>
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
                            <div class="neoError__title">读取失败</div>
                            <div class="neoError__msg">{{ detailError }}</div>
                        </div>

                        <!-- Content -->
                        <div v-else class="neoWrap">
                            <!-- Hero strip -->
                            <section class="neoHero">
                                <div class="neoHero__left">
                                    <div class="neoMetaLine">
                                        <span class="neoMeta" v-if="detail.post?.happenedAt || detailDate">
                                            Start at:{{ formatDate(detail.post?.happenedAt || detailDate) }}
                                        </span>
                                        <span class="neoSep"
                                            v-if="(detail.post?.happenedAt || detailDate) && (detail.post?.durationMin != null)">/</span>
                                        <span class="neoMeta" v-if="detail.post?.durationMin != null">
                                            {{ detail.post.durationMin }} min
                                        </span>
                                    </div>

                                    <div class="neoTags" v-if="(detail.post?.tags?.length || detailTags.length)">
                                        <span
                                            v-for="(t, idx) in (detail.post?.tags?.length ? detail.post.tags : detailTags)"
                                            :key="String(t) + '_' + idx" class="neoTag">
                                            {{ t }}
                                        </span>
                                    </div>
                                </div>

                                <div class="neoHero__right">
                                    <div class="neoSwitch" :class="{ 'isOn': !!detail.post?.pinToTop }"
                                        aria-hidden="true">
                                        <div class="neoSwitch__dot"></div>
                                        <div class="neoSwitch__txt">{{ detail.post?.pinToTop ? "Pinned" : "Normal" }}
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
                                            <div class="neoCard__title">内容</div>
                                            <div class="neoCard__side neoMuted" v-if="detail.post?.content?.length">
                                                {{ detail.post.content.length }} chars
                                            </div>
                                        </div>

                                        <pre class="neoContent">{{ detail.post?.content || "" }}</pre>
                                    </section>

                                    <!-- Todos -->
                                    <section v-if="(detail.post?.todos?.length || 0) > 0" class="neoCard">
                                        <div class="neoCard__hd">
                                            <div class="neoCard__title">Todos</div>
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
                                            <div class="neoCard__title">指标</div>
                                            <div class="neoCard__side neoMuted">可视化</div>
                                        </div>

                                        <div class="neoGauges">
                                            <div class="neoGauge" :style="{
                                                '--p': detail.post?.focus != null ? Math.min(100, Math.max(0, (Number(detail.post.focus) / 5) * 100)) : 0
                                            }">
                                                <div class="neoGauge__ring" aria-hidden="true"></div>
                                                <div class="neoGauge__txt">
                                                    <div class="neoGauge__num">{{ detail.post?.focus ?? "—" }}</div>
                                                    <div class="neoGauge__cap neoMuted">focus</div>
                                                </div>
                                            </div>

                                            <div class="neoGauge" :style="{
                                                '--p': detail.post?.difficulty != null ? Math.min(100, Math.max(0, (Number(detail.post.difficulty) / 5) * 100)) : 0
                                            }">
                                                <div class="neoGauge__ring" aria-hidden="true"></div>
                                                <div class="neoGauge__txt">
                                                    <div class="neoGauge__num">{{ detail.post?.difficulty ?? "—" }}
                                                    </div>
                                                    <div class="neoGauge__cap neoMuted">difficulty</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="neoTape">
                                            <div class="neoTape__top">
                                                <div class="neoTape__label neoMuted">duration</div>
                                                <div class="neoTape__value">{{ detail.post?.durationMin != null ?
                                                    (detail.post.durationMin + " min") : "—" }}</div>
                                            </div>

                                            <div class="neoTape__track" aria-hidden="true">
                                                <div class="neoTape__fill" :style="{
                                                    width:
                                                        detail.post?.durationMin != null
                                                            ? Math.min(100, Math.max(0, (Number(detail.post.durationMin) / 180) * 100)) + '%'
                                                            : '0%'
                                                }" />
                                            </div>
                                            <div class="neoTape__hint neoMuted">{{ detail.post?.durationMin != null ?
                                                (detail.post.durationMin + " / 180 min") : "no data" }}</div>
                                        </div>
                                    </section>

                                    <!-- Goal + Raw fields -->
                                    <section class="neoCard">
                                        <div class="neoCard__hd">
                                            <div class="neoCard__title">目标</div>
                                        </div>
                                        <div class="neoText">
                                            {{ detail.post?.goal || "—" }}
                                        </div>

                                        <div class="neoDivider"></div>

                                        <ul class="neoKV">
                                            <li class="neoKV__row">
                                                <span class="neoKV__k">happenedAt</span>
                                                <span class="neoKV__v">{{ detail.post?.happenedAt ?
                                                    formatDate(detail.post.happenedAt) : "—" }}</span>
                                            </li>
                                            <li class="neoKV__row">
                                                <span class="neoKV__k">durationMin</span>
                                                <span class="neoKV__v">{{ detail.post?.durationMin ?? "—" }}</span>
                                            </li>
                                            <li class="neoKV__row">
                                                <span class="neoKV__k">focus</span>
                                                <span class="neoKV__v">{{ detail.post?.focus ?? "—" }}</span>
                                            </li>
                                            <li class="neoKV__row">
                                                <span class="neoKV__k">difficulty</span>
                                                <span class="neoKV__v">{{ detail.post?.difficulty ?? "—" }}</span>
                                            </li>
                                            <li class="neoKV__row">
                                                <span class="neoKV__k">pinToTop</span>
                                                <span class="neoKV__v">{{ detail.post?.pinToTop ? "true" : "false"
                                                }}</span>
                                            </li>
                                        </ul>
                                    </section>
                                </aside>
                            </section>
                        </div>
                    </main>
                    <footer class="neoFooter">
                        <button @click="deletePost" class="neoFooter_button">删除该记录</button>
                    </footer>
                </section>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch, Ref } from "vue";

/** =========================
 *  API
 *  ========================= */
// const API_BASE = "https://done.login.page.zbyblq.xin";
const API_BASE = ""; // 默认同域，部署时请根据实际情况修改

const emit = defineEmits(["log-out"]);

const safeJSON = (v: Array<any>, fallback = []) => {
    if (Array.isArray(v)) return v
    if (!v || typeof v !== "string") return fallback
    try { return JSON.parse(v) } catch { return fallback }
}

const tagList = (p: any) => safeJSON(p.tags, []);
const todoList = (p: any) => safeJSON(p.todos, []);
async function api(path: string, options: { method: 'GET' | 'POST' | 'PUT' | 'DELETE'; headers?: any; body?: string; } = { method: "GET" }) {
    const headers = options.headers ? { ...options.headers } : {};
    if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";

    let res;
    try {
        res = await fetch(API_BASE + path, {
            ...options,
            headers,
            credentials: "include",
        });
    } catch (err: any) {
        throw { kind: "network", message: err?.message || String(err), err };
    }

    const text = await res.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = { raw: text };
    }

    if (!res.ok) {
        throw { kind: "http", status: res.status, statusText: res.statusText, data };
    }
    return data;
}

/** =========================
 *  Top bar: me
 *  ========================= */
interface User {
    value: number | null;
    email?: string | null;
    // 其他用户相关字段
}
const meUser = reactive<User>({ value: null, email: null });
const meLoading = ref(false);

async function refreshMe() {
    meLoading.value = true;
    try {
        const data = await api("/api/me");
        meUser.value = data?.user || null;
        meUser.email = data?.user?.email || null;
        return meUser;
    } catch {
        meUser.value = null;
        return null;
    } finally {
        meLoading.value = false;
    }
}

/**
 * 用户要求：设置/退出留空函数给你接线
 * 你可以在这里改成 router.push / emit 等。
 */
function onOpenSettings() {
    // TODO: 由你接入设置页面
    alert("还没写这个页面，你要是想要可以催我(boyangzhang246@gmail.com),不过我99.999%的概率会忽略QwQ");
}
async function onLogout() {
    // TODO: 由你决定是否要走后端 /api/logout
    try {
        await api("/api/logout", { method: "POST" });
        emit("log-out");
    } catch {
        alert("退出登录请求失败（网络或服务器错误），但本地会话已清除。如果你仍然看到登录状态，可能是因为后端会话未成功清除。请尝试刷新页面或检查网络连接。");
    }
    // await refreshMe();
    // await resetAndList();
}

/** =========================
 *  List + Pagination
 *  ========================= */
interface Post {
    id: number;
    title: string;
    content: string;
    tags?: string; // JSON array
    todos?: string; // JSON array
    happenedAt?: string; // ISO datetime
    durationMin?: number;
    focus?: number;
    difficulty?: number;
    pinToTop?: boolean;
    created_at?: string;
    updated_at?: string;
    preview?: string;
    contentPreview?: string;
    goal?: string;
}
const posts = ref<Post[]>([]);
const listLoading = ref(false);
const listError = ref("");
const userDevice = ref(navigator.userAgent);
interface Pager {
    limit: number;
    offset: number;
    page: number;
    total: number | null;
    hasNext: boolean;
}
const pager = reactive<Pager>({
    limit: userDevice.value.includes("Mobile") ? 5 : 10, // 移动设备默认每页少一点
    offset: 0,
    page: 1,
    total: null, // 若后端返回 total，就会启用完整页码
    hasNext: false,
});

const jumpInput = ref("");

function normalizeInt(v: string | number | null | undefined, fallback = 0) {
    const n = Number(v);
    if (!Number.isFinite(n) || [NaN, null, undefined].includes(n)) return fallback;
    return n;
}

async function listPosts() {
    listLoading.value = true;
    listError.value = "";

    try {
        const data = await api(`/api/posts?limit=${pager.limit}&offset=${pager.offset}`);

        let items = data?.results || [];
        if (items.length) {items = items.sort((a: any, b: any) => {return b.pinToTop - a.pinToTop;});}
        // console.log("当前用户数据总条数", data?.posts_count);
        posts.value = items;

        // 兼容：如果后端提供 total / count / hasNext 等字段，就用；否则用“本页满=可能还有下一页”
        const total = data?.posts_count;
        pager.total = total;

        pager.hasNext = typeof data?.hasNext === "boolean" ? data.hasNext : items.length === pager.limit;

        // page 从 offset 推导，避免状态错乱
        pager.page = Math.floor(pager.offset / pager.limit) + 1;
    } catch (e: any) {
        if (e?.kind === "http" && e.status === 401) {
            listError.value = "未登录，无法加载列表";
            posts.value = [];
            pager.total = null;
            pager.hasNext = false;
            return;
        }
        listError.value = safeErr(e);
    } finally {
        listLoading.value = false;
    }
}

function resetAndList() {
    pager.offset = 0;
    pager.page = 1;
    pager.hasNext = false;
    return listPosts();
}

function goPage(pageNum: number | null | undefined) {
    if (pageNum === null || pageNum === undefined) return;
    const p = Math.max(1, normalizeInt(pageNum, 1));
    pager.page = p;
    pager.offset = (p - 1) * pager.limit;
    return listPosts();
}

function jumpToPage() {
    const p = Math.max(1, normalizeInt(jumpInput.value, pager.page));
    jumpInput.value = "";
    return goPage(p);
}

const showPager = computed(() => {
    // 有 total：至少 2 页才显示；无 total：只要有下一页或当前页>1就显示
    console.log("showPager?", { total: pager.total, page: pager.page, hasNext: pager.hasNext });
    if (pager.total != null && pager.total !== 0) return Math.ceil(pager.total / pager.limit) > 1;
    return pager.page > 1 || pager.hasNext;
});

function buildPageItems(current: number, totalPages: number | null, hasNext: boolean) {
    // 高级一点：窗口化 + 首尾 + 省略号
    // totalPages 为空时：不显示尾页，但保留窗口与 next
    const items: Array<{ type: "page" | "ellipsis"; value?: number; key: string }> = [];
    const key = (t: string, v: any) => `${t}:${v}`;

    const pushPage = (v: number) => items.push({ type: "page", value: v, key: key("p", v) });
    const pushEllipsis = (id: string) => items.push({ type: "ellipsis", key: key("e", id) });

    const windowSize = 2; // current ±2
    const start = Math.max(1, current - windowSize);
    const end = totalPages ? Math.min(totalPages, current + windowSize) : current + windowSize;

    // 首页
    if (start > 1) {
        pushPage(1);
        if (start > 2) pushEllipsis("l");
    }

    // 中间窗口
    for (let i = start; i <= end; i++) pushPage(i);

    // 尾页（仅 totalPages 已知时）
    if (totalPages) {
        if (end < totalPages - 1) pushEllipsis("r");
        if (end < totalPages) pushPage(totalPages);
    } else {
        // total 未知：如果还有下一页，给一个“假尾部省略”，视觉更高级
        if (hasNext) pushEllipsis("r");
    }

    return items;
}

const totalPages = computed(() => {
    if (pager.total == null) return null;
    return Math.max(1, Math.ceil(pager.total / pager.limit));
});

const pageItems = computed(() =>
    buildPageItems(pager.page, totalPages.value, pager.hasNext)
);

/** =========================
 *  Detail viewer
 *  ========================= */
interface DetailState {
    open: boolean;
    id: number | null;
    post: any | null;
}
const detail = reactive<DetailState>({
    open: false,
    id: null,
    post: null,
});
const detailLoading = ref(false);
const detailError = ref("");

async function openDetail(id: number | null) {
    detail.open = true;
    detail.id = id;
    detail.post = null;
    detailLoading.value = true;
    detailError.value = "";

    try {
        const data = await api(`/api/posts/${id}`);
        // 兼容：data.post / data
        detail.post = data?.post ?? data;
    } catch (e: any) {
        detailError.value = safeErr(e?.data ?? e);
    } finally {
        detailLoading.value = false;
    }
}

const detailDate = computed(() => {
    const p = detail.post || {};
    return p.createdAt || p.created_at || p.created || p.happenedAt || null;
});
const detailTags = computed(() => {
    const p = detail.post || {};
    return Array.isArray(p.tags) ? p.tags : [];
});
const detailSubtitle = computed(() => {
    const parts = ['Uploaded at:'];
    if (detailDate.value) parts.push(formatDate(detailDate.value));
    if (detailTags.value.length) parts.push(detailTags.value.join(" / "));
    return parts.join(" · ") || "—";
});

/** =========================
 *  Composer (full screen)
 *  ========================= */
const composerOpen = ref(false);
const overlayEl: Ref<HTMLDivElement | null> = ref(null);

interface UIState {
    previewMode: boolean;
}
const ui = reactive<UIState>({
    previewMode: false,
});

const createLoading = ref(false);
interface CreateStatus {
    msg: string;
    kind: string;
}
const createStatus = reactive<CreateStatus>({
    msg: "",
    kind: "muted"
});

const DRAFT_KEY = "studylog:draft:v1";
const draftStatus = ref("未保存");

interface Draft {
    template: string;
    title: string;
    content: string;
    happenedAt: string;
    durationMin: number | null;
    focus: number | null;
    difficulty: number | null;
    tags: Array<string>;
    goal: string;
    todos: Array<{ text: string; done: boolean }>;
    pinToTop: boolean;
}
const draft = reactive<Draft>({
    template: "",
    title: "",
    content: "",
    happenedAt: toDatetimeLocal(new Date()),
    durationMin: 45,
    focus: 3,
    difficulty: 3,
    tags: [],
    goal: "",
    todos: [],
    pinToTop: false,
});

const tagInput = ref("");
const todoInput = ref("");

function openComposer() {
    if (composerOpen.value) return;
    composerOpen.value = true;
    nextTick(() => {
        try {
            overlayEl.value?.focus?.();
        } catch { }
    });
}

function closeComposer() {
    composerOpen.value = false;
    createStatus.msg = "";
}

function setCreateStatus(msg: string, kind: string = "muted") {
    createStatus.msg = String(msg).slice(0, 1000);
    createStatus.kind = kind;
}

function addTag(raw: string) {
    const t = String(raw || "").trim();
    if (!t) return;
    const safe = t.slice(0, 24);
    if (!draft.tags.includes(safe)) draft.tags.push(safe);
    tagInput.value = "";
}

function removeTag(tag: string) {
    draft.tags = draft.tags.filter((x) => x !== tag);
}

function addTodo(raw: string) {
    const text = String(raw || "").trim();
    if (!text) return;
    draft.todos.push({ text: text.slice(0, 120), done: false });
    todoInput.value = "";
}

function removeTodo(i: number) {
    draft.todos.splice(i, 1);
}

function resetDraft(keepTime = true) {
    const keep = keepTime ? draft.happenedAt : toDatetimeLocal(new Date());
    draft.template = "";
    draft.title = "";
    draft.content = "";
    draft.happenedAt = keep;
    draft.durationMin = 45;
    draft.focus = 3;
    draft.difficulty = 3;
    draft.tags = [];
    draft.goal = "";
    draft.todos = [];
    draft.pinToTop = false;
    ui.previewMode = false;
    setCreateStatus("已清空（草稿仍会自动保存）", "muted");
}

function applyTemplate() {
    // 不覆盖用户已填内容：只在空时给默认
    const t = draft.template;
    if (!t) return;

    if (!draft.title) {
        const map = {
            reading: "阅读：",
            coding: "编码：",
            lecture: "课程：",
            review: "复盘：",
        };
        type TemplateType = keyof typeof map;
        function getTemplateTitle(template: TemplateType): string {
            return map[template] || "";
        }
        draft.title = getTemplateTitle(t as TemplateType);
    }

    if (!draft.goal) {
        const map = {
            reading: "读完并提炼 3 个关键点 + 1 个可复用结论",
            coding: "完成一个可运行的最小示例并总结坑点",
            lecture: "整理讲义要点，写出 1 个可迁移的方法",
            review: "梳理问题—原因—改进—下一步",
        };
        type TemplateType = keyof typeof map;
        function getTemplateGoal(template: TemplateType): string {
            return map[template] || "";
        }
        draft.goal = getTemplateGoal(t as TemplateType);
    }

    if (!draft.content) {
        draft.content =
            "【结论】\n\n【过程】\n\n【卡点】\n\n【反思】\n\n【下一步】\n";
    }

    addTag(t);
}

const composedPreview = computed(() => {
    const lines = [];
    if (draft.title) lines.push(draft.title);
    lines.push("");

    lines.push(`时间：${draft.happenedAt || "-"}`);
    lines.push(`时长：${draft.durationMin ?? "-"} min`);
    lines.push(`专注度：${draft.focus}/5  难度：${draft.difficulty}/5`);
    if (draft.tags.length) lines.push(`标签：${draft.tags.join(", ")}`);
    if (draft.goal) lines.push(`目标：${draft.goal}`);
    lines.push("");
    lines.push(draft.content || "");
    if (draft.todos.length) {
        lines.push("");
        lines.push("下一步：");
        draft.todos.forEach((t) => lines.push(`- [${t.done ? "x" : " "}] ${t.text}`));
    }
    return lines.join("\n");
});

const wordCount = computed(() => {
    const s = `${draft.title}\n${draft.goal}\n${draft.content}`.trim();
    if (!s) return 0;
    // 粗略：中文按字符，英文按词
    const cn = (s.match(/[\u4e00-\u9fff]/g) || []).length;
    const en = (s.match(/[A-Za-z0-9_]+/g) || []).length;
    return cn + en;
});

// 草稿自动保存（简单节流）
let draftTimer: ReturnType<typeof setTimeout> | null = null;
watch(
    () => ({ ...draft, tags: [...draft.tags], todos: draft.todos.map((t) => ({ ...t })) }),
    () => {
        draftStatus.value = "未保存";
        if (draftTimer) clearTimeout(draftTimer);
        draftTimer = setTimeout(() => {
            try {
                localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
                draftStatus.value = "已保存";
            } catch {
                draftStatus.value = "保存失败（localStorage不可用）";
            }
        }, 350);
    },
    { deep: true }
);

function loadDraft() {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return;
        const obj = JSON.parse(raw);

        // 只做白名单合并
        draft.template = obj.template || "";
        draft.title = obj.title || "";
        draft.content = obj.content || "";
        draft.happenedAt = obj.happenedAt || toDatetimeLocal(new Date());
        draft.durationMin = clampInt(obj.durationMin, 0, 1440, 45);
        draft.focus = clampInt(obj.focus, 1, 5, 3);
        draft.difficulty = clampInt(obj.difficulty, 1, 5, 3);
        draft.tags = Array.isArray(obj.tags) ? obj.tags.slice(0, 20).map((x: any) => String(x).slice(0, 24)) : [];
        draft.goal = obj.goal || "";
        draft.todos = Array.isArray(obj.todos)
            ? obj.todos.slice(0, 30).map((t: any) => ({ text: String(t.text || "").slice(0, 120), done: !!t.done }))
            : [];
        draft.pinToTop = !!obj.pinToTop;

        draftStatus.value = "已加载";
    } catch {
        // ignore
    }
}

async function createPost() {
    if (createLoading.value) return;

    // 基本校验
    const title = String(draft.title || "").trim().slice(0, 120);
    const content = String(draft.content || "").trim().slice(0, 20000);

    if (!title && !content) {
        setCreateStatus("标题和内容不能同时为空", "error");
        return;
    }

    createLoading.value = true;
    setCreateStatus("保存中…", "muted");

    // 兼容后端：优先发送结构化字段；若后端拒绝（400/422），回退到 {title, content}
    const payloadRich = {
        title,
        content,
        happenedAt: draft.happenedAt || null,
        durationMin: draft.durationMin ?? null,
        focus: draft.focus ?? null,
        difficulty: draft.difficulty ?? null,
        tags: draft.tags,
        goal: draft.goal || null,
        todos: draft.todos,
        pinToTop: draft.pinToTop,
    };

    try {
        const data = await api("/api/posts", {
            method: "POST",
            body: JSON.stringify(payloadRich),
        });

        setCreateStatus(`已保存 id=${data?.id ?? "?"}`, "success");
        resetDraft(false);
        await resetAndList();
        closeComposer();
    } catch (e: any) {
        const status = e?.status;

        // fallback
        if (e?.kind === "http" && (status === 400 || status === 409 || status === 422)) {
            try {
                const data2 = await api("/api/posts", {
                    method: "POST",
                    body: JSON.stringify({ title, content }),
                });
                setCreateStatus(`已保存 id=${data2?.id ?? "?"}（后端暂不支持扩展字段，已自动兼容）`, "success");
                resetDraft(false);
                await resetAndList();
                closeComposer();
            } catch (e2: any) {
                setCreateStatus("保存失败：" + safeErr(e2?.data ?? e2), "error");
            }
        } else {
            setCreateStatus("保存失败：" + safeErr(e?.data ?? e), "error");
        }
    } finally {
        createLoading.value = false;
    }
}
async function deletePost() {
    if (!detail.post?.id) return;
    if (!confirm("确定要删除这条记录吗？这个操作无法撤销")) return;

    try {
        await api(`/api/posts/${detail.post.id}`, { method: "DELETE" });
        setCreateStatus(`已删除 id=${detail.post.id}`, "success");
        detail.open = false;
        await resetAndList();
    } catch (e: any) {
        alert("删除失败：" + safeErr(e?.data ?? e));
    }
}
/** =========================
 *  Helpers: list rendering
 *  ========================= */
function bestDate(p: any) {
    return p?.happenedAt || p?.createdAt || p?.created_at || p?.created || null;
}
function bestTags(p: any) {
    return Array.isArray(p?.tags) ? p.tags : [];
}
function formatDate(v: any) {
    try {
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return String(v);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mi = String(d.getMinutes()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    } catch {
        return String(v);
    }
}
function toDatetimeLocal(date: any) {
    const d = new Date(date);
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
function clampInt(v: any, min: number, max: number, fallback: number) {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.round(n)));
}
function safeErr(e: any): string {
    try {
        if (typeof e === "string") return e;
        if (e?.message) return e.message;
        return JSON.stringify(e);
    } catch {
        return "unknown error";
    }
}

onMounted(async () => {
    loadDraft();
    await refreshMe();
    await listPosts();
});
</script>

<style src="@/css/main.css"></style>
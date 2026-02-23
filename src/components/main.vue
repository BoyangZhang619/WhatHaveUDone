<template>
    <div class="page">
        <!-- Top bar -->
        <header class="topbar">
            <div class="topbar-left">
                <div class="brand">
                    <div class="brand-dot">
                        <span role="img" aria-label="book">📚</span>
                    </div>
                    <div class="brand-text">
                        <div class="brand-title">Study Log</div>
                        <div class="brand-sub muted">
                            <span v-if="meLoading">加载用户中…</span>
                            <span v-else-if="meUser">已登录：{{ meUser.email }}</span>
                            <span v-else>未登录 / 会话失效</span>
                        </div>
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
                        <span class="pill">模板</span>
                        <span class="pill">标签</span>
                        <span class="pill">时间</span>
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
                                <option :value="10">10</option>
                                <option :value="20">20</option>
                                <option :value="30">30</option>
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
                        <!-- Header -->
                        <header class="post-head">
                            <div class="post-title">
                                <span class="post-id muted">#{{ p.id }}</span>
                                <span class="post-title-text">{{ p.title || "(无标题)" }}</span>
                                <span v-if="p.pinToTop" class="badge">置顶</span>
                            </div>

                            <div class="post-actions">
                                <button class="btn ghost" @click="openDetail(p.id)">查看</button>
                            </div>
                        </header>

                        <!-- Meta -->
                        <div class="post-meta">
                            <span v-if="p.happenedAt">{{ formatDate(p.happenedAt) }}</span>
                            <span v-else-if="p.created_at">{{ formatDate(p.created_at) }}</span>

                            <span v-if="p.durationMin" class="sep">·</span>
                            <span v-if="p.durationMin">{{ p.durationMin }} min</span>

                            <span v-if="p.focus != null" class="sep">·</span>
                            <span v-if="p.focus != null">Focus {{ p.focus }}</span>

                            <span v-if="p.difficulty != null" class="sep">·</span>
                            <span v-if="p.difficulty != null">Diff {{ p.difficulty }}</span>

                            <span v-if="p.updated_at" class="sep">·</span>
                            <span v-if="p.updated_at" class="muted">更新 {{ formatDate(p.updated_at) }}</span>
                        </div>

                        <!-- Content -->
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

                                <ul class="todo-list">
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

                        <!-- Footer -->
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
                                <span v-if="p.created_at">创建 {{ formatDate(p.created_at) }}</span>
                            </div>
                        </footer>
                    </article>
                </div>

                <!-- Pagination -->
                <div class="pager" v-if="showPager">
                    <button class="btn ghost" :disabled="pager.page <= 1 || listLoading"
                        @click="goPage(pager.page - 1)">
                        ‹
                    </button>

                    <button v-for="it in pageItems" :key="String(it.key)" class="btn page"
                        :class="{ active: it.type === 'page' && it.value === pager.page }"
                        :disabled="it.type !== 'page' || listLoading" @click="it.type === 'page' && goPage(it.value)">
                        <span v-if="it.type === 'page'">{{ it.value }}</span>
                        <span v-else class="muted">…</span>
                    </button>

                    <button class="btn ghost" :disabled="!pager.hasNext || listLoading" @click="goPage(pager.page + 1)">
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
                                    <input v-model.number="draft.focus" type="range" min="1" max="5" step="0.1" />
                                    <div class="muted tiny">当前：{{ draft.focus }}</div>
                                </div>
                                <div class="field">
                                    <label>难度（1-5）</label>
                                    <input v-model.number="draft.difficulty" type="range" min="1" max="5" step="0.1" />
                                    <div class="muted tiny">当前：{{ draft.difficulty }}</div>
                                </div>
                            </div>

                            <div class="field">
                                <label>标签（回车添加）</label>
                                <div class="tagbox">
                                    <span class="tag" v-for="t in draft.tags" :key="t">
                                        {{ t }}
                                        <button class="tag-x" @click="removeTag(t)" aria-label="remove">×</button>
                                    </span>
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
        <transition name="overlay">
            <div v-if="detail.open" class="overlay detail" tabindex="-1">
                <div class="overlay-top">
                    <div class="overlay-title">
                        <div class="overlay-title-main">内容 #{{ detail.id }}</div>
                        <div class="muted overlay-title-sub">
                            <span v-if="detailLoading">加载中…</span>
                            <span v-else-if="detailError" class="error-inline">{{ detailError }}</span>
                            <span v-else>{{ detailSubtitle }}</span>
                        </div>
                    </div>

                    <div class="overlay-actions">
                        <button class="btn ghost" @click="detail.open = false">关闭</button>
                    </div>
                </div>

                <div class="overlay-body">
                    <div v-if="detailLoading" class="skeleton-wrap">
                        <div class="skeleton" v-for="i in 8" :key="i" />
                    </div>

                    <div v-else-if="detailError" class="errorbox">
                        读取失败：{{ detailError }}
                    </div>

                    <div v-else class="detail-body">
                        <div class="detail-title">{{ detail.post?.title || '(无标题)' }}</div>
                        <div class="muted detail-meta">
                            <span v-if="detailDate">{{ formatDate(detailDate) }}</span>
                            <span v-if="detailDate" class="dot">·</span>
                            <span v-if="detailTags.length">{{ detailTags.join(' / ') }}</span>
                        </div>

                        <pre class="detail-content">{{ detail.post?.content || '' }}</pre>

                        <div class="muted tiny" v-if="detail.post?.content && detail.post.content.length > 0">
                            提示：后端如果未来支持结构化字段（tags、happenedAt 等），这里可以做更丰富渲染。
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch, defineEmits } from "vue";

/** =========================
 *  API
 *  ========================= */
const API_BASE = "https://login.boyangzhang246.workers.dev";

const emit = defineEmits(["log-out"]);

const safeJSON = (v, fallback = []) => {
    if (Array.isArray(v)) return v
    if (!v || typeof v !== "string") return fallback
    try { return JSON.parse(v) } catch { return fallback }
}

const tagList = (p) => safeJSON(p.tags, [])
const todoList = (p) => safeJSON(p.todos, [])
async function api(path, options = {}) {
    const headers = options.headers ? { ...options.headers } : {};
    if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";

    let res;
    try {
        res = await fetch(API_BASE + path, {
            ...options,
            headers,
            credentials: "include",
        });
    } catch (err) {
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
const meUser = ref(null);
const meLoading = ref(false);

async function refreshMe() {
    meLoading.value = true;
    try {
        const data = await api("/api/me");
        meUser.value = data?.user || null;
        return meUser.value;
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
}
async function onLogout() {
    // TODO: 由你决定是否要走后端 /api/logout
    try {
        await api("/api/logout", { method: "POST" });
        emit("log-out");
    } catch {
        alert("退出登录请求失败（网络或服务器错误），但本地会话已清除。如果你仍然看到登录状态，可能是因为后端会话未成功清除。请尝试刷新页面或检查网络连接。");
    }
    await refreshMe();
    await resetAndList();
}

/** =========================
 *  List + Pagination
 *  ========================= */
const posts = ref([]);
const listLoading = ref(false);
const listError = ref("");

const pager = reactive({
    limit: 20,
    offset: 0,
    page: 1,
    total: null, // 若后端返回 total，就会启用完整页码
    hasNext: false,
});

const jumpInput = ref("");

function normalizeInt(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

async function listPosts() {
    listLoading.value = true;
    listError.value = "";

    try {
        const data = await api(`/api/posts?limit=${pager.limit}&offset=${pager.offset}`);

        const items = data?.results || [];
        posts.value = items;

        // 兼容：如果后端提供 total / count / hasNext 等字段，就用；否则用“本页满=可能还有下一页”
        const total = data?.total ?? data?.count ?? null;
        pager.total = Number.isFinite(Number(total)) ? Number(total) : null;

        pager.hasNext = typeof data?.hasNext === "boolean" ? data.hasNext : items.length === pager.limit;

        // page 从 offset 推导，避免状态错乱
        pager.page = Math.floor(pager.offset / pager.limit) + 1;
    } catch (e) {
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

function goPage(pageNum) {
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
    if (pager.total != null) return Math.ceil(pager.total / pager.limit) > 1;
    return pager.page > 1 || pager.hasNext;
});

function buildPageItems(current, totalPages, hasNext) {
    // 高级一点：窗口化 + 首尾 + 省略号
    // totalPages 为空时：不显示尾页，但保留窗口与 next
    const items = [];
    const key = (t, v) => `${t}:${v}`;

    const pushPage = (v) => items.push({ type: "page", value: v, key: key("p", v) });
    const pushEllipsis = (id) => items.push({ type: "ellipsis", key: key("e", id) });

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
const detail = reactive({
    open: false,
    id: null,
    post: null,
});
const detailLoading = ref(false);
const detailError = ref("");

async function openDetail(id) {
    detail.open = true;
    detail.id = id;
    detail.post = null;
    detailLoading.value = true;
    detailError.value = "";

    try {
        const data = await api(`/api/posts/${id}`);
        // 兼容：data.post / data
        detail.post = data?.post ?? data;
    } catch (e) {
        detailError.value = safeErr(e?.data ?? e);
    } finally {
        detailLoading.value = false;
    }
}

const detailDate = computed(() => {
    const p = detail.post || {};
    return p.happenedAt || p.createdAt || p.created_at || p.created || null;
});
const detailTags = computed(() => {
    const p = detail.post || {};
    return Array.isArray(p.tags) ? p.tags : [];
});
const detailSubtitle = computed(() => {
    const parts = [];
    if (detailDate.value) parts.push(formatDate(detailDate.value));
    if (detailTags.value.length) parts.push(detailTags.value.join(" / "));
    return parts.join(" · ") || "—";
});

/** =========================
 *  Composer (full screen)
 *  ========================= */
const composerOpen = ref(false);
const overlayEl = ref(null);

const ui = reactive({
    previewMode: false,
});

const createLoading = ref(false);
const createStatus = reactive({ msg: "", kind: "muted" });

const DRAFT_KEY = "studylog:draft:v1";
const draftStatus = ref("未保存");

const draft = reactive({
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

function setCreateStatus(msg, kind = "muted") {
    createStatus.msg = String(msg).slice(0, 1000);
    createStatus.kind = kind;
}

function addTag(raw) {
    const t = String(raw || "").trim();
    if (!t) return;
    const safe = t.slice(0, 24);
    if (!draft.tags.includes(safe)) draft.tags.push(safe);
    tagInput.value = "";
}

function removeTag(t) {
    draft.tags = draft.tags.filter((x) => x !== t);
}

function addTodo(raw) {
    const text = String(raw || "").trim();
    if (!text) return;
    draft.todos.push({ text: text.slice(0, 120), done: false });
    todoInput.value = "";
}

function removeTodo(i) {
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
        draft.title = map[t] || "";
    }

    if (!draft.goal) {
        const map = {
            reading: "读完并提炼 3 个关键点 + 1 个可复用结论",
            coding: "完成一个可运行的最小示例并总结坑点",
            lecture: "整理讲义要点，写出 1 个可迁移的方法",
            review: "梳理问题—原因—改进—下一步",
        };
        draft.goal = map[t] || "";
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
let draftTimer = null;
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
        draft.tags = Array.isArray(obj.tags) ? obj.tags.slice(0, 20).map((x) => String(x).slice(0, 24)) : [];
        draft.goal = obj.goal || "";
        draft.todos = Array.isArray(obj.todos)
            ? obj.todos.slice(0, 30).map((t) => ({ text: String(t.text || "").slice(0, 120), done: !!t.done }))
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
        console.log("创建成功", data);
        resetDraft(false);
        await resetAndList();
        closeComposer();
    } catch (e) {
        const status = e?.status;

        // fallback
        if (e?.kind === "http" && (status === 400 || status === 409 || status === 422)) {
            try {
                const data2 = await api("/api/posts", {
                    method: "POST",
                    body: JSON.stringify({ title, content }),
                });
                setCreateStatus(`已保存 id=${data2?.id ?? "?"}（后端暂不支持扩展字段，已自动兼容）`, "success");
                console.log("创建成功", data2);
                resetDraft(false);
                await resetAndList();
                closeComposer();
            } catch (e2) {
                setCreateStatus("保存失败：" + safeErr(e2?.data ?? e2), "error");
            }
        } else {
            setCreateStatus("保存失败：" + safeErr(e?.data ?? e), "error");
        }
    } finally {
        createLoading.value = false;
    }
}

/** =========================
 *  Helpers: list rendering
 *  ========================= */
function bestDate(p) {
    return p?.happenedAt || p?.createdAt || p?.created_at || p?.created || null;
}
function bestTags(p) {
    return Array.isArray(p?.tags) ? p.tags : [];
}
function formatDate(v) {
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
function toDatetimeLocal(date) {
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
function clampInt(v, min, max, fallback) {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.round(n)));
}
function safeErr(e) {
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
<template>
  <div class="page">
    <!-- 顶栏（块 1：去 settings） -->
    <header class="topbar">
      <div class="brand">
        <div class="logo">📚</div>
        <div class="title">
          <div class="name">Study Log</div>
          <div class="subtitle">跨域 Session · 记录你的学习轨迹</div>
        </div>
      </div>

      <div class="top-actions">
        <div class="user-chip" v-if="me.email">
          <span class="dot"></span>
          <span class="email">{{ me.email }}</span>
        </div>

        <button class="btn ghost" @click="refreshAll" :disabled="busy.refresh">
          {{ busy.refresh ? '刷新中…' : '刷新' }}
        </button>

        <button class="btn ghost" @click="goSettings">
          Settings
        </button>

        <button class="btn danger" @click="logout" :disabled="busy.logout">
          {{ busy.logout ? '退出中…' : '退出登录' }}
        </button>
      </div>
    </header>

    <main class="content">
      <!-- 左侧：新增记录块（块 2：点击全屏） -->
      <section class="card create-card" @click="openComposer">
        <div class="card-head">
          <h3>新增记录</h3>
          <span class="hint">点击展开全屏编辑</span>
        </div>
        <div class="create-preview">
          <div class="preview-line">
            <span class="k">标题</span>
            <span class="v">{{ draft.title || '（可空）' }}</span>
          </div>
          <div class="preview-line">
            <span class="k">时间</span>
            <span class="v">{{ prettyTime(draft.startedAt) }}</span>
          </div>
          <div class="preview-line">
            <span class="k">时长</span>
            <span class="v">{{ draft.durationMin }} 分钟</span>
          </div>
          <div class="preview-line">
            <span class="k">标签</span>
            <span class="v">{{ draft.tags.length ? draft.tags.join(' · ') : '（可空）' }}</span>
          </div>
          <div class="preview-line last">
            <span class="k">详述</span>
            <span class="v muted">{{ draft.detail ? shrink(draft.detail, 60) : '（点击后输入详述）' }}</span>
          </div>
        </div>
        <div class="create-footer">
          <button class="btn primary" @click.stop="openComposer">写一条</button>
        </div>
      </section>

      <!-- 右侧：列表块（块 3：输出 + 分页） -->
      <section class="card list-card">
        <div class="card-head">
          <div class="head-left">
            <h3>全部记录</h3>
            <span class="hint">limit/offset 分页</span>
          </div>

          <div class="head-right">
            <div class="search">
              <input
                v-model="query.q"
                class="input"
                placeholder="搜索标题/内容（前端过滤）"
                @keydown.enter="applyFilter"
              />
              <button class="btn ghost" @click="applyFilter">搜索</button>
            </div>
          </div>
        </div>

        <div class="status" v-if="status.msg" :class="status.kind">
          {{ status.msg }}
        </div>

        <div class="list-body">
          <div v-if="busy.list" class="skeleton">
            <div class="sk-line" v-for="i in 6" :key="i"></div>
          </div>

          <template v-else>
            <div v-if="!items.length" class="empty">
              <div class="empty-title">暂无记录</div>
              <div class="empty-sub">点左边“新增记录”开始写第一条。</div>
            </div>

            <ul v-else class="records">
              <li
                v-for="p in items"
                :key="p.id"
                class="record"
                @click="openDetail(p.id)"
              >
                <div class="record-main">
                  <div class="record-title">
                    <span class="id">#{{ p.id }}</span>
                    <span class="t">{{ p.title || '（无标题）' }}</span>
                  </div>

                  <div class="record-meta">
                    <span class="pill">{{ fmtDateTime(p.created_at) }}</span>
                    <span class="pill" v-if="p.updated_at">更新 {{ fmtDateTime(p.updated_at) }}</span>
                    <span class="pill soft" v-if="p.__parsed?.tags?.length">
                      {{ p.__parsed.tags.slice(0, 3).join(' · ') }}<span v-if="p.__parsed.tags.length > 3">…</span>
                    </span>
                    <span class="pill soft" v-if="p.__parsed?.durationMin">
                      {{ p.__parsed.durationMin }}min
                    </span>
                  </div>

                  <div class="record-preview">
                    {{ p.preview || '（无预览）' }}
                  </div>
                </div>

                <div class="record-actions">
                  <button class="btn tiny ghost" @click.stop="openDetail(p.id)">查看</button>
                </div>
              </li>
            </ul>
          </template>
        </div>

        <!-- 分页控件：高级一点的样式/逻辑（无 total 的 offset 分页） -->
        <div class="pager">
          <div class="pager-left">
            <span class="muted">每页</span>
            <select v-model.number="pager.limit" class="select" @change="goPage(1)">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
            <span class="muted">条</span>

            <span class="sep"></span>

            <span class="muted">第</span>
            <input
              class="jump"
              v-model="pager.jumpText"
              placeholder="页码"
              @keydown.enter="jumpToPage"
            />
            <button class="btn ghost" @click="jumpToPage">跳转</button>
          </div>

          <div class="pager-right">
            <button class="btn ghost" @click="goFirst" :disabled="pager.page === 1 || busy.list">«</button>
            <button class="btn ghost" @click="goPrev" :disabled="pager.page === 1 || busy.list">‹</button>

            <button
              v-for="n in pageButtons"
              :key="n.key"
              class="btn ghost page"
              :class="{ active: n.type === 'page' && n.value === pager.page, dots: n.type === 'dots' }"
              :disabled="n.type !== 'page' || busy.list"
              @click="n.type === 'page' && goPage(n.value)"
            >
              {{ n.label }}
            </button>

            <button class="btn ghost" @click="goNext" :disabled="!pager.hasNext || busy.list">›</button>
            <button class="btn ghost" @click="goLastHint" :disabled="!pager.hasNext || busy.list">»</button>
          </div>
        </div>
      </section>
    </main>

    <!-- 全屏编辑器（覆盖全屏） -->
    <transition name="fade">
      <div v-if="composer.open" class="overlay" @keydown.esc="closeComposer" tabindex="-1">
        <div class="composer">
          <div class="composer-top">
            <div class="composer-title">
              <h2>记录一次学习</h2>
              <div class="muted">建议：写下主题、过程、收获、下一步</div>
            </div>
            <div class="composer-actions">
              <button class="btn ghost" @click="applyTemplate('review')">复盘模板</button>
              <button class="btn ghost" @click="applyTemplate('practice')">练习模板</button>
              <button class="btn ghost" @click="applyTemplate('reading')">阅读模板</button>
              <button class="btn ghost" @click="closeComposer">关闭</button>
            </div>
          </div>

          <div class="composer-body">
            <div class="grid">
              <div class="field">
                <label>标题（可空）</label>
                <input class="input" v-model="draft.title" placeholder="比如：Vue 组件通信/算法复习/英语精听…" />
              </div>

              <div class="field">
                <label>开始时间</label>
                <input class="input" type="datetime-local" v-model="draft.startedAt" />
              </div>

              <div class="field">
                <label>时长（分钟）</label>
                <div class="row">
                  <input class="range" type="range" min="5" max="240" step="5" v-model.number="draft.durationMin" />
                  <div class="badge">{{ draft.durationMin }} min</div>
                </div>
              </div>

              <div class="field">
                <label>标签（逗号分隔）</label>
                <input class="input" v-model="draft.tagsText" placeholder="Vue, 后端, 英语, LeetCode…" @blur="syncTags" />
                <div class="tagline" v-if="draft.tags.length">
                  <span class="tag" v-for="t in draft.tags" :key="t">{{ t }}</span>
                </div>
              </div>

              <div class="field">
                <label>心情</label>
                <select class="select" v-model="draft.mood">
                  <option value="🙂">🙂 平稳</option>
                  <option value="😄">😄 开心</option>
                  <option value="😮">😮 惊喜</option>
                  <option value="😵">😵 疲惫</option>
                  <option value="😤">😤 焦虑</option>
                </select>
              </div>

              <div class="field">
                <label>专注度（1-5）</label>
                <div class="stars">
                  <button
                    v-for="i in 5"
                    :key="i"
                    class="star"
                    :class="{ on: i <= draft.focus }"
                    @click="draft.focus = i"
                    type="button"
                  >
                    ★
                  </button>
                </div>
              </div>

              <div class="field full">
                <label>详述（建议写：做了什么、遇到什么、怎么解决、收获、下一步）</label>
                <textarea class="textarea" v-model="draft.detail" placeholder="今天学了什么？为什么？卡点在哪？下一步做什么？"></textarea>
              </div>

              <div class="field full">
                <label>下一步（可选）</label>
                <input class="input" v-model="draft.next" placeholder="下一次继续：…" />
              </div>
            </div>
          </div>

          <div class="composer-bottom">
            <div class="muted">
              提示：这条记录会以 JSON 存在 content 字段里（不改后端也能保存结构化信息）。
            </div>
            <div class="composer-bottom-actions">
              <button class="btn ghost" @click="resetDraft" :disabled="busy.create">重置</button>
              <button class="btn primary" @click="createPost" :disabled="busy.create">
                {{ busy.create ? '保存中…' : '保存记录' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 详情抽屉（查看单条） -->
    <transition name="slide">
      <div v-if="detail.open" class="drawer">
        <div class="drawer-top">
          <div class="drawer-title">
            <div class="muted">记录 #{{ detail.id }}</div>
            <div class="drawer-h">{{ detail.data?.title || '（无标题）' }}</div>
          </div>
          <button class="btn ghost" @click="closeDetail">关闭</button>
        </div>

        <div class="drawer-body" v-if="detail.loading">
          <div class="sk-line" v-for="i in 8" :key="i"></div>
        </div>

        <div class="drawer-body" v-else>
          <div class="kv">
            <div class="kv-item"><span class="k">时间</span><span class="v">{{ fmtDateTime(detail.parsed?.startedAt || detail.data?.created_at) }}</span></div>
            <div class="kv-item" v-if="detail.parsed?.durationMin"><span class="k">时长</span><span class="v">{{ detail.parsed.durationMin }} 分钟</span></div>
            <div class="kv-item" v-if="detail.parsed?.mood"><span class="k">心情</span><span class="v">{{ detail.parsed.mood }}</span></div>
            <div class="kv-item" v-if="detail.parsed?.focus"><span class="k">专注</span><span class="v">{{ detail.parsed.focus }}/5</span></div>
          </div>

          <div class="tags" v-if="detail.parsed?.tags?.length">
            <span class="tag" v-for="t in detail.parsed.tags" :key="t">{{ t }}</span>
          </div>

          <div class="section">
            <div class="section-h">详述</div>
            <pre class="pre">{{ detail.parsed?.detail || detail.data?.content || '' }}</pre>
          </div>

          <div class="section" v-if="detail.parsed?.next">
            <div class="section-h">下一步</div>
            <div class="text">{{ detail.parsed.next }}</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
// import { useRouter } from 'vue-router';

// ✅ 跨域 API 域名
const API_BASE = "https://login.boyangzhang246.workers.dev";

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
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

  if (!res.ok) {
    throw { kind: "http", status: res.status, statusText: res.statusText, data };
  }
  return data;
}

function shrink(s, n) {
  const t = String(s || '');
  if (t.length <= n) return t;
  return t.slice(0, n) + '…';
}

function fmtDateTime(input) {
  if (!input) return '—';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  return d.toLocaleString();
}

function prettyTime(dtLocal) {
  if (!dtLocal) return '（未选择）';
  const d = new Date(dtLocal);
  if (Number.isNaN(d.getTime())) return String(dtLocal);
  return d.toLocaleString();
}

function safeParseJsonMaybe(s) {
  if (!s || typeof s !== 'string') return null;
  const t = s.trim();
  if (!(t.startsWith('{') && t.endsWith('}'))) return null;
  try { return JSON.parse(t); } catch { return null; }
}

// const router = useRouter?.();

// 顶部状态
const me = reactive({ email: '' });
const status = reactive({ msg: '', kind: 'muted' }); // kind: muted/success/error
const busy = reactive({ refresh: false, list: false, create: false, logout: false });

// 查询 & 列表数据
const query = reactive({ q: '' });
const rawItems = ref([]); // 原始 results
const items = computed(() => {
  const q = query.q.trim().toLowerCase();
  let list = rawItems.value.map(p => {
    // 尝试解析 preview 里是否是 JSON（通常 preview 截断，解析意义不大）
    // 这里优先等 detail 拉单条再解析；但 tags/duration 等想在列表显示，就尝试从 preview/content推断
    const parsed = safeParseJsonMaybe(p.preview);
    return { ...p, __parsed: parsed || null };
  });

  // 前端搜索（不改后端）
  if (!q) return list;
  return list.filter(p =>
    String(p.title || '').toLowerCase().includes(q) ||
    String(p.preview || '').toLowerCase().includes(q)
  );
});

// 分页（offset 体系：无 total）
const pager = reactive({
  limit: 20,
  page: 1,
  hasNext: false,   // 由本页是否满额推断
  jumpText: '',
});

function offsetOf(page) {
  return (page - 1) * pager.limit;
}

// “高级”页码按钮（在没有 total 的情况下：
// - 永远显示 1
// - 显示当前页附近窗口（±2）
// - 如果存在下一页（hasNext），在右侧允许扩展
const pageButtons = computed(() => {
  const p = pager.page;
  const hasNext = pager.hasNext;

  const windowSize = 2;
  const start = Math.max(1, p - windowSize);
  const end = hasNext ? (p + windowSize) : p;

  const btns = [];

  // always show first page
  btns.push({ key: 'p1', type: 'page', value: 1, label: '1' });

  if (start > 2) btns.push({ key: 'dotsL', type: 'dots', label: '…' });

  for (let i = Math.max(2, start); i <= end; i++) {
    btns.push({ key: `p${i}`, type: 'page', value: i, label: String(i) });
  }

  // 如果本页满额，意味着“可能还有更多页”，给一个右侧省略号提示
  if (hasNext) btns.push({ key: 'dotsR', type: 'dots', label: '…' });

  return btns;
});

function setStatus(msg, kind = 'muted') {
  status.msg = String(msg || '').slice(0, 500);
  status.kind = kind;
}

// 身份与列表
async function refreshMe() {
  try {
    const data = await api('/api/me');
    me.email = data?.user?.email || '';
    return true;
  } catch {
    me.email = '';
    return false;
  }
}

async function listPosts() {
  busy.list = true;
  try {
    const limit = pager.limit;
    const offset = offsetOf(pager.page);
    const data = await api(`/api/posts?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`);

    const results = data?.results || [];
    rawItems.value = results;

    // 无 total 情况下：如果本页条数 == limit，认为“可能还有下一页”
    pager.hasNext = results.length === limit;

    if (!me.email) setStatus('未登录 / 会话失效', 'muted');
    else setStatus('', 'muted');
  } catch (e) {
    if (e.kind === 'http' && e.status === 401) {
      rawItems.value = [];
      pager.hasNext = false;
      setStatus('未登录，无法加载列表', 'error');
      return;
    }
    setStatus(`加载失败：${e?.data?.error || e?.message || JSON.stringify(e)}`, 'error');
  } finally {
    busy.list = false;
  }
}

async function refreshAll() {
  busy.refresh = true;
  try {
    await refreshMe();
    await listPosts();
  } finally {
    busy.refresh = false;
  }
}

function applyFilter() {
  // 前端过滤不需要重新请求，但你可以这里也顺便刷新
  // listPosts();
}

// 分页动作
function goPage(n) {
  const page = Math.max(1, Number(n) || 1);
  pager.page = page;
  pager.jumpText = '';
  listPosts();
}
function goFirst() { if (pager.page !== 1) goPage(1); }
function goPrev() { if (pager.page > 1) goPage(pager.page - 1); }
function goNext() { if (pager.hasNext) goPage(pager.page + 1); }
// 没 total 的“末页”无法准确到达，这里做一个“快速向后翻几页”的高级体验：一次跳 5 页
function goLastHint() {
  if (!pager.hasNext) return;
  goPage(pager.page + 5);
}
function jumpToPage() {
  const n = parseInt(pager.jumpText, 10);
  if (!Number.isFinite(n) || n <= 0) {
    setStatus('请输入有效页码', 'error');
    return;
  }
  goPage(n);
}

// Settings 导航
// function goSettings() {
//   if (router?.push) router.push({ name: 'setting' }).catch(() => {});
//   else window.location.href = '/setting';
// }

// 登出
async function logout() {
  busy.logout = true;
  try {
    await api('/api/logout', { method: 'POST' });
  } catch {}
  await refreshAll();
  busy.logout = false;
}

// ===== 全屏新增记录（composer） =====
const composer = reactive({ open: false });

const draft = reactive({
  title: '',
  detail: '',
  startedAt: toLocalDateTime(new Date()),
  durationMin: 45,
  tagsText: '',
  tags: [],
  mood: '🙂',
  focus: 3,
  next: '',
});

function toLocalDateTime(d) {
  // yyyy-MM-ddThh:mm
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
}

function syncTags() {
  const raw = String(draft.tagsText || '');
  const arr = raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 12);
  draft.tags = Array.from(new Set(arr));
  draft.tagsText = draft.tags.join(', ');
}

function openComposer() {
  composer.open = true;
  // 保证 tags 同步
  syncTags();
  // focus 到 overlay，避免滚动穿透
  setTimeout(() => {
    const el = document.querySelector('.overlay');
    el?.focus?.();
  }, 0);
}

function closeComposer() {
  composer.open = false;
}

function resetDraft() {
  draft.title = '';
  draft.detail = '';
  draft.startedAt = toLocalDateTime(new Date());
  draft.durationMin = 45;
  draft.tagsText = '';
  draft.tags = [];
  draft.mood = '🙂';
  draft.focus = 3;
  draft.next = '';
}

function applyTemplate(type) {
  if (type === 'review') {
    draft.detail = [
      '【学了什么】',
      '【卡点】',
      '【怎么解决】',
      '【收获】',
      '【下一步】',
    ].join('\n');
  } else if (type === 'practice') {
    draft.detail = [
      '【目标】',
      '【练习内容】',
      '【错误/坑】',
      '【总结】',
      '【复习计划】',
    ].join('\n');
  } else if (type === 'reading') {
    draft.detail = [
      '【书/文章】',
      '【关键点】',
      '【疑问】',
      '【我的理解】',
      '【可行动点】',
    ].join('\n');
  }
}

async function createPost() {
  if (!me.email) {
    setStatus('请先登录再保存', 'error');
    return;
  }
  busy.create = true;
  try {
    syncTags();

    // 将结构化数据放在 content 里，后端不改 schema 也能保存
    const payload = {
      type: 'study_log_v1',
      title: draft.title || '',
      detail: draft.detail || '',
      startedAt: draft.startedAt || null,
      durationMin: draft.durationMin || null,
      tags: draft.tags || [],
      mood: draft.mood || null,
      focus: draft.focus || null,
      next: draft.next || '',
      createdAtClient: new Date().toISOString(),
    };

    const res = await api('/api/posts', {
      method: 'POST',
      body: JSON.stringify({
        title: payload.title,
        content: JSON.stringify(payload),
      }),
    });

    setStatus(`已保存：#${res?.id ?? ''}`, 'success');
    closeComposer();
    resetDraft();
    // 保存后回到第一页看最新
    pager.page = 1;
    await listPosts();
  } catch (e) {
    setStatus(`保存失败：${e?.data?.error || e?.data?.message || e?.message || JSON.stringify(e)}`, 'error');
  } finally {
    busy.create = false;
  }
}

// ===== 详情查看（drawer） =====
const detail = reactive({
  open: false,
  loading: false,
  id: null,
  data: null,
  parsed: null,
});

async function openDetail(id) {
  detail.open = true;
  detail.loading = true;
  detail.id = id;
  detail.data = null;
  detail.parsed = null;

  try {
    const data = await api(`/api/posts/${id}`);
    const post = data?.post || null;
    detail.data = post;

    // content 可能是 JSON（study_log_v1），也可能是纯文本
    const parsed = safeParseJsonMaybe(post?.content);
    detail.parsed = parsed || null;
  } catch (e) {
    setStatus(`读取失败：${e?.data?.error || e?.message || JSON.stringify(e)}`, 'error');
  } finally {
    detail.loading = false;
  }
}

function closeDetail() {
  detail.open = false;
  detail.id = null;
  detail.data = null;
  detail.parsed = null;
}

onMounted(async () => {
  await refreshAll();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f7f8;
  color: #111;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(247, 247, 248, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0,0,0,0.06);
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #fff;
  display: grid;
  place-items: center;
  border: 1px solid rgba(0,0,0,0.06);
}
.title .name {
  font-weight: 700;
  font-size: 16px;
}
.title .subtitle {
  font-size: 12px;
  color: #777;
  margin-top: 2px;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.user-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 999px;
}
.user-chip .dot {
  width: 8px;
  height: 8px;
  background: #19c37d;
  border-radius: 50%;
}
.user-chip .email {
  font-size: 12px;
  color: #333;
}

.content {
  padding: 18px;
  display: grid;
  gap: 14px;
  grid-template-columns: 380px 1fr;
  align-items: start;
}

@media (max-width: 980px) {
  .content {
    grid-template-columns: 1fr;
  }
}

.card {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.04);
  overflow: hidden;
}

.card-head {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-head h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.hint {
  font-size: 12px;
  color: #888;
}

.create-card {
  cursor: pointer;
}
.create-preview {
  padding: 14px 16px;
}
.preview-line {
  display: grid;
  grid-template-columns: 52px 1fr;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px dashed rgba(0,0,0,0.06);
}
.preview-line.last {
  border-bottom: none;
}
.preview-line .k {
  font-size: 12px;
  color: #888;
}
.preview-line .v {
  font-size: 13px;
  color: #222;
}
.muted {
  color: #888;
}

.create-footer {
  padding: 14px 16px;
  border-top: 1px solid rgba(0,0,0,0.06);
  display: flex;
  justify-content: flex-end;
}

.list-card .head-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.search {
  display: flex;
  gap: 8px;
  align-items: center;
}
.input, .select, .textarea {
  width: 100%;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 10px;
  padding: 10px 12px;
  outline: none;
  background: #fff;
  font-size: 13px;
}
.input:focus, .textarea:focus, .select:focus {
  border-color: rgba(0,0,0,0.4);
  box-shadow: 0 0 0 4px rgba(0,0,0,0.04);
}

.textarea {
  min-height: 220px;
  resize: vertical;
  line-height: 1.5;
}

.status {
  padding: 10px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  font-size: 13px;
}
.status.success { color: #0b6; background: #f0fff7; }
.status.error { color: #b00020; background: #fff5f5; }
.status.muted { color: #666; background: #fafafa; }

.list-body {
  padding: 12px 12px 6px;
}

.records {
  margin: 0;
  padding: 0;
  list-style: none;
}
.record {
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 14px;
  padding: 12px 12px;
  margin: 10px 4px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.record:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.06);
}
.record-title {
  display: flex;
  gap: 8px;
  align-items: baseline;
  font-weight: 700;
  font-size: 14px;
}
.record-title .id {
  color: #666;
  font-weight: 600;
}
.record-title .t {
  color: #111;
}
.record-meta {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pill {
  font-size: 11px;
  padding: 5px 8px;
  border-radius: 999px;
  background: #f3f3f4;
  color: #444;
}
.pill.soft {
  background: #f7f7f8;
  color: #666;
}
.record-preview {
  margin-top: 8px;
  font-size: 12px;
  color: #444;
  line-height: 1.4;
  max-width: 720px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.record-actions {
  display: flex;
  align-items: flex-start;
}

.empty {
  padding: 18px;
  text-align: center;
}
.empty-title {
  font-weight: 800;
  margin-bottom: 6px;
}
.empty-sub {
  color: #777;
  font-size: 13px;
}

.skeleton {
  padding: 10px;
}
.sk-line {
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, #f0f0f0, #fafafa, #f0f0f0);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  margin: 12px 6px;
}
@keyframes shimmer {
  0% { background-position: 0% 0; }
  100% { background-position: 200% 0; }
}

/* buttons */
.btn {
  border: 1px solid rgba(0,0,0,0.12);
  background: #fff;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.btn:hover { transform: translateY(-1px); box-shadow: 0 10px 20px rgba(0,0,0,0.06); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

.btn.primary {
  background: #111;
  color: #fff;
  border-color: #111;
}
.btn.ghost {
  background: #fff;
}
.btn.danger {
  background: #fff;
  color: #b00020;
  border-color: rgba(176,0,32,0.35);
}
.btn.tiny {
  padding: 7px 10px;
  font-size: 12px;
}
.btn.page.active {
  background: #111;
  color: #fff;
  border-color: #111;
}
.btn.page.dots {
  cursor: default;
  opacity: 0.8;
}
.btn.page.dots:hover {
  transform: none;
  box-shadow: none;
}

/* pager */
.pager {
  border-top: 1px solid rgba(0,0,0,0.06);
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.pager-left, .pager-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sep {
  width: 1px;
  height: 18px;
  background: rgba(0,0,0,0.08);
  margin: 0 6px;
}
.jump {
  width: 80px;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 10px;
  padding: 8px 10px;
  outline: none;
  font-size: 13px;
}

/* overlay composer */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: grid;
  place-items: center;
  z-index: 50;
  padding: 18px;
  outline: none;
}
.composer {
  width: min(980px, 100%);
  height: min(92vh, 820px);
  background: #fff;
  border-radius: 18px;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 30px 80px rgba(0,0,0,0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.composer-top {
  padding: 16px 18px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}
.composer-top h2 {
  margin: 0 0 4px;
  font-size: 18px;
}
.composer-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.composer-body {
  padding: 16px 18px;
  overflow: auto;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.field.full {
  grid-column: 1 / -1;
}
.field label {
  display: block;
  font-size: 12px;
  color: #666;
  margin: 0 0 6px 4px;
}
.row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.range {
  flex: 1;
}
.badge {
  padding: 7px 10px;
  border-radius: 999px;
  background: #f3f3f4;
  font-size: 12px;
  color: #333;
}
.tagline {
  margin-top: 8px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.tag {
  font-size: 11px;
  padding: 5px 8px;
  border-radius: 999px;
  background: #f7f7f8;
  border: 1px solid rgba(0,0,0,0.08);
  color: #444;
}
.stars {
  display: flex;
  gap: 6px;
}
.star {
  border: 1px solid rgba(0,0,0,0.12);
  background: #fff;
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
}
.star.on {
  background: #111;
  color: #fff;
  border-color: #111;
}
.composer-bottom {
  padding: 14px 18px;
  border-top: 1px solid rgba(0,0,0,0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.composer-bottom-actions {
  display: flex;
  gap: 10px;
}

/* drawer */
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: min(480px, 92vw);
  height: 100vh;
  background: #fff;
  border-left: 1px solid rgba(0,0,0,0.08);
  box-shadow: -30px 0 80px rgba(0,0,0,0.18);
  z-index: 60;
  display: flex;
  flex-direction: column;
}
.drawer-top {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.drawer-h {
  font-weight: 800;
  font-size: 16px;
  margin-top: 4px;
}
.drawer-body {
  padding: 14px 16px;
  overflow: auto;
}
.kv {
  display: grid;
  gap: 10px;
  margin-bottom: 12px;
}
.kv-item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
}
.kv-item .k {
  color: #666;
}
.kv-item .v {
  color: #111;
  font-weight: 600;
}
.section {
  margin-top: 14px;
}
.section-h {
  font-weight: 800;
  margin-bottom: 8px;
}
.pre {
  white-space: pre-wrap;
  background: #fafafa;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 12px;
  padding: 12px;
  line-height: 1.45;
}
.text {
  font-size: 13px;
  color: #333;
}

/* transitions */
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform .22s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>
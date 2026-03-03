<!-- markdownlint-disable -->

# Composables 技术文档

> 本目录下的 composable 由原 `src/js/` 与 `src/ts/` 中的单体脚本拆分而来，遵循 Vue 3 Composition API 的 **逻辑抽离** 模式。  
> 每个 composable 均为一个纯函数（或导出一组纯函数），在 `<script setup>` 的 setup 上下文中调用，返回响应式状态与操作方法。

---

## 目录

| 文件 | 职责 | 消费方 |
| ------ | ------ | -------- |
| `useApi.ts` | HTTP 请求基础层 | 全局 |
| `useHelpers.ts` | 通用工具函数集 | 全局 |
| `useSettingsStorage.ts` | localStorage 持久化 | Setting 系列 |
| `useSettingState.ts` | 设置页响应式状态树 | `setting.vue` |
| `useGeneralSettings.ts` | 通用设置操作 | `setting.vue` |
| `useStyleSettings.ts` | 外观设置操作 | `setting.vue` |
| `useAccountSettings.ts` | 账户设置操作 | `setting.vue` |
| `useNotificationSettings.ts` | 通知与提醒操作 | `setting.vue` |
| `useAboutSettings.ts` | 关于 / 重置操作 | `setting.vue` |
| `useAuth.ts` | 用户认证 & 顶栏 | `main.vue` |
| `usePosts.ts` | 帖子列表 & 分页 | `main.vue` |
| `usePostDetail.ts` | 帖子详情查看 | `main.vue` |
| `useComposer.ts` | 全屏编辑器 (Composer) | `main.vue` |
| `useLoginForm.ts` | 登录表单状态 & 校验 | `login.vue` |
| `useLoginActions.ts` | 登录/注册/登出 API | `login.vue` |
| `useLoginUtils.ts` | IP 获取 / 语言切换 / 帮助 | `login.vue` |
| `index.ts` | Barrel 统一导出 | — |

---

## 共享层

### `useApi.ts`

**文件路径：** `src/composables/useApi.ts`

全局 HTTP 请求封装。不是一个 composable 工厂函数，而是直接导出一个 **异步函数** `api()`，供所有需要与后端通信的 composable 调用。

#### 签名

```ts
export async function api(
  path: string,
  options: {
    method: "GET" | "POST" | "PUT" | "DELETE";
    headers?: any;
    body?: string;
  } = { method: "GET" }
): Promise<any>
```

#### 核心行为

1. **Base URL 解析** — 从 `import.meta.env.VITE_API_BASE` 读取 API 前缀，缺省为空字符串（即同源请求）。
2. **自动 Content-Type** — 当传入 `body` 且未显式指定 `Content-Type` 时，自动设为 `application/json`。
3. **凭证携带** — 所有请求均设置 `credentials: "include"`，确保 cookie 随请求发送，支撑基于 session 的认证。
4. **双层错误模型**：
   - **网络层失败**：`catch` 到 `fetch` 异常时抛出 `{ kind: "network", message, err }`。
   - **HTTP 层失败**：`res.ok === false` 时抛出 `{ kind: "http", status, statusText, data }`。
5. **安全解析** — 响应体先以 `text()` 读取，再尝试 `JSON.parse`；若解析失败，则以 `{ raw: text }` 兜底，避免非 JSON 响应导致崩溃。

#### 典型调用

```ts
// GET
const data = await api("/api/me");

// POST with body
await api("/api/posts", {
  method: "POST",
  body: JSON.stringify({ title, content }),
});

// DELETE
await api(`/api/posts/${id}`, { method: "DELETE" });
```

#### 被依赖方

`useAuth`, `usePosts`, `usePostDetail`, `useComposer`, `useAccountSettings`, `useLoginActions` 均直接 `import { api } from "./useApi"`。

---

### `useHelpers.ts`

**文件路径：** `src/composables/useHelpers.ts`

无状态工具函数集合。不依赖 Vue 响应式系统，也不调用任何 composable，因此可在任何上下文中安全使用。

#### 导出一览

| 函数 | 签名 | 说明 |
| ------ | ------ | ------ |
| `formatDate` | `(v: any) => string` | 将任意值转为 `YYYY-MM-DD HH:mm` 格式；解析失败时降级为 `String(v)` |
| `toDatetimeLocal` | `(date: any) => string` | 转为 `<input type="datetime-local">` 所需的 `YYYY-MM-DDTHH:mm` 格式 |
| `clampInt` | `(v, min, max, fallback) => number` | 将值钳位到 `[min, max]` 区间并取整；非有限数返回 `fallback` |
| `safeErr` | `(e: any) => string` | 从未知异常中提取可读消息：优先取 `e.message`，否则 `JSON.stringify(e)`，最终兜底 `"unknown error"` |
| `normalizeInt` | `(v, fallback?) => number` | 将字符串/数字安全转为整数，`NaN`/`null`/`undefined` 返回 `fallback`（默认 `0`） |
| `safeJSON` | `(v, fallback?) => any[]` | 安全解析 JSON 字符串为数组；若 `v` 本身已是数组则直接返回；解析失败返回 `fallback`（默认 `[]`） |
| `tagList` | `(p: any) => any[]` | 快捷方式：`safeJSON(p.tags, [])` |
| `todoList` | `(p: any) => any[]` | 快捷方式：`safeJSON(p.todos, [])` |

#### 设计要点

- `clampInt` 在 `useComposer.loadDraft()` 中保护草稿恢复时的数值范围，例如 `clampInt(obj.durationMin, 0, 1440, 45)`。
- `safeErr` 同时处理网络异常（原生 `Error`）和 `useApi` 抛出的结构化错误对象 `{ kind, message, data }`。
- `tagList` / `todoList` 是对 `safeJSON` 的语义化封装，因为后端存储 tags/todos 可能是 JSON 字符串或已解析数组。

---

### `useSettingsStorage.ts`

**文件路径：** `src/composables/useSettingsStorage.ts`

封装 `localStorage` 中设置数据的读写，所有 Setting 系列 composable 的持久化统一通过此模块进行。

#### 导出

```ts
export const STORAGE_KEY = "whatIveDone_settings";

export function loadSettings(): Record<string, any>;
export function saveSettings(patch: Record<string, any>): void;
export function load<T>(key: string, fallback: T): T;
```

#### 行为描述

| 符号 | 说明 |
| ------ | ------ |
| `STORAGE_KEY` | 常量 `"whatIveDone_settings"`，作为 localStorage 中设置对象的唯一键名 |
| `loadSettings()` | 读取并 `JSON.parse` 整个设置对象；解析失败时返回空对象 `{}`，保证调用方不会拿到 `null` |
| `saveSettings(patch)` | **合并写入**：先 `loadSettings()` 获取当前值，再展开 `patch`，最终 `JSON.stringify` 写回。调用方只需传入变化的字段 |
| `load<T>(key, fallback)` | 从设置对象中读取单个字段；不存在时返回 `fallback`。泛型 `T` 保证类型推导 |

#### 典型使用

```ts
// useSettingState.ts 中初始化 reactive 的默认值
pageSize: load<number>("pageSize", 10),
sortOrder: load<string>("sortOrder", "newest"),

// useGeneralSettings.ts 中写入变更
saveSettings({ pageSize: current.pageSize });

// useAboutSettings.ts 中重置时直接移除
localStorage.removeItem(STORAGE_KEY);
```

---

## Setting 页面

### `useSettingState.ts`

**文件路径：** `src/composables/useSettingState.ts`

设置页面的 **中央状态仓库**。所有子级 Settings composable 都接收从此处解构出的 `current` 和 `setStatus` 作为参数。

#### 依赖

```ts
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { load } from "./useSettingsStorage";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/i18n";
```

> ⚠️ 内部调用了 `useI18n()`，因此 **必须** 在 `<script setup>` 的 setup 上下文中调用。

#### 返回值

| 名称 | 类型 | 说明 |
| ------ | ------ | ------ |
| `displayState` | `Ref<"general" \| "style" \| "account" \| "notification" \| "about" \| "">` | 当前展开的设置面板折叠状态 |
| `current` | `reactive({...})` | 所有设置项的响应式对象，字段从 `load()` 初始化；覆盖通用、外观、通知三大分类共 18 个字段 |
| `languageOptions` | `SUPPORTED_LOCALES` | i18n 支持的语言映射表，直接来自 `@/i18n` |
| `statusMsg` | `Ref<string>` | 状态提示文案 |
| `statusKind` | `Ref<"muted" \| "success" \| "error">` | 状态提示级别 |
| `setStatus` | `(msg, kind?) => void` | 设置提示并在 **5 秒** 后自动清除（通过 `setTimeout` + 值比较防止竞态） |

#### `current` 响应式对象字段

```ts
const current = reactive({
  // 通用
  language, pageSize, sortOrder, autoDraft, draftInterval,
  confirmDelete, shortcuts, timezone,
  // 外观
  theme, fontSize, cardLayout, animation, borderRadius, previewLines,
  // 通知
  dailyReminder, reminderTime, streakReminder, weeklyReport,
});
```

其中 `theme` 比较特殊——从独立的 `whatIveDone_theme` localStorage key 读取，而非共用 `STORAGE_KEY`。

#### 类型推导技巧

子级 composable 通过 `ReturnType<typeof useSettingState>` 推导出 `current` 和 `setStatus` 的精确类型，避免重复定义接口：

```ts
// useGeneralSettings.ts
type SettingState = ReturnType<typeof useSettingState>;

export function useGeneralSettings(
  current: SettingState["current"],
  setStatus: SettingState["setStatus"]
) { ... }
```

---

### `useGeneralSettings.ts`

**文件路径：** `src/composables/useGeneralSettings.ts`

管理"通用"设置分区下的所有操作。每个 handler 遵循相同模式：**修改 `current` → `saveSettings()` 持久化 → `setStatus()` 反馈**。

#### 签名

```ts
export function useGeneralSettings(
  current: SettingState["current"],
  setStatus: SettingState["setStatus"]
): { ... }
```

#### 返回的操作方法

| 方法 | 触发场景 | 核心逻辑 |
| ------ | ------ | ------ |
| `onLanguageChange` | 语言下拉框变更 | 调用 `setLocale(current.language)` 切换 vue-i18n locale，提示切换后的语言名称 |
| `onPageSizeChange` | 每页条数输入 | `saveSettings({ pageSize })` |
| `onSortOrderChange` | 排序方式切换 | `saveSettings({ sortOrder })` |
| `onAutoDraftToggle` | 自动草稿开关 | 取反 `current.autoDraft` 后持久化 |
| `onConfirmDeleteToggle` | 删除确认开关 | 关闭前弹出 `confirm()` 二次确认；用户取消则不执行 |
| `onShortcutsToggle` | 快捷键开关 | 取反 `current.shortcuts` 后持久化 |
| `onTimezoneChange` | 时区选择变更 | 当值为 `"auto"` 时使用 i18n key `setting.status.timezone_auto` 作为提示文案 |

#### 注意

`onConfirmDeleteToggle` 中的防误触逻辑：

```ts
if (
  !current.confirmDelete ||
  confirm(t("setting.confirm_delete"))
) {
  current.confirmDelete = !current.confirmDelete;
  // ...
}
```

即：如果当前为关闭状态（要开启），直接执行；如果当前为开启状态（要关闭），需要用户 `confirm` 同意。

---

### `useStyleSettings.ts`

**文件路径：** `src/composables/useStyleSettings.ts`

管理"外观"设置分区。与 `useGeneralSettings` 的区别在于，此处的操作除了持久化，还会 **直接操作 DOM** 修改 CSS 自定义属性或 HTML 属性。

#### 函数签名

```ts
export function useStyleSettings(
  current: SettingState["current"],
  setStatus: SettingState["setStatus"]
): { ... }
```

#### 返回的操作方法

| 方法 | DOM 副作用 |
| ------ | ------ |
| `onThemeToggle` | `document.documentElement.setAttribute("data-theme", theme)` + 写入独立 key `whatIveDone_theme` |
| `onFontSizeChange` | `style.setProperty("--font-base", fontSize + "px")` |
| `onCardLayoutChange` | 无 DOM 操作，仅持久化 + 提示（layout 由 Vue 模板响应式绑定） |
| `onAnimationToggle` | 开启时 `removeAttribute("data-no-animation")`；关闭时 `setAttribute("data-no-animation", "")` |
| `onBorderRadiusChange` | 通过 `radiusMap` 映射 `{ none: "0px", small: "6px", medium: "10px", large: "14px" }` 设置 `--radius` |
| `onPreviewLinesChange` | 当 `previewLines === 0` 时设置 `--preview-lines: 9999`（即不截断） |

#### Theme 特殊处理

主题值不存放在统一的 `STORAGE_KEY` 对象中，而是使用独立的 `whatIveDone_theme` key：

```ts
localStorage.setItem("whatIveDone_theme", current.theme);
```

这是为了让主题在页面加载的最早期（甚至在 Vue 实例挂载前）就可以从 `public/main.js` 中同步读取并应用，避免闪屏。

---

### `useAccountSettings.ts`

**文件路径：** `src/composables/useAccountSettings.ts`

账户操作集合。包含密码修改、数据导出/导入、会话管理和危险操作（清空数据、删除账户）。

#### 函数入参

```ts
export function useAccountSettings(
  current: SettingState["current"],
  setStatus: SettingState["setStatus"]
)
```

#### 返回方法

| 方法 | 状态 | 说明 |
| ------ | ------ | ------ |
| `onChangeNickname` | TODO | 占位，提示 `setting.status.nickname_todo` |
| `onChangePassword` | TODO | 占位 |
| `onChangeEmail` | TODO | 占位 |
| `onExportData` | ✅ 已实现 | 完整的客户端导出流程（见下文） |
| `onImportData` | TODO | 占位 |
| `onManageSessions` | TODO | 占位 |
| `onDeleteAllData` | ✅ 已实现 | 清空 localStorage + 调用 `DELETE /api/delete` |
| `onDeleteAccount` | TODO | 占位 |

#### `onExportData` 详解

这是 composable 中最复杂的单个方法，包含 **SHA-256 速率限制** 机制：

1. **锁检查**：从 `localStorage` 读取 `whatIveDone_export_lock_v1`，其结构为 `{ ts: number, sig: string }`。
2. **签名验证**：使用 `crypto.subtle.digest("SHA-256", ...)` 对 `ts + "|" + location.origin + "|" + navigator.userAgent` 计算哈希，与存储的 `sig` 比对，防止手动伪造时间戳。
3. **冷却期**：若签名有效且距上次导出不足 **1 小时**（`60 * 60 * 1000` ms），拒绝导出并提示剩余秒数。
4. **导出执行**：调用 `api('/api/posts?all="true"')` 拉取全量数据 → `Blob` → `URL.createObjectURL` → 动态 `<a>` 触发下载，文件名格式为 `whatIveDone_export_YYYY-MM-DD.json`。
5. **写锁**：成功后计算新签名并写入 localStorage。
6. **清理**：`setTimeout` 1.5 秒后 `revokeObjectURL` + 移除临时 `<a>` 元素。

#### `onDeleteAllData` 安全机制

当 `current.confirmDelete` 为 `true` 时，用户必须在 `prompt()` 中精确输入 `t("setting.status.clear_data_confirm_text")` 文本才能继续。清空操作同时移除三个 localStorage key：`STORAGE_KEY`、`whatIveDone_theme`、`whatIveDone_locale`。

---

### `useNotificationSettings.ts`

**文件路径：** `src/composables/useNotificationSettings.ts`

管理"通知与提醒"设置分区的四个操作，结构最为规整——每个 handler 都是 toggle/change + `saveSettings()` + `setStatus()` 的标准三步模式。

#### 返回方法

| 方法 | 操作的 `current` 字段 | 行为 |
| ------ | ------ | ------ |
| `onDailyReminderToggle` | `dailyReminder: boolean` | 取反后持久化，提示 `daily_reminder_on/off` |
| `onReminderTimeChange` | `reminderTime: string` | 直接持久化，提示包含时间值 `{ time: current.reminderTime }` |
| `onStreakReminderToggle` | `streakReminder: boolean` | 取反后持久化，提示 `streak_reminder_on/off` |
| `onWeeklyReportChange` | `weeklyReport: string` | 持久化后，通过本地 `labels` 映射 `{ off, popup, email }` 将值翻译为可读文案 |

#### `onWeeklyReportChange` 的 label 映射

```ts
const labels: Record<string, string> = {
  off:   t("setting.notification.weekly_report.off"),
  popup: t("setting.notification.weekly_report.popup"),
  email: t("setting.notification.weekly_report.email"),
};
setStatus(
  t("setting.status.weekly_report_set", {
    mode: labels[current.weeklyReport] || current.weeklyReport,
  }),
  "success"
);
```

若 `weeklyReport` 的值不在映射表中，降级直接显示原始值。

---

### `useAboutSettings.ts`

**文件路径：** `src/composables/useAboutSettings.ts`

"关于"面板的操作集，包括版本检查、更新日志跳转、以及 **全局重置** 功能。

#### 返回方法

| 方法 | 说明 |
| ------ | ------ |
| `onCheckUpdate` | 当前仅提示"已是最新版本"（`setting.status.check_update_latest`） |
| `onChangelog` | `window.open()` 跳转至 GitHub commits 页面：`https://github.com/BoyangZhang619/whatHaveUDone/commits/main/` |
| `onResetAllSettings` | 完整的设置重置流程（见下文） |

#### `onResetAllSettings` 流程

这是整个 Settings 系列中最"暴力"的操作：

1. **二次确认** — `confirm(t("setting.about.reset.confirm"))`，取消则直接 return。
2. **清除存储** — 移除 `STORAGE_KEY`、`whatIveDone_theme`、`whatIveDone_locale` 三个 localStorage key。
3. **重置 `current` 对象的全部 18 个字段**到硬编码默认值：

```ts
current.language = "zh-CN";
current.pageSize = 10;
current.sortOrder = "newest";
current.theme = "light";
current.fontSize = 14;
// ... 其余字段同理
```

4. **恢复 DOM 状态**：

```ts
document.documentElement.setAttribute("data-theme", "light");
document.documentElement.style.removeProperty("--font-base");
document.documentElement.style.removeProperty("--radius");
document.documentElement.style.removeProperty("--preview-lines");
document.documentElement.removeAttribute("data-no-animation");
```

5. **重置 locale** — `setLocale("zh-CN")`，将 vue-i18n 和 localStorage 中的语言同步归位。

---

## Main 页面

### `useAuth.ts`

**文件路径：** `src/composables/useAuth.ts`

用户认证状态管理与顶栏操作。是 `main.vue` 中最先调用的 composable，负责判断登录态。

#### 函数入参

```ts
export function useAuth(
  emit: (event: "log-out" | "settingOpen") => void
)
```

通过接收 `emit` 函数，将登出和打开设置的事件向父组件冒泡。

#### 内部状态

```ts
interface User {
  value: number | null;
  email?: string | null;
}

const meUser = reactive<User>({ value: null, email: null });
const meLoading = ref(false);
```

- `meUser.value` — 当前登录用户 ID，`null` 表示未登录。
- `meUser.email` — 当前登录用户邮箱。
- `meLoading` — 请求 `/api/me` 期间的 loading 标志。

#### 返回方法

| 方法 | 说明 |
| ------ | ------ |
| `refreshMe` | `GET /api/me`，成功后填充 `meUser`；失败时置 `null`。有 `finally` 保证 `meLoading` 一定复位 |
| `onOpenSettings` | 触发 `emit("settingOpen")` |
| `onLogout` | `POST /api/logout`，成功后触发 `emit("log-out")`；失败时 `alert` 提示 |

---

### `usePosts.ts`

**文件路径：** `src/composables/usePosts.ts`

帖子列表获取与分页逻辑。是所有 composable 中代码量最大的之一（约 220 行），包含列表加载、排序、分页导航和分页组件的 UI 数据生成。

#### 无参调用

```ts
export function usePosts()
```

内部自行从 `localStorage` 读取 `pageSize` 初始值；移动端（`navigator.userAgent` 包含 `"Mobile"`）默认 `limit = 3`，桌面端默认 `limit = 5`。

#### 核心状态

| 状态 | 类型 | 说明 |
| ------ | ------ | ------ |
| `posts` | `Ref<Post[]>` | 当前页的帖子数组 |
| `listLoading` | `Ref<boolean>` | 列表加载状态 |
| `listError` | `Ref<string>` | 加载错误信息 |
| `pager` | `reactive<Pager>` | 分页状态：`{ limit, offset, page, total, hasNext }` |
| `jumpInput` | `Ref<string>` | 跳页输入框绑定值 |

#### `Post` 接口

```ts
interface Post {
  id: number; title: string; content: string;
  tags?: string; todos?: string; happenedAt?: string;
  durationMin?: number; focus?: number; difficulty?: number;
  pinToTop?: boolean; created_at?: string; updated_at?: string;
  preview?: string; contentPreview?: string; goal?: string;
}
```

#### 排序逻辑

`listPosts()` 在拿到 API 响应后，根据 `whatIveDone_settings.sortOrder` 进行 **客户端排序**：

| `sortOrder` 值 | 行为 |
| ------ | ------ |
| `"pin"` | 置顶帖排在前面：`b.pinToTop - a.pinToTop` |
| `"newest"` | 保持 API 默认顺序（服务端已按时间倒序） |
| `"oldest"` | `items.reverse()` |
| `"duration"` | 按时长降序：`b.durationMin - a.durationMin` |

#### 分页导航

| 方法 | 说明 |
| ------ | ------ |
| `resetAndList` | 重置 `offset = 0, page = 1` 后重新加载——常用于创建/删除后刷新 |
| `goPage(n)` | 跳到第 `n` 页，`offset = (n-1) * limit` |
| `jumpToPage` | 从 `jumpInput` 读取值，调用 `goPage` |

#### 分页 UI 数据

`pageItems` 是一个 `computed`，生成分页按钮数组，结构为 `Array<{ type: "page" | "ellipsis", value?, key }>`。

算法按总页数分三档：
- **≤ 4 页**：全部显示
- **当前页靠前**（`current ≤ 2`）：`[1, 2, ..., last]`
- **当前页靠后**（`current ≥ last-1`）：`[1, ..., last-1, last]`
- **中间**：`[1, ..., current, last]`

401 响应被特殊处理：清空列表并设置 `listError = t("other.list_error")`，不作为普通异常抛出。

---

### `usePostDetail.ts`

**文件路径：** `src/composables/usePostDetail.ts`

帖子详情面板的全部逻辑：打开、加载、删除、以及派生的计算属性。

#### 无参调用

```ts
export function usePostDetail()
```

#### 核心状态

```ts
interface DetailState {
  open: boolean;      // 面板是否打开
  id: number | null;  // 当前查看的帖子 ID
  post: any | null;   // 帖子详情数据
}

const detail = reactive<DetailState>({ open: false, id: null, post: null });
const detailLoading = ref(false);
const detailError = ref("");
```

#### 计算属性

| 名称 | 逻辑 |
| ------ | ------ |
| `detailDate` | 兼容多种字段名：依次尝试 `createdAt`、`created_at`、`created`、`happenedAt` |
| `detailTags` | 若 `post.tags` 为数组则直接返回，否则返回 `[]` |
| `detailSubtitle` | 组合 "已上传" 标签 + 格式化日期 + tag 列表，以 ` · ` 分隔 |

#### `deletePost()` 方法

```ts
async function deletePost(): Promise<boolean | undefined>
```

1. 若 `detail.post?.id` 为空，直接 return。
2. 若 `confirmDelete` 设置为 true，弹出 `prompt()` 要求精确输入确认文本。
3. 调用 `DELETE /api/posts/${id}`。
4. 成功返回 `true`，关闭面板；失败返回 `false` 并 `alert` 错误。

在 `main.vue` 中，`deletePost()` 的返回值被用于决定是否刷新列表：

```ts
async function handleDeletePost() {
  const ok = await deletePost();
  if (ok) resetAndList();
}
```

---

### `useComposer.ts`

**文件路径：** `src/composables/useComposer.ts`

全屏编辑器（Composer）的完整逻辑，是所有 composable 中最大的一个（约 413 行）。涵盖草稿管理、模板系统、标签/待办编辑、预览渲染、字数统计和帖子创建。

#### 函数入参

```ts
export function useComposer(
  resetAndList: () => Promise<void>
)
```

接收 `usePosts` 返回的 `resetAndList`，在创建成功后刷新帖子列表。

#### `Draft` 接口

```ts
interface Draft {
  template: string;
  title: string;
  content: string;
  happenedAt: string;         // datetime-local 格式
  durationMin: number | null;
  focus: number | null;       // 1-5
  difficulty: number | null;  // 1-5
  tags: Array<string>;
  goal: string;
  todos: Array<{ text: string; done: boolean }>;
  pinToTop: boolean;
}
```

#### 草稿自动保存

通过 `watch(draft, ..., { deep: true })` 监听整个 `draft` 对象的深层变化。变化后：

1. 立即将 `draftStatus` 设为 "未保存"。
2. 清除上一个 `setTimeout`（防抖）。
3. **350ms** 后将 `draft` 序列化到 `localStorage` key `studylog:draft:v1`。
4. 仅当 `whatIveDone_settings.autoDraft === true` 时才执行。

```ts
if (JSON.parse(
  localStorage.getItem("whatIveDone_settings") || "{}"
).autoDraft !== true) {
  return; // 用户关闭了自动草稿
}
```

#### `loadDraft()` 安全恢复

从 `localStorage` 反序列化草稿时，每个字段都有边界保护：

```ts
draft.durationMin = clampInt(obj.durationMin, 0, 1440, 45);
draft.focus = clampInt(obj.focus, 1, 5, 3);
draft.tags = Array.isArray(obj.tags)
  ? obj.tags.slice(0, 20).map((x: any) => String(x).slice(0, 24))
  : [];
draft.todos = Array.isArray(obj.todos)
  ? obj.todos.slice(0, 30).map(...)
  : [];
```

- tags 上限 20 个，每个最长 24 字符。
- todos 上限 30 个，每个 text 最长 120 字符。

#### 模板系统 `applyTemplate()`

根据 `draft.template`（如 `"reciting"`, `"coding"`, `"homework"` 等）自动填充 `title`、`goal`、`content`——仅当对应字段为空时才填充，不覆盖用户已输入的内容。填充后自动将模板名作为 tag 添加。

支持的模板：`reciting`, `reading`, `coding`, `homework`, `assignment`, `course`, `review`。

#### `composedPreview` 计算属性

将 draft 各字段组合为 Markdown 风格的文本预览：

```
标题

⏱ 时间: 2026-03-03T14:30
⏳ 时长: 45 分钟
🎯 专注/难度: 3 / 3
🏷 标签: coding, review
📌 目标: ...

正文内容...

✅ 下一步:
- [ ] TODO 1
- [x] TODO 2
```

#### `wordCount` 计算属性

统计标题 + 目标 + 正文的字数。中文字符逐字计数（`/[\u4e00-\u9fff]/g`），英文单词按空格分词（`/[A-Za-z0-9_]+/g`），两者相加。

#### `createPost()` 双重降级

```
POST /api/posts (完整 payload)
       ↓ 若 400/409/422
POST /api/posts (仅 title + content)
```

第一次请求携带所有富字段（tags, todos, focus 等）。若服务端返回 `400`/`409`/`422`（可能不支持某些字段），自动降级为仅提交 `title` + `content` 的精简 payload。

#### 返回值汇总

返回 23 个成员，是所有 composable 中最多的：

```ts
return {
  composerOpen, overlayEl, ui,
  createLoading, createStatus, draftStatus, draft,
  tagInput, todoInput,
  openComposer, closeComposer, setCreateStatus,
  addTag, removeTag, addTodo, removeTodo,
  resetDraft, applyTemplate,
  composedPreview, wordCount,
  loadDraft, createPost,
};
```

---

## Login 页面

### `useLoginForm.ts`

**文件路径：** `src/composables/useLoginForm.ts`

登录表单的响应式状态和前端校验逻辑。是 Login 系列的核心状态源，`useLoginActions` 从此处接收 `form`、`setStatus`、`validateEmail`、`validatePassword`。

#### 返回值

| 名称 | 类型 | 说明 |
| ------ | ------ | ------ |
| `form` | `reactive({ email: string, password: string })` | 表单双向绑定对象 |
| `status` | `reactive({ msg: string, kind: "muted" \| "error" \| "success" })` | 状态提示 |
| `setStatus` | `(msg?, kind?) => void` | 设置提示，自动截断到 1000 字符 |
| `validateEmail` | `(email) => { ok, reason? }` | 邮箱校验 |
| `validatePassword` | `(pw) => { ok, reason? }` | 密码校验 |

#### 邮箱校验规则 `validateEmail()`

```ts
const MIN_EMAIL_LENGTH = 5;
const MAX_EMAIL_LENGTH = 254;
const re = /^[^\s@]{1,64}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
```

- 不能为空
- 长度在 `[5, 254]` 范围内（254 为 RFC 5321 定义的最大长度）
- 匹配正则：local-part 最长 64 字符、不含空格和 `@`，domain 包含至少一个 `.`

#### 密码校验规则 `validatePassword()`

```ts
const MAX_PASSWORD_LENGTH = 128;
```

- 不能为 `null`
- 最短 6 位
- 最长 128 位
- 不允许 `<` 和 `>` 字符（防 XSS）
- 仅允许可打印 ASCII 字符（`/^[\x20-\x7E]+$/`）

---

### `useLoginActions.ts`

**文件路径：** `src/composables/useLoginActions.ts`

登录/注册/登出的 API 调用层。通过参数注入的方式接收 `useLoginForm` 的所有输出，实现彻底解耦。

#### 函数入参

```ts
export function useLoginActions(
  form:             LoginForm["form"],
  setStatus:        LoginForm["setStatus"],
  validateEmail:    LoginForm["validateEmail"],
  validatePassword: LoginForm["validatePassword"],
  emit:             (event: "login-success", payload?: any) => void
)
```

类型通过 `ReturnType<typeof useLoginForm>` 推导（别名为 `LoginForm`），与 Setting 系列使用相同的模式。

#### 返回方法

| 方法 | API 端点 | 成功后行为 |
| ------ | ------ | ------ |
| `handleRegister` | `POST /api/register` | 提示注册成功 |
| `handleLogin` | `POST /api/login` | 提示登录成功 + `emit("login-success", data.success)` |
| `handleLogout` | `POST /api/logout` | 清空表单 + `emit("login-success", null)` |

#### 统一流程

三个方法的前置校验相同：

```ts
const e = validateEmail(form.email);
if (!e.ok) { setStatus(e.reason, "error"); return; }
const p = validatePassword(form.password);
if (!p.ok) { setStatus(p.reason, "error"); return; }
```

错误处理也统一：`catch` 中拼接 i18n 前缀 + `e.data?.message`，若无 message 则降级为 `t("login_card.status.internal_error")`。

#### `handleLogin` 的 emit 安全

登录成功后的 `emit` 被 `try/catch` 包裹，防止父组件事件处理器抛异常时破坏登录流程：

```ts
try {
  if (data) emit("login-success", data.success);
} catch (emitError) {
  console.error("login_card.emit_error", { ... });
}
```

---

### `useLoginUtils.ts`

**文件路径：** `src/composables/useLoginUtils.ts`

登录页面的辅助工具：IP 检测、语言轮换、帮助弹窗。

#### 返回值

| 名称 | 类型 | 说明 |
| ------ | ------ | ------ |
| `userIp` | `Ref<string>` | 用户 IP，初始值为 `"trying"`，失败时为 `"fail"`，成功时为实际 IP 字符串 |
| `getMyIp` | `() => Promise<void>` | 调用 `GET /api/get-ip` 获取 IP，在 `onMounted` 中触发 |
| `switchLanguage` | `() => void` | 在 `["zh-CN", "en-US", "zh-TW"]` 三种语言间轮换 |
| `question` | `() => void` | `alert(t("login_card.question_alert"))` |

#### IP 状态机

`userIp` 有三种状态，直接映射到模板中的 `v-if` / `v-else-if` / `v-else`：

```vue
<span v-if="userIp === 'trying'">{{ t('login_card.ip_trying') }}</span>
<span v-else-if="userIp === 'fail'">{{ t('login_card.ip_fail') }}</span>
<span v-else>{{ userIp }}</span>
```

#### 语言轮换逻辑

```ts
const LANGUAGES: string[] = ["zh-CN", "en-US", "zh-TW"];

function switchLanguage() {
  const i = LANGUAGES.indexOf(locale.value as string);
  const next = LANGUAGES[(i + 1) % LANGUAGES.length];
  // ...
  setLocale(next);
}
```

使用模运算实现循环切换。调用 `@/i18n` 导出的 `setLocale()` 同时更新 vue-i18n locale 和 localStorage。

---

## Barrel 导出

### `index.ts`

**文件路径：** `src/composables/index.ts`

Barrel 导出文件，将所有 composable 从单一入口统一导出。实际在 `.vue` 文件中，各 composable 按需从具体文件直接 import（如 `import { useAuth } from '@/composables/useAuth'`），此 barrel 主要用于外部或测试场景的便捷导入。

```ts
export { api } from "./useApi";
export { useAuth } from "./useAuth";
export { useComposer } from "./useComposer";
export {
  formatDate, toDatetimeLocal, clampInt,
  safeErr, normalizeInt, safeJSON, tagList, todoList,
} from "./useHelpers";
export { usePosts } from "./usePosts";
export { usePostDetail } from "./usePostDetail";
export { useSettingState } from "./useSettingState";
export {
  STORAGE_KEY, loadSettings, saveSettings, load,
} from "./useSettingsStorage";
export { useGeneralSettings } from "./useGeneralSettings";
export { useStyleSettings } from "./useStyleSettings";
export { useAccountSettings } from "./useAccountSettings";
export { useNotificationSettings } from "./useNotificationSettings";
export { useAboutSettings } from "./useAboutSettings";
export { useLoginForm } from "./useLoginForm";
export { useLoginActions } from "./useLoginActions";
export { useLoginUtils } from "./useLoginUtils";
```

共导出 **17 个模块**，覆盖 3 个页面（Login / Main / Setting）+ 3 个共享模块。

<template>
    <div class="login-wrapper">
        <div class="login-card">
            <div class="login-header">
                <h2>账户登录</h2>
                <p class="muted">跨域 Session 认证系统</p>
            </div>

            <div class="form-body">
                <div class="input-item">
                    <label for="email">Email</label>
                    <input id="email" v-model="form.email" type="email" placeholder="test@test.com" />
                </div>

                <div class="input-item">
                    <label for="password">Password</label>
                    <input id="password" v-model="form.password" type="password" placeholder="123456" />
                </div>

                <div class="actions">
                    <button id="btnLogin" class="btn primary" @click="handleLogin">
                        登录
                    </button>
                    <button id="btnRegister" class="btn secondary" @click="handleRegister">
                        注册账户
                    </button>
                    <button id="btnLogout" class="btn text-only" @click="handleLogout">
                        退出登录
                    </button>
                </div>

                <transition name="fade">
                    <div id="authStatus" v-if="status.msg" :class="['status-msg', status.kind]">
                        {{ status.msg }}
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, defineEmits } from 'vue';

const emit = defineEmits(['login-success']);
// --- 配置与核心 API ---
const API_BASE = "https://login.boyangzhang246.workers.dev";

const form = reactive({
    email: '',
    password: ''
});

const status = reactive({
    msg: '',
    kind: 'muted'
});

// --- 严格的输入校验与防护 ---
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;

function validateEmail(email) {
    if (!email || typeof email !== 'string') return { ok: false, reason: '邮箱不能为空' };
    if (email.length > MAX_EMAIL_LENGTH) return { ok: false, reason: '邮箱过长' };
    // 简洁且严格的邮箱校验：本地部分限制长度，避免过度复杂的正则
    const re = /^[^\s@]{1,64}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return re.test(email) ? { ok: true } : { ok: false, reason: '邮箱格式不正确' };
}

function validatePassword(pw) {
    if (pw == null) return { ok: false, reason: '密码不能为空' };
    if (typeof pw !== 'string') return { ok: false, reason: '密码格式不正确' };
    if (pw.length < 6) return { ok: false, reason: '密码太短，至少6位' };
    if (pw.length > MAX_PASSWORD_LENGTH) return { ok: false, reason: '密码过长' };
    // 禁止包含角括号以减小 XSS 注入风险（虽然 Vue 模板插值会自动转义，但防患于未然）
    if (/[<>]/.test(pw)) return { ok: false, reason: '密码不能包含 < 或 > 字符' };
    // 仅允许可打印 ASCII，避免控制字符或二进制数据
    if (!/^[\x20-\x7E]+$/.test(pw)) return { ok: false, reason: '密码包含不支持的字符' };
    return { ok: true };
}

// 通用 API 请求函数
async function api(path, options = {}) {
    const headers = options.headers ? { ...options.headers } : {};
    if (options.body && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    try {
        const res = await fetch(API_BASE + path, {
            ...options,
            headers,
            credentials: "include",
        });

        const text = await res.text();
        let data = null;
        try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

        if (!res.ok) {
            throw { kind: "http", status: res.status, data };
        }
        return data;
    } catch (err) {
        if (err.kind === "http") throw err;
        throw { kind: "network", message: err?.message || String(err) };
    }
}

// --- 交互逻辑 ---

const setStatus = (msg, kind = 'muted') => {
    // 仅允许纯文本状态消息，防止误将 HTML 注入到状态显示（模板插值已转义，但保持防御性）
    status.msg = String(msg).slice(0, 1000); // 限制长度，避免资源浪费
    status.kind = kind;
};

// 注册
const handleRegister = async () => {
    // 本地验证
    const e = validateEmail(form.email);
    if (!e.ok) { setStatus(e.reason, 'error'); return; }
    const p = validatePassword(form.password);
    if (!p.ok) { setStatus(p.reason, 'error'); return; }

    setStatus("正在创建账户...", "muted");
    try {
        await api("/api/register", {
            method: "POST",
            body: JSON.stringify({ email: form.email, password: form.password })
        });
        setStatus("注册成功，现在可以登录了", "success");
    } catch (e) {
        setStatus("注册失败：" + (e.data?.message || "网络错误"), "error");
    }
};

// 登录
const handleLogin = async () => {
    const e = validateEmail(form.email);
    if (!e.ok) { setStatus(e.reason, 'error'); return; }
    const p = validatePassword(form.password);
    if (!p.ok) { setStatus(p.reason, 'error'); return; }

    setStatus("验证中...", "muted");
    try {
        const data = await api("/api/login", {
            method: "POST",
            body: JSON.stringify({ email: form.email, password: form.password })
        });
        setStatus(`欢迎回来，${form.email}`, "success");
        // 如果需要通知父组件登录成功，传递后端返回的用户对象（如果存在）
        if (data?.user) emit('login-success', data.user);
    } catch (e) {
        setStatus("登录失败，请检查账号密码", "error");
    }
};

// 登出
const handleLogout = async () => {
    try {
        await api("/api/logout", { method: "POST" });
        setStatus("已安全退出", "muted");
        form.email = '';
        form.password = '';
        // 通知父组件已登出
        emit('login-success', null);
    } catch (e) {
        setStatus("登出请求已发送", "muted");
    }
};
</script>

<style scoped>
/* 柔和简约设计风格 */
.login-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    /* background-color: #fafafa; 极淡的灰白背景 */
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.login-card {
    width: 100%;
    max-width: 400px;
    background: #ffffff;
    padding: 40px;
    border-radius: 16px;
    /* 柔和圆角 */
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    /* 极其自然的呼吸感阴影 */
    border: 1px solid rgba(0, 0, 0, 0.02);
}

.login-header {
    text-align: center;
    margin-bottom: 35px;
}

h2 {
    font-size: 1.6rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 8px 0;
}

.muted {
    font-size: 0.9rem;
    color: #999;
}

/* 输入框样式 */
.input-item {
    margin-bottom: 20px;
}

label {
    display: block;
    font-size: 0.85rem;
    color: #444;
    margin-bottom: 8px;
    margin-left: 4px;
}

input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    font-size: 1rem;
    background: #fdfdfd;
    transition: all 0.3s ease;
    box-sizing: border-box;
    outline: none;
}

input:focus {
    border-color: #1a1a1a;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.03);
}

/* 按钮设计 */
.actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 30px;
}

.btn {
    width: 100%;
    padding: 12px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    border-radius: 10px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
}

.primary {
    background: #1a1a1a;
    color: #fff;
}

.primary:hover {
    background: #000;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.secondary {
    background: #fff;
    color: #1a1a1a;
    border: 1px solid #e0e0e0;
}

.secondary:hover {
    background: #f5f5f5;
    border-color: #1a1a1a;
}

.text-only {
    background: transparent;
    color: #888;
    font-size: 0.85rem;
    margin-top: 5px;
}

.text-only:hover {
    color: #1a1a1a;
    text-decoration: underline;
}

/* 状态信息样式 */
.status-msg {
    margin-top: 25px;
    padding: 12px;
    border-radius: 8px;
    font-size: 0.85rem;
    text-align: center;
}

.status-msg.muted {
    background: #f5f5f5;
    color: #666;
}

.status-msg.success {
    background: #f0f9f0;
    color: #2d7a2d;
    border: 1px solid #e0eee0;
}

.status-msg.error {
    background: #fff5f5;
    color: #c53030;
    border: 1px solid #fee2e2;
}

/* 舒服的淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>
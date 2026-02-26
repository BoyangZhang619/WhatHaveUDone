<template>
    <div class="login-wrapper">
        <div class="login-card">
            <div class="login-header">
                <h2>账户登录</h2>
                <p class="muted">您的IP: <br />{{ userIp }}</p>
            </div>

            <div class="form-body">
                <div class="input-item">
                    <label for="email">Email | 邮箱</label>
                    <input id="email" v-model="form.email" type="email" placeholder="test@test.com" />
                </div>

                <div class="input-item">
                    <label for="password">Password | 密码</label>
                    <input id="password" v-model="form.password" type="password" placeholder="123456" />
                </div>

                <div class="actions">
                    <button id="btnLogin" class="btn primary-login" @click="handleLogin">
                        &nbsp;&nbsp;Reg | 登录
                    </button>
                    <button id="btnRegister" class="btn secondary-login" @click="handleRegister">
                        Login | 注册
                    </button>
                    <button id="btnLogout" class="btn text-only" @click="handleLogout">
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Logout | 退出登录
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

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';

const userIp = ref('正在获取...');

const getMyIp = async () => {
    try {
        // 路径对应 functions 文件夹下的目录结构
        const response = await fetch('/api/get-ip');
        const data = await response.json();
        userIp.value = data.ip;
    } catch (error) {
        console.error('获取 IP 失败:', error);
        userIp.value = '获取失败';
    }
};

onMounted(() => {
    getMyIp();
});

const emit = defineEmits(['login-success']);
// --- 配置与核心 API ---
const API_BASE = "https://done.login.page.zbyblq.xin";
// const API_BASE = "http://127.0.0.1:8787";
// const API_BASE = ""; // 生产环境使用相对路径，开发环境通过 Vite 代理转发到后端
// console.log("API_BASE:", API_BASE);
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

function validateEmail(email: string): { ok: boolean; reason?: string } {
    if (!email || typeof email !== 'string') return { ok: false, reason: '邮箱不能为空' };
    if (email.length > MAX_EMAIL_LENGTH) return { ok: false, reason: '邮箱过长' };
    // 简洁且严格的邮箱校验：本地部分限制长度，避免过度复杂的正则
    const re = /^[^\s@]{1,64}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return re.test(email) ? { ok: true } : { ok: false, reason: '邮箱格式不正确' };
}

function validatePassword(pw: string): { ok: boolean; reason?: string } {
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
async function api(path: string, options: { method: 'GET' | 'POST' | 'PUT' | 'DELETE'; headers?: any; body?: string; }) {
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
    } catch (err: any) {
        if (err.kind === "http") throw err;
        throw { kind: "network", message: err?.message || String(err) };
    }
}

// --- 交互逻辑 ---

const setStatus = (msg: string | undefined, kind: 'muted' | 'error' | 'success' = 'muted') => {
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
    } catch (e: any) {
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
        if (data) emit('login-success', data.success);
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

<style src="@/css/login.css"></style>
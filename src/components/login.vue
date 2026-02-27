<template>
    <div class="login-wrapper">
        <div class="login-card">
            <div class="login-header">
                <h2>{{ t('login_card.title') }}</h2>
                <p class="muted">{{ t('login_card.ip') }}<br />
                    <span v-if="userIp === 'trying'">{{ t('login_card.ip_trying') }}</span>
                    <span v-else-if="userIp === 'fail'">{{ t('login_card.ip_fail') }}</span>
                    <span v-else>{{ userIp }}</span>
                </p>
            </div>

            <div class="form-body">
                <div class="input-item">
                    <label for="email">{{ t('login_card.email_label') }}</label>
                    <input id="email" v-model="form.email" type="email" placeholder="test@test.com" />
                </div>

                <div class="input-item">
                    <label for="password">{{ t('login_card.password_label') }}</label>
                    <input id="password" v-model="form.password" type="password" placeholder="123456" />
                </div>

                <div class="actions">
                    <button id="btnLogin" class="btn primary-login" @click="handleLogin">
                        {{ t('login_card.submit_button') }}
                    </button>
                    <button id="btnRegister" class="btn secondary-login" @click="handleRegister">
                        {{ t('login_card.create_button') }}
                    </button>

                    <div class="corner-buttons">
                        <button id="btnLogout" class="btn text-only" @click="handleLogout">
                            {{ t('login_card.logout_button') }}
                        </button>
                        <div class="question" @click="question">?</div>
                        <div class="language" @click="switchLanguage">🌐</div>
                    </div>

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
import { setLocale } from '@/i18n';
import { reactive, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const userIp = ref('trying');

const getMyIp = async () => {
    try {
        // 路径对应 functions 文件夹下的目录结构
        const response = await fetch('/api/get-ip');
        const data = await response.json();
        userIp.value = data.ip;
    } catch (error) {
        console.error(t('error.ip_fail', { error: error instanceof Error ? error.message : String(error) }));
        userIp.value = 'fail';
    }
};

onMounted(() => {
    getMyIp();
});

const languages: string[] = ['zh-CN', 'en-US', 'zh-TW'];

function switchLanguage() {
    const i = languages.indexOf(locale.value as string)
    const next = languages[(i + 1) % languages.length]
    if (next !== 'zh-CN' && next !== 'en-US' && next !== 'zh-TW') return
    setLocale(next)
}
function question() {
    alert(t('login_card.question_alert'));
}
const emit = defineEmits(['login-success']);
// --- 配置与核心 API ---
 const API_BASE = "https://done.login.page.zbyblq.xin";
//const API_BASE = ""; // 生产环境使用相对路径，开发环境通过 Vite 代理转发到后端
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
const MIN_EMAIL_LENGTH = 5;
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;

function validateEmail(email: string): { ok: boolean; reason?: string } {
    if (!email || typeof email !== 'string') return { ok: false, reason: t('login_card.validation.email.email_required') };
    if (email.length < MIN_EMAIL_LENGTH) return { ok: false, reason: t('login_card.validation.email.email_min_length') };
    if (email.length > MAX_EMAIL_LENGTH) return { ok: false, reason: t('login_card.validation.email.email_max_length') };
    // 简洁且严格的邮箱校验：本地部分限制长度，避免过度复杂的正则
    const re = /^[^\s@]{1,64}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return re.test(email) ? { ok: true } : { ok: false, reason: t('login_card.validation.email.email_invalid') };
}

function validatePassword(pw: string): { ok: boolean; reason?: string } {
    if (pw == null) return { ok: false, reason: t('login_card.validation.password.password_required') };
    if (typeof pw !== 'string') return { ok: false, reason: t('login_card.validation.password.password_invalid') };
    if (pw.length < 6) return { ok: false, reason: t('login_card.validation.password.password_min_length') };
    if (pw.length > MAX_PASSWORD_LENGTH) return { ok: false, reason: t('login_card.validation.password.password_max_length') };
    // 禁止包含角括号以减小 XSS 注入风险（虽然 Vue 模板插值会自动转义，但防患于未然）
    if (/[<>]/.test(pw)) return { ok: false, reason: t('login_card.validation.password.password_no_<>') };
    // 仅允许可打印 ASCII，避免控制字符或二进制数据
    if (!/^[\x20-\x7E]+$/.test(pw)) return { ok: false, reason: t('login_card.validation.password.password_no_support_letter') };
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

    setStatus(t("login_card.status.registering"), "muted");
    try {
        await api("/api/register", {
            method: "POST",
            body: JSON.stringify({ email: form.email, password: form.password })
        });
        setStatus(t("login_card.status.register_success"), "success");
    } catch (e: any) {
        setStatus(t("login_card.status.register_fail") + (e.data?.message || t("login_card.status.internal_error")), "error");
    }
};

// 登录
const handleLogin = async () => {
    const e = validateEmail(form.email);
    if (!e.ok) { setStatus(e.reason, 'error'); return; }
    const p = validatePassword(form.password);
    if (!p.ok) { setStatus(p.reason, 'error'); return; }

    setStatus(t("login_card.status.logging_in"), "muted");
    try {
        const data = await api("/api/login", {
            method: "POST",
            body: JSON.stringify({ email: form.email, password: form.password })
        });
        setStatus(t("login_card.status.login_success", { email: form.email }), "success");
        // 如果需要通知父组件登录成功，传递后端返回的用户对象（如果存在）
        try {
            if (data) emit('login-success', data.success);
        } catch (emitError) {
            console.error('login_card.emit_error', { error: emitError instanceof Error ? emitError.message : String(emitError) });
        }
    } catch (e: any) {
        setStatus(t("login_card.status.login_fail") + (e.data?.message || t("login_card.status.internal_error")), "error");
    }
};

// 登出
const handleLogout = async () => {
    try {
        await api("/api/logout", { method: "POST" });
        setStatus(t("login_card.status.logout_success"), "muted");
        form.email = '';
        form.password = '';
        // 通知父组件已登出
        emit('login-success', null);
    } catch (e: any) {
        setStatus(t("login_card.status.logout_fail") + (e.data?.message || t("login_card.status.internal_error")), "error");
    }
};
</script>

<style src="@/css/login.css"></style>
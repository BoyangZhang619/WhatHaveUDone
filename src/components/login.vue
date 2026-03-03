<template>
    <div class="login-wrapper">
        <div class="login-card">
            <div class="login-header">
                <h2>{{ t('login_card.title') }}</h2>
                <p class="muted" style="overflow: scroll;">
                    <span>{{ t('login_card.ip') }}</span>
                    <br />
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
/**
 * 登录页面 — 逻辑已抽离到 composables，这里只做组装
 */
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLoginForm } from '@/composables/useLoginForm';
import { useLoginActions } from '@/composables/useLoginActions';
import { useLoginUtils } from '@/composables/useLoginUtils';

const { t } = useI18n();
const emit = defineEmits(['login-success']);

const { form, status, setStatus, validateEmail, validatePassword } = useLoginForm();
const { handleRegister, handleLogin, handleLogout } = useLoginActions(
  form, setStatus, validateEmail, validatePassword, emit
);
const { userIp, getMyIp, switchLanguage, question } = useLoginUtils();

onMounted(() => {
  getMyIp();
});
</script>

<style src="@/css/login.css"></style>
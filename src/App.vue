<script setup>
import {ref, onMounted} from 'vue'
import Login from './components/login.vue'
import Main from './components/main.vue'
import Setting from './components/setting.vue'

// 全局用户状态
// false 表示未登录，存储对象（如 { email: '...' }）表示已登录
const user = ref(false); // 这里先模拟一个已登录状态，实际开发中应初始化为 false
const settingOpen = ref(false);

/**
 * 初始化主题
 */
onMounted(() => {
  const saved = localStorage.getItem('whatIveDone_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);

  // 恢复外观设置
  try {
    const s = JSON.parse(localStorage.getItem('whatIveDone_settings') || '{}');
    if (s.fontSize) document.documentElement.style.setProperty('--font-base', s.fontSize + 'px');
    if (s.borderRadius) {
      const radiusMap = { none: '0px', small: '6px', medium: '10px', large: '14px' };
      document.documentElement.style.setProperty('--radius', radiusMap[s.borderRadius] || '14px');
    }
    if (s.previewLines !== undefined) {
      document.documentElement.style.setProperty('--preview-lines', s.previewLines === 0 ? '9999' : String(s.previewLines));
    }
    if (s.animation === false) {
      document.documentElement.setAttribute('data-no-animation', '');
    }
  } catch { /* ignore */ }
})

/**
 * 处理登录成功
 * @param {Object} user_success 子组件传回的用户信息
 */
const handleLoginSuccess = () => {
  // 可以在这里做一些持久化处理，比如存入 localStorage
  user.value = true;
}

/**
 * 处理登出逻辑
 * 供后续 Main 组件触发
 */
const handleLogout = () => {
  user.value = false
}

// setInterval(() => {
//   console.log(user.value);
// }, 1000)
</script>

<template>
  <div class="app-container">
    <transition name="fade-transform" mode="out-in">

      <Login
          v-if="!user && !settingOpen"
          key="login-page"
          @login-success="handleLoginSuccess"
      />

      <Main
          v-else-if="user && !settingOpen"
          key="main-page"
          :user-info="user"
          @log-out="handleLogout"
          @settingOpen="settingOpen=true"
      />

      <Setting
          v-else-if="user && settingOpen"
          @close="settingOpen=false"
      />

    </transition>
  </div>
</template>

<style>
/* 全局基础样式清零，确保黑白风格纯净 */
body {
  margin: 0;
  padding: 0;
  background-color: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* --- 柔和切换动画 --- */

/* 进场和出场的时间曲线 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 进场前的状态：半透明且轻微向下位移 */
.fade-transform-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.98);
}

/* 离场后的状态：半透明且轻微向上位移 */
.fade-transform-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(1.02);
}
</style>
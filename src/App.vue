<script setup>
import { ref } from 'vue'
import Login from './components/login.vue'
import Main from './components/main.vue'

// 全局用户状态
// null 表示未登录，存储对象（如 { email: '...' }）表示已登录
const user = ref(1) // 这里先模拟一个已登录状态，实际开发中应初始化为 null

/**
 * 处理登录成功
 * @param {Object} user_success 子组件传回的用户信息
 */
const handleLoginSuccess = (user_success) => {
  // 可以在这里做一些持久化处理，比如存入 localStorage
  user.value = user_success;
}

/**
 * 处理登出逻辑
 * 供后续 Main 组件触发
 */
const handleLogout = () => {
  user.value = null
}
</script>

<template>
  <div class="app-container">
    <transition name="fade-transform" mode="out-in">
      
      <Login 
        v-if="!user" 
        key="login-page"
        @login-success="handleLoginSuccess" 
      />

      <Main 
        v-else-if="user"
        key="main-page"
        :user-info="user"
        @log-out="handleLogout"
      />

    </transition>
  </div>
</template>

<style>
/* 全局基础样式清零，确保黑白风格纯净 */
body {
  margin: 0;
  padding: 0;
  background-color: #fafafa; /* 极淡的底色 */
  color: #1a1a1a;
  -webkit-font-smoothing: antialiased;
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
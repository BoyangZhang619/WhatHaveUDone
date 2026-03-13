<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const transitionName = ref('fade-up')

router.afterEach((to, from) => {
  if (to.path === '/settings' && from.path === '/') {
    transitionName.value = 'slide-left'
    return
  }

  if (to.path === '/' && from.path === '/settings') {
    transitionName.value = 'slide-right'
    return
  }

  transitionName.value = 'fade-up'
})

onMounted(() => {
  const saved = localStorage.getItem('whatIveDone_theme') || 'light'
  document.documentElement.setAttribute('data-theme', saved)

  try {
    const s = JSON.parse(localStorage.getItem('whatIveDone_settings') || '{}')

    if (s.fontSize) {
      document.documentElement.style.setProperty('--font-base', s.fontSize + 'px')
    }

    if (s.borderRadius) {
      const radiusMap = {
        none: '0px',
        small: '6px',
        medium: '10px',
        large: '14px'
      }
      document.documentElement.style.setProperty('--radius', radiusMap[s.borderRadius] || '14px')
    }

    if (s.previewLines !== undefined) {
      document.documentElement.style.setProperty(
        '--preview-lines',
        s.previewLines === 0 ? '9999' : String(s.previewLines)
      )
    }

    if (s.animation === false) {
      document.documentElement.setAttribute('data-no-animation', '')
    } else {
      document.documentElement.removeAttribute('data-no-animation')
    }
  } catch {
    // ignore
  }
})
</script>

<template>
  <div class="app-container">
    <router-view v-slot="{ Component, route }">
      <transition :name="transitionName" mode="out-in">
        <div :key="route.fullPath" class="route-page">
          <component :is="Component" />
        </div>
      </transition>
    </router-view>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: var(--bg);
  color: var(--text);
  user-select: none;
  -webkit-font-smoothing: antialiased;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app-container {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
}

.route-page {
  min-height: 100dvh;
  width: 100%;
}

/* 淡入上浮 */
.fade-up-enter-active,
.fade-up-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.28s ease;
  will-change: opacity, transform;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(14px) scale(0.995);
}

.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.995);
}

/* 向左推进：主页 -> 设置 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition:
    transform 0.28s ease,
    opacity 0.22s ease;
  will-change: transform, opacity;
}

.slide-left-enter-from {
  transform: translateX(32px);
  opacity: 0.98;
}

.slide-left-leave-to {
  transform: translateX(-14px);
  opacity: 0.98;
}

/* 向右返回：设置 -> 主页 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    transform 0.28s ease,
    opacity 0.22s ease;
  will-change: transform, opacity;
}

.slide-right-enter-from {
  transform: translateX(-24px);
  opacity: 0.98;
}

.slide-right-leave-to {
  transform: translateX(24px);
  opacity: 0.98;
}

[data-no-animation] .fade-up-enter-active,
[data-no-animation] .fade-up-leave-active,
[data-no-animation] .slide-left-enter-active,
[data-no-animation] .slide-left-leave-active,
[data-no-animation] .slide-right-enter-active,
[data-no-animation] .slide-right-leave-active {
  transition: none !important;
}

[data-no-animation] .fade-up-enter-from,
[data-no-animation] .fade-up-leave-to,
[data-no-animation] .slide-left-enter-from,
[data-no-animation] .slide-left-leave-to,
[data-no-animation] .slide-right-enter-from,
[data-no-animation] .slide-right-leave-to {
  transform: none !important;
  opacity: 1 !important;
}
</style>
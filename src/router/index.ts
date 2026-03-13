import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/login.vue'
import Main from '../components/main.vue'
import Setting from '../components/setting.vue'

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('whatIveDone_user') || 'null')
  } catch {
    return null
  }
}

const routes = [
  {
    path: '/',
    name: 'main',
    component: Main,
    meta: {
      requiresAuth: true,
      transition: 'fade-up'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      transition: 'fade-up'
    }
  },
  {
    path: '/settings',
    name: 'settings',
    component: Setting,
    meta: {
      requiresAuth: true,
      transition: 'slide-left'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const user = getStoredUser()
  const isLoggedIn = !!user

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
    return
  }

  if (to.path === '/login' && isLoggedIn) {
    next('/')
    return
  }

  next()
})

export default router
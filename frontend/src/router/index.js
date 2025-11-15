import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: 'Fast Info - 首页' }
  },
  {
    path: '/tech',
    name: 'Tech',
    component: () => import('../views/Tech.vue'),
    meta: { title: 'Fast Info - 科技资讯' }
  },
  {
    path: '/dev',
    name: 'Dev',
    component: () => import('../views/Dev.vue'),
    meta: { title: 'Fast Info - 开发者' }
  },
  {
    path: '/academic',
    name: 'Academic',
    component: () => import('../views/Academic.vue'),
    meta: { title: 'Fast Info - 学术研究' }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search.vue'),
    meta: { title: 'Fast Info - 搜索' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 更新页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Fast Info'
  next()
})

export default router

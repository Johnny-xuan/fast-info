import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: 'Fast Info - 首页' }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/ChatView.vue'),
    meta: { title: 'Fast Info - 卖报员' }
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
    path: '/product',
    name: 'Product',
    component: () => import('../views/Product.vue'),
    meta: { title: 'Fast Info - 产品动态' }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search.vue'),
    meta: { title: 'Fast Info - 搜索' }
  },
  // 法律合规页面
  {
    path: '/copyright',
    name: 'Copyright',
    component: () => import('../views/Copyright.vue'),
    meta: { title: 'Fast Info - 版权声明' }
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('../views/Terms.vue'),
    meta: { title: 'Fast Info - 服务条款' }
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('../views/Privacy.vue'),
    meta: { title: 'Fast Info - 隐私政策' }
  },
  {
    path: '/dmca',
    name: 'DMCA',
    component: () => import('../views/DMCA.vue'),
    meta: { title: 'Fast Info - DMCA 投诉' }
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

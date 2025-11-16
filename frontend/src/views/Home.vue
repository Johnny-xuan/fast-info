<script setup>
import { ref, onMounted } from 'vue'
import { getArticles } from '@/api/article'

// 状态管理
const articles = ref([])
const loading = ref(true)
const error = ref(null)
const currentCategory = ref('all')

// 获取文章列表
const fetchArticles = async (category = 'all') => {
  loading.value = true
  error.value = null

  try {
    const params = {
      category: category === 'all' ? undefined : category,
      sort: 'hot',
      limit: 30
    }

    const response = await getArticles(params)

    if (response.success) {
      articles.value = response.data.articles
    } else {
      error.value = response.message || '获取文章失败'
    }
  } catch (err) {
    console.error('Failed to fetch articles:', err)
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 切换分类
const changeCategory = (category) => {
  currentCategory.value = category
  fetchArticles(category)
}

// 格式化时间
const formatTime = (dateString) => {
  if (!dateString) return ''

  const now = new Date()
  const date = new Date(dateString)
  const diff = Math.floor((now - date) / 1000) // 秒

  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`

  return date.toLocaleDateString('zh-CN')
}

// 组件挂载时获取文章
onMounted(() => {
  fetchArticles()
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- 固定顶部横幅 - 48px -->
    <header class="fixed top-0 left-0 right-0 z-50 h-12 bg-white border-b border-gray-200">
      <div class="h-full max-w-screen-2xl mx-auto px-6 flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-2.5 transition-transform duration-200 hover:-translate-y-0.5">
          <img src="/logo.png" alt="Fast Info Logo" class="w-6 h-6 rounded-md">
          <span class="text-base font-medium text-black">Fast Info</span>
        </router-link>

        <!-- 导航菜单 -->
        <nav class="hidden md:flex items-center space-x-6">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/tech" class="nav-link">科技</router-link>
          <router-link to="/dev" class="nav-link">开发者</router-link>
          <router-link to="/opensource" class="nav-link">开源</router-link>
          <router-link to="/academic" class="nav-link">学术</router-link>
          <router-link to="/product" class="nav-link">产品</router-link>
        </nav>

        <button class="px-3 py-1.5 text-sm font-medium text-black transition-transform duration-200 hover:-translate-y-0.5">
          登录
        </button>
      </div>
    </header>

    <!-- 主内容区 - 流体布局 -->
    <main class="pt-12">
      <div class="max-w-screen-2xl mx-auto px-6">
        <!-- Hero 区域 -->
        <div class="py-20 max-w-3xl">
          <h1 class="text-6xl font-medium text-black mb-6 leading-tight">
            Fast Info
          </h1>
          <p class="text-xl text-gray-600 leading-relaxed">
            专注高质量信息聚合
          </p>
        </div>

        <!-- 分类导航 -->
        <div class="border-b border-gray-200 mb-12">
          <div class="flex items-center space-x-8">
            <button
              @click="changeCategory('all')"
              :class="['nav-tab', { active: currentCategory === 'all' }]"
            >
              全部
            </button>
            <button
              @click="changeCategory('tech')"
              :class="['nav-tab', { active: currentCategory === 'tech' }]"
            >
              科技
            </button>
            <button
              @click="changeCategory('dev')"
              :class="['nav-tab', { active: currentCategory === 'dev' }]"
            >
              开发者
            </button>
            <button
              @click="changeCategory('opensource')"
              :class="['nav-tab', { active: currentCategory === 'opensource' }]"
            >
              开源
            </button>
            <button
              @click="changeCategory('academic')"
              :class="['nav-tab', { active: currentCategory === 'academic' }]"
            >
              学术
            </button>
            <button
              @click="changeCategory('product')"
              :class="['nav-tab', { active: currentCategory === 'product' }]"
            >
              产品
            </button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-20">
          <div class="text-gray-400">加载中...</div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="text-center py-20">
          <div class="text-red-500">{{ error }}</div>
          <button
            @click="fetchArticles(currentCategory)"
            class="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
          >
            重试
          </button>
        </div>

        <!-- 文章网格 -->
        <div v-else-if="articles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          <a
            v-for="article in articles"
            :key="article.id"
            :href="article.url"
            target="_blank"
            rel="noopener noreferrer"
            class="article-card"
          >
            <div class="mb-3">
              <span class="text-xs font-medium text-gray-500">{{ article.source }}</span>
              <span class="mx-2 text-gray-300">·</span>
              <span class="text-xs text-gray-400">{{ formatTime(article.published_at) }}</span>
            </div>
            <h3 class="text-lg font-medium text-black mb-2 leading-snug">
              {{ article.title }}
            </h3>
            <p v-if="article.summary" class="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
              {{ article.summary }}
            </p>
            <div class="flex items-center space-x-4 text-xs text-gray-500">
              <span v-if="article.likes > 0">{{ article.likes }} 赞</span>
              <span v-if="article.comments > 0">{{ article.comments }} 评论</span>
              <span v-if="article.quality_score" class="ml-auto text-gray-400">质量分: {{ article.quality_score }}</span>
            </div>
          </a>
        </div>

        <!-- 空状态 -->
        <div v-else class="text-center py-20">
          <div class="text-gray-400">暂无文章</div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 导航链接 */
.nav-link {
  @apply text-sm font-medium text-gray-600 transition-all duration-200;
}

.nav-link:hover {
  @apply text-black transform -translate-y-0.5;
}

.router-link-active {
  @apply text-black;
}

/* 分类标签 */
.nav-tab {
  @apply px-4 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent transition-all duration-200;
}

.nav-tab:hover {
  @apply text-black;
}

.nav-tab.active {
  @apply text-black border-black;
}

/* 文章卡片 */
.article-card {
  @apply p-5 cursor-pointer transition-transform duration-200;
}

.article-card:hover {
  @apply transform -translate-y-1;
}

/* 文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchArticles } from '@/api/article'

const route = useRoute()
const router = useRouter()

// 状态管理
const searchQuery = ref('')
const articles = ref([])
const loading = ref(false)
const error = ref(null)
const showAISummary = ref({})
const currentPage = ref(1)
const pagination = ref({
  total: 0,
  totalPages: 0,
  limit: 20
})

// 筛选状态
const filters = ref({
  timeRange: 'all',
  source: '',
  category: ''
})

// 时间范围选项
const timeRangeOptions = [
  { value: 'all', label: '全部时间' },
  { value: 'today', label: '今天' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' }
]

// 数据源选项
const sourceOptions = [
  { value: '', label: '所有来源' },
  { value: 'Hacker News', label: 'Hacker News' },
  { value: 'GitHub Trending', label: 'GitHub' },
  { value: 'Product Hunt', label: 'Product Hunt' },
  { value: 'Dev.to', label: 'Dev.to' },
  { value: 'arXiv', label: 'arXiv' },
  { value: 'V2EX', label: 'V2EX' },
  { value: '掘金', label: '掘金' },
  { value: 'AIBase', label: 'AIBase' }
]

// 分类选项
const categoryOptions = [
  { value: '', label: '所有分类' },
  { value: 'tech', label: '科技' },
  { value: 'dev', label: '开发者' },
  { value: 'opensource', label: '开源' },
  { value: 'academic', label: '学术' },
  { value: 'product', label: '产品' }
]

// 执行搜索
const performSearch = async (page = 1) => {
  if (!searchQuery.value.trim()) {
    error.value = '请输入搜索关键词'
    return
  }

  loading.value = true
  error.value = null
  currentPage.value = page

  try {
    const params = {
      q: searchQuery.value.trim(),
      page,
      limit: 20
    }

    // 添加筛选参数
    if (filters.value.timeRange && filters.value.timeRange !== 'all') {
      params.timeRange = filters.value.timeRange
    }
    if (filters.value.source) {
      params.source = filters.value.source
    }
    if (filters.value.category) {
      params.category = filters.value.category
    }

    const response = await searchArticles(params)

    if (response.success) {
      articles.value = response.data.articles
      pagination.value = response.data.pagination
    } else {
      error.value = response.message || '搜索失败'
    }
  } catch (err) {
    console.error('Search failed:', err)
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 应用筛选
const applyFilter = (type, value) => {
  filters.value[type] = value
  performSearch(1)
}

// 清除单个筛选
const clearFilter = (type) => {
  filters.value[type] = type === 'timeRange' ? 'all' : ''
  performSearch(1)
}

// 提交搜索
const handleSearch = (e) => {
  if (e) e.preventDefault()
  if (!searchQuery.value.trim()) return

  router.push({
    path: '/search',
    query: { q: searchQuery.value.trim() }
  })

  performSearch()
}

// 格式化时间
const formatTime = (dateString) => {
  if (!dateString) return ''

  const now = new Date()
  const date = new Date(dateString)
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  if (diff < 604800) return `${Math.floor(diff / 86400)} 天前`

  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

// 切换 AI 摘要显示
const toggleAISummary = (event, articleId) => {
  event.preventDefault()
  event.stopPropagation()
  showAISummary.value[articleId] = !showAISummary.value[articleId]
}

// 监听路由变化
watch(() => route.query.q, (newQuery) => {
  if (newQuery && newQuery !== searchQuery.value) {
    searchQuery.value = newQuery
    performSearch()
  }
})

// 组件挂载
onMounted(() => {
  const query = route.query.q
  if (query) {
    searchQuery.value = query
    performSearch()
  }
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- 固定顶部横幅 -->
    <header class="fixed top-0 left-0 right-0 z-50 h-12 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div class="h-full max-w-screen-2xl mx-auto px-6 flex items-center justify-between">
        <router-link to="/" class="flex items-center space-x-2.5 group">
          <img src="/logo.png" alt="Fast Info" class="w-6 h-6 rounded-md transition-transform group-hover:scale-105">
          <span class="text-base font-medium text-black">Fast Info</span>
        </router-link>

        <nav class="hidden md:flex items-center space-x-6">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/tech" class="nav-link">科技</router-link>
          <router-link to="/dev" class="nav-link">开发者</router-link>
          <router-link to="/academic" class="nav-link">学术</router-link>
          <router-link to="/product" class="nav-link">产品</router-link>
        </nav>

        <button class="px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-100 rounded-md transition-colors">
          登录
        </button>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="pt-12">
      <div class="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 搜索头部 -->
        <div class="py-8 sm:py-12 max-w-3xl mx-auto">
          <div class="text-center mb-8">
            <h1 class="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">搜索技术资讯</h1>
            <p class="mt-2 text-sm text-gray-500">在 {{ pagination.total || 0 }} 篇文章中搜索</p>
          </div>

          <!-- 搜索框 -->
          <form @submit.prevent="handleSearch" class="relative group">
            <div class="relative">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-600"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索 AI、Vue 3、React..."
                class="w-full pl-12 pr-24 py-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100 transition-all"
                autofocus
              />
              <button
                type="submit"
                class="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 active:scale-95 transition-all"
              >
                搜索
              </button>
            </div>
          </form>

          <!-- 筛选芯片 -->
          <div class="mt-6 flex flex-wrap gap-2">
            <!-- 时间范围筛选 -->
            <div class="flex gap-2 items-center">
              <span class="text-xs text-gray-500">时间:</span>
              <button
                v-for="option in timeRangeOptions"
                :key="option.value"
                @click="applyFilter('timeRange', option.value)"
                :class="[
                  'filter-chip',
                  filters.timeRange === option.value ? 'filter-chip-active' : ''
                ]"
              >
                {{ option.label }}
              </button>
            </div>

            <!-- 来源筛选 -->
            <div class="flex gap-2 items-center flex-wrap">
              <span class="text-xs text-gray-500">来源:</span>
              <select
                v-model="filters.source"
                @change="performSearch(1)"
                class="text-xs px-3 py-1.5 border border-gray-200 rounded-full hover:border-gray-300 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition-all cursor-pointer"
              >
                <option v-for="option in sourceOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <!-- 分类筛选 -->
            <div class="flex gap-2 items-center flex-wrap">
              <span class="text-xs text-gray-500">分类:</span>
              <button
                v-for="option in categoryOptions.slice(1)"
                :key="option.value"
                @click="applyFilter('category', filters.category === option.value ? '' : option.value)"
                :class="[
                  'filter-chip',
                  filters.category === option.value ? 'filter-chip-active' : ''
                ]"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- 当前筛选标签 -->
          <div v-if="filters.source || filters.category || filters.timeRange !== 'all'" class="mt-4 flex flex-wrap gap-2">
            <span class="text-xs text-gray-500">已选筛选:</span>
            <button
              v-if="filters.timeRange !== 'all'"
              @click="clearFilter('timeRange')"
              class="active-filter-tag"
            >
              {{ timeRangeOptions.find(o => o.value === filters.timeRange)?.label }}
              <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              v-if="filters.source"
              @click="clearFilter('source')"
              class="active-filter-tag"
            >
              {{ sourceOptions.find(o => o.value === filters.source)?.label }}
              <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              v-if="filters.category"
              @click="clearFilter('category')"
              class="active-filter-tag"
            >
              {{ categoryOptions.find(o => o.value === filters.category)?.label }}
              <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 加载骨架屏 -->
        <div v-if="loading" class="max-w-4xl mx-auto space-y-4 pb-20">
          <div v-for="i in 5" :key="i" class="skeleton-card">
            <div class="flex items-center justify-between mb-4">
              <div class="skeleton-line w-24 h-4"></div>
              <div class="skeleton-line w-16 h-4"></div>
            </div>
            <div class="skeleton-line w-3/4 h-6 mb-3"></div>
            <div class="skeleton-line w-full h-4 mb-2"></div>
            <div class="skeleton-line w-5/6 h-4 mb-4"></div>
            <div class="flex gap-2">
              <div class="skeleton-line w-16 h-5"></div>
              <div class="skeleton-line w-20 h-5"></div>
            </div>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="text-center py-20">
          <div class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-red-50 rounded-full">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">搜索失败</h3>
          <p class="text-sm text-gray-500">{{ error }}</p>
        </div>

        <!-- 无结果 -->
        <div v-else-if="articles.length === 0 && searchQuery" class="text-center py-20">
          <div class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">未找到相关文章</h3>
          <p class="text-sm text-gray-500">试试其他关键词或调整筛选条件</p>
        </div>

        <!-- 搜索结果 -->
        <div v-else-if="articles.length > 0" class="max-w-4xl mx-auto">
          <!-- 结果统计 -->
          <div class="mb-6 text-sm text-gray-600">
            找到 <span class="font-medium text-gray-900">{{ pagination.total }}</span> 条结果
          </div>

          <!-- 文章列表 -->
          <div class="space-y-4 pb-12">
            <article
              v-for="article in articles"
              :key="article.id"
              class="article-card group"
            >
              <a
                :href="article.url"
                target="_blank"
                rel="noopener noreferrer"
                class="block"
              >
                <!-- 文章头部 -->
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2 text-xs">
                    <span class="source-badge">{{ article.source }}</span>
                    <span class="text-gray-400">•</span>
                    <span class="text-gray-500">{{ formatTime(article.published_at) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span v-if="article.quality_score" class="text-xs text-gray-400">
                      质量分 {{ article.quality_score }}
                    </span>
                  </div>
                </div>

                <!-- 标题 -->
                <h2 class="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                  {{ article.title }}
                </h2>

                <!-- 摘要 -->
                <p v-if="article.summary" class="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
                  {{ article.summary }}
                </p>

                <!-- 元数据和标签 -->
                <div class="flex items-center gap-3 text-xs">
                  <span v-if="article.likes > 0" class="text-gray-500">👍 {{ article.likes }}</span>
                  <span v-if="article.comments > 0" class="text-gray-500">💬 {{ article.comments }}</span>
                  <span class="category-badge" :data-category="article.category">
                    {{ categoryOptions.find(c => c.value === article.category)?.label || article.category }}
                  </span>
                </div>
              </a>

              <!-- AI 摘要按钮 -->
              <div v-if="article.ai_summary" class="mt-4 pt-4 border-t border-gray-100">
                <button
                  @click="(e) => toggleAISummary(e, article.id)"
                  class="ai-button"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18.5c-4.42-1.12-7.5-5.58-7.5-10.5V8.5L12 4.5l7.5 4v5.5c0 4.92-3.08 9.38-7.5 10.5z"/>
                  </svg>
                  <span>查看 AI 深度分析</span>
                  <span class="ai-badge">PRO</span>
                </button>

                <!-- AI 摘要内容 -->
                <div v-if="showAISummary[article.id]" class="ai-summary-panel">
                  <div class="ai-summary-header">
                    <img src="/doubao-logo.jpeg" alt="豆包" class="w-5 h-5 rounded">
                    <span class="font-medium text-gray-900">AI 技术分析</span>
                  </div>
                  <div class="ai-summary-content">
                    {{ article.ai_summary }}
                  </div>
                  <div class="ai-summary-footer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>由豆包大模型生成，仅供参考</span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <!-- 分页 -->
          <div v-if="pagination.totalPages > 1" class="flex justify-center items-center gap-2 py-12">
            <button
              @click="performSearch(currentPage - 1)"
              :disabled="currentPage === 1"
              class="pagination-button"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              上一页
            </button>

            <div class="flex items-center gap-2 px-4">
              <span class="text-sm text-gray-600">第</span>
              <span class="text-sm font-medium text-gray-900">{{ currentPage }}</span>
              <span class="text-sm text-gray-600">/</span>
              <span class="text-sm text-gray-600">{{ pagination.totalPages }}</span>
              <span class="text-sm text-gray-600">页</span>
            </div>

            <button
              @click="performSearch(currentPage + 1)"
              :disabled="currentPage === pagination.totalPages"
              class="pagination-button"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === pagination.totalPages }"
            >
              下一页
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 导航链接 */
.nav-link {
  @apply text-sm text-gray-600 hover:text-black transition-colors relative;
}

.nav-link.router-link-active {
  @apply text-black font-medium;
}

.nav-link.router-link-active::after {
  content: '';
  @apply absolute -bottom-3 left-0 right-0 h-0.5 bg-black;
}

/* 筛选芯片 */
.filter-chip {
  @apply px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-full
         hover:border-gray-900 hover:bg-gray-50 transition-all cursor-pointer;
}

.filter-chip-active {
  @apply bg-gray-900 text-white border-gray-900 hover:bg-gray-800;
}

/* 激活的筛选标签 */
.active-filter-tag {
  @apply inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full
         border border-blue-200 hover:bg-blue-100 transition-colors;
}

/* 骨架屏 */
.skeleton-card {
  @apply p-6 bg-white border border-gray-200 rounded-2xl;
}

.skeleton-line {
  @apply bg-gray-200 rounded animate-pulse;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 文章卡片 */
.article-card {
  @apply p-6 bg-white border border-gray-200 rounded-2xl
         hover:border-gray-300 hover:shadow-lg transition-all duration-200;
}

/* 来源标签 */
.source-badge {
  @apply inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md;
}

/* 分类标签 */
.category-badge {
  @apply inline-flex items-center px-2 py-1 rounded-full text-xs font-medium;
}

.category-badge[data-category="tech"] {
  @apply bg-blue-50 text-blue-700;
}

.category-badge[data-category="dev"] {
  @apply bg-green-50 text-green-700;
}

.category-badge[data-category="academic"] {
  @apply bg-purple-50 text-purple-700;
}

.category-badge[data-category="product"] {
  @apply bg-orange-50 text-orange-700;
}

.category-badge[data-category="opensource"] {
  @apply bg-pink-50 text-pink-700;
}

/* AI 按钮 */
.ai-button {
  @apply inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium
         bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50
         border border-purple-200 rounded-xl
         hover:from-purple-100 hover:via-blue-100 hover:to-cyan-100
         hover:border-purple-300 hover:shadow-md
         active:scale-98 transition-all duration-200 cursor-pointer;
  color: #6366f1;
}

.ai-badge {
  @apply px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full;
}

/* AI 摘要面板 */
.ai-summary-panel {
  @apply mt-4 p-5 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50
         border border-gray-200 rounded-xl;
}

.ai-summary-header {
  @apply flex items-center gap-2 pb-3 mb-3 border-b border-gray-200;
}

.ai-summary-content {
  @apply text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-4;
}

.ai-summary-footer {
  @apply flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-gray-200;
}

/* 分页按钮 */
.pagination-button {
  @apply inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
         bg-white border border-gray-200 rounded-xl
         hover:bg-gray-50 hover:border-gray-300
         active:scale-95 transition-all;
}

/* 文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { getArticles } from '@/api/article'

// 状态管理
const articles = ref([])
const loading = ref(true)
const error = ref(null)
const showAISummary = ref({}) // 记录每篇文章是否展开 AI 摘要

// 获取产品分类文章
const fetchArticles = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await getArticles({
      category: 'product',
      sort: 'hot',
      limit: 30
    })

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

// 切换 AI 摘要显示
const toggleAISummary = (event, articleId) => {
  event.preventDefault() // 阻止链接跳转
  event.stopPropagation()

  showAISummary.value[articleId] = !showAISummary.value[articleId]
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
          <router-link to="/product" class="nav-link">产品</router-link>
          <router-link to="/academic" class="nav-link">学术</router-link>
        </nav>

        <button class="px-3 py-1.5 text-sm font-medium text-black transition-transform duration-200 hover:-translate-y-0.5">
          登录
        </button>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="pt-12">
      <div class="max-w-screen-2xl mx-auto px-6">
        <!-- 页面标题 -->
        <div class="py-12">
          <h1 class="text-4xl font-semibold text-black mb-3">产品动态</h1>
          <p class="text-lg text-gray-600">发现新产品、创新工具和行业动态</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-20">
          <div class="text-gray-400">加载中...</div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="text-center py-20">
          <div class="text-red-500">{{ error }}</div>
          <button
            @click="fetchArticles"
            class="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
          >
            重试
          </button>
        </div>

        <!-- 文章网格 -->
        <div v-else-if="articles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          <div
            v-for="article in articles"
            :key="article.id"
            class="article-card-wrapper"
          >
            <a
              :href="article.url"
              target="_blank"
              rel="noopener noreferrer"
              class="article-card"
            >
              <!-- 来源标注 - 法律合规要求 -->
              <div class="mb-3 flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="text-xs text-gray-400">来源：</span>
                  <span class="inline-flex items-center text-xs font-medium text-blue-600">
                    {{ article.source }}
                    <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                  </span>
                </div>
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

              <!-- AI 摘要按钮 - 只在有 AI 摘要时显示 -->
              <div v-if="article.ai_summary" class="mt-4">
                <button
                  @click="(e) => toggleAISummary(e, article.id)"
                  class="ai-button"
                >
                  <span class="ai-button-icon">✨</span>
                  <span class="ai-button-text">AI 深度分析</span>
                  <span class="ai-button-badge">PRO</span>
                </button>
              </div>

              <!-- AI 摘要内容 - 展开显示 -->
              <div
                v-if="article.ai_summary && showAISummary[article.id]"
                class="ai-summary-content"
              >
                <div class="ai-summary-header">
                  <img src="/doubao-logo.jpeg" alt="豆包" class="doubao-logo-img">
                  <span class="ai-title">AI 技术分析</span>
                </div>
                <div class="ai-summary-text">
                  {{ article.ai_summary }}
                </div>
                <div class="ai-summary-footer">
                  由豆包大模型生成 • 仅供参考
                </div>
              </div>

              <!-- 版权提示 -->
              <div class="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                内容来自 {{ article.source }}，点击查看原文
              </div>
            </a>
          </div>
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

/* 文章卡片 */
.article-card-wrapper {
  @apply relative;
}

.article-card {
  @apply block p-5 cursor-pointer transition-transform duration-200;
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

/* AI 按钮 - 灵动设计 */
.ai-button {
  @apply relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md
         text-xs font-medium text-white transition-all duration-300
         overflow-hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 8px 0 rgba(102, 126, 234, 0.25);
}

.ai-button:hover {
  @apply transform -translate-y-0.5;
  box-shadow: 0 4px 12px 0 rgba(102, 126, 234, 0.35);
}

/* AI 按钮渐变动画 */
.ai-button::before {
  content: '';
  @apply absolute inset-0 opacity-0 transition-opacity duration-300;
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.ai-button:hover::before {
  @apply opacity-100;
}

/* AI 按钮闪光效果 */
.ai-button::after {
  content: '';
  @apply absolute top-0 left-0 w-full h-full;
  background: linear-gradient(90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transform: translateX(-100%);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
  100% { transform: translateX(100%); }
}

/* AI 按钮内容 */
.ai-button-icon {
  @apply relative z-10 text-sm;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.15) rotate(8deg);
    opacity: 0.8;
  }
}

.ai-button-text {
  @apply relative z-10;
}

.ai-button-badge {
  @apply relative z-10 px-1 py-0 text-[10px] font-bold rounded
         bg-white/20 backdrop-blur-sm;
}

/* AI 摘要内容区 */
.ai-summary-content {
  @apply mt-4 p-4 rounded-lg border border-purple-100
         bg-gradient-to-br from-purple-50/50 to-blue-50/50
         backdrop-blur-sm transition-all duration-300;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-summary-header {
  @apply flex items-center gap-2 mb-3 pb-2 border-b border-purple-200/50;
}

.doubao-logo-img {
  @apply w-8 h-8 rounded-md object-contain;
  animation: float 3s ease-in-out infinite;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}

.ai-title {
  @apply text-sm font-semibold text-purple-900;
}

.ai-summary-text {
  @apply text-base text-gray-800 leading-loose mb-3;
  white-space: pre-line;
  font-weight: 400;
  line-height: 1.8;
  letter-spacing: 0.01em;
}

.ai-summary-footer {
  @apply text-xs text-gray-500 italic;
}
</style>

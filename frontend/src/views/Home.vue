<template>
  <div class="min-h-screen bg-white">
    <!-- 顶部导航 - Perplexity 风格 -->
    <header class="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center space-x-2 group">
            <div class="w-7 h-7 bg-black rounded-lg"></div>
            <span class="text-xl font-medium text-gray-900">Fast Info</span>
          </router-link>

          <!-- 导航菜单 - 极简 -->
          <nav class="hidden md:flex items-center space-x-8">
            <router-link to="/" class="nav-link">首页</router-link>
            <router-link to="/tech" class="nav-link">科技</router-link>
            <router-link to="/dev" class="nav-link">开发者</router-link>
            <router-link to="/academic" class="nav-link">学术</router-link>
          </nav>

          <!-- 右侧操作 -->
          <div class="flex items-center space-x-3">
            <button class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              登录
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 - Perplexity 风格 -->
    <main class="max-w-4xl mx-auto px-6 py-16">
      <!-- 欢迎标题 - 极简 -->
      <div class="mb-16">
        <h1 class="text-5xl font-semibold text-gray-900 mb-4">Fast Info</h1>
        <p class="text-xl text-gray-500">
          专注高质量信息聚合
        </p>
      </div>

      <!-- 搜索框 - 突出显示 -->
      <div class="mb-16">
        <div class="relative">
          <input
            type="search"
            placeholder="搜索或询问任何问题..."
            class="w-full px-6 py-4 text-base bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
          />
          <div class="absolute right-4 top-1/2 -translate-y-1/2">
            <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 分类标签 - 扁平化 -->
      <div class="flex items-center space-x-3 mb-12">
        <button class="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-full">
          全部
        </button>
        <button class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors">
          科技
        </button>
        <button class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors">
          开发者
        </button>
        <button class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors">
          学术
        </button>
      </div>

      <!-- 文章列表 - 极简卡片 -->
      <div class="space-y-8">
        <!-- 文章卡片 1 -->
        <article class="group cursor-pointer">
          <div class="flex items-start space-x-4 p-6 rounded-2xl hover:bg-gray-50 transition-all">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-3">
                <span class="text-xs font-medium text-gray-500">科技</span>
                <span class="text-gray-300">·</span>
                <span class="text-xs text-gray-400">36氪</span>
                <span class="text-gray-300">·</span>
                <span class="text-xs text-gray-400">2小时前</span>
              </div>
              <h2 class="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                示例文章标题 - 这里将显示聚合的高质量新闻
              </h2>
              <p class="text-gray-600 leading-relaxed mb-4">
                这里是文章摘要的预览，展示文章的主要内容和关键信息，帮助用户快速了解文章内容...
              </p>
              <div class="flex items-center space-x-6 text-sm text-gray-400">
                <span>42 阅读</span>
                <span>12 评论</span>
              </div>
            </div>
          </div>
        </article>

        <!-- 文章卡片 2 -->
        <article class="group cursor-pointer">
          <div class="flex items-start space-x-4 p-6 rounded-2xl hover:bg-gray-50 transition-all">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-3">
                <span class="text-xs font-medium text-gray-500">开发者</span>
                <span class="text-gray-300">·</span>
                <span class="text-xs text-gray-400">GitHub Trending</span>
                <span class="text-gray-300">·</span>
                <span class="text-xs text-gray-400">5小时前</span>
              </div>
              <h2 class="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                热门开源项目推荐
              </h2>
              <p class="text-gray-600 leading-relaxed mb-4">
                最新的开源项目和技术趋势，帮助开发者了解前沿动态...
              </p>
              <div class="flex items-center space-x-6 text-sm text-gray-400">
                <span>128 阅读</span>
                <span>23 评论</span>
              </div>
            </div>
          </div>
        </article>

        <!-- 文章卡片 3 -->
        <article class="group cursor-pointer">
          <div class="flex items-start space-x-4 p-6 rounded-2xl hover:bg-gray-50 transition-all">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-3">
                <span class="text-xs font-medium text-gray-500">学术</span>
                <span class="text-gray-300">·</span>
                <span class="text-xs text-gray-400">arXiv</span>
                <span class="text-gray-300">·</span>
                <span class="text-xs text-gray-400">1天前</span>
              </div>
              <h2 class="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                最新研究论文精选
              </h2>
              <p class="text-gray-600 leading-relaxed mb-4">
                人工智能和机器学习领域的最新研究成果...
              </p>
              <div class="flex items-center space-x-6 text-sm text-gray-400">
                <span>89 阅读</span>
                <span>7 评论</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- 加载更多 -->
      <div class="text-center mt-16">
        <button class="px-8 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
          加载更多
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Fast Info 启动成功')
})
</script>

<style scoped>
.nav-link {
  @apply px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors;
}

.router-link-active {
  @apply text-gray-900 bg-gray-100;
}
</style>

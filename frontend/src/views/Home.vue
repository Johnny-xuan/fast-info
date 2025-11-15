<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航 -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex items-center justify-between h-14">
          <!-- Logo -->
          <div class="flex items-center space-x-8">
            <router-link to="/" class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded"></div>
              <span class="text-lg font-semibold text-gray-900">Fast Info</span>
            </router-link>

            <!-- 导航菜单 -->
            <nav class="hidden md:flex items-center space-x-1">
              <router-link to="/" class="nav-link">首页</router-link>
              <router-link to="/tech" class="nav-link">科技</router-link>
              <router-link to="/dev" class="nav-link">开发者</router-link>
              <router-link to="/academic" class="nav-link">学术</router-link>
            </nav>
          </div>

          <!-- 搜索框 -->
          <div class="flex items-center space-x-4">
            <div class="relative">
              <input
                type="search"
                placeholder="搜索..."
                class="w-64 px-3 py-1.5 text-sm bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />
            </div>
            <button class="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
              登录
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="max-w-6xl mx-auto px-4 py-8">
      <!-- 欢迎区域 -->
      <div class="bg-white rounded-lg border border-gray-200 p-8 mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-3">Fast Info</h1>
        <p class="text-gray-600 mb-4">
          专注于科技、开发者和学术领域的高质量信息聚合平台
        </p>
        <div class="flex items-center space-x-4 text-sm text-gray-500">
          <span>项目开发中</span>
          <span>·</span>
          <span>Vue 3 + Vite</span>
          <span>·</span>
          <span>v0.1.0</span>
        </div>
      </div>

      <!-- 内容区域示例 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 主要内容 -->
        <div class="lg:col-span-2 space-y-4">
          <!-- 文章卡片示例 -->
          <article class="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-colors cursor-pointer">
            <div class="flex items-start space-x-3">
              <div class="flex flex-col items-center space-y-1 pt-1">
                <button class="text-gray-400 hover:text-blue-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <span class="text-sm font-medium text-gray-700">42</span>
                <button class="text-gray-400 hover:text-blue-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                  <span class="font-medium text-gray-700">科技资讯</span>
                  <span>·</span>
                  <span>36氪</span>
                  <span>·</span>
                  <span>2小时前</span>
                </div>
                <h2 class="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                  示例文章标题 - 这里将显示聚合的新闻标题
                </h2>
                <p class="text-sm text-gray-600 mb-3">
                  这里是文章摘要的预览，展示文章的主要内容和关键信息...
                </p>
                <div class="flex items-center space-x-4 text-xs text-gray-500">
                  <button class="hover:text-gray-700">12 评论</button>
                  <button class="hover:text-gray-700">分享</button>
                  <button class="hover:text-gray-700">收藏</button>
                </div>
              </div>
            </div>
          </article>

          <article class="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-colors cursor-pointer">
            <div class="flex items-start space-x-3">
              <div class="flex flex-col items-center space-y-1 pt-1">
                <button class="text-gray-400 hover:text-blue-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <span class="text-sm font-medium text-gray-700">28</span>
                <button class="text-gray-400 hover:text-blue-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                  <span class="font-medium text-gray-700">开发者</span>
                  <span>·</span>
                  <span>GitHub</span>
                  <span>·</span>
                  <span>5小时前</span>
                </div>
                <h2 class="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                  另一个示例文章标题
                </h2>
                <p class="text-sm text-gray-600 mb-3">
                  开发者相关的新闻内容预览...
                </p>
                <div class="flex items-center space-x-4 text-xs text-gray-500">
                  <button class="hover:text-gray-700">5 评论</button>
                  <button class="hover:text-gray-700">分享</button>
                  <button class="hover:text-gray-700">收藏</button>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- 侧边栏 -->
        <div class="space-y-4">
          <!-- 热门标签 -->
          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">热门标签</h3>
            <div class="flex flex-wrap gap-2">
              <span class="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer">人工智能</span>
              <span class="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer">前端开发</span>
              <span class="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer">机器学习</span>
              <span class="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer">区块链</span>
              <span class="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer">云计算</span>
            </div>
          </div>

          <!-- 信息源 -->
          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">信息源</h3>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between py-1">
                <span class="text-gray-700">36氪</span>
                <span class="text-xs text-gray-500">科技</span>
              </div>
              <div class="flex items-center justify-between py-1">
                <span class="text-gray-700">GitHub</span>
                <span class="text-xs text-gray-500">开发者</span>
              </div>
              <div class="flex items-center justify-between py-1">
                <span class="text-gray-700">Hacker News</span>
                <span class="text-xs text-gray-500">开发者</span>
              </div>
              <div class="flex items-center justify-between py-1">
                <span class="text-gray-700">arXiv</span>
                <span class="text-xs text-gray-500">学术</span>
              </div>
            </div>
          </div>
        </div>
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

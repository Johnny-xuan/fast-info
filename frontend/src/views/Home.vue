<template>
  <div class="min-h-screen bg-white">
    <!-- 固定顶部横幅 - 48px -->
    <header class="fixed top-0 left-0 right-0 z-50 h-12 bg-white border-b border-gray-200">
      <div class="h-full max-w-screen-2xl mx-auto px-6 flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-2.5 transition-transform duration-200 hover:-translate-y-0.5">
          <div class="w-6 h-6 bg-black"></div>
          <span class="text-base font-medium text-black">Fast Info</span>
        </router-link>

        <!-- 导航菜单 -->
        <nav class="hidden md:flex items-center space-x-6">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/tech" class="nav-link">科技</router-link>
          <router-link to="/dev" class="nav-link">开发者</router-link>
          <router-link to="/academic" class="nav-link">学术</router-link>
        </nav>

        <!-- 右侧操作 -->
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
            <button class="nav-tab active">全部</button>
            <button class="nav-tab">科技</button>
            <button class="nav-tab">开发者</button>
            <button class="nav-tab">学术</button>
          </div>
        </div>

        <!-- 文章网格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          <!-- 文章卡片 1 -->
          <article class="article-card">
            <div class="mb-3">
              <span class="text-xs text-gray-500">科技 · 36氪</span>
            </div>
            <h2 class="article-title mb-3">
              示例文章标题 - 这里将显示聚合的高质量新闻内容
            </h2>
            <p class="text-sm text-gray-600 mb-4 line-clamp-2">
              这里是文章摘要的预览，展示文章的主要内容和关键信息
            </p>
            <div class="text-xs text-gray-400">
              2小时前
            </div>
          </article>

          <!-- 文章卡片 2 -->
          <article class="article-card">
            <div class="mb-3">
              <span class="text-xs text-gray-500">开发者 · GitHub</span>
            </div>
            <h2 class="article-title mb-3">
              热门开源项目推荐
            </h2>
            <p class="text-sm text-gray-600 mb-4 line-clamp-2">
              最新的开源项目和技术趋势，帮助开发者了解前沿动态
            </p>
            <div class="text-xs text-gray-400">
              5小时前
            </div>
          </article>

          <!-- 文章卡片 3 -->
          <article class="article-card">
            <div class="mb-3">
              <span class="text-xs text-gray-500">学术 · arXiv</span>
            </div>
            <h2 class="article-title mb-3">
              最新研究论文精选
            </h2>
            <p class="text-sm text-gray-600 mb-4 line-clamp-2">
              人工智能和机器学习领域的最新研究成果
            </p>
            <div class="text-xs text-gray-400">
              1天前
            </div>
          </article>

          <!-- 文章卡片 4 -->
          <article class="article-card">
            <div class="mb-3">
              <span class="text-xs text-gray-500">科技 · 少数派</span>
            </div>
            <h2 class="article-title mb-3">
              数字生活方式探讨
            </h2>
            <p class="text-sm text-gray-600 mb-4 line-clamp-2">
              探索更好的数字工具和生活方式
            </p>
            <div class="text-xs text-gray-400">
              3小时前
            </div>
          </article>

          <!-- 文章卡片 5 -->
          <article class="article-card">
            <div class="mb-3">
              <span class="text-xs text-gray-500">开发者 · Hacker News</span>
            </div>
            <h2 class="article-title mb-3">
              技术社区热门讨论
            </h2>
            <p class="text-sm text-gray-600 mb-4 line-clamp-2">
              开发者社区的最新话题和技术讨论
            </p>
            <div class="text-xs text-gray-400">
              6小时前
            </div>
          </article>

          <!-- 文章卡片 6 -->
          <article class="article-card">
            <div class="mb-3">
              <span class="text-xs text-gray-500">开发者 · Dev.to</span>
            </div>
            <h2 class="article-title mb-3">
              前端开发最佳实践
            </h2>
            <p class="text-sm text-gray-600 mb-4 line-clamp-2">
              分享前端开发的技巧和经验
            </p>
            <div class="text-xs text-gray-400">
              8小时前
            </div>
          </article>
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

.article-title {
  @apply text-base font-medium text-black leading-snug transition-colors duration-200;
}

.article-card:hover .article-title {
  @apply text-gray-600;
}

/* 文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

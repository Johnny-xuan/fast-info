<template>
  <div class="min-h-screen">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-primary-600">Fast Info</h1>
          </div>

          <!-- 导航菜单 -->
          <nav class="hidden md:flex space-x-8">
            <router-link to="/" class="nav-link">首页</router-link>
            <router-link to="/tech" class="nav-link">科技</router-link>
            <router-link to="/dev" class="nav-link">开发者</router-link>
            <router-link to="/academic" class="nav-link">学术</router-link>
          </nav>

          <!-- 搜索框 -->
          <div class="flex items-center">
            <input
              type="search"
              placeholder="搜索..."
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center py-20">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">欢迎来到 Fast Info</h2>
        <p class="text-xl text-gray-600 mb-8">专注高质量信息的聚合平台</p>
        <p class="text-gray-500">🚀 项目正在开发中...</p>
        <div class="mt-8 text-sm text-gray-400">
          <p>前端项目已成功创建</p>
          <p>技术栈：Vue 3 + Vite + TailwindCSS</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Fast Info 前端项目启动成功！')
})
</script>

<style scoped>
.nav-link {
  @apply text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors;
}

.router-link-active {
  @apply text-primary-600 font-semibold;
}
</style>

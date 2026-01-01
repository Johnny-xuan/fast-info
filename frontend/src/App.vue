<script setup>
import Footer from './components/Footer.vue'
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50 flex flex-col">
    <div class="flex-1">
      <router-view />
    </div>
    <Footer />
  </div>
</template>

<style>
/* 全局样式已在 main.css 中定义 */
</style>

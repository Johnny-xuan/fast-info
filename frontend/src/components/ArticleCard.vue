<template>
  <a :href="article.url" target="_blank" rel="noopener" class="article-card">
    <div class="card-header">
      <span class="source">{{ article.source }}</span>
      <span class="category" :class="article.category">{{ categoryLabel }}</span>
    </div>
    <h3 class="title">{{ article.title }}</h3>
    <p v-if="article.ai_summary" class="summary">{{ truncate(article.ai_summary, 100) }}</p>
    <div class="card-footer">
      <span class="date">{{ formatDate(article.created_at) }}</span>
      <span v-if="article.hot_score" class="hot">🔥 {{ article.hot_score }}</span>
    </div>
  </a>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
})

const categoryLabels = {
  tech: '科技',
  dev: '开发',
  academic: '学术',
  product: '产品',
  opensource: '开源'
}

const categoryLabel = computed(() => categoryLabels[props.article.category] || props.article.category)

function truncate(text, length) {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 3600000) return '刚刚'
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.article-card {
  display: block;
  padding: 12px;
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.article-card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.source {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
}

.category {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  background: #f0f0f0;
}

.category.tech { background: #e3f2fd; color: #1976d2; }
.category.dev { background: #e8f5e9; color: #388e3c; }
.category.academic { background: #fff3e0; color: #f57c00; }
.category.product { background: #fce4ec; color: #c2185b; }
.category.opensource { background: #f3e5f5; color: #7b1fa2; }

.title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 8px;
  line-height: 1.4;
}

.summary {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 8px;
  line-height: 1.4;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #999;
}

.hot {
  color: #ff5722;
}
</style>

<template>
  <div class="quick-actions">
    <span class="label">快捷查询：</span>
    <button
      v-for="action in actions"
      :key="action.query"
      class="action-btn"
      @click="$emit('select', action.query)"
    >
      {{ action.label }}
    </button>
  </div>
</template>

<script setup>
defineEmits(['select'])

const actions = [
  { label: '🔥 今日热点', query: '今天有什么热门文章？' },
  { label: '🤖 AI 新闻', query: '最新的 AI 相关新闻' },
  { label: '💻 开源项目', query: '推荐一些热门开源项目' },
  { label: '📊 本周精选', query: '这周有什么值得看的文章？' },
  { label: '📈 数据统计', query: '数据库里有多少文章？' }
]
</script>

<style scoped>
.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 12px 0;
}

.label {
  color: #666;
  font-size: 14px;
  margin-right: 4px;
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  background: #fff;
  color: #333;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f5f5f5;
  border-color: #1976d2;
  color: #1976d2;
}

.action-btn:active {
  transform: scale(0.98);
}
</style>

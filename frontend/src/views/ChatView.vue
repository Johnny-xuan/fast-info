<template>
  <div class="chat-container">
    <!-- 头部 -->
    <div class="chat-header">
      <h1>🗞️ 卖报员</h1>
      <p class="subtitle">你的智能技术资讯助手</p>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions" v-if="messages.length === 0">
      <button 
        v-for="suggestion in suggestions" 
        :key="suggestion.text"
        @click="sendMessage(suggestion.query)"
        class="quick-btn"
      >
        {{ suggestion.text }}
      </button>
    </div>

    <!-- 消息列表 -->
    <div class="messages" ref="messagesContainer">
      <div 
        v-for="(msg, index) in messages" 
        :key="index"
        :class="['message', msg.role]"
      >
        <div class="message-content">
          <div class="avatar">{{ msg.role === 'user' ? '👤' : '🗞️' }}</div>
          <div class="text">
            <div v-html="formatMessage(msg.content)"></div>
            
            <!-- 文章卡片 -->
            <div v-if="msg.articles && msg.articles.length > 0" class="articles-grid">
              <ArticleCard 
                v-for="article in msg.articles" 
                :key="article.id"
                :article="article"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="message assistant">
        <div class="message-content">
          <div class="avatar">🗞️</div>
          <div class="text loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入框 -->
    <div class="input-area">
      <input 
        v-model="inputText"
        @keyup.enter="sendMessage()"
        placeholder="问我任何关于技术资讯的问题..."
        :disabled="loading"
        ref="inputRef"
      />
      <button @click="sendMessage()" :disabled="loading || !inputText.trim()">
        发送
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import ArticleCard from '../components/ArticleCard.vue'
import { chatApi } from '../api/chat'

const inputText = ref('')
const messages = ref([])
const loading = ref(false)
const sessionId = ref(null)
const messagesContainer = ref(null)
const inputRef = ref(null)

const suggestions = ref([
  { text: '今日热点', query: '有什么今天的热门文章？' },
  { text: 'AI 新闻', query: '搜索 AI 相关的文章' },
  { text: '开源项目', query: '有什么新的开源项目？' },
  { text: '本周精选', query: '这周有什么值得看的文章？' },
  { text: '数据统计', query: '数据库里有多少文章？' }
])

async function sendMessage(text = inputText.value) {
  if (!text.trim() || loading.value) return
  
  const userMessage = text.trim()
  inputText.value = ''
  
  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: userMessage
  })
  
  loading.value = true
  scrollToBottom()
  
  try {
    const response = await chatApi.send(userMessage, sessionId.value)
    sessionId.value = response.sessionId
    
    // 添加助手回复
    messages.value.push({
      role: 'assistant',
      content: response.message,
      articles: response.articles
    })
  } catch (err) {
    messages.value.push({
      role: 'assistant',
      content: '抱歉，出了点问题。请稍后再试。'
    })
  } finally {
    loading.value = false
    scrollToBottom()
    inputRef.value?.focus()
  }
}

function formatMessage(text) {
  // 简单的 Markdown 转换
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<style scoped>
.chat-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.chat-header {
  text-align: center;
  margin-bottom: 20px;
}

.chat-header h1 {
  font-size: 2rem;
  margin: 0;
}

.subtitle {
  color: #666;
  margin: 5px 0 0;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}

.quick-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  background: #f0f0f0;
  border-color: #999;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.message {
  margin-bottom: 16px;
}

.message-content {
  display: flex;
  gap: 12px;
}

.message.user .message-content {
  flex-direction: row-reverse;
}

.avatar {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
}

.message.user .text {
  background: #007bff;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant .text {
  background: #f0f0f0;
  border-bottom-left-radius: 4px;
}

.articles-grid {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: #666;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.input-area {
  display: flex;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.input-area input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.input-area input:focus {
  outline: none;
  border-color: #007bff;
}

.input-area button {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

.input-area button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.input-area button:hover:not(:disabled) {
  background: #0056b3;
}
</style>

const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

// 加载环境变量
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// 数据库配置：优先使用 PostgreSQL，降级到 Supabase
const usePostgres = process.env.DB_HOST || process.env.USE_POSTGRES === 'true'
if (usePostgres) {
  const db = require('./src/db')
  db.healthCheck().then(result => {
    if (result.healthy) {
      console.log('✅ PostgreSQL connected')
    } else {
      console.error('❌ PostgreSQL connection failed:', result.error)
    }
  })
} else {
  // 降级到 Supabase
  require('./src/config/supabase')
}

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API 路由
app.get('/api', (req, res) => {
  res.json({
    message: 'Fast Info API - 卖报员 Agent',
    version: '2.0.0',
    endpoints: {
      articles: '/api/articles',
      articlesHot: '/api/articles/hot',
      articlesSearch: '/api/articles/search',
      chat: '/api/chat',
      chatSuggestions: '/api/chat/suggestions',
      pushConfigs: '/api/push/configs',
      pushDigest: '/api/push/digest',
      aiStats: '/api/ai/stats',
      aiBatchGenerate: '/api/ai/batch-generate',
      aiGenerateSummary: '/api/ai/generate-summary/:id',
      health: '/health'
    }
  })
})

// 挂载文章路由
const articleRoutes = require('./src/routes/article')
app.use('/api/articles', articleRoutes)

// 挂载 AI 路由
const aiRoutes = require('./src/routes/ai')
app.use('/api/ai', aiRoutes)

// 挂载 Chat 路由（卖报员 Agent）
const chatRoutes = require('./src/routes/chat')
app.use('/api/chat', chatRoutes)

// 挂载推送路由
const pushRoutes = require('./src/routes/push')
app.use('/api/push', pushRoutes)

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  })
})

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║                                        ║
║       Fast Info Backend Server         ║
║                                        ║
║  Status: Running                       ║
║  Port: ${PORT.toString().padEnd(33)}║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(27)}║
║  Time: ${new Date().toLocaleString('zh-CN').padEnd(31)}║
║                                        ║
╚════════════════════════════════════════╝
  `)

  // 启动自动 AI 摘要生成服务
  const autoAIService = require('./src/services/autoAIService')
  autoAIService.start()
  
  // 启动每日摘要推送任务
  if (process.env.ENABLE_PUSH === 'true') {
    const dailyDigest = require('./src/jobs/dailyDigest')
    dailyDigest.start()
  }
})

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('\n👋 Received SIGTERM, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('\n👋 Received SIGINT, shutting down gracefully...')
  process.exit(0)
})

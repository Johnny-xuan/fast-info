import express from 'express'
import dotenv from 'dotenv'
import { v4 as uuid } from 'uuid'
import { generateText } from 'ai'
import cron from 'node-cron'

import { ArticleService } from './services/articles.js'
import { CrawlerService } from './services/crawler.js'
import { SettingsService } from './services/settings.js'
import { AuthService } from './services/auth.js'
import { createAuthRoutes } from './routes/auth.js'
import createAdminRoutes from './routes/admin.js'
import { LangChainAgent } from './agent/langchainAgent.js'
import { PROVIDERS } from './utils/llmProvider.js'
import { testConnection, callLLM } from './utils/llmAdapter.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// 根据环境选择数据库和缓存
const isElectron = process.env.ELECTRON_MODE === 'true'
let db, cache

if (isElectron) {
  // Electron 模式：使用 SQLite + 内存缓存
  const { default: sqliteDb } = await import('./utils/sqlite.js')
  const { default: memoryCache } = await import('./utils/memoryCache.js')
  db = sqliteDb
  cache = memoryCache
  console.log('🖥️  Running in Electron mode (SQLite + Memory Cache)')
} else {
  // 服务器模式：使用 PostgreSQL + Redis
  const { db: pgDb } = await import('./utils/db.js')
  const { redisClient } = await import('./utils/redis.js')
  db = pgDb
  cache = redisClient
  console.log('🌐 Running in Server mode (PostgreSQL + Redis)')
}

// 中间件
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})
app.use(express.json())

// 服务实例
const articleService = new ArticleService(db, cache)
const settingsService = new SettingsService(cache, db)
const authService = new AuthService(db)
const agent = new LangChainAgent(articleService, db, cache)
const crawlerService = new CrawlerService(db, cache)

// Auth 路由
app.use('/api/auth', createAuthRoutes(authService))

// Admin 路由
app.use('/api/admin', createAdminRoutes(db, authService, crawlerService))

// ==================== Chat API ====================
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body
    const result = await agent.chat(sessionId || uuid(), message)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/chat/:sessionId', async (req, res) => {
  try {
    await agent.clearSession(req.params.sessionId)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ==================== Settings API ====================
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await settingsService.getPublicSettings()
    res.json({ success: true, data: settings })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

app.put('/api/settings', async (req, res) => {
  try {
    const { provider, apiKey, apiBase, model } = req.body
    await settingsService.saveLLMSettings({ provider, apiKey, apiBase, model })
    res.json({ success: true, message: '设置已保存' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

app.get('/api/settings/providers', (req, res) => {
  res.json({ success: true, data: PROVIDERS })
})

app.post('/api/settings/test', async (req, res) => {
  const { provider, apiKey, apiBase, model } = req.body
  
  // 使用多 Provider 适配器测试连接
  const result = await testConnection({
    provider,
    apiKey,
    apiBase: apiBase || PROVIDERS[provider]?.apiBase,
    model: model || PROVIDERS[provider]?.defaultModel,
  })
  
  res.json(result)
})

// 新增：生成文章 AI 摘要
app.post('/api/articles/:id/summary', async (req, res) => {
  try {
    const { id } = req.params
    const article = await articleService.getArticleById(id)
    
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' })
    }

    // 如果已有摘要，直接返回
    if (article.ai_summary) {
      return res.json({ success: true, summary: article.ai_summary })
    }

    // 获取 LLM 设置
    const llmSettings = await settingsService.getLLMSettings()
    if (!llmSettings || !llmSettings.apiKey) {
      return res.status(400).json({ success: false, message: '请先在设置中配置 AI API Key' })
    }

    // 补充 apiBase
    if (!llmSettings.apiBase) {
      llmSettings.apiBase = PROVIDERS[llmSettings.provider]?.apiBase
    }
    if (!llmSettings.model) {
      llmSettings.model = PROVIDERS[llmSettings.provider]?.defaultModel
    }

    let contentToSummarize = article.title
    
    // 尝试获取正文
    try {
      const firecrawl = await crawlerService.getFirecrawlClient()
      if (firecrawl) {
        console.log(`🕷️ Crawling content for summary: ${article.url}`)
        const scrapeResult = await firecrawl.scrapeUrl(article.url, { formats: ['markdown'] })
        if (scrapeResult.success && scrapeResult.markdown) {
          contentToSummarize = scrapeResult.markdown.slice(0, 8000) // 截取前 8000 字符避免超长
        }
      } else {
        // 尝试用 Jina Reader 作为备选
        console.log(`🕷️ Using Jina Reader for summary: ${article.url}`)
        const jinaResponse = await fetch(`https://r.jina.ai/${article.url}`)
        if (jinaResponse.ok) {
          const text = await jinaResponse.text()
          contentToSummarize = text.slice(0, 8000)
        }
      }
    } catch (e) {
      console.warn('Failed to fetch content, falling back to title:', e.message)
    }

    // 调用 LLM 生成摘要
    const systemPrompt = '你是一个技术文章摘要助手。请用中文简要总结这篇文章的核心观点，字数控制在 100 字以内。如果只有标题，请根据标题进行扩展解读。'
    const result = await callLLM(llmSettings, systemPrompt, [{ role: 'user', content: contentToSummarize }])
    const summary = result.content

    // 保存摘要
    await articleService.updateAISummary(id, summary)

    res.json({ success: true, summary })
  } catch (error) {
    console.error('Summary generation error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// ==================== Crawler Settings API ====================
app.get('/api/settings/crawler', async (req, res) => {
  try {
    const data = await redisClient.get('fastinfo:crawler_settings')
    const settings = data ? JSON.parse(data) : {}
    res.json({ 
      success: true, 
      data: {
        // 数据源限制
        limits: {
          hackernews: settings.limits?.hackernews ?? 30,
          github: settings.limits?.github ?? 20,
          devto: settings.limits?.devto ?? 20,
          producthunt: settings.limits?.producthunt ?? 15,
          arxiv: settings.limits?.arxiv ?? 10,
          v2ex: settings.limits?.v2ex ?? 15,
          juejin: settings.limits?.juejin ?? 15,
          aibase: settings.limits?.aibase ?? 15,
        },
        // 调度设置
        schedule: settings.schedule || '0 * * * *',
        // 数据源开关
        sources: {
          hackernews: settings.sources?.hackernews ?? true,
          github: settings.sources?.github ?? true,
          devto: settings.sources?.devto ?? true,
          producthunt: settings.sources?.producthunt ?? true,
          arxiv: settings.sources?.arxiv ?? true,
          v2ex: settings.sources?.v2ex ?? true,
          juejin: settings.sources?.juejin ?? true,
          aibase: settings.sources?.aibase ?? true,
        },
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

app.put('/api/settings/crawler', async (req, res) => {
  try {
    const { limits, schedule, sources } = req.body
    const existing = await redisClient.get('fastinfo:crawler_settings')
    const current = existing ? JSON.parse(existing) : {}
    
    const updated = {
      ...current,
      limits: limits || current.limits,
      schedule: schedule || current.schedule,
      sources: sources || current.sources,
    }
    
    await redisClient.set('fastinfo:crawler_settings', JSON.stringify(updated))
    res.json({ success: true, message: '爬虫设置已保存' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ==================== Crawler Control API ====================
app.post('/api/crawler/run', async (req, res) => {
  try {
    // 异步执行爬虫，不阻塞响应
    crawlerService.run()
    res.json({ success: true, message: '爬虫已开始运行' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ==================== Chat Suggestions API ====================
app.get('/api/chat/suggestions', (req, res) => {
  res.json({
    suggestions: [
      '有什么 AI 相关的新闻？',
      '今天有什么热门文章？',
      '推荐一些开源项目',
      '最近有什么技术趋势？',
      '数据库里有多少文章？',
    ]
  })
})

// ==================== Articles API ====================

app.get('/api/articles/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query
    const articles = await articleService.search(q, parseInt(limit))
    res.json(articles)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/articles/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query
    const articles = await articleService.getTrending(parseInt(limit))
    res.json(articles)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 新增：按分类获取文章（支持分页、数据源筛选、时间筛选）
app.get('/api/articles', async (req, res) => {
  try {
    const { 
      category, 
      sort = 'latest', 
      limit = 30, 
      offset = 0,
      source,      // 数据源筛选
      since        // 时间筛选: today, week, month
    } = req.query
    
    let query = `
      SELECT id, title, summary, url, source, category, published_at, hot_score, image_url
      FROM articles
    `
    let countQuery = `SELECT COUNT(*) as total FROM articles`
    const params = []
    const conditions = []
    
    // 分类筛选
    if (category && category !== 'all') {
      conditions.push(`category = $${params.length + 1}`)
      params.push(category)
    }
    
    // 数据源筛选
    if (source && source !== 'all') {
      conditions.push(`source = $${params.length + 1}`)
      params.push(source)
    }
    
    // 时间范围筛选
    if (since) {
      let timeCondition = ''
      if (since === 'today') {
        timeCondition = `published_at >= CURRENT_DATE`
      } else if (since === 'week') {
        timeCondition = `published_at >= CURRENT_DATE - INTERVAL '7 days'`
      } else if (since === 'month') {
        timeCondition = `published_at >= CURRENT_DATE - INTERVAL '30 days'`
      }
      if (timeCondition) {
        conditions.push(timeCondition)
      }
    }
    
    // 构建 WHERE 子句
    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ')
      query += whereClause
      countQuery += whereClause
    }
    
    // 排序 (默认按时间，并打乱信息源)
    if (sort === 'hot') {
      query += ' ORDER BY hot_score DESC, published_at DESC'
      query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    } else {
      // 按时间排序，简化查询避免 SQLite CTE 兼容性问题
      query += ' ORDER BY published_at DESC'
      query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    }
    
    // 分页参数
    const paginationParams = [...params, parseInt(limit), parseInt(offset)]
    
    // 并行执行查询
    const [articlesResult, countResult] = await Promise.all([
      db.query(query, paginationParams),
      db.query(countQuery, params)
    ])
    
    const total = parseInt(countResult.rows[0]?.total || 0)
    const hasMore = parseInt(offset) + articlesResult.rows.length < total
    
    res.json({ 
      success: true, 
      data: { 
        articles: articlesResult.rows,
        total,
        hasMore,
        offset: parseInt(offset),
        limit: parseInt(limit)
      } 
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 获取所有数据源列表
app.get('/api/sources', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT source, COUNT(*) as count 
      FROM articles 
      GROUP BY source 
      ORDER BY count DESC
    `)
    res.json({ success: true, data: result.rows })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 新增：数据源统计
app.get('/api/stats/sources', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT source, COUNT(*) as count, AVG(hot_score) as avg_score
      FROM articles 
      GROUP BY source
      ORDER BY count DESC
    `)
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 新增：分类统计
app.get('/api/stats/categories', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT category, COUNT(*) as count, AVG(hot_score) as avg_score
      FROM articles 
      GROUP BY category
      ORDER BY count DESC
    `)
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 数据库存储概况
app.get('/api/stats/database', async (req, res) => {
  try {
    // 总文章数
    const totalResult = await db.query('SELECT COUNT(*) as total FROM articles')
    const total = parseInt(totalResult.rows[0].total)
    
    // 今日新增
    const todayResult = await db.query(`
      SELECT COUNT(*) as count FROM articles 
      WHERE created_at >= CURRENT_DATE
    `)
    const todayCount = parseInt(todayResult.rows[0].count)
    
    // 各源统计
    const sourcesResult = await db.query(`
      SELECT source, COUNT(*) as count 
      FROM articles 
      GROUP BY source 
      ORDER BY count DESC
    `)
    
    // 各分类统计
    const categoriesResult = await db.query(`
      SELECT category, COUNT(*) as count 
      FROM articles 
      GROUP BY category 
      ORDER BY count DESC
    `)
    
    // 数据库大小估算 (PostgreSQL)
    const sizeResult = await db.query(`
      SELECT pg_size_pretty(pg_total_relation_size('articles')) as size
    `)
    
    // 最早和最新文章时间
    const timeResult = await db.query(`
      SELECT 
        MIN(created_at) as oldest,
        MAX(created_at) as newest
      FROM articles
    `)
    
    res.json({
      success: true,
      data: {
        total,
        todayCount,
        sources: sourcesResult.rows.map(r => ({ name: r.source, count: parseInt(r.count) })),
        categories: categoriesResult.rows.map(r => ({ name: r.category, count: parseInt(r.count) })),
        dbSize: sizeResult.rows[0]?.size || 'N/A',
        oldest: timeResult.rows[0]?.oldest,
        newest: timeResult.rows[0]?.newest,
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 新增：获取分类列表
app.get('/api/categories', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM articles 
      GROUP BY category
      ORDER BY count DESC
    `)
    res.json({ 
      success: true, 
      data: result.rows.map(r => ({
        key: r.category,
        name: getCategoryName(r.category),
        count: parseInt(r.count)
      }))
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 新增：获取文章详情
app.get('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.query(
      'SELECT * FROM articles WHERE id = $1',
      [id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: '文章不存在' })
    }
    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 分类名称映射
function getCategoryName(key) {
  const map = {
    tech: '科技资讯',
    dev: '开发者',
    opensource: '开源项目',
    academic: '学术论文',
    product: '产品动态',
    ai: 'AI 资讯',
    frontend: '前端开发',
  }
  return map[key] || key
}

// ==================== 数据清理 API ====================

// 获取存储设置
app.get('/api/settings/storage', async (req, res) => {
  try {
    const data = await cache.get('fastinfo:storage_settings')
    const settings = data ? JSON.parse(data) : {
      autoCleanup: false,
      retentionDays: 30,
      lastCleanup: null
    }
    res.json({ success: true, data: settings })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 保存存储设置
app.post('/api/settings/storage', async (req, res) => {
  try {
    const { autoCleanup, retentionDays } = req.body
    const settings = {
      autoCleanup: !!autoCleanup,
      retentionDays: parseInt(retentionDays) || 30,
      lastCleanup: null
    }
    await cache.set('fastinfo:storage_settings', JSON.stringify(settings))
    res.json({ success: true, data: settings })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 手动执行清理
app.post('/api/storage/cleanup', async (req, res) => {
  try {
    const data = await cache.get('fastinfo:storage_settings')
    const settings = data ? JSON.parse(data) : { retentionDays: 30 }
    const days = settings.retentionDays || 30

    const result = await db.query(`
      DELETE FROM articles 
      WHERE published_at < NOW() - INTERVAL '${days} days'
      RETURNING id
    `)
    
    const deletedCount = result.rows?.length || result.rowCount || 0
    
    // 更新最后清理时间
    settings.lastCleanup = new Date().toISOString()
    await cache.set('fastinfo:storage_settings', JSON.stringify(settings))

    res.json({ 
      success: true, 
      message: `已清理 ${deletedCount} 篇超过 ${days} 天的文章`,
      deletedCount 
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 获取存储统计
app.get('/api/storage/stats', async (req, res) => {
  try {
    const totalResult = await db.query('SELECT COUNT(*) as total FROM articles')
    const oldResult = await db.query(`
      SELECT COUNT(*) as old_count 
      FROM articles 
      WHERE published_at < NOW() - INTERVAL '30 days'
    `)
    
    res.json({ 
      success: true, 
      data: {
        totalArticles: parseInt(totalResult.rows[0]?.total || 0),
        oldArticles: parseInt(oldResult.rows[0]?.old_count || 0)
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 定时清理任务 (每天凌晨3点执行)
cron.schedule('0 3 * * *', async () => {
  try {
    const data = await cache.get('fastinfo:storage_settings')
    const settings = data ? JSON.parse(data) : { autoCleanup: false }
    
    if (settings.autoCleanup) {
      const days = settings.retentionDays || 30
      const result = await db.query(`
        DELETE FROM articles 
        WHERE published_at < NOW() - INTERVAL '${days} days'
      `)
      console.log(`🧹 Auto cleanup: deleted articles older than ${days} days`)
      
      settings.lastCleanup = new Date().toISOString()
      await cache.set('fastinfo:storage_settings', JSON.stringify(settings))
    }
  } catch (error) {
    console.error('Auto cleanup failed:', error)
  }
})

// 启动
app.listen(PORT, () => {
  console.log(`🚀 Fast Info v3.0 running on port ${PORT}`)
  crawlerService.start()
})

import cron from 'node-cron'
import axios from 'axios'
import Firecrawl from '@mendable/firecrawl-js'

export class CrawlerService {
  constructor(db, redisClient) {
    this.db = db
    this.redis = redisClient
    this.firecrawl = null
    this.cronTask = null
    this.currentSchedule = null
    this.scheduleWatcher = null
    // 运行统计
    this.runStats = { total: 0, newCount: 0, sources: {} }
  }

  async getFirecrawlClient() {
    if (this.firecrawl) return this.firecrawl
    
    // 优先从环境变量获取（Docker 环境）
    const apiUrl = process.env.FIRECRAWL_API_URL
    const apiKey = process.env.FIRECRAWL_API_KEY || 'fc-fastinfo'
    
    if (apiUrl) {
      this.firecrawl = new Firecrawl({ 
        apiKey,
        apiUrl,
      })
      return this.firecrawl
    }
    
    return null
  }

  // 从 Redis 获取爬虫配置
  async getCrawlerSettings() {
    const data = await this.redis?.get('fastinfo:crawler_settings')
    if (data) {
      return JSON.parse(data)
    }
    return {
      limits: {},
      sources: {},
      schedule: '0 * * * *',
    }
  }

  // 获取数据源限制数量
  async getLimit(source, defaultValue) {
    const settings = await this.getCrawlerSettings()
    const val = settings.limits?.[source] ?? process.env[`CRAWLER_LIMIT_${source.toUpperCase()}`] ?? defaultValue
    const limit = parseInt(val)
    return isNaN(limit) ? defaultValue : limit
  }

  // 检查数据源是否启用
  async isSourceEnabled(source) {
    const settings = await this.getCrawlerSettings()
    return settings.sources?.[source] ?? true
  }

  // 从数据库获取爬虫配置
  async getCrawlerSettings() {
    try {
      const rows = await this.db.query(
        `
        SELECT key, value
        FROM user_settings
        WHERE user_id IS NULL AND key IN ('crawler_schedule', 'crawler_sources', 'crawler_limits')
        ORDER BY updated_at DESC NULLS LAST
        `
      )

      const settings = {
        limits: {},
        sources: {},
        schedule: process.env.CRAWLER_SCHEDULE || '0 * * * *',
      }

      // 如果历史上存在重复 key，这里取最新的一条
      const latest = {}
      for (const row of rows.rows || []) {
        if (!latest[row.key]) latest[row.key] = row.value
      }

      if (latest.crawler_schedule) settings.schedule = latest.crawler_schedule
      if (latest.crawler_sources) {
        try {
          settings.sources = JSON.parse(latest.crawler_sources || '{}')
        } catch {
          settings.sources = {}
        }
      }
      if (latest.crawler_limits) {
        try {
          settings.limits = JSON.parse(latest.crawler_limits || '{}')
        } catch {
          settings.limits = {}
        }
      }

      return settings
    } catch (e) {
      console.error('Failed to load crawler settings from DB:', e)
      return {
        limits: {},
        sources: {},
        schedule: process.env.CRAWLER_SCHEDULE || '0 * * * *',
      }
    }
  }

  async applySchedule(schedule) {
    if (!schedule || typeof schedule !== 'string') return

    const normalized = schedule.trim()
    if (!normalized || normalized === this.currentSchedule) return

    if (!cron.validate(normalized)) {
      console.error(`❌ Invalid crawler cron schedule: ${normalized}`)
      return
    }

    if (this.cronTask) {
      try {
        this.cronTask.stop()
      } catch {
        // ignore
      }
      this.cronTask = null
    }

    this.currentSchedule = normalized
    console.log(`📅 Crawler scheduled (dynamic): ${this.currentSchedule}`)
    this.cronTask = cron.schedule(this.currentSchedule, () => this.run())
  }

  async refreshSchedule() {
    const settings = await this.getCrawlerSettings()
    await this.applySchedule(settings.schedule)
  }

  start() {
    this.refreshSchedule()

    // 每分钟检查一次 schedule 是否变化
    if (!this.scheduleWatcher) {
      this.scheduleWatcher = setInterval(() => {
        this.refreshSchedule()
      }, 60 * 1000)
    }

    this.run()
  }

  async run() {
    console.log('🕷️  Running multi-source crawler...')
    const startedAt = new Date()
    let logId = null
    
    // 重置统计
    this.runStats = { total: 0, newCount: 0, sources: {} }
    
    try {
      // 创建运行记录
      try {
        const logResult = await this.db.query(
          `INSERT INTO crawler_logs (started_at, status) VALUES ($1, 'running') RETURNING id`,
          [startedAt]
        )
        logId = logResult.rows[0]?.id
      } catch (e) {
        console.warn('⚠️ Could not create crawler log:', e.message)
      }
      
      // 获取配置，检查哪些数据源启用
      const tasks = []
      
      // 国际科技源
      if (await this.isSourceEnabled('hackernews')) tasks.push(this.crawlHackerNews())
      if (await this.isSourceEnabled('github')) tasks.push(this.crawlGitHubTrending())
      if (await this.isSourceEnabled('devto')) tasks.push(this.crawlDevTo())
      if (await this.isSourceEnabled('producthunt')) tasks.push(this.crawlProductHunt())
      if (await this.isSourceEnabled('lobsters')) tasks.push(this.crawlLobsters())
      
      // AI/学术源
      if (await this.isSourceEnabled('arxiv')) tasks.push(this.crawlArXiv())
      if (await this.isSourceEnabled('paperswithcode')) tasks.push(this.crawlPapersWithCode())
      if (await this.isSourceEnabled('huggingface-blog')) tasks.push(this.crawlSingleBlog('huggingface-blog', 'HuggingFace Blog', 'https://huggingface.co/blog/feed.xml'))
      if (await this.isSourceEnabled('mit-tech-ai')) tasks.push(this.crawlSingleBlog('mit-tech-ai', 'MIT Tech Review AI', 'https://www.technologyreview.com/topic/artificial-intelligence/feed'))
      if (await this.isSourceEnabled('distill-pub')) tasks.push(this.crawlSingleBlog('distill-pub', 'Distill.pub', 'https://distill.pub/rss.xml'))
      if (await this.isSourceEnabled('bair-blog')) tasks.push(this.crawlSingleBlog('bair-blog', 'BAIR Blog', 'https://bair.berkeley.edu/blog/feed.xml'))
      if (await this.isSourceEnabled('openai-research')) tasks.push(this.crawlSingleBlog('openai-research', 'OpenAI Research', 'https://openai.com/research/rss.xml'))
      if (await this.isSourceEnabled('huggingface-papers')) tasks.push(this.crawlHuggingFacePapers())
      
      // 中文科技源
      if (await this.isSourceEnabled('v2ex')) tasks.push(this.crawlV2EX())
      if (await this.isSourceEnabled('juejin')) tasks.push(this.crawlJuejin())
      if (await this.isSourceEnabled('sspai')) tasks.push(this.crawlSSPai())
      if (await this.isSourceEnabled('36kr')) tasks.push(this.crawl36Kr())
      if (await this.isSourceEnabled('aibase')) tasks.push(this.crawlAIBase())
      if (await this.isSourceEnabled('hellogithub')) tasks.push(this.crawlHelloGitHub())
      if (await this.isSourceEnabled('huxiu')) tasks.push(this.crawlHuxiu())
      
      // 中文热搜（单独控制）
      tasks.push(this.crawlTrendRadarSources())
      
      // AI 资讯（单独控制）
      if (await this.isSourceEnabled('openai-blog')) tasks.push(this.crawlSingleBlog('openai-blog', 'OpenAI Blog', 'https://openai.com/blog/rss.xml'))
      if (await this.isSourceEnabled('anthropic-blog')) tasks.push(this.crawlSingleBlog('anthropic-blog', 'Anthropic News', 'https://www.anthropic.com/news/rss.xml'))
      if (await this.isSourceEnabled('google-ai-blog')) tasks.push(this.crawlSingleBlog('google-ai-blog', 'Google AI Blog', 'https://blog.google/technology/ai/rss/'))
      if (await this.isSourceEnabled('deepmind-blog')) tasks.push(this.crawlSingleBlog('deepmind-blog', 'DeepMind Blog', 'https://deepmind.google/blog/rss.xml'))
      if (await this.isSourceEnabled('theverge-ai')) tasks.push(this.crawlSingleBlog('theverge-ai', 'The Verge AI', 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml'))
      if (await this.isSourceEnabled('techcrunch-ai')) tasks.push(this.crawlSingleBlog('techcrunch-ai', 'TechCrunch AI', 'https://techcrunch.com/category/artificial-intelligence/feed/'))
      if (await this.isSourceEnabled('jiqizhixin')) tasks.push(this.crawlSingleBlog('jiqizhixin', '机器之心', 'https://www.jiqizhixin.com/rss'))
      if (await this.isSourceEnabled('leiphone')) tasks.push(this.crawlSingleBlog('leiphone', '雷锋网 AI', 'https://www.leiphone.com/feed'))
      if (await this.isSourceEnabled('venturebeat-ai')) tasks.push(this.crawlSingleBlog('venturebeat-ai', 'VentureBeat AI', 'https://venturebeat.com/category/ai/feed/'))
      
      console.log(`📊 Running ${tasks.length} crawlers...`)
      await Promise.allSettled(tasks)
      
      const finishedAt = new Date()
      const durationMs = finishedAt - startedAt
      
      console.log(`✅ Multi-source crawler completed: ${this.runStats.newCount} new / ${this.runStats.total} total in ${durationMs}ms`)
      
      // 更新运行记录
      if (logId) {
        try {
          await this.db.query(
            `UPDATE crawler_logs SET 
              finished_at = $1, duration_ms = $2, total_count = $3, 
              new_count = $4, source_stats = $5, status = 'completed'
            WHERE id = $6`,
            [finishedAt, durationMs, this.runStats.total, this.runStats.newCount, JSON.stringify(this.runStats.sources), logId]
          )
        } catch (e) {
          console.warn('⚠️ Could not update crawler log:', e.message)
        }
      }
    } catch (error) {
      console.error('❌ Crawler failed:', error.message)
      // 记录失败
      if (logId) {
        try {
          await this.db.query(
            `UPDATE crawler_logs SET finished_at = NOW(), status = 'failed', error_message = $1 WHERE id = $2`,
            [error.message, logId]
          )
        } catch (e) {
          console.warn('⚠️ Could not update crawler log:', e.message)
        }
      }
    }
  }

  // HackerNews - 同时抓取热门和最新
  async crawlHackerNews() {
    try {
      // 同时获取热门和最新
      const [{ data: topIds }, { data: newIds }] = await Promise.all([
        axios.get('https://hacker-news.firebaseio.com/v0/topstories.json'),
        axios.get('https://hacker-news.firebaseio.com/v0/newstories.json')
      ])
      
      const limit = await this.getLimit('hackernews', 30)
      // 合并去重：优先最新，再补充热门
      const allIds = [...new Set([...newIds.slice(0, limit), ...topIds.slice(0, limit)])].slice(0, limit)
      
      for (const id of allIds) {
        const { data: story } = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
        
        if (story && story.title && story.url) {
          await this.saveArticle({
            title: story.title,
            url: story.url,
            source: 'Hacker News',
            category: this.categorizeContent(story.title),
            published_at: new Date(story.time * 1000),
            hot_score: story.score || 0
          })
        }
      }
    } catch (error) {
      console.error('HackerNews crawler failed:', error.message)
    }
  }

  // GitHub Trending - 动态日期获取最近创建的热门仓库
  async crawlGitHubTrending() {
    try {
      // 动态计算7天前的日期
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const { data: repos } = await axios.get(`https://api.github.com/search/repositories?q=created:>${sevenDaysAgo}&sort=stars&order=desc&per_page=20`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      })
      
      if (!repos.items || !Array.isArray(repos.items)) {
        console.log('GitHub API returned no items:', repos.message || 'unknown error')
        return
      }
      
      const limit = await this.getLimit('github', 20)
      for (const repo of repos.items.slice(0, limit)) {
        await this.saveArticle({
          title: `${repo.name}: ${repo.description || 'No description'}`,
          url: repo.html_url,
          source: 'GitHub Trending',
          category: 'opensource',
          published_at: new Date(repo.created_at),
          hot_score: repo.stargazers_count || 0,
          image_url: repo.owner?.avatar_url || null,
        })
      }
    } catch (error) {
      console.error('GitHub crawler failed:', error.message)
    }
  }

  // Dev.to - 获取最新文章
  async crawlDevTo() {
    console.log('📡 Crawling Dev.to...')
    try {
      // 使用 state=fresh 获取最新文章，而非 top=7 获取热门
      const { data: articles } = await axios.get('https://dev.to/api/articles?per_page=30&state=fresh')
      
      if (!Array.isArray(articles)) {
        console.error('Dev.to API returned non-array:', articles)
        return
      }

      console.log(`✅ Dev.to: Fetched ${articles.length} articles`)
      
      const limit = await this.getLimit('devto', 20)
      console.log(`📊 Dev.to: Limit is ${limit}`)
      
      for (const article of articles.slice(0, limit)) {
        await this.saveArticle({
          title: article.title,
          url: article.url,
          source: 'Dev.to',
          category: this.categorizeContent(article.title),
          published_at: new Date(article.published_at),
          hot_score: article.public_reactions_count || 0,
          image_url: article.cover_image || article.social_image || null,
        })
      }
    } catch (error) {
      console.error('Dev.to crawler failed:', error.message)
    }
  }

  // Product Hunt - Atom Feed
  async crawlProductHunt() {
    console.log('📡 Crawling Product Hunt...')
    try {
      const limit = await this.getLimit('producthunt', 20)
      const { data: xml } = await axios.get('https://www.producthunt.com/feed', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
      })
      
      // Atom 格式使用 <entry> 而非 <item>
      const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || []
      let count = 0
      
      for (const entry of entries.slice(0, limit)) {
        const title = entry.match(/<title>(.*?)<\/title>/)?.[1]
        const link = entry.match(/<link[^>]+href="([^"]+)"/)?.[1]
        const published = entry.match(/<published>(.*?)<\/published>/)?.[1]
        
        if (title && link) {
          await this.saveArticle({
            title,
            url: link,
            source: 'Product Hunt',
            category: 'product',
            published_at: published ? new Date(published) : new Date(),
            hot_score: 100,
          })
          count++
        }
      }
      console.log(`✅ Product Hunt: saved ${count} products`)
    } catch (error) {
      console.error('Product Hunt crawler failed:', error.message)
    }
  }

  // arXiv
  async crawlArXiv() {
    console.log('📡 Crawling arXiv...')
    try {
      const { data: xml } = await axios.get('http://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL&start=0&max_results=20&sortBy=lastUpdatedDate&sortOrder=descending')
      
      // 简单XML解析
      const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || []
      console.log(`✅ arXiv: Found ${entries.length} entries`)
      
      const limit = await this.getLimit('arxiv', 10)
      for (const entry of entries.slice(0, limit)) {
        const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/)
        const linkMatch = entry.match(/<id>(.*?)<\/id>/)
        const publishedMatch = entry.match(/<published>(.*?)<\/published>/)
        const updatedMatch = entry.match(/<updated>(.*?)<\/updated>/)
        
        if (titleMatch && linkMatch) {
          // 使用真实发布时间
          const publishedAt = publishedMatch ? new Date(publishedMatch[1]) : 
                              updatedMatch ? new Date(updatedMatch[1]) : new Date()
          
          await this.saveArticle({
            title: titleMatch[1].trim().replace(/\n/g, ' ').replace(/\s+/g, ' '),
            url: linkMatch[1].trim(),
            source: 'arXiv',
            category: 'academic',
            published_at: publishedAt,
            hot_score: 100  // 学术论文统一分数
          })
        }
      }
    } catch (error) {
      console.error('arXiv crawler failed:', error.message)
    }
  }

  // V2EX
  async crawlV2EX() {
    console.log('📡 Crawling V2EX...')
    try {
      const { data: topics } = await axios.get('https://www.v2ex.com/api/topics/hot.json')
      
      if (!Array.isArray(topics)) {
        console.error('V2EX API returned non-array:', topics)
        return
      }

      console.log(`✅ V2EX: Fetched ${topics.length} topics`)
      
      const limit = await this.getLimit('v2ex', 15)
      for (const topic of topics.slice(0, limit)) {
        let imageUrl = topic.node?.avatar_large || topic.member?.avatar_large || null
        if (imageUrl && imageUrl.startsWith('/')) {
          imageUrl = `https://www.v2ex.com${imageUrl}`
        }

        await this.saveArticle({
          title: topic.title,
          url: `https://www.v2ex.com/t/${topic.id}`,
          source: 'V2EX',
          category: this.categorizeContent(topic.title),
          published_at: new Date(topic.created * 1000),
          hot_score: topic.replies || 0,
          image_url: imageUrl,
        })
      }
    } catch (error) {
      console.error('V2EX crawler failed:', error.message)
    }
  }

  // 掘金 - 使用 Firecrawl 爬取
  async crawlJuejin() {
    try {
      const client = await this.getFirecrawlClient()
      if (!client) {
        console.log('Firecrawl not configured, skipping 掘金')
        return
      }

      const result = await client.scrapeUrl('https://juejin.cn', {
        formats: ['extract'],
        extract: {
          schema: {
            type: 'object',
            properties: {
              articles: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    url: { type: 'string' },
                    views: { type: 'number' },
                    likes: { type: 'number' },
                    cover: { type: 'string' },
                  },
                },
              },
            },
          },
          prompt: '提取掘金首页的热门文章列表，包括标题、链接、阅读数、点赞数和封面图片URL。',
        },
      })

      const articles = result.extract?.articles || []
      console.log(`掘金: found ${articles.length} articles`)

      const limit = await this.getLimit('juejin', 15)
      for (const article of articles.slice(0, limit)) {
        if (article.title && article.url) {
          await this.saveArticle({
            title: article.title,
            url: article.url.startsWith('http') ? article.url : `https://juejin.cn${article.url}`,
            source: '掘金',
            category: this.categorizeContent(article.title),
            published_at: new Date(),
            hot_score: (article.views || 0) + (article.likes || 0) * 10,
            image_url: article.cover || null,
          })
        }
      }
    } catch (error) {
      console.error('掘金 crawler failed:', error.message)
    }
  }

  // AIBase - 使用 Firecrawl 爬取
  async crawlAIBase() {
    try {
      const client = await this.getFirecrawlClient()
      if (!client) {
        console.log('Firecrawl not configured, skipping AIBase')
        return
      }

      const result = await client.scrapeUrl('https://www.aibase.com', {
        formats: ['extract'],
        extract: {
          schema: {
            type: 'object',
            properties: {
              articles: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    url: { type: 'string' },
                    summary: { type: 'string' },
                    cover: { type: 'string' },
                  },
                },
              },
            },
          },
          prompt: '提取 AIBase 首页的 AI 新闻文章列表，包括标题、链接、摘要和封面图片URL。',
        },
      })

      const articles = result.extract?.articles || []
      console.log(`AIBase: found ${articles.length} articles`)

      const limit = await this.getLimit('aibase', 15)
      for (const article of articles.slice(0, limit)) {
        if (article.title && article.url) {
          await this.saveArticle({
            title: article.title,
            url: article.url.startsWith('http') ? article.url : `https://www.aibase.com${article.url}`,
            summary: article.summary || '',
            source: 'AIBase',
            category: 'tech',
            published_at: new Date(),
            hot_score: 300,
            image_url: article.cover || null,
          })
        }
      }
    } catch (error) {
      console.error('AIBase crawler failed:', error.message)
    }
  }

  // 保存文章到数据库
  async saveArticle(article) {
    const imgStatus = article.image_url ? `YES (${article.image_url.substring(0, 30)}...)` : 'NO'
    console.log(`💾 [${article.source}] Saving: ${article.title.substring(0, 30)}... | Image: ${imgStatus}`)
    try {
      // 检查是否已存在
      const existCheck = await this.db.query('SELECT id FROM articles WHERE url = $1', [article.url])
      const isNew = existCheck.rows.length === 0
      
      await this.db.query(`
        INSERT INTO articles (title, url, source, category, published_at, hot_score, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (url) DO UPDATE SET
          title = EXCLUDED.title,
          hot_score = GREATEST(articles.hot_score, EXCLUDED.hot_score),
          published_at = LEAST(articles.published_at, EXCLUDED.published_at),
          image_url = COALESCE(EXCLUDED.image_url, articles.image_url)
        RETURNING id
      `, [
        article.title,
        article.url,
        article.source,
        article.category,
        article.published_at,
        article.hot_score,
        article.image_url || null
      ])
      
      // 更新统计
      this.runStats.total++
      if (isNew) this.runStats.newCount++
      
      const src = article.source
      if (!this.runStats.sources[src]) {
        this.runStats.sources[src] = { total: 0, new: 0 }
      }
      this.runStats.sources[src].total++
      if (isNew) this.runStats.sources[src].new++
      
    } catch (error) {
      console.error(`❌ Failed to save article from ${article.source}:`, error.message)
    }
  }

  // 中文热搜 - 支持单独控制每个源
  async crawlTrendRadarSources() {
    console.log('🇨🇳 Crawling Chinese hot search sources...')
    
    // 11 个中文热搜源配置（key 对应前端设置）
    const sources = [
      { key: 'weibo-hot', id: 'weibo', name: '微博', category: 'tech' },
      { key: 'zhihu-hot', id: 'zhihu', name: '知乎', category: 'tech' },
      { key: 'douyin-hot', id: 'douyin', name: '抖音', category: 'tech' },
      { key: 'bilibili-hot', id: 'bilibili-hot-search', name: 'Bilibili热搜', category: 'tech' },
      { key: 'baidu-hot', id: 'baidu', name: '百度热搜', category: 'tech' },
      { key: 'toutiao-hot', id: 'toutiao', name: '今日头条', category: 'tech' },
      { key: 'pengpai-hot', id: 'thepaper', name: '澎湃新闻', category: 'tech' },
      { key: 'cailian-hot', id: 'cls-hot', name: '财联社', category: 'tech' },
      { key: 'wallstreet-hot', id: 'wallstreetcn-hot', name: '华尔街见闻', category: 'tech' },
      { key: 'ifeng-hot', id: 'ifeng', name: '凤凰网', category: 'tech' },
      { key: 'tieba-hot', id: 'tieba', name: '贴吧', category: 'tech' },
    ]
    
    // 完整的请求头（参考 TrendRadar 原始实现）
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
    }
    
    for (const source of sources) {
      // 检查该源是否启用
      const enabled = await this.isSourceEnabled(source.key)
      if (!enabled) continue
      
      const limit = await this.getLimit(source.key, 10)
      
      // 重试机制
      let retries = 0
      const maxRetries = 2
      
      while (retries <= maxRetries) {
        try {
          const { data } = await axios.get(`https://newsnow.busiyi.world/api/s?id=${source.id}&latest`, {
            headers,
            timeout: 15000
          })
          
          if (data.status !== 'success' && data.status !== 'cache') {
            console.log(`⚠️ ${source.name}: API 状态异常 - ${data.status}`)
            break
          }
          
          const items = data.items || []
          console.log(`✅ ${source.name}: 获取 ${items.length} 条热搜`)
          
          for (const item of items.slice(0, limit)) {
            if (item.title && item.url) {
              await this.saveArticle({
                title: item.title,
                url: item.url,
                source: source.name,
                category: this.categorizeContent(item.title),
                published_at: new Date(),
                hot_score: items.indexOf(item) < 10 ? 500 - items.indexOf(item) * 10 : 100,
              })
            }
          }
          
          break // 成功后跳出重试循环
          
        } catch (error) {
          retries++
          if (retries <= maxRetries) {
            const waitTime = 3000 + Math.random() * 2000 // 3-5秒随机等待
            console.log(`⚠️ ${source.name} 请求失败，${(waitTime/1000).toFixed(1)}秒后重试 (${retries}/${maxRetries})`)
            await new Promise(r => setTimeout(r, waitTime))
          } else {
            console.error(`❌ ${source.name} 爬取失败:`, error.message)
          }
        }
      }
      
      // 请求间隔 1-2秒（参考 TrendRadar 的 1000ms 间隔 + 随机抖动）
      const interval = 1000 + Math.random() * 1000
      await new Promise(r => setTimeout(r, interval))
    }
  }

  // Lobsters - 技术链接分享社区
  async crawlLobsters() {
    console.log('📡 Crawling Lobsters...')
    try {
      const limit = await this.getLimit('lobsters', 20)
      const { data: stories } = await axios.get('https://lobste.rs/hottest.json')
      
      for (const story of stories.slice(0, limit)) {
        await this.saveArticle({
          title: story.title,
          url: story.url || story.short_id_url,
          source: 'Lobsters',
          category: this.categorizeContent(story.title),
          published_at: new Date(story.created_at),
          hot_score: story.score || 0,
        })
      }
      console.log(`✅ Lobsters: saved ${Math.min(stories.length, limit)} stories`)
    } catch (error) {
      console.error('Lobsters crawler failed:', error.message)
    }
  }

  // 少数派 - RSS
  async crawlSSPai() {
    console.log('📡 Crawling 少数派...')
    try {
      const limit = await this.getLimit('sspai', 15)
      const { data: xml } = await axios.get('https://sspai.com/feed')
      
      // 解析 RSS XML
      const items = xml.match(/<item>[\s\S]*?<\/item>/g) || []
      let count = 0
      
      for (const item of items.slice(0, limit)) {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 
                      item.match(/<title>(.*?)<\/title>/)?.[1]
        const link = item.match(/<link>(.*?)<\/link>/)?.[1]
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]
        
        if (title && link) {
          await this.saveArticle({
            title,
            url: link,
            source: '少数派',
            category: 'product',
            published_at: pubDate ? new Date(pubDate) : new Date(),
            hot_score: 0,
          })
          count++
        }
      }
      console.log(`✅ 少数派: saved ${count} articles`)
    } catch (error) {
      console.error('少数派 crawler failed:', error.message)
    }
  }

  // 36氪 - RSS (带图片)
  async crawl36Kr() {
    console.log('📡 Crawling 36氪...')
    try {
      const limit = await this.getLimit('36kr', 15)
      const { data: xml } = await axios.get('https://36kr.com/feed')
      
      const items = xml.match(/<item>[\s\S]*?<\/item>/g) || []
      let count = 0
      
      for (const item of items.slice(0, limit)) {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
                      item.match(/<title>(.*?)<\/title>/)?.[1]
        const link = item.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>/)?.[1] ||
                      item.match(/<link>(.*?)<\/link>/)?.[1]
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]
        
        // 从 description 中提取第一张图片
        const desc = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] || ''
        const imageUrl = desc.match(/<img[^>]+src=["']([^"']+)["']/)?.[1] || null
        
        if (title && link) {
          await this.saveArticle({
            title,
            url: link,
            source: '36氪',
            category: 'tech',
            published_at: pubDate ? new Date(pubDate) : new Date(),
            hot_score: 0,
            image_url: imageUrl,
          })
          count++
        }
      }
      console.log(`✅ 36氪: saved ${count} articles`)
    } catch (error) {
      console.error('36氪 crawler failed:', error.message)
    }
  }

  // HelloGitHub - 开源项目推荐 (带图片)
  async crawlHelloGitHub() {
    console.log('📡 Crawling HelloGitHub...')
    try {
      const limit = await this.getLimit('hellogithub', 20)
      // HelloGitHub API - 获取最新一期的项目
      const { data } = await axios.get('https://api.hellogithub.com/v1/periodical/volume/?page=1')
      
      if (data?.data?.length) {
        let count = 0
        // 遍历所有分类的项目
        for (const category of data.data) {
          if (category.items?.length) {
            for (const item of category.items.slice(0, 3)) { // 每个分类取前3个
              if (count >= limit) break
              await this.saveArticle({
                title: `${item.name}: ${item.description?.slice(0, 60) || item.description_en?.slice(0, 60)}`,
                url: item.github_url || `https://hellogithub.com/repository/${item.rid}`,
                source: 'HelloGitHub',
                category: 'opensource',
                published_at: item.publish_at ? new Date(item.publish_at) : new Date(),
                hot_score: item.stars || item.vote_total || 0,
                image_url: item.image_url || null,
              })
              count++
            }
          }
          if (count >= limit) break
        }
        console.log(`✅ HelloGitHub: saved ${count} projects`)
      }
    } catch (error) {
      console.error('HelloGitHub crawler failed:', error.message)
    }
  }

  // Papers with Code - AI 论文
  async crawlPapersWithCode() {
    console.log('📡 Crawling Papers with Code...')
    try {
      const limit = await this.getLimit('paperswithcode', 15)
      const { data } = await axios.get('https://paperswithcode.com/api/v1/papers/?ordering=-paper_date&page=1')
      
      if (data?.results?.length) {
        let count = 0
        for (const paper of data.results.slice(0, limit)) {
          await this.saveArticle({
            title: paper.title,
            url: paper.url_abs || `https://paperswithcode.com/paper/${paper.id}`,
            source: 'Papers with Code',
            category: 'academic',
            published_at: paper.paper_date ? new Date(paper.paper_date) : new Date(),
            hot_score: paper.stars || 0,
          })
          count++
        }
        console.log(`✅ Papers with Code: saved ${count} papers`)
      }
    } catch (error) {
      console.error('Papers with Code crawler failed:', error.message)
    }
  }

  // 虎嗅 - 商业科技
  async crawlHuxiu() {
    console.log('📡 Crawling 虎嗅...')
    try {
      const limit = await this.getLimit('huxiu', 15)
      const { data } = await axios.get('https://api-article.huxiu.com/web/article/articleList', {
        params: { page: 1, pageSize: limit },
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
      })
      
      if (data?.data?.dataList?.length) {
        let count = 0
        for (const article of data.data.dataList) {
          await this.saveArticle({
            title: article.title,
            url: `https://www.huxiu.com/article/${article.aid}.html`,
            source: '虎嗅',
            category: 'tech',
            published_at: article.dateline ? new Date(article.dateline * 1000) : new Date(),
            hot_score: article.count_view || 0,
            image_url: article.pic_path,
          })
          count++
        }
        console.log(`✅ 虎嗅: saved ${count} articles`)
      }
    } catch (error) {
      console.error('虎嗅 crawler failed:', error.message)
    }
  }

  // HuggingFace Daily Papers
  async crawlHuggingFacePapers() {
    console.log('📡 Crawling HuggingFace Papers...')
    try {
      const limit = await this.getLimit('huggingface-papers', 10)
      const { data } = await axios.get('https://huggingface.co/api/daily_papers', {
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      
      let count = 0
      const papers = Array.isArray(data) ? data : data?.papers || []
      
      for (const paper of papers.slice(0, limit)) {
        const title = paper.title || paper.paper?.title
        const paperId = paper.paper?.id || paper.id
        
        if (title && paperId) {
          await this.saveArticle({
            title,
            url: `https://huggingface.co/papers/${paperId}`,
            source: 'HuggingFace Papers',
            category: 'academic',
            published_at: paper.publishedAt ? new Date(paper.publishedAt) : new Date(),
            hot_score: paper.paper?.upvotes || 0,
          })
          count++
        }
      }
      
      if (count > 0) {
        console.log(`✅ HuggingFace Papers: saved ${count} papers`)
      }
    } catch (error) {
      console.error('HuggingFace Papers failed:', error.message)
    }
  }

  // 单个博客/RSS 源爬取（支持独立开关）
  async crawlSingleBlog(sourceKey, sourceName, url) {
    try {
      const limit = await this.getLimit(sourceKey, 5)
      const { data: xml } = await axios.get(url, {
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
      })
      
      // 支持 RSS 和 Atom 格式
      const items = xml.match(/<item>[\s\S]*?<\/item>/g) || xml.match(/<entry>[\s\S]*?<\/entry>/g) || []
      let count = 0
      
      for (const item of items.slice(0, limit)) {
        const title = item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ||
                      item.match(/<title>([\s\S]*?)<\/title>/)?.[1]
        const link = item.match(/<link>(.*?)<\/link>/)?.[1] ||
                     item.match(/<link[^>]+href="([^"]+)"/)?.[1]
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ||
                        item.match(/<published>(.*?)<\/published>/)?.[1]
        
        if (title && link) {
          const cleanTitle = title.replace(/<[^>]+>/g, '').trim()
          
          await this.saveArticle({
            title: cleanTitle,
            url: link,
            source: sourceName,
            category: 'ai',
            published_at: pubDate ? new Date(pubDate) : new Date(),
            hot_score: 80,
          })
          count++
        }
      }
      
      if (count > 0) {
        console.log(`✅ ${sourceName}: saved ${count} articles`)
      }
    } catch (error) {
      console.error(`${sourceName} failed:`, error.message)
    }
  }

  // 内容分类
  categorizeContent(title) {
    const titleLower = title.toLowerCase()
    
    if (titleLower.includes('ai') || titleLower.includes('machine learning') || titleLower.includes('深度学习')) {
      return 'ai'
    } else if (titleLower.includes('react') || titleLower.includes('vue') || titleLower.includes('frontend')) {
      return 'frontend'
    } else if (titleLower.includes('python') || titleLower.includes('javascript') || titleLower.includes('programming')) {
      return 'dev'
    } else if (titleLower.includes('github') || titleLower.includes('open source') || titleLower.includes('开源')) {
      return 'opensource'
    } else if (titleLower.includes('paper') || titleLower.includes('research') || titleLower.includes('study')) {
      return 'academic'
    } else if (titleLower.includes('product') || titleLower.includes('app') || titleLower.includes('tool')) {
      return 'product'
    }
    
    return 'tech'
  }
}

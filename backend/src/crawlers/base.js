const axios = require('axios')
const supabase = require('../config/supabase-admin') // 使用管理员客户端
const { calculateQualityScore, calculateHotScore } = require('../utils/scorer')
const { categorizeArticle } = require('../utils/categorizer')

/**
 * 基础爬虫类
 * 所有具体爬虫都应继承此类
 */
class BaseCrawler {
  constructor(sourceName, options = {}) {
    this.sourceName = sourceName
    this.timeout = options.timeout || 10000
    this.retries = options.retries || 3
    this.logger = options.logger || console
  }

  /**
   * 创建 HTTP 客户端
   */
  createHttpClient() {
    return axios.create({
      timeout: this.timeout,
      headers: {
        'User-Agent': 'Fast-Info-Crawler/1.0 (Educational Project)',
        'Accept': 'application/json, text/html',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      }
    })
  }

  /**
   * 获取数据（需要子类实现）
   * @returns {Promise<Array>} 原始文章数据数组
   */
  async fetch() {
    throw new Error('fetch() method must be implemented by subclass')
  }

  /**
   * 转换数据格式（需要子类实现）
   * 将爬取的原始数据转换为标准文章格式
   * @param {Object} rawData - 原始数据
   * @returns {Object} 标准文章对象
   */
  transform(rawData) {
    throw new Error('transform() method must be implemented by subclass')
  }

  /**
   * 清洗和标准化文章数据
   * @param {Object} article - 文章对象
   * @returns {Object} 清洗后的文章对象
   */
  cleanArticle(article) {
    return {
      title: this.cleanText(article.title),
      summary: article.summary ? this.cleanText(article.summary) : null,
      url: this.cleanUrl(article.url),
      cover: article.cover || null,
      source: this.sourceName,
      category: article.category || categorizeArticle({ ...article, source: this.sourceName }),
      tags: article.tags || [],
      author: article.author || null,
      published_at: article.published_at ? new Date(article.published_at).toISOString() : null,
      likes: article.likes || 0,
      comments: article.comments || 0,
      views: article.views || 0,
      metadata: article.metadata || {}
    }
  }

  /**
   * 清理文本内容
   * @param {string} text - 原始文本
   * @returns {string} 清理后的文本
   */
  cleanText(text) {
    if (!text) return ''
    return text
      .trim()
      .replace(/\s+/g, ' ') // 合并多个空格
      .replace(/\n+/g, '\n') // 合并多个换行
      .substring(0, 2000) // 限制长度
  }

  /**
   * 清理和验证 URL
   * @param {string} url - 原始 URL
   * @returns {string} 清理后的 URL
   */
  cleanUrl(url) {
    if (!url) return ''

    try {
      const urlObj = new URL(url)
      // 移除常见的追踪参数
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
      trackingParams.forEach(param => urlObj.searchParams.delete(param))
      return urlObj.toString()
    } catch (error) {
      this.logger.warn(`Invalid URL: ${url}`)
      return url
    }
  }

  /**
   * 计算文章分数
   * @param {Object} article - 文章对象
   * @returns {Object} 包含分数的文章对象
   */
  scoreArticle(article) {
    return {
      ...article,
      quality_score: calculateQualityScore(article),
      hot_score: calculateHotScore(article)
    }
  }

  /**
   * 保存文章到数据库
   * @param {Array} articles - 文章数组
   * @returns {Promise<Object>} 保存结果
   */
  async saveArticles(articles) {
    if (!articles || articles.length === 0) {
      return { inserted: 0, skipped: 0, errors: 0 }
    }

    let inserted = 0
    let skipped = 0
    let errors = 0

    for (const article of articles) {
      try {
        // 检查 URL 是否已存在
        const { data: existing } = await supabase
          .from('articles')
          .select('id')
          .eq('url', article.url)
          .single()

        if (existing) {
          skipped++
          continue
        }

        // 插入新文章
        const { error } = await supabase
          .from('articles')
          .insert([article])

        if (error) {
          this.logger.error(`Failed to insert article: ${article.url}`, error)
          errors++
        } else {
          inserted++
        }

      } catch (error) {
        this.logger.error(`Error processing article: ${article.url}`, error)
        errors++
      }
    }

    return { inserted, skipped, errors }
  }

  /**
   * 执行爬取流程
   * @returns {Promise<Object>} 爬取结果统计
   */
  async crawl() {
    const startTime = Date.now()
    this.logger.info(`[${this.sourceName}] Starting crawl...`)

    try {
      // 1. 获取原始数据
      const rawData = await this.fetch()
      this.logger.info(`[${this.sourceName}] Fetched ${rawData.length} items`)

      if (!rawData || rawData.length === 0) {
        return { success: true, inserted: 0, skipped: 0, errors: 0, duration: Date.now() - startTime }
      }

      // 2. 转换数据格式
      const transformedArticles = rawData.map(item => this.transform(item))

      // 3. 清洗数据
      const cleanedArticles = transformedArticles.map(article => this.cleanArticle(article))

      // 4. 计算分数
      const scoredArticles = cleanedArticles.map(article => this.scoreArticle(article))

      // 5. 保存到数据库
      const result = await this.saveArticles(scoredArticles)

      const duration = Date.now() - startTime
      this.logger.info(`[${this.sourceName}] Crawl completed in ${duration}ms`, result)

      return { success: true, ...result, duration }

    } catch (error) {
      const duration = Date.now() - startTime
      this.logger.error(`[${this.sourceName}] Crawl failed:`, error)
      return { success: false, error: error.message, duration }
    }
  }

  /**
   * 带重试的爬取
   * @returns {Promise<Object>} 爬取结果
   */
  async crawlWithRetry() {
    let lastError = null

    for (let i = 0; i < this.retries; i++) {
      try {
        const result = await this.crawl()
        if (result.success) {
          return result
        }
        lastError = result.error
      } catch (error) {
        lastError = error
        this.logger.warn(`[${this.sourceName}] Retry ${i + 1}/${this.retries} after error:`, error.message)

        // 等待后重试（指数退避）
        if (i < this.retries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
        }
      }
    }

    return { success: false, error: lastError?.message || 'Unknown error', retries: this.retries }
  }
}

module.exports = BaseCrawler

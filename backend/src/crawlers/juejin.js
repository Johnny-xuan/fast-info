const BaseCrawler = require('./base')

/**
 * 掘金爬虫
 * 使用非官方 API 获取热榜文章
 * 端点：https://api.juejin.cn/content_api/v1/content/article_rank
 * 参考：https://github.com/chenzijia12300/juejin-api
 */
class JuejinCrawler extends BaseCrawler {
  constructor() {
    super('掘金', {
      timeout: 15000,
      retries: 3
    })

    this.apiBase = 'https://api.juejin.cn'
  }

  /**
   * 获取热榜文章列表
   */
  async fetch() {
    try {
      const client = this.createHttpClient()

      // 掘金热榜 API
      const response = await client.get(
        `${this.apiBase}/content_api/v1/content/article_rank`,
        {
          params: {
            category_id: '1', // 综合分类
            type: 'hot'
          }
        }
      )

      if (!response.data || response.data.err_no !== 0) {
        this.logger.warn('[掘金] API returned error:', response.data?.err_msg)
        return []
      }

      return (response.data.data || []).slice(0, 20) // 取前 20 条

    } catch (error) {
      if (error.response?.status === 429) {
        this.logger.error('[掘金] Rate limit exceeded')
      }
      throw error
    }
  }

  /**
   * 转换为标准文章格式
   */
  transform(item) {
    const content = item.content || {}
    const contentCounter = item.content_counter || {}
    const author = item.author || {}

    return {
      title: content.title,
      summary: content.brief_content || null,
      url: `https://juejin.cn/post/${content.content_id}`,
      cover: content.cover_image || null,
      source: '掘金',
      category: this.categorizeJuejinTag(content.tags),
      tags: (content.tags || []).map(tag => tag.tag_name),
      author: author.user_name || null,
      published_at: content.ctime ? new Date(content.ctime * 1000).toISOString() : null,
      likes: contentCounter.digg_count || 0,
      comments: contentCounter.comment_count || 0,
      views: contentCounter.view_count || 0,
      metadata: {
        article_id: content.content_id,
        collect_count: contentCounter.collect_count || 0,
        hot_rank: contentCounter.hot_rank || 0,
        author_level: author.level || 0
      }
    }
  }

  /**
   * 根据掘金标签分类到我们的分类体系
   */
  categorizeJuejinTag(tags) {
    if (!tags || tags.length === 0) return 'dev'

    const tagNames = tags.map(t => t.tag_name.toLowerCase())

    // 开源相关
    if (tagNames.some(t => ['开源', 'github', 'gitlab', 'open source'].includes(t))) {
      return 'opensource'
    }

    // 学术/AI 相关
    if (tagNames.some(t => ['机器学习', '深度学习', '人工智能', 'ai', 'llm', 'gpt'].includes(t))) {
      return 'academic'
    }

    // 产品相关
    if (tagNames.some(t => ['产品', '设计', 'ui', 'ux', '用户体验', '交互'].includes(t))) {
      return 'product'
    }

    // 开发者相关
    if (tagNames.some(t => [
      'javascript', 'python', 'java', 'golang', 'rust', 'typescript',
      'vue', 'react', 'angular', 'nodejs', 'spring', 'django',
      '前端', '后端', '全栈', '架构', '算法', '数据库'
    ].includes(t))) {
      return 'dev'
    }

    // 默认归类为科技
    return 'tech'
  }
}

module.exports = JuejinCrawler

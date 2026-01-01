const BaseCrawler = require('./base')

/**
 * Dev.to 爬虫
 * API 文档: https://developers.forem.com/api/v1
 */
class DevToCrawler extends BaseCrawler {
  constructor(options = {}) {
    super('Dev.to', options)
    this.apiBase = 'https://dev.to/api'
    this.limit = options.limit || 30
  }

  /**
   * 获取文章列表
   */
  async fetch() {
    try {
      const client = this.createHttpClient()

      // Dev.to API 参数
      const params = {
        page: 1,
        per_page: this.limit,
        top: 7 // 获取过去7天的热门文章
      }

      this.logger.info(`[Dev.to] Fetching articles with params:`, params)

      const response = await client.get(`${this.apiBase}/articles`, { params })

      this.logger.info(`[Dev.to] Fetched ${response.data.length} articles`)
      return response.data

    } catch (error) {
      this.logger.error('[Dev.to] Fetch failed:', error.message)
      throw error
    }
  }

  /**
   * 转换数据格式
   */
  transform(article) {
    return {
      title: article.title,
      summary: article.description || null,
      url: article.url,
      cover: article.cover_image || article.social_image || null,
      author: article.user?.name || article.user?.username || null,
      published_at: new Date(article.published_at),
      likes: article.public_reactions_count || 0,
      comments: article.comments_count || 0,
      views: article.page_views_count || 0,
      metadata: {
        devto_id: article.id,
        tags: article.tag_list || [],
        reading_time_minutes: article.reading_time_minutes || 0,
        user_id: article.user?.user_id
      },
      tags: article.tag_list || []
    }
  }
}

module.exports = DevToCrawler

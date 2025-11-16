const BaseCrawler = require('./base')

/**
 * Hacker News 爬虫
 * API 文档: https://github.com/HackerNews/API
 */
class HackerNewsCrawler extends BaseCrawler {
  constructor(options = {}) {
    super('Hacker News', options)
    this.apiBase = 'https://hacker-news.firebaseio.com/v0'
    this.limit = options.limit || 30 // 默认抓取前30条
  }

  /**
   * 获取最新的热门故事 ID 列表
   * @returns {Promise<Array>} 故事 ID 数组
   */
  async getTopStoryIds() {
    const client = this.createHttpClient()
    const response = await client.get(`${this.apiBase}/topstories.json`)
    return response.data.slice(0, this.limit)
  }

  /**
   * 获取单个故事的详细信息
   * @param {number} id - 故事 ID
   * @returns {Promise<Object>} 故事详情
   */
  async getStoryDetails(id) {
    const client = this.createHttpClient()
    const response = await client.get(`${this.apiBase}/item/${id}.json`)
    return response.data
  }

  /**
   * 获取数据
   * @returns {Promise<Array>} 原始故事数据数组
   */
  async fetch() {
    try {
      // 1. 获取热门故事 ID 列表
      const storyIds = await this.getTopStoryIds()
      this.logger.info(`[Hacker News] Fetching ${storyIds.length} stories`)

      // 2. 并发获取每个故事的详细信息
      const stories = await Promise.all(
        storyIds.map(async (id) => {
          try {
            return await this.getStoryDetails(id)
          } catch (error) {
            this.logger.warn(`[Hacker News] Failed to fetch story ${id}:`, error.message)
            return null
          }
        })
      )

      // 3. 过滤掉失败的请求和非故事类型的内容
      return stories.filter(story =>
        story &&
        story.type === 'story' &&
        story.url && // 必须有外部链接
        !story.deleted &&
        !story.dead
      )

    } catch (error) {
      this.logger.error('[Hacker News] Fetch failed:', error)
      throw error
    }
  }

  /**
   * 转换数据格式
   * @param {Object} story - HN 原始故事对象
   * @returns {Object} 标准文章对象
   */
  transform(story) {
    return {
      title: story.title,
      summary: story.text || null, // HN 故事可能没有文本内容
      url: story.url,
      cover: null, // HN 不提供封面图
      author: story.by,
      published_at: new Date(story.time * 1000), // UNIX timestamp 转 Date
      likes: story.score || 0,
      comments: story.descendants || 0, // HN 称为 descendants（包括所有子评论）
      views: 0, // HN API 不提供浏览量
      metadata: {
        hn_id: story.id,
        hn_url: `https://news.ycombinator.com/item?id=${story.id}`,
        kids_count: story.kids?.length || 0 // 直接回复数
      }
    }
  }
}

module.exports = HackerNewsCrawler

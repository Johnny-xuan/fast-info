const BaseCrawler = require('./base')

/**
 * V2EX 爬虫
 * 使用官方 API v1 获取热门主题
 * 端点：https://www.v2ex.com/api/topics/hot.json
 * 限制：600 次请求/小时/IP
 */
class V2exCrawler extends BaseCrawler {
  constructor() {
    super('V2EX', {
      timeout: 15000,
      retries: 3
    })

    this.apiBase = 'https://www.v2ex.com/api'
  }

  /**
   * 获取热门主题列表
   */
  async fetch() {
    try {
      const client = this.createHttpClient()

      // V2EX API v1: 获取热门主题
      // 限制：600 次请求/小时/IP
      const response = await client.get(`${this.apiBase}/topics/hot.json`)

      if (!response.data || !Array.isArray(response.data)) {
        this.logger.warn('[V2EX] No data returned')
        return []
      }

      return response.data.slice(0, 20) // 取前 20 条

    } catch (error) {
      if (error.response?.status === 429) {
        this.logger.error('[V2EX] Rate limit exceeded (600/hour)')
      } else if (error.response?.status === 403) {
        this.logger.error('[V2EX] Access forbidden - may need to reduce request frequency')
      }
      throw error
    }
  }

  /**
   * 转换为标准文章格式
   */
  transform(item) {
    return {
      title: item.title,
      summary: item.content || item.content_rendered || null,
      url: `https://www.v2ex.com/t/${item.id}`,
      cover: item.member?.avatar_large || null,
      source: 'V2EX',
      category: this.categorizeV2exNode(item.node?.name),
      tags: item.node?.name ? [item.node.name] : [],
      author: item.member?.username || null,
      published_at: item.created ? new Date(item.created * 1000).toISOString() : null,
      likes: item.likes || 0,
      comments: item.replies || 0,
      views: item.views || 0,
      metadata: {
        node: item.node?.title,
        node_name: item.node?.name,
        last_modified: item.last_modified,
        last_touched: item.last_touched
      }
    }
  }

  /**
   * 根据 V2EX 节点分类到我们的分类体系
   */
  categorizeV2exNode(nodeName) {
    if (!nodeName) return 'tech'

    const nodeMap = {
      // 开发者
      'programmer': 'dev',
      'python': 'dev',
      'javascript': 'dev',
      'nodejs': 'dev',
      'go': 'dev',
      'rust': 'dev',
      'android': 'dev',
      'idev': 'dev',
      'linux': 'dev',
      'vim': 'dev',
      'git': 'dev',
      'docker': 'dev',
      'mysql': 'dev',
      'redis': 'dev',

      // 开源
      'openai': 'opensource',
      'github': 'opensource',
      'opensource': 'opensource',

      // 科技
      'apple': 'tech',
      'iphone': 'tech',
      'android': 'tech',
      'macos': 'tech',
      'windows': 'tech',
      'hardware': 'tech',
      'create': 'tech',

      // 产品
      'startup': 'product',
      'design': 'product',
      'pm': 'product'
    }

    const lowerName = nodeName.toLowerCase()
    return nodeMap[lowerName] || 'tech'
  }
}

module.exports = V2exCrawler

const BaseCrawler = require('./base')

/**
 * Product Hunt 爬虫
 * 使用 GraphQL API 获取每日产品
 * API 文档: https://api.producthunt.com/v2/docs
 */
class ProductHuntCrawler extends BaseCrawler {
  constructor(options = {}) {
    super('Product Hunt', options)
    this.apiUrl = 'https://api.producthunt.com/v2/api/graphql'
    this.tokenUrl = 'https://api.producthunt.com/v2/oauth/token'
    this.clientId = process.env.PRODUCT_HUNT_CLIENT_ID
    this.clientSecret = process.env.PRODUCT_HUNT_CLIENT_SECRET
    this.limit = options.limit || 30 // 默认抓取前30个产品
    this.accessToken = null
  }

  /**
   * 获取 OAuth access token
   * @returns {Promise<string>} Access token
   */
  async getAccessToken() {
    try {
      if (!this.clientId || !this.clientSecret) {
        throw new Error('Product Hunt API credentials not found. Please set PRODUCT_HUNT_CLIENT_ID and PRODUCT_HUNT_CLIENT_SECRET in .env')
      }

      const client = this.createHttpClient()

      this.logger.info('[Product Hunt] Getting OAuth access token')

      const response = await client.post(
        this.tokenUrl,
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials'
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )

      this.accessToken = response.data.access_token
      this.logger.info('[Product Hunt] Successfully obtained access token')

      return this.accessToken

    } catch (error) {
      this.logger.error('[Product Hunt] Failed to get access token:', error.message)
      throw error
    }
  }

  /**
   * 构建 GraphQL 查询
   * @returns {string} GraphQL 查询字符串
   */
  buildQuery() {
    return `
      query {
        posts(first: ${this.limit}, order: VOTES) {
          edges {
            node {
              id
              name
              tagline
              description
              url
              website
              votesCount
              commentsCount
              createdAt
              featuredAt
              thumbnail {
                url
              }
              topics {
                edges {
                  node {
                    name
                  }
                }
              }
              makers {
                name
              }
            }
          }
        }
      }
    `
  }

  /**
   * 获取数据
   * @returns {Promise<Array>} 原始产品数据数组
   */
  async fetch() {
    try {
      // 获取 access token
      if (!this.accessToken) {
        await this.getAccessToken()
      }

      const client = this.createHttpClient()

      this.logger.info('[Product Hunt] Fetching products from GraphQL API')

      const response = await client.post(
        this.apiUrl,
        {
          query: this.buildQuery()
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`)
      }

      const posts = response.data.data.posts.edges.map(edge => edge.node)

      this.logger.info(`[Product Hunt] Fetched ${posts.length} products`)

      return posts

    } catch (error) {
      this.logger.error('[Product Hunt] Fetch failed:', error)
      throw error
    }
  }

  /**
   * 转换数据格式
   * @param {Object} product - Product Hunt 原始产品对象
   * @returns {Object} 标准文章对象
   */
  transform(product) {
    // 提取主题标签
    const topics = product.topics?.edges?.map(edge => edge.node.name) || []

    // 提取制作者
    const makers = product.makers?.map(maker => maker.name) || []
    const author = makers.length > 0 ? makers.join(', ') : null

    // 构建摘要
    const summary = product.description || product.tagline || ''

    // 封面图
    const cover = product.thumbnail?.url || null

    // 产品链接（优先使用 Product Hunt 页面）
    const url = product.url || product.website

    return {
      title: product.name,
      summary: summary.substring(0, 500), // 限制长度
      url: url,
      cover: cover,
      author: author,
      published_at: product.featuredAt || product.createdAt,
      likes: product.votesCount || 0,
      comments: product.commentsCount || 0,
      views: 0, // Product Hunt API 不提供浏览量
      metadata: {
        product_hunt_id: product.id,
        tagline: product.tagline,
        website: product.website,
        topics: topics,
        makers: makers,
        featured_at: product.featuredAt
      }
    }
  }
}

module.exports = ProductHuntCrawler

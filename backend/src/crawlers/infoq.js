const BaseCrawler = require('./base')
const Parser = require('rss-parser')

/**
 * InfoQ 爬虫
 * 使用 RSSHub 获取 InfoQ 中文内容
 * 主题列表：https://rsshub.app/infoq/topic/{id}
 * 1=语言开发, 8=架构, 31=AI, 11=云计算, 6=Java
 */
class InfoQCrawler extends BaseCrawler {
  constructor() {
    super('InfoQ', {
      timeout: 20000,
      retries: 3
    })

    // 订阅多个主题的 RSS
    this.topics = [
      { id: '31', name: 'AI' },
      { id: '1', name: '语言开发' },
      { id: '8', name: '架构' },
      { id: '11', name: '云计算' }
    ]

    this.parser = new Parser({
      customFields: {
        item: [
          ['content:encoded', 'contentEncoded'],
          ['description', 'description']
        ]
      }
    })
  }

  /**
   * 获取所有主题的 RSS Feed
   */
  async fetch() {
    try {
      const allItems = []

      // 并发获取多个主题
      const promises = this.topics.map(topic =>
        this.fetchTopic(topic).catch(err => {
          this.logger.warn(`[InfoQ] Failed to fetch topic ${topic.name}:`, err.message)
          return []
        })
      )

      const results = await Promise.all(promises)
      results.forEach(items => allItems.push(...items))

      // 去重（基于 URL）
      const uniqueItems = Array.from(
        new Map(allItems.map(item => [item.link, item])).values()
      )

      return uniqueItems.slice(0, 20) // 取前 20 条

    } catch (error) {
      this.logger.error('[InfoQ] Failed to fetch:', error.message)
      throw error
    }
  }

  /**
   * 获取单个主题的 Feed
   */
  async fetchTopic(topic) {
    const feedUrl = `https://rsshub.app/infoq/topic/${topic.id}`

    try {
      this.logger.info(`[InfoQ] Fetching topic: ${topic.name}`)
      const feed = await this.parser.parseURL(feedUrl)

      if (!feed || !feed.items) {
        return []
      }

      // 为每个 item 添加主题信息
      return feed.items.map(item => ({
        ...item,
        topicName: topic.name
      }))

    } catch (error) {
      throw error
    }
  }

  /**
   * 转换为标准文章格式
   */
  transform(item) {
    // 从 content:encoded 或 description 提取纯文本摘要
    const content = item.contentEncoded || item.content || item.description || ''
    const summary = this.extractTextFromHTML(content)

    return {
      title: item.title,
      summary: summary,
      url: item.link,
      cover: this.extractImageFromHTML(content) || null,
      source: 'InfoQ',
      category: this.categorizeInfoQTopic(item.topicName),
      tags: item.categories || [item.topicName],
      author: item.creator || item.author || 'InfoQ',
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      likes: 0,
      comments: 0,
      views: 0,
      metadata: {
        guid: item.guid,
        topic: item.topicName
      }
    }
  }

  /**
   * 根据 InfoQ 主题分类到我们的分类体系
   */
  categorizeInfoQTopic(topicName) {
    const categoryMap = {
      'AI': 'academic',
      '语言开发': 'dev',
      '架构': 'dev',
      '云计算': 'tech',
      'Java': 'dev',
      'DevOps': 'dev'
    }

    return categoryMap[topicName] || 'tech'
  }

  /**
   * 从 HTML 中提取纯文本
   * @private
   */
  extractTextFromHTML(html) {
    if (!html) return ''

    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500)
  }

  /**
   * 从 HTML 中提取第一张图片 URL
   * @private
   */
  extractImageFromHTML(html) {
    if (!html) return null

    const imgMatch = html.match(/<img[^>]+src="([^">]+)"/i)
    return imgMatch ? imgMatch[1] : null
  }
}

module.exports = InfoQCrawler

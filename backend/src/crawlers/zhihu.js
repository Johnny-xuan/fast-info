const BaseCrawler = require('./base')
const Parser = require('rss-parser')

/**
 * 知乎热榜爬虫
 * 使用 RSSHub 获取知乎热榜内容
 * RSS: https://rsshub.app/zhihu/hotlist
 */
class ZhihuCrawler extends BaseCrawler {
  constructor() {
    super('知乎', {
      timeout: 20000,
      retries: 3
    })

    this.rssUrl = 'https://rsshub.app/zhihu/hotlist'
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
   * 获取知乎热榜 RSS Feed
   */
  async fetch() {
    try {
      this.logger.info('[知乎] Fetching RSS feed from RSSHub...')

      const feed = await this.parser.parseURL(this.rssUrl)

      if (!feed || !feed.items) {
        this.logger.warn('[知乎] No items in RSS feed')
        return []
      }

      return feed.items.slice(0, 15) // 取前 15 条

    } catch (error) {
      this.logger.error('[知乎] Failed to parse RSS:', error.message)
      throw error
    }
  }

  /**
   * 转换为标准文章格式
   */
  transform(item) {
    // 从 RSS 提取内容
    const content = item.contentEncoded || item.content || item.description || ''
    const summary = this.extractTextFromHTML(content)

    return {
      title: item.title,
      summary: summary,
      url: item.link,
      cover: this.extractImageFromHTML(content) || null,
      source: '知乎',
      category: this.categorizeZhihuTitle(item.title),
      tags: item.categories || [],
      author: item.creator || item.author || '知乎热榜',
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      likes: 0,
      comments: 0,
      views: 0,
      metadata: {
        guid: item.guid
      }
    }
  }

  /**
   * 根据标题关键词分类
   */
  categorizeZhihuTitle(title) {
    if (!title) return 'tech'

    // 科技相关
    if (/科技|编程|互联网|AI|人工智能|开发|技术|软件|代码/.test(title)) {
      return 'tech'
    }

    // 产品相关
    if (/产品|设计|创业|商业/.test(title)) {
      return 'product'
    }

    // 默认归类为 tech
    return 'tech'
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

module.exports = ZhihuCrawler

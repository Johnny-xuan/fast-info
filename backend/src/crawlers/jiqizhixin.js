const BaseCrawler = require('./base')
const Parser = require('rss-parser')

/**
 * 机器之心爬虫
 * 使用 RSS Feed 获取 AI 领域资讯
 * RSS: https://www.jiqizhixin.com/rss
 */
class JiqizhixinCrawler extends BaseCrawler {
  constructor() {
    super('机器之心', {
      timeout: 20000,
      retries: 3
    })

    this.rssUrl = 'https://www.jiqizhixin.com/rss'
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
   * 获取 RSS Feed
   */
  async fetch() {
    try {
      this.logger.info('[机器之心] Fetching RSS feed...')

      const feed = await this.parser.parseURL(this.rssUrl)

      if (!feed || !feed.items) {
        this.logger.warn('[机器之心] No items in RSS feed')
        return []
      }

      return feed.items.slice(0, 15) // 取前 15 条

    } catch (error) {
      this.logger.error('[机器之心] Failed to parse RSS:', error.message)
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
      source: '机器之心',
      category: 'academic', // 机器之心主要是 AI 学术和产业内容
      tags: item.categories || [],
      author: item.creator || item.author || '机器之心',
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      likes: 0,
      comments: 0,
      views: 0,
      metadata: {
        guid: item.guid,
        isoDate: item.isoDate
      }
    }
  }

  /**
   * 从 HTML 中提取纯文本
   * @private
   */
  extractTextFromHTML(html) {
    if (!html) return ''

    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // 移除 script
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')   // 移除 style
      .replace(/<[^>]+>/g, ' ')                          // 移除所有 HTML 标签
      .replace(/&nbsp;/g, ' ')                           // 替换 &nbsp;
      .replace(/&quot;/g, '"')                           // 替换 &quot;
      .replace(/&amp;/g, '&')                            // 替换 &amp;
      .replace(/&lt;/g, '<')                             // 替换 &lt;
      .replace(/&gt;/g, '>')                             // 替换 &gt;
      .replace(/\s+/g, ' ')                              // 合并多个空格
      .trim()
      .substring(0, 500)                                 // 限制长度
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

module.exports = JiqizhixinCrawler

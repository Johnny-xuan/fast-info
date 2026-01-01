const BaseCrawler = require('./base')
const xml2js = require('xml2js')

/**
 * arXiv 爬虫
 * API 文档: https://info.arxiv.org/help/api/index.html
 */
class ArxivCrawler extends BaseCrawler {
  constructor(options = {}) {
    super('arXiv', options)
    this.apiBase = 'http://export.arxiv.org/api/query'
    this.category = options.category || 'cs.AI' // 默认：计算机科学 - 人工智能
    this.limit = options.limit || 20
  }

  /**
   * 获取论文列表
   */
  async fetch() {
    try {
      const client = this.createHttpClient()

      // arXiv API 参数
      const params = {
        search_query: `cat:${this.category}`,
        start: 0,
        max_results: this.limit,
        sortBy: 'submittedDate',
        sortOrder: 'descending'
      }

      this.logger.info(`[arXiv] Fetching papers for category: ${this.category}`)

      const response = await client.get(this.apiBase, { params })

      // 解析 XML 响应
      const parser = new xml2js.Parser({ explicitArray: false })
      const result = await parser.parseStringPromise(response.data)

      const entries = result.feed.entry
      const papers = Array.isArray(entries) ? entries : [entries]

      this.logger.info(`[arXiv] Fetched ${papers.length} papers`)
      return papers.filter(p => p) // 过滤掉 undefined

    } catch (error) {
      this.logger.error('[arXiv] Fetch failed:', error.message)
      throw error
    }
  }

  /**
   * 转换数据格式
   */
  transform(paper) {
    // 提取作者列表
    const authors = Array.isArray(paper.author)
      ? paper.author.map(a => a.name).join(', ')
      : paper.author?.name || 'Unknown'

    // 提取分类
    const categories = Array.isArray(paper.category)
      ? paper.category.map(c => c.$.term)
      : [paper.category?.$.term].filter(Boolean)

    // 提取摘要（移除换行）
    const summary = paper.summary
      ? paper.summary.replace(/\n/g, ' ').trim()
      : null

    // 提取 arXiv ID
    const arxivId = paper.id.split('/abs/')[1]

    return {
      title: paper.title.replace(/\n/g, ' ').trim(),
      summary,
      url: paper.id,
      cover: null,
      author: authors,
      published_at: new Date(paper.published),
      likes: 0, // arXiv 不提供点赞数据
      comments: 0,
      views: 0,
      metadata: {
        arxiv_id: arxivId,
        categories,
        primary_category: paper['arxiv:primary_category']?.$.term,
        updated: paper.updated,
        pdf_url: paper.link.find(l => l.$.title === 'pdf')?.$.href
      },
      tags: categories
    }
  }
}

module.exports = ArxivCrawler

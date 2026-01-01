const BaseCrawler = require('./base')
const cheerio = require('cheerio')

/**
 * GitHub Trending 爬虫
 * 爬取 GitHub Trending 页面获取热门仓库
 */
class GitHubTrendingCrawler extends BaseCrawler {
  constructor(options = {}) {
    super('GitHub Trending', options)
    this.baseUrl = 'https://github.com/trending'
    this.language = options.language || '' // 可选：特定编程语言
    this.since = options.since || 'daily' // daily, weekly, monthly
    this.limit = options.limit || 25
  }

  /**
   * 构建 URL
   */
  buildUrl() {
    let url = this.baseUrl
    if (this.language) {
      url += `/${this.language}`
    }
    url += `?since=${this.since}`
    return url
  }

  /**
   * 获取数据
   */
  async fetch() {
    try {
      const client = this.createHttpClient()
      const url = this.buildUrl()

      this.logger.info(`[GitHub Trending] Fetching from ${url}`)

      const response = await client.get(url, {
        headers: {
          'Accept': 'text/html',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      })

      const $ = cheerio.load(response.data)
      const repositories = []

      // 解析每个仓库卡片
      $('article.Box-row').each((index, element) => {
        if (index >= this.limit) return false // 限制数量

        const $repo = $(element)

        // 提取仓库信息
        const repoPath = $repo.find('h2 a').attr('href')
        const repoName = $repo.find('h2 a').text().trim().replace(/\s+/g, ' ')
        const description = $repo.find('p').first().text().trim()

        // 提取统计数据
        const starsToday = $repo.find('span.float-sm-right').text().trim()
        const starsTotal = $repo.find('svg.octicon-star').parent().text().trim()
        const forksTotal = $repo.find('svg.octicon-repo-forked').parent().text().trim()
        const language = $repo.find('[itemprop="programmingLanguage"]').text().trim()

        // 构建仓库对象
        if (repoPath && repoName) {
          repositories.push({
            path: repoPath,
            name: repoName,
            description,
            starsToday,
            starsTotal: this.parseNumber(starsTotal),
            forksTotal: this.parseNumber(forksTotal),
            language
          })
        }
      })

      this.logger.info(`[GitHub Trending] Parsed ${repositories.length} repositories`)
      return repositories

    } catch (error) {
      this.logger.error('[GitHub Trending] Fetch failed:', error.message)
      throw error
    }
  }

  /**
   * 解析数字字符串（如 "1.2k" -> 1200）
   */
  parseNumber(str) {
    if (!str) return 0

    str = str.trim().toLowerCase()
    const match = str.match(/([\d.]+)([km]?)/)
    if (!match) return 0

    const num = parseFloat(match[1])
    const multiplier = match[2]

    if (multiplier === 'k') return Math.floor(num * 1000)
    if (multiplier === 'm') return Math.floor(num * 1000000)
    return Math.floor(num)
  }

  /**
   * 转换数据格式
   */
  transform(repo) {
    return {
      title: repo.name,
      summary: repo.description || null,
      url: `https://github.com${repo.path}`,
      cover: null,
      author: repo.path.split('/')[1], // 仓库所有者
      published_at: new Date(), // GitHub Trending 不提供具体发布时间，使用当前时间
      likes: repo.starsTotal || 0,
      comments: 0, // GitHub Trending 不显示 issues/PR 数量
      views: repo.forksTotal || 0, // 用 forks 数量代替 views
      metadata: {
        language: repo.language,
        stars_today: repo.starsToday,
        forks: repo.forksTotal,
        repo_path: repo.path
      }
    }
  }
}

module.exports = GitHubTrendingCrawler

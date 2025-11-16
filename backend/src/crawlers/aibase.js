const BaseCrawler = require('./base')
const puppeteer = require('puppeteer')

/**
 * AIBase 产品爬虫
 * 抓取 https://top.aibase.com/ 的 AI 产品信息
 * 使用 Puppeteer 执行 JavaScript 获取嵌入在页面中的产品数据
 */
class AIBaseCrawler extends BaseCrawler {
  constructor(options = {}) {
    super('AIBase', options)
    this.url = 'https://top.aibase.com/'
    this.limit = options.limit || 20 // 默认抓取前20个产品
  }

  /**
   * 获取数据
   * @returns {Promise<Array>} 原始产品数据数组
   */
  async fetch() {
    let browser = null

    try {
      this.logger.info('[AIBase] Launching browser...')

      // 启动浏览器
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })

      const page = await browser.newPage()

      // 设置用户代理
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

      this.logger.info('[AIBase] Loading page...')

      // 访问页面并等待网络空闲
      await page.goto(this.url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      })

      this.logger.info('[AIBase] Extracting product data...')

      // 提取 window.__NUXT__ 中的产品数据
      const products = await page.evaluate(() => {
        const allProducts = []

        // 尝试从 window.__NUXT__ 提取
        if (window.__NUXT__) {
          const nuxtData = window.__NUXT__

          // 遍历所有属性，找到包含产品对象的数组
          for (const key in nuxtData) {
            const value = nuxtData[key]

            // 检查是否是数组且包含产品对象
            if (Array.isArray(value) && value.length > 0) {
              const firstItem = value[0]

              // 产品对象应该有 name 等字段
              if (firstItem &&
                  typeof firstItem === 'object' &&
                  'name' in firstItem &&
                  !Array.isArray(firstItem.name)) {
                allProducts.push(...value)
              }
            }
          }
        }

        // 如果从 __NUXT__ 无法提取，尝试从 DOM 中提取
        if (allProducts.length === 0) {
          const links = document.querySelectorAll('a[href*="/tool/"]')
          links.forEach(link => {
            const href = link.getAttribute('href')
            const title = link.textContent?.trim()

            if (href && title) {
              allProducts.push({
                name: title,
                url: `https://top.aibase.com${href}`,
                zurl: href.replace('/tool/', ''),
                info: '',
                logo: null
              })
            }
          })
        }

        return allProducts
      })

      await browser.close()

      this.logger.info(`[AIBase] Extracted ${products.length} products`)

      // 过滤并限制数量
      return products
        .filter(product => product && product.name && product.url)
        .slice(0, this.limit)

    } catch (error) {
      if (browser) {
        await browser.close()
      }
      this.logger.error('[AIBase] Fetch failed:', error)
      throw error
    }
  }

  /**
   * 转换数据格式
   * @param {Object} product - AIBase 原始产品对象
   * @returns {Object} 标准文章对象
   */
  transform(product) {
    // 构建产品 URL
    const productUrl = product.url || `https://top.aibase.com/tool/${product.zurl || product.id}`

    // 构建摘要（优先使用 info，其次使用 desc）
    const summary = product.info || product.desc || ''

    // 构建封面图
    const cover = product.logo || product.imgurl || null

    return {
      title: product.name,
      summary: summary.substring(0, 500), // 限制摘要长度
      url: productUrl,
      cover: cover,
      author: null, // AIBase 不提供作者信息
      published_at: product.created_at || new Date(), // 使用创建时间或当前时间
      likes: product.rating || 0,
      comments: 0, // AIBase 不提供评论数
      views: 0, // AIBase 不提供浏览量
      metadata: {
        aibase_id: product.id,
        categories: product.categories || [],
        tags: product.tags || [],
        price: product.price || 'free',
        status: product.status || 'active',
        functions: product.functions || null,
        use: product.use || null
      }
    }
  }
}

module.exports = AIBaseCrawler

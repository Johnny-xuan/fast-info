const articleService = require('../services/articleService')

/**
 * 文章控制器
 * 处理文章相关的 HTTP 请求
 */

/**
 * 获取文章列表
 * GET /api/articles?category=tech&sort=hot&page=1&limit=20
 */
exports.getArticles = async (req, res) => {
  try {
    const {
      category = 'all',
      sort = 'latest',
      page = 1,
      limit = 20,
      source
    } = req.query

    // 验证分类
    if (category && category !== 'all' && !['tech', 'dev', 'academic'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be: tech, dev, academic, or all'
      })
    }

    const result = await articleService.getArticles({
      category,
      sort,
      page: parseInt(page),
      limit: parseInt(limit),
      source
    })

    res.json({
      success: true,
      data: {
        articles: result.articles,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      }
    })

  } catch (error) {
    console.error('Error fetching articles:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * 获取单篇文章详情
 * GET /api/articles/:id
 */
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params

    const article = await articleService.getArticleById(id)

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      })
    }

    res.json({
      success: true,
      data: article
    })

  } catch (error) {
    console.error('Error fetching article:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch article',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * 获取热门文章
 * GET /api/articles/hot?category=tech&limit=10
 */
exports.getHotArticles = async (req, res) => {
  try {
    const { category = 'all', limit = 10 } = req.query

    const articles = await articleService.getHotArticles(
      category !== 'all' ? category : null,
      parseInt(limit)
    )

    res.json({
      success: true,
      data: articles
    })

  } catch (error) {
    console.error('Error fetching hot articles:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hot articles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * 搜索文章
 * GET /api/articles/search?q=keyword&category=tech
 */
exports.searchArticles = async (req, res) => {
  try {
    const {
      q,
      category,
      page = 1,
      limit = 20
    } = req.query

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query (q) is required'
      })
    }

    const result = await articleService.searchArticles({
      q,
      category,
      page: parseInt(page),
      limit: parseInt(limit)
    })

    res.json({
      success: true,
      data: {
        articles: result.articles,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      }
    })

  } catch (error) {
    console.error('Error searching articles:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to search articles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * 获取数据源统计
 * GET /api/articles/stats/sources
 */
exports.getSourceStats = async (req, res) => {
  try {
    const stats = await articleService.getSourceStats()

    res.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching source stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch source statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * 获取分类统计
 * GET /api/articles/stats/categories
 */
exports.getCategoryStats = async (req, res) => {
  try {
    const stats = await articleService.getCategoryStats()

    res.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching category stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

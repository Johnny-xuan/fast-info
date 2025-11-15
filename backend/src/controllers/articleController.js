const Article = require('../models/Article')

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
      sort = 'latest', // hot | latest
      page = 1,
      limit = 20,
      source
    } = req.query

    // 构建查询条件
    const query = { isPublished: true }

    if (category && category !== 'all') {
      if (!['tech', 'dev', 'academic'].includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        })
      }
      query.category = category
    }

    if (source) {
      query.source = source
    }

    // 排序选项
    let sortOption = {}
    if (sort === 'hot') {
      sortOption = { hotScore: -1, createdAt: -1 }
    } else {
      sortOption = { publishedAt: -1, createdAt: -1 }
    }

    // 分页
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const limitNum = parseInt(limit)

    // 执行查询
    const [articles, total] = await Promise.all([
      Article.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .select('-metadata')
        .lean(),
      Article.countDocuments(query)
    ])

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
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

    const article = await Article.findById(id).lean()

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

    const articles = await Article.getHotArticles(
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
        message: 'Search query is required'
      })
    }

    // 构建查询条件
    const query = {
      isPublished: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { summary: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    }

    if (category && category !== 'all') {
      query.category = category
    }

    // 分页
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const limitNum = parseInt(limit)

    // 执行查询
    const [articles, total] = await Promise.all([
      Article.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-metadata')
        .lean(),
      Article.countDocuments(query)
    ])

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
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
    const stats = await Article.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          latestArticle: { $max: '$publishedAt' }
        }
      },
      { $sort: { count: -1 } }
    ])

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
    const stats = await Article.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          latestArticle: { $max: '$publishedAt' }
        }
      },
      { $sort: { count: -1 } }
    ])

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

const express = require('express')
const router = express.Router()
const articleController = require('../controllers/articleController')

/**
 * 文章路由
 * Base: /api/articles
 */

// 获取文章列表
// GET /api/articles?category=tech&sort=hot&page=1&limit=20
router.get('/', articleController.getArticles)

// 获取热门文章
// GET /api/articles/hot?category=tech&limit=10
router.get('/hot', articleController.getHotArticles)

// 搜索文章
// GET /api/articles/search?q=keyword&category=tech
router.get('/search', articleController.searchArticles)

// 获取数据源统计
// GET /api/articles/stats/sources
router.get('/stats/sources', articleController.getSourceStats)

// 获取分类统计
// GET /api/articles/stats/categories
router.get('/stats/categories', articleController.getCategoryStats)

// 获取单篇文章详情（放在最后，避免被其他路由匹配）
// GET /api/articles/:id
router.get('/:id', articleController.getArticleById)

module.exports = router

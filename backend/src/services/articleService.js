const supabase = require('../config/supabase')

/**
 * 文章服务层
 * 封装所有与文章相关的数据库操作
 */

class ArticleService {
  /**
   * 获取文章列表
   * @param {Object} options - 查询选项
   * @param {string} options.category - 分类：tech | dev | academic | all
   * @param {string} options.sort - 排序：hot | latest
   * @param {number} options.page - 页码
   * @param {number} options.limit - 每页数量
   * @param {string} options.source - 数据源（可选）
   * @param {string} options.timeRange - 时间范围：today | week | month | all（可选）
   */
  async getArticles({ category = 'all', sort = 'latest', page = 1, limit = 20, source, timeRange }) {
    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .eq('is_published', true)

    // 分类筛选
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // 来源筛选
    if (source) {
      query = query.eq('source', source)
    }

    // 时间范围筛选
    if (timeRange && timeRange !== 'all') {
      const now = new Date()
      let startDate

      if (timeRange === 'today') {
        // 今天：从今天 00:00:00 开始
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      } else if (timeRange === 'week') {
        // 本周：过去 7 天
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      } else if (timeRange === 'month') {
        // 本月：过去 30 天
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }

      if (startDate) {
        query = query.gte('published_at', startDate.toISOString())
      }
    }

    // 排序
    if (sort === 'hot') {
      query = query.order('hot_score', { ascending: false }).order('created_at', { ascending: false })
    } else {
      query = query.order('published_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false })
    }

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch articles: ${error.message}`)
    }

    return {
      articles: data,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }
  }

  /**
   * 获取单篇文章
   * @param {string} id - 文章 ID
   */
  async getArticleById(id) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // 文章不存在
      }
      throw new Error(`Failed to fetch article: ${error.message}`)
    }

    return data
  }

  /**
   * 获取热门文章
   * @param {string} category - 分类（可选）
   * @param {number} limit - 数量限制
   */
  async getHotArticles(category, limit = 10) {
    let query = supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .order('hot_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch hot articles: ${error.message}`)
    }

    return data
  }

  /**
   * 搜索文章
   * @param {Object} options - 搜索选项
   * @param {string} options.q - 搜索关键词
   * @param {string} options.category - 分类（可选）
   * @param {number} options.page - 页码
   * @param {number} options.limit - 每页数量
   * @param {string} options.source - 数据源（可选）
   * @param {string} options.timeRange - 时间范围（可选）
   */
  async searchArticles({ q, category, page = 1, limit = 20, source, timeRange }) {
    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .eq('is_published', true)
      .or(`title.ilike.%${q}%,summary.ilike.%${q}%`)

    // 分类筛选
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // 来源筛选
    if (source) {
      query = query.eq('source', source)
    }

    // 时间范围筛选
    if (timeRange && timeRange !== 'all') {
      const now = new Date()
      let startDate

      if (timeRange === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      } else if (timeRange === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      } else if (timeRange === 'month') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }

      if (startDate) {
        query = query.gte('published_at', startDate.toISOString())
      }
    }

    // 排序
    query = query.order('created_at', { ascending: false })

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Failed to search articles: ${error.message}`)
    }

    return {
      articles: data,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }
  }

  /**
   * 获取数据源统计
   */
  async getSourceStats() {
    const { data, error } = await supabase
      .from('articles')
      .select('source')
      .eq('is_published', true)

    if (error) {
      throw new Error(`Failed to fetch source stats: ${error.message}`)
    }

    // 手动聚合统计
    const stats = data.reduce((acc, article) => {
      const source = article.source
      if (!acc[source]) {
        acc[source] = { _id: source, count: 0 }
      }
      acc[source].count++
      return acc
    }, {})

    return Object.values(stats).sort((a, b) => b.count - a.count)
  }

  /**
   * 获取分类统计
   */
  async getCategoryStats() {
    const { data, error } = await supabase
      .from('articles')
      .select('category')
      .eq('is_published', true)

    if (error) {
      throw new Error(`Failed to fetch category stats: ${error.message}`)
    }

    // 手动聚合统计
    const stats = data.reduce((acc, article) => {
      const category = article.category
      if (!acc[category]) {
        acc[category] = { _id: category, count: 0 }
      }
      acc[category].count++
      return acc
    }, {})

    return Object.values(stats).sort((a, b) => b.count - a.count)
  }

  /**
   * 创建文章（爬虫使用）
   * @param {Object} articleData - 文章数据
   */
  async createArticle(articleData) {
    const { data, error } = await supabase
      .from('articles')
      .insert([articleData])
      .select()
      .single()

    if (error) {
      // 如果是唯一性冲突（URL 重复），返回 null
      if (error.code === '23505') {
        return null
      }
      throw new Error(`Failed to create article: ${error.message}`)
    }

    return data
  }

  /**
   * 更新文章
   * @param {string} id - 文章 ID
   * @param {Object} updates - 更新数据
   */
  async updateArticle(id, updates) {
    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update article: ${error.message}`)
    }

    return data
  }

  /**
   * 删除文章
   * @param {string} id - 文章 ID
   */
  async deleteArticle(id) {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete article: ${error.message}`)
    }

    return true
  }

  /**
   * 计算并更新热度分数
   * @param {string} id - 文章 ID
   */
  async updateHotScore(id) {
    const article = await this.getArticleById(id)
    if (!article) return null

    const publishedAt = article.published_at || article.created_at
    const age = Date.now() - new Date(publishedAt).getTime()
    const ageHours = age / 3600000

    // 威尔逊算法简化版
    const score = (article.likes * 2 + article.views * 0.01 + article.comments * 5) / Math.pow(ageHours + 2, 1.8)
    const hotScore = Math.round(score * 100) / 100

    return await this.updateArticle(id, { hot_score: hotScore })
  }
}

module.exports = new ArticleService()

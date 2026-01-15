export class ArticleService {
  constructor(db, redisClient) {
    this.db = db
    this.redisClient = redisClient
  }

  // 初始化全文搜索（创建索引）
  async initFullTextSearch() {
    try {
      // 添加 search_vector 列（如果不存在）
      await this.db.query(`
        ALTER TABLE articles 
        ADD COLUMN IF NOT EXISTS search_vector tsvector
      `)
      
      // 创建 GIN 索引加速搜索
      await this.db.query(`
        CREATE INDEX IF NOT EXISTS articles_search_idx 
        ON articles USING GIN(search_vector)
      `)
      
      // 更新现有文章的 search_vector
      await this.db.query(`
        UPDATE articles 
        SET search_vector = to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(summary, ''))
        WHERE search_vector IS NULL
      `)
      
      // 创建触发器自动更新 search_vector
      await this.db.query(`
        CREATE OR REPLACE FUNCTION articles_search_trigger() RETURNS trigger AS $$
        BEGIN
          NEW.search_vector := to_tsvector('simple', coalesce(NEW.title, '') || ' ' || coalesce(NEW.summary, ''));
          RETURN NEW;
        END
        $$ LANGUAGE plpgsql
      `)
      
      await this.db.query(`
        DROP TRIGGER IF EXISTS articles_search_update ON articles
      `)
      
      await this.db.query(`
        CREATE TRIGGER articles_search_update
        BEFORE INSERT OR UPDATE ON articles
        FOR EACH ROW EXECUTE FUNCTION articles_search_trigger()
      `)
      
      console.log('✅ Full-text search initialized')
    } catch (error) {
      console.error('Failed to init full-text search:', error.message)
    }
  }

  // 智能搜索（全文搜索 + 相关性排序）
  async search(query, options = {}) {
    const { 
      limit = 20, 
      page = 1, 
      source = '', 
      category = '', 
      timeRange = 'all' 
    } = options
    
    const offset = (page - 1) * limit
    const cacheKey = `search:${query}:${limit}:${page}:${source}:${category}:${timeRange}`
    
    const cached = await this.redisClient.get(cacheKey)
    if (cached) return JSON.parse(cached)

    // 构建搜索条件
    const conditions = []
    const params = []
    let paramIndex = 1
    
    // 全文搜索条件（支持中英文）
    if (query && query.trim()) {
      // 使用 plainto_tsquery 处理普通查询，同时保留 ILIKE 作为后备
      conditions.push(`(
        search_vector @@ plainto_tsquery('simple', $${paramIndex})
        OR title ILIKE $${paramIndex + 1}
        OR summary ILIKE $${paramIndex + 1}
      )`)
      params.push(query.trim())
      params.push(`%${query.trim()}%`)
      paramIndex += 2
    }
    
    // 来源筛选
    if (source) {
      conditions.push(`source = $${paramIndex}`)
      params.push(source)
      paramIndex++
    }
    
    // 分类筛选
    if (category) {
      conditions.push(`category = $${paramIndex}`)
      params.push(category)
      paramIndex++
    }
    
    // 时间筛选
    if (timeRange && timeRange !== 'all') {
      const intervals = { today: '1 day', week: '7 days', month: '30 days' }
      if (intervals[timeRange]) {
        conditions.push(`published_at > NOW() - INTERVAL '${intervals[timeRange]}'`)
      }
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    
    // 查询总数
    const countResult = await this.db.query(
      `SELECT COUNT(*) as total FROM articles ${whereClause}`,
      params
    )
    const total = parseInt(countResult.rows[0].total)
    
    // 查询结果（按相关性 + 热度排序）
    const result = await this.db.query(`
      SELECT id, title, summary, url, source, category, published_at, hot_score, image_url,
             ts_rank(search_vector, plainto_tsquery('simple', $1)) as relevance
      FROM articles 
      ${whereClause}
      ORDER BY 
        CASE WHEN search_vector @@ plainto_tsquery('simple', $1) 
             THEN ts_rank(search_vector, plainto_tsquery('simple', $1)) 
             ELSE 0 END DESC,
        hot_score DESC,
        published_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset])

    const response = {
      success: true,
      data: {
        articles: result.rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    }

    await this.redisClient.setex(cacheKey, 180, JSON.stringify(response))
    return response
  }

  async getTrending(limit = 10) {
    const cacheKey = `trending:${limit}`
    const cached = await this.redisClient.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const result = await this.db.query(`
      SELECT id, title, summary, url, source, category, hot_score, image_url
      FROM articles 
      WHERE published_at > NOW() - INTERVAL '24 hours'
      ORDER BY hot_score DESC 
      LIMIT $1
    `, [limit])

    await this.redisClient.setex(cacheKey, 600, JSON.stringify(result.rows))
    return result.rows
  }

  async getByCategory(category, limit = 30) {
    const cacheKey = `category:${category}:${limit}`
    const cached = await this.redisClient.get(cacheKey)
    if (cached) return JSON.parse(cached)

    let query = `
      SELECT id, title, summary, url, source, category, published_at, hot_score, image_url
      FROM articles
    `
    const params = []

    if (category && category !== 'all') {
      query += ' WHERE category = $1'
      params.push(category)
    }
    
    query += ' ORDER BY hot_score DESC LIMIT $' + (params.length + 1)
    params.push(parseInt(limit))

    const result = await this.db.query(query, params)
    
    await this.redisClient.setex(cacheKey, 300, JSON.stringify(result.rows))
    return result.rows
  }

  async getArticleById(id) {
    const result = await this.db.query('SELECT * FROM articles WHERE id = $1', [id])
    return result.rows[0]
  }

  async updateAISummary(id, summary) {
    await this.db.query('UPDATE articles SET ai_summary = $1 WHERE id = $2', [summary, id])
    // 清除相关缓存? 暂时不清除，因为列表页通常不显示全文摘要，或者缓存很快过期
  }
}

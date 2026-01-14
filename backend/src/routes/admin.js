import express from 'express'

export default function createAdminRoutes(db, authService, crawlerService = null) {
  const router = express.Router()

  // 管理员权限中间件
  const requireAdmin = async (req, res, next) => {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未登录' })
    }

    const token = authHeader.substring(7)
    const decoded = authService.verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Token 无效' })
    }

    const user = await authService.getUserById(decoded.id)
    if (!user || !user.is_admin) {
      return res.status(403).json({ error: '无管理员权限' })
    }

    req.user = user
    next()
  }

  // 获取系统统计
  router.get('/stats', requireAdmin, async (req, res) => {
    try {
      const stats = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM articles) as total_articles,
          (SELECT COUNT(*) FROM articles WHERE created_at > NOW() - INTERVAL '24 hours') as today_articles,
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '24 hours') as today_users,
          (SELECT COUNT(*) FROM users WHERE is_premium = true) as premium_users
      `)
      
      res.json({
        success: true,
        data: stats.rows[0]
      })
    } catch (error) {
      console.error('Admin stats error:', error)
      res.status(500).json({ error: '获取统计失败' })
    }
  })

  // 获取用户列表
  router.get('/users', requireAdmin, async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query
      const offset = (page - 1) * limit

      const users = await db.query(`
        SELECT id, email, name, avatar, provider, is_admin, is_premium, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset])

      const total = await db.query('SELECT COUNT(*) FROM users')

      res.json({
        success: true,
        data: {
          users: users.rows,
          total: parseInt(total.rows[0].count),
          page: parseInt(page),
          limit: parseInt(limit)
        }
      })
    } catch (error) {
      console.error('Admin users error:', error)
      res.status(500).json({ error: '获取用户列表失败' })
    }
  })

  // 更新用户权限
  router.put('/users/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params
      const { is_admin, is_premium } = req.body

      await db.query(`
        UPDATE users 
        SET is_admin = COALESCE($1, is_admin),
            is_premium = COALESCE($2, is_premium),
            updated_at = NOW()
        WHERE id = $3
      `, [is_admin, is_premium, id])

      res.json({ success: true })
    } catch (error) {
      console.error('Update user error:', error)
      res.status(500).json({ error: '更新用户失败' })
    }
  })

  // 获取爬虫设置
  router.get('/crawler', requireAdmin, async (req, res) => {
    try {
      // 从数据库或配置文件读取爬虫设置
      const settings = await db.query(`
        SELECT key, value FROM user_settings 
        WHERE user_id IS NULL AND key LIKE 'crawler_%'
      `)

      const crawlerSettings = {
        schedule: '0 * * * *',
        sources: {},
        limits: {}
      }

      settings.rows.forEach(row => {
        if (row.key === 'crawler_schedule') {
          crawlerSettings.schedule = row.value
        } else if (row.key === 'crawler_sources') {
          crawlerSettings.sources = JSON.parse(row.value || '{}')
        } else if (row.key === 'crawler_limits') {
          crawlerSettings.limits = JSON.parse(row.value || '{}')
        }
      })

      res.json({ success: true, data: crawlerSettings })
    } catch (error) {
      console.error('Get crawler settings error:', error)
      res.status(500).json({ error: '获取爬虫设置失败' })
    }
  })

  // 保存爬虫设置
  router.put('/crawler', requireAdmin, async (req, res) => {
    try {
      const { schedule, sources, limits } = req.body

      // 使用 upsert 保存设置（全局设置，user_id 为 null）
      const upsertSetting = async (key, value) => {
        const updated = await db.query(
          `
          UPDATE user_settings
          SET value = $2, updated_at = NOW()
          WHERE user_id IS NULL AND key = $1
          `,
          [key, value]
        )

        if (updated.rowCount === 0) {
          await db.query(
            `
            INSERT INTO user_settings (id, user_id, key, value)
            VALUES (gen_random_uuid(), NULL, $1, $2)
            `,
            [key, value]
          )
        }
      }

      if (schedule) await upsertSetting('crawler_schedule', schedule)
      if (sources) await upsertSetting('crawler_sources', JSON.stringify(sources))
      if (limits) await upsertSetting('crawler_limits', JSON.stringify(limits))

      res.json({ success: true, message: '爬虫设置已保存' })
    } catch (error) {
      console.error('Save crawler settings error:', error)
      res.status(500).json({ error: '保存爬虫设置失败' })
    }
  })

  // 手动触发爬虫
  router.post('/crawler/run', requireAdmin, async (req, res) => {
    try {
      if (!crawlerService) {
        return res.status(500).json({ success: false, message: '爬虫服务未初始化' })
      }
      
      // 异步执行爬虫，不阻塞响应
      crawlerService.run().catch(err => {
        console.error('Crawler run error:', err)
      })
      
      res.json({ success: true, message: '爬虫任务已启动，请稍后刷新查看新数据' })
    } catch (error) {
      console.error('Run crawler error:', error)
      res.status(500).json({ success: false, message: '启动爬虫失败: ' + error.message })
    }
  })

  // 获取文章列表（管理用）
  router.get('/articles', requireAdmin, async (req, res) => {
    try {
      const { page = 1, limit = 50, source } = req.query
      const offset = (page - 1) * limit

      let query = `
        SELECT id, title, url, source, category, created_at, hot_score
        FROM articles
      `
      const params = []
      
      if (source && source !== 'all') {
        query += ' WHERE source = $1'
        params.push(source)
      }
      
      query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2)
      params.push(limit, offset)

      const articles = await db.query(query, params)
      
      let countQuery = 'SELECT COUNT(*) FROM articles'
      if (source && source !== 'all') {
        countQuery += ' WHERE source = $1'
      }
      const total = await db.query(countQuery, source && source !== 'all' ? [source] : [])

      res.json({
        success: true,
        data: {
          articles: articles.rows,
          total: parseInt(total.rows[0].count),
          page: parseInt(page),
          limit: parseInt(limit)
        }
      })
    } catch (error) {
      console.error('Admin articles error:', error)
      res.status(500).json({ error: '获取文章列表失败' })
    }
  })

  // 删除文章
  router.delete('/articles/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params
      await db.query('DELETE FROM articles WHERE id = $1', [id])
      res.json({ success: true })
    } catch (error) {
      console.error('Delete article error:', error)
      res.status(500).json({ error: '删除文章失败' })
    }
  })

  // 批量删除过期文章
  router.post('/articles/cleanup', requireAdmin, async (req, res) => {
    try {
      const { days = 30 } = req.body
      const result = await db.query(`
        DELETE FROM articles 
        WHERE created_at < NOW() - INTERVAL '1 day' * $1
        RETURNING id
      `, [days])

      res.json({ 
        success: true, 
        message: `已清理 ${result.rowCount} 篇文章` 
      })
    } catch (error) {
      console.error('Cleanup articles error:', error)
      res.status(500).json({ error: '清理文章失败' })
    }
  })

  return router
}

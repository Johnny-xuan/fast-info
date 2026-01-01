/**
 * 获取数据库统计信息工具
 */
const db = require('../../db')

async function getStats() {
  // 总数
  const totalResult = await db.query('SELECT COUNT(*) FROM articles')
  const total = parseInt(totalResult.rows[0].count)
  
  // 按分类统计
  const categoryResult = await db.query(`
    SELECT category, COUNT(*) as count 
    FROM articles 
    GROUP BY category 
    ORDER BY count DESC
  `)
  const byCategory = {}
  categoryResult.rows.forEach(row => {
    byCategory[row.category] = parseInt(row.count)
  })
  
  // 按来源统计
  const sourceResult = await db.query(`
    SELECT source, COUNT(*) as count 
    FROM articles 
    GROUP BY source 
    ORDER BY count DESC
  `)
  const bySource = {}
  sourceResult.rows.forEach(row => {
    bySource[row.source] = parseInt(row.count)
  })
  
  // 最新更新时间
  const latestResult = await db.query(`
    SELECT MAX(created_at) as latest FROM articles
  `)
  
  // 今日新增
  const todayResult = await db.query(`
    SELECT COUNT(*) FROM articles WHERE created_at >= CURRENT_DATE
  `)
  const todayCount = parseInt(todayResult.rows[0].count)
  
  return {
    total,
    todayCount,
    byCategory,
    bySource,
    latestUpdate: latestResult.rows[0].latest
  }
}

module.exports = { getStats }

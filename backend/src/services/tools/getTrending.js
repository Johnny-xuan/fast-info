/**
 * 获取热门文章工具
 */
const db = require('../../db')

async function getTrending(limit = 10) {
  const result = await db.query(`
    SELECT id, title, url, source, category, ai_summary, hot_score, created_at
    FROM articles 
    ORDER BY hot_score DESC, created_at DESC
    LIMIT $1
  `, [limit])
  
  return result.rows
}

module.exports = { getTrending }

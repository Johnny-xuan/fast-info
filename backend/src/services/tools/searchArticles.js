/**
 * 搜索文章工具
 */
const db = require('../../db')

async function searchArticles(query, limit = 10) {
  const result = await db.query(`
    SELECT id, title, url, source, category, ai_summary, hot_score, created_at
    FROM articles 
    WHERE title ILIKE $1 OR summary ILIKE $1 OR ai_summary ILIKE $1
    ORDER BY hot_score DESC, created_at DESC
    LIMIT $2
  `, [`%${query}%`, limit])
  
  return result.rows
}

module.exports = { searchArticles }

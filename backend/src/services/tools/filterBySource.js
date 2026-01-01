/**
 * 按来源筛选文章工具
 */
const db = require('../../db')

async function filterBySource(source, limit = 10) {
  const result = await db.query(`
    SELECT id, title, url, source, category, ai_summary, hot_score, created_at
    FROM articles 
    WHERE source ILIKE $1
    ORDER BY created_at DESC
    LIMIT $2
  `, [`%${source}%`, limit])
  
  return result.rows
}

async function getSources() {
  const result = await db.query(`
    SELECT source, COUNT(*) as count 
    FROM articles 
    GROUP BY source 
    ORDER BY count DESC
  `)
  return result.rows
}

module.exports = { filterBySource, getSources }

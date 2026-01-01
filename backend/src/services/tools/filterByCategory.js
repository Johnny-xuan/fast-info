/**
 * 按分类筛选文章工具
 */
const db = require('../../db')

const VALID_CATEGORIES = ['tech', 'dev', 'academic', 'product', 'opensource']

async function filterByCategory(category, limit = 10) {
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error(`Invalid category: ${category}. Valid: ${VALID_CATEGORIES.join(', ')}`)
  }
  
  const result = await db.query(`
    SELECT id, title, url, source, category, ai_summary, hot_score, created_at
    FROM articles 
    WHERE category = $1
    ORDER BY created_at DESC
    LIMIT $2
  `, [category, limit])
  
  return result.rows
}

module.exports = { filterByCategory, VALID_CATEGORIES }

/**
 * 获取今日摘要工具
 */
const db = require('../../db')

async function getDailyDigest() {
  // 获取今日文章
  const result = await db.query(`
    SELECT id, title, url, source, category, ai_summary, hot_score, created_at
    FROM articles 
    WHERE created_at >= CURRENT_DATE
    ORDER BY hot_score DESC, created_at DESC
    LIMIT 20
  `)
  
  const articles = result.rows
  
  // 按分类分组
  const byCategory = {}
  articles.forEach(article => {
    if (!byCategory[article.category]) {
      byCategory[article.category] = []
    }
    byCategory[article.category].push(article)
  })
  
  return {
    date: new Date().toISOString().split('T')[0],
    total: articles.length,
    articles,
    byCategory
  }
}

module.exports = { getDailyDigest }

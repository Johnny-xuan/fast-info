/**
 * 按时间筛选文章工具
 */
const db = require('../../db')

const DATE_RANGES = {
  today: "created_at >= CURRENT_DATE",
  week: "created_at >= CURRENT_DATE - INTERVAL '7 days'",
  month: "created_at >= CURRENT_DATE - INTERVAL '30 days'"
}

async function filterByDate(range, limit = 10) {
  if (!DATE_RANGES[range]) {
    throw new Error(`Invalid range: ${range}. Valid: today, week, month`)
  }
  
  const result = await db.query(`
    SELECT id, title, url, source, category, ai_summary, hot_score, created_at
    FROM articles 
    WHERE ${DATE_RANGES[range]}
    ORDER BY created_at DESC
    LIMIT $1
  `, [limit])
  
  return result.rows
}

module.exports = { filterByDate }

/**
 * Supabase 到 PostgreSQL 数据迁移脚本
 * 用法: node scripts/migrate.js
 */
require('dotenv').config({ path: './backend/.env' })

const { createClient } = require('@supabase/supabase-js')
const { Pool } = require('pg')

// Supabase 配置
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// PostgreSQL 配置
const pgPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'fastinfo',
  user: process.env.DB_USER || 'fastinfo',
  password: process.env.DB_PASSWORD,
})

async function migrateArticles() {
  console.log('📦 开始迁移文章数据...')
  
  // 从 Supabase 获取所有文章
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error) {
    throw new Error(`Supabase 查询失败: ${error.message}`)
  }
  
  console.log(`📊 找到 ${articles.length} 篇文章`)
  
  // 批量插入到 PostgreSQL
  const client = await pgPool.connect()
  try {
    await client.query('BEGIN')
    
    let inserted = 0
    let skipped = 0
    
    for (const article of articles) {
      try {
        await client.query(`
          INSERT INTO articles (id, title, url, summary, ai_summary, source, category, quality_score, hot_score, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (url) DO NOTHING
        `, [
          article.id,
          article.title,
          article.url,
          article.summary,
          article.ai_summary,
          article.source,
          article.category || 'tech',
          article.quality_score || 0,
          article.hot_score || 0,
          article.created_at,
          article.updated_at || article.created_at
        ])
        inserted++
      } catch (err) {
        console.log(`⚠️ 跳过文章: ${article.title} - ${err.message}`)
        skipped++
      }
    }
    
    await client.query('COMMIT')
    console.log(`✅ 迁移完成: ${inserted} 篇插入, ${skipped} 篇跳过`)
    
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

async function verifyMigration() {
  console.log('\n🔍 验证迁移结果...')
  
  // Supabase 统计
  const { count: supabaseCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
  
  // PostgreSQL 统计
  const pgResult = await pgPool.query('SELECT COUNT(*) FROM articles')
  const pgCount = parseInt(pgResult.rows[0].count)
  
  console.log(`📊 Supabase: ${supabaseCount} 篇`)
  console.log(`📊 PostgreSQL: ${pgCount} 篇`)
  
  if (pgCount >= supabaseCount) {
    console.log('✅ 数据完整性验证通过')
  } else {
    console.log(`⚠️ 数据差异: ${supabaseCount - pgCount} 篇未迁移`)
  }
  
  // 分类统计
  const categoryResult = await pgPool.query(`
    SELECT category, COUNT(*) as count 
    FROM articles 
    GROUP BY category 
    ORDER BY count DESC
  `)
  console.log('\n📈 分类统计:')
  categoryResult.rows.forEach(row => {
    console.log(`  ${row.category}: ${row.count}`)
  })
}

async function main() {
  console.log('🚀 Fast Info 数据迁移工具\n')
  
  try {
    await migrateArticles()
    await verifyMigration()
  } catch (err) {
    console.error('❌ 迁移失败:', err.message)
    process.exit(1)
  } finally {
    await pgPool.end()
  }
  
  console.log('\n🎉 迁移完成!')
}

main()

/**
 * PostgreSQL 数据库连接层
 * 支持连接池、重试机制、健康检查
 */
const { Pool } = require('pg')

// 数据库配置
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'fastinfo',
  user: process.env.DB_USER || 'fastinfo',
  password: process.env.DB_PASSWORD || '',
  max: 10, // 最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
}

// 创建连接池
const pool = new Pool(config)

// 连接错误处理
pool.on('error', (err) => {
  console.error('Unexpected database error:', err)
})

/**
 * 指数退避重试
 */
async function withRetry(fn, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === maxRetries - 1) throw err
      const delay = Math.pow(2, i) * 1000
      console.log(`Database retry ${i + 1}/${maxRetries}, waiting ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

/**
 * 执行查询
 */
async function query(text, params) {
  return withRetry(async () => {
    const start = Date.now()
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    if (duration > 1000) {
      console.log('Slow query:', { text, duration, rows: result.rowCount })
    }
    return result
  })
}

/**
 * 获取单个连接（用于事务）
 */
async function getClient() {
  return withRetry(() => pool.connect())
}

/**
 * 健康检查
 */
async function healthCheck() {
  try {
    const result = await pool.query('SELECT NOW()')
    return { healthy: true, timestamp: result.rows[0].now }
  } catch (err) {
    return { healthy: false, error: err.message }
  }
}

/**
 * 关闭连接池
 */
async function close() {
  await pool.end()
}

module.exports = {
  query,
  getClient,
  healthCheck,
  close,
  pool
}

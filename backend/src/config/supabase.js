const { createClient } = require('@supabase/supabase-js')

/**
 * Supabase 客户端配置
 */

// 检查环境变量
if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable')
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable')
}

// 创建 Supabase 客户端
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false, // 服务端不需要持久化会话
      detectSessionInUrl: false
    }
  }
)

console.log('✅ Supabase client initialized')
console.log(`   URL: ${process.env.SUPABASE_URL}`)

module.exports = supabase

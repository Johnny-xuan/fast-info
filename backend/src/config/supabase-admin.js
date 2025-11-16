const { createClient } = require('@supabase/supabase-js')

/**
 * Supabase 管理员客户端配置
 * 使用 service_role key，拥有完全权限，绕过 RLS 策略
 *
 * ⚠️ 警告：此客户端仅用于后端爬虫和管理任务
 * 绝对不要在前端或公开 API 中暴露 service_role key
 */

// 检查环境变量
if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

// 创建 Supabase 管理员客户端
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
)

console.log('✅ Supabase Admin client initialized (service_role)')

module.exports = supabaseAdmin

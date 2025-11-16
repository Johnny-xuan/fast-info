const supabase = require('../config/supabase-admin')

/**
 * 数据清理工具
 * 自动删除过期数据
 */

/**
 * 删除超过指定小时数的文章
 * @param {number} hours - 保留小时数（默认48小时）
 * @returns {Promise<Object>} 删除结果
 */
async function cleanOldArticles(hours = 48) {
  try {
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - hours)

    console.log(`[Cleaner] Deleting articles older than ${hours} hours (before ${cutoffDate.toISOString()})`)

    const { data, error, count } = await supabase
      .from('articles')
      .delete({ count: 'exact' })
      .lt('created_at', cutoffDate.toISOString())

    if (error) {
      console.error('[Cleaner] Failed to delete old articles:', error)
      return { success: false, error: error.message, deleted: 0 }
    }

    console.log(`[Cleaner] Successfully deleted ${count || 0} old articles`)
    return { success: true, deleted: count || 0 }

  } catch (error) {
    console.error('[Cleaner] Error in cleanOldArticles:', error)
    return { success: false, error: error.message, deleted: 0 }
  }
}

/**
 * 清理重复的文章（基于URL）
 * 保留最新的，删除旧的
 */
async function cleanDuplicateArticles() {
  try {
    console.log('[Cleaner] Checking for duplicate articles...')

    // 查找重复的URL
    const { data: duplicates, error: queryError } = await supabase
      .rpc('find_duplicate_urls')

    if (queryError) {
      console.error('[Cleaner] Failed to find duplicates:', queryError)
      return { success: false, error: queryError.message, deleted: 0 }
    }

    // 如果没有重复，直接返回
    if (!duplicates || duplicates.length === 0) {
      console.log('[Cleaner] No duplicates found')
      return { success: true, deleted: 0 }
    }

    // TODO: 删除重复项（保留最新的）
    console.log(`[Cleaner] Found ${duplicates.length} duplicate URLs`)
    return { success: true, deleted: 0 }

  } catch (error) {
    console.error('[Cleaner] Error in cleanDuplicateArticles:', error)
    return { success: false, error: error.message, deleted: 0 }
  }
}

/**
 * 执行完整的清理流程
 */
async function runCleanup(options = {}) {
  const { retentionHours = 48 } = options

  console.log('\n' + '='.repeat(60))
  console.log(`[Cleaner] Starting cleanup at ${new Date().toISOString()}`)
  console.log('='.repeat(60))

  const results = {
    oldArticles: await cleanOldArticles(retentionHours),
    duplicates: await cleanDuplicateArticles()
  }

  console.log('\n' + '='.repeat(60))
  console.log('[Cleaner] Cleanup completed')
  console.log('='.repeat(60))
  console.log(`Old articles deleted: ${results.oldArticles.deleted}`)
  console.log(`Duplicates handled: ${results.duplicates.deleted}`)

  return results
}

module.exports = {
  cleanOldArticles,
  cleanDuplicateArticles,
  runCleanup
}

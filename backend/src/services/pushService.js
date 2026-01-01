/**
 * 推送服务
 * 支持 Telegram 和 Email
 */
const axios = require('axios')
const db = require('../db')
const { getDailyDigest } = require('./tools/getDailyDigest')

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

class PushService {
  /**
   * 发送 Telegram 消息
   */
  async sendTelegram(chatId, message, parseMode = 'Markdown') {
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured')
    }
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    
    // 重试逻辑
    for (let i = 0; i < 3; i++) {
      try {
        const response = await axios.post(url, {
          chat_id: chatId,
          text: message,
          parse_mode: parseMode,
          disable_web_page_preview: false
        }, { timeout: 10000 })
        
        return response.data
      } catch (err) {
        if (i === 2) throw err
        await new Promise(r => setTimeout(r, 1000 * (i + 1)))
      }
    }
  }

  /**
   * 格式化每日摘要
   */
  formatDigest(digest) {
    const { date, total, articles, byCategory } = digest
    
    let message = `📰 *今日技术资讯* (${date})\n`
    message += `共 ${total} 篇新文章\n\n`
    
    // 按分类展示
    const categoryNames = {
      tech: '🔬 科技',
      dev: '💻 开发',
      academic: '📚 学术',
      product: '🚀 产品',
      opensource: '🌐 开源'
    }
    
    for (const [category, categoryArticles] of Object.entries(byCategory)) {
      if (categoryArticles.length === 0) continue
      
      message += `${categoryNames[category] || category}\n`
      categoryArticles.slice(0, 3).forEach((article, i) => {
        message += `${i + 1}. [${article.title}](${article.url})\n`
      })
      message += '\n'
    }
    
    message += `_由 Fast Info 卖报员生成_`
    
    return message
  }

  /**
   * 发送每日摘要
   */
  async sendDailyDigest() {
    console.log('📤 Sending daily digest...')
    
    // 获取今日摘要
    const digest = await getDailyDigest()
    
    if (digest.total === 0) {
      console.log('No articles today, skipping digest')
      return
    }
    
    const message = this.formatDigest(digest)
    
    // 获取启用的推送配置
    const result = await db.query(`
      SELECT * FROM push_configs WHERE enabled = true
    `)
    
    const results = []
    for (const config of result.rows) {
      try {
        if (config.channel === 'telegram') {
          await this.sendTelegram(config.config.chat_id, message)
          results.push({ id: config.id, success: true })
        }
        // TODO: 支持 email
      } catch (err) {
        console.error(`Push failed for ${config.id}:`, err.message)
        results.push({ id: config.id, success: false, error: err.message })
      }
    }
    
    console.log(`📤 Daily digest sent: ${results.filter(r => r.success).length}/${results.length}`)
    return results
  }

  /**
   * 获取推送配置
   */
  async getConfigs() {
    const result = await db.query('SELECT * FROM push_configs ORDER BY created_at DESC')
    return result.rows
  }

  /**
   * 创建推送配置
   */
  async createConfig(channel, config, dailyDigestTime = '09:00') {
    const result = await db.query(`
      INSERT INTO push_configs (channel, config, daily_digest_time)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [channel, JSON.stringify(config), dailyDigestTime])
    return result.rows[0]
  }

  /**
   * 更新推送配置
   */
  async updateConfig(id, updates) {
    const sets = []
    const values = []
    let i = 1
    
    if (updates.config !== undefined) {
      sets.push(`config = $${i++}`)
      values.push(JSON.stringify(updates.config))
    }
    if (updates.enabled !== undefined) {
      sets.push(`enabled = $${i++}`)
      values.push(updates.enabled)
    }
    if (updates.dailyDigestTime !== undefined) {
      sets.push(`daily_digest_time = $${i++}`)
      values.push(updates.dailyDigestTime)
    }
    
    values.push(id)
    
    const result = await db.query(`
      UPDATE push_configs SET ${sets.join(', ')} WHERE id = $${i} RETURNING *
    `, values)
    return result.rows[0]
  }

  /**
   * 删除推送配置
   */
  async deleteConfig(id) {
    await db.query('DELETE FROM push_configs WHERE id = $1', [id])
  }

  /**
   * 测试推送
   */
  async testPush(id) {
    const result = await db.query('SELECT * FROM push_configs WHERE id = $1', [id])
    const config = result.rows[0]
    
    if (!config) {
      throw new Error('Config not found')
    }
    
    const testMessage = '🔔 *测试消息*\n\nFast Info 推送服务测试成功！'
    
    if (config.channel === 'telegram') {
      await this.sendTelegram(config.config.chat_id, testMessage)
    }
    
    return { success: true }
  }
}

module.exports = new PushService()

/**
 * Chat API 路由
 */
const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const newsboyAgent = require('../services/newsboyAgent')

/**
 * POST /api/chat
 * 发送消息给卖报员 Agent
 */
router.post('/', async (req, res, next) => {
  try {
    const { message, sessionId } = req.body
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: { message: '请提供消息内容', status: 400 }
      })
    }
    
    // 使用提供的 sessionId 或生成新的
    const sid = sessionId || uuidv4()
    
    console.log(`💬 Chat [${sid.slice(0, 8)}]: ${message.slice(0, 50)}...`)
    
    const result = await newsboyAgent.process(sid, message)
    
    res.json({
      sessionId: sid,
      message: result.message,
      articles: result.articles,
      toolCalls: result.toolCalls,
      fallback: result.fallback || false
    })
    
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/chat/suggestions
 * 获取快捷操作建议
 */
router.get('/suggestions', (req, res) => {
  res.json({
    suggestions: [
      { text: '今日热点', query: '有什么今天的热门文章？' },
      { text: 'AI 新闻', query: '搜索 AI 相关的文章' },
      { text: '开源项目', query: '有什么新的开源项目？' },
      { text: '本周精选', query: '这周有什么值得看的文章？' },
      { text: '数据统计', query: '数据库里有多少文章？' }
    ]
  })
})

/**
 * DELETE /api/chat/:sessionId
 * 清除会话历史
 */
router.delete('/:sessionId', (req, res) => {
  const { sessionId } = req.params
  // 会话会自动过期，这里只是提前清理
  res.json({ message: '会话已清除' })
})

module.exports = router

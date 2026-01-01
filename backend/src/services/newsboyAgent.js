/**
 * 卖报员 Agent - 核心逻辑
 * 使用豆包大模型的 Function Calling 能力
 */
const axios = require('axios')
const db = require('../db')
const { toolDefinitions, toolExecutors } = require('./tools')

const DOUBAO_API_BASE = process.env.DOUBAO_API_BASE || 'https://ark.cn-beijing.volces.com/api/v3'
const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY
const DOUBAO_MODEL = process.env.DOUBAO_MODEL

const SYSTEM_PROMPT = `你是"卖报员"，一个专业的技术资讯助手。你的职责是：
1. 理解用户的信息需求
2. 使用工具从文章数据库中检索相关内容
3. 以友好、专业的方式推荐文章

你可以使用以下工具：
- search_articles: 搜索文章
- filter_by_category: 按分类筛选（tech/dev/academic/product/opensource）
- filter_by_date: 按时间筛选（today/week/month）
- filter_by_source: 按来源筛选
- get_trending: 获取热门文章
- get_daily_digest: 获取今日摘要
- get_stats: 获取统计信息

回复规则：
- 使用中文回复
- 推荐文章时，简要说明推荐理由
- 如果没找到相关文章，建议用户尝试其他关键词
- 保持友好、专业的语气`

class NewsboyAgent {
  constructor() {
    this.sessions = new Map() // 会话上下文缓存
  }

  /**
   * 获取或创建会话
   */
  getSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        messages: [{ role: 'system', content: SYSTEM_PROMPT }],
        createdAt: new Date()
      })
    }
    return this.sessions.get(sessionId)
  }

  /**
   * 保存对话到数据库
   */
  async saveConversation(sessionId, role, content, toolCalls = null) {
    try {
      await db.query(`
        INSERT INTO conversations (session_id, role, content, tool_calls)
        VALUES ($1, $2, $3, $4)
      `, [sessionId, role, content, toolCalls ? JSON.stringify(toolCalls) : null])
    } catch (err) {
      console.error('Failed to save conversation:', err.message)
    }
  }

  /**
   * 调用豆包大模型
   */
  async callLLM(messages, tools = null) {
    const payload = {
      model: DOUBAO_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2000
    }
    
    if (tools && tools.length > 0) {
      payload.tools = tools
      payload.tool_choice = 'auto'
    }

    const response = await axios.post(
      `${DOUBAO_API_BASE}/chat/completions`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${DOUBAO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )

    return response.data.choices[0].message
  }

  /**
   * 执行工具调用
   */
  async executeTool(toolCall) {
    const { name, arguments: argsStr } = toolCall.function
    const args = JSON.parse(argsStr)
    
    console.log(`🔧 Executing tool: ${name}`, args)
    
    const executor = toolExecutors[name]
    if (!executor) {
      throw new Error(`Unknown tool: ${name}`)
    }
    
    const result = await executor(args)
    return result
  }

  /**
   * 处理用户消息
   */
  async process(sessionId, userMessage) {
    const session = this.getSession(sessionId)
    
    // 添加用户消息
    session.messages.push({ role: 'user', content: userMessage })
    await this.saveConversation(sessionId, 'user', userMessage)
    
    try {
      // 第一次调用 LLM
      let response = await this.callLLM(session.messages, toolDefinitions)
      
      // 处理工具调用
      const toolResults = []
      while (response.tool_calls && response.tool_calls.length > 0) {
        // 添加助手消息（包含工具调用）
        session.messages.push(response)
        
        // 执行所有工具调用
        for (const toolCall of response.tool_calls) {
          try {
            const result = await this.executeTool(toolCall)
            toolResults.push({
              name: toolCall.function.name,
              result
            })
            
            // 添加工具结果
            session.messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(result)
            })
          } catch (err) {
            session.messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ error: err.message })
            })
          }
        }
        
        // 再次调用 LLM 获取最终回复
        response = await this.callLLM(session.messages, toolDefinitions)
      }
      
      // 添加最终回复
      const assistantMessage = response.content
      session.messages.push({ role: 'assistant', content: assistantMessage })
      await this.saveConversation(sessionId, 'assistant', assistantMessage, toolResults)
      
      // 提取文章列表
      const articles = this.extractArticles(toolResults)
      
      return {
        message: assistantMessage,
        articles,
        toolCalls: toolResults
      }
      
    } catch (err) {
      console.error('Agent error:', err)
      
      // 降级处理：简单关键词搜索
      return this.fallbackSearch(userMessage)
    }
  }

  /**
   * 从工具结果中提取文章
   */
  extractArticles(toolResults) {
    const articles = []
    for (const result of toolResults) {
      if (Array.isArray(result.result)) {
        articles.push(...result.result)
      } else if (result.result?.articles) {
        articles.push(...result.result.articles)
      }
    }
    // 去重
    const seen = new Set()
    return articles.filter(a => {
      if (seen.has(a.id)) return false
      seen.add(a.id)
      return true
    })
  }

  /**
   * 降级搜索
   */
  async fallbackSearch(message) {
    const { searchArticles } = require('./tools')
    
    // 提取关键词
    const keywords = message
      .replace(/[？?！!。，,]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1)
      .slice(0, 3)
      .join(' ')
    
    const articles = await searchArticles(keywords || message, 10)
    
    return {
      message: articles.length > 0 
        ? `找到 ${articles.length} 篇相关文章：`
        : '抱歉，没有找到相关文章。请尝试其他关键词。',
      articles,
      toolCalls: [{ name: 'search_articles', result: articles }],
      fallback: true
    }
  }

  /**
   * 清理过期会话
   */
  cleanupSessions(maxAge = 3600000) { // 默认1小时
    const now = Date.now()
    for (const [sessionId, session] of this.sessions) {
      if (now - session.createdAt.getTime() > maxAge) {
        this.sessions.delete(sessionId)
      }
    }
  }
}

// 单例
const agent = new NewsboyAgent()

// 定期清理会话
setInterval(() => agent.cleanupSessions(), 600000) // 每10分钟

module.exports = agent

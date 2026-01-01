/**
 * Newsboy Agent 单元测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}))

// Mock db
vi.mock('../src/db', () => ({
  default: {
    query: vi.fn().mockResolvedValue({ rows: [] })
  }
}))

// Mock tools
vi.mock('../src/services/tools', () => ({
  toolDefinitions: [
    {
      type: 'function',
      function: {
        name: 'search_articles',
        description: 'Search articles',
        parameters: { type: 'object', properties: {} }
      }
    }
  ],
  toolExecutors: {
    search_articles: vi.fn().mockResolvedValue([])
  }
}))

import axios from 'axios'
import { toolExecutors } from '../src/services/tools'

describe('NewsboyAgent', () => {
  let agent

  beforeEach(async () => {
    vi.clearAllMocks()
    // 重新导入以获取新实例
    const module = await import('../src/services/newsboyAgent')
    agent = module.default
  })

  describe('Session Management', () => {
    it('should create new session', () => {
      const session = agent.getSession('test-session-1')
      
      expect(session).toBeDefined()
      expect(session.messages).toHaveLength(1) // system prompt
      expect(session.messages[0].role).toBe('system')
    })

    it('should reuse existing session', () => {
      const session1 = agent.getSession('test-session-2')
      session1.messages.push({ role: 'user', content: 'test' })
      
      const session2 = agent.getSession('test-session-2')
      
      expect(session2.messages).toHaveLength(2)
    })

    it('should cleanup expired sessions', () => {
      const session = agent.getSession('old-session')
      session.createdAt = new Date(Date.now() - 7200000) // 2 hours ago
      
      agent.cleanupSessions(3600000) // 1 hour max age
      
      expect(agent.sessions.has('old-session')).toBe(false)
    })
  })

  describe('LLM Integration', () => {
    it('should call LLM with correct parameters', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: { content: 'Test response' }
          }]
        }
      })

      const result = await agent.process('session-llm', 'Hello')

      expect(axios.post).toHaveBeenCalled()
      expect(result).toHaveProperty('message')
    })

    it('should handle tool calls', async () => {
      // First call returns tool call
      axios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: {
              tool_calls: [{
                id: 'call_1',
                function: {
                  name: 'search_articles',
                  arguments: '{"query":"AI"}'
                }
              }]
            }
          }]
        }
      })

      // Second call returns final response
      axios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: { content: '找到以下文章' }
          }]
        }
      })

      toolExecutors.search_articles.mockResolvedValueOnce([
        { id: '1', title: 'AI Article' }
      ])

      const result = await agent.process('session-tool', '搜索 AI')

      expect(toolExecutors.search_articles).toHaveBeenCalled()
      expect(result.toolCalls).toHaveLength(1)
    })
  })

  describe('Fallback Search', () => {
    it('should fallback when LLM fails', async () => {
      axios.post.mockRejectedValueOnce(new Error('API Error'))

      const result = await agent.process('session-fallback', '搜索文章')

      expect(result).toHaveProperty('fallback', true)
      expect(result).toHaveProperty('message')
    })
  })

  describe('Article Extraction', () => {
    it('should extract articles from tool results', () => {
      const toolResults = [
        { name: 'search_articles', result: [{ id: '1' }, { id: '2' }] },
        { name: 'get_trending', result: [{ id: '2' }, { id: '3' }] }
      ]

      const articles = agent.extractArticles(toolResults)

      // Should deduplicate
      expect(articles).toHaveLength(3)
    })

    it('should handle nested article results', () => {
      const toolResults = [
        { name: 'get_daily_digest', result: { articles: [{ id: '1' }] } }
      ]

      const articles = agent.extractArticles(toolResults)

      expect(articles).toHaveLength(1)
    })
  })
})

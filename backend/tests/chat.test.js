/**
 * Chat API 单元测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

// Mock newsboyAgent
vi.mock('../src/services/newsboyAgent', () => ({
  default: {
    process: vi.fn()
  }
}))

import agent from '../src/services/newsboyAgent'

// 创建测试 app
const createApp = async () => {
  const app = express()
  app.use(express.json())
  const chatRoutes = (await import('../src/routes/chat')).default
  app.use('/api/chat', chatRoutes)
  return app
}

describe('Chat API', () => {
  let app

  beforeEach(async () => {
    app = await createApp()
    vi.clearAllMocks()
  })

  describe('POST /api/chat', () => {
    it('should process chat message', async () => {
      agent.process.mockResolvedValueOnce({
        message: '找到以下文章：',
        articles: [{ id: '1', title: 'Test Article' }],
        toolCalls: []
      })

      const res = await request(app)
        .post('/api/chat')
        .send({ message: '搜索 AI 文章' })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('message')
      expect(res.body).toHaveProperty('articles')
      expect(res.body).toHaveProperty('sessionId')
    })

    it('should return 400 when message is missing', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({})

      expect(res.status).toBe(400)
      expect(res.body.error).toBeDefined()
    })

    it('should maintain session context', async () => {
      agent.process.mockResolvedValue({
        message: 'Response',
        articles: [],
        toolCalls: []
      })

      const res1 = await request(app)
        .post('/api/chat')
        .send({ message: 'First message' })

      const sessionId = res1.body.sessionId

      const res2 = await request(app)
        .post('/api/chat')
        .send({ message: 'Second message', sessionId })

      expect(res2.body.sessionId).toBe(sessionId)
      expect(agent.process).toHaveBeenCalledTimes(2)
    })

    it('should handle agent errors gracefully', async () => {
      agent.process.mockRejectedValueOnce(new Error('Agent error'))

      const res = await request(app)
        .post('/api/chat')
        .send({ message: 'Test' })

      expect(res.status).toBe(500)
    })
  })

  describe('GET /api/chat/suggestions', () => {
    it('should return quick action suggestions', async () => {
      const res = await request(app)
        .get('/api/chat/suggestions')

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('suggestions')
      expect(Array.isArray(res.body.suggestions)).toBe(true)
      expect(res.body.suggestions.length).toBeGreaterThan(0)
    })
  })
})

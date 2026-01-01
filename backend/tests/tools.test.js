/**
 * Agent 工具单元测试
 * 运行: npm test
 */
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'

// Mock 数据库
vi.mock('../src/db', () => ({
  default: {
    query: vi.fn()
  }
}))

import db from '../src/db'

// 导入工具
const mockArticles = [
  {
    id: '1',
    title: 'Vue 3.5 发布',
    url: 'https://example.com/vue',
    source: 'devto',
    category: 'dev',
    hot_score: 100,
    created_at: new Date()
  },
  {
    id: '2',
    title: 'GPT-5 新功能',
    url: 'https://example.com/gpt',
    source: 'hackernews',
    category: 'tech',
    hot_score: 200,
    created_at: new Date()
  }
]

describe('Agent Tools', () => {
  beforeAll(() => {
    // 设置默认 mock 返回
    db.query.mockResolvedValue({ rows: mockArticles })
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  describe('searchArticles', () => {
    it('should search articles by keyword', async () => {
      const { searchArticles } = await import('../src/services/tools/searchArticles')
      
      db.query.mockResolvedValueOnce({ rows: [mockArticles[0]] })
      
      const results = await searchArticles('Vue', 10)
      
      expect(db.query).toHaveBeenCalled()
      expect(results).toHaveLength(1)
      expect(results[0].title).toContain('Vue')
    })

    it('should return empty array when no results', async () => {
      const { searchArticles } = await import('../src/services/tools/searchArticles')
      
      db.query.mockResolvedValueOnce({ rows: [] })
      
      const results = await searchArticles('nonexistent', 10)
      
      expect(results).toHaveLength(0)
    })
  })

  describe('filterByCategory', () => {
    it('should filter articles by category', async () => {
      const { filterByCategory } = await import('../src/services/tools/filterByCategory')
      
      db.query.mockResolvedValueOnce({ rows: [mockArticles[0]] })
      
      const results = await filterByCategory('dev', 10)
      
      expect(db.query).toHaveBeenCalled()
      expect(results.every(a => a.category === 'dev')).toBe(true)
    })

    it('should validate category enum', async () => {
      const { filterByCategory } = await import('../src/services/tools/filterByCategory')
      
      await expect(filterByCategory('invalid', 10)).rejects.toThrow()
    })
  })

  describe('filterByDate', () => {
    it('should filter articles by date range', async () => {
      const { filterByDate } = await import('../src/services/tools/filterByDate')
      
      db.query.mockResolvedValueOnce({ rows: mockArticles })
      
      const results = await filterByDate('today', 10)
      
      expect(db.query).toHaveBeenCalled()
      expect(Array.isArray(results)).toBe(true)
    })

    it('should support week and month ranges', async () => {
      const { filterByDate } = await import('../src/services/tools/filterByDate')
      
      db.query.mockResolvedValue({ rows: mockArticles })
      
      await filterByDate('week', 10)
      await filterByDate('month', 10)
      
      expect(db.query).toHaveBeenCalledTimes(2)
    })
  })

  describe('filterBySource', () => {
    it('should filter articles by source', async () => {
      const { filterBySource } = await import('../src/services/tools/filterBySource')
      
      db.query.mockResolvedValueOnce({ rows: [mockArticles[1]] })
      
      const results = await filterBySource('hackernews', 10)
      
      expect(results.every(a => a.source === 'hackernews')).toBe(true)
    })
  })

  describe('getTrending', () => {
    it('should return articles sorted by hot_score', async () => {
      const { getTrending } = await import('../src/services/tools/getTrending')
      
      const sorted = [...mockArticles].sort((a, b) => b.hot_score - a.hot_score)
      db.query.mockResolvedValueOnce({ rows: sorted })
      
      const results = await getTrending(10)
      
      expect(results).toHaveLength(2)
      // 验证降序排列
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].hot_score).toBeGreaterThanOrEqual(results[i].hot_score)
      }
    })
  })

  describe('getDailyDigest', () => {
    it('should return today articles with summary', async () => {
      const { getDailyDigest } = await import('../src/services/tools/getDailyDigest')
      
      db.query.mockResolvedValueOnce({ rows: mockArticles })
      
      const result = await getDailyDigest()
      
      expect(result).toHaveProperty('date')
      expect(result).toHaveProperty('articles')
      expect(result).toHaveProperty('total')
    })
  })

  describe('getStats', () => {
    it('should return database statistics', async () => {
      const { getStats } = await import('../src/services/tools/getStats')
      
      db.query
        .mockResolvedValueOnce({ rows: [{ count: '100' }] })
        .mockResolvedValueOnce({ rows: [{ category: 'tech', count: '50' }] })
        .mockResolvedValueOnce({ rows: [{ source: 'hackernews', count: '30' }] })
      
      const stats = await getStats()
      
      expect(stats).toHaveProperty('total')
      expect(stats).toHaveProperty('by_category')
      expect(stats).toHaveProperty('by_source')
    })
  })
})

describe('Tool Definitions', () => {
  it('should export valid tool definitions', async () => {
    const { toolDefinitions } = await import('../src/services/tools')
    
    expect(Array.isArray(toolDefinitions)).toBe(true)
    expect(toolDefinitions.length).toBeGreaterThan(0)
    
    toolDefinitions.forEach(tool => {
      expect(tool).toHaveProperty('type', 'function')
      expect(tool.function).toHaveProperty('name')
      expect(tool.function).toHaveProperty('description')
      expect(tool.function).toHaveProperty('parameters')
    })
  })

  it('should export tool executors', async () => {
    const { toolExecutors } = await import('../src/services/tools')
    
    expect(typeof toolExecutors).toBe('object')
    expect(toolExecutors).toHaveProperty('search_articles')
    expect(toolExecutors).toHaveProperty('filter_by_category')
    expect(toolExecutors).toHaveProperty('get_trending')
  })
})

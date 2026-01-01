/**
 * Agent 工具集合
 */
const { searchArticles } = require('./searchArticles')
const { filterByCategory, VALID_CATEGORIES } = require('./filterByCategory')
const { filterByDate } = require('./filterByDate')
const { filterBySource, getSources } = require('./filterBySource')
const { getTrending } = require('./getTrending')
const { getDailyDigest } = require('./getDailyDigest')
const { getStats } = require('./getStats')

// 工具定义（用于 Function Calling）
const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "search_articles",
      description: "搜索文章，支持关键词匹配标题、摘要",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "搜索关键词" },
          limit: { type: "number", description: "返回数量，默认10" }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "filter_by_category",
      description: "按分类筛选文章",
      parameters: {
        type: "object",
        properties: {
          category: { 
            type: "string", 
            enum: VALID_CATEGORIES,
            description: "文章分类"
          },
          limit: { type: "number", description: "返回数量，默认10" }
        },
        required: ["category"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "filter_by_date",
      description: "按时间筛选文章",
      parameters: {
        type: "object",
        properties: {
          range: { 
            type: "string", 
            enum: ["today", "week", "month"],
            description: "时间范围"
          },
          limit: { type: "number", description: "返回数量，默认10" }
        },
        required: ["range"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "filter_by_source",
      description: "按来源筛选文章（如 hackernews, github, devto 等）",
      parameters: {
        type: "object",
        properties: {
          source: { type: "string", description: "文章来源" },
          limit: { type: "number", description: "返回数量，默认10" }
        },
        required: ["source"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_trending",
      description: "获取热门文章，按热度排序",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "返回数量，默认10" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_daily_digest",
      description: "获取今日资讯摘要",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_stats",
      description: "获取数据库统计信息，包括文章总数、分类分布、来源分布等",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  }
]

// 工具执行器
const toolExecutors = {
  search_articles: async (args) => searchArticles(args.query, args.limit),
  filter_by_category: async (args) => filterByCategory(args.category, args.limit),
  filter_by_date: async (args) => filterByDate(args.range, args.limit),
  filter_by_source: async (args) => filterBySource(args.source, args.limit),
  get_trending: async (args) => getTrending(args.limit),
  get_daily_digest: async () => getDailyDigest(),
  get_stats: async () => getStats()
}

module.exports = {
  toolDefinitions,
  toolExecutors,
  searchArticles,
  filterByCategory,
  filterByDate,
  filterBySource,
  getTrending,
  getDailyDigest,
  getStats,
  getSources,
  VALID_CATEGORIES
}

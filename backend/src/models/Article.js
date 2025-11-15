const mongoose = require('mongoose')

/**
 * 文章数据模型
 * 用于存储从各个数据源爬取的文章信息
 */
const articleSchema = new mongoose.Schema({
  // 标题
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [500, 'Title cannot exceed 500 characters']
  },

  // 摘要
  summary: {
    type: String,
    trim: true,
    maxlength: [2000, 'Summary cannot exceed 2000 characters']
  },

  // 原文链接
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true
  },

  // 封面图
  cover: {
    type: String,
    trim: true,
    default: null
  },

  // 来源
  source: {
    type: String,
    required: [true, 'Source is required'],
    enum: ['GitHub Trending', 'Hacker News', 'Dev.to', '掘金', 'V2EX', '少数派', 'IT之家', 'arXiv', '36氪', 'CSDN'],
    index: true
  },

  // 分类
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['tech', 'dev', 'academic'],
    index: true
  },

  // 标签
  tags: [{
    type: String,
    trim: true
  }],

  // 作者
  author: {
    type: String,
    trim: true,
    default: null
  },

  // 发布时间
  publishedAt: {
    type: Date,
    default: null,
    index: true
  },

  // 热度分数（用于排序）
  hotScore: {
    type: Number,
    default: 0,
    index: true
  },

  // 质量分数（用于筛选）
  qualityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // 阅读数（如果来源提供）
  views: {
    type: Number,
    default: 0
  },

  // 点赞数（如果来源提供）
  likes: {
    type: Number,
    default: 0
  },

  // 评论数（如果来源提供）
  comments: {
    type: Number,
    default: 0
  },

  // 是否置顶
  isPinned: {
    type: Boolean,
    default: false,
    index: true
  },

  // 是否已发布（用于审核）
  isPublished: {
    type: Boolean,
    default: true,
    index: true
  },

  // 爬取时间
  crawledAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  // 额外数据（JSON）
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true, // 自动添加 createdAt 和 updatedAt
  collection: 'articles'
})

// 复合索引 - 用于常见查询
articleSchema.index({ category: 1, publishedAt: -1 })
articleSchema.index({ category: 1, hotScore: -1 })
articleSchema.index({ source: 1, crawledAt: -1 })
articleSchema.index({ isPublished: 1, category: 1, createdAt: -1 })

// URL 唯一性索引（防止重复爬取）
articleSchema.index({ url: 1 }, { unique: true })

// 虚拟字段：相对时间
articleSchema.virtual('relativeTime').get(function() {
  const publishDate = this.publishedAt || this.createdAt
  if (!publishDate) return '未知时间'

  const now = new Date()
  const diff = now - publishDate
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return publishDate.toLocaleDateString('zh-CN')
})

// 实例方法：计算热度分数
articleSchema.methods.calculateHotScore = function() {
  const age = Date.now() - (this.publishedAt || this.createdAt)
  const ageHours = age / 3600000

  // 威尔逊算法简化版
  const score = (this.likes * 2 + this.views * 0.01 + this.comments * 5) / Math.pow(ageHours + 2, 1.8)

  this.hotScore = Math.round(score * 100) / 100
  return this.hotScore
}

// 静态方法：获取热门文章
articleSchema.statics.getHotArticles = function(category, limit = 20) {
  const query = { isPublished: true }
  if (category && category !== 'all') {
    query.category = category
  }

  return this.find(query)
    .sort({ hotScore: -1, createdAt: -1 })
    .limit(limit)
    .select('-metadata')
}

// 静态方法：获取最新文章
articleSchema.statics.getLatestArticles = function(category, limit = 20) {
  const query = { isPublished: true }
  if (category && category !== 'all') {
    query.category = category
  }

  return this.find(query)
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(limit)
    .select('-metadata')
}

// 在保存前自动计算热度分数
articleSchema.pre('save', function(next) {
  if (this.isModified('likes') || this.isModified('views') || this.isModified('comments')) {
    this.calculateHotScore()
  }
  next()
})

const Article = mongoose.model('Article', articleSchema)

module.exports = Article

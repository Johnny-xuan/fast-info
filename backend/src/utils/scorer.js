/**
 * 文章质量评分和热度评分工具
 */

/**
 * 数据源权重配置
 * 基于源的可靠性和内容质量
 */
const SOURCE_WEIGHTS = {
  'GitHub Trending': 10,
  'Hacker News': 10,
  'arXiv': 10,
  'Dev.to': 8,
  '掘金': 7,
  'V2EX': 7,
  '少数派': 8,
  'IT之家': 6,
  '36氪': 6,
  'CSDN': 5
}

/**
 * 标题黑名单关键词（降低质量分）
 * 用于识别标题党和低质量内容
 */
const CLICKBAIT_KEYWORDS = [
  '震惊', '必看', '火爆', '疯传', '刷屏',
  '惊呆', '炸了', '轰动', '必读', '速看',
  'shocking', 'unbelievable', 'you won\'t believe'
]

/**
 * 计算文章质量分数
 * @param {Object} article - 文章对象
 * @returns {number} 0-100 的质量分数
 */
function calculateQualityScore(article) {
  let score = 50 // 基础分数

  // 1. 来源权重 (+5 ~ +10)
  const sourceWeight = SOURCE_WEIGHTS[article.source] || 5
  score += sourceWeight

  // 2. 标题质量
  if (article.title) {
    // 检测标题党 (-20)
    const hasClickbait = CLICKBAIT_KEYWORDS.some(keyword =>
      article.title.toLowerCase().includes(keyword.toLowerCase())
    )
    if (hasClickbait) {
      score -= 20
    }

    // 标题长度适中 (+5)
    const titleLength = article.title.length
    if (titleLength >= 10 && titleLength <= 100) {
      score += 5
    }
  }

  // 3. 内容完整性
  if (article.summary) {
    // 有摘要且足够长 (+10)
    if (article.summary.length > 50) {
      score += 10
    }
    // 摘要太短 (+5)
    else if (article.summary.length > 20) {
      score += 5
    }
  }

  // 4. 互动指标
  const likes = article.likes || 0
  const comments = article.comments || 0
  const views = article.views || 0

  // 点赞数 (0-10分)
  if (likes > 500) score += 10
  else if (likes > 100) score += 8
  else if (likes > 50) score += 5
  else if (likes > 10) score += 3

  // 评论数 (0-10分)
  if (comments > 100) score += 10
  else if (comments > 20) score += 6
  else if (comments > 5) score += 3

  // 浏览数 (0-5分)
  if (views > 10000) score += 5
  else if (views > 1000) score += 3
  else if (views > 100) score += 1

  // 5. 作者信息 (+5)
  if (article.author && article.author.trim().length > 0) {
    score += 5
  }

  // 确保分数在 0-100 范围内
  return Math.min(100, Math.max(0, Math.round(score)))
}

/**
 * 计算文章热度分数
 * 使用类似 Hacker News 的算法，考虑时间衰减
 *
 * 公式：(likes * 2 + views * 0.01 + comments * 5) / (hours_age + 2)^1.8
 *
 * @param {Object} article - 文章对象
 * @returns {number} 热度分数（保留2位小数）
 */
function calculateHotScore(article) {
  const now = new Date()
  const publishedAt = article.published_at ? new Date(article.published_at) : new Date(article.crawled_at)

  // 计算文章年龄（小时）
  const ageHours = (now - publishedAt) / (1000 * 60 * 60)

  // 互动指标
  const likes = article.likes || 0
  const comments = article.comments || 0
  const views = article.views || 0

  // 计算原始分数
  const rawScore = (likes * 2) + (views * 0.01) + (comments * 5)

  // 应用时间衰减（越新的文章权重越高）
  // +2 防止除零，1.8 是衰减指数
  const hotScore = rawScore / Math.pow(ageHours + 2, 1.8)

  // 保留2位小数
  return Math.round(hotScore * 100) / 100
}

/**
 * 批量计算文章分数
 * @param {Array} articles - 文章数组
 * @returns {Array} 包含分数的文章数组
 */
function scoreArticles(articles) {
  return articles.map(article => ({
    ...article,
    quality_score: calculateQualityScore(article),
    hot_score: calculateHotScore(article)
  }))
}

module.exports = {
  calculateQualityScore,
  calculateHotScore,
  scoreArticles,
  SOURCE_WEIGHTS,
  CLICKBAIT_KEYWORDS
}

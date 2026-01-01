/**
 * 自动分类工具
 * 根据标题、摘要和来源自动判断文章分类
 */

/**
 * 分类关键词配置
 */
const CATEGORY_KEYWORDS = {
  tech: [
    // 中文科技关键词
    'AI', '人工智能', '机器学习', '深度学习', '大模型',
    '芯片', '半导体', '量子', '5G', '6G',
    '苹果', '特斯拉', '谷歌', '微软', 'OpenAI',
    '新能源', '电动车', '自动驾驶', '元宇宙',
    '区块链', '加密货币', '比特币', 'Web3',
    '智能硬件', '物联网', 'IoT', '可穿戴',
    '科技公司', '融资', '上市', 'IPO',
    // 英文科技关键词
    'artificial intelligence', 'machine learning', 'deep learning',
    'quantum', 'semiconductor', 'chip', 'tesla',
    'autonomous', 'blockchain', 'crypto', 'metaverse',
    'iot', 'wearable', 'startup', 'funding'
  ],

  dev: [
    // 中文开发关键词
    '编程', '代码', '开发', '程序员', '工程师',
    'JavaScript', 'Python', 'Java', 'Go', 'Rust', 'C++',
    'React', 'Vue', 'Angular', 'Node.js', 'TypeScript',
    'Docker', 'Kubernetes', 'DevOps', 'CI/CD',
    '前端', '后端', '全栈', '架构', '微服务',
    'API', '数据库', 'SQL', 'NoSQL', 'Redis',
    'Git', 'Linux', 'MacOS',
    '算法', '数据结构', '设计模式', '性能优化',
    '测试', '调试', 'bug', '框架', '库',
    // 英文开发关键词
    'programming', 'coding', 'developer', 'engineer',
    'framework', 'library', 'api', 'database',
    'frontend', 'backend', 'fullstack', 'architecture',
    'microservices', 'devops',
    'algorithm', 'data structure', 'performance',
    'testing', 'debugging', 'tutorial', 'guide'
  ],

  opensource: [
    // 中文开源关键词
    '开源', '仓库', '项目', 'GitHub', 'GitLab',
    'Star', 'Fork', 'Pull Request', 'Issue',
    '贡献者', '许可证', 'MIT', 'Apache', 'GPL',
    '开源社区', '开源项目',
    // 英文开源关键词
    'opensource', 'open source', 'open-source',
    'repository', 'repo', 'github', 'gitlab',
    'star', 'fork', 'contributor', 'contributors',
    'license', 'mit', 'apache', 'gpl',
    'pull request', 'issue', 'commit',
    'trending', 'awesome'
  ],

  academic: [
    // 中文学术关键词
    '论文', '研究', '学术', '期刊', '会议',
    '科研', '实验', '理论', '方法论', '模型',
    '大学', '实验室', '教授', '博士', '硕士',
    '自然', '科学', 'Nature', 'Science', 'Cell',
    'arXiv', 'IEEE', 'ACM', 'NeurIPS', 'CVPR',
    '医学', '生物', '物理', '化学', '数学',
    '计算机科学', '认知科学', '神经科学',
    // 英文学术关键词
    'paper', 'research', 'study', 'journal', 'conference',
    'experiment', 'theory', 'methodology', 'model',
    'university', 'laboratory', 'professor', 'phd',
    'publication', 'peer review', 'citation',
    'medicine', 'biology', 'physics', 'chemistry',
    'mathematics', 'computer science', 'neuroscience'
  ],

  product: [
    // 中文产品关键词
    '产品', '工具', '应用', 'App', '软件',
    '发布', '上线', '推出', '新品', '更新',
    'AI工具', 'AI助手', 'AI应用',
    '免费', '付费', '订阅', '定价',
    '功能', '特性', '体验', '测试版',
    // 英文产品关键词
    'product', 'tool', 'app', 'application', 'software',
    'launch', 'release', 'new', 'update', 'version',
    'free', 'paid', 'pricing', 'subscription',
    'feature', 'beta', 'saas', 'platform',
    'ai tool', 'ai assistant', 'ai app'
  ]
}

/**
 * 数据源默认分类映射
 * 如果无法通过关键词判断，则使用数据源的默认分类
 */
const SOURCE_DEFAULT_CATEGORY = {
  'GitHub Trending': 'opensource',
  'Hacker News': 'tech',
  'Dev.to': 'dev',
  '掘金': 'dev',
  'V2EX': 'tech',
  '少数派': 'tech',
  'IT之家': 'tech',
  'arXiv': 'academic',
  'AIBase': 'product',
  'Product Hunt': 'product',
  '36氪': 'tech',
  'CSDN': 'dev'
}

/**
 * 自动判断文章分类
 * @param {Object} article - 文章对象 {title, summary, source}
 * @returns {string} 分类：'tech', 'dev', 'opensource', 或 'academic'
 */
function categorizeArticle(article) {
  const { title = '', summary = '', source = '' } = article

  // 合并标题和摘要用于匹配
  const text = `${title} ${summary}`.toLowerCase()

  // 统计每个分类的关键词匹配次数
  const scores = {
    tech: 0,
    dev: 0,
    opensource: 0,
    academic: 0,
    product: 0
  }

  // 遍历每个分类的关键词
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        scores[category]++
      }
    }
  }

  // 找到得分最高的分类
  const maxScore = Math.max(...Object.values(scores))

  // 如果有明确的关键词匹配
  if (maxScore > 0) {
    // 返回得分最高的分类
    const topCategory = Object.entries(scores).find(([_, score]) => score === maxScore)
    return topCategory[0]
  }

  // 如果没有关键词匹配，使用数据源的默认分类
  return SOURCE_DEFAULT_CATEGORY[source] || 'tech'
}

/**
 * 批量分类文章
 * @param {Array} articles - 文章数组
 * @returns {Array} 包含分类的文章数组
 */
function categorizeArticles(articles) {
  return articles.map(article => ({
    ...article,
    category: categorizeArticle(article)
  }))
}

/**
 * 验证分类是否有效
 * @param {string} category - 分类名称
 * @returns {boolean}
 */
function isValidCategory(category) {
  return ['tech', 'dev', 'opensource', 'academic', 'product'].includes(category)
}

module.exports = {
  categorizeArticle,
  categorizeArticles,
  isValidCategory,
  CATEGORY_KEYWORDS,
  SOURCE_DEFAULT_CATEGORY
}

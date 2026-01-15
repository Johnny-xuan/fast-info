<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { settingsApi } from '@/api/settings'
import { useSourcePreferences } from '@/composables/useSourcePreferences'
import Header from '@/components/Header.vue'
import { 
  PhBrain, 
  PhDatabase, 
  PhCheckCircle, 
  PhWarningCircle, 
  PhCaretDown, 
  PhFloppyDisk, 
  PhLightning,
  PhGlobe,
  PhSpinner,
  PhChartPie,
  PhArrowsClockwise,
  PhTrash,
  PhShieldCheck
} from '@phosphor-icons/vue'

// 默认提供商配置 (2026年1月更新)
const defaultProviders = {
  // ===== 国际大厂 =====
  openai: {
    name: 'OpenAI',
    apiBase: 'https://api.openai.com/v1',
    models: ['gpt-5.2-pro', 'gpt-5.2-thinking', 'gpt-5.2-instant', 'gpt-5.2-codex', 'gpt-4.5-turbo'],
    defaultModel: 'gpt-5.2-pro',
  },
  anthropic: {
    name: 'Anthropic Claude',
    apiBase: 'https://api.anthropic.com/v1',
    models: ['claude-4.5-opus', 'claude-4-sonnet', 'claude-4-haiku', 'claude-3.5-sonnet'],
    defaultModel: 'claude-4.5-opus',
  },
  google: {
    name: 'Google Gemini',
    apiBase: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-3-pro', 'gemini-3-flash', 'gemini-3-ultra', 'gemini-2.5-pro'],
    defaultModel: 'gemini-3-pro',
  },
  groq: {
    name: 'Groq',
    apiBase: 'https://api.groq.com/openai/v1',
    models: ['llama-4-70b-instruct', 'llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
    defaultModel: 'llama-4-70b-instruct',
  },
  xai: {
    name: 'xAI (Grok)',
    apiBase: 'https://api.x.ai/v1',
    models: ['grok-4.1', 'grok-4.1-thinking', 'grok-vision-4.1', 'grok-3'],
    defaultModel: 'grok-4.1',
  },
  mistral: {
    name: 'Mistral AI',
    apiBase: 'https://api.mistral.ai/v1',
    models: ['mistral-large-2', 'codestral-2', 'mistral-small-2', 'mistral-nemo'],
    defaultModel: 'mistral-large-2',
  },
  // ===== 国内主流 =====
  deepseek: {
    name: 'DeepSeek',
    apiBase: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    defaultModel: 'deepseek-chat',
  },
  doubao: {
    name: '豆包 (Doubao)',
    apiBase: 'https://ark.cn-beijing.volces.com/api/v3',
    models: ['doubao-pro-256k', 'doubao-pro-32k', 'doubao-lite-32k'],
    defaultModel: 'doubao-pro-256k',
  },
  moonshot: {
    name: 'Moonshot (Kimi)',
    apiBase: 'https://api.moonshot.cn/v1',
    models: ['kimi-v2-128k', 'moonshot-v1-128k', 'moonshot-v1-32k'],
    defaultModel: 'kimi-v2-128k',
  },
  aliyun: {
    name: '通义千问 (Aliyun)',
    apiBase: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-max-2025', 'qwen-plus-2025', 'qwen-turbo-2025', 'qwen-coder-plus'],
    defaultModel: 'qwen-max-2025',
  },
  yi: {
    name: '零一万物 (Yi)',
    apiBase: 'https://api.yi.01.ai/v1',
    models: ['yi-lightning', 'yi-large-turbo', 'yi-medium-200k'],
    defaultModel: 'yi-lightning',
  },
  zhipu: {
    name: '智谱 (GLM)',
    apiBase: 'https://open.bigmodel.cn/api/paas/v4',
    models: ['glm-4-plus', 'glm-4-long', 'glm-4-flash', 'codegeex-4'],
    defaultModel: 'glm-4-plus',
  },
  minimax: {
    name: 'MiniMax',
    apiBase: 'https://api.minimaxi.com/v1',
    models: ['abab7-chat', 'abab6.5s-chat', 'abab6-chat'],
    defaultModel: 'abab7-chat',
  },
  baichuan: {
    name: '百川 (Baichuan)',
    apiBase: 'https://api.baichuan-ai.com/v1',
    models: ['Baichuan4-Turbo', 'Baichuan4', 'Baichuan3-Turbo'],
    defaultModel: 'Baichuan4-Turbo',
  },
  // ===== 聚合平台 =====
  siliconflow: {
    name: 'SiliconFlow',
    apiBase: 'https://api.siliconflow.cn/v1',
    models: ['deepseek-ai/DeepSeek-V3', 'deepseek-ai/DeepSeek-R1', 'Qwen/Qwen2.5-72B-Instruct'],
    defaultModel: 'deepseek-ai/DeepSeek-V3',
  },
  openrouter: {
    name: 'OpenRouter',
    apiBase: 'https://openrouter.ai/api/v1',
    models: ['anthropic/claude-4.5-opus', 'openai/gpt-5.2-pro', 'google/gemini-3-pro'],
    defaultModel: 'anthropic/claude-4.5-opus',
  },
  // ===== 本地/自定义 =====
  ollama: {
    name: 'Ollama (本地)',
    apiBase: 'http://localhost:11434/v1',
    models: ['llama3.2', 'qwen2.5', 'mistral', 'deepseek-r1:8b'],
    defaultModel: 'llama3.2',
  },
  custom: {
    name: '自定义',
    apiBase: '',
    models: [],
    defaultModel: '',
  },
}

// 当前 Tab (平台提供 API，移除 llm 配置)
const activeTab = ref('crawler')

// 检查用户是否为管理员
const isAdmin = computed(() => {
  const token = localStorage.getItem('token')
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.is_admin === true
  } catch {
    return false
  }
})

// 数据库统计
const dbStats = ref({
  total: 0,
  todayCount: 0,
  sources: [],
  categories: [],
  dbSize: 'N/A',
  oldest: null,
  newest: null,
})

// 状态
const loading = ref(true)
const saving = ref(false)
const testing = ref(false)
const crawling = ref(false)
const testResult = ref(null)
const providers = ref(defaultProviders)
const useCustomModel = ref(false)

// LLM 表单数据
const form = ref({
  provider: 'deepseek',
  apiKey: '',
  apiBase: '',
  model: '',
})

// 爬虫表单数据
const crawlerForm = ref({
  limits: {
    hackernews: 30,
    github: 20,
    devto: 20,
    producthunt: 15,
    lobsters: 15,
    arxiv: 15,
    paperswithcode: 10,
    'huggingface-blog': 5,
    'mit-tech-ai': 5,
    'distill-pub': 5,
    'bair-blog': 5,
    'openai-research': 5,
    v2ex: 15,
    juejin: 15,
    sspai: 10,
    '36kr': 10,
    aibase: 15,
    hellogithub: 15,
    huxiu: 10,
    'weibo-hot': 10,
    'zhihu-hot': 10,
    'douyin-hot': 10,
    'bilibili-hot': 10,
    'baidu-hot': 10,
    'toutiao-hot': 10,
    'pengpai-hot': 10,
    'cailian-hot': 10,
    'wallstreet-hot': 10,
    'ifeng-hot': 10,
    'tieba-hot': 10,
    'openai-blog': 5,
    'anthropic-blog': 5,
    'google-ai-blog': 5,
    'deepmind-blog': 5,
    'theverge-ai': 5,
    'techcrunch-ai': 5,
    'jiqizhixin': 5,
    'leiphone': 5,
    'venturebeat-ai': 5,
    'huggingface-papers': 10,
  },
  sources: {
    // 国际科技
    hackernews: true,
    github: true,
    devto: true,
    producthunt: true,
    lobsters: true,
    // AI/学术
    arxiv: true,
    paperswithcode: true,
    'huggingface-papers': true,
    'huggingface-blog': true,
    'mit-tech-ai': true,
    'distill-pub': true,
    'bair-blog': true,
    'openai-research': true,
    // 中文科技
    v2ex: true,
    juejin: true,
    sspai: true,
    '36kr': true,
    aibase: true,
    hellogithub: true,
    huxiu: true,
    // 中文热搜（单独控制）
    'weibo-hot': false,
    'zhihu-hot': false,
    'douyin-hot': false,
    'bilibili-hot': false,
    'baidu-hot': false,
    'toutiao-hot': false,
    'pengpai-hot': false,
    'cailian-hot': false,
    'wallstreet-hot': false,
    'ifeng-hot': false,
    'tieba-hot': false,
    // AI 公司博客
    'openai-blog': true,
    'anthropic-blog': true,
    'google-ai-blog': true,
    'deepmind-blog': true,
    // AI 媒体
    'techcrunch-ai': true,
    'theverge-ai': true,
    'venturebeat-ai': true,
    'marktechpost': true,
    'ars-ai': true,
    'wired-ai': true,
    'ai-news': true,
    'the-decoder': true,
    'sciencedaily-ai': true,
    'mit-tech-review': true,
    'crunchbase-news': true,
    'jiqizhixin': true,
    'leiphone': true,
    'qbitai': true,
    // 模型追踪
    'hf-models': true,
    'huggingface-papers': true,
    'paperswithcode': true,
    // AI 大牛博客
    'lillog': true,
    'jalammar': true,
    'sraschka': true,
    'chiphuyen': true,
    'fastai': true,
    // AI 框架
    'pytorch-blog': true,
    'tensorflow-blog': true,
    'langchain-blog': true,
    // AI 教程
    'tds': true,
    'mlmastery': true,
  },
  schedule: '0 * * * *',
})

// 存储设置表单
const storageForm = ref({
  autoCleanup: false,
  retentionDays: 30,
  lastCleanup: null
})
const cleanupResult = ref(null)
const cleaning = ref(false)

// 数据源分类配置（只包含已实现的源）
const sourceCategories = [
  {
    id: 'tech-intl',
    name: '🌍 国际科技',
    desc: '高质量英文科技资讯',
    defaultEnabled: true,
    sources: [
      { key: 'hackernews', name: 'Hacker News', desc: '科技创业讨论', type: 'API' },
      { key: 'github', name: 'GitHub Trending', desc: '开源项目趋势', type: 'API' },
      { key: 'devto', name: 'Dev.to', desc: '开发者博客', type: 'API' },
      { key: 'producthunt', name: 'Product Hunt', desc: '新产品发布', type: 'Feed' },
      { key: 'lobsters', name: 'Lobsters', desc: '技术链接分享', type: 'API' },
    ],
  },
  {
    id: 'ai-research',
    name: '🤖 AI/学术',
    desc: 'AI 论文与研究动态',
    defaultEnabled: true,
    sources: [
      { key: 'arxiv', name: 'arXiv (cs.AI)', desc: 'AI/ML 预印本论文', type: 'API' },
      { key: 'paperswithcode', name: 'Papers with Code', desc: '论文+代码', type: 'API' },
      { key: 'huggingface-papers', name: 'HuggingFace Papers', desc: '每日 AI 论文精选', type: 'API' },
      { key: 'huggingface-blog', name: 'HuggingFace Blog', desc: 'HF 官方博客', type: 'RSS' },
      { key: 'mit-tech-ai', name: 'MIT Tech Review AI', desc: 'MIT 科技评论 AI', type: 'RSS' },
      { key: 'distill-pub', name: 'Distill.pub', desc: 'ML 可视化解释', type: 'RSS' },
      { key: 'bair-blog', name: 'BAIR Blog', desc: '伯克利 AI 研究博客', type: 'RSS' },
      { key: 'openai-research', name: 'OpenAI Research', desc: 'OpenAI 研究博客', type: 'RSS' },
    ],
  },
  {
    id: 'tech-cn',
    name: '🇨🇳 中文科技',
    desc: '中文技术社区与资讯',
    defaultEnabled: true,
    sources: [
      { key: 'v2ex', name: 'V2EX', desc: '程序员社区', type: 'API' },
      { key: 'juejin', name: '掘金', desc: '开发者文章', type: 'Firecrawl*' },
      { key: 'sspai', name: '少数派', desc: '效率工具/数字生活', type: 'RSS' },
      { key: '36kr', name: '36氪', desc: '科技创投新闻', type: 'RSS' },
      { key: 'aibase', name: 'AIBase', desc: 'AI 垂直资讯', type: 'Firecrawl*' },
      { key: 'hellogithub', name: 'HelloGitHub', desc: '中文开源推荐', type: 'API' },
      { key: 'huxiu', name: '虎嗅', desc: '商业科技分析', type: 'API' },
    ],
  },
  {
    id: 'social-hot',
    name: '🔥 中文热搜',
    desc: '11个平台热搜聚合',
    defaultEnabled: false,
    sources: [
      { key: 'weibo-hot', name: '微博热搜', desc: '微博实时热搜榜', type: 'API' },
      { key: 'zhihu-hot', name: '知乎热榜', desc: '知乎热门问题', type: 'API' },
      { key: 'douyin-hot', name: '抖音热点', desc: '抖音热搜榜', type: 'API' },
      { key: 'bilibili-hot', name: 'B站热搜', desc: 'B站热门视频', type: 'API' },
      { key: 'baidu-hot', name: '百度热搜', desc: '百度搜索热点', type: 'API' },
      { key: 'toutiao-hot', name: '今日头条', desc: '头条热点新闻', type: 'API' },
      { key: 'pengpai-hot', name: '澎湃新闻', desc: '澎湃热门资讯', type: 'API' },
      { key: 'cailian-hot', name: '财联社', desc: '财经快讯', type: 'API' },
      { key: 'wallstreet-hot', name: '华尔街见闻', desc: '全球财经', type: 'API' },
      { key: 'ifeng-hot', name: '凤凰网', desc: '凤凰新闻热点', type: 'API' },
      { key: 'tieba-hot', name: '贴吧热议', desc: '百度贴吧热门', type: 'API' },
    ],
  },
  {
    id: 'aiblogs',
    name: '🏢 AI 公司博客',
    desc: 'AI 巨头官方动态',
    defaultEnabled: true,
    sources: [
      { key: 'openai-blog', name: 'OpenAI Blog', desc: 'OpenAI 官方博客', type: 'RSS' },
      { key: 'anthropic-blog', name: 'Anthropic News', desc: 'Anthropic 官方新闻', type: 'RSS' },
      { key: 'google-ai-blog', name: 'Google AI Blog', desc: 'Google AI 官方博客', type: 'RSS' },
      { key: 'deepmind-blog', name: 'DeepMind Blog', desc: 'DeepMind 官方博客', type: 'RSS' },
    ],
  },
  {
    id: 'ai-media',
    name: '📰 AI 媒体',
    desc: 'AI 行业新闻与分析',
    defaultEnabled: true,
    sources: [
      { key: 'techcrunch-ai', name: 'TechCrunch AI', desc: 'TechCrunch AI 频道', type: 'RSS' },
      { key: 'theverge-ai', name: 'The Verge AI', desc: 'The Verge AI 频道', type: 'RSS' },
      { key: 'venturebeat-ai', name: 'VentureBeat AI', desc: '英文 AI 科技新闻', type: 'RSS' },
      { key: 'marktechpost', name: 'MarkTechPost', desc: 'AI 研究快讯', type: 'RSS' },
      { key: 'ars-ai', name: 'Ars Technica AI', desc: '科技深度报道', type: 'RSS' },
      { key: 'wired-ai', name: 'Wired AI', desc: 'Wired AI 频道', type: 'RSS' },
      { key: 'ai-news', name: 'AI News', desc: 'AI 行业新闻', type: 'RSS' },
      { key: 'the-decoder', name: 'The Decoder', desc: 'AI 模型发布追踪', type: 'RSS' },
      { key: 'sciencedaily-ai', name: 'ScienceDaily AI', desc: 'AI 科学新闻', type: 'RSS' },
      { key: 'mit-tech-review', name: 'MIT Tech Review', desc: 'MIT 科技评论', type: 'RSS' },
      { key: 'crunchbase-news', name: 'Crunchbase News', desc: 'AI 投融资新闻', type: 'RSS' },
      { key: 'jiqizhixin', name: '机器之心', desc: '中文 AI 媒体', type: 'RSS' },
      { key: 'leiphone', name: '雷锋网 AI', desc: '中文 AI 媒体', type: 'RSS' },
      { key: 'qbitai', name: '量子位', desc: '国内 AI 资讯', type: 'RSS' },
    ],
  },
  {
    id: 'ai-models',
    name: '🚀 模型追踪',
    desc: '最新模型发布',
    defaultEnabled: true,
    sources: [
      { key: 'hf-models', name: 'HuggingFace Models', desc: '热门模型追踪', type: 'API' },
      { key: 'huggingface-papers', name: 'HuggingFace Papers', desc: '每日 AI 论文', type: 'API' },
      { key: 'paperswithcode', name: 'Papers with Code', desc: '论文+代码', type: 'API' },
    ],
  },
  {
    id: 'ai-experts',
    name: '🎓 AI 大牛博客',
    desc: '顶级 AI 研究者的个人博客',
    defaultEnabled: true,
    sources: [
      { key: 'lillog', name: "Lil'Log", desc: 'Lilian Weng (OpenAI)', type: 'RSS' },
      { key: 'jalammar', name: 'Jay Alammar', desc: '可视化 ML 概念', type: 'RSS' },
      { key: 'sraschka', name: 'Sebastian Raschka', desc: 'LLM 研究专家', type: 'RSS' },
      { key: 'chiphuyen', name: 'Chip Huyen', desc: 'AI 系统设计', type: 'RSS' },
      { key: 'fastai', name: 'Fast.ai', desc: 'Jeremy Howard 团队', type: 'RSS' },
    ],
  },
  {
    id: 'ai-frameworks',
    name: '🛠️ AI 框架',
    desc: 'PyTorch、TensorFlow、LangChain 等',
    defaultEnabled: true,
    sources: [
      { key: 'pytorch-blog', name: 'PyTorch Blog', desc: 'PyTorch 官方博客', type: 'RSS' },
      { key: 'tensorflow-blog', name: 'TensorFlow Blog', desc: 'TensorFlow 官方博客', type: 'RSS' },
      { key: 'langchain-blog', name: 'LangChain Blog', desc: 'LangChain 官方博客', type: 'RSS' },
    ],
  },
  {
    id: 'ai-tutorials',
    name: '📚 AI 教程',
    desc: '实战教程与学习资源',
    defaultEnabled: true,
    sources: [
      { key: 'tds', name: 'Towards Data Science', desc: 'Medium 数据科学', type: 'RSS' },
      { key: 'mlmastery', name: 'ML Mastery', desc: '机器学习实战教程', type: 'RSS' },
    ],
  },
]

// 展开的分类
const expandedCategories = ref(['tech-intl', 'ai-research', 'tech-cn', 'aiblogs'])

// 切换分类展开
function toggleCategory(categoryId) {
  const idx = expandedCategories.value.indexOf(categoryId)
  if (idx >= 0) {
    expandedCategories.value.splice(idx, 1)
  } else {
    expandedCategories.value.push(categoryId)
  }
}

// 切换整个分类的开关
function toggleCategoryAll(category, enabled) {
  category.sources.forEach((s) => {
    crawlerForm.value.sources[s.key] = enabled
  })
}

// 检查分类是否全部开启
function isCategoryAllEnabled(category) {
  return category.sources.every((s) => crawlerForm.value.sources[s.key])
}

// 检查分类是否部分开启
function isCategoryPartialEnabled(category) {
  const enabled = category.sources.filter((s) => crawlerForm.value.sources[s.key]).length
  return enabled > 0 && enabled < category.sources.length
}

// 调度选项
const scheduleOptions = [
  { value: '*/30 * * * *', label: '每 30 分钟' },
  { value: '0 * * * *', label: '每小时' },
  { value: '0 */2 * * *', label: '每 2 小时' },
  { value: '0 */6 * * *', label: '每 6 小时' },
  { value: '0 0 * * *', label: '每天' },
]

// 当前提供商的模型列表
const currentModels = computed(() => {
  const p = providers.value[form.value.provider]
  return p?.models || []
})

// 当前提供商的默认 API Base
const currentApiBase = computed(() => {
  const p = providers.value[form.value.provider]
  return p?.apiBase || ''
})

// 加载设置
async function loadSettings() {
  loading.value = true
  try {
    const [settingsRes, providersRes, crawlerRes] = await Promise.all([
      settingsApi.getSettings(),
      settingsApi.getProviders(),
      settingsApi.getCrawlerSettings(),
    ])
    
    providers.value = providersRes.data || {}
    
    if (settingsRes.data) {
      form.value.provider = settingsRes.data.provider || 'deepseek'
      form.value.apiBase = settingsRes.data.apiBase || ''
      // API Key 不返回，只显示占位符
      if (settingsRes.data.hasApiKey) {
        form.value.apiKey = '••••••••••••••••'
      }
      // 设置模型，如果没有保存的模型则使用默认模型
      const p = providers.value[form.value.provider]
      if (settingsRes.data.model) {
        form.value.model = settingsRes.data.model
        // 检查是否是预设模型
        useCustomModel.value = p?.models && !p.models.includes(settingsRes.data.model)
      } else {
        form.value.model = p?.defaultModel || (p?.models?.length ? p.models[0] : '')
      }
    } else {
      // 没有保存的设置，使用默认值
      const p = providers.value[form.value.provider]
      form.value.model = p?.defaultModel || (p?.models?.length ? p.models[0] : '')
    }
    
    // 加载爬虫设置
    if (crawlerRes.data) {
      crawlerForm.value.limits = crawlerRes.data.limits || crawlerForm.value.limits
      crawlerForm.value.sources = crawlerRes.data.sources || crawlerForm.value.sources
      crawlerForm.value.schedule = crawlerRes.data.schedule || '0 * * * *'
    }
    
    // 加载数据库统计
    await loadDbStats()
  } catch (error) {
    console.error('加载设置失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载数据库统计
async function loadDbStats() {
  try {
    const res = await fetch('/api/stats/database')
    const data = await res.json()
    if (data.success) {
      dbStats.value = data.data
    }
  } catch (error) {
    console.error('加载数据库统计失败:', error)
  }
}

// 切换提供商
function onProviderChange() {
  const p = providers.value[form.value.provider]
  if (p) {
    form.value.apiBase = p.apiBase
    form.value.model = p.defaultModel || (p.models?.length ? p.models[0] : '')
  }
  form.value.apiKey = ''
  testResult.value = null
  useCustomModel.value = false
}

// 测试连接
async function testConnection() {
  if (!form.value.apiKey || form.value.apiKey.includes('•')) {
    testResult.value = { success: false, message: '请先输入新的 API Key' }
    return
  }
  
  if (!form.value.model) {
    testResult.value = { success: false, message: '请选择模型' }
    return
  }
  
  testing.value = true
  testResult.value = null
  
  try {
    const res = await settingsApi.testConnection({
      provider: form.value.provider,
      apiKey: form.value.apiKey,
      apiBase: form.value.apiBase || currentApiBase.value,
      model: form.value.model,
    })
    testResult.value = res
  } catch (error) {
    // 处理各种错误情况
    const msg = error.response?.data?.message || error.message || '连接失败'
    testResult.value = { success: false, message: msg }
  } finally {
    testing.value = false
  }
}

// 保存设置
async function saveSettings() {
  if (!form.value.apiKey || form.value.apiKey.includes('•')) {
    testResult.value = { success: false, message: '请输入 API Key' }
    return
  }
  
  saving.value = true
  
  try {
    await settingsApi.saveSettings({
      provider: form.value.provider,
      apiKey: form.value.apiKey,
      apiBase: form.value.apiBase || currentApiBase.value,
      model: form.value.model,
    })
    testResult.value = { success: true, message: '设置已保存' }
  } catch (error) {
    testResult.value = { success: false, message: error.message || '保存失败' }
  } finally {
    saving.value = false
  }
}

// 用户信息源偏好
const { sources: userSources, load: loadSourcePreferences, save: saveSourcePreferences } = useSourcePreferences()

// key 到数据库 source 名称的映射
const keyToSourceName = {
  // 国际科技
  'hackernews': 'Hacker News',
  'github': 'GitHub Trending',
  'devto': 'Dev.to',
  'producthunt': 'Product Hunt',
  'lobsters': 'Lobsters',
  // AI/学术
  'arxiv': 'arXiv',
  'paperswithcode': 'Papers with Code',
  'huggingface-papers': 'HuggingFace Papers',
  'huggingface-blog': 'HuggingFace Blog',
  'mit-tech-ai': 'MIT Tech Review AI',
  'distill-pub': 'Distill.pub',
  'bair-blog': 'BAIR Blog',
  'openai-research': 'OpenAI Research',
  // 中文科技
  'v2ex': 'V2EX',
  'juejin': '掘金',
  'sspai': '少数派',
  '36kr': '36氪',
  'aibase': 'AIBase',
  'hellogithub': 'HelloGitHub',
  'huxiu': '虎嗅',
  // 中文热搜
  'weibo-hot': '微博',
  'zhihu-hot': '知乎',
  'douyin-hot': '抖音',
  'bilibili-hot': 'Bilibili热搜',
  'baidu-hot': '百度热搜',
  'toutiao-hot': '今日头条',
  'pengpai-hot': '澎湃新闻',
  'cailian-hot': '财联社',
  'wallstreet-hot': '华尔街见闻',
  'ifeng-hot': '凤凰网',
  'tieba-hot': '贴吧',
  // AI 公司博客
  'openai-blog': 'OpenAI Blog',
  'anthropic-blog': 'Anthropic News',
  'google-ai-blog': 'Google AI Blog',
  'deepmind-blog': 'DeepMind Blog',
  // AI 媒体
  'techcrunch-ai': 'TechCrunch AI',
  'theverge-ai': 'The Verge AI',
  'venturebeat-ai': 'VentureBeat AI',
  'marktechpost': 'MarkTechPost',
  'ars-ai': 'Ars Technica AI',
  'wired-ai': 'Wired AI',
  'ai-news': 'AI News',
  'the-decoder': 'The Decoder',
  'sciencedaily-ai': 'ScienceDaily AI',
  'mit-tech-review': 'MIT Tech Review',
  'crunchbase-news': 'Crunchbase News',
  'jiqizhixin': '机器之心',
  'leiphone': '雷锋网 AI',
  'qbitai': '量子位',
  // 模型追踪
  'hf-models': 'HuggingFace Models',
  'huggingface-papers': 'HuggingFace Papers',
  'paperswithcode': 'Papers with Code',
  // AI 大牛博客
  'lillog': "Lil'Log",
  'jalammar': 'Jay Alammar',
  'sraschka': 'Sebastian Raschka',
  'chiphuyen': 'Chip Huyen',
  'fastai': 'Fast.ai',
  // AI 框架
  'pytorch-blog': 'PyTorch Blog',
  'tensorflow-blog': 'TensorFlow Blog',
  'langchain-blog': 'LangChain Blog',
  // AI 教程
  'tds': 'Towards Data Science',
  'mlmastery': 'ML Mastery',
}

// 保存信息源筛选设置（用户偏好）
async function saveCrawlerSettings() {
  saving.value = true
  testResult.value = null
  
  try {
    // 将 crawlerForm.sources 的 key 转换为数据库 source 名称
    const mappedSources = {}
    for (const [key, enabled] of Object.entries(crawlerForm.value.sources)) {
      const sourceName = keyToSourceName[key]
      if (sourceName) {
        mappedSources[sourceName] = enabled
      }
    }
    
    // 同步到 userSources
    Object.assign(userSources.value, mappedSources)
    await saveSourcePreferences()
    testResult.value = { success: true, message: '信息源偏好已保存' }
  } catch (error) {
    testResult.value = { success: false, message: error.message || '保存失败' }
  } finally {
    saving.value = false
  }
}

// 立即运行爬虫
async function runCrawlerNow() {
  crawling.value = true
  testResult.value = null
  
  try {
    await settingsApi.runCrawler()
    testResult.value = { success: true, message: '爬虫已开始运行，请稍后刷新查看新数据' }
  } catch (error) {
    testResult.value = { success: false, message: error.message || '启动失败' }
  } finally {
    crawling.value = false
  }
}

// 保存存储设置
async function saveStorageSettings() {
  saving.value = true
  cleanupResult.value = null
  
  try {
    await settingsApi.saveStorageSettings({
      autoCleanup: storageForm.value.autoCleanup,
      retentionDays: storageForm.value.retentionDays
    })
    cleanupResult.value = { success: true, message: '存储设置已保存' }
  } catch (error) {
    cleanupResult.value = { success: false, message: error.message || '保存失败' }
  } finally {
    saving.value = false
  }
}

// 立即执行清理
async function runCleanupNow() {
  cleaning.value = true
  cleanupResult.value = null
  
  try {
    const res = await settingsApi.runCleanup()
    cleanupResult.value = { success: true, message: res.message || '清理完成' }
    storageForm.value.lastCleanup = new Date().toISOString()
    loadDbStats()
  } catch (error) {
    cleanupResult.value = { success: false, message: error.message || '清理失败' }
  } finally {
    cleaning.value = false
  }
}

// 加载存储设置
async function loadStorageSettings() {
  try {
    const res = await settingsApi.getStorageSettings()
    if (res.data) {
      storageForm.value = { ...storageForm.value, ...res.data }
    }
  } catch (error) {
    console.error('Failed to load storage settings:', error)
  }
}

// 数据库 source 名称到 key 的反向映射
const sourceNameToKey = Object.fromEntries(
  Object.entries(keyToSourceName).map(([k, v]) => [v, k])
)

onMounted(async () => {
  loadSettings()
  loadStorageSettings()
  
  // 加载用户信息源偏好
  await loadSourcePreferences()
  
  // 将数据库 source 名称映射回表单 key
  for (const [sourceName, enabled] of Object.entries(userSources.value)) {
    const key = sourceNameToKey[sourceName]
    if (key && key in crawlerForm.value.sources) {
      crawlerForm.value.sources[key] = enabled
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#fafafa] font-sans text-slate-900 flex flex-col">
    <Header />
    
    <main class="flex-1 pt-12 flex relative overflow-hidden">
      <!-- 背景装饰 - 保持与主页及 Pulse 一致 -->
      <div class="fixed inset-0 overflow-hidden pointer-events-none opacity-30 z-0">
        <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px]"></div>
        <div class="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-purple-50 rounded-full blur-[100px]"></div>
      </div>

      <div class="max-w-6xl mx-auto w-full flex flex-1 relative z-10 py-12 px-6 gap-12">
        <!-- 侧边栏导航 -->
        <aside class="w-64 hidden md:flex flex-col gap-2 shrink-0 animate-in fade-in slide-in-from-left-4 duration-500">
          <div class="mb-8 px-2">
            <h1 class="text-3xl font-bold tracking-tight text-slate-900">设置</h1>
            <p class="text-sm text-slate-500 mt-1">管理你的偏好与配置</p>
          </div>
          
          <nav class="space-y-1">
            <button 
              @click="activeTab = 'crawler'"
              :class="['w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all group', 
                activeTab === 'crawler' 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                  : 'text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200']"
            >
              <ph-database :size="20" :weight="activeTab === 'crawler' ? 'fill' : 'bold'" />
              信息源筛选
            </button>
            <button 
              @click="activeTab = 'storage'"
              :class="['w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all group', 
                activeTab === 'storage' 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                  : 'text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200']"
            >
              <PhChartPie :size="20" :weight="activeTab === 'storage' ? 'fill' : 'bold'" />
              存储概况
            </button>

            <!-- 管理后台入口（仅管理员可见） -->
            <router-link 
              v-if="isAdmin"
              to="/admin"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all group text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200"
            >
              <PhShieldCheck :size="20" weight="bold" />
              管理后台
            </router-link>
          </nav>

          <div class="mt-auto p-4 bg-blue-50/50 rounded-3xl border border-blue-100/50">
            <h4 class="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">系统状态</h4>
            <div class="flex items-center gap-2 text-[11px] text-blue-700">
              <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              服务运行正常
            </div>
          </div>
        </aside>

        <!-- 主内容区 -->
        <section class="flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <!-- 移动端标题 -->
          <div class="md:hidden mb-8">
            <h1 class="text-3xl font-bold tracking-tight text-slate-900">设置</h1>
            <div class="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-2">
              <button 
                @click="activeTab = 'crawler'"
                :class="['flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border', 
                  activeTab === 'crawler' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200']"
              >
                <ph-database :size="16" :weight="activeTab === 'crawler' ? 'fill' : 'bold'" /> 信息源筛选
              </button>
              <button 
                @click="activeTab = 'storage'"
                :class="['flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border', 
                  activeTab === 'storage' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200']"
              >
                <PhChartPie :size="16" :weight="activeTab === 'storage' ? 'fill' : 'bold'" /> 存储
              </button>
              <router-link 
                v-if="isAdmin"
                to="/admin"
                class="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border bg-blue-50 text-blue-600 border-blue-200"
              >
                <PhShieldCheck :size="16" weight="bold" /> 管理后台
              </router-link>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="h-64 flex flex-col items-center justify-center bg-white rounded-[32px] border border-slate-100 shadow-sm">
            <ph-spinner :size="40" class="animate-spin text-blue-600 mb-4" weight="bold" />
            <p class="text-sm text-slate-400 font-medium">正在加载配置...</p>
          </div>

          <!-- 配置面板 -->
          <div v-else class="space-y-6">
            <!-- 信息源筛选面板 -->
            <div v-if="activeTab === 'crawler'" class="space-y-8">
              <div class="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
                <div class="mb-8">
                  <h2 class="text-xl font-bold text-slate-900 mb-1">信息源筛选</h2>
                  <p class="text-sm text-slate-400">选择你感兴趣的内容来源</p>
                </div>

                <div class="space-y-6">
                  <div class="space-y-4">
                    <label class="text-xs font-bold text-slate-900 uppercase tracking-tight ml-1">订阅源管理（按类别）</label>
                    
                    <!-- 分类列表 -->
                    <div class="space-y-3">
                      <div v-for="category in sourceCategories" :key="category.id" class="border border-slate-100 rounded-[24px] overflow-hidden">
                        <!-- 分类头部 -->
                        <div 
                          class="flex items-center justify-between p-5 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                          @click="toggleCategory(category.id)"
                        >
                          <div class="flex items-center gap-4">
                            <!-- 分类开关 -->
                            <div 
                              @click.stop="toggleCategoryAll(category, !isCategoryAllEnabled(category))"
                              :class="['w-12 h-6 rounded-full relative transition-all cursor-pointer', 
                                isCategoryAllEnabled(category) ? 'bg-blue-600' : 
                                isCategoryPartialEnabled(category) ? 'bg-blue-300' : 'bg-slate-200']"
                            >
                              <div :class="['absolute top-1 w-4 h-4 bg-white rounded-full transition-all', 
                                isCategoryAllEnabled(category) || isCategoryPartialEnabled(category) ? 'left-7' : 'left-1']"></div>
                            </div>
                            
                            <div>
                              <div class="flex items-center gap-2">
                                <span class="text-sm font-bold text-slate-900">{{ category.name }}</span>
                                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                                  {{ category.sources.filter(s => crawlerForm.sources[s.key]).length }}/{{ category.sources.length }}
                                </span>
                              </div>
                              <p class="text-[11px] text-slate-400 mt-0.5">{{ category.desc }}</p>
                            </div>
                          </div>
                          
                          <ph-caret-down 
                            :size="18" 
                            weight="bold" 
                            :class="['text-slate-400 transition-transform', expandedCategories.includes(category.id) ? 'rotate-180' : '']" 
                          />
                        </div>
                        
                        <!-- 分类内的源列表 -->
                        <div v-if="expandedCategories.includes(category.id)" class="bg-white divide-y divide-slate-50">
                          <div 
                            v-for="source in category.sources" 
                            :key="source.key"
                            class="flex items-center justify-between p-4 pl-8 hover:bg-blue-50/30 transition-colors"
                          >
                            <div class="flex items-center gap-3">
                              <!-- 单个源开关 -->
                              <div 
                                @click="crawlerForm.sources[source.key] = !crawlerForm.sources[source.key]"
                                :class="['w-10 h-5 rounded-full relative transition-all cursor-pointer', 
                                  crawlerForm.sources[source.key] ? 'bg-blue-600' : 'bg-slate-200']"
                              >
                                <div :class="['absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all', 
                                  crawlerForm.sources[source.key] ? 'left-5' : 'left-0.5']"></div>
                              </div>
                              
                              <div>
                                <div class="flex items-center gap-2">
                                  <span class="text-sm font-medium text-slate-800">{{ source.name }}</span>
                                  <span class="text-[8px] font-bold px-1 py-0.5 rounded bg-slate-100 text-slate-400 uppercase">{{ source.type }}</span>
                                </div>
                                <p class="text-[10px] text-slate-400">{{ source.desc }}</p>
                              </div>
                            </div>
                            
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 测试结果 -->
              <div 
                v-if="testResult && activeTab === 'crawler'" 
                :class="['flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-bold animate-in zoom-in duration-300 mx-2', 
                  testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700']"
              >
                <ph-check-circle v-if="testResult.success" :size="18" weight="fill" />
                <ph-warning-circle v-else :size="18" weight="fill" />
                {{ testResult.message }}
              </div>

              <div class="flex justify-end px-2">
                <button 
                  @click="saveCrawlerSettings" 
                  :disabled="saving"
                  class="px-10 py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-blue-600 shadow-xl shadow-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ph-spinner v-if="saving" :size="18" class="animate-spin" weight="bold" />
                  <ph-floppy-disk v-else :size="18" weight="bold" />
                  {{ saving ? '保存中...' : '保存配置' }}
                </button>
              </div>
            </div>

            <!-- 存储概况面板 -->
            <div v-if="activeTab === 'storage'" class="space-y-6">
              <div class="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
                <div class="mb-6">
                  <h2 class="text-xl font-bold text-slate-900 mb-1">数据库存储概况</h2>
                  <p class="text-sm text-slate-400">查看文章存储统计和各数据源分布</p>
                </div>

                <!-- 统计卡片 -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4">
                    <div class="text-2xl font-bold text-blue-900">{{ dbStats.total.toLocaleString() }}</div>
                    <div class="text-xs text-blue-600 font-medium">总文章数</div>
                  </div>
                  <div class="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-4">
                    <div class="text-2xl font-bold text-green-900">+{{ dbStats.todayCount }}</div>
                    <div class="text-xs text-green-600 font-medium">今日新增</div>
                  </div>
                  <div class="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-4">
                    <div class="text-2xl font-bold text-purple-900">{{ dbStats.sources.length }}</div>
                    <div class="text-xs text-purple-600 font-medium">数据源数量</div>
                  </div>
                  <div class="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-4">
                    <div class="text-2xl font-bold text-orange-900">{{ dbStats.dbSize }}</div>
                    <div class="text-xs text-orange-600 font-medium">存储大小</div>
                  </div>
                </div>

                <!-- 各源分布 -->
                <div class="mb-6">
                  <h3 class="text-sm font-bold text-slate-700 mb-3">各数据源文章数量</h3>
                  <div class="space-y-2 max-h-64 overflow-y-auto">
                    <div 
                      v-for="source in dbStats.sources" 
                      :key="source.name"
                      class="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg"
                    >
                      <span class="text-sm font-medium text-slate-700">{{ source.name }}</span>
                      <div class="flex items-center gap-2">
                        <div class="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            class="h-full bg-blue-500 rounded-full"
                            :style="{ width: `${Math.min(100, (source.count / dbStats.total) * 100 * 5)}%` }"
                          ></div>
                        </div>
                        <span class="text-xs font-bold text-slate-500 w-12 text-right">{{ source.count }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 分类分布 -->
                <div>
                  <h3 class="text-sm font-bold text-slate-700 mb-3">各分类文章数量</h3>
                  <div class="flex flex-wrap gap-2">
                    <div 
                      v-for="cat in dbStats.categories" 
                      :key="cat.name"
                      class="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600"
                    >
                      {{ cat.name }}: {{ cat.count }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 刷新按钮 -->
              <div class="px-2">
                <button 
                  @click="loadDbStats" 
                  class="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all flex items-center gap-2"
                >
                  <PhArrowsClockwise :size="18" weight="bold" />
                  刷新统计
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 动画 */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in-bottom {
  from { transform: translateY(1rem); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slide-in-left {
  from { transform: translateX(-1rem); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes zoom-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-in {
  animation-fill-mode: both;
}

.fade-in {
  animation-name: fade-in;
}

.slide-in-from-bottom-4 {
  animation-name: slide-in-bottom;
}

.slide-in-from-left-4 {
  animation-name: slide-in-left;
}

.zoom-in {
  animation-name: zoom-in;
}
</style>

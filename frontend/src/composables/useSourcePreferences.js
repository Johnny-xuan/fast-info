import { ref } from 'vue'
import { authApi } from '@/api/auth'

const STORAGE_KEY = 'fast-info-source-preferences'

// 默认源设置（中文热搜默认关闭）
const defaultSources = {
  // 国际科技（默认开启）
  'Hacker News': true,
  'GitHub Trending': true,
  'Dev.to': true,
  'Product Hunt': true,
  'Lobsters': true,
  // AI/学术（默认开启）
  'arXiv': true,
  'Papers with Code': true,
  'HuggingFace Papers': true,
  'HuggingFace Blog': true,
  'MIT Tech Review AI': true,
  'Distill.pub': true,
  'BAIR Blog': true,
  'OpenAI Research': true,
  // 中文科技（默认开启）
  'V2EX': true,
  '掘金': true,
  '少数派': true,
  '36氪': true,
  'AIBase': true,
  'HelloGitHub': true,
  '虎嗅': true,
  // 中文热搜（默认关闭）
  '微博': false,
  '知乎': false,
  '抖音': false,
  'Bilibili热搜': false,
  '百度热搜': false,
  '今日头条': false,
  '澎湃新闻': false,
  '财联社': false,
  '华尔街见闻': false,
  '凤凰网': false,
  '贴吧': false,
  // AI 公司博客（默认开启）
  'OpenAI Blog': true,
  'Anthropic News': true,
  'Google AI Blog': true,
  'DeepMind Blog': true,
  // AI 媒体（默认开启）
  'TechCrunch AI': true,
  'The Verge AI': true,
  'VentureBeat AI': true,
  'MarkTechPost': true,
  'Ars Technica AI': true,
  'Wired AI': true,
  'AI News': true,
  'The Decoder': true,
  'ScienceDaily AI': true,
  'MIT Tech Review': true,
  'Crunchbase News': true,
  '机器之心': true,
  '雷锋网 AI': true,
  '量子位': true,
  // 模型追踪（默认开启）
  'HuggingFace Models': true,
  'HuggingFace Papers': true,
  'Papers with Code': true,
  // AI 大牛博客（默认开启）
  "Lil'Log": true,
  'Jay Alammar': true,
  'Sebastian Raschka': true,
  'Chip Huyen': true,
  'Fast.ai': true,
  // AI 框架（默认开启）
  'PyTorch Blog': true,
  'TensorFlow Blog': true,
  'LangChain Blog': true,
  // AI 教程（默认开启）
  'Towards Data Science': true,
  'ML Mastery': true,
}

// 全局状态
const sources = ref({ ...defaultSources })
const loaded = ref(false)

export function useSourcePreferences() {
  // 检查用户是否登录
  const isLoggedIn = () => !!localStorage.getItem('token')

  // 从 localStorage 加载
  const loadFromLocal = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        sources.value = { ...defaultSources, ...parsed }
      }
    } catch (e) {
      console.error('Failed to load source preferences from localStorage:', e)
    }
  }

  // 保存到 localStorage
  const saveToLocal = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sources.value))
    } catch (e) {
      console.error('Failed to save source preferences to localStorage:', e)
    }
  }

  // 从服务器加载（登录用户）
  const loadFromServer = async () => {
    try {
      const response = await authApi.getUserSettings()
      if (response.success && response.data?.source_preferences) {
        sources.value = { ...defaultSources, ...response.data.source_preferences }
      }
    } catch (e) {
      console.error('Failed to load source preferences from server:', e)
    }
  }

  // 保存到服务器（登录用户）
  const saveToServer = async () => {
    try {
      await authApi.updateUserSettings({
        source_preferences: sources.value
      })
    } catch (e) {
      console.error('Failed to save source preferences to server:', e)
    }
  }

  // 加载偏好设置
  const load = async () => {
    if (loaded.value) return

    loadFromLocal() // 先从本地加载

    if (isLoggedIn()) {
      await loadFromServer() // 登录用户从服务器加载
    }

    loaded.value = true
  }

  // 保存偏好设置
  const save = async () => {
    saveToLocal() // 始终保存到本地

    if (isLoggedIn()) {
      await saveToServer() // 登录用户同时保存到服务器
    }
  }

  // 获取启用的源列表
  const getEnabledSources = () => {
    return Object.entries(sources.value)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key)
  }

  // 重置为默认
  const reset = () => {
    sources.value = { ...defaultSources }
  }

  return {
    sources,
    loaded,
    load,
    save,
    getEnabledSources,
    reset,
    defaultSources
  }
}

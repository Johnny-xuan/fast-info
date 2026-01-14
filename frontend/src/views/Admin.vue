<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/api/request'
import Header from '@/components/Header.vue'
import { 
  PhUsers, 
  PhArticle, 
  PhGear, 
  PhChartBar,
  PhSpinner,
  PhTrash,
  PhShieldCheck,
  PhCrown,
  PhCaretDown,
  PhArrowsClockwise,
  PhWarningCircle
} from '@phosphor-icons/vue'

const router = useRouter()

// 状态
const loading = ref(true)
const error = ref(null)
const activeTab = ref('stats')
const isAdmin = ref(false)

// 统计数据
const stats = ref({
  total_articles: 0,
  today_articles: 0,
  total_users: 0,
  today_users: 0,
  premium_users: 0
})

// 用户列表
const users = ref([])
const usersPagination = ref({ page: 1, limit: 20, total: 0 })

// 爬虫设置
const crawlerSettings = ref({
  schedule: '0 * * * *',
  sources: {},
  limits: {}
})

// 运行状态
const runningCrawler = ref(false)

// 检查管理员权限
const checkAdmin = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return false
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (!payload.is_admin) {
      error.value = '您没有管理员权限'
      return false
    }
    isAdmin.value = true
    return true
  } catch (e) {
    router.push('/login')
    return false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const res = await request.get('/admin/stats')
    if (res.success) {
      stats.value = res.data
    }
  } catch (e) {
    console.error('Load stats error:', e)
  }
}

// 加载用户列表
const loadUsers = async (page = 1) => {
  try {
    const res = await request.get('/admin/users', {
      params: { page, limit: usersPagination.value.limit }
    })
    if (res.success) {
      users.value = res.data.users
      usersPagination.value = {
        page: res.data.page,
        limit: res.data.limit,
        total: res.data.total
      }
    }
  } catch (e) {
    console.error('Load users error:', e)
  }
}

// 更新用户权限
const updateUser = async (userId, field, value) => {
  try {
    await request.put(`/admin/users/${userId}`, { [field]: value })
    await loadUsers(usersPagination.value.page)
  } catch (e) {
    console.error('Update user error:', e)
  }
}

// 加载爬虫设置
const loadCrawlerSettings = async () => {
  try {
    const res = await request.get('/admin/crawler')
    if (res.success) {
      crawlerSettings.value = res.data
    }
  } catch (e) {
    console.error('Load crawler settings error:', e)
  }
}

// 保存爬虫设置
const saveCrawlerSettings = async () => {
  try {
    await request.put('/admin/crawler', crawlerSettings.value)
    alert('爬虫设置已保存')
  } catch (e) {
    console.error('Save crawler settings error:', e)
    alert('保存失败')
  }
}

// 手动运行爬虫
const runCrawler = async () => {
  if (runningCrawler.value) return
  runningCrawler.value = true
  try {
    const res = await request.post('/admin/crawler/run')
    alert(res.message || '爬虫任务已启动，请稍后刷新查看新数据')
    // 刷新统计
    await loadStats()
  } catch (e) {
    console.error('Run crawler error:', e)
    alert('启动爬虫失败: ' + (e.message || '未知错误'))
  } finally {
    runningCrawler.value = false
  }
}

// 清理过期文章
const cleanupArticles = async (days) => {
  if (!confirm(`确定要清理 ${days} 天前的文章吗？`)) return
  
  try {
    const res = await request.post('/admin/articles/cleanup', { days })
    alert(res.message || '清理完成')
    await loadStats()
  } catch (e) {
    console.error('Cleanup error:', e)
  }
}

// 切换 Tab
const switchTab = async (tab) => {
  activeTab.value = tab
  if (tab === 'users') await loadUsers()
  if (tab === 'crawler') await loadCrawlerSettings()
}

onMounted(async () => {
  if (!checkAdmin()) {
    loading.value = false
    return
  }
  
  await loadStats()
  loading.value = false
})

// 调度选项（简化版）
const scheduleOptions = [
  { value: '*/15 * * * *', label: '每 15 分钟' },
  { value: '*/30 * * * *', label: '每 30 分钟' },
  { value: '0 * * * *', label: '每小时' },
  { value: '0 */2 * * *', label: '每 2 小时' },
  { value: '0 */4 * * *', label: '每 4 小时' },
  { value: '0 */6 * * *', label: '每 6 小时' },
  { value: '0 */12 * * *', label: '每 12 小时' },
  { value: '0 0 * * *', label: '每天（0:00）' },
  { value: '0 8 * * *', label: '每天（8:00）' },
]

// 获取当前频率的显示文本
const currentScheduleLabel = computed(() => {
  const opt = scheduleOptions.find(o => o.value === crawlerSettings.value.schedule)
  return opt ? opt.label : crawlerSettings.value.schedule
})
</script>

<template>
  <div class="min-h-screen bg-[#fafafa] font-sans text-slate-900">
    <Header />
    
    <main class="pt-20 pb-20">
      <div class="max-w-6xl mx-auto px-6">
        <!-- 标题 -->
        <div class="mb-8">
          <h1 class="text-3xl font-black text-slate-900">管理后台</h1>
          <p class="text-sm text-slate-400 mt-1">系统管理与配置</p>
        </div>

        <!-- 无权限提示 -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <PhWarningCircle :size="48" class="text-red-500 mx-auto mb-4" weight="fill" />
          <p class="text-red-600 font-bold">{{ error }}</p>
          <button @click="router.push('/')" class="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold">
            返回首页
          </button>
        </div>

        <!-- 加载中 -->
        <div v-else-if="loading" class="flex items-center justify-center py-20">
          <PhSpinner :size="40" class="animate-spin text-blue-600" weight="bold" />
        </div>

        <!-- 管理面板 -->
        <div v-else-if="isAdmin" class="flex gap-8">
          <!-- 侧边栏 -->
          <aside class="w-64 shrink-0">
            <nav class="bg-white rounded-2xl border border-slate-100 p-4 space-y-1 sticky top-24">
              <button 
                @click="switchTab('stats')"
                :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all',
                  activeTab === 'stats' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50']"
              >
                <PhChartBar :size="20" weight="bold" />
                系统统计
              </button>
              <button 
                @click="switchTab('users')"
                :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all',
                  activeTab === 'users' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50']"
              >
                <PhUsers :size="20" weight="bold" />
                用户管理
              </button>
              <button 
                @click="switchTab('crawler')"
                :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all',
                  activeTab === 'crawler' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50']"
              >
                <PhGear :size="20" weight="bold" />
                爬虫设置
              </button>
            </nav>
          </aside>

          <!-- 主内容 -->
          <section class="flex-1 space-y-6">
            <!-- 统计面板 -->
            <div v-if="activeTab === 'stats'" class="space-y-6">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white rounded-2xl border border-slate-100 p-6">
                  <div class="text-3xl font-black text-blue-600">{{ stats.total_articles?.toLocaleString() }}</div>
                  <div class="text-xs text-slate-400 font-bold mt-1">总文章数</div>
                </div>
                <div class="bg-white rounded-2xl border border-slate-100 p-6">
                  <div class="text-3xl font-black text-green-600">+{{ stats.today_articles }}</div>
                  <div class="text-xs text-slate-400 font-bold mt-1">今日新增</div>
                </div>
                <div class="bg-white rounded-2xl border border-slate-100 p-6">
                  <div class="text-3xl font-black text-purple-600">{{ stats.total_users }}</div>
                  <div class="text-xs text-slate-400 font-bold mt-1">总用户数</div>
                </div>
                <div class="bg-white rounded-2xl border border-slate-100 p-6">
                  <div class="text-3xl font-black text-orange-600">{{ stats.premium_users }}</div>
                  <div class="text-xs text-slate-400 font-bold mt-1">付费用户</div>
                </div>
              </div>

              <!-- 快捷操作 -->
              <div class="bg-white rounded-2xl border border-slate-100 p-6">
                <h3 class="text-lg font-bold text-slate-900 mb-4">快捷操作</h3>
                <div class="flex flex-wrap gap-3">
                  <button @click="loadStats" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold flex items-center gap-2">
                    <PhArrowsClockwise :size="16" weight="bold" />
                    刷新统计
                  </button>
                  <button @click="runCrawler" class="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl text-sm font-bold">
                    立即爬取
                  </button>
                  <button @click="cleanupArticles(30)" class="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-sm font-bold flex items-center gap-2">
                    <PhTrash :size="16" weight="bold" />
                    清理30天前文章
                  </button>
                </div>
              </div>
            </div>

            <!-- 用户管理面板 -->
            <div v-if="activeTab === 'users'" class="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 class="text-lg font-bold text-slate-900 mb-4">用户列表</h3>
              
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-slate-100">
                      <th class="text-left py-3 px-4 font-bold text-slate-500">用户</th>
                      <th class="text-left py-3 px-4 font-bold text-slate-500">邮箱</th>
                      <th class="text-left py-3 px-4 font-bold text-slate-500">来源</th>
                      <th class="text-center py-3 px-4 font-bold text-slate-500">管理员</th>
                      <th class="text-center py-3 px-4 font-bold text-slate-500">付费</th>
                      <th class="text-left py-3 px-4 font-bold text-slate-500">注册时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in users" :key="user.id" class="border-b border-slate-50 hover:bg-slate-50">
                      <td class="py-3 px-4">
                        <div class="flex items-center gap-3">
                          <img :src="user.avatar" class="w-8 h-8 rounded-full" />
                          <span class="font-medium">{{ user.name }}</span>
                        </div>
                      </td>
                      <td class="py-3 px-4 text-slate-500">{{ user.email }}</td>
                      <td class="py-3 px-4">
                        <span class="px-2 py-1 bg-slate-100 rounded text-xs font-bold uppercase">{{ user.provider }}</span>
                      </td>
                      <td class="py-3 px-4 text-center">
                        <button 
                          @click="updateUser(user.id, 'is_admin', !user.is_admin)"
                          :class="['w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                            user.is_admin ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400']"
                        >
                          <PhShieldCheck :size="16" weight="bold" />
                        </button>
                      </td>
                      <td class="py-3 px-4 text-center">
                        <button 
                          @click="updateUser(user.id, 'is_premium', !user.is_premium)"
                          :class="['w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                            user.is_premium ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400']"
                        >
                          <PhCrown :size="16" weight="bold" />
                        </button>
                      </td>
                      <td class="py-3 px-4 text-slate-400 text-xs">
                        {{ new Date(user.created_at).toLocaleDateString('zh-CN') }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 分页 -->
              <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <span class="text-xs text-slate-400">共 {{ usersPagination.total }} 个用户</span>
                <div class="flex gap-2">
                  <button 
                    @click="loadUsers(usersPagination.page - 1)"
                    :disabled="usersPagination.page <= 1"
                    class="px-3 py-1 bg-slate-100 rounded text-sm font-bold disabled:opacity-50"
                  >上一页</button>
                  <button 
                    @click="loadUsers(usersPagination.page + 1)"
                    :disabled="usersPagination.page * usersPagination.limit >= usersPagination.total"
                    class="px-3 py-1 bg-slate-100 rounded text-sm font-bold disabled:opacity-50"
                  >下一页</button>
                </div>
              </div>
            </div>

            <!-- 爬虫设置面板 -->
            <div v-if="activeTab === 'crawler'" class="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 class="text-lg font-bold text-slate-900 mb-6">爬虫设置</h3>
              
              <div class="space-y-6">
                <!-- 爬取频率 - 简化版 -->
                <div class="p-5 bg-slate-50 rounded-xl">
                  <div class="flex items-center justify-between mb-4">
                    <div>
                      <div class="font-bold text-slate-900">自动爬取频率</div>
                      <div class="text-xs text-slate-400 mt-0.5">设置后约 1 分钟内自动生效</div>
                    </div>
                    <div class="text-right">
                      <div class="text-xs text-slate-400 mb-1">当前设置</div>
                      <div class="text-sm font-bold text-blue-600">{{ currentScheduleLabel }}</div>
                    </div>
                  </div>

                  <select 
                    v-model="crawlerSettings.schedule"
                    class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option v-for="opt in scheduleOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>

                <!-- 操作按钮 -->
                <div class="flex flex-col sm:flex-row gap-3">
                  <button 
                    @click="saveCrawlerSettings"
                    class="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all"
                  >
                    保存设置
                  </button>
                  <button 
                    @click="runCrawler"
                    :disabled="runningCrawler"
                    class="flex-1 px-6 py-3 bg-blue-100 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <PhSpinner v-if="runningCrawler" :size="16" class="animate-spin" weight="bold" />
                    {{ runningCrawler ? '运行中...' : '立即运行爬虫' }}
                  </button>
                </div>

                <!-- 提示 -->
                <div class="text-xs text-slate-400 bg-slate-50 rounded-lg p-3">
                  💡 点击「立即运行爬虫」可手动触发一次爬取，不影响自动调度。
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

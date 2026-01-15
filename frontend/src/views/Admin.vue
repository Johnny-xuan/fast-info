<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/api/request'
import Header from '@/components/Header.vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
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
  PhWarningCircle,
  PhChartLine
} from '@phosphor-icons/vue'

// 注册 Chart.js 组件
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

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
  limits: {},
  retentionDays: 30
})

// 运行状态
const runningCrawler = ref(false)

// 爬虫统计数据
const crawlerStats = ref({
  hourly: [],
  recent: [],
  summary: {}
})
const loadingStats = ref(false)

// 图表数据
const chartData = computed(() => {
  const hourly = crawlerStats.value.hourly || []
  return {
    labels: hourly.map(h => {
      const d = new Date(h.time_bucket)
      return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`
    }),
    datasets: [
      {
        label: '新增文章',
        data: hourly.map(h => parseInt(h.new_count) || 0),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6
      },
      {
        label: '总爬取数',
        data: hourly.map(h => parseInt(h.total) || 0),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: { size: 12, weight: 'bold' }
      }
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleFont: { size: 13 },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 8
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 10 }, maxRotation: 45 }
    },
    y: {
      beginAtZero: true,
      grid: { color: '#f1f5f9' },
      ticks: { font: { size: 11 } }
    }
  }
}

// 加载爬虫统计
const loadCrawlerStats = async () => {
  loadingStats.value = true
  try {
    const res = await request.get('/admin/crawler/stats', { params: { days: 7 } })
    if (res.success) {
      crawlerStats.value = res.data
    }
  } catch (e) {
    console.error('Load crawler stats error:', e)
  } finally {
    loadingStats.value = false
  }
}

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
  if (tab === 'crawler') {
    await loadCrawlerSettings()
    await loadCrawlerStats()
  }
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

// 数据保留天数选项
const retentionOptions = [
  { value: 7, label: '7 天' },
  { value: 14, label: '14 天' },
  { value: 30, label: '30 天' },
  { value: 60, label: '60 天' },
  { value: 90, label: '90 天' },
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
            <div v-if="activeTab === 'crawler'" class="space-y-6">
              <!-- 爬取统计图表 -->
              <div class="bg-white rounded-2xl border border-slate-100 p-6">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-3">
                    <PhChartLine :size="24" weight="bold" class="text-blue-600" />
                    <div>
                      <h3 class="text-lg font-bold text-slate-900">爬取趋势</h3>
                      <p class="text-xs text-slate-400">近 7 天爬虫执行统计</p>
                    </div>
                  </div>
                  <button 
                    @click="loadCrawlerStats" 
                    :disabled="loadingStats"
                    class="p-2 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <PhArrowsClockwise :size="18" :class="['text-slate-400', loadingStats && 'animate-spin']" weight="bold" />
                  </button>
                </div>

                <!-- 统计摘要卡片 -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div class="bg-slate-50 rounded-xl p-4 text-center">
                    <div class="text-2xl font-black text-blue-600">{{ crawlerStats.summary?.total_runs || 0 }}</div>
                    <div class="text-[10px] text-slate-400 font-bold mt-1">运行次数</div>
                  </div>
                  <div class="bg-slate-50 rounded-xl p-4 text-center">
                    <div class="text-2xl font-black text-green-600">{{ crawlerStats.summary?.total_new || 0 }}</div>
                    <div class="text-[10px] text-slate-400 font-bold mt-1">新增文章</div>
                  </div>
                  <div class="bg-slate-50 rounded-xl p-4 text-center">
                    <div class="text-2xl font-black text-purple-600">{{ crawlerStats.summary?.success_count || 0 }}</div>
                    <div class="text-[10px] text-slate-400 font-bold mt-1">成功次数</div>
                  </div>
                  <div class="bg-slate-50 rounded-xl p-4 text-center">
                    <div class="text-2xl font-black text-slate-600">{{ Math.round(crawlerStats.summary?.avg_duration / 1000) || 0 }}s</div>
                    <div class="text-[10px] text-slate-400 font-bold mt-1">平均耗时</div>
                  </div>
                </div>

                <!-- 折线图 -->
                <div class="h-64 relative">
                  <div v-if="loadingStats" class="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                    <PhSpinner :size="32" class="animate-spin text-blue-600" weight="bold" />
                  </div>
                  <div v-else-if="!chartData.labels.length" class="absolute inset-0 flex items-center justify-center">
                    <div class="text-center">
                      <PhChartLine :size="48" class="text-slate-200 mx-auto mb-2" weight="bold" />
                      <p class="text-sm text-slate-400">暂无爬取记录</p>
                    </div>
                  </div>
                  <Line v-else :data="chartData" :options="chartOptions" />
                </div>

                <!-- 最近运行记录 -->
                <div v-if="crawlerStats.recent?.length" class="mt-6 pt-6 border-t border-slate-100">
                  <h4 class="text-sm font-bold text-slate-700 mb-3">最近运行</h4>
                  <div class="space-y-2 max-h-40 overflow-y-auto">
                    <div 
                      v-for="(run, idx) in crawlerStats.recent.slice(0, 5)" 
                      :key="idx"
                      class="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50"
                    >
                      <div class="flex items-center gap-2">
                        <span :class="['w-2 h-2 rounded-full', run.status === 'completed' ? 'bg-green-500' : run.status === 'running' ? 'bg-blue-500 animate-pulse' : 'bg-red-500']"></span>
                        <span class="text-slate-500">{{ new Date(run.started_at).toLocaleString('zh-CN') }}</span>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="text-blue-600 font-bold">+{{ run.new_count || 0 }}</span>
                        <span class="text-slate-400">/ {{ run.total_count || 0 }}</span>
                        <span class="text-slate-300">{{ Math.round((run.duration_ms || 0) / 1000) }}s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 爬虫设置 -->
              <div class="bg-white rounded-2xl border border-slate-100 p-6">
                <h3 class="text-lg font-bold text-slate-900 mb-6">爬虫设置</h3>
                
                <div class="space-y-4">
                  <!-- 设置项网格 -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- 爬取频率 -->
                    <div class="p-4 bg-slate-50 rounded-xl">
                      <div class="text-sm font-bold text-slate-900 mb-2">爬取频率</div>
                      <select 
                        v-model="crawlerSettings.schedule"
                        class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option v-for="opt in scheduleOptions" :key="opt.value" :value="opt.value">
                          {{ opt.label }}
                        </option>
                      </select>
                    </div>

                    <!-- 数据保留天数 -->
                    <div class="p-4 bg-slate-50 rounded-xl">
                      <div class="text-sm font-bold text-slate-900 mb-2">数据保留</div>
                      <select 
                        v-model="crawlerSettings.retentionDays"
                        class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option v-for="opt in retentionOptions" :key="opt.value" :value="opt.value">
                          {{ opt.label }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="flex gap-3 pt-2">
                    <button 
                      @click="saveCrawlerSettings"
                      class="flex-1 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all"
                    >
                      保存设置
                    </button>
                    <button 
                      @click="runCrawler"
                      :disabled="runningCrawler"
                      class="flex-1 px-5 py-2.5 bg-blue-100 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <PhSpinner v-if="runningCrawler" :size="16" class="animate-spin" weight="bold" />
                      {{ runningCrawler ? '运行中...' : '立即运行爬虫' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

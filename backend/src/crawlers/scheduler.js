/**
 * 爬虫调度器
 * 使用 node-cron 定时执行爬虫任务
 */

require('dotenv').config()
const cron = require('node-cron')
const HackerNewsCrawler = require('./hackernews')
const GitHubTrendingCrawler = require('./github-trending')
const DevToCrawler = require('./devto')
const ArxivCrawler = require('./arxiv')
const AIBaseCrawler = require('./aibase')
const ProductHuntCrawler = require('./producthunt')
const V2exCrawler = require('./v2ex')
const JuejinCrawler = require('./juejin')
const { runCleanup } = require('../utils/cleaner')

/**
 * 所有爬虫的配置
 */
const crawlers = [
  {
    name: 'Hacker News',
    crawler: new HackerNewsCrawler({ limit: 30 }),
    schedule: '0 */2 * * *', // 每 2 小时运行一次
    enabled: true
  },
  {
    name: 'GitHub Trending',
    crawler: new GitHubTrendingCrawler({ limit: 25 }),
    schedule: '0 */4 * * *', // 每 4 小时运行一次
    enabled: true
  },
  {
    name: 'Dev.to',
    crawler: new DevToCrawler({ limit: 30 }),
    schedule: '0 */2 * * *', // 每 2 小时运行一次
    enabled: true
  },
  {
    name: 'arXiv',
    crawler: new ArxivCrawler({ limit: 20, category: 'cs.AI' }),
    schedule: '0 */6 * * *', // 每 6 小时运行一次（学术论文更新较慢）
    enabled: true
  },
  {
    name: 'AIBase',
    crawler: new AIBaseCrawler({ limit: 20 }),
    schedule: '0 */4 * * *', // 每 4 小时运行一次（产品更新频率中等）
    enabled: true
  },
  {
    name: 'Product Hunt',
    crawler: new ProductHuntCrawler({ limit: 30 }),
    schedule: '0 */3 * * *', // 每 3 小时运行一次（每日产品更新较频繁）
    enabled: true
  },
  {
    name: 'V2EX',
    crawler: new V2exCrawler(),
    schedule: '0 */2 * * *', // 每 2 小时运行一次（社区讨论更新频繁）
    enabled: true
  },
  {
    name: '掘金',
    crawler: new JuejinCrawler(),
    schedule: '0 */3 * * *', // 每 3 小时运行一次（技术文章更新较频繁）
    enabled: true
  }
]

/**
 * 执行单个爬虫任务
 */
async function runCrawler(crawlerConfig) {
  const { name, crawler } = crawlerConfig

  console.log(`\n${'='.repeat(60)}`)
  console.log(`[Scheduler] Running ${name} crawler at ${new Date().toISOString()}`)
  console.log('='.repeat(60))

  try {
    const result = await crawler.crawlWithRetry()

    console.log(`\n[Scheduler] ${name} completed:`)
    console.log(`  Success: ${result.success}`)
    console.log(`  Inserted: ${result.inserted || 0}`)
    console.log(`  Skipped: ${result.skipped || 0}`)
    console.log(`  Errors: ${result.errors || 0}`)
    console.log(`  Duration: ${result.duration}ms`)

    return result
  } catch (error) {
    console.error(`[Scheduler] ${name} failed with error:`, error)
    return { success: false, error: error.message }
  }
}

/**
 * 执行所有启用的爬虫
 */
async function runAllCrawlers() {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`[Scheduler] Starting all crawlers at ${new Date().toISOString()}`)
  console.log('='.repeat(60))

  const enabledCrawlers = crawlers.filter(c => c.enabled)
  const results = []

  for (const crawlerConfig of enabledCrawlers) {
    const result = await runCrawler(crawlerConfig)
    results.push({
      name: crawlerConfig.name,
      ...result
    })
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log('[Scheduler] All crawlers completed')
  console.log('='.repeat(60))
  console.log('Summary:')
  results.forEach(r => {
    console.log(`  ${r.name}: ${r.success ? '✅' : '❌'} (${r.inserted || 0} inserted, ${r.errors || 0} errors)`)
  })

  return results
}

/**
 * 启动调度器
 */
function startScheduler() {
  console.log('\n' + '='.repeat(60))
  console.log('Fast Info Crawler Scheduler')
  console.log('='.repeat(60))
  console.log(`Started at: ${new Date().toISOString()}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log('\nScheduled crawlers:')

  crawlers.forEach(c => {
    if (c.enabled) {
      console.log(`  - ${c.name}: ${c.schedule} (${getScheduleDescription(c.schedule)})`)

      // 创建定时任务
      cron.schedule(c.schedule, () => {
        runCrawler(c)
      })
    } else {
      console.log(`  - ${c.name}: disabled`)
    }
  })

  // 添加数据清理任务（每天凌晨3点运行）
  console.log(`  - Data Cleanup: 0 3 * * * (daily at 3 AM)`)
  cron.schedule('0 3 * * *', async () => {
    console.log('\n' + '='.repeat(60))
    console.log(`[Scheduler] Running data cleanup at ${new Date().toISOString()}`)
    console.log('='.repeat(60))

    await runCleanup({ retentionHours: 48 })
  })

  console.log('\n' + '='.repeat(60))
  console.log('Scheduler is running. Press Ctrl+C to stop.')
  console.log('='.repeat(60) + '\n')

  // 如果设置了立即运行标志，则立即执行一次
  if (process.env.RUN_IMMEDIATELY === 'true') {
    console.log('[Scheduler] Running all crawlers immediately...\n')
    runAllCrawlers()
  }
}

/**
 * 获取 cron 表达式的可读描述
 */
function getScheduleDescription(cronExpression) {
  const descriptions = {
    '0 */2 * * *': 'every 2 hours',
    '0 */3 * * *': 'every 3 hours',
    '0 */4 * * *': 'every 4 hours',
    '0 */6 * * *': 'every 6 hours',
    '0 */12 * * *': 'every 12 hours',
    '0 0 * * *': 'daily at midnight',
    '*/5 * * * *': 'every 5 minutes',
    '*/10 * * * *': 'every 10 minutes'
  }
  return descriptions[cronExpression] || cronExpression
}

/**
 * 优雅关闭
 */
process.on('SIGTERM', () => {
  console.log('\n[Scheduler] Received SIGTERM, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('\n[Scheduler] Received SIGINT, shutting down gracefully...')
  process.exit(0)
})

// 导出函数供外部使用
module.exports = {
  startScheduler,
  runAllCrawlers,
  runCrawler,
  crawlers
}

// 如果直接运行此文件，则启动调度器
if (require.main === module) {
  startScheduler()
}

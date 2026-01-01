/**
 * 新爬虫测试脚本
 * 测试 GitHub Trending, Dev.to, arXiv 爬虫
 */

require('dotenv').config()

const GitHubTrendingCrawler = require('./github-trending')
const DevToCrawler = require('./devto')
const ArxivCrawler = require('./arxiv')

async function testCrawler(crawler, name) {
  console.log('\n' + '='.repeat(60))
  console.log(`Testing ${name} Crawler`)
  console.log('='.repeat(60))

  try {
    const result = await crawler.crawlWithRetry()

    console.log('\n' + '='.repeat(60))
    console.log('Crawl Result:')
    console.log('='.repeat(60))
    console.log(`Success: ${result.success}`)
    console.log(`Inserted: ${result.inserted || 0}`)
    console.log(`Skipped: ${result.skipped || 0}`)
    console.log(`Errors: ${result.errors || 0}`)
    console.log(`Duration: ${result.duration}ms`)

    if (!result.success) {
      console.error(`Error: ${result.error}`)
    }

    return result

  } catch (error) {
    console.error(`${name} test failed:`, error.message)
    return { success: false, error: error.message }
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60))
  console.log('Fast Info - New Crawlers Test Suite')
  console.log('='.repeat(60))
  console.log(`Started at: ${new Date().toISOString()}`)
  console.log('='.repeat(60))

  const crawlers = [
    {
      name: 'GitHub Trending',
      crawler: new GitHubTrendingCrawler({ limit: 10 })
    },
    {
      name: 'Dev.to',
      crawler: new DevToCrawler({ limit: 10 })
    },
    {
      name: 'arXiv',
      crawler: new ArxivCrawler({ limit: 10, category: 'cs.AI' })
    }
  ]

  const results = []

  for (const { name, crawler } of crawlers) {
    const result = await testCrawler(crawler, name)
    results.push({ name, ...result })
  }

  // 汇总结果
  console.log('\n' + '='.repeat(60))
  console.log('Test Summary')
  console.log('='.repeat(60))

  let totalInserted = 0
  let totalErrors = 0

  results.forEach(r => {
    const status = r.success ? '✅' : '❌'
    console.log(`${status} ${r.name}: ${r.inserted || 0} inserted, ${r.errors || 0} errors`)
    totalInserted += (r.inserted || 0)
    totalErrors += (r.errors || 0)
  })

  console.log('\n' + '='.repeat(60))
  console.log(`Total: ${totalInserted} articles inserted, ${totalErrors} errors`)
  console.log('='.repeat(60))
}

// 运行测试
runAllTests()
  .then(() => {
    console.log('\nAll tests completed')
    process.exit(0)
  })
  .catch(error => {
    console.error('Tests failed with error:', error)
    process.exit(1)
  })

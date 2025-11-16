/**
 * 爬虫测试脚本
 * 用于测试单个爬虫的功能
 */

// 加载环境变量
require('dotenv').config()

const HackerNewsCrawler = require('./hackernews')

async function testHackerNews() {
  console.log('='.repeat(60))
  console.log('Testing Hacker News Crawler')
  console.log('='.repeat(60))

  const crawler = new HackerNewsCrawler({ limit: 10 }) // 仅测试10条

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

  } catch (error) {
    console.error('Test failed:', error)
  }
}

// 运行测试
testHackerNews()
  .then(() => {
    console.log('\n' + '='.repeat(60))
    console.log('Test completed')
    console.log('='.repeat(60))
    process.exit(0)
  })
  .catch(error => {
    console.error('Test failed with error:', error)
    process.exit(1)
  })

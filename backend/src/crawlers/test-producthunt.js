/**
 * Product Hunt 爬虫测试脚本
 */

require('dotenv').config()
const ProductHuntCrawler = require('./producthunt')

async function testProductHunt() {
  console.log('Testing Product Hunt Crawler...\n')

  const crawler = new ProductHuntCrawler({ limit: 5 })

  try {
    const result = await crawler.crawlWithRetry()

    console.log('\n' + '='.repeat(60))
    console.log('Test Result:')
    console.log('='.repeat(60))
    console.log(`Success: ${result.success}`)
    console.log(`Inserted: ${result.inserted || 0}`)
    console.log(`Skipped: ${result.skipped || 0}`)
    console.log(`Errors: ${result.errors || 0}`)
    console.log(`Duration: ${result.duration}ms`)

    process.exit(result.success ? 0 : 1)

  } catch (error) {
    console.error('\nTest failed with error:', error)
    process.exit(1)
  }
}

testProductHunt()

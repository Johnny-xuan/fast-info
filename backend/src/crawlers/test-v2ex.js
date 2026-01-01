require('dotenv').config()
const V2exCrawler = require('./v2ex')

async function testV2ex() {
  console.log('🧪 测试 V2EX 爬虫\n')

  const crawler = new V2exCrawler()
  const result = await crawler.crawl()

  console.log('\n📊 结果统计:')
  console.log(JSON.stringify(result, null, 2))
}

testV2ex().catch(console.error)

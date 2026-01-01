require('dotenv').config()
const ZhihuCrawler = require('./zhihu')

async function testZhihu() {
  console.log('🧪 测试知乎热榜爬虫\n')

  const crawler = new ZhihuCrawler()

  try {
    // 先测试 fetch
    console.log('📥 正在获取数据...')
    const data = await crawler.fetch()
    console.log(`✅ 获取到 ${data.length} 条数据\n`)

    if (data[0]) {
      console.log('第一条数据样例:')
      console.log(JSON.stringify(data[0], null, 2).substring(0, 800))
      console.log('...\n')
    }

    // 测试完整爬取
    console.log('📊 开始完整爬取测试...')
    const result = await crawler.crawl()

    console.log('\n结果统计:')
    console.log(JSON.stringify(result, null, 2))

  } catch (error) {
    console.error('❌ 错误:', error.message)
    if (error.response) {
      console.error('响应状态:', error.response.status)
      console.error('响应数据:', JSON.stringify(error.response.data).substring(0, 500))
    }
  }
}

testZhihu()

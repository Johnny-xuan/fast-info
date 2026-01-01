/**
 * 每日摘要定时任务
 */
const cron = require('node-cron')
const pushService = require('../services/pushService')

// 默认每天早上 9 点发送
const DEFAULT_CRON = '0 9 * * *'

let job = null

function start(cronExpression = DEFAULT_CRON) {
  if (job) {
    job.stop()
  }
  
  job = cron.schedule(cronExpression, async () => {
    console.log('⏰ Running daily digest job...')
    try {
      await pushService.sendDailyDigest()
    } catch (err) {
      console.error('Daily digest job failed:', err)
    }
  })
  
  console.log(`📅 Daily digest scheduled: ${cronExpression}`)
}

function stop() {
  if (job) {
    job.stop()
    job = null
  }
}

// 手动触发
async function trigger() {
  return pushService.sendDailyDigest()
}

module.exports = { start, stop, trigger }

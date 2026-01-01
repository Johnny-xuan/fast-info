/**
 * 推送配置 API 路由
 */
const express = require('express')
const router = express.Router()
const pushService = require('../services/pushService')
const dailyDigest = require('../jobs/dailyDigest')

/**
 * GET /api/push/configs
 * 获取所有推送配置
 */
router.get('/configs', async (req, res, next) => {
  try {
    const configs = await pushService.getConfigs()
    res.json({ configs })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/push/configs
 * 创建推送配置
 */
router.post('/configs', async (req, res, next) => {
  try {
    const { channel, config, dailyDigestTime } = req.body
    
    if (!channel || !config) {
      return res.status(400).json({
        error: { message: '请提供 channel 和 config', status: 400 }
      })
    }
    
    if (!['telegram', 'email'].includes(channel)) {
      return res.status(400).json({
        error: { message: 'channel 必须是 telegram 或 email', status: 400 }
      })
    }
    
    const result = await pushService.createConfig(channel, config, dailyDigestTime)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
})

/**
 * PUT /api/push/configs/:id
 * 更新推送配置
 */
router.put('/configs/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await pushService.updateConfig(id, req.body)
    
    if (!result) {
      return res.status(404).json({
        error: { message: '配置不存在', status: 404 }
      })
    }
    
    res.json(result)
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/push/configs/:id
 * 删除推送配置
 */
router.delete('/configs/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    await pushService.deleteConfig(id)
    res.json({ message: '已删除' })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/push/test/:id
 * 测试推送
 */
router.post('/test/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await pushService.testPush(id)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/push/digest
 * 手动触发每日摘要
 */
router.post('/digest', async (req, res, next) => {
  try {
    const results = await dailyDigest.trigger()
    res.json({ message: '已发送', results })
  } catch (err) {
    next(err)
  }
})

module.exports = router
